
/*
 * Interstellar SeMinar
 * Seminar programme, featured talk, calendar and recordings.
 *
 * Data source: data/seminars.json
 * Default time zone: Europe/Paris
 */

const DEFAULT_TIMEZONE = 'Europe/Paris';

const get = (id) => document.getElementById(id);

const el = (tag, className = '', text) => {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;

  return node;
};

// --------------------------------------------------
// Date and time utilities
// --------------------------------------------------

function todayInTimezone(timeZone = DEFAULT_TIMEZONE) {
  let formatter;

  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: DEFAULT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  const parts = formatter.formatToParts(new Date());

  const part = (type) =>
    parts.find(item => item.type === type)?.value;

  return `${part('year')}-${part('month')}-${part('day')}`;
}

function validDate(date) {
  if (typeof date !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function dateObject(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function niceDate(iso) {
  if (!validDate(iso)) return 'To be announced';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(dateObject(iso));
}

function shortMonth(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    timeZone: 'UTC'
  }).format(dateObject(iso)).toUpperCase();
}

function timeZoneLabel(timeZone) {
  if (!timeZone || timeZone === 'Europe/Paris') {
    return 'CET/CEST (Paris)';
  }

  return timeZone;
}

function timeLabel(event) {
  const zone = timeZoneLabel(event.timezone);

  return event.time
    ? `${event.time} (${zone})`
    : `Time to be announced (${zone})`;
}

function titleLabel(title) {
  if (
    !title ||
    title.trim() === '' ||
    title.trim().toLowerCase() === 'to be announced'
  ) {
    return 'Title to be announced';
  }

  return title;
}

// --------------------------------------------------
// External links
// --------------------------------------------------

function safeLink(url, label, className = 'text-link') {
  if (typeof url !== 'string') return null;

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;

  const link = el('a', className, label);

  link.href = parsed.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  return link;
}

function eventLinks(event, container, includeRecording = false) {
  if (!includeRecording) {
    const meeting = safeLink(
      event.meeting_url,
      'Join seminar ↗'
    );

    if (meeting) container.append(meeting);
  } else {
    const recording = safeLink(
      event.recording_url,
      'Watch recording ↗'
    );

    if (recording) container.append(recording);
  }
}

// --------------------------------------------------
// Calendar cards
// --------------------------------------------------

function buildCard(event) {
  const card = el('article', 'seminar-card');

  const meta = el(
    'p',
    'seminar-meta',
    `${niceDate(event.date)} · ${timeLabel(event)}${
      event.location ? ` · ${event.location}` : ''
    }`
  );

  const speaker = el(
    'h2',
    '',
    event.speaker || 'Speaker to be announced'
  );

  const affiliation = el(
    'p',
    'speaker',
    event.affiliation || 'Affiliation to be announced'
  );

  const title = el(
    'h3',
    'seminar-title',
    titleLabel(event.title)
  );

  card.append(meta, speaker, affiliation, title);

  if (event.abstract) {
    card.append(
      el('p', 'abstract-text', event.abstract)
    );
  }

  const actions = el('div', 'seminar-actions');

  eventLinks(event, actions);

  if (actions.childElementCount) {
    card.append(actions);
  }

  return card;
}

// --------------------------------------------------
// Featured seminar
// --------------------------------------------------

function showFeatured(event) {
  // Status badge is optional.
  const status = get('featured-status');

  if (status) {
    status.textContent =
      event.status === 'tentative'
        ? 'Tentative'
        : 'Scheduled';
  }

  get('featured-speaker').textContent =
    event.speaker || 'Speaker to be announced';

  get('featured-affiliation').textContent =
    event.affiliation || 'Affiliation to be announced';

  get('home-title').textContent =
    titleLabel(event.title);

  get('featured-date').textContent =
    niceDate(event.date);

  get('featured-timezone').textContent =
    timeZoneLabel(event.timezone);

  get('featured-time').textContent =
    event.time || 'To be announced';

  get('featured-abstract').textContent =
    event.abstract ||
    'The abstract of the upcoming seminar will appear here.';

  const actions = get('featured-actions');
  actions.replaceChildren();

  eventLinks(event, actions);
}

// --------------------------------------------------
// Default homepage when no upcoming talks exist
// --------------------------------------------------

function showToBeAnnounced() {
  const status = get('featured-status');

  if (status) {
    status.textContent = 'To be announced';
  }

  get('featured-speaker').textContent =
    'Speaker to be announced';

  get('featured-affiliation').textContent =
    'Affiliation to be announced';

  get('home-title').textContent =
    'Title to be announced';

  get('featured-date').textContent =
    'To be announced';

  get('featured-timezone').textContent =
    'CET/CEST (Paris)';

  get('featured-time').textContent =
    'To be announced';

  get('featured-abstract').textContent =
    'The abstract of the upcoming seminar will appear here.';

  get('featured-actions').replaceChildren();
}

// --------------------------------------------------
// Upcoming seminar calendar
// --------------------------------------------------

function renderCalendar(events) {
  const container = get('calendar-content');

  container.replaceChildren();

  if (!events.length) {
    const empty = el('div', 'empty');

    empty.append(
      el('strong', '', 'Seminar dates to be announced'),
      el(
        'p',
        '',
        'The programme will be listed by month as talks are confirmed.'
      )
    );

    container.append(empty);
    return;
  }

  const list = el('div', 'seminar-list');

  for (const event of events) {
    list.append(buildCard(event));
  }

  container.append(list);
}

// --------------------------------------------------
// Recordings: individual timeline entries
// --------------------------------------------------

function buildRecordingEntry(event) {
  const entry = el('article', 'recording-entry');

  // Date column: large day + three-letter month.
  const dateBox = el('div', 'recording-date');

  const day = Number(event.date.slice(8, 10));

  dateBox.append(
    el(
      'span',
      'recording-day',
      String(day).padStart(2, '0')
    ),
    el(
      'span',
      'recording-month',
      shortMonth(event.date)
    )
  );

  // Recording information.
  const content = el('div', 'recording-content');

  const speaker = el(
    'h3',
    'recording-speaker',
    event.speaker || 'Speaker to be announced'
  );

  const title = el(
    'p',
    'recording-title',
    titleLabel(event.title)
  );

  content.append(speaker, title);

  // Optional related publication.
  if (event.publication_url) {
    const publication = safeLink(
      event.publication_url,
      'Publication ↗'
    );

    if (publication) {
      const related = el('p', 'recording-related');

      related.append(
        document.createTextNode('See also: '),
        publication
      );

      content.append(related);
    }
  }

  // Recording link.
  const recording = safeLink(
    event.recording_url,
    'Watch recording ↗'
  );

  if (recording) {
    const actions = el('div', 'recording-actions');

    actions.append(recording);
    content.append(actions);
  }

  entry.append(dateBox, content);

  return entry;
}

// --------------------------------------------------
// Recordings: group entries by year
// --------------------------------------------------

function renderRecordings(events) {
  const container = get('past-content');

  container.replaceChildren();

  if (!events.length) {
    const empty = el('div', 'empty');

    empty.append(
      el('strong', '', 'No recordings available yet'),
      el(
        'p',
        '',
        'Recordings of previous seminars will appear here.'
      )
    );

    container.append(empty);
    return;
  }

  const years = new Map();

  for (const event of events) {
    const year = event.date.slice(0, 4);

    if (!years.has(year)) {
      years.set(year, []);
    }

    years.get(year).push(event);
  }

  for (const [year, seminars] of years) {
    const section = el('section', 'recording-year');

    section.append(
      el('h2', 'recording-year-title', year)
    );

    const timeline = el('div', 'recording-timeline');

    for (const event of seminars) {
      timeline.append(buildRecordingEntry(event));
    }

    section.append(timeline);
    container.append(section);
  }
}

// --------------------------------------------------
// Main rendering
// --------------------------------------------------

export function renderSeminars(data) {
  const timeZone =
    (!Array.isArray(data) && data?.timezone) ||
    DEFAULT_TIMEZONE;

  const today = todayInTimezone(timeZone);

  // Preserve the order in seminars.json.
  const all = (
    Array.isArray(data) ? data : data?.seminars || []
  ).filter(event =>
    event &&
    (!event.date || validDate(event.date))
  );

  // Cancelled seminars are excluded.
  const active = all.filter(
    event => event.status !== 'cancelled'
  );

  // Future seminars and seminars without a date.
  const upcoming = active.filter(
    event => !event.date || event.date >= today
  );

  // First upcoming seminar in JSON is featured.
  const featured = upcoming[0] || null;

  // Other upcoming seminars are ordered by date.
  // Undated seminars appear after dated ones.
  const remaining = upcoming
    .slice(1)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;

      const dateComparison = a.date.localeCompare(b.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return (a.time || '').localeCompare(b.time || '');
    });

  // Past seminars with a valid recording URL only.
  const recordings = active
    .filter(event =>
      validDate(event.date) &&
      event.date < today &&
      safeLink(event.recording_url, 'Recording') !== null
    )
    .sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return (b.time || '').localeCompare(a.time || '');
    });

  // Homepage.
  if (featured) {
    showFeatured(featured);
  } else {
    showToBeAnnounced();
  }

  // Upcoming seminar count.
  get('following-text').textContent =
    remaining.length > 0
      ? `${remaining.length} more upcoming seminar${
          remaining.length === 1 ? '' : 's'
        } in the programme.`
      : 'Further seminar dates will be announced soon.';

  // Calendar: featured first, remaining chronologically.
  const calendarEvents = [
    ...(featured ? [featured] : []),
    ...remaining
  ];

  renderCalendar(calendarEvents);

  // Recordings: newest first, grouped by year.
  renderRecordings(recordings);
}
