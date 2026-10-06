(function () {
  const params = new URLSearchParams(location.search);
  const requestedTopic = params.get('topic') || 'strings';
  const topic = window.getPracticeTopic(requestedTopic);
  const topicSlug = topic.slug;
  const questions = window.getPracticeQuestions(topicSlug);
  const list = document.getElementById('question-list');
  const filterButtons = [...document.querySelectorAll('.filter-btn')];
  let filter = 'all';
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  document.body.dataset.topic = topicSlug;
  document.title = `${topic.title} Practice · Python E-Lec`;
  document.getElementById('practice-eyebrow').textContent = `${topic.title.toUpperCase()} PRACTICE`;
  document.getElementById('practice-title').textContent = `${topic.title} Practice`;

  function updateSummary() {
    const count = practiceProgress.counts();
    document.getElementById('solved-count').textContent = `${count.solved} / ${questions.length}`;
    document.getElementById('attempted-count').textContent = count.attempted;
    document.getElementById('unsolved-count').textContent = count.unsolved;
    document.getElementById('all-count').textContent = questions.length;
    document.getElementById('unsolved-filter-count').textContent = count.unsolved;
    document.getElementById('attempted-filter-count').textContent = count.attempted;
    document.getElementById('solved-filter-count').textContent = count.solved;
    document.getElementById('question-total').textContent = `${questions.length} Questions`;
    const percent = questions.length ? Math.round((count.solved / questions.length) * 100) : 0;
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('progress-percent').textContent = percent + '%';
  }

  function actionLabel(status) { return status === 'solved' ? 'Solve Again' : status === 'attempted' ? 'Continue' : 'Start'; }

  function render() {
    updateSummary();
    const statuses = practiceProgress.statuses();
    if (!questions.length) {
      list.innerHTML = `<div class="empty-state"><strong>${escape(topic.title)} practice bank not loaded yet</strong><span>This shared practice page is ready for the ${escape(topic.title)} question set.</span></div>`;
      return;
    }
    const visible = questions.filter(q => filter === 'all' || statuses[q.id] === filter);
    list.innerHTML = visible.length ? visible.map(q => {
      const status = statuses[q.id];
      const solverUrl = `solver.html?topic=${encodeURIComponent(topicSlug)}&question=${encodeURIComponent(q.id)}`;
      return `<a class="question-card" href="${solverUrl}" aria-label="${escape(q.number + ' ' + q.title + '. ' + actionLabel(status))}">
        <div class="question-number">${escape(q.number)}</div>
        <div class="question-main">
          <h2>${escape(q.title)}</h2>
          <p>${escape(q.description)}</p>
          <div class="card-meta"><span class="difficulty ${escape(q.difficulty.toLowerCase())}">${escape(q.difficulty)}</span><span class="status-chip ${status}">${escape(status)}</span></div>
          <div class="tag-row">${q.tags.map(tag => `<span class="tag">#${escape(tag)}</span>`).join('')}</div>
        </div>
        <span class="card-action">${actionLabel(status)}</span>
      </a>`;
    }).join('') : '<div class="empty-state">No questions match this filter yet.</div>';
  }

  filterButtons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    render();
  }));
  window.addEventListener('practice-status-change', render);
  render();
})();
