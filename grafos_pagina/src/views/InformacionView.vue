<script setup></script>

<template>
  <main class="info-page">
    <!-- Intro -->
    <section class="section fade-in">
      <h1 class="page-title"><span class="sparkle">📐</span> ¿Qué es un Grafo?</h1>
      <p class="intro-text">
        Un grafo es una estructura matemática que se usa para representar
        <strong>relaciones entre elementos</strong>.
      </p>
    </section>

    <!-- Componentes -->
    <section class="section fade-in">
      <h2 class="section-title">Componentes de un grafo</h2>
      <p>Un grafo está formado por:</p>
      <ul class="styled-list">
        <li><strong>Vértices (V)</strong> → también llamados nodos.</li>
        <li><strong>Aristas (E)</strong> → conexiones entre los vértices.</li>
      </ul>
      <div class="formula-card">
        <p>Se representa como:</p>
        <p class="formula">G = (V, E)</p>
        <p>Donde:</p>
        <ul class="styled-list compact">
          <li><strong>V</strong> = conjunto de vértices</li>
          <li><strong>E</strong> = conjunto de aristas</li>
        </ul>
      </div>
    </section>

    <!-- Tipos de grafos -->
    <section class="section fade-in">
      <h2 class="section-title">Tipos de Grafos</h2>

      <div class="card-grid">
        <div class="card">
          <div class="card-number">1</div>
          <h3>Grafo no dirigido</h3>
          <p>Las aristas <strong>no tienen dirección</strong>.</p>
          <div class="example-box">
            <span class="example-label">Ejemplo:</span>
            Si A está conectado con B, entonces B también está conectado con A.
          </div>
        </div>

        <div class="card">
          <div class="card-number">2</div>
          <h3>Grafo dirigido (digrafo)</h3>
          <p>Las aristas <strong>tienen dirección</strong>.</p>
          <div class="example-box">
            <span class="example-label">Ejemplo:</span>
            A → B significa que va de A hacia B, pero no necesariamente al revés.
          </div>
        </div>

        <div class="card">
          <div class="card-number">3</div>
          <h3>Grafo ponderado</h3>
          <p>Las aristas tienen un <strong>peso o valor</strong> asociado.</p>
          <div class="example-box">
            <span class="example-label">Ejemplo:</span>
            Distancia entre ciudades, costo, tiempo, etc.
          </div>
        </div>

        <div class="card">
          <div class="card-number">4</div>
          <h3>Grafo simple</h3>
          <ul class="styled-list compact">
            <li>No tiene lazos (un nodo conectado consigo mismo).</li>
            <li>No tiene aristas múltiples entre los mismos vértices.</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Matriz de adyacencia -->
    <section class="section fade-in">
      <h2 class="section-title">Matriz de Adyacencia</h2>
      <p>
        La matriz de adyacencia es una forma de representar un grafo usando una
        <strong>matriz cuadrada</strong>.
      </p>
      <div class="formula-card">
        <p>Si el grafo tiene <strong>n</strong> vértices, la matriz será de tamaño:</p>
        <p class="formula">n × n</p>
      </div>
      <ul class="styled-list highlight-list">
        <li>En grafos <strong>no dirigidos</strong>, la matriz es simétrica.</li>
        <li>En grafos <strong>dirigidos</strong>, no necesariamente es simétrica.</li>
        <li>En grafos <strong>ponderados</strong>, en lugar de 1 se coloca el peso.</li>
        <li>Si hay <strong>lazos</strong>, se representan en la diagonal principal.</li>
      </ul>
    </section>

    <!-- Material de Apoyo (Videos) -->
    <section class="section fade-in">
      <h2 class="section-title">Material de Apoyo</h2>
      <p>Videos educativos para profundizar en el tema:</p>

      <div class="video-grid">
        <a href="https://youtu.be/vnNFiNVy9KM" target="_blank" class="video-card">
          <div class="video-thumbnail">
            <img
              src="https://i.ytimg.com/vi_webp/vnNFiNVy9KM/maxresdefault.webp"
              class="thumb-image"
            />
          </div>
          <div class="video-info">
            <h4>LEARN GRAPHS FROM ZERO</h4>
            <p>
              Learn this data structure that is so important for the design and analysis of
              algorithms
            </p>
          </div>
        </a>

        <a href="https://youtu.be/TG3rmeGvBNI" target="_blank" class="video-card">
          <div class="video-thumbnail">
            <img
              src="https://i.ytimg.com/vi_webp/TG3rmeGvBNI/maxresdefault.webp"
              class="thumb-image"
            />
          </div>
          <div class="video-info">
            <h4>¿Qué es la teoría de grafos?</h4>
            <p>
              RepresentaDescripción sencilla y breve sobre el origen de la teoría matemática de
              grafos.
            </p>
          </div>
        </a>

        <a href="https://youtu.be/-VgHk7UMPP4" target="_blank" class="video-card">
          <div class="video-thumbnail">
            <img
              src="https://i.ytimg.com/vi_webp/-VgHk7UMPP4/maxresdefault.webp"
              class="thumb-image"
            />
          </div>
          <div class="video-info">
            <h4>Learn Graphs in 5 minutes 🌐</h4>
            <p>Graph data structure and algorithms tutorial example explained</p>
          </div>
        </a>

        <a href="https://youtu.be/e6k5na8SSmQ" target="_blank" class="video-card">
          <div class="video-thumbnail">
            <img
              src="https://i.ytimg.com/vi_webp/e6k5na8SSmQ/maxresdefault.webp"
              class="thumb-image"
            />
          </div>
          <div class="video-info">
            <h4>MATRIZ DE ADYACENCIA - TEORÍA DE GRAFOS</h4>
            <p>📘 Matriz de Adyacencia - Teoría de Grafos Explicada Fácil</p>
          </div>
        </a>

        <a href="https://youtu.be/PrYFmRgc6I4" target="_blank" class="video-card">
          <div class="video-thumbnail">
            <img src="https://i1.ytimg.com/vi/PrYFmRgc6I4/hqdefault.jpg" class="thumb-image" />
          </div>
          <div class="video-info">
            <h4>Matriz de adyacencia de un grafo</h4>
            <p>
              En este video se explica cómo construir la matriz de adyacencia de un grafo, y su
              aplicación en el cálculo del número de caminos entre dos vértices
            </p>
          </div>
        </a>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ─── Página general ─── */
