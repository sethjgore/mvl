!function(root, factory) {
    "function" == typeof define && define.amd ? define([ "exports" ], factory) : factory("undefined" != typeof exports ? exports : root);
}(this, function(exports) {
    function parse(tokens) {
        function consumeAPrimitive() {
            switch (token.tokenType) {
              case "(":
              case "[":
              case "{":
                return consumeASimpleBlock();

              case "FUNCTION":
                return consumeAFunc();

              default:
                return token;
            }
        }
        function consumeASimpleBlock() {
            for (var endingTokenType = {
                "(": ")",
                "[": "]",
                "{": "}"
            }[token.tokenType], block = new SimpleBlock(token.tokenType); ;) switch (consume(), 
            token.tokenType) {
              case "EOF":
              case endingTokenType:
                return block;

              default:
                block.append(consumeAPrimitive());
            }
        }
        function consumeAFunc() {
            for (var func = new Func(token.value), arg = new FuncArg(); ;) switch (consume(), 
            token.tokenType) {
              case "EOF":
              case ")":
                return func.append(arg), func;

              case "DELIM":
                "," == token.value ? (func.append(arg), arg = new FuncArg()) : arg.append(token);
                break;

              default:
                arg.append(consumeAPrimitive());
            }
        }
        for (var token, mode = "top-level", i = -1, stylesheet = new Stylesheet(), stack = [ stylesheet ], rule = stack[0], consume = function(advance) {
            return void 0 === advance && (advance = 1), i += advance, token = i < tokens.length ? tokens[i] : new EOFToken(), 
            !0;
        }, reprocess = function() {
            return i--, !0;
        }, next = function() {
            return tokens[i + 1];
        }, switchto = function(newmode) {
            return void 0 === newmode ? "" !== rule.fillType ? mode = rule.fillType : "STYLESHEET" == rule.type ? mode = "top-level" : (console.log("Unknown rule-type while switching to current rule's content mode: ", rule), 
            mode = "") : mode = newmode, !0;
        }, push = function(newRule) {
            return rule = newRule, stack.push(rule), !0;
        }, parseerror = function(msg) {
            return console.log("Parse error at token " + i + ": " + token + ".\n" + msg), !0;
        }, pop = function() {
            var oldrule = stack.pop();
            return rule = stack[stack.length - 1], rule.append(oldrule), !0;
        }, discard = function() {
            return stack.pop(), rule = stack[stack.length - 1], !0;
        }, finish = function() {
            for (;stack.length > 1; ) pop();
        }; ;) if (consume(), "DELIM" !== token.tokenType || "\r" !== token.value) switch (mode) {
          case "top-level":
            switch (token.tokenType) {
              case "CDO":
              case "CDC":
              case "WHITESPACE":
                break;

              case "AT-KEYWORD":
                push(new AtRule(token.value)) && switchto("at-rule");
                break;

              case "{":
                parseerror("Attempt to open a curly-block at top-level.") && consumeAPrimitive();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                push(new StyleRule()) && switchto("selector") && reprocess();
            }
            break;

          case "at-rule":
            switch (token.tokenType) {
              case ";":
                pop() && switchto();
                break;

              case "{":
                "" !== rule.fillType ? switchto(rule.fillType) : parseerror("Attempt to open a curly-block in a statement-type at-rule.") && discard() && switchto("next-block") && reprocess();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                rule.appendPrelude(consumeAPrimitive());
            }
            break;

          case "rule":
            switch (token.tokenType) {
              case "WHITESPACE":
                break;

              case "}":
                pop() && switchto();
                break;

              case "AT-KEYWORD":
                push(new AtRule(token.value)) && switchto("at-rule");
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                push(new StyleRule()) && switchto("selector") && reprocess();
            }
            break;

          case "selector":
            switch (token.tokenType) {
              case "{":
                switchto("declaration");
                break;

              case "EOF":
                return discard() && finish(), stylesheet;

              default:
                rule.appendSelector(consumeAPrimitive());
            }
            break;

          case "declaration":
            switch (token.tokenType) {
              case "WHITESPACE":
              case ";":
                break;

              case "}":
                pop() && switchto();
                break;

              case "AT-RULE":
                push(new AtRule(token.value)) && switchto("at-rule");
                break;

              case "IDENT":
                push(new Declaration(token.value)) && switchto("after-declaration-name");
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                parseerror() && discard() && switchto("next-declaration");
            }
            break;

          case "after-declaration-name":
            switch (token.tokenType) {
              case "WHITESPACE":
                break;

              case ":":
                switchto("declaration-value");
                break;

              case ";":
                parseerror("Incomplete declaration - semicolon after property name.") && discard() && switchto();
                break;

              case "EOF":
                return discard() && finish(), stylesheet;

              default:
                parseerror("Invalid declaration - additional token after property name") && discard() && switchto("next-declaration");
            }
            break;

          case "declaration-value":
            switch (token.tokenType) {
              case "DELIM":
                "!" == token.value && "IDENTIFIER" == next().tokenType && "important" == next().value.toLowerCase() ? (consume(), 
                rule.important = !0, switchto("declaration-end")) : rule.append(token);
                break;

              case ";":
                pop() && switchto();
                break;

              case "}":
                pop() && pop() && switchto();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                rule.append(consumeAPrimitive());
            }
            break;

          case "declaration-end":
            switch (token.tokenType) {
              case "WHITESPACE":
                break;

              case ";":
                pop() && switchto();
                break;

              case "}":
                pop() && pop() && switchto();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                parseerror("Invalid declaration - additional token after !important.") && discard() && switchto("next-declaration");
            }
            break;

          case "next-block":
            switch (token.tokenType) {
              case "{":
                consumeAPrimitive() && switchto();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                consumeAPrimitive();
            }
            break;

          case "next-declaration":
            switch (token.tokenType) {
              case ";":
                switchto("declaration");
                break;

              case "}":
                switchto("declaration") && reprocess();
                break;

              case "EOF":
                return finish(), stylesheet;

              default:
                consumeAPrimitive();
            }
            break;

          default:
            return void console.log("Unknown parsing mode: " + mode);
        }
    }
    function CSSParserRule() {
        return this;
    }
    function Stylesheet() {
        return this.value = [], this;
    }
    function AtRule(name) {
        return this.name = name, this.prelude = [], this.value = [], name in AtRule.registry && (this.fillType = AtRule.registry[name]), 
        this;
    }
    function StyleRule() {
        return this.selector = [], this.value = [], this;
    }
    function Declaration(name) {
        return this.name = name, this.value = [], this;
    }
    function SimpleBlock(type) {
        return this.name = type, this.value = [], this;
    }
    function Func(name) {
        return this.name = name, this.value = [], this;
    }
    function FuncArg() {
        return this.value = [], this;
    }
    CSSParserRule.prototype.fillType = "", CSSParserRule.prototype.toString = function(indent) {
        return JSON.stringify(this.toJSON(), null, indent);
    }, CSSParserRule.prototype.append = function(val) {
        return this.value.push(val), this;
    }, Stylesheet.prototype = new CSSParserRule(), Stylesheet.prototype.type = "STYLESHEET", 
    Stylesheet.prototype.toJSON = function() {
        return {
            type: "stylesheet",
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, AtRule.prototype = new CSSParserRule(), AtRule.prototype.type = "AT-RULE", AtRule.prototype.appendPrelude = function(val) {
        return this.prelude.push(val), this;
    }, AtRule.prototype.toJSON = function() {
        return {
            type: "at",
            name: this.name,
            prelude: this.prelude.map(function(e) {
                return e.toJSON();
            }),
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, AtRule.registry = {
        "import": "",
        media: "rule",
        "font-face": "declaration",
        page: "declaration",
        keyframes: "rule",
        namespace: "",
        "counter-style": "declaration",
        supports: "rule",
        document: "rule",
        "font-feature-values": "declaration",
        viewport: "",
        "region-style": "rule"
    }, StyleRule.prototype = new CSSParserRule(), StyleRule.prototype.type = "STYLE-RULE", 
    StyleRule.prototype.fillType = "declaration", StyleRule.prototype.appendSelector = function(val) {
        return this.selector.push(val), this;
    }, StyleRule.prototype.toJSON = function() {
        return {
            type: "selector",
            selector: this.selector.map(function(e) {
                return e.toJSON();
            }),
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, Declaration.prototype = new CSSParserRule(), Declaration.prototype.type = "DECLARATION", 
    Declaration.prototype.toJSON = function() {
        return {
            type: "declaration",
            name: this.name,
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, SimpleBlock.prototype = new CSSParserRule(), SimpleBlock.prototype.type = "BLOCK", 
    SimpleBlock.prototype.toJSON = function() {
        return {
            type: "block",
            name: this.name,
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, Func.prototype = new CSSParserRule(), Func.prototype.type = "FUNCTION", Func.prototype.toJSON = function() {
        return {
            type: "func",
            name: this.name,
            value: this.value.map(function(e) {
                return e.toJSON();
            })
        };
    }, FuncArg.prototype = new CSSParserRule(), FuncArg.prototype.type = "FUNCTION-ARG", 
    FuncArg.prototype.toJSON = function() {
        return this.value.map(function(e) {
            return e.toJSON();
        });
    }, exports.parse = parse;
}), function(root, factory) {
    "function" == typeof define && define.amd ? define([ "exports" ], factory) : factory("undefined" != typeof exports ? exports : root);
}(this, function(exports) {
    function digit(code) {
        return between(code, 48, 57);
    }
    function hexdigit(code) {
        return digit(code) || between(code, 65, 70) || between(code, 97, 102);
    }
    function uppercaseletter(code) {
        return between(code, 65, 90);
    }
    function lowercaseletter(code) {
        return between(code, 97, 122);
    }
    function letter(code) {
        return uppercaseletter(code) || lowercaseletter(code);
    }
    function nonascii(code) {
        return code >= 160;
    }
    function namestartchar(code) {
        return letter(code) || nonascii(code) || 95 == code;
    }
    function namechar(code) {
        return namestartchar(code) || digit(code) || 45 == code;
    }
    function nonprintable(code) {
        return between(code, 0, 8) || between(code, 14, 31) || between(code, 127, 159);
    }
    function newline(code) {
        return 10 == code || 12 == code;
    }
    function whitespace(code) {
        return newline(code) || 9 == code || 32 == code;
    }
    function badescape(code) {
        return newline(code) || isNaN(code);
    }
    function tokenize(str, options) {
        void 0 == options && (options = {
            transformFunctionWhitespace: !1,
            scientificNotation: !1
        });
        for (var code, currtoken, i = -1, tokens = [], state = "data", line = 0, column = 0, lastLineLength = 0, incrLineno = function() {
            line += 1, lastLineLength = column, column = 0;
        }, locStart = {
            line: line,
            column: column
        }, next = function(num) {
            return void 0 === num && (num = 1), str.charCodeAt(i + num);
        }, consume = function(num) {
            return void 0 === num && (num = 1), i += num, code = str.charCodeAt(i), newline(code) ? incrLineno() : column += num, 
            !0;
        }, reconsume = function() {
            return i -= 1, newline(code) ? (line -= 1, column = lastLineLength) : column -= 1, 
            locStart.line = line, locStart.column = column, !0;
        }, eof = function() {
            return i >= str.length;
        }, donothing = function() {}, emit = function(token) {
            return token ? token.finish() : token = currtoken.finish(), options.loc === !0 && (token.loc = {}, 
            token.loc.start = {
                line: locStart.line,
                column: locStart.column
            }, locStart = {
                line: line,
                column: column
            }, token.loc.end = locStart), tokens.push(token), currtoken = void 0, !0;
        }, create = function(token) {
            return currtoken = token, !0;
        }, parseerror = function() {
            return console.log("Parse error at index " + i + ", processing codepoint 0x" + code.toString(16) + " in state " + state + "."), 
            !0;
        }, catchfire = function(msg) {
            return console.log("MAJOR SPEC ERROR: " + msg), !0;
        }, switchto = function(newstate) {
            return state = newstate, !0;
        }, consumeEscape = function() {
            if (consume(), hexdigit(code)) {
                for (var digits = [], total = 0; 6 > total && hexdigit(code); total++) digits.push(code), 
                consume();
                var value = parseInt(digits.map(String.fromCharCode).join(""), 16);
                return value > maximumallowedcodepoint && (value = 65533), whitespace(code) || reconsume(), 
                value;
            }
            return code;
        }; ;) {
            if (i > 2 * str.length) return "I'm infinite-looping!";
            switch (consume(), state) {
              case "data":
                if (whitespace(code)) for (emit(new WhitespaceToken()); whitespace(next()); ) consume(); else if (34 == code) switchto("double-quote-string"); else if (35 == code) switchto("hash"); else if (39 == code) switchto("single-quote-string"); else if (40 == code) emit(new OpenParenToken()); else if (41 == code) emit(new CloseParenToken()); else if (43 == code) digit(next()) || 46 == next() && digit(next(2)) ? switchto("number") && reconsume() : emit(new DelimToken(code)); else if (45 == code) 45 == next(1) && 62 == next(2) ? consume(2) && emit(new CDCToken()) : digit(next()) || 46 == next(1) && digit(next(2)) ? switchto("number") && reconsume() : switchto("ident") && reconsume(); else if (46 == code) digit(next()) ? switchto("number") && reconsume() : emit(new DelimToken(code)); else if (47 == code) 42 == next() ? consume() && switchto("comment") : emit(new DelimToken(code)); else if (58 == code) emit(new ColonToken()); else if (59 == code) emit(new SemicolonToken()); else if (60 == code) 33 == next(1) && 45 == next(2) && 45 == next(3) ? consume(3) && emit(new CDOToken()) : emit(new DelimToken(code)); else if (64 == code) switchto("at-keyword"); else if (91 == code) emit(new OpenSquareToken()); else if (92 == code) badescape(next()) ? parseerror() && emit(new DelimToken(code)) : switchto("ident") && reconsume(); else if (93 == code) emit(new CloseSquareToken()); else if (123 == code) emit(new OpenCurlyToken()); else if (125 == code) emit(new CloseCurlyToken()); else if (digit(code)) switchto("number") && reconsume(); else if (85 == code || 117 == code) 43 == next(1) && hexdigit(next(2)) ? consume() && switchto("unicode-range") : switchto("ident") && reconsume(); else if (namestartchar(code)) switchto("ident") && reconsume(); else {
                    if (eof()) return emit(new EOFToken()), tokens;
                    emit(new DelimToken(code));
                }
                break;

              case "double-quote-string":
                void 0 == currtoken && create(new StringToken()), 34 == code ? emit() && switchto("data") : eof() ? parseerror() && emit() && switchto("data") && reconsume() : newline(code) ? parseerror() && emit(new BadStringToken()) && switchto("data") && reconsume() : 92 == code ? badescape(next()) ? parseerror() && emit(new BadStringToken()) && switchto("data") : newline(next()) ? consume() : currtoken.append(consumeEscape()) : currtoken.append(code);
                break;

              case "single-quote-string":
                void 0 == currtoken && create(new StringToken()), 39 == code ? emit() && switchto("data") : eof() ? parseerror() && emit() && switchto("data") : newline(code) ? parseerror() && emit(new BadStringToken()) && switchto("data") && reconsume() : 92 == code ? badescape(next()) ? parseerror() && emit(new BadStringToken()) && switchto("data") : newline(next()) ? consume() : currtoken.append(consumeEscape()) : currtoken.append(code);
                break;

              case "hash":
                namechar(code) ? create(new HashToken(code)) && switchto("hash-rest") : 92 == code ? badescape(next()) ? parseerror() && emit(new DelimToken(35)) && switchto("data") && reconsume() : create(new HashToken(consumeEscape())) && switchto("hash-rest") : emit(new DelimToken(35)) && switchto("data") && reconsume();
                break;

              case "hash-rest":
                namechar(code) ? currtoken.append(code) : 92 == code ? badescape(next()) ? parseerror() && emit() && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : emit() && switchto("data") && reconsume();
                break;

              case "comment":
                42 == code ? 47 == next() ? consume() && switchto("data") : donothing() : eof() ? parseerror() && switchto("data") && reconsume() : donothing();
                break;

              case "at-keyword":
                45 == code ? namestartchar(next()) ? create(new AtKeywordToken(45)) && switchto("at-keyword-rest") : 92 != next(1) || badescape(next(2)) ? parseerror() && emit(new DelimToken(64)) && switchto("data") && reconsume() : create(new AtKeywordtoken(45)) && switchto("at-keyword-rest") : namestartchar(code) ? create(new AtKeywordToken(code)) && switchto("at-keyword-rest") : 92 == code ? badescape(next()) ? parseerror() && emit(new DelimToken(35)) && switchto("data") && reconsume() : create(new AtKeywordToken(consumeEscape())) && switchto("at-keyword-rest") : emit(new DelimToken(64)) && switchto("data") && reconsume();
                break;

              case "at-keyword-rest":
                namechar(code) ? currtoken.append(code) : 92 == code ? badescape(next()) ? parseerror() && emit() && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : emit() && switchto("data") && reconsume();
                break;

              case "ident":
                45 == code ? namestartchar(next()) ? create(new IdentifierToken(code)) && switchto("ident-rest") : 92 != next(1) || badescape(next(2)) ? emit(new DelimToken(45)) && switchto("data") : create(new IdentifierToken(code)) && switchto("ident-rest") : namestartchar(code) ? create(new IdentifierToken(code)) && switchto("ident-rest") : 92 == code ? badescape(next()) ? parseerror() && switchto("data") && reconsume() : create(new IdentifierToken(consumeEscape())) && switchto("ident-rest") : catchfire("Hit the generic 'else' clause in ident state.") && switchto("data") && reconsume();
                break;

              case "ident-rest":
                namechar(code) ? currtoken.append(code) : 92 == code ? badescape(next()) ? parseerror() && emit() && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : 40 == code ? currtoken.ASCIImatch("url") ? switchto("url") : emit(new FunctionToken(currtoken)) && switchto("data") : whitespace(code) && options.transformFunctionWhitespace ? switchto("transform-function-whitespace") && reconsume() : emit() && switchto("data") && reconsume();
                break;

              case "transform-function-whitespace":
                whitespace(next()) ? donothing() : 40 == code ? emit(new FunctionToken(currtoken)) && switchto("data") : emit() && switchto("data") && reconsume();
                break;

              case "number":
                create(new NumberToken()), 45 == code ? digit(next()) ? consume() && currtoken.append([ 45, code ]) && switchto("number-rest") : 46 == next(1) && digit(next(2)) ? consume(2) && currtoken.append([ 45, 46, code ]) && switchto("number-fraction") : switchto("data") && reconsume() : 43 == code ? digit(next()) ? consume() && currtoken.append([ 43, code ]) && switchto("number-rest") : 46 == next(1) && digit(next(2)) ? consume(2) && currtoken.append([ 43, 46, code ]) && switchto("number-fraction") : switchto("data") && reconsume() : digit(code) ? currtoken.append(code) && switchto("number-rest") : 46 == code && digit(next()) ? consume() && currtoken.append([ 46, code ]) && switchto("number-fraction") : switchto("data") && reconsume();
                break;

              case "number-rest":
                digit(code) ? currtoken.append(code) : 46 == code ? digit(next()) ? consume() && currtoken.append([ 46, code ]) && switchto("number-fraction") : emit() && switchto("data") && reconsume() : 37 == code ? emit(new PercentageToken(currtoken)) && switchto("data") : 69 == code || 101 == code ? digit(next()) ? consume() && currtoken.append([ 37, code ]) && switchto("sci-notation") : 43 != next(1) && 45 != next(1) || !digit(next(2)) ? create(new DimensionToken(currtoken, code)) && switchto("dimension") : currtoken.append([ 37, next(1), next(2) ]) && consume(2) && switchto("sci-notation") : 45 == code ? namestartchar(next()) ? consume() && create(new DimensionToken(currtoken, [ 45, code ])) && switchto("dimension") : 92 == next(1) && badescape(next(2)) ? parseerror() && emit() && switchto("data") && reconsume() : 92 == next(1) ? consume() && create(new DimensionToken(currtoken, [ 45, consumeEscape() ])) && switchto("dimension") : emit() && switchto("data") && reconsume() : namestartchar(code) ? create(new DimensionToken(currtoken, code)) && switchto("dimension") : 92 == code ? badescape(next) ? parseerror() && emit() && switchto("data") && reconsume() : create(new DimensionToken(currtoken, consumeEscape)) && switchto("dimension") : emit() && switchto("data") && reconsume();
                break;

              case "number-fraction":
                currtoken.type = "number", digit(code) ? currtoken.append(code) : 37 == code ? emit(new PercentageToken(currtoken)) && switchto("data") : 69 == code || 101 == code ? digit(next()) ? consume() && currtoken.append([ 101, code ]) && switchto("sci-notation") : 43 != next(1) && 45 != next(1) || !digit(next(2)) ? create(new DimensionToken(currtoken, code)) && switchto("dimension") : currtoken.append([ 101, next(1), next(2) ]) && consume(2) && switchto("sci-notation") : 45 == code ? namestartchar(next()) ? consume() && create(new DimensionToken(currtoken, [ 45, code ])) && switchto("dimension") : 92 == next(1) && badescape(next(2)) ? parseerror() && emit() && switchto("data") && reconsume() : 92 == next(1) ? consume() && create(new DimensionToken(currtoken, [ 45, consumeEscape() ])) && switchto("dimension") : emit() && switchto("data") && reconsume() : namestartchar(code) ? create(new DimensionToken(currtoken, code)) && switchto("dimension") : 92 == code ? badescape(next) ? parseerror() && emit() && switchto("data") && reconsume() : create(new DimensionToken(currtoken, consumeEscape())) && switchto("dimension") : emit() && switchto("data") && reconsume();
                break;

              case "dimension":
                namechar(code) ? currtoken.append(code) : 92 == code ? badescape(next()) ? parseerror() && emit() && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : emit() && switchto("data") && reconsume();
                break;

              case "sci-notation":
                currtoken.type = "number", digit(code) ? currtoken.append(code) : emit() && switchto("data") && reconsume();
                break;

              case "url":
                eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : 34 == code ? switchto("url-double-quote") : 39 == code ? switchto("url-single-quote") : 41 == code ? emit(new URLToken()) && switchto("data") : whitespace(code) ? donothing() : switchto("url-unquoted") && reconsume();
                break;

              case "url-double-quote":
                currtoken instanceof URLToken || create(new URLToken()), eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : 34 == code ? switchto("url-end") : newline(code) ? parseerror() && switchto("bad-url") : 92 == code ? newline(next()) ? consume() : badescape(next()) ? parseerror() && emit(new BadURLToken()) && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : currtoken.append(code);
                break;

              case "url-single-quote":
                currtoken instanceof URLToken || create(new URLToken()), eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : 39 == code ? switchto("url-end") : newline(code) ? parseerror() && switchto("bad-url") : 92 == code ? newline(next()) ? consume() : badescape(next()) ? parseerror() && emit(new BadURLToken()) && switchto("data") && reconsume() : currtoken.append(consumeEscape()) : currtoken.append(code);
                break;

              case "url-end":
                eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : whitespace(code) ? donothing() : 41 == code ? emit() && switchto("data") : parseerror() && switchto("bad-url") && reconsume();
                break;

              case "url-unquoted":
                currtoken instanceof URLToken || create(new URLToken()), eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : whitespace(code) ? switchto("url-end") : 41 == code ? emit() && switchto("data") : 34 == code || 39 == code || 40 == code || nonprintable(code) ? parseerror() && switchto("bad-url") : 92 == code ? badescape(next()) ? parseerror() && switchto("bad-url") : currtoken.append(consumeEscape()) : currtoken.append(code);
                break;

              case "bad-url":
                eof() ? parseerror() && emit(new BadURLToken()) && switchto("data") : 41 == code ? emit(new BadURLToken()) && switchto("data") : 92 == code ? badescape(next()) ? donothing() : consumeEscape() : donothing();
                break;

              case "unicode-range":
                for (var start = [ code ], end = [ code ], total = 1; 6 > total && hexdigit(next()); total++) consume(), 
                start.push(code), end.push(code);
                if (63 == next()) {
                    for (;6 > total && 63 == next(); total++) consume(), start.push("0".charCodeAt(0)), 
                    end.push("f".charCodeAt(0));
                    emit(new UnicodeRangeToken(start, end)) && switchto("data");
                } else if (45 == next(1) && hexdigit(next(2))) {
                    consume(), consume(), end = [ code ];
                    for (var total = 1; 6 > total && hexdigit(next()); total++) consume(), end.push(code);
                    emit(new UnicodeRangeToken(start, end)) && switchto("data");
                } else emit(new UnicodeRangeToken(start)) && switchto("data");
                break;

              default:
                catchfire("Unknown state '" + state + "'");
            }
        }
    }
    function stringFromCodeArray(arr) {
        return String.fromCharCode.apply(null, arr.filter(function(e) {
            return e;
        }));
    }
    function CSSParserToken() {
        return this;
    }
    function BadStringToken() {
        return this;
    }
    function BadURLToken() {
        return this;
    }
    function WhitespaceToken() {
        return this;
    }
    function CDOToken() {
        return this;
    }
    function CDCToken() {
        return this;
    }
    function ColonToken() {
        return this;
    }
    function SemicolonToken() {
        return this;
    }
    function OpenCurlyToken() {
        return this;
    }
    function CloseCurlyToken() {
        return this;
    }
    function OpenSquareToken() {
        return this;
    }
    function CloseSquareToken() {
        return this;
    }
    function OpenParenToken() {
        return this;
    }
    function CloseParenToken() {
        return this;
    }
    function EOFToken() {
        return this;
    }
    function DelimToken(code) {
        return this.value = String.fromCharCode(code), this;
    }
    function StringValuedToken() {
        return this;
    }
    function IdentifierToken(val) {
        this.value = [], this.append(val);
    }
    function FunctionToken(val) {
        this.value = val.finish().value;
    }
    function AtKeywordToken(val) {
        this.value = [], this.append(val);
    }
    function HashToken(val) {
        this.value = [], this.append(val);
    }
    function StringToken(val) {
        this.value = [], this.append(val);
    }
    function URLToken(val) {
        this.value = [], this.append(val);
    }
    function NumberToken(val) {
        this.value = [], this.append(val), this.type = "integer";
    }
    function PercentageToken(val) {
        val.finish(), this.value = val.value, this.repr = val.repr;
    }
    function DimensionToken(val, unit) {
        val.finish(), this.num = val.value, this.unit = [], this.repr = val.repr, this.append(unit);
    }
    function UnicodeRangeToken(start, end) {
        return start = parseInt(stringFromCodeArray(start), 16), end = void 0 === end ? start + 1 : parseInt(stringFromCodeArray(end), 16), 
        start > maximumallowedcodepoint && (end = start), start > end && (end = start), 
        end > maximumallowedcodepoint && (end = maximumallowedcodepoint), this.start = start, 
        this.end = end, this;
    }
    var between = function(num, first, last) {
        return num >= first && last >= num;
    }, maximumallowedcodepoint = 1114111;
    CSSParserToken.prototype.finish = function() {
        return this;
    }, CSSParserToken.prototype.toString = function() {
        return this.tokenType;
    }, CSSParserToken.prototype.toSourceString = CSSParserToken.prototype.toString, 
    CSSParserToken.prototype.toJSON = function() {
        return this.toString();
    }, BadStringToken.prototype = new CSSParserToken(), BadStringToken.prototype.tokenType = "BADSTRING", 
    BadURLToken.prototype = new CSSParserToken(), BadURLToken.prototype.tokenType = "BADURL", 
    WhitespaceToken.prototype = new CSSParserToken(), WhitespaceToken.prototype.tokenType = "WHITESPACE", 
    WhitespaceToken.prototype.toString = function() {
        return "WS";
    }, WhitespaceToken.prototype.toSourceString = function() {
        return " ";
    }, CDOToken.prototype = new CSSParserToken(), CDOToken.prototype.tokenType = "CDO", 
    CDCToken.prototype = new CSSParserToken(), CDCToken.prototype.tokenType = "CDC", 
    ColonToken.prototype = new CSSParserToken(), ColonToken.prototype.tokenType = ":", 
    SemicolonToken.prototype = new CSSParserToken(), SemicolonToken.prototype.tokenType = ";", 
    OpenCurlyToken.prototype = new CSSParserToken(), OpenCurlyToken.prototype.tokenType = "{", 
    CloseCurlyToken.prototype = new CSSParserToken(), CloseCurlyToken.prototype.tokenType = "}", 
    OpenSquareToken.prototype = new CSSParserToken(), OpenSquareToken.prototype.tokenType = "[", 
    CloseSquareToken.prototype = new CSSParserToken(), CloseSquareToken.prototype.tokenType = "]", 
    OpenParenToken.prototype = new CSSParserToken(), OpenParenToken.prototype.tokenType = "(", 
    CloseParenToken.prototype = new CSSParserToken(), CloseParenToken.prototype.tokenType = ")", 
    EOFToken.prototype = new CSSParserToken(), EOFToken.prototype.tokenType = "EOF", 
    DelimToken.prototype = new CSSParserToken(), DelimToken.prototype.tokenType = "DELIM", 
    DelimToken.prototype.toString = function() {
        return "DELIM(" + this.value + ")";
    }, DelimToken.prototype.toSourceString = function() {
        return this.value;
    }, StringValuedToken.prototype = new CSSParserToken(), StringValuedToken.prototype.append = function(val) {
        if (val instanceof Array) for (var i = 0; i < val.length; i++) this.value.push(val[i]); else this.value.push(val);
        return !0;
    }, StringValuedToken.prototype.finish = function() {
        return this.value = this.valueAsString(), this;
    }, StringValuedToken.prototype.ASCIImatch = function(str) {
        return this.valueAsString().toLowerCase() == str.toLowerCase();
    }, StringValuedToken.prototype.valueAsString = function() {
        return "string" == typeof this.value ? this.value : stringFromCodeArray(this.value);
    }, StringValuedToken.prototype.valueAsCodes = function() {
        if ("string" == typeof this.value) {
            for (var ret = [], i = 0; i < this.value.length; i++) ret.push(this.value.charCodeAt(i));
            return ret;
        }
        return this.value.filter(function(e) {
            return e;
        });
    }, IdentifierToken.prototype = new StringValuedToken(), IdentifierToken.prototype.tokenType = "IDENT", 
    IdentifierToken.prototype.toString = function() {
        return "IDENT(" + this.value + ")";
    }, IdentifierToken.prototype.toSourceString = function() {
        return this.value;
    }, FunctionToken.prototype = new StringValuedToken(), FunctionToken.prototype.tokenType = "FUNCTION", 
    FunctionToken.prototype.toString = function() {
        return "FUNCTION(" + this.value + ")";
    }, FunctionToken.prototype.toSourceString = function() {
        return this.value;
    }, AtKeywordToken.prototype = new StringValuedToken(), AtKeywordToken.prototype.tokenType = "AT-KEYWORD", 
    AtKeywordToken.prototype.toString = function() {
        return "AT(" + this.value + ")";
    }, AtKeywordToken.prototype.toSourceString = function() {
        return "@" + this.value;
    }, HashToken.prototype = new StringValuedToken(), HashToken.prototype.tokenType = "HASH", 
    HashToken.prototype.toString = function() {
        return "HASH(" + this.value + ")";
    }, HashToken.prototype.toSourceString = function() {
        return "#" + this.value;
    }, StringToken.prototype = new StringValuedToken(), StringToken.prototype.tokenType = "STRING", 
    StringToken.prototype.toString = function() {
        return '"' + this.value + '"';
    }, StringToken.prototype.toSourceString = StringToken.prototype.toString, URLToken.prototype = new StringValuedToken(), 
    URLToken.prototype.tokenType = "URL", URLToken.prototype.toString = function() {
        return "URL(" + this.value + ")";
    }, URLToken.prototype.toSourceString = function() {
        return "url('" + this.value + "')";
    }, NumberToken.prototype = new StringValuedToken(), NumberToken.prototype.tokenType = "NUMBER", 
    NumberToken.prototype.toString = function() {
        return "integer" == this.type ? "INT(" + this.value + ")" : "NUMBER(" + this.value + ")";
    }, NumberToken.prototype.toSourceString = function() {
        return "integer" == this.type ? this.value : this.value;
    }, NumberToken.prototype.finish = function() {
        return this.repr = this.valueAsString(), this.value = 1 * this.repr, Math.abs(this.value) % 1 != 0 && (this.type = "number"), 
        this;
    }, PercentageToken.prototype = new CSSParserToken(), PercentageToken.prototype.tokenType = "PERCENTAGE", 
    PercentageToken.prototype.toString = function() {
        return "PERCENTAGE(" + this.value + ")";
    }, PercentageToken.prototype.toSourceString = function() {
        return this.value + "%";
    }, DimensionToken.prototype = new CSSParserToken(), DimensionToken.prototype.tokenType = "DIMENSION", 
    DimensionToken.prototype.toString = function() {
        return "DIM(" + this.num + "," + this.unit + ")";
    }, DimensionToken.prototype.toSourceString = function() {
        return this.num + this.unit;
    }, DimensionToken.prototype.append = function(val) {
        if (val instanceof Array) for (var i = 0; i < val.length; i++) this.unit.push(val[i]); else this.unit.push(val);
        return !0;
    }, DimensionToken.prototype.finish = function() {
        return this.unit = stringFromCodeArray(this.unit), this.repr += this.unit, this;
    }, UnicodeRangeToken.prototype = new CSSParserToken(), UnicodeRangeToken.prototype.tokenType = "UNICODE-RANGE", 
    UnicodeRangeToken.prototype.toString = function() {
        return this.start + 1 == this.end ? "UNICODE-RANGE(" + this.start.toString(16).toUpperCase() + ")" : this.start < this.end ? "UNICODE-RANGE(" + this.start.toString(16).toUpperCase() + "-" + this.end.toString(16).toUpperCase() + ")" : "UNICODE-RANGE()";
    }, UnicodeRangeToken.prototype.toSourceString = function() {
        return this.start + 1 == this.end ? "UNICODE-RANGE(" + this.start.toString(16).toUpperCase() + ")" : this.start < this.end ? "UNICODE-RANGE(" + this.start.toString(16).toUpperCase() + "-" + this.end.toString(16).toUpperCase() + ")" : "UNICODE-RANGE()";
    }, UnicodeRangeToken.prototype.contains = function(code) {
        return code >= this.start && code < this.end;
    }, exports.tokenize = tokenize;
}), function() {
    var XMLHttpFactories, ajax, createXMLHTTPObject, getViewportSize, initLayoutEngine;
    XMLHttpFactories = [ function() {
        return new XMLHttpRequest();
    }, function() {
        return new ActiveXObject("Msxml2.XMLHTTP");
    }, function() {
        return new ActiveXObject("Msxml3.XMLHTTP");
    }, function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
    } ], createXMLHTTPObject = function() {
        var e, i, xmlhttp;
        for (xmlhttp = !1, i = 0; i < XMLHttpFactories.length; ) {
            try {
                xmlhttp = XMLHttpFactories[i++]();
            } catch (_error) {
                e = _error;
                continue;
            }
            break;
        }
        return xmlhttp;
    }, ajax = function(url, onload) {
        var xmlhttp;
        xmlhttp = createXMLHTTPObject(), xmlhttp.onreadystatechange = function() {
            if (4 === xmlhttp.readyState) {
                if (200 !== xmlhttp.status) throw "Error!";
                onload(xmlhttp.responseText);
            }
        }, xmlhttp.open("GET", url, !0), xmlhttp.send();
    }, getViewportSize = function() {
        var x, y;
        return x = 0, y = 0, window.innerHeight ? (x = window.innerWidth, y = window.innerHeight) : document.documentElement && document.documentElement.clientHeight ? (x = document.documentElement.clientWidth, 
        y = document.documentElement.clientHeight) : document.body && (x = document.body.clientWidth, 
        y = document.body.clientHeight), {
            width: x,
            height: y
        };
    }, (initLayoutEngine = function() {
        var analyzeStyleRule, analyzeStylesheet, head, i, innerSheetCount, links, onresize, outerSheetCount, sheets, styleElement, _i, _len;
        for (analyzeStyleRule = function(rule) {
            var declaration, declarations, hasDimension, token, _i, _j, _len, _len1, _ref, _ref1;
            for (declarations = [], _ref = rule.value, _i = 0, _len = _ref.length; _len > _i; _i++) {
                for (declaration = _ref[_i], hasDimension = !1, _ref1 = declaration.value, _j = 0, 
                _len1 = _ref1.length; _len1 > _j; _j++) token = _ref1[_j], "DIMENSION" !== token.tokenType || "vmin" !== token.unit && "vh" !== token.unit && "vw" !== token.unit || (hasDimension = !0);
                hasDimension && declarations.push(declaration);
            }
            return rule.value = declarations, declarations;
        }, analyzeStylesheet = function(sheet) {
            var atRules, decs, rule, rules, _i, _len, _ref;
            for (rules = [], _ref = sheet.value, _i = 0, _len = _ref.length; _len > _i; _i++) switch (rule = _ref[_i], 
            rule.type) {
              case "STYLE-RULE":
                decs = analyzeStyleRule(rule), 0 !== decs.length && rules.push(rule);
                break;

              case "AT-RULE":
                atRules = analyzeStylesheet(rule), 0 !== atRules.length && rules.push(rule);
            }
            return sheet.value = rules, rules;
        }, onresize = function() {
            var css, dims, generateRuleCode, generateSheetCode, map, sheet, url, vpAspectRatio, vpDims;
            vpDims = getViewportSize(), dims = {
                vh: vpDims.height / 100,
                vw: vpDims.width / 100
            }, dims.vmin = Math.min(dims.vh, dims.vw), vpAspectRatio = vpDims.width / vpDims.height, 
            map = function(a, f) {
                var a1, e, _i, _len;
                if (null != a.map) return a.map(f);
                for (a1 = [], _i = 0, _len = a.length; _len > _i; _i++) e = a[_i], a1.push(f(e));
                return a1;
            }, generateRuleCode = function(rule) {
                var declaration, declarations, ruleCss, token, _i, _j, _len, _len1, _ref, _ref1;
                for (declarations = [], ruleCss = map(rule.selector, function(o) {
                    return null != o.toSourceString ? o.toSourceString() : "";
                }).join(""), ruleCss += "{", _ref = rule.value, _i = 0, _len = _ref.length; _len > _i; _i++) {
                    for (declaration = _ref[_i], ruleCss += declaration.name, ruleCss += ":", _ref1 = declaration.value, 
                    _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) token = _ref1[_j], ruleCss += "DIMENSION" !== token.tokenType || "vmin" !== token.unit && "vh" !== token.unit && "vw" !== token.unit ? token.toSourceString() : "" + Math.floor(token.num * dims[token.unit]) + "px";
                    ruleCss += ";";
                }
                return ruleCss += "}\r";
            }, generateSheetCode = function(sheet) {
                var mar, nums, prelude, rule, sheetCss, source, t, t1, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
                for (sheetCss = "", _ref = sheet.value, _i = 0, _len = _ref.length; _len > _i; _i++) switch (rule = _ref[_i], 
                rule.type) {
                  case "STYLE-RULE":
                    sheetCss += generateRuleCode(rule);
                    break;

                  case "AT-RULE":
                    if ("media" === rule.name) {
                        for (prelude = "", mar = !1, nums = [], _ref1 = rule.prelude, _j = 0, _len1 = _ref1.length; _len1 > _j; _j++) if (t = _ref1[_j], 
                        "(" === t.name) {
                            for (prelude += "(", _ref2 = t.value, _k = 0, _len2 = _ref2.length; _len2 > _k; _k++) t1 = _ref2[_k], 
                            source = null != t1.toSourceString ? t1.toSourceString() : "", "IDENT" === t1.tokenType && "max-aspect-ratio" === source && (mar = !0), 
                            "NUMBER" === t1.tokenType && nums.push(parseInt(source)), prelude += source;
                            prelude += ")";
                        } else prelude += t.toSourceString();
                        vpAspectRatio < nums[0] / nums[1] && (sheetCss += generateSheetCode(rule));
                    } else {
                        for (prelude = "", _ref3 = rule.prelude, _l = 0, _len3 = _ref3.length; _len3 > _l; _l++) t = _ref3[_l], 
                        "(" === t.name ? (prelude += "(", prelude += map(t.value, function(o) {
                            return null != o.toSourceString ? o.toSourceString() : "";
                        }).join(""), prelude += ")") : prelude += t.toSourceString();
                        sheetCss += "@" + rule.name + " " + prelude + " {", sheetCss += generateSheetCode(rule), 
                        sheetCss += "}\n";
                    }
                }
                return sheetCss;
            }, css = "";
            for (url in sheets) sheet = sheets[url], css += generateSheetCode(sheet);
            return null != styleElement.styleSheet ? styleElement.styleSheet.cssText = css : styleElement.innerHTML = css;
        }, sheets = {}, styleElement = document.createElement("style"), head = document.getElementsByTagName("head")[0], 
        head.appendChild(styleElement), links = document.getElementsByTagName("link"), innerSheetCount = 0, 
        outerSheetCount = 0, _i = 0, _len = links.length; _len > _i; _i++) i = links[_i], 
        "stylesheet" === i.rel && (innerSheetCount++, ajax(i.href, function(cssText) {
            var sheet, tokenlist;
            tokenlist = tokenize(cssText), sheet = parse(tokenlist), analyzeStylesheet(sheet), 
            sheets[i.href] = sheet, outerSheetCount++, outerSheetCount === innerSheetCount && window.onresize();
        }));
        window.onresize = onresize;
    })();
}.call(this);