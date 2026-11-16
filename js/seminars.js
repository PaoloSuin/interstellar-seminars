
// All event dates and times are interpreted in the series time zone
// (Europe/Paris by default).

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
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    const part = (type) =>
      parts.find((item) => item.type === type)?.value;

    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  }
}

function niceDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || ''))
    return 'To be confirmed';

  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function timeLabel(event) {
  const zone = event.timezone || DEFAULT_TIMEZONE;

  return event.time
    ? `${event.time} (${zone})`
    : 'To be confirmed';
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

  if (meeting && !includeRecording)
    container.append(meeting);

  const record = safeLink(event.recording_url, 'Watch recording ↗');

  if (record && includeRecording)
    container.append(record);
}

function buildCard(event, isPast = false) {
  const card = el('article', 'seminar-card');

  card.append(el(
    'p',
    'seminar-meta',
    `${niceDate(event.date)} · ${timeLabel(event)}${
      event.location ? ` · ${event.location}` : ''
    }`
  ));

  card.append(el(
    'h2',
    '',
    event.title || 'Talk title to be announced'
  ));

  card.append(el(
    'p',
    'speaker',
    [event.speaker, event.affiliation]
      .filter(Boolean)
      .join(' · ') || 'Speaker to be announced'
  ));

  if (event.abstract)
    card.append(el('p', 'abstract-text', event.abstract));

  const actions = el('div', 'seminar-actions');
  eventLinks(event, actions, isPast);

  if (actions.childElementCount)
    card.append(actions);

  return card;
}

// Display the next scheduled seminar.

function showFeatured(event) {
  get('featured-status').textContent =
    event.status === 'tentative' ? 'Tentative' : 'Scheduled';

  get('home-title').textContent =
    event.title || 'Talk title to be announced';

  get('featured-speaker').textContent =
    [event.speaker, event.affiliation]
      .filter(Boolean)
      .join(' · ') || 'Speaker to be announced';

  get('featured-date').textContent =
    event.date ? niceDate(event.date) : 'To be announced';
  
  get('featured-timezone').textContent =
    event.timezone === 'Europe/Paris'
      ? 'CET/CEST (Paris)'
      : event.timezone || 'CET/CEST (Paris)';
  
  get('featured-time').textContent =
    event.time || 'To be announced';

  get('featured-abstract').textContent =
    event.abstract ||
    'The abstract of the upcoming seminar will appear here.';

  const actions = get('featured-actions');
  actions.replaceChildren();

  eventLinks(event, actions);
}

// DEFAULT DISPLAY
// Used when there are no upcoming seminars.
// This reproduces the original homepage placeholders.

function showToBeAnnounced() {
  get('featured-status').textContent = 'To be announced';

  get('home-title').textContent =
    'Talk title to be announced';

  get('featured-speaker').textContent =
    'Speaker and affiliation to be announced';

  get('featured-date').textContent = 'To be announced';
  
  get('featured-timezone').textContent = 'CET/CEST (Paris)';
  
  get('featured-time').textContent = 'To be announced';

  get('featured-abstract').textContent =
    'The abstract of the upcoming seminar will appear here.';

  get('featured-actions').replaceChildren();
}

// Main seminar rendering function.

export function renderSeminars(data) {
  const timeZone = data.timezone || DEFAULT_TIMEZONE;
  const today = todayInTimezone(timeZone);

const all = (
  Array.isArray(data) ? data : data.seminars || []
)
  .filter(event =>
    event &&
    (!event.date ||
      /^\d{4}-\d{2}-\d{2}$/.test(event.date))
  )
  .sort((a, b) => {
    if (!a.date) return b.date ? 1 : 0;
    if (!b.date) return -1;

    return a.date.localeCompare(b.date);
  });

  const active = all.filter(
    (event) => event.status !== 'cancelled'
  );

  const upcoming = active.filter(
    (event) => event.date >= today
  );

  const past = active.filter(
    (event) => event.date < today
  ).reverse();

  // Automatically choose what appears on the homepage.
  if (upcoming.length > 0) {
    showFeatured(upcoming[0]);
  } else {
    showToBeAnnounced();
  }

  // Text below the featured seminar.
  get('following-text').textContent =
    upcoming.length > 1
      ? `${upcoming.length - 1} more upcoming seminar${
          upcoming.length === 2 ? '' : 's'
        } in the programme.`
      : 'Further seminar dates will be announced soon.';

  // Calendar section.
  const calendar = get('calendar-content');
  calendar.replaceChildren();

  if (upcoming.length > 0) {
    const list = el('div', 'seminar-list');

    upcoming.forEach((event) =>
      list.append(buildCard(event))
    );

    calendar.append(list);
  } else {
    const empty = el('div', 'empty');

    empty.append(
      el('strong', '', 'Seminar dates to be announced'),
      el(
        'p',
        '',
        'The programme will be listed by month as talks are confirmed.'
      )
    );

    calendar.append(empty);
  }

  // Past seminars section.
  const pastContainer = get('past-content');
  pastContainer.replaceChildren();

  if (past.length > 0) {
    const heading = el('h2', '', 'Previous seminars');
    const list = el('div', 'seminar-list');

    past.forEach((event) =>
      list.append(buildCard(event, true))
    );

    pastContainer.append(heading, list);
  }
}
