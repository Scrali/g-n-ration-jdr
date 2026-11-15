/* ==========================================================
   Photos des scènes (Playmobil, dessins…).
   Les photos sont réduites puis gardées dans le navigateur
   (IndexedDB) : elles ne quittent jamais l'appareil.
   L'histoire ne garde qu'un identifiant de photo.
   ========================================================== */

const PHOTO_DB = "petits-heros-photos";
const photoCache = {};
let photoDbPromise = null;

function photoDb() {
  if (photoDbPromise) return photoDbPromise;
  photoDbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(PHOTO_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore("photos");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return photoDbPromise;
}

async function savePhoto(id, dataUrl) {
  photoCache[id] = dataUrl;
  const db = await photoDb();
  if (!db) return;
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction("photos", "readwrite");
      tx.objectStore("photos").put(dataUrl, id);
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch { /* gardée seulement en mémoire */ }
}

async function getPhoto(id) {
  if (photoCache[id]) return photoCache[id];
  const db = await photoDb();
  if (!db) return null;
  try {
    const data = await new Promise((resolve) => {
      const req = db.transaction("photos").objectStore("photos").get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (data) photoCache[id] = data;
    return data;
  } catch { return null; }
}

// Réduit la photo (900 px max) pour qu'elle prenne peu de place
function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function addPhotoFromFile(file) {
  const data = await shrinkPhoto(file);
  const id = `photo-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  await savePhoto(id, data);
  return id;
}

// Remplit toutes les images <img data-photo="…"> de la page
function hydratePhotos(root = document) {
  root.querySelectorAll("img[data-photo]:not([src])").forEach(async (img) => {
    const data = await getPhoto(img.dataset.photo);
    if (data) img.src = data;
    else img.replaceWith(Object.assign(document.createElement("p"), { className: "hint", textContent: "📸 (photo gardée sur un autre appareil)" }));
  });
}

function photoHTML(id, legende) {
  return `<figure class="scene-photo"><img data-photo="${escapeHtml(id)}" alt="${escapeHtml(legende || "Photo de la scène")}">${legende ? `<figcaption>${escapeHtml(legende)}</figcaption>` : ""}</figure>`;
}

// Les nouvelles images s'affichent dès qu'elles apparaissent dans la page
new MutationObserver(() => hydratePhotos()).observe(document.documentElement, { childList: true, subtree: true });
