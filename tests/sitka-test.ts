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

/*
  sitka
  Main testing instance
  Multiple modules
  TextModule provides one middleware
 */
const sitka = new Sitka<AppModules>()
sitka.register([new ColorModule(), new TextModule()])

// TODO: type correctly.  Might require changes to sitka Create Store
const store: any = sitka.createStore()

/*
  sitkaWithLogger
  Redux Logger enabled instance
  Multiple modules
  TextModule provides one middleware
 */
const sitkaWithLogger = new Sitka<AppModules>({ log: true })
sitkaWithLogger.register([new ColorModule(), new TextModule()])

/*
  sitkaNoMiddleware
  single module instance
  ColorModule provides no middleware
*/
const sitkaNoMiddleware = new Sitka<AppModules>()
sitkaNoMiddleware.register([new ColorModule()])

export { sitka, store, sitkaNoMiddleware, sitkaWithLogger }