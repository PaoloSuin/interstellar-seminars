
// All event dates and times are interpreted in the series time zone (Europe/Paris by default).
// A date-only comparison keeps a seminar visible as "upcoming" throughout its scheduled day.
const DEFAULT_TIMEZONE = 'Europe/Paris';
const get = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function todayInTimezone(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch { return new Intl.DateTimeFormat('en-CA', { timeZone: DEFAULT_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
}

function niceDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return 'To be confirmed';
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function timeLabel(event) {
  const zone = event.timezone || DEFAULT_TIMEZONE;
  return event.time ? `${event.time} (${zone})` : 'To be confirmed';
}

function safeLink(url, label) {
  if (!/^https:\/\//i.test(url || '')) return null;
  const link = el('a', 'text-link', label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function eventLinks(event, container, includeRecording = false) {
  const meeting = safeLink(event.meeting_url, 'Join seminar ↗');
  if (meeting && !includeRecording) container.append(meeting);
  const record = safeLink(event.recording_url, 'Watch recording ↗');
  if (record && includeRecording) container.append(record);
}

function buildCard(event, isPast = false) {
  const card = el('article', 'seminar-card');
  card.append(el('p', 'seminar-meta', `${niceDate(event.date)} · ${timeLabel(event)}${event.location ? ` · ${event.location}` : ''}`));
  card.append(el('h2', '', event.title || 'Talk title to be announced'));
  card.append(el('p', 'speaker', [event.speaker, event.affiliation].filter(Boolean).join(' · ') || 'Speaker to be announced'));
  if (event.abstract) card.append(el('p', 'abstract-text', event.abstract));
  const actions = el('div', 'seminar-actions');
  eventLinks(event, actions, isPast);
  if (actions.childElementCount) card.append(actions);
  return card;
}

function showFeatured(event) {
  get('featured-status').textContent = event.status === 'tentative' ? 'Tentative' : 'Scheduled';
  get('home-title').textContent = event.title || 'Talk title to be announced';
  get('featured-speaker').textContent = [event.speaker, event.affiliation].filter(Boolean).join(' · ') || 'Speaker to be announced';
  get('featured-date').textContent = niceDate(event.date);
  get('featured-time').textContent = timeLabel(event);
  get('featured-location').textContent = event.location || 'To be confirmed';
  get('featured-abstract').textContent = event.abstract || 'The abstract of the upcoming seminar will appear here.';
  const actions = get('featured-actions');
  actions.replaceChildren();
  eventLinks(event, actions);
}

export function renderSeminars(data) {
  const timeZone = data.timezone || DEFAULT_TIMEZONE;
  const today = todayInTimezone(timeZone);
  const all = (Array.isArray(data) ? data : data.seminars || [])
    .filter((event) => event && /^\d{4}-\d{2}-\d{2}$/.test(event.date || ''))
    .sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`));
  const active = all.filter((event) => event.status !== 'cancelled');
  const upcoming = active.filter((event) => event.date >= today);
  const past = active.filter((event) => event.date < today).reverse();
  if (upcoming.length) showFeatured(upcoming[0]);
  get('following-text').textContent = upcoming.length > 1
    ? `${upcoming.length - 1} more upcoming seminar${upcoming.length === 2 ? '' : 's'} in the programme.`
    : 'Further seminar dates will be announced soon.';
  const calendar = get('calendar-content');
  calendar.replaceChildren();
  if (upcoming.length) {
    const list = el('div', 'seminar-list');
    upcoming.forEach((event) => list.append(buildCard(event)));
    calendar.append(list);
  } else {
    const empty = el('div', 'empty');
    empty.append(el('strong', '', 'Seminar dates to be announced'), el('p', '', 'The programme will be listed by month as talks are confirmed.'));
    calendar.append(empty);
  }
  const pastContainer = get('past-content');
  pastContainer.replaceChildren();
  if (past.length) {
    const heading = el('h2', '', 'Previous seminars');
    const list = el('div', 'seminar-list');
    past.forEach((event) => list.append(buildCard(event, true)));
    pastContainer.append(heading, list);
  }
}
