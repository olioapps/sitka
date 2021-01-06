import { AppState,
  store,
  sitka,
  sitkaNoMiddleware,
  sitkaWithLogger
} from "../sitka-test"

const { text: textModule } = sitka.getModules()
const { text: textModuleWithLogger } = sitkaWithLogger.getModules()

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

 /*
  MIDDLEWARE

  Testing Notes:
  enabling Logger middleware and dispatching actions on that instance will result in jest console.log errors.
  tests themselves will still pass.
 */

 describe('provideMiddleware adds middleware to Sitka', () => {

   test('middleware provided from a sitka module adds middleware to Sitka', () => {
      const actual = sitka.createSitkaMeta().middleware[0]
      expect(actual).toEqual(textModule.historyMiddleware)
   })

   test('providedMiddleware adds middleware to a log enabled Sitka instance', () => {
      // there are two middlewares - one provided by textModule, and the logger.
      const actualMiddlewareLength = sitkaWithLogger.createSitkaMeta().middleware.length
      expect(actualMiddlewareLength).toEqual(2)

      // the logger middleware will always be appended to the end of the middleware array
      // checking that the first is the provided middleware
      const actualProvidedMiddleware = sitkaWithLogger.createSitkaMeta().middleware[0]
      expect(actualProvidedMiddleware).toEqual(textModuleWithLogger.historyMiddleware)
   })

   test('no provided middleware and no logger results in no Sitka middleware', () => {
      const actual = sitkaNoMiddleware.createSitkaMeta().middleware.length
      expect(actual).toEqual(0)
   })
 })

  // CALL AS GENERATOR
  test('callAsGenerator adds middleware to Sitka', () => {
  })
})
