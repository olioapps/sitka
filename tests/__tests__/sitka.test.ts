import { Action, Dispatch } from "redux"
import { AppState, store, sitka } from "../sitka-test"
const { text: textModule } = sitka.getModules()

describe("Sitka", () => {
    // SETUP

    let foo

    beforeEach(() => {
      foo = undefined
      const modules = sitka.getModules()
      Object.values(modules).forEach((module: any) => {
        module.handleReset()
      })


    })

  test(`setDispatch dispatch was called`, async () => {
    const mockDispatch: Dispatch = <T>(action: T) => {
      foo = "bar"
      store.dispatch(action)
      return action
    }

    sitka.setDispatch(mockDispatch)
    textModule.handleUpdateSize(20)

    const { text: actual } = await store.getState()
    const expected = {
      size: 20,
      value: "Hello World",
      numberOfEdits: 0,
      history: ["MODULE_TEXT_HANDLEUPDATESIZE"]
    }
    expect(actual).toEqual(expected)
    expect(foo).toEqual('bar')
  })

  // test(`getModules returns Redux store`, () => {
  // })

  // test(`createSitkaMeta returns expected SitkaMeta`, () => {
  // })

  // test(`createStore returns redux Store with appstoreCreator`, () => {
  // })

  // test(`createStore returns redux Store without appstoreCreator`, () => {
  // })
})