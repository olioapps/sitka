import { put } from 'Redux-saga/effects'
import { ColorState } from '../color_module'
import { Sitka, SitkaModule } from '../../src/sitka'
import { Store } from 'redux'

interface AppModules {
  readonly extended_color: SecondExtendedModule
}

abstract class ColorModule extends SitkaModule<ColorState, AppModules> {
  public moduleName: string = 'color'
  public defaultState: ColorState = null

  public *handleColor(color: string): IterableIterator<{}> {
    yield put(this.setState(color))
  }
  public *handleReset(): IterableIterator<{}> {
    yield put(this.resetState())
  }
}

abstract class ExtendedModule extends ColorModule {}

class SecondExtendedModule extends ExtendedModule {
  public moduleName: string = 'extended_color'
  public *handleColor(color: string): IterableIterator<{}> {
    yield super.handleColor(color)
    yield put(this.setState(color))
  }
}

describe('SitkaClassInheritance', () => {
  test('Super Call', () => {
    const sitka = new Sitka<AppModules>()
    sitka.register([new SecondExtendedModule()])
    const store: Store = sitka.createStore() as Store

    const { extended_color } = sitka.getModules()
    extended_color.handleColor('newColor')
    // TODO add test for class inheritance
  })
})
