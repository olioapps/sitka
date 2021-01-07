import { put } from "Redux-saga/effects"
import { SagaMeta, SitkaModule } from "../src/sitka"
import { AppModules } from "./sitka-test"
import { select, call } from "redux-saga/effects"
import { Middleware } from "redux"

export type TextState = {
    size: number
    value: string
    numberOfEdits: number
    history: ReadonlyArray<string>
}

export class TextModule extends SitkaModule<TextState, AppModules> {
    public moduleName: string = "text"
    public defaultState: TextState = {
        size: 12,
        value: "Hello World",
        numberOfEdits: 0,
        history: []
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
    public getModuleState(sitkaState: {}): TextState {
        return this.getState(sitkaState)
    }

    // mergeState
    public *handleUpdateSize(size: number): IterableIterator<{}> {
        yield call(this.mergeState, { size })
    }

    // used by middleware
    protected *handleAddHistory(actionType: string,): IterableIterator<{}> {
        const state: TextState = yield select(this.getState)
        const history = [...state.history, actionType]
        yield call(this.mergeState, { history })
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

    public historyMiddleware: Middleware<{}, {}> = store => next => action => {
        const result = next(action)
        switch (action.type) {
            case "MODULE_TEXT_HANDLEADDHISTORY":
            case "MODULE_TEXT_CHANGE_STATE":
                break
            default:
                this.handleAddHistory(action.type)
                break
        }
        return result
    }

    // provideMiddleware
    provideMiddleware(): Middleware[] {
        return [this.historyMiddleware]
    }
    // callAsGenerator
}