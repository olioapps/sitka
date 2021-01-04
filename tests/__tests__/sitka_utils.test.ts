import { sitka } from "../sitka-test"
import { hasMethod, getInstanceMethodNames, createAppStore, createStateChangeKey, createHandlerKey } from "../../src/sitka"
const { text: textModule } = sitka.getModules()

describe("Sitka Util Functions", () => {
  test(`createAppStore returns Redux store`, () => {
    const meta = sitka.createSitkaMeta()
    const store = createAppStore(
      {
        initialState: meta.defaultState,
        reducersToCombine: [meta.reducersToCombine],
        middleware: meta.middleware,
        sagaRoot: meta.sagaRoot,
        log: false,
      }
      )
      expect(store).toEqual(expect.objectContaining({
        dispatch: expect.any(Function),
        getState: expect.any(Function),
        replaceReducer: expect.any(Function),
        subscribe: expect.any(Function),
      }))
      expect(store.getState() === meta.defaultState).toBeTruthy()
  })

  test(`hasMethod returns true when module has method`, () => {
    const methodExists = hasMethod(textModule, "handleText")
    expect(methodExists).toBeTruthy()
  })

  test(`hasMethod returns false when module does not have method`, () => {
    const propertyIsNotFunc = hasMethod(textModule, "defaultState")
    expect(propertyIsNotFunc).toBeFalsy()
    const noMethodExists = hasMethod(textModule, "nothingExistsByThisName")
    expect(noMethodExists).toEqual
  })

  test(`getInstanceMethodNames returns array of method names`, () => {
    const names = [
      "handleText",
      "handleReset",
      "getModuleState",
      "handleUpdateSize",
      "handleAddHistory",
      "handleIncrementNumberOfEdits",
      "provideSubscriptions",
      "handleNoOp",
      "genericFork",
      "provideForks",
      "provideMiddleware",
      "reduxKey",
      "createAction",
      "setState",
      "resetState",
      "getState",
      "mergeState",
      "createSubscription",
      "provideMiddleware",
      "provideSubscriptions",
      "provideForks",
      "callAsGenerator"
    ]
    const methodNames = getInstanceMethodNames(textModule, Object.prototype)
    expect(methodNames).toEqual(names)
  })

  test(`createStateChangeKey returns uppercase state change action type string`, () => {
    const stateChangeKey = createStateChangeKey(textModule.moduleName)
    expect(stateChangeKey).toEqual(`MODULE_TEXT_CHANGE_STATE`)
  })

  test(`createHandlerKey returns uppercase handler action type string`, () => {
    const handlerKey = createHandlerKey(textModule.moduleName, "handleText")
    expect(handlerKey).toEqual(`MODULE_TEXT_HANDLETEXT`)
  })
})