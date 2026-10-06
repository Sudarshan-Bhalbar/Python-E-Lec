(function () {
  const params = new URLSearchParams(location.search);
  const requestedTopic = params.get('topic') || 'strings';
  const topic = window.getPracticeTopic(requestedTopic);
  const topicSlug = topic.slug;
  const questions = window.getPracticeQuestions(topicSlug);
  const question = questions.find(item => item.id === params.get('question')) || questions[0];
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const backLink = document.querySelector('.solver-top > a');
  const workspaceTitle = document.querySelector('.workspace-title');

  document.body.dataset.topic = topicSlug;
  document.title = `${topic.title} Practice · Python E-Lec`;
  if (backLink) backLink.href = `lab.html?topic=${encodeURIComponent(topicSlug)}`;
  if (workspaceTitle) workspaceTitle.textContent = `>_ Python Workspace · ${topic.title.toUpperCase()}`;

  if (!question) {
    $('question-number').textContent = `${topic.title.toUpperCase()} PRACTICE`;
    $('solver-position').textContent = 'Practice bank pending';
    $('question-title').textContent = `${topic.title} practice bank not loaded yet`;
    $('question-description').textContent = `The shared ${topic.title} practice template is ready for its question bank.`;
    $('task').textContent = 'Return to Questions to browse the topic catalog.';
    $('behavior').textContent = 'Question content will appear here when this topic bank is loaded.';
    $('examples').innerHTML = '<span class="example-head">Status</span><span class="example-head">Details</span><span class="example-value">Pending</span><span class="example-value">No questions are loaded for this topic yet.</span>';
    $('need-to-know').textContent = 'Practice template ready';
    $('constraints').innerHTML = '<li>Question bank not loaded</li>';
    $('hints').innerHTML = '<div class="hint">Use the All Topics link to choose another practice route.</div>';
    $('open-workspace').disabled = true;
    $('submit-solution').disabled = true;
    return;
  }

  $('question-number').textContent = `${question.number} · ${question.difficulty.toUpperCase()}`;
  const questionIndex = questions.indexOf(question);
  $('solver-position').textContent = `${question.number} · ${question.difficulty}`;
  const previous = $('previous-question');
  const next = $('next-question');
  if (questionIndex > 0) previous.href = `solver.html?topic=${encodeURIComponent(topicSlug)}&question=${encodeURIComponent(questions[questionIndex - 1].id)}`;
  else previous.classList.add('is-disabled');
  if (questionIndex < questions.length - 1) next.href = `solver.html?topic=${encodeURIComponent(topicSlug)}&question=${encodeURIComponent(questions[questionIndex + 1].id)}`;
  else next.classList.add('is-disabled');
  $('question-title').textContent = question.title;
  $('question-description').textContent = question.description;
  $('task').textContent = question.task;
  $('behavior').textContent = question.behavior;
  $('examples').innerHTML = '<span class="example-head">Input</span><span class="example-head">Output</span>' + question.examples.map(example => `<span class="example-value">${escape(example.input).replace(/\n/g, '<br>')}</span><span class="example-value">${escape(example.output).replace(/\n/g, '<br>')}</span>`).join('');
  $('need-to-know').innerHTML = question.tags.map(tag => `<span class="knowledge-chip">${escape(tag)}()</span>`).join('');
  $('constraints').innerHTML = question.constraints.map(item => `<li>${escape(item)}</li>`).join('');
  $('hints').innerHTML = question.hints.map((hint, index) => `<details class="hint"><summary>Hint ${index + 1}</summary><div>${escape(hint)}</div></details>`).join('');
  function updateStatus() { const status = practiceProgress.statuses()[question.id]; $('status').textContent = status; $('status').className = 'status-value ' + status; }
  function showResult(result) { const box = $('latest-result'); box.className = 'result-box ' + (result.ok ? 'success' : 'failure'); box.textContent = result.ok ? `All ${result.total} checks passed.` : `${result.passed} of ${result.total} checks passed. Review your output and try again.`; }
  $('submit-solution').addEventListener('click', () => { const code = document.getElementById('practice-code').value; practiceProgress.saveCode(question.id, code); const result = practiceEvaluator.submit(code, question.tests); practiceProgress.setStatus(question.id, result.ok ? 'solved' : 'attempted'); showResult(result); updateStatus(); });
  window.addEventListener('practice-status-change', updateStatus);
  window.practiceWorkspace.setQuestion(question);
  updateStatus();
})();
