'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var cache = {};

var compute = {};

var transpile = {};

var __assign$1 = (commonjsGlobal && commonjsGlobal.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read$1 = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$1 = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(transpile, "__esModule", { value: true });
transpile.parseCode = transpile.transpileFunction = transpile.transpileWebGL = transpile.transpilePrimitive = transpile.transpileNative = void 0;
var parse = function (syntax, grammar) {
    var gate = function (e) {
        if (e instanceof Error
            || !(Array.isArray(e)
                || "N" in e)) {
            throw e;
        }
    };
    var errors = [];
    var P = function (N, I, S, PP, T) {
        var e_1, _a, e_2, _b;
        var match = false;
        var II = I;
        var R;
        if (PP.type === "string") {
            if (S.substring(0, PP.string.length) === PP.string) {
                R = PP.string;
                II = I + PP.string.length;
                match = true;
            }
        }
        if (PP.type === "regex") {
            var M = S.match(PP.regex);
            if (M) {
                R = M[0];
                II = I + M[0].length;
                match = true;
            }
        }
        if (PP.type === "alternate") {
            try {
                for (var _c = __values(PP.parsers), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var NN = _d.value;
                    try {
                        var result = P(NN, II, S, grammar[NN], __spreadArray$1(__spreadArray$1([], __read$1(T), false), [NN], false));
                        R = result.R;
                        II = result.I;
                        match = true;
                        break;
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        if (PP.type === "concat") {
            var results = [];
            try {
                for (var _e = __values(PP.parsers), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var NN = _f.value;
                    var result = P(NN, II, S.slice(II - I), grammar[NN], __spreadArray$1(__spreadArray$1([], __read$1(T), false), [NN], false));
                    II = result.I;
                    results.push(result.R);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            R = results;
            match = true;
        }
        if (PP.type === "iterate") {
            var results = [];
            if (PP.min !== 0) {
                for (var i = 0; i < PP.min; i++) {
                    var result = P(PP.parser, II, S.slice(II - I), grammar[PP.parser], __spreadArray$1(__spreadArray$1([], __read$1(T), false), [PP.parser], false));
                    II = result.I;
                    results.push(result.R);
                }
            }
            match = true;
            for (var k = 0; (PP.max === null || k < PP.max - PP.min); k++) {
                try {
                    var result = P(PP.parser, II, S.slice(II - I), grammar[PP.parser], __spreadArray$1(__spreadArray$1([], __read$1(T), false), [PP.parser], false));
                    II = result.I;
                    results.push(result.R);
                }
                catch (e) {
                    if (PP.max !== null) {
                        errors.push(e);
                    }
                    break;
                }
            }
            R = results;
        }
        if (R !== undefined && match) {
            return {
                R: PP.match !== undefined ? PP.match(R) : R,
                I: II,
            };
        }
        var error = {
            N: N,
            I: I,
            S: S,
            T: T,
        };
        errors.push(error);
        throw error;
    };
    try {
        return P("$", 0, syntax, grammar.$, ["$"]).R;
    }
    catch (e) {
        gate(e);
        var sorted = errors.sort(function (a, b) {
            return b.I - a.I;
        });
        var II_1 = sorted[0].I;
        var filter = sorted.filter(function (a) { return a.I === II_1; });
        var names = __spreadArray$1([], __read$1(new Set(filter
            .map(function (_a) {
            var N = _a.N;
            return N;
        })
            .filter(function (N) { return grammar[N].type === "string" || grammar[N].type === "regex"; })
            .map(function (N) { return "T_" + N.toUpperCase(); }))), false);
        throw new Error("Unexpected character " + JSON.stringify(syntax[II_1]) + ", expected " + names.join(" or ") + " instead at index " + II_1);
    }
};
function resolve(P) {
    return Object.keys(P).reduce(function (p, k) {
        var _a;
        return __assign$1(__assign$1({}, p), (_a = {}, _a[k] = typeof P[k] === "string" ? {
            type: "string",
            string: P[k],
        }
            : P[k] instanceof RegExp ? {
                type: "regex",
                regex: P[k],
            } : P[k], _a));
    }, {});
}
var is_vector = function (T) { return typeof T === "object" && T !== null; };
var spread = function (F, components) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (is_vector(args[0]) && components) {
            var clone_1 = __assign$1({}, args[0]);
            Object.keys(clone_1).forEach(function (k) {
                clone_1[k] = args.slice(1).reduce(function (p, c) {
                    return F(p, c[k]);
                }, args[0][k]);
            });
            return clone_1;
        }
        return args.slice(1).reduce(function (p, c) {
            return F(p, c);
        }, args[0]);
    };
};
var single = function (F) {
    return function (value) {
        if (is_vector(value)) {
            var clone_2 = __assign$1({}, value);
            Object.keys(clone_2).forEach(function (k) {
                clone_2[k] = F(clone_2[k]);
            });
            return clone_2;
        }
        return F(value);
    };
};
var length = function (value) {
    if (is_vector(value)) {
        var L_1 = 0;
        Object.keys(value).forEach(function (k) {
            L_1 += Math.pow(value[k], 2);
        });
        return Math.sqrt(L_1);
    }
    return Math.abs(value);
};
var normalize = function (value) {
    var L = length(value);
    if (is_vector(value)) {
        var clone_3 = __assign$1({}, value);
        Object.keys(clone_3).forEach(function (k) {
            clone_3[k] = clone_3 / L;
        });
        return clone_3;
    }
    return 1;
};
var distance = function (a, b) {
    if (is_vector(a)) {
        var L_2 = 0;
        Object.keys(a).forEach(function (k) {
            L_2 += Math.pow(a[k] - b[k], 2);
        });
        return Math.sqrt(L_2);
    }
    return Math.sqrt(Math.pow(a - b, 2));
};
function getCoord$1(i) {
    var coords = ["x", "y", "z", "w", "i"];
    if (i < coords.length) {
        return coords[i];
    }
    var last = coords.slice(-1)[0];
    return last + (coords.length - i + 1);
}
var vec = function (number) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var reduce = args.reduce(function (p, c) {
            return __spreadArray$1(__spreadArray$1([], __read$1(p), false), [typeof c === "object" ? Object.values(c) : c], false);
        }, []);
        var rest = reduce.length < number ? __spreadArray$1([], __read$1(Array(number - reduce.length)), false).map(function () { return reduce.length === 0 ? 0 : reduce[reduce.length - 1]; }) : [];
        var arr = __spreadArray$1([], __read$1(reduce), false).concat(rest).slice(0, number);
        var object = {};
        arr.forEach(function (_, i) {
            object[getCoord$1(i)] = arr[i];
        });
    };
};
var generateVecs = function () {
    return __assign$1({}, __spreadArray$1([], __read$1(Array(8)), false).reduce(function (p, c, i) {
        var _a;
        return __assign$1(__assign$1({}, p), (_a = {}, _a["vec" + (i + 1)] = vec(i + 1), _a["ivec" + (i + 1)] = vec(i + 1), _a));
    }, {}));
};
var calls = __assign$1({ not: function (value) { return !value; }, length: length, normalize: normalize, distance: distance, pow: function (left, right) { return Math.pow(left, right); }, exp: single(function (value) { return Math.exp(value); }), exp2: single(function (value) { return Math.pow(2, value); }), log: single(function (value) { return Math.log(value); }), log2: single(function (value) { return Math.log2(value); }), sqrt: single(function (value) { return Math.sqrt(value); }), floor: single(function (value) { return Math.floor(value); }), ceil: single(function (value) { return Math.floor(value); }), sin: single(function (value) { return Math.sin(value); }), cos: single(function (value) { return Math.cos(value); }), tan: single(function (value) { return Math.tan(value); }), asin: single(function (value) { return Math.asin(value); }), acos: single(function (value) { return Math.acos(value); }), atan: single(function (value) { return Math.atan(value); }), mult: spread(function (left, right) { return left * right; }, true), div: spread(function (left, right) { return left / right; }, true), mod: spread(function (left, right) { return left % right; }, true), plus: spread(function (left, right) { return left + right; }, true), minus: spread(function (left, right) { return left - right; }, true), lt: spread(function (left, right) { return left < right; }, false), lte: spread(function (left, right) { return left <= right; }, false), gt: spread(function (left, right) { return left > right; }, false), gte: spread(function (left, right) { return left >= right; }, false), eq: spread(function (left, right) { return left == right; }, false), neq: spread(function (left, right) { return left != right; }, false), and: spread(function (left, right) { return left && right; }, false), or: spread(function (left, right) { return left || right; }, false), float: function (value) { return +value; }, int: function (value) { return parseInt("" + value); } }, generateVecs());
var precedence = [
    "not",
    "pow",
    "mult",
    "div",
    "mod",
    "plus",
    "minus",
    "lt",
    "lte",
    "gt",
    "gte",
    "eq",
    "neq",
    "and",
    "or",
].reverse();
var unary = {
    "!": "not",
};
var binary = {
    "*": "mult",
    "&&": "and",
    "||": "or",
    "+": "plus",
    "-": "minus",
};
var double = {
    "==": "eq",
    "!=": "neq",
    ">": "gt",
    "<": "lt",
    ">=": "gte",
    "<=": "lte",
    "/": "div",
    "%": "mod",
    "^": "pow",
};
var reverse = function (object) { return Object.fromEntries(Object.entries(object).map(function (_a) {
    var _b = __read$1(_a, 2), k = _b[0], v = _b[1];
    return [v, k];
})); };
var r_unary = reverse(unary);
var r_binary = reverse(binary);
var r_double = reverse(double);
var arithmetic = function () {
    var result = resolve(__assign$1(__assign$1(__assign$1(__assign$1(__assign$1({ increment: "++", decrement: "--", arithmetic: {
            type: "concat",
            parsers: ["ternary"],
            match: function (R) {
                return R[0];
            },
        } }, r_unary), r_binary), r_double), { ternary: {
            type: "alternate",
            parsers: ["ternary_op", "increment_post"],
        }, ternary_op: {
            type: "concat",
            parsers: ["ws_opt", "increment_post", "ws_opt", "question", "ws_opt", "expression", "ws_opt", "colon", "ws_opt", "expression", "ws_opt"],
            match: function (R) {
                return {
                    type: "ternary",
                    condition: R[1],
                    success: R[5],
                    failure: R[9],
                };
            },
        }, increment_post: {
            type: "alternate",
            parsers: ["increment_post_op", "decrement_post"],
        }, increment_post_op: {
            type: "concat",
            parsers: ["ws_opt", "variable", "ws_opt", "increment", "ws_opt"],
            match: function (R) {
                return {
                    type: "call",
                    name: "increment_post",
                    arguments: [R[1]],
                };
            },
        }, decrement_post: {
            type: "alternate",
            parsers: ["decrement_post_op", "increment_pre"],
        }, decrement_post_op: {
            type: "concat",
            parsers: ["ws_opt", "variable", "ws_opt", "decrement", "ws_opt"],
            match: function (R) {
                return {
                    type: "call",
                    name: "decrement_post",
                    arguments: [R[1]],
                };
            },
        }, increment_pre: {
            type: "alternate",
            parsers: ["increment_pre_op", "decrement_pre"],
        }, increment_pre_op: {
            type: "concat",
            parsers: ["ws_opt", "increment", "ws_opt", "variable", "ws_opt"],
            match: function (R) {
                return {
                    type: "call",
                    name: "increment_pre",
                    arguments: [R[2]],
                };
            },
        }, decrement_pre: {
            type: "alternate",
            parsers: ["decrement_pre_op", [precedence[0] + "_arithmetic"]],
        }, decrement_pre_op: {
            type: "concat",
            parsers: ["ws_opt", "decrement", "ws_opt", "variable", "ws_opt"],
            match: function (R) {
                return {
                    type: "call",
                    name: "decrement_pre",
                    arguments: [R[2]],
                };
            },
        } }), precedence.reduce(function (p, k, i) {
        var next = i + 1 < precedence.length - 1 ? precedence[i + 1] + "_arithmetic" : "expression_fallback";
        var inject = {};
        if (k in r_unary) {
            inject[k + "_arithmetic"] = {
                type: "alternate",
                parsers: [k + "_op", next],
            };
            inject[k + "_op"] = {
                type: "concat",
                parsers: ["ws_opt", k, "ws_opt", "expression", "ws_opt"],
                match: function (R) {
                    return {
                        type: "call",
                        name: k,
                        arguments: [R[2]],
                    };
                },
            };
        }
        if (k in r_binary || k in r_double) {
            inject[k + "_arithmetic"] = {
                type: "concat",
                parsers: ["ws_opt", next, "ws_opt", k + "_opt", "ws_opt"],
                match: function (R) {
                    var left = R[1];
                    var right = R[3];
                    if (right === null) {
                        return left;
                    }
                    var merge = right.type === "call" && right.name === k && k in r_binary;
                    return {
                        type: "call",
                        name: k,
                        arguments: merge ? __spreadArray$1([left], __read$1(right.arguments), false) : [left, right],
                    };
                },
            };
            inject[k + "_op"] = {
                type: "concat",
                parsers: ["ws_opt", k, "ws_opt", k + "_arithmetic", "ws_opt"],
                match: function (R) {
                    return R[3];
                },
            };
            inject[k + "_opt"] = {
                type: "iterate",
                min: 0,
                max: 1,
                parser: k + "_op",
                match: function (R) {
                    return R.length === 0 ? null : R[0];
                },
            };
        }
        return __assign$1(__assign$1({}, p), inject);
    }, {})));
    return result;
};
var G = resolve(__assign$1({ ws: /^\s+/, ws_opt: /^\s*/, integer: /^[+-]?\d+/, float: /^[+-]?\d+\.\d+/, name: /^[a-z_][a-z0-9_]*/, scoped: /^([a-z_][a-z0-9_]*|(@[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)?))/, native: /^(f32|i8|i16|i32)/, primitive: /^(f32|i8|i16|i32|bool|vec[1-7]<(f32|i8|i16|i32)>)/, question: "?", if: "if", else: "else", for: "for", continue: "continue", break: "break", return: "return", true: "true", false: "false", comma: ",", colon: ":", semicolon: ";", plus: "+", minus: "-", div: "/", mod: "%", BO: "(", BC: ")", CBO: "{", CBC: "}", SBO: "[", SBC: "]", assign: "=", arrow: "=>", digit: {
        type: "regex",
        regex: /^\d+/,
        match: function (R) {
            return +R;
        },
    }, $: {
        type: "concat",
        parsers: ["script"],
        match: function (R) {
            return R[0];
        }
    }, script: {
        type: "concat",
        parsers: ["functions", "parameters", "ws_opt", "CBO", "declarations", "CBC", "ws_opt"],
        match: function (R) {
            return __assign$1({ type: "script", functions: R[0], declarations: R[4] }, R[1]);
        }
    }, functions: {
        type: "iterate",
        parser: "function",
        min: 0,
        max: null,
    }, function: {
        type: "concat",
        parsers: ["ws_opt", "value", "ws_opt", "BO", "ws_opt", "values_opt", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"],
        match: function (R) {
            return {
                type: "function",
                value: R[1],
                values: R[5],
                declarations: R[11],
            };
        }
    }, value: {
        type: "concat",
        parsers: ["ws_opt", "primitive", "ws", "name", "ws_opt"],
        match: function (R) {
            return {
                type: "value",
                primitive: R[1],
                name: R[3],
            };
        },
    }, value_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "ws_opt", "value", "ws_opt"],
        match: function (R) {
            return R[3];
        },
    }, value_commas: {
        type: "iterate",
        parser: "value_comma",
        min: 0,
        max: null,
    }, values: {
        type: "concat",
        parsers: ["ws_opt", "value", "ws_opt", "value_commas"],
        match: function (R) {
            return __spreadArray$1([R[1]], __read$1(R[3]), false);
        },
    }, values_opt: {
        type: "iterate",
        parser: "values",
        min: 0,
        max: 1,
        match: function (R) {
            return R.length === 0 ? [] : R[0];
        },
    }, boolean: {
        type: "alternate",
        parsers: ["true", "false"],
    }, expression_bracket: {
        type: "concat",
        parsers: ["ws_opt", "BO", "expression", "BC", "ws_opt"],
        match: function (R) {
            return R[2];
        },
    }, expression: {
        type: "alternate",
        parsers: ["expression_bracket", "arithmetic", "expression_fallback"],
    }, expression_fallback: {
        type: "alternate",
        parsers: ["call", "scalar", "variable"],
    }, call: {
        type: "concat",
        parsers: ["ws_opt", "scoped", "ws_opt", "BO", "ws_opt", "arguments_opt", "ws_opt", "BC", "ws_opt"],
        match: function (R) {
            return {
                type: "call",
                name: R[1],
                arguments: R[5],
            };
        }
    }, argument_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "ws_opt", "expression", "ws_opt"],
        match: function (R) {
            return R[3];
        },
    }, argument_commas: {
        type: "iterate",
        parser: "argument_comma",
        min: 0,
        max: null,
    }, arguments: {
        type: "concat",
        parsers: ["ws_opt", "expression", "ws_opt", "argument_commas"],
        match: function (R) {
            return __spreadArray$1([R[1]], __read$1(R[3]), false);
        },
    }, arguments_opt: {
        type: "iterate",
        parser: "arguments",
        min: 0,
        max: 1,
        match: function (R) {
            return R.length === 0 ? [] : R[0];
        },
    }, scalar: {
        type: "alternate",
        parsers: ["boolean", "float", "integer"],
        match: function (R) {
            return {
                type: "scalar",
                value: R,
            };
        }
    }, variable: {
        type: "concat",
        parsers: ["scoped"],
        match: function (R) {
            return {
                type: "variable",
                name: R[0],
            };
        }
    }, declarations: {
        type: "iterate",
        parser: "declaration",
        min: 0,
        max: null,
    }, for_expression: {
        type: "alternate",
        parsers: ["type_declaration", "assign_declaration", "for_declaration", "condition_declaration", "type_declaration"],
    }, assignable_semicolon: {
        type: "concat",
        parsers: ["ws_opt", "semicolon", "ws_opt", "assignable_declaration", "ws_opt"],
        match: function (R) {
            return R[3];
        },
    }, assignable_semicolons: {
        type: "iterate",
        parser: "assignable_semicolon",
        min: 0,
        max: null,
    }, assignables_semicolon: {
        type: "concat",
        parsers: ["ws_opt", "assignable_declaration", "assignable_semicolons", "ws_opt"],
        match: function (R) {
            return __spreadArray$1([R[1]], __read$1(R[2]), false);
        },
    }, declaration: {
        type: "alternate",
        parsers: ["keyword_declaration", "for_declaration", "condition_declaration", "assignable_declaration_semicolon"],
    }, for_declaration: {
        type: "concat",
        parsers: ["ws_opt", "for", "ws_opt", "BO", "ws_opt", "assignables_semicolon", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"],
        match: function (R) {
            return {
                type: "for",
                assignables: R[5],
                declarations: R[11],
            };
        }
    }, condition_declaration: {
        type: "concat",
        parsers: ["if_declaration", "else_if_conditions_opt", "else_condition_opt"],
        match: function (R) {
            return {
                type: "condition",
                if: R[0],
                elseif: R[1],
                else: R[2],
            };
        }
    }, if_declaration: {
        type: "concat",
        parsers: ["ws_opt", "if", "ws_opt", "BO", "ws_opt", "expression", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"],
        match: function (R) {
            return {
                type: "if",
                condition: R[5],
                declarations: R[11],
            };
        }
    }, else_if_declaration: {
        type: "concat",
        parsers: ["ws_opt", "else", "ws_opt", "if_declaration"],
        match: function (R) {
            return R[3];
        }
    }, else_declaration: {
        type: "concat",
        parsers: ["ws_opt", "else", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"],
        match: function (R) {
            return {
                type: "else",
                declarations: R[5],
            };
        }
    }, else_condition_opt: {
        type: "iterate",
        parser: "else_declaration",
        min: 0,
        max: 1,
        match: function (R) {
            return R.length === 0 ? null : R[0];
        }
    }, else_if_conditions_opt: {
        type: "iterate",
        parser: "else_if_declaration",
        min: 0,
        max: null,
    }, regular: {
        type: "alternate",
        parsers: ["break", "continue"],
    }, keyword_declaration: {
        type: "alternate",
        parsers: ["regular_keyword_declaration", "return_keyword_declaration"],
    }, regular_keyword_declaration: {
        type: "concat",
        parsers: ["ws_opt", "regular", "ws_opt", "semicolon", "ws_opt"],
        match: function (R) {
            return {
                type: "keyword",
                keyword: R[1],
                expression: null,
            };
        }
    }, return_keyword_declaration: {
        type: "concat",
        parsers: ["ws_opt", "return", "ws", "expression_opt", "ws_opt", "semicolon", "ws_opt"],
        match: function (R) {
            return {
                type: "keyword",
                keyword: R[1],
                expression: R[3],
            };
        }
    }, expression_opt: {
        type: "iterate",
        parser: "expression",
        min: 0,
        max: 1,
        match: function (R) {
            return R.length === 0 ? null : R[0];
        }
    }, type_declaration: {
        type: "concat",
        parsers: ["ws_opt", "primitive", "assign_declaration"],
        match: function (R) {
            return {
                type: "type",
                primitive: R[1],
                assign: R[2],
            };
        }
    }, assign_declaration: {
        type: "concat",
        parsers: ["ws_opt", "name", "ws_opt", "assign", "ws_opt", "expression", "ws_opt"],
        match: function (R) {
            return {
                type: "assign",
                name: R[1],
                expression: R[5],
            };
        }
    }, assignable_declaration: {
        type: "alternate",
        parsers: ["assign_declaration", "type_declaration", "expression"],
    }, assignable_declaration_semicolon: {
        type: "concat",
        parsers: ["assignable_declaration", "ws_opt", "semicolon", "ws_opt"],
        match: function (R) {
            return R[0];
        }
    }, digit_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "digit", "ws_opt"],
        match: function (R) {
            return R[3];
        },
    }, digit_commas: {
        type: "iterate",
        parser: "digit_comma",
        min: 0,
        max: null,
    }, dimensions: {
        type: "concat",
        parsers: ["SBO", "ws_opt", "digit", "digit_commas", "ws_opt", "SBC"],
        match: function (R) {
            return __spreadArray$1([R[2]], __read$1(R[3]), false);
        },
    }, rank: {
        type: "concat",
        parsers: ["BO", "ws_opt", "digit", "ws_opt", "BC"],
        match: function (R) {
            return R[2];
        },
    }, dimensions_or_rank: {
        type: "alternate",
        parsers: ["rank", "dimensions"],
    }, input_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "input", "ws_opt"],
        match: function (R) {
            return R[3];
        },
    }, input_commas: {
        type: "iterate",
        parser: "input_comma",
        min: 0,
        max: null,
    }, input: {
        type: "concat",
        parsers: ["ws_opt", "native", "dimensions_or_rank", "ws_opt", "name", "ws_opt"],
        match: function (R) {
            return {
                type: "input",
                name: R[4],
                native: R[1],
                dimensions: R[2],
            };
        },
    }, parameters: {
        type: "concat",
        parsers: ["ws_opt", "native", "dimensions_or_rank", "ws_opt", "BO", "ws_opt", "input", "input_commas", "ws_opt", "BC", "ws_opt"],
        match: function (R) {
            return {
                inputs: __spreadArray$1([R[6]], __read$1(R[7]), false),
                native: R[1],
                dimensions: R[2],
            };
        },
    } }, arithmetic()));
