(function () {
  const topics = {
    variables: { slug: 'variables', title: 'Variables & Types' },
    numbers: { slug: 'numbers', title: 'Numbers & Math' },
    input: { slug: 'input', title: 'User Input & Interaction' },
    operators: { slug: 'operators', title: 'Operators & Logic' },
    strings: { slug: 'strings', title: 'Strings & Text' },
    conditions: { slug: 'conditions', title: 'Conditional Statements' },
    'while-loops': { slug: 'while-loops', title: 'While Loops' },
    'for-loops': { slug: 'for-loops', title: 'For Loops & Ranges' },
    lists: { slug: 'lists', title: 'Lists & Arrays' },
    'tuples-sets': { slug: 'tuples-sets', title: 'Tuples & Sets' },
    dictionaries: { slug: 'dictionaries', title: 'Dictionaries (Key-Value)' },
    functions: { slug: 'functions', title: 'Functions & Return Values' },
    'list-comprehensions': { slug: 'list-comprehensions', title: 'List Comprehensions' },
    'file-handling': { slug: 'file-handling', title: 'File Handling (I/O)' },
    exceptions: { slug: 'exceptions', title: 'Error & Exception Handling' },
    oop: { slug: 'oop', title: 'Object-Oriented Programming' }
  };

  window.PRACTICE_TOPIC_CATALOG = topics;
  window.getPracticeTopic = function (slug) {
    return topics[slug] || topics.strings;
  };
  window.getPracticeQuestions = function (slug) {
    return (window.PRACTICE_QUESTION_BANKS && window.PRACTICE_QUESTION_BANKS[slug])
      || (slug === 'strings' ? (window.STRING_QUESTIONS || []) : []);
  };
})();
