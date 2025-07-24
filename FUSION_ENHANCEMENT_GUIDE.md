# 宝可梦融合增强方案指南

## 概述
本项目实现了三种先进的宝可梦融合算法，参考了Pokemon Infinite Fusion和Japeal Fusion Generator的设计理念，提供了比传统融合更自然、更有创意的效果。

## 融合算法对比

### 1. 像素级融合 (Pixel Fusion)
- **特点**: 基于像素级别的颜色和形状混合
- **适用场景**: 复古像素风格、简单精灵
- **优势**: 保持像素艺术风格，处理速度快
- **配置选项**:
  - shapeSource: 形状来源选择
  - colorSource: 颜色来源选择
  - pixelSize: 像素化程度
  - outline: 是否添加轮廓

### 2. 高级解剖学融合 (Advanced Fusion)
- **特点**: 基于身体部位的智能分割和重组
- **适用场景**: 复杂精灵、需要精确部位控制的场景
- **优势**: 可以精确控制头部、身体等部位的组合
- **配置选项**:
  - headSource: 头部来源
  - bodySource: 身体来源
  - colorMode: 颜色混合模式
  - sizeRatio: 尺寸比例调整
  - outlineStyle: 轮廓样式
  - shadow: 阴影效果

### 3. 基因级融合 (Genetic Fusion)
- **特点**: 模拟真实生物遗传机制
- **适用场景**: 追求自然遗传效果、需要随机性的场景
- **优势**: 包含基因突变、显隐性遗传等生物学特性
- **配置选项**:
  - mutationRate: 突变率
  - dominanceBias: 显性偏好
  - featureMixing: 特征混合方式
  - colorInheritance: 颜色遗传模式
  - sizeCalculation: 尺寸计算方式

### 4. 混合融合 (Hybrid)
- **特点**: 结合多种算法的优势
- **适用场景**: 需要独特创意效果的场景
- **优势**: 可以自定义算法组合和混合比例

## 使用示例

### 基础使用
```typescript
import { createFusion } from './utils/fusionSelector';

// 使用默认算法（基因融合）
const result = await createFusion(spriteUrlA, spriteUrlB);

// 指定算法
const pixelResult = await createFusion(spriteUrlA, spriteUrlB, {
  algorithm: 'pixel'
});

const advancedResult = await createFusion(spriteUrlA, spriteUrlB, {
  algorithm: 'advanced',
  advancedConfig: {
    headSource: 'parentA',
    bodySource: 'parentB',
    colorMode: 'gradient'
  }
});

const geneticResult = await createFusion(spriteUrlA, spriteUrlB, {
  algorithm: 'genetic',
  geneticConfig: {
    mutationRate: 0.1,
    colorInheritance: 'blend'
  }
});
```

### 智能推荐
```typescript
import { getRecommendedAlgorithm } from './utils/fusionSelector';

const recommendation = await getRecommendedAlgorithm(spriteUrlA, spriteUrlB);
console.log('推荐算法:', recommendation.recommended);
console.log('推荐理由:', recommendation.reasons);
```

### 批量比较
```typescript
import { compareFusionAlgorithms } from './utils/fusionSelector';

const comparison = await compareFusionAlgorithms(spriteUrlA, spriteUrlB);
// 返回所有算法的结果，方便用户选择
```

## 算法选择建议

| 场景特征 | 推荐算法 | 理由 |
|---------|----------|------|
| 两个都是简单像素精灵 | 像素融合 | 保持像素风格，效果最佳 |
| 精灵细节丰富 | 高级融合 | 能更好保留复杂特征 |
| 颜色差异大 | 基因融合 | 创造自然过渡效果 |
| 需要随机性 | 基因融合 | 包含突变机制 |
| 需要精确控制 | 高级融合 | 可精确选择部位 |
| 追求创意效果 | 混合融合 | 结合多种算法优势 |

## 技术实现亮点

### 1. 智能部位检测
- 基于像素密度和位置自动识别头部、身体等部位
- 置信度评估确保选择最佳部位

### 2. 颜色遗传算法
- 提取主导颜色进行智能混合
- 支持多种颜色继承模式（显性、混合、渐变）

### 3. 基因突变机制
- 模拟真实遗传的突变概率
- 产生意想不到的创意效果

### 4. 图像质量优化
- 自动填充透明区域，避免黑色空白
- 智能轮廓检测和添加
- 保持原始精灵的宽高比

## 性能优化

- 异步处理，支持并发融合
- 缓存机制避免重复计算
- 渐进式渲染提升用户体验
- 支持缩略图预览

## 扩展性

新算法可以轻松添加到系统中：
1. 实现新的融合函数
2. 在FusionAlgorithmSelector中注册
3. 添加对应的配置类型

## 使用建议

1. **首次使用**: 建议使用智能推荐功能
2. **批量处理**: 使用compareAlgorithms比较不同算法效果
3. **精细调整**: 使用高级或基因融合的配置参数
4. **创意实验**: 尝试混合融合和不同的配置组合

## 注意事项

- 所有算法都支持跨域图片
- 处理大图片时建议使用Web Worker
- 基因融合的结果具有随机性，每次可能不同
- 建议对结果进行缓存以提升性能
