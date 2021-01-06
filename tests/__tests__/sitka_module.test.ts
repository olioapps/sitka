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
    const expected = { 
      size: 12, 
      value: 'Hello World', 
      numberOfEdits: 0, 
      history: [] 
    }
    const actual = textModule.defaultState
    expect(actual).toEqual(expected)
  })

  test('able to get moduleName', () => {
    const actual = textModule.moduleName
    expect(actual).toEqual("text")
  })

  test('able to get modules', () => {
    const expected = ["color", "text"]
    const actual = Object.getOwnPropertyNames(textModule.modules)
    expect(actual).toEqual(expected)
  })

  test('reduxKey returns key', () => {
    const actual = textModule.reduxKey()
    expect(actual).toEqual("text")
  })

  test('setState (protected) updates redux state with handleText (public)', () => {
    const newState = {
      size: 100,
      value: "test value",
      numberOfEdits: 1,
      history: []
    }
    textModule.handleText(newState)
    const moduleState = textModule.getModuleState(store.getState())
    expect(moduleState).toEqual(newState)
  })

  test('resetState (protected) updates redux state to default with handleReset (public)', () => {
    const newState = {
      size: 100,
      value: "test value",
      numberOfEdits: 1,
      history: []
    }
    textModule.handleText(newState)
    textModule.handleReset()
    const currentState = textModule.getModuleState(store.getState())
    textModule.getModuleState(store.getState())
    expect(currentState).toEqual({
      size: 12,
      value: "Hello World",
      numberOfEdits: 0,
      history: []
    })
  })

  // SUBSCRIPTION
  test('subscriptions are created/provided with provideSubscriptions & createSubscription', () => {
  })

  // FORKS
  test('provideForks adds fork to Sitka', () => {
  })

  // MIDDLEWARE

 /*
  MIDDLEWARE TEST NOTES:
  enabling the Logger middleware will result in jest console.log errors.
  tests themselves will still pass.

  if logging is enabled in sitka-test.ts, `expected` value needs to be incremented by 1.
 */
  test('provideMiddleware adds middleware to Sitka', () => {
    const actual = sitka.createSitkaMeta().middleware.length
    const expected = 1

    expect(actual).toEqual(expected)
  })

  // CALL AS GENERATOR
  test('callAsGenerator adds middleware to Sitka', () => {
  })
})
