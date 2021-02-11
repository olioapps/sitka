import { put } from 'Redux-saga/effects'
import { SagaMeta, SitkaModule } from '../src/sitka'
import { AppModules } from './sitka-test'
import { select, call } from 'redux-saga/effects'
import { Middleware } from 'redux'

export type LoggingState = {
  history: ReadonlyArray<string>
}

export class LoggingModule extends SitkaModule<LoggingState, AppModules> {
  public moduleName: string = 'logging'
  public defaultState: LoggingState = { history: [] }

  // used by middleware
  protected *handleAddHistory(actionType: string): IterableIterator<{}> {
    const state: LoggingState = yield select(this.getState)
    const history = [...state.history, actionType]
    yield call(this.mergeState, { history })
  }
  public historyMiddleware: Middleware<{}, {}> = store => next => action => {
    const result = next(action)
    switch (action.type) {
      case 'MODULE_LOGGING_HANDLEADDHISTORY':
      case 'MODULE_LOGGING_CHANGE_STATE':
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
