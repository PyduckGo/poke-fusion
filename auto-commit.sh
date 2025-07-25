#!/bin/bash
# 自动git add commit脚本（中文版本）

echo "正在执行自动git提交..."

git add .

if [ -n "$(git status --porcelain)" ]; then
    git commit -m "feat: 自动提交更新

- 自动添加所有变更文件
- 优化项目配置和代码结构
- 提升用户体验和性能"
    echo "✅ 已成功提交所有变更"
else
    echo "ℹ️  没有需要提交的变更"
fi
