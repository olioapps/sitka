import { sitka } from "../sitka-test"
import { ColorModule } from "../color_module"
import rewire from "rewire"

const sitkaMock = rewire('../../dist/sitka.js')

class MockColorModule extends ColorModule {
  public provideMiddleware
}

const moduleMethodNames = ['provideMiddleware', 'provideSubscriptions', 'provideForks', 'createSubscriptions', 'mergeState', 'getState', 'resetState', 'setState', 'createAction', 'reduxKey', 'constructor']

const colorModuleMethodNames = ['handleColor', 'handleReset', ...moduleMethodNames]

describe("Sitka", () => {
  // SETUP
  beforeEach(() => {
    const modules = sitka.getModules()
    Object.values(modules).forEach((module: any) => {
      module.handleReset()
    })

  })

  describe('register', () => {
    // Setup
    const mockColorModule = new MockColorModule()

    const mockGetInstanceMethodNames = jest.fn().mockReturnValueOnce(colorModuleMethodNames)
    sitkaMock.__set__("getInstanceMethodNames", mockGetInstanceMethodNames)

    const mockProvideMiddleWare = jest.fn().mockReturnValue(["mock middleware"])
    mockColorModule.provideMiddleware = mockProvideMiddleWare

    const mockFork = jest.fn()

    const mockProvideForks = jest.fn().mockReturnValue([{ bind: mockFork }])
    mockColorModule.provideForks = mockProvideForks

    test('happy path', () => {
      const sitka = new sitkaMock.Sitka()
      sitka.register([mockColorModule])

      // instance getMethodNamed
      expect(mockGetInstanceMethodNames.mock.calls[0][0]).toBe(mockColorModule)

      // instance provide middleware
      expect(mockProvideMiddleWare.mock.calls.length).toBe(1)
      expect(sitka.middlewareToAdd).toEqual(["mock middleware"])

      // instance provides forks
      console.log(mockFork.mock)
      expect(mockFork.mock.calls[0][0]).toBe(mockColorModule)

      // handlers.forEach @ sitka.ts ln 283
    })

  })
})