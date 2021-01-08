import { AppModules, sitkaFactory } from "../sitka-test"
import { ColorModule } from "../color_module"
import rewire from "rewire"
import { Sitka } from "../../src/sitka"

const sitkaRewired = rewire('../../dist/sitka.js')

class MockColorModule extends ColorModule {
  public provideMiddleware
}

const moduleMethodNames = ['provideMiddleware', 'provideSubscriptions', 'provideForks', 'createSubscriptions', 'mergeState', 'getState', 'resetState', 'setState', 'createAction', 'reduxKey', 'constructor']

const colorModuleMethodNames = ['handleColor', 'handleReset', ...moduleMethodNames]

describe("Sitka Register Method", () => {

  describe("Register Unit tests", () => {
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
      sitkaRewired.__set__("getInstanceMethodNames", mockGetInstanceMethodNames)
      mockProvideMiddleWare = jest.fn().mockReturnValue(["mock middleware"])
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
      expect(sitka.middlewareToAdd).toEqual(["mock middleware"])

      // instance provides forks
      expect(mockFork.mock.calls[0][0]).toBe(mockColorModule)

      // handlers.forEach @ sitka.ts ln 283
    })
  })

  describe("Register Integration tests", () => {

    test('integration test confirm register registers module', () => {
      const sitka = new Sitka<AppModules>()
      // don't forget to pre validate that sitka is not registered
      const colorModule = new ColorModule()
      sitka.register([colorModule])
      // Validates that we registered color module
      expect(sitka.getModules()).toHaveProperty("color")
      // test middleware exists after registering module with middleware
      // test meta: const meta = sitka.createSitkaMeta()
      // test sages: use createSitkaMeta() to inspect protected sitka values (like sagas...etc)
      // test and see if forked were added when registered module has them in provideForks
      const sitkaMeta = sitka.createSitkaMeta()
      // console.log(sitkaMeta.middleware)

    })
    test('test middleware exists after registering module with middleware', () => {
      const sitka = sitkaFactory({doLogging: true})
      console.log(sitka.createSitkaMeta())
    })
  })
})
