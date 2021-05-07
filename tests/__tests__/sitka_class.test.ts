import { put } from 'Redux-saga/effects'
import { Sitka, SitkaModule } from '../../src/sitka'
import { Middleware, Store } from 'redux'

interface AppModules {
  readonly Second_Extended_Module: SecondExtendedModule
  readonly Second_Extended_Module_Sibling: SecondExtendedModuleSibling
  readonly Color_Module: ColorModule
  readonly Middleware_Module: MiddlewareModule
  readonly Middleware_Module_Extended: MiddlewareModuleExtended
  readonly Middleware_Module_Second_Extended: MiddlewareModuleSecondExtended
}

export type ColorState = string | null

// Base class
class ColorModule extends SitkaModule<ColorState, AppModules> {
  public moduleName: string = 'Color_Module'
  public defaultState: ColorState = 'original_color'

  public *handleColor(color: string): IterableIterator<{}> {
    yield put(this.setState(color))
  }
  public *handleReset(): IterableIterator<{}> {
    yield put(this.resetState())
  }
}

// 1st child
class ExtendedModule extends ColorModule {}

// 2nd child
class SecondExtendedModule extends ExtendedModule {
  public moduleName: string = 'Second_Extended_Module'
  public defaultState: ColorState = ''
  // Changes color
  public *handleColor(color: string): IterableIterator<{}> {
    color = 'bright_' + color
    yield super.handleColor(color)
  }
}

// 2nd child sibling
class SecondExtendedModuleSibling extends ExtendedModule {
  public moduleName: string = 'Second_Extended_Module_Sibling'
  public defaultState: ColorState = 'mauve'
  // Changes color
  public *handleColor(color: string): IterableIterator<{}> {
    color = 'dark_' + color
    yield super.handleColor(color)
  }
}

class SecondExtendedModuleDuplicate extends ExtendedModule {
  public moduleName: string = 'Second_Extended_Module'
  public defaultState: ColorState = ''
}

// Middleware test modules
class MiddlewareModule extends ColorModule {
  public moduleName: string = 'Middleware_Module'
  public defaultState: ColorState = ''

  public static selectState(state: ColorState) {
    return state
  }

  public colorMiddleware: Middleware<{}, {}> = store => next => action => {
    const result = next(action)
    if (
      action.type === 'MODULE_MIDDLEWARE_MODULE_EXTENDED_HANDLECOLOR' ||
      action.type === 'MODULE_MIDDLEWARE_MODULE_SECOND_EXTENDED_HANDLECOLOR'
    ) {
      action._args[0] = action._args[0] + '_middleware'
    }
    return result
  }

  provideMiddleware(): Middleware[] {
    return [this.colorMiddleware]
  }
}

class MiddlewareModuleExtended extends MiddlewareModule {
  public moduleName: string = 'Middleware_Module_Extended'
  public defaultState: ColorState = ''
}

class MiddlewareModuleSecondExtended extends MiddlewareModule {
  public moduleName: string = 'Middleware_Module_Second_Extended'
  public defaultState: ColorState = 'original_color'
}

describe('SitkaClassInheritance', () => {
  test('Calls from child to parent using super', () => {
    const sitka = new Sitka<AppModules>()
    sitka.register([new SecondExtendedModule()])
    const store: Store = sitka.createStore() as Store

    const { Second_Extended_Module: module } = sitka.getModules()
    expect(store.getState().Second_Extended_Module).toBe('')
    module.handleColor('blue')
    expect(store.getState().Second_Extended_Module).toBe('bright_blue')
    module.handleReset()
    expect(store.getState().Second_Extended_Module).toBe('')
  })

  test('Throw Sitka error for duplicate moduleName', () => {
    const sitka = new Sitka<AppModules>()
    expect(() => {
      sitka.register([new SecondExtendedModule(), new SecondExtendedModuleDuplicate()])
    }).toThrowError('All registered Sitka modules must have unique names: Second_Extended_Module already declared')
  })

  test('Sibling modules update', () => {
    const sitka = new Sitka<AppModules>()
    sitka.register([new SecondExtendedModule(), new SecondExtendedModuleSibling()])
    const store: Store = sitka.createStore() as Store

    const { Second_Extended_Module: module1, Second_Extended_Module_Sibling: module2 } = sitka.getModules()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Second_Extended_Module_Sibling).toBe('mauve')
    module1.handleColor('blue')
    expect(store.getState().Second_Extended_Module).toBe('bright_blue')
    expect(store.getState().Second_Extended_Module_Sibling).toBe('mauve')
    module2.handleColor('red')
    expect(store.getState().Second_Extended_Module).toBe('bright_blue')
    expect(store.getState().Second_Extended_Module_Sibling).toBe('dark_red')
    module1.handleReset()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Second_Extended_Module_Sibling).toBe('dark_red')
    module2.handleReset()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Second_Extended_Module_Sibling).toBe('mauve')
  })

  test('Parent/Child modules update', () => {
    const sitka = new Sitka<AppModules>()
    sitka.register([new SecondExtendedModule(), new ColorModule()])
    const store: Store = sitka.createStore() as Store

    const { Second_Extended_Module: child, Color_Module: parent } = sitka.getModules()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Color_Module).toBe('original_color')
    child.handleColor('blue')
    expect(store.getState().Second_Extended_Module).toBe('bright_blue')
    expect(store.getState().Color_Module).toBe('original_color')
    parent.handleColor('red')
    expect(store.getState().Second_Extended_Module).toBe('bright_blue')
    expect(store.getState().Color_Module).toBe('red')
    child.handleReset()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Color_Module).toBe('red')
    parent.handleReset()
    expect(store.getState().Second_Extended_Module).toBe('')
    expect(store.getState().Color_Module).toBe('original_color')
  })

  test('Parent/Child middleware', () => {
    const sitka = new Sitka<AppModules>()
    sitka.register([new MiddlewareModuleExtended(), new MiddlewareModuleSecondExtended()])
    const store: Store = sitka.createStore() as Store

    const { Middleware_Module_Extended: child_1, Middleware_Module_Second_Extended: child_2 } = sitka.getModules()
    expect(store.getState().Middleware_Module_Extended).toBe('')
    expect(store.getState().Middleware_Module_Second_Extended).toBe('original_color')
    child_1.handleColor('blue')
    expect(store.getState().Middleware_Module_Extended).toBe('blue_middleware')
    expect(store.getState().Middleware_Module_Second_Extended).toBe('original_color')
    child_2.handleColor('red')
    expect(store.getState().Middleware_Module_Extended).toBe('blue_middleware')
    expect(store.getState().Middleware_Module_Second_Extended).toBe('red_middleware')
  })
})
