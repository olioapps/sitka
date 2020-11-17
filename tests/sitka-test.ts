import { ColorModule, ColorState } from "./color_module"
import { Sitka } from "../src/sitka"

export interface AppModules {
  readonly color: ColorModule
}

export interface AppState {
  color: ColorState
}

const sitka = new Sitka<AppModules>()
sitka.register([new ColorModule()])

// TODO: type correctly.  Might require changes to sitka Create Store
const store: any = sitka.createStore()

export { sitka, store }