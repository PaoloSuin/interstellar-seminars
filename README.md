# Interstellar SeMinar

**An online seminar series on the interstellar medium and star formation.**

[Visit the website](https://interstellar-seminars.com/) · [View the source](https://github.com/PaoloSuin/interstellar-seminars)

Interstellar SeMinar brings together researchers studying the interstellar medium, from the structure and dynamics of Galactic gas and dust to magnetic fields, turbulence, molecular clouds, and star formation. The website provides a central place to find upcoming talks, seminar information, and the organising committee.

## Website

The site includes:

- **Home:** the next seminar's title, speaker, abstract, date, time, and location, once announced.
- **Calendar:** the upcoming seminar programme.
- **Recordings:** a planned archive of previous talks, intended for authorised participants.
- **Committee:** profiles and research interests of the Scientific Organising Committee.

> **Current status:** Seminar dates and speaker details are still to be announced. The recordings area is a placeholder; authentication and video access are not yet implemented.

## Scientific Organising Committee

- **Kate Pattle** — University College London
- **Juan Soler** — University of Vienna
- **Jack Berat** — CEA Paris-Saclay
- **Paolo Suin** — CEA Paris-Saclay

Further information and links to individual profiles are available on the [Committee page](https://interstellar-seminars.com/#soc).
The site is a lightweight, static HTML website with embedded CSS and JavaScript. It does not require a build system or external JavaScript framework.

## Updating the website

Content is currently maintained directly in `index.html`:

1. **Upcoming seminar:** edit the content of the `#home` section to add the title, speaker, date, time, location, and abstract.
2. **Programme:** update the `#calendar` section as talks are confirmed.
3. **Recordings:** update `#past-talks` only after an appropriate access-control solution is in place.
4. **Committee:** edit the `#soc` section and add or replace portrait images as needed.

Changes pushed to the published branch can be deployed through GitHub Pages, depending on the repository's Pages settings. The custom domain is configured in `CNAME`.

**Privacy note:** GitHub Pages serves publicly accessible static files. Do not commit private recording URLs, credentials, or other restricted material to this repository; access control must be handled by an appropriate external service.

## Contact

For questions about the seminar series, refer to the [website](https://interstellar-seminars.com/). A dedicated contact address has not yet been published on the site.
