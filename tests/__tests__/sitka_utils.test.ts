import { sitkaFactory, sitka } from "../sitka-test"
import { createAppStore } from "../../src/sitka"
import rewire from "rewire"

const utils = rewire("../../dist/sitka.js")

describe("Sitka Util Functions", () => {
  test(`createAppStore returns Redux store`, () => {
    // todo: using sitka factory results in referenceError: alert is not defined.  Test will still pass
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

  describe(`hasMethod tests`, () => {
    const sitka = sitkaFactory()
    const { text: textModule } = sitka.getModules()
    const hasMethod = utils.__get__("hasMethod")

    test(`hasMethod returns true when module has method`, () => {
      const methodExists = hasMethod(textModule, "handleText")
      expect(methodExists).toBeTruthy()
    })

    test(`hasMethod returns false when module does not have method`, () => {
      const propertyIsNotFunc = hasMethod(textModule, "defaultState")
      expect(propertyIsNotFunc).toBeFalsy()
      const noMethodExists = hasMethod(textModule, "nothingExistsByThisName")
      expect(noMethodExists).toBeFalsy()
    })
  })

  describe(`getInstanceMethodNames tests`, () => {
    const getInstanceMethodNames = utils.__get__("getInstanceMethodNames")

    test(`getInstanceMethodNames returns array of method names`, () => {
      const mockModule = {
        defaultState: {},
        mergeState: () => {},
        handleFunction: () => {},
      }
      const names = [
        "mergeState",
        "handleFunction"
      ]
      const mockModuleObj = Object.create(mockModule)
      const methodNames = getInstanceMethodNames(mockModuleObj, Object.prototype)
      expect(methodNames).toEqual(names)
    })
  })

  describe(`createStateChangeKey tests`, () => {
    const sitka = sitkaFactory()
    const { text: textModule } = sitka.getModules()
    const createStateChangeKey = utils.__get__("createStateChangeKey")

    test(`createStateChangeKey returns uppercase state change action type string`, () => {
      const stateChangeKey = createStateChangeKey(textModule.moduleName)
      expect(stateChangeKey).toEqual(`MODULE_TEXT_CHANGE_STATE`)
    })
  })

  describe(`createHandlerKey tests`, () => {
    const sitka = sitkaFactory()
    const { text: textModule } = sitka.getModules()
    const createHandlerKey = utils.__get__("createHandlerKey")

    test(`createHandlerKey returns uppercase handler action type string`, () => {
      const handlerKey = createHandlerKey(textModule.moduleName, "handleText")
      expect(handlerKey).toEqual(`MODULE_TEXT_HANDLETEXT`)
    })
  })
})
