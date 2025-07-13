import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class MapView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.map = null;
    this.userMarker = null; // Tambahkan properti untuk menyimpan marker pengguna
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `<div id="map"></div>`;
    this.initMap();
  }

  async initMap() {
    const savedView = sessionStorage.getItem('mapView');
    if (savedView) {
      const { center, zoom } = JSON.parse(savedView);
      this.map = L.map('map').setView(center, zoom);
    } else {
      this.map = L.map('map').setView([-2.5, 117], 5);
    }


    // Icon fix for Webpack
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    // --- Base Layers ---
    const baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map),
      "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenTopoMap contributors'
      }),
      "Stadia satellite": L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; CNES, Distribution Airbus DS | &copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap',
        ext: 'jpg'
      }),
    };

    // --- Fetch Faskes Data ---
    this.loadFaskesData(baseLayers);

    // --- Add Get User Location Control ---
    this.addLocationControl();

    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      sessionStorage.setItem('mapView', JSON.stringify({
        center: [center.lat, center.lng],
        zoom: zoom
      }));
    });
    
  }

  async loadFaskesData(baseLayers) {
    try {
      const response = await fetch('./faskes.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const faskesData = await response.json();
      
      const overlays = this.createFaskesLayers(faskesData);

      L.control.layers(baseLayers, overlays, {
        position: 'topright',
        collapsed: true
      }).addTo(this.map);

    } catch (error) {
      console.error("Gagal memuat data Faskes:", error);
      this.container.innerHTML += `<div class="error-message">Gagal memuat data fasilitas kesehatan.</div>`;
    }
  }
  
  addLocationControl() {
    const LocationControl = L.Control.extend({
      options: {
        position: 'topleft' 
      },

      onAdd: (map) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = '📍';
        container.style.backgroundColor = 'white';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.textAlign = 'center';
        container.style.lineHeight = '30px';
        container.style.fontSize = '1.2em';
        container.style.cursor = 'pointer';

        container.onclick = (e) => {
          e.stopPropagation();
          this.getUserLocation();
        };

        return container;
      }
    });

    this.map.addControl(new LocationControl());
  }
  
  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const latLng = [latitude, longitude];

        // Hapus marker lama jika ada
        if (this.userMarker) {
          this.map.removeLayer(this.userMarker);
        }

        // Buat icon khusus untuk lokasi pengguna
        const userIcon = L.divIcon({
          html: '<div class="user-marker-pulse"></div>',
          className: 'user-marker-container',
          iconSize: [20, 20],
        });
        
        // Tambahkan marker baru
        this.userMarker = L.marker(latLng, { icon: userIcon }).addTo(this.map);
        
        this.map.setView(latLng, 15);
        
        const popupContent = `
          <div>
            <b>Lokasi Anda:</b><br>${latitude.toFixed(5)}, ${longitude.toFixed(5)}
            <br><br>
            <button id="delete-marker-btn" class="delete-marker-button">Hapus</button>
          </div>
        `;
        
        this.userMarker.bindPopup(popupContent).openPopup();
        
        // Tambahkan event listener setelah popup terbuka
        this.userMarker.on('popupopen', () => {
          const deleteBtn = document.getElementById('delete-marker-btn');
          deleteBtn.onclick = () => {
            if (this.userMarker) {
              this.map.removeLayer(this.userMarker);
              this.userMarker = null;
            }
          };
        });

      }, (error) => {
        alert('Gagal mendapatkan lokasi Anda. Pastikan Anda memberikan izin lokasi.');
        console.error('Geolocation error:', error);
      });
    } else {
      alert('Geolocation tidak didukung oleh browser Anda.');
    }
  }

  createFaskesLayers(faskesData) {
    const layers = {};
    const iconColors = {
      'Rumah Sakit': 'blue',
      'Klinik': 'green',
      'Puskesmas': 'orange'
    };

    faskesData.forEach(faskes => {
      const { tipe, nama, lat, lon } = faskes;
      
      if (!layers[tipe]) {
        layers[tipe] = L.layerGroup().addTo(this.map);
      }
      
      const icon = this.createColoredIcon(iconColors[tipe] || 'grey');
      const marker = L.marker([lat, lon], { icon }).bindPopup(`<b>${nama}</b><br>${tipe}`);
      
      layers[tipe].addLayer(marker);
    });

    return layers;
  }
  
  createColoredIcon(color) {
    const markerHtmlStyles = `
      background-color: ${color};
      width: 1.5rem;
      height: 1.5rem;
      display: block;
      left: -0.75rem;
      top: -0.75rem;
      position: relative;
      border-radius: 1.5rem 1.5rem 0;
      transform: rotate(45deg);
      border: 1px solid #FFFFFF`;

    return L.divIcon({
      className: "my-custom-pin",
      iconAnchor: [0, 24],
      popupAnchor: [0, -36],
      html: `<span style="${markerHtmlStyles}" />`
    });
  }
}