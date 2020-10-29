import { store } from "../sitka-test"

test(`get default null value from color module`, () => {
  const colorState = store.getState()

  const actual = colorState.color
  const expected = null

  expect(actual).toEqual(expected)
})