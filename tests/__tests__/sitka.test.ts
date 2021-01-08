import { Dispatch } from "redux"
import { store, sitka } from "../sitka-test"
import { Sitka } from "../../src/sitka"
const { text: textModule } = sitka.getModules()

export class SitkaMock<T = {}> extends Sitka {
  public registeredModules: T
 }

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

  // test(`createSitkaMeta returns expected SitkaMeta`, () => {
  // })

  // test(`createStore returns redux Store with appstoreCreator`, () => {
  // })

  // test(`createStore returns redux Store without appstoreCreator`, () => {
  // })
})