const el = (tag, className, value) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
};

function externalLink(url, label, name) {
  if (!/^https:\/\//i.test(url || '')) return null;
  const a = el('a', '', `${label} ↗`);
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', `${name}: ${label}`);
  return a;
}

export function renderCommittee(data) {
  const container = document.querySelector('#committee-grid');
  container.replaceChildren();
  for (const member of data.members || []) {
    const card = el('article', 'member-card');
    const top = el('div', 'member-top');
    const portrait = el('div', `member-portrait ${member.id || ''}`);
    portrait.setAttribute('role', 'img');
    portrait.setAttribute('aria-label', member.name || 'Committee member');
    const initials = (member.name || '').split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
    const fallback = el('span', 'member-initials', initials);
    fallback.setAttribute('aria-hidden', 'true');
    portrait.append(fallback);
    if (member.image) {
      const img = el('img');
      img.src = member.image;
      img.alt = member.name || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => img.remove());
      portrait.append(img);
    }
    const info = el('div');
    const title = el('h2', '', member.name || '');
    const affiliation = el('p', 'member-affiliation');
    (member.affiliation || '').split('\n').forEach((line, i) => {
      if (i) affiliation.append(document.createElement('br'));
      affiliation.append(document.createTextNode(line));
    });
    info.append(title, affiliation);
    top.append(portrait, info);
    const role = el('p', 'member-role', member.role || '');
    const research = el('p', 'member-research', member.research || '');
    const links = el('div', 'member-links');
    for (const [url, label] of [[member.website, 'Website'], [member.orcid, 'ORCID']]) {
      const link = externalLink(url, label, member.name || 'Committee member');
      if (link) links.append(link);
    }
    card.append(top, role, research, links);
    container.append(card);
  }
}
