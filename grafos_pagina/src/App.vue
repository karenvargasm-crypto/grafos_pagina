<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Información', path: '/informacion' },
  { name: 'Simulador', path: '/simulador' },
]
</script>

<template>
  <div id="app-wrapper">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🌸</span>
          <span class="logo-text">Grafos</span>
        </div>

        <!-- Desktop nav -->
        <nav class="nav-desktop">
          <router-link v-for="link in navLinks" :key="link.name" :to="link.path" class="nav-link">
            {{ link.name }}
          </router-link>
        </nav>

        <!-- Mobile hamburger -->
        <button
          class="hamburger"
          :class="{ active: mobileMenuOpen }"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile nav -->
      <nav class="nav-mobile" :class="{ open: mobileMenuOpen }">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          class="nav-link-mobile"
          @click="mobileMenuOpen = false"
        >
          {{ link.name }}
        </router-link>
      </nav>
    </header>

    <!-- Page content -->
    <main id="app-content">
      <RouterView />
    </main>

    <!-- Global Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <p>© 2026 Karen Vargas</p>
        <p><a href="mailto:karen.vargas@ucb.edu.bo">karen.vargas@ucb.edu.bo</a></p>
      </div>
    </footer>
  </div>
</template>

<style>
/* ─── Google Fonts ─── */
@import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Quicksand:wght@400;500;600;700&display=swap');

/* ─── CSS Reset & Globals ─── */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Quicksand', sans-serif;
  background: linear-gradient(135deg, #fff0f5 0%, #fce4ec 30%, #f8e8f0 60%, #f3e5f5 100%);
  color: #6d4c5e;
  min-height: 100vh;
}

a {
  text-decoration: none;
  color: inherit;
}

/* ─── Subtle background pattern ─── */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(212, 114, 154, 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

#app-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped>
/* ─── Header ─── */
.header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(212, 114, 154, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ─── Logo ─── */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.6rem;
  animation: floatIcon 3s ease-in-out infinite;
}

.logo-text {
  font-family: 'Pacifico', cursive;
  font-size: 1.6rem;
  color: #d4729a;
  letter-spacing: 0.02em;
}

/* ─── Desktop Nav ─── */
.nav-desktop {
  display: flex;
  gap: 0.4rem;
}

.nav-link {
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  color: #9e6b82;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.25s ease;
  position: relative;
}

.nav-link:hover {
  color: #d4729a;
  background: rgba(212, 114, 154, 0.08);
}

.nav-link.router-link-active {
  color: #d4729a;
  background: rgba(212, 114, 154, 0.12);
}

/* ─── Hamburger ─── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2.5px;
  background: #d4729a;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(7.5px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-7.5px) rotate(-45deg);
}

/* ─── Mobile Nav ─── */
.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 0 1.5rem 1rem;
  gap: 0.25rem;
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.35s ease,
    padding 0.35s ease;
}

.nav-mobile.open {
  max-height: 300px;
  padding-bottom: 1rem;
}

.nav-link-mobile {
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: #9e6b82;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.nav-link-mobile:hover {
  color: #d4729a;
  background: rgba(212, 114, 154, 0.08);
}

/* ─── Animations ─── */
@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* ─── Footer ─── */
.footer {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(212, 114, 154, 0.1);
  padding: 2rem 1.5rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
}

.footer p {
  font-family: 'Quicksand', sans-serif;
  font-size: 0.9rem;
  color: #b88a9e;
}

.footer a {
  color: #d4729a;
  font-weight: 600;
  transition: color 0.25s ease;
}

.footer a:hover {
  color: #c25a82;
}

.footer p + p {
  margin-top: 0.4rem;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .nav-desktop {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-mobile {
    display: flex;
  }
}
</style>
