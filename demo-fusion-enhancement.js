// 增强版融合效果演示脚本
// 在浏览器控制台中运行此脚本进行测试

// 模拟Jimp环境
if (typeof window !== 'undefined') {
    window.Jimp = {
        read: async (url) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 512, 512);
                    
                    resolve({
                        bitmap: {
                            width: 512,
                            height: 512,
                            data: ctx.getImageData(0, 0, 512, 512).data
                        },
                        getPixelColor: (x, y) => {
                            const index = (y * 512 + x) * 4;
                            const data = ctx.getImageData(0, 0, 512, 512).data;
                            return (255 << 24) | (data[index] << 16) | (data[index + 1] << 8) | data[index + 2];
                        },
                        setPixelColor: (x, y, color) => {
                            const index = (y * 512 + x) * 4;
                            const imageData = ctx.getImageData(0, 0, 512, 512);
                            imageData.data[index] = (color >> 16) & 255;
                            imageData.data[index + 1] = (color >> 8) & 255;
                            imageData.data[index + 2] = color & 255;
                            imageData.data[index + 3] = (color >> 24) & 255;
                            ctx.putImageData(imageData, 0, 0);
                        },
                        scan: function(x, y, w, h, callback) {
                            for (let py = y; py < y + h; py++) {
                                for (let px = x; px < x + w; px++) {
                                    const idx = (py * 512 + px) * 4;
                                    callback.call(this, px, py, idx);
                                }
                            }
                        },
                        getBase64Async: () => Promise.resolve(canvas.toDataURL())
                    });
                };
                img.onerror = reject;
                img.src = url;
            });
        }
    };
}

// 简化的增强版融合演示
class DemoFusion {
    static async fusePokemon(sprite1Url, sprite2Url) {
        try {
            console.log('🔄 开始融合过程...');
            
            // 加载图片
            const [img1, img2] = await Promise.all([
                this.loadImage(sprite1Url),
                this.loadImage(sprite2Url)
            ]);
            
            console.log('✅ 图片加载完成');
            
            // 创建融合画布
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // 绘制背景
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 512, 512);
            
            // 简化的融合算法演示
            await this.performFusion(ctx, img1, img2);
            
            console.log('✅ 融合完成');
            return canvas.toDataURL();
            
        } catch (error) {
            console.error('❌ 融合失败:', error);
            throw error;
        }
    }
    
    static async loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
    
    static async performFusion(ctx, img1, img2) {
        // 绘制第一个宝可梦（形状）
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img1, 0, 0, 512, 512);
        
        // 创建形状蒙版
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = 512;
        maskCanvas.height = 512;
        const maskCtx = maskCanvas.getContext('2d');
        maskCtx.drawImage(img1, 0, 0, 512, 512);
        
        // 应用蒙版
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(img2, 0, 0, 512, 512);
        
        // 重置混合模式
        ctx.globalCompositeOperation = 'source-over';
        
        // 添加像素化效果
        this.applyPixelation(ctx, 4);
    }
    
    static applyPixelation(ctx, pixelSize) {
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        
        for (let y = 0; y < 512; y += pixelSize) {
            for (let x = 0; x < 512; x += pixelSize) {
                const index = (y * 512 + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];
                
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }
}

// 演示函数
async function demoFusion() {
    console.log('🎮 宝可梦融合演示开始');
    
    const testCases = [
        { id1: 1, id2: 4, name: '小火龙 + 杰尼龟' },
        { id1: 25, id2: 133, name: '皮卡丘 + 伊布' },
        { id1: 150, id2: 151, name: '超梦 + 梦幻' }
    ];
    
    for (const testCase of testCases) {
        console.log(`🔄 正在融合: ${testCase.name}`);
        
        const sprite1Url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${testCase.id1}.png`;
        const sprite2Url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${testCase.id2}.png`;
        
        try {
            const fusedImage = await DemoFusion.fusePokemon(sprite1Url, sprite2Url);
            console.log(`✅ ${testCase.name} 融合完成`);
            
            // 创建预览元素
            const preview = document.createElement('div');
            preview.innerHTML = `
                <h4>${testCase.name}</h4>
                <img src="${fusedImage}" style="width: 200px; height: 200px; image-rendering: pixelated;">
            `;
            document.body.appendChild(preview);
            
        } catch (error) {
            console.error(`❌ ${testCase.name} 融合失败:`, error);
        }
    }
    
    console.log('🎉 所有演示完成');
}

// 自动运行演示
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const button = document.createElement('button');
        button.textContent = '运行融合演示';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #e94560;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Press Start 2P', cursive;
            font-size: 10px;
            z-index: 1000;
        `;
        button.onclick = demoFusion;
        document.body.appendChild(button);
    });
}

// 导出供其他模块使用
export { DemoFusion, demoFusion };
