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
/* Google Material Design 风格重构与响应式增强 */
:root {
  --primary-color: #2196F3;
  --primary-dark: #1565C0;
  --secondary-color: #4CAF50;
  --background-color: #f5f7fa;
  --surface: #fff;
  --text-color: #212121;
  --subtitle-color: #607d8b;
  --shadow: 0 2px 8px rgba(60,60,60,0.10), 0 1.5px 6px rgba(60,60,60,0.06);
  --radius: 16px;
}

body {
  background: var(--background-color);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background-color);
  width: 100%;
  box-sizing: border-box;
}

.app-header,
.app-main,
.app-footer {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.app-header {
  background: var(--primary-color);
  color: #fff;
  padding: 2.5rem 2rem 1.5rem 2rem;
  text-align: center;
  box-shadow: var(--shadow);
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 8px rgba(33,150,243,0.10);
}

.subtitle {
  color: var(--subtitle-color);
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin-bottom: 0.5rem;
}

.app-main {
  flex: 1;
  margin: -2rem auto 0 auto;
  padding: 2rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
  min-height: 60vh;
}

.app-footer {
  background: var(--surface);
  color: var(--subtitle-color);
  padding: 1.2rem 2rem;
  text-align: center;
  font-size: 1rem;
  box-shadow: 0 -2px 8px rgba(60, 60, 60, 0.08);
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
  margin-top: 2rem;
}

/* Material Design 响应式卡片和按钮 */
.app-main, .app-footer, .app-header {
  transition: box-shadow 0.2s, border-radius 0.2s, padding 0.2s;
}

@media (max-width: 900px) {
  .app-header,
  .app-main,
  .app-footer {
    max-width: 99vw;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .app-main {
    border-radius: 12px;
    padding-top: 1.2rem;
    padding-bottom: 1rem;
  }
  .app-header, .app-footer {
    border-radius: 12px;
  }
}

@media (max-width: 600px) {
  .app-header,
  .app-main,
  .app-footer {
    max-width: 100vw;
    padding-left: 0.1rem;
    padding-right: 0.1rem;
  }
  .app-header {
    padding: 1.2rem 0.1rem 1rem 0.1rem;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .app-header h1 {
    font-size: 1.1rem;
  }
  .subtitle {
    font-size: 0.85rem;
  }
  .app-main {
    padding: 0.5rem 0.1rem 0.5rem 0.1rem;
    border-radius: 8px;
    min-height: 50vh;
    box-shadow: none;
  }
  .app-footer {
    padding: 0.7rem 0.1rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    font-size: 0.85rem;
    margin-top: 1rem;
  }
}
</style>