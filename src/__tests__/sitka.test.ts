import { ColorModule } from "./color_module"
import { Sitka } from  "../sitka"

export interface AppModules {
  readonly color: ColorModule
}

const sitka = new Sitka<AppModules>()
sitka.register([ new ColorModule()])

const store = sitka.createStore()

export { sitka, store }