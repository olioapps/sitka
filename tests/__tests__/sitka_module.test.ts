import {
  store,
  sitka,
  sitkaNoMiddleware,
  sitkaWithLogger
} from "../sitka-test"

const { text: textModule, color: colorModule } = sitka.getModules()
const { text: textModuleWithLogger } = sitkaWithLogger.getModules()

describe("SitkaModule", () => {
  // SETUP
  const defaultTextModuleState = { 
    size: 12, 
    value: "Hello World", 
    numberOfEdits: 0, 
    history: [] 
  }
  const newTextModuleState = {
    size: 100,
    value: "test value",
    numberOfEdits: 1,
    history: []
  }
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

    expect(actual).toEqual(defaultTextModuleState)
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
    const actual = textModule.defaultState
    expect(actual).toEqual(defaultTextModuleState)
  })

  test('able to get moduleName', () => {
    const actual = textModule.moduleName
    expect(actual).toEqual("text")
  })

  test('able to get modules', () => {
    const expectedModuleNames = ["color", "text"]
    const propertyNames = Object.getOwnPropertyNames(textModule.modules)
    expect(propertyNames).toEqual(expectedModuleNames)
    expect(textModule.modules[propertyNames[0]]).toEqual(colorModule)
    expect(textModule.modules[propertyNames[1]]).toEqual(textModule)
  })

  test('reduxKey returns key', () => {
    const actual = textModule.reduxKey()
    expect(actual).toEqual("text")
  })

  test('setState (protected) updates redux state with handleText (public)', () => {
    textModule.handleText(newTextModuleState)
    const moduleState = textModule.getModuleState(store.getState())
    expect(moduleState).toEqual(newTextModuleState)
  })

  test('resetState (protected) updates redux state to default with handleReset (public)', () => {

    textModule.handleText(newTextModuleState)
    textModule.handleReset()
    const currentState = textModule.getModuleState(store.getState())
    textModule.getModuleState(store.getState())
    expect(currentState).toEqual(defaultTextModuleState)
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
