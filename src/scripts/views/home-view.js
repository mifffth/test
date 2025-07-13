export class HomeView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
    <div class="hero">
        <h1 class="text-4xl font-bold">WebGIS Persebaran Fasilitas Kesehatan</h1>
    </div>

    <main class="home-content">
        <div class="container">
            <div class="content">
                <h2>Selamat Datang</h2>
                <p>
                    WebGIS ini dirancang untuk memvisualisasikan persebaran fasilitas kesehatan seperti rumah sakit, puskesmas,
                    apotek, dan fasilitas kesehatan lainnya di wilayah Kelurahan Tridadi, Sleman, Daerah Istimewa Yogyakarta
                    secara interaktif dan informatif, disertai informasi nama dan koordinat geografis dari setiap titik fasilitas kesehatan.
                </p>
            </div>
        </div>

        <div class="gallery">
            <img src="assets/images/foto1.jpg" alt="Health Facility Image 1">
            <img src="assets/images/foto2.jpg" alt="Health Facility Image 2">
            <img src="assets/images/foto3.jpg" alt="Health Facility Image 3">
            <img src="assets/images/foto4.jpg" alt="Health Facility Image 4">
            <img src="assets/images/foto5.jpg" alt="Health Facility Image 5">
            <img src="assets/images/foto6.jpg" alt="Health Facility Image 6">
        </div>

        <div class="container">
            <div class="intro">
                <h3 class="text-2xl font-bold">Mengapa Faskes Penting?</h3>
                <p>
                    Faskes yang tersebar secara merata dapat meningkatkan akses layanan kesehatan, mengurangi waktu respons
                    darurat, dan mendorong pemerataan kualitas hidup masyarakat. Informasi yang transparan tentang lokasi
                    faskes membantu perencanaan wilayah dan pengambilan keputusan kebijakan publik.
                </p>
            </div>

            <div class="chart-section">
                <div id="chart"></div>
            </div>
            <hr>
            <div class="content-bottom">
                <p>
                    Proyek WebGIS ini merupakan hasil dari program Kuliah Kerja Nyata (KKN) PPM-UGM 2025 Periode II yang
                    dilaksanakan di Kalurahan Tridadi, Kabupaten Sleman, Daerah Istimewa Yogyakarta.
                    WebGIS ini bertujuan memudahkan masyarakat dalam mengakses informasi mengenai lokasi fasilitas kesehatan
                    terdekat seperti rumah sakit, puskesmas, dan lainnya yang belum terjangkau internet/diketahu oleh umum.
                </p>
                <p style="margin-top: 1rem;">
                    Dengan pendekatan geospasial, kami berharap WebGIS ini dapat menjadi sarana pendukung pengambilan keputusan
                    dan meningkatkan kesadaran masyarakat akan pentingnya akses layanan kesehatan yang merata.
                </p>
            </div>
        </div>
    </main>
    `;

    fetch("./faskes.json")
      .then((response) => response.json())
      .then((data) => {
        const countsByTipe = data.reduce((acc, item) => {
          acc[item.tipe] = (acc[item.tipe] || 0) + 1;
          return acc;
        }, {});

        const categories = Object.keys(countsByTipe);
        const values = Object.values(countsByTipe);

        const colorMap = {
          Apotek: "#1E88E5",
          Klinik: "#43A047",
          'Praktek Mandiri': "#FFC107",
          Posyandu : "#E91E63",
          Puskesmas: "#E53935",
          Lainnya : "#9C27B0",
        };

        const barColors = categories.map((tipe) => colorMap[tipe] || "#888");

        const options = {
          series: [
            {
              name: "Jumlah Fasilitas",
              data: values,
            },
          ],
          chart: {
            type: "bar",
            height: 350,
            fontFamily: "Segoe UI, sans-serif",
          },
          xaxis: {
            categories: categories,
            title: { text: "Tipe Fasilitas" },
          },
          yaxis: {
            title: { text: "Jumlah" },
            allowDecimals: false,
          },
          plotOptions: {
            bar: {
              distributed: true,
              borderRadius: 4,
              columnWidth: "50%",
            },
          },
          tooltip: {
            y: {
              formatter: (val) => `${val} fasilitas`,
            },
          },
          colors: barColors,
          legend: {
            show: false,
          }
        };
        const chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      })
      .catch((error) => console.error("Gagal memuat JSON:", error));
  }
}