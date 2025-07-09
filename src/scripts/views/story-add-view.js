import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class StoryAddView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.stream = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
  <a href="#story-form" class="skip-link">Lewati ke konten utama</a>
  <article style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); padding: 2rem; width: 100%; max-width: 960px; display: flex; flex-direction: column; justify-content: center; margin: 0 auto;">
 <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: #1e293b;">Tambah Cerita</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 2rem;">
      <form id="story-form" 
            tabindex="-1" 
            role="main" 
            style="flex: 1 1 300px; display: flex; flex-direction: column;">
        <label for="description">Deskripsi:</label>
        <textarea 
          id="description" 
          name="description" 
          required 
          aria-label="Deskripsi cerita" 
          style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; font-size: 1rem; margin-bottom: 1rem; width: 100%;">
        </textarea>

        <label for="photo">Upload Gambar:</label>
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <input 
            type="file" 
            id="photo" 
            name="photo" 
            accept="image/*" 
            required 
            aria-label="Pilih gambar untuk diunggah" 
            style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; font-size: 1rem; width: 100%;">
          <button 
            type="button" 
            id="camera-button" 
            aria-label="Buka kamera untuk mengambil foto" 
            style="background: #0ea5e9; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
            Kamera
          </button>
        </div>

        <div id="camera-preview" 
             style="display: none; text-align: center; width: 100%; margin-bottom: 1rem;">
          <video 
            id="video" 
            autoplay 
            aria-label="Pratinjau kamera" 
            style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 1rem;">
          </video>
          <div style="display: flex; justify-content: center; gap: 1rem;">
            <button 
              type="button" 
              id="capture-button" 
              aria-label="Ambil foto dari kamera" 
              style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Ambil foto
            </button>
            <button 
              type="button" 
              id="cancel-button" 
              aria-label="Batalkan dan tutup kamera" 
              style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
              Batal
            </button>
          </div>
        </div>

        <input type="hidden" id="lat" name="lat" />
        <input type="hidden" id="lon" name="lon" />

        <button 
          type="submit" 
          aria-label="Kirim cerita beserta deskripsi dan gambar" 
          style="margin-top: 1rem; padding: 12px 24px; background: #0369a1; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer;">
          Kirim Cerita
        </button>
      </form>
      <div id="map" 
           aria-label="Peta lokasi" 
           style="flex: 1 1 300px; min-width: 280px; height: 400px; border: 1px solid #ccc; border-radius: 8px;">
      </div>
    </div>
  </article>
`;
    this.initMap();
    this.initSubmit();
    this.initCamera();

    const mainContent = document.querySelector("#story-form");
    const skipLink = document.querySelector(".skip-link");

    L.Marker.prototype.options.icon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
          shadownAnchor: [12, 41]
        });

    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });

  }

  renderSubmitError(message) {
    alert(message);
  }

  renderSubmitSuccess() {
    alert('Cerita berhasil ditambahkan!');
  }

  initMap() {
    const map = L.map('map').setView([-2.5, 117], 5);
    const baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }),
      "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenTopoMap contributors'
      }),
      "Stadia satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
      }),
    };
    baseLayers["OpenStreetMap"].addTo(map);
    L.control.layers(baseLayers).addTo(map);

    let marker;

    const locateButton = L.control({ position: 'topright' });
    locateButton.onAdd = function () {
      const button = L.DomUtil.create('button', 'leaflet-bar');
      button.innerHTML = '📍';
      button.style.backgroundColor = 'white';
      button.style.padding = '8px';
      button.style.borderRadius = '12px';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      button.onclick = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);

            document.getElementById('lat').value = latitude;
            document.getElementById('lon').value = longitude;

            if (marker) map.removeLayer(marker);
            marker = L.marker([latitude, longitude]).addTo(map)
              .bindPopup(`Lokasi Anda: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`).openPopup();
          },
            (error) => {
              console.error('Geolocation error:', error);
              alert('Gagal mendapatkan lokasi Anda!');
            }
          );
        } else {
          alert('Geolocation tidak didukung di browser Anda.');
        }
      };
      return button;
    };
    locateButton.addTo(map);

    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`Lokasi dipilih: ${lat.toFixed(3)}, ${lng.toFixed(3)}`).openPopup();
    });
  }

  initSubmit() {
    const form = document.getElementById('story-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const photo = form.photo.files[0];
      const formData = new FormData(form);
      this.presenter.onSubmitPhoto(photo, formData);
    });
  }

  initCamera() {
    const cameraButton = document.getElementById('camera-button');
    const video = document.getElementById('video');
    const captureButton = document.getElementById('capture-button');
    const cancelButton = document.getElementById('cancel-button');
    const photoInput = document.getElementById('photo');

    cameraButton.addEventListener('click', async () => { await this.startCamera() });
    captureButton.addEventListener('click', async () => {
      if (!this.stream) return;
      const canvas = this.captureImageFromVideo(video);
      await this.stopCamera();
      this.canvasToFile(canvas, (file) => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
      });
    });

    cancelButton.addEventListener('click', async () => { await this.stopCamera(); });
    window.addEventListener('hashchange', async () => { await this.stopCamera(); });
  }

  async getCameraStream() {
    return await navigator.mediaDevices.getUserMedia({ video: true });
  }

  async startCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    cameraPreview.style.display = 'block';

    if (!this.stream) {
      try {
        this.stream = await this.getCameraStream();
        video.srcObject = this.stream;
      } catch (err) {
        console.error('Camera error:', err);
        alert('Tidak dapat mengakses kamera!');
      }
    }
  }

  async stopCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    if (cameraPreview) {
      cameraPreview.style.display = 'none';
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    const video = document.getElementById('video');
    if (video) {
      video.srcObject = null;
    }
  }

  captureImageFromVideo(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  canvasToFile(canvas, callback) {
    canvas.toBlob(blob => {
      const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
      callback(file);
    }, 'image/jpeg', 0.95);
  }

  showLoadingOverlay(text) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    this.overlay.textContent = text;
    document.body.appendChild(this.overlay);
    gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }

  hideLoadingOverlay() {
    if (this.overlay) {
      gsap.to(this.overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => this.overlay.remove()
      });
    }
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
