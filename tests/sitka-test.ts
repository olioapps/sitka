import { ColorModule, ColorState } from "./color_module"
import { Sitka } from "../src/sitka"
import { TextModule, TextState } from "./text_module"

export interface AppModules {
  readonly color: ColorModule
  readonly text: TextModule
}

export interface AppState {
  readonly color: ColorState
  readonly text: TextState
}

const sitka = new Sitka<AppModules>()
sitka.register([new ColorModule(), new TextModule()])

// TODO: type correctly.  Might require changes to sitka Create Store
const store: any = sitka.createStore()

export { sitka, store }