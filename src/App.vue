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
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

/* 页面结构和主布局样式，仅负责 header、main、footer、主卡片等，不写具体内容和功能区样式 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--background-color);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.app-header,
.app-main,
.app-footer {
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
  background: var(--primary-color);
  color: #fff;
  padding: 2rem 1rem 1.5rem;
  text-align: center;
  box-shadow: var(--shadow);
  border-bottom-left-radius: var(--radius);
  border-bottom-right-radius: var(--radius);
  position: relative;
  z-index: 2;
  margin-bottom: 1rem;
}

.app-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 8px rgba(33,150,243,0.10);
  width: 100%;
  text-align: center;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  margin: 0 0 0.5rem;
  width: 100%;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 0 1rem;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
  min-height: 60vh;
  margin-top: 0;
}

.app-footer {
  background: var(--surface);
  color: var(--subtitle-color);
  padding: 1.2rem 1rem;
  text-align: center;
  font-size: 1rem;
  box-shadow: 0 -2px 8px rgba(60, 60, 60, 0.08);
  border-top-left-radius: var(--radius);
  border-top-right-radius: var(--radius);
  margin-top: 1rem;
  width: 100%;
}

.app-main, .app-footer, .app-header {
  transition: all 0.3s ease;
}

@media (max-width: 900px) {
  .app-header,
  .app-main,
  .app-footer {
    max-width: 100%;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    border-radius: calc(var(--radius) / 2);
  }
  .app-main {
    margin-top: 0;
  }
}

@media (max-width: 600px) {
  .app {
    padding: 0;
  }
  .app-header,
  .app-main,
  .app-footer {
    width: 100%;
    padding: 1rem 0.5rem;
    border-radius: calc(var(--radius) / 3);
  }
  .app-header {
    padding-top: 1rem;
    margin-bottom: 0.5rem;
  }
  .app-header h1 {
    font-size: 1.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
  .app-main {
    padding: 0.5rem;
    box-shadow: none;
    margin: 0;
  }
  .app-footer {
    font-size: 0.85rem;
    padding: 0.7rem 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>