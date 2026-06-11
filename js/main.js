/**
 * 主程序入口
 * 初始化应用程序
 */

let scene3d = null;
let particleSystem = null;
let uiController = null;

function init() {
    // 获取容器
    const container = document.getElementById('canvas-container');
    
    // 初始化3D场景
    scene3d = new Scene3D(container);
    
    // 初始化粒子系统
    particleSystem = new ParticleSystem(scene3d.getScene(), 500);
    
    // 初始化UI控制器
    uiController = new UIController(scene3d, particleSystem);
    
    // 启动动画循环
    animate();
    
    console.log('✓ 3D Tech Dashboard initialized successfully');
}

function animate() {
    requestAnimationFrame(animate);
    
    // 更新3D场景
    scene3d.update();
    
    // 更新粒子系统
    particleSystem.update();
    
    // 渲染场景
    scene3d.render();
    
    // 记录帧数
    uiController.recordFrame();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}