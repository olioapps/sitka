import { put } from "Redux-saga/effects"
import { SitkaModule } from "../src/sitka"
import { AppModules } from "./sitka-test"
import { select, call } from "redux-saga/effects"

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

    // setState
    public *handleText(text: TextState): IterableIterator<{}> {
        yield put(this.setState(text))
    }

    // resetState
    public *handleReset(): IterableIterator<{}> {
        yield put(this.resetState())
    }

    //getState
    public getModuleState(sitkaState: {}): {}  {
        return this.getState(sitkaState)
    }

    // mergeState
    public *handleUpdateSize(size: number ): {} {
        yield call(this.mergeState, { size })
    }
    // createAction

    // createSubscription

    // callAsGenerator

    // provideMiddleware

    // provideSubscriptions

    // provideForks
}