import { ColorModule, ColorState } from "./color_module"
import { Sitka } from "../src/sitka"
import { TextModule, TextState } from "./text_module"
import { LoggingModule } from "./logging_module"

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

const defaultSitkaFactoryConfig = {
  doLogging: false,
  doTrackHistory: false,
  doExcludeStandardTestModules: false,
  additionalModules: [],
 }

export const sitkaFactory = ( 
  config = defaultSitkaFactoryConfig,
) => {
  const {
    doLogging,
    doTrackHistory,
    doExcludeStandardTestModules,
    additionalModules} = config

  const sitka = new Sitka<AppModules>({
    log: doLogging,
  })
  const standardTestModules = doExcludeStandardTestModules
    ? []
    : [
      new ColorModule(),
      new TextModule(),
    ]
  const modulesToUse = [
    ...standardTestModules,
    ...additionalModules,
  ]
  sitka.register(
    doTrackHistory
      ? [ new LoggingModule(), ...modulesToUse]
      : modulesToUse
  )

  return sitka
}

export const createSitkaAndStore = (config = defaultSitkaFactoryConfig ) => {
  const sitka = sitkaFactory(config)
  const store = sitka.createStore()
  return { sitka, store }
}