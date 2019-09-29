import { Action, Dispatch, Middleware, ReducersMapObject, Store, StoreEnhancer } from "redux";
import { CallEffectFn } from "redux-saga/effects";
export declare type SitkaModuleAction<T> = (Partial<T> & {
    type: string;
}) | Action;
declare type ModuleState = {} | undefined | null;
export declare abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
    modules: MODULES;
    abstract moduleName: string;
    reduxKey(): string;
    abstract defaultState?: MODULE_STATE;
    protected createAction(v: Partial<MODULE_STATE>): SitkaModuleAction<MODULE_STATE>;
    protected setState(state: MODULE_STATE): Action;
    protected resetState(): Action;
    protected createSubscription(actionTarget: string | Function, handler: CallEffectFn<any>): SagaMeta;
    provideMiddleware(): Middleware[];
    provideSubscriptions(): SagaMeta[];
    provideForks(): CallEffectFn<any>[];
    static callAsGenerator(fn: Function, ...rest: any[]): {};
}
export interface SagaMeta {
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
}
export declare class SitkaMeta {
    readonly defaultState: {};
    readonly middleware: Middleware[];
    readonly reducersToCombine: ReducersMapObject;
    readonly sagaRoot: (() => IterableIterator<{}>);
}
export declare type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;
export interface SitkaOptions {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
}
export declare class Sitka<MODULES = {}> {
    private sagas;
    private forks;
    private reducersToCombine;
    private middlewareToAdd;
    protected registeredModules: MODULES;
    private dispatch?;
    private sitkaOptions;
    constructor(sitkaOptions?: SitkaOptions);
    setDispatch(dispatch: Dispatch): void;
    getModules(): MODULES;
    createSitkaMeta(): SitkaMeta;
    createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null;
    register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(instances: SITKA_MODULE[]): void;
    private getDefaultState;
    private createRoot;
    private doDispatch;
}
export interface StoreOptions {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
}
export declare const createAppStore: (options: StoreOptions) => Store<any, import("redux").AnyAction>;
export {};
//# sourceMappingURL=sitka.d.ts.map