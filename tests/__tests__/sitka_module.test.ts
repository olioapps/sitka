import { AppState, store, sitka } from "../sitka-test"

describe("Sitka Redux Store", () => {
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

describe("SitkaModule", () => {
  // SETUP
  let sitkaState

  beforeEach(() => {
    const modules = sitka.getModules()
    Object.values(modules).forEach((module: any) => {
      module.handleReset()
    })

    sitkaState = store.getState()
  })

  // TESTS
  test('getState returns moduleState', () => {
    const { text: textModule } = sitka.getModules()

    const actual = textModule.getModuleState(sitkaState)
    const expected = {
      size: 12,
      value: "Hello World",
    }

    expect(actual).toEqual(expected)
  })

  test('mergeState sets partial state of module', () => {
    
  })
})

// TODO: test that checks pre state, calls color.handleSetColor, checks post state

