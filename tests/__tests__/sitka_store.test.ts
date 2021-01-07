import { AppState, store } from "../sitka-test"

describe("Sitka Redux Store", () => {
    const defaultTextModuleState = { 
        size: 12, 
        value: "Hello World", 
        numberOfEdits: 0, 
        history: [] 
    }
    test(`getState returns expected value`, () => {
      const state: AppState = store.getState()
  
      const colorActual = state.color
      const colorExpected = null
      expect(colorActual).toEqual(colorExpected)
  
      const textActual = state.text
      expect(textActual).toEqual(defaultTextModuleState)
    })
  })