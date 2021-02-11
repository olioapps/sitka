import { createSitkaAndStore } from '../sitka-test'
import { defaultTextModuleState } from '../text_module'

describe('Sitka Redux Store', () => {
  test(`getState returns expected value`, () => {
    const { store } = createSitkaAndStore()
    const state: any = store.getState()

    const colorActual = state.color
    const colorExpected = null
    expect(colorActual).toEqual(colorExpected)

    const textActual = state.text
    expect(textActual).toEqual(defaultTextModuleState)
  })
})
