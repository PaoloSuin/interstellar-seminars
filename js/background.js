
const images = {
  optical: 'image/m31/m31_optical.jpg',
  infrared: 'image/m31/m31_infrared.tif',
  uv: 'image/m31/m31_uv.tif',
  radio: 'image/m31/m31_radio.tif',
  xray: 'image/m31/m31_xray.tif',
  composite: 'image/m31/m31_composite.jpg'
};
export function initBackground() {
  const background = document.querySelector('.galaxy-background');
  const selector = document.querySelector('#wavelength-select');

  if (!background || !selector) return;

  let stored = null;

  try {
    stored = sessionStorage.getItem('m31-band');
  } catch {
    // Storage may be unavailable.
  }

  const initial = Object.hasOwn(images, stored)
    ? stored
    : 'optical';

  function selectBand(band) {
    if (!Object.hasOwn(images, band)) return;

    background.style.backgroundImage =
      `url("${images[band]}")`;

    selector.value = band;

    try {
      sessionStorage.setItem('m31-band', band);
    } catch {
      // Continue without storage.
    }
  }

  selector.addEventListener('change', () => {
    selectBand(selector.value);
  });

  selectBand(initial);
}
