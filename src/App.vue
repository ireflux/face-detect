<template>
  <div class="app">
    <header class="app-header">
      <h1>人脸识别系统</h1>
      <p class="subtitle">实时人脸检测、特征点识别和表情分析</p>
    </header>
    <main class="app-main">
      <FaceDetection />
    </main>
    <footer class="app-footer">
      <p>基于 Vue 3 和 face-api.js 构建</p>
    </footer>
  </div>
</template>

<script setup>
import FaceDetection from './components/FaceDetection.vue'
</script>

<style>
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --background-color: #f8f9fa;
  --text-color: #333;
  --header-bg: #fff;
}

html, body {
  height: 100%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

.app-header {
  background-color: var(--header-bg);
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.app-header h1 {
  color: var(--primary-color);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.app-main {
  flex: 1;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.app-footer {
  background-color: var(--header-bg);
  padding: 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .app-main {
    padding: 1rem 0.5rem;
  }
}
</style>