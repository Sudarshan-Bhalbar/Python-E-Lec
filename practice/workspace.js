(function () {
  const notesMode = document.body.dataset.workspaceMode === 'notes';
  const notesTopic = document.body.dataset.notesTopic || 'variables';
  const notesScratchKey = `devhub.notes.${notesTopic}.scratch.v1`;
  const notesConfig = window.notesWorkspaceConfig || { title: '>_ Python Workspace', starterCode: '' };
  const MIN_WIDTH = 560;
  const MIN_HEIGHT = 420;
  const VIEWPORT_GUTTER = 8;

  function ensureNotesWorkspace() {
    if (!notesMode || document.getElementById('workspace')) return;
    const shell = document.createElement('section');
    shell.id = 'workspace';
    shell.className = 'workspace notes-workspace';
    shell.setAttribute('aria-label', 'Floating Python workspace');
    shell.innerHTML = `
      <div id="workspace-head" class="workspace-head"><span class="workspace-title"></span><div class="workspace-controls"><button id="minimize-workspace" title="Minimize" aria-label="Minimize">—</button><button id="maximize-workspace" title="Maximize or restore" aria-label="Maximize or restore">□</button><button id="close-workspace" title="Close" aria-label="Close">×</button></div></div>
      <div class="workspace-tabs"><button class="workspace-tab is-active" data-pane="ide">IDE</button><button class="workspace-tab" data-pane="console">Console</button></div>
      <div id="pane-ide" class="workspace-pane is-active"><div class="editor-wrap"><pre id="editor-gutter" class="editor-gutter">1</pre><textarea id="practice-code" class="practice-editor" spellcheck="false" aria-label="Python scratch editor"></textarea></div></div>
      <div id="pane-console" class="workspace-pane"><pre id="practice-console" class="console">Run your code to see stdout and errors here.</pre></div>
      <footer class="workspace-foot"><span id="workspace-message" class="workspace-message">Ready.</span><div class="workspace-actions"><button id="run-code" class="run-btn">Run</button><button id="stop-code" class="stop-btn">Stop</button><button id="reset-code" class="reset-code-btn">Reset</button></div></footer>`;
    document.body.appendChild(shell);
  }

  function ensureWorkspaceParts(workspace) {
    const paneIde = workspace.querySelector('#pane-ide');
    const paneConsole = workspace.querySelector('#pane-console');
    if (!paneIde || !paneConsole) return;
    if (!paneIde.querySelector('.workspace-pane-head')) paneIde.insertAdjacentHTML('afterbegin', '<div class="workspace-pane-head"><span>IDE · PYTHON</span><span>PYTHON READY</span></div>');
    if (!paneConsole.querySelector('.workspace-pane-head')) paneConsole.insertAdjacentHTML('afterbegin', '<div class="workspace-pane-head"><span>CONSOLE · OUTPUT</span><span>STDOUT</span></div>');
    if (!workspace.querySelector('.workspace-splitter')) paneIde.insertAdjacentHTML('afterend', '<div class="workspace-splitter" aria-label="Resize IDE and Console split" role="separator" tabindex="0"></div>');
    const footer = workspace.querySelector('.workspace-foot');
    if (footer && !paneIde.contains(footer)) paneIde.appendChild(footer);
    ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'].forEach(direction => {
      if (workspace.querySelector(`.resize-${direction}`)) return;
      const handle = document.createElement('span');
      handle.className = `workspace-resize-handle resize-${direction}`;
      handle.dataset.resize = direction;
      handle.setAttribute('aria-hidden', 'true');
      workspace.appendChild(handle);
    });
  }

  ensureNotesWorkspace();
  const workspace = document.getElementById('workspace');
  const editor = document.getElementById('practice-code');
  if (!workspace || !editor) return;
  ensureWorkspaceParts(workspace);
  window.pythonEditorEnhancements?.attach({ editor, workspace, topic: notesMode ? notesTopic : (document.body.dataset.topic || new URLSearchParams(location.search).get('topic') || 'generic') });

  const gutter = document.getElementById('editor-gutter');
  const consoleBox = document.getElementById('practice-console');
  const message = document.getElementById('workspace-message');
  const paneIde = document.getElementById('pane-ide');
  const paneConsole = document.getElementById('pane-console');
  const splitter = workspace.querySelector('.workspace-splitter');
  let currentQuestion = null;
  let stopped = false;
  let drag = null;
  let resizeState = null;
  let splitState = null;
  let savedGeometry = null;
  let splitRatio = Number(workspace.dataset.splitRatio) || .68;

  function syncGutter() {
    const count = Math.max(1, editor.value.split('\n').length);
    gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    gutter.scrollTop = editor.scrollTop;
  }
  function recalculateEditorLayout() {
    syncGutter();
    if (window.monacoEditor && typeof window.monacoEditor.layout === 'function') window.monacoEditor.layout();
    window.dispatchEvent(new CustomEvent('python-workspace-layout'));
  }
  function setConsole(text, isError) {
    consoleBox.textContent = text || '(no output)';
    consoleBox.style.color = isError ? '#f1aaa3' : '#d6dbe6';
  }
  function readNotesCode() {
    try {
      const saved = labStorage.getItem(notesScratchKey);
      return typeof saved === 'string' && saved ? saved : notesConfig.starterCode;
    } catch { return notesConfig.starterCode; }
  }
  function saveNotesCode() {
    try { labStorage.setItem(notesScratchKey, editor.value); } catch {}
  }
  function setQuestion(question) {
    currentQuestion = question;
    editor.value = practiceProgress.getCode(question.id, question.starterCode);
    syncGutter();
    setConsole('Run your code to see stdout and errors here.');
    message.textContent = 'Ready.';
  }
  function open() {
    workspace.classList.add('is-open');
    workspace.classList.remove('is-minimized');
    if (window.innerWidth <= 560) document.body.style.overflow = 'hidden';
    requestAnimationFrame(recalculateEditorLayout);
    editor.focus();
  }
  function close() {
    workspace.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function reset() {
    if (notesMode) {
      editor.value = notesConfig.starterCode;
      saveNotesCode();
      syncGutter();
      setConsole('Workspace reset.');
      message.textContent = 'Starter code restored.';
      return;
    }
    if (!currentQuestion) return;
    editor.value = currentQuestion.starterCode;
    practiceProgress.saveCode(currentQuestion.id, editor.value);
    syncGutter();
    setConsole('Workspace reset.');
    message.textContent = 'Starter code restored.';
  }
  function showConsoleOnRun() {
    if (notesMode && window.innerWidth <= 560 || !notesMode) {
      const consoleTab = document.querySelector('[data-pane="console"]');
      if (consoleTab) consoleTab.click();
    }
  }
  function run() {
    stopped = false;
    if (notesMode) {
      saveNotesCode();
      const result = practiceEvaluator.run(editor.value, []);
      if (stopped) return;
      if (result.ok) { setConsole(result.stdout || '(no output)'); message.textContent = 'Run complete. Scratch code does not affect Practice.'; }
      else { setConsole(result.error, true); message.textContent = 'Execution stopped with an error.'; }
      showConsoleOnRun();
      return;
    }
    if (!currentQuestion) return;
    practiceProgress.saveCode(currentQuestion.id, editor.value);
    const sample = currentQuestion.examples[0];
    const result = practiceEvaluator.run(editor.value, sample.input.split('\n'));
    if (stopped) return;
    if (result.ok) { setConsole(result.stdout || '(no output)'); message.textContent = 'Run complete. This did not submit your solution.'; }
    else { setConsole(result.error, true); message.textContent = 'Execution stopped with an error.'; }
    showConsoleOnRun();
  }

  function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
  function setPosition(left, top) {
    workspace.style.left = `${left}px`;
    workspace.style.top = `${top}px`;
    workspace.style.right = 'auto';
    workspace.style.bottom = 'auto';
  }
  function setSplitRatio(nextRatio) {
    splitRatio = clamp(nextRatio, .38, .78);
    workspace.dataset.splitRatio = String(splitRatio);
    paneIde.style.flex = `${splitRatio} 1 0`;
    paneConsole.style.flex = `${1 - splitRatio} 1 0`;
    recalculateEditorLayout();
  }
  function readSplitRatio() {
    const total = paneIde.getBoundingClientRect().height + paneConsole.getBoundingClientRect().height;
    return total ? paneIde.getBoundingClientRect().height / total : splitRatio;
  }
  function geometry() {
    const rect = workspace.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, splitRatio: readSplitRatio() };
  }
  function toggleMaximize() {
    if (!workspace.classList.contains('is-maximized')) {
      savedGeometry = geometry();
      workspace.classList.add('is-maximized');
      workspace.style.left = '';
      workspace.style.top = '';
      workspace.style.right = '';
      workspace.style.bottom = '';
      workspace.style.width = '';
      workspace.style.height = '';
      setSplitRatio(savedGeometry.splitRatio);
    } else {
      workspace.classList.remove('is-maximized');
      if (savedGeometry) {
        setPosition(savedGeometry.left, savedGeometry.top);
        workspace.style.width = `${savedGeometry.width}px`;
        workspace.style.height = `${savedGeometry.height}px`;
        setSplitRatio(savedGeometry.splitRatio);
      }
    }
    requestAnimationFrame(recalculateEditorLayout);
  }
  function beginResize(direction, event, handle) {
    if (window.innerWidth <= 560 || workspace.classList.contains('is-maximized') || workspace.classList.contains('is-minimized')) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = workspace.getBoundingClientRect();
    resizeState = { direction, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
    handle.setPointerCapture(event.pointerId);
  }
  function moveResize(event) {
    if (!resizeState) return;
    const state = resizeState;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    let left = state.left;
    let top = state.top;
    let width = state.width;
    let height = state.height;
    if (state.direction.includes('w')) { left = clamp(state.left + dx, VIEWPORT_GUTTER, state.right - MIN_WIDTH); width = state.right - left; }
    if (state.direction.includes('e')) width = clamp(state.width + dx, MIN_WIDTH, window.innerWidth - VIEWPORT_GUTTER - state.left);
    if (state.direction.includes('n')) { top = clamp(state.top + dy, VIEWPORT_GUTTER, state.bottom - MIN_HEIGHT); height = state.bottom - top; }
    if (state.direction.includes('s')) height = clamp(state.height + dy, MIN_HEIGHT, window.innerHeight - VIEWPORT_GUTTER - state.top);
    setPosition(left, top);
    workspace.style.width = `${width}px`;
    workspace.style.height = `${height}px`;
    recalculateEditorLayout();
  }
  function endResize() { resizeState = null; }
  function beginSplit(event) {
    if (window.innerWidth <= 560) return;
    event.preventDefault();
    const total = paneIde.getBoundingClientRect().height + paneConsole.getBoundingClientRect().height;
    splitState = { top: paneIde.getBoundingClientRect().top, total };
    splitter.setPointerCapture(event.pointerId);
  }
  function moveSplit(event) {
    if (!splitState) return;
    const nextHeight = clamp(event.clientY - splitState.top, 180, splitState.total - 120);
    setSplitRatio(nextHeight / splitState.total);
  }
  function endSplit() { splitState = null; }

  if (notesMode) {
    workspace.querySelector('.workspace-title').textContent = notesConfig.title;
    editor.value = readNotesCode();
    syncGutter();
    setConsole('Run your code to see stdout and errors here.');
  }
  setSplitRatio(splitRatio);
  document.querySelectorAll('#open-workspace, .workspace-trigger').forEach(button => button.addEventListener('click', open));
  document.getElementById('close-workspace')?.addEventListener('click', close);
  document.getElementById('minimize-workspace')?.addEventListener('click', () => { workspace.classList.toggle('is-minimized'); requestAnimationFrame(recalculateEditorLayout); });
  document.getElementById('maximize-workspace')?.addEventListener('click', toggleMaximize);
  document.getElementById('run-code')?.addEventListener('click', run);
  document.getElementById('stop-code')?.addEventListener('click', () => { stopped = true; message.textContent = 'Stopped.'; });
  document.getElementById('reset-code')?.addEventListener('click', reset);
  editor.addEventListener('input', () => {
    if (notesMode) saveNotesCode();
    else if (currentQuestion) practiceProgress.saveCode(currentQuestion.id, editor.value);
    syncGutter();
  });
  editor.addEventListener('scroll', () => { gutter.scrollTop = editor.scrollTop; });
  document.querySelectorAll('.workspace-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.workspace-tab').forEach(item => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.workspace-pane').forEach(pane => pane.classList.toggle('is-active', pane.id === 'pane-' + tab.dataset.pane));
    requestAnimationFrame(recalculateEditorLayout);
  }));
  workspace.querySelectorAll('.workspace-resize-handle').forEach(handle => {
    handle.addEventListener('pointerdown', event => beginResize(handle.dataset.resize, event, handle));
    handle.addEventListener('pointermove', moveResize);
    handle.addEventListener('pointerup', endResize);
    handle.addEventListener('pointercancel', endResize);
  });
  splitter?.addEventListener('pointerdown', beginSplit);
  splitter?.addEventListener('pointermove', moveSplit);
  splitter?.addEventListener('pointerup', endSplit);
  splitter?.addEventListener('pointercancel', endSplit);

  const head = document.getElementById('workspace-head');
  head.addEventListener('pointerdown', event => {
    if (window.innerWidth <= 560 || event.target.closest('button') || workspace.classList.contains('is-maximized')) return;
    const rect = workspace.getBoundingClientRect();
    drag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    head.setPointerCapture(event.pointerId);
  });
  head.addEventListener('pointermove', event => {
    if (!drag) return;
    const rect = workspace.getBoundingClientRect();
    const maxLeft = Math.max(VIEWPORT_GUTTER, window.innerWidth - 120);
    const maxTop = Math.max(VIEWPORT_GUTTER, window.innerHeight - 52);
    setPosition(clamp(drag.left + event.clientX - drag.x, VIEWPORT_GUTTER, maxLeft), clamp(drag.top + event.clientY - drag.y, VIEWPORT_GUTTER, maxTop));
  });
  head.addEventListener('pointerup', () => { drag = null; });
  head.addEventListener('pointercancel', () => { drag = null; });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(recalculateEditorLayout);
    observer.observe(workspace);
    observer.observe(document.querySelector('.editor-wrap'));
  }
  window.practiceWorkspace = { setQuestion, open, close };
  if (notesMode) window.notesWorkspace = { open, close, reset, run };
})();
