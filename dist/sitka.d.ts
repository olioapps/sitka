import { Action, Dispatch, Middleware, ReducersMapObject, Store } from "redux";
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
    protected createSubscription(actionTarget: string | Function, handler: Function): SagaMeta;
    provideMiddleware(): Middleware[];
    provideSubscriptions(): SagaMeta[];
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
export declare class Sitka<MODULES = {}> {
    private sagas;
    private reducersToCombine;
    private middlewareToAdd;
    protected registeredModules: MODULES;
    private dispatch?;
    constructor();
    setDispatch(dispatch: Dispatch): void;
    getModules(): MODULES;
    createSitkaMeta(): SitkaMeta;
    createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null;
    register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(instances: SITKA_MODULE[]): void;
    private getDefaultState;
    private createRoot;
    private doDispatch;
}
export declare const createAppStore: (intialState?: {}, reducersToCombine?: ReducersMapObject<any, Action<any>>[], middleware?: Middleware<{}, any, Dispatch<import("redux").AnyAction>>[], sagaRoot?: () => IterableIterator<{}>) => Store<any, import("redux").AnyAction>;
export {};
//# sourceMappingURL=sitka.d.ts.map