import { AppState, store, sitka } from "../sitka-test"
const { text: textModule } = sitka.getModules()

describe("Sitka Redux Store", () => {
  test(`getState returns expected value`, () => {
    const state: AppState = store.getState()

    const colorActual = state.color
    const colorExpected = null
    expect(colorActual).toEqual(colorExpected)

    const textActual = state.text
    const textExpected = {
      size: 12,
      value: "Hello World",
      numberOfEdits: 0,
      history: []
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
    const actual = textModule.getModuleState(sitkaState)
    const expected = {
      size: 12,
      value: "Hello World",
      numberOfEdits: 0,
      history: [],
    }

    expect(actual).toEqual(expected)
  })

  test('mergeState sets partial state of module', () => {
    // handleUpdateSize implements merge state    
    textModule.handleUpdateSize(5)
    const { text: actual } = store.getState()
    const expected = {
      size: 5,
      value: "Hello World",
      numberOfEdits: 0,
      history: ["MODULE_TEXT_HANDLEUPDATESIZE"]
    }
    expect(actual).toEqual(expected)
  })

  test('able to get defaultState', () => {
  })

  test('able to get moduleName', () => {
  })

  test('able to get modules', () => {
  })

  test('reduxKey returns key', () => {
  })

  test('setState (protected) updates redux state with handleText (public)', () => {
  })

  test('resetState (protected) updates redux state to default with handleReset (public)', () => {
  })

  // SUBSCRIPTION
  test('subscriptions are created/provided with provideSubscriptions & createSubscription', () => {
  })

  // FORKS
  test('provideForks adds fork to Sitka', () => {
  })

  // MIDDLEWARE
  test('provideMiddleware adds middleware to Sitka', () => {
  })

  // CALL AS GENERATOR
  test('callAsGenerator adds middleware to Sitka', () => {
  })
})
