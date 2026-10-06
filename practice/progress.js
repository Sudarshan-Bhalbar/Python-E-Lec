(function () {
  const requestedTopic = new URLSearchParams(location.search).get('topic') || 'strings';
  const topic = window.getPracticeTopic ? window.getPracticeTopic(requestedTopic).slug : (/^[a-z0-9-]+$/.test(requestedTopic) ? requestedTopic : 'strings');
  const STATUS_KEY = `devhub.practice.${topic}.status.v1`;
  const CODE_KEY = `devhub.practice.${topic}.code.v1`;
  function read(key, fallback) {
    try { const value = JSON.parse(labStorage.getItem(key) || 'null'); return value && typeof value === 'object' ? value : fallback; }
    catch { return fallback; }
  }
  function write(key, value) { labStorage.setItem(key, JSON.stringify(value)); }
  function questions() { return window.getPracticeQuestions ? window.getPracticeQuestions(topic) : []; }
  function validStatus(value) { return value === 'attempted' || value === 'solved' ? value : 'unsolved'; }
  window.practiceProgress = {
    topic,
    statuses() { const saved = read(STATUS_KEY, {}); const result = {}; questions().forEach(q => { result[q.id] = validStatus(saved[q.id]); }); return result; },
    setStatus(id, status) { const saved = this.statuses(); saved[id] = validStatus(status); write(STATUS_KEY, saved); window.dispatchEvent(new CustomEvent('practice-status-change', { detail: { id, status: saved[id] } })); },
    codes() { return read(CODE_KEY, {}); },
    getCode(id, fallback) { const code = this.codes()[id]; return typeof code === 'string' ? code : fallback; },
    saveCode(id, code) { const saved = this.codes(); saved[id] = code; write(CODE_KEY, saved); },
    counts() { const statuses = this.statuses(); return Object.values(statuses).reduce((out, status) => { out[status] += 1; return out; }, { unsolved: 0, attempted: 0, solved: 0 }); }
  };
})();
