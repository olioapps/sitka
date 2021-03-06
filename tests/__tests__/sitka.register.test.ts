import { AppModules, sitkaFactory } from '../sitka-test'
import { ColorModule } from '../color_module'
import rewire from 'rewire'
import { Sitka } from '../../src/sitka'
import { LoggingModule } from '../logging_module'
import { TextModule } from '../text_module'

const sitkaRewired = rewire('../../dist/sitka.js')

class MockColorModule extends ColorModule {
  public provideMiddleware
}

const moduleMethodNames = [
  'provideMiddleware',
  'provideSubscriptions',
  'provideForks',
  'createSubscriptions',
  'mergeState',
  'getState',
  'resetState',
  'setState',
  'createAction',
  'reduxKey',
  'constructor',
]

const colorModuleMethodNames = ['handleColor', 'handleReset', ...moduleMethodNames]

describe('Sitka Register Method', () => {
  describe('Register Unit tests', () => {
    // SETUP
    let mockColorModule
    let mockGetInstanceMethodNames
    let mockProvideMiddleWare
    let mockFork
    let mockProvideForks
    let sitka

    beforeEach(() => {
      sitka = new sitkaRewired.Sitka()
      mockColorModule = new MockColorModule()
      mockGetInstanceMethodNames = jest.fn().mockReturnValueOnce(colorModuleMethodNames)
      sitkaRewired.__set__('getInstanceMethodNames', mockGetInstanceMethodNames)
      mockProvideMiddleWare = jest.fn().mockReturnValue(['mock middleware'])
      mockColorModule.provideMiddleware = mockProvideMiddleWare
      mockFork = jest.fn()
      mockProvideForks = jest.fn().mockReturnValue([{ bind: mockFork }])
      mockColorModule.provideForks = mockProvideForks

      const modules = sitka.getModules()
      Object.values(modules).forEach((module: any) => {
        module.handleReset()
      })
    })

    test('happy path unit tests (to be cont...)', () => {
      sitka.register([mockColorModule])

      // instance getMethodNamed
      expect(mockGetInstanceMethodNames.mock.calls[0][0]).toBe(mockColorModule)

      // instance provides middleware
      expect(mockProvideMiddleWare.mock.calls.length).toBe(1)
      expect(sitka.middlewareToAdd).toEqual(['mock middleware'])

      // instance provides forks
      expect(mockFork.mock.calls[0][0]).toBe(mockColorModule)

      // handlers.forEach @ sitka.ts ln 283
    })
  })

  describe('Register Integration tests', () => {
    test('Confirm register adds module to registered modules', () => {
      const sitka = new Sitka<AppModules>()
      // Validates there are no modules registered to start
      expect(sitka.getModules()).toEqual({})
      // Validates that we registered color module with .register
      const colorModule = new ColorModule()
      sitka.register([colorModule])
      expect(sitka.getModules()).toHaveProperty('color')
    })
    test('Confirm register adds modules middleware to sitka', () => {
      // See sitka module tests for complete provideMiddleware testing
      const sitka = new Sitka<AppModules>()
      // Validates there is no middleware before registering sitka
      const preRegisterSitka = sitka.createSitkaMeta()
      expect(preRegisterSitka.middleware.length).toEqual(0)
      // Validates middleware is added after registering module with middleware
      const loggingModule = new LoggingModule()
      sitka.register([loggingModule])
      const sitkaMeta = sitka.createSitkaMeta()
      expect(sitkaMeta.middleware.length).toEqual(1)
    })
    test("Confirm register adds 'handle' prefixed functions to sitka instance sagas", () => {
      const sitka = new Sitka<AppModules>()
      // Validates sitka has no sagas before registering modules
      const preRegisterMeta: any = sitka.createSitkaMeta()
      const preRegisterSagas = preRegisterMeta.defaultState.__sitka__.sagas
      expect(preRegisterSagas).toEqual([])
      // Validates that sitka sagas match the original color module handle functions (extracting literal methods from the handlerOriginalFunctionMap)
      const colorModule = new ColorModule()
      sitka.register([colorModule])
      const sitkaMeta: any = sitka.createSitkaMeta()
      const expectedSagas = [
        {
          handler: colorModule.handlerOriginalFunctionMap.get(colorModule.handleColor).fn,
          name: 'MODULE_COLOR_HANDLECOLOR',
        },
        {
          handler: colorModule.handlerOriginalFunctionMap.get(colorModule.handleReset).fn,
          name: 'MODULE_COLOR_HANDLERESET',
        },
      ]
      const actualSagas = sitkaMeta.defaultState.__sitka__.sagas
      expect(actualSagas).toEqual(expectedSagas)
    })
    test('Test and see if forks were added when registered module has them in provideForks', () => {
      const sitka = new Sitka<AppModules>()
      // Validate that sitka starts with no forks
      const preChangeMeta: any = sitka.createSitkaMeta()
      const preChange = preChangeMeta.defaultState.__sitka__.forks
      expect(preChange.length).toEqual(0)
      // Validate that registering modules adds forks and that running the fork from inside sitka is possible
      const textModule = new TextModule()
      const colorModule = new ColorModule()
      const genericFork = jest.spyOn(textModule, 'genericFork')
      sitka.register([colorModule, textModule])
      const sitkaMeta: any = sitka.createSitkaMeta()
      const actual = sitkaMeta.defaultState.__sitka__.forks
      actual[0]()
      expect(actual.length).toEqual(1)
      expect(genericFork).toHaveBeenCalled()
    })
  })
})
