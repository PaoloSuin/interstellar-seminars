
import { renderSeminars } from './seminars.js';
import { renderCommittee } from './committee.js';
import { initBackground } from './background.js';

const views = [...document.querySelectorAll('.view')];
const navLinks = [...document.querySelectorAll('nav a')];

const titles = {
  calendar: 'Calendar',
  'past-talks': 'Recordings',
  soc: 'Committee'
};

// Navigation
function navigate(focus = false) {
  const requested = location.hash.slice(1) || 'home';

  const id = views.some(view => view.id === requested)
    ? requested
    : 'home';

  views.forEach(view => {
    view.hidden = view.id !== id;
  });

  navLinks.forEach(link => {
    if (link.hash === `#${id}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  document.title =
    `${titles[id] ? `${titles[id]} | ` : ''}Interstellar SeMinar`;

  if (focus) {
    document.querySelector(`#${id} h1`)
      ?.focus({ preventScroll: true });

    window.scrollTo(0, 0);
  }
}

// Load JSON files
async function readJSON(path) {
  const response = await fetch(path, { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error(
      `Could not load ${path} (HTTP ${response.status})`
    );
  }

  return response.json();
}

// Website information and contact addresses
function renderSite(site) {
  if (site.name) {
    document.querySelector('.brand').textContent = site.name;
    document.querySelector('.footer-brand').textContent = site.name;
  }

  if (site.description) {
    document.querySelector('#site-description').textContent =
      site.description;
  }

  const contact = document.querySelector('#site-contact');

  if (Array.isArray(site.contact_emails)) {
    contact.replaceChildren();

    for (const email of site.contact_emails) {
      const link = document.createElement('a');

      link.href = `mailto:${email}`;
      link.textContent = email;
      link.className = 'contact-link';

      contact.append(link);
    }
  }
}

// Initialise website data
async function init() {
  const [siteResult, seminarResult, committeeResult] =
    await Promise.allSettled([
      readJSON('data/site.json'),
      readJSON('data/seminars.json'),
      readJSON('data/committee.json')
    ]);

  if (siteResult.status === 'fulfilled') {
    renderSite(siteResult.value);
  } else {
    console.error(siteResult.reason);
  }

  if (seminarResult.status === 'fulfilled') {
    renderSeminars(seminarResult.value);
  } else {
    console.error(seminarResult.reason);

    document.querySelector('#following-text').textContent =
      'Seminar information is temporarily unavailable.';

    document.querySelector('#calendar-content').textContent =
      'The programme could not be loaded.';
  }

  if (committeeResult.status === 'fulfilled') {
    renderCommittee(committeeResult.value);
  } else {
    console.error(committeeResult.reason);

    document.querySelector('#committee-grid').textContent =
      'Committee profiles could not be loaded.';
  }
}

// Handle navigation
window.addEventListener('hashchange', () => {
  if (location.hash !== '#main-content') {
    navigate(true);
  }
});

// Initialise
navigate();
init();
initBackground();

// Start at the top of the page
window.addEventListener('load', () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  });
});
