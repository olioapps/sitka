import { ColorModule, ColorState } from "./color_module"
import { Sitka } from "../src/sitka"
import { TextModule, TextState } from "./text_module"
import { LoggingModule, LoggingState } from "./logging_module"

export interface AppModules {
  readonly color: ColorModule
  readonly text: TextModule
  readonly logging: LoggingModule
}

export interface AppState {
  readonly color: ColorState
  readonly text: TextState
  readonly logging: LoggingState
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

interface FactoryConfig {
  readonly doLogging: boolean
  readonly doTrackHistory: boolean
  readonly doExcludeStandardTestModules: boolean
  readonly additionalModules: any[]
}
const defaultSitkaFactoryConfig = {
  doLogging: false,
  doTrackHistory: false,
  doExcludeStandardTestModules: false,
  additionalModules: [],
 }

export const sitkaFactory = (
  config = {},
) => {
  const composedConfig: FactoryConfig = {
    ...defaultSitkaFactoryConfig,
    ...config
  }

  const {
    doLogging,
    doTrackHistory,
    doExcludeStandardTestModules,
    additionalModules
  } = composedConfig

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

export const createSitkaAndStore = (config = {} ) => {
  const sitka = sitkaFactory(config)
  const store = sitka.createStore()
  return { sitka, store }
}