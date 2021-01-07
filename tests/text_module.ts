import { put } from "Redux-saga/effects"
import { SagaMeta, SitkaModule } from "../src/sitka"
import { AppModules } from "./sitka-test"
import { select, call } from "redux-saga/effects"

export type TextState = {
    size: number
    value: string
    numberOfEdits: number
}

export const defaultTextModuleState = {
    size: 12,
    value: "Hello World",
    numberOfEdits: 0,
}

export class TextModule extends SitkaModule<TextState, AppModules> {
    public moduleName: string = "text"
    public defaultState: TextState = defaultTextModuleState

    // setState
    public *handleText(text: TextState): IterableIterator<{}> {
        yield put(this.setState(text))
    }

    // resetState
    public *handleReset(): IterableIterator<{}> {
        yield put(this.resetState())
    }

    //getState
    public getStateTestDelegate(sitkaState: {}): {} {
        return this.getState(sitkaState)
    }

    // mergeState
    public *handleUpdateSize(size: number): IterableIterator<{}> {
        yield call(this.mergeState, { size })
    }

    public *handleIncrementNumberOfEdits(): IterableIterator<{}> {
        const currentState: TextState = yield select(this.getState)
        yield call(this.mergeState, { numberOfEdits: currentState.numberOfEdits + 1 })
    }

    // createSubscription
    // provideSubscriptions
    provideSubscriptions(): SagaMeta[] {
        return [
            this.createSubscription(this.modules.color.handleColor,
                this.handleIncrementNumberOfEdits)
        ]
    }

    // provideForks
    public *handleNoOp(): IterableIterator<{}> {
    }
    genericFork(): void {
        setTimeout(() => {
            this.handleNoOp()
        }, 500)
    }

    public provideForks(): {}[] { return [this.genericFork] }

    // callAsGenerator
}