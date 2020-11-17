import { put } from "Redux-saga/effects"
import { SitkaModule } from "../src/sitka"
import { AppModules } from "./sitka-test"

export type TextState = {
    size: number
    value: string
}

export class TextModule extends SitkaModule<TextState, AppModules> {
    public moduleName: string = "text"
    public defaultState: TextState = {
        size: 12,
        value: "Hello World"
    }

    public *handleText(text: TextState): IterableIterator<{}> {
        yield put(this.setState(text))
    }

    public *handleReset(): IterableIterator<{}> {
        yield put(this.resetState())
    }
    // todo: add custom handleSetColor to test mergeState
}