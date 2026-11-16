
const images = {
  optical: 'image/m31/m31_optical.jpg',
  infrared: 'image/m31/m31_infrared.tif',
  uv: 'image/m31/m31_uv.tif',
  radio: 'image/m31/m31_radio.tif',
  xray: 'image/m31/m31_xray.tif',
  composite: 'image/m31/m31_composite.jpg'
};

export function initBackground() {
  const selector = document.querySelector('#wavelength-select');
  const layers = [
    document.querySelector('.galaxy-layer-a'),
    document.querySelector('.galaxy-layer-b')
  ];

  if (!selector || layers.some(layer => !layer)) return;

  let activeLayer = 0;
  let currentBand = 'optical';
  let requestId = 0;

  const loadedImages = new Map();

  function loadImage(band) {
    if (loadedImages.has(band)) {
      return loadedImages.get(band);
    }

    const promise = new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image.src);
      image.onerror = () => reject(
        new Error(`Cannot load image: ${images[band]}`)
      );

      image.src = images[band];
    });

    loadedImages.set(band, promise);

    promise.catch(() => loadedImages.delete(band));

    return promise;
  }

  // Initial background
  layers[0].style.backgroundImage =
    `url("${images.optical}")`;

  layers[0].style.opacity = '1';
  layers[1].style.opacity = '0';

  async function selectBand(band) {
    if (!Object.hasOwn(images, band)) return;

    const thisRequest = ++requestId;

    if (band === currentBand) return;

    try {
      const url = await loadImage(band);

      // Ignore outdated requests.
      if (thisRequest !== requestId) return;

      const nextLayer = 1 - activeLayer;

      // Prepare the hidden layer.
      layers[nextLayer].style.transition = 'none';
      layers[nextLayer].style.opacity = '0';
      layers[nextLayer].style.backgroundImage = `url("${url}")`;

      // Force layout before starting the transition.
      void layers[nextLayer].offsetWidth;

      layers[nextLayer].style.transition = '';
      layers[nextLayer].style.opacity = '1';

      // The new layer is now on top.
      layers[nextLayer].style.zIndex = '2';
      layers[activeLayer].style.zIndex = '1';

      // Fade the old layer out as well.
      layers[activeLayer].style.opacity = '0';

      activeLayer = nextLayer;
      currentBand = band;

      selector.value = band;

      try {
        sessionStorage.setItem('m31-band', band);
      } catch {
        // Storage is optional.
      }

    } catch (error) {
      console.error(error);

      // Restore the last working selection.
      if (thisRequest === requestId) {
        selector.value = currentBand;
      }
    }
  }

  selector.addEventListener('change', () => {
    selectBand(selector.value);
  });

  // Restore the previous selection if available.
  let initial = 'optical';

  try {
    const saved = sessionStorage.getItem('m31-band');

    if (Object.hasOwn(images, saved)) {
      initial = saved;
    }
  } catch {
    // Use optical.
  }

  selector.value = initial;

  if (initial !== 'optical') {
    selectBand(initial);
  }
}
