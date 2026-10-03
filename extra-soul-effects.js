// 额外武魂技能特效 - extra-soul-effects.js
// 为10个新增武魂提供独特的技能特效

// ========== 工具函数 ==========
function _createParticle(pos, size, color, opacity) {
  const geom = new THREE.SphereGeometry(size, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity || 0.9 });
  const p = new THREE.Mesh(geom, mat);
  p.position.copy(pos);
  return p;
}

function _createRing(pos, radius, color, opacity) {
  const geom = new THREE.TorusGeometry(radius, 0.15, 8, 32);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity || 0.7 });
  const ring = new THREE.Mesh(geom, mat);
  ring.position.copy(pos);
  ring.rotation.x = Math.PI / 2;
  return ring;
}

function _createBeam(startPos, dir, length, color, opacity) {
  const geom = new THREE.CylinderGeometry(0.1, 0.15, length, 8);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: opacity || 0.8 });
  const beam = new THREE.Mesh(geom, mat);
  beam.position.copy(startPos).add(dir.clone().multiplyScalar(length / 2));
  // 朝向方向
  const up = new THREE.Vector3(0, 1, 0);
  beam.quaternion.setFromUnitVectors(up, dir.clone().normalize());
  return beam;
}

function _animateParticles(particles, duration, onComplete) {
  let life = duration || 0.6;
  const maxLife = life;
  const animate = () => {
    life -= 0.02;
    if (life > 0) {
      for (const p of particles) {
        if (p.userData.vel) {
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
        }
        if (p.material && p.material.opacity !== undefined) {
          p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.9);
        }
        if (p.userData.gravity) {
          p.userData.vel.y -= p.userData.gravity * 0.02;
        }
      }
      requestAnimationFrame(animate);
    } else {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      if (onComplete) onComplete();
    }
  };
  animate();
}

// ========== 1. 七宝琉璃塔技能特效 ==========
// 辅助系器武魂 - 每个魂技都有完全独特的视觉表现
function spawnSevenTreasuresSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];

  // ===== 通用：创建琉璃塔辅助函数 =====
  function createGlazedTower(baseColor, layerCount, scale) {
    const tower = new THREE.Group();
    const colors = Array.isArray(baseColor) ? baseColor : [baseColor];
    for (let i = 0; i < layerCount; i++) {
      const layerSize = (0.7 - i * 0.06) * scale;
      const layerColor = colors[i % colors.length];
      // 塔身
      const layer = new THREE.Mesh(
        new THREE.BoxGeometry(layerSize, 0.22 * scale, layerSize),
        new THREE.MeshBasicMaterial({ color: layerColor, transparent: true, opacity: 0.7 })
      );
      layer.position.y = i * 0.28 * scale;
      tower.add(layer);
      // 塔檐（飞檐）
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(layerSize * 0.8, 0.12 * scale, 4),
        new THREE.MeshBasicMaterial({ color: layerColor, transparent: true, opacity: 0.9 })
      );
      roof.position.y = i * 0.28 * scale + 0.17 * scale;
      roof.rotation.y = Math.PI / 4;
      tower.add(roof);
    }
    // 塔顶宝珠
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 * scale, 8, 8),
      new THREE.MeshBasicMaterial({ color: colors[0], transparent: true, opacity: 1 })
    );
    orb.position.y = layerCount * 0.28 * scale;
    tower.add(orb);
    return tower;
  }

  // ===== 第1魂技：力量增幅（红色力量光环） =====
  if (idx === 0) {
    const duration = 0.8;
    // 小型红色琉璃塔
    const tower = createGlazedTower(0xff3333, 7, 0.5);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 塔身红光脉动球体
    const towerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.3 })
    );
    towerGlow.position.copy(startPos);
    towerGlow.position.y += 0.8;
    game.scene.add(towerGlow);
    particles.push(towerGlow);

    // 玩家周围三道红色力量光环（上下浮动）
    for (let r = 0; r < 3; r++) {
      const ring = _createRing(startPos, 0.8 + r * 0.3, 0xff2222, 0.7);
      ring.position.y = 0.5 + r * 0.4;
      ring.userData.baseY = 0.5 + r * 0.4;
      ring.userData.floatSpeed = 2 + r;
      ring.userData.floatAmp = 0.15;
      ring.userData.baseOpacity = 0.7;
      ring.userData.grow = true;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 红色力量粒子向上喷发
    for (let i = 0; i < 20; i++) {
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.1, 0xff5555, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * 0.5,
        3 + Math.random() * 3,
        Math.sin(angle) * 0.5
      );
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 力量冲击波纹（地面）
    const shockRing = _createRing(startPos, 0.3, 0xff0000, 0.8);
    shockRing.position.y = 0.05;
    shockRing.userData.expandSpeed = 6;
    shockRing.userData.baseOpacity = 0.8;
    game.scene.add(shockRing);
    particles.push(shockRing);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 12) * 0.2;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.02;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7 * pulse;
              }
            });
          } else if (p === towerGlow) {
            p.scale.setScalar(pulse * 1.2);
            p.material.opacity = (life / maxLife) * 0.3 * pulse;
          } else if (p.userData.expandSpeed) {
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.floatSpeed !== undefined) {
            p.position.y = p.userData.baseY + Math.sin(t * p.userData.floatSpeed) * p.userData.floatAmp;
            if (p.userData.grow) p.scale.setScalar(1 + t * 0.5);
            if (p.material) p.material.opacity = (life / maxLife) * 0.7;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * 0.9;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第2魂技：速度增幅（蓝色速度旋风） =====
  if (idx === 1) {
    const duration = 0.7;
    // 小型蓝色琉璃塔
    const tower = createGlazedTower(0x00aaff, 7, 0.5);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 玩家脚下蓝色旋风（多层旋转圆环）
    const vortexGroup = new THREE.Group();
    for (let r = 0; r < 5; r++) {
      const ringGeom = new THREE.TorusGeometry(0.4 + r * 0.25, 0.04, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.6 - r * 0.08 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = 0.1 + r * 0.15;
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.1 + r * 0.03);
      vortexGroup.add(ring);
    }
    vortexGroup.position.copy(startPos);
    game.scene.add(vortexGroup);
    particles.push(vortexGroup);

    // 蓝色流线型粒子（环绕玩家高速旋转上升）
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, 0x66ddff, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 0.6;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 1.5;
      p.userData.orbitRadius = dist;
      p.userData.orbitAngle = angle;
      p.userData.orbitSpeed = 4 + Math.random() * 3;
      p.userData.riseSpeed = 1.5 + Math.random() * 2;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 蓝色尾迹光束（向前方的速度线）
    for (let i = 0; i < 6; i++) {
      const beamLen = 1.5 + Math.random() * 1;
      const beamDir = dir.clone();
      beamDir.x += (Math.random() - 0.5) * 0.4;
      beamDir.y += (Math.random() - 0.5) * 0.3;
      beamDir.normalize();
      const beam = _createBeam(startPos, beamDir, beamLen, 0x88eeff, 0.6);
      beam.userData.baseOpacity = 0.6;
      beam.userData.vel = beamDir.clone().multiplyScalar(8);
      game.scene.add(beam);
      particles.push(beam);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.04;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p === vortexGroup) {
            p.children.forEach(child => {
              child.rotation.z += child.userData.rotSpeed;
              if (child.material) child.material.opacity = (life / maxLife) * (0.6 - 0.08 * p.children.indexOf(child));
            });
            p.scale.setScalar(1 + t * 0.3);
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y += p.userData.riseSpeed * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9;
          } else if (p.userData.vel && p.geometry && p.geometry.type === 'CylinderGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * 0.6;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第3魂技：防御增幅（黄色护盾光罩） =====
  if (idx === 2) {
    const duration = 1.0;
    // 小型黄色琉璃塔
    const tower = createGlazedTower(0xffcc00, 7, 0.5);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 玩家周围半球形护盾光罩
    const shieldGroup = new THREE.Group();
    // 外层护盾
    const shieldOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffdd33, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    shieldOuter.position.y = 0.8;
    shieldGroup.add(shieldOuter);
    // 内层护盾
    const shieldInner = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffee66, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    shieldInner.position.y = 0.8;
    shieldGroup.add(shieldInner);
    // 六边形护盾碎片
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const shard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.05, 6),
        new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.7 })
      );
      shard.position.set(
        Math.cos(angle) * 1.0,
        0.8 + Math.sin(i * 0.8) * 0.4,
        Math.sin(angle) * 1.0
      );
      shard.lookAt(new THREE.Vector3(0, 0.8, 0).add(startPos));
      shard.userData.baseAngle = angle;
      shard.userData.baseY = 0.8 + Math.sin(i * 0.8) * 0.4;
      shieldGroup.add(shard);
    }
    shieldGroup.position.copy(startPos);
    game.scene.add(shieldGroup);
    particles.push(shieldGroup);

    // 地面黄色防御光环
    const groundRing = _createRing(startPos, 1.2, 0xffcc00, 0.6);
    groundRing.position.y = 0.05;
    groundRing.userData.baseOpacity = 0.6;
    groundRing.userData.pulse = true;
    game.scene.add(groundRing);
    particles.push(groundRing);

    // 黄色防御粒子（从地面升起附着在护盾上）
    for (let i = 0; i < 18; i++) {
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.08, 0xffdd55, 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.2;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.userData.vel = new THREE.Vector3(0, 1.5 + Math.random() * 1.5, 0);
      p.userData.baseOpacity = 0.85;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 8) * 0.15;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.015;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p === shieldGroup) {
            p.children.forEach((child, i) => {
              if (i < 2) {
                // 护盾球
                child.material.opacity = (life / maxLife) * (i === 0 ? 0.2 : 0.3) * pulse;
                child.scale.setScalar(1 + Math.sin(t * 4) * 0.05);
              } else {
                // 护盾碎片环绕旋转
                const idx = i - 2;
                const angle = child.userData.baseAngle + t * 1.5;
                child.position.x = Math.cos(angle) * 1.0;
                child.position.z = Math.sin(angle) * 1.0;
                child.position.y = child.userData.baseY + Math.sin(t * 3 + idx) * 0.1;
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p.userData.pulse) {
            p.scale.setScalar(pulse);
            if (p.material) p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * 0.85;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第4魂技：魂力增幅（紫色魂力粒子环绕） =====
  if (idx === 3) {
    const duration = 0.9;
    // 小型紫色琉璃塔
    const tower = createGlazedTower(0x9933ff, 7, 0.5);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 紫色魂力光柱（从天而降）
    const beamGroup = new THREE.Group();
    const mainBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 4, 12),
      new THREE.MeshBasicMaterial({ color: 0xaa55ff, transparent: true, opacity: 0.4 })
    );
    mainBeam.position.y = 3;
    beamGroup.add(mainBeam);
    // 光柱内芯
    const innerBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, 4, 8),
      new THREE.MeshBasicMaterial({ color: 0xddbbff, transparent: true, opacity: 0.6 })
    );
    innerBeam.position.y = 3;
    beamGroup.add(innerBeam);
    beamGroup.position.copy(startPos);
    game.scene.add(beamGroup);
    particles.push(beamGroup);

    // 魂力粒子螺旋环绕玩家（双螺旋）
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, 0xbb66ff, 0.9);
      const isSecond = i >= 15;
      const angle = (i % 15) / 15 * Math.PI * 2 + (isSecond ? Math.PI : 0);
      const dist = 0.7 + Math.random() * 0.3;
      p.position.x = startPos.x + Math.cos(angle) * dist;
      p.position.z = startPos.z + Math.sin(angle) * dist;
      p.position.y = startPos.y + Math.random() * 0.5;
      p.userData.orbitRadius = dist;
      p.userData.orbitAngle = angle;
      p.userData.orbitSpeed = 2 + Math.random() * 1.5;
      p.userData.riseSpeed = 1 + Math.random() * 1.5;
      p.userData.baseOpacity = 0.9;
      p.userData.purple = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 魂力汇聚点（玩家胸口位置的紫光球）
    const coreOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xdd88ff, transparent: true, opacity: 0.8 })
    );
    coreOrb.position.copy(startPos);
    coreOrb.position.y += 1;
    game.scene.add(coreOrb);
    particles.push(coreOrb);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 10) * 0.2;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.025;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p === beamGroup) {
            p.children.forEach((child, i) => {
              child.material.opacity = (life / maxLife) * (i === 0 ? 0.4 : 0.6) * pulse;
            });
          } else if (p === coreOrb) {
            p.scale.setScalar(pulse * 1.2);
            p.material.opacity = (life / maxLife) * 0.8;
          } else if (p.userData.purple) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.userData.orbitRadius *= 0.998; // 逐渐向内收缩
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y += p.userData.riseSpeed * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第5魂技：生命增幅（绿色治愈之光） =====
  if (idx === 4) {
    const duration = 1.0;
    // 小型绿色琉璃塔
    const tower = createGlazedTower(0x33cc33, 7, 0.5);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 从头顶洒下的绿色治愈光幕（圆柱形光幕）
    const veilGroup = new THREE.Group();
    // 外层光幕
    const outerVeil = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.2, 3, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x44dd44, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    outerVeil.position.y = 2;
    veilGroup.add(outerVeil);
    // 内层光幕
    const innerVeil = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 0.8, 3, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x66ee66, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    innerVeil.position.y = 2;
    veilGroup.add(innerVeil);
    veilGroup.position.copy(startPos);
    game.scene.add(veilGroup);
    particles.push(veilGroup);

    // 顶部光源（绿色光球，模拟阳光洒落）
    const topLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x88ff88, transparent: true, opacity: 0.6 })
    );
    topLight.position.copy(startPos);
    topLight.position.y += 3.5;
    game.scene.add(topLight);
    particles.push(topLight);

    // 绿色治愈粒子缓缓下落（像光点雨）
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.07, 0x77ff77, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.3;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 3 + Math.random() * 1;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        -0.8 - Math.random() * 1.2,
        (Math.random() - 0.5) * 0.3
      );
      p.userData.baseOpacity = 0.9;
      p.userData.sparkle = Math.random() * Math.PI * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面生命光环
    const lifeRing = _createRing(startPos, 0.5, 0x22bb22, 0.7);
    lifeRing.position.y = 0.05;
    lifeRing.userData.expandSpeed = 3;
    lifeRing.userData.baseOpacity = 0.7;
    game.scene.add(lifeRing);
    particles.push(lifeRing);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const wave = 0.85 + Math.sin(t * 6) * 0.15;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.015;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p === veilGroup) {
            p.children.forEach((child, i) => {
              child.material.opacity = (life / maxLife) * (i === 0 ? 0.2 : 0.3) * wave;
              child.rotation.y += i === 0 ? 0.005 : -0.008;
            });
          } else if (p === topLight) {
            p.scale.setScalar(wave * 1.2);
            p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.expandSpeed) {
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.sparkle += 0.1;
            const sparkleMult = 0.7 + Math.sin(p.userData.sparkle) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9 * sparkleMult;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第6魂技：七宝神光（七彩神光爆发攻击光环） =====
  if (idx === 5) {
    const duration = 1.0;
    const rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];

    // 七彩琉璃塔
    const tower = createGlazedTower(rainbowColors, 7, 0.7);
    tower.position.copy(startPos);
    tower.position.y += 0.6;
    game.scene.add(tower);
    particles.push(tower);

    // 七彩爆发核心（强烈光球）
    const burstCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    burstCore.position.copy(startPos);
    burstCore.position.y += 1;
    game.scene.add(burstCore);
    particles.push(burstCore);

    // 七圈七彩光环向外扩散（攻击波）
    for (let r = 0; r < 7; r++) {
      const ring = _createRing(startPos, 0.5 + r * 0.3, rainbowColors[r], 0.8);
      ring.position.y = 1;
      ring.userData.expandSpeed = 5 + r * 0.8;
      ring.userData.baseOpacity = 0.8;
      ring.userData.delay = r * 0.04;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 地面七彩冲击环
    for (let r = 0; r < 5; r++) {
      const groundRing = _createRing(startPos, 0.3 + r * 0.4, rainbowColors[(r + 2) % 7], 0.7);
      groundRing.position.y = 0.05;
      groundRing.userData.expandSpeed = 7 + r;
      groundRing.userData.baseOpacity = 0.7;
      groundRing.userData.delay = r * 0.03;
      game.scene.add(groundRing);
      particles.push(groundRing);
    }

    // 七彩粒子向四周飞射
    for (let i = 0; i < 50; i++) {
      const pColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.12, pColor, 0.95);
      p.position.y += 1;
      const angleH = Math.random() * Math.PI * 2;
      const angleV = Math.random() * Math.PI * 0.6 + 0.2;
      const speed = 4 + Math.random() * 5;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angleH) * Math.sin(angleV) * speed,
        Math.cos(angleV) * speed,
        Math.sin(angleH) * Math.sin(angleV) * speed
      );
      p.userData.baseOpacity = 0.95;
      game.scene.add(p);
      particles.push(p);
    }

    // 七道七彩光束向天空发射
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const beamDir = new THREE.Vector3(Math.cos(angle) * 0.3, 1, Math.sin(angle) * 0.3).normalize();
      const beam = _createBeam(startPos, beamDir, 5, rainbowColors[i], 0.7);
      beam.position.y += 0.5;
      beam.userData.baseOpacity = 0.7;
      game.scene.add(beam);
      particles.push(beam);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.05;
            p.scale.setScalar(0.7 + Math.sin(t * 10) * 0.1);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8;
              }
            });
          } else if (p === burstCore) {
            const burstScale = t < 0.3 ? (t / 0.3) * 2 : 2 * (1 - (t - 0.3) / 0.7 * 0.5);
            p.scale.setScalar(burstScale);
            p.material.opacity = (life / maxLife) * 0.9;
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.6);
          } else if (p.userData.vel && p.geometry.type === 'SphereGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * 0.95;
          } else if (p.geometry && p.geometry.type === 'CylinderGeometry') {
            if (p.material) p.material.opacity = (life / maxLife) * 0.7;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第7魂技：九宝真身（九层宝塔+全属性光芒环绕） =====
  if (idx === 6) {
    const duration = 1.2;
    const attributeColors = [0xff3333, 0x3399ff, 0xffcc00, 0x9933ff, 0x33cc33, 0xff66cc, 0x00ffff, 0xff8800, 0xffffff];

    // 九层琉璃塔（比普通多2层，更大更亮）
    const tower = createGlazedTower(attributeColors, 9, 0.9);
    tower.position.copy(startPos);
    tower.position.y += 0.3;
    game.scene.add(tower);
    particles.push(tower);

    // 塔身外发光晕
    const towerAura = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    );
    towerAura.position.copy(startPos);
    towerAura.position.y += 1.2;
    game.scene.add(towerAura);
    particles.push(towerAura);

    // 九道不同颜色的属性光束环绕塔身旋转
    const beamOrbitGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const beamGeom = new THREE.CylinderGeometry(0.06, 0.1, 2.5, 6);
      const beamMat = new THREE.MeshBasicMaterial({ color: attributeColors[i], transparent: true, opacity: 0.7 });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(
        Math.cos(angle) * 1.2,
        1.2,
        Math.sin(angle) * 1.2
      );
      beam.userData.baseAngle = angle;
      beam.userData.baseRadius = 1.2;
      beam.userData.beamIndex = i;
      beamOrbitGroup.add(beam);
    }
    beamOrbitGroup.position.copy(startPos);
    game.scene.add(beamOrbitGroup);
    particles.push(beamOrbitGroup);

    // 九圈属性光环（不同高度，不同颜色）
    for (let r = 0; r < 9; r++) {
      const ring = _createRing(startPos, 1.5 + r * 0.15, attributeColors[r], 0.5);
      ring.position.y = 0.3 + r * 0.25;
      ring.userData.baseOpacity = 0.5;
      ring.userData.rotDir = r % 2 === 0 ? 1 : -1;
      ring.userData.rotSpeed = 0.02 + r * 0.003;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 全属性粒子（九色混合，环绕上升）
    for (let i = 0; i < 40; i++) {
      const pColor = attributeColors[Math.floor(Math.random() * attributeColors.length)];
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.09, pColor, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.8 + Math.random() * 1.2;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.5;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = dist;
      p.userData.orbitSpeed = 1.5 + Math.random() * 2;
      p.userData.riseSpeed = 1 + Math.random() * 2;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 6) * 0.15;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.03;
            p.position.y = startPos.y + 0.3 + Math.sin(t * 3) * 0.1;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8;
              }
            });
          } else if (p === towerAura) {
            p.scale.setScalar(pulse * 1.3);
            p.material.opacity = (life / maxLife) * 0.15;
          } else if (p === beamOrbitGroup) {
            p.rotation.y += 0.03;
            p.children.forEach(child => {
              const wobble = Math.sin(t * 5 + child.userData.beamIndex) * 0.2;
              child.position.x = Math.cos(child.userData.baseAngle + t * 0.5) * (child.userData.baseRadius + wobble);
              child.position.z = Math.sin(child.userData.baseAngle + t * 0.5) * (child.userData.baseRadius + wobble);
              child.material.opacity = (life / maxLife) * 0.7;
            });
          } else if (p.userData.rotSpeed !== undefined && p.userData.baseOpacity !== undefined && p.geometry.type === 'TorusGeometry') {
            p.rotation.z += p.userData.rotSpeed * p.userData.rotDir;
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.orbitSpeed !== undefined && p.userData.riseSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y += p.userData.riseSpeed * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第8魂技：九宝神光罩（巨大琉璃光罩防御屏障） =====
  if (idx === 7) {
    const duration = 1.2;
    const glowColors = [0xffdd55, 0xffaa33, 0xffff88, 0xffcc66];

    // 九层琉璃塔（位于光罩顶部）
    const tower = createGlazedTower(0xffcc33, 9, 0.6);
    tower.position.copy(startPos);
    tower.position.y += 3.5;
    game.scene.add(tower);
    particles.push(tower);

    // 巨型琉璃光罩（多层球形护盾）
    const domeGroup = new THREE.Group();
    // 最外层（半透明琉璃质感）
    const outerDome = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffdd66, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    outerDome.position.y = 1.5;
    domeGroup.add(outerDome);
    // 中层
    const midDome = new THREE.Mesh(
      new THREE.SphereGeometry(3.0, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    );
    midDome.position.y = 1.5;
    domeGroup.add(midDome);
    // 内层
    const innerDome = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    innerDome.position.y = 1.5;
    domeGroup.add(innerDome);
    // 光罩上的琉璃瓦片装饰（六边形碎片）
    for (let i = 0; i < 24; i++) {
      const theta = Math.random() * Math.PI / 2;
      const phi = Math.random() * Math.PI * 2;
      const r = 3.2;
      const shard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.04, 6),
        new THREE.MeshBasicMaterial({ color: glowColors[i % 4], transparent: true, opacity: 0.7 })
      );
      shard.position.set(
        r * Math.sin(theta) * Math.cos(phi),
        1.5 + r * Math.cos(theta),
        r * Math.sin(theta) * Math.sin(phi)
      );
      shard.lookAt(new THREE.Vector3(0, 1.5, 0).add(startPos));
      shard.userData.theta = theta;
      shard.userData.phi = phi;
      shard.userData.radius = r;
      domeGroup.add(shard);
    }
    domeGroup.position.copy(startPos);
    game.scene.add(domeGroup);
    particles.push(domeGroup);

    // 光罩底部的金色光环
    const baseRing = _createRing(startPos, 3.5, 0xffcc00, 0.6);
    baseRing.position.y = 0.05;
    baseRing.userData.baseOpacity = 0.6;
    baseRing.userData.pulse = true;
    game.scene.add(baseRing);
    particles.push(baseRing);

    // 金色光芒粒子在光罩内壁流动
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.1, 0xffee66, 0.85);
      const theta = Math.random() * Math.PI / 2;
      const phi = Math.random() * Math.PI * 2;
      const r = 2.8 + Math.random() * 0.5;
      p.position.x = startPos.x + r * Math.sin(theta) * Math.cos(phi);
      p.position.y = startPos.y + r * Math.cos(theta);
      p.position.z = startPos.z + r * Math.sin(theta) * Math.sin(phi);
      p.userData.theta = theta;
      p.userData.phi = phi;
      p.userData.radius = r;
      p.userData.flowSpeed = 0.5 + Math.random() * 1;
      p.userData.baseOpacity = 0.85;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.9 + Math.sin(t * 5) * 0.1;
        for (const p of particles) {
          if (p === tower) {
            p.rotation.y += 0.02;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8;
              }
            });
          } else if (p === domeGroup) {
            p.children.forEach((child, i) => {
              if (i < 3) {
                // 三层光罩
                child.material.opacity = (life / maxLife) * [0.15, 0.2, 0.25][i] * pulse;
                child.scale.setScalar(1 + Math.sin(t * 3 + i) * 0.03);
              } else {
                // 琉璃瓦片
                const shardIdx = i - 3;
                child.userData.phi += 0.005 + (shardIdx % 5) * 0.002;
                const wobble = Math.sin(t * 4 + shardIdx) * 0.1;
                const r = child.userData.radius + wobble;
                child.position.x = r * Math.sin(child.userData.theta) * Math.cos(child.userData.phi);
                child.position.y = 1.5 + r * Math.cos(child.userData.theta);
                child.position.z = r * Math.sin(child.userData.theta) * Math.sin(child.userData.phi);
                child.lookAt(new THREE.Vector3(0, 1.5, 0));
                child.material.opacity = (life / maxLife) * 0.7;
              }
            });
          } else if (p.userData.pulse) {
            p.scale.setScalar(pulse);
            if (p.material) p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.flowSpeed !== undefined) {
            p.userData.phi += p.userData.flowSpeed * 0.01;
            p.userData.theta += Math.sin(t * 2 + p.userData.phi) * 0.005;
            p.position.x = startPos.x + p.userData.radius * Math.sin(p.userData.theta) * Math.cos(p.userData.phi);
            p.position.y = startPos.y + p.userData.radius * Math.cos(p.userData.theta);
            p.position.z = startPos.z + p.userData.radius * Math.sin(p.userData.theta) * Math.sin(p.userData.phi);
            if (p.material) p.material.opacity = (life / maxLife) * 0.85;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第9魂技：七宝转出有琉璃（终极奥义，七彩光芒普照大地） =====
  if (idx === 8) {
    const duration = 1.5;
    const rainbowColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];

    // 七层宝塔（大型，缓慢旋转升空）
    const tower = createGlazedTower(rainbowColors, 7, 1.2);
    tower.position.copy(startPos);
    tower.position.y += 0.5;
    game.scene.add(tower);
    particles.push(tower);

    // 塔身强烈光晕
    const towerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(2, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
    );
    towerGlow.position.copy(startPos);
    towerGlow.position.y += 1.5;
    game.scene.add(towerGlow);
    particles.push(towerGlow);

    // 从塔顶向地面普照的七彩光芒（七道巨大光束）
    const lightRayGroup = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const rayGeom = new THREE.CylinderGeometry(0.2, 1.5, 5, 10);
      const rayMat = new THREE.MeshBasicMaterial({ color: rainbowColors[i], transparent: true, opacity: 0.3 });
      const ray = new THREE.Mesh(rayGeom, rayMat);
      ray.position.set(
        Math.cos(angle) * 0.3,
        -1.5,
        Math.sin(angle) * 0.3
      );
      ray.rotation.x = Math.PI / 6;
      ray.rotation.z = -angle;
      ray.userData.rayIndex = i;
      lightRayGroup.add(ray);
    }
    lightRayGroup.position.copy(startPos);
    lightRayGroup.position.y += 3;
    game.scene.add(lightRayGroup);
    particles.push(lightRayGroup);

    // 地面七彩光环扩散（多层）
    for (let r = 0; r < 7; r++) {
      const groundRing = _createRing(startPos, 0.5 + r * 0.5, rainbowColors[r], 0.7);
      groundRing.position.y = 0.05;
      groundRing.userData.expandSpeed = 4 + r * 0.5;
      groundRing.userData.baseOpacity = 0.7;
      groundRing.userData.delay = r * 0.05;
      game.scene.add(groundRing);
      particles.push(groundRing);
    }

    // 大量七彩光芒粒子从天而降（普照效果）
    for (let i = 0; i < 70; i++) {
      const pColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, pColor, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 4 + Math.random() * 2;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -2 - Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      p.userData.baseOpacity = 0.9;
      p.userData.sparkle = Math.random() * Math.PI * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面升起的七彩光柱（环绕玩家）
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = 1.5 + Math.random() * 1;
      const beamColor = rainbowColors[i % 7];
      const beam = _createBeam(
        new THREE.Vector3(startPos.x + Math.cos(angle) * dist, startPos.y, startPos.z + Math.sin(angle) * dist),
        new THREE.Vector3(0, 1, 0),
        2.5 + Math.random() * 1.5,
        beamColor,
        0.5
      );
      beam.userData.baseOpacity = 0.5;
      beam.userData.growDelay = (i % 7) * 0.03;
      game.scene.add(beam);
      particles.push(beam);
    }

    // 中心巨大光柱
    const centralBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.8, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 })
    );
    centralBeam.position.copy(startPos);
    centralBeam.position.y += 3;
    game.scene.add(centralBeam);
    particles.push(centralBeam);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 8) * 0.15;
        for (const p of particles) {
          if (p === tower) {
            // 宝塔缓慢旋转升空
            p.rotation.y += 0.04;
            p.position.y = startPos.y + 0.5 + t * 1.5;
            p.scale.setScalar(1.2 + Math.sin(t * 4) * 0.1);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.9;
              }
            });
          } else if (p === towerGlow) {
            p.position.y = startPos.y + 1.5 + t * 1.5;
            p.scale.setScalar(pulse * 2);
            p.material.opacity = (life / maxLife) * 0.2;
          } else if (p === lightRayGroup) {
            p.position.y = startPos.y + 3 + t * 1.5;
            p.rotation.y += 0.01;
            p.children.forEach(child => {
              child.material.opacity = (life / maxLife) * 0.3 * pulse;
            });
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.6);
          } else if (p.userData.vel && p.geometry.type === 'SphereGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.sparkle += 0.08;
            const sparkleMult = 0.6 + Math.sin(p.userData.sparkle) * 0.4;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9 * sparkleMult;
          } else if (p.userData.growDelay !== undefined) {
            const delay = p.userData.growDelay;
            const effectiveT = Math.max(0, t - delay * 10);
            p.scale.y = 0.2 + effectiveT * 1.5;
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p === centralBeam) {
            p.scale.y = 0.3 + t * 1.2;
            p.material.opacity = (life / maxLife) * 0.4 * pulse;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }
}

// ========== 2. 九心海棠技能特效 ==========
// 治愈系器武魂 - 每个魂技都有完全独特的视觉表现
function spawnNineHeartBegoniaSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const pinkColors = [0xff69b4, 0xffb6c1, 0xff1493, 0xffc0cb, 0xdb7093];

  // ===== 通用：创建海棠花辅助函数 =====
  function createBegoniaFlower(petalCount, petalColor, size, withCenter) {
    const flower = new THREE.Group();
    const petalColors = Array.isArray(petalColor) ? petalColor : [petalColor];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.35 * size, 8, 8),
        new THREE.MeshBasicMaterial({
          color: petalColors[i % petalColors.length],
          transparent: true,
          opacity: 0.75
        })
      );
      petal.position.set(
        Math.cos(angle) * 0.5 * size,
        0,
        Math.sin(angle) * 0.5 * size
      );
      petal.scale.set(0.7 * size, 0.25 * size, 1.3 * size);
      petal.rotation.y = -angle;
      petal.userData.petalIndex = i;
      petal.userData.baseAngle = angle;
      flower.add(petal);
    }
    if (withCenter) {
      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 * size, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.95 })
      );
      flower.add(center);
    }
    return flower;
  }

  // ===== 第1魂技：治愈之光（单朵海棠花飘落+治愈光芒） =====
  if (idx === 0) {
    const duration = 0.8;

    // 一朵大的海棠花从上方飘落
    const flower = createBegoniaFlower(9, pinkColors, 1.0, true);
    flower.position.copy(startPos);
    flower.position.y += 3;
    flower.rotation.x = -0.3;
    game.scene.add(flower);
    particles.push(flower);

    // 治愈光柱（从花朵射向玩家）
    const healBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.4, 2.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x90ee90, transparent: true, opacity: 0.4 })
    );
    healBeam.position.copy(startPos);
    healBeam.position.y += 1.5;
    game.scene.add(healBeam);
    particles.push(healBeam);

    // 治愈光柱内芯
    const innerBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.2, 2.5, 8),
      new THREE.MeshBasicMaterial({ color: 0x98fb98, transparent: true, opacity: 0.6 })
    );
    innerBeam.position.copy(startPos);
    innerBeam.position.y += 1.5;
    game.scene.add(innerBeam);
    particles.push(innerBeam);

    // 玩家周围的治愈光环
    const healRing = _createRing(startPos, 0.5, 0x90ee90, 0.7);
    healRing.position.y = 0.1;
    healRing.userData.expandSpeed = 3;
    healRing.userData.baseOpacity = 0.7;
    game.scene.add(healRing);
    particles.push(healRing);

    // 少量粉色花瓣飘落
    for (let i = 0; i < 12; i++) {
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.09, pinkColors[Math.floor(Math.random() * 5)], 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.2;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 2.5 + Math.random() * 1.5;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        -1 - Math.random() * 1.5,
        (Math.random() - 0.5) * 0.8
      );
      p.userData.baseOpacity = 0.8;
      p.userData.rotSpeed = (Math.random() - 0.5) * 0.15;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 8) * 0.15;
        for (const p of particles) {
          if (p === flower) {
            // 花朵缓缓下落并旋转
            p.position.y = startPos.y + 3 - t * 2;
            p.rotation.y += 0.03;
            p.rotation.z = Math.sin(t * 3) * 0.1;
            p.children.forEach((child, i) => {
              if (child.userData.petalIndex !== undefined) {
                const openAngle = Math.min(1, t * 2) * 0.3;
                child.position.x = Math.cos(child.userData.baseAngle) * (0.5 + openAngle * 0.2);
                child.position.z = Math.sin(child.userData.baseAngle) * (0.5 + openAngle * 0.2);
              }
              if (child.material) child.material.opacity = (life / maxLife) * (child.userData.petalIndex !== undefined ? 0.75 : 0.95);
            });
          } else if (p === healBeam || p === innerBeam) {
            p.material.opacity = (life / maxLife) * (p === healBeam ? 0.4 : 0.6) * pulse;
            p.scale.y = 0.3 + t * 1;
          } else if (p.userData.expandSpeed) {
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.x += p.userData.rotSpeed || 0;
            p.rotation.y += p.userData.rotSpeed || 0;
            if (p.material) p.material.opacity = (life / maxLife) * 0.8;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第2魂技：花之守护（花瓣形成护盾环绕） =====
  if (idx === 1) {
    const duration = 0.9;

    // 玩家周围环绕的花瓣护盾（多层花瓣环）
    const shieldGroup = new THREE.Group();
    // 外层大花瓣环
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 6),
        new THREE.MeshBasicMaterial({ color: pinkColors[i % 5], transparent: true, opacity: 0.8 })
      );
      petal.position.set(
        Math.cos(angle) * 1.2,
        0.8 + Math.sin(i * 0.6) * 0.3,
        Math.sin(angle) * 1.2
      );
      petal.scale.set(0.6, 0.2, 1.2);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.userData.baseAngle = angle;
      petal.userData.baseY = 0.8 + Math.sin(i * 0.6) * 0.3;
      petal.userData.layer = 0;
      petal.userData.petalIdx = i;
      shieldGroup.add(petal);
    }
    // 内层小花瓣环
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffc0cb, transparent: true, opacity: 0.7 })
      );
      petal.position.set(
        Math.cos(angle) * 0.8,
        1.0 + Math.cos(i * 0.8) * 0.25,
        Math.sin(angle) * 0.8
      );
      petal.scale.set(0.5, 0.15, 1.0);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.userData.baseAngle = angle;
      petal.userData.baseY = 1.0 + Math.cos(i * 0.8) * 0.25;
      petal.userData.layer = 1;
      petal.userData.petalIdx = i;
      shieldGroup.add(petal);
    }
    shieldGroup.position.copy(startPos);
    game.scene.add(shieldGroup);
    particles.push(shieldGroup);

    // 粉色护盾光晕
    const shieldGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
    );
    shieldGlow.position.copy(startPos);
    shieldGlow.position.y += 0.9;
    game.scene.add(shieldGlow);
    particles.push(shieldGlow);

    // 地面粉色光环
    const groundRing = _createRing(startPos, 1.2, 0xff69b4, 0.6);
    groundRing.position.y = 0.05;
    groundRing.userData.baseOpacity = 0.6;
    groundRing.userData.pulse = true;
    game.scene.add(groundRing);
    particles.push(groundRing);

    // 飘散的花瓣粒子
    for (let i = 0; i < 15; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, pinkColors[Math.floor(Math.random() * 5)], 0.75);
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.0 + Math.random() * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.5 + Math.random() * 1.5;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = dist;
      p.userData.orbitSpeed = 1.5 + Math.random() * 1.5;
      p.userData.floatSpeed = 0.5 + Math.random();
      p.userData.baseOpacity = 0.75;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.9 + Math.sin(t * 6) * 0.1;
        for (const p of particles) {
          if (p === shieldGroup) {
            p.children.forEach(child => {
              const speed = child.userData.layer === 0 ? 0.025 : -0.035;
              child.userData.baseAngle += speed;
              const angle = child.userData.baseAngle;
              const wobble = Math.sin(t * 4 + child.userData.petalIdx) * 0.1;
              const radius = (child.userData.layer === 0 ? 1.2 : 0.8) + wobble;
              child.position.x = Math.cos(angle) * radius;
              child.position.z = Math.sin(angle) * radius;
              child.position.y = child.userData.baseY + Math.sin(t * 3 + child.userData.petalIdx * 0.5) * 0.1;
              child.rotation.y = -angle + Math.PI / 2;
              if (child.material) child.material.opacity = (life / maxLife) * (child.userData.layer === 0 ? 0.8 : 0.7);
            });
          } else if (p === shieldGlow) {
            p.scale.setScalar(pulse * 1.1);
            p.material.opacity = (life / maxLife) * 0.15;
          } else if (p.userData.pulse) {
            p.scale.setScalar(pulse);
            if (p.material) p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y += Math.sin(t * 4 + p.userData.orbitAngle) * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * 0.75;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第3魂技：海棠绽放（范围内海棠花盛开+群体治愈） =====
  if (idx === 2) {
    const duration = 1.0;

    // 地面上多朵海棠花依次绽放
    const flowerRingGroup = new THREE.Group();
    const flowerPositions = [];
    // 中心1朵
    flowerPositions.push(new THREE.Vector3(0, 0, 0));
    // 内圈6朵
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      flowerPositions.push(new THREE.Vector3(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5));
    }
    // 外圈12朵
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
      flowerPositions.push(new THREE.Vector3(Math.cos(angle) * 2.8, 0, Math.sin(angle) * 2.8));
    }

    flowerPositions.forEach((pos, i) => {
      const flower = createBegoniaFlower(7, pinkColors, 0.5 + Math.random() * 0.3, true);
      flower.position.copy(pos);
      flower.userData.bloomDelay = i * 0.04;
      flower.userData.flowerIndex = i;
      flower.scale.setScalar(0.01); // 初始很小，绽放时放大
      flowerRingGroup.add(flower);
    });
    flowerRingGroup.position.copy(startPos);
    flowerRingGroup.position.y += 0.05;
    game.scene.add(flowerRingGroup);
    particles.push(flowerRingGroup);

    // 群体治愈绿色光环（多圈扩散）
    for (let r = 0; r < 4; r++) {
      const ring = _createRing(startPos, 0.5 + r * 0.8, 0x7cfc00, 0.5);
      ring.position.y = 0.08;
      ring.userData.expandSpeed = 3 + r * 0.5;
      ring.userData.baseOpacity = 0.5;
      ring.userData.delay = r * 0.06;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 绿色治愈粒子从花朵中升起
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.07, 0x90ee90, 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 2.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      p.userData.baseOpacity = 0.85;
      p.userData.riseDelay = Math.random() * 0.3;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === flowerRingGroup) {
            p.children.forEach(flower => {
              const delay = flower.userData.bloomDelay;
              const effectiveT = Math.max(0, Math.min(1, (t - delay) * 3));
              if (effectiveT > 0) {
                // 绽放效果：从小到大，花瓣展开
                flower.scale.setScalar(effectiveT);
                flower.rotation.y += 0.01 + flower.userData.flowerIndex * 0.002;
                flower.position.y = Math.sin(effectiveT * Math.PI) * 0.2;
                flower.children.forEach(child => {
                  if (child.material) child.material.opacity = (life / maxLife) * 0.75;
                });
              }
            });
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.4;
          } else if (p.userData.vel) {
            if (t > p.userData.riseDelay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.material) p.material.opacity = (life / maxLife) * 0.85;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第4魂技：生命祝福（绿色生命能量从地面涌出） =====
  if (idx === 3) {
    const duration = 1.0;

    // 地面生命能量阵（六边形图案）
    const runeGroup = new THREE.Group();
    // 外圈六边形
    const hexOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 0.02, 6),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.5 })
    );
    hexOuter.position.y = 0.01;
    runeGroup.add(hexOuter);
    // 内圈六边形（反向）
    const hexInner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.02, 6),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.6 })
    );
    hexInner.position.y = 0.02;
    hexInner.rotation.y = Math.PI / 6;
    runeGroup.add(hexInner);
    // 中心圆
    const centerCircle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.03, 16),
      new THREE.MeshBasicMaterial({ color: 0x98fb98, transparent: true, opacity: 0.7 })
    );
    centerCircle.position.y = 0.03;
    runeGroup.add(centerCircle);
    runeGroup.position.copy(startPos);
    game.scene.add(runeGroup);
    particles.push(runeGroup);

    // 多道绿色生命光柱从地面涌出
    const beamGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const dist = i === 0 ? 0 : 0.8 + Math.random() * 0.6;
      const beamHeight = 2 + Math.random() * 1.5;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1 + Math.random() * 0.08, 0.05, beamHeight, 8),
        new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.6 })
      );
      beam.position.set(
        Math.cos(angle) * dist,
        beamHeight / 2,
        Math.sin(angle) * dist
      );
      beam.userData.beamIndex = i;
      beam.userData.baseHeight = beamHeight;
      beamGroup.add(beam);
    }
    beamGroup.position.copy(startPos);
    game.scene.add(beamGroup);
    particles.push(beamGroup);

    // 绿色生命粒子向上飘散
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, 0x90ee90, 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.3;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        1.5 + Math.random() * 2.5,
        (Math.random() - 0.5) * 0.8
      );
      p.userData.baseOpacity = 0.85;
      p.userData.sparkle = Math.random() * Math.PI * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 生命光环扩散
    const lifeRing = _createRing(startPos, 0.3, 0x32cd32, 0.7);
    lifeRing.position.y = 0.05;
    lifeRing.userData.expandSpeed = 5;
    lifeRing.userData.baseOpacity = 0.7;
    game.scene.add(lifeRing);
    particles.push(lifeRing);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 7) * 0.2;
        for (const p of particles) {
          if (p === runeGroup) {
            p.rotation.y += 0.008;
            p.children.forEach((child, i) => {
              if (i === 1) child.rotation.y += 0.015; // 内圈反向旋转
              if (child.material) child.material.opacity = (life / maxLife) * [0.5, 0.6, 0.7][i] * pulse;
            });
          } else if (p === beamGroup) {
            p.children.forEach(beam => {
              const growT = Math.min(1, t * 2 - beam.userData.beamIndex * 0.05);
              if (growT > 0) {
                beam.scale.y = growT;
                beam.material.opacity = (life / maxLife) * 0.6 * (0.7 + Math.sin(t * 5 + beam.userData.beamIndex) * 0.3);
              } else {
                beam.scale.y = 0;
              }
            });
          } else if (p.userData.expandSpeed) {
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.sparkle += 0.1;
            const sparkleMult = 0.7 + Math.sin(p.userData.sparkle) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * 0.85 * sparkleMult;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第5魂技：花毒（毒花瓣飞射攻击敌人） =====
  if (idx === 4) {
    const duration = 0.7;
    const poisonColors = [0x9932cc, 0x8b008b, 0x9400d3, 0x4b0082, 0x663399];

    // 毒花瓣向前方飞射（大量花瓣弹幕）
    for (let i = 0; i < 35; i++) {
      const petal = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.85 })
      );
      petal.scale.set(0.7, 0.2, 1.2);
      petal.position.copy(startPos);
      petal.position.y += 0.8 + Math.random() * 0.5;

      const spreadAngle = (Math.random() - 0.5) * 0.8;
      const spreadY = (Math.random() - 0.5) * 0.5;
      const flyDir = dir.clone();
      flyDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
      flyDir.y += spreadY;
      flyDir.normalize();

      const speed = 6 + Math.random() * 6;
      petal.userData.vel = flyDir.multiplyScalar(speed);
      petal.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      petal.userData.baseOpacity = 0.85;
      game.scene.add(petal);
      particles.push(petal);
    }

    // 毒雾尾迹（紫色粒子跟随）
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.1 + Math.random() * 0.15, poisonColors[Math.floor(Math.random() * 5)], 0.5);
      p.position.y += 0.5 + Math.random() * 0.8;
      const spreadAngle = (Math.random() - 0.5) * 0.6;
      const flyDir = dir.clone();
      flyDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle);
      flyDir.y += (Math.random() - 0.5) * 0.3;
      flyDir.normalize();
      p.userData.vel = flyDir.multiplyScalar(3 + Math.random() * 3);
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 发射点的紫色毒光
    const castGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x9932cc, transparent: true, opacity: 0.5 })
    );
    castGlow.position.copy(startPos);
    castGlow.position.y += 1;
    game.scene.add(castGlow);
    particles.push(castGlow);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === castGlow) {
            const glowScale = t < 0.2 ? (t / 0.2) : (1 - (t - 0.2) / 0.8 * 0.7);
            p.scale.setScalar(glowScale);
            p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.rotSpeed !== undefined && p.geometry.type === 'SphereGeometry') {
            // 毒花瓣飞射
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
            if (p.material) p.material.opacity = (life / maxLife) * 0.85;
          } else if (p.userData.vel && p.userData.grow) {
            // 毒雾
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 2);
            p.userData.vel.multiplyScalar(0.97); // 减速
            if (p.material) p.material.opacity = (life / maxLife) * 0.4;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第6魂技：海棠领域（巨大海棠花绽放+领域内持续治愈+毒伤） =====
  if (idx === 5) {
    const duration = 1.2;
    const domainColors = [0xff69b4, 0x90ee90, 0xffb6c1, 0x7cfc00];

    // 巨型海棠花在地面绽放（俯视图，超大）
    const domainFlower = createBegoniaFlower(9, pinkColors, 4.0, true);
    domainFlower.position.copy(startPos);
    domainFlower.position.y += 0.02;
    domainFlower.rotation.x = -Math.PI / 2; // 平放在地面
    domainFlower.scale.setScalar(0.1); // 初始很小
    game.scene.add(domainFlower);
    particles.push(domainFlower);

    // 领域范围地面光环（粉色+绿色交替）
    for (let r = 0; r < 5; r++) {
      const ringColor = r % 2 === 0 ? 0xff69b4 : 0x7cfc00;
      const ring = _createRing(startPos, 1 + r * 0.8, ringColor, 0.5);
      ring.position.y = 0.05 + r * 0.01;
      ring.userData.expandSpeed = 2.5 + r * 0.3;
      ring.userData.baseOpacity = 0.5;
      ring.userData.delay = r * 0.05;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 领域内飞舞的花瓣（粉色治愈花瓣+紫色毒花瓣混合）
    for (let i = 0; i < 50; i++) {
      const isPoison = Math.random() < 0.3;
      const pColor = isPoison
        ? [0x9932cc, 0x8b008b, 0x9400d3][Math.floor(Math.random() * 3)]
        : pinkColors[Math.floor(Math.random() * 5)];
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.1, pColor, 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 3.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.3 + Math.random() * 2;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = dist;
      p.userData.orbitSpeed = (isPoison ? -1 : 1) * (0.8 + Math.random() * 1.2);
      p.userData.floatY = 0.3 + Math.random() * 2;
      p.userData.floatSpeed = 0.5 + Math.random();
      p.userData.baseOpacity = 0.8;
      p.userData.isPoison = isPoison;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心的领域核心（粉绿交替的光球）
    const coreOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.6 })
    );
    coreOrb.position.copy(startPos);
    coreOrb.position.y += 1.5;
    game.scene.add(coreOrb);
    particles.push(coreOrb);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 5) * 0.15;
        for (const p of particles) {
          if (p === domainFlower) {
            // 花朵绽放
            const bloomT = Math.min(1, t * 2);
            p.scale.setScalar(bloomT);
            p.rotation.z += 0.008;
            p.children.forEach(child => {
              if (child.userData.petalIndex !== undefined) {
                // 花瓣展开效果
                const openT = Math.min(1, bloomT * 1.5);
                const petalDist = 0.5 * 4.0 + openT * 0.3 * 4.0;
                child.position.x = Math.cos(child.userData.baseAngle) * petalDist;
                child.position.z = Math.sin(child.userData.baseAngle) * petalDist;
              }
              if (child.material) child.material.opacity = (life / maxLife) * 0.7;
            });
          } else if (p === coreOrb) {
            p.scale.setScalar(pulse * 1.2);
            // 粉绿交替
            const colorMix = (Math.sin(t * 4) + 1) / 2;
            p.material.color.setHex(colorMix > 0.5 ? 0xff69b4 : 0x7cfc00);
            p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.4;
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y = startPos.y + p.userData.floatY + Math.sin(t * p.userData.floatSpeed * 3 + p.userData.orbitAngle) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * 0.8;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第7魂技：九心真身（九心海棠完全绽放，九瓣花旋转） =====
  if (idx === 6) {
    const duration = 1.1;

    // 巨大的九瓣海棠花（完全绽放，悬浮在玩家上方）
    const nineHeartFlower = createBegoniaFlower(9, pinkColors, 2.0, true);
    nineHeartFlower.position.copy(startPos);
    nineHeartFlower.position.y += 2.5;
    game.scene.add(nineHeartFlower);
    particles.push(nineHeartFlower);

    // 花心金色强光
    const centerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.7 })
    );
    centerGlow.position.copy(startPos);
    centerGlow.position.y += 2.5;
    game.scene.add(centerGlow);
    particles.push(centerGlow);

    // 九道金色光束从花心射向九个花瓣方向
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const beamDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const beam = _createBeam(
        new THREE.Vector3(startPos.x, startPos.y + 2.5, startPos.z),
        beamDir,
        1.5,
        0xffd700,
        0.6
      );
      beam.userData.beamIndex = i;
      beam.userData.baseAngle = angle;
      game.scene.add(beam);
      particles.push(beam);
    }

    // 花瓣脉动光效（九圈光环从中心向外扩散）
    for (let r = 0; r < 9; r++) {
      const ring = _createRing(startPos, 0.3 + r * 0.3, pinkColors[r % 5], 0.5);
      ring.position.y = 2.5;
      ring.userData.expandSpeed = 2 + r * 0.3;
      ring.userData.baseOpacity = 0.5;
      ring.userData.delay = r * 0.04;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 大量粉色花瓣粒子环绕旋转
    for (let i = 0; i < 45; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, pinkColors[Math.floor(Math.random() * 5)], 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = 1 + Math.random() * 2.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 1.5 + Math.random() * 2;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = dist;
      p.userData.orbitSpeed = 1.5 + Math.random() * 2;
      p.userData.baseY = 1.5 + Math.random() * 2;
      p.userData.floatSpeed = 0.8 + Math.random() * 1.2;
      p.userData.baseOpacity = 0.85;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 6) * 0.2;
        for (const p of particles) {
          if (p === nineHeartFlower) {
            p.rotation.y += 0.03;
            p.position.y = startPos.y + 2.5 + Math.sin(t * 3) * 0.2;
            p.children.forEach(child => {
              if (child.userData.petalIndex !== undefined) {
                // 花瓣呼吸式开合
                const breath = 1 + Math.sin(t * 4 + child.userData.petalIndex * 0.5) * 0.1;
                child.position.x = Math.cos(child.userData.baseAngle) * 0.5 * 2.0 * breath;
                child.position.z = Math.sin(child.userData.baseAngle) * 0.5 * 2.0 * breath;
              }
              if (child.material) child.material.opacity = (life / maxLife) * 0.75;
            });
          } else if (p === centerGlow) {
            p.scale.setScalar(pulse * 1.3);
            p.material.opacity = (life / maxLife) * 0.7;
          } else if (p.userData.beamIndex !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
            p.rotation.y += 0.03; // 光束随花朵旋转
            p.material.opacity = (life / maxLife) * 0.6 * pulse;
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.4;
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
            p.position.y = p.userData.baseY + Math.sin(t * p.userData.floatSpeed * 2 + p.userData.orbitAngle) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * 0.85;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第8魂技：生死人肉白骨（超强治愈之光，生命之泉喷涌） =====
  if (idx === 7) {
    const duration = 1.3;

    // 巨大的绿色治愈光柱冲天而起
    const mainBeamOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.3 })
    );
    mainBeamOuter.position.copy(startPos);
    mainBeamOuter.position.y += 3;
    game.scene.add(mainBeamOuter);
    particles.push(mainBeamOuter);

    const mainBeamInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.6, 6, 12),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.5 })
    );
    mainBeamInner.position.copy(startPos);
    mainBeamInner.position.y += 3;
    game.scene.add(mainBeamInner);
    particles.push(mainBeamInner);

    const mainBeamCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, 6, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
    );
    mainBeamCore.position.copy(startPos);
    mainBeamCore.position.y += 3;
    game.scene.add(mainBeamCore);
    particles.push(mainBeamCore);

    // 生命之泉喷涌效果（大量绿色粒子从地面向上喷发）
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.1, 0x90ee90, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.3;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (0.5 + Math.random()),
        4 + Math.random() * 5,
        Math.sin(angle) * (0.5 + Math.random())
      );
      p.userData.baseOpacity = 0.9;
      p.userData.sparkle = Math.random() * Math.PI * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面生命光环（多圈强力扩散）
    for (let r = 0; r < 6; r++) {
      const ringColor = r % 2 === 0 ? 0x32cd32 : 0x7cfc00;
      const ring = _createRing(startPos, 0.4 + r * 0.5, ringColor, 0.6);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 4 + r * 0.5;
      ring.userData.baseOpacity = 0.6;
      ring.userData.delay = r * 0.04;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 治愈花瓣在光柱中飞舞
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, pinkColors[Math.floor(Math.random() * 5)], 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.6;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 1;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 1
      );
      p.userData.baseOpacity = 0.8;
      p.userData.rotSpeed = (Math.random() - 0.5) * 0.2;
      game.scene.add(p);
      particles.push(p);
    }

    // 顶部光球
    const topOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x98fb98, transparent: true, opacity: 0.6 })
    );
    topOrb.position.copy(startPos);
    topOrb.position.y += 5.5;
    game.scene.add(topOrb);
    particles.push(topOrb);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 8) * 0.2;
        for (const p of particles) {
          if (p === mainBeamOuter || p === mainBeamInner || p === mainBeamCore) {
            p.scale.y = 0.2 + t * 1.2;
            const opacities = { [mainBeamOuter]: 0.3, [mainBeamInner]: 0.5, [mainBeamCore]: 0.7 };
            p.material.opacity = (life / maxLife) * opacities[p] * pulse;
            p.rotation.y += 0.01;
          } else if (p === topOrb) {
            p.scale.setScalar(pulse * 1.3);
            p.position.y = startPos.y + 5.5 - (1 - Math.min(1, t * 2)) * 3;
            p.material.opacity = (life / maxLife) * 0.6;
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.vel && p.userData.sparkle !== undefined) {
            // 生命喷泉粒子
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= 8 * 0.02; // 重力下落
            p.userData.sparkle += 0.1;
            const sparkleMult = 0.7 + Math.sin(p.userData.sparkle) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * 0.9 * sparkleMult;
          } else if (p.userData.vel && p.userData.rotSpeed !== undefined) {
            // 花瓣
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.y += p.userData.rotSpeed * 0.5;
            if (p.material) p.material.opacity = (life / maxLife) * 0.8;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第9魂技：海棠奥义（天地间海棠花瓣飞舞，全体满血复活特效） =====
  if (idx === 8) {
    const duration = 1.5;

    // 漫天海棠花瓣飞舞（大量粒子从天空降落）
    for (let i = 0; i < 100; i++) {
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.12, pinkColors[Math.floor(Math.random() * 5)], 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.9;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 5 + Math.random() * 4;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        -1.5 - Math.random() * 2,
        (Math.random() - 0.5) * 1.5
      );
      p.userData.baseOpacity = 0.85;
      p.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2
      );
      p.userData.swayPhase = Math.random() * Math.PI * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 巨大的复活光柱（金色+粉色，从地面到天空）
    const resBeamOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.8, 8, 20),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.25 })
    );
    resBeamOuter.position.copy(startPos);
    resBeamOuter.position.y += 4;
    game.scene.add(resBeamOuter);
    particles.push(resBeamOuter);

    const resBeamMid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.9, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.4 })
    );
    resBeamMid.position.copy(startPos);
    resBeamMid.position.y += 4;
    game.scene.add(resBeamMid);
    particles.push(resBeamMid);

    const resBeamInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.4, 8, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    resBeamInner.position.copy(startPos);
    resBeamInner.position.y += 4;
    game.scene.add(resBeamInner);
    particles.push(resBeamInner);

    // 地面海棠花盛开组成的复活阵（多圈花朵）
    const flowerRingGroup = new THREE.Group();
    for (let ring = 0; ring < 4; ring++) {
      const petalCount = [1, 8, 16, 24][ring];
      const ringRadius = ring === 0 ? 0 : 1 + ring * 1.2;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2 + ring * 0.2;
        const flower = createBegoniaFlower(7, pinkColors, 0.4 + ring * 0.1, ring === 0);
        flower.position.set(
          Math.cos(angle) * ringRadius,
          0,
          Math.sin(angle) * ringRadius
        );
        flower.rotation.x = -Math.PI / 2;
        flower.userData.bloomDelay = ring * 0.08 + i * 0.01;
        flower.scale.setScalar(0.01);
        flowerRingGroup.add(flower);
      }
    }
    flowerRingGroup.position.copy(startPos);
    flowerRingGroup.position.y += 0.02;
    game.scene.add(flowerRingGroup);
    particles.push(flowerRingGroup);

    // 多层复活光环（金色+粉色交替）
    for (let r = 0; r < 8; r++) {
      const ringColor = r % 2 === 0 ? 0xffd700 : 0xff69b4;
      const ring = _createRing(startPos, 0.5 + r * 0.6, ringColor, 0.6);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 3.5 + r * 0.4;
      ring.userData.baseOpacity = 0.6;
      ring.userData.delay = r * 0.05;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 空中的巨大海棠花幻影
    const skyFlower = createBegoniaFlower(9, pinkColors, 3.0, true);
    skyFlower.position.copy(startPos);
    skyFlower.position.y += 5;
    skyFlower.scale.setScalar(0.1);
    game.scene.add(skyFlower);
    particles.push(skyFlower);

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.85 + Math.sin(t * 6) * 0.15;
        for (const p of particles) {
          if (p === resBeamOuter || p === resBeamMid || p === resBeamInner) {
            p.scale.y = 0.2 + t * 1.1;
            const opacities = { [resBeamOuter]: 0.25, [resBeamMid]: 0.4, [resBeamInner]: 0.6 };
            p.material.opacity = (life / maxLife) * opacities[p] * pulse;
            p.rotation.y += 0.008;
          } else if (p === skyFlower) {
            const bloomT = Math.min(1, t * 1.5);
            p.scale.setScalar(bloomT);
            p.rotation.y += 0.015;
            p.position.y = startPos.y + 5 + Math.sin(t * 2) * 0.3;
            p.children.forEach(child => {
              if (child.material) child.material.opacity = (life / maxLife) * 0.7;
            });
          } else if (p === flowerRingGroup) {
            p.rotation.y += 0.005;
            p.children.forEach(flower => {
              const delay = flower.userData.bloomDelay;
              const effectiveT = Math.max(0, Math.min(1, (t - delay) * 2.5));
              if (effectiveT > 0) {
                flower.scale.setScalar(effectiveT);
                flower.children.forEach(child => {
                  if (child.material) child.material.opacity = (life / maxLife) * 0.75;
                });
              }
            });
          } else if (p.userData.expandSpeed) {
            const delay = p.userData.delay || 0;
            const effectiveT = Math.max(0, t - delay * 10);
            const expandDist = p.userData.expandSpeed * effectiveT;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * 0.5;
          } else if (p.userData.rotSpeed !== undefined && p.userData.swayPhase !== undefined) {
            // 漫天花瓣飞舞
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.swayPhase += 0.05;
            p.position.x += Math.sin(p.userData.swayPhase) * 0.03;
            p.position.z += Math.cos(p.userData.swayPhase * 0.7) * 0.02;
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
            if (p.material) p.material.opacity = (life / maxLife) * 0.85;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }
}

// ========== 3. 蓝电霸王龙技能特效 ==========
// 强攻系兽武魂 - 雷电 - 每个魂技都有完全独特的视觉表现
function spawnBlueLightningDragonSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const thunderColors = [0x4169e1, 0x00bfff, 0x1e90ff, 0x87ceeb, 0xffffff, 0x0066ff];

  // 工具：创建闪电链（从起点到终点的折线闪电）
  function createLightningBolt(fromPos, toPos, color, thickness) {
    const boltGroup = new THREE.Group();
    const segments = 8;
    let current = fromPos.clone();
    const totalDir = toPos.clone().sub(fromPos);
    const totalLen = totalDir.length();
    const segLen = totalLen / segments;

    for (let i = 0; i < segments; i++) {
      const t = (i + 1) / segments;
      const target = fromPos.clone().lerp(toPos, t);
      // 添加随机偏移，越往中间偏移越大
      const offsetMag = Math.sin(t * Math.PI) * totalLen * 0.1;
      target.x += (Math.random() - 0.5) * offsetMag;
      target.y += (Math.random() - 0.5) * offsetMag * 0.6;
      target.z += (Math.random() - 0.5) * offsetMag;

      const segDir = target.clone().sub(current).normalize();
      const seg = _createBeam(current, segDir, current.distanceTo(target), color, 0.95);
      // 调整粗细
      if (thickness) {
        seg.scale.x = thickness;
        seg.scale.z = thickness;
      }
      boltGroup.add(seg);
      current = target.clone();
    }
    return boltGroup;
  }

  // 工具：创建龙爪虚影
  function createDragonClaw(scale) {
    const clawGroup = new THREE.Group();
    // 手掌
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.8 * scale, 0.3 * scale, 1.0 * scale),
      new THREE.MeshBasicMaterial({ color: 0x4169e1, transparent: true, opacity: 0.6 })
    );
    palm.position.z = 0.2 * scale;
    clawGroup.add(palm);
    // 五根龙爪指
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.3;
      const finger = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 * scale, 0.9 * scale, 6),
        new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.8 })
      );
      finger.position.set(Math.sin(angle) * 0.35 * scale, 0, 0.7 * scale);
      finger.rotation.x = Math.PI / 2 + 0.2;
      finger.rotation.z = -angle * 0.5;
      clawGroup.add(finger);
      // 爪尖
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.04 * scale, 0.3 * scale, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
      );
      tip.position.set(Math.sin(angle) * 0.35 * scale, 0, 1.2 * scale);
      tip.rotation.x = Math.PI / 2 + 0.2;
      tip.rotation.z = -angle * 0.5;
      clawGroup.add(tip);
    }
    // 电弧环绕
    for (let i = 0; i < 6; i++) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 * scale, 0.03 * scale, 6, 16, Math.PI + Math.random()),
        new THREE.MeshBasicMaterial({ color: thunderColors[i % 6], transparent: true, opacity: 0.7 })
      );
      arc.position.set((Math.random() - 0.5) * 0.5 * scale, (Math.random() - 0.5) * 0.3 * scale, (Math.random() - 0.5) * 0.5 * scale);
      arc.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      clawGroup.add(arc);
    }
    return clawGroup;
  }

  // 工具：创建龙头虚影
  function createDragonHead(scale) {
    const headGroup = new THREE.Group();
    // 龙头主体
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.8 * scale, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x4169e1, transparent: true, opacity: 0.5 })
    );
    head.scale.set(1, 0.7, 1.4);
    headGroup.add(head);
    // 龙角（两根）
    for (let i = 0; i < 2; i++) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.12 * scale, 0.8 * scale, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      horn.position.set(i === 0 ? -0.3 * scale : 0.3 * scale, 0.6 * scale, 0.4 * scale);
      horn.rotation.x = -0.4;
      headGroup.add(horn);
    }
    // 龙眼（发光）
    for (let i = 0; i < 2; i++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 * scale, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 })
      );
      eye.position.set(i === 0 ? -0.25 * scale : 0.25 * scale, 0.1 * scale, 0.65 * scale);
      headGroup.add(eye);
    }
    // 龙嘴
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.15 * scale, 0.6 * scale),
      new THREE.MeshBasicMaterial({ color: 0x1e90ff, transparent: true, opacity: 0.7 })
    );
    jaw.position.y = -0.35 * scale;
    jaw.position.z = 0.5 * scale;
    headGroup.add(jaw);
    // 龙牙
    for (let i = 0; i < 4; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.04 * scale, 0.15 * scale, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      tooth.position.set((i - 1.5) * 0.12 * scale, -0.45 * scale, 0.7 * scale);
      tooth.rotation.x = Math.PI;
      headGroup.add(tooth);
    }
    return headGroup;
  }

  // ===== 第1魂技：雷霆龙爪 - 前方出现巨大龙爪虚影，带着电弧抓击 =====
  if (idx === 0) {
    const duration = 0.6;
    // 巨大龙爪
    const claw = createDragonClaw(1.5);
    claw.position.copy(startPos);
    claw.position.y += 0.8;
    claw.lookAt(startPos.clone().add(dir));
    claw.userData.startPos = claw.position.clone();
    claw.userData.targetPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.7));
    game.scene.add(claw);
    particles.push(claw);

    // 抓击轨迹电弧
    for (let i = 0; i < 5; i++) {
      const arcStart = startPos.clone();
      arcStart.y += 0.3 + i * 0.2;
      arcStart.x += (Math.random() - 0.5) * 0.5;
      const arcEnd = startPos.clone().add(dir.clone().multiplyScalar(range * 0.6));
      arcEnd.y += 0.3 + i * 0.2;
      arcEnd.x += (Math.random() - 0.5) * 0.5;
      const bolt = createLightningBolt(arcStart, arcEnd, thunderColors[i % 6], 0.6);
      game.scene.add(bolt);
      particles.push(bolt);
    }

    // 地面雷击点
    const impactPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.7));
    for (let i = 0; i < 3; i++) {
      const ring = _createRing(impactPos, 0.3 + i * 0.5, thunderColors[i], 0.7);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 6 + i * 2;
      ring.userData.baseOpacity = 0.7;
      ring.userData.delay = i * 0.1;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 电弧粒子
    for (let i = 0; i < 20; i++) {
      const p = _createParticle(impactPos, 0.06 + Math.random() * 0.08, thunderColors[Math.floor(Math.random() * 6)], 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.5;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (1 + Math.random() * 2),
        2 + Math.random() * 3,
        Math.sin(angle) * (1 + Math.random() * 2)
      );
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.2 ? 1 : 0.4;
        for (const p of particles) {
          if (p === claw) {
            // 龙爪向前抓击
            const clawT = Math.min(t * 2, 1);
            p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, clawT);
            const clawScale = 0.8 + Math.sin(clawT * Math.PI) * 0.5;
            p.scale.setScalar(clawScale);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8 * flicker;
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            if (t > (p.userData.delay || 0)) {
              const localT = (t - (p.userData.delay || 0)) / (1 - (p.userData.delay || 0));
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.7) * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * 0.9 * flicker;
          } else {
            // 闪电链
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.9 * flicker;
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第2魂技：雷霆万钧 - 天空落下多道雷电，轰击地面 =====
  if (idx === 1) {
    const duration = 0.8;
    const boltCount = 8;
    const skyHeight = 15;

    // 多道天雷从天空落下
    for (let b = 0; b < boltCount; b++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.8;
      const strikeX = startPos.x + Math.cos(angle) * dist;
      const strikeZ = startPos.z + Math.sin(angle) * dist;
      const skyPos = new THREE.Vector3(strikeX, skyHeight, strikeZ);
      const groundPos = new THREE.Vector3(strikeX, 0.1, strikeZ);

      // 延迟不同时间落下
      const delay = b * 0.08;
      const bolt = createLightningBolt(skyPos, groundPos, thunderColors[b % 6], 1.2);
      bolt.userData.delay = delay;
      bolt.userData.active = false;
      game.scene.add(bolt);
      particles.push(bolt);

      // 地面雷击环
      const ring = _createRing(groundPos, 0.2, 0x00bfff, 0.8);
      ring.userData.delay = delay;
      ring.userData.expandSpeed = 8;
      ring.userData.baseOpacity = 0.8;
      ring.userData.active = false;
      game.scene.add(ring);
      particles.push(ring);

      // 溅射粒子
      for (let i = 0; i < 6; i++) {
        const p = _createParticle(groundPos, 0.05 + Math.random() * 0.07, thunderColors[Math.floor(Math.random() * 6)], 0.9);
        const pAngle = Math.random() * Math.PI * 2;
        p.position.x += Math.cos(pAngle) * 0.2;
        p.position.z += Math.sin(pAngle) * 0.2;
        p.userData.vel = new THREE.Vector3(
          Math.cos(pAngle) * (2 + Math.random() * 3),
          3 + Math.random() * 4,
          Math.sin(pAngle) * (2 + Math.random() * 3)
        );
        p.userData.gravity = 15;
        p.userData.baseOpacity = 0.9;
        p.userData.delay = delay;
        p.userData.active = false;
        game.scene.add(p);
        particles.push(p);
      }
    }

    // 天空乌云效果
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + Math.random() * 0.6, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x2a2a5a, transparent: true, opacity: 0.5 })
      );
      const cAngle = Math.random() * Math.PI * 2;
      const cDist = Math.random() * range * 0.9;
      cloud.position.set(Math.cos(cAngle) * cDist, skyHeight, Math.sin(cAngle) * cDist);
      cloud.scale.y = 0.4;
      cloudGroup.add(cloud);
    }
    game.scene.add(cloudGroup);
    particles.push(cloudGroup);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.3 ? 1 : 0.5;
        for (const p of particles) {
          if (p === cloudGroup) {
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = Math.max(0, Math.min(0.6, (life / maxLife) * 0.6));
              }
            });
          } else if (p.userData.delay !== undefined) {
            if (elapsed >= p.userData.delay && !p.userData.active) {
              p.userData.active = true;
              p.userData.startTime = elapsed;
            }
            if (p.userData.active) {
              const localT = (elapsed - p.userData.startTime) / (maxLife - p.userData.delay);
              const localLife = 1 - localT;
              if (p.userData.expandSpeed !== undefined) {
                const expandDist = p.userData.expandSpeed * localT;
                p.scale.setScalar(1 + expandDist);
                if (p.material) p.material.opacity = localLife * (p.userData.baseOpacity || 0.8);
              } else if (p.userData.vel) {
                p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
                if (p.userData.gravity) {
                  p.userData.vel.y -= p.userData.gravity * 0.02;
                }
                if (p.material) p.material.opacity = localLife * (p.userData.baseOpacity || 0.9);
              } else {
                // 闪电链
                p.traverse(child => {
                  if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = localLife * 0.9 * flicker;
                  }
                });
              }
            } else {
              // 未激活时隐藏
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
              if (p.material && p.material.opacity !== undefined) p.material.opacity = 0;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第3魂技：雷霆之怒 - 全身雷电环绕，攻击力提升的爆发特效 =====
  if (idx === 2) {
    const duration = 1.0;

    // 核心爆发光球
    const coreOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.6 })
    );
    coreOrb.position.copy(startPos);
    coreOrb.position.y += 1;
    game.scene.add(coreOrb);
    particles.push(coreOrb);

    // 多层环绕电弧环（不同角度）
    const arcRings = [];
    for (let r = 0; r < 5; r++) {
      const ringGroup = new THREE.Group();
      const ringGeom = new THREE.TorusGeometry(0.8 + r * 0.25, 0.06, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: thunderColors[r % 6], transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ringGroup.add(ring);
      // 不同的旋转轴
      ringGroup.rotation.x = r * 0.4;
      ringGroup.rotation.y = r * 0.6;
      ringGroup.rotation.z = r * 0.2;
      ringGroup.position.copy(startPos);
      ringGroup.position.y += 1;
      ringGroup.userData.rotSpeed = new THREE.Vector3(0.03 + r * 0.01, 0.05 + r * 0.02, 0.02 + r * 0.01);
      game.scene.add(ringGroup);
      particles.push(ringGroup);
      arcRings.push(ringGroup);
    }

    // 垂直闪电柱
    const topPos = startPos.clone();
    topPos.y += 3;
    const bottomPos = startPos.clone();
    bottomPos.y = 0;
    const pillarBolt = createLightningBolt(topPos, bottomPos, 0xffffff, 1.5);
    game.scene.add(pillarBolt);
    particles.push(pillarBolt);

    // 身体周围飞舞的电弧粒子
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, thunderColors[Math.floor(Math.random() * 6)], 0.95);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.3 + Math.random() * 1.5;
      p.userData.orbitRadius = dist;
      p.userData.orbitAngle = angle;
      p.userData.orbitSpeed = (2 + Math.random() * 4) * (Math.random() > 0.5 ? 1 : -1);
      p.userData.baseY = p.position.y;
      p.userData.bobSpeed = 2 + Math.random() * 3;
      p.userData.bobAmp = 0.2 + Math.random() * 0.3;
      p.userData.baseOpacity = 0.95;
      game.scene.add(p);
      particles.push(p);
    }

    // 爆发冲击波环
    for (let i = 0; i < 3; i++) {
      const ring = _createRing(startPos, 0.3 + i * 0.2, thunderColors[i], 0.8);
      ring.position.y = 0.5 + i * 0.3;
      ring.userData.expandSpeed = 5 + i * 2;
      ring.userData.baseOpacity = 0.8;
      ring.userData.delay = i * 0.15;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.25 ? 1 : 0.5;
        const pulse = 0.85 + Math.sin(t * 20) * 0.15;
        for (const p of particles) {
          if (p === coreOrb) {
            const coreScale = 0.5 + Math.sin(t * Math.PI) * 0.8;
            p.scale.setScalar(coreScale * pulse);
            p.material.opacity = (life / maxLife) * 0.6 * pulse;
          } else if (p.userData.rotSpeed) {
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
            p.scale.setScalar(1 + t * 0.3);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7 * flicker;
              }
            });
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            const expandR = p.userData.orbitRadius * (1 + t * 0.3);
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * expandR;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * expandR;
            p.position.y = p.userData.baseY + Math.sin(elapsed * p.userData.bobSpeed) * p.userData.bobAmp;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity * flicker;
          } else if (p.userData.expandSpeed !== undefined) {
            if (t > (p.userData.delay || 0)) {
              const localT = (t - (p.userData.delay || 0)) / (1 - (p.userData.delay || 0));
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.8);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else {
            // 闪电柱
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.9 * flicker;
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第4魂技：雷暴 - 四周雷暴席卷，环形闪电爆发 =====
  if (idx === 3) {
    const duration = 1.0;

    // 环形闪电墙（多圈向外扩散）
    const ringCount = 4;
    for (let r = 0; r < ringCount; r++) {
      const ringGroup = new THREE.Group();
      // 环上分布多个闪电段
      const segments = 16 + r * 4;
      for (let s = 0; s < segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const radius = 1 + r * 0.8;
        const segStart = new THREE.Vector3(
          startPos.x + Math.cos(angle) * radius,
          0.3 + r * 0.3,
          startPos.z + Math.sin(angle) * radius
        );
        const segEnd = new THREE.Vector3(
          startPos.x + Math.cos(angle + 0.1) * radius,
          0.5 + r * 0.3,
          startPos.z + Math.sin(angle + 0.1) * radius
        );
        const bolt = createLightningBolt(segStart, segEnd, thunderColors[(r + s) % 6], 0.8);
        ringGroup.add(bolt);
      }
      ringGroup.userData.expandSpeed = 3 + r * 1.5;
      ringGroup.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.02 + r * 0.01);
      ringGroup.userData.baseOpacity = 0.8;
      ringGroup.position.y = 0;
      game.scene.add(ringGroup);
      particles.push(ringGroup);
    }

    // 中心向上的雷暴柱
    const stormTop = startPos.clone();
    stormTop.y += 5;
    const stormBottom = startPos.clone();
    stormBottom.y = 0;
    const stormPillar = createLightningBolt(stormBottom, stormTop, 0xffffff, 2);
    game.scene.add(stormPillar);
    particles.push(stormPillar);

    // 雷暴粒子（向外扩散后上升）
    for (let i = 0; i < 40; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.08, thunderColors[Math.floor(Math.random() * 6)], 0.9);
      const angle = Math.random() * Math.PI * 2;
      p.position.x += Math.cos(angle) * 0.3;
      p.position.z += Math.sin(angle) * 0.3;
      p.position.y += 0.2 + Math.random() * 0.5;
      p.userData.angle = angle;
      p.userData.outwardSpeed = 3 + Math.random() * 4;
      p.userData.riseSpeed = 2 + Math.random() * 3;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面电弧裂纹（放射状）
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const crackStart = new THREE.Vector3(
        startPos.x + Math.cos(angle) * 0.3,
        0.02,
        startPos.z + Math.sin(angle) * 0.3
      );
      const crackEnd = new THREE.Vector3(
        startPos.x + Math.cos(angle) * range * 0.7,
        0.02,
        startPos.z + Math.sin(angle) * range * 0.7
      );
      const crack = createLightningBolt(crackStart, crackEnd, 0x00bfff, 0.5);
      crack.userData.baseOpacity = 0.7;
      game.scene.add(crack);
      particles.push(crack);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.3 ? 1 : 0.5;
        for (const p of particles) {
          if (p.userData.expandSpeed !== undefined && p.userData.rotSpeed !== undefined) {
            // 环形闪电墙
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            p.rotation.y += p.userData.rotSpeed;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * p.userData.baseOpacity * flicker;
              }
            });
          } else if (p === stormPillar) {
            const pillarScale = 0.5 + Math.sin(t * Math.PI) * 1.5;
            p.scale.setScalar(pillarScale);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.9 * flicker;
              }
            });
          } else if (p.userData.outwardSpeed !== undefined) {
            // 向外扩散粒子
            const outward = p.userData.outwardSpeed * 0.02;
            p.position.x += Math.cos(p.userData.angle) * outward;
            p.position.z += Math.sin(p.userData.angle) * outward;
            p.position.y += p.userData.riseSpeed * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity * flicker;
          } else {
            // 地面裂纹
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7 * flicker;
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第5魂技：蓝电神龙疾 - 化身雷龙向前冲锋，龙形闪电 =====
  if (idx === 4) {
    const duration = 0.8;

    // 龙形闪电（由多个球体组成龙身，向前冲锋）
    const dragonGroup = new THREE.Group();
    const segments = 12;
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const size = i === 0 ? 0.6 : (0.4 - t * 0.2);
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshBasicMaterial({ color: thunderColors[i % 6], transparent: true, opacity: 0.8 })
      );
      seg.position.z = -i * 0.5;
      seg.userData.segIndex = i;
      dragonGroup.add(seg);
    }
    // 龙头
    const head = createDragonHead(0.8);
    head.position.z = 0.5;
    dragonGroup.add(head);

    // 龙身电弧连接
    for (let i = 0; i < segments - 1; i++) {
      const from = new THREE.Vector3(0, 0, -i * 0.5);
      const to = new THREE.Vector3(0, 0, -(i + 1) * 0.5);
      const arc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6),
        new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.6 })
      );
      arc.position.copy(from.clone().lerp(to, 0.5));
      arc.rotation.x = Math.PI / 2;
      dragonGroup.add(arc);
    }

    dragonGroup.position.copy(startPos);
    dragonGroup.position.y += 1;
    dragonGroup.lookAt(startPos.clone().add(dir));
    dragonGroup.userData.startPos = dragonGroup.position.clone();
    dragonGroup.userData.targetPos = startPos.clone().add(dir.clone().multiplyScalar(range));
    game.scene.add(dragonGroup);
    particles.push(dragonGroup);

    // 冲锋尾迹闪电
    for (let i = 0; i < 8; i++) {
      const trailStart = startPos.clone();
      trailStart.y += 0.5 + Math.random() * 1;
      trailStart.x += (Math.random() - 0.5) * 0.8;
      trailStart.z += (Math.random() - 0.5) * 0.8;
      const trailEnd = startPos.clone().add(dir.clone().multiplyScalar(-1 - Math.random() * 2));
      trailEnd.y = trailStart.y;
      trailEnd.x += (Math.random() - 0.5) * 1;
      const trail = createLightningBolt(trailStart, trailEnd, thunderColors[i % 6], 0.7);
      trail.userData.delay = i * 0.05;
      trail.userData.baseOpacity = 0.8;
      game.scene.add(trail);
      particles.push(trail);
    }

    // 路径上的雷击点
    const strikePoints = 5;
    for (let s = 0; s < strikePoints; s++) {
      const strikeT = (s + 1) / (strikePoints + 1);
      const strikePos = startPos.clone().add(dir.clone().multiplyScalar(range * strikeT));
      strikePos.y = 0.1;
      const ring = _createRing(strikePos, 0.2, 0x00bfff, 0.7);
      ring.userData.delay = strikeT * 0.6;
      ring.userData.expandSpeed = 6;
      ring.userData.baseOpacity = 0.7;
      game.scene.add(ring);
      particles.push(ring);

      // 向上小闪电
      const skyPos = strikePos.clone();
      skyPos.y += 3;
      const bolt = createLightningBolt(skyPos, strikePos, thunderColors[s % 6], 0.8);
      bolt.userData.delay = strikeT * 0.6;
      bolt.userData.baseOpacity = 0.8;
      game.scene.add(bolt);
      particles.push(bolt);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.2 ? 1 : 0.5;
        for (const p of particles) {
          if (p === dragonGroup) {
            // 龙向前冲锋，带波浪摆动
            p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, t);
            // 龙身波浪
            p.children.forEach((child, ci) => {
              if (child.userData.segIndex !== undefined) {
                const wave = Math.sin(t * 8 + child.userData.segIndex * 0.5) * 0.15;
                child.position.y = wave;
                if (child.material) child.material.opacity = 0.8 * flicker;
              }
            });
            // 龙头闪烁
            p.children.forEach(child => {
              if (child.type === 'Group') {
                child.traverse(c => {
                  if (c.material && c.material.opacity !== undefined) {
                    c.material.opacity = 0.7 * flicker;
                  }
                });
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.7);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第6魂技：龙之怒 - 龙吼咆哮，雷霆震波扩散 =====
  if (idx === 5) {
    const duration = 1.0;

    // 巨大龙头（张嘴咆哮）
    const dragonHead = createDragonHead(2);
    dragonHead.position.copy(startPos);
    dragonHead.position.y += 1.5;
    dragonHead.lookAt(startPos.clone().add(dir));
    game.scene.add(dragonHead);
    particles.push(dragonHead);

    // 口中能量球
    const mouthOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    mouthOrb.position.copy(startPos);
    mouthOrb.position.y += 1.2;
    mouthOrb.position.add(dir.clone().multiplyScalar(1.5));
    game.scene.add(mouthOrb);
    particles.push(mouthOrb);

    // 环形震波（多层，向前方扩散）
    for (let r = 0; r < 6; r++) {
      const ringGroup = new THREE.Group();
      const ringGeom = new THREE.TorusGeometry(0.3, 0.08, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: thunderColors[r % 6], transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ringGroup.add(ring);
      ringGroup.position.copy(startPos);
      ringGroup.position.y += 1.2;
      ringGroup.position.add(dir.clone().multiplyScalar(1.5));
      ringGroup.lookAt(startPos.clone().add(dir.clone().multiplyScalar(10)));
      ringGroup.userData.speed = 8 + r * 2;
      ringGroup.userData.expandSpeed = 6 + r * 1.5;
      ringGroup.userData.delay = r * 0.1;
      ringGroup.userData.baseOpacity = 0.8;
      game.scene.add(ringGroup);
      particles.push(ringGroup);
    }

    // 声波粒子（向前扩散）
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(mouthOrb.position.clone(), 0.05 + Math.random() * 0.07, thunderColors[Math.floor(Math.random() * 6)], 0.9);
      const spreadAngle = Math.random() * Math.PI * 2;
      const spreadRadius = Math.random() * 0.4;
      p.position.x += Math.cos(spreadAngle) * spreadRadius;
      p.position.y += Math.sin(spreadAngle) * spreadRadius;
      const forwardDir = dir.clone();
      forwardDir.x += (Math.random() - 0.5) * 0.5;
      forwardDir.y += (Math.random() - 0.5) * 0.3;
      forwardDir.z += (Math.random() - 0.5) * 0.5;
      forwardDir.normalize();
      p.userData.vel = forwardDir.multiplyScalar(6 + Math.random() * 6);
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面震波环
    const groundRing = _createRing(startPos, 0.5, 0x00bfff, 0.7);
    groundRing.position.y = 0.05;
    groundRing.userData.expandSpeed = 10;
    groundRing.userData.baseOpacity = 0.7;
    game.scene.add(groundRing);
    particles.push(groundRing);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.3 ? 1 : 0.5;
        const roarPulse = 0.8 + Math.sin(t * 15) * 0.2;
        for (const p of particles) {
          if (p === dragonHead) {
            // 龙头咆哮脉动
            const headScale = 0.8 + Math.sin(t * Math.PI) * 0.4;
            p.scale.setScalar(headScale * roarPulse);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.7 * flicker;
              }
            });
          } else if (p === mouthOrb) {
            // 能量球先凝聚后爆发
            const orbScale = t < 0.3 ? (t / 0.3) : (1 + (t - 0.3) * 2);
            p.scale.setScalar(orbScale * roarPulse);
            p.material.opacity = (life / maxLife) * 0.9 * flicker;
          } else if (p.userData.speed !== undefined && p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              // 向前移动
              p.position.add(dir.clone().multiplyScalar(p.userData.speed * 0.02));
              // 同时扩大
              p.scale.setScalar(1 + p.userData.expandSpeed * localT);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity * flicker;
          } else if (p.userData.expandSpeed !== undefined) {
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            if (p.material) p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.7);
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第7魂技：蓝电霸王龙真身 - 巨大龙形虚影现身，全身雷电暴走 =====
  if (idx === 6) {
    const duration = 1.5;

    // 巨大龙身（S形盘旋上升）
    const dragonTrueBody = new THREE.Group();
    const bodySegments = 20;
    for (let i = 0; i < bodySegments; i++) {
      const t = i / bodySegments;
      const size = 0.8 - t * 0.4;
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(size, 8, 8),
        new THREE.MeshBasicMaterial({ color: thunderColors[i % 6], transparent: true, opacity: 0.6 })
      );
      // S形盘旋
      const height = t * 6;
      const angle = t * Math.PI * 3;
      const radius = 1.5 + Math.sin(t * Math.PI) * 0.5;
      seg.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      seg.userData.baseY = height;
      seg.userData.baseAngle = angle;
      seg.userData.baseRadius = radius;
      seg.userData.segIndex = i;
      dragonTrueBody.add(seg);
    }

    // 龙头（顶端）
    const topHead = createDragonHead(1.5);
    topHead.position.set(0, 6.5, 0);
    topHead.rotation.y = Math.PI;
    dragonTrueBody.add(topHead);

    // 龙翼
    for (let w = 0; w < 2; w++) {
      const wingGroup = new THREE.Group();
      // 翼膜（用多个三角形平面模拟）
      for (let s = 0; s < 5; s++) {
        const wingSeg = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5 - s * 0.25, 2 - s * 0.3, 1, 1),
          new THREE.MeshBasicMaterial({ color: 0x4169e1, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
        );
        wingSeg.position.y = -s * 0.4;
        wingSeg.position.z = s * 0.3;
        wingSeg.rotation.z = s * 0.15;
        wingGroup.add(wingSeg);
      }
      wingGroup.position.set(w === 0 ? -1.5 : 1.5, 4, 0);
      wingGroup.rotation.z = w === 0 ? 0.3 : -0.3;
      wingGroup.rotation.y = w === 0 ? 0.5 : -0.5;
      dragonTrueBody.add(wingGroup);
    }

    dragonTrueBody.position.copy(startPos);
    dragonTrueBody.position.y = 0;
    game.scene.add(dragonTrueBody);
    particles.push(dragonTrueBody);

    // 全身环绕电弧
    for (let i = 0; i < 15; i++) {
      const fromIdx = Math.floor(Math.random() * bodySegments);
      const toIdx = Math.floor(Math.random() * bodySegments);
      const fromT = fromIdx / bodySegments;
      const toT = toIdx / bodySegments;
      const fromAngle = fromT * Math.PI * 3;
      const fromRadius = 1.5 + Math.sin(fromT * Math.PI) * 0.5;
      const toAngle = toT * Math.PI * 3;
      const toRadius = 1.5 + Math.sin(toT * Math.PI) * 0.5;
      const fromPos = new THREE.Vector3(
        Math.cos(fromAngle) * fromRadius,
        fromT * 6,
        Math.sin(fromAngle) * fromRadius
      );
      const toPos = new THREE.Vector3(
        Math.cos(toAngle) * toRadius,
        toT * 6,
        Math.sin(toAngle) * toRadius
      );
      const arc = createLightningBolt(fromPos, toPos, thunderColors[i % 6], 0.6);
      arc.position.copy(startPos);
      arc.userData.baseOpacity = 0.8;
      game.scene.add(arc);
      particles.push(arc);
    }

    // 天降闪电（龙身下劈）
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 2 + Math.random() * 2;
      const topP = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist,
        8,
        startPos.z + Math.sin(angle) * dist
      );
      const botP = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist * 0.5,
        0.1,
        startPos.z + Math.sin(angle) * dist * 0.5
      );
      const bolt = createLightningBolt(topP, botP, thunderColors[i % 6], 1);
      bolt.userData.delay = i * 0.15;
      bolt.userData.baseOpacity = 0.9;
      game.scene.add(bolt);
      particles.push(bolt);
    }

    // 地面雷电环
    for (let r = 0; r < 4; r++) {
      const ring = _createRing(startPos, 0.5 + r, thunderColors[r], 0.7);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 4 + r;
      ring.userData.baseOpacity = 0.7;
      ring.userData.delay = r * 0.2;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.25 ? 1 : 0.5;
        for (const p of particles) {
          if (p === dragonTrueBody) {
            // 龙身缓慢旋转盘旋
            p.rotation.y += 0.01;
            // 出现动画：从下往上渐现
            p.children.forEach(child => {
              if (child.userData.segIndex !== undefined) {
                const appearT = t * 1.5;
                const segAppear = child.userData.segIndex / bodySegments;
                const visible = appearT > segAppear ? 1 : 0;
                // 游动效果
                const swim = Math.sin(elapsed * 3 + child.userData.segIndex * 0.3) * 0.1;
                child.position.x = Math.cos(child.userData.baseAngle + elapsed * 0.5) * (child.userData.baseRadius + swim);
                child.position.z = Math.sin(child.userData.baseAngle + elapsed * 0.5) * (child.userData.baseRadius + swim);
                if (child.material) child.material.opacity = visible * (life / maxLife) * 0.6 * flicker;
              } else if (child.type === 'Group') {
                // 龙头
                child.traverse(c => {
                  if (c.material && c.material.opacity !== undefined) {
                    c.material.opacity = (life / maxLife) * 0.7 * flicker;
                  }
                });
              } else if (child.type === 'Group' && child.children.length > 0 && child.children[0].type === 'Mesh') {
                // 龙翼
                child.traverse(c => {
                  if (c.material && c.material.opacity !== undefined) {
                    c.material.opacity = (life / maxLife) * 0.4 * flicker;
                  }
                });
                // 扇动
                const wingFlap = Math.sin(elapsed * 4) * 0.2;
                child.rotation.x = wingFlap;
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.7);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else {
            // 龙身电弧
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.8) * flicker;
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第8魂技：天雷 - 召唤巨型天雷柱从天而降 =====
  if (idx === 7) {
    const duration = 1.2;
    const skyHeight = 20;

    // 巨型天雷柱（粗壮的主闪电）
    const mainBoltTop = new THREE.Vector3(startPos.x, skyHeight, startPos.z);
    const mainBoltBottom = new THREE.Vector3(startPos.x, 0, startPos.z);
    const mainBolt = createLightningBolt(mainBoltTop, mainBoltBottom, 0xffffff, 3);
    mainBolt.userData.chargeTime = 0.3;
    game.scene.add(mainBolt);
    particles.push(mainBolt);

    // 环绕的副闪电柱
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const dist = 1.5 + Math.random() * 1;
      const subTop = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist,
        skyHeight * 0.8,
        startPos.z + Math.sin(angle) * dist
      );
      const subBottom = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist * 0.7,
        0,
        startPos.z + Math.sin(angle) * dist * 0.7
      );
      const subBolt = createLightningBolt(subTop, subBottom, thunderColors[i % 6], 1.5);
      subBolt.userData.delay = 0.1 + i * 0.05;
      subBolt.userData.baseOpacity = 0.8;
      game.scene.add(subBolt);
      particles.push(subBolt);
    }

    // 天空乌云（雷云）
    const stormCloud = new THREE.Group();
    for (let i = 0; i < 20; i++) {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(1 + Math.random() * 1.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x1a1a4a, transparent: true, opacity: 0.6 })
      );
      const cAngle = Math.random() * Math.PI * 2;
      const cDist = Math.random() * range * 0.8;
      cloud.position.set(
        Math.cos(cAngle) * cDist,
        skyHeight - 1 - Math.random() * 2,
        Math.sin(cAngle) * cDist
      );
      cloud.scale.y = 0.3;
      stormCloud.add(cloud);
    }
    game.scene.add(stormCloud);
    particles.push(stormCloud);

    // 雷击核心光球
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    core.position.copy(startPos);
    core.position.y = 0.5;
    game.scene.add(core);
    particles.push(core);

    // 多层冲击波环
    for (let r = 0; r < 5; r++) {
      const ring = _createRing(startPos, 0.3 + r * 0.3, thunderColors[r % 6], 0.8);
      ring.position.y = 0.05 + r * 0.1;
      ring.userData.expandSpeed = 8 + r * 2;
      ring.userData.baseOpacity = 0.8;
      ring.userData.delay = 0.3 + r * 0.1;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 溅射电弧粒子
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, thunderColors[Math.floor(Math.random() * 6)], 0.95);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 0.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.1 + Math.random() * 0.3;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (4 + Math.random() * 6),
        5 + Math.random() * 8,
        Math.sin(angle) * (4 + Math.random() * 6)
      );
      p.userData.gravity = 20;
      p.userData.baseOpacity = 0.95;
      p.userData.delay = 0.3;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面裂纹闪电（放射状）
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const crackStart = new THREE.Vector3(startPos.x + Math.cos(angle) * 0.5, 0.02, startPos.z + Math.sin(angle) * 0.5);
      const crackEnd = new THREE.Vector3(startPos.x + Math.cos(angle) * range * 0.8, 0.02, startPos.z + Math.sin(angle) * range * 0.8);
      const crack = createLightningBolt(crackStart, crackEnd, thunderColors[i % 6], 0.7);
      crack.userData.delay = 0.35;
      crack.userData.baseOpacity = 0.7;
      game.scene.add(crack);
      particles.push(crack);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.2 ? 1 : 0.4;
        const chargePhase = elapsed < 0.3;
        const strikePhase = elapsed >= 0.3;

        for (const p of particles) {
          if (p === mainBolt) {
            // 蓄力阶段渐显，轰击阶段闪烁
            let opacity;
            if (chargePhase) {
              opacity = (elapsed / 0.3) * 0.3;
              p.scale.setScalar(0.5 + elapsed / 0.3 * 0.5);
            } else {
              opacity = 0.95 * flicker;
              const strikeT = (elapsed - 0.3) / (maxLife - 0.3);
              p.scale.setScalar(1 + strikeT * 0.5);
            }
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = opacity * (life / maxLife);
              }
            });
          } else if (p === stormCloud) {
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = Math.min(0.7, t * 1.5) * (life / maxLife);
              }
            });
          } else if (p === core) {
            if (strikePhase) {
              const coreT = (elapsed - 0.3) / (maxLife - 0.3);
              const coreScale = 1 + Math.sin(coreT * Math.PI * 5) * 0.3;
              p.scale.setScalar(coreScale);
              p.material.opacity = (life / maxLife) * 0.9 * flicker;
            } else {
              p.material.opacity = 0;
            }
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.8) * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.vel && p.userData.delay !== undefined) {
            if (elapsed >= p.userData.delay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.userData.gravity) {
                p.userData.vel.y -= p.userData.gravity * 0.02;
              }
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              if (p.material) p.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第9魂技：蓝电龙皇破 - 终极奥义，龙皇降临，毁天灭地的雷霆 =====
  if (idx === 8) {
    const duration = 1.5;

    // 巨型龙皇真身（盘旋于天空）
    const dragonEmperor = new THREE.Group();
    // 龙身（巨大螺旋）
    const emperorSegs = 25;
    for (let i = 0; i < emperorSegs; i++) {
      const t = i / emperorSegs;
      const size = 1.2 - t * 0.5;
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(size, 10, 10),
        new THREE.MeshBasicMaterial({ color: thunderColors[i % 6], transparent: true, opacity: 0.7 })
      );
      const height = 3 + t * 8;
      const angle = t * Math.PI * 4;
      const radius = 2 + Math.sin(t * Math.PI) * 1;
      seg.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      seg.userData.baseAngle = angle;
      seg.userData.baseRadius = radius;
      seg.userData.baseY = height;
      seg.userData.segIndex = i;
      dragonEmperor.add(seg);
    }
    // 龙皇头（王冠）
    const emperorHead = createDragonHead(2.5);
    emperorHead.position.set(0, 12, 0);
    // 王冠
    for (let i = 0; i < 5; i++) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 1 })
      );
      crown.position.set((i - 2) * 0.3, 2, 0.5);
      emperorHead.add(crown);
    }
    dragonEmperor.add(emperorHead);

    dragonEmperor.position.copy(startPos);
    dragonEmperor.position.y = 0;
    game.scene.add(dragonEmperor);
    particles.push(dragonEmperor);

    // 天空中巨型雷电网格（穹顶效果）
    const domeGroup = new THREE.Group();
    for (let lat = 0; lat < 6; lat++) {
      const latAngle = (lat / 6) * (Math.PI / 2);
      const ringRadius = Math.sin(latAngle) * range;
      const ringY = Math.cos(latAngle) * range * 0.6 + 3;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(ringRadius, 0.08, 8, 48),
        new THREE.MeshBasicMaterial({ color: thunderColors[lat % 6], transparent: true, opacity: 0.6 })
      );
      ring.position.y = ringY;
      ring.rotation.x = Math.PI / 2;
      ring.userData.baseOpacity = 0.6;
      domeGroup.add(ring);
    }
    // 经线
    for (let lon = 0; lon < 12; lon++) {
      const lonAngle = (lon / 12) * Math.PI * 2;
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(range * 0.8, 0.06, 8, 32, Math.PI),
        new THREE.MeshBasicMaterial({ color: thunderColors[lon % 6], transparent: true, opacity: 0.5 })
      );
      arc.rotation.z = lonAngle;
      arc.rotation.x = Math.PI / 2;
      arc.position.y = range * 0.3 + 3;
      arc.userData.baseOpacity = 0.5;
      domeGroup.add(arc);
    }
    domeGroup.position.copy(startPos);
    game.scene.add(domeGroup);
    particles.push(domeGroup);

    // 无数道天雷（密集雷击）
    const skyBoltCount = 20;
    for (let b = 0; b < skyBoltCount; b++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.9;
      const skyY = 10 + Math.random() * 5;
      const boltTop = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist,
        skyY,
        startPos.z + Math.sin(angle) * dist
      );
      const boltBottom = new THREE.Vector3(
        startPos.x + Math.cos(angle) * dist * 0.8,
        0.1,
        startPos.z + Math.sin(angle) * dist * 0.8
      );
      const bolt = createLightningBolt(boltTop, boltBottom, thunderColors[b % 6], 1 + Math.random());
      bolt.userData.delay = Math.random() * 0.8;
      bolt.userData.baseOpacity = 0.85;
      game.scene.add(bolt);
      particles.push(bolt);
    }

    // 中心能量柱（毁天灭地的光柱）
    const pillarTop = new THREE.Vector3(startPos.x, 15, startPos.z);
    const pillarBottom = new THREE.Vector3(startPos.x, 0, startPos.z);
    const pillar = createLightningBolt(pillarBottom, pillarTop, 0xffffff, 4);
    pillar.userData.chargeTime = 0.5;
    game.scene.add(pillar);
    particles.push(pillar);

    // 地面冲击波（多层大圆环）
    for (let r = 0; r < 6; r++) {
      const ring = _createRing(startPos, 0.5 + r * 0.5, thunderColors[r % 6], 0.8);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 10 + r * 2;
      ring.userData.baseOpacity = 0.8;
      ring.userData.delay = 0.5 + r * 0.12;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 雷霆粒子大爆发
    for (let i = 0; i < 80; i++) {
      const p = _createParticle(startPos, 0.07 + Math.random() * 0.1, thunderColors[Math.floor(Math.random() * 6)], 0.95);
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 5 + Math.random() * 10;
      p.position.y += 0.5 + Math.random() * 1;
      p.userData.vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(angle) * speed,
        Math.cos(phi) * speed + 3,
        Math.sin(phi) * Math.sin(angle) * speed
      );
      p.userData.gravity = 12;
      p.userData.baseOpacity = 0.95;
      p.userData.delay = 0.5;
      game.scene.add(p);
      particles.push(p);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.2 ? 1 : 0.35;
        const chargePhase = elapsed < 0.5;
        const burstPhase = elapsed >= 0.5;

        for (const p of particles) {
          if (p === dragonEmperor) {
            p.rotation.y += 0.015;
            p.children.forEach(child => {
              if (child.userData.segIndex !== undefined) {
                // 龙身游动
                const swim = Math.sin(elapsed * 2 + child.userData.segIndex * 0.25) * 0.2;
                child.position.x = Math.cos(child.userData.baseAngle + elapsed * 0.4) * (child.userData.baseRadius + swim);
                child.position.z = Math.sin(child.userData.baseAngle + elapsed * 0.4) * (child.userData.baseRadius + swim);
                if (child.material) child.material.opacity = (life / maxLife) * 0.7 * flicker;
              } else if (child.type === 'Group') {
                // 龙头
                child.traverse(c => {
                  if (c.material && c.material.opacity !== undefined) {
                    c.material.opacity = (life / maxLife) * 0.8 * flicker;
                  }
                });
              }
            });
          } else if (p === domeGroup) {
            p.rotation.y += 0.005;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * (child.userData.baseOpacity || 0.5) * flicker;
              }
            });
            const domeScale = 0.8 + Math.sin(t * Math.PI) * 0.3;
            p.scale.setScalar(domeScale);
          } else if (p === pillar) {
            if (chargePhase) {
              p.scale.setScalar(0.3 + (elapsed / 0.5) * 0.7);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (elapsed / 0.5) * 0.5;
                }
              });
            } else {
              const pillarT = (elapsed - 0.5) / (maxLife - 0.5);
              p.scale.setScalar(1 + pillarT * 1.5);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - pillarT) * 0.95 * flicker;
                }
              });
            }
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.8) * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.vel && p.userData.delay !== undefined) {
            if (elapsed >= p.userData.delay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.userData.gravity) {
                p.userData.vel.y -= p.userData.gravity * 0.02;
              }
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              if (p.material) p.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }
}

// ========== 4. 鬼魅技能特效 ==========
// 敏攻系兽武魂 - 暗影 - 每个魂技都有完全独特的视觉表现
function spawnGhostSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const darkColors = [0x6b5b95, 0x4b0082, 0x800080, 0x2f0047, 0x9370db, 0xdda0dd];
  const eyeColor = 0xff2222;

  // 工具：创建鬼影人形
  function createGhostFigure(scale, opacity) {
    const ghost = new THREE.Group();
    // 兜帽头部
    const hood = new THREE.Mesh(
      new THREE.ConeGeometry(0.35 * scale, 0.6 * scale, 8),
      new THREE.MeshBasicMaterial({ color: 0x2f0047, transparent: true, opacity: opacity || 0.7 })
    );
    hood.position.y = 1.7 * scale;
    ghost.add(hood);
    // 脸（阴影）
    const face = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 * scale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x1a0a2e, transparent: true, opacity: 0.9 })
    );
    face.position.y = 1.5 * scale;
    face.position.z = 0.15 * scale;
    ghost.add(face);
    // 红眼
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 * scale, 4, 4),
        new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 1 })
      );
      eye.position.set(e === 0 ? -0.08 * scale : 0.08 * scale, 1.52 * scale, 0.3 * scale);
      ghost.add(eye);
    }
    // 身体（飘逸长袍）
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25 * scale, 0.55 * scale, 1.4 * scale, 8),
      new THREE.MeshBasicMaterial({ color: 0x4b0082, transparent: true, opacity: (opacity || 0.7) * 0.8 })
    );
    body.position.y = 0.7 * scale;
    ghost.add(body);
    // 底部烟雾效果
    for (let i = 0; i < 5; i++) {
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 * scale + Math.random() * 0.1 * scale, 6, 6),
        new THREE.MeshBasicMaterial({ color: darkColors[i % 6], transparent: true, opacity: 0.4 })
      );
      const angle = Math.random() * Math.PI * 2;
      smoke.position.set(
        Math.cos(angle) * 0.3 * scale,
        Math.random() * 0.3 * scale,
        Math.sin(angle) * 0.3 * scale
      );
      ghost.add(smoke);
    }
    return ghost;
  }

  // 工具：创建鬼爪虚影
  function createGhostClaw(scale) {
    const clawGroup = new THREE.Group();
    // 手掌
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.6 * scale, 0.2 * scale, 0.8 * scale),
      new THREE.MeshBasicMaterial({ color: 0x4b0082, transparent: true, opacity: 0.6 })
    );
    palm.position.z = 0.2 * scale;
    clawGroup.add(palm);
    // 五根利爪
    for (let i = 0; i < 5; i++) {
      const angle = (i - 2) * 0.35;
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.06 * scale, 1.0 * scale, 6),
        new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.8 })
      );
      claw.position.set(Math.sin(angle) * 0.3 * scale, 0, 0.7 * scale);
      claw.rotation.x = Math.PI / 2 + 0.15;
      claw.rotation.z = -angle * 0.4;
      clawGroup.add(claw);
      // 爪尖（更亮）
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.025 * scale, 0.35 * scale, 4),
        new THREE.MeshBasicMaterial({ color: 0xdda0dd, transparent: true, opacity: 1 })
      );
      tip.position.set(Math.sin(angle) * 0.3 * scale, 0, 1.3 * scale);
      tip.rotation.x = Math.PI / 2 + 0.15;
      tip.rotation.z = -angle * 0.4;
      clawGroup.add(tip);
    }
    // 暗影雾气
    for (let i = 0; i < 8; i++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 * scale + Math.random() * 0.08 * scale, 6, 6),
        new THREE.MeshBasicMaterial({ color: darkColors[i % 6], transparent: true, opacity: 0.5 })
      );
      mist.position.set(
        (Math.random() - 0.5) * 0.6 * scale,
        (Math.random() - 0.5) * 0.3 * scale,
        (Math.random() - 0.5) * 0.6 * scale
      );
      clawGroup.add(mist);
    }
    return clawGroup;
  }

  // 工具：创建暗影迷雾粒子球
  function createMistParticle(pos, size, color, opacity) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(size, 6, 6),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    p.position.copy(pos);
    return p;
  }

  // ===== 第1魂技：鬼影 - 快速位移，留下残影，暗影突袭 =====
  if (idx === 0) {
    const duration = 0.5;

    // 主鬼影（向前方突袭）
    const mainGhost = createGhostFigure(1, 0.8);
    mainGhost.position.copy(startPos);
    mainGhost.position.y += 0.1;
    mainGhost.lookAt(startPos.clone().add(dir));
    mainGhost.userData.startPos = mainGhost.position.clone();
    mainGhost.userData.targetPos = startPos.clone().add(dir.clone().multiplyScalar(range));
    game.scene.add(mainGhost);
    particles.push(mainGhost);

    // 残影（沿路径分布）
    const afterImageCount = 5;
    for (let i = 0; i < afterImageCount; i++) {
      const img = createGhostFigure(0.9 - i * 0.1, 0.5 - i * 0.08);
      img.position.copy(startPos);
      img.position.y += 0.1;
      img.lookAt(startPos.clone().add(dir));
      img.userData.delay = i * 0.06;
      img.userData.appearTime = i * 0.06;
      img.userData.fadeDelay = 0.05;
      img.userData.baseOpacity = 0.5 - i * 0.08;
      game.scene.add(img);
      particles.push(img);
    }

    // 暗影轨迹粒子
    for (let i = 0; i < 25; i++) {
      const p = createMistParticle(startPos, 0.1 + Math.random() * 0.15, darkColors[Math.floor(Math.random() * 6)], 0.6);
      p.position.y += 0.3 + Math.random() * 1.2;
      p.position.x += (Math.random() - 0.5) * 0.6;
      p.position.z += (Math.random() - 0.5) * 0.6;
      p.userData.vel = dir.clone().multiplyScalar(8 + Math.random() * 6);
      p.userData.vel.x += (Math.random() - 0.5) * 2;
      p.userData.vel.y += (Math.random() - 0.5) * 2;
      p.userData.baseOpacity = 0.6;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 突袭终点爆发
    const endPos = startPos.clone().add(dir.clone().multiplyScalar(range));
    const burstRing = _createRing(endPos, 0.3, 0x9370db, 0.7);
    burstRing.position.y = 0.5;
    burstRing.userData.expandSpeed = 8;
    burstRing.userData.baseOpacity = 0.7;
    burstRing.userData.delay = 0.3;
    game.scene.add(burstRing);
    particles.push(burstRing);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === mainGhost) {
            // 向前快速移动
            p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, Math.min(t * 2, 1));
            const ghostScale = 0.9 + Math.sin(t * Math.PI) * 0.3;
            p.scale.setScalar(ghostScale);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8;
              }
            });
          } else if (p.userData.delay !== undefined && p.type === 'Group') {
            // 残影
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.position.lerpVectors(startPos, endPos, Math.min((elapsed - p.userData.delay) * 2, 1));
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 1.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.7);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第2魂技：鬼爪 - 前方鬼爪虚影，利爪撕裂 =====
  if (idx === 1) {
    const duration = 0.6;

    // 巨型鬼爪（向前抓击）
    const claw = createGhostClaw(1.8);
    claw.position.copy(startPos);
    claw.position.y += 0.8;
    claw.lookAt(startPos.clone().add(dir));
    claw.userData.startPos = claw.position.clone();
    claw.userData.targetPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.7));
    game.scene.add(claw);
    particles.push(claw);

    // 撕裂痕迹（多道弧形暗影）
    for (let i = 0; i < 5; i++) {
      const slashGroup = new THREE.Group();
      const slash = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.04, 6, 20, Math.PI * 0.6),
        new THREE.MeshBasicMaterial({ color: darkColors[i % 6], transparent: true, opacity: 0.7 })
      );
      slash.rotation.y = Math.PI / 2;
      slashGroup.add(slash);
      const pos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5 + i * 0.3));
      pos.y += 0.5 + (i - 2) * 0.25;
      pos.x += (i - 2) * 0.15;
      slashGroup.position.copy(pos);
      slashGroup.lookAt(startPos.clone().add(dir.clone().multiplyScalar(range)));
      slashGroup.rotation.z = (i - 2) * 0.3;
      slashGroup.userData.delay = i * 0.05;
      slashGroup.userData.baseOpacity = 0.7;
      game.scene.add(slashGroup);
      particles.push(slashGroup);
    }

    // 暗影雾气（沿路径）
    for (let i = 0; i < 20; i++) {
      const p = createMistParticle(startPos, 0.12 + Math.random() * 0.15, darkColors[Math.floor(Math.random() * 6)], 0.5);
      p.position.y += 0.5 + Math.random() * 1;
      p.userData.vel = dir.clone().multiplyScalar(5 + Math.random() * 5);
      p.userData.vel.x += (Math.random() - 0.5) * 3;
      p.userData.vel.y += (Math.random() - 0.5) * 2;
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 终点撕裂冲击环
    const impactPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.7));
    for (let i = 0; i < 3; i++) {
      const ring = _createRing(impactPos, 0.3 + i * 0.3, darkColors[i], 0.6);
      ring.position.y = 0.5;
      ring.userData.expandSpeed = 6 + i * 2;
      ring.userData.baseOpacity = 0.6;
      ring.userData.delay = 0.2 + i * 0.08;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === claw) {
            // 鬼爪抓击动作
            const clawT = Math.min(t * 1.8, 1);
            p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, clawT);
            const clawScale = 0.8 + Math.sin(clawT * Math.PI) * 0.6;
            p.scale.setScalar(clawScale);
            // 爪子张合
            p.children.forEach((child, ci) => {
              if (ci >= 1 && ci <= 5) {
                child.rotation.z = (ci - 3) * 0.4 * (1 - clawT * 0.5);
              }
            });
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.8;
              }
            });
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined && p.type === 'Group') {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.scale.setScalar(0.5 + localT * 1.2);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 2);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.6);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第3魂技：隐身 - 身体半透明化，暗影迷雾扩散 =====
  if (idx === 2) {
    const duration = 1.0;

    // 中心角色虚影（逐渐透明）
    const phantom = createGhostFigure(1.1, 0.9);
    phantom.position.copy(startPos);
    phantom.position.y += 0.1;
    game.scene.add(phantom);
    particles.push(phantom);

    // 暗影迷雾（从身体向外扩散）
    for (let i = 0; i < 40; i++) {
      const p = createMistParticle(startPos, 0.15 + Math.random() * 0.2, darkColors[Math.floor(Math.random() * 6)], 0.5);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.8;
      p.position.y += height;
      p.position.x += Math.cos(angle) * 0.3;
      p.position.z += Math.sin(angle) * 0.3;
      const velDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      velDir.y = (Math.random() - 0.3) * 0.5;
      velDir.normalize();
      p.userData.vel = velDir.multiplyScalar(1.5 + Math.random() * 2.5);
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      p.userData.growSpeed = 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 多层暗影环（从地面升起）
    for (let r = 0; r < 5; r++) {
      const ring = _createRing(startPos, 0.3 + r * 0.4, darkColors[r % 6], 0.5);
      ring.position.y = 0.1 + r * 0.2;
      ring.userData.expandSpeed = 2 + r * 0.5;
      ring.userData.riseSpeed = 0.8 + r * 0.3;
      ring.userData.baseOpacity = 0.5;
      ring.userData.baseY = 0.1 + r * 0.2;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 暗影粒子旋转环绕
    for (let i = 0; i < 20; i++) {
      const p = createMistParticle(startPos, 0.06 + Math.random() * 0.08, 0x2f0047, 0.7);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.3 + Math.random() * 1.5;
      p.userData.orbitRadius = dist;
      p.userData.orbitAngle = angle;
      p.userData.orbitSpeed = (1.5 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1);
      p.userData.baseOpacity = 0.7;
      game.scene.add(p);
      particles.push(p);
    }

    // 头顶暗紫光球
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.8 })
    );
    orb.position.copy(startPos);
    orb.position.y += 2.2;
    game.scene.add(orb);
    particles.push(orb);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 8) * 0.2;
        for (const p of particles) {
          if (p === phantom) {
            // 逐渐透明（隐身效果）
            const fadeT = t < 0.3 ? (t / 0.3) : 1;
            p.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.1);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (1 - fadeT * 0.7) * (life / maxLife) * pulse;
              }
            });
          } else if (p === orb) {
            p.scale.setScalar(0.8 + Math.sin(t * Math.PI * 3) * 0.3);
            p.material.opacity = (life / maxLife) * 0.8 * pulse;
            p.position.y = 2.2 + Math.sin(elapsed * 3) * 0.1;
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * p.userData.growSpeed);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined && p.userData.riseSpeed !== undefined) {
            // 升起并扩散的环
            const expandDist = p.userData.expandSpeed * t;
            p.scale.setScalar(1 + expandDist);
            p.position.y = p.userData.baseY + p.userData.riseSpeed * t;
            if (p.material) p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.5);
          } else if (p.userData.orbitSpeed !== undefined) {
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            const expandR = p.userData.orbitRadius * (1 + t * 0.5);
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * expandR;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * expandR;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity * pulse;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第4魂技：鬼影迷踪 - 多重分身，飘忽不定的攻击 =====
  if (idx === 3) {
    const duration = 0.8;

    // 多个鬼影分身
    const cloneCount = 6;
    const clones = [];
    for (let c = 0; c < cloneCount; c++) {
      const clone = createGhostFigure(0.85, 0.7);
      const angle = (c / cloneCount) * Math.PI * 2;
      clone.position.copy(startPos);
      clone.position.x += Math.cos(angle) * 1.5;
      clone.position.z += Math.sin(angle) * 1.5;
      clone.position.y += 0.1;
      clone.userData.baseAngle = angle;
      clone.userData.orbitRadius = 1.5;
      clone.userData.orbitSpeed = (c % 2 === 0 ? 1 : -1) * (1.5 + c * 0.3);
      clone.userData.baseOpacity = 0.7;
      clone.userData.bobPhase = c * 0.5;
      game.scene.add(clone);
      particles.push(clone);
      clones.push(clone);
    }

    // 分身释放的暗影飞镖
    for (let i = 0; i < 24; i++) {
      const shuriken = new THREE.Group();
      // 十字飞镖
      for (let b = 0; b < 4; b++) {
        const blade = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.01, 0.25),
          new THREE.MeshBasicMaterial({ color: darkColors[b % 6], transparent: true, opacity: 0.8 })
        );
        blade.rotation.y = b * Math.PI / 4;
        shuriken.add(blade);
      }
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.8 + Math.random() * 1;
      shuriken.position.copy(startPos);
      shuriken.position.x += Math.cos(angle) * dist;
      shuriken.position.z += Math.sin(angle) * dist;
      shuriken.position.y += 0.5 + Math.random() * 1;
      const flyDir = new THREE.Vector3(Math.cos(angle), (Math.random() - 0.3) * 0.3, Math.sin(angle));
      flyDir.normalize();
      shuriken.userData.vel = flyDir.multiplyScalar(4 + Math.random() * 4);
      shuriken.userData.spinSpeed = 0.3 + Math.random() * 0.3;
      shuriken.userData.baseOpacity = 0.8;
      shuriken.userData.delay = Math.random() * 0.3;
      game.scene.add(shuriken);
      particles.push(shuriken);
    }

    // 中心暗影漩涡
    const vortexGroup = new THREE.Group();
    for (let r = 0; r < 4; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 + r * 0.25, 0.04, 6, 24),
        new THREE.MeshBasicMaterial({ color: darkColors[r % 6], transparent: true, opacity: 0.5 })
      );
      ring.position.y = 0.3 + r * 0.2;
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.05 + r * 0.02);
      vortexGroup.add(ring);
    }
    vortexGroup.position.copy(startPos);
    game.scene.add(vortexGroup);
    particles.push(vortexGroup);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.3 ? 1 : 0.6;
        for (const p of particles) {
          if (clones.includes(p)) {
            // 分身环绕飘忽
            p.userData.baseAngle += p.userData.orbitSpeed * 0.02;
            const expandR = p.userData.orbitRadius * (1 + t * 0.8);
            p.position.x = startPos.x + Math.cos(p.userData.baseAngle) * expandR;
            p.position.z = startPos.z + Math.sin(p.userData.baseAngle) * expandR;
            p.position.y = 0.1 + Math.sin(elapsed * 3 + p.userData.bobPhase) * 0.3;
            p.lookAt(startPos.x + Math.cos(p.userData.baseAngle + 0.5) * expandR, p.position.y, startPos.z + Math.sin(p.userData.baseAngle + 0.5) * expandR);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * p.userData.baseOpacity * flicker;
              }
            });
          } else if (p.userData.vel && p.userData.spinSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.rotation.y += p.userData.spinSpeed;
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p === vortexGroup) {
            p.children.forEach(child => {
              child.rotation.z += child.userData.rotSpeed;
              if (child.material) child.material.opacity = (life / maxLife) * 0.5;
            });
            p.scale.setScalar(1 + t * 0.5);
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第5魂技：幽冥百爪 - 百道爪影全方位攻击 =====
  if (idx === 4) {
    const duration = 0.8;

    // 全方位多道鬼爪（从各个角度攻击中心）
    const clawCount = 20;
    for (let c = 0; c < clawCount; c++) {
      const claw = createGhostClaw(0.6 + Math.random() * 0.4);
      // 随机方向
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.5;
      const startDist = range * 0.8;
      const startX = startPos.x + Math.cos(angle) * startDist;
      const startZ = startPos.z + Math.sin(angle) * startDist;
      claw.position.set(startX, height, startZ);
      claw.lookAt(startPos.x, height + 0.5, startPos.z);
      claw.userData.startPos = claw.position.clone();
      claw.userData.targetPos = new THREE.Vector3(
        startPos.x + Math.cos(angle) * 0.5,
        0.5 + Math.random() * 1,
        startPos.z + Math.sin(angle) * 0.5
      );
      claw.userData.delay = Math.random() * 0.3;
      claw.userData.baseOpacity = 0.7 + Math.random() * 0.2;
      game.scene.add(claw);
      particles.push(claw);
    }

    // 中心撕裂效果（多道交叉爪痕）
    for (let i = 0; i < 8; i++) {
      const slashGroup = new THREE.Group();
      const slash = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.05, 6, 16, Math.PI * 0.8),
        new THREE.MeshBasicMaterial({ color: darkColors[i % 6], transparent: true, opacity: 0.7 })
      );
      slashGroup.add(slash);
      slashGroup.position.copy(startPos);
      slashGroup.position.y += 0.8;
      slashGroup.rotation.x = Math.random() * Math.PI;
      slashGroup.rotation.y = Math.random() * Math.PI;
      slashGroup.rotation.z = Math.random() * Math.PI;
      slashGroup.userData.delay = 0.2 + Math.random() * 0.2;
      slashGroup.userData.baseOpacity = 0.7;
      game.scene.add(slashGroup);
      particles.push(slashGroup);
    }

    // 暗影爆发粒子
    for (let i = 0; i < 50; i++) {
      const p = createMistParticle(startPos, 0.08 + Math.random() * 0.1, darkColors[Math.floor(Math.random() * 6)], 0.6);
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 5;
      p.position.y += 0.8;
      p.userData.vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(angle) * speed,
        Math.cos(phi) * speed * 0.5,
        Math.sin(phi) * Math.sin(angle) * speed
      );
      p.userData.baseOpacity = 0.6;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心暗影球
    const darkOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x1a0a2e, transparent: true, opacity: 0.8 })
    );
    darkOrb.position.copy(startPos);
    darkOrb.position.y += 0.8;
    game.scene.add(darkOrb);
    particles.push(darkOrb);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.25 ? 1 : 0.5;
        for (const p of particles) {
          if (p.userData.startPos && p.userData.targetPos && p.type === 'Group' && !p.userData.baseAngle) {
            // 鬼爪从四周攻向中心
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const clawT = Math.min(localT * 2, 1);
              p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, clawT);
              const clawScale = 0.7 + Math.sin(clawT * Math.PI) * 0.5;
              p.scale.setScalar(clawScale);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined && p.type === 'Group' && p.children.length === 1) {
            // 交叉爪痕
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.scale.setScalar(0.3 + localT * 1.5);
              p.rotation.x += 0.02;
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 1.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p === darkOrb) {
            const orbScale = 0.5 + Math.sin(t * Math.PI) * 0.8;
            p.scale.setScalar(orbScale * flicker);
            p.material.opacity = (life / maxLife) * 0.8;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第6魂技：鬼影重重 - 大量鬼影分身出现，群攻 =====
  if (idx === 5) {
    const duration = 1.0;

    // 大量鬼影分身（环形分布，逐步出现）
    const hordeCount = 15;
    const horde = [];
    for (let h = 0; h < hordeCount; h++) {
      const ghost = createGhostFigure(0.7 + Math.random() * 0.3, 0.6);
      const angle = (h / hordeCount) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 2 + Math.random() * (range * 0.5);
      ghost.position.copy(startPos);
      ghost.position.x += Math.cos(angle) * dist;
      ghost.position.z += Math.sin(angle) * dist;
      ghost.position.y += 0.1;
      ghost.lookAt(startPos.x, ghost.position.y + 0.5, startPos.z);
      ghost.userData.baseAngle = angle;
      ghost.userData.baseDist = dist;
      ghost.userData.delay = Math.random() * 0.5;
      ghost.userData.baseOpacity = 0.5 + Math.random() * 0.3;
      ghost.userData.chargeSpeed = 3 + Math.random() * 3;
      game.scene.add(ghost);
      particles.push(ghost);
      horde.push(ghost);
    }

    // 每个鬼影发射暗影弹
    for (let i = 0; i < 30; i++) {
      const orb = createMistParticle(startPos, 0.1 + Math.random() * 0.08, 0x9370db, 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * (range * 0.5);
      orb.position.x = startPos.x + Math.cos(angle) * dist;
      orb.position.z = startPos.z + Math.sin(angle) * dist;
      orb.position.y += 0.8 + Math.random() * 0.5;
      const dirToCenter = new THREE.Vector3(
        startPos.x - orb.position.x,
        (Math.random() - 0.3) * 0.5,
        startPos.z - orb.position.z
      ).normalize();
      orb.userData.vel = dirToCenter.multiplyScalar(4 + Math.random() * 4);
      orb.userData.delay = 0.2 + Math.random() * 0.4;
      orb.userData.baseOpacity = 0.8;
      game.scene.add(orb);
      particles.push(orb);
    }

    // 暗影风暴（中心旋转上升的雾气）
    for (let i = 0; i < 30; i++) {
      const p = createMistParticle(startPos, 0.15 + Math.random() * 0.15, darkColors[Math.floor(Math.random() * 6)], 0.5);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 0.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.5;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = dist;
      p.userData.orbitSpeed = 3 + Math.random() * 4;
      p.userData.riseSpeed = 1.5 + Math.random() * 2;
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心暗影能量球
    const coreOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x4b0082, transparent: true, opacity: 0.7 })
    );
    coreOrb.position.copy(startPos);
    coreOrb.position.y += 1;
    game.scene.add(coreOrb);
    particles.push(coreOrb);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.3 ? 1 : 0.6;
        for (const p of particles) {
          if (horde.includes(p)) {
            // 鬼影群冲向中心
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const chargeDist = p.userData.baseDist * (1 - localT * 0.8);
              p.position.x = startPos.x + Math.cos(p.userData.baseAngle) * chargeDist;
              p.position.z = startPos.z + Math.sin(p.userData.baseAngle) * chargeDist;
              p.position.y = 0.1 + Math.sin(elapsed * 4 + p.userData.baseAngle) * 0.2;
              const ghostScale = 0.8 + Math.sin(localT * Math.PI) * 0.3;
              p.scale.setScalar(ghostScale);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT * 0.3) * p.userData.baseOpacity * flicker;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p.userData.vel && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'SphereGeometry' && p.userData.baseOpacity === 0.8) {
            // 暗影弹
            if (elapsed >= p.userData.delay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              if (p.material) p.material.opacity = (1 - localT) * p.userData.baseOpacity;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.orbitSpeed !== undefined && p.userData.riseSpeed !== undefined) {
            // 暗影风暴粒子
            p.userData.orbitAngle += p.userData.orbitSpeed * 0.02;
            const expandR = p.userData.orbitRadius * (1 + t * 0.5);
            p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * expandR;
            p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * expandR;
            p.position.y += p.userData.riseSpeed * 0.02;
            p.scale.setScalar(1 + t * 1.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p === coreOrb) {
            const orbScale = 0.5 + Math.sin(t * Math.PI * 4) * 0.3;
            p.scale.setScalar(orbScale);
            p.material.opacity = (life / maxLife) * 0.7 * flicker;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第7魂技：鬼魅真身 - 虚无形态，巨大鬼影现身 =====
  if (idx === 6) {
    const duration = 1.2;

    // 巨大鬼影真身（从地面升起）
    const trueBody = new THREE.Group();
    // 巨型鬼影身体
    const bigBody = createGhostFigure(3, 0.5);
    trueBody.add(bigBody);
    // 周围环绕的小鬼影
    for (let i = 0; i < 8; i++) {
      const miniGhost = createGhostFigure(0.8, 0.4);
      const angle = (i / 8) * Math.PI * 2;
      miniGhost.position.set(Math.cos(angle) * 2.5, 1 + Math.sin(angle * 2) * 0.5, Math.sin(angle) * 2.5);
      miniGhost.userData.orbitAngle = angle;
      miniGhost.userData.orbitRadius = 2.5;
      miniGhost.userData.baseY = 1;
      trueBody.add(miniGhost);
    }
    trueBody.position.copy(startPos);
    trueBody.position.y = -2;
    game.scene.add(trueBody);
    particles.push(trueBody);

    // 暗影迷雾柱（从地面涌出）
    for (let i = 0; i < 40; i++) {
      const p = createMistParticle(startPos, 0.2 + Math.random() * 0.25, darkColors[Math.floor(Math.random() * 6)], 0.5);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y = Math.random() * 0.3;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 多层暗影光环
    for (let r = 0; r < 5; r++) {
      const ring = _createRing(startPos, 0.5 + r * 0.6, darkColors[r % 6], 0.5);
      ring.position.y = 0.05;
      ring.userData.expandSpeed = 3 + r;
      ring.userData.baseOpacity = 0.5;
      ring.userData.delay = r * 0.15;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 眼睛光束（双眼射出红光）
    for (let e = 0; e < 2; e++) {
      const eyePos = startPos.clone();
      eyePos.y += 5.2;
      eyePos.x += e === 0 ? -0.3 : 0.3;
      const beamEnd = startPos.clone().add(dir.clone().multiplyScalar(range));
      beamEnd.y += 1;
      beamEnd.x += e === 0 ? -1 : 1;
      const beam = _createBeam(eyePos, new THREE.Vector3(beamEnd.x - eyePos.x, beamEnd.y - eyePos.y, beamEnd.z - eyePos.z).normalize(), range, 0xff2222, 0.7);
      beam.userData.delay = 0.5;
      beam.userData.baseOpacity = 0.7;
      game.scene.add(beam);
      particles.push(beam);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const flicker = Math.random() > 0.25 ? 1 : 0.5;
        for (const p of particles) {
          if (p === trueBody) {
            // 从地面升起
            const riseT = Math.min(t * 1.5, 1);
            p.position.y = -2 + riseT * 2;
            // 缓慢旋转
            p.rotation.y += 0.01;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.5 * flicker;
              }
            });
            // 环绕小鬼影
            p.children.forEach(child => {
              if (child.userData && child.userData.orbitAngle !== undefined) {
                child.userData.orbitAngle += 0.02;
                child.position.x = Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
                child.position.z = Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
                child.position.y = child.userData.baseY + Math.sin(elapsed * 2 + child.userData.orbitAngle) * 0.3;
              }
            });
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 2);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.5);
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.delay !== undefined && p.userData.baseOpacity !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
            // 眼睛光束
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              if (p.material) p.material.opacity = (1 - localT) * p.userData.baseOpacity * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第8魂技：幽冥领域 - 黑暗领域展开，暗影侵蚀 =====
  if (idx === 7) {
    const duration = 1.2;

    // 黑暗领域地面（暗色大圆）
    const domainFloor = new THREE.Mesh(
      new THREE.CircleGeometry(range * 0.9, 32),
      new THREE.MeshBasicMaterial({ color: 0x1a0a2e, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    domainFloor.rotation.x = -Math.PI / 2;
    domainFloor.position.copy(startPos);
    domainFloor.position.y = 0.02;
    game.scene.add(domainFloor);
    particles.push(domainFloor);

    // 领域边缘暗影墙（环形立起来的黑雾）
    const domainWall = new THREE.Group();
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      const pillar = createMistParticle(
        new THREE.Vector3(Math.cos(angle) * range * 0.85, 1, Math.sin(angle) * range * 0.85),
        0.3 + Math.random() * 0.2,
        darkColors[i % 6],
        0.6
      );
      pillar.scale.y = 3 + Math.random() * 2;
      pillar.userData.baseY = 1;
      pillar.userData.wavePhase = i * 0.3;
      domainWall.add(pillar);
    }
    domainWall.position.copy(startPos);
    game.scene.add(domainWall);
    particles.push(domainWall);

    // 领域内飘浮的暗影触手
    for (let i = 0; i < 12; i++) {
      const tentacleGroup = new THREE.Group();
      for (let s = 0; s < 6; s++) {
        const seg = createMistParticle(new THREE.Vector3(0, s * 0.4, 0), 0.12 - s * 0.015, darkColors[i % 6], 0.6);
        tentacleGroup.add(seg);
      }
      const angle = (i / 12) * Math.PI * 2;
      const dist = 1 + Math.random() * (range * 0.6);
      tentacleGroup.position.set(
        startPos.x + Math.cos(angle) * dist,
        0,
        startPos.z + Math.sin(angle) * dist
      );
      tentacleGroup.userData.baseAngle = angle;
      tentacleGroup.userData.swayPhase = i * 0.5;
      tentacleGroup.userData.baseDist = dist;
      game.scene.add(tentacleGroup);
      particles.push(tentacleGroup);
    }

    // 暗影粒子（缓慢向中心聚集）
    for (let i = 0; i < 50; i++) {
      const p = createMistParticle(startPos, 0.1 + Math.random() * 0.12, darkColors[Math.floor(Math.random() * 6)], 0.5);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.8;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 0.3 + Math.random() * 2;
      const dirToCenter = new THREE.Vector3(-Math.cos(angle), (Math.random() - 0.3) * 0.3, -Math.sin(angle)).normalize();
      p.userData.vel = dirToCenter.multiplyScalar(0.8 + Math.random() * 1.2);
      p.userData.baseOpacity = 0.5;
      p.userData.grow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心暗紫光柱
    const centerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 4, 8),
      new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.4 })
    );
    centerPillar.position.copy(startPos);
    centerPillar.position.y = 2;
    game.scene.add(centerPillar);
    particles.push(centerPillar);

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.8 + Math.sin(t * 6) * 0.2;
        for (const p of particles) {
          if (p === domainFloor) {
            // 领域展开
            const expandT = Math.min(t * 2, 1);
            p.scale.setScalar(expandT);
            p.material.opacity = (life / maxLife) * 0.7 * pulse;
          } else if (p === domainWall) {
            p.rotation.y += 0.005;
            p.children.forEach((child, ci) => {
              const wave = Math.sin(elapsed * 2 + child.userData.wavePhase) * 0.2;
              child.position.y = child.userData.baseY + wave;
              if (child.material) child.material.opacity = (life / maxLife) * 0.6 * pulse;
            });
            const wallScale = 0.5 + Math.min(t * 1.5, 1) * 0.5;
            p.scale.setScalar(wallScale);
          } else if (p.userData.baseAngle !== undefined && p.userData.swayPhase !== undefined) {
            // 暗影触手摇摆
            const sway = Math.sin(elapsed * 1.5 + p.userData.swayPhase) * 0.3;
            p.position.x = startPos.x + Math.cos(p.userData.baseAngle + sway) * p.userData.baseDist;
            p.position.z = startPos.z + Math.sin(p.userData.baseAngle + sway) * p.userData.baseDist;
            p.rotation.z = sway * 0.5;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * 0.6;
              }
            });
          } else if (p.userData.vel && p.userData.grow) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + t * 1.2);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p === centerPillar) {
            p.scale.y = 0.5 + Math.sin(t * Math.PI) * 1;
            p.scale.x = 0.8 + pulse * 0.4;
            p.scale.z = 0.8 + pulse * 0.4;
            p.material.opacity = (life / maxLife) * 0.4 * pulse;
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }

  // ===== 第9魂技：万鬼噬魂 - 终极奥义，万鬼齐出，吞噬灵魂 =====
  if (idx === 8) {
    const duration = 1.5;

    // 巨型噬魂鬼口（中心巨大鬼脸）
    const ghostMaw = new THREE.Group();
    // 巨大鬼脸（用球体+圆锥模拟）
    const face = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x1a0a2e, transparent: true, opacity: 0.8 })
    );
    face.scale.set(1, 1, 0.6);
    ghostMaw.add(face);
    // 巨口
    const mouth = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 1.2, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x0a0015, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
    mouth.position.z = 0.8;
    mouth.rotation.x = Math.PI / 2;
    ghostMaw.add(mouth);
    // 双眼（血色）
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
      );
      eye.position.set(e === 0 ? -0.5 : 0.5, 0.4, 0.8);
      ghostMaw.add(eye);
    }
    // 獠牙
    for (let i = 0; i < 8; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.4, 4),
        new THREE.MeshBasicMaterial({ color: 0xdda0dd, transparent: true, opacity: 0.9 })
      );
      const angle = (i / 8) * Math.PI * 2;
      tooth.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.3, 1.2);
      tooth.lookAt(0, 0, 2);
      ghostMaw.add(tooth);
    }
    ghostMaw.position.copy(startPos);
    ghostMaw.position.y += 1.5;
    ghostMaw.lookAt(startPos.clone().add(dir.clone().multiplyScalar(5)));
    game.scene.add(ghostMaw);
    particles.push(ghostMaw);

    // 无数怨灵（从四面八方涌向鬼口）
    const spiritCount = 40;
    const spirits = [];
    for (let s = 0; s < spiritCount; s++) {
      const spirit = createGhostFigure(0.4 + Math.random() * 0.3, 0.5);
      // 从随机方向远处出现
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 3;
      const dist = range * (0.7 + Math.random() * 0.5);
      spirit.position.set(
        startPos.x + Math.cos(angle) * dist,
        height,
        startPos.z + Math.sin(angle) * dist
      );
      spirit.userData.startPos = spirit.position.clone();
      spirit.userData.targetPos = startPos.clone();
      spirit.userData.targetPos.y = 1 + Math.random() * 0.5;
      spirit.userData.delay = Math.random() * 0.8;
      spirit.userData.baseOpacity = 0.4 + Math.random() * 0.3;
      spirit.userData.speed = 4 + Math.random() * 4;
      game.scene.add(spirit);
      particles.push(spirit);
      spirits.push(spirit);
    }

    // 噬魂漩涡（鬼口前方的吸扯效果）
    const vortexGroup = new THREE.Group();
    for (let r = 0; r < 6; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5 + r * 0.4, 0.05, 6, 24),
        new THREE.MeshBasicMaterial({ color: darkColors[r % 6], transparent: true, opacity: 0.6 })
      );
      ring.position.z = r * 0.3;
      ring.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.1 + r * 0.03);
      vortexGroup.add(ring);
    }
    vortexGroup.position.copy(startPos);
    vortexGroup.position.y += 1.5;
    vortexGroup.lookAt(startPos.clone().add(dir.clone().multiplyScalar(5)));
    game.scene.add(vortexGroup);
    particles.push(vortexGroup);

    // 灵魂粒子（被吞噬的光点）
    for (let i = 0; i < 60; i++) {
      const p = createMistParticle(startPos, 0.05 + Math.random() * 0.06, 0xdda0dd, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const dist = range * (0.5 + Math.random() * 0.8);
      p.position.x = startPos.x + Math.sin(phi) * Math.cos(angle) * dist;
      p.position.y = startPos.y + 1.5 + Math.cos(phi) * dist * 0.5;
      p.position.z = startPos.z + Math.sin(phi) * Math.sin(angle) * dist;
      const dirToMaw = new THREE.Vector3(
        startPos.x + dir.x * 2 - p.position.x,
        startPos.y + 1.5 - p.position.y,
        startPos.z + dir.z * 2 - p.position.z
      ).normalize();
      p.userData.vel = dirToMaw.multiplyScalar(3 + Math.random() * 5);
      p.userData.delay = Math.random() * 0.6;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 黑暗能量冲击波
    for (let r = 0; r < 5; r++) {
      const ring = _createRing(startPos, 0.5 + r * 0.4, darkColors[r % 6], 0.7);
      ring.position.y = 1.5;
      ring.userData.expandSpeed = 6 + r * 1.5;
      ring.userData.baseOpacity = 0.7;
      ring.userData.delay = 0.3 + r * 0.15;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 动画
    let life = duration;
    const maxLife = life;
    let elapsed = 0;
    const animate = () => {
      life -= 0.02;
      elapsed += 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const pulse = 0.75 + Math.sin(t * 10) * 0.25;
        const flicker = Math.random() > 0.2 ? 1 : 0.4;
        for (const p of particles) {
          if (p === ghostMaw) {
            // 鬼面脉动
            const mawScale = 0.8 + Math.sin(t * Math.PI) * 0.4;
            p.scale.setScalar(mawScale * pulse);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * (child.material.opacity || 0.8) * flicker;
              }
            });
          } else if (spirits.includes(p)) {
            // 怨灵被吸向鬼口
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.position.lerpVectors(p.userData.startPos, p.userData.targetPos, localT);
              p.scale.setScalar(1 - localT * 0.7);
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = (1 - localT) * p.userData.baseOpacity;
                }
              });
            } else {
              p.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                  child.material.opacity = 0;
                }
              });
            }
          } else if (p === vortexGroup) {
            p.children.forEach(child => {
              child.rotation.z += child.userData.rotSpeed;
              if (child.material) child.material.opacity = (life / maxLife) * 0.6 * flicker;
            });
            const vortexScale = 0.5 + Math.sin(t * Math.PI) * 0.8;
            p.scale.setScalar(vortexScale);
          } else if (p.userData.vel && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'SphereGeometry' && p.userData.baseOpacity === 0.9) {
            // 灵魂粒子被吞噬
            if (elapsed >= p.userData.delay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              p.scale.setScalar(1 - localT * 0.8);
              if (p.material) p.material.opacity = (1 - localT) * p.userData.baseOpacity;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          } else if (p.userData.expandSpeed !== undefined) {
            if (elapsed >= p.userData.delay) {
              const localT = (elapsed - p.userData.delay) / (maxLife - p.userData.delay);
              const expandDist = p.userData.expandSpeed * localT;
              p.scale.setScalar(1 + expandDist);
              if (p.material) p.material.opacity = (1 - localT) * (p.userData.baseOpacity || 0.7) * flicker;
            } else {
              if (p.material) p.material.opacity = 0;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        for (const p of particles) {
          if (typeof dispose3DObject === 'function') dispose3DObject(p);
          else if (p.parent) p.parent.remove(p);
        }
      }
    };
    animate();
    return;
  }
}

// ========== 5. 月刃技能特效 ==========
function spawnMoonBladeSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const moonColors = [0xe6e6fa, 0xf0f8ff, 0xffffff, 0xb0c4de, 0xc0c0c0];
  const up = new THREE.Vector3(0, 1, 0);

  // 创建半月刃几何体的辅助函数
  function _createMoonBlade(size, color, opacity) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -size);
    shape.quadraticCurveTo(size * 1.2, 0, 0, size);
    shape.quadraticCurveTo(size * 0.4, 0, 0, -size);
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    const mesh = new THREE.Mesh(geom, mat);
    return mesh;
  }

  // 清理函数
  function _cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  // ========== 第1魂技：月刃斩 - 一道半月刃气向前飞斩 ==========
  if (idx === 0) {
    const blade = _createMoonBlade(0.8, 0xe6e6fa, 0.95);
    blade.position.copy(startPos);
    blade.position.y += 0.8;
    blade.lookAt(startPos.clone().add(dir));
    blade.rotation.y += Math.PI / 2;
    blade.userData.speed = range * 0.08;
    blade.userData.spinSpeed = 0.4;
    game.scene.add(blade);
    particles.push(blade);

    // 尾迹月牙
    for (let i = 0; i < 5; i++) {
      const trail = _createMoonBlade(0.6 - i * 0.08, 0xffffff, 0.6 - i * 0.1);
      trail.position.copy(startPos);
      trail.position.y += 0.8;
      trail.lookAt(startPos.clone().add(dir));
      trail.rotation.y += Math.PI / 2;
      trail.userData.speed = range * 0.08 * (1 - i * 0.05);
      trail.userData.delay = i * 0.03;
      trail.userData.spinSpeed = 0.4;
      game.scene.add(trail);
      particles.push(trail);
    }

    let life = 0.6;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p.userData.delay && t < p.userData.delay / maxLife) continue;
          p.position.add(dir.clone().multiplyScalar(p.userData.speed));
          p.rotation.z += p.userData.spinSpeed;
          if (p.material) p.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.9);
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第2魂技：月光 - 月光从天空洒下，增强自身 ==========
  if (idx === 1) {
    // 天空中的月亮
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfffff0, transparent: true, opacity: 0.8 })
    );
    moon.position.copy(startPos);
    moon.position.y += 6;
    game.scene.add(moon);
    particles.push(moon);

    // 月光柱（从月亮洒下）
    const lightCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.5, 6, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xe6e6fa, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    lightCylinder.position.copy(startPos);
    lightCylinder.position.y += 3;
    game.scene.add(lightCylinder);
    particles.push(lightCylinder);

    // 环绕的光环
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8 + r * 0.3, 0.04, 8, 32),
        new THREE.MeshBasicMaterial({ color: moonColors[r % 5], transparent: true, opacity: 0.7 })
      );
      ring.position.copy(startPos);
      ring.position.y += 0.5 + r * 0.4;
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * 0.05;
      ring.userData.baseY = 0.5 + r * 0.4;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 飘落的月光粒子
    for (let i = 0; i < 30; i++) {
      const pColor = moonColors[Math.floor(Math.random() * moonColors.length)];
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.06, pColor, 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += 5 + Math.random() * 2;
      p.userData.vel = new THREE.Vector3(0, -(1 + Math.random() * 2), 0);
      p.userData.baseOpacity = 0.8;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === moon) {
            p.scale.setScalar(1 + Math.sin(t * 6) * 0.1);
            if (p.material) p.material.opacity = 0.8 * (life / maxLife);
          } else if (p === lightCylinder) {
            p.scale.x = 1 + Math.sin(t * 4) * 0.15;
            p.scale.z = 1 + Math.sin(t * 4) * 0.15;
            if (p.material) p.material.opacity = 0.4 * (life / maxLife);
          } else if (p.userData.rotSpeed !== undefined) {
            p.rotation.z += p.userData.rotSpeed;
            p.position.y = startPos.y + p.userData.baseY + Math.sin(t * 3) * 0.1;
            if (p.material) p.material.opacity = 0.7 * (life / maxLife);
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.position.y < startPos.y + 0.2) {
              p.position.y = startPos.y + 5 + Math.random();
            }
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第3魂技：双月同天 - 两轮月刃回旋切割 ==========
  if (idx === 2) {
    const bladePair = [];
    for (let b = 0; b < 2; b++) {
      const blade = _createMoonBlade(0.7, b === 0 ? 0xe6e6fa : 0xb0c4de, 0.9);
      blade.position.copy(startPos);
      blade.position.y += 0.8;
      blade.position.x += (b === 0 ? -1 : 1) * 0.5;
      blade.lookAt(startPos.clone().add(dir));
      blade.rotation.y += Math.PI / 2;
      blade.userData.side = b === 0 ? -1 : 1;
      blade.userData.phase = b * Math.PI;
      game.scene.add(blade);
      particles.push(blade);
      bladePair.push(blade);
    }

    // 中央光柱
    const centerBeam = _createBeam(startPos, up, 3, 0xffffff, 0.6);
    centerBeam.position.y += 1.5;
    game.scene.add(centerBeam);
    particles.push(centerBeam);

    // 双月轨迹粒子
    for (let i = 0; i < 20; i++) {
      const p = _createParticle(startPos, 0.05, moonColors[i % 5], 0.8);
      p.userData.orbitRadius = 1 + Math.random() * 0.5;
      p.userData.orbitSpeed = 2 + Math.random() * 2;
      p.userData.phase = Math.random() * Math.PI * 2;
      p.userData.baseY = 0.8 + (Math.random() - 0.5) * 0.5;
      p.userData.baseOpacity = 0.8;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 0.9;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const forwardDist = range * 0.5 * t;
        for (const p of particles) {
          if (bladePair.includes(p)) {
            // 螺旋前进
            const angle = t * 6 + p.userData.phase;
            const orbitR = 0.8 + Math.sin(t * 4) * 0.3;
            p.position.x = startPos.x + Math.cos(angle) * orbitR + dir.x * forwardDist;
            p.position.z = startPos.z + Math.sin(angle) * orbitR + dir.z * forwardDist;
            p.position.y = startPos.y + 0.8 + Math.sin(t * 3) * 0.2 + dir.y * forwardDist;
            p.lookAt(startPos.clone().add(dir).multiplyScalar(forwardDist / range));
            p.rotation.z += 0.3;
            if (p.material) p.material.opacity = 0.9 * (life / maxLife);
          } else if (p === centerBeam) {
            p.scale.y = 1 + Math.sin(t * 5) * 0.2;
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          } else if (p.userData.orbitRadius !== undefined) {
            const ang = t * p.userData.orbitSpeed * 2 + p.userData.phase;
            const r = p.userData.orbitRadius;
            p.position.x = startPos.x + Math.cos(ang) * r + dir.x * forwardDist;
            p.position.z = startPos.z + Math.sin(ang) * r + dir.z * forwardDist;
            p.position.y = startPos.y + p.userData.baseY + dir.y * forwardDist;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第4魂技：月刃连击 - 连续多道月刃飞射 ==========
  if (idx === 3) {
    const bladeCount = 7;
    for (let b = 0; b < bladeCount; b++) {
      const size = 0.5 + Math.random() * 0.3;
      const blade = _createMoonBlade(size, moonColors[b % 5], 0.85);
      blade.position.copy(startPos);
      blade.position.y += 0.8 + (Math.random() - 0.5) * 0.5;
      blade.position.x += (Math.random() - 0.5) * 0.6;
      blade.position.z += (Math.random() - 0.5) * 0.6;

      // 稍微散开的方向
      const spreadDir = dir.clone();
      spreadDir.x += (Math.random() - 0.5) * 0.3;
      spreadDir.y += (Math.random() - 0.5) * 0.2;
      spreadDir.normalize();
      blade.lookAt(startPos.clone().add(spreadDir));
      blade.rotation.y += Math.PI / 2;

      blade.userData.vel = spreadDir.multiplyScalar(range * 0.06 * (0.8 + Math.random() * 0.4));
      blade.userData.spinSpeed = 0.2 + Math.random() * 0.3;
      blade.userData.delay = b * 0.04;
      blade.userData.baseOpacity = 0.85;
      game.scene.add(blade);
      particles.push(blade);
    }

    // 发射点闪光
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
    );
    flash.position.copy(startPos);
    flash.position.y += 0.8;
    game.scene.add(flash);
    particles.push(flash);

    let life = 0.7;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === flash) {
            p.scale.setScalar(1 + t * 2);
            if (p.material) p.material.opacity = (1 - t) * (1 - t);
          } else if (p.userData.delay !== undefined) {
            if (t * maxLife < p.userData.delay) continue;
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.z += p.userData.spinSpeed;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第5魂技：月落星沉 - 月光如瀑倾泻而下，大范围攻击 ==========
  if (idx === 4) {
    // 天空巨大月亮
    const bigMoon = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfffff0, transparent: true, opacity: 0.9 })
    );
    bigMoon.position.copy(startPos);
    bigMoon.position.add(dir.clone().multiplyScalar(range * 0.5));
    bigMoon.position.y += 8;
    game.scene.add(bigMoon);
    particles.push(bigMoon);

    // 月光瀑布（多道光柱）
    const beamCount = 12;
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = Math.random() * range * 0.6;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 + Math.random() * 0.3, 0.3 + Math.random() * 0.4, 8, 8, 1, true),
        new THREE.MeshBasicMaterial({ color: moonColors[i % 5], transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      const targetX = startPos.x + dir.x * range * 0.5 + Math.cos(angle) * radius;
      const targetZ = startPos.z + dir.z * range * 0.5 + Math.sin(angle) * radius;
      beam.position.set(targetX, startPos.y + 4, targetZ);
      beam.userData.targetY = startPos.y + 0.2;
      beam.userData.baseOpacity = 0.5;
      game.scene.add(beam);
      particles.push(beam);
    }

    // 地面冲击环
    const impactRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.15, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
    );
    impactRing.position.copy(startPos);
    impactRing.position.add(dir.clone().multiplyScalar(range * 0.5));
    impactRing.position.y += 0.3;
    impactRing.rotation.x = Math.PI / 2;
    game.scene.add(impactRing);
    particles.push(impactRing);

    // 飞溅粒子
    for (let i = 0; i < 40; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.07, moonColors[i % 5], 0.8);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.5;
      p.position.x = startPos.x + dir.x * range * 0.5 + Math.cos(angle) * dist;
      p.position.z = startPos.z + dir.z * range * 0.5 + Math.sin(angle) * dist;
      p.position.y = startPos.y + 0.3;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (2 + Math.random() * 3),
        2 + Math.random() * 3,
        Math.sin(angle) * (2 + Math.random() * 3)
      );
      p.userData.gravity = -6;
      p.userData.baseOpacity = 0.8;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.0;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === bigMoon) {
            p.scale.setScalar(1 + Math.sin(t * 4) * 0.15);
            if (p.material) p.material.opacity = 0.9 * (life / maxLife);
          } else if (p === impactRing) {
            p.scale.setScalar(1 + t * range * 0.8);
            if (p.material) p.material.opacity = 0.8 * (life / maxLife);
          } else if (p.userData.gravity !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y += p.userData.gravity * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.targetY !== undefined) {
            p.scale.y = 1 + t * 0.5;
            p.position.y = startPos.y + 4 - t * 3.5;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第6魂技：月影 - 身影一闪，近身致命一击 ==========
  if (idx === 5) {
    // 残影（多个月刃虚影沿路径排列）
    const shadowCount = 5;
    const shadows = [];
    for (let s = 0; s < shadowCount; s++) {
      const shadowGroup = new THREE.Group();
      // 月刃
      const blade = _createMoonBlade(0.6, 0xe6e6fa, 0.5 - s * 0.08);
      blade.rotation.y = Math.PI / 2;
      shadowGroup.add(blade);
      // 人影轮廓
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.25, 0.8, 4, 8),
        new THREE.MeshBasicMaterial({ color: 0xb0c4de, transparent: true, opacity: 0.3 - s * 0.05 })
      );
      body.position.y = 0.4;
      shadowGroup.add(body);

      shadowGroup.position.copy(startPos);
      shadowGroup.position.y += 0.8;
      shadowGroup.userData.delay = s * 0.03;
      shadowGroup.userData.progress = s / shadowCount;
      game.scene.add(shadowGroup);
      particles.push(shadowGroup);
      shadows.push(shadowGroup);
    }

    // 终点的巨大斩击（半月形光刃）
    const finalBlade = _createMoonBlade(1.5, 0xffffff, 0);
    finalBlade.position.copy(startPos);
    finalBlade.position.add(dir.clone().multiplyScalar(range * 0.8));
    finalBlade.position.y += 0.8;
    finalBlade.lookAt(startPos.clone().add(dir));
    finalBlade.rotation.y += Math.PI / 2;
    game.scene.add(finalBlade);
    particles.push(finalBlade);

    // 冲刺轨迹线
    const trailPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      trailPoints.push(new THREE.Vector3(
        startPos.x + dir.x * range * 0.8 * t,
        startPos.y + 0.8 + Math.sin(t * Math.PI) * 0.3,
        startPos.z + dir.z * range * 0.8 * t
      ));
    }
    const trailGeom = new THREE.BufferGeometry().setFromPoints(trailPoints);
    const trailMat = new THREE.LineBasicMaterial({ color: 0xe6e6fa, transparent: true, opacity: 0.8 });
    const trailLine = new THREE.Line(trailGeom, trailMat);
    game.scene.add(trailLine);
    particles.push(trailLine);

    let life = 0.7;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 残影沿路径移动
        for (let s = 0; s < shadows.length; s++) {
          const shadow = shadows[s];
          const shadowT = Math.max(0, Math.min(1, (t - s * 0.08) / 0.6));
          if (shadowT > 0) {
            shadow.position.x = startPos.x + dir.x * range * 0.8 * shadowT;
            shadow.position.z = startPos.z + dir.z * range * 0.8 * shadowT;
            shadow.position.y = startPos.y + 0.8 + Math.sin(shadowT * Math.PI) * 0.3;
            shadow.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (0.5 - s * 0.08) * (1 - shadowT) * (life / maxLife);
              }
            });
          }
        }
        // 最终斩击在t=0.6时出现并扩大
        if (t > 0.5) {
          const bladeT = (t - 0.5) / 0.5;
          finalBlade.scale.setScalar(0.5 + bladeT * 1.5);
          finalBlade.rotation.z += 0.2;
          if (finalBlade.material) finalBlade.material.opacity = (1 - bladeT) * (life / maxLife);
        }
        // 轨迹线渐显
        if (trailLine.material) {
          trailLine.material.opacity = 0.8 * (1 - t) * (life / maxLife);
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第7魂技：月刃真身 - 巨大月刃现身，月光之力暴涨 ==========
  if (idx === 6) {
    // 巨大月刃真身
    const trueBladeGroup = new THREE.Group();

    // 主月刃
    const mainBlade = _createMoonBlade(2.5, 0xffffff, 0.9);
    mainBlade.rotation.y = Math.PI / 2;
    trueBladeGroup.add(mainBlade);

    // 外圈光晕环
    for (let r = 0; r < 3; r++) {
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(2.2 + r * 0.5, 2.4 + r * 0.5, 48),
        new THREE.MeshBasicMaterial({ color: moonColors[r], transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      );
      halo.rotation.y = Math.PI / 2;
      halo.userData.rotDir = r % 2 === 0 ? 1 : -1;
      trueBladeGroup.add(halo);
    }

    // 环绕的小月刃
    for (let i = 0; i < 6; i++) {
      const miniBlade = _createMoonBlade(0.4, moonColors[i % 5], 0.8);
      const angle = (i / 6) * Math.PI * 2;
      miniBlade.position.set(Math.cos(angle) * 1.8, Math.sin(angle * 2) * 0.5, Math.sin(angle) * 1.8);
      miniBlade.rotation.y = Math.PI / 2;
      miniBlade.userData.orbitAngle = angle;
      miniBlade.userData.orbitRadius = 1.8;
      trueBladeGroup.add(miniBlade);
    }

    trueBladeGroup.position.copy(startPos);
    trueBladeGroup.position.add(dir.clone().multiplyScalar(range * 0.4));
    trueBladeGroup.position.y += 1.5;
    trueBladeGroup.scale.setScalar(0);
    game.scene.add(trueBladeGroup);
    particles.push(trueBladeGroup);

    // 爆发粒子
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, moonColors[i % 5], 0.9);
      p.position.copy(startPos);
      p.position.y += 1;
      const angle = Math.random() * Math.PI * 2;
      const vertAngle = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 5;
      p.userData.vel = new THREE.Vector3(
        Math.sin(vertAngle) * Math.cos(angle) * speed,
        Math.cos(vertAngle) * speed,
        Math.sin(vertAngle) * Math.sin(angle) * speed
      );
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面光环
    const groundRing = _createRing(startPos, 0.5, 0xffffff, 0.7);
    groundRing.position.y = 0.1;
    game.scene.add(groundRing);
    particles.push(groundRing);

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 月刃真身显现
        if (t < 0.3) {
          const appearT = t / 0.3;
          trueBladeGroup.scale.setScalar(appearT * appearT);
        } else {
          trueBladeGroup.scale.setScalar(1 + Math.sin((t - 0.3) * 8) * 0.1);
        }
        trueBladeGroup.position.y = startPos.y + 1.5 + Math.sin(t * 3) * 0.3;

        // 光环旋转
        trueBladeGroup.children.forEach((child, i) => {
          if (child.userData.rotDir !== undefined) {
            child.rotation.z += child.userData.rotDir * 0.03;
            if (child.material) child.material.opacity = 0.5 * (life / maxLife);
          } else if (child.userData.orbitAngle !== undefined) {
            const ang = child.userData.orbitAngle + t * 4;
            const r = child.userData.orbitRadius;
            child.position.set(Math.cos(ang) * r, Math.sin(ang * 2) * 0.5, Math.sin(ang) * r);
            child.rotation.z += 0.2;
            if (child.material) child.material.opacity = 0.8 * (life / maxLife);
          } else if (child === mainBlade) {
            child.rotation.z += 0.05;
            if (child.material) child.material.opacity = 0.9 * (life / maxLife);
          }
        });

        // 粒子扩散
        for (const p of particles) {
          if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.multiplyScalar(0.97);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }

        // 地面光环
        groundRing.scale.setScalar(1 + t * range * 0.5);
        if (groundRing.material) groundRing.material.opacity = 0.7 * (life / maxLife);

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第8魂技：皎月领域 - 领域展开，月光持续灼烧 ==========
  if (idx === 7) {
    // 领域半球罩
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xe6e6fa, transparent: true, opacity: 0.25, side: THREE.DoubleSide, wireframe: false })
    );
    dome.position.copy(startPos);
    dome.position.y += 0.1;
    game.scene.add(dome);
    particles.push(dome);

    // 领域线框
    const wireDome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, wireframe: true })
    );
    wireDome.position.copy(startPos);
    wireDome.position.y += 0.1;
    game.scene.add(wireDome);
    particles.push(wireDome);

    // 顶部月亮
    const domainMoon = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xfffff0, transparent: true, opacity: 0.9 })
    );
    domainMoon.position.copy(startPos);
    domainMoon.position.y += range * 0.6;
    game.scene.add(domainMoon);
    particles.push(domainMoon);

    // 领域内持续生成的月光粒子
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.05, moonColors[i % 5], 0.7);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      p.position.x = startPos.x + Math.cos(angle) * dist;
      p.position.z = startPos.z + Math.sin(angle) * dist;
      p.position.y = startPos.y + Math.random() * range * 0.5;
      p.userData.floatSpeed = 0.5 + Math.random();
      p.userData.floatDir = Math.random() > 0.5 ? 1 : -1;
      p.userData.baseY = p.position.y - startPos.y;
      p.userData.orbitSpeed = (Math.random() - 0.5) * 0.5;
      p.userData.angle = angle;
      p.userData.dist = dist;
      p.userData.baseOpacity = 0.7;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面月纹
    for (let r = 0; r < 4; r++) {
      const ring = _createRing(startPos, range * 0.15 * (r + 1), moonColors[r % 5], 0.5);
      ring.position.y = 0.15;
      ring.userData.pulsePhase = r * 0.5;
      game.scene.add(ring);
      particles.push(ring);
    }

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 领域展开
        const expandT = Math.min(1, t * 3);
        const domeScale = expandT;
        dome.scale.setScalar(domeScale);
        wireDome.scale.setScalar(domeScale);

        // 月亮脉动
        domainMoon.scale.setScalar(1 + Math.sin(t * 4) * 0.2);
        if (domainMoon.material) domainMoon.material.opacity = 0.9 * (life / maxLife);

        // 粒子漂浮+旋转
        for (const p of particles) {
          if (p.userData.floatSpeed !== undefined) {
            p.userData.angle += p.userData.orbitSpeed * 0.02;
            p.position.x = startPos.x + Math.cos(p.userData.angle) * p.userData.dist * domeScale;
            p.position.z = startPos.z + Math.sin(p.userData.angle) * p.userData.dist * domeScale;
            p.position.y = startPos.y + p.userData.baseY + Math.sin(t * 3 + p.userData.baseY) * 0.3;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.pulsePhase !== undefined) {
            const pulse = 1 + Math.sin(t * 3 + p.userData.pulsePhase) * 0.1;
            p.scale.setScalar(domeScale * pulse);
            if (p.material) p.material.opacity = 0.5 * (life / maxLife);
          }
        }

        if (dome.material) dome.material.opacity = 0.25 * (life / maxLife);
        if (wireDome.material) wireDome.material.opacity = 0.4 * (life / maxLife);

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第9魂技：月神之怒 - 终极奥义，月神降临，月光审判 ==========
  if (idx === 8) {
    // 天空巨型满月
    const godMoon = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xfffff0, transparent: true, opacity: 1 })
    );
    godMoon.position.copy(startPos);
    godMoon.position.add(dir.clone().multiplyScalar(range * 0.5));
    godMoon.position.y += 10;
    game.scene.add(godMoon);
    particles.push(godMoon);

    // 月神光环（多层）
    for (let r = 0; r < 5; r++) {
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(3.8 + r * 0.6, 4.0 + r * 0.6, 64),
        new THREE.MeshBasicMaterial({ color: moonColors[r % 5], transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      halo.position.copy(godMoon.position);
      halo.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.02 + r * 0.01);
      game.scene.add(halo);
      particles.push(halo);
    }

    // 审判光柱（从天而降的巨型光柱）
    const judgmentBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2.5, 12, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    judgmentBeam.position.copy(godMoon.position);
    judgmentBeam.position.y -= 6;
    game.scene.add(judgmentBeam);
    particles.push(judgmentBeam);

    // 光柱内的能量粒子
    for (let i = 0; i < 80; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, moonColors[i % 5], 0);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 1.5;
      p.position.x = godMoon.position.x + Math.cos(angle) * dist;
      p.position.z = godMoon.position.z + Math.sin(angle) * dist;
      p.position.y = godMoon.position.y - 1 - Math.random() * 10;
      p.userData.vel = new THREE.Vector3(0, -(3 + Math.random() * 4), 0);
      p.userData.startDelay = Math.random() * 0.3;
      p.userData.baseOpacity = 0.9;
      p.userData.angle = angle;
      p.userData.dist = dist;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面巨型冲击阵
    const impactArray = [];
    for (let r = 0; r < 6; r++) {
      const ring = _createRing(
        new THREE.Vector3(godMoon.position.x, startPos.y + 0.2, godMoon.position.z),
        0.5 + r * 0.8,
        moonColors[r % 5],
        0.7
      );
      ring.userData.delay = r * 0.04;
      game.scene.add(ring);
      particles.push(ring);
      impactArray.push(ring);
    }

    // 爆发粒子
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.1, moonColors[i % 5], 0);
      p.position.set(godMoon.position.x, startPos.y + 0.3, godMoon.position.z);
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        3 + Math.random() * 5,
        Math.sin(angle) * speed
      );
      p.userData.gravity = -8;
      p.userData.startDelay = 0.4 + Math.random() * 0.2;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 月亮脉动增强
        godMoon.scale.setScalar(1 + Math.sin(t * 5) * 0.2);
        if (godMoon.material) godMoon.material.opacity = Math.min(1, t * 3) * (life / maxLife);

        // 光环旋转
        for (const p of particles) {
          if (p.userData.rotSpeed !== undefined) {
            p.rotation.z += p.userData.rotSpeed;
            p.position.copy(godMoon.position);
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          }
        }

        // 审判光柱在t=0.2时出现
        if (t > 0.15) {
          const beamT = (t - 0.15) / 0.85;
          judgmentBeam.scale.x = 1 + Math.sin(t * 6) * 0.2;
          judgmentBeam.scale.z = 1 + Math.sin(t * 6) * 0.2;
          if (judgmentBeam.material) {
            judgmentBeam.material.opacity = 0.6 * Math.min(1, beamT * 3) * (life / maxLife);
          }

          // 能量粒子下落
          for (const p of particles) {
            if (p.userData.startDelay !== undefined && p.userData.gravity === undefined && p.userData.vel) {
              if (t > p.userData.startDelay) {
                p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
                p.userData.angle += 0.02;
                p.position.x = godMoon.position.x + Math.cos(p.userData.angle) * p.userData.dist * (1 + t * 0.5);
                p.position.z = godMoon.position.z + Math.sin(p.userData.angle) * p.userData.dist * (1 + t * 0.5);
                if (p.position.y < startPos.y + 0.3) {
                  p.position.y = godMoon.position.y - 1;
                }
                if (p.material) {
                  const pt = (t - p.userData.startDelay) / (1 - p.userData.startDelay);
                  p.material.opacity = Math.sin(pt * Math.PI) * p.userData.baseOpacity * (life / maxLife);
                }
              }
            }
          }
        }

        // 地面冲击环在t=0.4时开始扩散
        if (t > 0.35) {
          const impactT = (t - 0.35) / 0.65;
          for (let r = 0; r < impactArray.length; r++) {
            const ring = impactArray[r];
            if (impactT > ring.userData.delay) {
              const rt = (impactT - ring.userData.delay) / (1 - ring.userData.delay);
              ring.scale.setScalar(1 + rt * range * 0.4);
              if (ring.material) ring.material.opacity = 0.7 * (1 - rt) * (life / maxLife);
            }
          }
        }

        // 爆发粒子
        for (const p of particles) {
          if (p.userData.gravity !== undefined) {
            if (t > p.userData.startDelay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y += p.userData.gravity * 0.02;
              if (p.material) {
                const pt = (t - p.userData.startDelay) / (1 - p.userData.startDelay);
                p.material.opacity = (1 - pt) * p.userData.baseOpacity * (life / maxLife);
              }
            }
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }
}

// ========== 6. 火凤凰技能特效 ==========
function spawnFirePhoenixSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const fireColors = [0xff4500, 0xff6600, 0xff0000, 0xffd700, 0xff8c00];
  const up = new THREE.Vector3(0, 1, 0);

  // 创建凤凰模型的辅助函数
  function _createPhoenixModel(scale, bodyOpacity, wingOpacity) {
    const group = new THREE.Group();
    // 身体
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.5 * scale, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: bodyOpacity })
    );
    body.scale.set(1, 0.8, 1.5);
    body.position.y = 0.3 * scale;
    body.userData.type = 'body';
    group.add(body);
    // 头部
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 * scale, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: bodyOpacity + 0.1 })
    );
    head.position.set(0, 0.5 * scale, 0.6 * scale);
    head.userData.type = 'head';
    group.add(head);
    // 喙
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.08 * scale, 0.2 * scale, 4),
      new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: bodyOpacity + 0.2 })
    );
    beak.position.set(0, 0.45 * scale, 0.8 * scale);
    beak.rotation.x = Math.PI / 2;
    beak.userData.type = 'beak';
    group.add(beak);
    // 左翅
    const leftWing = new THREE.Mesh(
      new THREE.ConeGeometry(0.6 * scale, 1.5 * scale, 8),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: wingOpacity })
    );
    leftWing.position.set(-0.8 * scale, 0.3 * scale, 0);
    leftWing.rotation.z = Math.PI / 2;
    leftWing.rotation.y = -0.4;
    leftWing.scale.set(1, 1, 0.3);
    leftWing.userData.type = 'leftWing';
    group.add(leftWing);
    // 右翅
    const rightWing = new THREE.Mesh(
      new THREE.ConeGeometry(0.6 * scale, 1.5 * scale, 8),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: wingOpacity })
    );
    rightWing.position.set(0.8 * scale, 0.3 * scale, 0);
    rightWing.rotation.z = -Math.PI / 2;
    rightWing.rotation.y = 0.4;
    rightWing.scale.set(1, 1, 0.3);
    rightWing.userData.type = 'rightWing';
    group.add(rightWing);
    // 尾羽
    for (let t = 0; t < 3; t++) {
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 * scale, 1.2 * scale, 6),
        new THREE.MeshBasicMaterial({ color: fireColors[t], transparent: true, opacity: wingOpacity })
      );
      tail.position.set((t - 1) * 0.2 * scale, 0.2 * scale, -0.8 * scale);
      tail.rotation.x = -Math.PI / 4 - t * 0.1;
      tail.rotation.z = (t - 1) * 0.2;
      tail.userData.type = 'tail';
      group.add(tail);
    }
    return group;
  }

  // 翅膀扇动
  function _flapWings(group, t) {
    const wingFlap = Math.sin(t * 15) * 0.4;
    group.children.forEach(child => {
      if (child.userData.type === 'leftWing') child.rotation.z = Math.PI / 2 + wingFlap;
      if (child.userData.type === 'rightWing') child.rotation.z = -Math.PI / 2 - wingFlap;
    });
  }

  // 清理函数
  function _cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  // ========== 第1魂技：凤凰火线 - 喷射一道灼热火焰射线 ==========
  if (idx === 0) {
    // 火焰射线（圆柱）
    const fireRay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.3, range, 12),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 })
    );
    fireRay.position.copy(startPos);
    fireRay.position.y += 0.8;
    fireRay.position.add(dir.clone().multiplyScalar(range / 2));
    const rayUp = new THREE.Vector3(0, 1, 0);
    fireRay.quaternion.setFromUnitVectors(rayUp, dir.clone().normalize());
    game.scene.add(fireRay);
    particles.push(fireRay);

    // 内核射线（更亮的核心）
    const coreRay = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.12, range, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.95 })
    );
    coreRay.position.copy(fireRay.position);
    coreRay.quaternion.copy(fireRay.quaternion);
    game.scene.add(coreRay);
    particles.push(coreRay);

    // 喷射口火焰
    const muzzleFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 1 })
    );
    muzzleFlash.position.copy(startPos);
    muzzleFlash.position.y += 0.8;
    game.scene.add(muzzleFlash);
    particles.push(muzzleFlash);

    // 周围飞溅的火星
    for (let i = 0; i < 20; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.06, fireColors[i % 5], 0.9);
      p.position.y += 0.8;
      const spreadDir = dir.clone();
      spreadDir.x += (Math.random() - 0.5) * 0.8;
      spreadDir.y += (Math.random() - 0.5) * 0.5;
      spreadDir.normalize();
      p.userData.vel = spreadDir.multiplyScalar(range * 0.05 * (0.5 + Math.random() * 0.5));
      p.userData.baseOpacity = 0.9;
      p.userData.gravity = -3;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 0.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 射线长度延伸后保持
        const lengthT = Math.min(1, t * 4);
        fireRay.scale.y = lengthT;
        coreRay.scale.y = lengthT;
        // 脉动
        fireRay.scale.x = 1 + Math.sin(t * 20) * 0.2;
        fireRay.scale.z = 1 + Math.sin(t * 20) * 0.2;
        coreRay.scale.x = 1 + Math.sin(t * 20 + 1) * 0.3;
        coreRay.scale.z = 1 + Math.sin(t * 20 + 1) * 0.3;

        if (fireRay.material) fireRay.material.opacity = 0.8 * (life / maxLife);
        if (coreRay.material) coreRay.material.opacity = 0.95 * (life / maxLife);

        // 喷射口
        muzzleFlash.scale.setScalar(1 + Math.sin(t * 20) * 0.3);
        if (muzzleFlash.material) muzzleFlash.material.opacity = (1 - t) * (1 - t);

        // 火星
        for (const p of particles) {
          if (p.userData.vel && p.userData.gravity !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y += p.userData.gravity * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第2魂技：凤凰火羽 - 火焰羽毛四散飞射 ==========
  if (idx === 1) {
    // 多根火焰羽毛向四周飞射
    const featherCount = 20;
    for (let f = 0; f < featherCount; f++) {
      const featherGroup = new THREE.Group();
      // 羽毛主体（拉长的圆锥）
      const feather = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.5, 6),
        new THREE.MeshBasicMaterial({ color: fireColors[f % 5], transparent: true, opacity: 0.9 })
      );
      feather.rotation.x = Math.PI;
      featherGroup.add(feather);
      // 羽毛中轴
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.95 })
      );
      featherGroup.add(shaft);

      featherGroup.position.copy(startPos);
      featherGroup.position.y += 1;

      // 随机方向（球形发散）
      const angleH = Math.random() * Math.PI * 2;
      const angleV = Math.random() * Math.PI * 0.6 + 0.2;
      const speed = 3 + Math.random() * 4;
      const velDir = new THREE.Vector3(
        Math.sin(angleV) * Math.cos(angleH),
        Math.cos(angleV),
        Math.sin(angleV) * Math.sin(angleH)
      );
      featherGroup.lookAt(featherGroup.position.clone().add(velDir));
      featherGroup.rotateX(Math.PI / 2);

      featherGroup.userData.vel = velDir.multiplyScalar(speed);
      featherGroup.userData.gravity = -4;
      featherGroup.userData.spin = (Math.random() - 0.5) * 0.3;
      featherGroup.userData.baseOpacity = 0.9;
      game.scene.add(featherGroup);
      particles.push(featherGroup);
    }

    // 中央爆发闪光
    const burst = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 })
    );
    burst.position.copy(startPos);
    burst.position.y += 1;
    game.scene.add(burst);
    particles.push(burst);

    // 爆发冲击波环
    const shockwave = _createRing(startPos, 0.3, 0xff6600, 0.8);
    shockwave.position.y = 1;
    shockwave.rotation.x = Math.random() * Math.PI;
    game.scene.add(shockwave);
    particles.push(shockwave);

    let life = 0.8;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === burst) {
            p.scale.setScalar(1 + t * 2);
            if (p.material) p.material.opacity = (1 - t) * (1 - t);
          } else if (p === shockwave) {
            p.scale.setScalar(1 + t * range * 0.8);
            if (p.material) p.material.opacity = 0.8 * (1 - t);
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y += p.userData.gravity * 0.02;
            p.rotation.z += p.userData.spin;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.9);
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第3魂技：凤凰火焰柱 - 凝聚火焰柱向前贯穿 ==========
  if (idx === 2) {
    // 主火焰柱
    const pillarGroup = new THREE.Group();

    // 外层火焰柱
    const outerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, range, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    outerPillar.position.y = range / 2;
    pillarGroup.add(outerPillar);

    // 中层火焰
    const midPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, range, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff8c00, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
    );
    midPillar.position.y = range / 2;
    pillarGroup.add(midPillar);

    // 内核心
    const innerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, range, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.95 })
    );
    innerPillar.position.y = range / 2;
    pillarGroup.add(innerPillar);

    pillarGroup.position.copy(startPos);
    pillarGroup.position.y += 0.8;
    // 朝向方向
    const pillarUp = new THREE.Vector3(0, 1, 0);
    pillarGroup.quaternion.setFromUnitVectors(pillarUp, dir.clone().normalize());
    pillarGroup.scale.set(0, 0, 0);
    game.scene.add(pillarGroup);
    particles.push(pillarGroup);

    // 环绕的火焰球
    for (let i = 0; i < 15; i++) {
      const fireball = _createParticle(startPos, 0.08 + Math.random() * 0.08, fireColors[i % 5], 0.9);
      fireball.userData.orbitRadius = 0.6 + Math.random() * 0.4;
      fireball.userData.orbitSpeed = (2 + Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
      fireball.userData.phase = Math.random() * Math.PI * 2;
      fireball.userData.forwardPos = Math.random() * range;
      fireball.userData.baseOpacity = 0.9;
      game.scene.add(fireball);
      particles.push(fireball);
    }

    // 发射点火球
    const launchFire = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 1 })
    );
    launchFire.position.copy(startPos);
    launchFire.position.y += 0.8;
    game.scene.add(launchFire);
    particles.push(launchFire);

    let life = 0.9;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 火焰柱凝聚并发射
        if (t < 0.2) {
          // 凝聚阶段
          const chargeT = t / 0.2;
          pillarGroup.scale.set(chargeT * 0.5, 0.1, chargeT * 0.5);
        } else {
          // 发射阶段
          const fireT = (t - 0.2) / 0.8;
          pillarGroup.scale.y = fireT;
          pillarGroup.scale.x = 0.5 + Math.sin(t * 15) * 0.15;
          pillarGroup.scale.z = 0.5 + Math.sin(t * 15 + 1) * 0.15;
        }

        pillarGroup.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity *= (life / maxLife);
          }
        });

        // 环绕火球沿柱体运动
        for (const p of particles) {
          if (p.userData.orbitRadius !== undefined) {
            const ang = t * p.userData.orbitSpeed * 3 + p.userData.phase;
            const r = p.userData.orbitRadius * pillarGroup.scale.x;
            const forwardDist = (p.userData.forwardPos + t * range * 0.5) % range;
            // 计算相对于柱体的位置
            const tangent = new THREE.Vector3().crossVectors(dir, up).normalize();
            const normal = new THREE.Vector3().crossVectors(dir, tangent).normalize();
            p.position.x = startPos.x + dir.x * forwardDist + tangent.x * Math.cos(ang) * r + normal.x * Math.sin(ang) * r;
            p.position.y = startPos.y + 0.8 + dir.y * forwardDist + tangent.y * Math.cos(ang) * r + normal.y * Math.sin(ang) * r;
            p.position.z = startPos.z + dir.z * forwardDist + tangent.z * Math.cos(ang) * r + normal.z * Math.sin(ang) * r;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }

        // 发射点
        launchFire.scale.setScalar(1 + Math.sin(t * 20) * 0.3);
        if (launchFire.material) launchFire.material.opacity = (life / maxLife) * (1 - t * 0.5);

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第4魂技：凤凰化 - 全身火焰环绕，凤凰附体 ==========
  if (idx === 3) {
    // 凤凰虚影（环绕在角色周围）
    const phoenix = _createPhoenixModel(1.2, 0.6, 0.5);
    phoenix.position.copy(startPos);
    phoenix.position.y += 0.8;
    phoenix.scale.setScalar(0);
    game.scene.add(phoenix);
    particles.push(phoenix);

    // 多层火焰光环（环绕身体）
    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.6 + r * 0.15, 0.06, 8, 32),
        new THREE.MeshBasicMaterial({ color: fireColors[r % 5], transparent: true, opacity: 0.7 })
      );
      ring.position.copy(startPos);
      ring.position.y += 0.3 + r * 0.35;
      ring.rotation.x = Math.PI / 2;
      ring.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.05 + r * 0.02);
      ring.userData.baseY = 0.3 + r * 0.35;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 升腾的火焰粒子
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.1, fireColors[i % 5], 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 0.5;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y += Math.random() * 0.5;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 1
      );
      p.userData.baseOpacity = 0.9;
      p.userData.gravity = -2;
      game.scene.add(p);
      particles.push(p);
    }

    // 凤凰翅膀火焰尾迹
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, fireColors[i % 5], 0.8);
      p.userData.wingSide = i % 2 === 0 ? -1 : 1;
      p.userData.phase = Math.random() * Math.PI * 2;
      p.userData.baseOpacity = 0.8;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 凤凰虚影显现并环绕
        const appearT = Math.min(1, t * 3);
        phoenix.scale.setScalar(appearT * 1.5);
        phoenix.position.y = startPos.y + 0.8 + Math.sin(t * 3) * 0.2;
        phoenix.rotation.y = t * 2;
        _flapWings(phoenix, t);
        phoenix.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            const base = child.userData.type === 'beak' ? 0.8 : (child.userData.type === 'tail' ? 0.5 : 0.6);
            child.material.opacity = base * (life / maxLife);
          }
        });

        // 光环旋转
        for (const p of particles) {
          if (p.userData.rotSpeed !== undefined) {
            p.rotation.z += p.userData.rotSpeed;
            p.position.y = startPos.y + p.userData.baseY + Math.sin(t * 3 + p.userData.baseY) * 0.1;
            if (p.material) p.material.opacity = 0.7 * (life / maxLife);
          } else if (p.userData.vel && p.userData.gravity !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y += p.userData.gravity * 0.02;
            if (p.position.y > startPos.y + 2.5) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 0.3 + Math.random() * 0.5;
              p.position.x = startPos.x + Math.cos(angle) * dist;
              p.position.z = startPos.z + Math.sin(angle) * dist;
              p.position.y = startPos.y;
              p.userData.vel.y = 2 + Math.random() * 3;
            }
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.wingSide !== undefined) {
            // 翅膀尾迹粒子
            const wingT = (t * 3 + p.userData.phase) % 1;
            const wingX = p.userData.wingSide * (0.8 + wingT * 1.5);
            const wingY = 0.5 + Math.sin(wingT * Math.PI) * 0.5;
            const wingZ = -wingT * 1.5;
            p.position.set(
              startPos.x + wingX * Math.cos(phoenix.rotation.y) + wingZ * Math.sin(phoenix.rotation.y),
              startPos.y + 0.8 + wingY,
              startPos.z + wingZ * Math.cos(phoenix.rotation.y) - wingX * Math.sin(phoenix.rotation.y)
            );
            if (p.material) p.material.opacity = (1 - wingT) * (life / maxLife) * p.userData.baseOpacity;
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第5魂技：凤凰流星雨 - 火焰流星从天而降 ==========
  if (idx === 4) {
    // 多颗火焰流星
    const meteorCount = 15;
    const meteors = [];
    for (let m = 0; m < meteorCount; m++) {
      const meteorGroup = new THREE.Group();

      // 流星头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 })
      );
      meteorGroup.add(head);

      // 流星尾焰（圆锥）
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 1 + Math.random() * 0.5, 8),
        new THREE.MeshBasicMaterial({ color: fireColors[m % 5], transparent: true, opacity: 0.8 })
      );
      tail.position.y = 0.7;
      tail.rotation.x = Math.PI;
      meteorGroup.add(tail);

      // 随机天空位置
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.7;
      const targetX = startPos.x + dir.x * range * 0.5 + Math.cos(angle) * dist;
      const targetZ = startPos.z + dir.z * range * 0.5 + Math.sin(angle) * dist;
      meteorGroup.position.set(targetX, startPos.y + 8 + Math.random() * 4, targetZ);

      // 下落方向（带角度）
      meteorGroup.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        -(6 + Math.random() * 4),
        (Math.random() - 0.5) * 1
      );
      meteorGroup.userData.targetY = startPos.y + 0.3;
      meteorGroup.userData.baseOpacity = 0.9;
      meteorGroup.userData.delay = Math.random() * 0.3;

      game.scene.add(meteorGroup);
      particles.push(meteorGroup);
      meteors.push(meteorGroup);
    }

    // 地面冲击（多个爆炸点）
    const explosionCount = 8;
    const explosions = [];
    for (let e = 0; e < explosionCount; e++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      const ex = startPos.x + dir.x * range * 0.5 + Math.cos(angle) * dist;
      const ez = startPos.z + dir.z * range * 0.5 + Math.sin(angle) * dist;

      const exRing = _createRing(new THREE.Vector3(ex, startPos.y + 0.2, ez), 0.3, fireColors[e % 5], 0.8);
      exRing.userData.delay = 0.4 + Math.random() * 0.3;
      game.scene.add(exRing);
      particles.push(exRing);
      explosions.push(exRing);
    }

    // 爆炸飞溅粒子
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, fireColors[i % 5], 0);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      p.userData.targetX = startPos.x + dir.x * range * 0.5 + Math.cos(angle) * dist;
      p.userData.targetZ = startPos.z + dir.z * range * 0.5 + Math.sin(angle) * dist;
      const spreadAngle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      p.userData.vel = new THREE.Vector3(
        Math.cos(spreadAngle) * speed,
        2 + Math.random() * 4,
        Math.sin(spreadAngle) * speed
      );
      p.userData.gravity = -6;
      p.userData.startDelay = 0.5 + Math.random() * 0.3;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 流星下落
        for (const meteor of meteors) {
          if (t < meteor.userData.delay) continue;
          const mt = (t - meteor.userData.delay) / (1 - meteor.userData.delay);
          meteor.position.add(meteor.userData.vel.clone().multiplyScalar(0.02));
          meteor.rotation.x = Math.atan2(meteor.userData.vel.y, Math.sqrt(meteor.userData.vel.x ** 2 + meteor.userData.vel.z ** 2)) - Math.PI / 2;

          meteor.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = (1 - mt * 0.5) * (life / maxLife);
            }
          });

          // 到达地面后消失
          if (meteor.position.y < meteor.userData.targetY) {
            meteor.visible = false;
          }
        }

        // 爆炸环
        for (const ex of explosions) {
          if (t > ex.userData.delay) {
            const et = (t - ex.userData.delay) / (1 - ex.userData.delay);
            ex.scale.setScalar(1 + et * range * 0.3);
            if (ex.material) ex.material.opacity = 0.8 * (1 - et) * (life / maxLife);
          }
        }

        // 飞溅粒子
        for (const p of particles) {
          if (p.userData.startDelay !== undefined && p.userData.targetX !== undefined) {
            if (t > p.userData.startDelay) {
              if (p.position.x === startPos.x && p.position.y === startPos.y) {
                p.position.x = p.userData.targetX;
                p.position.z = p.userData.targetZ;
                p.position.y = startPos.y + 0.3;
              }
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y += p.userData.gravity * 0.02;
              const pt = (t - p.userData.startDelay) / (1 - p.userData.startDelay);
              if (p.material) p.material.opacity = (1 - pt) * p.userData.baseOpacity * (life / maxLife);
            }
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第6魂技：凤凰烈焰击 - 强力火焰弹，爆炸伤害 ==========
  if (idx === 5) {
    // 火焰弹（向前飞行）
    const fireballGroup = new THREE.Group();

    // 核心
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 })
    );
    fireballGroup.add(core);

    // 外层火焰
    const outerFire = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.7 })
    );
    fireballGroup.add(outerFire);

    // 火焰尖刺（多个圆锥表示火焰外焰）
    for (let i = 0; i < 8; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.5, 6),
        new THREE.MeshBasicMaterial({ color: fireColors[i % 5], transparent: true, opacity: 0.8 })
      );
      const angle1 = (i / 8) * Math.PI * 2;
      const angle2 = Math.random() * Math.PI;
      spike.position.set(
        Math.sin(angle2) * Math.cos(angle1) * 0.5,
        Math.cos(angle2) * 0.5,
        Math.sin(angle2) * Math.sin(angle1) * 0.5
      );
      spike.lookAt(spike.position.clone().multiplyScalar(2));
      fireballGroup.add(spike);
    }

    // 尾焰
    const tailGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const tailRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 - i * 0.04, 0.06, 6, 16),
        new THREE.MeshBasicMaterial({ color: fireColors[i % 5], transparent: true, opacity: 0.6 - i * 0.1 })
      );
      tailRing.position.z = -0.3 - i * 0.3;
      tailRing.userData.tailIdx = i;
      tailGroup.add(tailRing);
    }
    fireballGroup.add(tailGroup);

    fireballGroup.position.copy(startPos);
    fireballGroup.position.y += 0.8;
    fireballGroup.lookAt(startPos.clone().add(dir));
    game.scene.add(fireballGroup);
    particles.push(fireballGroup);

    // 拖尾粒子
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, fireColors[i % 5], 0);
      p.userData.trail = true;
      p.userData.baseOpacity = 0.8;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 0.9;
    const maxLife = life;
    let exploded = false;
    const explodeDistance = range * 0.8;
    let traveled = 0;

    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        if (!exploded) {
          // 火焰弹飞行
          const speed = range * 0.04;
          fireballGroup.position.add(dir.clone().multiplyScalar(speed));
          traveled += speed;

          // 火焰脉动
          core.scale.setScalar(1 + Math.sin(t * 20) * 0.15);
          outerFire.scale.setScalar(1 + Math.sin(t * 18 + 1) * 0.2);

          // 尾焰拉长
          tailGroup.scale.z = 1 + t * 2;
          tailGroup.children.forEach((ring, i) => {
            ring.scale.setScalar(1 + t * 0.5 + i * 0.1);
          });

          // 拖尾粒子
          let trailIdx = 0;
          for (const p of particles) {
            if (p.userData.trail && trailIdx < 25) {
              if (Math.random() < 0.5) {
                p.position.copy(fireballGroup.position);
                p.position.x += (Math.random() - 0.5) * 0.4;
                p.position.y += (Math.random() - 0.5) * 0.4;
                p.position.z += (Math.random() - 0.5) * 0.4;
                p.userData.vel = dir.clone().multiplyScalar(-range * 0.02);
                p.userData.vel.x += (Math.random() - 0.5) * 0.5;
                p.userData.vel.y += (Math.random() - 0.5) * 0.5;
                if (p.material) p.material.opacity = p.userData.baseOpacity;
              }
              if (p.userData.vel) {
                p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
                if (p.material) p.material.opacity *= 0.95;
              }
              trailIdx++;
            }
          }

          // 到达目标距离时爆炸
          if (traveled >= explodeDistance) {
            exploded = true;
            fireballGroup.visible = false;

            // 创建爆炸效果
            // 爆炸闪光
            const flash = new THREE.Mesh(
              new THREE.SphereGeometry(0.5, 16, 16),
              new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
            );
            flash.position.copy(fireballGroup.position);
            game.scene.add(flash);
            particles.push(flash);

            // 爆炸冲击波（多层环）
            for (let r = 0; r < 5; r++) {
              const ring = _createRing(fireballGroup.position, 0.3 + r * 0.2, fireColors[r % 5], 0.8);
              ring.rotation.x = Math.random() * Math.PI;
              ring.userData.expandSpeed = 8 + r * 3;
              game.scene.add(ring);
              particles.push(ring);
            }

            // 爆炸碎片
            for (let i = 0; i < 40; i++) {
              const p = _createParticle(fireballGroup.position, 0.08 + Math.random() * 0.12, fireColors[i % 5], 1);
              const angleH = Math.random() * Math.PI * 2;
              const angleV = Math.random() * Math.PI;
              const speed = 4 + Math.random() * 6;
              p.userData.vel = new THREE.Vector3(
                Math.sin(angleV) * Math.cos(angleH) * speed,
                Math.cos(angleV) * speed,
                Math.sin(angleV) * Math.sin(angleH) * speed
              );
              p.userData.gravity = -5;
              p.userData.baseOpacity = 1;
              game.scene.add(p);
              particles.push(p);
            }

            // 重置life用于爆炸阶段
            life = 0.5;
          }
        } else {
          // 爆炸阶段
          const et = 1 - life / 0.5;
          for (const p of particles) {
            if (p.material && p.material.color && p.material.color.getHex() === 0xffffff && p.geometry && p.geometry.type === 'SphereGeometry') {
              p.scale.setScalar(1 + et * 5);
              p.material.opacity = (1 - et) * (1 - et);
            } else if (p.userData.expandSpeed !== undefined) {
              p.scale.setScalar(1 + et * p.userData.expandSpeed * 0.5);
              if (p.material) p.material.opacity = 0.8 * (1 - et);
            } else if (p.userData.vel && p.userData.gravity !== undefined && !p.userData.trail) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y += p.userData.gravity * 0.02;
              if (p.material) p.material.opacity = (1 - et) * p.userData.baseOpacity;
            }
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第7魂技：火凤凰真身 - 巨大火凤凰现身，焚尽一切 ==========
  if (idx === 6) {
    // 巨大火凤凰
    const truePhoenix = _createPhoenixModel(2, 0.8, 0.7);
    truePhoenix.position.copy(startPos);
    truePhoenix.position.add(dir.clone().multiplyScalar(range * 0.4));
    truePhoenix.position.y += 2;
    truePhoenix.scale.setScalar(0);
    game.scene.add(truePhoenix);
    particles.push(truePhoenix);

    // 凤凰周身火焰环
    for (let r = 0; r < 6; r++) {
      const fireRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.5 + r * 0.4, 0.1, 10, 32),
        new THREE.MeshBasicMaterial({ color: fireColors[r % 5], transparent: true, opacity: 0.6 })
      );
      fireRing.position.copy(truePhoenix.position);
      fireRing.userData.rotAxis = r % 3; // 0:x, 1:y, 2:z
      fireRing.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.03 + r * 0.01);
      game.scene.add(fireRing);
      particles.push(fireRing);
    }

    // 羽翼火焰粒子
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.08 + Math.random() * 0.1, fireColors[i % 5], 0);
      p.userData.wing = i % 2 === 0 ? 'left' : 'right';
      p.userData.phase = Math.random() * Math.PI * 2;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面火焰喷发
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.5;
      const ex = startPos.x + dir.x * range * 0.4 + Math.cos(angle) * dist;
      const ez = startPos.z + dir.z * range * 0.4 + Math.sin(angle) * dist;

      const erupt = new THREE.Mesh(
        new THREE.ConeGeometry(0.2 + Math.random() * 0.15, 1 + Math.random() * 0.8, 8),
        new THREE.MeshBasicMaterial({ color: fireColors[i % 5], transparent: true, opacity: 0.8 })
      );
      erupt.position.set(ex, startPos.y + 0.5, ez);
      erupt.userData.baseHeight = 1 + Math.random() * 0.8;
      erupt.userData.delay = Math.random() * 0.3;
      game.scene.add(erupt);
      particles.push(erupt);
    }

    // 爆发粒子
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, fireColors[i % 5], 0);
      p.position.copy(truePhoenix.position);
      const angleH = Math.random() * Math.PI * 2;
      const angleV = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 4;
      p.userData.vel = new THREE.Vector3(
        Math.sin(angleV) * Math.cos(angleH) * speed,
        Math.cos(angleV) * speed,
        Math.sin(angleV) * Math.sin(angleH) * speed
      );
      p.userData.baseOpacity = 0.9;
      p.userData.startDelay = 0.2 + Math.random() * 0.3;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.3;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 凤凰现身
        if (t < 0.3) {
          const appearT = t / 0.3;
          truePhoenix.scale.setScalar(appearT * appearT * 1.5);
        } else {
          truePhoenix.scale.setScalar(1.5 + Math.sin((t - 0.3) * 6) * 0.15);
        }
        truePhoenix.position.y = startPos.y + 2 + Math.sin(t * 3) * 0.4;
        truePhoenix.rotation.y = Math.sin(t * 2) * 0.3;
        _flapWings(truePhoenix, t);

        truePhoenix.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            const baseOp = child.userData.type === 'beak' ? 0.9 : (child.userData.type === 'tail' ? 0.6 : 0.75);
            child.material.opacity = baseOp * (life / maxLife);
          }
        });

        // 火焰环旋转
        for (const p of particles) {
          if (p.userData.rotAxis !== undefined) {
            p.position.copy(truePhoenix.position);
            if (p.userData.rotAxis === 0) p.rotation.x += p.userData.rotSpeed;
            else if (p.userData.rotAxis === 1) p.rotation.y += p.userData.rotSpeed;
            else p.rotation.z += p.userData.rotSpeed;
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          } else if (p.userData.wing !== undefined) {
            // 羽翼火焰
            const wingT = (t * 4 + p.userData.phase) % 1;
            const side = p.userData.wing === 'left' ? -1 : 1;
            const wingFlap = Math.sin(t * 10) * 0.5;
            p.position.set(
              truePhoenix.position.x + side * (1 + wingT * 2.5),
              truePhoenix.position.y + 0.5 + wingFlap * 0.8 + Math.sin(wingT * Math.PI) * 0.5,
              truePhoenix.position.z - wingT * 1.5
            );
            if (p.material) p.material.opacity = (1 - wingT) * (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.baseHeight !== undefined) {
            // 地面喷发
            if (t > p.userData.delay) {
              const et = (t - p.userData.delay) / (1 - p.userData.delay);
              p.scale.y = Math.sin(et * Math.PI) * 2;
              p.position.y = startPos.y + 0.5 + p.scale.y * 0.4;
              if (p.material) p.material.opacity = 0.8 * Math.sin(et * Math.PI) * (life / maxLife);
            }
          } else if (p.userData.startDelay !== undefined && p.userData.vel) {
            if (t > p.userData.startDelay) {
              if (p.position.distanceTo(startPos) < 0.1 && p.position.y < startPos.y + 0.2) {
                p.position.copy(truePhoenix.position);
              }
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.multiplyScalar(0.98);
              const pt = (t - p.userData.startDelay) / (1 - p.userData.startDelay);
              if (p.material) p.material.opacity = (1 - pt) * p.userData.baseOpacity * (life / maxLife);
            }
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第8魂技：凤凰领域 - 火焰领域，持续燃烧 ==========
  if (idx === 7) {
    // 领域半球
    const fireDome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    fireDome.position.copy(startPos);
    fireDome.position.y += 0.1;
    fireDome.scale.setScalar(0);
    game.scene.add(fireDome);
    particles.push(fireDome);

    // 领域线框
    const wireDome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5, wireframe: true })
    );
    wireDome.position.copy(startPos);
    wireDome.position.y += 0.1;
    wireDome.scale.setScalar(0);
    game.scene.add(wireDome);
    particles.push(wireDome);

    // 地面火焰圈（多层）
    for (let r = 0; r < 5; r++) {
      const fireRing = _createRing(startPos, range * 0.12 * (r + 1), fireColors[r % 5], 0.6);
      fireRing.position.y = 0.2;
      fireRing.userData.pulsePhase = r * 0.4;
      fireRing.scale.setScalar(0);
      game.scene.add(fireRing);
      particles.push(fireRing);
    }

    // 火焰柱（从地面升起，领域内随机分布）
    const flameCount = 20;
    const flames = [];
    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      const fx = startPos.x + Math.cos(angle) * dist;
      const fz = startPos.z + Math.sin(angle) * dist;

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 + Math.random() * 0.1, 0.8 + Math.random() * 0.8, 8),
        new THREE.MeshBasicMaterial({ color: fireColors[i % 5], transparent: true, opacity: 0.8 })
      );
      flame.position.set(fx, startPos.y + 0.4, fz);
      flame.userData.baseHeight = 0.8 + Math.random() * 0.8;
      flame.userData.wobblePhase = Math.random() * Math.PI * 2;
      flame.userData.delay = Math.random() * 0.5;
      flame.scale.y = 0;
      game.scene.add(flame);
      particles.push(flame);
      flames.push(flame);
    }

    // 升腾的火星粒子
    for (let i = 0; i < 80; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, fireColors[i % 5], 0);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.6;
      p.position.x = startPos.x + Math.cos(angle) * dist;
      p.position.z = startPos.z + Math.sin(angle) * dist;
      p.position.y = startPos.y + Math.random() * range * 0.4;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      p.userData.baseOpacity = 0.7;
      p.userData.startDelay = Math.random() * 0.5;
      game.scene.add(p);
      particles.push(p);
    }

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 领域展开
        const expandT = Math.min(1, t * 3);
        const domeScale = expandT;
        fireDome.scale.setScalar(domeScale);
        wireDome.scale.setScalar(domeScale);
        fireDome.rotation.y += 0.01;
        wireDome.rotation.y -= 0.01;

        if (fireDome.material) fireDome.material.opacity = 0.3 * (0.7 + Math.sin(t * 4) * 0.3) * (life / maxLife);
        if (wireDome.material) wireDome.material.opacity = 0.5 * (life / maxLife);

        // 地面火焰圈脉动
        for (const p of particles) {
          if (p.userData.pulsePhase !== undefined) {
            p.scale.setScalar(domeScale * (1 + Math.sin(t * 3 + p.userData.pulsePhase) * 0.15));
            if (p.material) p.material.opacity = 0.6 * (0.7 + Math.sin(t * 5 + p.userData.pulsePhase) * 0.3) * (life / maxLife);
          }
        }

        // 火焰柱摇曳
        for (const flame of flames) {
          if (t > flame.userData.delay) {
            const ft = (t - flame.userData.delay) / (1 - flame.userData.delay);
            const riseT = Math.min(1, ft * 3);
            flame.scale.y = riseT * (1 + Math.sin(t * 6 + flame.userData.wobblePhase) * 0.2);
            flame.position.x += Math.sin(t * 4 + flame.userData.wobblePhase) * 0.01;
            if (flame.material) flame.material.opacity = 0.8 * (0.7 + Math.sin(t * 8 + flame.userData.wobblePhase) * 0.3) * (life / maxLife);
          }
        }

        // 火星粒子
        for (const p of particles) {
          if (p.userData.startDelay !== undefined && p.userData.vel && !flames.includes(p) && p.userData.pulsePhase === undefined) {
            if (t > p.userData.startDelay) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.position.y > startPos.y + range * 0.6) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * range * 0.6;
                p.position.x = startPos.x + Math.cos(angle) * dist * domeScale;
                p.position.z = startPos.z + Math.sin(angle) * dist * domeScale;
                p.position.y = startPos.y + 0.2;
              }
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          }
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第9魂技：凤凰涅槃击 - 终极奥义，涅槃重生，毁灭之火 ==========
  if (idx === 8) {
    // 巨型火凤凰真身
    const godPhoenix = _createPhoenixModel(3, 0.9, 0.8);
    godPhoenix.position.copy(startPos);
    godPhoenix.position.add(dir.clone().multiplyScalar(range * 0.5));
    godPhoenix.position.y += 6;
    godPhoenix.scale.setScalar(0);
    game.scene.add(godPhoenix);
    particles.push(godPhoenix);

    // 凤凰光环（多层旋转）
    for (let r = 0; r < 7; r++) {
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(2 + r * 0.8, 2.2 + r * 0.8, 64),
        new THREE.MeshBasicMaterial({ color: fireColors[r % 5], transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      halo.position.copy(godPhoenix.position);
      halo.userData.rotSpeed = (r % 2 === 0 ? 1 : -1) * (0.02 + r * 0.008);
      halo.userData.tilt = (r % 3) * 0.3;
      game.scene.add(halo);
      particles.push(halo);
    }

    // 涅槃之火柱（从凤凰降下）
    const nirvanaBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 2, 8, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    nirvanaBeam.position.copy(godPhoenix.position);
    nirvanaBeam.position.y -= 4;
    game.scene.add(nirvanaBeam);
    particles.push(nirvanaBeam);

    // 光柱内核
    const beamCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 1, 8, 16),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 })
    );
    beamCore.position.copy(nirvanaBeam.position);
    game.scene.add(beamCore);
    particles.push(beamCore);

    // 地面涅槃阵（多重火焰阵纹）
    const runeRings = [];
    for (let r = 0; r < 6; r++) {
      const rune = _createRing(
        new THREE.Vector3(godPhoenix.position.x, startPos.y + 0.15, godPhoenix.position.z),
        0.5 + r * 0.7,
        fireColors[r % 5],
        0.8
      );
      rune.userData.delay = r * 0.05;
      game.scene.add(rune);
      particles.push(rune);
      runeRings.push(rune);
    }

    // 火焰符文（地面上的三角/星形标记）
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = range * 0.4;
      const runeMarker = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.4, 3),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0 })
      );
      runeMarker.position.set(
        godPhoenix.position.x + Math.cos(angle) * dist,
        startPos.y + 0.2,
        godPhoenix.position.z + Math.sin(angle) * dist
      );
      runeMarker.rotation.x = -Math.PI / 2;
      runeMarker.rotation.z = angle;
      runeMarker.userData.angle = angle;
      runeMarker.userData.dist = dist;
      game.scene.add(runeMarker);
      particles.push(runeMarker);
    }

    // 涅槃火焰粒子（螺旋上升）
    for (let i = 0; i < 100; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.08, fireColors[i % 5], 0);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.5;
      p.position.x = godPhoenix.position.x + Math.cos(angle) * dist;
      p.position.z = godPhoenix.position.z + Math.sin(angle) * dist;
      p.position.y = startPos.y + 0.3 + Math.random() * 0.5;
      p.userData.spiralSpeed = 1 + Math.random() * 2;
      p.userData.riseSpeed = 1.5 + Math.random() * 2.5;
      p.userData.angle = angle;
      p.userData.dist = dist;
      p.userData.startDelay = Math.random() * 0.5;
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 爆炸冲击波（最终爆发）
    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 凤凰显现并悬浮
        if (t < 0.25) {
          const appearT = t / 0.25;
          godPhoenix.scale.setScalar(appearT * appearT);
        } else {
          godPhoenix.scale.setScalar(1 + Math.sin((t - 0.25) * 5) * 0.15);
        }
        godPhoenix.position.y = startPos.y + 6 + Math.sin(t * 3) * 0.5;
        godPhoenix.rotation.y = Math.sin(t * 1.5) * 0.4;
        _flapWings(godPhoenix, t);

        godPhoenix.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            const baseOp = child.userData.type === 'beak' ? 1 : (child.userData.type === 'tail' ? 0.7 : 0.85);
            child.material.opacity = baseOp * (life / maxLife);
          }
        });

        // 光环旋转
        for (const p of particles) {
          if (p.userData.rotSpeed !== undefined && p.userData.tilt !== undefined) {
            p.position.copy(godPhoenix.position);
            p.rotation.z += p.userData.rotSpeed;
            p.rotation.x = p.userData.tilt;
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          }
        }

        // 涅槃光柱在t=0.3时出现
        if (t > 0.25) {
          const beamT = (t - 0.25) / 0.75;
          nirvanaBeam.scale.x = 1 + Math.sin(t * 8) * 0.25;
          nirvanaBeam.scale.z = 1 + Math.sin(t * 8 + 1) * 0.25;
          beamCore.scale.x = 1 + Math.sin(t * 10) * 0.3;
          beamCore.scale.z = 1 + Math.sin(t * 10 + 1) * 0.3;

          if (nirvanaBeam.material) {
            nirvanaBeam.material.opacity = 0.6 * Math.min(1, beamT * 3) * (life / maxLife);
          }
          if (beamCore.material) {
            beamCore.material.opacity = 0.9 * Math.min(1, beamT * 4) * (life / maxLife);
          }
        }

        // 地面阵纹
        if (t > 0.3) {
          const runeT = (t - 0.3) / 0.7;
          for (let r = 0; r < runeRings.length; r++) {
            const ring = runeRings[r];
            if (runeT > ring.userData.delay) {
              const rt = (runeT - ring.userData.delay) / (1 - ring.userData.delay);
              ring.scale.setScalar(1 + rt * range * 0.35);
              ring.rotation.z += 0.02 * (r % 2 === 0 ? 1 : -1);
              if (ring.material) ring.material.opacity = 0.8 * (1 - rt * 0.5) * (life / maxLife);
            }
          }

          // 符文标记
          for (const p of particles) {
            if (p.userData.angle !== undefined && p.geometry && p.geometry.type === 'ConeGeometry' && p.userData.dist !== undefined && !p.userData.spiralSpeed) {
              const rt = Math.min(1, runeT * 2);
              p.scale.setScalar(rt);
              p.rotation.z += 0.03;
              if (p.material) p.material.opacity = 0.9 * (life / maxLife) * Math.sin(runeT * Math.PI);
            }
          }
        }

        // 螺旋上升的火焰粒子
        for (const p of particles) {
          if (p.userData.spiralSpeed !== undefined) {
            if (t > p.userData.startDelay) {
              const pt = (t - p.userData.startDelay) / (1 - p.userData.startDelay);
              p.userData.angle += p.userData.spiralSpeed * 0.02;
              const r = p.userData.dist * (1 - pt * 0.5);
              p.position.x = godPhoenix.position.x + Math.cos(p.userData.angle) * r;
              p.position.z = godPhoenix.position.z + Math.sin(p.userData.angle) * r;
              p.position.y += p.userData.riseSpeed * 0.02;
              if (p.position.y > godPhoenix.position.y) {
                p.position.y = startPos.y + 0.3;
                p.userData.angle = Math.random() * Math.PI * 2;
                p.userData.dist = Math.random() * range * 0.5;
              }
              if (p.material) p.material.opacity = Math.sin(pt * Math.PI) * p.userData.baseOpacity * (life / maxLife);
            }
          }
        }

        // 最终大爆炸（t>0.7时）
        if (t > 0.7) {
          const explodeT = (t - 0.7) / 0.3;
          // 凤凰发光增强
          godPhoenix.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = Math.min(1, child.material.opacity + explodeT * 0.5);
            }
          });
        }

        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }
}

// ========== 7. 冰凤凰技能特效 ==========
function spawnIcePhoenixSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const iceColors = [0x00bfff, 0x87ceeb, 0xe0ffff, 0xb0e0e6, 0xffffff, 0x4682b4, 0xadd8e6];
  const up = new THREE.Vector3(0, 1, 0);

  function _cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  // ========== 第1魂技：冰锥术 - 多根尖锐冰锥向前射出击 ==========
  if (idx === 0) {
    const spikeCount = 12;
    for (let i = 0; i < spikeCount; i++) {
      const spikeGroup = new THREE.Group();
      // 冰锥主体
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 + Math.random() * 0.06, 0.6 + Math.random() * 0.4, 6),
        new THREE.MeshBasicMaterial({ color: iceColors[i % 5], transparent: true, opacity: 0.9 })
      );
      spike.position.y = 0.3;
      spikeGroup.add(spike);
      // 冰锥底座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.08, 0.15, 6),
        new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.8 })
      );
      base.position.y = 0.05;
      spikeGroup.add(base);

      spikeGroup.position.copy(startPos);
      spikeGroup.position.y += 0.8;

      // 扇形分布方向
      const spreadX = (Math.random() - 0.5) * 0.6;
      const spreadY = (Math.random() - 0.5) * 0.3;
      const shootDir = dir.clone();
      shootDir.x += spreadX;
      shootDir.y += spreadY;
      shootDir.normalize();

      const speed = range * 1.5 + Math.random() * 2;
      spikeGroup.userData.vel = shootDir.multiplyScalar(speed);
      spikeGroup.userData.rotSpeed = (Math.random() - 0.5) * 0.2;
      spikeGroup.userData.baseOpacity = 0.9;

      // 朝向飞行方向
      spikeGroup.lookAt(spikeGroup.position.clone().add(shootDir));
      spikeGroup.rotateX(Math.PI / 2);

      game.scene.add(spikeGroup);
      particles.push(spikeGroup);
    }

    // 释放点冰晶爆发
    const burst = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 1 })
    );
    burst.position.copy(startPos);
    burst.position.y += 0.8;
    game.scene.add(burst);
    particles.push(burst);

    let life = 0.6;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === burst) {
            p.scale.setScalar(1 + t * 1.5);
            if (p.material) p.material.opacity = (1 - t) * (1 - t);
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.z += p.userData.rotSpeed;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * (p.userData.baseOpacity || 0.9);
              }
            });
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第2魂技：冰冻 - 冰霜从地面蔓延，冻结敌人 ==========
  if (idx === 1) {
    // 地面冰霜蔓延环（多层）
    for (let r = 0; r < 5; r++) {
      const frostRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 + r * 0.3, 0.08 + r * 0.02, 6, 24),
        new THREE.MeshBasicMaterial({ color: iceColors[r % 5], transparent: true, opacity: 0.7 })
      );
      frostRing.position.copy(startPos);
      frostRing.position.y = 0.05;
      frostRing.rotation.x = Math.PI / 2;
      frostRing.userData.expandDelay = r * 0.08;
      frostRing.userData.expandSpeed = range * 0.8;
      frostRing.userData.baseOpacity = 0.7;
      game.scene.add(frostRing);
      particles.push(frostRing);
    }

    // 冰晶柱从地面升起（冻结效果）
    for (let i = 0; i < 20; i++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08 + Math.random() * 0.06, 0),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.85 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.7;
      crystal.position.x = startPos.x + Math.cos(angle) * dist;
      crystal.position.z = startPos.z + Math.sin(angle) * dist;
      crystal.position.y = 0.1;
      crystal.userData.riseSpeed = 0.5 + Math.random() * 1;
      crystal.userData.maxHeight = 0.5 + Math.random() * 1.5;
      crystal.userData.rotSpeed = (Math.random() - 0.5) * 0.15;
      crystal.userData.baseOpacity = 0.85;
      crystal.userData.delay = Math.random() * 0.3;
      game.scene.add(crystal);
      particles.push(crystal);
    }

    // 中心冰冻闪光
    const freezeFlash = new THREE.Mesh(
      new THREE.RingGeometry(0.1, range * 0.8, 32),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    freezeFlash.position.copy(startPos);
    freezeFlash.position.y = 0.02;
    freezeFlash.rotation.x = -Math.PI / 2;
    game.scene.add(freezeFlash);
    particles.push(freezeFlash);

    let life = 0.9;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === freezeFlash) {
            if (p.material) p.material.opacity = 0.4 * (1 - t) * (1 - t);
          } else if (p.userData.expandSpeed !== undefined) {
            const localT = Math.max(0, t - p.userData.expandDelay / maxLife);
            const expandScale = 1 + p.userData.expandSpeed * localT;
            p.scale.setScalar(expandScale);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT) * 0.8;
          } else if (p.userData.riseSpeed !== undefined) {
            const localT = Math.max(0, t - p.userData.delay / maxLife);
            const targetY = 0.1 + p.userData.maxHeight * Math.min(1, localT * 2);
            p.position.y = targetY;
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.y += p.userData.rotSpeed * 0.7;
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT * 0.5);
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第3魂技：冰墙 - 召唤一面巨大冰墙 ==========
  if (idx === 2) {
    const wallGroup = new THREE.Group();

    // 冰墙主体（多个冰晶块组合）
    const wallWidth = range * 0.8;
    const wallHeight = 3;
    const wallDepth = 0.6;

    // 主墙
    const mainWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth),
      new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6 })
    );
    mainWall.position.y = wallHeight / 2;
    wallGroup.add(mainWall);

    // 内层冰墙（更亮）
    const innerWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth * 0.9, wallHeight * 0.9, wallDepth * 0.6),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.5 })
    );
    innerWall.position.y = wallHeight / 2;
    wallGroup.add(innerWall);

    // 顶部尖刺装饰
    for (let i = 0; i < 10; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 + Math.random() * 0.1, 0.4 + Math.random() * 0.3, 4),
        new THREE.MeshBasicMaterial({ color: iceColors[i % 5], transparent: true, opacity: 0.8 })
      );
      spike.position.set(
        -wallWidth / 2 + (i + 0.5) * (wallWidth / 10),
        wallHeight + 0.2,
        0
      );
      wallGroup.add(spike);
    }

    // 两侧冰柱
    for (let s = 0; s < 2; s++) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, wallHeight + 0.5, 8),
        new THREE.MeshBasicMaterial({ color: 0x4682b4, transparent: true, opacity: 0.7 })
      );
      pillar.position.set(s === 0 ? -wallWidth / 2 - 0.2 : wallWidth / 2 + 0.2, (wallHeight + 0.5) / 2, 0);
      wallGroup.add(pillar);

      // 柱顶装饰
      const pillarTop = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.25, 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      pillarTop.position.set(s === 0 ? -wallWidth / 2 - 0.2 : wallWidth / 2 + 0.2, wallHeight + 0.5, 0);
      wallGroup.add(pillarTop);
    }

    // 位置：前方一定距离，垂直于方向
    const wallPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    wallGroup.position.copy(wallPos);
    wallGroup.position.y = 0;
    wallGroup.lookAt(startPos); // 冰墙面向玩家
    game.scene.add(wallGroup);
    particles.push(wallGroup);

    // 地面冰霜扩散
    for (let r = 0; r < 3; r++) {
      const groundFrost = _createRing(wallPos, 0.5 + r * 0.8, iceColors[r % 5], 0.5);
      groundFrost.position.y = 0.05;
      groundFrost.userData.expandSpeed = 3 + r;
      groundFrost.userData.baseOpacity = 0.5;
      game.scene.add(groundFrost);
      particles.push(groundFrost);
    }

    // 飘散的冰晶粒子
    for (let i = 0; i < 15; i++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.05 + Math.random() * 0.05, 0),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.8 })
      );
      crystal.position.copy(wallPos);
      crystal.position.x += (Math.random() - 0.5) * wallWidth;
      crystal.position.y += Math.random() * wallHeight;
      crystal.position.z += (Math.random() - 0.5) * wallDepth;
      crystal.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        0.3 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.3
      );
      crystal.userData.rotSpeed = (Math.random() - 0.5) * 0.2;
      crystal.userData.baseOpacity = 0.8;
      game.scene.add(crystal);
      particles.push(crystal);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 冰墙从地面升起效果
        const riseT = Math.min(1, t * 2.5);
        for (const p of particles) {
          if (p === wallGroup) {
            p.scale.y = riseT;
            // 脉动光泽
            p.children.forEach((child, i) => {
              if (i < 2) {
                if (child.material) child.material.opacity = 0.5 + Math.sin(t * 6 + i) * 0.1;
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t);
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.y += p.userData.rotSpeed;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第4魂技：冰风暴 - 冰风暴席卷，范围冰冻伤害 ==========
  if (idx === 3) {
    const stormCenter = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    stormCenter.y = 1;

    // 风暴核心球
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.7 })
    );
    core.position.copy(stormCenter);
    game.scene.add(core);
    particles.push(core);

    // 旋转的冰粒（多层螺旋）
    const spiralLayers = 4;
    const particlesPerLayer = 12;
    for (let layer = 0; layer < spiralLayers; layer++) {
      for (let i = 0; i < particlesPerLayer; i++) {
        const ice = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.06 + Math.random() * 0.06, 0),
          new THREE.MeshBasicMaterial({ color: iceColors[(layer + i) % 5], transparent: true, opacity: 0.85 })
        );
        const angle = (i / particlesPerLayer) * Math.PI * 2 + layer * 0.3;
        const radius = 0.8 + layer * 0.6;
        ice.position.x = stormCenter.x + Math.cos(angle) * radius;
        ice.position.z = stormCenter.z + Math.sin(angle) * radius;
        ice.position.y = stormCenter.y + (Math.random() - 0.5) * 2;
        ice.userData.angle = angle;
        ice.userData.radius = radius;
        ice.userData.heightOffset = ice.position.y - stormCenter.y;
        ice.userData.orbitSpeed = 3 + layer * 0.5;
        ice.userData.radiusExpand = range * 0.3 + layer * 0.3;
        ice.userData.baseOpacity = 0.85;
        ice.userData.rotSpeed = (Math.random() - 0.5) * 0.3;
        game.scene.add(ice);
        particles.push(ice);
      }
    }

    // 雪花片状粒子（下落）
    for (let i = 0; i < 30; i++) {
      const snow = new THREE.Mesh(
        new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
      );
      snow.position.x = stormCenter.x + (Math.random() - 0.5) * range;
      snow.position.z = stormCenter.z + (Math.random() - 0.5) * range;
      snow.position.y = 3 + Math.random() * 2;
      snow.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -1 - Math.random() * 1.5,
        (Math.random() - 0.5) * 0.5
      );
      snow.userData.baseOpacity = 0.7;
      game.scene.add(snow);
      particles.push(snow);
    }

    // 地面冰霜环
    const groundRing = _createRing(stormCenter, 0.5, 0x87ceeb, 0.6);
    groundRing.position.y = 0.05;
    groundRing.userData.expandSpeed = range * 0.5;
    groundRing.userData.baseOpacity = 0.6;
    game.scene.add(groundRing);
    particles.push(groundRing);

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === core) {
            p.scale.setScalar(1 + Math.sin(t * 8) * 0.2 + t * 0.5);
            if (p.material) p.material.opacity = 0.7 * (life / maxLife);
          } else if (p === groundRing) {
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t);
          } else if (p.userData.orbitSpeed !== undefined) {
            // 螺旋向外扩张
            const newAngle = p.userData.angle + p.userData.orbitSpeed * t;
            const newRadius = p.userData.radius + p.userData.radiusExpand * t;
            p.position.x = stormCenter.x + Math.cos(newAngle) * newRadius;
            p.position.z = stormCenter.z + Math.sin(newAngle) * newRadius;
            p.position.y = stormCenter.y + p.userData.heightOffset * (1 - t * 0.3) + Math.sin(t * 4 + p.userData.angle) * 0.2;
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.z += p.userData.rotSpeed * 0.7;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第5魂技：极寒领域 - 极寒领域展开，减速冻伤 ==========
  if (idx === 4) {
    const domainCenter = startPos.clone();
    domainCenter.y = 0;
    const domainRadius = range;

    // 领域地面圆
    const domainFloor = new THREE.Mesh(
      new THREE.RingGeometry(0.1, domainRadius, 48),
      new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    domainFloor.position.copy(domainCenter);
    domainFloor.position.y = 0.02;
    domainFloor.rotation.x = -Math.PI / 2;
    game.scene.add(domainFloor);
    particles.push(domainFloor);

    // 领域内圈（更亮）
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(domainRadius * 0.6, domainRadius * 0.65, 48),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    innerRing.position.copy(domainCenter);
    innerRing.position.y = 0.03;
    innerRing.rotation.x = -Math.PI / 2;
    game.scene.add(innerRing);
    particles.push(innerRing);

    // 领域边界能量墙
    const boundaryWall = new THREE.Mesh(
      new THREE.CylinderGeometry(domainRadius, domainRadius, 3, 48, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    boundaryWall.position.copy(domainCenter);
    boundaryWall.position.y = 1.5;
    game.scene.add(boundaryWall);
    particles.push(boundaryWall);

    // 领域内随机升起的冰晶柱
    for (let i = 0; i < 25; i++) {
      const crystalPillar = new THREE.Group();
      const pillar = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 + Math.random() * 0.06, 0.8 + Math.random() * 1.2, 5),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.75 })
      );
      pillar.position.y = 0;
      crystalPillar.add(pillar);

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * domainRadius * 0.9;
      crystalPillar.position.x = domainCenter.x + Math.cos(angle) * dist;
      crystalPillar.position.z = domainCenter.z + Math.sin(angle) * dist;
      crystalPillar.position.y = 0.1;
      crystalPillar.userData.phase = Math.random() * Math.PI * 2;
      crystalPillar.userData.baseHeight = 0.5 + Math.random() * 0.8;
      crystalPillar.userData.baseOpacity = 0.75;
      game.scene.add(crystalPillar);
      particles.push(crystalPillar);
    }

    // 飘浮的寒气粒子
    for (let i = 0; i < 40; i++) {
      const frost = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.6 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * domainRadius * 0.85;
      frost.position.x = domainCenter.x + Math.cos(angle) * dist;
      frost.position.z = domainCenter.z + Math.sin(angle) * dist;
      frost.position.y = 0.2 + Math.random() * 2.5;
      frost.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0.1 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.2
      );
      frost.userData.baseOpacity = 0.6;
      game.scene.add(frost);
      particles.push(frost);
    }

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const expandT = Math.min(1, t * 2);
        for (const p of particles) {
          if (p === domainFloor) {
            p.scale.setScalar(expandT);
            if (p.material) p.material.opacity = 0.3 * (0.5 + 0.5 * Math.sin(t * 4));
          } else if (p === innerRing) {
            p.scale.setScalar(expandT);
            p.rotation.z += 0.02;
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          } else if (p === boundaryWall) {
            p.scale.setScalar(expandT);
            p.scale.y = 1 + Math.sin(t * 3) * 0.1;
            if (p.material) p.material.opacity = 0.25 * (life / maxLife);
          } else if (p.userData.phase !== undefined && p.userData.baseHeight !== undefined) {
            // 冰晶柱周期起伏
            const pulse = 0.7 + 0.3 * Math.sin(t * 4 + p.userData.phase);
            p.scale.y = expandT * pulse;
            p.rotation.y += 0.01;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * p.userData.baseOpacity;
              }
            });
          } else if (p.userData.vel) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.position.y > 3) p.position.y = 0.2;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第6魂技：冰爆术 - 冰冻后引爆，范围爆炸 ==========
  if (idx === 5) {
    const explodePos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.6));
    explodePos.y = 1;

    // 蓄力阶段：冰块凝聚
    const iceCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.9 })
    );
    iceCore.position.copy(explodePos);
    game.scene.add(iceCore);
    particles.push(iceCore);

    // 环绕的冰晶
    for (let i = 0; i < 8; i++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08, 0),
        new THREE.MeshBasicMaterial({ color: iceColors[i % 5], transparent: true, opacity: 0.8 })
      );
      const angle = (i / 8) * Math.PI * 2;
      crystal.position.x = explodePos.x + Math.cos(angle) * 0.6;
      crystal.position.z = explodePos.z + Math.sin(angle) * 0.6;
      crystal.position.y = explodePos.y + Math.sin(angle * 2) * 0.3;
      crystal.userData.angle = angle;
      crystal.userData.baseRadius = 0.6;
      crystal.userData.rotSpeed = 0.05;
      crystal.userData.baseOpacity = 0.8;
      game.scene.add(crystal);
      particles.push(crystal);
    }

    // 爆炸冲击波环（多层）
    for (let r = 0; r < 4; r++) {
      const shockwave = _createRing(explodePos, 0.3 + r * 0.2, iceColors[r % 5], 0.7);
      shockwave.userData.delay = r * 0.04;
      shockwave.userData.expandSpeed = range * 1.2;
      shockwave.userData.baseOpacity = 0.7;
      shockwave.visible = false;
      game.scene.add(shockwave);
      particles.push(shockwave);
    }

    // 爆炸碎冰粒子
    const shardCount = 40;
    for (let i = 0; i < shardCount; i++) {
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.06 + Math.random() * 0.06, 0),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.9 })
      );
      shard.position.copy(explodePos);
      // 球形发散方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 5;
      shard.userData.vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed,
        Math.sin(phi) * Math.sin(theta) * speed
      );
      shard.userData.gravity = 6;
      shard.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      shard.userData.baseOpacity = 0.9;
      shard.userData.delay = 0.2; // 蓄力后才飞出
      shard.visible = false;
      game.scene.add(shard);
      particles.push(shard);
    }

    // 爆炸闪光
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    );
    flash.position.copy(explodePos);
    game.scene.add(flash);
    particles.push(flash);

    let life = 0.9;
    const maxLife = life;
    const chargeTime = 0.25; // 蓄力时间
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        if (t < chargeTime / maxLife) {
          // 蓄力阶段
          const ct = t / (chargeTime / maxLife);
          iceCore.scale.setScalar(0.5 + ct * 0.8);
          iceCore.rotation.x += 0.05;
          iceCore.rotation.y += 0.07;
          if (iceCore.material) iceCore.material.opacity = 0.9 * (0.8 + 0.2 * Math.sin(ct * 10));

          // 环绕冰晶收缩
          for (const p of particles) {
            if (p.userData.angle !== undefined && p.userData.baseRadius !== undefined && p.visible !== false) {
              p.userData.angle += p.userData.rotSpeed * 2;
              const radius = p.userData.baseRadius * (1 - ct * 0.5);
              p.position.x = explodePos.x + Math.cos(p.userData.angle) * radius;
              p.position.z = explodePos.z + Math.sin(p.userData.angle) * radius;
              p.position.y = explodePos.y + Math.sin(p.userData.angle * 2) * 0.3;
              p.rotation.x += 0.05;
              p.rotation.y += 0.05;
              if (p.material) p.material.opacity = p.userData.baseOpacity;
            }
          }
        } else {
          // 爆炸阶段
          const et = (t - chargeTime / maxLife) / (1 - chargeTime / maxLife);

          // 冰核消失
          iceCore.scale.setScalar(1 + et * 2);
          if (iceCore.material) iceCore.material.opacity = 0.9 * (1 - et);

          // 闪光
          if (et < 0.2) {
            flash.scale.setScalar(1 + et * 5);
            if (flash.material) flash.material.opacity = 1 - et * 5;
          } else {
            if (flash.material) flash.material.opacity = 0;
          }

          for (const p of particles) {
            if (p.userData.angle !== undefined && p.userData.baseRadius !== undefined) {
              if (!p.visible) continue;
              // 冰晶向外飞散
              const speed = 3;
              const outward = new THREE.Vector3(
                p.position.x - explodePos.x,
                p.position.y - explodePos.y,
                p.position.z - explodePos.z
              ).normalize();
              p.position.add(outward.multiplyScalar(speed * 0.02));
              p.rotation.x += 0.1;
              p.rotation.y += 0.1;
              if (p.material) p.material.opacity = (1 - et) * p.userData.baseOpacity;
            } else if (p.userData.vel && p.userData.gravity !== undefined) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y -= p.userData.gravity * 0.02;
              p.rotation.x += p.userData.rotSpeed.x;
              p.rotation.y += p.userData.rotSpeed.y;
              p.rotation.z += p.userData.rotSpeed.z;
              if (p.material) p.material.opacity = (1 - et) * p.userData.baseOpacity;
            } else if (p.userData.expandSpeed !== undefined) {
              p.visible = true;
              const localT = Math.max(0, et - p.userData.delay / (maxLife - chargeTime));
              p.scale.setScalar(1 + p.userData.expandSpeed * localT);
              if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT);
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第7魂技：冰凤凰真身 - 巨大冰凤凰现身，极寒之力 ==========
  if (idx === 6) {
    // 创建冰凤凰真身模型
    function _createIcePhoenix(scale) {
      const group = new THREE.Group();
      // 身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 * scale, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.75 })
      );
      body.scale.set(1, 0.8, 1.6);
      body.position.y = 0.5 * scale;
      body.userData.type = 'body';
      group.add(body);
      // 头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 * scale, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.9 })
      );
      head.position.set(0, 0.7 * scale, 0.9 * scale);
      head.userData.type = 'head';
      group.add(head);
      // 冰喙
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.1 * scale, 0.3 * scale, 4),
        new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.95 })
      );
      beak.position.set(0, 0.65 * scale, 1.2 * scale);
      beak.rotation.x = Math.PI / 2;
      group.add(beak);
      // 冰冠
      for (let c = 0; c < 3; c++) {
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(0.05 * scale, 0.25 * scale, 4),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        );
        crown.position.set((c - 1) * 0.1 * scale, 1 * scale, 0.8 * scale);
        group.add(crown);
      }
      // 左翼
      const leftWing = new THREE.Mesh(
        new THREE.ConeGeometry(0.9 * scale, 2.2 * scale, 10),
        new THREE.MeshBasicMaterial({ color: 0xb0e0e6, transparent: true, opacity: 0.65 })
      );
      leftWing.position.set(-1.1 * scale, 0.5 * scale, 0);
      leftWing.rotation.z = Math.PI / 2;
      leftWing.rotation.y = -0.3;
      leftWing.scale.set(1, 1, 0.25);
      leftWing.userData.type = 'leftWing';
      group.add(leftWing);
      // 右翼
      const rightWing = new THREE.Mesh(
        new THREE.ConeGeometry(0.9 * scale, 2.2 * scale, 10),
        new THREE.MeshBasicMaterial({ color: 0xb0e0e6, transparent: true, opacity: 0.65 })
      );
      rightWing.position.set(1.1 * scale, 0.5 * scale, 0);
      rightWing.rotation.z = -Math.PI / 2;
      rightWing.rotation.y = 0.3;
      rightWing.scale.set(1, 1, 0.25);
      rightWing.userData.type = 'rightWing';
      group.add(rightWing);
      // 尾羽（多根冰晶尾）
      for (let t = 0; t < 5; t++) {
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(0.12 * scale, 1.8 * scale, 6),
          new THREE.MeshBasicMaterial({ color: iceColors[t % 5], transparent: true, opacity: 0.6 })
        );
        tail.position.set((t - 2) * 0.25 * scale, 0.3 * scale, -1.2 * scale);
        tail.rotation.x = -Math.PI / 3 - t * 0.05;
        tail.rotation.z = (t - 2) * 0.15;
        tail.userData.type = 'tail';
        group.add(tail);
      }
      // 冰爪
      for (let l = 0; l < 2; l++) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05 * scale, 0.06 * scale, 0.4 * scale, 6),
          new THREE.MeshBasicMaterial({ color: 0x4682b4, transparent: true, opacity: 0.8 })
        );
        leg.position.set(l === 0 ? -0.25 * scale : 0.25 * scale, 0.1 * scale, 0.2 * scale);
        group.add(leg);
      }
      return group;
    }

    const phoenix = _createIcePhoenix(1.2);
    phoenix.position.copy(startPos);
    phoenix.position.y += 1.5;
    phoenix.lookAt(startPos.clone().add(dir.clone().multiplyScalar(range)));
    game.scene.add(phoenix);
    particles.push(phoenix);

    // 凤凰身下的冰霜光环
    for (let r = 0; r < 3; r++) {
      const halo = _createRing(startPos, 0.8 + r * 0.6, iceColors[r % 5], 0.6);
      halo.position.y = 0.1;
      halo.userData.expandSpeed = 2 + r;
      halo.userData.baseOpacity = 0.6;
      game.scene.add(halo);
      particles.push(halo);
    }

    // 飘落的冰晶
    for (let i = 0; i < 30; i++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06 + Math.random() * 0.06, 0),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.8 })
      );
      crystal.position.x = startPos.x + (Math.random() - 0.5) * range;
      crystal.position.z = startPos.z + (Math.random() - 0.5) * range;
      crystal.position.y = 3 + Math.random() * 2;
      crystal.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        -1.5 - Math.random() * 1.5,
        (Math.random() - 0.5) * 0.3
      );
      crystal.userData.rotSpeed = (Math.random() - 0.5) * 0.2;
      crystal.userData.baseOpacity = 0.8;
      game.scene.add(crystal);
      particles.push(crystal);
    }

    // 寒气粒子流（从凤凰身上散发）
    for (let i = 0; i < 20; i++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.4 })
      );
      mist.position.copy(phoenix.position);
      mist.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        0.5 + Math.random() * 1,
        (Math.random() - 0.5) * 1
      );
      mist.userData.baseOpacity = 0.4;
      mist.userData.growSpeed = 0.5;
      game.scene.add(mist);
      particles.push(mist);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 凤凰出现动画
        const appearT = Math.min(1, t * 3);
        const wingFlap = Math.sin(t * 10) * 0.35;

        for (const p of particles) {
          if (p === phoenix) {
            p.scale.setScalar(appearT);
            // 悬浮上下浮动
            p.position.y = startPos.y + 1.5 + Math.sin(t * 3) * 0.2;
            // 扇翅膀
            p.children.forEach(child => {
              if (child.userData && child.userData.type === 'leftWing') {
                child.rotation.z = Math.PI / 2 + wingFlap;
              }
              if (child.userData && child.userData.type === 'rightWing') {
                child.rotation.z = -Math.PI / 2 - wingFlap;
              }
            });
            // 透明度脉动
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                const base = child.material.opacity;
                child.material.opacity = base * (life / maxLife) * (0.9 + 0.1 * Math.sin(t * 6));
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t);
          } else if (p.userData.vel && p.userData.rotSpeed !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.y += p.userData.rotSpeed * 0.7;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.vel && p.userData.growSpeed !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + p.userData.growSpeed * t);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第8魂技：绝对零度 - 绝对零度降临，冰封一切 ==========
  if (idx === 7) {
    const zeroPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    zeroPos.y = 1;

    // 绝对零度核心（黑色冰核）
    const zeroCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.4, 1),
      new THREE.MeshBasicMaterial({ color: 0x000033, transparent: true, opacity: 0.9 })
    );
    zeroCore.position.copy(zeroPos);
    game.scene.add(zeroCore);
    particles.push(zeroCore);

    // 核心外层冰壳
    const coreShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.6, 0),
      new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.5, wireframe: true })
    );
    coreShell.position.copy(zeroPos);
    game.scene.add(coreShell);
    particles.push(coreShell);

    // 冷雾球（多层）
    for (let m = 0; m < 3; m++) {
      const mistSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.8 + m * 0.5, 12, 12),
        new THREE.MeshBasicMaterial({ color: iceColors[m % 5], transparent: true, opacity: 0.15 + m * 0.05 })
      );
      mistSphere.position.copy(zeroPos);
      mistSphere.userData.growSpeed = range * 0.5 + m;
      mistSphere.userData.baseOpacity = 0.15 + m * 0.05;
      game.scene.add(mistSphere);
      particles.push(mistSphere);
    }

    // 向外飞射的冰刺（放射状）
    const spikeCount = 30;
    for (let i = 0; i < spikeCount; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.5, 5),
        new THREE.MeshBasicMaterial({ color: iceColors[i % 5], transparent: true, opacity: 0.85 })
      );
      // 随机球面方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const dirVec = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      spike.position.copy(zeroPos).add(dirVec.clone().multiplyScalar(0.7));
      spike.lookAt(zeroPos.clone().add(dirVec.clone().multiplyScalar(2)));
      spike.rotateX(Math.PI / 2);
      spike.userData.vel = dirVec.multiplyScalar(range * 0.8);
      spike.userData.baseOpacity = 0.85;
      spike.userData.delay = 0.15;
      spike.visible = false;
      game.scene.add(spike);
      particles.push(spike);
    }

    // 地面冰封层
    const groundIce = new THREE.Mesh(
      new THREE.CircleGeometry(range * 0.9, 48),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    groundIce.position.copy(zeroPos);
    groundIce.position.y = 0.03;
    groundIce.rotation.x = -Math.PI / 2;
    groundIce.scale.setScalar(0);
    game.scene.add(groundIce);
    particles.push(groundIce);

    // 冰封柱（从地面升起）
    for (let i = 0; i < 20; i++) {
      const icePillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 1.5, 6),
        new THREE.MeshBasicMaterial({ color: iceColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.7 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * range * 0.7;
      icePillar.position.x = zeroPos.x + Math.cos(angle) * dist;
      icePillar.position.z = zeroPos.z + Math.sin(angle) * dist;
      icePillar.position.y = 0.75;
      icePillar.scale.y = 0;
      icePillar.userData.delay = 0.3 + Math.random() * 0.3;
      icePillar.userData.baseOpacity = 0.7;
      game.scene.add(icePillar);
      particles.push(icePillar);
    }

    let life = 1.3;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 核心旋转收缩后爆发
        zeroCore.rotation.x += 0.03;
        zeroCore.rotation.y += 0.05;
        zeroCore.scale.setScalar(1 + Math.sin(t * 8) * 0.15);
        if (zeroCore.material) zeroCore.material.opacity = 0.9 * (life / maxLife);

        coreShell.rotation.x -= 0.02;
        coreShell.rotation.y -= 0.04;
        coreShell.scale.setScalar(1 + t * 0.5 + Math.sin(t * 6) * 0.1);
        if (coreShell.material) coreShell.material.opacity = 0.5 * (life / maxLife);

        for (const p of particles) {
          if (p.userData.growSpeed !== undefined && p.userData.baseOpacity !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            p.scale.setScalar(1 + p.userData.growSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t * 0.5);
          } else if (p.userData.vel && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'ConeGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p === groundIce) {
            const iceT = Math.min(1, t * 2);
            p.scale.setScalar(iceT);
            if (p.material) p.material.opacity = 0.4 * (life / maxLife);
          } else if (p.userData.delay !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
            if (t > p.userData.delay / maxLife) {
              const localT = (t - p.userData.delay / maxLife) / (1 - p.userData.delay / maxLife);
              const riseT = Math.min(1, localT * 3);
              p.scale.y = riseT;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第9魂技：凤凰冰雪劫 - 终极奥义，冰雪天劫，天地冰封 ==========
  if (idx === 8) {
    const disasterCenter = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    disasterCenter.y = 2;

    // 巨型冰凤凰虚影
    const phoenixGroup = new THREE.Group();
    // 身体
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x4682b4, transparent: true, opacity: 0.6 })
    );
    body.scale.set(1, 0.9, 1.8);
    body.position.y = 0.5;
    phoenixGroup.add(body);
    // 头部
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.85 })
    );
    head.position.set(0, 0.9, 1.4);
    phoenixGroup.add(head);
    // 喙
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.45, 4),
      new THREE.MeshBasicMaterial({ color: 0x00bfff, transparent: true, opacity: 0.95 })
    );
    beak.position.set(0, 0.8, 1.85);
    beak.rotation.x = Math.PI / 2;
    phoenixGroup.add(beak);
    // 左翼
    const leftWing = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 3.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.55 })
    );
    leftWing.position.set(-1.5, 0.5, 0);
    leftWing.rotation.z = Math.PI / 2;
    leftWing.rotation.y = -0.25;
    leftWing.scale.set(1, 1, 0.2);
    leftWing.userData.type = 'leftWing';
    phoenixGroup.add(leftWing);
    // 右翼
    const rightWing = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 3.5, 12),
      new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.55 })
    );
    rightWing.position.set(1.5, 0.5, 0);
    rightWing.rotation.z = -Math.PI / 2;
    rightWing.rotation.y = 0.25;
    rightWing.scale.set(1, 1, 0.2);
    rightWing.userData.type = 'rightWing';
    phoenixGroup.add(rightWing);
    // 尾羽
    for (let t = 0; t < 7; t++) {
      const tail = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 2.5, 6),
        new THREE.MeshBasicMaterial({ color: iceColors[t % 5], transparent: true, opacity: 0.5 })
      );
      tail.position.set((t - 3) * 0.3, 0.2, -1.8);
      tail.rotation.x = -Math.PI / 3 - t * 0.04;
      tail.rotation.z = (t - 3) * 0.12;
      phoenixGroup.add(tail);
    }

    phoenixGroup.position.copy(disasterCenter);
    phoenixGroup.position.y += 1;
    phoenixGroup.lookAt(startPos.clone().add(dir.clone().multiplyScalar(range * 2)));
    game.scene.add(phoenixGroup);
    particles.push(phoenixGroup);

    // 天劫冰雨（从天空落下的巨大冰锥）
    const hailCount = 25;
    for (let i = 0; i < hailCount; i++) {
      const hail = new THREE.Mesh(
        new THREE.ConeGeometry(0.1 + Math.random() * 0.1, 0.8 + Math.random() * 0.6, 6),
        new THREE.MeshBasicMaterial({ color: iceColors[i % 5], transparent: true, opacity: 0.8 })
      );
      hail.position.x = disasterCenter.x + (Math.random() - 0.5) * range * 1.2;
      hail.position.z = disasterCenter.z + (Math.random() - 0.5) * range * 1.2;
      hail.position.y = 6 + Math.random() * 4;
      hail.rotation.x = Math.PI;
      hail.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -6 - Math.random() * 4,
        (Math.random() - 0.5) * 0.5
      );
      hail.userData.rotSpeed = (Math.random() - 0.5) * 0.15;
      hail.userData.baseOpacity = 0.8;
      hail.userData.delay = Math.random() * 0.4;
      hail.visible = false;
      game.scene.add(hail);
      particles.push(hail);
    }

    // 暴风雪粒子
    for (let i = 0; i < 60; i++) {
      const snow = new THREE.Mesh(
        new THREE.SphereGeometry(0.03 + Math.random() * 0.04, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      );
      snow.position.x = disasterCenter.x + (Math.random() - 0.5) * range * 1.5;
      snow.position.z = disasterCenter.z + (Math.random() - 0.5) * range * 1.5;
      snow.position.y = 5 + Math.random() * 3;
      snow.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        -2 - Math.random() * 2,
        (Math.random() - 0.5) * 1.5
      );
      snow.userData.baseOpacity = 0.6;
      game.scene.add(snow);
      particles.push(snow);
    }

    // 地面大冰爆环
    for (let r = 0; r < 5; r++) {
      const shockRing = _createRing(disasterCenter, 0.5 + r * 0.4, iceColors[r % 5], 0.65);
      shockRing.position.y = 0.08;
      shockRing.userData.delay = r * 0.06;
      shockRing.userData.expandSpeed = range * 1.2;
      shockRing.userData.baseOpacity = 0.65;
      shockRing.visible = false;
      game.scene.add(shockRing);
      particles.push(shockRing);
    }

    // 中心光柱
    const lightBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.8, 8, 12),
      new THREE.MeshBasicMaterial({ color: 0xe0ffff, transparent: true, opacity: 0.4 })
    );
    lightBeam.position.copy(disasterCenter);
    lightBeam.position.y = 4;
    lightBeam.scale.y = 0;
    game.scene.add(lightBeam);
    particles.push(lightBeam);

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const wingFlap = Math.sin(t * 8) * 0.3;

        for (const p of particles) {
          if (p === phoenixGroup) {
            // 凤凰逐渐显现并扇动翅膀
            const appearT = Math.min(1, t * 2.5);
            p.scale.setScalar(appearT);
            p.position.y = disasterCenter.y + 1 + Math.sin(t * 2) * 0.3;
            p.children.forEach(child => {
              if (child.userData && child.userData.type === 'leftWing') {
                child.rotation.z = Math.PI / 2 + wingFlap;
              }
              if (child.userData && child.userData.type === 'rightWing') {
                child.rotation.z = -Math.PI / 2 - wingFlap;
              }
            });
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * child.material.opacity * (0.85 + 0.15 * Math.sin(t * 5));
              }
            });
          } else if (p.userData.vel && p.userData.rotSpeed !== undefined && p.geometry && p.geometry.type === 'ConeGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.rotation.z += p.userData.rotSpeed;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p.userData.vel && p.userData.baseOpacity !== undefined && p.geometry && p.geometry.type === 'SphereGeometry' && p.material && p.material.opacity === 0.6) {
            // 雪花
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            if (p.position.y < 0) {
              p.position.y = 8;
              p.position.x = disasterCenter.x + (Math.random() - 0.5) * range * 1.5;
              p.position.z = disasterCenter.z + (Math.random() - 0.5) * range * 1.5;
            }
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined && p.geometry && p.geometry.type === 'TorusGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              const localT = (t - p.userData.delay / maxLife) / (1 - p.userData.delay / maxLife);
              p.scale.setScalar(1 + p.userData.expandSpeed * localT);
              if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT);
            }
          } else if (p === lightBeam) {
            const beamT = Math.min(1, t * 2);
            p.scale.y = beamT;
            p.scale.x = 1 + Math.sin(t * 6) * 0.2;
            p.scale.z = 1 + Math.sin(t * 6) * 0.2;
            if (p.material) p.material.opacity = 0.4 * (life / maxLife);
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }
}

// ========== 8. 碧磷蛇技能特效 ==========
function spawnGreenPhosphorusSnakeSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const poisonColors = [0x32cd32, 0x00ff00, 0x228b22, 0x9acd32, 0x7cfc00, 0x006400, 0xadff2f];
  const up = new THREE.Vector3(0, 1, 0);

  function _cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  // ========== 第1魂技：碧磷毒 - 喷射毒液攻击 ==========
  if (idx === 0) {
    // 毒液喷射流（多股毒液）
    const streamCount = 5;
    for (let s = 0; s < streamCount; s++) {
      const poisonStream = new THREE.Group();
      // 毒液主体（胶囊状）
      for (let d = 0; d < 5; d++) {
        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.08 - d * 0.01, 6, 6),
          new THREE.MeshBasicMaterial({ color: poisonColors[s % 5], transparent: true, opacity: 0.85 - d * 0.1 })
        );
        drop.position.z = d * 0.15;
        poisonStream.add(drop);
      }
      // 毒液尖端
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.15, 6),
        new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.9 })
      );
      tip.position.z = 0.8;
      tip.rotation.x = Math.PI / 2;
      poisonStream.add(tip);

      poisonStream.position.copy(startPos);
      poisonStream.position.y += 0.9;

      // 稍微散开的方向
      const spreadX = (Math.random() - 0.5) * 0.3;
      const spreadY = (Math.random() - 0.5) * 0.15;
      const shootDir = dir.clone();
      shootDir.x += spreadX;
      shootDir.y += spreadY;
      shootDir.normalize();

      const speed = range * 1.8 + Math.random() * 1.5;
      poisonStream.userData.vel = shootDir.multiplyScalar(speed);
      poisonStream.userData.baseOpacity = 0.85;
      poisonStream.userData.gravity = 3;

      poisonStream.lookAt(poisonStream.position.clone().add(shootDir));

      game.scene.add(poisonStream);
      particles.push(poisonStream);
    }

    // 喷射口毒雾
    const muzzleMist = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.7 })
    );
    muzzleMist.position.copy(startPos);
    muzzleMist.position.y += 0.9;
    game.scene.add(muzzleMist);
    particles.push(muzzleMist);

    // 飞溅的毒液滴
    for (let i = 0; i < 15; i++) {
      const drip = _createParticle(startPos, 0.04 + Math.random() * 0.05, poisonColors[Math.floor(Math.random() * 5)], 0.8);
      drip.position.y += 0.9;
      const dripDir = dir.clone();
      dripDir.x += (Math.random() - 0.5) * 0.8;
      dripDir.y += (Math.random() - 0.5) * 0.4;
      dripDir.normalize();
      drip.userData.vel = dripDir.multiplyScalar(range * 0.04 * (0.5 + Math.random()));
      drip.userData.gravity = 8;
      drip.userData.baseOpacity = 0.8;
      game.scene.add(drip);
      particles.push(drip);
    }

    let life = 0.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === muzzleMist) {
            p.scale.setScalar(1 + t * 1.5);
            if (p.material) p.material.opacity = 0.7 * (1 - t);
          } else if (p.userData.vel && p.userData.gravity !== undefined && p.type === 'Group') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * child.material.opacity;
              }
            });
          } else if (p.userData.vel && p.userData.gravity !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第2魂技：蛇缠 - 蛇身缠绕敌人 ==========
  if (idx === 1) {
    const targetPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.6));
    targetPos.y = 0.8;

    // 创建缠绕蛇身（螺旋状）
    const snakeCoil = new THREE.Group();
    const coilSegments = 14;
    for (let i = 0; i < coilSegments; i++) {
      const t = i / coilSegments;
      const angle = t * Math.PI * 3; // 缠绕3圈
      const radius = 0.8 - t * 0.2;
      const height = t * 2;

      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 - t * 0.05, 8, 8),
        new THREE.MeshBasicMaterial({
          color: poisonColors[Math.floor(t * 4) % 5],
          transparent: true,
          opacity: 0.8 - t * 0.15
        })
      );
      seg.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      seg.userData.segIndex = i;
      seg.userData.baseAngle = angle;
      seg.userData.baseRadius = radius;
      seg.userData.baseHeight = height;
      snakeCoil.add(seg);
    }

    // 蛇头（在顶部）
    const snakeHead = new THREE.Group();
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.9 })
    );
    headMesh.scale.set(1, 0.8, 1.3);
    snakeHead.add(headMesh);
    // 蛇眼
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
      );
      eye.position.set(e === 0 ? -0.1 : 0.1, 0.06, 0.2);
      snakeHead.add(eye);
    }
    // 毒牙
    for (let f = 0; f < 2; f++) {
      const fang = new THREE.Mesh(
        new THREE.ConeGeometry(0.02, 0.1, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      fang.position.set(f === 0 ? -0.06 : 0.06, -0.08, 0.22);
      fang.rotation.x = Math.PI;
      snakeHead.add(fang);
    }
    snakeHead.userData.type = 'snakeHead';
    snakeCoil.add(snakeHead);

    snakeCoil.position.copy(targetPos);
    snakeCoil.position.y = 0;
    snakeCoil.scale.setScalar(0);
    game.scene.add(snakeCoil);
    particles.push(snakeCoil);

    // 毒液滴落
    for (let i = 0; i < 10; i++) {
      const drip = _createParticle(targetPos, 0.03 + Math.random() * 0.04, poisonColors[Math.floor(Math.random() * 5)], 0.75);
      drip.position.y += 1 + Math.random() * 1;
      drip.position.x += (Math.random() - 0.5) * 1.5;
      drip.position.z += (Math.random() - 0.5) * 1.5;
      drip.userData.vel = new THREE.Vector3(0, -1 - Math.random() * 1.5, 0);
      drip.userData.gravity = 5;
      drip.userData.baseOpacity = 0.75;
      drip.userData.delay = Math.random() * 0.3;
      drip.visible = false;
      game.scene.add(drip);
      particles.push(drip);
    }

    // 地面毒圈
    const poisonRing = _createRing(targetPos, 0.5, 0x32cd32, 0.6);
    poisonRing.position.y = 0.05;
    poisonRing.userData.expandSpeed = 1.5;
    poisonRing.userData.baseOpacity = 0.6;
    game.scene.add(poisonRing);
    particles.push(poisonRing);

    let life = 1.0;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const appearT = Math.min(1, t * 2.5);

        for (const p of particles) {
          if (p === snakeCoil) {
            p.scale.setScalar(appearT);
            // 蛇身缠绕收紧动画
            p.children.forEach((child, i) => {
              if (child.userData && child.userData.segIndex !== undefined) {
                const segT = child.userData.segIndex / coilSegments;
                const tighten = 1 - Math.sin(t * 3 + segT * 2) * 0.1;
                const newRadius = child.userData.baseRadius * tighten;
                const newAngle = child.userData.baseAngle + t * 1.5;
                child.position.x = Math.cos(newAngle) * newRadius;
                child.position.z = Math.sin(newAngle) * newRadius;
              }
              if (child.userData && child.userData.type === 'snakeHead') {
                // 蛇头跟随最顶端
                const topAngle = Math.PI * 3 + t * 1.5;
                const topRadius = 0.6 * (1 - Math.sin(t * 3) * 0.1);
                child.position.set(
                  Math.cos(topAngle) * topRadius,
                  2,
                  Math.sin(topAngle) * topRadius
                );
                child.lookAt(new THREE.Vector3(0, 2.2, 0));
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t * 0.5);
          } else if (p.userData.vel && p.userData.gravity !== undefined) {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y -= p.userData.gravity * 0.02;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第3魂技：毒雾 - 碧磷毒雾扩散 ==========
  if (idx === 2) {
    const fogCenter = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    fogCenter.y = 0.8;

    // 多层毒雾球（大小不同，颜色渐变）
    for (let layer = 0; layer < 5; layer++) {
      const fogSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 + layer * 0.4, 12, 12),
        new THREE.MeshBasicMaterial({
          color: poisonColors[layer % 5],
          transparent: true,
          opacity: 0.25 - layer * 0.03
        })
      );
      fogSphere.position.copy(fogCenter);
      fogSphere.position.x += (Math.random() - 0.5) * 0.3;
      fogSphere.position.z += (Math.random() - 0.5) * 0.3;
      fogSphere.userData.growSpeed = range * 0.4 + layer * 0.5;
      fogSphere.userData.baseOpacity = 0.25 - layer * 0.03;
      fogSphere.userData.drift = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.3
      );
      game.scene.add(fogSphere);
      particles.push(fogSphere);
    }

    // 毒雾粒子（飘浮）
    for (let i = 0; i < 40; i++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 6, 6),
        new THREE.MeshBasicMaterial({
          color: poisonColors[Math.floor(Math.random() * 5)],
          transparent: true,
          opacity: 0.5 + Math.random() * 0.2
        })
      );
      mist.position.copy(fogCenter);
      mist.position.x += (Math.random() - 0.5) * range * 0.3;
      mist.position.y += (Math.random() - 0.5) * 1.5;
      mist.position.z += (Math.random() - 0.5) * range * 0.3;
      mist.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.1 + Math.random() * 0.3,
        (Math.random() - 0.5) * 0.4
      );
      mist.userData.growSpeed = 0.5 + Math.random() * 0.5;
      mist.userData.baseOpacity = 0.5 + Math.random() * 0.2;
      game.scene.add(mist);
      particles.push(mist);
    }

    // 地面毒雾扩散环
    for (let r = 0; r < 4; r++) {
      const groundFog = _createRing(fogCenter, 0.3 + r * 0.4, poisonColors[r % 5], 0.4);
      groundFog.position.y = 0.1;
      groundFog.userData.expandSpeed = range * 0.6 + r;
      groundFog.userData.baseOpacity = 0.4;
      groundFog.userData.delay = r * 0.05;
      game.scene.add(groundFog);
      particles.push(groundFog);
    }

    // 中心毒液池
    const poisonPool = new THREE.Mesh(
      new THREE.CircleGeometry(0.8, 24),
      new THREE.MeshBasicMaterial({ color: 0x228b22, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    poisonPool.position.copy(fogCenter);
    poisonPool.position.y = 0.03;
    poisonPool.rotation.x = -Math.PI / 2;
    game.scene.add(poisonPool);
    particles.push(poisonPool);

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p.userData.growSpeed !== undefined && p.userData.drift !== undefined) {
            // 大毒雾球
            p.scale.setScalar(1 + p.userData.growSpeed * t);
            p.position.add(p.userData.drift.clone().multiplyScalar(0.02));
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t * 0.6);
          } else if (p.userData.vel && p.userData.growSpeed !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            // 小毒雾粒子
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + p.userData.growSpeed * t * 0.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.expandSpeed !== undefined) {
            const localT = Math.max(0, t - p.userData.delay / maxLife);
            p.scale.setScalar(1 + p.userData.expandSpeed * localT);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT);
          } else if (p === poisonPool) {
            const poolT = Math.min(1, t * 2);
            p.scale.setScalar(poolT);
            if (p.material) p.material.opacity = 0.5 * (0.7 + 0.3 * Math.sin(t * 4));
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第4魂技：蛇信 - 蛇信快速出击 ==========
  if (idx === 3) {
    // 蛇信（分叉舌头）
    const tongueGroup = new THREE.Group();

    // 主舌
    const mainTongue = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 1.5, 6),
      new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.9 })
    );
    mainTongue.position.y = 0.75;
    tongueGroup.add(mainTongue);

    // 分叉（左右两叉）
    for (let f = 0; f < 2; f++) {
      const fork = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.3, 4),
        new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.9 })
      );
      fork.position.set(f === 0 ? -0.05 : 0.05, 1.55, 0);
      fork.rotation.z = f === 0 ? -0.3 : 0.3;
      fork.rotation.x = Math.PI;
      tongueGroup.add(fork);
    }

    // 舌根部
    const tongueBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc143c, transparent: true, opacity: 0.8 })
    );
    tongueBase.position.y = 0;
    tongueGroup.add(tongueBase);

    tongueGroup.position.copy(startPos);
    tongueGroup.position.y += 0.8;
    tongueGroup.scale.y = 0;
    // 朝向攻击方向
    const tongueUp = new THREE.Vector3(0, 1, 0);
    tongueGroup.quaternion.setFromUnitVectors(tongueUp, dir.clone().normalize());
    game.scene.add(tongueGroup);
    particles.push(tongueGroup);

    // 毒液飞溅（沿蛇信路径）
    for (let i = 0; i < 20; i++) {
      const drip = _createParticle(startPos, 0.03 + Math.random() * 0.03, poisonColors[Math.floor(Math.random() * 5)], 0.75);
      drip.position.y += 0.8;
      const t = i / 20;
      // 沿方向分布
      drip.position.add(dir.clone().multiplyScalar(range * t * 0.9));
      drip.position.x += (Math.random() - 0.5) * 0.2;
      drip.position.y += (Math.random() - 0.5) * 0.2;
      drip.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.5
      );
      drip.userData.baseOpacity = 0.75;
      drip.userData.delay = t * 0.2;
      drip.visible = false;
      game.scene.add(drip);
      particles.push(drip);
    }

    // 末端毒爆
    const tipBurst = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0 })
    );
    tipBurst.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.9));
    tipBurst.position.y += 0.8;
    game.scene.add(tipBurst);
    particles.push(tipBurst);

    let life = 0.6;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        // 蛇信快速伸出后收回
        let extendT;
        if (t < 0.4) {
          extendT = t / 0.4; // 伸出
        } else {
          extendT = 1 - (t - 0.4) / 0.6; // 收回
        }
        tongueGroup.scale.y = extendT;
        tongueGroup.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity = (life / maxLife) * child.material.opacity;
          }
        });

        for (const p of particles) {
          if (p.userData.vel && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p === tipBurst) {
            if (t > 0.35 && t < 0.5) {
              const bt = (t - 0.35) / 0.15;
              p.scale.setScalar(1 + bt * 2);
              if (p.material) p.material.opacity = 0.8 * (1 - bt);
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第5魂技：万蛇噬心 - 万蛇齐出撕咬 ==========
  if (idx === 4) {
    const centerPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    centerPos.y = 0.5;

    // 多条小蛇从中心向四周窜出
    const snakeCount = 20;
    for (let s = 0; s < snakeCount; s++) {
      const miniSnake = new THREE.Group();
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        const seg = new THREE.Mesh(
          new THREE.SphereGeometry(0.1 - i * 0.012, 6, 6),
          new THREE.MeshBasicMaterial({
            color: poisonColors[(s + i) % 5],
            transparent: true,
            opacity: 0.8 - i * 0.08
          })
        );
        seg.position.z = -i * 0.18;
        seg.userData.segIndex = i;
        miniSnake.add(seg);
      }
      // 蛇头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.9 })
      );
      head.position.z = 0.15;
      head.scale.set(1, 0.8, 1.2);
      miniSnake.add(head);
      // 红眼
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
      );
      eye.position.set(0, 0.03, 0.22);
      miniSnake.add(eye);

      miniSnake.position.copy(centerPos);

      // 随机方向（从中心向外）
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const moveDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      miniSnake.userData.vel = moveDir.multiplyScalar(speed);
      miniSnake.userData.baseAngle = angle;
      miniSnake.userData.slitherAmp = 0.15 + Math.random() * 0.1;
      miniSnake.userData.baseOpacity = 0.85;

      miniSnake.lookAt(miniSnake.position.clone().add(moveDir));

      game.scene.add(miniSnake);
      particles.push(miniSnake);
    }

    // 中央毒爆
    const centralBurst = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
    );
    centralBurst.position.copy(centerPos);
    game.scene.add(centralBurst);
    particles.push(centralBurst);

    // 毒雾冲击波
    for (let r = 0; r < 3; r++) {
      const shockwave = _createRing(centerPos, 0.3 + r * 0.3, poisonColors[r % 5], 0.6);
      shockwave.position.y = 0.3;
      shockwave.userData.delay = r * 0.05;
      shockwave.userData.expandSpeed = range * 0.9;
      shockwave.userData.baseOpacity = 0.6;
      game.scene.add(shockwave);
      particles.push(shockwave);
    }

    // 飞溅毒液
    for (let i = 0; i < 30; i++) {
      const drip = _createParticle(centerPos, 0.04 + Math.random() * 0.05, poisonColors[Math.floor(Math.random() * 5)], 0.8);
      const angle = Math.random() * Math.PI * 2;
      const vert = Math.random() * Math.PI * 0.5 + 0.2;
      const speed = 2 + Math.random() * 4;
      drip.userData.vel = new THREE.Vector3(
        Math.cos(angle) * Math.sin(vert) * speed,
        Math.cos(vert) * speed,
        Math.sin(angle) * Math.sin(vert) * speed
      );
      drip.userData.gravity = 6;
      drip.userData.baseOpacity = 0.8;
      game.scene.add(drip);
      particles.push(drip);
    }

    let life = 0.9;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        for (const p of particles) {
          if (p === centralBurst) {
            p.scale.setScalar(1 + t * 2);
            if (p.material) p.material.opacity = 0.8 * (1 - t);
          } else if (p.userData.expandSpeed !== undefined) {
            const localT = Math.max(0, t - p.userData.delay / maxLife);
            p.scale.setScalar(1 + p.userData.expandSpeed * localT);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT);
          } else if (p.type === 'Group' && p.userData.vel) {
            // 小蛇蜿蜒前进
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            // 蛇身蜿蜒
            p.children.forEach((child, i) => {
              if (child.userData && child.userData.segIndex !== undefined) {
                child.position.x = Math.sin(t * 10 + i * 0.5) * p.userData.slitherAmp * (1 - i / segments * 0.5);
              }
            });
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * child.material.opacity;
              }
            });
          } else if (p.userData.vel && p.userData.gravity !== undefined) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第6魂技：碧磷神光 - 碧磷神光腐蚀 ==========
  if (idx === 5) {
    const beamStart = startPos.clone();
    beamStart.y += 1;
    const beamEnd = startPos.clone().add(dir.clone().multiplyScalar(range));
    beamEnd.y += 1;

    // 主光束（碧绿神光）
    const mainBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.25, range, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 })
    );
    const beamMid = beamStart.clone().add(beamEnd.clone().sub(beamStart).multiplyScalar(0.5));
    mainBeam.position.copy(beamMid);
    mainBeam.quaternion.setFromUnitVectors(up, dir.clone().normalize());
    game.scene.add(mainBeam);
    particles.push(mainBeam);

    // 内核心光
    const coreBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.1, range, 8),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.95 })
    );
    coreBeam.position.copy(beamMid);
    coreBeam.quaternion.copy(mainBeam.quaternion);
    game.scene.add(coreBeam);
    particles.push(coreBeam);

    // 外层腐蚀雾
    const outerFog = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, range, 10, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
    );
    outerFog.position.copy(beamMid);
    outerFog.quaternion.copy(mainBeam.quaternion);
    game.scene.add(outerFog);
    particles.push(outerFog);

    // 光束发射点
    const sourceGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 1 })
    );
    sourceGlow.position.copy(beamStart);
    game.scene.add(sourceGlow);
    particles.push(sourceGlow);

    // 终点腐蚀爆
    const endBurst = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.8 })
    );
    endBurst.position.copy(beamEnd);
    game.scene.add(endBurst);
    particles.push(endBurst);

    // 沿光束飘散的腐蚀粒子
    for (let i = 0; i < 30; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 6, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.7 })
      );
      const t = Math.random();
      particle.position.copy(beamStart).add(dir.clone().multiplyScalar(range * t));
      particle.position.x += (Math.random() - 0.5) * 0.4;
      particle.position.y += (Math.random() - 0.5) * 0.4;
      particle.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.6
      );
      particle.userData.baseOpacity = 0.7;
      particle.userData.growSpeed = 0.8;
      game.scene.add(particle);
      particles.push(particle);
    }

    // 终点毒液溅射
    for (let i = 0; i < 15; i++) {
      const splash = _createParticle(beamEnd, 0.05 + Math.random() * 0.05, poisonColors[Math.floor(Math.random() * 5)], 0.8);
      const angle = Math.random() * Math.PI * 2;
      const vert = Math.random() * Math.PI * 0.4 + 0.1;
      const speed = 1.5 + Math.random() * 2.5;
      const splashDir = new THREE.Vector3(
        Math.cos(angle) * Math.sin(vert),
        Math.cos(vert),
        Math.sin(angle) * Math.sin(vert)
      );
      // 向反方向溅射
      splash.userData.vel = splashDir.multiplyScalar(speed);
      splash.userData.gravity = 5;
      splash.userData.baseOpacity = 0.8;
      game.scene.add(splash);
      particles.push(splash);
    }

    let life = 0.7;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        // 光束射出效果
        const beamT = Math.min(1, t * 3);

        mainBeam.scale.y = beamT;
        coreBeam.scale.y = beamT;
        outerFog.scale.y = beamT;

        // 光束脉动
        mainBeam.scale.x = 1 + Math.sin(t * 15) * 0.15;
        mainBeam.scale.z = 1 + Math.sin(t * 15) * 0.15;
        coreBeam.scale.x = 1 + Math.sin(t * 15 + 1) * 0.2;
        coreBeam.scale.z = 1 + Math.sin(t * 15 + 1) * 0.2;
        outerFog.scale.x = 1 + Math.sin(t * 8) * 0.1;
        outerFog.scale.z = 1 + Math.sin(t * 8) * 0.1;

        if (mainBeam.material) mainBeam.material.opacity = 0.7 * (life / maxLife);
        if (coreBeam.material) coreBeam.material.opacity = 0.95 * (life / maxLife);
        if (outerFog.material) outerFog.material.opacity = 0.3 * (life / maxLife);

        // 发射点
        sourceGlow.scale.setScalar(1 + Math.sin(t * 12) * 0.2);
        if (sourceGlow.material) sourceGlow.material.opacity = (1 - t * 0.5);

        // 终点爆
        if (t > 0.3) {
          const et = (t - 0.3) / 0.7;
          endBurst.scale.setScalar(1 + et * 2);
          if (endBurst.material) endBurst.material.opacity = 0.8 * (1 - et);
        }

        for (const p of particles) {
          if (p.userData.vel && p.userData.growSpeed !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + p.userData.growSpeed * t * 0.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.vel && p.userData.gravity !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            if (t > 0.3) {
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y -= p.userData.gravity * 0.02;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第7魂技：蛇皇真身 - 巨蛇皇现身，剧毒之力 ==========
  if (idx === 6) {
    // 创建蛇皇真身
    const emperorSnake = new THREE.Group();

    // 蛇身（蜿蜒多节）
    const bodySegments = 12;
    for (let i = 0; i < bodySegments; i++) {
      const t = i / bodySegments;
      const segSize = 0.45 * (1 - t * 0.35);
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(segSize, 10, 10),
        new THREE.MeshBasicMaterial({
          color: poisonColors[Math.floor(t * 4) % 5],
          transparent: true,
          opacity: 0.75 - t * 0.15
        })
      );
      seg.position.set(0, 0.3 + Math.sin(i * 0.5) * 0.1, -i * 0.55);
      seg.userData.segIndex = i;
      seg.userData.baseX = 0;
      seg.userData.baseY = 0.3 + Math.sin(i * 0.5) * 0.1;
      emperorSnake.add(seg);
    }

    // 蛇皇头（更威严）
    const snakeHead = new THREE.Group();
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x228b22, transparent: true, opacity: 0.9 })
    );
    headMesh.scale.set(1, 0.85, 1.4);
    snakeHead.add(headMesh);
    // 皇冠状蛇鳞突起
    for (let c = 0; c < 5; c++) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.2, 4),
        new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.9 })
      );
      crown.position.set((c - 2) * 0.12, 0.5, 0.1);
      snakeHead.add(crown);
    }
    // 蛇眼（血红）
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
      );
      eye.position.set(e === 0 ? -0.2 : 0.2, 0.12, 0.5);
      snakeHead.add(eye);
    }
    // 毒牙
    for (let f = 0; f < 2; f++) {
      const fang = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.2, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      fang.position.set(f === 0 ? -0.12 : 0.12, -0.15, 0.55);
      fang.rotation.x = Math.PI;
      snakeHead.add(fang);
    }
    // 分叉舌
    const tongue = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.4, 4),
      new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.9 })
    );
    tongue.position.set(0, -0.05, 0.75);
    tongue.rotation.x = Math.PI / 2;
    snakeHead.add(tongue);

    snakeHead.position.set(0, 0.4, 0.5);
    snakeHead.userData.type = 'snakeHead';
    emperorSnake.add(snakeHead);

    emperorSnake.position.copy(startPos);
    emperorSnake.position.y += 0.3;
    emperorSnake.lookAt(startPos.clone().add(dir.clone().multiplyScalar(range)));
    emperorSnake.scale.setScalar(0);
    game.scene.add(emperorSnake);
    particles.push(emperorSnake);

    // 地面毒圈扩散
    for (let r = 0; r < 4; r++) {
      const poisonRing = _createRing(startPos, 0.6 + r * 0.5, poisonColors[r % 5], 0.55);
      poisonRing.position.y = 0.08;
      poisonRing.userData.expandSpeed = 2.5 + r;
      poisonRing.userData.baseOpacity = 0.55;
      game.scene.add(poisonRing);
      particles.push(poisonRing);
    }

    // 毒雾升腾
    for (let i = 0; i < 25; i++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.1, 6, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.5 })
      );
      mist.position.x = startPos.x + (Math.random() - 0.5) * range * 0.6;
      mist.position.z = startPos.z + (Math.random() - 0.5) * range * 0.6;
      mist.position.y = 0.1;
      mist.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        0.5 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.3
      );
      mist.userData.growSpeed = 1;
      mist.userData.baseOpacity = 0.5;
      game.scene.add(mist);
      particles.push(mist);
    }

    // 蛇鳞碎片飞散
    for (let i = 0; i < 20; i++) {
      const scale = new THREE.Mesh(
        new THREE.CircleGeometry(0.06 + Math.random() * 0.04, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[i % 5], transparent: true, opacity: 0.7 })
      );
      scale.position.copy(startPos);
      scale.position.y += 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      scale.userData.vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        0.5 + Math.random(),
        Math.sin(angle) * speed
      );
      scale.userData.rotSpeed = (Math.random() - 0.5) * 0.3;
      scale.userData.baseOpacity = 0.7;
      game.scene.add(scale);
      particles.push(scale);
    }

    let life = 1.2;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const appearT = Math.min(1, t * 2.5);

        for (const p of particles) {
          if (p === emperorSnake) {
            p.scale.setScalar(appearT);
            // 蛇身蜿蜒
            p.children.forEach((child, i) => {
              if (child.userData && child.userData.segIndex !== undefined) {
                const segIdx = child.userData.segIndex;
                child.position.x = child.userData.baseX + Math.sin(t * 6 + segIdx * 0.4) * 0.2 * (1 - segIdx / bodySegments * 0.3);
                child.position.y = child.userData.baseY + Math.sin(t * 4 + segIdx * 0.3) * 0.08;
              }
            });
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * child.material.opacity;
              }
            });
          } else if (p.userData.expandSpeed !== undefined) {
            p.scale.setScalar(1 + p.userData.expandSpeed * t);
            if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - t);
          } else if (p.userData.vel && p.userData.growSpeed !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.scale.setScalar(1 + p.userData.growSpeed * t * 0.5);
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          } else if (p.userData.vel && p.userData.rotSpeed !== undefined && p.geometry && p.geometry.type === 'CircleGeometry') {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= 2 * 0.02;
            p.rotation.x += p.userData.rotSpeed;
            p.rotation.z += p.userData.rotSpeed * 0.7;
            if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第8魂技：毒域 - 毒域展开，万物中毒 ==========
  if (idx === 7) {
    const domainCenter = startPos.clone();
    domainCenter.y = 0;
    const domainRadius = range;

    // 毒域地面（毒液池）
    const poisonFloor = new THREE.Mesh(
      new THREE.CircleGeometry(domainRadius, 48),
      new THREE.MeshBasicMaterial({ color: 0x228b22, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    poisonFloor.position.copy(domainCenter);
    poisonFloor.position.y = 0.02;
    poisonFloor.rotation.x = -Math.PI / 2;
    poisonFloor.scale.setScalar(0);
    game.scene.add(poisonFloor);
    particles.push(poisonFloor);

    // 毒域内环
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(domainRadius * 0.5, domainRadius * 0.55, 36),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    innerRing.position.copy(domainCenter);
    innerRing.position.y = 0.04;
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.scale.setScalar(0);
    game.scene.add(innerRing);
    particles.push(innerRing);

    // 毒雾墙（圆柱）
    const poisonWall = new THREE.Mesh(
      new THREE.CylinderGeometry(domainRadius, domainRadius, 3.5, 48, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x32cd32, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    poisonWall.position.copy(domainCenter);
    poisonWall.position.y = 1.75;
    poisonWall.scale.setScalar(0);
    game.scene.add(poisonWall);
    particles.push(poisonWall);

    // 毒液柱（从地面升起）
    for (let i = 0; i < 20; i++) {
      const venomPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06 + Math.random() * 0.05, 0.1 + Math.random() * 0.05, 1.2 + Math.random() * 1.5, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.65 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * domainRadius * 0.85;
      venomPillar.position.x = domainCenter.x + Math.cos(angle) * dist;
      venomPillar.position.z = domainCenter.z + Math.sin(angle) * dist;
      venomPillar.position.y = 0.6 + Math.random() * 0.75;
      venomPillar.scale.y = 0;
      venomPillar.userData.delay = 0.2 + Math.random() * 0.4;
      venomPillar.userData.phase = Math.random() * Math.PI * 2;
      venomPillar.userData.baseOpacity = 0.65;
      game.scene.add(venomPillar);
      particles.push(venomPillar);
    }

    // 升腾的毒气泡
    for (let i = 0; i < 50; i++) {
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.05 + Math.random() * 0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.55 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * domainRadius * 0.9;
      bubble.position.x = domainCenter.x + Math.cos(angle) * dist;
      bubble.position.z = domainCenter.z + Math.sin(angle) * dist;
      bubble.position.y = 0.05;
      bubble.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        0.4 + Math.random() * 0.8,
        (Math.random() - 0.5) * 0.2
      );
      bubble.userData.baseOpacity = 0.55;
      bubble.userData.delay = Math.random() * 0.5;
      bubble.visible = false;
      game.scene.add(bubble);
      particles.push(bubble);
    }

    // 毒液飞溅
    for (let i = 0; i < 25; i++) {
      const splash = _createParticle(domainCenter, 0.04 + Math.random() * 0.05, poisonColors[Math.floor(Math.random() * 5)], 0.7);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * domainRadius * 0.7;
      splash.position.x = domainCenter.x + Math.cos(angle) * dist;
      splash.position.z = domainCenter.z + Math.sin(angle) * dist;
      splash.position.y = 0.1;
      splash.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      splash.userData.gravity = 4;
      splash.userData.baseOpacity = 0.7;
      splash.userData.delay = Math.random() * 0.4;
      splash.visible = false;
      game.scene.add(splash);
      particles.push(splash);
    }

    let life = 1.4;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        const expandT = Math.min(1, t * 2);

        for (const p of particles) {
          if (p === poisonFloor) {
            p.scale.setScalar(expandT);
            if (p.material) p.material.opacity = 0.4 * (0.7 + 0.3 * Math.sin(t * 3));
          } else if (p === innerRing) {
            p.scale.setScalar(expandT);
            p.rotation.z += 0.03;
            if (p.material) p.material.opacity = 0.6 * (life / maxLife);
          } else if (p === poisonWall) {
            p.scale.setScalar(expandT);
            p.scale.y = 1 + Math.sin(t * 2) * 0.1;
            if (p.material) p.material.opacity = 0.25 * (life / maxLife);
          } else if (p.userData.delay !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
            if (t > p.userData.delay / maxLife) {
              const localT = (t - p.userData.delay / maxLife) / (1 - p.userData.delay / maxLife);
              const riseT = Math.min(1, localT * 3);
              p.scale.y = riseT;
              // 脉动
              p.scale.x = 1 + Math.sin(t * 4 + p.userData.phase) * 0.1;
              p.scale.z = 1 + Math.sin(t * 4 + p.userData.phase) * 0.1;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p.userData.vel && p.userData.baseOpacity !== undefined && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'SphereGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.position.y > 3.5) p.position.y = 0.05;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p.userData.vel && p.userData.gravity !== undefined) {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              p.userData.vel.y -= p.userData.gravity * 0.02;
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }

  // ========== 第9魂技：碧磷万劫 - 终极奥义，万毒噬身，永劫不复 ==========
  if (idx === 8) {
    const disasterCenter = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));
    disasterCenter.y = 1.5;

    // 巨型蛇皇虚影（盘绕）
    const emperorPhantom = new THREE.Group();

    // 盘绕的蛇身（螺旋上升）
    const coilSegments = 20;
    for (let i = 0; i < coilSegments; i++) {
      const t = i / coilSegments;
      const angle = t * Math.PI * 4;
      const radius = 1.5 - t * 0.4;
      const height = t * 3;
      const segSize = 0.35 * (1 - t * 0.3);

      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(segSize, 10, 10),
        new THREE.MeshBasicMaterial({
          color: poisonColors[Math.floor(t * 5) % 5],
          transparent: true,
          opacity: 0.7 - t * 0.15
        })
      );
      seg.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      seg.userData.segIndex = i;
      seg.userData.baseAngle = angle;
      seg.userData.baseRadius = radius;
      seg.userData.baseHeight = height;
      emperorPhantom.add(seg);
    }

    // 蛇皇头（顶端，俯视）
    const headGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0x006400, transparent: true, opacity: 0.9 })
    );
    headMesh.scale.set(1, 0.8, 1.5);
    headGroup.add(headMesh);
    // 毒皇冠
    for (let c = 0; c < 7; c++) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.25, 4),
        new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.95 })
      );
      crown.position.set((c - 3) * 0.12, 0.55, 0.15);
      headGroup.add(crown);
    }
    // 血红蛇眼（发光）
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 1 })
      );
      eye.position.set(e === 0 ? -0.22 : 0.22, 0.15, 0.55);
      headGroup.add(eye);
    }
    // 毒牙
    for (let f = 0; f < 2; f++) {
      const fang = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.25, 4),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      fang.position.set(f === 0 ? -0.13 : 0.13, -0.2, 0.6);
      fang.rotation.x = Math.PI;
      headGroup.add(fang);
    }
    headGroup.userData.type = 'head';
    emperorPhantom.add(headGroup);

    emperorPhantom.position.copy(disasterCenter);
    emperorPhantom.position.y = -1.5;
    emperorPhantom.scale.setScalar(0);
    game.scene.add(emperorPhantom);
    particles.push(emperorPhantom);

    // 万道毒箭从中心射向四周
    const poisonArrowCount = 40;
    for (let i = 0; i < poisonArrowCount; i++) {
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.4, 5),
        new THREE.MeshBasicMaterial({ color: poisonColors[i % 5], transparent: true, opacity: 0.85 })
      );
      // 球形随机方向
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.7 + 0.15;
      const arrowDir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );
      arrow.position.copy(disasterCenter).add(arrowDir.clone().multiplyScalar(0.5));
      arrow.lookAt(disasterCenter.clone().add(arrowDir.clone().multiplyScalar(2)));
      arrow.rotateX(Math.PI / 2);
      arrow.userData.vel = arrowDir.multiplyScalar(range * 0.9 + Math.random() * 2);
      arrow.userData.baseOpacity = 0.85;
      arrow.userData.delay = 0.2 + Math.random() * 0.3;
      arrow.visible = false;
      game.scene.add(arrow);
      particles.push(arrow);
    }

    // 剧毒雨（从天空落下）
    for (let i = 0; i < 50; i++) {
      const rain = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 5, 5),
        new THREE.MeshBasicMaterial({ color: poisonColors[Math.floor(Math.random() * 5)], transparent: true, opacity: 0.7 })
      );
      rain.position.x = disasterCenter.x + (Math.random() - 0.5) * range * 1.5;
      rain.position.z = disasterCenter.z + (Math.random() - 0.5) * range * 1.5;
      rain.position.y = 6 + Math.random() * 3;
      rain.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        -4 - Math.random() * 3,
        (Math.random() - 0.5) * 0.5
      );
      rain.userData.baseOpacity = 0.7;
      rain.userData.delay = Math.random() * 0.5;
      rain.visible = false;
      game.scene.add(rain);
      particles.push(rain);
    }

    // 地面大毒爆环
    for (let r = 0; r < 6; r++) {
      const shockRing = _createRing(disasterCenter, 0.4 + r * 0.35, poisonColors[r % 5], 0.6);
      shockRing.position.y = 0.1;
      shockRing.userData.delay = r * 0.05;
      shockRing.userData.expandSpeed = range * 1.3;
      shockRing.userData.baseOpacity = 0.6;
      shockRing.visible = false;
      game.scene.add(shockRing);
      particles.push(shockRing);
    }

    // 中心毒光柱
    const poisonPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.8, 7, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 })
    );
    poisonPillar.position.copy(disasterCenter);
    poisonPillar.position.y = 3.5;
    poisonPillar.scale.y = 0;
    game.scene.add(poisonPillar);
    particles.push(poisonPillar);

    // 内芯光柱
    const innerPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.3, 7, 10),
      new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true, opacity: 0.8 })
    );
    innerPillar.position.copy(disasterCenter);
    innerPillar.position.y = 3.5;
    innerPillar.scale.y = 0;
    game.scene.add(innerPillar);
    particles.push(innerPillar);

    let life = 1.5;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;

        for (const p of particles) {
          if (p === emperorPhantom) {
            const appearT = Math.min(1, t * 2.5);
            p.scale.setScalar(appearT);
            // 蛇身旋转
            p.children.forEach((child, i) => {
              if (child.userData && child.userData.segIndex !== undefined) {
                const newAngle = child.userData.baseAngle + t * 1;
                child.position.x = Math.cos(newAngle) * child.userData.baseRadius;
                child.position.z = Math.sin(newAngle) * child.userData.baseRadius;
              }
              if (child.userData && child.userData.type === 'head') {
                const topAngle = Math.PI * 4 + t * 1;
                const topRadius = 1.1;
                child.position.set(
                  Math.cos(topAngle) * topRadius,
                  3,
                  Math.sin(topAngle) * topRadius
                );
                child.lookAt(new THREE.Vector3(0, 3.3, 0));
              }
            });
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = (life / maxLife) * child.material.opacity;
              }
            });
          } else if (p.userData.vel && p.geometry && p.geometry.type === 'ConeGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p.userData.vel && p.userData.delay !== undefined && p.geometry && p.geometry.type === 'SphereGeometry' && p.userData.baseOpacity === 0.7) {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
              if (p.position.y < 0) {
                p.position.y = 8;
                p.position.x = disasterCenter.x + (Math.random() - 0.5) * range * 1.5;
                p.position.z = disasterCenter.z + (Math.random() - 0.5) * range * 1.5;
              }
              if (p.material) p.material.opacity = (life / maxLife) * p.userData.baseOpacity;
            }
          } else if (p.userData.expandSpeed !== undefined && p.geometry && p.geometry.type === 'TorusGeometry') {
            if (t > p.userData.delay / maxLife) {
              p.visible = true;
              const localT = (t - p.userData.delay / maxLife) / (1 - p.userData.delay / maxLife);
              p.scale.setScalar(1 + p.userData.expandSpeed * localT);
              if (p.material) p.material.opacity = p.userData.baseOpacity * (1 - localT);
            }
          } else if (p === poisonPillar) {
            const pillarT = Math.min(1, t * 2);
            p.scale.y = pillarT;
            p.scale.x = 1 + Math.sin(t * 5) * 0.15;
            p.scale.z = 1 + Math.sin(t * 5) * 0.15;
            if (p.material) p.material.opacity = 0.5 * (life / maxLife);
          } else if (p === innerPillar) {
            const pillarT = Math.min(1, t * 2.2);
            p.scale.y = pillarT;
            p.scale.x = 1 + Math.sin(t * 7) * 0.2;
            p.scale.z = 1 + Math.sin(t * 7) * 0.2;
            if (p.material) p.material.opacity = 0.8 * (life / maxLife);
          }
        }
        requestAnimationFrame(animate);
      } else {
        _cleanup();
      }
    };
    animate();
    return;
  }
}

// ========== 9. 钻石猛犸技能特效 ==========
function spawnDiamondMammothSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const earthColors = [0x8b4513, 0xa0522d, 0xd2691e, 0xdeb887, 0xcd853f];
  const diamondColors = [0xb0c4de, 0xe6e6fa, 0x87cefa, 0xffffff, 0xadd8e6];
  const goldColor = 0xffd700;

  function cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  function createAnim(duration, updateFn) {
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        updateFn(t, life / maxLife);
        requestAnimationFrame(animate);
      } else {
        cleanup();
      }
    };
    animate();
  }

  // ===== 第1魂技：大力金刚掌 =====
  if (idx === 0) {
    const duration = 0.8;

    // 巨大掌印（向前拍击）- 使用Box组合成手掌形状
    const palmGroup = new THREE.Group();
    // 掌心 - 大菱形
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 1.0),
      new THREE.MeshBasicMaterial({ color: 0xd2691e, transparent: true, opacity: 0.9 })
    );
    palm.position.y = 1.2;
    palmGroup.add(palm);
    // 五指 - 向前伸出
    for (let f = 0; f < 5; f++) {
      const fingerLen = f === 2 ? 0.7 : (f === 1 || f === 3 ? 0.6 : 0.45);
      const finger = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.14, fingerLen),
        new THREE.MeshBasicMaterial({ color: 0xcd853f, transparent: true, opacity: 0.85 })
      );
      finger.position.set((f - 2) * 0.22, 1.2, 0.5 + fingerLen / 2);
      palmGroup.add(finger);
      // 指甲 - 钻石
      const nail = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08, 0),
        new THREE.MeshBasicMaterial({ color: diamondColors[f % 5], transparent: true, opacity: 0.95 })
      );
      nail.position.set((f - 2) * 0.22, 1.22, 0.5 + fingerLen + 0.05);
      palmGroup.add(nail);
    }
    // 掌心血钻石
    const coreDiamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 })
    );
    coreDiamond.position.y = 1.3;
    coreDiamond.position.z = 0;
    palmGroup.add(coreDiamond);

    palmGroup.position.copy(startPos);
    palmGroup.position.y += 0.2;
    palmGroup.lookAt(startPos.clone().add(dir));
    palmGroup.scale.setScalar(0.3);
    game.scene.add(palmGroup);
    particles.push(palmGroup);

    // 地面震动环 - 多层扩散
    const hitPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.7));
    hitPos.y = 0.05;
    for (let r = 0; r < 6; r++) {
      const ring = _createRing(hitPos, 0.2 + r * 0.25, earthColors[r % 5], 0.0);
      ring.userData.baseOpacity = 0.65;
      ring.userData.expandSpeed = 4 + r;
      ring.userData.delay = r * 0.05;
      ring.userData.ringIdx = r;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 掌风碎石粒子
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, earthColors[Math.floor(Math.random() * 5)], 0.85);
      const spreadX = (Math.random() - 0.5) * 1.2;
      const spreadY = (Math.random() - 0.5) * 0.8;
      p.position.x += spreadX;
      p.position.y += 1 + spreadY;
      p.position.z += (Math.random() - 0.5) * 0.5;
      p.userData.vel = new THREE.Vector3(
        spreadX * 1.5 + dir.x * (5 + Math.random() * 3),
        spreadY + (Math.random() - 0.5) * 2,
        dir.z * (5 + Math.random() * 3) + (Math.random() - 0.5) * 1.5
      );
      p.userData.baseOpacity = 0.85;
      p.userData.gravity = 5;
      p.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      game.scene.add(p);
      particles.push(p);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === palmGroup) {
          // 掌印快速前冲并放大，到达后拍击震动
          const moveT = Math.min(t * 1.8, 1);
          p.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.65 * moveT));
          p.position.y += 0.3 + Math.sin(moveT * Math.PI) * 0.4;
          const scaleBase = 0.3 + moveT * 0.9;
          const shake = moveT > 0.8 ? Math.sin(t * 40) * 0.05 : 0;
          p.scale.setScalar(scaleBase + shake);
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = lifeRatio * (child === coreDiamond ? 0.95 : 0.85);
            }
          });
        } else if (p.userData.expandSpeed !== undefined && p.userData.ringIdx !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            // 波浪起伏
            p.position.y = 0.05 + Math.sin(delayT * 10 + p.userData.ringIdx) * 0.06;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.9) * p.userData.baseOpacity);
          }
        } else if (p.userData.vel) {
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.y -= p.userData.gravity * 0.02;
          if (p.userData.rotSpeed) {
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
          }
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第2魂技：金刚护体 =====
  if (idx === 1) {
    const duration = 1.0;

    // 金色球形护盾 - 多层
    const shieldGroup = new THREE.Group();
    // 外层护盾 - 大球
    const outerShield = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 16),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0, side: THREE.DoubleSide, wireframe: false })
    );
    outerShield.position.y = 0.8;
    outerShield.userData.targetOpacity = 0.25;
    shieldGroup.add(outerShield);
    // 中层 - 钻石纹理（八面体环绕）
    for (let d = 0; d < 12; d++) {
      const diamondShard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.MeshBasicMaterial({ color: diamondColors[d % 5], transparent: true, opacity: 0.0 })
      );
      const theta = (d / 12) * Math.PI * 2;
      const phi = (d % 3) * 0.5 + 0.3;
      diamondShard.position.set(
        Math.sin(phi) * Math.cos(theta) * 1.1,
        0.8 + Math.cos(phi) * 1.1,
        Math.sin(phi) * Math.sin(theta) * 1.1
      );
      diamondShard.userData.targetOpacity = 0.85;
      diamondShard.userData.orbitAngle = theta;
      diamondShard.userData.orbitRadius = 1.1;
      diamondShard.userData.orbitY = 0.8 + Math.cos(phi) * 1.1;
      diamondShard.userData.sparkle = true;
      shieldGroup.add(diamondShard);
    }
    // 内层金色光罩
    const innerShield = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.0, side: THREE.BackSide })
    );
    innerShield.position.y = 0.8;
    innerShield.userData.targetOpacity = 0.15;
    shieldGroup.add(innerShield);
    // 六边形能量板
    for (let h = 0; h < 6; h++) {
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.05, 6),
        new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
      );
      const angle = (h / 6) * Math.PI * 2;
      plate.position.set(Math.cos(angle) * 1.0, 0.8 + (h % 2) * 0.4 - 0.2, Math.sin(angle) * 1.0);
      plate.rotation.x = Math.PI / 2;
      plate.rotation.z = angle;
      plate.userData.targetOpacity = 0.7;
      shieldGroup.add(plate);
    }

    shieldGroup.position.copy(startPos);
    game.scene.add(shieldGroup);
    particles.push(shieldGroup);

    // 汇聚的金光粒子
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.08, goldColor, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = 2.5 + Math.random() * 2;
      p.position.x += Math.cos(angle) * dist;
      p.position.y += 0.3 + Math.random() * 1.8;
      p.position.z += Math.sin(angle) * dist;
      p.userData.targetPos = new THREE.Vector3(
        startPos.x + (Math.random() - 0.5) * 0.8,
        startPos.y + 0.5 + Math.random() * 1.2,
        startPos.z + (Math.random() - 0.5) * 0.8
      );
      p.userData.baseOpacity = 0.9;
      p.userData.converge = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面金色光环
    const groundRing = _createRing(startPos, 0.3, goldColor, 0.0);
    groundRing.position.y = 0.05;
    groundRing.userData.baseOpacity = 0.7;
    groundRing.userData.targetRadius = 1.8;
    game.scene.add(groundRing);
    particles.push(groundRing);

    createAnim(duration, (t, lifeRatio) => {
      // 淡入淡出曲线
      let fadeInOut = 1;
      if (t < 0.25) fadeInOut = t / 0.25;
      else if (t > 0.75) fadeInOut = (1 - t) / 0.25;

      for (const p of particles) {
        if (p === shieldGroup) {
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
              child.material.opacity = fadeInOut * child.userData.targetOpacity;
              if (child.userData.sparkle) {
                child.material.opacity *= 0.5 + Math.sin(t * 15 + child.position.x * 5) * 0.5;
              }
            }
            // 钻石碎片环绕旋转
            if (child.userData.orbitAngle !== undefined) {
              const newAngle = child.userData.orbitAngle + t * 3;
              child.position.x = Math.cos(newAngle) * child.userData.orbitRadius;
              child.position.z = Math.sin(newAngle) * child.userData.orbitRadius;
              child.rotation.y += 0.05;
              child.rotation.x += 0.03;
            }
          });
          // 护盾呼吸效果
          const breathe = 1 + Math.sin(t * 4) * 0.05;
          p.scale.setScalar(breathe);
        } else if (p.userData.converge) {
          const convT = Math.min(t * 2.5, 1);
          p.position.lerpVectors(p.position.clone(), p.userData.targetPos, convT * 0.12);
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p.userData.targetRadius !== undefined) {
          // 地面光环扩散
          const ringT = Math.min(t * 2, 1);
          const radius = 0.3 + (p.userData.targetRadius - 0.3) * ringT;
          p.scale.setScalar(radius / 0.3);
          if (p.material) p.material.opacity = fadeInOut * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第3魂技：大力金刚拳 =====
  if (idx === 2) {
    const duration = 0.7;

    // 巨拳 - 拳头+前臂组合
    const fistGroup = new THREE.Group();
    // 拳头主体
    const fist = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.55, 0.7),
      new THREE.MeshBasicMaterial({ color: 0xd2691e, transparent: true, opacity: 0.9 })
    );
    fist.position.y = 1.0;
    fistGroup.add(fist);
    // 指节钻石强化
    for (let k = 0; k < 4; k++) {
      const knuckle = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.1, 0),
        new THREE.MeshBasicMaterial({ color: diamondColors[k % 5], transparent: true, opacity: 0.95 })
      );
      knuckle.position.set((k - 1.5) * 0.14, 1.1, 0.32);
      fistGroup.add(knuckle);
    }
    // 前臂
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8),
      new THREE.MeshBasicMaterial({ color: 0xa0522d, transparent: true, opacity: 0.75 })
    );
    forearm.position.y = 1.0;
    forearm.position.z = -0.6;
    forearm.rotation.x = Math.PI / 2;
    fistGroup.add(forearm);
    // 拳锋金光
    const fistGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.6 })
    );
    fistGlow.position.y = 1.05;
    fistGlow.position.z = 0.35;
    fistGroup.add(fistGlow);

    fistGroup.position.copy(startPos);
    fistGroup.position.y += 0.2;
    fistGroup.lookAt(startPos.clone().add(dir));
    fistGroup.scale.setScalar(0.6);
    game.scene.add(fistGroup);
    particles.push(fistGroup);

    // 锥形冲击波 - 多层
    for (let s = 0; s < 5; s++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 + s * 0.12, 0.4 + s * 0.15, 8),
        new THREE.MeshBasicMaterial({ color: earthColors[s % 5], transparent: true, opacity: 0.0 })
      );
      cone.position.copy(startPos).add(dir.clone().multiplyScalar(0.4 + s * 0.5));
      cone.position.y += 1.0;
      const up = new THREE.Vector3(0, 1, 0);
      cone.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      cone.userData.baseOpacity = 0.55;
      cone.userData.expandSpeed = 2.5 + s * 0.8;
      cone.userData.delay = s * 0.04;
      cone.userData.coneIdx = s;
      game.scene.add(cone);
      particles.push(cone);
    }

    // 拳风螺旋粒子
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.07, 0xf5deb3, 0.8);
      p.userData.baseOpacity = 0.8;
      p.userData.speed = 9 + Math.random() * 5;
      p.userData.spreadRadius = 0.1 + Math.random() * 0.5;
      p.userData.spiralOffset = Math.random() * Math.PI * 2;
      p.userData.trailDelay = Math.random() * 0.3;
      game.scene.add(p);
      particles.push(p);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === fistGroup) {
          // 拳头加速前冲
          const chargeT = Math.min(t * 1.6, 1);
          const easeOut = 1 - Math.pow(1 - chargeT, 3);
          p.position.copy(startPos).add(dir.clone().multiplyScalar(range * easeOut));
          p.position.y += 0.3 + Math.sin(chargeT * Math.PI) * 0.25;
          // 冲击时拳头放大震动
          const punchScale = 0.6 + easeOut * 0.7 + (t > 0.6 ? Math.sin(t * 50) * 0.05 : 0);
          p.scale.setScalar(punchScale);
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = lifeRatio * (child === fistGlow ? 0.7 : 0.85);
            }
          });
        } else if (p.userData.coneIdx !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            const expandT = Math.min(delayT * 3, 1);
            p.scale.setScalar(1 + p.userData.expandSpeed * expandT);
            // 沿方向推进
            const basePos = startPos.clone().add(dir.clone().multiplyScalar(0.4 + p.userData.coneIdx * 0.5));
            p.position.copy(basePos).add(dir.clone().multiplyScalar(expandT * range * 0.3));
            if (p.material) p.material.opacity = Math.max(0, (1 - expandT) * p.userData.baseOpacity);
          }
        } else if (p.userData.speed) {
          const trailT = Math.min((t + p.userData.trailDelay) * 1.5, 1);
          if (trailT < 1) {
            const spiralAngle = p.userData.spiralOffset + trailT * 8;
            const r = p.userData.spreadRadius * (1 - trailT * 0.5);
            // 垂直于方向的平面
            const perpX = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
            const perpY = new THREE.Vector3(0, 1, 0);
            const offset = perpX.clone().multiplyScalar(Math.cos(spiralAngle) * r)
              .add(perpY.clone().multiplyScalar(Math.sin(spiralAngle) * r));
            p.position.copy(startPos).add(dir.clone().multiplyScalar(range * trailT)).add(offset);
            p.position.y += 1.0;
            if (p.material) p.material.opacity = (1 - trailT) * p.userData.baseOpacity * lifeRatio;
          }
        }
      }
    });
    return;
  }

  // ===== 第4魂技：地震波 =====
  if (idx === 3) {
    const duration = 1.1;

    const stompPos = startPos.clone();
    stompPos.y = 0.05;

    // 中心爆发核心
    const burstCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.35, 0),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    burstCore.position.copy(stompPos);
    burstCore.userData.baseOpacity = 0.85;
    game.scene.add(burstCore);
    particles.push(burstCore);

    // 8层环形地震波
    const waveCount = 8;
    for (let w = 0; w < waveCount; w++) {
      const ring = _createRing(stompPos, 0.15 + w * 0.2, earthColors[w % 5], 0.0);
      ring.userData.baseOpacity = 0.65 - w * 0.04;
      ring.userData.expandSpeed = 3.5 + w * 0.6;
      ring.userData.delay = w * 0.045;
      ring.userData.waveIdx = w;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 放射状地面裂缝
    for (let c = 0; c < 16; c++) {
      const angle = (c / 16) * Math.PI * 2;
      const crackLen = range * (0.5 + Math.random() * 0.4);
      const crack = new THREE.Mesh(
        new THREE.BoxGeometry(crackLen, 0.04, 0.1 + Math.random() * 0.08),
        new THREE.MeshBasicMaterial({ color: 0x4a2511, transparent: true, opacity: 0.0 })
      );
      crack.position.copy(stompPos);
      crack.position.x += Math.cos(angle) * crackLen / 2;
      crack.position.z += Math.sin(angle) * crackLen / 2;
      crack.rotation.y = angle;
      crack.userData.baseOpacity = 0.75;
      crack.userData.crackLen = crackLen;
      crack.userData.angle = angle;
      game.scene.add(crack);
      particles.push(crack);
    }

    // 碎石从裂缝喷出 - 抛物线
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(stompPos, 0.07 + Math.random() * 0.14, earthColors[Math.floor(Math.random() * 5)], 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.2 + Math.random() * range * 0.7;
      p.position.x += Math.cos(angle) * dist * 0.2;
      p.position.z += Math.sin(angle) * dist * 0.2;
      p.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (1.5 + Math.random() * 3),
        4 + Math.random() * 6,
        Math.sin(angle) * (1.5 + Math.random() * 3)
      );
      p.userData.baseOpacity = 0.9;
      p.userData.gravity = 14;
      p.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35
      );
      p.userData.delay = Math.random() * 0.35;
      game.scene.add(p);
      particles.push(p);
    }

    // 震中尘土柱
    for (let d = 0; d < 3; d++) {
      const dust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1 + d * 0.15, 0.3 + d * 0.2, 1.5 + d * 0.5, 8),
        new THREE.MeshBasicMaterial({ color: 0xc4a484, transparent: true, opacity: 0.0 })
      );
      dust.position.copy(stompPos);
      dust.position.y = (1.5 + d * 0.5) / 2;
      dust.userData.baseOpacity = 0.4 - d * 0.1;
      dust.userData.delay = d * 0.1;
      game.scene.add(dust);
      particles.push(dust);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === burstCore) {
          if (t < 0.15) {
            p.material.opacity = (t / 0.15) * p.userData.baseOpacity;
            p.scale.setScalar(0.3 + t / 0.15 * 1.2);
          } else {
            p.material.opacity = ((1 - t) / 0.85) * p.userData.baseOpacity;
            p.scale.setScalar(1.5 + (t - 0.15) * 3);
          }
          p.rotation.y += 0.05;
          p.rotation.x += 0.03;
        } else if (p.userData.waveIdx !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            // 波浪起伏
            p.position.y = 0.05 + Math.sin(delayT * 9 + p.userData.waveIdx * 0.8) * 0.07;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.75) * p.userData.baseOpacity);
          }
        } else if (p.userData.crackLen !== undefined) {
          // 裂缝从中心向外蔓延
          if (t < 0.35) {
            const growT = t / 0.35;
            p.material.opacity = growT * p.userData.baseOpacity;
            p.scale.x = growT;
            // 从中心向远端延伸
            p.position.x = stompPos.x + Math.cos(p.userData.angle) * p.userData.crackLen / 2 * growT;
            p.position.z = stompPos.z + Math.sin(p.userData.angle) * p.userData.crackLen / 2 * growT;
          } else if (t > 0.8) {
            p.material.opacity = ((1 - t) / 0.2) * p.userData.baseOpacity;
          }
        } else if (p.userData.vel && p.userData.gravity) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            if (p.userData.rotSpeed) {
              p.rotation.x += p.userData.rotSpeed.x;
              p.rotation.y += p.userData.rotSpeed.y;
              p.rotation.z += p.userData.rotSpeed.z;
            }
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.6) * p.userData.baseOpacity);
          }
        } else if (p.userData.delay !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.material.opacity = Math.max(0, (1 - delayT * 0.8) * p.userData.baseOpacity);
            p.scale.y = 1 + delayT * 1.5;
            p.position.y = (p.geometry.parameters.height * p.scale.y) / 2;
          }
        }
      }
    });
    return;
  }

  // ===== 第5魂技：大力神爪 =====
  if (idx === 4) {
    const duration = 0.8;

    // 三只利爪 - 撕裂效果
    const clawGroup = new THREE.Group();
    const clawColors = [0xb0c4de, 0xe6e6fa, 0x87cefa];
    for (let c = 0; c < 3; c++) {
      // 爪尖 - 锥形
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.8, 6),
        new THREE.MeshBasicMaterial({ color: clawColors[c], transparent: true, opacity: 0.95 })
      );
      claw.position.set((c - 1) * 0.35, 1.1, 0.3);
      claw.rotation.x = -Math.PI / 4;
      clawGroup.add(claw);
      // 爪根 - 球形关节
      const clawBase = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xd2691e, transparent: true, opacity: 0.8 })
      );
      clawBase.position.set((c - 1) * 0.35, 1.05, 0);
      clawGroup.add(clawBase);
    }
    // 爪掌
    const pawPalm = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.25, 0.6),
      new THREE.MeshBasicMaterial({ color: 0xa0522d, transparent: true, opacity: 0.75 })
    );
    pawPalm.position.y = 0.95;
    pawPalm.position.z = -0.1;
    clawGroup.add(pawPalm);

    clawGroup.position.copy(startPos);
    clawGroup.position.y += 0.2;
    clawGroup.lookAt(startPos.clone().add(dir));
    clawGroup.scale.setScalar(0.7);
    game.scene.add(clawGroup);
    particles.push(clawGroup);

    // 三道爪痕撕裂效果 - 在目标位置
    const tearPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.6));
    for (let t = 0; t < 3; t++) {
      // 纵向撕裂光痕
      const tear = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.0, 0.02),
        new THREE.MeshBasicMaterial({ color: clawColors[t], transparent: true, opacity: 0.0 })
      );
      tear.position.copy(tearPos);
      tear.position.x += (t - 1) * 0.4;
      tear.position.y += 0.8;
      tear.userData.baseOpacity = 0.85;
      tear.userData.tearIdx = t;
      tear.userData.slashDir = new THREE.Vector3((Math.random() - 0.5) * 0.3, -1, (Math.random() - 0.5) * 0.3);
      game.scene.add(tear);
      particles.push(tear);
    }

    // 岩石飞溅粒子
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(tearPos, 0.06 + Math.random() * 0.12, earthColors[Math.floor(Math.random() * 5)], 0.85);
      const spreadX = (Math.random() - 0.5) * 1.5;
      const spreadZ = (Math.random() - 0.5) * 1.5;
      p.position.x += spreadX;
      p.position.z += spreadZ;
      p.position.y += 0.5 + Math.random() * 1.0;
      p.userData.vel = new THREE.Vector3(
        spreadX * 2 + (Math.random() - 0.5) * 2,
        3 + Math.random() * 4,
        spreadZ * 2 + (Math.random() - 0.5) * 2
      );
      p.userData.baseOpacity = 0.85;
      p.userData.gravity = 10;
      p.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
      game.scene.add(p);
      particles.push(p);
    }

    // 爪风切割波纹
    for (let w = 0; w < 4; w++) {
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.04, 6, 16),
        new THREE.MeshBasicMaterial({ color: clawColors[w % 3], transparent: true, opacity: 0.0 })
      );
      wave.position.copy(startPos).add(dir.clone().multiplyScalar(0.5 + w * range * 0.18));
      wave.position.y += 1.0;
      const up = new THREE.Vector3(0, 1, 0);
      wave.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      wave.userData.baseOpacity = 0.6;
      wave.userData.expandSpeed = 3 + w;
      wave.userData.delay = w * 0.05;
      game.scene.add(wave);
      particles.push(wave);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === clawGroup) {
          // 利爪向前挥击，带撕裂动作
          const swipeT = Math.min(t * 1.5, 1);
          p.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.55 * swipeT));
          p.position.y += 0.3 + Math.sin(swipeT * Math.PI) * 0.3;
          // 爪张开再合拢的撕裂动作
          const clawSpread = 0.7 + Math.sin(swipeT * Math.PI) * 0.5;
          p.scale.setScalar(clawSpread);
          // 旋转模拟挥爪
          p.rotation.z = Math.sin(swipeT * Math.PI) * 0.3;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = lifeRatio * 0.85;
            }
          });
        } else if (p.userData.tearIdx !== undefined) {
          // 撕裂光痕出现并拉长
          if (t > 0.25 && t < 0.85) {
            const tearT = (t - 0.25) / 0.6;
            p.material.opacity = Math.sin(tearT * Math.PI) * p.userData.baseOpacity;
            p.scale.y = 0.3 + tearT * 1.5;
            // 向下撕裂移动
            p.position.y = tearPos.y + 1.5 - tearT * 1.5;
          } else {
            p.material.opacity = 0;
          }
        } else if (p.userData.vel && p.userData.gravity) {
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.y -= p.userData.gravity * 0.02;
          if (p.userData.rotSpeed) {
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
          }
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p.userData.expandSpeed !== undefined && p.userData.delay !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT) * p.userData.baseOpacity);
          }
        }
      }
    });
    return;
  }

  // ===== 第6魂技：金刚怒 =====
  if (idx === 5) {
    const duration = 1.0;

    // 角色位置爆发金光
    // 核心光球 - 从身体内部爆发
    const coreLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    coreLight.position.copy(startPos);
    coreLight.position.y += 0.8;
    coreLight.userData.baseOpacity = 0.9;
    game.scene.add(coreLight);
    particles.push(coreLight);

    // 愤怒火焰 - 多层向上喷发的金色火焰柱
    for (let f = 0; f < 5; f++) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.3 + f * 0.15, 1.5 + f * 0.4, 8),
        new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? goldColor : 0xff8c00, transparent: true, opacity: 0.0 })
      );
      flame.position.copy(startPos);
      flame.position.y = (1.5 + f * 0.4) / 2 + 0.2;
      flame.userData.baseOpacity = 0.5 - f * 0.08;
      flame.userData.flameIdx = f;
      flame.userData.targetHeight = 2 + f * 0.5;
      game.scene.add(flame);
      particles.push(flame);
    }

    // 爆散的金光粒子 - 向四面八方
    for (let i = 0; i < 60; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, goldColor, 0.9);
      p.position.y += 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI - Math.PI / 2;
      const speed = 4 + Math.random() * 5;
      p.userData.vel = new THREE.Vector3(
        Math.cos(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * speed + 2,
        Math.cos(phi) * Math.sin(theta) * speed
      );
      p.userData.baseOpacity = 0.95;
      p.userData.glow = true;
      game.scene.add(p);
      particles.push(p);
    }

    // 冲击环 - 水平扩散
    for (let r = 0; r < 4; r++) {
      const ring = _createRing(startPos, 0.3 + r * 0.2, goldColor, 0.0);
      ring.position.y = 0.8 + r * 0.3;
      ring.userData.baseOpacity = 0.7 - r * 0.1;
      ring.userData.expandSpeed = 5 + r * 1.5;
      ring.userData.delay = r * 0.06;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 闪电状光丝 - 从身体向外放射
    for (let b = 0; b < 8; b++) {
      const boltGroup = new THREE.Group();
      const angle = (b / 8) * Math.PI * 2;
      const boltLen = 1.5 + Math.random() * 1.5;
      for (let seg = 0; seg < 5; seg++) {
        const boltSeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.02, boltLen / 5, 4),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
        );
        boltSeg.position.set(
          Math.cos(angle) * (seg + 0.5) * (boltLen / 5),
          0.8 + (Math.random() - 0.5) * 0.2,
          Math.sin(angle) * (seg + 0.5) * (boltLen / 5)
        );
        boltSeg.rotation.z = Math.PI / 2;
        boltSeg.rotation.y = angle + (Math.random() - 0.5) * 0.3;
        boltGroup.add(boltSeg);
      }
      boltGroup.position.copy(startPos);
      boltGroup.userData.baseOpacity = 0.8;
      boltGroup.userData.boltAngle = angle;
      boltGroup.userData.boltLen = boltLen;
      game.scene.add(boltGroup);
      particles.push(boltGroup);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 爆发强度曲线
      const burstIntensity = Math.sin(Math.min(t * 2, 1) * Math.PI);

      for (const p of particles) {
        if (p === coreLight) {
          // 核心光快速膨胀
          const coreT = Math.min(t * 3, 1);
          p.scale.setScalar(0.2 + coreT * 2.5);
          p.material.opacity = burstIntensity * p.userData.baseOpacity;
        } else if (p.userData.flameIdx !== undefined) {
          // 火焰柱向上喷发
          const flameT = Math.min((t - p.userData.flameIdx * 0.05) * 2, 1);
          if (flameT > 0) {
            const height = p.userData.targetHeight * Math.sin(flameT * Math.PI);
            p.scale.y = height / (1.5 + p.userData.flameIdx * 0.4);
            p.position.y = height / 2 + 0.1;
            p.material.opacity = flameT * (1 - flameT * 0.5) * p.userData.baseOpacity * 2;
            // 火焰扭动
            p.rotation.y += 0.08 + p.userData.flameIdx * 0.02;
          }
        } else if (p.userData.vel && p.userData.glow) {
          // 金光粒子向外爆散
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.multiplyScalar(0.98);
          // 闪烁
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity * (0.7 + Math.sin(t * 20 + p.position.x) * 0.3);
        } else if (p.userData.expandSpeed !== undefined && p.userData.delay !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.9) * p.userData.baseOpacity);
          }
        } else if (p.userData.boltAngle !== undefined) {
          // 闪电光丝闪烁
          if (t > 0.1 && t < 0.6) {
            const flicker = Math.random() * 0.5 + 0.5;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = flicker * p.userData.baseOpacity * (1 - (t - 0.1) / 0.5);
              }
            });
          } else {
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = 0;
              }
            });
          }
        }
      }
    });
    return;
  }

  // ===== 第7魂技：金刚真身 =====
  if (idx === 6) {
    const duration = 1.3;

    // 巨大金刚虚影 - 从地面升起
    const titanGroup = new THREE.Group();

    // 金刚身体 - 躯干
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.2, 1.0),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    torso.position.y = 2.5;
    torso.userData.targetOpacity = 0.5;
    titanGroup.add(torso);

    // 头部
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.9, 0.7),
      new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0 })
    );
    head.position.y = 4.2;
    head.userData.targetOpacity = 0.55;
    titanGroup.add(head);

    // 双眼 - 发光
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 })
      );
      eye.position.set(e === 0 ? -0.2 : 0.2, 4.3, 0.35);
      eye.userData.targetOpacity = 0.95;
      eye.userData.glow = true;
      titanGroup.add(eye);
    }

    // 双臂 - 张开
    for (let a = 0; a < 2; a++) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 2.0, 8),
        new THREE.MeshBasicMaterial({ color: 0xdaa520, transparent: true, opacity: 0.0 })
      );
      arm.position.set(a === 0 ? -1.3 : 1.3, 2.8, 0);
      arm.rotation.z = (a === 0 ? 1 : -1) * 0.3;
      arm.userData.targetOpacity = 0.45;
      titanGroup.add(arm);
      // 拳头
      const fist = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
      );
      fist.position.set(a === 0 ? -2.0 : 2.0, 1.9, 0);
      fist.userData.targetOpacity = 0.6;
      titanGroup.add(fist);
    }

    // 双腿
    for (let l = 0; l < 2; l++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8),
        new THREE.MeshBasicMaterial({ color: 0xb8860b, transparent: true, opacity: 0.0 })
      );
      leg.position.set(l === 0 ? -0.5 : 0.5, 0.9, 0);
      leg.userData.targetOpacity = 0.45;
      titanGroup.add(leg);
    }

    // 胸口钻石
    const chestDiamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.3, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
    );
    chestDiamond.position.y = 2.8;
    chestDiamond.position.z = 0.5;
    chestDiamond.userData.targetOpacity = 0.95;
    chestDiamond.userData.sparkle = true;
    titanGroup.add(chestDiamond);

    // 肩膀装饰钻石
    for (let s = 0; s < 2; s++) {
      const shouldDiamond = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        new THREE.MeshBasicMaterial({ color: diamondColors[s], transparent: true, opacity: 0.0 })
      );
      shouldDiamond.position.set(s === 0 ? -1.0 : 1.0, 3.6, 0.2);
      shouldDiamond.userData.targetOpacity = 0.9;
      shouldDiamond.userData.sparkle = true;
      titanGroup.add(shouldDiamond);
    }

    titanGroup.position.copy(startPos);
    titanGroup.scale.setScalar(0.3);
    titanGroup.position.y -= 2;
    game.scene.add(titanGroup);
    particles.push(titanGroup);

    // 上升光柱
    const lightPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 6, 12),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    lightPillar.position.copy(startPos);
    lightPillar.position.y = 3;
    lightPillar.userData.baseOpacity = 0.3;
    game.scene.add(lightPillar);
    particles.push(lightPillar);

    // 地面金色法阵
    const magicCircle = _createRing(startPos, 0.5, goldColor, 0.0);
    magicCircle.position.y = 0.05;
    magicCircle.userData.baseOpacity = 0.8;
    magicCircle.userData.targetRadius = 3;
    game.scene.add(magicCircle);
    particles.push(magicCircle);

    // 符文粒子环绕上升
    for (let i = 0; i < 30; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.08, goldColor, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 1.5;
      p.position.x += Math.cos(angle) * radius;
      p.position.z += Math.sin(angle) * radius;
      p.position.y = Math.random() * 0.5;
      p.userData.baseOpacity = 0.85;
      p.userData.orbitAngle = angle;
      p.userData.orbitRadius = radius;
      p.userData.riseSpeed = 2 + Math.random() * 2;
      game.scene.add(p);
      particles.push(p);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 虚影显现曲线
      let appearT = 1;
      if (t < 0.2) appearT = t / 0.2;
      else if (t > 0.85) appearT = (1 - t) / 0.15;

      for (const p of particles) {
        if (p === titanGroup) {
          // 从地面升起并放大
          const riseT = Math.min(t * 1.5, 1);
          const riseEase = 1 - Math.pow(1 - riseT, 2);
          p.position.y = startPos.y - 2 + riseEase * 2.5;
          p.scale.setScalar(0.3 + riseEase * 0.9);

          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
              child.material.opacity = appearT * child.userData.targetOpacity;
              if (child.userData.sparkle) {
                child.material.opacity *= 0.6 + Math.sin(t * 10 + child.position.y) * 0.4;
              }
            }
          });
          // 金刚微微发光脉动
          const pulse = 1 + Math.sin(t * 3) * 0.03;
          p.scale.setScalar((0.3 + riseEase * 0.9) * pulse);
        } else if (p === lightPillar) {
          const pillarT = Math.min(t * 2, 1);
          p.material.opacity = appearT * p.userData.baseOpacity * (0.7 + Math.sin(t * 5) * 0.3);
          p.scale.y = 0.5 + pillarT * 0.8;
          p.scale.x = 0.8 + Math.sin(t * 3) * 0.1;
          p.scale.z = 0.8 + Math.sin(t * 3) * 0.1;
        } else if (p.userData.targetRadius !== undefined) {
          const circleT = Math.min(t * 1.5, 1);
          const radius = 0.5 + (p.userData.targetRadius - 0.5) * circleT;
          p.scale.setScalar(radius / 0.5);
          p.rotation.y += 0.03;
          if (p.material) p.material.opacity = appearT * p.userData.baseOpacity;
        } else if (p.userData.orbitAngle !== undefined) {
          // 粒子环绕上升
          p.userData.orbitAngle += 0.04;
          p.position.x = startPos.x + Math.cos(p.userData.orbitAngle) * p.userData.orbitRadius;
          p.position.z = startPos.z + Math.sin(p.userData.orbitAngle) * p.userData.orbitRadius;
          p.position.y += p.userData.riseSpeed * 0.02;
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第8魂技：大力领域 =====
  if (idx === 7) {
    const duration = 1.2;

    // 重力领域 - 半球形压制场
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x8b4513, transparent: true, opacity: 0.0, side: THREE.DoubleSide })
    );
    dome.position.copy(startPos);
    dome.position.y = 0.05;
    dome.userData.baseOpacity = 0.2;
    game.scene.add(dome);
    particles.push(dome);

    // 多层领域环 - 水平旋转
    for (let r = 0; r < 5; r++) {
      const ring = _createRing(startPos, 0.5 + r * (range * 0.15), earthColors[r % 5], 0.0);
      ring.position.y = 0.1 + r * 0.4;
      ring.userData.baseOpacity = 0.55 - r * 0.08;
      ring.userData.rotateSpeed = (r % 2 === 0 ? 1 : -1) * (0.02 + r * 0.008);
      ring.userData.targetY = 0.1 + r * 0.4;
      ring.userData.ringIdx = r;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 重力下压粒子 - 从上方落下
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.06 + Math.random() * 0.1, earthColors[Math.floor(Math.random() * 5)], 0.85);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.7;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y = 3 + Math.random() * 2;
      p.userData.vel = new THREE.Vector3(0, -(3 + Math.random() * 4), 0);
      p.userData.baseOpacity = 0.85;
      p.userData.gravity = 8;
      p.userData.startY = p.position.y;
      p.userData.fallDelay = Math.random() * 0.4;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心重力核心
    const gravityCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.4, 0),
      new THREE.MeshBasicMaterial({ color: 0x4a2511, transparent: true, opacity: 0.0, wireframe: true })
    );
    gravityCore.position.copy(startPos);
    gravityCore.position.y = 1.0;
    gravityCore.userData.baseOpacity = 0.8;
    game.scene.add(gravityCore);
    particles.push(gravityCore);

    // 向内汇聚的引力粒子
    for (let g = 0; g < 25; g++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, 0x654321, 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = range * 0.6 + Math.random() * range * 0.3;
      p.position.x += Math.cos(angle) * dist;
      p.position.z += Math.sin(angle) * dist;
      p.position.y = 0.5 + Math.random() * 2;
      p.userData.targetPos = startPos.clone();
      p.userData.targetPos.y = 1.0;
      p.userData.baseOpacity = 0.9;
      p.userData.pullSpeed = 2 + Math.random() * 2;
      game.scene.add(p);
      particles.push(p);
    }

    // 地面受压裂纹 - 圆形
    for (let c = 0; c < 3; c++) {
      const crackRing = _createRing(startPos, range * 0.3 + c * range * 0.2, 0x3d2314, 0.0);
      crackRing.position.y = 0.03;
      crackRing.userData.baseOpacity = 0.6;
      crackRing.userData.crackRingIdx = c;
      game.scene.add(crackRing);
      particles.push(crackRing);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 领域展开曲线
      let fieldT = 1;
      if (t < 0.2) fieldT = t / 0.2;
      else if (t > 0.8) fieldT = (1 - t) / 0.2;

      for (const p of particles) {
        if (p === dome) {
          // 半球领域展开
          const expandT = Math.min(t * 1.5, 1);
          p.scale.setScalar(0.2 + expandT * 1.2);
          p.material.opacity = fieldT * p.userData.baseOpacity * (0.8 + Math.sin(t * 2) * 0.2);
        } else if (p.userData.ringIdx !== undefined) {
          // 领域环旋转
          p.rotation.y += p.userData.rotateSpeed;
          p.position.y = startPos.y + p.userData.targetY + Math.sin(t * 2 + p.userData.ringIdx) * 0.08;
          if (p.material) p.material.opacity = fieldT * p.userData.baseOpacity;
          // 环展开
          const expandT = Math.min(t * 1.2, 1);
          p.scale.setScalar(0.5 + expandT * 0.8);
        } else if (p.userData.vel && p.userData.fallDelay !== undefined) {
          // 重力粒子下落
          const delayT = Math.max(0, t - p.userData.fallDelay);
          if (delayT > 0) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.8) * p.userData.baseOpacity);
          }
        } else if (p === gravityCore) {
          // 重力核心旋转脉动
          p.rotation.y += 0.04;
          p.rotation.x += 0.02;
          const pulse = 1 + Math.sin(t * 4) * 0.15;
          p.scale.setScalar(pulse);
          p.material.opacity = fieldT * p.userData.baseOpacity;
        } else if (p.userData.pullSpeed !== undefined) {
          // 引力粒子向中心汇聚
          p.position.lerp(p.userData.targetPos, 0.03 * p.userData.pullSpeed);
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p.userData.crackRingIdx !== undefined) {
          // 地面裂纹展开
          const crackT = Math.min(t * 2, 1);
          p.scale.setScalar(0.5 + crackT * 0.8);
          if (p.material) p.material.opacity = fieldT * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第9魂技：金刚破岳 =====
  if (idx === 8) {
    const duration = 1.5;

    // 终极奥义 - 一拳破山岳

    // Phase 1: 蓄力 - 金光汇聚到拳上
    // Phase 2: 出拳 - 巨大金拳破空而出
    // Phase 3: 破岳 - 目标处山岳崩裂，大地震动

    // 蓄力核心 - 胸口
    const chargeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 10, 10),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    chargeCore.position.copy(startPos);
    chargeCore.position.y += 1.0;
    chargeCore.userData.baseOpacity = 0.95;
    game.scene.add(chargeCore);
    particles.push(chargeCore);

    // 汇聚的金光粒子群
    for (let i = 0; i < 80; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.08, goldColor, 0.9);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const dist = 3 + Math.random() * 4;
      p.position.x += Math.sin(phi) * Math.cos(theta) * dist;
      p.position.y += 0.5 + Math.sin(phi) * Math.sin(theta) * dist;
      p.position.z += Math.cos(phi) * dist;
      p.userData.targetPos = new THREE.Vector3(startPos.x, startPos.y + 1.0, startPos.z);
      p.userData.baseOpacity = 0.9;
      p.userData.chargeDelay = Math.random() * 0.4;
      game.scene.add(p);
      particles.push(p);
    }

    // 巨拳 - 终极形态
    const ultimateFist = new THREE.Group();
    // 巨大拳头
    const bigFist = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.1, 1.4),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    bigFist.position.y = 1.5;
    bigFist.userData.targetOpacity = 0.85;
    ultimateFist.add(bigFist);
    // 指节钻石
    for (let k = 0; k < 4; k++) {
      const knuckle = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2, 0),
        new THREE.MeshBasicMaterial({ color: diamondColors[k], transparent: true, opacity: 0.0 })
      );
      knuckle.position.set((k - 1.5) * 0.25, 1.65, 0.65);
      knuckle.userData.targetOpacity = 0.95;
      knuckle.userData.sparkle = true;
      ultimateFist.add(knuckle);
    }
    // 拳锋光芒
    const fistAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.0 })
    );
    fistAura.position.y = 1.5;
    fistAura.position.z = 0.5;
    fistAura.userData.targetOpacity = 0.4;
    ultimateFist.add(fistAura);
    // 前臂
    const bigForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 1.8, 10),
      new THREE.MeshBasicMaterial({ color: 0xdaa520, transparent: true, opacity: 0.0 })
    );
    bigForearm.position.y = 1.5;
    bigForearm.position.z = -1.1;
    bigForearm.rotation.x = Math.PI / 2;
    bigForearm.userData.targetOpacity = 0.7;
    ultimateFist.add(bigForearm);

    ultimateFist.position.copy(startPos);
    ultimateFist.position.y += 0.3;
    ultimateFist.lookAt(startPos.clone().add(dir));
    ultimateFist.scale.setScalar(0.2);
    ultimateFist.visible = false;
    game.scene.add(ultimateFist);
    particles.push(ultimateFist);

    // 目标处 - 山岳崩裂效果
    const impactPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.85));
    impactPos.y = 0;

    // 崩裂的岩石堆 - 向上炸开
    for (let r = 0; r < 40; r++) {
      const rock = _createParticle(impactPos, 0.15 + Math.random() * 0.25, earthColors[Math.floor(Math.random() * 5)], 0.9);
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.4;
      rock.position.x += Math.cos(angle) * dist;
      rock.position.z += Math.sin(angle) * dist;
      rock.userData.vel = new THREE.Vector3(
        Math.cos(angle) * (2 + Math.random() * 4),
        5 + Math.random() * 8,
        Math.sin(angle) * (2 + Math.random() * 4)
      );
      rock.userData.baseOpacity = 0.9;
      rock.userData.gravity = 15;
      rock.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      rock.userData.impactDelay = 0.7;
      game.scene.add(rock);
      particles.push(rock);
    }

    // 巨大冲击波环 - 地面
    for (let w = 0; w < 6; w++) {
      const shockRing = _createRing(impactPos, 0.3 + w * 0.4, earthColors[w % 5], 0.0);
      shockRing.position.y = 0.05;
      shockRing.userData.baseOpacity = 0.7 - w * 0.08;
      shockRing.userData.expandSpeed = 6 + w * 1.2;
      shockRing.userData.delay = 0.7 + w * 0.04;
      shockRing.userData.waveIdx = w;
      game.scene.add(shockRing);
      particles.push(shockRing);
    }

    // 冲天光柱 - 破岳冲击
    const impactPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 1.5, 8, 12),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 })
    );
    impactPillar.position.copy(impactPos);
    impactPillar.position.y = 4;
    impactPillar.userData.baseOpacity = 0.45;
    impactPillar.userData.impactDelay = 0.65;
    game.scene.add(impactPillar);
    particles.push(impactPillar);

    createAnim(duration, (t, lifeRatio) => {
      // 阶段划分
      const phase1End = 0.4;  // 蓄力
      const phase2Start = 0.35; // 出拳
      const phase3Start = 0.65; // 破岳

      for (const p of particles) {
        if (p === chargeCore) {
          if (t < phase1End) {
            // 蓄力核心从小变大
            const chargeT = t / phase1End;
            p.scale.setScalar(0.3 + chargeT * 1.5);
            p.material.opacity = chargeT * p.userData.baseOpacity;
            p.rotation.y += 0.1;
          } else if (t < phase3Start) {
            // 蓄力核心维持并抖动
            p.material.opacity = (1 - (t - phase1End) / (phase3Start - phase1End) * 0.3) * p.userData.baseOpacity;
            p.scale.setScalar(1.8 + Math.sin(t * 30) * 0.1);
          } else {
            p.material.opacity = Math.max(0, (1 - (t - phase3Start) / (1 - phase3Start)) * p.userData.baseOpacity * 0.7);
            p.scale.setScalar(2 + (t - phase3Start) * 2);
          }
        } else if (p.userData.chargeDelay !== undefined) {
          // 金光粒子向核心汇聚
          const chargeStart = p.userData.chargeDelay;
          if (t > chargeStart && t < phase3Start) {
            const convT = Math.min((t - chargeStart) / (phase1End - chargeStart + 0.2), 1);
            p.position.lerp(p.userData.targetPos, 0.05 + convT * 0.1);
            if (p.material) p.material.opacity = (1 - convT * 0.3) * p.userData.baseOpacity;
          } else if (t >= phase3Start) {
            if (p.material) p.material.opacity = Math.max(0, lifeRatio * 0.5 * p.userData.baseOpacity);
          }
        } else if (p === ultimateFist) {
          if (t >= phase2Start) {
            p.visible = true;
            const punchT = Math.min((t - phase2Start) / (1 - phase2Start), 1);
            const punchEase = 1 - Math.pow(1 - punchT, 3);
            // 巨拳向前冲出
            p.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.8 * punchEase));
            p.position.y += 0.3 + Math.sin(punchT * Math.PI) * 0.5;
            // 放大
            const fistScale = 0.2 + punchEase * 1.3 + (punchT > 0.7 ? Math.sin(t * 40) * 0.08 : 0);
            p.scale.setScalar(fistScale);
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
                const fadeIn = Math.min(punchT * 3, 1);
                const fadeOut = t > 0.85 ? (1 - t) / 0.15 : 1;
                let op = fadeIn * fadeOut * child.userData.targetOpacity;
                if (child.userData.sparkle) {
                  op *= 0.7 + Math.sin(t * 15) * 0.3;
                }
                child.material.opacity = op;
              }
            });
          }
        } else if (p.userData.impactDelay !== undefined && p.geometry && p.geometry.type === 'CylinderGeometry') {
          // 冲天光柱
          const delayT = Math.max(0, t - p.userData.impactDelay);
          if (delayT > 0) {
            const pillarT = Math.min(delayT * 2, 1);
            p.scale.y = 0.3 + pillarT * 1.2;
            p.scale.x = 0.5 + pillarT * 0.8;
            p.scale.z = 0.5 + pillarT * 0.8;
            p.material.opacity = Math.sin(pillarT * Math.PI) * p.userData.baseOpacity;
          }
        } else if (p.userData.impactDelay !== undefined && p.userData.vel && p.userData.gravity) {
          // 岩石炸开
          const delayT = Math.max(0, t - p.userData.impactDelay);
          if (delayT > 0) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.y -= p.userData.gravity * 0.02;
            if (p.userData.rotSpeed) {
              p.rotation.x += p.userData.rotSpeed.x;
              p.rotation.y += p.userData.rotSpeed.y;
              p.rotation.z += p.userData.rotSpeed.z;
            }
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.6) * p.userData.baseOpacity);
          }
        } else if (p.userData.waveIdx !== undefined) {
          // 冲击波环扩散
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            p.position.y = 0.05 + Math.sin(delayT * 8 + p.userData.waveIdx) * 0.06;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.7) * p.userData.baseOpacity);
          }
        }
      }
    });
    return;
  }
}

// ========== 10. 九尾狐技能特效 ==========
function spawnNineTailedFoxSkillEffect(startPos, dir, color, range, idx) {
  const particles = [];
  const foxColors = [0xff69b4, 0xda70d6, 0x9370db, 0xff1493, 0xffb6c1];
  const purpleColors = [0x9370db, 0x8a2be2, 0x9400d3, 0xba55d3, 0xdda0dd];
  const pinkPurpleColors = [0xff69b4, 0xda70d6, 0x9370db, 0xff1493, 0xc71585];

  function cleanup() {
    for (const p of particles) {
      if (typeof dispose3DObject === 'function') dispose3DObject(p);
      else if (p.parent) p.parent.remove(p);
    }
  }

  function createAnim(duration, updateFn) {
    let life = duration;
    const maxLife = life;
    const animate = () => {
      life -= 0.02;
      if (life > 0) {
        const t = 1 - life / maxLife;
        updateFn(t, life / maxLife);
        requestAnimationFrame(animate);
      } else {
        cleanup();
      }
    };
    animate();
  }

  // ===== 第1魂技：狐爪 =====
  if (idx === 0) {
    const duration = 0.5;

    // 狐狸利爪 - 三道锋利爪痕
    const clawGroup = new THREE.Group();
    for (let c = 0; c < 3; c++) {
      // 爪尖 - 细长锥形
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.6, 4),
        new THREE.MeshBasicMaterial({ color: foxColors[c], transparent: true, opacity: 0.95 })
      );
      claw.position.set((c - 1) * 0.2, 1.0, 0.3);
      claw.rotation.x = -Math.PI / 3;
      clawGroup.add(claw);
      // 爪根毛球
      const furBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.7 })
      );
      furBall.position.set((c - 1) * 0.2, 0.95, 0);
      clawGroup.add(furBall);
    }
    // 掌垫
    const pawPad = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.5 })
    );
    pawPad.position.y = 0.85;
    pawPad.scale.set(1.2, 0.4, 1);
    clawGroup.add(pawPad);

    clawGroup.position.copy(startPos);
    clawGroup.position.y += 0.3;
    clawGroup.lookAt(startPos.clone().add(dir));
    clawGroup.scale.setScalar(0.8);
    game.scene.add(clawGroup);
    particles.push(clawGroup);

    // 爪痕撕裂 - 三道发光弧线
    const slashPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.6));
    for (let s = 0; s < 3; s++) {
      const slash = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.03, 4, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: foxColors[s], transparent: true, opacity: 0.0 })
      );
      slash.position.copy(slashPos);
      slash.position.x += (s - 1) * 0.35;
      slash.position.y += 1.0;
      slash.rotation.z = Math.PI / 2 + (s - 1) * 0.15;
      slash.rotation.y = (s - 1) * 0.2;
      slash.userData.baseOpacity = 0.85;
      slash.userData.slashIdx = s;
      game.scene.add(slash);
      particles.push(slash);
    }

    // 粉色爪风粒子
    for (let i = 0; i < 20; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, pinkPurpleColors[Math.floor(Math.random() * 5)], 0.85);
      p.position.y += 0.9 + (Math.random() - 0.5) * 0.4;
      p.position.x += (Math.random() - 0.5) * 0.6;
      p.userData.vel = new THREE.Vector3(
        dir.x * (6 + Math.random() * 4) + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        dir.z * (6 + Math.random() * 4) + (Math.random() - 0.5) * 2
      );
      p.userData.baseOpacity = 0.85;
      game.scene.add(p);
      particles.push(p);
    }

    // 小爱心粒子
    for (let h = 0; h < 5; h++) {
      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
      );
      heart.position.copy(startPos);
      heart.position.y += 1 + Math.random() * 0.5;
      heart.position.x += (Math.random() - 0.5) * 0.8;
      heart.userData.baseOpacity = 0.9;
      heart.userData.floatSpeed = 1 + Math.random();
      heart.userData.heartDelay = Math.random() * 0.2;
      game.scene.add(heart);
      particles.push(heart);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === clawGroup) {
          // 快速前扑
          const swipeT = Math.min(t * 2, 1);
          p.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.5 * swipeT));
          p.position.y += 0.3 + Math.sin(swipeT * Math.PI) * 0.3;
          // 爪张开
          const spread = 0.8 + Math.sin(swipeT * Math.PI) * 0.4;
          p.scale.setScalar(spread);
          p.rotation.z = Math.sin(swipeT * Math.PI) * 0.2;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = lifeRatio * 0.85;
            }
          });
        } else if (p.userData.slashIdx !== undefined) {
          // 爪痕闪现将现
          if (t > 0.25 && t < 0.8) {
            const slashT = (t - 0.25) / 0.55;
            p.material.opacity = Math.sin(slashT * Math.PI) * p.userData.baseOpacity;
            p.scale.setScalar(0.5 + slashT * 1.2);
          } else {
            p.material.opacity = 0;
          }
        } else if (p.userData.vel) {
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.multiplyScalar(0.96);
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p.userData.floatSpeed !== undefined) {
          const delayT = Math.max(0, t - p.userData.heartDelay);
          if (delayT > 0) {
            p.position.y += p.userData.floatSpeed * 0.02;
            p.scale.setScalar(1 + delayT * 1.5);
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT) * p.userData.baseOpacity);
          }
        }
      }
    });
    return;
  }

  // ===== 第2魂技：魅惑 =====
  if (idx === 1) {
    const duration = 1.0;

    // 粉色魅惑光波 - 多层环形波
    for (let w = 0; w < 5; w++) {
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 + w * 0.2, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[w % 5], transparent: true, opacity: 0.0 })
      );
      wave.position.copy(startPos);
      wave.position.y = 1.0;
      wave.userData.baseOpacity = 0.65 - w * 0.08;
      wave.userData.expandSpeed = 3 + w * 0.5;
      wave.userData.delay = w * 0.06;
      wave.userData.waveIdx = w;
      game.scene.add(wave);
      particles.push(wave);
    }

    // 爱心形状粒子群 - 向外飘散
    for (let h = 0; h < 25; h++) {
      const heart = new THREE.Group();
      // 简易爱心 - 两个球+一个底
      const h1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: foxColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h1.position.x = -0.04;
      h1.position.y = 0.03;
      heart.add(h1);
      const h2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: foxColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h2.position.x = 0.04;
      h2.position.y = 0.03;
      heart.add(h2);
      const h3 = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.1, 4),
        new THREE.MeshBasicMaterial({ color: foxColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h3.position.y = -0.05;
      h3.rotation.z = Math.PI;
      heart.add(h3);

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2;
      heart.position.copy(startPos);
      heart.position.y += 0.8 + Math.random() * 0.5;
      heart.position.x += Math.cos(angle) * 0.3;
      heart.position.z += Math.sin(angle) * 0.3;
      heart.userData.vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        0.5 + Math.random() * 1.5,
        Math.sin(angle) * speed
      );
      heart.userData.baseOpacity = 0.9;
      heart.userData.spinSpeed = (Math.random() - 0.5) * 0.1;
      heart.userData.wobble = Math.random() * Math.PI * 2;
      game.scene.add(heart);
      particles.push(heart);
    }

    // 魅惑眼 - 中心大眼特效
    const eyeGroup = new THREE.Group();
    // 眼白
    const eyeWhite = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
    );
    eyeWhite.scale.set(1, 0.7, 0.3);
    eyeWhite.position.y = 1.2;
    eyeWhite.userData.targetOpacity = 0.6;
    eyeGroup.add(eyeWhite);
    // 瞳孔 - 粉色爱心形（用球代替）
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.0 })
    );
    pupil.position.y = 1.2;
    pupil.position.z = 0.15;
    pupil.scale.set(1, 1, 0.5);
    pupil.userData.targetOpacity = 0.95;
    eyeGroup.add(pupil);
    // 瞳孔高光
    const highlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
    );
    highlight.position.set(0.05, 1.25, 0.25);
    highlight.userData.targetOpacity = 0.9;
    eyeGroup.add(highlight);

    eyeGroup.position.copy(startPos);
    eyeGroup.lookAt(startPos.clone().add(dir));
    game.scene.add(eyeGroup);
    particles.push(eyeGroup);

    // 星星闪烁粒子
    for (let s = 0; s < 15; s++) {
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06, 0),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * range * 0.5;
      star.position.copy(startPos);
      star.position.x += Math.cos(angle) * dist;
      star.position.z += Math.sin(angle) * dist;
      star.position.y = 0.5 + Math.random() * 2;
      star.userData.baseOpacity = 0.9;
      star.userData.twinkleOffset = Math.random() * Math.PI * 2;
      star.userData.starDelay = Math.random() * 0.3;
      game.scene.add(star);
      particles.push(star);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 魅惑曲线
      let charmT = 1;
      if (t < 0.15) charmT = t / 0.15;
      else if (t > 0.85) charmT = (1 - t) / 0.15;

      for (const p of particles) {
        if (p.userData.waveIdx !== undefined) {
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            // 光波上下浮动
            p.position.y = startPos.y + 1.0 + Math.sin(delayT * 6 + p.userData.waveIdx) * 0.1;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.8) * p.userData.baseOpacity);
          }
        } else if (p.userData.vel && p.userData.spinSpeed !== undefined) {
          // 爱心飘散
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.y -= 0.02;
          p.rotation.y += p.userData.spinSpeed;
          p.userData.wobble += 0.05;
          p.position.x += Math.sin(p.userData.wobble) * 0.01;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = lifeRatio * 0.9;
            }
          });
        } else if (p === eyeGroup) {
          // 魅惑眼睁开
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
              child.material.opacity = charmT * child.userData.targetOpacity;
            }
          });
          // 眼睛微微放大收缩
          const pulse = 1 + Math.sin(t * 4) * 0.1;
          p.scale.setScalar(pulse);
        } else if (p.userData.twinkleOffset !== undefined) {
          // 星星闪烁
          const delayT = Math.max(0, t - p.userData.starDelay);
          if (delayT > 0) {
            const twinkle = 0.5 + Math.sin(t * 10 + p.userData.twinkleOffset) * 0.5;
            if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity * twinkle;
            p.rotation.y += 0.05;
            p.rotation.x += 0.03;
          }
        }
      }
    });
    return;
  }

  // ===== 第3魂技：狐影 =====
  if (idx === 2) {
    const duration = 0.7;

    // 多道残影 - 沿方向排列
    const afterimageCount = 5;
    for (let a = 0; a < afterimageCount; a++) {
      const image = new THREE.Group();
      // 狐狸头剪影
      const foxHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: foxColors[a % 5], transparent: true, opacity: 0.0 })
      );
      foxHead.position.y = 1.3;
      foxHead.scale.set(1, 0.9, 0.8);
      image.add(foxHead);
      // 两只耳朵
      for (let e = 0; e < 2; e++) {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.1, 0.25, 4),
          new THREE.MeshBasicMaterial({ color: foxColors[a % 5], transparent: true, opacity: 0.0 })
        );
        ear.position.set(e === 0 ? -0.15 : 0.15, 1.55, 0);
        ear.rotation.z = (e === 0 ? -1 : 1) * 0.2;
        image.add(ear);
      }
      // 身体
      const foxBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: purpleColors[a % 5], transparent: true, opacity: 0.0 })
      );
      foxBody.position.y = 0.8;
      foxBody.scale.set(0.9, 1.2, 0.7);
      image.add(foxBody);

      image.position.copy(startPos);
      image.position.x += dir.x * a * range * 0.15;
      image.position.z += dir.z * a * range * 0.15;
      image.lookAt(startPos.clone().add(dir));
      image.userData.baseOpacity = 0.7 - a * 0.1;
      image.userData.imageIdx = a;
      image.userData.imageDelay = a * 0.04;
      game.scene.add(image);
      particles.push(image);
    }

    // 速度线 - 沿方向的线条
    for (let l = 0; l < 15; l++) {
      const line = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[l % 5], transparent: true, opacity: 0.0 })
      );
      line.position.copy(startPos);
      const spreadY = (Math.random() - 0.5) * 1.5;
      const spreadX = (Math.random() - 0.5) * 1.0;
      line.position.y += 0.8 + spreadY;
      line.position.x += spreadX;
      // 沿方向
      const up = new THREE.Vector3(0, 1, 0);
      line.quaternion.setFromUnitVectors(up, dir.clone().normalize());
      line.rotation.x += Math.PI / 2;
      line.userData.baseOpacity = 0.6;
      line.userData.speed = 10 + Math.random() * 8;
      line.userData.lineDelay = Math.random() * 0.2;
      game.scene.add(line);
      particles.push(line);
    }

    // 飘散的粉色粒子
    for (let i = 0; i < 25; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, foxColors[Math.floor(Math.random() * 5)], 0.85);
      p.position.y += 0.5 + Math.random() * 1.5;
      p.position.x += (Math.random() - 0.5) * 1;
      p.position.z += (Math.random() - 0.5) * 1;
      p.userData.vel = new THREE.Vector3(
        dir.x * (8 + Math.random() * 6),
        (Math.random() - 0.5) * 3,
        dir.z * (8 + Math.random() * 6)
      );
      p.userData.baseOpacity = 0.85;
      game.scene.add(p);
      particles.push(p);
    }

    // 起点爆发闪光
    const flashBurst = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    flashBurst.position.copy(startPos);
    flashBurst.position.y += 1.0;
    flashBurst.userData.baseOpacity = 0.8;
    game.scene.add(flashBurst);
    particles.push(flashBurst);

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p.userData.imageIdx !== undefined) {
          // 残影依次出现然后消散
          const delayT = Math.max(0, t - p.userData.imageDelay);
          if (delayT > 0) {
            const fadeT = Math.min(delayT * 3, 1);
            const opacity = Math.sin(fadeT * Math.PI) * p.userData.baseOpacity;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = opacity;
              }
            });
            // 残影向前移动
            const moveDist = range * 0.15 * p.userData.imageIdx + delayT * range * 0.3;
            p.position.x = startPos.x + dir.x * moveDist;
            p.position.z = startPos.z + dir.z * moveDist;
          }
        } else if (p.userData.speed && p.userData.lineDelay !== undefined) {
          // 速度线快速飞过
          const delayT = Math.max(0, t - p.userData.lineDelay);
          if (delayT > 0) {
            const lineT = Math.min(delayT * 2.5, 1);
            p.position.x = startPos.x + dir.x * range * lineT;
            p.position.z = startPos.z + dir.z * range * lineT;
            if (p.material) p.material.opacity = (1 - lineT) * p.userData.baseOpacity;
          }
        } else if (p.userData.vel && p.userData.baseOpacity !== undefined && p.geometry.type === 'SphereGeometry') {
          // 小粒子尾随
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.multiplyScalar(0.97);
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p === flashBurst) {
          // 起点闪光
          if (t < 0.2) {
            p.scale.setScalar(0.3 + t / 0.2 * 1.5);
            p.material.opacity = (1 - t / 0.2) * p.userData.baseOpacity;
          } else {
            p.material.opacity = 0;
          }
        }
      }
    });
    return;
  }

  // ===== 第4魂技：九尾 =====
  if (idx === 3) {
    const duration = 0.9;

    // 九尾齐出 - 九条尾巴全方位攻击
    const tailsGroup = new THREE.Group();
    const tailColors = [0xff69b4, 0xff1493, 0xda70d6, 0x9370db, 0x9400d3, 0xc71585, 0xffb6c1, 0xba55d3, 0xdda0dd];

    for (let t = 0; t < 9; t++) {
      const tail = new THREE.Group();
      // 尾巴由多节组成
      const tailSegments = 6;
      for (let s = 0; s < tailSegments; s++) {
        const seg = new THREE.Mesh(
          new THREE.SphereGeometry(0.15 - s * 0.015, 6, 6),
          new THREE.MeshBasicMaterial({ color: tailColors[t], transparent: true, opacity: 0.85 })
        );
        seg.position.z = s * 0.25;
        seg.position.y = Math.sin(s * 0.5) * 0.1;
        seg.userData.segIdx = s;
        tail.add(seg);
      }
      // 尾尖 - 更亮
      const tailTip = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
      );
      tailTip.position.z = tailSegments * 0.25 + 0.1;
      tailTip.userData.glow = true;
      tail.add(tailTip);

      const angle = (t / 9) * Math.PI * 2;
      tail.position.copy(startPos);
      tail.position.y += 0.8;
      tail.rotation.y = angle;
      tail.userData.tailIdx = t;
      tail.userData.baseAngle = angle;
      tail.userData.tailLength = tailSegments * 0.25 + 0.2;
      tailsGroup.add(tail);
    }

    game.scene.add(tailsGroup);
    particles.push(tailsGroup);

    // 九尾攻击目标点
    const targetPos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.5));

    // 中心能量爆发
    const centerBurst = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    centerBurst.position.copy(startPos);
    centerBurst.position.y += 0.9;
    centerBurst.userData.baseOpacity = 0.7;
    game.scene.add(centerBurst);
    particles.push(centerBurst);

    // 全方位散射的粉色粒子
    for (let i = 0; i < 45; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.07, pinkPurpleColors[Math.floor(Math.random() * 5)], 0.9);
      p.position.y += 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 3 + Math.random() * 5;
      p.userData.vel = new THREE.Vector3(
        Math.cos(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * speed + 1,
        Math.cos(phi) * Math.sin(theta) * speed
      );
      p.userData.baseOpacity = 0.9;
      game.scene.add(p);
      particles.push(p);
    }

    // 九道攻击光波
    for (let b = 0; b < 9; b++) {
      const angle = (b / 9) * Math.PI * 2;
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.12, range * 0.6, 6),
        new THREE.MeshBasicMaterial({ color: tailColors[b], transparent: true, opacity: 0.0 })
      );
      beam.position.copy(startPos);
      beam.position.y += 0.9;
      // 朝向角度
      const up = new THREE.Vector3(0, 1, 0);
      const beamDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      beam.quaternion.setFromUnitVectors(up, beamDir);
      beam.rotation.x += Math.PI / 2;
      beam.userData.baseOpacity = 0.6;
      beam.userData.beamIdx = b;
      beam.userData.beamAngle = angle;
      game.scene.add(beam);
      particles.push(beam);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p === tailsGroup) {
          // 九尾先收拢再展开攻击
          const attackT = Math.min(t * 1.5, 1);
          p.traverse(child => {
            if (child.userData.tailIdx !== undefined && child.userData.baseAngle !== undefined) {
              // 尾巴向前伸展再甩动
              const extend = 0.3 + attackT * 1.2;
              child.scale.z = extend;
              // 尾巴摆动
              const sway = Math.sin(t * 6 + child.userData.tailIdx) * 0.3;
              child.rotation.y = child.userData.baseAngle + sway;
              child.rotation.x = Math.sin(t * 4 + child.userData.tailIdx * 0.7) * 0.2;
              // 每节位置波动
              child.children.forEach((seg, si) => {
                if (seg.userData.segIdx !== undefined) {
                  seg.position.y = Math.sin(t * 8 + si * 0.6 + child.userData.tailIdx) * 0.08;
                  seg.position.x = Math.sin(t * 6 + si * 0.4 + child.userData.tailIdx * 0.5) * 0.05;
                }
                if (seg.material) seg.material.opacity = lifeRatio * (seg.userData.glow ? 0.95 : 0.85);
              });
            }
          });
        } else if (p === centerBurst) {
          // 中心能量爆发
          if (t < 0.3) {
            p.scale.setScalar(0.2 + t / 0.3 * 1.5);
            p.material.opacity = (t / 0.3) * p.userData.baseOpacity;
          } else {
            p.scale.setScalar(1.7 + (t - 0.3) * 2);
            p.material.opacity = (1 - (t - 0.3) / 0.7) * p.userData.baseOpacity;
          }
        } else if (p.userData.vel) {
          p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
          p.userData.vel.multiplyScalar(0.98);
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p.userData.beamIdx !== undefined) {
          // 九道光波射出
          if (t > 0.2) {
            const beamT = (t - 0.2) / 0.8;
            p.scale.y = beamT * 1.2;
            // 从中心向外延伸
            const beamLen = range * 0.6 * beamT;
            const angle = p.userData.beamAngle;
            p.position.x = startPos.x + Math.cos(angle) * beamLen / 2;
            p.position.z = startPos.z + Math.sin(angle) * beamLen / 2;
            if (p.material) p.material.opacity = Math.sin(beamT * Math.PI) * p.userData.baseOpacity;
          }
        }
      }
    });
    return;
  }

  // ===== 第5魂技：幻术 =====
  if (idx === 4) {
    const duration = 1.0;

    // 多重狐狸虚影 - 围绕目标旋转
    const illusionCount = 6;
    const illusionGroup = new THREE.Group();

    for (let i = 0; i < illusionCount; i++) {
      const illusion = new THREE.Group();
      // 狐狸身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 8),
        new THREE.MeshBasicMaterial({ color: purpleColors[i % 5], transparent: true, opacity: 0.0 })
      );
      body.position.y = 0.8;
      body.scale.set(0.8, 1.2, 1.3);
      body.userData.targetOpacity = 0.5;
      illusion.add(body);
      // 头
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: foxColors[i % 5], transparent: true, opacity: 0.0 })
      );
      head.position.y = 1.35;
      head.position.z = 0.25;
      head.userData.targetOpacity = 0.55;
      illusion.add(head);
      // 耳朵
      for (let e = 0; e < 2; e++) {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.2, 4),
          new THREE.MeshBasicMaterial({ color: foxColors[i % 5], transparent: true, opacity: 0.0 })
        );
        ear.position.set(e === 0 ? -0.12 : 0.12, 1.55, 0.2);
        ear.rotation.z = (e === 0 ? -1 : 1) * 0.3;
        ear.userData.targetOpacity = 0.6;
        illusion.add(ear);
      }
      // 一条尾巴
      const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.12, 0.8, 6),
        new THREE.MeshBasicMaterial({ color: purpleColors[i % 5], transparent: true, opacity: 0.0 })
      );
      tail.position.set(0, 0.9, -0.5);
      tail.rotation.x = -0.5;
      tail.userData.targetOpacity = 0.45;
      illusion.add(tail);

      const angle = (i / illusionCount) * Math.PI * 2;
      const radius = range * 0.4;
      illusion.position.set(
        startPos.x + Math.cos(angle) * radius,
        startPos.y,
        startPos.z + Math.sin(angle) * radius
      );
      illusion.userData.baseAngle = angle;
      illusion.userData.orbitRadius = radius;
      illusion.userData.illusionIdx = i;
      illusionGroup.add(illusion);
    }

    game.scene.add(illusionGroup);
    particles.push(illusionGroup);

    // 幻术领域 - 扭曲的空间环
    for (let r = 0; r < 4; r++) {
      const warpRing = new THREE.Mesh(
        new THREE.TorusGeometry(range * 0.3 + r * 0.4, 0.06, 8, 24),
        new THREE.MeshBasicMaterial({ color: purpleColors[r], transparent: true, opacity: 0.0 })
      );
      warpRing.position.copy(startPos);
      warpRing.position.y = 0.5 + r * 0.5;
      warpRing.rotation.x = Math.PI / 2;
      warpRing.userData.baseOpacity = 0.45 - r * 0.08;
      warpRing.userData.rotateSpeed = (r % 2 === 0 ? 1 : -1) * (0.03 + r * 0.01);
      warpRing.userData.warpIdx = r;
      game.scene.add(warpRing);
      particles.push(warpRing);
    }

    // 幻觉碎片 - 漂浮的菱形碎片
    for (let f = 0; f < 30; f++) {
      const shard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.07 + Math.random() * 0.05, 0),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[f % 5], transparent: true, opacity: 0.0 })
      );
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * range * 0.6;
      shard.position.set(
        startPos.x + Math.cos(angle) * radius,
        startPos.y + 0.3 + Math.random() * 2,
        startPos.z + Math.sin(angle) * radius
      );
      shard.userData.baseOpacity = 0.8;
      shard.userData.floatSpeed = (Math.random() - 0.5) * 0.5;
      shard.userData.rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      shard.userData.shardDelay = Math.random() * 0.3;
      game.scene.add(shard);
      particles.push(shard);
    }

    // 中心迷幻光点
    const hallucinationCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.3, 0),
      new THREE.MeshBasicMaterial({ color: 0x9400d3, transparent: true, opacity: 0.0, wireframe: true })
    );
    hallucinationCore.position.copy(startPos);
    hallucinationCore.position.y += 1.0;
    hallucinationCore.userData.baseOpacity = 0.8;
    game.scene.add(hallucinationCore);
    particles.push(hallucinationCore);

    createAnim(duration, (t, lifeRatio) => {
      // 幻术展开曲线
      let illusionT = 1;
      if (t < 0.2) illusionT = t / 0.2;
      else if (t > 0.85) illusionT = (1 - t) / 0.15;

      for (const p of particles) {
        if (p === illusionGroup) {
          // 幻影围绕中心旋转
          p.children.forEach(illus => {
            const newAngle = illus.userData.baseAngle + t * 2;
            const bobY = Math.sin(t * 3 + illus.userData.illusionIdx) * 0.2;
            illus.position.x = startPos.x + Math.cos(newAngle) * illus.userData.orbitRadius;
            illus.position.z = startPos.z + Math.sin(newAngle) * illus.userData.orbitRadius;
            illus.position.y = startPos.y + bobY;
            // 面向中心
            illus.lookAt(startPos.x, illus.position.y + 0.8, startPos.z);
            // 忽隐忽现
            const flicker = 0.6 + Math.sin(t * 8 + illus.userData.illusionIdx * 0.8) * 0.4;
            illus.traverse(child => {
              if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
                child.material.opacity = illusionT * flicker * child.userData.targetOpacity;
              }
            });
          });
        } else if (p.userData.warpIdx !== undefined) {
          // 扭曲环旋转
          p.rotation.y += p.userData.rotateSpeed;
          // 上下波动
          p.position.y = startPos.y + 0.5 + p.userData.warpIdx * 0.5 + Math.sin(t * 2 + p.userData.warpIdx) * 0.1;
          if (p.material) p.material.opacity = illusionT * p.userData.baseOpacity;
          // 脉动缩放
          const pulse = 1 + Math.sin(t * 3 + p.userData.warpIdx) * 0.1;
          p.scale.setScalar(pulse);
        } else if (p.userData.floatSpeed !== undefined) {
          // 碎片漂浮
          const delayT = Math.max(0, t - p.userData.shardDelay);
          if (delayT > 0) {
            p.position.y += p.userData.floatSpeed * 0.02;
            p.rotation.x += p.userData.rotSpeed.x;
            p.rotation.y += p.userData.rotSpeed.y;
            p.rotation.z += p.userData.rotSpeed.z;
            if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity * (0.7 + Math.sin(t * 5 + p.position.x) * 0.3);
          }
        } else if (p === hallucinationCore) {
          // 核心旋转脉动
          p.rotation.y += 0.06;
          p.rotation.x += 0.03;
          const pulse = 1 + Math.sin(t * 4) * 0.2;
          p.scale.setScalar(pulse);
          p.material.opacity = illusionT * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第6魂技：狐火 =====
  if (idx === 5) {
    const duration = 0.9;

    // 紫粉色妖狐火焰 - 多团火焰
    const fireCount = 7;
    const fireColors = [0x9400d3, 0xff1493, 0x9370db, 0xc71585, 0xda70d6, 0x8a2be2, 0xff69b4];

    for (let f = 0; f < fireCount; f++) {
      const fire = new THREE.Group();
      // 火焰主体 - 多层锥形
      for (let l = 0; l < 4; l++) {
        const flameLayer = new THREE.Mesh(
          new THREE.ConeGeometry(0.25 - l * 0.05, 0.6 - l * 0.1, 8),
          new THREE.MeshBasicMaterial({ color: fireColors[f], transparent: true, opacity: 0.0 })
        );
        flameLayer.position.y = l * 0.15;
        flameLayer.userData.layerIdx = l;
        flameLayer.userData.layerOpacity = 0.7 - l * 0.12;
        fire.add(flameLayer);
      }
      // 火焰核心
      const fireCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
      );
      fireCore.position.y = 0.1;
      fireCore.userData.coreOpacity = 0.9;
      fire.add(fireCore);

      const angle = (f / fireCount) * Math.PI * 2;
      const radius = range * 0.35;
      fire.position.set(
        startPos.x + Math.cos(angle) * radius,
        startPos.y + 0.3,
        startPos.z + Math.sin(angle) * radius
      );
      fire.userData.fireIdx = f;
      fire.userData.baseAngle = angle;
      fire.userData.orbitRadius = radius;
      fire.userData.baseY = 0.3;
      game.scene.add(fire);
      particles.push(fire);
    }

    // 主火球 - 向前发射
    const mainFireball = new THREE.Group();
    const mainCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    mainCore.userData.targetOpacity = 0.9;
    mainFireball.add(mainCore);
    // 外层火焰
    for (let l = 0; l < 3; l++) {
      const outerFlame = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 + l * 0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: purpleColors[l], transparent: true, opacity: 0.0 })
      );
      outerFlame.userData.targetOpacity = 0.5 - l * 0.12;
      outerFlame.userData.flameLayer = l;
      mainFireball.add(outerFlame);
    }
    // 尾焰
    const tailFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.0, 8),
      new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.0 })
    );
    tailFlame.position.z = -0.7;
    tailFlame.rotation.x = Math.PI;
    tailFlame.userData.targetOpacity = 0.6;
    mainFireball.add(tailFlame);

    mainFireball.position.copy(startPos);
    mainFireball.position.y += 1.0;
    mainFireball.lookAt(startPos.clone().add(dir));
    game.scene.add(mainFireball);
    particles.push(mainFireball);

    // 火焰粒子拖尾
    for (let i = 0; i < 40; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.08, fireColors[Math.floor(Math.random() * 7)], 0.9);
      p.position.y += 1.0;
      p.userData.vel = new THREE.Vector3(
        dir.x * (5 + Math.random() * 5),
        (Math.random() - 0.3) * 2,
        dir.z * (5 + Math.random() * 5)
      );
      p.userData.baseOpacity = 0.9;
      p.userData.fireDelay = Math.random() * 0.4;
      game.scene.add(p);
      particles.push(p);
    }

    // 目标处爆炸
    const explodePos = startPos.clone().add(dir.clone().multiplyScalar(range * 0.85));
    const explodeCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.0 })
    );
    explodeCore.position.copy(explodePos);
    explodeCore.position.y += 0.8;
    explodeCore.userData.baseOpacity = 0.85;
    explodeCore.userData.explodeDelay = 0.6;
    game.scene.add(explodeCore);
    particles.push(explodeCore);

    // 爆炸火焰环
    for (let r = 0; r < 4; r++) {
      const explodeRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.3 + r * 0.2, 0.06, 8, 20),
        new THREE.MeshBasicMaterial({ color: fireColors[r % 7], transparent: true, opacity: 0.0 })
      );
      explodeRing.position.copy(explodePos);
      explodeRing.position.y = 0.8;
      explodeRing.userData.baseOpacity = 0.65 - r * 0.1;
      explodeRing.userData.expandSpeed = 4 + r;
      explodeRing.userData.delay = 0.6 + r * 0.04;
      game.scene.add(explodeRing);
      particles.push(explodeRing);
    }

    createAnim(duration, (t, lifeRatio) => {
      for (const p of particles) {
        if (p.userData.fireIdx !== undefined) {
          // 环绕的狐火
          const newAngle = p.userData.baseAngle + t * 2.5;
          const floatY = p.userData.baseY + Math.sin(t * 3 + p.userData.fireIdx) * 0.3;
          p.position.x = startPos.x + Math.cos(newAngle) * p.userData.orbitRadius;
          p.position.z = startPos.z + Math.sin(newAngle) * p.userData.orbitRadius;
          p.position.y = startPos.y + floatY;
          // 火焰跳动
          const flicker = 0.8 + Math.sin(t * 15 + p.userData.fireIdx * 2) * 0.2;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              if (child.userData.layerOpacity !== undefined) {
                child.material.opacity = lifeRatio * child.userData.layerOpacity * flicker;
              }
              if (child.userData.coreOpacity !== undefined) {
                child.material.opacity = lifeRatio * child.userData.coreOpacity * flicker;
              }
            }
            if (child.userData.layerIdx !== undefined) {
              const layerFlick = 1 + Math.sin(t * 12 + child.userData.layerIdx + p.userData.fireIdx) * 0.15;
              child.scale.setScalar(layerFlick);
            }
          });
          p.scale.y = 1 + Math.sin(t * 8 + p.userData.fireIdx) * 0.2;
        } else if (p === mainFireball) {
          // 主火球飞行
          const flyT = Math.min(t * 1.8, 1);
          p.position.copy(startPos).add(dir.clone().multiplyScalar(range * 0.8 * flyT));
          p.position.y += 1.0 + Math.sin(flyT * Math.PI) * 0.3;
          // 火球脉动
          const pulse = 1 + Math.sin(t * 10) * 0.1;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined && child.userData.targetOpacity !== undefined) {
              const fadeIn = Math.min(flyT * 4, 1);
              const fadeOut = flyT > 0.8 ? (1 - flyT) / 0.2 : 1;
              child.material.opacity = fadeIn * fadeOut * child.userData.targetOpacity * pulse;
            }
            if (child.userData.flameLayer !== undefined) {
              child.scale.setScalar(pulse + child.userData.flameLayer * 0.1);
            }
          });
        } else if (p.userData.vel && p.userData.fireDelay !== undefined) {
          // 火焰拖尾粒子
          const delayT = Math.max(0, t - p.userData.fireDelay);
          if (delayT > 0) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.userData.vel.multiplyScalar(0.97);
            p.userData.vel.y += 0.03; // 火焰上升
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.8) * p.userData.baseOpacity);
          }
        } else if (p === explodeCore) {
          // 爆炸核心
          const delayT = Math.max(0, t - p.userData.explodeDelay);
          if (delayT > 0) {
            const expT = Math.min(delayT * 3, 1);
            p.scale.setScalar(0.3 + expT * 2);
            p.material.opacity = (1 - expT) * p.userData.baseOpacity;
          }
        } else if (p.userData.expandSpeed !== undefined && p.userData.delay !== undefined && p.geometry.type === 'TorusGeometry') {
          // 爆炸环
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 1.2) * p.userData.baseOpacity);
          }
        }
      }
    });
    return;
  }

  // ===== 第7魂技：九尾真身 =====
  if (idx === 6) {
    const duration = 1.2;

    // 天狐形态 - 巨大九尾狐虚影
    const trueFormGroup = new THREE.Group();

    // 狐狸身体
    const foxBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    foxBody.position.y = 1.5;
    foxBody.scale.set(1, 1.3, 1.5);
    foxBody.userData.targetOpacity = 0.5;
    trueFormGroup.add(foxBody);

    // 狐狸头
    const foxHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.0 })
    );
    foxHead.position.y = 2.8;
    foxHead.position.z = 0.6;
    foxHead.scale.set(1, 0.9, 1.1);
    foxHead.userData.targetOpacity = 0.55;
    trueFormGroup.add(foxHead);

    // 耳朵
    for (let e = 0; e < 2; e++) {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.4, 4),
        new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
      );
      ear.position.set(e === 0 ? -0.25 : 0.25, 3.2, 0.5);
      ear.rotation.z = (e === 0 ? -1 : 1) * 0.25;
      ear.userData.targetOpacity = 0.6;
      trueFormGroup.add(ear);
    }

    // 眼睛 - 金色竖瞳
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0 })
      );
      eye.position.set(e === 0 ? -0.15 : 0.15, 2.85, 1.05);
      eye.scale.set(0.5, 1, 0.3);
      eye.userData.targetOpacity = 0.95;
      eye.userData.glow = true;
      trueFormGroup.add(eye);
    }

    // 九条尾巴
    const tailColors = [0xff69b4, 0xff1493, 0xda70d6, 0x9370db, 0x9400d3, 0xc71585, 0xffb6c1, 0xba55d3, 0xdda0dd];
    for (let t = 0; t < 9; t++) {
      const tailGroup = new THREE.Group();
      // 尾巴由多节球体组成
      const segments = 8;
      for (let s = 0; s < segments; s++) {
        const seg = new THREE.Mesh(
          new THREE.SphereGeometry(0.2 - s * 0.015, 6, 6),
          new THREE.MeshBasicMaterial({ color: tailColors[t], transparent: true, opacity: 0.0 })
        );
        seg.position.z = -s * 0.3;
        seg.userData.segIdx = s;
        seg.userData.segOpacity = 0.6 - s * 0.04;
        tailGroup.add(seg);
      }
      // 尾尖
      const tip = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.15, 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
      );
      tip.position.z = -segments * 0.3 - 0.15;
      tip.userData.segOpacity = 0.9;
      tip.userData.glow = true;
      tailGroup.add(tip);

      const angle = (t - 4) * 0.2;
      tailGroup.position.set(0, 1.8, -0.5);
      tailGroup.rotation.y = angle;
      tailGroup.userData.tailIdx = t;
      tailGroup.userData.baseAngle = angle;
      trueFormGroup.add(tailGroup);
    }

    // 四肢
    for (let l = 0; l < 4; l++) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.18, 1.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xda70d6, transparent: true, opacity: 0.0 })
      );
      const lx = l < 2 ? -0.4 : 0.4;
      const lz = l % 2 === 0 ? 0.4 : -0.4;
      leg.position.set(lx, 0.6, lz);
      leg.userData.targetOpacity = 0.45;
      trueFormGroup.add(leg);
    }

    trueFormGroup.position.copy(startPos);
    trueFormGroup.position.y -= 1;
    trueFormGroup.scale.setScalar(0.4);
    trueFormGroup.lookAt(startPos.clone().add(dir));
    game.scene.add(trueFormGroup);
    particles.push(trueFormGroup);

    // 真身光柱
    const formPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.5, 5, 12),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    formPillar.position.copy(startPos);
    formPillar.position.y = 2.5;
    formPillar.userData.baseOpacity = 0.25;
    game.scene.add(formPillar);
    particles.push(formPillar);

    // 地面粉色法阵
    const magicCircle = _createRing(startPos, 0.5, 0xff69b4, 0.0);
    magicCircle.position.y = 0.05;
    magicCircle.userData.baseOpacity = 0.75;
    magicCircle.userData.targetRadius = 2.5;
    game.scene.add(magicCircle);
    particles.push(magicCircle);

    // 花瓣/心形粒子上升
    for (let i = 0; i < 35; i++) {
      const p = _createParticle(startPos, 0.05 + Math.random() * 0.07, pinkPurpleColors[Math.floor(Math.random() * 5)], 0.9);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2;
      p.position.x += Math.cos(angle) * radius;
      p.position.z += Math.sin(angle) * radius;
      p.position.y = Math.random() * 0.5;
      p.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        1.5 + Math.random() * 2,
        (Math.random() - 0.5) * 0.5
      );
      p.userData.baseOpacity = 0.85;
      p.userData.spin = Math.random() * 0.1;
      p.userData.petalDelay = Math.random() * 0.5;
      game.scene.add(p);
      particles.push(p);
    }

    // 九尾释放的能量球
    for (let e = 0; e < 9; e++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshBasicMaterial({ color: tailColors[e], transparent: true, opacity: 0.0 })
      );
      const angle = (e / 9) * Math.PI * 2;
      orb.position.copy(startPos);
      orb.position.x += Math.cos(angle) * 0.5;
      orb.position.z += Math.sin(angle) * 0.5;
      orb.position.y = 1.8;
      orb.userData.baseOpacity = 0.85;
      orb.userData.orbIdx = e;
      orb.userData.orbAngle = angle;
      game.scene.add(orb);
      particles.push(orb);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 真身显现曲线
      let formT = 1;
      if (t < 0.25) formT = t / 0.25;
      else if (t > 0.8) formT = (1 - t) / 0.2;

      for (const p of particles) {
        if (p === trueFormGroup) {
          // 从地面升起并放大
          const riseT = Math.min(t * 1.3, 1);
          const riseEase = 1 - Math.pow(1 - riseT, 2);
          p.position.y = startPos.y - 1 + riseEase * 1.5;
          p.scale.setScalar(0.4 + riseEase * 0.8);

          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              let opacity = 0;
              if (child.userData.targetOpacity !== undefined) {
                opacity = formT * child.userData.targetOpacity;
              } else if (child.userData.segOpacity !== undefined) {
                opacity = formT * child.userData.segOpacity;
              }
              if (child.userData.glow) {
                opacity *= 0.7 + Math.sin(t * 8 + child.position.y) * 0.3;
              }
              child.material.opacity = opacity;
            }
          });

          // 尾巴摆动
          p.children.forEach(child => {
            if (child.userData.tailIdx !== undefined) {
              const sway = Math.sin(t * 3 + child.userData.tailIdx * 0.6) * 0.4;
              child.rotation.y = child.userData.baseAngle + sway;
              child.rotation.x = Math.sin(t * 2 + child.userData.tailIdx * 0.4) * 0.15;
              // 每节波动
              child.children.forEach((seg, si) => {
                if (seg.userData.segIdx !== undefined) {
                  seg.position.y = Math.sin(t * 5 + si * 0.5 + child.userData.tailIdx) * 0.1;
                  seg.position.x = Math.sin(t * 4 + si * 0.3 + child.userData.tailIdx * 0.5) * 0.06;
                }
              });
            }
          });

          // 整体呼吸脉动
          const breathe = 1 + Math.sin(t * 2) * 0.04;
          p.scale.setScalar((0.4 + riseEase * 0.8) * breathe);
        } else if (p === formPillar) {
          const pillarT = Math.min(t * 1.5, 1);
          p.material.opacity = formT * p.userData.baseOpacity * (0.8 + Math.sin(t * 3) * 0.2);
          p.scale.y = 0.5 + pillarT * 0.7;
          p.scale.x = 0.8 + Math.sin(t * 2) * 0.1;
          p.scale.z = 0.8 + Math.sin(t * 2) * 0.1;
        } else if (p.userData.targetRadius !== undefined) {
          const circleT = Math.min(t * 1.2, 1);
          const radius = 0.5 + (p.userData.targetRadius - 0.5) * circleT;
          p.scale.setScalar(radius / 0.5);
          p.rotation.y += 0.04;
          if (p.material) p.material.opacity = formT * p.userData.baseOpacity;
        } else if (p.userData.vel && p.userData.petalDelay !== undefined) {
          const delayT = Math.max(0, t - p.userData.petalDelay);
          if (delayT > 0) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.y += p.userData.spin;
            p.position.x += Math.sin(t * 3 + p.position.z) * 0.01;
            if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
          }
        } else if (p.userData.orbIdx !== undefined) {
          // 能量球环绕并飞出
          if (t > 0.3) {
            const orbT = (t - 0.3) / 0.7;
            const angle = p.userData.orbAngle + t * 3;
            const radius = 0.5 + orbT * range * 0.5;
            p.position.x = startPos.x + Math.cos(angle) * radius;
            p.position.z = startPos.z + Math.sin(angle) * radius;
            p.position.y = 1.8 + Math.sin(t * 4 + p.userData.orbIdx) * 0.3;
            p.material.opacity = Math.sin(orbT * Math.PI) * p.userData.baseOpacity;
            p.scale.setScalar(1 + orbT * 0.5);
          }
        }
      }
    });
    return;
  }

  // ===== 第8魂技：九尾领域 =====
  if (idx === 7) {
    const duration = 1.2;

    // 幻境领域 - 球形迷失空间
    const domainSphere = new THREE.Mesh(
      new THREE.SphereGeometry(range * 0.8, 20, 16),
      new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.0, side: THREE.DoubleSide, wireframe: false })
    );
    domainSphere.position.copy(startPos);
    domainSphere.position.y = 1.0;
    domainSphere.userData.baseOpacity = 0.15;
    game.scene.add(domainSphere);
    particles.push(domainSphere);

    // 领域线框 - 六边形网格感
    const wireSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(range * 0.75, 1),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0, wireframe: true })
    );
    wireSphere.position.copy(startPos);
    wireSphere.position.y = 1.0;
    wireSphere.userData.baseOpacity = 0.4;
    game.scene.add(wireSphere);
    particles.push(wireSphere);

    // 多层旋转环
    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(range * 0.25 + r * range * 0.12, 0.05, 8, 24),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[r % 5], transparent: true, opacity: 0.0 })
      );
      ring.position.copy(startPos);
      ring.position.y = 1.0;
      ring.rotation.x = Math.PI / 2 + r * 0.3;
      ring.rotation.z = r * 0.4;
      ring.userData.baseOpacity = 0.5 - r * 0.07;
      ring.userData.rotSpeedX = (r % 2 === 0 ? 1 : -1) * 0.015;
      ring.userData.rotSpeedY = (r % 3 === 0 ? 1 : -1) * 0.02;
      ring.userData.ringIdx = r;
      game.scene.add(ring);
      particles.push(ring);
    }

    // 迷惑眼球 - 多只眼睛漂浮在领域内
    for (let e = 0; e < 8; e++) {
      const eye = new THREE.Group();
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
      );
      eyeWhite.scale.set(1, 0.7, 0.4);
      eye.add(eyeWhite);
      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.0 })
      );
      pupil.position.z = 0.08;
      pupil.scale.set(1, 1, 0.5);
      eye.add(pupil);

      const theta = (e / 8) * Math.PI * 2;
      const phi = (e % 3) * 0.6 + 0.3;
      const radius = range * 0.5;
      eye.position.set(
        startPos.x + Math.sin(phi) * Math.cos(theta) * radius,
        startPos.y + 1 + Math.cos(phi) * radius * 0.7,
        startPos.z + Math.sin(phi) * Math.sin(theta) * radius
      );
      eye.lookAt(startPos.x, startPos.y + 1, startPos.z);
      eye.userData.baseOpacity = 0.75;
      eye.userData.eyeIdx = e;
      eye.userData.orbitSpeed = 0.3 + e * 0.05;
      eye.userData.baseTheta = theta;
      eye.userData.basePhi = phi;
      game.scene.add(eye);
      particles.push(eye);
    }

    // 迷失方向的螺旋粒子
    for (let i = 0; i < 50; i++) {
      const p = _createParticle(startPos, 0.04 + Math.random() * 0.06, purpleColors[Math.floor(Math.random() * 5)], 0.85);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * range * 0.6;
      p.position.x += Math.cos(angle) * radius;
      p.position.z += Math.sin(angle) * radius;
      p.position.y = 0.3 + Math.random() * 2;
      p.userData.baseOpacity = 0.85;
      p.userData.spiralAngle = angle;
      p.userData.spiralRadius = radius;
      p.userData.spiralY = p.position.y - startPos.y;
      p.userData.spiralSpeed = 1 + Math.random() * 1.5;
      game.scene.add(p);
      particles.push(p);
    }

    // 中心迷惑核心
    const confuseCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshBasicMaterial({ color: 0x9400d3, transparent: true, opacity: 0.0 })
    );
    confuseCore.position.copy(startPos);
    confuseCore.position.y += 1.0;
    confuseCore.userData.baseOpacity = 0.85;
    game.scene.add(confuseCore);
    particles.push(confuseCore);

    createAnim(duration, (t, lifeRatio) => {
      // 领域展开曲线
      let domainT = 1;
      if (t < 0.2) domainT = t / 0.2;
      else if (t > 0.85) domainT = (1 - t) / 0.15;

      for (const p of particles) {
        if (p === domainSphere) {
          const expandT = Math.min(t * 1.3, 1);
          p.scale.setScalar(0.3 + expandT * 1.1);
          p.material.opacity = domainT * p.userData.baseOpacity * (0.8 + Math.sin(t * 2) * 0.2);
        } else if (p === wireSphere) {
          const expandT = Math.min(t * 1.2, 1);
          p.scale.setScalar(0.3 + expandT * 1.1);
          p.rotation.y += 0.01;
          p.rotation.x += 0.005;
          p.material.opacity = domainT * p.userData.baseOpacity;
        } else if (p.userData.ringIdx !== undefined) {
          p.rotation.x += p.userData.rotSpeedX;
          p.rotation.y += p.userData.rotSpeedY;
          const expandT = Math.min(t * 1.5, 1);
          p.scale.setScalar(0.4 + expandT * 0.9);
          if (p.material) p.material.opacity = domainT * p.userData.baseOpacity;
        } else if (p.userData.eyeIdx !== undefined) {
          // 眼睛在领域内漂浮
          const newTheta = p.userData.baseTheta + t * p.userData.orbitSpeed;
          const newPhi = p.userData.basePhi + Math.sin(t * 2 + p.userData.eyeIdx) * 0.2;
          const radius = range * 0.45 + Math.sin(t * 1.5 + p.userData.eyeIdx * 0.7) * 0.2;
          p.position.x = startPos.x + Math.sin(newPhi) * Math.cos(newTheta) * radius;
          p.position.z = startPos.z + Math.sin(newPhi) * Math.sin(newTheta) * radius;
          p.position.y = startPos.y + 1 + Math.cos(newPhi) * radius * 0.6;
          p.lookAt(startPos.x, startPos.y + 1, startPos.z);
          const blink = 0.7 + Math.sin(t * 4 + p.userData.eyeIdx * 0.8) * 0.3;
          p.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = domainT * p.userData.baseOpacity * blink;
            }
          });
        } else if (p.userData.spiralAngle !== undefined) {
          // 螺旋运动的粒子
          p.userData.spiralAngle += 0.03 * p.userData.spiralSpeed;
          p.userData.spiralRadius += Math.sin(t * 2 + p.userData.spiralY) * 0.01;
          p.userData.spiralY += Math.sin(t * 3 + p.userData.spiralAngle) * 0.01;
          p.position.x = startPos.x + Math.cos(p.userData.spiralAngle) * p.userData.spiralRadius;
          p.position.z = startPos.z + Math.sin(p.userData.spiralAngle) * p.userData.spiralRadius;
          p.position.y = startPos.y + p.userData.spiralY + 1;
          if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity;
        } else if (p === confuseCore) {
          p.rotation.y += 0.05;
          p.rotation.x += 0.03;
          const pulse = 1 + Math.sin(t * 3) * 0.2;
          p.scale.setScalar(pulse);
          p.material.opacity = domainT * p.userData.baseOpacity;
        }
      }
    });
    return;
  }

  // ===== 第9魂技：九尾天狐 =====
  if (idx === 8) {
    const duration = 1.5;

    // 终极奥义 - 天狐降世，魅惑天地

    // Phase 1: 天地变色 - 粉色紫色光芒笼罩
    // Phase 2: 天狐降临 - 巨大九尾天狐虚影
    // Phase 3: 魅惑天地 - 全屏爱心和魅惑能量爆发

    // 天空变色 - 大半球罩
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(range * 1.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x9370db, transparent: true, opacity: 0.0, side: THREE.BackSide })
    );
    skyDome.position.copy(startPos);
    skyDome.position.y = 0.1;
    skyDome.userData.baseOpacity = 0.2;
    game.scene.add(skyDome);
    particles.push(skyDome);

    // 从天而降的光柱
    const skyPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 2.5, 8, 12),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    skyPillar.position.copy(startPos);
    skyPillar.position.y = 4;
    skyPillar.userData.baseOpacity = 0.35;
    game.scene.add(skyPillar);
    particles.push(skyPillar);

    // 天狐本体 - 超巨大
    const celestialFox = new THREE.Group();
    // 身体
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.0 })
    );
    body.position.y = 3.5;
    body.scale.set(1, 1.4, 1.6);
    body.userData.targetOpacity = 0.45;
    celestialFox.add(body);
    // 头
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.0 })
    );
    head.position.y = 5.2;
    head.position.z = 0.9;
    head.userData.targetOpacity = 0.5;
    celestialFox.add(head);
    // 耳朵
    for (let e = 0; e < 2; e++) {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.6, 4),
        new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.0 })
      );
      ear.position.set(e === 0 ? -0.35 : 0.35, 5.8, 0.7);
      ear.rotation.z = (e === 0 ? -1 : 1) * 0.2;
      ear.userData.targetOpacity = 0.55;
      celestialFox.add(ear);
    }
    // 金色竖瞳
    for (let e = 0; e < 2; e++) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0 })
      );
      eye.position.set(e === 0 ? -0.2 : 0.2, 5.25, 1.5);
      eye.scale.set(0.4, 1, 0.3);
      eye.userData.targetOpacity = 0.95;
      eye.userData.glow = true;
      celestialFox.add(eye);
    }
    // 额头符文 - 第三眼
    const thirdEye = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.15, 0),
      new THREE.MeshBasicMaterial({ color: 0x9400d3, transparent: true, opacity: 0.0 })
    );
    thirdEye.position.y = 5.5;
    thirdEye.position.z = 1.1;
    thirdEye.userData.targetOpacity = 0.9;
    thirdEye.userData.glow = true;
    celestialFox.add(thirdEye);

    // 九条华丽尾巴
    const tailColors = [0xff69b4, 0xff1493, 0xda70d6, 0x9370db, 0x9400d3, 0xc71585, 0xffb6c1, 0xba55d3, 0xdda0dd];
    for (let t = 0; t < 9; t++) {
      const tailGroup = new THREE.Group();
      const segs = 10;
      for (let s = 0; s < segs; s++) {
        const seg = new THREE.Mesh(
          new THREE.SphereGeometry(0.3 - s * 0.02, 6, 6),
          new THREE.MeshBasicMaterial({ color: tailColors[t], transparent: true, opacity: 0.0 })
        );
        seg.position.z = -s * 0.4;
        seg.userData.segIdx = s;
        seg.userData.segOpacity = 0.55 - s * 0.035;
        tailGroup.add(seg);
      }
      // 尾尖发光
      const tip = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.25, 0),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 })
      );
      tip.position.z = -segs * 0.4 - 0.2;
      tip.userData.segOpacity = 0.95;
      tip.userData.glow = true;
      tailGroup.add(tip);

      const angle = (t - 4) * 0.25;
      tailGroup.position.set(0, 4.0, -0.8);
      tailGroup.rotation.y = angle;
      tailGroup.userData.tailIdx = t;
      tailGroup.userData.baseAngle = angle;
      celestialFox.add(tailGroup);
    }

    celestialFox.position.copy(startPos);
    celestialFox.position.y -= 3;
    celestialFox.scale.setScalar(0.3);
    celestialFox.lookAt(startPos.clone().add(dir));
    celestialFox.visible = false;
    game.scene.add(celestialFox);
    particles.push(celestialFox);

    // 大量爱心粒子 - 魅惑天地
    for (let h = 0; h < 60; h++) {
      const heart = new THREE.Group();
      const h1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h1.position.x = -0.05;
      h1.position.y = 0.04;
      heart.add(h1);
      const h2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h2.position.x = 0.05;
      h2.position.y = 0.04;
      heart.add(h2);
      const h3 = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.12, 4),
        new THREE.MeshBasicMaterial({ color: pinkPurpleColors[h % 5], transparent: true, opacity: 0.9 })
      );
      h3.position.y = -0.06;
      h3.rotation.z = Math.PI;
      heart.add(h3);

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.8;
      heart.position.set(
        startPos.x + Math.cos(angle) * dist,
        startPos.y + Math.random() * 3,
        startPos.z + Math.sin(angle) * dist
      );
      heart.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1,
        1 + Math.random() * 2,
        (Math.random() - 0.5) * 1
      );
      heart.userData.baseOpacity = 0.9;
      heart.userData.spin = (Math.random() - 0.5) * 0.08;
      heart.userData.heartDelay = Math.random() * 0.6;
      game.scene.add(heart);
      particles.push(heart);
    }

    // 地面巨大法阵
    const grandCircle = _createRing(startPos, 0.5, 0xff69b4, 0.0);
    grandCircle.position.y = 0.05;
    grandCircle.userData.baseOpacity = 0.8;
    grandCircle.userData.targetRadius = range;
    game.scene.add(grandCircle);
    particles.push(grandCircle);

    // 内层法阵
    const innerCircle = _createRing(startPos, 0.3, 0x9370db, 0.0);
    innerCircle.position.y = 0.06;
    innerCircle.userData.baseOpacity = 0.7;
    innerCircle.userData.targetRadius = range * 0.6;
    game.scene.add(innerCircle);
    particles.push(innerCircle);

    // 爆发的魅惑光波 - 多层
    for (let w = 0; w < 7; w++) {
      const charmWave = new THREE.Mesh(
        new THREE.TorusGeometry(0.4 + w * 0.3, 0.06, 8, 24),
        new THREE.MeshBasicMaterial({ color: tailColors[w % 9], transparent: true, opacity: 0.0 })
      );
      charmWave.position.copy(startPos);
      charmWave.position.y = 1.5;
      charmWave.userData.baseOpacity = 0.55 - w * 0.05;
      charmWave.userData.expandSpeed = 4 + w * 0.6;
      charmWave.userData.delay = 0.5 + w * 0.05;
      charmWave.userData.waveIdx = w;
      game.scene.add(charmWave);
      particles.push(charmWave);
    }

    // 星星点点的魅惑闪光
    for (let s = 0; s < 30; s++) {
      const spark = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.06, 0),
        new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.0 })
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * range * 0.7;
      spark.position.set(
        startPos.x + Math.cos(angle) * dist,
        startPos.y + 0.5 + Math.random() * 3,
        startPos.z + Math.sin(angle) * dist
      );
      spark.userData.baseOpacity = 0.9;
      spark.userData.twinkleOffset = Math.random() * Math.PI * 2;
      spark.userData.sparkDelay = Math.random() * 0.5;
      game.scene.add(spark);
      particles.push(spark);
    }

    createAnim(duration, (t, lifeRatio) => {
      // 阶段
      const phase1End = 0.3;   // 天地变色
      const phase2Start = 0.2; // 天狐降临
      const phase3Start = 0.5; // 魅惑天地

      for (const p of particles) {
        if (p === skyDome) {
          // 天空变色笼罩
          const domeT = Math.min(t / phase1End, 1);
          p.scale.setScalar(0.3 + domeT * 1.1);
          let op = p.userData.baseOpacity;
          if (t > 0.85) op *= (1 - t) / 0.15;
          p.material.opacity = domeT * op * (0.8 + Math.sin(t * 2) * 0.2);
        } else if (p === skyPillar) {
          // 光柱从天而降
          const pillarT = Math.min(t / phase1End * 1.2, 1);
          p.scale.y = 0.3 + pillarT * 1;
          p.material.opacity = pillarT * p.userData.baseOpacity * (0.7 + Math.sin(t * 3) * 0.3);
          if (t > 0.85) p.material.opacity *= (1 - t) / 0.15;
        } else if (p === celestialFox) {
          if (t >= phase2Start) {
            p.visible = true;
            const foxT = Math.min((t - phase2Start) / (1 - phase2Start), 1);
            // 从天而降
            const descT = 1 - Math.pow(1 - Math.min(foxT * 1.5, 1), 2);
            p.position.y = startPos.y - 3 + descT * 3.5;
            p.scale.setScalar(0.3 + descT * 0.9);

            let fadeInOut = 1;
            if (foxT < 0.2) fadeInOut = foxT / 0.2;
            else if (foxT > 0.8) fadeInOut = (1 - foxT) / 0.2;

            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                let opacity = 0;
                if (child.userData.targetOpacity !== undefined) {
                  opacity = fadeInOut * child.userData.targetOpacity;
                } else if (child.userData.segOpacity !== undefined) {
                  opacity = fadeInOut * child.userData.segOpacity;
                }
                if (child.userData.glow) {
                  opacity *= 0.6 + Math.sin(t * 6 + child.position.y * 0.5) * 0.4;
                }
                child.material.opacity = opacity;
              }
            });

            // 尾巴华丽摆动
            p.children.forEach(child => {
              if (child.userData.tailIdx !== undefined) {
                const sway = Math.sin(t * 2.5 + child.userData.tailIdx * 0.5) * 0.5;
                child.rotation.y = child.userData.baseAngle + sway;
                child.rotation.x = Math.sin(t * 1.5 + child.userData.tailIdx * 0.3) * 0.2;
                child.children.forEach((seg, si) => {
                  if (seg.userData.segIdx !== undefined) {
                    seg.position.y = Math.sin(t * 4 + si * 0.4 + child.userData.tailIdx * 0.6) * 0.15;
                    seg.position.x = Math.sin(t * 3 + si * 0.3 + child.userData.tailIdx * 0.4) * 0.08;
                  }
                });
              }
            });

            // 整体威严脉动
            const majesty = 1 + Math.sin(t * 1.5) * 0.03;
            p.scale.setScalar((0.3 + descT * 0.9) * majesty);
          }
        } else if (p.userData.vel && p.userData.heartDelay !== undefined) {
          // 爱心满天飞
          const delayT = Math.max(0, t - p.userData.heartDelay);
          if (delayT > 0 && t < 0.9) {
            p.position.add(p.userData.vel.clone().multiplyScalar(0.02));
            p.rotation.y += p.userData.spin;
            p.position.x += Math.sin(t * 2 + p.position.y) * 0.015;
            p.traverse(child => {
              if (child.material && child.material.opacity !== undefined) {
                child.material.opacity = Math.max(0, (1 - delayT * 0.6) * 0.9);
              }
            });
          }
        } else if (p.userData.targetRadius !== undefined && p.geometry.type === 'TorusGeometry') {
          // 法阵展开
          const circleT = Math.min(t * 1.5, 1);
          const radius = (p === grandCircle ? 0.5 : 0.3) + (p.userData.targetRadius - (p === grandCircle ? 0.5 : 0.3)) * circleT;
          p.scale.setScalar(radius / (p === grandCircle ? 0.5 : 0.3));
          p.rotation.y += p === grandCircle ? 0.02 : -0.03;
          let op = p.userData.baseOpacity;
          if (t > 0.85) op *= (1 - t) / 0.15;
          if (p.material) p.material.opacity = circleT * op;
        } else if (p.userData.waveIdx !== undefined) {
          // 魅惑光波扩散
          const delayT = Math.max(0, t - p.userData.delay);
          if (delayT > 0) {
            p.scale.setScalar(1 + p.userData.expandSpeed * delayT);
            p.position.y = 1.5 + Math.sin(delayT * 5 + p.userData.waveIdx) * 0.15;
            if (p.material) p.material.opacity = Math.max(0, (1 - delayT * 0.7) * p.userData.baseOpacity);
          }
        } else if (p.userData.twinkleOffset !== undefined) {
          // 星星闪烁
          const delayT = Math.max(0, t - p.userData.sparkDelay);
          if (delayT > 0) {
            const twinkle = 0.5 + Math.sin(t * 12 + p.userData.twinkleOffset) * 0.5;
            if (p.material) p.material.opacity = lifeRatio * p.userData.baseOpacity * twinkle;
            p.rotation.y += 0.06;
            p.rotation.x += 0.04;
          }
        }
      }
    });
    return;
  }
}


// ========== 武魂虚影函数 ==========

// 1. 七宝琉璃塔虚影：七层宝塔，半透明金色发光，悬浮旋转
function createSevenTreasuresAvatar(color) {
  const group = new THREE.Group();

  const goldMat = new THREE.MeshBasicMaterial({
    color: color || 0xffd700,
    transparent: true,
    opacity: 0.7
  });

  const brightGoldMat = new THREE.MeshBasicMaterial({
    color: 0xffee88,
    transparent: true,
    opacity: 0.85
  });

  // 七层宝塔
  for (let i = 0; i < 7; i++) {
    const layerSize = 1.2 - i * 0.13;
    const layerY = i * 0.55;

    // 塔身（方形）
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(layerSize, 0.4, layerSize),
      goldMat.clone()
    );
    body.position.y = layerY;
    group.add(body);

    // 塔檐（飞檐翘角）
    const roofGeom = new THREE.ConeGeometry(layerSize * 0.85, 0.2, 4);
    const roof = new THREE.Mesh(roofGeom, brightGoldMat.clone());
    roof.position.y = layerY + 0.3;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    // 每层悬挂的琉璃珠
    for (let j = 0; j < 4; j++) {
      const angle = (j / 4) * Math.PI * 2 + Math.PI / 4;
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        brightGoldMat.clone()
      );
      bead.position.set(
        Math.cos(angle) * layerSize * 0.5,
        layerY + 0.1,
        Math.sin(angle) * layerSize * 0.5
      );
      group.add(bead);
    }
  }

  // 塔顶宝珠
  const topOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 1 })
  );
  topOrb.position.y = 7 * 0.55;
  topOrb.userData.isTopOrb = true;
  group.add(topOrb);

  // 塔尖
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.3, 4),
    brightGoldMat.clone()
  );
  spire.position.y = 7 * 0.55 + 0.3;
  group.add(spire);

  // 底座
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 1.1, 0.2, 8),
    goldMat.clone()
  );
  base.position.y = -0.2;
  group.add(base);

  // 外层光晕
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.15 })
  );
  halo.position.y = 1.8;
  halo.userData.isHalo = true;
  group.add(halo);

  // 旋转动画标记
  group.userData.rotateSpeed = 0.01;
  group.userData.floatAmp = 0.15;
  group.userData.floatSpeed = 1.5;
  group.userData.baseY = 0;

  return group;
}

// 2. 九心海棠虚影：九瓣海棠花，粉绿渐变，花瓣飘动
function createNineHeartBegoniaAvatar(color) {
  const group = new THREE.Group();

  const petalColors = [0xff99cc, 0xffb3d9, 0xffcce6, 0xe6a8ff, 0xff99bb];
  const centerColor = 0x99ff99;
  const leafColor = 0x66cc66;

  // 外层九片大花瓣
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.4, 0.6, 0, 1.3);
    petalShape.quadraticCurveTo(-0.4, 0.6, 0, 0);

    const petalGeom = new THREE.ShapeGeometry(petalShape);
    const petalMat = new THREE.MeshBasicMaterial({
      color: petalColors[i % petalColors.length],
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });

    const petal = new THREE.Mesh(petalGeom, petalMat);
    petal.position.y = 1.5;
    petal.rotation.y = angle;
    petal.rotation.z = -0.3 + Math.sin(i) * 0.1;
    petal.userData.petalIdx = i;
    petal.userData.baseRotZ = petal.rotation.z;
    petal.userData.waveSpeed = 1.2 + i * 0.1;
    group.add(petal);
  }

  // 中层花瓣
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 + Math.PI / 9;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.25, 0.4, 0, 0.9);
    petalShape.quadraticCurveTo(-0.25, 0.4, 0, 0);

    const petalGeom = new THREE.ShapeGeometry(petalShape);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xffccdd,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const petal = new THREE.Mesh(petalGeom, petalMat);
    petal.position.y = 1.6;
    petal.rotation.y = angle;
    petal.rotation.z = -0.2;
    petal.userData.petalIdx = i + 9;
    petal.userData.baseRotZ = petal.rotation.z;
    petal.userData.waveSpeed = 1.5 + i * 0.08;
    group.add(petal);
  }

  // 花心（九心造型 - 9个小球围绕中心）
  const centerGroup = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: centerColor, transparent: true, opacity: 0.9 })
    );
    heart.position.set(Math.cos(angle) * 0.2, 1.7, Math.sin(angle) * 0.2);
    centerGroup.add(heart);
  }
  // 中心主心
  const mainHeart = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x88ff88, transparent: true, opacity: 1 })
  );
  mainHeart.position.y = 1.7;
  centerGroup.add(mainHeart);
  group.add(centerGroup);

  // 花茎
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6),
    new THREE.MeshBasicMaterial({ color: leafColor, transparent: true, opacity: 0.7 })
  );
  stem.position.y = 0.6;
  group.add(stem);

  // 两片叶子
  for (let i = 0; i < 2; i++) {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.5, 0.15, 0.8, -0.05);
    leafShape.quadraticCurveTo(0.4, -0.15, 0, 0);

    const leaf = new THREE.Mesh(
      new THREE.ShapeGeometry(leafShape),
      new THREE.MeshBasicMaterial({ color: leafColor, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    leaf.position.set(i === 0 ? 0.1 : -0.1, 0.7 + i * 0.2, i === 0 ? 0.1 : -0.1);
    leaf.rotation.y = i === 0 ? 0.5 : Math.PI + 0.5;
    leaf.rotation.z = i === 0 ? -0.3 : 0.3;
    group.add(leaf);
  }

  // 底部光晕
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffbbee, transparent: true, opacity: 0.12 })
  );
  glow.position.y = 1.5;
  group.add(glow);

  group.userData.floatAmp = 0.12;
  group.userData.floatSpeed = 1.0;

  return group;
}

// 3. 蓝电霸王龙虚影：巨龙盘绕，蓝紫色雷电，龙角龙眼
function createBlueLightningDragonAvatar(color) {
  const group = new THREE.Group();

  const dragonColor = color || 0x4466ff;
  const lightningColor = 0x88aaff;
  const brightColor = 0xffffff;

  // 龙身（盘绕状 - 用多个圆环段组成）
  const bodySegments = 16;
  const bodyRadius = 1.5;
  const bodyTube = 0.25;

  for (let i = 0; i < bodySegments; i++) {
    const angle = (i / bodySegments) * Math.PI * 2;
    const yOffset = i * 0.2 - 0.5;
    const segRadius = bodyRadius - i * 0.05;

    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(bodyTube * (1 - i * 0.02), 8, 6),
      new THREE.MeshBasicMaterial({ color: dragonColor, transparent: true, opacity: 0.75 })
    );
    seg.position.set(
      Math.cos(angle) * segRadius,
      yOffset + 1.5,
      Math.sin(angle) * segRadius
    );
    seg.userData.segIdx = i;
    seg.userData.baseAngle = angle;
    seg.userData.baseRadius = segRadius;
    seg.userData.baseY = yOffset + 1.5;
    group.add(seg);
  }

  // 龙头（位于顶部）
  const headGroup = new THREE.Group();

  // 头部主体
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 8),
    new THREE.MeshBasicMaterial({ color: dragonColor, transparent: true, opacity: 0.8 })
  );
  head.scale.set(1, 0.85, 1.3);
  headGroup.add(head);

  // 龙角（两只）
  for (let i = 0; i < 2; i++) {
    const hornShape = new THREE.ConeGeometry(0.08, 0.5, 5);
    const horn = new THREE.Mesh(
      hornShape,
      new THREE.MeshBasicMaterial({ color: 0x6688ff, transparent: true, opacity: 0.85 })
    );
    horn.position.set(i === 0 ? 0.2 : -0.2, 0.45, 0.1);
    horn.rotation.x = -0.3;
    horn.rotation.z = i === 0 ? 0.2 : -0.2;
    headGroup.add(horn);
  }

  // 龙眼（发光）
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 6, 6),
      new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.18 : -0.18, 0.05, 0.35);
    eye.userData.isEye = true;
    headGroup.add(eye);

    // 眼周电光
    const eyeGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: lightningColor, transparent: true, opacity: 0.5 })
    );
    eyeGlow.position.copy(eye.position);
    headGroup.add(eyeGlow);
  }

  // 龙嘴
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.08, 0.3),
    new THREE.MeshBasicMaterial({ color: dragonColor, transparent: true, opacity: 0.7 })
  );
  jaw.position.set(0, -0.15, 0.4);
  headGroup.add(jaw);

  headGroup.position.set(-bodyRadius + 0.3, 1.5 + bodySegments * 0.2 - 0.3, 0);
  headGroup.rotation.y = Math.PI / 2;
  group.add(headGroup);

  // 龙尾
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.8, 5),
    new THREE.MeshBasicMaterial({ color: dragonColor, transparent: true, opacity: 0.7 })
  );
  tail.position.set(bodyRadius - 0.5, 1.2, 0.3);
  tail.rotation.z = 0.8;
  tail.rotation.x = 0.5;
  group.add(tail);

  // 环绕的电弧粒子
  for (let i = 0; i < 12; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? lightningColor : brightColor,
        transparent: true,
        opacity: 0.8
      })
    );
    spark.userData.sparkIdx = i;
    spark.userData.orbitRadius = 1.8 + Math.random() * 0.5;
    spark.userData.orbitSpeed = 2 + Math.random() * 2;
    spark.userData.baseY = 1.5 + Math.random() * 2;
    spark.userData.floatAmp = 0.3 + Math.random() * 0.3;
    group.add(spark);
  }

  // 整体电光罩
  const electricHalo = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x6688ff, transparent: true, opacity: 0.1 })
  );
  electricHalo.position.y = 1.8;
  group.add(electricHalo);

  group.userData.lightningTimer = 0;

  return group;
}

// 4. 鬼魅虚影：兜帽鬼影，红眼发光，暗影缭绕
function createGhostAvatar(color) {
  const group = new THREE.Group();

  const shadowColor = 0x220033;
  const hoodColor = 0x1a0026;
  const eyeColor = 0xff2222;
  const mistColor = 0x440055;

  // 兜帽（上大下小的锥形）
  const hood = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 1.5, 8),
    new THREE.MeshBasicMaterial({ color: hoodColor, transparent: true, opacity: 0.75 })
  );
  hood.position.y = 2.5;
  group.add(hood);

  // 兜帽前沿（遮脸部分）
  const hoodFront = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 8, 8),
    new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.9 })
  );
  hoodFront.position.y = 2.0;
  hoodFront.scale.set(1, 0.7, 0.8);
  group.add(hoodFront);

  // 脸部黑暗（完全黑的空洞）
  const faceVoid = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.95 })
  );
  faceVoid.position.set(0, 2.0, 0.2);
  faceVoid.scale.set(1, 0.8, 0.5);
  group.add(faceVoid);

  // 发光红眼
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.15 : -0.15, 2.05, 0.45);
    eye.userData.isEye = true;
    group.add(eye);

    // 眼睛光晕
    const eyeGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0.4 })
    );
    eyeGlow.position.copy(eye.position);
    group.add(eyeGlow);
  }

  // 身体（飘动的长袍 - 多层圆柱）
  for (let i = 0; i < 5; i++) {
    const yPos = i * 0.35;
    const bodyRadius = 0.8 - i * 0.08;
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyRadius, bodyRadius * 0.9, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.65 - i * 0.05 })
    );
    body.position.y = 1.3 - yPos;
    body.userData.robeIdx = i;
    body.userData.baseRadius = bodyRadius;
    group.add(body);
  }

  // 底部烟雾/暗影缭绕
  for (let i = 0; i < 10; i++) {
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(0.25 + Math.random() * 0.2, 6, 6),
      new THREE.MeshBasicMaterial({ color: mistColor, transparent: true, opacity: 0.4 })
    );
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.5 + Math.random() * 0.5;
    mist.position.set(
      Math.cos(angle) * dist,
      0.2 + Math.random() * 0.5,
      Math.sin(angle) * dist
    );
    mist.userData.mistIdx = i;
    mist.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
    mist.userData.baseAngle = angle;
    mist.userData.baseDist = dist;
    mist.userData.baseY = mist.position.y;
    mist.userData.floatAmp = 0.15 + Math.random() * 0.15;
    group.add(mist);
  }

  // 暗影爪（两只伸出的手）
  for (let i = 0; i < 2; i++) {
    const handGroup = new THREE.Group();
    // 手掌
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.2, 0.08),
      new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.7 })
    );
    handGroup.add(palm);
    // 手指
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.15, 4),
        new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.7 })
      );
      finger.position.set(-0.06 + f * 0.04, 0.15, 0);
      handGroup.add(finger);
    }
    handGroup.position.set(i === 0 ? 0.8 : -0.8, 1.5, 0.3);
    handGroup.rotation.z = i === 0 ? 0.3 : -0.3;
    handGroup.userData.handIdx = i;
    handGroup.userData.baseX = handGroup.position.x;
    group.add(handGroup);
  }

  // 周围飘浮的暗影粒子
  for (let i = 0; i < 15; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 4, 4),
      new THREE.MeshBasicMaterial({ color: mistColor, transparent: true, opacity: 0.6 })
    );
    particle.position.set(
      (Math.random() - 0.5) * 2.5,
      Math.random() * 3.5,
      (Math.random() - 0.5) * 2.5
    );
    particle.userData.particleIdx = i;
    particle.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    particle.userData.baseY = particle.position.y;
    group.add(particle);
  }

  group.userData.floatAmp = 0.1;
  group.userData.floatSpeed = 0.8;

  return group;
}

// 5. 月刃虚影：巨型半月刃，银白发光，月光环绕
function createMoonBladeAvatar(color) {
  const group = new THREE.Group();

  const bladeColor = color || 0xddeeff;
  const glowColor = 0xaaccff;
  const moonColor = 0xffffff;

  // 主半月刃（大弯刀形状 - 用圆环的一部分）
  const mainBladeGroup = new THREE.Group();

  // 半月形刀刃（外弧）
  const outerArc = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.15, 8, 32, Math.PI),
    new THREE.MeshBasicMaterial({ color: bladeColor, transparent: true, opacity: 0.85 })
  );
  outerArc.rotation.x = Math.PI / 2;
  mainBladeGroup.add(outerArc);

  // 内弧（刀刃内侧）
  const innerArc = new THREE.Mesh(
    new THREE.TorusGeometry(1.2, 0.08, 8, 32, Math.PI),
    new THREE.MeshBasicMaterial({ color: moonColor, transparent: true, opacity: 0.9 })
  );
  innerArc.rotation.x = Math.PI / 2;
  innerArc.position.y = 0.05;
  mainBladeGroup.add(innerArc);

  // 连接两端的刀背
  const backBridge = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.12, 0.2),
    new THREE.MeshBasicMaterial({ color: bladeColor, transparent: true, opacity: 0.75 })
  );
  backBridge.position.z = -1.35;
  mainBladeGroup.add(backBridge);

  // 刀刃尖端（两个）
  for (let i = 0; i < 2; i++) {
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.3, 4),
      new THREE.MeshBasicMaterial({ color: moonColor, transparent: true, opacity: 0.9 })
    );
    tip.position.set(i === 0 ? 1.4 : -1.4, 0, -1.5);
    tip.rotation.x = Math.PI / 2;
    tip.rotation.z = i === 0 ? -0.3 : 0.3;
    mainBladeGroup.add(tip);
  }

  mainBladeGroup.position.y = 2.0;
  mainBladeGroup.rotation.z = 0.2;
  group.add(mainBladeGroup);

  // 刀柄
  const handleGroup = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 1.2, 6),
    new THREE.MeshBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.7 })
  );
  handle.position.y = 0.4;
  handleGroup.add(handle);

  // 护手
  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.08, 0.2),
    new THREE.MeshBasicMaterial({ color: bladeColor, transparent: true, opacity: 0.8 })
  );
  guard.position.y = 1.0;
  handleGroup.add(guard);

  // 柄头宝珠
  const pommel = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 6, 6),
    new THREE.MeshBasicMaterial({ color: moonColor, transparent: true, opacity: 0.9 })
  );
  pommel.position.y = -0.2;
  handleGroup.add(pommel);

  handleGroup.position.y = 0.5;
  group.add(handleGroup);

  // 环绕的月光粒子
  for (let i = 0; i < 20; i++) {
    const moonParticle = new THREE.Mesh(
      new THREE.SphereGeometry(0.03 + Math.random() * 0.05, 4, 4),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? glowColor : moonColor,
        transparent: true,
        opacity: 0.7
      })
    );
    moonParticle.userData.particleIdx = i;
    moonParticle.userData.orbitRadius = 1.5 + Math.random() * 1;
    moonParticle.userData.orbitSpeed = 0.8 + Math.random() * 0.8;
    moonParticle.userData.baseY = 1.5 + Math.random() * 2;
    moonParticle.userData.floatAmp = 0.2 + Math.random() * 0.2;
    moonParticle.userData.orbitOffset = Math.random() * Math.PI * 2;
    group.add(moonParticle);
  }

  // 月形光晕
  const moonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.12 })
  );
  moonGlow.position.y = 1.8;
  group.add(moonGlow);

  // 旋转标记
  group.userData.rotateSpeed = 0.008;
  group.userData.floatAmp = 0.15;
  group.userData.floatSpeed = 1.2;

  return group;
}

// 6. 火凤凰虚影：凤凰展翅，火焰燃烧，尾羽飘动
function createFirePhoenixAvatar(color) {
  const group = new THREE.Group();

  const fireColor = color || 0xff5500;
  const brightFire = 0xffaa00;
  const coreColor = 0xffff66;

  // 凤凰身体（火焰锥形）
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.6, 8),
    new THREE.MeshBasicMaterial({ color: fireColor, transparent: true, opacity: 0.7 })
  );
  body.rotation.x = Math.PI;
  body.position.y = 2.0;
  group.add(body);

  // 内层身体（更亮）
  const bodyInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 1.3, 8),
    new THREE.MeshBasicMaterial({ color: brightFire, transparent: true, opacity: 0.8 })
  );
  bodyInner.rotation.x = Math.PI;
  bodyInner.position.y = 2.0;
  group.add(bodyInner);

  // 头部
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshBasicMaterial({ color: fireColor, transparent: true, opacity: 0.8 })
  );
  head.position.y = 3.0;
  group.add(head);

  // 凤冠（火焰冠羽）
  for (let i = 0; i < 5; i++) {
    const crest = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.3 + i * 0.05, 4),
      new THREE.MeshBasicMaterial({ color: brightFire, transparent: true, opacity: 0.85 })
    );
    crest.position.set(-0.15 + i * 0.075, 3.25 + i * 0.02, 0);
    crest.userData.crestIdx = i;
    crest.userData.baseY = crest.position.y;
    group.add(crest);
  }

  // 眼睛
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.12 : -0.12, 3.05, 0.25);
    group.add(eye);
  }

  // 喙
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.18, 4),
    new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 })
  );
  beak.position.set(0, 2.95, 0.4);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);

  // 翅膀（左右各一片大的火焰翅）
  for (let side = 0; side < 2; side++) {
    const wingGroup = new THREE.Group();

    // 主翼（火焰形状，多层叠加）
    for (let layer = 0; layer < 3; layer++) {
      const wingShape = new THREE.Shape();
      const w = 1.2 + layer * 0.2;
      const h = 0.8 + layer * 0.15;
      wingShape.moveTo(0, 0);
      wingShape.quadraticCurveTo(w * 0.6, h * 0.3, w, -h * 0.2);
      wingShape.quadraticCurveTo(w * 0.7, -h * 0.1, 0, 0.05);

      const wing = new THREE.Mesh(
        new THREE.ShapeGeometry(wingShape),
        new THREE.MeshBasicMaterial({
          color: layer === 0 ? coreColor : (layer === 1 ? brightFire : fireColor),
          transparent: true,
          opacity: 0.6 - layer * 0.15,
          side: THREE.DoubleSide
        })
      );
      wing.position.y = -layer * 0.05;
      wingGroup.add(wing);
    }

    // 翅尖火焰
    for (let f = 0; f < 4; f++) {
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.3 + f * 0.05, 4),
        new THREE.MeshBasicMaterial({ color: brightFire, transparent: true, opacity: 0.7 })
      );
      flame.position.set(1.0 + f * 0.1, -0.1 + f * 0.05, 0);
      flame.rotation.z = 0.3 + f * 0.1;
      wingGroup.add(flame);
    }

    wingGroup.position.set(0, 2.2, 0);
    wingGroup.rotation.y = side === 0 ? 0 : Math.PI;
    wingGroup.rotation.z = side === 0 ? 0.3 : 0.3;
    wingGroup.userData.wingSide = side;
    wingGroup.userData.baseRotZ = 0.3;
    group.add(wingGroup);
  }

  // 尾羽（多层火焰尾）
  for (let i = 0; i < 7; i++) {
    const tailFeather = new THREE.Mesh(
      new THREE.ConeGeometry(0.1 - i * 0.01, 1.2 + i * 0.15, 4),
      new THREE.MeshBasicMaterial({
        color: i < 3 ? coreColor : (i < 5 ? brightFire : fireColor),
        transparent: true,
        opacity: 0.7 - i * 0.05
      })
    );
    tailFeather.position.set(
      (i - 3) * 0.15,
      1.2,
      -0.6 - i * 0.05
    );
    tailFeather.rotation.x = -0.6 - Math.abs(i - 3) * 0.1;
    tailFeather.userData.tailIdx = i;
    tailFeather.userData.baseRotX = tailFeather.rotation.x;
    group.add(tailFeather);
  }

  // 爪
  for (let i = 0; i < 2; i++) {
    const claw = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.2, 4),
      new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 })
    );
    claw.position.set(i === 0 ? 0.15 : -0.15, 1.1, 0.2);
    claw.rotation.x = Math.PI;
    group.add(claw);
  }

  // 周围火焰粒子
  for (let i = 0; i < 15; i++) {
    const fireParticle = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + Math.random() * 0.08, 4, 4),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? brightFire : fireColor,
        transparent: true,
        opacity: 0.7
      })
    );
    fireParticle.position.set(
      (Math.random() - 0.5) * 3,
      1 + Math.random() * 2.5,
      (Math.random() - 0.5) * 2
    );
    fireParticle.userData.fireIdx = i;
    fireParticle.userData.floatSpeed = 1 + Math.random();
    fireParticle.userData.baseY = fireParticle.position.y;
    group.add(fireParticle);
  }

  // 整体光晕
  const fireGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.1 })
  );
  fireGlow.position.y = 2.0;
  group.add(fireGlow);

  group.userData.floatAmp = 0.15;
  group.userData.floatSpeed = 1.5;

  return group;
}

// 7. 冰凤凰虚影：冰凤展翅，冰晶闪烁，寒气缭绕
function createIcePhoenixAvatar(color) {
  const group = new THREE.Group();

  const iceColor = color || 0x88ddff;
  const brightIce = 0xccf0ff;
  const coreColor = 0xffffff;
  const frostColor = 0xaaddff;

  // 冰凤身体（冰晶棱柱）
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 1.5, 6),
    new THREE.MeshBasicMaterial({ color: iceColor, transparent: true, opacity: 0.7 })
  );
  body.rotation.x = Math.PI;
  body.position.y = 2.0;
  group.add(body);

  // 内层冰核
  const bodyInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1.2, 6),
    new THREE.MeshBasicMaterial({ color: brightIce, transparent: true, opacity: 0.8 })
  );
  bodyInner.rotation.x = Math.PI;
  bodyInner.position.y = 2.0;
  group.add(bodyInner);

  // 冰晶切面（身体上的光面）
  for (let i = 0; i < 6; i++) {
    const facet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 1.0),
      new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    );
    facet.position.y = 1.8;
    facet.rotation.y = (i / 6) * Math.PI * 2;
    facet.position.x = Math.cos((i / 6) * Math.PI * 2) * 0.35;
    facet.position.z = Math.sin((i / 6) * Math.PI * 2) * 0.35;
    group.add(facet);
  }

  // 头部（冰晶状）
  const head = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshBasicMaterial({ color: iceColor, transparent: true, opacity: 0.85 })
  );
  head.position.y = 2.9;
  group.add(head);

  // 冰冠
  for (let i = 0; i < 5; i++) {
    const crest = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.35 + i * 0.06, 4),
      new THREE.MeshBasicMaterial({ color: brightIce, transparent: true, opacity: 0.9 })
    );
    crest.position.set(-0.12 + i * 0.06, 3.2 + i * 0.03, 0);
    group.add(crest);
  }

  // 冰眼（冷蓝色发光）
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x88ffff, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.1 : -0.1, 2.95, 0.22);
    group.add(eye);

    const eyeGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xaaffff, transparent: true, opacity: 0.4 })
    );
    eyeGlow.position.copy(eye.position);
    group.add(eyeGlow);
  }

  // 冰喙
  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.05, 0.2, 4),
    new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.9 })
  );
  beak.position.set(0, 2.85, 0.38);
  beak.rotation.x = Math.PI / 2;
  group.add(beak);

  // 冰翅膀（冰晶羽翼）
  for (let side = 0; side < 2; side++) {
    const wingGroup = new THREE.Group();

    // 主翼（冰晶层）
    for (let layer = 0; layer < 3; layer++) {
      const wingShape = new THREE.Shape();
      const w = 1.1 + layer * 0.15;
      const h = 0.7 + layer * 0.12;
      wingShape.moveTo(0, 0);
      wingShape.lineTo(w, -h * 0.1);
      wingShape.lineTo(w * 0.7, -h * 0.4);
      wingShape.lineTo(w * 0.4, -h * 0.1);
      wingShape.lineTo(0, 0.05);

      const wing = new THREE.Mesh(
        new THREE.ShapeGeometry(wingShape),
        new THREE.MeshBasicMaterial({
          color: layer === 0 ? coreColor : (layer === 1 ? brightIce : iceColor),
          transparent: true,
          opacity: 0.65 - layer * 0.15,
          side: THREE.DoubleSide
        })
      );
      wingGroup.add(wing);
    }

    // 冰晶碎片（翅膀边缘）
    for (let f = 0; f < 5; f++) {
      const shard = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.2 + f * 0.04, 4),
        new THREE.MeshBasicMaterial({ color: brightIce, transparent: true, opacity: 0.8 })
      );
      shard.position.set(0.8 + f * 0.1, -0.05 + f * 0.03, 0);
      shard.rotation.z = 0.2 + f * 0.08;
      wingGroup.add(shard);
    }

    wingGroup.position.set(0, 2.2, 0);
    wingGroup.rotation.y = side === 0 ? 0 : Math.PI;
    wingGroup.rotation.z = side === 0 ? 0.25 : 0.25;
    wingGroup.userData.wingSide = side;
    wingGroup.userData.baseRotZ = 0.25;
    group.add(wingGroup);
  }

  // 冰尾羽
  for (let i = 0; i < 6; i++) {
    const tailFeather = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 1.0 + i * 0.12, 4),
      new THREE.MeshBasicMaterial({
        color: i < 2 ? coreColor : (i < 4 ? brightIce : iceColor),
        transparent: true,
        opacity: 0.7 - i * 0.06
      })
    );
    tailFeather.position.set(
      (i - 2.5) * 0.18,
      1.3,
      -0.5 - i * 0.04
    );
    tailFeather.rotation.x = -0.5 - Math.abs(i - 2.5) * 0.12;
    tailFeather.userData.tailIdx = i;
    tailFeather.userData.baseRotX = tailFeather.rotation.x;
    group.add(tailFeather);
  }

  // 冰晶爪
  for (let i = 0; i < 2; i++) {
    const claw = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.18, 4),
      new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.85 })
    );
    claw.position.set(i === 0 ? 0.12 : -0.12, 1.2, 0.18);
    claw.rotation.x = Math.PI;
    group.add(claw);
  }

  // 寒气/冰晶粒子环绕
  for (let i = 0; i < 18; i++) {
    const iceParticle = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.04 + Math.random() * 0.05, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? brightIce : frostColor,
        transparent: true,
        opacity: 0.7
      })
    );
    iceParticle.position.set(
      (Math.random() - 0.5) * 3,
      1 + Math.random() * 2.5,
      (Math.random() - 0.5) * 2.5
    );
    iceParticle.userData.iceIdx = i;
    iceParticle.userData.floatSpeed = 0.6 + Math.random() * 0.6;
    iceParticle.userData.baseY = iceParticle.position.y;
    iceParticle.userData.spinSpeed = 0.02 + Math.random() * 0.03;
    group.add(iceParticle);
  }

  // 底部寒气光晕
  const frostGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.12 })
  );
  frostGlow.position.y = 1.8;
  group.add(frostGlow);

  group.userData.floatAmp = 0.12;
  group.userData.floatSpeed = 1.0;

  return group;
}

// 8. 碧磷蛇皇虚影：巨蛇盘绕，碧绿毒光，蛇信吞吐
function createGreenPhosphorusSnakeAvatar(color) {
  const group = new THREE.Group();

  const snakeColor = color || 0x00cc44;
  const brightScale = 0x44ff66;
  const poisonColor = 0x88ff00;
  const bellyColor = 0x99ffaa;

  // 蛇身（盘绕 - 螺旋上升的球体段）
  const segments = 24;
  const coilRadius = 1.3;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 3; // 一圈半
    const yOffset = i * 0.18;
    const segRadius = 0.22 - i * 0.004;

    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(segRadius, 8, 6),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? brightScale : snakeColor,
        transparent: true,
        opacity: 0.75
      })
    );
    const r = coilRadius - i * 0.03;
    seg.position.set(
      Math.cos(angle) * r,
      yOffset + 0.3,
      Math.sin(angle) * r
    );
    seg.userData.segIdx = i;
    seg.userData.baseAngle = angle;
    seg.userData.baseRadius = r;
    seg.userData.baseY = yOffset + 0.3;
    group.add(seg);

    // 腹部鳞甲
    if (i % 2 === 0) {
      const belly = new THREE.Mesh(
        new THREE.BoxGeometry(segRadius * 0.6, segRadius * 0.3, segRadius * 0.4),
        new THREE.MeshBasicMaterial({ color: bellyColor, transparent: true, opacity: 0.6 })
      );
      belly.position.copy(seg.position);
      belly.position.y -= segRadius * 0.5;
      group.add(belly);
    }
  }

  // 蛇头（顶部）
  const headGroup = new THREE.Group();

  // 头部主体（三角形）
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshBasicMaterial({ color: snakeColor, transparent: true, opacity: 0.8 })
  );
  head.scale.set(1.1, 0.8, 1.4);
  headGroup.add(head);

  // 头顶鳞冠
  const crownScale = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.06, 0.5),
    new THREE.MeshBasicMaterial({ color: brightScale, transparent: true, opacity: 0.9 })
  );
  crownScale.position.y = 0.2;
  headGroup.add(crownScale);

  // 蛇眼（竖瞳，发光）
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.18 : -0.18, 0.05, 0.25);
    headGroup.add(eye);

    // 竖瞳
    const pupil = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.08, 0.005),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 })
    );
    pupil.position.copy(eye.position);
    pupil.position.z += 0.05;
    headGroup.add(pupil);

    const eyeGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.35 })
    );
    eyeGlow.position.copy(eye.position);
    headGroup.add(eyeGlow);
  }

  // 毒牙
  for (let i = 0; i < 2; i++) {
    const fang = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.15, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    fang.position.set(i === 0 ? 0.1 : -0.1, -0.12, 0.35);
    fang.rotation.x = Math.PI;
    headGroup.add(fang);
  }

  // 蛇信（分叉舌头）
  const tongueGroup = new THREE.Group();
  const tongueBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.025, 0.2, 4),
    new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.9 })
  );
  tongueBase.position.z = 0.1;
  tongueGroup.add(tongueBase);

  // 分叉舌尖
  for (let i = 0; i < 2; i++) {
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.015, 0.12, 3),
      new THREE.MeshBasicMaterial({ color: 0xff4477, transparent: true, opacity: 0.9 })
    );
    tip.position.set(i === 0 ? 0.03 : -0.03, 0.16, 0);
    tip.rotation.z = i === 0 ? 0.3 : -0.3;
    tongueGroup.add(tip);
  }

  tongueGroup.position.set(0, -0.05, 0.45);
  tongueGroup.rotation.x = -0.2;
  tongueGroup.userData.isTongue = true;
  tongueGroup.userData.baseZ = tongueGroup.position.z;
  headGroup.add(tongueGroup);

  // 头部位置（蛇身顶部）
  const finalAngle = (segments - 1) / segments * Math.PI * 3;
  const finalR = coilRadius - (segments - 1) * 0.03;
  headGroup.position.set(
    Math.cos(finalAngle) * finalR,
    (segments - 1) * 0.18 + 0.3,
    Math.sin(finalAngle) * finalR
  );
  headGroup.rotation.y = finalAngle + Math.PI / 2;
  headGroup.userData.isHead = true;
  group.add(headGroup);

  // 蛇尾尖
  const tailTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 4),
    new THREE.MeshBasicMaterial({ color: snakeColor, transparent: true, opacity: 0.7 })
  );
  tailTip.position.set(coilRadius, 0.1, 0);
  tailTip.rotation.z = -0.8;
  group.add(tailTip);

  // 毒雾粒子
  for (let i = 0; i < 12; i++) {
    const poison = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + Math.random() * 0.1, 5, 5),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? poisonColor : 0xaaff44,
        transparent: true,
        opacity: 0.4
      })
    );
    const angle = Math.random() * Math.PI * 2;
    poison.position.set(
      Math.cos(angle) * (1.5 + Math.random() * 0.5),
      0.5 + Math.random() * 3,
      Math.sin(angle) * (1.5 + Math.random() * 0.5)
    );
    poison.userData.poisonIdx = i;
    poison.userData.orbitSpeed = 0.4 + Math.random() * 0.4;
    poison.userData.baseAngle = angle;
    poison.userData.baseY = poison.position.y;
    poison.userData.floatAmp = 0.2 + Math.random() * 0.2;
    group.add(poison);
  }

  // 整体毒光
  const poisonHalo = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x44ff22, transparent: true, opacity: 0.08 })
  );
  poisonHalo.position.y = 2.0;
  group.add(poisonHalo);

  group.userData.floatAmp = 0.08;
  group.userData.floatSpeed = 0.8;

  return group;
}

// 9. 钻石猛犸虚影：猛犸巨象，钻石象牙，金光护体
function createDiamondMammothAvatar(color) {
  const group = new THREE.Group();

  const mammothColor = 0xaa8866;
  const furColor = 0x886644;
  const diamondColor = color || 0x88eedd;
  const goldColor = 0xffdd44;
  const brightDiamond = 0xccffee;

  // 身体（庞大的猛犸身躯）
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 12, 10),
    new THREE.MeshBasicMaterial({ color: mammothColor, transparent: true, opacity: 0.7 })
  );
  body.scale.set(1.3, 0.9, 1.1);
  body.position.y = 1.8;
  group.add(body);

  // 背部毛发纹理（多层弧形）
  for (let i = 0; i < 5; i++) {
    const furRow = new THREE.Mesh(
      new THREE.TorusGeometry(0.8 + i * 0.05, 0.06, 4, 20, Math.PI),
      new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.6 })
    );
    furRow.position.y = 2.2 - i * 0.15;
    furRow.rotation.x = Math.PI / 2;
    furRow.scale.z = 1.1;
    group.add(furRow);
  }

  // 头部
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 10, 8),
    new THREE.MeshBasicMaterial({ color: mammothColor, transparent: true, opacity: 0.75 })
  );
  head.position.set(0, 2.0, 1.1);
  head.scale.set(1, 0.9, 1.1);
  group.add(head);

  // 头顶毛发
  const headFur = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 6),
    new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.65 })
  );
  headFur.position.set(0, 2.4, 1.0);
  headFur.scale.set(1, 0.6, 1);
  group.add(headFur);

  // 眼睛
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x332211, transparent: true, opacity: 0.9 })
    );
    eye.position.set(i === 0 ? 0.25 : -0.25, 2.1, 1.55);
    group.add(eye);
  }

  // 钻石象牙（两只巨大的钻石象牙）
  for (let i = 0; i < 2; i++) {
    const tuskGroup = new THREE.Group();

    // 象牙主体（弯曲 - 用多个球体段）
    for (let s = 0; s < 8; s++) {
      const t = s / 7;
      const segSize = 0.12 - t * 0.05;
      const tuskSeg = new THREE.Mesh(
        new THREE.SphereGeometry(segSize, 6, 6),
        new THREE.MeshBasicMaterial({
          color: s < 3 ? brightDiamond : diamondColor,
          transparent: true,
          opacity: 0.85
        })
      );
      // 弯曲路径
      const curveX = t * 0.8;
      const curveY = -t * 0.6 - t * t * 0.3;
      tuskSeg.position.set(curveX, curveY, 0);
      tuskGroup.add(tuskSeg);

      // 钻石切面光
      if (s % 2 === 0) {
        const facet = new THREE.Mesh(
          new THREE.PlaneGeometry(segSize * 0.8, segSize * 1.2),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        facet.position.copy(tuskSeg.position);
        facet.position.x += 0.01;
        tuskGroup.add(facet);
      }
    }

    // 象牙尖端钻石
    const tipDiamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1, 0),
      new THREE.MeshBasicMaterial({ color: brightDiamond, transparent: true, opacity: 0.95 })
    );
    tipDiamond.position.set(0.8, -0.9, 0);
    tuskGroup.add(tipDiamond);

    tuskGroup.position.set(i === 0 ? 0.35 : -0.35, 1.85, 1.5);
    tuskGroup.rotation.z = i === 0 ? 0.15 : -0.15;
    tuskGroup.userData.tuskSide = i;
    group.add(tuskGroup);
  }

  // 象鼻
  const trunkGroup = new THREE.Group();
  for (let s = 0; s < 6; s++) {
    const t = s / 5;
    const trunkSeg = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 - t * 0.02, 6, 5),
      new THREE.MeshBasicMaterial({ color: mammothColor, transparent: true, opacity: 0.75 })
    );
    trunkSeg.position.set(0, -t * 0.7, t * 0.3);
    trunkGroup.add(trunkSeg);
  }
  trunkGroup.position.set(0, 1.8, 1.4);
  group.add(trunkGroup);

  // 耳朵（大耳朵）
  for (let i = 0; i < 2; i++) {
    const ear = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6),
      new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.65 })
    );
    ear.position.set(i === 0 ? 0.55 : -0.55, 2.0, 1.0);
    ear.scale.set(0.3, 1, 0.8);
    group.add(ear);
  }

  // 四条腿
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 1.2, 6),
      new THREE.MeshBasicMaterial({ color: mammothColor, transparent: true, opacity: 0.7 })
    );
    const legX = (i % 2 === 0 ? 0.5 : -0.5) * 0.9;
    const legZ = (i < 2 ? 0.5 : -0.5) * 0.8;
    leg.position.set(legX, 0.8, legZ);
    group.add(leg);

    // 脚
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.28, 0.15, 6),
      new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.65 })
    );
    foot.position.set(legX, 0.15, legZ);
    group.add(foot);
  }

  // 尾巴
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.6, 4),
    new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.6 })
  );
  tail.position.set(0, 1.8, -1.2);
  tail.rotation.x = 0.5;
  group.add(tail);

  // 尾巴末端毛球
  const tailTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 6, 6),
    new THREE.MeshBasicMaterial({ color: furColor, transparent: true, opacity: 0.7 })
  );
  tailTip.position.set(0, 1.5, -1.5);
  group.add(tailTip);

  // 金光护体（多层光环）
  for (let i = 0; i < 3; i++) {
    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5 - i * 0.2, 0.08, 6, 24),
      new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.4 - i * 0.1 })
    );
    goldRing.position.y = 1.2 + i * 0.5;
    goldRing.rotation.x = Math.PI / 2;
    goldRing.userData.ringIdx = i;
    goldRing.userData.baseY = goldRing.position.y;
    group.add(goldRing);
  }

  // 整体金光
  const goldGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.1 })
  );
  goldGlow.position.y = 1.8;
  group.add(goldGlow);

  // 漂浮的钻石粒子
  for (let i = 0; i < 10; i++) {
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.05 + Math.random() * 0.05, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? brightDiamond : diamondColor,
        transparent: true,
        opacity: 0.7
      })
    );
    diamond.position.set(
      (Math.random() - 0.5) * 3,
      0.5 + Math.random() * 3,
      (Math.random() - 0.5) * 3
    );
    diamond.userData.diamondIdx = i;
    diamond.userData.spinSpeed = 0.02 + Math.random() * 0.02;
    diamond.userData.floatSpeed = 0.5 + Math.random() * 0.5;
    diamond.userData.baseY = diamond.position.y;
    group.add(diamond);
  }

  group.userData.floatAmp = 0.08;
  group.userData.floatSpeed = 0.7;

  return group;
}

// 10. 九尾狐虚影：九尾狐，九尾飘动，紫粉魅惑光
function createNineTailedFoxAvatar(color) {
  const group = new THREE.Group();

  const foxColor = color || 0xcc66ff;
  const brightFur = 0xff99dd;
  const charmColor = 0xff88ff;
  const bellyColor = 0xffccf0;
  const eyeColor = 0xff3366;

  // 身体
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 10, 8),
    new THREE.MeshBasicMaterial({ color: foxColor, transparent: true, opacity: 0.75 })
  );
  body.scale.set(1.2, 0.85, 1.5);
  body.position.y = 1.3;
  group.add(body);

  // 腹部
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 8, 6),
    new THREE.MeshBasicMaterial({ color: bellyColor, transparent: true, opacity: 0.65 })
  );
  belly.scale.set(0.8, 0.6, 1.2);
  belly.position.set(0, 1.1, 0.3);
  group.add(belly);

  // 头部
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 10, 8),
    new THREE.MeshBasicMaterial({ color: foxColor, transparent: true, opacity: 0.8 })
  );
  head.position.set(0, 1.9, 0.8);
  head.scale.set(1, 0.95, 1.1);
  group.add(head);

  // 耳朵（两只狐耳）
  for (let i = 0; i < 2; i++) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.35, 4),
      new THREE.MeshBasicMaterial({ color: foxColor, transparent: true, opacity: 0.8 })
    );
    ear.position.set(i === 0 ? 0.2 : -0.2, 2.3, 0.7);
    ear.rotation.z = i === 0 ? 0.2 : -0.2;
    ear.rotation.x = -0.1;
    group.add(ear);

    // 耳朵内侧（粉色）
    const innerEar = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.2, 4),
      new THREE.MeshBasicMaterial({ color: 0xffaacc, transparent: true, opacity: 0.7 })
    );
    innerEar.position.set(i === 0 ? 0.2 : -0.2, 2.28, 0.75);
    innerEar.rotation.z = i === 0 ? 0.2 : -0.2;
    innerEar.rotation.x = -0.1;
    group.add(innerEar);
  }

  // 狐狸眼（魅惑眼，上挑）
  for (let i = 0; i < 2; i++) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 6, 6),
      new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 1 })
    );
    eye.position.set(i === 0 ? 0.18 : -0.18, 1.95, 1.15);
    group.add(eye);

    // 魅惑光晕
    const eyeGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: charmColor, transparent: true, opacity: 0.4 })
    );
    eyeGlow.position.copy(eye.position);
    group.add(eyeGlow);
  }

  // 鼻子
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0x330011, transparent: true, opacity: 0.9 })
  );
  nose.position.set(0, 1.82, 1.25);
  group.add(nose);

  // 嘴
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.02, 0.02),
    new THREE.MeshBasicMaterial({ color: 0x660022, transparent: true, opacity: 0.8 })
  );
  mouth.position.set(0, 1.75, 1.22);
  group.add(mouth);

  // 胡须
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 3; i++) {
      const whisker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.25, 3),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      );
      whisker.position.set(
        (side === 0 ? 1 : -1) * (0.3 + i * 0.02),
        1.82 + (i - 1) * 0.05,
        1.15
      );
      whisker.rotation.z = (side === 0 ? 1 : -1) * (0.3 + i * 0.1);
      group.add(whisker);
    }
  }

  // 四条腿
  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.6, 5),
      new THREE.MeshBasicMaterial({ color: foxColor, transparent: true, opacity: 0.75 })
    );
    const legX = (i % 2 === 0 ? 0.3 : -0.3) * 0.9;
    const legZ = (i < 2 ? 0.4 : -0.4) * 0.9;
    leg.position.set(legX, 0.6, legZ);
    group.add(leg);

    // 爪
    const paw = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 5, 5),
      new THREE.MeshBasicMaterial({ color: foxColor, transparent: true, opacity: 0.8 })
    );
    paw.position.set(legX, 0.25, legZ);
    paw.scale.y = 0.5;
    group.add(paw);
  }

  // 九条尾巴（飘动的狐尾）
  for (let i = 0; i < 9; i++) {
    const tailGroup = new THREE.Group();

    // 尾巴主体（多段蓬松）
    for (let s = 0; s < 5; s++) {
      const t = s / 4;
      const tailSeg = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + t * 0.08, 6, 5),
        new THREE.MeshBasicMaterial({
          color: s < 2 ? brightFur : foxColor,
          transparent: true,
          opacity: 0.75 - t * 0.1
        })
      );
      tailSeg.position.set(0, t * 0.5, -t * 0.2);
      tailGroup.add(tailSeg);
    }

    // 尾尖（白色）
    const tailTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
    );
    tailTip.position.set(0, 0.55, -0.1);
    tailGroup.add(tailTip);

    // 尾巴位置和角度
    const tailAngle = ((i - 4) / 4) * 1.0;
    const tailSpread = (i - 4) * 0.15;
    tailGroup.position.set(tailSpread, 1.3, -0.6);
    tailGroup.rotation.y = tailAngle;
    tailGroup.rotation.z = -0.3 + Math.abs(i - 4) * 0.05;
    tailGroup.userData.tailIdx = i;
    tailGroup.userData.baseRotZ = tailGroup.rotation.z;
    tailGroup.userData.baseRotY = tailAngle;
    tailGroup.userData.waveSpeed = 1.2 + i * 0.1;
    group.add(tailGroup);
  }

  // 魅惑光粒子
  for (let i = 0; i < 15; i++) {
    const charmParticle = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 5, 5),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? charmColor : 0xffaadd,
        transparent: true,
        opacity: 0.65
      })
    );
    charmParticle.position.set(
      (Math.random() - 0.5) * 3,
      0.5 + Math.random() * 2.5,
      (Math.random() - 0.5) * 2.5
    );
    charmParticle.userData.charmIdx = i;
    charmParticle.userData.orbitSpeed = 0.6 + Math.random() * 0.6;
    charmParticle.userData.baseY = charmParticle.position.y;
    charmParticle.userData.floatAmp = 0.15 + Math.random() * 0.2;
    group.add(charmParticle);
  }

  // 心形魅惑光效
  for (let i = 0; i < 5; i++) {
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xff66aa, transparent: true, opacity: 0.5 })
    );
    heart.position.set(
      (Math.random() - 0.5) * 2,
      1.5 + Math.random() * 1.5,
      (Math.random() - 0.5) * 2
    );
    heart.userData.heartIdx = i;
    heart.userData.floatSpeed = 0.8 + Math.random() * 0.5;
    heart.userData.baseY = heart.position.y;
    group.add(heart);
  }

  // 整体魅惑光晕
  const charmGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff66dd, transparent: true, opacity: 0.1 })
  );
  charmGlow.position.y = 1.5;
  group.add(charmGlow);

  group.userData.floatAmp = 0.1;
  group.userData.floatSpeed = 1.0;

  return group;
}


// ========== 普通攻击特效函数 ==========

// 1. 七宝琉璃塔：金色琉璃碎屑飞射
function spawnSevenTreasuresAttackEffect(pos, dir, color) {
  const particles = [];
  const attackColor = color || 0xffd700;

  // 主琉璃弹
  const mainShard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.25, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.95 })
  );
  mainShard.position.copy(pos);
  mainShard.userData.vel = dir.clone().multiplyScalar(18);
  mainShard.userData.baseOpacity = 0.95;
  mainShard.userData.isMain = true;
  game.scene.add(mainShard);
  particles.push(mainShard);

  // 环绕的琉璃碎屑
  for (let i = 0; i < 12; i++) {
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.06 + Math.random() * 0.06, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? attackColor : 0xffee88,
        transparent: true,
        opacity: 0.85
      })
    );
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.random() * 0.3;
    shard.position.copy(pos);
    shard.position.x += Math.cos(angle) * spread;
    shard.position.z += Math.sin(angle) * spread;
    shard.position.y += (Math.random() - 0.5) * 0.3;

    // 向前散开
    const spreadDir = dir.clone();
    spreadDir.x += (Math.random() - 0.5) * 0.4;
    spreadDir.y += (Math.random() - 0.5) * 0.3;
    spreadDir.z += (Math.random() - 0.5) * 0.4;
    spreadDir.normalize();

    shard.userData.vel = spreadDir.multiplyScalar(14 + Math.random() * 6);
    shard.userData.baseOpacity = 0.85;
    shard.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    shard.userData.spinSpeed = 0.2 + Math.random() * 0.3;
    game.scene.add(shard);
    particles.push(shard);
  }

  // 金色光点
  for (let i = 0; i < 8; i++) {
    const spark = _createParticle(pos, 0.04 + Math.random() * 0.04, 0xffff88, 0.9);
    const spreadDir = dir.clone();
    spreadDir.x += (Math.random() - 0.5) * 0.5;
    spreadDir.y += (Math.random() - 0.5) * 0.4;
    spreadDir.normalize();
    spark.userData.vel = spreadDir.multiplyScalar(10 + Math.random() * 8);
    spark.userData.baseOpacity = 0.9;
    game.scene.add(spark);
    particles.push(spark);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.4;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.spinAxis && p.userData.spinSpeed) {
        p.rotateOnAxis(p.userData.spinAxis, p.userData.spinSpeed);
      }
      if (p.userData.isMain) {
        p.scale.setScalar(1 + Math.sin(elapsed * 30) * 0.15);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 2. 九心海棠：花瓣飞射攻击
function spawnNineHeartBegoniaAttackEffect(pos, dir, color) {
  const particles = [];
  const petalColor = color || 0xff99cc;
  const leafColor = 0x66dd66;

  // 花瓣飞射
  for (let i = 0; i < 14; i++) {
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.1, 0.15, 0, 0.3);
    petalShape.quadraticCurveTo(-0.1, 0.15, 0, 0);

    const petal = new THREE.Mesh(
      new THREE.ShapeGeometry(petalShape),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? leafColor : (i % 3 === 1 ? petalColor : 0xffcce6),
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      })
    );
    petal.position.copy(pos);

    const angle = (i / 14) * Math.PI * 2;
    const spread = 0.1 + Math.random() * 0.15;
    petal.position.x += Math.cos(angle) * spread;
    petal.position.z += Math.sin(angle) * spread;

    // 飞行方向（向前带扩散）
    const flyDir = dir.clone();
    flyDir.x += Math.cos(angle) * 0.2;
    flyDir.z += Math.sin(angle) * 0.2;
    flyDir.y += (Math.random() - 0.5) * 0.2;
    flyDir.normalize();

    petal.userData.vel = flyDir.multiplyScalar(12 + Math.random() * 5);
    petal.userData.baseOpacity = 0.85;
    petal.userData.spinSpeed = 0.15 + Math.random() * 0.2;
    petal.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    petal.userData.waveSpeed = 3 + Math.random() * 3;
    petal.userData.waveAmp = 0.03 + Math.random() * 0.03;
    petal.userData.petalIdx = i;
    game.scene.add(petal);
    particles.push(petal);
  }

  // 中心花芯弹
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x99ff99, transparent: true, opacity: 0.9 })
  );
  core.position.copy(pos);
  core.userData.vel = dir.clone().multiplyScalar(16);
  core.userData.baseOpacity = 0.9;
  core.userData.isCore = true;
  game.scene.add(core);
  particles.push(core);

  // 花粉粒子
  for (let i = 0; i < 10; i++) {
    const pollen = _createParticle(pos, 0.03 + Math.random() * 0.03, 0xffee88, 0.8);
    const pDir = dir.clone();
    pDir.x += (Math.random() - 0.5) * 0.4;
    pDir.y += (Math.random() - 0.5) * 0.3;
    pDir.z += (Math.random() - 0.5) * 0.4;
    pDir.normalize();
    pollen.userData.vel = pDir.multiplyScalar(10 + Math.random() * 6);
    pollen.userData.baseOpacity = 0.8;
    game.scene.add(pollen);
    particles.push(pollen);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.45;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.spinSpeed && p.userData.spinAxis) {
        p.rotateOnAxis(p.userData.spinAxis, p.userData.spinSpeed);
      }
      if (p.userData.isCore) {
        p.scale.setScalar(1 + Math.sin(elapsed * 25) * 0.2);
      }
      if (p.userData.petalIdx !== undefined) {
        const wave = Math.sin(elapsed * p.userData.waveSpeed + p.userData.petalIdx) * p.userData.waveAmp;
        p.position.x += wave;
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 3. 蓝电霸王龙：雷电爪击/电弧
function spawnBlueLightningDragonAttackEffect(pos, dir, color) {
  const particles = [];
  const lightningColor = color || 0x4488ff;
  const brightLightning = 0xaaccff;

  // 主电弧（之字形闪电）
  const lightningGroup = new THREE.Group();
  const zigzagPoints = 8;
  const zigzagLength = 3;
  let currentPos = new THREE.Vector3(0, 0, 0);

  for (let i = 0; i < zigzagPoints; i++) {
    const t = i / (zigzagPoints - 1);
    const segLength = zigzagLength / (zigzagPoints - 1);
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 - t * 0.03, 0.08 - t * 0.03, segLength * 1.2, 5),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? brightLightning : lightningColor,
        transparent: true,
        opacity: 0.9
      })
    );
    // 之字形偏移
    const offsetX = (Math.random() - 0.5) * 0.4;
    const offsetY = (Math.random() - 0.5) * 0.4;
    seg.position.set(
      currentPos.x + offsetX,
      currentPos.y + offsetY,
      currentPos.z + segLength / 2
    );
    // 随机旋转
    seg.rotation.x = (Math.random() - 0.5) * 0.6;
    seg.rotation.y = (Math.random() - 0.5) * 0.6;
    currentPos = seg.position.clone();
    currentPos.z += segLength / 2;
    lightningGroup.add(seg);
  }

  lightningGroup.position.copy(pos);
  lightningGroup.lookAt(pos.clone().add(dir).multiplyScalar(zigzagLength));
  lightningGroup.userData.isLightning = true;
  game.scene.add(lightningGroup);
  particles.push(lightningGroup);

  // 龙爪光效
  for (let c = 0; c < 3; c++) {
    const clawShape = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.4, 4),
      new THREE.MeshBasicMaterial({ color: brightLightning, transparent: true, opacity: 0.85 })
    );
    clawShape.position.copy(pos);
    const clawOffset = (c - 1) * 0.2;
    clawShape.position.x += clawOffset;

    const clawDir = dir.clone();
    clawDir.x += (c - 1) * 0.15;
    clawDir.normalize();

    clawShape.userData.vel = clawDir.multiplyScalar(20);
    clawShape.userData.baseOpacity = 0.85;
    clawShape.lookAt(pos.clone().add(clawDir));
    clawShape.rotateX(Math.PI / 2);
    game.scene.add(clawShape);
    particles.push(clawShape);
  }

  // 电弧火花
  for (let i = 0; i < 15; i++) {
    const spark = _createParticle(pos, 0.03 + Math.random() * 0.04, Math.random() > 0.5 ? brightLightning : 0xffffff, 0.9);
    const sDir = dir.clone();
    sDir.x += (Math.random() - 0.5) * 0.6;
    sDir.y += (Math.random() - 0.5) * 0.5;
    sDir.z += (Math.random() - 0.5) * 0.6;
    sDir.normalize();
    spark.userData.vel = sDir.multiplyScalar(8 + Math.random() * 10);
    spark.userData.baseOpacity = 0.9;
    game.scene.add(spark);
    particles.push(spark);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.35;
  let flashToggle = true;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      // 闪电闪烁效果
      if (p.userData.isLightning && Math.floor(elapsed * 40) % 2 === 0) {
        p.traverse(child => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity *= 0.6;
          }
        });
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 4. 鬼魅：暗影爪击/鬼爪
function spawnGhostAttackEffect(pos, dir, color) {
  const particles = [];
  const shadowColor = color || 0x330044;
  const mistColor = 0x550066;
  const eyeGlow = 0xff2222;

  // 鬼爪（三道黑色爪痕）
  for (let c = 0; c < 3; c++) {
    const clawGroup = new THREE.Group();

    // 爪尖到爪根
    for (let s = 0; s < 4; s++) {
      const clawSeg = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 - s * 0.015, 6, 5),
        new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.85 })
      );
      clawSeg.position.z = s * 0.15;
      clawGroup.add(clawSeg);
    }

    // 尖锐爪尖
    const clawTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.2, 4),
      new THREE.MeshBasicMaterial({ color: 0x110022, transparent: true, opacity: 0.9 })
    );
    clawTip.position.z = -0.15;
    clawTip.rotation.x = Math.PI;
    clawGroup.add(clawTip);

    const clawOffset = (c - 1) * 0.25;
    clawGroup.position.copy(pos);
    clawGroup.position.x += clawOffset;

    const clawDir = dir.clone();
    clawDir.x += (c - 1) * 0.1;
    clawDir.normalize();

    clawGroup.userData.vel = clawDir.multiplyScalar(16);
    clawGroup.userData.baseOpacity = 0.85;
    clawGroup.lookAt(pos.clone().add(clawDir));
    game.scene.add(clawGroup);
    particles.push(clawGroup);
  }

  // 暗影能量球
  const shadowOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 10),
    new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.7 })
  );
  shadowOrb.position.copy(pos);
  shadowOrb.userData.vel = dir.clone().multiplyScalar(14);
  shadowOrb.userData.baseOpacity = 0.7;
  shadowOrb.userData.isOrb = true;
  game.scene.add(shadowOrb);
  particles.push(shadowOrb);

  // 内部暗红光
  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x880022, transparent: true, opacity: 0.5 })
  );
  innerGlow.position.copy(pos);
  innerGlow.userData.vel = dir.clone().multiplyScalar(14);
  innerGlow.userData.baseOpacity = 0.5;
  game.scene.add(innerGlow);
  particles.push(innerGlow);

  // 周围暗影粒子
  for (let i = 0; i < 12; i++) {
    const mist = _createParticle(pos, 0.06 + Math.random() * 0.08, mistColor, 0.6);
    const mDir = dir.clone();
    mDir.x += (Math.random() - 0.5) * 0.5;
    mDir.y += (Math.random() - 0.5) * 0.4;
    mDir.z += (Math.random() - 0.5) * 0.5;
    mDir.normalize();
    mist.userData.vel = mDir.multiplyScalar(10 + Math.random() * 6);
    mist.userData.baseOpacity = 0.6;
    mist.userData.grow = true;
    game.scene.add(mist);
    particles.push(mist);
  }

  // 红眼光点
  for (let i = 0; i < 4; i++) {
    const eye = _createParticle(pos, 0.04, eyeGlow, 1);
    const eDir = dir.clone();
    eDir.x += (Math.random() - 0.5) * 0.3;
    eDir.y += (Math.random() - 0.5) * 0.2;
    eDir.normalize();
    eye.userData.vel = eDir.multiplyScalar(15);
    eye.userData.baseOpacity = 1;
    game.scene.add(eye);
    particles.push(eye);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.4;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.7) * lifeRatio;
      }
      if (p.userData.isOrb) {
        p.scale.setScalar(1 + Math.sin(elapsed * 20) * 0.2);
      }
      if (p.userData.grow) {
        p.scale.setScalar(1 + elapsed * 2);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 5. 月刃：半月刃气飞斩
function spawnMoonBladeAttackEffect(pos, dir, color) {
  const particles = [];
  const bladeColor = color || 0xddeeff;
  const glowColor = 0xaaccff;

  // 半月刃气（主攻击）
  const bladeGroup = new THREE.Group();

  // 外弧刀刃
  const outerBlade = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.1, 8, 20, Math.PI),
    new THREE.MeshBasicMaterial({ color: bladeColor, transparent: true, opacity: 0.9 })
  );
  outerBlade.rotation.x = Math.PI / 2;
  bladeGroup.add(outerBlade);

  // 内弧亮边
  const innerBlade = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.05, 8, 20, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
  );
  innerBlade.rotation.x = Math.PI / 2;
  innerBlade.position.y = 0.03;
  bladeGroup.add(innerBlade);

  // 刀背连接
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.08, 0.15),
    new THREE.MeshBasicMaterial({ color: bladeColor, transparent: true, opacity: 0.8 })
  );
  back.position.z = -0.45;
  bladeGroup.add(back);

  bladeGroup.position.copy(pos);
  bladeGroup.lookAt(pos.clone().add(dir));
  // 让刀刃面向前方
  bladeGroup.rotateZ(Math.PI / 2);
  bladeGroup.userData.vel = dir.clone().multiplyScalar(22);
  bladeGroup.userData.baseOpacity = 0.9;
  bladeGroup.userData.isBlade = true;
  game.scene.add(bladeGroup);
  particles.push(bladeGroup);

  // 尾迹光刃（拖影）
  for (let i = 0; i < 3; i++) {
    const trailBlade = new THREE.Mesh(
      new THREE.TorusGeometry(0.5 - i * 0.05, 0.08 - i * 0.02, 6, 16, Math.PI),
      new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.5 - i * 0.15
      })
    );
    trailBlade.rotation.x = Math.PI / 2;
    trailBlade.position.copy(pos);
    trailBlade.userData.vel = dir.clone().multiplyScalar(22 - i * 3);
    trailBlade.userData.baseOpacity = 0.5 - i * 0.15;
    trailBlade.userData.trailIdx = i;
    trailBlade.lookAt(pos.clone().add(dir));
    trailBlade.rotateZ(Math.PI / 2);
    game.scene.add(trailBlade);
    particles.push(trailBlade);
  }

  // 月光粒子
  for (let i = 0; i < 12; i++) {
    const moonParticle = _createParticle(pos, 0.04 + Math.random() * 0.04, Math.random() > 0.5 ? glowColor : 0xffffff, 0.8);
    const pDir = dir.clone();
    pDir.x += (Math.random() - 0.5) * 0.4;
    pDir.y += (Math.random() - 0.5) * 0.4;
    pDir.z += (Math.random() - 0.5) * 0.4;
    pDir.normalize();
    moonParticle.userData.vel = pDir.multiplyScalar(10 + Math.random() * 8);
    moonParticle.userData.baseOpacity = 0.8;
    game.scene.add(moonParticle);
    particles.push(moonParticle);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.4;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.isBlade) {
        // 旋转前进
        p.rotateZ(0.3);
        p.scale.setScalar(1 + Math.sin(elapsed * 25) * 0.1);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 6. 火凤凰：火焰弹/火球
function spawnFirePhoenixAttackEffect(pos, dir, color) {
  const particles = [];
  const fireColor = color || 0xff5500;
  const brightFire = 0xffaa00;
  const coreFire = 0xffff66;

  // 内核
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
  );
  core.position.copy(pos);
  core.userData.vel = dir.clone().multiplyScalar(18);
  core.userData.baseOpacity = 1;
  core.userData.isCore = true;
  game.scene.add(core);
  particles.push(core);

  // 主火焰球
  const fireball = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 12, 12),
    new THREE.MeshBasicMaterial({ color: fireColor, transparent: true, opacity: 0.85 })
  );
  fireball.position.copy(pos);
  fireball.userData.vel = dir.clone().multiplyScalar(18);
  fireball.userData.baseOpacity = 0.85;
  fireball.userData.isFireball = true;
  game.scene.add(fireball);
  particles.push(fireball);

  // 外焰
  const outerFire = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 12, 12),
    new THREE.MeshBasicMaterial({ color: brightFire, transparent: true, opacity: 0.5 })
  );
  outerFire.position.copy(pos);
  outerFire.userData.vel = dir.clone().multiplyScalar(18);
  outerFire.userData.baseOpacity = 0.5;
  outerFire.userData.isOuter = true;
  game.scene.add(outerFire);
  particles.push(outerFire);

  // 最外层光晕
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.25 })
  );
  halo.position.copy(pos);
  halo.userData.vel = dir.clone().multiplyScalar(18);
  halo.userData.baseOpacity = 0.25;
  game.scene.add(halo);
  particles.push(halo);

  // 尾焰粒子
  for (let i = 0; i < 15; i++) {
    const flameParticle = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 + Math.random() * 0.12, 6, 6),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? fireColor : (Math.random() > 0.5 ? brightFire : coreFire),
        transparent: true,
        opacity: 0.8
      })
    );
    flameParticle.position.copy(pos);
    flameParticle.position.x += (Math.random() - 0.5) * 0.5;
    flameParticle.position.y += (Math.random() - 0.5) * 0.5;
    flameParticle.position.z += (Math.random() - 0.5) * 0.5;

    const fDir = dir.clone();
    fDir.x += (Math.random() - 0.5) * 0.3;
    fDir.y += (Math.random() - 0.5) * 0.3;
    fDir.z += (Math.random() - 0.5) * 0.3;
    fDir.normalize();

    flameParticle.userData.vel = fDir.multiplyScalar(14 + Math.random() * 6);
    flameParticle.userData.baseOpacity = 0.8;
    flameParticle.userData.origY = flameParticle.position.y;
    game.scene.add(flameParticle);
    particles.push(flameParticle);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.45;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.isFireball) {
        p.scale.setScalar(1 + Math.sin(elapsed * 20) * 0.15);
      }
      if (p.userData.isOuter) {
        p.scale.setScalar(1 + Math.sin(elapsed * 15) * 0.25);
      }
      if (p.userData.isCore) {
        p.scale.setScalar(1 + Math.sin(elapsed * 25) * 0.1);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 7. 冰凤凰：冰锥/冰晶
function spawnIcePhoenixAttackEffect(pos, dir, color) {
  const particles = [];
  const iceColor = color || 0x88ddff;
  const brightIce = 0xccf0ff;
  const coreIce = 0xffffff;

  // 主冰锥
  const mainIce = new THREE.Mesh(
    new THREE.ConeGeometry(0.2, 0.7, 6),
    new THREE.MeshBasicMaterial({ color: iceColor, transparent: true, opacity: 0.85 })
  );
  mainIce.position.copy(pos);
  mainIce.userData.vel = dir.clone().multiplyScalar(20);
  mainIce.userData.baseOpacity = 0.85;
  mainIce.userData.isMain = true;
  // 朝向方向
  mainIce.lookAt(pos.clone().add(dir));
  mainIce.rotateX(Math.PI / 2);
  game.scene.add(mainIce);
  particles.push(mainIce);

  // 冰核（内部亮芯）
  const iceCore = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.5, 4),
    new THREE.MeshBasicMaterial({ color: coreIce, transparent: true, opacity: 0.95 })
  );
  iceCore.position.copy(pos);
  iceCore.userData.vel = dir.clone().multiplyScalar(20);
  iceCore.userData.baseOpacity = 0.95;
  iceCore.lookAt(pos.clone().add(dir));
  iceCore.rotateX(Math.PI / 2);
  game.scene.add(iceCore);
  particles.push(iceCore);

  // 周围小冰晶
  for (let i = 0; i < 10; i++) {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.06 + Math.random() * 0.06, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? brightIce : iceColor,
        transparent: true,
        opacity: 0.8
      })
    );
    crystal.position.copy(pos);
    crystal.position.x += (Math.random() - 0.5) * 0.4;
    crystal.position.y += (Math.random() - 0.5) * 0.4;
    crystal.position.z += (Math.random() - 0.5) * 0.4;

    const cDir = dir.clone();
    cDir.x += (Math.random() - 0.5) * 0.4;
    cDir.y += (Math.random() - 0.5) * 0.3;
    cDir.z += (Math.random() - 0.5) * 0.4;
    cDir.normalize();

    crystal.userData.vel = cDir.multiplyScalar(14 + Math.random() * 6);
    crystal.userData.baseOpacity = 0.8;
    crystal.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    crystal.userData.spinSpeed = 0.2 + Math.random() * 0.3;
    game.scene.add(crystal);
    particles.push(crystal);
  }

  // 冰屑粒子
  for (let i = 0; i < 8; i++) {
    const shard = _createParticle(pos, 0.03 + Math.random() * 0.03, brightIce, 0.85);
    const sDir = dir.clone();
    sDir.x += (Math.random() - 0.5) * 0.5;
    sDir.y += (Math.random() - 0.5) * 0.4;
    sDir.z += (Math.random() - 0.5) * 0.5;
    sDir.normalize();
    shard.userData.vel = sDir.multiplyScalar(12 + Math.random() * 6);
    shard.userData.baseOpacity = 0.85;
    game.scene.add(shard);
    particles.push(shard);
  }

  // 寒气雾
  for (let i = 0; i < 5; i++) {
    const frost = new THREE.Mesh(
      new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.35 })
    );
    frost.position.copy(pos);
    frost.position.x += (Math.random() - 0.5) * 0.3;
    frost.position.y += (Math.random() - 0.5) * 0.3;

    const fDir = dir.clone();
    fDir.x += (Math.random() - 0.5) * 0.2;
    fDir.y += (Math.random() - 0.5) * 0.2;
    fDir.normalize();

    frost.userData.vel = fDir.multiplyScalar(10 + Math.random() * 4);
    frost.userData.baseOpacity = 0.35;
    frost.userData.grow = true;
    game.scene.add(frost);
    particles.push(frost);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.4;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.spinAxis && p.userData.spinSpeed) {
        p.rotateOnAxis(p.userData.spinAxis, p.userData.spinSpeed);
      }
      if (p.userData.isMain) {
        p.scale.setScalar(1 + Math.sin(elapsed * 25) * 0.12);
      }
      if (p.userData.grow) {
        p.scale.setScalar(1 + elapsed * 2.5);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 8. 碧磷蛇皇：毒液喷射/蛇咬
function spawnGreenPhosphorusSnakeAttackEffect(pos, dir, color) {
  const particles = [];
  const poisonColor = color || 0x00cc44;
  const brightPoison = 0x66ff44;
  const acidColor = 0x99ff00;

  // 主毒液弹
  const venomOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 10),
    new THREE.MeshBasicMaterial({ color: poisonColor, transparent: true, opacity: 0.75 })
  );
  venomOrb.position.copy(pos);
  venomOrb.userData.vel = dir.clone().multiplyScalar(16);
  venomOrb.userData.baseOpacity = 0.75;
  venomOrb.userData.isOrb = true;
  game.scene.add(venomOrb);
  particles.push(venomOrb);

  // 毒液内核
  const venomCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshBasicMaterial({ color: brightPoison, transparent: true, opacity: 0.9 })
  );
  venomCore.position.copy(pos);
  venomCore.userData.vel = dir.clone().multiplyScalar(16);
  venomCore.userData.baseOpacity = 0.9;
  game.scene.add(venomCore);
  particles.push(venomCore);

  // 毒液液滴（多发）
  for (let i = 0; i < 12; i++) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + Math.random() * 0.07, 6, 6),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? poisonColor : acidColor,
        transparent: true,
        opacity: 0.75
      })
    );
    drop.position.copy(pos);
    drop.position.x += (Math.random() - 0.5) * 0.4;
    drop.position.y += (Math.random() - 0.5) * 0.4;
    drop.position.z += (Math.random() - 0.5) * 0.4;

    const dDir = dir.clone();
    dDir.x += (Math.random() - 0.5) * 0.4;
    dDir.y += (Math.random() - 0.5) * 0.3;
    dDir.z += (Math.random() - 0.5) * 0.4;
    dDir.normalize();

    drop.userData.vel = dDir.multiplyScalar(12 + Math.random() * 6);
    drop.userData.baseOpacity = 0.75;
    drop.userData.gravity = 2;
    game.scene.add(drop);
    particles.push(drop);
  }

  // 蛇牙（两个尖牙攻击）
  for (let i = 0; i < 2; i++) {
    const fang = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.3, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    fang.position.copy(pos);
    fang.position.x += (i === 0 ? 0.1 : -0.1);

    const fDir = dir.clone();
    fDir.x += (i === 0 ? 0.05 : -0.05);
    fDir.normalize();

    fang.userData.vel = fDir.multiplyScalar(20);
    fang.userData.baseOpacity = 0.9;
    fang.lookAt(pos.clone().add(fDir));
    fang.rotateX(Math.PI / 2);
    game.scene.add(fang);
    particles.push(fang);
  }

  // 毒雾
  for (let i = 0; i < 6; i++) {
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(0.18 + Math.random() * 0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x55cc22, transparent: true, opacity: 0.35 })
    );
    mist.position.copy(pos);
    mist.position.x += (Math.random() - 0.5) * 0.3;
    mist.position.y += (Math.random() - 0.5) * 0.3;

    const mDir = dir.clone();
    mDir.x += (Math.random() - 0.5) * 0.3;
    mDir.y += (Math.random() - 0.5) * 0.2;
    mDir.normalize();

    mist.userData.vel = mDir.multiplyScalar(8 + Math.random() * 4);
    mist.userData.baseOpacity = 0.35;
    mist.userData.grow = true;
    game.scene.add(mist);
    particles.push(mist);
  }

  // 毒液发光粒子
  for (let i = 0; i < 8; i++) {
    const glow = _createParticle(pos, 0.03 + Math.random() * 0.03, brightPoison, 0.9);
    const gDir = dir.clone();
    gDir.x += (Math.random() - 0.5) * 0.5;
    gDir.y += (Math.random() - 0.5) * 0.4;
    gDir.z += (Math.random() - 0.5) * 0.5;
    gDir.normalize();
    glow.userData.vel = gDir.multiplyScalar(10 + Math.random() * 6);
    glow.userData.baseOpacity = 0.9;
    game.scene.add(glow);
    particles.push(glow);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.4;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.userData.gravity) {
        p.userData.vel.y -= p.userData.gravity * 0.016;
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.7) * lifeRatio;
      }
      if (p.userData.isOrb) {
        p.scale.setScalar(1 + Math.sin(elapsed * 20) * 0.15);
      }
      if (p.userData.grow) {
        p.scale.setScalar(1 + elapsed * 2);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 9. 钻石猛犸：岩石/碎岩冲击
function spawnDiamondMammothAttackEffect(pos, dir, color) {
  const particles = [];
  const rockColor = 0x887766;
  const diamondColor = color || 0x88eedd;
  const brightDiamond = 0xccffee;
  const goldColor = 0xffdd44;

  // 主岩石弹
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.4, 0),
    new THREE.MeshBasicMaterial({ color: rockColor, transparent: true, opacity: 0.85 })
  );
  rock.position.copy(pos);
  rock.userData.vel = dir.clone().multiplyScalar(15);
  rock.userData.baseOpacity = 0.85;
  rock.userData.isRock = true;
  rock.userData.spinAxis = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize();
  game.scene.add(rock);
  particles.push(rock);

  // 岩石上的钻石嵌片
  for (let i = 0; i < 4; i++) {
    const diamondShard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1, 0),
      new THREE.MeshBasicMaterial({ color: brightDiamond, transparent: true, opacity: 0.9 })
    );
    diamondShard.position.copy(pos);
    const angle = (i / 4) * Math.PI * 2;
    diamondShard.position.x += Math.cos(angle) * 0.3;
    diamondShard.position.z += Math.sin(angle) * 0.3;
    diamondShard.position.y += (Math.random() - 0.5) * 0.3;

    diamondShard.userData.vel = dir.clone().multiplyScalar(15);
    diamondShard.userData.baseOpacity = 0.9;
    diamondShard.userData.spinSpeed = 0.15;
    diamondShard.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    game.scene.add(diamondShard);
    particles.push(diamondShard);
  }

  // 碎岩飞射
  for (let i = 0; i < 12; i++) {
    const debris = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.08, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? rockColor : 0x998877,
        transparent: true,
        opacity: 0.8
      })
    );
    debris.position.copy(pos);
    debris.position.x += (Math.random() - 0.5) * 0.4;
    debris.position.y += (Math.random() - 0.5) * 0.4;
    debris.position.z += (Math.random() - 0.5) * 0.4;

    const dDir = dir.clone();
    dDir.x += (Math.random() - 0.5) * 0.5;
    dDir.y += (Math.random() - 0.5) * 0.4;
    dDir.z += (Math.random() - 0.5) * 0.5;
    dDir.normalize();

    debris.userData.vel = dDir.multiplyScalar(12 + Math.random() * 6);
    debris.userData.baseOpacity = 0.8;
    debris.userData.gravity = 3;
    debris.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    debris.userData.spinSpeed = 0.15 + Math.random() * 0.2;
    game.scene.add(debris);
    particles.push(debris);
  }

  // 钻石碎粒
  for (let i = 0; i < 8; i++) {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.04 + Math.random() * 0.05, 0),
      new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? diamondColor : brightDiamond,
        transparent: true,
        opacity: 0.85
      })
    );
    crystal.position.copy(pos);
    crystal.position.x += (Math.random() - 0.5) * 0.5;
    crystal.position.y += (Math.random() - 0.5) * 0.5;
    crystal.position.z += (Math.random() - 0.5) * 0.5;

    const cDir = dir.clone();
    cDir.x += (Math.random() - 0.5) * 0.4;
    cDir.y += (Math.random() - 0.5) * 0.4;
    cDir.normalize();

    crystal.userData.vel = cDir.multiplyScalar(14 + Math.random() * 6);
    crystal.userData.baseOpacity = 0.85;
    crystal.userData.spinAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    crystal.userData.spinSpeed = 0.2 + Math.random() * 0.3;
    game.scene.add(crystal);
    particles.push(crystal);
  }

  // 金光粒子
  for (let i = 0; i < 6; i++) {
    const goldSpark = _createParticle(pos, 0.04 + Math.random() * 0.03, goldColor, 0.85);
    const gDir = dir.clone();
    gDir.x += (Math.random() - 0.5) * 0.4;
    gDir.y += (Math.random() - 0.5) * 0.3;
    gDir.normalize();
    goldSpark.userData.vel = gDir.multiplyScalar(12 + Math.random() * 5);
    goldSpark.userData.baseOpacity = 0.85;
    game.scene.add(goldSpark);
    particles.push(goldSpark);
  }

  // 动画
  const startTime = performance.now();
  const duration = 0.45;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.userData.gravity) {
        p.userData.vel.y -= p.userData.gravity * 0.016;
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.8) * lifeRatio;
      }
      if (p.userData.spinAxis && p.userData.spinSpeed) {
        p.rotateOnAxis(p.userData.spinAxis, p.userData.spinSpeed);
      } else if (p.userData.spinAxis && !p.userData.spinSpeed) {
        p.rotateOnAxis(p.userData.spinAxis, 0.1);
      }
      if (p.userData.isRock) {
        p.scale.setScalar(1 + Math.sin(elapsed * 15) * 0.1);
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}

// 10. 九尾狐：狐火/魅惑光球
function spawnNineTailedFoxAttackEffect(pos, dir, color) {
  const particles = [];
  const foxfireColor = color || 0xcc66ff;
  const charmColor = 0xff88dd;
  const coreColor = 0xffaaff;
  const brightColor = 0xffccff;

  // 主魅惑光球
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 10, 10),
    new THREE.MeshBasicMaterial({ color: foxfireColor, transparent: true, opacity: 0.7 })
  );
  orb.position.copy(pos);
  orb.userData.vel = dir.clone().multiplyScalar(14);
  orb.userData.baseOpacity = 0.7;
  orb.userData.isOrb = true;
  game.scene.add(orb);
  particles.push(orb);

  // 光球内核
  const orbCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 8),
    new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.95 })
  );
  orbCore.position.copy(pos);
  orbCore.userData.vel = dir.clone().multiplyScalar(14);
  orbCore.userData.baseOpacity = 0.95;
  game.scene.add(orbCore);
  particles.push(orbCore);

  // 中心亮点
  const orbCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
  );
  orbCenter.position.copy(pos);
  orbCenter.userData.vel = dir.clone().multiplyScalar(14);
  orbCenter.userData.baseOpacity = 1;
  game.scene.add(orbCenter);
  particles.push(orbCenter);

  // 狐火（多个小火焰）
  for (let i = 0; i < 8; i++) {
    const foxfire = new THREE.Group();

    // 火焰主体
    const flameBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.25, 6),
      new THREE.MeshBasicMaterial({ color: charmColor, transparent: true, opacity: 0.8 })
    );
    foxfire.add(flameBody);

    // 火焰内芯
    const flameCore = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.18, 5),
      new THREE.MeshBasicMaterial({ color: coreColor, transparent: true, opacity: 0.9 })
    );
    flameCore.position.y = 0.02;
    foxfire.add(flameCore);

    foxfire.position.copy(pos);
    const angle = (i / 8) * Math.PI * 2;
    foxfire.position.x += Math.cos(angle) * 0.3;
    foxfire.position.z += Math.sin(angle) * 0.3;
    foxfire.position.y += (Math.random() - 0.5) * 0.2;

    const fDir = dir.clone();
    fDir.x += Math.cos(angle) * 0.2;
    fDir.z += Math.sin(angle) * 0.2;
    fDir.y += (Math.random() - 0.5) * 0.2;
    fDir.normalize();

    foxfire.userData.vel = fDir.multiplyScalar(12 + Math.random() * 4);
    foxfire.userData.baseOpacity = 0.8;
    foxfire.userData.foxfireIdx = i;
    foxfire.userData.orbitAngle = angle;
    foxfire.userData.orbitSpeed = 2 + Math.random();
    game.scene.add(foxfire);
    particles.push(foxfire);
  }

  // 魅惑光点
  for (let i = 0; i < 10; i++) {
    const charm = _createParticle(pos, 0.04 + Math.random() * 0.04, Math.random() > 0.5 ? charmColor : brightColor, 0.85);
    const cDir = dir.clone();
    cDir.x += (Math.random() - 0.5) * 0.5;
    cDir.y += (Math.random() - 0.5) * 0.4;
    cDir.z += (Math.random() - 0.5) * 0.5;
    cDir.normalize();
    charm.userData.vel = cDir.multiplyScalar(10 + Math.random() * 6);
    charm.userData.baseOpacity = 0.85;
    game.scene.add(charm);
    particles.push(charm);
  }

  // 心形魅惑粒子
  for (let i = 0; i < 5; i++) {
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xff66aa, transparent: true, opacity: 0.7 })
    );
    heart.position.copy(pos);
    heart.position.x += (Math.random() - 0.5) * 0.3;
    heart.position.y += (Math.random() - 0.5) * 0.3;

    const hDir = dir.clone();
    hDir.y += 0.1 + Math.random() * 0.1;
    hDir.x += (Math.random() - 0.5) * 0.2;
    hDir.normalize();

    heart.userData.vel = hDir.multiplyScalar(10 + Math.random() * 4);
    heart.userData.baseOpacity = 0.7;
    game.scene.add(heart);
    particles.push(heart);
  }

  // 外层光晕
  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 10, 10),
    new THREE.MeshBasicMaterial({ color: foxfireColor, transparent: true, opacity: 0.3 })
  );
  outerGlow.position.copy(pos);
  outerGlow.userData.vel = dir.clone().multiplyScalar(14);
  outerGlow.userData.baseOpacity = 0.3;
  outerGlow.userData.isGlow = true;
  game.scene.add(outerGlow);
  particles.push(outerGlow);

  // 动画
  const startTime = performance.now();
  const duration = 0.45;
  const animate = () => {
    const elapsed = (performance.now() - startTime) / 1000;
    if (elapsed > duration) {
      for (const p of particles) {
        if (typeof dispose3DObject === 'function') dispose3DObject(p);
        else if (p.parent) p.parent.remove(p);
      }
      return;
    }
    const lifeRatio = 1 - elapsed / duration;
    for (const p of particles) {
      if (p.userData.vel) {
        p.position.add(p.userData.vel.clone().multiplyScalar(0.016));
      }
      if (p.material && p.material.opacity !== undefined) {
        p.material.opacity = (p.userData.baseOpacity || 0.7) * lifeRatio;
      }
      if (p.userData.isOrb) {
        p.scale.setScalar(1 + Math.sin(elapsed * 18) * 0.15);
      }
      if (p.userData.isGlow) {
        p.scale.setScalar(1 + Math.sin(elapsed * 12) * 0.25);
      }
      // 狐火上下跳动
      if (p.userData.foxfireIdx !== undefined) {
        p.position.y += Math.sin(elapsed * 8 + p.userData.foxfireIdx) * 0.02;
        p.scale.y = 1 + Math.sin(elapsed * 15 + p.userData.foxfireIdx) * 0.15;
      }
    }
    requestAnimationFrame(animate);
  };
  animate();
}


// ========== 注册到全局 ==========
window._extraSoulEffectsLoaded = true;
console.log('[extra-soul-effects] 额外武魂技能特效加载完成');
