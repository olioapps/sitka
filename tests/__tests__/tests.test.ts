import { AppState, store, sitka } from "../sitka-test"

describe("SitkaModule", () => {
  beforeEach(() => {
    const modules = sitka.getModules()
    Object.values(modules).forEach((module: any) => {
      module.handleReset()
    })
  })
  test(`getState returns expected value`, () => {
    const state: AppState = store.getState()

    const colorActual = state.color
    const colorExpected = null
    expect(colorActual).toEqual(colorExpected)

    const textActual = state.text
    const textExpected = {
      size: 12,
      value: "Hello World"
    }
    expect(textActual).toEqual(textExpected)
  })
})

// TODO: test that checks pre state, calls color.handleSetColor, checks post state

