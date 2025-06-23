<template>
  <div class="face-detection">
    <div class="video-container" ref="videoContainer">
      <video ref="video" autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;"></video>
      <canvas ref="canvas" style="width:100%;height:100%;position:absolute;top:0;left:0;"></canvas>
      <div v-if="!isCameraActive" class="camera-placeholder">
        <i class="camera-icon">📷</i>
        <p>点击下方按钮启动摄像头</p>
      </div>
      <!-- 全屏按钮 -->
      <button 
        v-if="isCameraActive"
        @click="toggleFullscreen" 
        class="fullscreen-button"
        :title="isFullscreen ? '退出全屏' : '全屏显示'"
      >
        <span class="button-icon">{{ isFullscreen ? '⤓' : '⤢' }}</span>
      </button>
    </div>
    
    <div class="controls">
      <button 
        @click="startCamera" 
        :disabled="isCameraActive"
        class="control-button start"
        id="startCameraBtn"
      >
        <span class="button-icon">▶️</span>
        启动摄像头
      </button>
      <button 
        @click="stopCamera" 
        :disabled="!isCameraActive"
        class="control-button stop"
        id="stopCameraBtn"
      >
        <span class="button-icon">⏹️</span>
        停止摄像头
      </button>
      <button 
        @click="testCamera" 
        class="control-button test"
        id="testCameraBtn"
      >
        <span class="button-icon">🔍</span>
        测试摄像头
      </button>
    </div>

    <div v-if="isCameraActive" class="detection-info">
      <div class="info-card">
        <h3>检测到的人脸</h3>
        <p>{{ detectedFaces }} 个</p>
      </div>
      <div class="info-card" v-if="currentExpression">
        <h3>当前表情</h3>
        <p>{{ currentExpression }}</p>
      </div>
    </div>

    <div class="settings-panel">
      <div class="setting-item">
        <label for="showFaceBox">
          <input type="checkbox" v-model="showFaceBox" id="showFaceBox">
          显示人脸框
        </label>
      </div>
      <div class="setting-item">
        <label for="showLandmarks">
          <input type="checkbox" v-model="showLandmarks" id="showLandmarks">
          显示特征点
        </label>
      </div>
      <div class="setting-item">
        <label for="showExpressions">
          <input type="checkbox" v-model="showExpressions" id="showExpressions">
          显示表情
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as faceapi from 'face-api.js'

const video = ref(null)
const canvas = ref(null)
const videoContainer = ref(null)
const isCameraActive = ref(false)
const isFullscreen = ref(false)
const detectedFaces = ref(0)
const currentExpression = ref('')
const showFaceBox = ref(true)
const showLandmarks = ref(true)
const showExpressions = ref(true)

let stream = null
let detectionInterval = null

// 加载人脸识别模型
const loadModels = async () => {
  try {
    console.log('开始加载模型...')
    // 设置模型路径，修正为相对根目录的 models 目录，适配 Vite/gh-pages 部署
    const MODEL_URL = import.meta.env.BASE_URL + 'models'
    // 按顺序加载模型
    console.log('加载人脸检测模型...')
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    console.log('人脸检测模型加载完成')
    console.log('加载人脸特征点模型...')
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    console.log('人脸特征点模型加载完成')
    console.log('加载人脸识别模型...')
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    console.log('人脸识别模型加载完成')
    console.log('加载表情识别模型...')
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    console.log('表情识别模型加载完成')
    console.log('所有模型加载完成')
  } catch (error) {
    console.error('模型加载失败:', error)
    alert('模型加载失败，请检查控制台获取详细信息')
  }
}

