'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
exports.Vue = vue_1.default;
var vue_class_component_1 = require("vue-class-component");
exports.Component = vue_class_component_1.default;
vue_class_component_1.default.registerHooks([
    'beforeRouteEnter',
    'beforeRouteLeave',
    'asyncData',
    'fetch',
    'head',
    'middleware',
    'layout',
    'transition',
    'scrollToTop',
    'validate'
]);
// const Component = require('nuxt-class-component');
// const { createDecorator } = require('nuxt-class-component');
require("reflect-metadata");
/**
 * decorator of an inject
 * @param key key
 * @return PropertyDecorator
 */
function Inject(key) {
    return vue_class_component_1.createDecorator(function (componentOptions, k) {
        if (typeof componentOptions.inject === 'undefined') {
            componentOptions.inject = {};
        }
        if (!Array.isArray(componentOptions.inject)) {
            componentOptions.inject[k] = key || k;
        }
    });
}
exports.Inject = Inject;
/**
 * decorator of a provide
 * @param key key
 * @return PropertyDecorator | void
 */
function Provide(key) {
    return vue_class_component_1.createDecorator(function (componentOptions, k) {
        var provide = componentOptions.provide;
        if (typeof provide !== 'function' || !provide.managed) {
            var original_1 = componentOptions.provide;
            provide = componentOptions.provide = function () {
                var rv = Object.create((typeof original_1 === 'function' ? original_1.call(this) : original_1) || null);
                for (var i in provide.managed)
                    rv[provide.managed[i]] = this[i];
                return rv;
            };
            provide.managed = {};
        }
        provide.managed[k] = key || k;
    });
}
exports.Provide = Provide;
/**
 * decorator of model
 * @param  event event name
 * @return PropertyDecorator
 */
function Model(event, options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        if (!Array.isArray(options) && typeof options.type === 'undefined') {
            options.type = Reflect.getMetadata('design:type', target, key);
        }
        vue_class_component_1.createDecorator(function (componentOptions, k) {
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
            componentOptions.model = { prop: k, event: event || k };
        })(target, key);
    };
}
exports.Model = Model;
/**
 * decorator of a prop
 * @param  options the options for the prop
 * @return PropertyDecorator | void
 */
function Prop(options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        if (!Array.isArray(options) && typeof options.type === 'undefined') {
            options.type = Reflect.getMetadata('design:type', target, key);
        }
        vue_class_component_1.createDecorator(function (componentOptions, k) {
            (componentOptions.props || (componentOptions.props = {}))[k] = options;
        })(target, key);
    };
}
exports.Prop = Prop;
/**
 * decorator of a watch function
 * @param  path the path or the expression to observe
 * @param  WatchOption
 * @return MethodDecorator
 */
function Watch(path, options) {
    if (options === void 0) { options = {}; }
    var _a = options.deep, deep = _a === void 0 ? false : _a, _b = options.immediate, immediate = _b === void 0 ? false : _b;
    return vue_class_component_1.createDecorator(function (componentOptions, handler) {
        if (typeof componentOptions.watch !== 'object') {
            componentOptions.watch = Object.create(null);
        }
        componentOptions.watch[path] = { handler: handler, deep: deep, immediate: immediate };
    });
}
exports.Watch = Watch;
// Code copied from Vue/src/shared/util.js
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = function (str) { return str.replace(hyphenateRE, '-$1').toLowerCase(); };
/**
 * decorator of an event-emitter function
 * @param  event The name of the event
 * @return MethodDecorator
 */
function Emit(event) {
    return function (target, key, descriptor) {
        key = hyphenate(key);
        var original = descriptor.value;
        descriptor.value = function emitter() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (false !== original.apply(this, args))
                this.$emit.apply(this, [event || key].concat(args));
        };
    };
}
exports.Emit = Emit;
/**
 * decorator of $off
 * @param event The name of the event
 * @param method The name of the method
 */
function Off(event, method) {
    return function (target, key, descriptor) {
        key = hyphenate(key);
        var original = descriptor.value;
        descriptor.value = function offer() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (original.apply(this, args) !== false) {
                if (method) {
                    if (typeof this[method] === 'function') {
                        this.$off(event || key, this[method]);
                    }
                    else {
                        throw new TypeError('must be a method name');
                    }
                }
                else if (event) {
                    this.$off(event || key);
                }
                else {
                    this.$off();
                }
            }
        };
    };
}
exports.Off = Off;
/**
 * decorator of $on
 * @param event The name of the event
 */
function On(event) {
    return vue_class_component_1.createDecorator(function (componentOptions, k) {
        var key = hyphenate(k);
        if (typeof componentOptions.created !== 'function') {
            componentOptions.created = function () { };
        }
        var original = componentOptions.created;
        componentOptions.created = function () {
            original();
            if (typeof componentOptions.methods !== 'undefined') {
                this.$on(event || key, componentOptions.methods[k]);
            }
        };
    });
}
exports.On = On;
/**
 * decorator of $once
 * @param event The name of the event
 */
function Once(event) {
    return vue_class_component_1.createDecorator(function (componentOptions, k) {
        var key = hyphenate(k);
        if (typeof componentOptions.created !== 'function') {
            componentOptions.created = function () { };
        }
        var original = componentOptions.created;
        componentOptions.created = function () {
            original();
            if (typeof componentOptions.methods !== 'undefined') {
                this.$once(event || key, componentOptions.methods[k]);
            }
        };
    });
}
exports.Once = Once;
/**
 * decorator of $nextTick
 *
 * @export
 * @param {string} method
 * @returns {MethodDecorator}
 */
function NextTick(method) {
    return function (target, key, descriptor) {
        var original = descriptor.value;
        descriptor.value = function emitter() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (original.apply(this, args) !== false)
                if (typeof this[method] === 'function') {
                    this.$nextTick(this[method]);
                }
                else {
                    throw new TypeError('must be a method name');
                }
        };
    };
}
exports.NextTick = NextTick;
