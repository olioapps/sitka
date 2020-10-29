import { sitka, store} from "../sitka-test"

test(`get default null value from color module`, () => {
  const colorState = store.getState()
  console.log(colorState)
})