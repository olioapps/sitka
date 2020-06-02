"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var redux_logger_1 = require("redux-logger");
var redux_saga_1 = __importDefault(require("redux-saga"));
var effects_1 = require("redux-saga/effects");
var createStateChangeKey = function (module) { return ("module_" + module + "_change_state").toUpperCase(); };
var createHandlerKey = function (module, handler) { return ("module_" + module + "_" + handler).toUpperCase(); };
var handlerOriginalFunctionMap = new Map();
var SitkaModule = /** @class */ (function () {
    function SitkaModule() {
        this.getState = this.getState.bind(this);
        this.mergeState = this.mergeState.bind(this);
    }
    // by default, the redux key is same as the moduleName
    SitkaModule.prototype.reduxKey = function () {
        return this.moduleName;
    };
    SitkaModule.prototype.createAction = function (v, usePayload) {
        var _a, _b;
        var type = createStateChangeKey(this.reduxKey());
        if (!v) {
            return _a = { type: type }, _a[type] = null, _a;
        }
        if (typeof v !== "object") {
            return _b = { type: type }, _b[type] = v, _b;
        }
        else {
            if (usePayload) {
                return {
                    type: type,
                    payload: v,
                };
            }
            return Object.assign({ type: type }, v);
        }
    };
    SitkaModule.prototype.setState = function (state, replace) {
        return this.createAction(state, replace);
    };
    SitkaModule.prototype.resetState = function () {
        return this.setState(this.defaultState);
    };
    SitkaModule.prototype.getState = function (state) {
        return state[this.reduxKey()];
    };
    SitkaModule.prototype.mergeState = function (partialState) {
        var currentState, newState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, effects_1.select(this.getState)];
                case 1:
                    currentState = _a.sent();
                    newState = __assign({}, currentState, partialState);
                    return [4 /*yield*/, effects_1.put(this.setState(newState))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    // can be either the action type string, or the module function to watch
    SitkaModule.prototype.createSubscription = function (actionTarget, handler) {
        if (typeof actionTarget === "string") {
            return {
                name: actionTarget,
                handler: handler,
                direct: true,
            };
        }
        else {
            var generatorContext = handlerOriginalFunctionMap.get(actionTarget);
            return {
                name: generatorContext.handlerKey,
                handler: handler,
                direct: true,
            };
        }
    };
    SitkaModule.prototype.provideMiddleware = function () {
        return [];
    };
    SitkaModule.prototype.provideSubscriptions = function () {
        return [];
    };
    SitkaModule.prototype.provideForks = function () {
        return [];
    };
    SitkaModule.callAsGenerator = function (fn) {
        var _i, generatorContext;
        var rest = [];
        for (_i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    generatorContext = handlerOriginalFunctionMap.get(fn);
                    return [4 /*yield*/, effects_1.apply(generatorContext.context, generatorContext.fn, rest)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    };
    return SitkaModule;
}());
exports.SitkaModule = SitkaModule;
// tslint:disable-next-line:max-classes-per-file
var SitkaMeta = /** @class */ (function () {
    function SitkaMeta() {
    }
    return SitkaMeta;
}());
exports.SitkaMeta = SitkaMeta;
// tslint:disable-next-line:max-classes-per-file
var Sitka = /** @class */ (function () {
    function Sitka(sitkaOptions) {
        // tslint:disable-next-line:no-any
        this.sagas = [];
        this.forks = [];
        // tslint:disable-next-line:no-any
        this.reducersToCombine = {};
        this.middlewareToAdd = [];
        this.sitkaOptions = sitkaOptions;
        this.doDispatch = this.doDispatch.bind(this);
        this.createStore = this.createStore.bind(this);
        this.createRoot = this.createRoot.bind(this);
        this.registeredModules = {};
    }
    Sitka.prototype.setDispatch = function (dispatch) {
        this.dispatch = dispatch;
    };
    Sitka.prototype.getModules = function () {
        return this.registeredModules;
    };
    Sitka.prototype.createSitkaMeta = function () {
        // by default, we include sitka object in the meta
        var includeSitka = 
        // if no options
        !this.sitkaOptions
            // if options were provided, but sitkaInStore is not defined
            || this.sitkaOptions.sitkaInState === undefined
            // if sitkaInStore is defined, and its not explicitly set to don't include
            || this.sitkaOptions.sitkaInState !== false;
        var includeLogging = !!this.sitkaOptions && this.sitkaOptions.log === true;
        var logger = redux_logger_1.createLogger({
            stateTransformer: function (state) { return state; },
        });
        var sagaRoot = this.createRoot();
        return {
            defaultState: includeSitka
                ? __assign({}, this.getDefaultState(), { __sitka__: this }) : __assign({}, this.getDefaultState()),
            middleware: includeLogging ? this.middlewareToAdd.concat([logger]) : this.middlewareToAdd,
            reducersToCombine: includeSitka
                ? __assign({}, this.reducersToCombine, { __sitka__: function (state) {
                        if (state === void 0) { state = null; }
                        return state;
                    } }) : __assign({}, this.reducersToCombine),
            sagaRoot: sagaRoot,
            sagaProvider: function () {
                var middleware = redux_saga_1.default();
                return {
                    middleware: middleware,
                    activate: function () {
                        middleware.run(sagaRoot);
                    }
                };
            },
        };
    };
    Sitka.prototype.createStore = function (appstoreCreator) {
        if (!!appstoreCreator) {
            var store = appstoreCreator(this.createSitkaMeta());
            this.dispatch = store.dispatch;
            return store;
        }
        else {
            // use own appstore creator
            var meta = this.createSitkaMeta();
            var store = exports.createAppStore({
                initialState: meta.defaultState,
                reducersToCombine: [meta.reducersToCombine],
                middleware: meta.middleware,
                sagaRoot: meta.sagaRoot,
                log: this.sitkaOptions && this.sitkaOptions.log === true,
            });
            this.dispatch = store.dispatch;
            return store;
        }
    };
    Sitka.prototype.register = function (instances) {
        var _this = this;
        instances.forEach(function (instance) {
            var methodNames = getInstanceMethodNames(instance, Object.prototype);
            var handlers = methodNames.filter(function (m) { return m.indexOf("handle") === 0; });
            var moduleName = instance.moduleName;
            var _a = _this, middlewareToAdd = _a.middlewareToAdd, sagas = _a.sagas, forks = _a.forks, reducersToCombine = _a.reducersToCombine, dispatch = _a.doDispatch;
            instance.modules = _this.getModules();
            middlewareToAdd.push.apply(middlewareToAdd, instance.provideMiddleware());
            instance.provideForks().forEach(function (f) {
                forks.push(f.bind(instance));
            });
            handlers.forEach(function (s) {
                // tslint:disable:ban-types
                var original = instance[s]; // tslint:disable:no-any
                var handlerKey = createHandlerKey(moduleName, s);
                function patched() {
                    var args = arguments;
                    var action = {
                        _args: args,
                        _moduleId: moduleName,
                        type: handlerKey,
                    };
                    dispatch(action);
                }
                sagas.push({
                    handler: original,
                    name: createHandlerKey(moduleName, s),
                });
                // tslint:disable-next-line:no-any
                instance[s] = patched;
                handlerOriginalFunctionMap.set(patched, {
                    handlerKey: handlerKey,
                    fn: original,
                    context: instance,
                });
            });
            if (instance.defaultState !== undefined) {
                // create reducer
                var reduxKey = instance.reduxKey();
                var defaultState_1 = instance.defaultState;
                var actionType_1 = createStateChangeKey(reduxKey);
                reducersToCombine[reduxKey] = function (state, action) {
                    if (state === void 0) { state = defaultState_1; }
                    if (action.type !== actionType_1) {
                        return state;
                    }
                    var type = createStateChangeKey(moduleName);
                    var payload = action.payload;
                    if (!!payload) {
                        return payload;
                    }
                    var newState = Object.keys(action)
                        .filter(function (k) { return k !== "type"; })
                        .reduce(function (acc, k) {
                        var _a, _b;
                        var val = action[k];
                        if (k === type) {
                            return val;
                        }
                        if (val === null || typeof val === "undefined") {
                            return Object.assign(acc, (_a = {},
                                _a[k] = null,
                                _a));
                        }
                        return Object.assign(acc, (_b = {},
                            _b[k] = val,
                            _b));
                    }, Object.assign({}, state));
                    return newState;
                };
            }
            _this.registeredModules[moduleName] = instance;
        });
        // do subscribers after all has been registered
        instances.forEach(function (instance) {
            var sagas = _this.sagas;
            var subscribers = instance.provideSubscriptions();
            sagas.push.apply(sagas, subscribers);
        });
    };
    Sitka.prototype.getDefaultState = function () {
        var modules = this.getModules();
        return Object.keys(modules)
            .map(function (k) { return modules[k]; })
            .reduce(function (acc, m) {
            var _a;
            return (__assign({}, acc, (_a = {}, _a[m.moduleName] = m.defaultState, _a)));
        }, {});
    };
    Sitka.prototype.createRoot = function () {
        var _a = this, sagas = _a.sagas, forks = _a.forks, registeredModules = _a.registeredModules;
        function root() {
            var toYield, _loop_1, i, i, f, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toYield = [];
                        _loop_1 = function (i) {
                            var s, item, generator, item;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        s = sagas[i];
                                        if (!s.direct) return [3 /*break*/, 2];
                                        return [4 /*yield*/, effects_1.takeEvery(s.name, s.handler)];
                                    case 1:
                                        item = _a.sent();
                                        toYield.push(item);
                                        return [3 /*break*/, 4];
                                    case 2:
                                        generator = function (action) {
                                            var instance;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        instance = registeredModules[action._moduleId];
                                                        return [4 /*yield*/, effects_1.apply(instance, s.handler, action._args)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        return [4 /*yield*/, effects_1.takeEvery(s.name, generator)];
                                    case 3:
                                        item = _a.sent();
                                        toYield.push(item);
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < sagas.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // forks
                        for (i = 0; i < forks.length; i++) {
                            f = forks[i];
                            item = effects_1.fork(f);
                            toYield.push(item);
                        }
                        /* tslint:enable */
                        return [4 /*yield*/, effects_1.all(toYield)];
                    case 5:
                        /* tslint:enable */
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        return root;
    };
    Sitka.prototype.doDispatch = function (action) {
        var dispatch = this.dispatch;
        if (!!dispatch) {
            dispatch(action);
        }
        else {
            alert("no dispatch");
        }
    };
    return Sitka;
}());
exports.Sitka = Sitka;
exports.createAppStore = function (options) {
    var _a = options.initialState, initialState = _a === void 0 ? {} : _a, _b = options.reducersToCombine, reducersToCombine = _b === void 0 ? [] : _b, _c = options.middleware, middleware = _c === void 0 ? [] : _c, sagaRoot = options.sagaRoot, _d = options.log, log = _d === void 0 ? false : _d, _e = options.storeEnhancers, storeEnhancers = _e === void 0 ? [] : _e;
    var logger = redux_logger_1.createLogger({
        stateTransformer: function (state) { return state; },
    });
    var sagaMiddleware = redux_saga_1.default();
    var commonMiddleware = log
        ? [sagaMiddleware, logger] : [sagaMiddleware];
    var appReducer = reducersToCombine.reduce(function (acc, r) { return (__assign({}, acc, r)); }, {});
    var combinedMiddleware = commonMiddleware.concat(middleware);
    var store = redux_1.createStore(redux_1.combineReducers(appReducer), initialState, redux_1.compose.apply(void 0, storeEnhancers.concat([redux_1.applyMiddleware.apply(void 0, combinedMiddleware)])));
    if (sagaRoot) {
        sagaMiddleware.run(sagaRoot);
    }
    return store;
};
var hasMethod = function (obj, name) {
    var desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
var getInstanceMethodNames = function (obj, stop) {
    var array = [];
    var proto = Object.getPrototypeOf(obj);
    while (proto && proto !== stop) {
        Object.getOwnPropertyNames(proto).forEach(function (name) {
            if (name !== "constructor") {
                if (hasMethod(proto, name)) {
                    array.push(name);
                }
            }
        });
        proto = Object.getPrototypeOf(proto);
    }
    return array;
};
//# sourceMappingURL=sitka.js.map