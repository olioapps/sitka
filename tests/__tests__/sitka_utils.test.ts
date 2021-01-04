import { sitka } from "../sitka-test"
import { hasMethod } from "../../src/sitka"
const { text: textModule } = sitka.getModules()

describe("Sitka Util Functions", () => {
  test(`createAppStore returns Redux store`, () => {
  })

  test(`hasMethod returns true when module has method`, () => {
    const methodExists = hasMethod(textModule, "handleText")
    expect(methodExists).toBeTruthy()
  })

  test(`hasMethod returns false when module does not have method`, () => {
    const propertyIsNotFunc = hasMethod(textModule, "defaultState")
    expect(propertyIsNotFunc).toBeFalsy()
    const noMethodExists = hasMethod(textModule, "nothingExistsByThisName")
    expect(noMethodExists).toBeFalsy()
  })

  test(`getInstanceMethodNames returns array of method names`, () => {
  })

  test(`createStateChangeKey returns uppercase state change action type string`, () => {
  })

  test(`createHandlerKey returns uppercase handler action type string`, () => {
  })
})