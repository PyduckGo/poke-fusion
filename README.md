# 🎮 像素宝可梦融合器 (Pixel PokéFusion)

一个基于Vue 3 + TypeScript的像素级宝可梦融合应用，让用户可以一键生成独特的宝可梦融合精灵，并支持用户照片与宝可梦的创意融合。

## ✨ 核心功能

### 🎯 主要功能
- **一键融合**：点击即可随机生成两只不同世代宝可梦的融合精灵
- **像素级渲染**：使用Canvas API实现高质量像素化效果
- **中文支持**：所有宝可梦名称、属性、特性均为中文显示
- **3D预览**：支持3D旋转预览融合结果
- **离线缓存**：使用IndexedDB和Service Worker实现离线访问

### 🎭 彩蛋功能：用户照片融合
- **照片上传**：支持用户上传自己的照片
- **智能融合**：将用户照片作为皮肤填充到宝可梦形状中
- **自定义命名**：可以为融合结果起中文名字
- **一键保存**：支持下载和分享融合结果

## 🚀 技术栈

### 前端框架
- **Vue 3** + **TypeScript** - 现代化前端开发
- **Vite** - 快速构建工具

### 像素渲染
- **Canvas API** - 像素级图像处理
- **Jimp** - 图像处理库
- **Pixelmatch** - 像素差异检测

### 动画与交互
- **GSAP** - 流畅动画效果
- **Three.js** - 3D预览展示
- **Lenis** - 平滑滚动
- **Mo.js** - 粒子动画效果

### 音频系统
- **Tone.js** - 8位音效合成
- **Howler.js** - 音频管理

### 数据管理
- **PokeAPI** - 官方宝可梦数据
- **Dexie** - IndexedDB封装
- **Service Worker** - 离线缓存

## 📦 安装与运行

```bash
# 克隆项目
git clone https://gitee.com/pyduck/poke-fusion.git
cd poke-fusion

# 安装依赖
npm install

# 开发环境
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🎮 使用指南

### 基本融合
1. 打开应用，等待启动动画完成
2. 点击"⚡ 融合 ⚡"按钮生成随机融合
3. 查看融合结果和详细信息
4. 点击宝可梦卡片可以手动更换

### 用户照片融合
1. 滚动到页面底部的"🎭 彩蛋"区域
2. 点击"📸 选择你的照片"上传照片
3. 从下拉菜单选择要融合的宝可梦
4. 为你的融合宝可梦起个中文名字
5. 点击"🎨 开始融合"
6. 保存或分享你的创作

## 🎨 融合算法

### 形状+颜色融合
- **形状来源**：第一只宝可梦的轮廓作为基础形状
- **颜色填充**：第二只宝可梦的颜色完全填充形状
- **边缘处理**：添加黑色像素化轮廓增强视觉效果
- **透明度优化**：确保形状完全填充，无空白区域

### 用户照片融合
- **形状保持**：使用宝可梦精灵作为形状模板
- **皮肤替换**：用户照片作为纹理完全填充
- **像素化处理**：保持像素艺术风格
- **智能混合**：可调节融合强度

## 🌟 特色亮点

### 像素极客美学
- **像素化字体**：中文像素字体完美适配
- **扫描线效果**：复古GBA风格显示
- **粒子动画**：融合成功时的彩色像素雨
- **8位音效**：经典游戏音效体验

### 无障碍设计
- **响应式布局**：完美适配移动端
- **减少动画选项**：支持prefers-reduced-motion
- **语义化HTML**：良好的可访问性

## 📱 移动端优化

- **触摸友好**：大按钮设计，易于操作
- **手势支持**：支持滑动和缩放
- **离线使用**：缓存常用数据，无网络也能玩

## 🔧 开发说明

### 项目结构
```
src/
├── components/          # Vue组件
│   ├── PixelPokedex.vue    # 主界面
│   ├── UserPhotoFusion.vue # 用户融合
│   └── ThreeDViewer.vue    # 3D预览
├── utils/              # 工具函数
│   ├── pixelFusion.ts      # 像素融合算法
│   ├── userPhotoFusion.ts  # 用户照片融合
│   ├── pokemonApi.ts       # 宝可梦API
│   ├── chinesePixelFont.ts # 中文像素字体
│   ├── cache.ts           # 缓存管理
│   └── audioManager.ts    # 音效管理
├── types/              # TypeScript类型
└── assets/             # 静态资源
```

### 扩展开发
- 添加新的融合算法：修改`pixelFusion.ts`
- 增加宝可梦中文字典：更新`chinesePixelFont.ts`
- 自定义动画效果：调整`PixelPokedex.vue`

## 🎯 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 📄 许可证

MIT License - 详见LICENSE文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 🙏 致谢

- [PokeAPI](https://pokeapi.co/) - 提供宝可梦数据
- [Vue.js](https://vuejs.org/) - 优秀的前端框架
- [GSAP](https://greensock.com/gsap/) - 强大的动画库