function transpileNative(native) {
    return native === "f32" ? Float32Array
        : native === "i8" ? Int8Array
            : native === "i16" ? Int16Array
                : native === "i32" ? Int32Array
                    : Int8Array;
}
transpile.transpileNative = transpileNative;
function transpilePrimitive(primitive) {
    return primitive.startsWith("f") ? "float"
        : primitive.startsWith("i") ? "int"
            : primitive.startsWith("bool") ? "bool"
                : primitive.startsWith("vec") ? (primitive.match(/f32/) ? "" : "i") + primitive.slice(0, primitive.indexOf("<") - 1)
                    : primitive;
}
transpile.transpilePrimitive = transpilePrimitive;
function transpileWebGL(input, F) {
    if (F === void 0) { F = []; }
    var tab = "    ";
    var lines = function (L, level) {
        if (L.length === 0) {
            return "";
        }
        return "\n" + tab.repeat(level)
            + L.join("\n" + tab.repeat(level))
            + "\n" + tab.repeat(level <= 0 ? 0 : level - 1);
    };
    var T = function (D, semicolon, level) {
        if (semicolon === void 0) { semicolon = false; }
        if (level === void 0) { level = 0; }
        if (Array.isArray(D)) {
            return lines(D.map(function (DD) { return T(DD, true, level); }), level);
        }
        if (D.type === "assign") {
            return D.name + " = " + T(D.expression, false) + (semicolon ? ";" : "");
        }
        if (D.type === "value") {
            return transpilePrimitive(D.primitive) + " " + D.name;
        }
        if (D.type === "type") {
            return transpilePrimitive(D.primitive) + " " + T(D.assign, false) + (semicolon ? ";" : "");
        }
        if (D.type === "keyword") {
            return "" + D.keyword + (D.expression === null ? "" : " " + T(D.expression)) + (semicolon ? ";" : "");
        }
        if (D.type === "scalar") {
            return D.value;
        }
        if (D.type === "variable") {
            return D.name.replace("@", "$").replace(".", "_");
        }
        if (D.type === "ternary") {
            return T(D.condition, false, level) + " ? " + T(D.success, false, level) + " : " + T(D.failure, false, level);
        }
        if (D.type === "call") {
            if (["increment_post", "increment_pre", "decrement_post", "decrement_pre"].includes(D.name)) {
                var name_1 = D.arguments[0].name;
                return "" + (D.name === "increment_pre" ? "++" : D.name === "decrement_pre" ? "--" : "") + name_1 + (D.name === "increment_post" ? "++" : D.name === "decrement_post" ? "--" : "");
            }
            if (D.name in r_unary) {
                return "" + r_unary[D.name] + T(D.arguments[0], false, level);
            }
            if (D.name in r_binary) {
                return "(" + D.arguments.map(function (DD) { return T(DD, false, level); }).join(" " + r_binary[D.name] + " ") + ")";
            }
            if (D.name in r_double && D.name !== "mod") {
                return "(" + D.arguments.map(function (DD) { return T(DD, false, level); }).join(" " + r_double[D.name] + " ") + ")";
            }
            return (F.includes(D.name) ? "__user_" : "")
                + D.name.replace("@", "$").replace(".", "_")
                + "("
                + D.arguments.map(function (DD) { return T(DD, false, level); }).join(", ")
                + ")";
        }
        if (D.type === "function") {
            return "(" + D.values.map(function (DD) { return T(DD, false, level); }).join(", ") + ") {" + T(D.declarations, true, level + 1) + "}";
        }
        if (D.type === "for") {
            var name_2 = D.assignables[0].assign.name;
            return "for (" + D.assignables.map(function (DD, i) { return i === 1 ? name_2 + " < 8388608" : T(DD, false, level); }).join("; ") + ") {\n" + tab.repeat(level + 1) + "if (!(" + T(D.assignables[1], false, level + 1) + ")) {\n" + tab.repeat(level + 2) + "break;\n" + tab.repeat(level + 1) + "}" + (D.declarations.length === 0 ? "\n" + tab.repeat(level + 1) : "") + T(D.declarations, true, level + 1) + "}";
        }
        if (D.type === "condition") {
            return "" + T(D.if, false, level + 1) + D.elseif.map(function (DD) { return T(DD, true, level + 1); }).join("\n") + (D.else === null ? "" : T(D.else, false, level + 1));
        }
        if (D.type === "if") {
            return (semicolon ? " else " : "") + "if (" + T(D.condition, false, level) + ") {" + T(D.declarations, true, level + 1) + "}";
        }
        if (D.type === "else") {
            return " else {" + T(D.declarations, true, level + 1) + "}";
        }
        return "";
    };
    return T(input, true);
}
transpile.transpileWebGL = transpileWebGL;
function transpileFunction(declarations, F) {
    if (F === void 0) { F = []; }
    var result;
    var break_symbol = Symbol("break");
    var continue_symbol = Symbol("continue");
    var return_symbol = Symbol("return");
    var T = function (D, scope, map, functions) {
        var e_3, _a, e_4, _b;
        if (Array.isArray(D)) {
            try {
                for (var D_1 = __values(D), D_1_1 = D_1.next(); !D_1_1.done; D_1_1 = D_1.next()) {
                    var DD = D_1_1.value;
                    var result_1 = T(DD, scope, map, functions);
                    if (typeof result_1 === "symbol") {
                        return result_1;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (D_1_1 && !D_1_1.done && (_a = D_1.return)) _a.call(D_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return;
        }
        if (D.type === "keyword") {
            if (D.keyword === "break") {
                return break_symbol;
            }
            if (D.keyword === "continue") {
                return continue_symbol;
            }
            result = D.expression === null ? null : T(D.expression, scope, map, functions);
            return return_symbol;
        }
        if (D.type === "type") {
            scope[D.assign.name] = [D.primitive, null];
            T(D.assign, scope, map, functions);
            return;
        }
        if (D.type === "assign") {
            var result_2 = T(D.expression, scope, map, functions);
            var type = scope[D.name][0];
            result_2 = type.startsWith("f") ? +result_2
                : type.startsWith("i") ? parseInt("" + result_2)
                    : type.startsWith("bool") ? !!result_2
                        : result_2;
            scope[D.name][1] = result_2;
            return;
        }
        if (D.type === "scalar") {
            if (D.value === "true" || D.value === "false") {
                return D.value === "true";
            }
            return +D.value;
        }
        if (D.type === "variable") {
            if (D.name.startsWith("@") || D.name === "thread") {
                var name_3 = D.name.replace("@", "$").replace(".", "_");
                return map[name_3];
            }
            return +scope[D.name][1];
        }
        if (D.type === "ternary") {
            return T(D.condition, scope, map, functions)
                ? T(D.success, scope, map, functions)
                : T(D.failure, scope, map, functions);
        }
        if (D.type === "call") {
            if (["increment_post", "increment_pre", "decrement_post", "decrement_pre"].includes(D.name)) {
                var name_4 = D.arguments[0].name;
                var V = scope[name_4];
                if (D.name.startsWith("increment")) {
                    scope[name_4]++;
                }
                if (D.name.startsWith("decrement")) {
                    scope[name_4]--;
                }
                if (D.name.endsWith("_post")) {
                    return V;
                }
                return scope[name_4];
            }
            var C = F.includes(D.name) ? functions[D.name] : calls[D.name];
            if (D.name.startsWith("@")) {
                var name_5 = D.name.replace("@", "$").replace(".", "_");
                C = map[name_5];
            }
            return C.apply(void 0, __spreadArray$1([], __read$1(D.arguments.map(function (A) { return T(A, scope, map, functions); })), false));
        }
        if (D.type === "for") {
            var first = D.assignables[0];
            var condition = D.assignables[1];
            var every = D.assignables[2];
            T(first, scope, map, functions);
            while (true) {
                var success = T(condition, scope, map, functions);
                if (!success) {
                    break;
                }
                var result_3 = T(D.declarations, scope, map, functions);
                if (typeof result_3 === "symbol") {
                    if (result_3 === break_symbol) {
                        break;
                    }
                    if (result_3 === continue_symbol) {
                        continue;
                    }
                    return result_3;
                }
                T(every, scope, map, functions);
            }
        }
        if (D.type === "condition") {
            var if_success = T(D.if.condition, scope, map, functions);
            if (if_success) {
                return T(D.if.declarations, scope, map, functions);
            }
            try {
                for (var _c = __values(D.elseif), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var elseif = _d.value;
                    var elseif_success = T(elseif.condition, scope, map, functions);
                    if (elseif_success) {
                        return T(elseif.declarations, scope, map, functions);
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
            if (D.else !== null) {
                return T(D.else.declarations, scope, map, functions);
            }
        }
    };
    return function (map, functions) {
        T(declarations, {}, map, functions);
        return result;
    };
}
transpile.transpileFunction = transpileFunction;
function parseCode(code) {
    return parse(code, G);
}
transpile.parseCode = parseCode;

var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
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
var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(compute, "__esModule", { value: true });
compute.logShaderSourceAndInfoLog = void 0;
var transpile_1 = transpile;
var littleEndian = (function machineIsLittleEndian() {
    var uint8Array = new Uint8Array([0xaa, 0xbb]);
    var uint16array = new Uint16Array(uint8Array.buffer);
    return uint16array[0] === 0xbbaa;
})();
function rightPad(a, size) {
    if (size <= a.length) {
        return a;
    }
    return a + " ".repeat(size - a.length);
}
var lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
    var lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
    if (lineNumberRegexResult == null) {
        console.log("Couldn't parse line number in error: " + shaderInfoLog);
        console.log(shaderSource);
        return;
    }
    var lineNumber = +lineNumberRegexResult[1];
    var shaderLines = shaderSource.split("\n");
    var pad = shaderLines.length.toString().length + 2;
    var linesWithLineNumbers = shaderLines.map(function (line, LN) { return rightPad((LN + 1).toString(), pad) + line; });
    var maxLineLength = 0;
    for (var i = 0; i < linesWithLineNumbers.length; i++) {
        maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
    }
    var beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
    var errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
    var afterErrorLines = linesWithLineNumbers.slice(lineNumber);
    console.log(beforeErrorLines.join("\n"));
    console.log(shaderInfoLog.split("\n")[0]);
    console.log("%c " + rightPad(errorLine[0], maxLineLength), "border:1px solid red; background-color:#e3d2d2; color:#a61717");
    console.log(afterErrorLines.join("\n"));
}
compute.logShaderSourceAndInfoLog = logShaderSourceAndInfoLog;
function createShader(gl, type, source) {
    var shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    if (shader === null) {
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    logShaderSourceAndInfoLog(source, gl.getShaderInfoLog(shader) + "");
    gl.deleteShader(shader);
    return null;
}
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    if (program === null) {
        return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
}
function initializeContext() {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl");
    return gl;
}
function bindProgram(gl, program, tensor) {
    var width = (tensor.width * 4) / tensor.bytes;
    var height = (tensor.height * 4) / tensor.bytes;
    var positionBuffer = gl.createBuffer();
    gl.canvas.width = width;
    gl.canvas.height = height;
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var littleEndianLocation = gl.getUniformLocation(program, "littleEndian");
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1i(littleEndianLocation, littleEndian ? 1 : 0);
}
function readContext(gl) {
    var canvas = gl.canvas;
    var pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}
function getCoord(i) {
    var coords = ["x", "y", "z", "w", "i"];
    if (i < coords.length) {
        return coords[i];
    }
    var last = coords.slice(-1)[0];
    return last + (coords.length - i + 1);
}
function generateStructs(count) {
    var structs = [];
    __spreadArray([], __read(Array(count)), false).forEach(function (_, i) {
        if (i >= 1 && i <= 3) {
            return;
        }
        structs.push("struct ivec" + (i + 1) + " {" + __spreadArray([], __read(Array(i + 1)), false).map(function (__, ii) {
            return "int " + getCoord(ii);
        })
            .join("; ") + ";}");
    });
    return structs;
}
function convertPixels(pixels, tensor) {
    if (tensor.constructor === Float32Array) {
        return new Float32Array(pixels.buffer);
    }
    if (tensor.constructor === Int8Array || tensor.constructor === Uint8Array) {
        return new tensor.constructor(tensor.length).map(function (value, i) {
            return pixels[i * 4 + 3];
        });
    }
    if (tensor.constructor === Int16Array || tensor.constructor === Uint16Array) {
        return new tensor.constructor(tensor.length).map(function (value, i) {
            var a = pixels[i * 4 + 3];
            var b = pixels[i * 4 + 2];
            return a + (b << 8);
        });
    }
    if (tensor.constructor === Int32Array || tensor.constructor === Uint32Array) {
        return new tensor.constructor(tensor.length).map(function (value, i) {
            var a = pixels[i * 4 + 3];
            var b = pixels[i * 4 + 2];
            var g = pixels[i * 4 + 1];
            var r = pixels[i * 4];
            return a + (b << 8) + (g << 16) + (r << 16);
        });
    }
    return new tensor.constructor(pixels.buffer);
}
function uploadShape(gl, program, name, tensor) {
    var widthLocation = gl.getUniformLocation(program, "u_" + name + "_width");
    var heightLocation = gl.getUniformLocation(program, "u_" + name + "_height");
    gl.uniform1i(widthLocation, tensor.width);
    gl.uniform1i(heightLocation, tensor.height);
    tensor.shape.forEach(function (v, i) {
        var dimLocation = gl.getUniformLocation(program, "u_" + name + "_shape." + getCoord(i));
        var strideLocation = gl.getUniformLocation(program, "u_" + name + "_strides." + getCoord(i));
        gl.uniform1i(dimLocation, v);
        gl.uniform1i(strideLocation, tensor.strides[i]);
    });
}
function initializeTensor(gl, program, name, index) {
    var location = gl.getUniformLocation(program, "u_" + name);
    gl.activeTexture(gl.TEXTURE0 + index);
    var texture = gl.createTexture();
    if (texture === null) {
        return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(location, index);
    return texture;
}
function uploadTensor(gl, program, texture, name, index, data, tensor) {
    console.log("tensor", tensor);
    uploadShape(gl, program, name, tensor);
    var length = tensor.width * tensor.height * 4;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var d = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, 0, length);
    if (d.length < length) {
        d = new Uint8Array(length).map(function (_, i) {
            if (i < d.length) {
                return d[i];
            }
            return 0;
        });
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tensor.width, tensor.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
}
function tensorShader(name, constructor, rank) {
    var meta = Compute.tensor(constructor, __spreadArray([], __read(Array(rank)), false).map(function () { return 1; }));
    var uniforms = [];
    var functions = [];
    uniforms.push("uniform sampler2D u_" + name);
    uniforms.push("uniform int u_" + name + "_width");
    uniforms.push("uniform int u_" + name + "_height");
    uniforms.push("uniform ivec" + rank + " u_" + name + "_shape");
    uniforms.push("uniform ivec" + rank + " u_" + name + "_strides");
    functions.push("\n    " + meta.shader + " " + name + "SampleIndex(int index) {\n      int d = " + meta.bytes + ";\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      vec4 color = colorIndex(index, u_" + name + ", d, u_" + name + "_width, u_" + name + "_height);\n      return " + (meta.shader === "float"
        ? "rgbaToFloat(color)"
        : meta.precision === "high"
            ? "rgbaToHighInt(color)"
            : meta.precision === "medium"
                ? "rgbaToMediumInt(color, z)"
                : "rgbaToLowInt(color, z)") + ";\n    }");
    functions.push("\n    " + meta.shader + " " + name + "SampleCoords(ivec" + rank + " coords) {\n      return " + name + "SampleIndex(" + name + "CoordsToIndex(coords));\n    }");
    functions.push("\n    int " + name + "CoordsToIndex(ivec" + rank + " coords) {\n      return coordsToIndex(coords, u_" + name + "_strides);\n    }");
    functions.push("\n    ivec" + rank + " " + name + "IndexToCoords(int index) {\n      return indexToCoords(index, u_" + name + "_strides);\n    }");
    functions.push("\n    vec4 colorIndex(int index, sampler2D texture, int d, int width, int height) {\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      int w = width;\n      int h = height;\n      int y = i / w;\n      int x = i - y * w;\n      vec2 uv = vec2((float(x) + 0.5) / float(w), (float(y) + 0.5) / float(h));\n      vec4 color = texture2D(texture, uv);\n      return color;\n    }");
    functions.push("\n    vec4 colorCoords(ivec" + rank + " coords, ivec" + rank + " strides, sampler2D texture, int d, int width, int height) {\n      int index = coordsToIndex(coords, strides);\n      return colorIndex(index, texture, d, width, height);\n    }");
    functions.push("\n    int coordsToIndex(ivec" + rank + " coords, ivec" + rank + " strides) {\n      if (" + rank + " == 1) {\n        return coords." + getCoord(0) + ";\n      }\n      int index = 0;\n      " + meta.shape.map(function (_, i) {
        return "index += coords." + getCoord(i) + " * strides." + getCoord(i) + ";";
    }).join("\n      ") + "\n      return index;\n    }");
    functions.push("\n    ivec" + rank + " indexToCoords(int index, ivec" + rank + " strides) {\n      " + (rank === 1
        ? "return ivec" + rank + "(index);"
        : "ivec" + rank + " coords = ivec" + rank + "(" + meta.shape.map(function () { return "0"; }).join(", ") + ");\n      int rest = index;\n      int div = 0;\n      " + meta.shape.map(function (_, i) {
            return "div = int(rest / strides." + getCoord(i) + ");\n      rest -= div * strides." + getCoord(i) + ";\n      coords." + getCoord(i) + " = div;";
        }).join("\n      ") + "\n      return coords;") + "\n    }");
    return { uniforms: uniforms, functions: functions };
}
function getCoords(tensor, index) {
    var vector = {};
    var rest = index;
    for (var i = 0; i < tensor.shape.length; i++) {
        var div = Math.floor(rest / tensor.strides[i]);
        rest -= div * tensor.strides[i];
        vector[getCoord(i)] = div;
    }
    return vector;
}
function getIndex(tensor, coords) {
    if (tensor.length === 1) {
        return coords.x;
    }
    var index = 0;
    for (var i = 0; i < tensor.length; i++) {
        var c = coords[getCoord(i)];
        index += c * tensor.strides[i];
    }
    return index;
}
function tensorMethods(name, value, tensor, thread) {
    var T = {};
    T["$" + name] = value[thread];
    T["$" + name + "__coords"] = getCoords(tensor, thread);
    T["$" + name + "__access_coords"] = function (coords) { return value[getIndex(tensor, coords)]; };
    T["$" + name + "__access_index"] = function (index) { return value[index]; };
    T["$" + name + "__index_coords"] = function (index) { return getCoords(tensor, index); };
    T["$" + name + "__coords_index"] = function (coords) { return getIndex(tensor, coords); };
    return T;
}
var Compute = (function () {
    function Compute() {
        this.code = "return float(thread);";
        this.context = null;
        this.program = null;
        this.vertex = null;
        this.fragment = null;
        this.textures = [];
        this.functions = {};
        this.ranks = {};
        this.values = {};
        this.result = {
            constructor: Float32Array,
            precision: "high",
            native: "float",
            typed: "float",
            shader: "float",
            bytes: 4,
            rank: 0,
            length: 0,
            width: 0,
            height: 0,
            strides: [],
            shape: [],
        };
        this.closure = function () { return 0; };
    }
    Compute.Transpile = function (string) {
        return this.transpile(string.raw[0]);
    };
    Compute.transpile = function (code) {
        var compute = new Compute();
        var script = (0, transpile_1.parseCode)(code);
        script.inputs.forEach(function (_a) {
            var name = _a.name, native = _a.native, dimensions = _a.dimensions;
            compute.input(name, (0, transpile_1.transpileNative)(native), dimensions);
        });
        compute.output((0, transpile_1.transpileNative)(script.native), script.dimensions);
        var functions = {};
        var F = script.functions.map(function (F) { return F.value.name; });
        script.functions.forEach(function (definition) {
            var value = definition.value, values = definition.values, declarations = definition.declarations;
            compute.function("__user_" + value.name, (0, transpile_1.transpilePrimitive)(value.primitive), (0, transpile_1.transpileWebGL)(definition, F));
            var closure = (0, transpile_1.transpileFunction)(declarations, F);
            functions[value.name] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var map = {};
                args.forEach(function (arg, i) {
                    map[values[i].name] = arg;
                });
                return closure(map, functions);
            };
        });
        var cpu = (0, transpile_1.transpileFunction)(script.declarations, F);
        compute.cpu(function (map) { return cpu(map, functions); });
        compute.gpu((0, transpile_1.transpileWebGL)(script.declarations, F));
        return compute;
    };
    Compute.tensor = function (type, shape) {
        var C = type.constructor;
        if ("name" in type &&
            typeof type.name === "string" &&
            type.name.endsWith("Array")) {
            C = type;
        }
        var constructor = C;
        var typed = constructor === Int8Array
            ? "int8"
            : constructor === Uint8Array
                ? "uint8"
                : constructor === Int16Array
                    ? "int16"
                    : constructor === Uint16Array
                        ? "uint16"
                        : constructor === Int32Array
                            ? "int32"
                            : constructor === Uint32Array
                                ? "uint32"
                                : "float";
        var native = constructor === Int8Array ||
            constructor === Int16Array ||
            constructor === Int32Array
            ? "int"
            : constructor === Uint8Array ||
                constructor === Uint16Array ||
                constructor === Uint32Array
                ? "uint"
                : "float";
        var precision = constructor === Int8Array || constructor === Uint8Array
            ? "low"
            : constructor === Int16Array || constructor === Uint16Array
                ? "medium"
                : "high";
        var bytes = precision === "low" ? 1 : precision === "medium" ? 2 : 4;
        var shader = native === "float" ? "float" : "int";
        var length = shape.reduce(function (p, c) { return p * c; }, 1);
        var l = Math.ceil(length / (4 / bytes));
        var width = Math.floor(Math.sqrt(l));
        var height = Math.ceil(l / width);
        var strides = [];
        for (var i = shape.length - 1; i >= 0; i--) {
            var prev = strides[i + 1];
            var L = i === shape.length - 1 ? 1 : shape[i + 1];
            prev = prev === undefined ? 1 : prev;
            strides[i] = L * prev;
        }
        return {
            constructor: constructor,
            typed: typed,
            native: native,
            precision: precision,
            shader: shader,
            rank: shape.length,
            bytes: bytes,
            shape: shape,
            length: length,
            width: width,
            height: height,
            strides: strides,
        };
    };
    Compute.prototype.function = function (name, result, code) {
        this.functions[name] = { result: result, code: code };
        return this;
    };
    Compute.prototype.output = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var type = this.result.constructor;
        var shape = this.result.shape;
        var _a = __read(args, 2), first = _a[0], last = _a[1];
        if (args.length === 2) {
            type = first;
            shape = last;
        }
        else {
            if (ArrayBuffer.isView(first) || (typeof first === "function")) {
                type = first;
            }
            else {
                shape = first;
            }
        }
        this.result = Compute.tensor(type, Array.isArray(shape) ? shape : __spreadArray([], __read(Array(shape)), false).map(function () { return 1; }));
        return this;
    };
    Compute.prototype.input = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var type = this.result.constructor;
        var shape = this.result.shape;
        var _a = __read(args, 3), name = _a[0], first = _a[1], last = _a[2];
        if (args.length === 3) {
            if (ArrayBuffer.isView(first) || (typeof first === "function")) {
                type = first;
                shape = last;
            }
            else {
                shape = first;
                type = last;
            }
        }
        else {
            if (ArrayBuffer.isView(first) || (typeof first === "function")) {
                type = first;
            }
            else {
                shape = first;
            }
        }
        var tensor = Compute.tensor(type, Array.isArray(shape) ? shape : __spreadArray([], __read(Array(shape)), false).map(function () { return 1; }));
        var rank = typeof shape === "number" ? shape : shape.length;
        this.ranks[name] = {
            constructor: tensor.constructor,
            rank: rank,
        };
        if (typeof type === "object") {
            this.values[name] = { data: type, shape: tensor.shape };
        }
        return this;
    };
    Compute.prototype.cpu = function (closure) {
        this.closure = closure;
        return this;
    };
    Compute.prototype.gpu = function (code) {
        this.code = this.parse(code);
        try {
            return this.compile();
        }
        catch (e) {
            return this;
        }
    };
    Compute.prototype.run = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.runtime, runtime = _c === void 0 ? "fastest" : _c, _d = _b.threshold, threshold = _d === void 0 ? 4096 : _d, _e = _b.safe, safe = _e === void 0 ? true : _e;
        try {
            if (runtime === "gpu") {
                return this.run_gpu();
            }
            if (runtime === "cpu") {
                return this.run_cpu();
            }
            if (runtime === "fallback") {
                try {
                    return this.run_gpu();
                }
                catch (e) {
                    return this.run_cpu();
                }
            }
            var T_1 = threshold || 10;
            var fastest_1 = "cpu";
            Object.keys(this.values).forEach(function (name) {
                var _a = _this.values[name], data = _a.data, shape = _a.shape;
                var tensor = Compute.tensor(data, shape);
                if (tensor.length * tensor.bytes > T_1) {
                    fastest_1 = "gpu";
                }
            });
            if (this.result.length * this.result.bytes > T_1) {
                fastest_1 = "gpu";
            }
            var func = ("run_" + fastest_1);
            try {
                return this[func]();
            }
            catch (e) {
                return this[("run_" + (fastest_1 === "gpu" ? "cpu" : "gpu"))]();
            }
        }
        catch (e) {
            if (safe !== false) {
                return new this.result.constructor(this.result.length);
            }
            throw e;
        }
    };
    Compute.prototype.run_gpu = function () {
        var _this = this;
        var context = this.context;
        var program = this.program;
        var vertex = this.vertex;
        var fragment = this.fragment;
        if (context && program && vertex && fragment) {
            bindProgram(context, program, this.result);
            Object.keys(this.ranks).forEach(function (name, index) {
                if (!_this.values.hasOwnProperty(name)) {
                    return;
                }
                var _a = _this.values[name], data = _a.data, shape = _a.shape;
                var tensor = Compute.tensor(data, shape);
                var texture = _this.textures[index];
                uploadTensor(context, program, texture, name, index, data, tensor);
            });
            context.bufferData(context.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), context.STATIC_DRAW);
            context.drawArrays(context.TRIANGLES, 0, 6);
            var pixels = readContext(context);
            var converted = convertPixels(pixels, this.result);
            return converted;
        }
        return new this.result.constructor(this.result.shape.reduce(function (p, c) { return p * c; }, 1));
    };
    Compute.prototype.run_cpu = function () {
        var _this = this;
        var threads = this.result.length;
        var array = new this.result.constructor(threads);
        return array.map(function (_, i) {
            var map = { thread: i };
            Object.keys(_this.ranks).forEach(function (name, index) {
                var _a = _this.values[name], data = _a.data, shape = _a.shape;
                var tensor = Compute.tensor(data, shape);
                map = __assign(__assign({}, map), tensorMethods(name, data, tensor, i));
            });
            return _this.closure(map);
        });
    };
    Compute.prototype.compile = function () {
        var _this = this;
        var uniforms = [];
        var functions = [];
        var headers = [];
        var structs = generateStructs(6);
        Object.keys(this.ranks).forEach(function (name, i) {
            var _a = _this.ranks[name], constructor = _a.constructor, rank = _a.rank;
            var result = tensorShader(name, constructor, rank);
            result.uniforms.forEach(function (u) {
                var uu = u.trim();
                if (!uniforms.includes(uu)) {
                    uniforms.push(uu);
                }
            });
            result.functions.forEach(function (f) {
                var ff = f.trim();
                if (!functions.includes(ff)) {
                    var first = ff.substring(0, ff.indexOf("\n"));
                    var h = first.slice(0, -2);
                    functions.push(ff);
                    headers.push(h);
                }
            });
        });
        var vertexShaderCode = "\n      attribute vec2 a_position;\n      void main() {\n        vec2 zeroToTwo = a_position * 2.0;\n        vec2 clipSpace = zeroToTwo - 1.0;\n\n        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n      }\n    ";
        var type = this.result;
        var fragmentShaderCode = "\n    precision mediump float;\n    uniform vec2 u_resolution;\n    uniform bool littleEndian;\n\n    " + structs.join(";\n    ") + ";\n\n    " + uniforms.join(";\n    ") + ";\n\n    const vec2 halfV = vec2(0.5, 0.5);\n\n    " + type.shader + " userCode(int thread);\n    vec4 getColor(int thread);\n    " + headers.join(";\n    ") + ";\n    " + Object.keys(this.functions).map(function (name) {
            var ff = _this.functions[name].code.trim();
            var first = ff.substring(0, ff.indexOf("\n"));
            var h = first.slice(0, -2);
            return _this.functions[name].result + " " + h;
        }).join(";\n    ") + (Object.keys(this.functions).length !== 0 ? ";" : "") + "\n    vec4 lowIntToRgba(int result);\n    vec4 mediumIntToRgba(int result);\n    vec4 highIntToRgba(int result);\n    int rgbaToHighInt(vec4 color);\n    int rgbaToMediumInt(vec4 color, int z);\n    int rgbaToLowInt(vec4 color, int z);\n    float shiftRight(float v, float amt);\n    float shiftLeft(float v, float amt);\n    float maskLast(float v, float bits);\n    float extractBits(float num, float from, float to);\n    vec4 floatToRgba(float texelFloat);\n    ivec4 floatsToBytes(vec4 inputFloats);\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]);\n    float getExponent(bool bits[32]);\n    float getMantissa(bool bits[32], bool subnormal);\n    float bitsToFloat(bool bits[32]);\n    float rgbaToFloat(vec4 texelRGBA);\n    int imod(int x, int y);\n    int mod(int x, int y);\n    int idiv(int a, int b, float sign);\n\n    void main() {\n      vec2 resolution = u_resolution;\n      float size = resolution.x * resolution.y;\n      float width = resolution.x;\n      vec2 uv = gl_FragCoord.xy - halfV;\n      float x = uv.x;\n      float y = uv.y;\n      float thread = (x + y * width);\n      float normalized_thread = thread / (255.0 * size);\n      gl_FragColor = getColor(int(thread));\n    }\n    " + Object.keys(this.functions).map(function (name) {
            return _this.functions[name].result + " " + name + _this.functions[name].code;
        }).join("\n    ") + "\n\n    " + type.shader + " userCode(int thread) {\n      " + this.code + "\n    }\n    vec4 getColor(int thread) {\n      " + type.shader + " result = userCode(thread);\n      return " + (type.shader === "float"
            ? "floatToRgba(result)"
            : type.precision === "low"
                ? "lowIntToRgba(result)"
                : type.precision === "medium"
                    ? "mediumIntToRgba(result)"
                    : "highIntToRgba(result)") + ";\n    }\n    " + functions.join("\n    ") + "\n    vec4 lowIntToRgba(int result) {\n      return vec4(0.0, 0.0, 0.0, float(result)) / 255.0;\n    }\n    vec4 mediumIntToRgba(int result) {\n      return vec4(\n        0.0,\n        0.0,\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    vec4 highIntToRgba(int result) {\n      return vec4(\n        extractBits(float(result), 24.0, 32.0),\n        extractBits(float(result), 16.0, 24.0),\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    int rgbaToHighInt(vec4 color) {\n      return int(color.a)\n        + int(color.b * 255.0 * 255.0)\n        + int(color.g * 255.0 * 255.0 * 255.0)\n        + int(color.r * 255.0 * 255.0 * 255.0 * 255.0);\n    }\n    int rgbaToMediumInt(vec4 color, int z) {\n      float a = z == 0 ? color.a : color.g;\n      float b = z == 0 ? color.b : color.r;\n      return int(a * 255.0)\n        + int(b * 255.0 * 255.0);\n    }\n    int rgbaToLowInt(vec4 color, int z) {\n      float a = z == 0 ? color.r : z == 1 ? color.g : z == 2 ? color.b : color.a;\n      return int(a * 255.0);\n    }\n    float shiftRight(float v, float amt) {\n      v = floor(v) + 0.5;\n      return floor(v / exp2(amt));\n    }\n    float shiftLeft(float v, float amt) {\n        return floor(v * exp2(amt) + 0.5);\n    }\n    float maskLast(float v, float bits) {\n        return mod(v, shiftLeft(1.0, bits));\n    }\n    float extractBits(float num, float from, float to) {\n        from = floor(from + 0.5); to = floor(to + 0.5);\n        return maskLast(shiftRight(num, from), to - from);\n    }\n    vec4 floatToRgba(float texelFloat) {\n        if (texelFloat == 0.0) return vec4(0, 0, 0, 0);\n        float sign = texelFloat > 0.0 ? 0.0 : 1.0;\n        texelFloat = abs(texelFloat);\n        float exponent = floor(log2(texelFloat));\n        float biased_exponent = exponent + 127.0;\n        float fraction = ((texelFloat / exp2(exponent)) - 1.0) * 8388608.0;\n        float t = biased_exponent / 2.0;\n        float last_bit_of_biased_exponent = fract(t) * 2.0;\n        float remaining_bits_of_biased_exponent = floor(t);\n        float byte4 = extractBits(fraction, 0.0, 8.0) / 255.0;\n        float byte3 = extractBits(fraction, 8.0, 16.0) / 255.0;\n        float byte2 = (last_bit_of_biased_exponent * 128.0 + extractBits(fraction, 16.0, 23.0)) / 255.0;\n        float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;\n        return (\n          littleEndian\n          ? vec4(byte4, byte3, byte2, byte1)\n          : vec4(byte1, byte2, byte3, byte4)\n        );\n    }\n    ivec4 floatsToBytes(vec4 inputFloats) {\n      ivec4 bytes = ivec4(inputFloats * 255.0);\n      return (\n        littleEndian\n        ? bytes.abgr\n        : bytes\n      );\n    }\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]) {\n      for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {\n        float acc = float(bytes[channelIndex]);\n        for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {\n          float powerOfTwo = exp2(float(indexInByte));\n          bool bit = acc >= powerOfTwo;\n          bits[channelIndex * 8 + (7 - indexInByte)] = bit;\n          acc = mod(acc, powerOfTwo);\n        }\n      }\n    }\n    float getExponent(bool bits[32]) {\n      const int startIndex = 1;\n      const int bitStringLength = 8;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = 0.0;\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float getMantissa(bool bits[32], bool subnormal) {\n      const int startIndex = 9;\n      const int bitStringLength = 23;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = float(!subnormal) * exp2(float(bitStringLength));\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float bitsToFloat(bool bits[32]) {\n      float signBit = float(bits[0]) * -2.0 + 1.0;\n      float exponent = getExponent(bits);\n      bool subnormal = abs(exponent - 0.0) < 0.01;\n      float mantissa = getMantissa(bits, subnormal);\n      float exponentBias = 127.0;\n      return signBit * mantissa * exp2(exponent - exponentBias - 23.0);\n    }\n    float rgbaToFloat(vec4 texelRGBA) {\n      ivec4 rgbaBytes = floatsToBytes(texelRGBA);\n      bool bits[32];\n      bytesToBits(rgbaBytes, bits);\n      return bitsToFloat(bits);\n    }\n    int imod(int x, int y) {\n      return x - y * (x / y);\n    }\n    int mod(int x, int y) {\n      return imod(x, y);\n    }\n    int idiv(int a, int b, float sign) {\n      int res = a / b;\n      int mod = imod(a, b);\n      if (sign < 0. && mod != 0) {\n        res -= 1;\n      }\n      return res;\n    }\n    ";
        this.context = initializeContext();
        if (this.context === null) {
            throw Error("WebGL context cannot be created");
        }
        this.vertex = createShader(this.context, "vertex", vertexShaderCode);
        this.fragment = createShader(this.context, "fragment", fragmentShaderCode);
        if (this.vertex === null) {
            throw Error("WebGL vertex shader cannot be created");
        }
        if (this.fragment === null) {
            throw Error("WebGL fragment shader cannot be created");
        }
        this.program = createProgram(this.context, this.vertex, this.fragment);
        if (this.program === null) {
            throw Error("WebGL program cannot be created");
        }
        var context = this.context;
        var program = this.program;
        bindProgram(this.context, this.program, this.result);
        Object.keys(this.ranks).forEach(function (name, index) {
            _this.textures[index] = initializeTensor(context, program, name, index);
            if (_this.textures[index] === null) {
                throw Error("WebGL texture #" + index + " cannot be created");
            }
        });
        return this;
    };
    Compute.prototype.parse = function (shader) {
        var syntax = shader;
        Object.keys(this.ranks).forEach(function (key) {
            var valueRegex = new RegExp("(\\$" + key + ")", "g");
            var coordsRegex = new RegExp("(\\$" + key + "__coords)", "g");
            var indexAccessRegex = new RegExp("(\\$" + key + "__access_index)", "g");
            var coordsAccessRegex = new RegExp("(\\$" + key + "__access_coords)", "g");
            var indexCoordsRegex = new RegExp("(\\$" + key + "__index_coords)", "g");
            var coordsIndexRegex = new RegExp("(\\$" + key + "__coords_index)", "g");
            syntax = syntax.replace(indexCoordsRegex, key + "IndexToCoords");
            syntax = syntax.replace(coordsIndexRegex, key + "CoordsToIndex");
            syntax = syntax.replace(coordsAccessRegex, key + "SampleCoords");
            syntax = syntax.replace(indexAccessRegex, key + "SampleIndex");
            syntax = syntax.replace(coordsRegex, key + "IndexToCoords(thread)");
            syntax = syntax.replace(valueRegex, key + "SampleIndex(thread)");
        });
        return syntax;
    };
    return Compute;
}());
compute.default = Compute;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Transpile = void 0;
	var compute_1 = compute;
	Object.defineProperty(exports, "Transpile", { enumerable: true, get: function () { return compute_1.Transpile; } });
	exports.default = compute_1.default;
	
} (cache));

var index = /*@__PURE__*/getDefaultExportFromCjs(cache);

module.exports = index;
//# sourceMappingURL=compute.js.map
