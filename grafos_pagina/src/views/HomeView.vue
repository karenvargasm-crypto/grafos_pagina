<script setup></script>

<template>
  <main class="home">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="sparkle">✨</span>
          Página de Grafos
          <span class="sparkle">✨</span>
        </h1>
        <p class="hero-subtitle">Una página para aprender sobre grafos y sus algoritmos</p>
      </div>
      <div class="hero-image-wrapper">
        <img src="/UCB_Logo.png" alt="UCB Logo" class="hero-image" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-family: 'Pacifico', cursive;
  font-size: 2.6rem;
  color: #d4729a;
  margin-bottom: 0.8rem;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(212, 114, 154, 0.15);
}

.sparkle {
  display: inline-block;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:last-child {
  animation-delay: 1s;
}

.hero-subtitle {
  font-family: 'Quicksand', sans-serif;
  font-size: 1.15rem;
  color: #b88a9e;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.hero-image-wrapper {
  width: 100%;
  max-width: 300px;
  overflow: hidden;
  margin-top: 10%;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.hero-image {
  display: block;
  width: 100%;
  height: auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
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
    transform: scale(1.2) rotate(10deg);
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .home {
    padding: 1.5rem 1rem;
  }
}
</style>
