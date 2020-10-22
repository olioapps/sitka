import { sitka, store} from "./sitka.test"

function sum(a, b) {
  return a + b;
}



test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test(`get default null value from color module`, () => {
  const colorState = store.getState()
  console.log(colorState)
})