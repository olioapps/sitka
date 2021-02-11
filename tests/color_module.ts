import { put } from 'Redux-saga/effects'
import { SitkaModule } from '../src/sitka'
import { AppModules } from './sitka-test'

export type ColorState = string | null

export class ColorModule extends SitkaModule<ColorState, AppModules> {
  public moduleName: string = 'color'
  public defaultState: ColorState = null

  public *handleColor(color: string): IterableIterator<{}> {
    yield put(this.setState(color))
  }
  public *handleReset(): IterableIterator<{}> {
    yield put(this.resetState())
  }
}