.info-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

/* ─── Secciones ─── */
.section {
  margin-bottom: 3rem;
}

.section p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #6d4c5e;
}

/* ─── Títulos ─── */
.page-title {
  font-family: 'Pacifico', cursive;
  font-size: 2.2rem;
  color: #d4729a;
  margin-bottom: 1rem;
  text-shadow: 0 2px 8px rgba(212, 114, 154, 0.15);
}

.sparkle {
  display: inline-block;
  animation: sparkle 2s ease-in-out infinite;
}

.section-title {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #c25a82;
  margin-bottom: 0.8rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid rgba(212, 114, 154, 0.2);
  display: inline-block;
}

/* ─── Intro ─── */
.intro-text {
  font-size: 1.15rem !important;
  color: #9e6b82 !important;
}

/* ─── Listas ─── */
.styled-list {
  list-style: none;
  padding-left: 0;
  margin-top: 0.6rem;
}

.styled-list li {
  position: relative;
  padding-left: 1.4rem;
  margin-bottom: 0.5rem;
  font-size: 1.02rem;
  color: #6d4c5e;
  line-height: 1.6;
}

.styled-list li::before {
  content: '🌸';
  position: absolute;
  left: 0;
  font-size: 0.75rem;
  top: 0.35rem;
}

.styled-list.compact li {
  margin-bottom: 0.3rem;
}

/* ─── Fórmula ─── */
.formula-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 114, 154, 0.15);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 4px 20px rgba(212, 114, 154, 0.08);
}

.formula {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1.6rem;
  color: #d4729a;
  text-align: center;
  margin: 0.6rem 0;
  letter-spacing: 0.05em;
}

/* ─── Tarjetas de tipos ─── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.2rem;
  margin-top: 1rem;
}

.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 114, 154, 0.12);
  border-radius: 18px;
  padding: 1.4rem 1.3rem;
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 2px 12px rgba(212, 114, 154, 0.06);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(212, 114, 154, 0.14);
}

.card-number {
  position: absolute;
  top: -10px;
  right: 14px;
  background: linear-gradient(135deg, #f2a5c4, #d4729a);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(212, 114, 154, 0.3);
}

.card h3 {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #c25a82;
  margin-bottom: 0.5rem;
}

.card p {
  font-size: 0.98rem;
  color: #6d4c5e;
  line-height: 1.6;
}

/* ─── Caja de ejemplo ─── */
.example-box {
  margin-top: 0.6rem;
  background: rgba(212, 114, 154, 0.06);
  border-left: 3px solid #d4729a;
  border-radius: 0 10px 10px 0;
  padding: 0.6rem 0.9rem;
  font-size: 0.92rem;
  color: #7d5568;
  line-height: 1.5;
}

.example-label {
  font-weight: 700;
  color: #d4729a;
  display: block;
  margin-bottom: 0.15rem;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ─── Lista con highlight ─── */
.highlight-list {
  margin-top: 1.2rem;
}

.highlight-list li {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 0.7rem 1rem 0.7rem 2rem;
  margin-bottom: 0.6rem;
  border: 1px solid rgba(212, 114, 154, 0.1);
  transition: background 0.25s ease;
}

.highlight-list li:hover {
  background: rgba(255, 255, 255, 0.75);
}

/* ─── Video Grid ─── */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.video-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(212, 114, 154, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 114, 154, 0.1);
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(212, 114, 154, 0.15);
  border-color: rgba(212, 114, 154, 0.3);
}

.video-thumbnail {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  width: 54px;
  height: 54px;
  background: #d4729a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  padding-left: 4px;
  box-shadow: 0 4px 12px rgba(212, 114, 154, 0.4);
  transition: transform 0.3s ease;
}

.video-card:hover .play-button {
  transform: scale(1.15);
  background: #c25a82;
}

.video-info {
  padding: 1.2rem;
}

.video-info h4 {
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  color: #c25a82;
  margin-bottom: 0.4rem;
  font-size: 1.05rem;
}

.video-info p {
  font-size: 0.9rem !important;
  color: #9e6b82 !important;
  line-height: 1.4 !important;
}

/* ─── Animaciones ─── */
.fade-in {
  animation: fadeInUp 0.6s ease-out both;
}

.section:nth-child(2) {
  animation-delay: 0.1s;
}
.section:nth-child(3) {
  animation-delay: 0.2s;
}
.section:nth-child(4) {
  animation-delay: 0.3s;
}
.section:nth-child(5) {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(8deg);
  }
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .info-page {
    padding: 1.5rem 1rem 3rem;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .formula {
    font-size: 1.3rem;
  }
}
</style>
