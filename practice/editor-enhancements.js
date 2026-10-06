(function () {
  const INDENT = '    ';
  const KEYWORDS = ['if', 'else', 'elif', 'for', 'while', 'def', 'return', 'class', 'try', 'except', 'finally', 'with', 'import', 'from', 'as', 'break', 'continue', 'pass', 'raise', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'match', 'case'];
  const BUILTINS = [
    ['print', 'print()', 'fx', 'print(value, ...)'], ['input', 'input()', 'fx', 'input(prompt)'], ['len', 'len()', 'fx', 'len(object)'], ['type', 'type()', 'fx', 'type(object)'],
    ['int', 'int()', 'fx', 'int(value)'], ['float', 'float()', 'fx', 'float(value)'], ['str', 'str()', 'fx', 'str(value)'], ['bool', 'bool()', 'fx', 'bool(value)'],
    ['range', 'range()', 'fx', 'range(stop)'], ['abs', 'abs()', 'fx', 'abs(number)'], ['round', 'round()', 'fx', 'round(number)'], ['min', 'min()', 'fx', 'min(iterable)'],
    ['max', 'max()', 'fx', 'max(iterable)'], ['sum', 'sum()', 'fx', 'sum(iterable)'], ['sorted', 'sorted()', 'fx', 'sorted(iterable)'], ['enumerate', 'enumerate()', 'fx', 'enumerate(iterable)'],
    ['zip', 'zip()', 'fx', 'zip(iterables)'], ['list', 'list()', 'fx', 'list(iterable)'], ['tuple', 'tuple()', 'fx', 'tuple(iterable)'], ['set', 'set()', 'fx', 'set(iterable)'], ['dict', 'dict()', 'fx', 'dict(...)']
  ].map(([name, insert, kind, signature]) => ({ name, insert, kind, signature, group: 'builtin' }));
  const METHODS = {
    str: [['upper', 'upper()', 'str', 'Convert to uppercase.'], ['lower', 'lower()', 'str', 'Convert to lowercase.'], ['strip', 'strip()', 'str', 'Remove surrounding whitespace.'], ['replace', 'replace()', 'str', 'Replace matching text.'], ['find', 'find()', 'str', 'Find a substring position.'], ['count', 'count()', 'str', 'Count a substring.'], ['startswith', 'startswith()', 'str', 'Check a prefix.'], ['endswith', 'endswith()', 'str', 'Check a suffix.'], ['split', 'split()', 'str', 'Split into a list.'], ['join', 'join()', 'str', 'Join text values.'], ['capitalize', 'capitalize()', 'str', 'Capitalize the first character.'], ['title', 'title()', 'str', 'Title-case the text.']],
    list: [['append', 'append()', 'list', 'Add one item.'], ['extend', 'extend()', 'list', 'Add multiple items.'], ['insert', 'insert()', 'list', 'Insert at an index.'], ['remove', 'remove()', 'list', 'Remove a matching item.'], ['pop', 'pop()', 'list', 'Remove and return an item.'], ['clear', 'clear()', 'list', 'Remove all items.'], ['index', 'index()', 'list', 'Find an item position.'], ['count', 'count()', 'list', 'Count an item.'], ['sort', 'sort()', 'list', 'Sort the list in place.'], ['reverse', 'reverse()', 'list', 'Reverse the list.'], ['copy', 'copy()', 'list', 'Copy the list.']],
    dict: [['keys', 'keys()', 'dict', 'Return dictionary keys.'], ['values', 'values()', 'dict', 'Return dictionary values.'], ['items', 'items()', 'dict', 'Return key-value pairs.'], ['get', 'get()', 'dict', 'Read a key safely.'], ['update', 'update()', 'dict', 'Update dictionary entries.'], ['pop', 'pop()', 'dict', 'Remove a key.'], ['clear', 'clear()', 'dict', 'Remove all entries.'], ['copy', 'copy()', 'dict', 'Copy the dictionary.']],
    set: [['add', 'add()', 'set', 'Add an item.'], ['remove', 'remove()', 'set', 'Remove an item.'], ['discard', 'discard()', 'set', 'Remove an item safely.'], ['union', 'union()', 'set', 'Combine sets.'], ['intersection', 'intersection()', 'set', 'Keep shared items.'], ['difference', 'difference()', 'set', 'Find differing items.'], ['clear', 'clear()', 'set', 'Remove all items.']]
  };
  const TOPIC_BOOSTS = {
    variables: ['print', 'type', 'str', 'int', 'float'], numbers: ['int', 'float', 'abs', 'round', 'min', 'max', 'sum'], input: ['input', 'int', 'float', 'str'],
    operators: ['bool', 'and', 'or', 'not'], conditions: ['if', 'elif', 'else', 'True', 'False'], strings: ['str', 'len', 'lower', 'upper', 'strip', 'replace', 'find', 'count'],
    'while-loops': ['while', 'break', 'continue'], 'for-loops': ['for', 'range', 'enumerate'], functions: ['def', 'return'], lists: ['list', 'len', 'append'], dictionaries: ['dict', 'keys', 'values']
  };
  const SNIPPETS = [
    { name: 'if', insert: 'if condition:\n' + INDENT + 'pass', kind: 'snippet', signature: 'if condition: …', cursor: 3 },
    { name: 'for', insert: 'for item in iterable:\n' + INDENT + 'pass', kind: 'snippet', signature: 'for item in iterable: …', cursor: 4 },
    { name: 'while', insert: 'while condition:\n' + INDENT + 'pass', kind: 'snippet', signature: 'while condition: …', cursor: 6 },
    { name: 'def', insert: 'def function_name():\n' + INDENT + 'pass', kind: 'snippet', signature: 'def function_name(): …', cursor: 4 },
    { name: 'class', insert: 'class ClassName:\n' + INDENT + 'pass', kind: 'snippet', signature: 'class ClassName: …', cursor: 6 }
  ];

  function attach({ editor, workspace, topic }) {
    if (!editor || editor.dataset.editorEnhancements === 'true') return;
    editor.dataset.editorEnhancements = 'true';
    const popup = document.createElement('div');
    popup.className = 'editor-suggestions';
    popup.id = 'editor-suggestions';
    popup.setAttribute('role', 'listbox');
    popup.hidden = true;
    document.body.appendChild(popup);
    editor.setAttribute('aria-autocomplete', 'list');
    editor.setAttribute('aria-controls', popup.id);
    editor.setAttribute('aria-expanded', 'false');
    const hint = document.createElement('div');
    hint.className = 'editor-signature-hint';
    hint.hidden = true;
    document.body.appendChild(hint);
    const state = { items: [], selected: 0, start: 0, end: 0, visible: false, manual: false };
    let symbols = { entries: [], types: {} };
    let symbolTimer = 0;

    function dispatchInput() { editor.dispatchEvent(new Event('input', { bubbles: true })); }
    function replaceRange(start, end, text, caretStart, caretEnd) {
      editor.setRangeText(text, start, end, 'preserve');
      const nextStart = caretStart == null ? start + text.length : caretStart;
      const nextEnd = caretEnd == null ? nextStart : caretEnd;
      editor.setSelectionRange(nextStart, nextEnd);
      dispatchInput();
    }
    function hideSuggestions() {
      state.visible = false;
      state.items = [];
      popup.hidden = true;
      hint.hidden = true;
      editor.setAttribute('aria-expanded', 'false');
    }
    function currentLineStart(position) { return editor.value.lastIndexOf('\n', Math.max(0, position - 1)) + 1; }
    function lineAt(position) { return editor.value.slice(currentLineStart(position), position); }
    function contextAt(position) {
      const before = editor.value.slice(currentLineStart(position), position);
      const commentIndex = findCommentIndex(before);
      if (commentIndex >= 0) return { blocked: true, prefix: '', start: position, object: null };
      if (isInsideString(before)) return { blocked: true, prefix: '', start: position, object: null };
      const dot = before.match(/([A-Za-z_]\w*)\.([A-Za-z_]\w*)?$/);
      if (dot) return { blocked: false, prefix: dot[2] || '', start: position - (dot[2] || '').length, object: dot[1] };
      const word = before.match(/([A-Za-z_]\w*)$/);
      return { blocked: false, prefix: word ? word[1] : '', start: word ? position - word[1].length : position, object: null };
    }
    function findCommentIndex(text) {
      let quote = ''; let escaped = false;
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if ((char === '"' || char === "'") && (!quote || quote === char)) quote = quote ? '' : char;
        else if (char === '#' && !quote) return i;
      }
      return -1;
    }
    function isInsideString(text) {
      let quote = ''; let escaped = false;
      for (const char of text) {
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && quote) { escaped = true; continue; }
        if (char === '"' || char === "'") quote = quote ? (quote === char ? '' : quote) : char;
      }
      return Boolean(quote);
    }
    function inferType(expression) {
      const value = expression.trim().replace(/\s+#.*$/, '');
      if (/^("|'|f["'])/.test(value)) return 'str';
      if (/^\[/.test(value)) return 'list';
      if (/^\{/.test(value)) return value === '{}' || value.includes(':') ? 'dict' : 'set';
      if (/^(True|False)$/.test(value)) return 'bool';
      if (/^-?\d+\.\d+/.test(value)) return 'float';
      if (/^-?\d+/.test(value)) return 'int';
      return '';
    }
    function addSymbol(entries, seen, name, kind, type) {
      if (!name || seen.has(name)) return;
      seen.add(name); entries.push({ name, kind: kind || 'var', type: type || '' });
    }
    function parseSymbols(code) {
      const entries = []; const seen = new Set(); const types = {};
      code.split('\n').forEach(rawLine => {
        const line = rawLine.replace(/^\s+/, '');
        let match = line.match(/^def\s+([A-Za-z_]\w*)\s*\(([^)]*)/);
        if (match) { addSymbol(entries, seen, match[1], 'fx', 'function'); (match[2].match(/[A-Za-z_]\w*/g) || []).forEach(param => addSymbol(entries, seen, param, 'var', '')); }
        match = line.match(/^class\s+([A-Za-z_]\w*)/); if (match) addSymbol(entries, seen, match[1], 'class', 'class');
        match = line.match(/^import\s+([A-Za-z_]\w*)/); if (match) addSymbol(entries, seen, match[1], 'mod', 'module');
        match = line.match(/^from\s+[\w.]+\s+import\s+(.+)/); if (match) (match[1].split(',').map(item => item.trim().match(/[A-Za-z_]\w*/)?.[0]).filter(Boolean)).forEach(name => addSymbol(entries, seen, name, 'fx', 'function'));
        match = line.match(/^(?:for\s+)?([A-Za-z_]\w*)\s*=\s*(.+)$/); if (match) { const type = inferType(match[2]); addSymbol(entries, seen, match[1], 'var', type); types[match[1]] = type; }
        match = line.match(/^for\s+([A-Za-z_]\w*)\s+in\s+/); if (match) addSymbol(entries, seen, match[1], 'var', '');
      });
      return { entries, types };
    }
    function refreshSymbols() { symbols = parseSymbols(editor.value); }
    function fuzzyScore(name, prefix) {
      if (!prefix) return 0;
      let index = 0; let score = 0;
      for (const char of prefix.toLowerCase()) { index = name.toLowerCase().indexOf(char, index); if (index < 0) return -1; score += index === 0 ? 2 : 1; index += 1; }
      return score;
    }
    function topicScore(item) {
      const boost = TOPIC_BOOSTS[topic] || [];
      return boost.includes(item.name) ? 90 : 0;
    }
    function candidates(context, manual) {
      const list = [];
      if (context.object) {
        const methodType = symbols.types[context.object];
        const methods = METHODS[methodType] || Object.values(METHODS).flat().slice(0, 12);
        methods.forEach(([name, insert, kind, description]) => list.push({ name, insert, kind, signature: insert, description, group: 'method' }));
      } else {
        symbols.entries.forEach(entry => list.push({ ...entry, insert: entry.name, group: 'local' }));
        KEYWORDS.forEach(name => list.push({ name, insert: name, kind: 'kw', group: 'keyword' }));
        BUILTINS.forEach(item => list.push(item));
        SNIPPETS.forEach(item => list.push(item));
      }
      const unique = new Map();
      list.forEach(item => { if (!unique.has(item.name + ':' + item.group)) unique.set(item.name + ':' + item.group, item); });
      return [...unique.values()].map(item => ({ item, score: scoreItem(item, context.prefix, context.object) })).filter(row => manual || row.score > -1).sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).slice(0, 9).map(row => row.item);
    }
    function scoreItem(item, prefix, object) {
      const name = item.name.toLowerCase(); const wanted = prefix.toLowerCase();
      if (wanted && name.startsWith(wanted)) return 700 + (item.group === 'local' ? 130 : item.group === 'method' ? 100 : item.group === 'keyword' ? 40 : item.group === 'snippet' ? 30 : 20) + topicScore(item);
      if (wanted && fuzzyScore(item.name, prefix) < 0) return -1;
      if (item.group === 'local') return 540;
      if (item.group === 'method') return 420 + topicScore(item);
      if (topicScore(item)) return 320 + topicScore(item);
      if (item.group === 'keyword') return 220;
      if (item.group === 'builtin') return 160;
      return 120;
    }
    function renderSuggestions(items, context) {
      state.items = items; state.selected = 0; state.start = context.start; state.end = editor.selectionStart; state.visible = items.length > 0; popup.innerHTML = '';
      items.forEach((item, index) => {
        const row = document.createElement('button'); row.type = 'button'; row.className = 'editor-suggestion'; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        const kind = document.createElement('span'); kind.className = 'editor-suggestion-kind'; kind.textContent = item.kind || 'var';
        const name = document.createElement('span'); name.className = 'editor-suggestion-name'; name.textContent = item.name;
        const signature = document.createElement('span'); signature.className = 'editor-suggestion-signature'; signature.textContent = item.signature || '';
        row.append(kind, name, signature); row.addEventListener('mouseenter', () => selectSuggestion(index)); row.addEventListener('mousedown', event => { event.preventDefault(); acceptSuggestion(index); }); popup.appendChild(row);
      });
      popup.hidden = !state.visible;
      editor.setAttribute('aria-expanded', state.visible ? 'true' : 'false');
      if (state.visible) positionPopup();
    }
    function selectSuggestion(index) {
      if (!state.items.length) return;
      state.selected = (index + state.items.length) % state.items.length;
      [...popup.children].forEach((row, rowIndex) => row.setAttribute('aria-selected', rowIndex === state.selected ? 'true' : 'false'));
    }
    function acceptSuggestion(index) {
      const item = state.items[index == null ? state.selected : index]; if (!item) return;
      const start = state.start; const end = state.end; let insert = item.insert || item.name; let caret = insert.length;
      if (item.cursor != null) caret = item.cursor;
      else if (/\(\)$/.test(insert) && !['upper()', 'lower()', 'strip()', 'clear()', 'copy()', 'sort()', 'reverse()', 'title()', 'capitalize()', 'keys()', 'values()', 'items()'].includes(insert)) caret = insert.length - 1;
      hideSuggestions(); replaceRange(start, end, insert, start + caret);
    }
    function positionPopup() {
      if (popup.hidden && hint.hidden) return;
      const style = getComputedStyle(editor); const lineHeight = parseFloat(style.lineHeight) || 20; const paddingLeft = parseFloat(style.paddingLeft) || 0; const paddingTop = parseFloat(style.paddingTop) || 0;
      const before = editor.value.slice(0, editor.selectionStart); const line = before.split('\n').length - 1; const column = before.slice(before.lastIndexOf('\n') + 1).length; const canvas = positionPopup.canvas || (positionPopup.canvas = document.createElement('canvas')); const ctx = canvas.getContext('2d'); ctx.font = style.font;
      const charWidth = Math.max(7, ctx.measureText('M').width); const rect = editor.getBoundingClientRect(); let left = rect.left + paddingLeft + (column * charWidth) - editor.scrollLeft; let top = rect.top + paddingTop + ((line + 1) * lineHeight) - editor.scrollTop + 5;
      const width = popup.offsetWidth || 320; const height = popup.offsetHeight || 260; left = Math.min(Math.max(8, left), window.innerWidth - width - 8); if (top + height > window.innerHeight - 8) top = Math.max(8, top - height - lineHeight - 10);
      if (!popup.hidden) { popup.style.left = `${left}px`; popup.style.top = `${top}px`; }
      if (!hint.hidden) { hint.style.left = `${left}px`; hint.style.top = `${Math.max(8, top - 30)}px`; }
    }
    function showSignature() {
      const text = editor.value.slice(0, editor.selectionStart); const call = text.match(/(?:\.)(replace|find|count|startswith|endswith|split|join)\([^\n]*$/) || text.match(/\b(replace|find|count|startswith|endswith|split|join)\([^\n]*$/);
      if (!call) { hint.hidden = true; return; }
      const signatures = { replace: 'replace(old, new[, count])', find: 'find(sub[, start[, end]])', count: 'count(sub[, start[, end]])', startswith: 'startswith(prefix)', endswith: 'endswith(suffix)', split: 'split(sep)', join: 'join(iterable)' };
      hint.textContent = signatures[call[1]] || ''; hint.hidden = false; positionPopup();
    }
    function showSuggestions(manual) {
      const context = contextAt(editor.selectionStart); if (context.blocked) { hideSuggestions(); return; }
      refreshSymbols(); const items = candidates(context, manual); if (!items.length || (!manual && !context.prefix && !context.object)) { hideSuggestions(); return; } renderSuggestions(items, context); showSignature();
    }
    function indentSelection(dedent) {
      hideSuggestions(); const value = editor.value; const start = editor.selectionStart; const end = editor.selectionEnd; const lineStart = currentLineStart(start); let lineEnd = value.indexOf('\n', end); if (lineEnd < 0) lineEnd = value.length; const selected = value.slice(lineStart, lineEnd); const lines = selected.split('\n'); const changed = lines.map(line => dedent ? line.replace(/^( {1,4}|\t)/, '') : INDENT + line); const replacement = changed.join('\n'); const firstRemoved = dedent ? ((lines[0].match(/^ {1,4}/) || [''])[0].length || (lines[0].startsWith('\t') ? 1 : 0)) : 0; const newStart = Math.max(lineStart, start + (dedent ? -Math.min(firstRemoved, start - lineStart) : 4)); const newEnd = end + (replacement.length - selected.length); replaceRange(lineStart, lineEnd, replacement, newStart, newEnd); editor.focus();
    }
    function isBlockHeader(line) { return /^(?:(?:async)\s+def|if|elif|else|for|while|def|class|try|except|finally|with|match|case)\b.*:\s*(?:#.*)?$/.test(line.trim()); }
    function handleEnter(event) {
      hideSuggestions(); const start = editor.selectionStart; const end = editor.selectionEnd; const before = editor.value.slice(0, start); const current = lineAt(start); const baseIndent = (current.match(/^\s*/) || [''])[0].replace(/\t/g, INDENT); const trimmed = current.trim(); const next = editor.value.slice(end).match(/^\s*(\w+)/)?.[1] || '';
      let indent = baseIndent; if (isBlockHeader(current)) indent += INDENT; else if (/^(return|break|continue|pass|raise)\b/.test(trimmed) && baseIndent.length >= 4) indent = baseIndent.slice(0, -4); else if (/^(else|elif|except|finally|case)\b/.test(next) && baseIndent.length >= 4) indent = baseIndent.slice(0, -4);
      event.preventDefault(); replaceRange(start, end, '\n' + indent, start + 1 + indent.length); editor.focus();
    }
    function handlePair(event) {
      const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" }; const closers = new Set(Object.values(pairs)); const key = event.key; const close = pairs[key] || (closers.has(key) ? key : ''); if (!close) return false;
      const start = editor.selectionStart; const end = editor.selectionEnd; const value = editor.value;
      if (closers.has(key) && value[start] === key && start === end) { event.preventDefault(); editor.setSelectionRange(start + 1, start + 1); return true; }
      if (closers.has(key) && !pairs[key]) return false;
      if (event.ctrlKey || event.metaKey || event.altKey) return false;
      const selected = value.slice(start, end); event.preventDefault(); replaceRange(start, end, key + selected + close, start + 1, start + 1 + selected.length); editor.focus(); return true;
    }
    function onKeydown(event) {
      if (event.key === 'Escape' && state.visible) { event.preventDefault(); hideSuggestions(); return; }
      if (state.visible && event.key === 'ArrowDown') { event.preventDefault(); selectSuggestion(state.selected + 1); return; }
      if (state.visible && event.key === 'ArrowUp') { event.preventDefault(); selectSuggestion(state.selected - 1); return; }
      if (state.visible && (event.key === 'Enter' || event.key === 'Tab')) { event.preventDefault(); acceptSuggestion(); return; }
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') { event.preventDefault(); showSuggestions(true); return; }
      if (event.key === 'Tab') { event.preventDefault(); indentSelection(event.shiftKey); return; }
      if (event.key === 'Enter') { handleEnter(event); return; }
      if (handlePair(event)) return;
      if (state.visible) hideSuggestions();
    }
    function scheduleSymbols() { window.clearTimeout(symbolTimer); symbolTimer = window.setTimeout(refreshSymbols, 140); }

    refreshSymbols();
    editor.addEventListener('keydown', onKeydown);
    editor.addEventListener('input', () => { scheduleSymbols(); window.setTimeout(() => { showSuggestions(false); showSignature(); }, 0); });
    editor.addEventListener('click', () => showSignature());
    editor.addEventListener('keyup', event => { if (!['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) showSignature(); });
    editor.addEventListener('blur', () => window.setTimeout(() => { if (!popup.matches(':hover')) hideSuggestions(); }, 120));
    editor.addEventListener('scroll', () => { if (state.visible) positionPopup(); });
    window.addEventListener('resize', () => { if (state.visible) positionPopup(); });
    window.addEventListener('python-workspace-layout', () => { if (state.visible) positionPopup(); });
    workspace?.addEventListener('pointerdown', event => { if (event.target.closest('.workspace-resize-handle, .workspace-head, .workspace-splitter')) hideSuggestions(); });
    new MutationObserver(() => { if (workspace?.classList.contains('is-minimized')) hideSuggestions(); }).observe(workspace || editor, { attributes: true, attributeFilter: ['class'] });
  }

  window.pythonEditorEnhancements = { attach };
})();
