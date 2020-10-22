import { put } from "Redux-saga/effects"
import { SitkaModule } from "../sitka"
import { AppModules } from "./sitka.test"

export type ColorState = string | null

export class ColorModule extends SitkaModule<ColorState, AppModules> {
    public moduleName: string = "color"
    public defaultState: ColorState = null

    public *handleColor(color: string): IterableIterator<{}> {
        yield put(this.setState(color))
    }
}