// 启动摄像头
const startCamera = async () => {
  try {
    console.log('正在请求摄像头权限...')
    // 检查是否使用 HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new Error('摄像头功能需要 HTTPS 连接，请使用 HTTPS 访问网站')
    }
    // 检查并获取 mediaDevices API
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {}
    }
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia
        if (!getUserMedia) {
          return Promise.reject(new Error('您的浏览器不支持 getUserMedia API，请尝试使用 Chrome 浏览器'))
        }
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }
    // 构建增强但兼容性好的约束
    let constraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: { ideal: 'user' }
      },
      audio: false
    }
    let lastError = null
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      // 降级约束再试一次
      console.warn('高阶约束失败，尝试降级约束', e)
      constraints = { video: true, audio: false }
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        lastError = err
        throw err
      }
    }
    if (!video.value) {
      console.error('视频元素不存在')
      return
    }
    video.value.setAttribute('playsinline', '')
    video.value.setAttribute('webkit-playsinline', '')
    video.value.srcObject = stream
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('视频加载超时'))
      }, 10000)
      video.value.onloadedmetadata = () => {
        clearTimeout(timeout)
        resolve()
      }
      video.value.onerror = (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    })
    isCameraActive.value = true
    startDetection()
  } catch (error) {
    console.error('启动摄像头失败:', error)
    let errorMessage = '无法访问摄像头，请确保已授予摄像头权限'
    if (error.name === 'NotAllowedError') {
      errorMessage = '摄像头访问被拒绝，请在浏览器设置中允许访问摄像头'
    } else if (error.name === 'NotFoundError') {
      errorMessage = '未找到可用的摄像头设备'
    } else if (error.name === 'NotReadableError') {
      errorMessage = '摄像头可能被其他应用程序占用，或设备初始化失败。\n\n请尝试：\n- 关闭其他使用摄像头的软件（如微信、QQ、会议软件等）\n- 拔插摄像头或更换 USB 端口\n- 关闭并重新打开浏览器\n- 重启电脑\n- 检查杀毒软件或安全软件设置\n- 若为笔记本，检查摄像头物理开关或隐私盖是否打开';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = '无法满足摄像头要求，请尝试使用其他浏览器'
    } else if (error.name === 'TypeError') {
      errorMessage = '浏览器不支持所需的摄像头功能，请尝试使用其他浏览器'
    }
    alert(errorMessage)
  }
}

// 停止摄像头
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop()
      console.log('摄像头轨道已停止')
    })
    video.value.srcObject = null
    isCameraActive.value = false
    stopDetection()
    // 清除 canvas 上的人脸框和特征点
    if (canvas.value) {
      const ctx = canvas.value.getContext('2d')
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    }
  }
}

// 开始检测
const startDetection = () => {
  console.log('开始人脸检测循环')
  if (detectionInterval) {
    clearInterval(detectionInterval)
  }
  detectionInterval = setInterval(detectFaces, 100)
}

// 停止检测
const stopDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
    console.log('停止人脸检测循环')
  }
}

// 获取主要表情
const getMainExpression = (expressions) => {
  const maxExpression = Object.entries(expressions)
    .reduce((max, [expression, value]) => {
      return value > max.value ? { expression, value } : max
    }, { expression: '', value: 0 })
  
  return maxExpression.expression
}

// 人脸检测
const detectFaces = async () => {
  if (!isCameraActive.value) return
  try {
    // 确保视频元素已经准备好
    if (!video.value || !video.value.videoWidth) {
      return
    }

    console.log('开始检测人脸...')
    const detections = await faceapi.detectAllFaces(
      video.value,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5
      })
    ).withFaceLandmarks().withFaceExpressions()

    console.log('检测到的人脸数量:', detections.length)
    detectedFaces.value = detections.length

    if (detections.length > 0) {
      const mainExpression = getMainExpression(detections[0].expressions)
      currentExpression.value = mainExpression
      console.log('主要表情:', mainExpression)
    } else {
      currentExpression.value = ''
    }

    // 不再动态设置 canvas/video 尺寸，始终用 100%
    const displaySize = {
      width: video.value.videoWidth,
      height: video.value.videoHeight
    }
    faceapi.matchDimensions(canvas.value, displaySize)

    // 调整检测结果大小
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    // 清除canvas
    const ctx = canvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // 根据设置绘制检测结果
    if (showFaceBox.value) {
      faceapi.draw.drawDetections(canvas.value, resizedDetections)
    }
    if (showLandmarks.value) {
      faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections)
    }
    if (showExpressions.value) {
      faceapi.draw.drawFaceExpressions(canvas.value, resizedDetections)
    }
  } catch (error) {
    console.error('人脸检测出错:', error)
  }
}

// 监听设置变化
watch([showFaceBox, showLandmarks, showExpressions], () => {
  if (isCameraActive.value) {
    detectFaces()
  }
})

