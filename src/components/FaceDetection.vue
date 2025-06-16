<template>
  <div class="face-detection">
    <div class="video-container" ref="videoContainer">
      <video ref="video" autoplay muted playsinline></video>
      <canvas ref="canvas"></canvas>
      <div v-if="!isCameraActive" class="camera-placeholder">
        <i class="camera-icon">📷</i>
        <p>点击下方按钮启动摄像头</p>
      </div>
      <!-- 弹幕层 -->
      <div class="danmaku-container" v-if="showDanmaku">
        <div 
          v-for="(danmaku, index) in danmakuList" 
          :key="index"
          class="danmaku"
          :style="{
            top: danmaku.top + 'px',
            left: danmaku.left + 'px',
            opacity: danmaku.opacity,
            transform: `scale(${danmaku.scale})`
          }"
        >
          {{ danmaku.text }}
        </div>
      </div>
      <!-- 颜值评分层 -->
      <div class="beauty-score" v-if="showBeautyScore">
        <div class="score-container">
          <h2>颜值评分</h2>
          <div class="score">{{ beautyScore }}</div>
          <div class="score-description">{{ beautyDescription }}</div>
        </div>
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
      <div class="setting-item">
        <label for="showDanmaku">
          <input type="checkbox" v-model="showDanmaku" id="showDanmaku" @change="handleDanmakuToggle">
          显示弹幕
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

// 弹幕相关
const showDanmaku = ref(false)
const danmakuList = ref([])
const danmakuTexts = [
  '好帅啊！', '太美了！', '颜值爆表！', '气质真好！',
  '皮肤真好！', '眼睛好漂亮！', '笑容真甜！', '好可爱！',
  '太有魅力了！', '五官好精致！', '好有气质！', '太迷人了！',
  '好漂亮！', '好帅气！', '太惊艳了！', '好有魅力！'
]

// 颜值评分相关
const showBeautyScore = ref(false)
const beautyScore = ref(0)
const beautyDescription = ref('')

let stream = null
let detectionInterval = null
let danmakuInterval = null

// 处理弹幕开关
const handleDanmakuToggle = () => {
  if (showDanmaku.value) {
    startDanmaku()
  } else {
    stopDanmaku()
  }
}

// 生成随机弹幕
const generateDanmaku = () => {
  const container = document.querySelector('.video-container')
  if (!container) return

  const danmaku = {
    text: danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)],
    top: Math.random() * (container.clientHeight - 30),
    left: -200, // 从屏幕左侧开始
    opacity: Math.random() * 0.5 + 0.5,
    scale: Math.random() * 0.5 + 0.8,
    speed: Math.random() * 3 + 6,
    id: Date.now() + Math.random() // 唯一ID
  }
  
  danmakuList.value.push(danmaku)
  
  // 增加最大弹幕数量
  if (danmakuList.value.length > 50) {
    danmakuList.value.shift()
  }
}

// 开始弹幕动画
const startDanmaku = () => {
  if (!isCameraActive.value) return

  danmakuList.value = []
  showBeautyScore.value = false // 确保开始时隐藏评分

  // 初始生成一些弹幕
  for (let i = 0; i < 10; i++) {
    generateDanmaku()
  }

  // 记录弹幕开始时间
  const danmakuStartTime = Date.now()
  let beautyScoreTriggered = false

  // 定期生成新弹幕
  danmakuInterval = setInterval(() => {
    // 增加生成概率
    if (Math.random() < 0.4) { // 40%的概率生成新弹幕
      generateDanmaku()
    }

    // 更新所有弹幕位置
    danmakuList.value = danmakuList.value.filter(danmaku => {
      danmaku.left += danmaku.speed
      // 检查是否需要触发颜值分数
      if (!beautyScoreTriggered && Date.now() - danmakuStartTime >= 5000) {
        calculateBeautyScore()
        showBeautyScore.value = true
        beautyScoreTriggered = true
        // 停止生成新弹幕
        if (danmakuInterval) {
          clearInterval(danmakuInterval)
          danmakuInterval = null
        }
      }
      // 确保弹幕完全飞出屏幕右侧
      return danmaku.left < window.innerWidth
    })
  }, 16) // 约60fps
}

// 停止弹幕
const stopDanmaku = () => {
  if (danmakuInterval) {
    clearInterval(danmakuInterval)
    danmakuInterval = null
  }
  danmakuList.value = []
  showBeautyScore.value = false // 隐藏评分
}

