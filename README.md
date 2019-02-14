# Sitka Redux Module Manager

This library allows you to construct strongly typed APIs for managing your Redux store. You can use it to package up related behavior into Typescript classes, which can be injected into your Redux store for easy access throughout your application.

The Sitka Redux package manager can be used in many different contexts, including React apps, Electron apps, and more. A canonical use of this library can be found in https://github.com/frankmeza/sitka-counter-ts, a simple counter app illustrating how Sitka can be used in a React Web app.

The Sitka Monorepo (https://github.com/olioapps/sitka-monorepo) also illustrates how you can use Sitka inside larger Redux based apps.

## Whats a Sitka Redux Module?

A Sitka Redux Module refers to the logical grouping of a region of Redux store state and the operations which can change it. Mutators of state are typically reducers and sagas, which are triggered by action creators.

Sitka makes it possible to define and manage a piece of the Redux store conveniently, organizing all the responsibilities described above into a single Typescript class.

## Instantiating the module manager

Create an instance of the module manager using its constructor:

```typescript
const sitka = new Sitka<AppModules>()
```

The library needs to know the type of your modules, hence providing the type parameter `AppModules`; this will be used by your modules to recognize and invoke their peers.

You can register you modules via a simple register method on the sitka instance:

```typescript
sitka.register([
    new ColorModule(),
])
```

## Example Sitka Redux Module

Sitka Redux Modules are plain Typescript classes which expose Redux Sagas as public methods. 
Here is a simple example, a module which tracks the `color` state in your Redux state.

```typescript
import { AppModules } from "../../index"
import { put } from "Redux-saga/effects"
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

Invoking `handleColor` will instruct the sitka package manager to dispatch an action which will call the generator function defined in `ColorModule`. The generator function can then produce futher effects, such as the `setState` function which will mutate the Redux state tree for the piece of state idenfied by the `moduleName` class attribute. You can alternatively specify a different key to manage by overriding the `reduxKey()`.

Any Sitka module generator function whose name is prefixed with `handle` will be wrapped in an action and can be invoked directly from client code such as React components.

## Using the Sikta Module Manager

The module manager can be used to integrate with an existing Redux store, or to entire manage the store by itself. The simplest case is the latter, where the store shape and the API for mutating it is entirely managed by Sitka modules.

### Creating a Sitka managed store

```typescript
const sitka = new Sitka<AppModules>()
sitka.register([ 
    new ColorModule(),
])

const store = sitka.createStore()
```

This instance of the Redux store can be injected into your application, for example using `react-Redux`. Please see the section below for an example of how to use Sitka modules within a React application.

### Adding Sitka to a Redux store
See the wiki (https://github.com/olioapps/sitka/wiki/Adding-Sitka-to-a-Redux-store) for an example of how to integrate Sitka with an existing Redux storer.

## Using Sitka managed Redux modules

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
Using Sitka modules inside React applications is easy! Check out https://github.com/olioapps/sitka/wiki/React-web-usage for an example. You can also head over to https://github.com/frankmeza/sitka-counter-ts for an example of a simple repo using Sitka modules.
