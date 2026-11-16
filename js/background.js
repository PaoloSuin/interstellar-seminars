
const images = {
  optical: 'image/m31/m31_optical.jpg',
  infrared: 'image/m31/m31_infrared.tif',
  uv: 'image/m31/m31_uv.tif',
  radio: 'image/m31/m31_radio.tif',
  xray: 'image/m31/m31_xray.tif',
  composite: 'image/m31/m31.jpg'
};

export function initBackground() {
  const background = document.querySelector('.galaxy-background');
  const selector = document.querySelector('#wavelength-select');

  if (!background || !selector) return;

  // Optical is the default.
  const defaultBand = 'optical';

  function selectBand(band) {
    if (!Object.hasOwn(images, band)) return;

    const image = new Image();

    image.onload = () => {
      // Change only the image.
      // Zoom and positioning remain controlled by CSS.
      background.style.backgroundImage =
        `url("${images[band]}")`;

      selector.value = band;
    };

    image.onerror = () => {
      console.error(`Cannot load background: ${images[band]}`);
    };

    image.src = images[band];
  }

  selector.addEventListener('change', () => {
    selectBand(selector.value);
  });

  selectBand(defaultBand);
}
