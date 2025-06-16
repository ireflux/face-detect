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
/* 现代化美观布局与响应式增强 */
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --background-color: #f8f9fa;
  --text-color: #333;
  --header-bg: #fff;
}

body {
  background: var(--background-color);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  align-items: center;
  width: 100vw;
  box-sizing: border-box;
}

.app-header {
  width: 100vw;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 2.5rem 1rem 2rem 1rem;
  text-align: center;
  box-shadow: 0 4px 24px rgba(60, 60, 60, 0.10);
  border-bottom-left-radius: 2.5rem;
  border-bottom-right-radius: 2.5rem;
  position: relative;
  z-index: 2;
}

.app-header h1 {
  color: #fff;
  font-size: 2.4rem;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
  font-weight: 800;
  text-shadow: 0 2px 8px rgba(76,175,80,0.10);
}

.subtitle {
  color: #e3f2fd;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.app-main {
  flex: 1;
  width: 100vw;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
  border-radius: 2rem;
  box-shadow: 0 8px 32px rgba(60, 60, 60, 0.10), 0 1.5px 6px rgba(60,60,60,0.06);
  position: relative;
  z-index: 1;
  min-height: 60vh;
}

.app-footer {
  width: 100vw;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 1.2rem 1rem;
  text-align: center;
  font-size: 1rem;
  color: #fff;
  box-shadow: 0 -4px 16px rgba(60, 60, 60, 0.08);
  border-top-left-radius: 2.5rem;
  border-top-right-radius: 2.5rem;
  margin-top: 2rem;
}

@media (max-width: 900px) {
  .app-main {
    max-width: 98vw;
    padding: 1.2rem 0.5rem 1rem 0.5rem;
    border-radius: 1.2rem;
  }
  .app-header, .app-footer {
    border-radius: 1.2rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}

@media (max-width: 600px) {
  .app-header {
    padding: 1.2rem 0.5rem 1rem 0.5rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
  .app-header h1 {
    font-size: 1.1rem;
  }
  .subtitle {
    font-size: 0.85rem;
  }
  .app-main {
    padding: 0.5rem 0.1rem 0.5rem 0.1rem;
    border-radius: 0.7rem;
    min-height: 50vh;
    box-shadow: none;
  }
  .app-footer {
    padding: 0.7rem 0.2rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    font-size: 0.85rem;
    margin-top: 1rem;
  }
}
</style>