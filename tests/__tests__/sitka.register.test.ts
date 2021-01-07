import { sitka, AppModules } from "../sitka-test"
import { ColorModule } from "../color_module"
import rewire from "rewire"

const sitkaRewired = rewire('../../dist/sitka.js')

class MockColorModule extends ColorModule {
  public provideMiddleware
}

const moduleMethodNames = ['provideMiddleware', 'provideSubscriptions', 'provideForks', 'createSubscriptions', 'mergeState', 'getState', 'resetState', 'setState', 'createAction', 'reduxKey', 'constructor']

const colorModuleMethodNames = ['handleColor', 'handleReset', ...moduleMethodNames]

describe("Sitka Register Method", () => {
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

  test('integration test', () => {
    const colorModule = new ColorModule()
    sitka.register([colorModule])
    console.log(sitka)
    // use actual sitka instance
    // register
    // inspect public sitka.getModules()
    // use createSitkaMeta() to inspect protected sitka values (like sagas...etc)
  })
})
