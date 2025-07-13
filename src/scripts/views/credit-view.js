export class CreditView {
    constructor(container) {
      this.container = container;
      this.presenter = null;
    }
  
    setPresenter(presenter) {
      this.presenter = presenter;
    }
  
    render() {
      this.container.innerHTML = `
        <style>
          .credit-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
    
          .credit-container h2 {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1.5rem;
          }
    
          .credit-container p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1rem;
            text-align: center;
          }
    
          .credit-container a {
            color: #2563eb;
            text-decoration: underline;
          }
    
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
    
        <div class="credit-container">
          <h2>Credit</h2>
          <p>Proyek WebGIS ini dikembangkan sebagai bagian dari program KKN di Tridadi, Sleman.</p>
          <p>Data peta menggunakan layanan <a href="https://www.openstreetmap.org/#map=17/-7.723548/110.358798" target="_blank">OpenStreetMap</a>.</p>
          <p>Pengembangan proyek ini menggunakan bundler modern <strong>Webpack</strong> untuk manajemen modul dan optimasi.</p>
          <p>Kontributor utama: <strong>Miftah</strong></p>
        </div>
      `;
    }    
  }