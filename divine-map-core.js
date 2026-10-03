// ============================================================
// 斗罗大陆 - 神位地图通用辅助函数 (Divine Map Core)
//
// 供 divine-maps.js 与 divine-maps2.js 共用。这两个文件原先各自复制了一份
// 完全相同的 savePrevState / hidePrevScene / restorePrevScene / setEnvironment /
// createGround / updateParticles（约 100 行），现在统一从这里取用。
//
// 注意：本文件必须早于 divine-maps.js / divine-maps2.js 加载。
// ============================================================

(function (global) {
  'use strict';

  // 保存原场景状态
  function savePrevState(map) {
    if (game.scene) {
      map.prevState.fogColor = game.scene.fog ? game.scene.fog.color.clone() : null;
      map.prevState.fogFar = game.scene.fog ? game.scene.fog.far : 0;
      map.prevState.bgColor = game.scene.background ? game.scene.background.clone() : null;
    }
    map.prevState.ambientColor = game.ambientLight ? game.ambientLight.color.clone() : null;
    map.prevState.ambientIntensity = game.ambientLight ? game.ambientLight.intensity : 0;
    map.prevState.sunColor = game.sunLight ? game.sunLight.color.clone() : null;
    map.prevState.sunIntensity = game.sunLight ? game.sunLight.intensity : 0;
    map.prevState.beasts = game.beasts || [];
    map.prevState.mapRadius = game.mapRadius || 200;
    map.prevState.currentZone = game.currentZone || 'village';
    for (const beast of game.beasts) {
      if (beast.mesh) beast.mesh.visible = false;
    }
  }

  // 隐藏原场景（圣魂村等）
  function hidePrevScene() {
    if (game.terrain) game.terrain.visible = false;
    if (game.mountains) game.mountains.visible = false;
    if (game.villageGroup) game.villageGroup.visible = false;
    if (game.trees) { for (const t of game.trees) if (t) t.visible = false; }
    if (game.grassMeshes) { for (const g of game.grassMeshes) if (g) g.visible = false; }
    if (game.flowerMeshes) { for (const f of game.flowerMeshes) if (f) f.visible = false; }
    game.beasts = [];
  }

  // 恢复原场景
  function restorePrevScene(map) {
    if (game.terrain) game.terrain.visible = true;
    if (game.mountains) game.mountains.visible = true;
    if (game.villageGroup) game.villageGroup.visible = true;
    if (game.trees) { for (const t of game.trees) if (t) t.visible = true; }
    if (game.grassMeshes) { for (const g of game.grassMeshes) if (g) g.visible = true; }
    if (game.flowerMeshes) { for (const f of game.flowerMeshes) if (f) f.visible = true; }

    game.beasts = map.prevState.beasts || [];
    for (const beast of game.beasts) {
      if (beast.mesh) beast.mesh.visible = true;
    }

    // 恢复地图边界和区域
    if (map.prevState.mapRadius) {
      game.mapRadius = map.prevState.mapRadius;
    } else if (game.terrain) {
      const terrainSize = game.terrain.geometry.parameters.width;
      game.mapRadius = terrainSize * 0.85 / 2;
    } else {
      game.mapRadius = 200;
    }
    game.currentZone = map.prevState.currentZone || 'village';

    if (game.scene && game.scene.fog) {
      if (map.prevState.fogColor) game.scene.fog.color.copy(map.prevState.fogColor);
      if (map.prevState.fogFar) game.scene.fog.far = map.prevState.fogFar;
    }
    if (game.scene && map.prevState.bgColor) {
      game.scene.background = map.prevState.bgColor.clone();
    }
    if (game.ambientLight && map.prevState.ambientColor) {
      game.ambientLight.color.copy(map.prevState.ambientColor);
      game.ambientLight.intensity = map.prevState.ambientIntensity;
    }
    if (game.sunLight && map.prevState.sunColor) {
      game.sunLight.color.copy(map.prevState.sunColor);
      game.sunLight.intensity = map.prevState.sunIntensity;
    }
  }

  // 设置环境
  function setEnvironment(fogColor, fogFar, bgColor, ambientColor, ambientIntensity, sunColor, sunIntensity) {
    const scene = game.scene;
    if (scene.fog) {
      scene.fog.color.setHex(fogColor);
      scene.fog.far = fogFar;
    } else {
      scene.fog = new THREE.Fog(fogColor, 20, fogFar);
    }
    scene.background = new THREE.Color(bgColor);
    if (game.ambientLight) {
      game.ambientLight.intensity = ambientIntensity;
      game.ambientLight.color.setHex(ambientColor);
    }
    if (game.sunLight) {
      game.sunLight.intensity = sunIntensity;
      game.sunLight.color.setHex(sunColor);
    }
  }

  // 创建圆形地面
  function createGround(radius, color, y) {
    const geom = new THREE.CircleGeometry(radius, 64);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = y || 0;
    mesh.receiveShadow = true;
    return mesh;
  }

  // 创建粒子系统（简单浮动粒子）
  // radius 为可选参数：不传时沿用第一批地图的默认值 80
  function createParticles(count, color, size, yRange, speed, radius) {
    const particles = [];
    const geom = new THREE.SphereGeometry(size, 4, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });
    const r = radius || 80;
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geom, mat.clone());
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r;
      p.position.set(
        Math.cos(angle) * dist,
        Math.random() * yRange,
        Math.sin(angle) * dist
      );
      p.userData.speed = speed * (0.5 + Math.random() * 0.5);
      p.userData.baseY = p.position.y;
      p.userData.phase = Math.random() * Math.PI * 2;
      particles.push(p);
    }
    return particles;
  }

  // 更新粒子浮动效果
  function updateParticles(particles, dt, time) {
    for (const p of particles) {
      if (!p.visible) continue;
      p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 2;
      p.material.opacity = 0.4 + Math.sin(time * p.userData.speed * 0.7 + p.userData.phase) * 0.3;
    }
  }

  // 通用传送逻辑
  // 落点高度兼容两批地图：第二批地图带 groundY 字段，第一批没有（等价于 0）
  function doTeleport(map, mapName, mapId, zoneName, spawnOffset) {
    if (!game.player || game.state !== 'playing') return;
    if (map.active) return;

    const doIt = () => {
      if (typeof LoadingManager !== 'undefined') {
        LoadingManager.show(zoneName, '正在前往' + zoneName + '...');
      }
      game.state = 'loading';

      setTimeout(() => {
        savePrevState(map);
        hidePrevScene();

        if (!map.initialized) {
          map.init();
          map.initialized = true;
        } else {
          map._show();
        }

        map._setEnv();

        const p = game.player;
        const spawnY = (map.groundY || 0) + 2;
        p.mesh.position.set(map.centerX + spawnOffset.x, spawnY, map.centerZ + spawnOffset.z);
        p.velocity.set(0, 0, 0);

        if (game.camera) {
          game.camera.position.set(map.centerX + spawnOffset.x + 10, spawnY + 8, map.centerZ + spawnOffset.z + 10);
          game.camera.lookAt(map.centerX, spawnY + 2, map.centerZ);
        }

        map.active = true;
        game.currentZone = mapId;
        game.mapRadius = map.radius;

        if (typeof LoadingManager !== 'undefined') {
          LoadingManager.setProgress(100, '到达' + zoneName);
          setTimeout(() => LoadingManager.hide(), 300);
        }

        game.state = 'playing';
        if (typeof showHint === 'function') {
          showHint('你来到了' + zoneName + '...');
        }
        if (typeof saveGame === 'function') saveGame();
      }, 500);
    };

    if (typeof LoadingManager !== 'undefined' && LoadingManager.playTeleportEffect) {
      LoadingManager.playTeleportEffect(doIt);
    } else {
      doIt();
    }
  }

  // 通用离开逻辑
  function doLeave(map) {
    if (!map.active) return;
    map._hide();
    restorePrevScene(map);
    map.active = false;
    game.currentZone = 'village';
  }

  global.DivineMapHelpers = {
    savePrevState: savePrevState,
    hidePrevScene: hidePrevScene,
    restorePrevScene: restorePrevScene,
    setEnvironment: setEnvironment,
    createGround: createGround,
    createParticles: createParticles,
    updateParticles: updateParticles,
    doTeleport: doTeleport,
    doLeave: doLeave,
  };
})(typeof window !== 'undefined' ? window : this);
