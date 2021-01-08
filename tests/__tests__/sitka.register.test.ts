import { AppModules, sitkaFactory } from "../sitka-test"
import { ColorModule } from "../color_module"
import rewire from "rewire"
import { Sitka } from "../../src/sitka"
import { LoggingModule } from "../logging_module"
import { TextModule } from "../text_module"

const sitkaRewired = rewire("../../dist/sitka.js")

class MockColorModule extends ColorModule {
  public provideMiddleware
}

const moduleMethodNames = ["provideMiddleware", "provideSubscriptions", "provideForks", "createSubscriptions", "mergeState", "getState", "resetState", "setState", "createAction", "reduxKey", "constructor"]

const colorModuleMethodNames = ["handleColor", "handleReset", ...moduleMethodNames]

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

    test("happy path unit tests (to be cont...)", () => {
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

    test("Confirm register adds module to registered modules", () => {
      const sitka = new Sitka<AppModules>()
      // don"t forget to pre validate that sitka is not registered
      const colorModule = new ColorModule()
      sitka.register([colorModule])
      // Validates that we registered color module
      expect(sitka.getModules()).toHaveProperty("color")
      // test middleware exists after registering module with middleware
      // test meta: const meta = sitka.createSitkaMeta()
      // test sages: use createSitkaMeta() to inspect protected sitka values (like sagas...etc)
      // test and see if forked were added when registered module has them in provideForks
      // const sitkaMeta: any = sitka.createSitkaMeta()
      // console.log("META: ", sitkaMeta)
      // console.log(sitkaMeta.defaultState.__sitka__.sagas)

    })
    test("Confirm register adds modules middleware to sitka", () => {
      // See sitka module tests for complete provideMiddleware testing
      const sitka = new Sitka<AppModules>()
      const loggingModule = new LoggingModule()
      sitka.register([loggingModule])
      const sitkaMeta = sitka.createSitkaMeta()
      expect(sitkaMeta.middleware.length).toEqual(1)
    })
    test("Confirm register adds module handlers to sitka sagas", () => {
      const sitka = new Sitka<AppModules>()
      const colorModule = new ColorModule()
      sitka.register([colorModule])
      const sitkaMeta: any = sitka.createSitkaMeta()
      const funcMap = Array.from(colorModule.handlerOriginalFunctionMap.values())
      const expectedSagas = [
        { handler: funcMap[0].fn, name: "MODULE_COLOR_HANDLECOLOR" },
        { handler: funcMap[1].fn, name: "MODULE_COLOR_HANDLERESET" }
      ]
      const actualSagas = sitkaMeta.defaultState.__sitka__.sagas
      expect(actualSagas).toEqual(expectedSagas)
    })
    test("Test and see if forks were added when registered module has them in provideForks", () => {
      const sitka = new Sitka<AppModules>()
      const textModule = new TextModule()
      const colorModule = new ColorModule()
      sitka.register([colorModule, textModule])
      const sitkaMeta: any = sitka.createSitkaMeta()
      const expected = [textModule.noOp.bind(textModule)]
      const actual = sitkaMeta.defaultState.__sitka__.forks
      // console.log(sitkaMeta.defaultState.__sitka__.forks)
      expect(JSON.stringify(actual)).toEqual(JSON.stringify(expected))
    })
  })
})