// 测试摄像头功能
const testCamera = async () => {
  try {
    console.log('开始测试摄像头...')
    
    // 检查是否使用 HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new Error('摄像头功能需要 HTTPS 连接，请使用 HTTPS 访问网站')
    }

    // 检查并获取 mediaDevices API
    if (!navigator.mediaDevices) {
      // 尝试使用旧版 API
      navigator.mediaDevices = {}
    }

    // 添加 getUserMedia 的兼容性处理
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia

        if (!getUserMedia) {
          return Promise.reject(new Error('您的浏览器不支持 getUserMedia API，请尝试使用 Chrome 浏览器'))
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }

    // 检查设备列表
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      console.log('可用的视频设备:', videoDevices)
      if (videoDevices.length === 0) {
        throw new Error('未检测到摄像头设备')
      }
    } catch (e) {
      console.warn('获取设备列表失败:', e)
    }

    // 尝试获取摄像头权限
    console.log('请求摄像头权限...')
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: {
        width: { min: 320, ideal: 640, max: 1280 },
        height: { min: 240, ideal: 480, max: 720 },
        facingMode: { ideal: 'user' }
      },
      audio: false
    })
    
    // 获取成功，显示详细信息
    const videoTrack = stream.getVideoTracks()[0]
    const capabilities = videoTrack.getCapabilities()
    const settings = videoTrack.getSettings()
    
    console.log('摄像头信息:', {
      label: videoTrack.label,
      capabilities,
      settings
    })

    // 停止测试流
    stream.getTracks().forEach(track => track.stop())
    
    // 显示成功信息
    alert(`摄像头测试成功！\n\n设备信息：\n- 设备名称：${videoTrack.label}\n- 分辨率：${settings.width}x${settings.height}\n- 帧率：${settings.frameRate}fps`)
  } catch (error) {
    console.error('摄像头测试失败:', error)
    let errorMessage = '摄像头测试失败：'
    
    if (error.name === 'NotAllowedError') {
      errorMessage += '摄像头访问被拒绝，请在浏览器设置中允许访问摄像头'
    } else if (error.name === 'NotFoundError') {
      errorMessage += '未找到可用的摄像头设备'
    } else if (error.name === 'NotReadableError') {
      errorMessage += '摄像头可能被其他应用程序占用'
    } else if (error.name === 'OverconstrainedError') {
      errorMessage += '无法满足摄像头要求'
    } else if (error.name === 'TypeError') {
      errorMessage += '浏览器不支持所需的摄像头功能'
    } else {
      errorMessage += error.message
    }
    
    alert(errorMessage)
  }
}

// 切换全屏
const toggleFullscreen = async () => {
  if (!videoContainer.value) return

  try {
    if (!isFullscreen.value) {
      if (videoContainer.value.requestFullscreen) {
        await videoContainer.value.requestFullscreen()
      } else if (videoContainer.value.webkitRequestFullscreen) {
        await videoContainer.value.webkitRequestFullscreen()
      } else if (videoContainer.value.msRequestFullscreen) {
        await videoContainer.value.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen()
      }
    }
  } catch (error) {
    console.error('全屏切换失败:', error)
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  )
}

onMounted(() => {
  console.log('组件已挂载，开始加载模型...')
  loadModels()
  
  // 添加全屏变化监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  console.log('组件即将卸载，清理资源...')
  stopCamera()
  
  // 移除全屏变化监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.face-detection {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 1.5rem;
  box-sizing: border-box;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(60, 60, 60, 0.12);
  margin: 0 auto;
  min-height: 360px;
}

video, canvas {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  display: block;
}

.controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

.control-button {
  flex: 0 1 auto;
  min-width: max-content;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 0.5rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.detection-info {
  display: flex;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

.info-card {
  flex: 1 1 200px;
  max-width: calc(50% - 0.5rem);
  min-width: 150px;
  padding: 0.75rem;
  background-color: var(--surface);
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: var(--shadow);
}

.settings-panel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  background-color: var(--surface);
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
}

/* 移动端优化 */
@media (max-width: 600px) {
  .face-detection {
    gap: 1rem;
    padding: 0;
  }
  .video-container {
    border-radius: 0.5rem;
    min-height: 220px;
    margin: 0;
    width: 100%;
  }
  .controls {
    padding: 0 0.25rem;
    gap: 0.25rem;
  }
  .control-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  .detection-info {
    padding: 0 0.25rem;
    gap: 0.5rem;
  }
  .info-card {
    flex: 1 1 120px;
    min-width: 120px;
    padding: 0.5rem;
  }
  .settings-panel {
    padding: 0.25rem;
    gap: 0.5rem;
  }
  .setting-item {
    font-size: 0.85rem;
  }
}

/* 全屏模式优化 */
.video-container:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

.video-container:fullscreen video,
.video-container:fullscreen canvas {
  object-fit: contain;
}
</style>