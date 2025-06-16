# AI 人脸识别系统

基于 Vue 3 和 face-api.js 构建的实时人脸检测、特征点识别和表情分析系统。

## 功能特点

- 实时人脸检测和跟踪
- 人脸特征点识别（68个关键点）
- 表情识别（7种基本表情）
- 实时弹幕互动
- 颜值评分系统
- 响应式设计，支持移动端
- 跨平台支持（Windows、Android、iOS）

## 技术栈

- Vue 3
- TypeScript
- Vite
- face-api.js
- CSS3 (动画、响应式设计)

## 项目结构

```
face-detect/
├── public/              # 静态资源
│   └── models/         # face-api.js 模型文件
├── src/
│   ├── assets/         # 项目资源文件
│   ├── components/     # Vue 组件
│   │   └── FaceDetection.vue  # 主组件
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式
├── index.html          # HTML 模板
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目依赖
```

## 安装和运行

1. 克隆项目
```bash
git clone [项目地址]
cd face-detect
```

2. 安装依赖
```bash
npm install
```

3. 下载模型文件
```bash
node src/download-models.js
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 使用说明

1. 启动应用后，点击"启动摄像头"按钮
2. 允许浏览器访问摄像头
3. 系统会自动开始人脸检测
4. 可以通过设置面板控制显示内容：
   - 显示/隐藏人脸框
   - 显示/隐藏特征点
   - 显示/隐藏表情
   - 显示/隐藏弹幕

## 注意事项

- 需要现代浏览器支持（Chrome、Firefox、Edge 等）
- 需要摄像头设备
- 建议使用 HTTPS 或 localhost 环境运行
- 移动设备访问时建议使用 Chrome 浏览器

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Edge 79+
- Safari 11+
- iOS Safari 11+
- Android Chrome 60+

## 开发环境要求

- Node.js 16+
- npm 7+

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 致谢

- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
