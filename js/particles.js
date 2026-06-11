/**
 * 粒子系统模块
 * 用于创建和管理3D粒子效果
 */

class ParticleSystem {
    constructor(scene, count = 500) {
        this.scene = scene;
        this.particles = [];
        this.particleCount = count;
        this.geometry = null;
        this.material = null;
        this.points = null;
        this.init();
    }

    init() {
        this.geometry = new THREE.BufferGeometry();
        
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            // 随机位置
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            
            positions.push(x, y, z);
            
            // 随机颜色 - 绿色/青色/蓝色系
            const hue = Math.random() * 0.3 + 0.4; // 绿到青
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            colors.push(color.r, color.g, color.b);
            
            this.particles.push({
                x, y, z,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                vz: (Math.random() - 0.5) * 0.5,
                life: 1
            });
        }
        
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        
        this.material = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    update() {
        const positions = this.geometry.attributes.position.array;
        const colors = this.geometry.attributes.color.array;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // 更新位置
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            
            // 边界检测 - 反弹
            if (Math.abs(p.x) > 50) p.vx *= -1;
            if (Math.abs(p.y) > 50) p.vy *= -1;
            if (Math.abs(p.z) > 50) p.vz *= -1;
            
            // 轻微阻尼
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vz *= 0.98;
            
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            
            // 颜色渐变效果
            const pulseValue = 0.5 + 0.5 * Math.sin(Date.now() * 0.005 + i * 0.1);
            colors[i * 3 + 1] = pulseValue; // 绿通道
        }
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    setParticleCount(count) {
        if (this.points) {
            this.scene.remove(this.points);
        }
        
        this.particleCount = count;
        this.geometry.dispose();
        this.material.dispose();
        this.init();
    }

    reset() {
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x = (Math.random() - 0.5) * 100;
            p.y = (Math.random() - 0.5) * 100;
            p.z = (Math.random() - 0.5) * 100;
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = (Math.random() - 0.5) * 0.5;
            p.vz = (Math.random() - 0.5) * 0.5;
        }
        this.geometry.attributes.position.needsUpdate = true;
    }
}