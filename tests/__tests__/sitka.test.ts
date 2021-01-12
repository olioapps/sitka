import { Dispatch } from "redux"
import { AppModules, createSitkaAndStore } from "../sitka-test"
import { createAppStore, Sitka } from "../../src/sitka"
import { TextModule } from "../text_module"
import { ColorModule } from "../color_module"

export class SitkaMock<T = {}> extends Sitka {
  public registeredModules: T
 }

describe("Sitka", () => {

  describe('setDispatch', () => {
    test(`setDispatch dispatch was called`, () => {
      const { sitka, store } = createSitkaAndStore()
      let wasMockDispatched: boolean

      const mockDispatch: Dispatch = <T>(action: T) => {
        wasMockDispatched = true
        store.dispatch(action)
        return action
      }

      sitka.setDispatch(mockDispatch)
      sitka.getModules().text.handleUpdateSize(20)

      expect(wasMockDispatched).toEqual(true)
    })
  })

  describe ('getModules', () => {

    test(`getModules returns registered modules`, () => {
      const textModule = new TextModule()
      const colorModule = new ColorModule()
      const sitka = new Sitka<AppModules>()
      sitka.register([colorModule, textModule])

      const colorModuleName = colorModule.moduleName
      const textModuleName = textModule.moduleName
      const actual = sitka.getModules()
      const expected = {
        [colorModuleName]: colorModule,
        [textModuleName]: textModule
      }

      expect(actual).toMatchObject(expected)
    })
  })

  describe ('createSitkaMeta', () => {
    test(`createSitkaMeta returns expected SitkaMeta`, () => {
      const sitkaMock = new SitkaMock<string>()
      const actual = sitkaMock.createSitkaMeta()

      // Validates defaultState property
      const sitkaDefaultStateProperties = (actual.defaultState as any).__sitka__
      const expected = {
        sagas: [],
        forks: [],
        reducersToCombine: {},
        middlewareToAdd: [],
        handlerOriginalFunctionMap: new Map,
        sitkaOptions: undefined,
        registeredModules: {}
      }
      expect(sitkaDefaultStateProperties).toMatchObject(expected)

      // Validates default states functions are bound functions (bound functions don't have a prototype attribute)
      expect(sitkaDefaultStateProperties.doDispatch.hasOwnProperty('prototype')).toBeFalsy()
      expect(sitkaDefaultStateProperties.createStore.hasOwnProperty('prototype')).toBeFalsy()
      expect(sitkaDefaultStateProperties.createRoot.hasOwnProperty('prototype')).toBeFalsy()

      // Validates middleware is default empty
      expect(actual.middleware).toEqual([])

      // Validates reducersToCombine has correct object value
      expect(actual.reducersToCombine).toEqual({"__sitka__": expect.any(Function)})

      // Validates sagaRoot returns object with correct properties
      expect(actual.sagaRoot()).toMatchObject({
        next: expect.any(Function),
        throw: expect.any(Function),
        return: expect.any(Function)
      })

      // Validates sagaProvider returns object with correct properties
      expect(actual.sagaProvider()).toMatchObject({
        middleware: expect.any(Function),
        activate: expect.any(Function)
      })
    })
  })

  describe ('createStore', () => {
    test(`createStore returns redux Store with appstoreCreator`, () => {
      const sitkaMock = new SitkaMock<string>()
      const customAppStoreCreator = ((meta) => {
        const store = createAppStore(
          {
            initialState: meta.defaultState,
            reducersToCombine: [meta.reducersToCombine],
            middleware: meta.middleware,
            sagaRoot: meta.sagaRoot,
            log: false,
          }
          )
          sitkaMock.setDispatch(store.dispatch)
          return store
        })
      const sitkaStore = sitkaMock.createStore(customAppStoreCreator)

      expect(sitkaStore).toEqual(expect.objectContaining({
        dispatch: expect.any(Function),
        getState: expect.any(Function),
        replaceReducer: expect.any(Function),
        subscribe: expect.any(Function),
      }))
    })

    test(`createStore returns redux Store without appstoreCreator`, () => {
      const sitkaMock = new SitkaMock<string>()
      const sitkaStore = sitkaMock.createStore()

      expect(sitkaStore).toEqual(expect.objectContaining({
        dispatch: expect.any(Function),
        getState: expect.any(Function),
        replaceReducer: expect.any(Function),
        subscribe: expect.any(Function),
      }))
    })
  })
})