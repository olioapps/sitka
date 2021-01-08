import {
  sitkaFactory,
  createSitkaAndStore,
  AppState,
} from "../sitka-test"
import { defaultTextModuleState } from "../text_module"

describe("SitkaModule", () => {
  // SETUP
  const newTextModuleState = {
    size: 100,
    value: "test value",
    numberOfEdits: 1,
  }

  // TESTS
  test('getState returns moduleState', () => {
    const { store, sitka } = createSitkaAndStore()
    const allState = store.getState()
    const actual = sitka.getModules().text.getStateTestDelegate(allState)
    expect(actual).toEqual(defaultTextModuleState)
  })

  test('mergeState sets partial state of module', () => {
    // handleUpdateSize implements merge state
    const { store, sitka } = createSitkaAndStore()
    sitka.getModules().text.handleUpdateSize(5)
    const { text: actual }: Partial<AppState> = store.getState()
    const expected = {
      size: 5,
      value: "Hello World",
      numberOfEdits: 0
    }
    expect(actual).toEqual(expected)
  })

  test('able to get defaultState', () => {
    const sitka = sitkaFactory()
    const actual = sitka.getModules().text.defaultState
    expect(actual).toEqual(defaultTextModuleState)
  })

  test('able to get moduleName', () => {
    const sitka = sitkaFactory()
    const actual = sitka.getModules().text.moduleName
    expect(actual).toEqual("text")
  })

  test('module is aware of other modules via this.modules property', () => {
    const sitka = sitkaFactory()
    const { text: textModule, color: colorModule } = sitka.getModules()
    const expectedModulesValues = {
      color: colorModule,
      text: textModule,
    }
    expect(textModule.modules).toEqual(expect.objectContaining(expectedModulesValues))
  })

  test('reduxKey returns key', () => {
    const sitka = sitkaFactory()
    const { text: textModule } = sitka.getModules()
    const actual = textModule.reduxKey()
    expect(actual).toEqual("text")
  })

  test('setState (protected) updates redux state with handleText (public)', () => {
    const { sitka, store } = createSitkaAndStore()
    const { text: textModule } = sitka.getModules()
    // Validates the state starts as default
    const allState = store.getState()
    const startingState = textModule.getStateTestDelegate(allState)
    expect(startingState).toEqual(defaultTextModuleState)
    // Validates the state updates using handleText, then calling protected setState
    textModule.handleText(newTextModuleState)
    const newAllState = store.getState()
    const moduleState = textModule.getStateTestDelegate(newAllState)
    expect(moduleState).toEqual(newTextModuleState)
  })

  test('resetState (protected) updates redux state to default with handleReset (public)', () => {
    const { sitka, store } = createSitkaAndStore()
    const { text: textModule } = sitka.getModules()
    // Validates that we successfully change and start with an updated state
    textModule.handleText(newTextModuleState)
    const nonDefaultState = textModule.getStateTestDelegate(store.getState())
    expect(nonDefaultState).toEqual(newTextModuleState)
    // Validates we reset to default state
    textModule.handleReset()
    const currentState = textModule.getStateTestDelegate(store.getState())
    textModule.getStateTestDelegate(store.getState())
    expect(currentState).toEqual(defaultTextModuleState)
  })

//   // SUBSCRIPTION
//   test('subscriptions are created/provided with provideSubscriptions & createSubscription', () => {
//   })

//   // FORKS
//   test('provideForks adds fork to Sitka', () => {
//   })

/*
  MIDDLEWARE

  Testing Notes:
  enabling Logger middleware and dispatching actions on that instance will result in jest console.log errors.
  tests themselves will still pass.
 */

 describe('provideMiddleware adds middleware to Sitka', () => {

  test('middleware provided from a sitka module adds middleware to Sitka', () => {
    const sitka = sitkaFactory({ doTrackHistory: true })

    // get the middleware object from sitka
    const actual = sitka.createSitkaMeta().middleware[0]

    // compare sitka middleware to the provider module middleware
    expect(actual).toEqual(sitka.getModules().logging.historyMiddleware)
  })

  test('providedMiddleware adds middleware to a log enabled Sitka instance', () => {
    const sitkaWithLogger = sitkaFactory({ doLogging: true, doTrackHistory: true })
    const { logging: loggingModule } = sitkaWithLogger.getModules()
    // there are two middlewares - one provided by textModule, and the logger.
    const actualMiddlewareLength = sitkaWithLogger.createSitkaMeta().middleware.length
    expect(actualMiddlewareLength).toEqual(2)
    // the logger middleware will always be appended to the end of the middleware array
    // checking that the first is the provided middleware
    const actualProvidedMiddleware = sitkaWithLogger.createSitkaMeta().middleware[0]
    expect(actualProvidedMiddleware).toEqual(loggingModule.historyMiddleware)
  })

   test('no provided middleware and no logger results in no Sitka middleware', () => {
      const sitkaNoMiddleware = sitkaFactory()
      const actual = sitkaNoMiddleware.createSitkaMeta().middleware.length
      expect(actual).toEqual(0)
   })
 })

//   // CALL AS GENERATOR
//   test('callAsGenerator adds middleware to Sitka', () => {
//   })
})
