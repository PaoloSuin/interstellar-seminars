
const images = {
  optical: 'image/m31/m31_optical.jpg',
  infrared: 'image/m31/m31_infrared.jpg',
  uv: 'image/m31/m31_uv.jpg',
  radio: 'image/m31/m31_radio.jpg',
  xray: 'image/m31/m31_xray.jpg',
  composite: 'image/m31/m31.jpg'
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

  if (band === currentBand) {
    selector.value = band;
    return;
  }

  try {
    const url = await loadImage(band);

    if (thisRequest !== requestId) return;

    const nextLayer = 1 - activeLayer;
    const incoming = layers[nextLayer];
    const outgoing = layers[activeLayer];

    // Prepare the incoming image.
    incoming.style.transition = 'none';
    incoming.style.opacity = '0';
    incoming.style.backgroundImage = `url("${url}")`;

    incoming.style.zIndex = '2';
    outgoing.style.zIndex = '1';

    // Apply the initial state.
    void incoming.offsetWidth;

    // Start the smooth crossfade.
    incoming.style.transition = 'opacity 0.8s ease-in-out';
    outgoing.style.transition = 'opacity 0.8s ease-in-out';

    incoming.style.opacity = '1';
    outgoing.style.opacity = '0';

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
