import {
  Action,
  applyMiddleware,
  combineReducers,
  createStore,
  DeepPartial,
  Dispatch,
  Middleware,
  ReducersMapObject,
  Store,
  StoreEnhancer,
  compose,
} from "redux"
import { createLogger } from "redux-logger"
import { SagaMiddleware } from "redux-saga"
import createSagaMiddleware from "redux-saga"
import { all, apply, select, put, takeEvery, take, fork, ForkEffect, CallEffectFn } from "redux-saga/effects"

interface PayloadAction extends Action {
  readonly payload?: {}
}

interface SitkaModuleActionPayload {
  readonly payload?: {}
  readonly type: string
}

export type SitkaModuleAction<T> = (Partial<T> & SitkaModuleActionPayload) | Action

type ModuleState = {} | undefined | null

const createStateChangeKey = (module: string) => `module_${module}_change_state`.toUpperCase()
const createHandlerKey = (module: string, handler: string) => `module_${module}_${handler}`.toUpperCase()

interface GeneratorContext {
  readonly handlerKey: string
  readonly fn: CallEffectFn<any>
  readonly context: {}
}

export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
  public modules: MODULES
  handlerOriginalFunctionMap = new Map<Function, GeneratorContext>()

  public abstract moduleName: string

  constructor() {
    this.getState = this.getState.bind(this)
    this.mergeState = this.mergeState.bind(this)
  }

  // by default, the redux key is same as the moduleName
  public reduxKey(): string {
    return this.moduleName
  }

  public abstract defaultState?: MODULE_STATE

  protected createAction(v: Partial<MODULE_STATE>, usePayload?: boolean): SitkaModuleAction<MODULE_STATE> {
    const type = createStateChangeKey(this.reduxKey())
    if (!v) {
      return { type, [type]: v }
    }

    if (typeof v !== "object") {
      return { type, [type]: v }
    } else {
      if (usePayload) {
        return {
          type,
          payload: v,
        }
      }
      return Object.assign({ type }, v)
    }
  }

  protected setState(state: MODULE_STATE, replace?: boolean): Action {
    return this.createAction(state, replace)
  }

  protected resetState(): Action {
    return this.setState(this.defaultState)
  }

  protected getState(state: {}): MODULE_STATE {
    return state[this.reduxKey()]
  }

  protected *mergeState(partialState: Partial<MODULE_STATE>): {} {
    const currentState = yield select(this.getState)
    const newState = { ...currentState, ...partialState }
    yield put(this.setState(newState))
  }

  // can be either the action type string, or the module function to watch
  protected createSubscription(actionTarget: string | Function, handler: CallEffectFn<any>): SagaMeta {
    if (typeof actionTarget === "string") {
      return {
        name: actionTarget,
        handler,
        direct: true,
      }
    } else {
      const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(actionTarget)
      return {
        name: generatorContext.handlerKey,
        handler,
        direct: true,
      }
    }
  }

  provideMiddleware(): Middleware[] {
    return []
  }

  provideSubscriptions(): SagaMeta[] {
    return []
  }

  provideForks(): CallEffectFn<any>[] {
    return []
  }

  protected *callAsGenerator(fn: Function, ...rest: any[]): {} {
    const generatorContext: GeneratorContext = this.handlerOriginalFunctionMap.get(fn)
    return yield apply(generatorContext.context, generatorContext.fn, <any>rest)
  }
}

export interface SitkaSagaMiddlewareProvider {
  middleware: SagaMiddleware<{}>
  activate: () => void
}

export interface SagaMeta {
  // tslint:disable-next-line:no-any
  readonly handler: any
  readonly name: string
  readonly direct?: boolean
}

interface SitkaAction extends Action {
  _moduleId: string
  // tslint:disable-next-line:no-any
  _args: any
}

// tslint:disable-next-line:max-classes-per-file
export class SitkaMeta {
  public readonly defaultState: {}
  public readonly middleware: Middleware[]
  public readonly reducersToCombine: ReducersMapObject
  public readonly sagaRoot: () => IterableIterator<{}>
  public readonly sagaProvider: () => SitkaSagaMiddlewareProvider
}

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store

export interface SitkaOptions {
  readonly log?: boolean
  readonly sitkaInState?: boolean
}

// tslint:disable-next-line:max-classes-per-file
export class Sitka<MODULES = {}> {
  // tslint:disable-next-line:no-any
  private sagas: SagaMeta[] = []
  private forks: CallEffectFn<any>[] = []
  // tslint:disable-next-line:no-any
  private reducersToCombine: ReducersMapObject = {}
  private middlewareToAdd: Middleware[] = []
  protected registeredModules: MODULES
  private dispatch?: Dispatch
  private sitkaOptions: SitkaOptions
  private handlerOriginalFunctionMap = new Map<Function, GeneratorContext>()

