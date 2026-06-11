/**
 * UI交互模块
 * 管理用户界面交互和实时数据更新
 */

class UIController {
    constructor(scene3d, particleSystem) {
        this.scene3d = scene3d;
        this.particleSystem = particleSystem;
        this.stats = {
            fps: 60,
            lastTime: Date.now(),
            frameCount: 0
        };
        
        this.initEventListeners();
        this.startUpdateLoop();
    }

    initEventListeners() {
        // 旋转速度滑块
        const rotationSpeedInput = document.getElementById('rotationSpeed');
        rotationSpeedInput.addEventListener('change', (e) => {
            const speed = parseFloat(e.target.value);
            this.scene3d.setRotationSpeed(speed);
            document.getElementById('speedValue').textContent = speed.toFixed(1) + 'x';
        });

        // 粒子数量滑块
        const particleCountInput = document.getElementById('particleCount');
        particleCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            this.particleSystem.setParticleCount(count);
            document.getElementById('particleValue').textContent = count;
        });

        // 光照强度滑块
        const lightIntensityInput = document.getElementById('lightIntensity');
        lightIntensityInput.addEventListener('change', (e) => {
            const intensity = parseFloat(e.target.value);
            this.scene3d.setLightIntensity(intensity);
            document.getElementById('lightValue').textContent = intensity.toFixed(1) + 'x';
        });

        // 重置按钮
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.addEventListener('click', () => {
            this.reset();
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.reset();
            }
        });

        // 鼠标交互
        this.initMouseInteraction();

        // 窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }

    initMouseInteraction() {
        const camera = this.scene3d.getCamera();
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotation = { x: 0, y: 0 };

        document.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;

                rotation.y += deltaX * 0.01;
                rotation.x += deltaY * 0.01;

                // 应用旋转
                const quaternion = new THREE.Quaternion();
                const eulerOrder = 'YXZ';
                
                quaternion.setFromEuler(new THREE.Euler(rotation.x, rotation.y, 0, eulerOrder));
                const position = new THREE.Vector3(0, 0, 50);
                position.applyQuaternion(quaternion);
                
                camera.position.copy(position);
                camera.lookAt(0, 0, 0);
            }
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 鼠标滚轮缩放
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            const currentDistance = camera.position.length();
            const newDistance = Math.max(20, Math.min(150, currentDistance + direction * 5));
            
            const direction3d = camera.position.normalize();
            camera.position.copy(direction3d.multiplyScalar(newDistance));
        }, { passive: false });
    }

    startUpdateLoop() {
        setInterval(() => {
            this.updateStats();
        }, 1000);
    }

    updateStats() {
        const now = Date.now();
        const deltaTime = (now - this.stats.lastTime) / 1000;
        this.stats.fps = Math.round(this.stats.frameCount / deltaTime);
        
        // 更新FPS显示
        document.getElementById('fps').textContent = this.stats.fps;
        
        // 更新对象数量
        document.getElementById('objects').textContent = this.scene3d.getObjectCount();
        
        // 更新粒子数量
        document.getElementById('particles').textContent = this.particleSystem.particleCount;
        
        // 更新内存使用
        if (performance.memory) {
            const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            document.getElementById('memory').textContent = memoryMB + ' MB';
        }
        
        // 更新时间戳
        this.updateTimestamp();
        
        this.stats.lastTime = now;
        this.stats.frameCount = 0;
    }

    updateTimestamp() {
        const now = new Date();
        const timestamp = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        document.getElementById('timestamp').textContent = timestamp;
    }

    recordFrame() {
        this.stats.frameCount++;
    }

    reset() {
        // 重置所有滑块
        document.getElementById('rotationSpeed').value = 1;
        document.getElementById('particleCount').value = 500;
        document.getElementById('lightIntensity').value = 1;
        
        // 更新显示值
        document.getElementById('speedValue').textContent = '1.0x';
        document.getElementById('particleValue').textContent = '500';
        document.getElementById('lightValue').textContent = '1.0x';
        
        // 重置场景和粒子
        this.scene3d.reset();
        this.particleSystem.reset();
        
        // 重置相机
        const camera = this.scene3d.getCamera();
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);
    }

    onWindowResize() {
        this.scene3d.onWindowResize();
    }
}