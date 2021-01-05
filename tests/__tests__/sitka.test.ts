import { Dispatch } from "redux"
import { AppState, store, sitka } from "../sitka-test"
const { text: textModule } = sitka.getModules()

describe("Sitka", () => {
  // SETUP
  beforeEach(() => {
    const modules = sitka.getModules()
    Object.values(modules).forEach((module: any) => {
      module.handleReset()
    })

  })

  describe('setDispatch', () => {
    // Setup
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
      textModule.handleUpdateSize(20)

      const { text: actual } = store.getState()
      const expected = {
        size: 20,
        value: "Hello World",
        numberOfEdits: 0,
        history: ["MODULE_TEXT_HANDLEUPDATESIZE"]
      }
      expect(actual).toEqual(expected)
      expect(wasMockDispatched).toEqual(true)
    })
  })

  test(`getModules returns registered modules`, () => {
  })

  // test(`createSitkaMeta returns expected SitkaMeta`, () => {
  // })

  // test(`createStore returns redux Store with appstoreCreator`, () => {
  // })

  // test(`createStore returns redux Store without appstoreCreator`, () => {
  // })
})