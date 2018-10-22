# Sitka Redux Module Manager

This library allows you to construct strongly typed APIs for managing your redux store. You can use it to package up related behavior into Typescript classes, which can be injected into your Redux store for easy access throughout your application.

The Sitka Redux package manager can be used in many different contexts, including React apps, Electron apps, and more. A canonical use of this library can be found in the Sitka Monorepo (https://github.com/olioapps/sitka-monorepo).

# Instantiating the module manager

Create an instance of the module manager using its constructor:

```typescript
const sitka = new Sitka<AppModules>()
```

The library needs to know the type of your modules, hence providing the type parameter `AppModules`; this will be used by your modules to recognize and invoke their peers.

You can register you modules via a simple register method on the sitka instance:

```typescript
sitka.register(
    [
        new ColorModule(),
    ]
)
```

# Example Sitka Redux Module

Sitka Redux Modules are plain Typescript classes which expose Redux Sagas as public methods. 
Here is a simple example, a module which tracks the `color` state in your redux state.

```typescript
import { AppModules } from "../../index"
import { put } from "redux-saga/effects"
import { SitkaModule } from "olio-sitka"

export type ColorState = string | null

export class ColorModule extends SitkaModule<ColorState, AppModules> {
    public moduleName: string = "color"
    public defaultState: ColorState = null

    public *handleColor(color: string): IterableIterator<{}> {
        yield put(this.setState(color))
    }
}
```

This simple module can be invoked via plain calls inside of your presentational components:

```typescript
sitka.handleColor("red")
```

Invoking `handleColor` will instruct the sitka package manager to dispatch an action which will call the generator function defined in `ColorModule`. The generator function can then produce futher effects, such as the `setState` function which will mutate the redux state tree for the piece of state idenfied by the `moduleName` class attribute. You can alternatively specify a different key to manage by overriding the `reduxKey()`.

# Using the Sikta Module Manager

The module manager can be used to integrate with an existing redux store, or to entire manage the store by itself. The simplest case is the latter, where the store shape and the API for mutating it is entirely managed by Sitka modules.

## Creating a Sitka managed store

```typescript
const sitka = new Sitka<AppModules>()
sitka.register([ 
    new ColorModule(),
])

const store = sitka.createStore()
```

This instance of the redux store can be injected into your application, for example using `react-redux`. Please see the section below for an example of how to use Sitka modules within a React application.

## Adding Sitka to a redux store

In the example below, we are using redux's `createStore` function to create a store. We provide for its arguments a merging of the reducers, sagas, and middleware returned from Sitka's `createSitkaMeta` function, with those you create normally. 

```typescript
// ask sitka for store-relevant pieces based on registered modules
const sitkaMeta = sitka.createSitkaMeta()

const initialState = {
    ...sitkaMeta.defaultState,
    // initial state for non-sitka managed modules
    { counter: 0 },
}

const reducersToCombine = [
    ...sitkaMeta.reducersToCombine,
    // reducers for non-sitka managed modules
    counter: (s = initialState.counter, a: { type: "INC" } ): number => a.type === "INC" : s + 1 : s    
]

// non-sitka generator function
function* incrementSaga(): IteratorIterable<{}> {
    yield put(() => { type: "INC" })
}

const middleware = [
    ...sitkaMeta.middleware,
    // middleware for non-sitka managed modules
    (store: MiddlewareAPI<Dispatch, {}>) => (next: Function) => (action: Action) => next(action)
]

function* sagaRoot(): IterableIterator<{}> {
    yield all[ yield takeEvery("HANDLE_INC", incrementSaga) ]
    yield call(sitkaMeta.sagaRoot)
}

const combinedMiddleware = [ createSagaMiddleware(), ...middleware ]

const store: Store = createStore(
    combineReducers(reducersToCombine.reduce((acc, r) => ({...acc, ...r}), {})),
    initialState,
    applyMiddleware(...combinedMiddleware),
)

// sitka needs a handle to the store's dispatch function
sitka.setDispatch(store.dispatch)

sagaMiddleware.run(sagaRoot)
```

The primary usecase for the above is to enhance a pre-exising redux store with sitka managed redux modules.

# Using Sitka managed redux modules

### Basic usage
After you create a Sitka managed or integrated store, you can begin to change its state by calling methods on the modules. For example:

```typescript
// create a sitka instance and register a module
const sitka = new Sitka<{readonly color: ColorModule}>()
sitka.register([ new ColorModule() ])

// create a wholly sitka-managed store
const store = sitka.createStore()

// print the current state of the store
console.log(store.getState())
// returns: { "color": null }

// invoke the color module, and
sitka.getModules().color.handleColor("red")
// print the current state of the store
console.log(store.getState())
// returns: { "color": "red" }
```

### React web usage
When `createStore` or `createSitkaMeta` is called on a Sitka instance, the instance itself is automatically added to the
redux store under the key `__sitka__` so it can be conveniently accessed. Redux connected components can access the instance
via that key, and invoke any of the methods available to the modules. As before, this will automatically dispatch that action.

In the entry point of your React app (usually `index.tsx` or `index.jsx`), create the Sitka-connected store, and pass it to
the rest of your app using `react-redux` connect:
```tsx
const store: Store = createCoreAppStore()

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root") as HTMLElement,
)
```

Inside of a connected Component, pull the Sitka instance out of the store, and expose it to click handlers: 
```tsx
interface ComponentProps {
    readonly color: ColorState
    readonly handleColor: (color: string) => void
}
class App extends React.Component<ComponentProps> {
    constructor(props: ComponentProps) {
        super(props)
    }

    public render(): JSX.Element {
        return (
            <div>
                <span>Color {this.props.color}</span>
                <button id="increment" onClick={() => this.props.handleColor("red")}>
                    Update color
                </button>
            </div>
        )
    }
}

export default connect(
    (state: AppState): ReduxState => ({
        color: state.color,
        handleColor: state.__sitka__.getModules().color.handleColor,
    })
    null,
)(App)

```