  constructor(sitkaOptions?: SitkaOptions) {
    this.sitkaOptions = sitkaOptions
    this.doDispatch = this.doDispatch.bind(this)
    this.createStore = this.createStore.bind(this)
    this.createRoot = this.createRoot.bind(this)
    this.registeredModules = {} as MODULES
  }

  public setDispatch(dispatch: Dispatch): void {
    this.dispatch = dispatch
  }

  public getModules(): MODULES {
    return this.registeredModules
  }

  public createSitkaMeta(): SitkaMeta {
    // by default, we include sitka object in the meta
    const includeSitka =
      // if no options
      !this.sitkaOptions ||
      // if options were provided, but sitkaInStore is not defined
      this.sitkaOptions.sitkaInState === undefined ||
      // if sitkaInStore is defined, and its not explicitly set to don't include
      this.sitkaOptions.sitkaInState !== false

    const includeLogging = !!this.sitkaOptions && this.sitkaOptions.log === true
    const logger: Middleware = createLogger({
      stateTransformer: (state: {}) => state,
    })

    const sagaRoot = this.createRoot()

    return {
      defaultState: includeSitka
        ? {
            ...this.getDefaultState(),
            __sitka__: this,
          }
        : {
            ...this.getDefaultState(),
          },
      middleware: includeLogging ? [...this.middlewareToAdd, logger] : this.middlewareToAdd,
      reducersToCombine: includeSitka
        ? {
            ...this.reducersToCombine,
            __sitka__: (state: this | null = null): this | null => state,
          }
        : {
            ...this.reducersToCombine,
          },
      sagaRoot,
      sagaProvider: (): SitkaSagaMiddlewareProvider => {
        const middleware = createSagaMiddleware<{}>()

        return {
          middleware,
          activate: () => {
            middleware.run(sagaRoot)
          },
        }
      },
    }
  }

  public createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null {
    if (!!appstoreCreator) {
      const store = appstoreCreator(this.createSitkaMeta())
      this.dispatch = store.dispatch
      return store
    } else {
      // use own appstore creator
      const meta = this.createSitkaMeta()
      const store = createAppStore({
        initialState: meta.defaultState,
        reducersToCombine: [meta.reducersToCombine],
        middleware: meta.middleware,
        sagaRoot: meta.sagaRoot,
        log: this.sitkaOptions && this.sitkaOptions.log === true,
      })
      this.dispatch = store.dispatch
      return store
    }
  }

  public register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(instances: SITKA_MODULE[]): void {
    const sitka = this
    instances.forEach(instance => {
      const { moduleName } = instance

      instance = this.patchModule(sitka, instance)
      this.patchFunctions(sitka, instance)

      if (instance.defaultState !== undefined) {
        // create reducer
        const reduxKey: string = instance.reduxKey()
        const defaultState = instance.defaultState
        const actionType: string = createStateChangeKey(reduxKey)

        sitka.reducersToCombine[reduxKey] = (state: ModuleState = defaultState, action: PayloadAction): ModuleState => {
          if (action.type !== actionType) {
            return state
          }

          const type = createStateChangeKey(moduleName)
          const payload = action.payload

          if (!!payload) {
            return payload
          }

          const newState: ModuleState = Object.keys(action)
            .filter(k => k !== "type")
            .reduce((acc, k) => {
              const val = action[k]
              if (k === type) {
                return val
              }

              if (val === null || typeof val === "undefined") {
                return Object.assign(acc, {
                  [k]: null,
                })
              }

              return Object.assign(acc, {
                [k]: val,
              })
            }, Object.assign({}, state)) as ModuleState

          return newState
        }
      }
    })

    // do subscribers after all has been registered
    instances.forEach(instance => {
      const { sagas } = this
      const subscribers = instance.provideSubscriptions()
      sagas.push(...subscribers)
    })
  }

  patchModule<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(
    sitka: Sitka<MODULES>,
    module: SITKA_MODULE
  ): SITKA_MODULE {
    module = Object.create(module)
    // TODO Check if name has already been registered, if so throw an error
    const moduleName = module.moduleName
    module.modules = sitka.getModules()
    module.handlerOriginalFunctionMap = sitka.handlerOriginalFunctionMap

    const addedMiddleware = sitka.middlewareToAdd.reduce((acc, mw) => [...acc, mw.toString()], [])
    // middleware names must be unique or they are omitted
    module.provideMiddleware().forEach(mw => {
      // if the middleware has already been added don't add it again
      if (addedMiddleware.includes(mw.toString())) {
        return
      }
      addedMiddleware.push(mw.toString())
      sitka.middlewareToAdd.push(mw)
    })

    module.provideForks().forEach(f => {
      sitka.forks.push(f.bind(module))
    })
    if (sitka.registeredModules[moduleName] !== undefined) {
      throw new Error(`All registered Sitka modules must have unique names: ${moduleName} already declared`)
    }
    sitka.registeredModules[moduleName] = module
    return module
  }

