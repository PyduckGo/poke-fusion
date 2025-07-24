#!/bin/bash
# 宝可梦像素融合器部署脚本 - Windows兼容版本

echo "🎮 开始部署 Pixel PokéFusion..."

# 构建项目
echo "📦 构建生产版本..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位于 dist/ 目录"
    echo ""
    echo "🚀 部署方式："
    echo "1. 将 dist/ 目录上传到静态网站托管服务"
    echo "2. 或使用以下命令预览："
    echo "   npm run preview"
    echo ""
    echo "🌐 支持的托管平台："
    echo "- Vercel: vercel --prod"
    echo "- Netlify: netlify deploy --prod --dir=dist"
    echo "- GitHub Pages: 推送到 gh-pages 分支"
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

# Windows PowerShell版本
echo ""
echo "💻 Windows PowerShell命令："
echo "npm run build"
echo "npm run preview"
echo ""
echo "🎯 一键部署到GitHub Pages："
echo "npm run build && git add dist -f && git commit -m 'Deploy' && git subtree push --prefix dist origin gh-pages"
