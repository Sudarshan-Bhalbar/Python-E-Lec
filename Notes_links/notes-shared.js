(function () {
  const header = document.querySelector('.topic-notes-header');
  const mobile = window.matchMedia('(max-width: 640px)');
  const desktop = window.matchMedia('(min-width: 1101px)');
  const toc = document.querySelector('.topic-notes-toc');
  const railCard = document.querySelector('.topic-notes-rail-card');
  const panel = document.querySelector('.topic-notes-toc-panel');
  const legacyToggle = document.querySelector('.topic-notes-toggle');
  const legacyWorkspaceButton = railCard?.querySelector(':scope > .workspace-trigger');
  let toggle = legacyToggle;
  if (railCard && panel && toc && legacyToggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = legacyToggle.className;
    toggle.innerHTML = legacyToggle.innerHTML;
    toggle.setAttribute('aria-controls', 'topic-notes-toc');
    toc.id = 'topic-notes-toc';
    const footer = document.createElement('div');
    footer.className = 'topic-notes-rail-footer';
    const workspaceButton = legacyWorkspaceButton || document.createElement('button');
    workspaceButton.type = 'button';
    workspaceButton.classList.add('workspace-trigger', 'sidebar-workspace-button');
    workspaceButton.innerHTML = '<span aria-hidden="true">⌘</span> Open Workspace';
    footer.append(workspaceButton);
    railCard.replaceChildren(toggle, toc, footer);
  }
  const topicSections = [...document.querySelectorAll('.topic-notes-section')];
  if (toc && topicSections.length) {
    toc.replaceChildren(...topicSections.map((section, index) => {
      const link = document.createElement('a');
      const title = section.querySelector('h2')?.textContent.trim() || section.id;
      link.href = `#${section.id}`;
      link.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>${title}`;
      return link;
    }));
  }
  const links = [...document.querySelectorAll('.topic-notes-toc a')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

  function syncSidebarTop() {
    if (!header) return;
    const headerTop = header.getBoundingClientRect().top + window.scrollY;
    document.documentElement.style.setProperty('--topic-notes-sidebar-top', `${headerTop + header.offsetHeight + 34}px`);
  }
  function setTocExpanded(expanded) {
    if (!toc || !toggle || !railCard) return;
    toc.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    railCard.classList.toggle('is-toc-open', expanded);
  }
  function syncToc(event) { setTocExpanded(!event.matches); }
  function revealActive(link) {
    if (!desktop.matches || !toc) return;
    const linkRect = link.getBoundingClientRect();
    const tocRect = toc.getBoundingClientRect();
    if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
      link.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }
  function setActive(id) {
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) revealActive(link);
    });
  }

  syncSidebarTop();
  syncToc(mobile);
  window.addEventListener('load', syncSidebarTop);
  window.addEventListener('resize', syncSidebarTop);
  mobile.addEventListener?.('change', syncToc);
  toggle?.addEventListener('click', () => {
    if (mobile.matches) setTocExpanded(toc?.hidden ?? true);
  });
  links.forEach(link => link.addEventListener('click', () => setActive(link.getAttribute('href').slice(1))));
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-12% 0px -68% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }
})();
