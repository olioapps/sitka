import { Dispatch } from "redux"
import { createSitkaAndStore } from "../sitka-test"
import { createAppStore, Sitka } from "../../src/sitka"

export class SitkaMock<T = {}> extends Sitka {
  public registeredModules: T
 }

describe("Sitka", () => {

  describe('setDispatch', () => {
    // Setup
    const { sitka, store } = createSitkaAndStore()
    let wasMockDispatched: boolean
    beforeEach(() => {
      wasMockDispatched = false
    })

    test(`setDispatch dispatch was called`, () => {
      const mockDispatch: Dispatch = <T>(action: T) => {
        wasMockDispatched = true
        store.dispatch(action)
        return action
      }

      sitka.setDispatch(mockDispatch)
      sitka.getModules().text.handleUpdateSize(20)

      const { text: actual } = store.getState()
      const expected = {
        size: 20,
        value: "Hello World",
        numberOfEdits: 0,
      }
      expect(actual).toEqual(expected)
      expect(wasMockDispatched).toEqual(true)
    })
  })

  test(`getModules returns registered modules`, () => {
    const sitkaMock = new SitkaMock<string>()
    const expected = 'sitka modules'
    sitkaMock.registeredModules = expected
    const actual = sitkaMock.getModules()

    expect(actual).toEqual(expected)
  })

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