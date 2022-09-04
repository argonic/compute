type IGrammar = {
    [s: string]: IParser;
};
type IGrammarUnresolved = {
    [s: string]: IParserUnresolved;
};
type IResolve<G extends IGrammarUnresolved> = {
    [P in keyof G]: G[P] extends IParser ? G[P] : G[P] extends string ? {
        type: "string";
        string: G[P];
    } : {
        type: "regex";
        regex: G[P];
    };
};
type IParser = IString | IRegex | IConcat | IAlternate | IIterate;
type IParserUnresolved = string | RegExp | IParser;
type IString = {
    type: "string";
    string: string;
    match?(result: any): any;
};
type IRegex = {
    type: "regex";
    regex: RegExp;
    match?(result: any): any;
};
type IConcat = {
    type: "concat";
    parsers: string[];
    match?(result: any): any;
}
type IAlternate = {
    type: "alternate";
    parsers: string[];
    match?(result: any): any;
}
type IIterate = {
    type: "iterate";
    min: number;
    max: number | null;
    parser: string;
    match?(result: any): any;
}
const parse = (syntax: string, grammar: IGrammar) => {
    const gate = (e: any) => {
        if (
            e instanceof Error
            || !(
                Array.isArray(e)
                || "N" in e
            )
        ) {
            throw e;
        }
    };
    let errors: Array<{ N: string, I: number, S: string, T: string[] }> = [];
    const P = (N: string, I: number, S: string, PP: IParser, T: string[]): any => {
        let match = false;
        let II = I;
        let R;
        if (PP.type === "string") {
            if (S.substring(0, PP.string.length) === PP.string) {
                R = PP.string;
                II = I + PP.string.length;
                match = true;
            }
        }
        if (PP.type === "regex") {
            const M = S.match(PP.regex);
            if (M) {
                R = M[0];
                II = I + M[0].length;
                match = true;
            }
        }
        if (PP.type === "alternate") {
            for (const NN of PP.parsers) {
                try {
                    const result = P(NN, II, S, grammar[NN], [...T, NN]);
                    R = result.R;
                    II = result.I;
                    match = true;
                    break;
                } catch (e) {
                    errors.push(e as any);
                }
            }
        }
        if (PP.type === "concat") {
            const results: any[] = [];
            for (const NN of PP.parsers) {
                const result = P(NN, II, S.slice(II - I), grammar[NN], [...T, NN]);
                II = result.I;
                results.push(result.R);
            }
            R = results;
            match = true;
        }
        if (PP.type === "iterate") {
            const results: any[] = [];
            if (PP.min !== 0) {
                for (let i = 0; i < PP.min; i++) {
                    const result = P(PP.parser, II, S.slice(II - I), grammar[PP.parser], [...T, PP.parser]);
                    II = result.I;
                    results.push(result.R);
                }
            }
            match = true;
            for (let k = 0; (PP.max === null || k < PP.max - PP.min); k++) {
                try {
                    const result = P(PP.parser, II, S.slice(II - I), grammar[PP.parser], [...T, PP.parser]);
                    II = result.I;
                    results.push(result.R);
                } catch (e) {
                    if (PP.max !== null) {
                        errors.push(e as any);
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
        const error = {
            N,
            I,
            S,
            T,
        };
        errors.push(error);
        throw error;
    }
    try {
        return P("$", 0, syntax, grammar.$, ["$"]).R;
    } catch (e) {
        gate(e);
        const sorted = errors.sort((a, b) => {
            return b.I - a.I;
        });
        const II = sorted[0].I;
        const filter = sorted.filter((a) => a.I === II);
        const names = [...new Set(
            filter
                .map(({ N }) => N)
                .filter((N) => grammar[N].type === "string" || grammar[N].type === "regex")
                .map((N) => "T_" + N.toUpperCase()))];
        throw new Error(`Unexpected character ${JSON.stringify(syntax[II])}, expected ${names.join(" or ")} instead at index ${II}`);
    }
}
function define<P extends IGrammar>(P: P) {
    return P;
}
function resolve<P extends IGrammarUnresolved>(P: P): IResolve<P> {
    // @ts-ignore
    return Object.keys(P).reduce((p, k) => {
        return {
            ...p,
            [k]: typeof P[k] === "string" ? {
                type: "string",
                string: P[k],
            }
                : P[k] instanceof RegExp ? {
                    type: "regex",
                    regex: P[k],
                } : P[k],
        };
    }, {});
}


const is_vector = (T: any) => typeof T === "object" && T !== null;
const spread = (F: (left: any, right: any) => any, components: boolean) => {
    return (...args: any[]) => {
        if (is_vector(args[0]) && components) {
            const clone = { ...args[0] };
            Object.keys(clone).forEach((k) => {
                clone[k] = args.slice(1).reduce((p, c) => {
                    return F(p, c[k]);
                }, args[0][k]);
            })
            return clone;
        }
        return args.slice(1).reduce((p, c) => {
            return F(p, c);
        }, args[0]);
    }
}
const single = (F: (value: any) => any) => {
    return (value: any) => {
        if (is_vector(value)) {
            const clone = { ...value };
            Object.keys(clone).forEach((k) => {
                clone[k] = F(clone[k]);
            })
            return clone;
        }
        return F(value);
    }
}
const length = (value: any) => {
    if (is_vector(value)) {
        let L = 0;
        Object.keys(value).forEach((k) => {
            L += Math.pow(value[k], 2);
        })
        return Math.sqrt(L);
    }
    return Math.abs(value);
};
const normalize = (value: any) => {
    const L = length(value);
    if (is_vector(value)) {
        const clone = { ...value };
        Object.keys(clone).forEach((k) => {
            clone[k] = clone / L;
        });
        return clone;
    }
    return 1;
};
const distance = (a: any, b: any) => {
    if (is_vector(a)) {
        let L = 0;
        Object.keys(a).forEach((k) => {
            L += Math.pow(a[k] - b[k], 2);
        })
        return Math.sqrt(L);
    }
    return Math.sqrt(Math.pow(a - b, 2));
};
function getCoord(i: number) {
    const coords = ["x", "y", "z", "w", "i"];
    if (i < coords.length) {
        return coords[i];
    }
    const last = coords.slice(-1)[0];
    return last + (coords.length - i + 1);
}
const vec = (number: number) => {
    return (...args: any[]) => {
        const reduce = args.reduce((p, c) => {
            return [...p, typeof c === "object" ? Object.values(c) : c];
        }, []);
        const rest = reduce.length < number ? [...Array(number - reduce.length)].map(() => reduce.length === 0 ? 0 : reduce[reduce.length - 1]) : [];
        const arr = [...reduce].concat(rest).slice(0, number);
        const object: { [s: string]: any } = {};
        arr.forEach((_, i) => {
            object[getCoord(i)] = arr[i];
        })
    };
};
const generateVecs = () => {
    return {
        // @ts-ignore
        ...[...Array(8)].reduce((p, c, i) => {
            return {
                ...p,
                ["vec" + (i + 1)]: vec(i + 1),
                ["ivec" + (i + 1)]: vec(i + 1),
            };
        }, {}),
    };
};
const calls = {
    not: (value: any) => !value,
    length,
    normalize,
    distance,
    pow: (left: any, right: any) => Math.pow(left, right),
    exp: single((value: any) => Math.exp(value)),
    exp2: single((value: any) => Math.pow(2, value)),
    log: single((value: any) => Math.log(value)),
    log2: single((value: any) => Math.log2(value)),
    sqrt: single((value: any) => Math.sqrt(value)),
    floor: single((value: any) => Math.floor(value)),
    ceil: single((value: any) => Math.floor(value)),
    sin: single((value: any) => Math.sin(value)),
    cos: single((value: any) => Math.cos(value)),
    tan: single((value: any) => Math.tan(value)),
    asin: single((value: any) => Math.asin(value)),
    acos: single((value: any) => Math.acos(value)),
    atan: single((value: any) => Math.atan(value)),
    mult: spread((left, right) => left * right, true),
    div: spread((left, right) => left / right, true),
    mod: spread((left, right) => left % right, true),
    plus: spread((left, right) => left + right, true),
    minus: spread((left, right) => left - right, true),
    lt: spread((left, right) => left < right, false),
    lte: spread((left, right) => left <= right, false),
    gt: spread((left, right) => left > right, false),
    gte: spread((left, right) => left >= right, false),
    eq: spread((left, right) => left == right, false),
    neq: spread((left, right) => left != right, false),
    and: spread((left, right) => left && right, false),
    or: spread((left, right) => left || right, false),
    float: (value: any) => +value,
    int: (value: any) => parseInt("" + value),
    ...generateVecs(),
}
const precedence = [
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
const unary = {
    "!": "not",
};
const binary = {
    "*": "mult",
    "&&": "and",
    "||": "or",
    "+": "plus",
    "-": "minus",
}
const double = {
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

const reverse = (object: { [s: string]: any }) => Object.fromEntries(Object.entries(object).map(([k, v]) => [v, k]));
const r_unary = reverse(unary);
const r_binary = reverse(binary);
const r_double = reverse(double);

const arithmetic = () => {
    const result = resolve({
        increment: "++",
        decrement: "--",
        arithmetic: {
            type: "concat",
            parsers: ["ternary"] as any,
            match(R) {
                return R[0];
            },
        } as IParser,
        ...r_unary,
        ...r_binary,
        ...r_double,
        ternary: {
            type: "alternate",
            parsers: ["ternary_op", "increment_post"],
        },
        ternary_op: {
            type: "concat",
            parsers: ["ws_opt", "increment_post", "ws_opt", "question", "ws_opt", "expression", "ws_opt", "colon", "ws_opt", "expression", "ws_opt"],
            match(R: any) {
                return {
                    type: "ternary",
                    condition: R[1],
                    success: R[5],
                    failure: R[9],
                };
            },
        },
        increment_post: {
            type: "alternate",
            parsers: ["increment_post_op", "decrement_post"],
        },
        increment_post_op: {
            type: "concat",
            parsers: ["ws_opt", "variable", "ws_opt", "increment", "ws_opt"],
            match(R: any) {
                return {
                    type: "call",
                    name: "increment_post",
                    arguments: [R[1]],
                };
            },
        },
        decrement_post: {
            type: "alternate",
            parsers: ["decrement_post_op", "increment_pre"],
        },
        decrement_post_op: {
            type: "concat",
            parsers: ["ws_opt", "variable", "ws_opt", "decrement", "ws_opt"],
            match(R: any) {
                return {
                    type: "call",
                    name: "decrement_post",
                    arguments: [R[1]],
                };
            },
        },
        increment_pre: {
            type: "alternate",
            parsers: ["increment_pre_op", "decrement_pre"],
        },
        increment_pre_op: {
            type: "concat",
            parsers: ["ws_opt", "increment", "ws_opt", "variable", "ws_opt"],
            match(R: any) {
                return {
                    type: "call",
                    name: "increment_pre",
                    arguments: [R[2]],
                };
            },
        },
        decrement_pre: {
            type: "alternate",
            parsers: ["decrement_pre_op", [precedence[0] + "_arithmetic"]],
        },
        decrement_pre_op: {
            type: "concat",
            parsers: ["ws_opt", "decrement", "ws_opt", "variable", "ws_opt"],
            match(R: any) {
                return {
                    type: "call",
                    name: "decrement_pre",
                    arguments: [R[2]],
                };
            },
        },
        ...precedence.reduce((p, k, i) => {
            const next = i + 1 < precedence.length - 1 ? precedence[i + 1] + "_arithmetic" : "expression_fallback";
            const inject = {} as IGrammar;
            if (k in r_unary) {
                inject[k + "_arithmetic"] = {
                    type: "alternate",
                    parsers: [k + "_op", next],
                };
                inject[k + "_op"] = {
                    type: "concat",
                    parsers: ["ws_opt", k, "ws_opt", "expression", "ws_opt"],
                    match(R) {
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
                    match(R) {
                        const left = R[1];
                        const right = R[3];
                        if (right === null) {
                            return left;
                        }
                        const merge = right.type === "call" && right.name === k && k in r_binary;
                        return {
                            type: "call",
                            name: k,
                            arguments: merge ? [left, ...right.arguments] : [left, right],
                        };
                    },
                };
                inject[k + "_op"] = {
                    type: "concat",
                    parsers: ["ws_opt", k, "ws_opt", k + "_arithmetic", "ws_opt"],
                    match(R) {
                        return R[3];
                    },
                };
                inject[k + "_opt"] = {
                    type: "iterate",
                    min: 0,
                    max: 1,
                    parser: k + "_op",
                    match(R) {
                        return R.length === 0 ? null : R[0];
                    },
                };
            }
            return {
                ...p,
                ...inject,
            }
        }, {}),
    });
    return result;
}


const G = resolve({
    ws: /^\s+/,
    ws_opt: /^\s*/,
    integer: /^[+-]?\d+/,
    float: /^[+-]?\d+\.\d+/,
    name: /^[a-z_][a-z0-9_]*/,
    scoped: /^([a-z_][a-z0-9_]*|(@[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)?))/,
    native: /^(f32|i8|i16|i32)/,
    primitive: /^(f32|i8|i16|i32|bool|vec[1-7]<(f32|i8|i16|i32)>)/,
    question: "?",
    if: "if",
    else: "else",
    for: "for",
    continue: "continue",
    break: "break",
    return: "return",
    true: "true",
    false: "false",
    comma: ",",
    colon: ":",
    semicolon: ";",
    plus: "+",
    minus: "-",
    div: "/",
    mod: "%",
    BO: "(",
    BC: ")",
    CBO: "{",
    CBC: "}",
    SBO: "[",
    SBC: "]",
    assign: "=",
    arrow: "=>",
    digit: {
        type: "regex",
        regex: /^\d+/,
        match(R) {
            return +R;
        },
    },
    $: {
        type: "concat",
        parsers: ["script"] as any,
        match(R) {
            return R[0];
        }
    },
    script: {
        type: "concat",
        parsers: ["functions", "parameters", "ws_opt", "CBO", "declarations", "CBC", "ws_opt"] as any,
        match(R) {
            return {
                type: "script",
                functions: R[0],
                declarations: R[4],
                ...R[1],
            };
        }
    },
    functions: {
        type: "iterate",
        parser: "function",
        min: 0,
        max: null,
    },
    function: {
        type: "concat",
        parsers: ["ws_opt", "value", "ws_opt", "BO", "ws_opt", "values_opt", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"] as any,
        match(R) {
            return {
                type: "function",
                value: R[1],
                values: R[5],
                declarations: R[11],
            };
        }
    },
    value: {
        type: "concat",
        parsers: ["ws_opt", "primitive", "ws", "name", "ws_opt"] as any,
        match(R) {
            return {
                type: "value",
                primitive: R[1],
                name: R[3],
            };
        },
    },
    value_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "ws_opt", "value", "ws_opt"] as any,
        match(R) {
            return R[3];
        },
    },
    value_commas: {
        type: "iterate",
        parser: "value_comma",
        min: 0,
        max: null,
    },
    values: {
        type: "concat",
        parsers: ["ws_opt", "value", "ws_opt", "value_commas"] as any,
        match(R) {
            return [R[1], ...R[3]];
        },
    },
    values_opt: {
        type: "iterate",
        parser: "values",
        min: 0,
        max: 1,
        match(R) {
            return R.length === 0 ? [] : R[0];
        },
    },
    boolean: {
        type: "alternate",
        parsers: ["true", "false"] as any,
    },
    expression_bracket: {
        type: "concat",
        parsers: ["ws_opt", "BO", "expression", "BC", "ws_opt"] as any,
        match(R) {
            return R[2];
        },
    },
    expression: {
        type: "alternate",
        parsers: ["expression_bracket", "arithmetic", "expression_fallback"] as any,
    },
    expression_fallback: {
        type: "alternate",
        parsers: ["call", "scalar", "variable"] as any,
    },
    call: {
        type: "concat",
        parsers: ["ws_opt", "scoped", "ws_opt", "BO", "ws_opt", "arguments_opt", "ws_opt", "BC", "ws_opt"] as any,
        match(R) {
            return {
                type: "call",
                name: R[1],
                arguments: R[5],
            };
        }
    },
    argument_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "ws_opt", "expression", "ws_opt"] as any,
        match(R) {
            return R[3];
        },
    },
    argument_commas: {
        type: "iterate",
        parser: "argument_comma",
        min: 0,
        max: null,
    },
    arguments: {
        type: "concat",
        parsers: ["ws_opt", "expression", "ws_opt", "argument_commas"] as any,
        match(R) {
            return [R[1], ...R[3]];
        },
    },
    arguments_opt: {
        type: "iterate",
        parser: "arguments",
        min: 0,
        max: 1,
        match(R) {
            return R.length === 0 ? [] : R[0];
        },
    },
    scalar: {
        type: "alternate",
        parsers: ["boolean", "float", "integer"] as any,
        match(R) {
            return {
                type: "scalar",
                value: R,
            };
        }
    },
    variable: {
        type: "concat",
        parsers: ["scoped"] as any,
        match(R) {
            return {
                type: "variable",
                name: R[0],
            };
        }
    },
    declarations: {
        type: "iterate",
        parser: "declaration",
        min: 0,
        max: null,
    },
    for_expression: {
        type: "alternate",
        parsers: ["type_declaration", "assign_declaration", "for_declaration", "condition_declaration", "type_declaration"] as any,
    },
    assignable_semicolon: {
        type: "concat",
        parsers: ["ws_opt", "semicolon", "ws_opt", "assignable_declaration", "ws_opt"] as any,
        match(R) {
            return R[3];
        },
    },
    assignable_semicolons: {
        type: "iterate",
        parser: "assignable_semicolon",
        min: 0,
        max: null,
    },
    assignables_semicolon: {
        type: "concat",
        parsers: ["ws_opt", "assignable_declaration", "assignable_semicolons", "ws_opt"] as any,
        match(R) {
            return [R[1], ...R[2]];
        },
    },
    declaration: {
        type: "alternate",
        parsers: ["keyword_declaration", "for_declaration", "condition_declaration", "assignable_declaration_semicolon"] as any,
    },
    for_declaration: {
        type: "concat",
        parsers: ["ws_opt", "for", "ws_opt", "BO", "ws_opt", "assignables_semicolon", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"] as any,
        match(R) {
            return {
                type: "for",
                assignables: R[5],
                declarations: R[11],
            };
        }
    },
    condition_declaration: {
        type: "concat",
        parsers: ["if_declaration", "else_if_conditions_opt", "else_condition_opt"] as any,
        match(R) {
            return {
                type: "condition",
                if: R[0],
                elseif: R[1],
                else: R[2],
            };
        }
    },
    if_declaration: {
        type: "concat",
        parsers: ["ws_opt", "if", "ws_opt", "BO", "ws_opt", "expression", "ws_opt", "BC", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"] as any,
        match(R) {
            return {
                type: "if",
                condition: R[5],
                declarations: R[11],
            };
        }
    },
    else_if_declaration: {
        type: "concat",
        parsers: ["ws_opt", "else", "ws_opt", "if_declaration"] as any,
        match(R) {
            return R[3];
        }
    },
    else_declaration: {
        type: "concat",
        parsers: ["ws_opt", "else", "ws_opt", "CBO", "ws_opt", "declarations", "ws_opt", "CBC", "ws_opt"] as any,
        match(R) {
            return {
                type: "else",
                declarations: R[5],
            };
        }
    },
    else_condition_opt: {
        type: "iterate",
        parser: "else_declaration",
        min: 0,
        max: 1,
        match(R) {
            return R.length === 0 ? null : R[0];
        }
    },
    else_if_conditions_opt: {
        type: "iterate",
        parser: "else_if_declaration",
        min: 0,
        max: null,
    },
    regular: {
        type: "alternate",
        parsers: ["break", "continue"] as any,
    },
    keyword_declaration: {
        type: "alternate",
        parsers: ["regular_keyword_declaration", "return_keyword_declaration"] as any,
    },
    regular_keyword_declaration: {
        type: "concat",
        parsers: ["ws_opt", "regular", "ws_opt", "semicolon", "ws_opt"] as any,
        match(R) {
            return {
                type: "keyword",
                keyword: R[1],
                expression: null,
            };
        }
    },
    return_keyword_declaration: {
        type: "concat",
        parsers: ["ws_opt", "return", "ws", "expression_opt", "ws_opt", "semicolon", "ws_opt"] as any,
        match(R) {
            return {
                type: "keyword",
                keyword: R[1],
                expression: R[3],
            };
        }
    },
    expression_opt: {
        type: "iterate",
        parser: "expression",
        min: 0,
        max: 1,
        match(R) {
            return R.length === 0 ? null : R[0];
        }
    },
    type_declaration: {
        type: "concat",
        parsers: ["ws_opt", "primitive", "assign_declaration"] as any,
        match(R) {
            return {
                type: "type",
                primitive: R[1],
                assign: R[2],
            };
        }
    },
    assign_declaration: {
        type: "concat",
        parsers: ["ws_opt", "name", "ws_opt", "assign", "ws_opt", "expression", "ws_opt"] as any,
        match(R) {
            return {
                type: "assign",
                name: R[1],
                expression: R[5],
            };
        }
    },
    assignable_declaration: {
        type: "alternate",
        parsers: ["assign_declaration", "type_declaration", "expression"] as any,
    },
    assignable_declaration_semicolon: {
        type: "concat",
        parsers: ["assignable_declaration", "ws_opt", "semicolon", "ws_opt"] as any,
        match(R) {
            return R[0];
        }
    },
    digit_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "digit", "ws_opt"] as any,
        match(R) {
            return R[3];
        },
    },
    digit_commas: {
        type: "iterate",
        parser: "digit_comma",
        min: 0,
        max: null,
    },
    dimensions: {
        type: "concat",
        parsers: ["SBO", "ws_opt", "digit", "digit_commas", "ws_opt", "SBC"] as any,
        match(R) {
            return [R[2], ...R[3]];
        },
    },
    rank: {
        type: "concat",
        parsers: ["BO", "ws_opt", "digit", "ws_opt", "BC"] as any,
        match(R) {
            return R[2];
        },
    },
    dimensions_or_rank: {
        type: "alternate",
        parsers: ["rank", "dimensions"] as any,
    },
    input_comma: {
        type: "concat",
        parsers: ["ws_opt", "comma", "input", "ws_opt"] as any,
        match(R) {
            return R[3];
        },
    },
    input_commas: {
        type: "iterate",
        parser: "input_comma",
        min: 0,
        max: null,
    },
    input: {
        type: "concat",
        parsers: ["ws_opt", "native", "dimensions_or_rank", "ws_opt", "name", "ws_opt"] as any,
        match(R) {
            return {
                type: "input",
                name: R[4],
                native: R[1],
                dimensions: R[2],
            };
        },
    },
    parameters: {
        type: "concat",
        parsers: ["ws_opt", "native", "dimensions_or_rank", "ws_opt", "BO", "ws_opt", "input", "input_commas", "ws_opt", "BC", "ws_opt"] as any,
        match(R) {
            return {
                inputs: [R[6], ...R[7]],
                native: R[1],
                dimensions: R[2],
            };
        },
    },
    ...arithmetic(),
} as const);

export type IScript = {
    type: "script";
    functions: IFunction[];
    declarations: IDeclaration[];
    inputs: IInput[];
    native: INative;
    dimensions: number | number[];
};
type IFunction = {
    type: "function";
    value: IValue;
    values: IValue[];
    declarations: IDeclaration[];
}
type IValue = {
    type: "value";
    name: string;
    primitive: IPrimitive;
}
type IInput = {
    type: "input";
    name: string;
    native: INative;
    dimensions: number | number[];
};
type INative = "f32" | "i8" | "i16" | "i32";
type IVec = "vec1" | "vec2" | "vec3" | "vec4" | "vec5" | "vec6" | "vec6" | "vec7" | "vec8";
type IIvec = `${IVec}<${INative}>`;
type IPrimitive = INative | IVec | IIvec;
type IAssignable = IType | IAssign | IExpression;
type IDeclaration = IAssignable | IKeyword | IFor | ICondition;
type IType = {
    type: "type";
    primitive: IPrimitive;
    assign: IAssign;
};
type IAssign = {
    type: "assign";
    name: string;
    expression: IExpression;
};
type IExpression = IScalar | ICall | IVariable | ITernary;
type IScalar = {
    type: "scalar";
    value: string;
};
type IVariable = {
    type: "variable";
    name: string;
};
type ICall = {
    type: "call";
    name: string;
    arguments: IExpression[];
};
type ITernary = {
    type: "ternary";
    condition: IExpression;
    success: IExpression;
    failure: IExpression;
};
type IKeyword = {
    type: "keyword";
    keyword: "return" | "continue" | "break";
    expression: null | IExpression;
};
type IFor = {
    type: "for";
    assignables: IAssignable[];
    declarations: IDeclaration[];
}
type IIf = {
    type: "if";
    condition: IExpression;
    declarations: IDeclaration[];
}
type IElse = {
    type: "else";
    declarations: IDeclaration[];
}
type ICondition = {
    type: "condition";
    if: IIf;
    elseif: IIf[];
    else: null | IElse;
};
export function transpileNative(native: INative) {
    return native === "f32" ? Float32Array
        : native === "i8" ? Int8Array
            : native === "i16" ? Int16Array
                : native === "i32" ? Int32Array
                    : Int8Array;
}
export function transpilePrimitive(primitive: IPrimitive) {
    return primitive.startsWith("f") ? "float"
        : primitive.startsWith("i") ? "int"
            : primitive.startsWith("bool") ? "bool"
                : primitive.startsWith("vec") ? (primitive.match(/f32/) ? "" : "i") + primitive.slice(0, primitive.indexOf("<") - 1)
                    : primitive;
}
export function transpileWebGL(input: IDeclaration[] | IFunction, F: string[] = []) {
    const tab = "    ";
    const lines = (L: string[], level: number) => {
        if (L.length === 0) {
            return "";
        }
        return "\n" + tab.repeat(level)
            + L.join("\n" + tab.repeat(level))
            + "\n" + tab.repeat(level <= 0 ? 0 : level - 1);
    }
    const T = (D: IDeclaration[] | IValue | IFunction | IDeclaration | IExpression | IIf | IElse, semicolon = false, level = 0): any => {
        if (Array.isArray(D)) {
            return lines(D.map((DD) => T(DD, true, level)), level);
        }
        if (D.type === "assign") {
            return `${D.name} = ${T(D.expression, false)}${semicolon ? ";" : ""}`;
        }
        if (D.type === "value") {
            return `${transpilePrimitive(D.primitive)} ${D.name}`;
        }
        if (D.type === "type") {
            return `${transpilePrimitive(D.primitive)} ${T(D.assign, false)}${semicolon ? ";" : ""}`;
        }
        if (D.type === "keyword") {
            return `${D.keyword}${D.expression === null ? "" : " " + T(D.expression)}${semicolon ? ";" : ""}`;
        }
        if (D.type === "scalar") {
            return D.value;
        }
        if (D.type === "variable") {
            return D.name.replace("@", "$").replace(".", "_");
        }
        if (D.type === "ternary") {
            return `${T(D.condition, false, level)} ? ${T(D.success, false, level)} : ${T(D.failure, false, level)}`
        }
        if (D.type === "call") {
            if (["increment_post", "increment_pre", "decrement_post", "decrement_pre"].includes(D.name)) {
                // @ts-ignore
                const name = D.arguments[0].name;
                return `${D.name === "increment_pre" ? "++" : D.name === "decrement_pre" ? "--" : ""}${name}${D.name === "increment_post" ? "++" : D.name === "decrement_post" ? "--" : ""}`;
            }
            if (D.name in r_unary) {
                return `${r_unary[D.name]}${T(D.arguments[0], false, level)}`;
            }
            if (D.name in r_binary) {
                return `(${D.arguments.map((DD) => T(DD, false, level)).join(" " + r_binary[D.name] + " ")})`;
            }
            if (D.name in r_double && D.name !== "mod") {
                return `(${D.arguments.map((DD) => T(DD, false, level)).join(" " + r_double[D.name] + " ")})`;
            }
            return (F.includes(D.name) ? "__user_" : "")
                + D.name.replace("@", "$").replace(".", "_")
                + "("
                + D.arguments.map((DD) => T(DD, false, level)).join(", ")
                + ")";
        }
        if (D.type === "function") {
            return `(${D.values.map((DD) => T(DD, false, level)).join(", ")}) {${T(D.declarations, true, level + 1)}}`;
        }
        if (D.type === "for") {
            const name = (D.assignables[0] as IType).assign.name;
            return `for (${D.assignables.map((DD, i) => i === 1 ? `${name} < 8388608` : T(DD, false, level)).join("; ")}) {\n${tab.repeat(level + 1)}if (!(${T(D.assignables[1], false, level + 1)})) {\n${tab.repeat(level + 2)}break;\n${tab.repeat(level + 1)}}${D.declarations.length === 0 ? `\n${tab.repeat(level + 1)}` : ""}${T(D.declarations, true, level + 1)}}`;
        }
        if (D.type === "condition") {
            return `${T(D.if, false, level + 1)}${D.elseif.map((DD) => T(DD, true, level + 1)).join("\n")}${D.else === null ? "" : T(D.else, false, level + 1)}`;
        }
        if (D.type === "if") {
            return `${semicolon ? " else " : ""}if (${T(D.condition, false, level)}) {${T(D.declarations, true, level + 1)}}`;
        }
        if (D.type === "else") {
            return ` else {${T(D.declarations, true, level + 1)}}`;
        }
        return "";
    };
    return T(input, true);
}
export function transpileFunction(declarations: IDeclaration[], F: string[] = []) {
    let result: any;
    const break_symbol = Symbol("break");
    const continue_symbol = Symbol("continue");
    const return_symbol = Symbol("return");
    const T = (D: IDeclaration[] | IDeclaration | IExpression | IIf | IElse, scope: { [s: string]: any }, map: { [s: string]: any }, functions: { [s: string]: (...args: any[]) => any }): any => {
        if (Array.isArray(D)) {
            for (const DD of D) {
                const result = T(DD, scope, map, functions);
                if (typeof result === "symbol") {
                    return result;
                }
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
            let result = T(D.expression, scope, map, functions);
            const type: IPrimitive = scope[D.name][0];
            result = type.startsWith("f") ? +result
                : type.startsWith("i") ? parseInt("" + result)
                    : type.startsWith("bool") ? !!result
                        : result;
            scope[D.name][1] = result;
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
                const name = D.name.replace("@", "$").replace(".", "_");
                return map[name];
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
                // @ts-ignore
                const name = D.arguments[0].name;
                const V = scope[name];
                if (D.name.startsWith("increment")) {
                    scope[name]++;
                }
                if (D.name.startsWith("decrement")) {
                    scope[name]--;
                }
                if (D.name.endsWith("_post")) {
                    return V;
                }
                return scope[name];
            }
            let C = F.includes(D.name) ? functions[D.name] : calls[D.name];
            if (D.name.startsWith("@")) {
                const name = D.name.replace("@", "$").replace(".", "_");
                C = map[name];
            }
            return C(...D.arguments.map((A) => T(A, scope, map, functions)));
        }
        if (D.type === "for") {
            const first = D.assignables[0];
            const condition = D.assignables[1];
            const every = D.assignables[2];
            T(first, scope, map, functions);
            while (true) {
                const success = T(condition, scope, map, functions);
                if (!success) {
                    break;
                }
                const result = T(D.declarations, scope, map, functions);
                if (typeof result === "symbol") {
                    if (result === break_symbol) {
                        break;
                    }
                    if (result === continue_symbol) {
                        continue;
                    }
                    return result;
                }
                T(every, scope, map, functions);
            }
        }
        if (D.type === "condition") {
            const if_success = T(D.if.condition, scope, map, functions);
            if (if_success) {
                return T(D.if.declarations, scope, map, functions);
            }
            for (const elseif of D.elseif) {
                const elseif_success = T(elseif.condition, scope, map, functions);
                if (elseif_success) {
                    return T(elseif.declarations, scope, map, functions);
                }
            }
            if (D.else !== null) {
                return T(D.else.declarations, scope, map, functions);
            }
        }
    }
    return (map: { [s: string]: any }, functions: { [s: string]: (...args: any[]) => any }) => {
        T(declarations, {}, map, functions);
        return result;
    };
}
export function parseCode(code: string): IScript {
    return parse(code, G);
}
