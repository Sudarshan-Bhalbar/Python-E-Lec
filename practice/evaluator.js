/* A deliberately small Python-like sandbox for the practice workspace. It is
   isolated from the page and supports the curriculum's core syntax: values,
   conditions, loops, collections, functions, files, exceptions, and classes. */
(function () {
  function pyError(type, message) { const error = new Error(message || type); error.pyType = type; return error; }
  function errorType(error) { return error && error.pyType ? error.pyType : 'RuntimeError'; }
  function truthy(value) { if (value === null || value === undefined || value === false || value === 0 || value === '') return false; if (Array.isArray(value) || value instanceof Set) return Array.isArray(value) ? value.length !== 0 : value.size !== 0; return true; }
  function equal(a, b) { if (a instanceof Set || b instanceof Set) return a instanceof Set && b instanceof Set && a.size === b.size && [...a].every(value => [...b].some(item => equal(value, item))); if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => equal(value, b[index])); return a === b; }
  function pyStr(value, repr = false) {
    if (value === true) return 'True'; if (value === false) return 'False'; if (value === null || value === undefined) return 'None';
    if (typeof value === 'string') return repr ? `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'` : value;
    if (Array.isArray(value)) return '[' + value.map(item => pyStr(item, true)).join(', ') + ']';
    if (value && value.__tuple) return '(' + value.items.map(item => pyStr(item, true)).join(', ') + (value.items.length === 1 ? ',' : '') + ')';
    if (value instanceof Set) return '{' + [...value].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).map(item => pyStr(item, true)).join(', ') + '}';
    if (value && value.__dict) return '{' + Object.keys(value).filter(key => key !== '__dict').map(key => `${pyStr(key, true)}: ${pyStr(value[key], true)}`).join(', ') + '}';
    if (value && value.__typeName) return value.__typeName; if (value instanceof PyClass) return `<class '${value.name}'>`; if (value instanceof PyInstance) { const display = value.classRef.findMethod('__str__'); if (display) return display.call([], { currentEnv: null, inputs: [], inputAt: 0, output: [], files: new Map(), steps: 0 }, value); return `<${value.classRef.name} object>`; } return String(value);
  }
  function iterable(value) { if (value instanceof FileValue) return value.readlines(); if (value instanceof Set) return [...value]; if (Array.isArray(value)) return value; if (value && value.__tuple) return value.items; if (typeof value === 'string') return [...value]; if (value && value.__dict) return Object.keys(value).filter(key => key !== '__dict'); return []; }
  function normalizeString(raw) { return raw.replace(/\\(\\|n|r|t|"|')/g, (_, code) => ({ '\\': '\\', n: '\n', r: '\r', t: '\t', '"': '"', "'": "'" }[code])); }

  class Env { constructor(parent = null) { this.values = Object.create(null); this.parent = parent; this.currentClass = null; } has(name) { return Object.prototype.hasOwnProperty.call(this.values, name) || !!(this.parent && this.parent.has(name)); } get(name) { if (Object.prototype.hasOwnProperty.call(this.values, name)) return this.values[name]; if (this.parent) return this.parent.get(name); throw pyError('NameError', `name '${name}' is not defined`); } set(name, value) { this.values[name] = value; } }
  class FileValue { constructor(ctx, path, mode) { this.ctx = ctx; this.path = path; this.mode = mode; this.closed = false; this.position = 0; if (mode.includes('r') && !ctx.files.has(path)) throw pyError('FileNotFoundError', `No such file: ${path}`); if (mode.includes('w')) ctx.files.set(path, ''); } ensureWritable() { if (this.closed) throw pyError('ValueError', 'I/O operation on closed file'); if (!/[wa+]/.test(this.mode)) throw pyError('UnsupportedOperation', 'not writable'); } write(value) { this.ensureWritable(); const text = String(value); if (this.mode.includes('a')) this.ctx.files.set(this.path, (this.ctx.files.get(this.path) || '') + text); else { this.ctx.files.set(this.path, text); this.position = text.length; } return text.length; } read() { if (this.closed) throw pyError('ValueError', 'I/O operation on closed file'); const text = this.ctx.files.get(this.path) || ''; const result = text.slice(this.position); this.position = text.length; return result; } readline() { const text = this.ctx.files.get(this.path) || ''; if (this.position >= text.length) return ''; const end = text.indexOf('\n', this.position); const stop = end < 0 ? text.length : end + 1; const result = text.slice(this.position, stop); this.position = stop; return result; } readlines() { const result = []; let line; while ((line = this.readline()) !== '') result.push(line); return result; } close() { this.closed = true; } }
  class PyFunction { constructor(name, params, body, closure, owner = null) { this.name = name; this.params = params; this.body = body; this.closure = closure; this.owner = owner; } call(args, ctx, receiver = null) { const env = new Env(this.closure); env.currentClass = this.owner; const values = receiver === null ? args : [receiver, ...args]; this.params.forEach((name, index) => env.set(name, values[index] === undefined ? null : values[index])); const previous = ctx.currentEnv; ctx.currentEnv = env; try { runLines(this.body, env, ctx, this.body[0]?.indent || 0); } catch (signal) { if (signal && signal.kind === 'return') return signal.value; throw signal; } finally { ctx.currentEnv = previous; } return null; } }
  class PyClass { constructor(name, base, methods, attrs) { this.name = name; this.base = base; this.methods = methods; this.attrs = attrs; } findMethod(name) { return this.methods[name] || (this.base && this.base.findMethod(name)); } call(args, ctx) { const instance = new PyInstance(this); const init = this.findMethod('__init__'); if (init) init.call(args, ctx, instance); return instance; } }
  class PyInstance { constructor(classRef) { this.classRef = classRef; this.fields = Object.create(null); } }
  class SuperValue { constructor(instance, base) { this.instance = instance; this.base = base; } }

  function lex(source) { const tokens = []; let i = 0; while (i < source.length) { const c = source[i]; if (/\s/.test(c)) { i++; continue; } if (c === '#') break; if ((c === 'f' || c === 'F') && (source[i + 1] === '"' || source[i + 1] === "'")) { const quote = source[i + 1]; let j = i + 2; while (j < source.length && source[j] !== quote) j++; tokens.push({ type: 'fstring', value: normalizeString(source.slice(i + 2, j)) }); i = j + 1; continue; } if (c === '"' || c === "'") { const quote = c; let j = i + 1, escaped = false; while (j < source.length) { if (!escaped && source[j] === quote) break; escaped = !escaped && source[j] === '\\'; if (source[j] !== '\\') escaped = false; j++; } if (j >= source.length) throw pyError('SyntaxError', 'unterminated string'); tokens.push({ type: 'string', value: normalizeString(source.slice(i + 1, j)) }); i = j + 1; continue; } if (/\d/.test(c)) { const match = source.slice(i).match(/^\d+(?:\.\d+)?/)[0]; tokens.push({ type: 'number', value: Number(match) }); i += match.length; continue; } if (/[A-Za-z_]/.test(c)) { const match = source.slice(i).match(/^[A-Za-z_]\w*/)[0]; tokens.push({ type: 'id', value: match }); i += match.length; continue; } const three = source.slice(i, i + 3); if (three === '//=') { tokens.push({ type: 'op', value: '//=' }); i += 3; continue; } const two = source.slice(i, i + 2); if (['==', '!=', '<=', '>=', '//', '**', '+=', '-=', '*=', '/='].includes(two)) { tokens.push({ type: 'op', value: two }); i += 2; continue; } if ('+-*/%<>=.,:()[]{};|&'.includes(c)) { tokens.push({ type: 'op', value: c }); i++; continue; } throw pyError('SyntaxError', `unsupported character: ${c}`); } tokens.push({ type: 'eof', value: '' }); return tokens; }
  class Parser {
    constructor(source, env, ctx) { this.tokens = lex(source); this.at = 0; this.env = env; this.ctx = ctx; }
    peek(value) { return this.tokens[this.at].value === value; } take(value) { if (value && !this.peek(value)) throw pyError('SyntaxError', `expected ${value}`); return this.tokens[this.at++]; }
    expression(min = 0) { let left = this.primary(); const precedence = { or: 1, and: 2, '|': 3, '&': 4, '==': 5, '!=': 5, '<': 6, '>': 6, '<=': 6, '>=': 6, in: 6, 'not in': 6, '+': 7, '-': 7, '*': 8, '/': 8, '//': 8, '%': 8, '**': 9 }; while (true) { let op = this.tokens[this.at].value; if (op === 'not' && this.tokens[this.at + 1].value === 'in') op = 'not in'; const level = precedence[op]; if (!level || level < min) break; this.at += op === 'not in' ? 2 : 1; const right = this.expression(level + (op === '**' ? 0 : 1)); left = this.apply(op, left, right); } if (min === 0 && this.peek('if')) { this.take('if'); const condition = this.expression(); this.take('else'); const alternate = this.expression(); left = truthy(condition) ? left : alternate; } return left; }
    primary() {
      const token = this.take();
      let value;
      if (token.type === 'number' || token.type === 'string') value = token.value;
      else if (token.type === 'fstring') value = token.value.replace(/\\{([^{}]+)\\}/g, (_, source) => pyStr(new Parser(source, this.env, this.ctx).expression()));
      else if (token.value === 'True') value = true;
      else if (token.value === 'False') value = false;
      else if (token.value === 'None') value = null;
      else if (token.value === 'not') value = !truthy(this.expression(8));
      else if (token.value === '-') value = -Number(this.expression(8));
      else if (token.value === '+') value = Number(this.expression(8));
      else if (token.value === '(') {
        if (this.peek(')')) {
          this.take(')');
          value = { __tuple: true, items: [] };
        } else {
          const first = this.expression();
          if (this.peek(',')) {
            const items = [first];
            while (this.peek(',')) {
              this.take(',');
              if (!this.peek(')')) items.push(this.expression());
            }
            this.take(')');
            value = { __tuple: true, items };
          } else {
            this.take(')');
            value = first;
          }
        }
      } else if (token.value === '[') {
        const values = [];
        if (!this.peek(']')) {
          const firstStart = this.at;
          let firstDepth = 0;
          while (this.at < this.tokens.length && !(firstDepth === 0 && this.peek('for'))) {
            if ('([{'.includes(this.tokens[this.at].value)) firstDepth++;
            if (')]}'.includes(this.tokens[this.at].value)) firstDepth--;
            this.at++;
          }
          if (this.at < this.tokens.length && this.peek('for')) {
            this.take('for');
            const name = this.take().value;
            this.take('in');
            const source = this.expression(1);
            let conditionStart = null;
            let conditionEnd = null;
            if (this.peek('if')) {
              this.take('if');
              conditionStart = this.at;
              let conditionDepth = 0;
              while (this.at < this.tokens.length && !(conditionDepth === 0 && this.peek(']'))) {
                if ('([{'.includes(this.tokens[this.at].value)) conditionDepth++;
                if (')]}'.includes(this.tokens[this.at].value)) conditionDepth--;
                this.at++;
              }
              conditionEnd = this.at;
            }
            this.take(']');
            const afterList = this.at;
            for (const item of iterable(source)) {
              this.env.set(name, item);
              let allowed = true;
              if (conditionStart !== null) { this.at = conditionStart; allowed = truthy(this.expression()); }
              if (allowed) { this.at = firstStart; values.push(this.expression()); }
            }
            this.at = afterList;
            return values;
          }
          this.at = firstStart;
          const first = this.expression();
          values.push(first);
          while (this.peek(',')) {
            this.take(',');
            if (!this.peek(']')) values.push(this.expression());
          }
        }
        this.take(']');
        value = values;
      } else if (token.value === '{') {
        if (this.peek('}')) {
          this.take('}');
          value = new Set();
        } else {
          const first = this.expression();
          if (this.peek(':')) {
            this.take(':');
            const dict = { __dict: true };
            dict[keyString(first)] = this.expression();
            while (this.peek(',')) {
              this.take(',');
              if (!this.peek('}')) {
                const key = this.expression();
                this.take(':');
                dict[keyString(key)] = this.expression();
              }
            }
            this.take('}');
            value = dict;
          } else {
            const set = new Set([first]);
            while (this.peek(',')) {
              this.take(',');
              if (!this.peek('}')) set.add(this.expression());
            }
            this.take('}');
            value = set;
          }
        }
      } else if (token.type === 'id') {
        value = this.env.has(token.value) ? this.env.get(token.value) : builtin(token.value);
      } else {
        throw pyError('SyntaxError', `unexpected token: ${token.value}`);
      }
      while (true) {
        if (this.peek('(')) {
          value = callValue(value, this.arguments(), this.ctx);
          continue;
        }
        if (this.peek('.')) {
          this.take('.');
          value = getAttr(value, this.take().value);
          continue;
        }
        if (this.peek('[')) {
          this.take('[');
          let start = null;
          let stop = null;
          let step = null;
          if (!this.peek(':') && !this.peek(']')) start = this.expression();
          if (this.peek(':')) {
            this.take(':');
            if (!this.peek(':') && !this.peek(']')) stop = this.expression();
            if (this.peek(':')) {
              this.take(':');
              if (!this.peek(']')) step = this.expression();
            }
            this.take(']');
            value = sliceValue(value, start, stop, step);
          } else {
            this.take(']');
            value = indexValue(value, start);
          }
          continue;
        }
        break;
      }
      return value;
    }
    arguments() { this.take('('); const args = []; if (!this.peek(')')) { do { args.push(this.expression()); if (!this.peek(',')) break; this.take(','); } while (!this.peek(')')); } this.take(')'); return args; }
    apply(op, left, right) { if (op === '+') { if (left && left.__tuple && right && right.__tuple) return { __tuple: true, items: left.items.concat(right.items) }; if (Array.isArray(left) && Array.isArray(right)) return left.concat(right); if ((typeof left === 'string') !== (typeof right === 'string') && (typeof left === 'string' || typeof right === 'string')) throw pyError('TypeError', 'can only concatenate matching types'); return left + right; } if (op === '-') { if (left instanceof Set && right instanceof Set) return new Set([...left].filter(value => !right.has(value))); return left - right; } if (op === '*') { if (typeof left === 'string') return left.repeat(Number(right)); if (Array.isArray(left)) return Array.from({ length: Number(right) }, () => left).flat(); if (left && left.__tuple) return { __tuple: true, items: Array.from({ length: Number(right) }, () => left.items).flat() }; return left * right; } if (op === '|') { if (left && left.__dict && right && right.__dict) return Object.assign({ __dict: true }, left, right); return new Set([...(left instanceof Set ? left : []), ...(right instanceof Set ? right : [])]); } if (op === '&') return new Set([...(left instanceof Set ? left : [])].filter(value => right instanceof Set && right.has(value))); if (op === '/') { if (right === 0) throw pyError('ZeroDivisionError', 'division by zero'); return left / right; } if (op === '//') { if (right === 0) throw pyError('ZeroDivisionError', 'division by zero'); return Math.floor(left / right); } if (op === '%') return left % right; if (op === '**') return left ** right; if (op === '==') return equal(left, right); if (op === '!=') return !equal(left, right); if (op === '<') return left < right; if (op === '>') return left > right; if (op === '<=') return left <= right; if (op === '>=') return left >= right; if (op === 'in') return contains(right, left); if (op === 'not in') return !contains(right, left); if (op === 'and') return truthy(left) ? right : left; if (op === 'or') return truthy(left) ? left : right; throw pyError('SyntaxError', `unsupported operator: ${op}`); }
  }
  function keyString(value) { return typeof value === 'string' ? value : String(value); }
  function contains(container, value) { if (typeof container === 'string') return container.includes(String(value)); if (container instanceof Set) return container.has(value); if (container && container.__tuple) return container.items.some(item => equal(item, value)); if (container && container.__dict) return Object.prototype.hasOwnProperty.call(container, keyString(value)); return Array.isArray(container) ? container.some(item => equal(item, value)) : false; }
  function indexValue(value, index) { const source = value && value.__tuple ? value.items : value; const i = Number(index); if (Array.isArray(source) || typeof source === 'string') { const at = i < 0 ? source.length + i : i; if (at < 0 || at >= source.length) { if (typeof source === 'string') return null; throw pyError('IndexError', 'index out of range'); } return source[at]; } if (source instanceof Set) return [...source][i]; if (source && source.__dict) { const key = keyString(index); if (!Object.prototype.hasOwnProperty.call(source, key)) throw pyError('KeyError', key); return source[key]; } throw pyError('TypeError', 'object is not subscriptable'); }
  function sliceValue(value, start, stop, step) { const source = value && value.__tuple ? value.items : value; if (!Array.isArray(source) && typeof source !== 'string') throw pyError('TypeError', 'object is not sliceable'); const n = source.length, stride = step == null ? 1 : Number(step); if (!stride) throw pyError('ValueError', 'slice step cannot be zero'); let from = start == null ? (stride < 0 ? n - 1 : 0) : Number(start); let to = stop == null ? (stride < 0 ? -1 : n) : Number(stop); if (from < 0) from += n; if (to < 0 && stop != null) to += n; const out = []; if (stride > 0) for (let i = Math.max(0, from); i < Math.min(n, to); i += stride) out.push(source[i]); else for (let i = Math.min(n - 1, from); i > to; i += stride) out.push(source[i]); return value && value.__tuple ? { __tuple: true, items: out } : Array.isArray(source) ? out : out.join(''); }
  function builtin(name) { const exceptionNames = ['ValueError', 'TypeError', 'IndexError', 'KeyError', 'NameError', 'ZeroDivisionError', 'FileNotFoundError', 'RuntimeError', 'Exception']; if (exceptionNames.includes(name)) return { __exception: name }; if (['len', 'str', 'int', 'float', 'bool', 'input', 'print', 'range', 'sum', 'min', 'max', 'abs', 'sorted', 'list', 'set', 'type', 'open', 'super'].includes(name)) return { __builtin: name }; throw pyError('NameError', `name '${name}' is not defined`); }
  function callValue(fn, args, ctx) { if (fn && fn.__exception) throw pyError(fn.__exception, args.length ? pyStr(args[0]) : fn.__exception); if (fn && fn.__builtin) { const name = fn.__builtin; if (name === 'input') return ctx.inputs[ctx.inputAt++] ?? ''; if (name === 'print') { ctx.output.push(args.map(value => pyStr(value)).join(' ')); return null; } if (name === 'len') return iterable(args[0]).length; if (name === 'str') return pyStr(args[0]); if (name === 'int') { const value = Number(args[0]); if (Number.isNaN(value)) throw pyError('ValueError', 'invalid literal'); return Math.trunc(value); } if (name === 'float') { const value = Number(args[0]); if (Number.isNaN(value)) throw pyError('ValueError', 'invalid float'); return value; } if (name === 'bool') return truthy(args[0]); if (name === 'range') { let start = 0, stop = args[0], step = 1; if (args.length > 1) { start = args[0]; stop = args[1]; } if (args.length > 2) step = args[2]; const out = []; if (step > 0) for (let i = start; i < stop; i += step) out.push(i); else for (let i = start; i > stop; i += step) out.push(i); return out; } if (name === 'sum') return iterable(args[0]).reduce((total, value) => total + value, 0); if (name === 'min') return Math.min(...iterable(args[0])); if (name === 'max') return Math.max(...iterable(args[0])); if (name === 'abs') return Math.abs(args[0]); if (name === 'sorted') return iterable(args[0]).slice().sort((a, b) => a - b); if (name === 'list') return args[0] == null ? [] : iterable(args[0]).slice(); if (name === 'set') return new Set(iterable(args[0])); if (name === 'type') { const value = args[0]; return { __typeName: value instanceof PyInstance ? value.classRef.name : value === null ? 'NoneType' : Array.isArray(value) ? 'list' : typeof value === 'number' ? (Number.isInteger(value) ? 'int' : 'float') : typeof value === 'string' ? 'str' : typeof value === 'boolean' ? 'bool' : 'object' }; } if (name === 'open') return new FileValue(ctx, String(args[0]), args[1] || 'r'); if (name === 'super') { const self = ctx.currentEnv.get('self'); const owner = ctx.currentEnv.currentClass; return new SuperValue(self, owner && owner.base); } } if (fn instanceof PyFunction) return fn.call(args, ctx); if (fn instanceof PyClass) return fn.call(args, ctx); if (fn && fn.__method) return fn.__method.call(args, ctx, fn.receiver); if (typeof fn === 'function') return fn(...args); throw pyError('TypeError', 'object is not callable'); }
  function getAttr(target, name) { if (target instanceof PyInstance) { if (Object.prototype.hasOwnProperty.call(target.fields, name)) return target.fields[name]; const method = target.classRef.findMethod(name); if (method) return { __method: method, receiver: target }; if (name === '__class__') return target.classRef; throw pyError('AttributeError', `${target.classRef.name} has no attribute ${name}`); } if (target instanceof SuperValue) { const method = target.base && target.base.findMethod(name); if (method) return { __method: method, receiver: target.instance }; throw pyError('AttributeError', 'super object has no attribute ' + name); } if (target instanceof PyClass && name === '__name__') return target.name; if (target && target.__typeName && name === '__name__') return target.__typeName; if (target instanceof FileValue && ['write', 'read', 'readline', 'readlines', 'close'].includes(name)) return (...args) => target[name](...args); if (typeof target === 'string') { const methods = { upper: () => target.toUpperCase(), lower: () => target.toLowerCase(), title: () => target.toLowerCase().replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase()), capitalize: () => target ? target[0].toUpperCase() + target.slice(1).toLowerCase() : target, strip: () => target.trim(), lstrip: () => target.replace(/^\s+/, ''), rstrip: () => target.replace(/\s+$/, ''), isdigit: () => /^\d+$/.test(target), isalpha: () => /^[A-Za-z]+$/.test(target), isalnum: () => /^[A-Za-z0-9]+$/.test(target), islower: () => /[a-z]/.test(target) && !/[A-Z]/.test(target), isupper: () => /[A-Z]/.test(target) && !/[a-z]/.test(target), replace: (a, b) => target.split(String(a)).join(String(b)), find: a => target.indexOf(String(a)), count: a => a === '' ? target.length + 1 : target.split(String(a)).length - 1, startswith: a => target.startsWith(String(a)), endswith: a => target.endsWith(String(a)), split: sep => sep === undefined ? (target.trim() ? target.trim().split(/\s+/) : []) : target.split(String(sep)), join: values => iterable(values).map(item => pyStr(item)).join(target) }; if (methods[name]) return (...args) => methods[name](...args); } if (Array.isArray(target) || (target && target.__tuple)) { const values = target.__tuple ? target.items : target; const methods = { append: value => { values.push(value); return null; }, extend: value => { values.push(...iterable(value)); return null; }, pop: () => values.pop(), remove: value => { const index = values.findIndex(item => equal(item, value)); if (index < 0) throw pyError('ValueError', 'item not found'); values.splice(index, 1); return null; }, insert: (index, value) => { values.splice(index, 0, value); return null; }, count: value => values.filter(item => equal(item, value)).length, index: value => { const index = values.findIndex(item => equal(item, value)); if (index < 0) throw pyError('ValueError', 'item not found'); return index; }, sort: () => { values.sort((a, b) => a - b); return null; }, reverse: () => { values.reverse(); return null; }, copy: () => values.slice(), join: sep => values.map(item => pyStr(item)).join(String(sep)) }; if (methods[name]) return (...args) => methods[name](...args); } if (target && target.__dict) { if (name === 'get') return (key, fallback = null) => Object.prototype.hasOwnProperty.call(target, keyString(key)) ? target[keyString(key)] : fallback; if (name === 'keys') return () => Object.keys(target).filter(key => key !== '__dict'); if (name === 'values') return () => Object.keys(target).filter(key => key !== '__dict').map(key => target[key]); if (name === 'items') return () => Object.keys(target).filter(key => key !== '__dict').map(key => ({ __tuple: true, items: [key, target[key]] })); if (name === 'pop') return (key, fallback = null) => { const k = keyString(key); if (!Object.prototype.hasOwnProperty.call(target, k)) return fallback; const value = target[k]; delete target[k]; return value; }; if (name === 'copy') return () => { const copy = { __dict: true }; Object.keys(target).filter(key => key !== '__dict').forEach(key => copy[key] = target[key]); return copy; }; } if (target instanceof Set) { if (name === 'add') return value => { target.add(value); return null; }; if (name === 'remove') return value => { target.delete(value); return null; }; } throw pyError('AttributeError', `object has no attribute ${name}`); }
  function setAttr(target, name, value) { if (target instanceof PyInstance) target.fields[name] = value; else if (target && target.__dict) target[name] = value; else throw pyError('AttributeError', 'cannot set attribute'); }
  function cleanLine(raw) { let quote = null, escaped = false; for (let i = 0; i < raw.length; i++) { const c = raw[i]; if (escaped) { escaped = false; continue; } if (c === '\\') { escaped = true; continue; } if (quote) { if (c === quote) quote = null; } else if (c === '"' || c === "'") quote = c; else if (c === '#') return raw.slice(0, i); } return raw; }
  function prepared(code) { return String(code || '').replace(/\r/g, '').split('\n').map(raw => ({ raw, text: cleanLine(raw).trim(), indent: (raw.match(/^\s*/) || [''])[0].length })).filter(line => line.text); }
  function findTopLevel(line, operators) { let quote = null, escaped = false, depth = 0; for (let i = 0; i < line.length; i++) { const c = line[i]; if (escaped) { escaped = false; continue; } if (c === '\\') { escaped = true; continue; } if (quote) { if (c === quote) quote = null; continue; } if (c === '"' || c === "'") { quote = c; continue; } if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--; else if (!depth) for (const op of operators) if (line.startsWith(op, i) && !(op === '=' && ['=', '<', '>', '!'].includes(line[i - 1]))) return { index: i, op }; } return null; }
  function assignTarget(target, value, env, ctx) { target = target.trim(); if (target.includes(',')) { const names = target.split(',').map(name => name.trim()); const values = value && value.__tuple ? value.items : iterable(value); names.forEach((name, index) => assignTarget(name, values[index], env, ctx)); return; } const attr = target.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/); if (attr) { setAttr(env.get(attr[1]), attr[2], value); return; } const path = target.match(/^([A-Za-z_]\w*)(.*)$/); if (path && path[2].startsWith('[')) { let object = env.get(path[1]); let rest = path[2]; while (rest) { const part = rest.match(/^\[([^\]]+)\](.*)$/); if (!part) break; const key = evaluate(part[1], env, ctx); if (!part[2]) { if (Array.isArray(object)) object[Number(key)] = value; else if (object && object.__dict) object[keyString(key)] = value; else throw pyError('TypeError', 'cannot assign item'); return; } object = object && object.__dict ? object[keyString(key)] : object[Number(key)]; rest = part[2]; } } if (!/^[A-Za-z_]\w*$/.test(target)) throw pyError('SyntaxError', 'invalid assignment target'); env.set(target, value); }
  function evaluate(source, env, ctx) { return new Parser(source, env, ctx).expression(); }
  function evaluateAssigned(source, env, ctx) { let quote = null, depth = 0, start = 0, parts = []; for (let i = 0; i < source.length; i++) { const c = source[i]; if (c === '"' || c === "'") quote = quote === c ? null : (quote || c); if (quote) continue; if ('([{'.includes(c)) depth++; if (')]}'.includes(c)) depth--; if (c === ',' && depth === 0) { parts.push(source.slice(start, i)); start = i + 1; } } if (parts.length === 0) return evaluate(source, env, ctx); parts.push(source.slice(start)); return { __tuple: true, items: parts.map(part => evaluate(part, env, ctx)) }; }
  function simpleStatement(line, env, ctx) { if (line === 'pass') return; if (line === 'break') throw { kind: 'break' }; if (line === 'continue') throw { kind: 'continue' }; if (line.startsWith('return')) throw { kind: 'return', value: line.length > 6 ? evaluate(line.slice(6).trim(), env, ctx) : null }; if (line.startsWith('raise ')) { const value = evaluate(line.slice(6), env, ctx); if (value instanceof Error) throw value; if (value && value.__exception) throw pyError(value.__exception, value.__exception); throw pyError('RuntimeError', pyStr(value)); } const assignment = findTopLevel(line, ['//=', '+=', '-=', '*=', '/=', '=']); if (assignment) { const left = line.slice(0, assignment.index); const right = evaluateAssigned(line.slice(assignment.index + assignment.op.length), env, ctx); if (assignment.op === '=') assignTarget(left, right, env, ctx); else { const current = evaluate(left, env, ctx); const next = assignment.op === '+=' ? current + right : assignment.op === '-=' ? current - right : assignment.op === '*=' ? current * right : assignment.op === '/=' ? current / right : Math.floor(current / right); assignTarget(left, next, env, ctx); } return; } evaluate(line, env, ctx); }
  function bodyBounds(lines, at, indent) { const bodyIndent = lines[at + 1] && lines[at + 1].indent > indent ? lines[at + 1].indent : indent + 4; let end = at + 1; while (end < lines.length && lines[end].indent > indent) end++; return { start: at + 1, end, indent: bodyIndent }; }
  function matches(error, typeValue) { const names = typeValue && typeValue.__tuple ? typeValue.items : [typeValue]; return names.some(value => value && value.__exception && (value.__exception === errorType(error) || value.__exception === 'Exception')); }
  function runLines(lines, env, ctx, baseIndent) { for (let i = 0; i < lines.length;) { const current = lines[i]; if (current.indent < baseIndent) return; if (current.indent > baseIndent) { i++; continue; } const line = current.text; ctx.steps++; if (ctx.steps > 5000) throw pyError('RuntimeError', 'program stopped: too many statements');
      if (/^(if|while|for)\b.*:$/.test(line)) { const keyword = line.split(/\s+/)[0], header = line.slice(keyword.length, -1).trim(), bounds = bodyBounds(lines, i, baseIndent); if (keyword === 'if') { const branches = [{ condition: header, ...bounds }]; let next = bounds.end; while (next < lines.length && lines[next].indent === baseIndent && /^(elif|else)\b/.test(lines[next].text)) { const branch = lines[next], branchBounds = bodyBounds(lines, next, baseIndent); branches.push({ condition: branch.text.startsWith('elif') ? branch.text.slice(4, -1).trim() : null, ...branchBounds }); next = branchBounds.end; } for (const branch of branches) if (branch.condition === null || truthy(evaluate(branch.condition, env, ctx))) { runLines(lines.slice(branch.start, branch.end), env, ctx, branch.indent); break; } i = next; continue; } if (keyword === 'while') { let guard = 0; while (truthy(evaluate(header, env, ctx))) { if (++guard > 1000) throw pyError('RuntimeError', 'while loop exceeded limit'); try { runLines(lines.slice(bounds.start, bounds.end), env, ctx, bounds.indent); } catch (signal) { if (signal.kind === 'break') break; if (signal.kind === 'continue') continue; throw signal; } } i = bounds.end; continue; } const match = header.match(/^(.+?)\s+in\s+(.+)$/); if (!match) throw pyError('SyntaxError', 'invalid for loop'); for (const value of iterable(evaluate(match[2], env, ctx))) { assignTarget(match[1], value, env, ctx); try { runLines(lines.slice(bounds.start, bounds.end), env, ctx, bounds.indent); } catch (signal) { if (signal.kind === 'break') break; if (signal.kind === 'continue') continue; throw signal; } } i = bounds.end; continue; }
      if (/^def\s+\w+\(.*\):$/.test(line)) { const match = line.match(/^def\s+(\w+)\((.*)\):$/), bounds = bodyBounds(lines, i, baseIndent); const params = match[2].trim() ? match[2].split(',').map(name => name.trim()) : []; env.set(match[1], new PyFunction(match[1], params, lines.slice(bounds.start, bounds.end), env, env.currentClass)); i = bounds.end; continue; }
      if (/^class\s+\w+(\(.*\))?:$/.test(line)) { const match = line.match(/^class\s+(\w+)(?:\(([^)]+)\))?:$/), bounds = bodyBounds(lines, i, baseIndent), base = match[2] ? env.get(match[2].trim()) : null, classEnv = new Env(env); runLines(lines.slice(bounds.start, bounds.end), classEnv, ctx, bounds.indent); const methods = Object.create(null); for (const [name, value] of Object.entries(classEnv.values)) if (value instanceof PyFunction) methods[name] = value; const cls = new PyClass(match[1], base, methods, classEnv.values); Object.values(methods).forEach(method => { method.owner = cls; }); env.set(match[1], cls); i = bounds.end; continue; }
      if (line === 'try:') { const tryBounds = bodyBounds(lines, i, baseIndent); let next = tryBounds.end; const catches = []; while (next < lines.length && lines[next].indent === baseIndent && lines[next].text.startsWith('except')) { const clause = lines[next], clauseBounds = bodyBounds(lines, next, baseIndent), match = clause.text.match(/^except\s+(.+?)(?:\s+as\s+(\w+))?:$/); catches.push({ type: evaluate(match[1], env, ctx), name: match[2], ...clauseBounds }); next = clauseBounds.end; } let elseBlock = null, finallyBlock = null; if (next < lines.length && lines[next].indent === baseIndent && lines[next].text === 'else:') { elseBlock = bodyBounds(lines, next, baseIndent); next = elseBlock.end; } if (next < lines.length && lines[next].indent === baseIndent && lines[next].text === 'finally:') { finallyBlock = bodyBounds(lines, next, baseIndent); next = finallyBlock.end; } let failure = null; try { runLines(lines.slice(tryBounds.start, tryBounds.end), env, ctx, tryBounds.indent); } catch (caught) { if (caught && caught.kind) throw caught; failure = caught; const handler = catches.find(item => matches(caught, item.type)); if (!handler) throw caught; if (handler.name) env.set(handler.name, caught.message); runLines(lines.slice(handler.start, handler.end), env, ctx, handler.indent); } if (!failure && elseBlock) runLines(lines.slice(elseBlock.start, elseBlock.end), env, ctx, elseBlock.indent); if (finallyBlock) runLines(lines.slice(finallyBlock.start, finallyBlock.end), env, ctx, finallyBlock.indent); i = next; continue; }
      if (line.startsWith('with ') && line.endsWith(':')) { const match = line.match(/^with\s+(.+)\s+as\s+(\w+):$/), bounds = bodyBounds(lines, i, baseIndent), resource = evaluate(match[1], env, ctx); env.set(match[2], resource); try { runLines(lines.slice(bounds.start, bounds.end), env, ctx, bounds.indent); } finally { if (resource && typeof resource.close === 'function') resource.close(); } i = bounds.end; continue; }
      simpleStatement(line, env, ctx); i++;
    } }
  function execute(code, inputs) { const ctx = { inputs: inputs || [], inputAt: 0, output: [], files: new Map(), steps: 0, currentEnv: null }; const env = new Env(); ctx.currentEnv = env; runLines(prepared(code), env, ctx, 0); return { stdout: ctx.output.join('\n'), inputUsed: ctx.inputAt }; }
  function normalizeOutput(value) { return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n$/, ''); }
  window.practiceEvaluator = { run(code, inputs) { try { return { ok: true, ...execute(code, inputs) }; } catch (caught) { return { ok: false, stdout: '', error: `${errorType(caught)}: ${caught.message || String(caught)}` }; } }, submit(code, tests) { const results = tests.map(test => { const result = this.run(code, test.input); return { ok: result.ok && normalizeOutput(result.stdout) === normalizeOutput(test.output), stdout: result.stdout, error: result.error || '' }; }); return { passed: results.filter(result => result.ok).length, total: results.length, results, ok: results.every(result => result.ok) }; }, normalizeOutput };
})();