  patchFunctions<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(
    sitka: Sitka<MODULES>,
    module: SITKA_MODULE
  ): void {
    let patchedFunctions: Set<string> = new Set()
    const { moduleName } = module
    const moduleProto = Object.getPrototypeOf(module)

    const crawlParents = (child: SITKA_MODULE) => {
      let parent = Object.getPrototypeOf(child)
      // Have we hit the object base class?
      if (Object.getPrototypeOf(parent) != Object.prototype) {
        Object.getOwnPropertyNames(parent).forEach(functionName => {
          if (functionName !== "constructor") {
            if (hasMethod(parent, functionName)) {
              // function starts with "handle"
              const handlerKey = createHandlerKey(moduleName, functionName)
              if (functionName.indexOf("handle") === 0 && !patchedFunctions.has(handlerKey)) {
                patchFunction(sitka, parent, handlerKey, functionName)
                patchedFunctions.add(handlerKey)
              }
            }
          }
        })
        crawlParents(parent)
      }
    }

    const patchFunction = (sitka: Sitka<MODULES>, parent: any, handlerKey: string, functionName: string) => {
      // this is the patched callback function wrapper
      function patched(): void {
        const args = arguments
        const action: SitkaAction = {
          _args: args,
          _moduleId: moduleName,
          type: handlerKey,
        }
        sitka.dispatch(action)
      }

      const original: Function = parent[functionName] // tslint:disable:no-any

      // add our patched function to the saga handler
      sitka.sagas.push({
        handler: original.bind(module),
        name: handlerKey,
      })

      // patch the function in the module
      moduleProto[functionName] = patched.bind(sitka)

      module.handlerOriginalFunctionMap.set(patched, {
        handlerKey,
        fn: original,
        context: module,
      })
    }

    crawlParents(module)
  }

  private getDefaultState(): {} {
    const modules = this.getModules()
    return Object.keys(modules)
      .map(k => modules[k])
      .reduce(
        (acc: {}, m: SitkaModule<{} | null, MODULES>) => ({
          ...acc,
          [m.moduleName]: m.defaultState,
        }),
        {}
      )
  }

  private createRoot(): () => IterableIterator<{}> {
    const { sagas, forks, registeredModules } = this

    function* root(): IterableIterator<{}> {
      /* tslint:disable */
      const toYield: ForkEffect[] = []

      // generators
      for (let i = 0; i < sagas.length; i++) {
        const s: SagaMeta = sagas[i]
        if (s.direct) {
          const item: any = yield takeEvery(s.name, s.handler)
          toYield.push(item)
        } else {
          const generator = function* (action: SitkaAction): {} {
            const instance: {} = registeredModules[action._moduleId]
            yield apply(instance, s.handler, action._args)
          }
          const item: any = yield takeEvery(s.name, generator)
          toYield.push(item)
        }
      }

      // forks
      for (let i = 0; i < forks.length; i++) {
        const f = forks[i]
        const item: any = fork(f)
        toYield.push(item)
      }

      /* tslint:enable */
      yield all(toYield)
    }

    return root
  }

  private doDispatch(action: Action): void {
    const { dispatch } = this
    if (!!dispatch) {
      dispatch(action)
    } else {
      alert("no dispatch")
    }
  }
}

export interface StoreOptions {
  readonly initialState?: {}
  readonly reducersToCombine?: ReducersMapObject[]
  readonly storeEnhancers?: StoreEnhancer[]
  readonly middleware?: Middleware[]
  readonly sagaRoot?: () => IterableIterator<{}>
  readonly log?: boolean
}

export const createAppStore = (options: StoreOptions): Store => {
  const {
    initialState = {},
    reducersToCombine = [],
    middleware = [],
    sagaRoot,
    log = false,
    storeEnhancers = [],
  } = options

  const logger: Middleware = createLogger({
    stateTransformer: (state: {}) => state,
  })
  const sagaMiddleware: SagaMiddleware<{}> = createSagaMiddleware()
  const commonMiddleware: ReadonlyArray<Middleware> = log ? [sagaMiddleware, logger] : [sagaMiddleware]
  const appReducer = reducersToCombine.reduce((acc, r) => ({ ...acc, ...r }), {})

  const combinedMiddleware = [...commonMiddleware, ...middleware]

  const store: Store = createStore(
    combineReducers(appReducer),
    initialState as DeepPartial<{}>,
    compose(...storeEnhancers, applyMiddleware(...combinedMiddleware))
  )

  if (sagaRoot) {
    sagaMiddleware.run(<any>sagaRoot)
  }

  return store
}

const hasMethod = (obj: {}, name: string) => {
  const desc = Object.getOwnPropertyDescriptor(obj, name)
  return !!desc && typeof desc.value === "function"
}
