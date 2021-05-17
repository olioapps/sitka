import { Dispatch } from "redux"
import { AppModules, createSitkaAndStore, sitkaFactory } from "../sitka-test"
import { createAppStore, Sitka } from "../../src/sitka"
import { TextModule } from "../text_module"
import { ColorModule } from "../color_module"

export class SitkaMock<T = {}> extends Sitka {
  public registeredModules: T
}

describe("Sitka", () => {
  describe("setDispatch", () => {
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

  describe("getModules", () => {
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
        [textModuleName]: textModule,
      }

      expect(actual).toMatchObject(expected)
    })
  })

  describe("createSitkaMeta", () => {
    test("createSitkaMeta returns expected default meta value", () => {
      // todo: refac -- should only be looking at public
      // const sitka = sitkaFactory({doExcludeStandardTestModules: true})
      const sitka = new Sitka<AppModules>()
      const meta = sitka.createSitkaMeta()

      const sitkaDefaultStateProperties = (meta.defaultState as any).__sitka__
      const expected = {
        sagas: [],
        forks: [],
        reducersToCombine: {},
        middlewareToAdd: [],
        handlerOriginalFunctionMap: new Map(),
        sitkaOptions: undefined,
      }
      expect(sitkaDefaultStateProperties).toMatchObject(expected)
    })

    test.only(`createSitkaMeta returns expected SitkaMeta`, () => {
      const colorMod = new ColorModule()
      const textMod = new TextModule()
      const sitka = sitkaFactory({
        doTrackHistory: true,
        doExcludeStandardTestModules: true,
        additionalModules: [colorMod, textMod],
      })

      const actual = sitka.createSitkaMeta()
      console.log(actual)
      // const actual = (meta.defaultState as any).__sitka__

      // defaultState
      const expectedDefaultState = {
        logging: { history: [] },
        color: null,
        text: { size: 12, value: "Hello World", numberOfEdits: 0 },
      }

      expect(actual.defaultState).toMatchObject(expectedDefaultState)

      // reducers to combine
      expect(actual.reducersToCombine).toHaveProperty("color")
      expect(typeof actual.reducersToCombine.color).toBe("function")

      expect(actual.reducersToCombine).toHaveProperty("logging")
      expect(typeof actual.reducersToCombine.logging).toBe("function")

      expect(actual.reducersToCombine).toHaveProperty("text")
      expect(typeof actual.reducersToCombine.text).toBe("function")

      // middlewareToAdd
      expect(typeof actual.middleware[0]).toBe("function")

      // sagaRoot -- assume that sagaRoot is accurate if it's return includes the expected 'value' prop
      expect(typeof actual.sagaRoot).toBe("function")

      expect(actual.sagaRoot().next()).toMatchObject({
        value: {
          "@@redux-saga/IO": true,
        },
      })

      // sagaProvider -- assume that sagaProvider is accurate if it has the 'middleware' and 'activate' props
      expect(typeof actual.sagaProvider).toBe("function")
      expect(actual.sagaProvider()).toHaveProperty("middleware")
      expect(actual.sagaProvider()).toHaveProperty("activate")

      // todo: bind createSitkaMeta to a store that we control and run things on that store.
    })
  })

  describe("createStore", () => {
    test(`createStore returns redux Store with appstoreCreator`, () => {
      const sitkaMock = new SitkaMock<string>()
      const customAppStoreCreator = meta => {
        const store = createAppStore({
          initialState: meta.defaultState,
          reducersToCombine: [meta.reducersToCombine],
          middleware: meta.middleware,
          sagaRoot: meta.sagaRoot,
          log: false,
        })
        sitkaMock.setDispatch(store.dispatch)
        return store
      }
      const sitkaStore = sitkaMock.createStore(customAppStoreCreator)

      expect(sitkaStore).toEqual(
        expect.objectContaining({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          replaceReducer: expect.any(Function),
          subscribe: expect.any(Function),
        })
      )
    })

    test(`createStore returns redux Store without appstoreCreator`, () => {
      const sitkaMock = new SitkaMock<string>()
      const sitkaStore = sitkaMock.createStore()

      expect(sitkaStore).toEqual(
        expect.objectContaining({
          dispatch: expect.any(Function),
          getState: expect.any(Function),
          replaceReducer: expect.any(Function),
          subscribe: expect.any(Function),
        })
      )
    })
  })
})
