import { AppState,
  store,
  sitka,
  sitkaNoMiddleware,
  sitkaWithLogger
} from "../sitka-test"
import rewire from "rewire"
import { TextModule, TextModule as TextModuleComponent } from "../text_module"
import { ColorModule } from "../color_module"

const sitkaRewired = rewire("../../dist/sitka")

const { text: textModule, color: colorModule } = sitka.getModules()
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
  let mockSitka
  beforeEach(() => {
    mockSitka = new sitkaRewired.Sitka()
  })
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
    const expected = { 
      size: 12,
      value: 'Hello World',
      history: [ 'MODULE_COLOR_HANDLECOLOR', 'MODULE_COLOR_CHANGE_STATE' ], 
      numberOfEdits: 1 
  }
    // Validates that we start with default state
    const startingTextState = textModule.getModuleState(store.getState())
    expect(startingTextState).toEqual(defaultTextModuleState)
    // Validates that subscribed function is called and updates state
    colorModule.handleColor("blue")
    const updatedTextState = textModule.getModuleState(store.getState())
    expect(updatedTextState).toMatchObject(expected)
  })

  // FORKS
  test('provideForks adds fork to Sitka', (done) => {
    const genericFork = jest.spyOn(TextModuleComponent.prototype, "genericFork")
    try {
      textModule.genericFork()
      done()
    } finally {
      expect(genericFork).toHaveBeenCalled();
    }
    mockSitka.register([new TextModule(), new ColorModule()])
    expect(mockSitka.forks.length).toEqual(1)
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
