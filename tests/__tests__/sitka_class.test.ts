import { put } from 'Redux-saga/effects'
import { ColorState } from '../color_module'
import { Sitka, SitkaModule } from '../../src/sitka'
import { Store } from 'redux'

interface AppModules {
  readonly SecondExtendedModule: SecondExtendedModule
}

// Base class
abstract class ColorModule extends SitkaModule<ColorState, AppModules> {
  public moduleName: string = 'Color_Module'
  public defaultState: ColorState = ''

  public *handleColor(color: string): IterableIterator<{}> {
    yield put(this.setState(color))
  }
  public *handleReset(): IterableIterator<{}> {
    yield put(this.resetState())
  }
}

// 1st child
abstract class ExtendedModule extends ColorModule {
  public moduleName: string = 'Extended_Module'
  public defaultState: ColorState = ''
}

// 2nd child
class SecondExtendedModule extends ExtendedModule {
  public moduleName: string = 'Second_Extended_Module'
  public defaultState: ColorState = ''
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

    const { SecondExtendedModule: module } = sitka.getModules()

    module.handleColor('newColor')
    module.handleReset()

    // TODO add test for class inheritance
  })
})