// 计算颜值分数
const calculateBeautyScore = () => {
  // 基于人脸特征计算分数
  const baseScore = Math.floor(Math.random() * 30) + 70 // 70-100之间的随机分数
  beautyScore.value = baseScore
  
  // 根据分数生成描述
  if (baseScore >= 95) {
    beautyDescription.value = '绝世容颜！'
  } else if (baseScore >= 90) {
    beautyDescription.value = '倾国倾城！'
  } else if (baseScore >= 85) {
    beautyDescription.value = '天生丽质！'
  } else if (baseScore >= 80) {
    beautyDescription.value = '颜值出众！'
  } else {
    beautyDescription.value = '清新自然！'
  }
}

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
    
    // 检查是否支持 enumerateDevices
    if (!navigator.mediaDevices.enumerateDevices) {
      console.warn('您的浏览器不支持 enumerateDevices API')
    }

    // 尝试获取设备列表
    let videoDevices = []
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      videoDevices = devices.filter(device => device.kind === 'videoinput')
      console.log('可用的视频设备:', videoDevices)
    } catch (e) {
      console.warn('获取设备列表失败:', e)
    }

    // 构建更宽松的视频约束
    const constraints = {
      video: {
        // 使用更宽松的约束条件
        width: { min: 320, ideal: 640, max: 1280 },
        height: { min: 240, ideal: 480, max: 720 },
        facingMode: { ideal: 'user' },
        frameRate: { min: 15, ideal: 30 },
        // 移除可能导致问题的参数
        // aspectRatio: { ideal: 1.777777778 },
      }
    }

    console.log('尝试使用以下约束获取摄像头:', constraints)
    
    // 先尝试请求权限
    try {
      // 使用最简单的约束先请求权限
      await navigator.mediaDevices.getUserMedia({ video: true })
      console.log('基础权限请求成功')
    } catch (e) {
      console.error('基础权限请求失败:', e)
      throw new Error('无法获取摄像头权限，请确保已授予权限')
    }

    // 然后使用完整约束获取流
    stream = await navigator.mediaDevices.getUserMedia(constraints)
    
    if (!video.value) {
      console.error('视频元素不存在')
      return
    }

    // 设置视频元素属性
    video.value.setAttribute('playsinline', '') // 确保在 iOS 上内联播放
    video.value.setAttribute('webkit-playsinline', '') // 兼容旧版 iOS
    video.value.srcObject = stream
    
    // 等待视频加载完成
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('视频加载超时'))
      }, 10000) // 10秒超时

      video.value.onloadedmetadata = () => {
        clearTimeout(timeout)
        console.log('视频元数据加载完成')
        resolve()
      }

      video.value.onerror = (error) => {
        clearTimeout(timeout)
        console.error('视频加载错误:', error)
        reject(error)
      }
    })
    
    isCameraActive.value = true
    console.log('摄像头已启动')
    startDetection()
    
    // 如果弹幕开关是开启状态，启动弹幕
    if (showDanmaku.value) {
      startDanmaku()
    }
  } catch (error) {
    console.error('启动摄像头失败:', error)
    // 提供更详细的错误信息
    let errorMessage = '无法访问摄像头，请确保已授予摄像头权限'
    if (error.name === 'NotAllowedError') {
      errorMessage = '摄像头访问被拒绝，请在浏览器设置中允许访问摄像头'
    } else if (error.name === 'NotFoundError') {
      errorMessage = '未找到可用的摄像头设备'
    } else if (error.name === 'NotReadableError') {
      errorMessage = '摄像头可能被其他应用程序占用，请关闭其他使用摄像头的应用后重试'
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
    stopDanmaku()
    showBeautyScore.value = false
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
      console.log('等待视频准备就绪...')
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

    // 调整canvas大小
    const displaySize = { 
      width: video.value.videoWidth, 
      height: video.value.videoHeight 
    }
    console.log('视频尺寸:', displaySize)
    
    faceapi.matchDimensions(canvas.value, displaySize)

    // 调整检测结果大小
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    // 清除canvas
    const ctx = canvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // 根据设置绘制检测结果
    if (showFaceBox.value) {
      console.log('绘制人脸框...')
      faceapi.draw.drawDetections(canvas.value, resizedDetections)
    }
    if (showLandmarks.value) {
      console.log('绘制特征点...')
      faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections)
    }
    if (showExpressions.value) {
      console.log('绘制表情...')
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
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16/9;
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 弹幕样式 */
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

.danmaku {
  position: absolute;
  color: white;
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  will-change: transform;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

/* 颜值评分样式 */
.beauty-score {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 20;
  animation: fadeIn 0.5s ease;
}

.score-container {
  text-align: center;
  color: white;
  animation: scaleIn 0.5s ease;
  padding: 2rem;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.score-container h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.score {
  font-size: 6rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

.score-description {
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  }
  50% {
    transform: scale(1.1);
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.9);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
  }
}

.camera-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.camera-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 800px;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  font-size: clamp(0.9rem, 2vw, 1rem);
  font-weight: 500;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.control-button.start {
  background-color: #4CAF50;
}

.control-button.stop {
  background-color: #f44336;
}

.control-button.test {
  background-color: #2196F3;
}

.control-button.test:hover {
  background-color: #1976D2;
}

.control-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1.2rem;
}

.detection-info {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  flex-wrap: wrap;
}

.info-card {
  flex: 1;
  min-width: 200px;
  padding: clamp(0.75rem, 2vw, 1rem);
  background-color: #f5f5f5;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  margin: 0;
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: #666;
}

.info-card p {
  margin: 0.5rem 0 0;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: bold;
  color: #333;
}

.settings-panel {
  display: flex;
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 800px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.setting-item input[type="checkbox"] {
  width: clamp(1rem, 2vw, 1.2rem);
  height: clamp(1rem, 2vw, 1.2rem);
  cursor: pointer;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .face-detection {
    padding: 0.5rem;
  }

  .video-container {
    border-radius: 8px;
  }

  .controls {
    gap: 0.5rem;
  }

  .detection-info {
    flex-direction: column;
  }

  .settings-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .setting-item {
    width: 100%;
  }
}

/* 小屏幕设备优化 */
@media (max-width: 480px) {
  .control-button {
    width: 100%;
    justify-content: center;
  }

  .info-card {
    min-width: 100%;
  }
}

/* 大屏幕设备优化 */
@media (min-width: 1200px) {
  .face-detection {
    max-width: 1400px;
  }

  .video-container {
    max-width: 1000px;
  }

  .controls,
  .detection-info,
  .settings-panel {
    max-width: 1000px;
  }
}

.fullscreen-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 30;
}

.fullscreen-button:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.fullscreen-button .button-icon {
  font-size: 1.5rem;
  line-height: 1;
}

/* 全屏模式下的样式调整 */
.video-container:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

.video-container:fullscreen video,
.video-container:fullscreen canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 兼容 Webkit 浏览器 */
.video-container:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

/* 兼容 Firefox */
.video-container:-moz-full-screen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

/* 兼容 IE */
.video-container:-ms-fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}
</style>