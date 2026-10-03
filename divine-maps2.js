// ============================================================
// 斗罗大陆 - 神位地图系统 第二批 (Divine Maps 2)
// 8张独立神位地图，每张对应一位神祇
// ============================================================

(function() {
  'use strict';

  // ------------------------------------------------------------
  // 通用辅助函数（复用 divine-maps.js 中的同名函数，
  //  如果已存在则直接使用，否则在此定义）
  // ------------------------------------------------------------
  // 通用辅助函数统一来自 divine-map-core.js（window.DivineMapHelpers）
  const {
    savePrevState, hidePrevScene, restorePrevScene,
    setEnvironment, createGround, createParticles, updateParticles,
    doTeleport, doLeave,
  } = window.DivineMapHelpers;

  // ============================================================
  // 1. 天使神殿 - 天使神
  // ============================================================
  const TempleAngelMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      marbleFloor: null,
      temple: null,
      angelStatue: null,
      pillars: [],
      holyBeams: [],
      goldParticles: [],
      holyLights: [],
      stainedGlass: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 白色大理石地面
      so.ground = createGround(this.radius, 0xf5f5f0, 0);
      scene.add(so.ground);

      // 中心圆形大理石广场（金色花纹边）
      const plazaGeom = new THREE.CircleGeometry(30, 64);
      plazaGeom.rotateX(-Math.PI / 2);
      const plazaMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.6, metalness: 0.1 });
      so.marbleFloor = new THREE.Mesh(plazaGeom, plazaMat);
      so.marbleFloor.position.y = 0.02;
      so.marbleFloor.receiveShadow = true;
      scene.add(so.marbleFloor);

      // 金色花纹圆环
      for (let i = 0; i < 3; i++) {
        const ringGeom = new THREE.RingGeometry(10 + i * 8, 10.5 + i * 8, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.03 + i * 0.005;
        scene.add(ring);
      }

      // 天使神殿主体
      const templeGroup = new THREE.Group();

      // 神殿基座（多层台阶）
      for (let i = 0; i < 4; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(22 - i * 2, 1, 18 - i * 1.5),
          new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.5 })
        );
        step.position.y = i * 1 + 0.5;
        templeGroup.add(step);
      }

      // 神殿主体建筑
      const templeBody = new THREE.Mesh(
        new THREE.BoxGeometry(18, 15, 14),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      templeBody.position.y = 4 + 7.5;
      templeGroup.add(templeBody);

      // 金色装饰线条
      for (let i = 0; i < 3; i++) {
        const trim = new THREE.Mesh(
          new THREE.BoxGeometry(19, 0.3, 15),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        trim.position.y = 4 + 2 + i * 5;
        templeGroup.add(trim);
      }

      // 神殿山墙（三角形屋顶）
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-10, 0);
      roofShape.lineTo(0, 6);
      roofShape.lineTo(10, 0);
      roofShape.lineTo(-10, 0);
      const roofExtrude = new THREE.ExtrudeGeometry(roofShape, { depth: 15, bevelEnabled: false });
      const roof = new THREE.Mesh(
        roofExtrude,
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.7 })
      );
      roof.position.set(0, 4 + 15, -7.5);
      templeGroup.add(roof);

      // 山墙中心的天使浮雕
      const emblem = new THREE.Mesh(
        new THREE.CircleGeometry(2.5, 16),
        new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.3, metalness: 0.9, emissive: 0xffd700, emissiveIntensity: 0.3 })
      );
      emblem.position.set(0, 4 + 17, -7.6);
      templeGroup.add(emblem);

      // 神殿大门
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(4, 7, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.4, metalness: 0.8 })
      );
      door.position.set(0, 4 + 3.5, 7.1);
      templeGroup.add(door);

      templeGroup.position.set(0, 0, -8);
      so.temple = templeGroup;
      scene.add(templeGroup);

      // 六翼天使雕像（中心）
      const angelGroup = new THREE.Group();

      // 雕像基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 4, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
      );
      base.position.y = 1;
      angelGroup.add(base);

      // 天使身体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.8, 5, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.5 })
      );
      body.position.y = 2 + 2.5;
      angelGroup.add(body);

      // 天使头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.4 })
      );
      head.position.y = 2 + 5 + 0.8;
      angelGroup.add(head);

      // 光环
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.5, 0.15, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xffd700 })
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 2 + 6.5;
      angelGroup.add(halo);

      // 六只翅膀（左右各三只）
      const wingColors = [0xffffff, 0xf0f0f0, 0xe8e8e8];
      for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < 3; w++) {
          const wingGroup = new THREE.Group();
          const wingShape = new THREE.Shape();
          wingShape.moveTo(0, 0);
          wingShape.quadraticCurveTo(3, 2, 5, 4);
          wingShape.quadraticCurveTo(4, 0, 0, -1);
          wingShape.lineTo(0, 0);
          const wingGeom = new THREE.ExtrudeGeometry(wingShape, { depth: 0.2, bevelEnabled: false });
          const wing = new THREE.Mesh(
            wingGeom,
            new THREE.MeshStandardMaterial({ color: wingColors[w], roughness: 0.5, side: THREE.DoubleSide })
          );
          wingGroup.add(wing);
          wingGroup.position.set(side * 1.5, 2 + 4.5 - w * 1.2, 0);
          wingGroup.rotation.z = side * (0.3 + w * 0.15);
          wingGroup.rotation.y = side * (0.5 - w * 0.1);
          angelGroup.add(wingGroup);
        }
      }

      angelGroup.position.set(0, 0, 0);
      so.angelStatue = angelGroup;
      scene.add(angelGroup);

      // 周围白色大理石柱
      so.pillars = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const pillarGroup = new THREE.Group();

        // 柱身
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.5, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.5 })
        );
        pillar.position.y = 6;
        pillarGroup.add(pillar);

        // 柱头
        const capital = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 1, 2.5),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 })
        );
        capital.position.y = 12.5;
        pillarGroup.add(capital);

        // 柱基
        const base2 = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 1, 2.5),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 })
        );
        base2.position.y = 0.5;
        pillarGroup.add(base2);

        pillarGroup.position.set(Math.cos(angle) * 35, 0, Math.sin(angle) * 35);
        so.pillars.push(pillarGroup);
        scene.add(pillarGroup);
      }

      // 神圣光柱（从天空射下）
      so.holyBeams = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const beamGeom = new THREE.CylinderGeometry(2, 3, 60, 12, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.set(Math.cos(angle) * 15, 30, Math.sin(angle) * 15);
        beam.userData.baseOpacity = 0.15;
        so.holyBeams.push(beam);
        scene.add(beam);
      }

      // 中心主光柱
      const mainBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 5, 80, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
      );
      mainBeam.position.set(0, 40, 0);
      mainBeam.userData.baseOpacity = 0.1;
      so.holyBeams.push(mainBeam);
      scene.add(mainBeam);

      // 金色圣光粒子
      so.goldParticles = createParticles(100, 0xffd700, 0.8, 20, 0.8, 60);
      for (const p of so.goldParticles) {
        p.material.opacity = 0.7;
        scene.add(p);
      }

      // 暖金色灯光
      so.holyLights = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const light = new THREE.PointLight(0xffd700, 1.2, 30);
        light.position.set(Math.cos(angle) * 25, 8, Math.sin(angle) * 25);
        so.holyLights.push(light);
        scene.add(light);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.marbleFloor) so.marbleFloor.visible = true;
      if (so.temple) so.temple.visible = true;
      if (so.angelStatue) so.angelStatue.visible = true;
      for (const p of so.pillars) if (p) p.visible = true;
      for (const b of so.holyBeams) if (b) b.visible = true;
      for (const p of so.goldParticles) if (p) p.visible = true;
      for (const l of so.holyLights) if (l) l.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.marbleFloor) so.marbleFloor.visible = false;
      if (so.temple) so.temple.visible = false;
      if (so.angelStatue) so.angelStatue.visible = false;
      for (const p of so.pillars) if (p) p.visible = false;
      for (const b of so.holyBeams) if (b) b.visible = false;
      for (const p of so.goldParticles) if (p) p.visible = false;
      for (const l of so.holyLights) if (l) l.visible = false;
    },

    _setEnv() {
      setEnvironment(0xfff8dc, 150, 0xfffaf0, 0xfff8dc, 0.6, 0xffd700, 0.8);
    },

    teleportTo() {
      doTeleport(this, 'temple_angel', 'temple_angel', '天使神殿', { x: 0, z: 45 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.goldParticles, dt, time);

      // 光柱呼吸效果
      for (let i = 0; i < this.sceneObjects.holyBeams.length; i++) {
        const b = this.sceneObjects.holyBeams[i];
        b.material.opacity = b.userData.baseOpacity + Math.sin(time * 1.5 + i) * 0.05;
      }

      // 灯光脉动
      for (let i = 0; i < this.sceneObjects.holyLights.length; i++) {
        const l = this.sceneObjects.holyLights[i];
        l.intensity = 1.0 + Math.sin(time * 1.2 + i * 0.5) * 0.3;
      }
    },
  };

  // ============================================================
  // 4. 极速竞技场 - 速度之神
  // ============================================================
  const TempleSpeedMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      arena: null,
      raceTrack: null,
      startLine: null,
      timerTower: null,
      spectatorStands: [],
      windParticles: [],
      speedLines: [],
      obstacleMarkers: [],
      finishLine: null,
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 青蓝色地面
      so.ground = createGround(this.radius, 0x1a4a6a, 0);
      scene.add(so.ground);

      // 中心圆形竞技场
      const arenaGeom = new THREE.CircleGeometry(35, 64);
      arenaGeom.rotateX(-Math.PI / 2);
      const arenaMat = new THREE.MeshStandardMaterial({ color: 0x2a6a8a, roughness: 0.7 });
      so.arena = new THREE.Mesh(arenaGeom, arenaMat);
      so.arena.position.y = 0.02;
      so.arena.receiveShadow = true;
      scene.add(so.arena);

      // 环形跑道
      const trackGeom = new THREE.RingGeometry(40, 50, 64);
      trackGeom.rotateX(-Math.PI / 2);
      const trackMat = new THREE.MeshStandardMaterial({ color: 0x3a8aba, roughness: 0.6 });
      so.raceTrack = new THREE.Mesh(trackGeom, trackMat);
      so.raceTrack.position.y = 0.03;
      so.raceTrack.receiveShadow = true;
      scene.add(so.raceTrack);

      // 跑道分道线
      for (let i = 0; i < 5; i++) {
        const lineGeom = new THREE.RingGeometry(41.5 + i * 2, 41.6 + i * 2, 64);
        lineGeom.rotateX(-Math.PI / 2);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const line = new THREE.Mesh(lineGeom, lineMat);
        line.position.y = 0.04 + i * 0.005;
        scene.add(line);
      }

      // 起点线
      const startGeom = new THREE.PlaneGeometry(10, 2);
      startGeom.rotateX(-Math.PI / 2);
      const startMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      so.startLine = new THREE.Mesh(startGeom, startMat);
      so.startLine.position.set(0, 0.05, 45);
      so.startLine.receiveShadow = true;
      scene.add(so.startLine);

      // 终点线
      const finishGeom = new THREE.PlaneGeometry(10, 1);
      finishGeom.rotateX(-Math.PI / 2);
      const finishMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.5, emissive: 0xff2200, emissiveIntensity: 0.3 });
      so.finishLine = new THREE.Mesh(finishGeom, finishMat);
      so.finishLine.position.set(0, 0.05, -45);
      so.finishLine.receiveShadow = true;
      scene.add(so.finishLine);

      // 计时塔（中心）
      const towerGroup = new THREE.Group();

      // 塔基
      const towerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 5, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.7 })
      );
      towerBase.position.y = 1;
      towerGroup.add(towerBase);

      // 塔身
      const towerBody = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 3.5, 12, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a5a7a, roughness: 0.6, metalness: 0.3 })
      );
      towerBody.position.y = 2 + 6;
      towerGroup.add(towerBody);

      // 大钟面
      const clockFace = new THREE.Mesh(
        new THREE.CircleGeometry(2, 32),
        new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.4, metalness: 0.2, emissive: 0x4aaacc, emissiveIntensity: 0.2 })
      );
      clockFace.position.set(0, 2 + 8, 3.6);
      clockFace.rotation.y = 0;
      towerGroup.add(clockFace);

      // 时钟指针
      const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 1, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      hourHand.position.set(0, 2 + 8.3, 3.7);
      towerGroup.add(hourHand);

      const minHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.5, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      minHand.position.set(0.4, 2 + 8.5, 3.7);
      minHand.rotation.z = -Math.PI / 4;
      towerGroup.add(minHand);

      // 塔顶
      const towerTop = new THREE.Mesh(
        new THREE.ConeGeometry(3, 4, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.7 })
      );
      towerTop.position.y = 2 + 12 + 2;
      towerGroup.add(towerTop);

      // 顶部闪电装饰
      const topCrystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(1, 0),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
      );
      topCrystal.position.y = 2 + 12 + 4 + 1;
      topCrystal.userData.baseY = 2 + 12 + 4 + 1;
      towerGroup.add(topCrystal);

      so.timerTower = towerGroup;
      scene.add(towerGroup);

      // 观众席（周围一圈阶梯看台）
      so.spectatorStands = [];
      for (let ring = 0; ring < 4; ring++) {
        const standRadius = 55 + ring * 5;
        const standHeight = 2 + ring * 1.5;

        // 环形阶梯
        const standGeom = new THREE.CylinderGeometry(standRadius + 3, standRadius, standHeight, 32, 1, false);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x4a9ac8, roughness: 0.7 });
        const stand = new THREE.Mesh(standGeom, standMat);
        stand.position.y = standHeight / 2;
        so.spectatorStands.push(stand);
        scene.add(stand);

        // 观众座位条纹
        for (let row = 0; row < 3; row++) {
          const seatRadius = standRadius + 1 + row;
          const seatGeom = new THREE.RingGeometry(seatRadius, seatRadius + 0.3, 32);
          seatGeom.rotateX(-Math.PI / 2);
          const seatMat = new THREE.MeshStandardMaterial({ color: 0x5ab8e0, roughness: 0.6 });
          const seat = new THREE.Mesh(seatGeom, seatMat);
          seat.position.y = standHeight + 0.5 + row * 1;
          scene.add(seat);
        }
      }

      // 速度之风粒子（围绕跑道快速旋转）
      so.windParticles = [];
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 42 + Math.random() * 14;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 4, 4),
          new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
        );
        particle.position.set(
          Math.cos(angle) * dist,
          1 + Math.random() * 8,
          Math.sin(angle) * dist
        );
        particle.userData.angle = angle;
        particle.userData.radius = dist;
        particle.userData.speed = 0.8 + Math.random() * 1.2;
        particle.userData.baseY = particle.position.y;
        so.windParticles.push(particle);
        scene.add(particle);
      }

      // 速度线特效
      so.speedLines = [];
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 43 + Math.random() * 13;
        const line = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 3, 4),
          new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.4 })
        );
        line.position.set(
          Math.cos(angle) * dist,
          2 + Math.random() * 6,
          Math.sin(angle) * dist
        );
        line.rotation.z = Math.PI / 2;
        line.userData.angle = angle;
        line.userData.radius = dist;
        line.userData.speed = 1.0 + Math.random() * 1.5;
        so.speedLines.push(line);
        scene.add(line);
      }

      // 跑道障碍标记
      so.obstacleMarkers = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const marker = new THREE.Group();

        // 锥体
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.5, emissive: 0xff4400, emissiveIntensity: 0.2 })
        );
        cone.position.y = 1;
        marker.add(cone);

        // 白色条纹
        const stripe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.85, 0.75, 0.3, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
        );
        stripe.position.y = 1.2;
        marker.add(stripe);

        marker.position.set(Math.cos(angle) * 45, 0, Math.sin(angle) * 45);
        so.obstacleMarkers.push(marker);
        scene.add(marker);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.arena) so.arena.visible = true;
      if (so.raceTrack) so.raceTrack.visible = true;
      if (so.startLine) so.startLine.visible = true;
      if (so.finishLine) so.finishLine.visible = true;
      if (so.timerTower) so.timerTower.visible = true;
      for (const s of so.spectatorStands) if (s) s.visible = true;
      for (const p of so.windParticles) if (p) p.visible = true;
      for (const l of so.speedLines) if (l) l.visible = true;
      for (const m of so.obstacleMarkers) if (m) m.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.arena) so.arena.visible = false;
      if (so.raceTrack) so.raceTrack.visible = false;
      if (so.startLine) so.startLine.visible = false;
      if (so.finishLine) so.finishLine.visible = false;
      if (so.timerTower) so.timerTower.visible = false;
      for (const s of so.spectatorStands) if (s) s.visible = false;
      for (const p of so.windParticles) if (p) p.visible = false;
      for (const l of so.speedLines) if (l) l.visible = false;
      for (const m of so.obstacleMarkers) if (m) m.visible = false;
    },

    _setEnv() {
      setEnvironment(0x1a4a6a, 140, 0x2a6a8a, 0x87ceeb, 0.4, 0x00ffff, 0.6);
    },

    teleportTo() {
      doTeleport(this, 'temple_speed', 'temple_speed', '极速竞技场', { x: 0, z: 55 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 风粒子沿跑道旋转
      for (const p of this.sceneObjects.windParticles) {
        p.userData.angle += p.userData.speed * dt;
        p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
        p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
        p.position.y = p.userData.baseY + Math.sin(time * 2 + p.userData.angle) * 0.5;
        p.material.opacity = 0.3 + Math.sin(time * 3 + p.userData.angle) * 0.2;
      }

      // 速度线沿跑道旋转
      for (const l of this.sceneObjects.speedLines) {
        l.userData.angle += l.userData.speed * dt;
        l.position.x = Math.cos(l.userData.angle) * l.userData.radius;
        l.position.z = Math.sin(l.userData.angle) * l.userData.radius;
        l.rotation.y = l.userData.angle + Math.PI / 2;
      }

      // 顶部水晶脉动
      if (this.sceneObjects.timerTower) {
        const crystal = this.sceneObjects.timerTower.children[this.sceneObjects.timerTower.children.length - 1];
        if (crystal && crystal.userData.baseY !== undefined) {
          crystal.position.y = crystal.userData.baseY + Math.sin(time * 3) * 0.3;
          crystal.material.opacity = 0.6 + Math.sin(time * 2) * 0.3;
        }
      }
    },
  };

  // ============================================================
  // 5. 食神厨房 - 食神
  // ============================================================
  const TempleFoodMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      tileFloor: null,
      kitchen: null,
      stove: null,
      diningTable: null,
      potsAndPans: [],
      ingredientRacks: [],
      aromaParticles: [],
      foodDishes: [],
      lanterns: [],
      hangingFood: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 暖黄色地面
      so.ground = createGround(this.radius, 0xd4a05a, 0);
      scene.add(so.ground);

      // 中心方砖地板
      const floorGeom = new THREE.CircleGeometry(35, 64);
      floorGeom.rotateX(-Math.PI / 2);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8c080, roughness: 0.7 });
      so.tileFloor = new THREE.Mesh(floorGeom, floorMat);
      so.tileFloor.position.y = 0.02;
      so.tileFloor.receiveShadow = true;
      scene.add(so.tileFloor);

      // 地面瓷砖花纹
      for (let i = 0; i < 6; i++) {
        const ringGeom = new THREE.RingGeometry(5 + i * 5, 5.2 + i * 5, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xc08a40, roughness: 0.7 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.03 + i * 0.005;
        scene.add(ring);
      }

      // 食神厨房主建筑
      const kitchenGroup = new THREE.Group();

      // 厨房主体
      const kitchenBody = new THREE.Mesh(
        new THREE.BoxGeometry(28, 10, 22),
        new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
      );
      kitchenBody.position.y = 5;
      kitchenGroup.add(kitchenBody);

      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(18, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0xa0522d, roughness: 0.8 })
      );
      roof.position.y = 10 + 3;
      roof.rotation.y = Math.PI / 4;
      kitchenGroup.add(roof);

      // 金色烟囱
      const chimney = new THREE.Mesh(
        new THREE.BoxGeometry(2, 6, 2),
        new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.9 })
      );
      chimney.position.set(8, 13, 6);
      kitchenGroup.add(chimney);

      // 大窗户
      for (let i = 0; i < 3; i++) {
        const windowFrame = new THREE.Mesh(
          new THREE.BoxGeometry(4, 3, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 })
        );
        windowFrame.position.set(-8 + i * 8, 7, 11.1);
        kitchenGroup.add(windowFrame);

        const windowGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(3.4, 2.4),
          new THREE.MeshStandardMaterial({ color: 0xffffaa, roughness: 0.2, emissive: 0xffdd88, emissiveIntensity: 0.4 })
        );
        windowGlass.position.set(-8 + i * 8, 7, 11.3);
        kitchenGroup.add(windowGlass);
      }

      // 大门
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(5, 7, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.6 })
      );
      door.position.set(0, 3.5, 11.1);
      kitchenGroup.add(door);

      // 门上的食物装饰
      const foodEmblem = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.2, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 })
      );
      foodEmblem.position.set(0, 6, 11.5);
      foodEmblem.rotation.x = Math.PI / 2;
      kitchenGroup.add(foodEmblem);

      kitchenGroup.position.set(0, 0, -15);
      so.kitchen = kitchenGroup;
      scene.add(kitchenGroup);

      // 巨大灶台（中心）
      const stoveGroup = new THREE.Group();

      // 灶台基座
      const stoveBase = new THREE.Mesh(
        new THREE.BoxGeometry(12, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.8 })
      );
      stoveBase.position.y = 2;
      stoveGroup.add(stoveBase);

      // 灶台台面
      const stoveTop = new THREE.Mesh(
        new THREE.BoxGeometry(13, 0.5, 9),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.5 })
      );
      stoveTop.position.y = 4.25;
      stoveGroup.add(stoveTop);

      // 灶眼（4个）
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const burner = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 })
          );
          burner.position.set(-3 + i * 6, 4.5, -2 + j * 4);
          stoveGroup.add(burner);

          // 火焰
          const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.6, 1.2, 8),
            new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 })
          );
          flame.position.set(-3 + i * 6, 5.3, -2 + j * 4);
          flame.userData.baseY = 5.3;
          flame.userData.offset = i * 2 + j;
          so.aromaParticles = so.aromaParticles || [];
          stoveGroup.add(flame);
        }
      }

      // 大锅
      const bigPot = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2, 3, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.7 })
      );
      bigPot.position.set(0, 6, 0);
      stoveGroup.add(bigPot);

      // 锅盖
      const potLid = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 1, 16),
        new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.4, metalness: 0.8 })
      );
      potLid.position.set(0, 8, 0);
      stoveGroup.add(potLid);

      // 锅盖把手
      const lidHandle = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.7 })
      );
      lidHandle.position.set(0, 8.8, 0);
      stoveGroup.add(lidHandle);

      stoveGroup.position.set(0, 0, 0);
      so.stove = stoveGroup;
      scene.add(stoveGroup);

      // 餐桌
      const tableGroup = new THREE.Group();

      // 桌面
      const tableTop = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 0.5, 32),
        new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
      );
      tableTop.position.y = 3;
      tableGroup.add(tableTop);

      // 桌腿
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.35, 3, 8),
          new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 })
        );
        leg.position.set(Math.cos(angle) * 3.5, 1.5, Math.sin(angle) * 3.5);
        tableGroup.add(leg);
      }

      // 桌上的美食
      so.foodDishes = [];
      const foodTypes = [
        { color: 0xff4444, size: 0.8, name: 'meat' },
        { color: 0xffaa00, size: 0.6, name: 'soup' },
        { color: 0x88ff44, size: 0.5, name: 'veggie' },
        { color: 0xffdd00, size: 0.7, name: 'pastry' },
        { color: 0xff8844, size: 0.5, name: 'bun' },
        { color: 0xcc8833, size: 0.6, name: 'cake' },
      ];

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ft = foodTypes[i % foodTypes.length];

        const dish = new THREE.Group();

        // 盘子
        const plate = new THREE.Mesh(
          new THREE.CylinderGeometry(ft.size + 0.3, ft.size + 0.4, 0.2, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
        );
        dish.add(plate);

        // 食物
        const food = new THREE.Mesh(
          new THREE.SphereGeometry(ft.size, 12, 12),
          new THREE.MeshStandardMaterial({ color: ft.color, roughness: 0.5 })
        );
        food.scale.y = 0.6;
        food.position.y = 0.3;
        dish.add(food);

        // 食物上的高光点
        const highlight = new THREE.Mesh(
          new THREE.SphereGeometry(ft.size * 0.2, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        );
        highlight.position.set(-ft.size * 0.2, ft.size * 0.4, ft.size * 0.3);
        dish.add(highlight);

        dish.position.set(Math.cos(angle) * 3, 3.3, Math.sin(angle) * 3);
        so.foodDishes.push(dish);
        tableGroup.add(dish);
      }

      // 中央大菜
      const centerDish = new THREE.Group();
      const bigPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.6, 0.3, 20),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 })
      );
      centerDish.add(bigPlate);

      const bigFood = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.4, emissive: 0xff4400, emissiveIntensity: 0.1 })
      );
      bigFood.scale.y = 0.5;
      bigFood.position.y = 0.5;
      centerDish.add(bigFood);

      centerDish.position.set(0, 3.3, 0);
      so.foodDishes.push(centerDish);
      tableGroup.add(centerDish);

      tableGroup.position.set(0, 0, 15);
      so.diningTable = tableGroup;
      scene.add(tableGroup);

      // 锅碗瓢盆
      so.potsAndPans = [];
      const potTypes = [
        { size: 1, height: 1.2, color: 0x4a4a4a },
        { size: 0.8, height: 1, color: 0x5a5a5a },
        { size: 0.6, height: 0.8, color: 0x6a6a6a },
      ];

      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const pt = potTypes[i % potTypes.length];
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(pt.size, pt.size * 0.9, pt.height, 12),
          new THREE.MeshStandardMaterial({ color: pt.color, roughness: 0.4, metalness: 0.7 })
        );
        pot.position.set(Math.cos(angle) * 20, pt.height / 2 + 0.5, Math.sin(angle) * 20);
        so.potsAndPans.push(pot);
        scene.add(pot);

        // 把手
        const handle = new THREE.Mesh(
          new THREE.TorusGeometry(pt.size + 0.2, 0.1, 6, 12, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 })
        );
        handle.position.set(Math.cos(angle) * 20, pt.height / 2 + 0.5, Math.sin(angle) * 20);
        handle.rotation.x = Math.PI / 2;
        so.potsAndPans.push(handle);
        scene.add(handle);
      }

      // 食材架子
      so.ingredientRacks = [];
      for (let side = -1; side <= 1; side += 2) {
        for (let rack = 0; rack < 2; rack++) {
          const rackGroup = new THREE.Group();

          // 架子框架
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(6, 5, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
          );
          frame.position.y = 2.5;
          rackGroup.add(frame);

          // 三层隔板
          for (let shelf = 0; shelf < 3; shelf++) {
            const shelfBoard = new THREE.Mesh(
              new THREE.BoxGeometry(5.5, 0.2, 1.2),
              new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 })
            );
            shelfBoard.position.y = 0.8 + shelf * 1.8;
            rackGroup.add(shelfBoard);

            // 每层放食材
            for (let item = 0; item < 4; item++) {
              const veggie = new THREE.Mesh(
                new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8),
                new THREE.MeshStandardMaterial({
                  color: [0xff4444, 0x44ff44, 0xffaa00, 0x884400][item % 4],
                  roughness: 0.6
                })
              );
              veggie.position.set(-2 + item * 1.2, 1 + shelf * 1.8, 0);
              veggie.scale.y = 0.8;
              rackGroup.add(veggie);
            }
          }

          rackGroup.position.set(side * 30, 0, -5 + rack * 10);
          rackGroup.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          so.ingredientRacks.push(rackGroup);
          scene.add(rackGroup);
        }
      }

      // 美食香气粒子
      so.aromaParticles = [];
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.5 })
        );
        particle.position.set(
          Math.cos(angle) * dist,
          5 + Math.random() * 10,
          Math.sin(angle) * dist
        );
        particle.userData.speed = 0.3 + Math.random() * 0.4;
        particle.userData.baseY = particle.position.y;
        particle.userData.phase = Math.random() * Math.PI * 2;
        particle.userData.radius = dist;
        particle.userData.angle = angle;
        so.aromaParticles.push(particle);
        scene.add(particle);
      }

      // 灯笼
      so.lanterns = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const lanternGroup = new THREE.Group();

        // 灯笼主体
        const lantern = new THREE.Mesh(
          new THREE.SphereGeometry(1, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.5, emissive: 0xff2200, emissiveIntensity: 0.4 })
        );
        lantern.scale.y = 1.2;
        lanternGroup.add(lantern);

        // 顶部
        const topCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.6, 0.3, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 })
        );
        topCap.position.y = 1.3;
        lanternGroup.add(topCap);

        // 底部
        const bottomCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.5, 0.3, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 })
        );
        bottomCap.position.y = -1.3;
        lanternGroup.add(bottomCap);

        // 灯光
        const light = new THREE.PointLight(0xff6600, 0.8, 15);
        light.position.y = 0;
        lanternGroup.add(light);
        so.lanterns.push(light);

        // 悬挂绳
        const rope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
          new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 })
        );
        rope.position.y = 4;
        lanternGroup.add(rope);

        lanternGroup.position.set(Math.cos(angle) * 35, 8, Math.sin(angle) * 35);
        lanternGroup.userData.baseY = 8;
        lanternGroup.userData.angleOffset = i * 0.5;
        scene.add(lanternGroup);
      }

      // 悬挂的食物（火腿、腊肉等）
      so.hangingFood = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const foodItem = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.5, 1.5, 6, 12),
          new THREE.MeshStandardMaterial({
            color: [0x8b4513, 0xcd853f, 0xa0522d, 0xd2691e][i % 4],
            roughness: 0.6
          })
        );
        foodItem.position.set(Math.cos(angle) * 25, 7, Math.sin(angle) * 25);
        foodItem.rotation.z = Math.PI / 2;
        foodItem.userData.baseY = 7;
        foodItem.userData.angleOffset = i * 0.3;
        so.hangingFood.push(foodItem);
        scene.add(foodItem);

        // 绳子
        const string = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 2, 4),
          new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 })
        );
        string.position.set(Math.cos(angle) * 25, 9, Math.sin(angle) * 25);
        so.hangingFood.push(string);
        scene.add(string);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.tileFloor) so.tileFloor.visible = true;
      if (so.kitchen) so.kitchen.visible = true;
      if (so.stove) so.stove.visible = true;
      if (so.diningTable) so.diningTable.visible = true;
      for (const p of so.potsAndPans) if (p) p.visible = true;
      for (const r of so.ingredientRacks) if (r) r.visible = true;
      for (const p of so.aromaParticles) if (p) p.visible = true;
      for (const d of so.foodDishes) if (d) d.visible = true;
      for (const l of so.lanterns) if (l) l.visible = true;
      for (const h of so.hangingFood) if (h) h.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.tileFloor) so.tileFloor.visible = false;
      if (so.kitchen) so.kitchen.visible = false;
      if (so.stove) so.stove.visible = false;
      if (so.diningTable) so.diningTable.visible = false;
      for (const p of so.potsAndPans) if (p) p.visible = false;
      for (const r of so.ingredientRacks) if (r) r.visible = false;
      for (const p of so.aromaParticles) if (p) p.visible = false;
      for (const d of so.foodDishes) if (d) d.visible = false;
      for (const l of so.lanterns) if (l) l.visible = false;
      for (const h of so.hangingFood) if (h) h.visible = false;
    },

    _setEnv() {
      setEnvironment(0xd4a05a, 130, 0xe8c080, 0xffcc66, 0.5, 0xff8800, 0.6);
    },

    teleportTo() {
      doTeleport(this, 'temple_food', 'temple_food', '食神厨房', { x: 0, z: 50 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 香气粒子上升漂浮
      for (const p of this.sceneObjects.aromaParticles) {
        p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 1.5;
        p.position.x = Math.cos(p.userData.angle + time * 0.2) * p.userData.radius;
        p.position.z = Math.sin(p.userData.angle + time * 0.2) * p.userData.radius;
        p.material.opacity = 0.3 + Math.sin(time * p.userData.speed + p.userData.phase) * 0.2;
        p.scale.setScalar(0.8 + Math.sin(time * p.userData.speed * 0.5 + p.userData.phase) * 0.2);
      }

      // 灯笼轻微晃动
      for (const l of this.sceneObjects.lanterns) {
        if (l.isPointLight) {
          l.intensity = 0.7 + Math.sin(time * 2 + l.userData.angleOffset) * 0.2;
        }
      }

      // 悬挂食物轻微摆动
      for (const h of this.sceneObjects.hangingFood) {
        if (h.userData && h.userData.baseY !== undefined) {
          h.position.y = h.userData.baseY + Math.sin(time * 1.5 + h.userData.angleOffset) * 0.2;
          h.rotation.x = Math.sin(time * 1.2 + h.userData.angleOffset) * 0.1;
        }
      }
    },
  };

  // ============================================================
  // 2. 罗刹神殿 - 罗刹神
  // ============================================================
  const TempleRakshasaMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      obsidianFloor: null,
      temple: null,
      skullThrone: null,
      blackPillars: [],
      ghostFires: [],
      purpleFog: [],
      skullDecorations: [],
      boneRacks: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 暗黑紫色地面
      so.ground = createGround(this.radius, 0x1a0a1f, 0);
      scene.add(so.ground);

      // 中心黑曜石广场
      const plazaGeom = new THREE.CircleGeometry(28, 64);
      plazaGeom.rotateX(-Math.PI / 2);
      const plazaMat = new THREE.MeshStandardMaterial({ color: 0x2d0a2e, roughness: 0.8, metalness: 0.3 });
      so.obsidianFloor = new THREE.Mesh(plazaGeom, plazaMat);
      so.obsidianFloor.position.y = 0.02;
      so.obsidianFloor.receiveShadow = true;
      scene.add(so.obsidianFloor);

      // 地面符文（深色圆环）
      for (let i = 0; i < 4; i++) {
        const ringGeom = new THREE.RingGeometry(8 + i * 5, 8.3 + i * 5, 32);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x4a004a, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.03 + i * 0.005;
        scene.add(ring);
      }

      // 罗刹神殿主体
      const templeGroup = new THREE.Group();

      // 神殿基座
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(24, 2, 20),
        new THREE.MeshStandardMaterial({ color: 0x1a0010, roughness: 0.9 })
      );
      base.position.y = 1;
      templeGroup.add(base);

      // 神殿主体
      const templeBody = new THREE.Mesh(
        new THREE.BoxGeometry(20, 14, 16),
        new THREE.MeshStandardMaterial({ color: 0x220a1a, roughness: 0.8 })
      );
      templeBody.position.y = 2 + 7;
      templeGroup.add(templeBody);

      // 尖顶
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(12, 8, 4),
        new THREE.MeshStandardMaterial({ color: 0x0d000a, roughness: 0.9 })
      );
      spire.position.y = 2 + 14 + 4;
      spire.rotation.y = Math.PI / 4;
      templeGroup.add(spire);

      // 顶部骷髅装饰
      const topSkull = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x3a2020, roughness: 0.7 })
      );
      topSkull.position.y = 2 + 14 + 8 + 1;
      templeGroup.add(topSkull);

      // 骷髅眼窝发光
      const eye1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x9900ff })
      );
      eye1.position.set(-0.4, 2 + 14 + 8 + 1.3, 1.2);
      templeGroup.add(eye1);
      const eye2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x9900ff })
      );
      eye2.position.set(0.4, 2 + 14 + 8 + 1.3, 1.2);
      templeGroup.add(eye2);

      // 神殿大门（黑色）
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(5, 8, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x0a0005, roughness: 0.6, metalness: 0.5 })
      );
      door.position.set(0, 2 + 4, 8.1);
      templeGroup.add(door);

      // 门框上的骷髅装饰
      for (let i = 0; i < 3; i++) {
        const skull = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x2a1515, roughness: 0.7 })
        );
        skull.position.set(-2 + i * 2, 2 + 10.5, 8.1);
        templeGroup.add(skull);
      }

      templeGroup.position.set(0, 0, -10);
      so.temple = templeGroup;
      scene.add(templeGroup);

      // 骷髅王座（中心）
      const throneGroup = new THREE.Group();

      // 基座
      const throneBase = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1.5, 5),
        new THREE.MeshStandardMaterial({ color: 0x1a0010, roughness: 0.8 })
      );
      throneBase.position.y = 0.75;
      throneGroup.add(throneBase);

      // 座位
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(4, 1, 3),
        new THREE.MeshStandardMaterial({ color: 0x2a0a20, roughness: 0.7 })
      );
      seat.position.y = 1.5 + 0.5;
      throneGroup.add(seat);

      // 靠背
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 5, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x220818, roughness: 0.7 })
      );
      back.position.set(0, 1.5 + 3.5, -1.1);
      throneGroup.add(back);

      // 靠背上的大骷髅
      const bigSkull = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x3a1a1a, roughness: 0.6 })
      );
      bigSkull.position.set(0, 1.5 + 5.5, -0.7);
      throneGroup.add(bigSkull);

      // 骷髅眼
      const skEye1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x9900ff })
      );
      skEye1.position.set(-0.4, 1.5 + 5.8, 0.6);
      throneGroup.add(skEye1);
      const skEye2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x9900ff })
      );
      skEye2.position.set(0.4, 1.5 + 5.8, 0.6);
      throneGroup.add(skEye2);

      // 扶手骷髅
      for (let side = -1; side <= 1; side += 2) {
        const armSkull = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x332020, roughness: 0.7 })
        );
        armSkull.position.set(side * 2.2, 1.5 + 1.5, 0.5);
        throneGroup.add(armSkull);
      }

      throneGroup.position.set(0, 0, 0);
      so.skullThrone = throneGroup;
      scene.add(throneGroup);

      // 黑色石柱
      so.blackPillars = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const pillar = new THREE.Group();

        // 柱身
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.8, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0x120015, roughness: 0.8 })
        );
        shaft.position.y = 5;
        pillar.add(shaft);

        // 柱顶骷髅
        const pillarSkull = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x2a1515, roughness: 0.7 })
        );
        pillarSkull.position.y = 10.5;
        pillar.add(pillarSkull);

        // 骷髅眼发光
        const pEye1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x8800cc })
        );
        pEye1.position.set(-0.3, 10.7, 1);
        pillar.add(pEye1);
        const pEye2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x8800cc })
        );
        pEye2.position.set(0.3, 10.7, 1);
        pillar.add(pEye2);

        pillar.position.set(Math.cos(angle) * 32, 0, Math.sin(angle) * 32);
        so.blackPillars.push(pillar);
        scene.add(pillar);
      }

      // 幽冥鬼火
      so.ghostFires = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const fireLight = new THREE.PointLight(0x9900ff, 1.0, 15);
        fireLight.position.set(Math.cos(angle) * 22, 3, Math.sin(angle) * 22);
        so.ghostFires.push(fireLight);
        scene.add(fireLight);

        // 火焰外观
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2, 8),
          new THREE.MeshBasicMaterial({ color: 0x9900ff, transparent: true, opacity: 0.7 })
        );
        flame.position.set(Math.cos(angle) * 22, 2, Math.sin(angle) * 22);
        flame.userData.baseY = 2;
        so.ghostFires.push(flame);
        scene.add(flame);
      }

      // 紫色雾气粒子
      so.purpleFog = createParticles(80, 0x660099, 1.5, 12, 0.4, 60);
      for (const p of so.purpleFog) {
        p.material.opacity = 0.35;
        scene.add(p);
      }

      // 散落的骷髅头装饰
      so.skullDecorations = [];
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 50;
        const skull = new THREE.Mesh(
          new THREE.SphereGeometry(0.4 + Math.random() * 0.4, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x2a1818, roughness: 0.8 })
        );
        skull.position.set(Math.cos(angle) * dist, 0.3, Math.sin(angle) * dist);
        skull.rotation.y = Math.random() * Math.PI * 2;
        skull.rotation.z = (Math.random() - 0.5) * 0.5;
        so.skullDecorations.push(skull);
        scene.add(skull);
      }

      // 白骨架子
      so.boneRacks = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const rack = new THREE.Group();

        // 架子
        const rackPole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 5, 8),
          new THREE.MeshStandardMaterial({ color: 0x1a0a10, roughness: 0.8 })
        );
        rackPole.position.y = 2.5;
        rack.add(rackPole);

        // 上面挂的骨头
        for (let j = 0; j < 4; j++) {
          const bone = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.15, 1, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x3a2020, roughness: 0.7 })
          );
          bone.position.set((j - 1.5) * 0.6, 3.5, 0);
          bone.rotation.z = Math.PI / 2;
          rack.add(bone);
        }

        rack.position.set(Math.cos(angle) * 38, 0, Math.sin(angle) * 38);
        rack.rotation.y = angle + Math.PI / 2;
        so.boneRacks.push(rack);
        scene.add(rack);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.obsidianFloor) so.obsidianFloor.visible = true;
      if (so.temple) so.temple.visible = true;
      if (so.skullThrone) so.skullThrone.visible = true;
      for (const p of so.blackPillars) if (p) p.visible = true;
      for (const f of so.ghostFires) if (f) f.visible = true;
      for (const p of so.purpleFog) if (p) p.visible = true;
      for (const s of so.skullDecorations) if (s) s.visible = true;
      for (const b of so.boneRacks) if (b) b.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.obsidianFloor) so.obsidianFloor.visible = false;
      if (so.temple) so.temple.visible = false;
      if (so.skullThrone) so.skullThrone.visible = false;
      for (const p of so.blackPillars) if (p) p.visible = false;
      for (const f of so.ghostFires) if (f) f.visible = false;
      for (const p of so.purpleFog) if (p) p.visible = false;
      for (const s of so.skullDecorations) if (s) s.visible = false;
      for (const b of so.boneRacks) if (b) b.visible = false;
    },

    _setEnv() {
      setEnvironment(0x1a0020, 100, 0x0d0015, 0x2a0030, 0.2, 0x440066, 0.3);
    },

    teleportTo() {
      doTeleport(this, 'temple_rakshasa', 'temple_rakshasa', '罗刹神殿', { x: 0, z: 45 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.purpleFog, dt, time);

      // 鬼火闪烁
      for (let i = 0; i < this.sceneObjects.ghostFires.length; i++) {
        const f = this.sceneObjects.ghostFires[i];
        if (f.isPointLight) {
          f.intensity = 0.8 + Math.sin(time * 3 + i) * 0.4;
        } else if (f.userData && f.userData.baseY !== undefined) {
          f.position.y = f.userData.baseY + Math.sin(time * 4 + i) * 0.3;
          f.scale.y = 1 + Math.sin(time * 3 + i) * 0.2;
        }
      }
    },
  };

  // ============================================================
  // 3. 战神殿 - 战神
  // ============================================================
  const TempleWarMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      arena: null,
      warHall: null,
      weaponRacks: [],
      warDrums: [],
      warBanners: [],
      warParticles: [],
      braziers: [],
      statues: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 红色石砖地面
      so.ground = createGround(this.radius, 0x5a1010, 0);
      scene.add(so.ground);

      // 中心战斗竞技场
      const arenaGeom = new THREE.CircleGeometry(25, 64);
      arenaGeom.rotateX(-Math.PI / 2);
      const arenaMat = new THREE.MeshStandardMaterial({ color: 0x7a2015, roughness: 0.8 });
      so.arena = new THREE.Mesh(arenaGeom, arenaMat);
      so.arena.position.y = 0.02;
      so.arena.receiveShadow = true;
      scene.add(so.arena);

      // 竞技场边缘装饰环
      const ringGeom = new THREE.RingGeometry(24, 25, 64);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.6, metalness: 0.5 });
      const arenaRing = new THREE.Mesh(ringGeom, ringMat);
      arenaRing.position.y = 0.03;
      scene.add(arenaRing);

      // 战神殿堂
      const hallGroup = new THREE.Group();

      // 基座
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(28, 3, 22),
        new THREE.MeshStandardMaterial({ color: 0x4a1010, roughness: 0.8 })
      );
      base.position.y = 1.5;
      hallGroup.add(base);

      // 阶梯
      for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(22 - i * 3, 1, 18 - i * 2.5),
          new THREE.MeshStandardMaterial({ color: 0x5a1515, roughness: 0.7 })
        );
        step.position.y = 3 + i * 1 + 0.5;
        hallGroup.add(step);
      }

      // 殿堂主体
      const hallBody = new THREE.Mesh(
        new THREE.BoxGeometry(22, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x6a1a10, roughness: 0.7 })
      );
      hallBody.position.y = 6 + 8;
      hallGroup.add(hallBody);

      // 屋顶
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(14, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0x3a0808, roughness: 0.8 })
      );
      roof.position.y = 6 + 16 + 3;
      roof.rotation.y = Math.PI / 4;
      hallGroup.add(roof);

      // 顶部战旗
      const flagPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a0505, roughness: 0.6 })
      );
      flagPole.position.y = 6 + 16 + 6 + 2.5;
      hallGroup.add(flagPole);

      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2),
        new THREE.MeshStandardMaterial({ color: 0xff2200, side: THREE.DoubleSide, roughness: 0.8 })
      );
      flag.position.set(1.5, 6 + 16 + 6 + 4, 0);
      flag.userData.baseX = 1.5;
      so.warBanners.push(flag);
      hallGroup.add(flag);

      // 大门
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(6, 9, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x3a1008, roughness: 0.6, metalness: 0.3 })
      );
      door.position.set(0, 6 + 4.5, 8.1);
      hallGroup.add(door);

      // 门上的铆钉
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          const rivet = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.5, metalness: 0.7 })
          );
          rivet.position.set(-1.5 + i * 3, 6 + 2 + j * 2.5, 8.5);
          hallGroup.add(rivet);
        }
      }

      hallGroup.position.set(0, 0, -12);
      so.warHall = hallGroup;
      scene.add(hallGroup);

      // 武器架
      so.weaponRacks = [];
      const weaponTypes = [
        { name: 'sword', len: 2, type: 'blade' },
        { name: 'spear', len: 3.5, type: 'pole' },
        { name: 'axe', len: 1.5, type: 'axe' },
        { name: 'halberd', len: 3, type: 'pole' },
      ];

      for (let side = -1; side <= 1; side += 2) {
        for (let rack = 0; rack < 3; rack++) {
          const rackGroup = new THREE.Group();

          // 架子
          const rackFrame = new THREE.Mesh(
            new THREE.BoxGeometry(5, 4, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x4a2010, roughness: 0.8 })
          );
          rackFrame.position.y = 2;
          rackGroup.add(rackFrame);

          // 挂着的武器
          for (let w = 0; w < 4; w++) {
            const weapon = new THREE.Group();
            const wt = weaponTypes[w % weaponTypes.length];

            // 武器杆/柄
            const handle = new THREE.Mesh(
              new THREE.CylinderGeometry(0.08, 0.08, wt.len, 8),
              new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
            );
            handle.position.y = wt.len / 2;
            weapon.add(handle);

            // 武器头
            if (wt.type === 'blade') {
              const blade = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 1.2, 4),
                new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 })
              );
              blade.position.y = wt.len + 0.6;
              blade.rotation.z = Math.PI;
              weapon.add(blade);
            } else if (wt.type === 'pole') {
              const tip = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, 0.8, 8),
                new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.9 })
              );
              tip.position.y = wt.len + 0.4;
              weapon.add(tip);
            } else if (wt.type === 'axe') {
              const axeHead = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1, 0.2),
                new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.4, metalness: 0.8 })
              );
              axeHead.position.y = wt.len + 0.3;
              weapon.add(axeHead);
            }

            weapon.position.set(-1.8 + w * 1.2, 0.5, 0.4);
            weapon.rotation.x = 0.2;
            rackGroup.add(weapon);
          }

          rackGroup.position.set(side * 30, 0, -10 + rack * 10);
          rackGroup.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          so.weaponRacks.push(rackGroup);
          scene.add(rackGroup);
        }
      }

      // 战鼓
      so.warDrums = [];
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const drumGroup = new THREE.Group();

        // 鼓身
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2, 1.5, 16),
          new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.7 })
        );
        drum.position.y = 2;
        drumGroup.add(drum);

        // 鼓面
        const drumTop = new THREE.Mesh(
          new THREE.CircleGeometry(2, 16),
          new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.8 })
        );
        drumTop.rotation.x = -Math.PI / 2;
        drumTop.position.y = 2 + 0.76;
        drumGroup.add(drumTop);

        // 鼓架
        const stand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0x4a1a0a, roughness: 0.8 })
        );
        stand.position.y = 1;
        drumGroup.add(stand);

        drumGroup.position.set(Math.cos(angle) * 18, 0, Math.sin(angle) * 18);
        so.warDrums.push(drumGroup);
        scene.add(drumGroup);
      }

      // 战旗（周围一圈）
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const bannerGroup = new THREE.Group();

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 10, 6),
          new THREE.MeshStandardMaterial({ color: 0x3a1010, roughness: 0.7 })
        );
        pole.position.y = 5;
        bannerGroup.add(pole);

        const banner = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 2.5),
          new THREE.MeshStandardMaterial({ color: 0xcc0000, side: THREE.DoubleSide, roughness: 0.8 })
        );
        banner.position.set(2, 7.5, 0);
        banner.userData.baseX = 2;
        banner.userData.angleOffset = i * 0.5;
        so.warBanners.push(banner);
        bannerGroup.add(banner);

        // 旗顶装饰
        const top = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.8, 6),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        top.position.y = 10.4;
        bannerGroup.add(top);

        bannerGroup.position.set(Math.cos(angle) * 40, 0, Math.sin(angle) * 40);
        bannerGroup.rotation.y = angle + Math.PI / 2;
        scene.add(bannerGroup);
      }

      // 红色战意粒子
      so.warParticles = createParticles(90, 0xff3300, 0.7, 18, 0.9, 55);
      for (const p of so.warParticles) {
        p.material.opacity = 0.6;
        scene.add(p);
      }

      // 火盆
      so.braziers = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const brazierGroup = new THREE.Group();

        // 盆
        const bowl = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 0.8, 0.8, 16),
          new THREE.MeshStandardMaterial({ color: 0x2a0a00, roughness: 0.6, metalness: 0.5 })
        );
        bowl.position.y = 2;
        brazierGroup.add(bowl);

        // 柱
        const stand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0x1a0500, roughness: 0.7 })
        );
        stand.position.y = 1;
        brazierGroup.add(stand);

        // 火光
        const fireLight = new THREE.PointLight(0xff4400, 1.2, 15);
        fireLight.position.y = 3;
        so.braziers.push(fireLight);
        brazierGroup.add(fireLight);

        brazierGroup.position.set(Math.cos(angle) * 28, 0, Math.sin(angle) * 28);
        scene.add(brazierGroup);
      }

      // 战士雕像
      so.statues = [];
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const statueGroup = new THREE.Group();

        // 基座
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(3, 2, 3),
          new THREE.MeshStandardMaterial({ color: 0x5a2010, roughness: 0.7 })
        );
        base.position.y = 1;
        statueGroup.add(base);

        // 身体
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 1, 4, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6, metalness: 0.4 })
        );
        body.position.y = 2 + 2;
        statueGroup.add(body);

        // 头
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6, metalness: 0.4 })
        );
        head.position.y = 2 + 4 + 0.5;
        statueGroup.add(head);

        // 头盔
        const helmet = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 0.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.4, metalness: 0.8 })
        );
        helmet.position.y = 2 + 4 + 1.2;
        statueGroup.add(helmet);

        // 武器（剑）
        const sword = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 3, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 })
        );
        sword.position.set(1.2, 2 + 3, 0);
        sword.rotation.z = -0.3;
        statueGroup.add(sword);

        statueGroup.position.set(Math.cos(angle) * 35, 0, Math.sin(angle) * 35);
        statueGroup.rotation.y = angle + Math.PI;
        so.statues.push(statueGroup);
        scene.add(statueGroup);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.arena) so.arena.visible = true;
      if (so.warHall) so.warHall.visible = true;
      for (const w of so.weaponRacks) if (w) w.visible = true;
      for (const d of so.warDrums) if (d) d.visible = true;
      for (const b of so.warBanners) if (b) b.visible = true;
      for (const p of so.warParticles) if (p) p.visible = true;
      for (const b of so.braziers) if (b) b.visible = true;
      for (const s of so.statues) if (s) s.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.arena) so.arena.visible = false;
      if (so.warHall) so.warHall.visible = false;
      for (const w of so.weaponRacks) if (w) w.visible = false;
      for (const d of so.warDrums) if (d) d.visible = false;
      for (const b of so.warBanners) if (b) b.visible = false;
      for (const p of so.warParticles) if (p) p.visible = false;
      for (const b of so.braziers) if (b) b.visible = false;
      for (const s of so.statues) if (s) s.visible = false;
    },

    _setEnv() {
      setEnvironment(0x4a1010, 130, 0x5a1510, 0x8b2500, 0.3, 0xff4400, 0.5);
    },

    teleportTo() {
      doTeleport(this, 'temple_war', 'temple_war', '战神殿', { x: 0, z: 45 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.warParticles, dt, time);

      // 战旗飘动
      for (let i = 0; i < this.sceneObjects.warBanners.length; i++) {
        const b = this.sceneObjects.warBanners[i];
        if (!b.userData) continue;
        const offset = b.userData.angleOffset || 0;
        b.position.x = b.userData.baseX + Math.sin(time * 2 + offset) * 0.5;
        b.rotation.z = Math.sin(time * 1.5 + offset) * 0.1;
      }

      // 火盆火光闪烁
      for (let i = 0; i < this.sceneObjects.braziers.length; i++) {
        const b = this.sceneObjects.braziers[i];
        if (b.isPointLight) {
          b.intensity = 1.0 + Math.sin(time * 4 + i) * 0.4;
        }
      }
    },
  };

  // ============================================================
  // 6. 凤凰巢 - 凤凰之神
  // ============================================================
  const TemplePhoenixMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      lavaGround: null,
      volcano: null,
      phoenixStatue: null,
      nest: null,
      fireRings: [],
      flameParticles: [],
      lavaPools: [],
      fireColumns: [],
      ashParticles: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 熔岩地面（红色火山岩）
      so.ground = createGround(this.radius, 0x4a1005, 0);
      scene.add(so.ground);

      // 中心熔岩区域
      const lavaGeom = new THREE.CircleGeometry(30, 64);
      lavaGeom.rotateX(-Math.PI / 2);
      const lavaMat = new THREE.MeshStandardMaterial({
        color: 0xff3300,
        roughness: 0.3,
        emissive: 0xff2200,
        emissiveIntensity: 0.6,
      });
      so.lavaGround = new THREE.Mesh(lavaGeom, lavaMat);
      so.lavaGround.position.y = 0.05;
      so.lavaGround.receiveShadow = true;
      scene.add(so.lavaGround);

      // 火山口边缘（环形岩石）
      const craterGeom = new THREE.RingGeometry(28, 32, 64);
      craterGeom.rotateX(-Math.PI / 2);
      const craterMat = new THREE.MeshStandardMaterial({ color: 0x3a0800, roughness: 0.9 });
      const crater = new THREE.Mesh(craterGeom, craterMat);
      crater.position.y = 0.1;
      crater.receiveShadow = true;
      scene.add(crater);

      // 凤凰巢穴（中心）
      const nestGroup = new THREE.Group();

      // 巢基座（树枝堆成）
      for (let i = 0; i < 15; i++) {
        const angle = (i / 15) * Math.PI * 2;
        const twig = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 6 + Math.random() * 4, 6),
          new THREE.MeshStandardMaterial({ color: 0x2a1000, roughness: 0.9 })
        );
        twig.position.set(
          Math.cos(angle) * (3 + Math.random() * 3),
          0.5 + Math.random() * 1,
          Math.sin(angle) * (3 + Math.random() * 3)
        );
        twig.rotation.z = (Math.random() - 0.5) * 0.8;
        twig.rotation.y = Math.random() * Math.PI;
        nestGroup.add(twig);
      }

      // 中心金蛋
      const egg = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.3,
          metalness: 0.7,
          emissive: 0xff8800,
          emissiveIntensity: 0.3,
        })
      );
      egg.scale.y = 1.3;
      egg.position.y = 2;
      nestGroup.add(egg);

      // 蛋上的火焰纹
      for (let i = 0; i < 6; i++) {
        const flameMark = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.8, 6),
          new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.7 })
        );
        const angle = (i / 6) * Math.PI * 2;
        flameMark.position.set(
          Math.cos(angle) * 1.2,
          2.2,
          Math.sin(angle) * 1.2
        );
        nestGroup.add(flameMark);
      }

      nestGroup.position.set(0, 0, 0);
      so.nest = nestGroup;
      scene.add(nestGroup);

      // 凤凰雕像
      const phoenixGroup = new THREE.Group();

      // 基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 6, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 })
      );
      base.position.y = 1;
      phoenixGroup.add(base);

      // 凤凰身体
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(2, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xff4400,
          roughness: 0.4,
          metalness: 0.5,
          emissive: 0xff2200,
          emissiveIntensity: 0.3,
        })
      );
      body.scale.y = 1.2;
      body.position.y = 2 + 3;
      phoenixGroup.add(body);

      // 凤凰头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 12),
        new THREE.MeshStandardMaterial({
          color: 0xff6600,
          roughness: 0.4,
          metalness: 0.5,
          emissive: 0xff3300,
          emissiveIntensity: 0.4,
        })
      );
      head.position.set(0, 2 + 5.5, 1.5);
      phoenixGroup.add(head);

      // 喙
      const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1, 6),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 })
      );
      beak.position.set(0, 2 + 5.5, 2.5);
      beak.rotation.x = -Math.PI / 2;
      phoenixGroup.add(beak);

      // 眼睛（发光）
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
      );
      eye.position.set(0.5, 2 + 5.7, 2);
      phoenixGroup.add(eye);
      const eye2 = eye.clone();
      eye2.position.x = -0.5;
      phoenixGroup.add(eye2);

      // 尾羽
      for (let i = 0; i < 7; i++) {
        const feather = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 4, 6),
          new THREE.MeshStandardMaterial({
            color: [0xff0000, 0xff4400, 0xff8800, 0xffcc00, 0xff8800, 0xff4400, 0xff0000][i],
            roughness: 0.4,
            metalness: 0.3,
            emissive: 0xff2200,
            emissiveIntensity: 0.2,
          })
        );
        feather.position.set(
          (i - 3) * 0.6,
          2 + 3,
          -3
        );
        feather.rotation.x = Math.PI / 3;
        feather.rotation.z = (i - 3) * 0.15;
        phoenixGroup.add(feather);
      }

      // 翅膀
      for (let side = -1; side <= 1; side += 2) {
        const wing = new THREE.Group();
        for (let f = 0; f < 5; f++) {
          const wingFeather = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 3 - f * 0.4, 6),
            new THREE.MeshStandardMaterial({
              color: f < 2 ? 0xffd700 : 0xff4400,
              roughness: 0.4,
              metalness: 0.4,
              emissive: 0xff2200,
              emissiveIntensity: 0.2,
            })
          );
          wingFeather.position.set(side * (1 + f * 0.8), 0.5 - f * 0.2, -0.5 + f * 0.3);
          wingFeather.rotation.z = side * (0.3 + f * 0.1);
          wing.add(wingFeather);
        }
        wing.position.y = 2 + 3.5;
        phoenixGroup.add(wing);
      }

      // 凤冠
      const crest = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 1, 6),
        new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.4, emissive: 0xff0000, emissiveIntensity: 0.4 })
      );
      crest.position.set(0, 2 + 6.5, 1);
      crest.rotation.x = 0.3;
      phoenixGroup.add(crest);

      phoenixGroup.position.set(0, 0, -12);
      so.phoenixStatue = phoenixGroup;
      scene.add(phoenixGroup);

      // 环绕的火焰环
      so.fireRings = [];
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = 15 + ring * 10;
        const ringGroup = new THREE.Group();

        for (let i = 0; i < 20 + ring * 5; i++) {
          const angle = (i / (20 + ring * 5)) * Math.PI * 2;
          const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.8 + ring * 0.2, 2 + ring * 0.5, 8),
            new THREE.MeshBasicMaterial({
              color: [0xff0000, 0xff4400, 0xff8800][ring],
              transparent: true,
              opacity: 0.8,
            })
          );
          flame.position.set(
            Math.cos(angle) * ringRadius,
            1 + Math.random() * 0.5,
            Math.sin(angle) * ringRadius
          );
          flame.userData.baseY = flame.position.y;
          flame.userData.phase = Math.random() * Math.PI * 2;
          ringGroup.add(flame);
        }

        ringGroup.userData.speed = 0.3 + ring * 0.1;
        ringGroup.userData.direction = ring % 2 === 0 ? 1 : -1;
        so.fireRings.push(ringGroup);
        scene.add(ringGroup);
      }

      // 涅槃之火粒子
      so.flameParticles = [];
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 40;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 6, 6),
          new THREE.MeshBasicMaterial({
            color: [0xff0000, 0xff4400, 0xffaa00, 0xffff00][Math.floor(Math.random() * 4)],
            transparent: true,
            opacity: 0.7,
          })
        );
        particle.position.set(
          Math.cos(angle) * dist,
          Math.random() * 20,
          Math.sin(angle) * dist
        );
        particle.userData.speed = 0.5 + Math.random() * 0.8;
        particle.userData.baseY = particle.position.y;
        particle.userData.phase = Math.random() * Math.PI * 2;
        particle.userData.riseSpeed = 1 + Math.random() * 2;
        so.flameParticles.push(particle);
        scene.add(particle);
      }

      // 火柱
      so.fireColumns = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const columnGroup = new THREE.Group();

        // 柱身
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 2, 15, 12, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
          })
        );
        column.position.y = 7.5;
        column.userData.baseOpacity = 0.5;
        columnGroup.add(column);

        // 内焰
        const innerFlame = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 1.2, 12, 12, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          })
        );
        innerFlame.position.y = 6;
        innerFlame.userData.baseOpacity = 0.6;
        columnGroup.add(innerFlame);

        // 火光
        const fireLight = new THREE.PointLight(0xff4400, 1.5, 25);
        fireLight.position.y = 5;
        columnGroup.add(fireLight);

        columnGroup.position.set(Math.cos(angle) * 35, 0, Math.sin(angle) * 35);
        so.fireColumns.push(columnGroup);
        scene.add(columnGroup);
      }

      // 熔岩池（周围散布）
      so.lavaPools = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const dist = 55 + Math.random() * 20;
        const pool = new THREE.Mesh(
          new THREE.CircleGeometry(3 + Math.random() * 3, 16),
          new THREE.MeshStandardMaterial({
            color: 0xff2200,
            roughness: 0.2,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
          })
        );
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(Math.cos(angle) * dist, 0.02, Math.sin(angle) * dist);
        so.lavaPools.push(pool);
        scene.add(pool);
      }

      // 灰烬粒子
      so.ashParticles = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 60;
        const ash = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 4, 4),
          new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5 })
        );
        ash.position.set(
          Math.cos(angle) * dist,
          5 + Math.random() * 25,
          Math.sin(angle) * dist
        );
        ash.userData.baseY = ash.position.y;
        ash.userData.phase = Math.random() * Math.PI * 2;
        ash.userData.speed = 0.3 + Math.random() * 0.3;
        ash.userData.angle = angle;
        ash.userData.radius = dist;
        so.ashParticles.push(ash);
        scene.add(ash);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.lavaGround) so.lavaGround.visible = true;
      if (so.phoenixStatue) so.phoenixStatue.visible = true;
      if (so.nest) so.nest.visible = true;
      for (const r of so.fireRings) if (r) r.visible = true;
      for (const p of so.flameParticles) if (p) p.visible = true;
      for (const p of so.lavaPools) if (p) p.visible = true;
      for (const c of so.fireColumns) if (c) c.visible = true;
      for (const a of so.ashParticles) if (a) a.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.lavaGround) so.lavaGround.visible = false;
      if (so.phoenixStatue) so.phoenixStatue.visible = false;
      if (so.nest) so.nest.visible = false;
      for (const r of so.fireRings) if (r) r.visible = false;
      for (const p of so.flameParticles) if (p) p.visible = false;
      for (const p of so.lavaPools) if (p) p.visible = false;
      for (const c of so.fireColumns) if (c) c.visible = false;
      for (const a of so.ashParticles) if (a) a.visible = false;
    },

    _setEnv() {
      setEnvironment(0x4a1005, 120, 0x5a1508, 0xff4400, 0.2, 0xff2200, 0.4);
    },

    teleportTo() {
      doTeleport(this, 'temple_phoenix', 'temple_phoenix', '凤凰巢', { x: 0, z: 50 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 火焰环旋转
      for (const ring of this.sceneObjects.fireRings) {
        ring.rotation.y += ring.userData.speed * ring.userData.direction * dt;
        for (const flame of ring.children) {
          if (flame.userData && flame.userData.baseY !== undefined) {
            flame.position.y = flame.userData.baseY + Math.sin(time * 3 + flame.userData.phase) * 0.5;
            flame.scale.y = 1 + Math.sin(time * 4 + flame.userData.phase) * 0.2;
          }
        }
      }

      // 涅槃之火粒子
      for (const p of this.sceneObjects.flameParticles) {
        p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 2;
        p.material.opacity = 0.4 + Math.sin(time * p.userData.speed * 0.8 + p.userData.phase) * 0.3;
        p.scale.setScalar(0.8 + Math.sin(time * p.userData.speed + p.userData.phase) * 0.3);
      }

      // 火柱脉动
      for (const col of this.sceneObjects.fireColumns) {
        for (const child of col.children) {
          if (child.userData && child.userData.baseOpacity !== undefined) {
            child.material.opacity = child.userData.baseOpacity + Math.sin(time * 3 + col.position.x) * 0.15;
          }
          if (child.isPointLight) {
            child.intensity = 1.2 + Math.sin(time * 4 + col.position.x) * 0.5;
          }
        }
      }

      // 灰烬飘动
      for (const a of this.sceneObjects.ashParticles) {
        a.position.y = a.userData.baseY + Math.sin(time * a.userData.speed + a.userData.phase) * 3;
        a.position.x = Math.cos(a.userData.angle + time * 0.1) * a.userData.radius;
        a.position.z = Math.sin(a.userData.angle + time * 0.1) * a.userData.radius;
        a.material.opacity = 0.3 + Math.sin(time * a.userData.speed + a.userData.phase) * 0.2;
      }

      // 熔岩地面脉动
      if (this.sceneObjects.lavaGround) {
        this.sceneObjects.lavaGround.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;
      }
    },
  };

  // ============================================================
  // 7. 星斗核心秘境 - 兽神
  // ============================================================
  const StarCoreMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,
    groundY: 0,

    sceneObjects: {
      ground: null,
      mossFloor: null,
      lifeTree: null,
      beastStatue: null,
      ancientAltar: null,
      forestAnimals: [],
      greenLightParticles: [],
      spiritFlowers: [],
      ancientTrees: [],
      glowingMushrooms: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 深绿色森林地面
      so.ground = createGround(this.radius, 0x1a3a1a, 0);
      scene.add(so.ground);

      // 中心苔藓地面
      const mossGeom = new THREE.CircleGeometry(35, 64);
      mossGeom.rotateX(-Math.PI / 2);
      const mossMat = new THREE.MeshStandardMaterial({ color: 0x2a5a2a, roughness: 0.9 });
      so.mossFloor = new THREE.Mesh(mossGeom, mossMat);
      so.mossFloor.position.y = 0.02;
      so.mossFloor.receiveShadow = true;
      scene.add(so.mossFloor);

      // 地面魔法阵
      for (let i = 0; i < 5; i++) {
        const ringGeom = new THREE.RingGeometry(8 + i * 4, 8.2 + i * 4, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.03 + i * 0.005;
        scene.add(ring);
      }

      // 生命之树（中心巨型古树）
      const treeGroup = new THREE.Group();

      // 粗壮树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 6, 20, 16),
        new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.9 })
      );
      trunk.position.y = 10;
      treeGroup.add(trunk);

      // 树干纹理（用深色斑块模拟）
      for (let i = 0; i < 20; i++) {
        const bark = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 2, 0.1),
          new THREE.MeshStandardMaterial({ color: 0x3a1a08, roughness: 0.9 })
        );
        const angle = Math.random() * Math.PI * 2;
        const h = 2 + Math.random() * 16;
        bark.position.set(Math.cos(angle) * 4.5, h, Math.sin(angle) * 4.5);
        bark.rotation.y = angle;
        treeGroup.add(bark);
      }

      // 巨大树冠（多层）
      for (let layer = 0; layer < 4; layer++) {
        const layerRadius = 12 - layer * 2;
        const layerY = 18 + layer * 5;
        const leafCount = 8 + layer * 2;

        for (let i = 0; i < leafCount; i++) {
          const angle = (i / leafCount) * Math.PI * 2 + layer * 0.3;
          const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(3 + Math.random() * 2, 8, 8),
            new THREE.MeshStandardMaterial({
              color: [0x1a6a1a, 0x2a8a2a, 0x3aaa3a, 0x44cc44][layer],
              roughness: 0.8,
            })
          );
          leaf.position.set(
            Math.cos(angle) * layerRadius * 0.7,
            layerY + Math.random() * 3,
            Math.sin(angle) * layerRadius * 0.7
          );
          leaf.scale.set(1 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.5);
          treeGroup.add(leaf);
        }
      }

      // 树上发光的果实
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 10;
        const fruit = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0x88ff88,
            emissive: 0x44ff44,
            emissiveIntensity: 0.8,
          })
        );
        fruit.position.set(
          Math.cos(angle) * dist,
          20 + Math.random() * 15,
          Math.sin(angle) * dist
        );
        treeGroup.add(fruit);
      }

      // 树根
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const root = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 1.5, 10, 8),
          new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9 })
        );
        root.position.set(
          Math.cos(angle) * 5,
          1,
          Math.sin(angle) * 5
        );
        root.rotation.z = Math.PI / 2 - 0.3;
        root.rotation.y = angle;
        treeGroup.add(root);
      }

      so.lifeTree = treeGroup;
      scene.add(treeGroup);

      // 兽神雕像（泰坦巨猿）
      const beastGroup = new THREE.Group();

      // 基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(4, 5, 2, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.8 })
      );
      base.position.y = 1;
      beastGroup.add(base);

      // 巨猿身体
      const apeBody = new THREE.Mesh(
        new THREE.SphereGeometry(3, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a2a1a, roughness: 0.8 })
      );
      apeBody.scale.y = 1.3;
      apeBody.position.y = 2 + 4;
      beastGroup.add(apeBody);

      // 胸部
      const chest = new THREE.Mesh(
        new THREE.SphereGeometry(2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x4a4a3a, roughness: 0.7 })
      );
      chest.scale.y = 0.8;
      chest.position.set(0, 2 + 4.5, 1.5);
      beastGroup.add(chest);

      // 头部
      const apeHead = new THREE.Mesh(
        new THREE.SphereGeometry(2, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0x1a1a0a, roughness: 0.8 })
      );
      apeHead.position.set(0, 2 + 8, 0.5);
      beastGroup.add(apeHead);

      // 脸部
      const face = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.7 })
      );
      face.position.set(0, 2 + 8, 1.8);
      face.scale.y = 0.9;
      beastGroup.add(face);

      // 眼睛（发光）
      const apeEye1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      apeEye1.position.set(-0.5, 2 + 8.3, 2.5);
      beastGroup.add(apeEye1);
      const apeEye2 = apeEye1.clone();
      apeEye2.position.x = 0.5;
      beastGroup.add(apeEye2);

      // 手臂
      for (let side = -1; side <= 1; side += 2) {
        const arm = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1.2, 5, 10),
          new THREE.MeshStandardMaterial({ color: 0x2a2a1a, roughness: 0.8 })
        );
        arm.position.set(side * 3.5, 2 + 4.5, 0);
        arm.rotation.z = side * 0.3;
        beastGroup.add(arm);

        // 拳头
        const fist = new THREE.Mesh(
          new THREE.SphereGeometry(1.2, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x1a1a0a, roughness: 0.8 })
        );
        fist.position.set(side * 5, 2 + 2, 0);
        beastGroup.add(fist);
      }

      // 腿
      for (let side = -1; side <= 1; side += 2) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.5, 4, 10),
          new THREE.MeshStandardMaterial({ color: 0x2a2a1a, roughness: 0.8 })
        );
        leg.position.set(side * 1.5, 2 + 1, 0);
        beastGroup.add(leg);
      }

      beastGroup.position.set(0, 0, -18);
      so.beastStatue = beastGroup;
      scene.add(beastGroup);

      // 古老祭坛
      const altarGroup = new THREE.Group();

      // 祭坛台阶
      for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(
          new THREE.CylinderGeometry(8 - i * 1.5, 9 - i * 1.5, 1, 16),
          new THREE.MeshStandardMaterial({ color: 0x4a6a4a, roughness: 0.8 })
        );
        step.position.y = i * 1 + 0.5;
        altarGroup.add(step);
      }

      // 祭坛顶部
      const altarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 6.5, 1.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.7 })
      );
      altarTop.position.y = 3 + 0.75;
      altarGroup.add(altarTop);

      // 中央水晶
      const altarCrystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(2, 0),
        new THREE.MeshStandardMaterial({
          color: 0x44ff88,
          emissive: 0x22ff44,
          emissiveIntensity: 0.6,
          transparent: true,
          opacity: 0.8,
        })
      );
      altarCrystal.position.y = 5.5;
      altarCrystal.userData.baseY = 5.5;
      altarGroup.add(altarCrystal);

      altarGroup.position.set(0, 0, 18);
      so.ancientAltar = altarGroup;
      scene.add(altarGroup);

      // 周围古老大树
      so.ancientTrees = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 50 + Math.random() * 25;
        const tree = new THREE.Group();

        const treeTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 2.5, 15 + Math.random() * 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9 })
        );
        treeTrunk.position.y = (15 + Math.random() * 10) / 2;
        tree.add(treeTrunk);

        const treeTop = new THREE.Mesh(
          new THREE.SphereGeometry(5 + Math.random() * 3, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.85 })
        );
        treeTop.position.y = 15 + Math.random() * 10;
        treeTop.scale.y = 1.2;
        tree.add(treeTop);

        tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        so.ancientTrees.push(tree);
        scene.add(tree);
      }

      // 绿色光点粒子
      so.greenLightParticles = [];
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 60;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 6),
          new THREE.MeshBasicMaterial({
            color: [0x44ff44, 0x66ff66, 0x88ff88, 0xaaffaa][Math.floor(Math.random() * 4)],
            transparent: true,
            opacity: 0.7,
          })
        );
        particle.position.set(
          Math.cos(angle) * dist,
          1 + Math.random() * 25,
          Math.sin(angle) * dist
        );
        particle.userData.speed = 0.3 + Math.random() * 0.4;
        particle.userData.baseY = particle.position.y;
        particle.userData.phase = Math.random() * Math.PI * 2;
        particle.userData.angle = angle;
        particle.userData.radius = dist;
        so.greenLightParticles.push(particle);
        scene.add(particle);
      }

      // 灵花
      so.spiritFlowers = [];
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 10 + Math.random() * 50;
        const flower = new THREE.Group();

        // 茎
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.08, 1, 6),
          new THREE.MeshStandardMaterial({ color: 0x22aa22, roughness: 0.8 })
        );
        stem.position.y = 0.5;
        flower.add(stem);

        // 花瓣
        const petalColor = [0xff66ff, 0xff88ff, 0xaa66ff, 0x66ffff, 0xffff66][Math.floor(Math.random() * 5)];
        for (let p = 0; p < 6; p++) {
          const petalAngle = (p / 6) * Math.PI * 2;
          const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshStandardMaterial({
              color: petalColor,
              emissive: petalColor,
              emissiveIntensity: 0.3,
            })
          );
          petal.scale.y = 0.5;
          petal.position.set(
            Math.cos(petalAngle) * 0.3,
            1,
            Math.sin(petalAngle) * 0.3
          );
          flower.add(petal);
        }

        // 花心
        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 6, 6),
          new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 })
        );
        center.position.y = 1;
        flower.add(center);

        flower.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        flower.userData.baseY = 0;
        flower.userData.phase = Math.random() * Math.PI * 2;
        so.spiritFlowers.push(flower);
        scene.add(flower);
      }

      // 发光蘑菇
      so.glowingMushrooms = [];
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 55;
        const mushroom = new THREE.Group();

        // 柄
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.2, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0xeeeecc, roughness: 0.7 })
        );
        stalk.position.y = 0.3;
        mushroom.add(stalk);

        // 菌盖
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 10, 10),
          new THREE.MeshStandardMaterial({
            color: [0x66ffcc, 0x66ccff, 0xcc66ff, 0xff66cc][Math.floor(Math.random() * 4)],
            emissive: [0x44ddaa, 0x44aadd, 0xaa44dd, 0xdd44aa][Math.floor(Math.random() * 4)],
            emissiveIntensity: 0.6,
          })
        );
        cap.scale.y = 0.5;
        cap.position.y = 0.7;
        mushroom.add(cap);

        // 斑点
        for (let s = 0; s < 4; s++) {
          const spot = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
          );
          const sAngle = (s / 4) * Math.PI * 2;
          spot.position.set(Math.cos(sAngle) * 0.25, 0.75, Math.sin(sAngle) * 0.25);
          mushroom.add(spot);
        }

        mushroom.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        mushroom.userData.phase = Math.random() * Math.PI * 2;
        so.glowingMushrooms.push(mushroom);
        scene.add(mushroom);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.mossFloor) so.mossFloor.visible = true;
      if (so.lifeTree) so.lifeTree.visible = true;
      if (so.beastStatue) so.beastStatue.visible = true;
      if (so.ancientAltar) so.ancientAltar.visible = true;
      for (const t of so.ancientTrees) if (t) t.visible = true;
      for (const p of so.greenLightParticles) if (p) p.visible = true;
      for (const f of so.spiritFlowers) if (f) f.visible = true;
      for (const m of so.glowingMushrooms) if (m) m.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.mossFloor) so.mossFloor.visible = false;
      if (so.lifeTree) so.lifeTree.visible = false;
      if (so.beastStatue) so.beastStatue.visible = false;
      if (so.ancientAltar) so.ancientAltar.visible = false;
      for (const t of so.ancientTrees) if (t) t.visible = false;
      for (const p of so.greenLightParticles) if (p) p.visible = false;
      for (const f of so.spiritFlowers) if (f) f.visible = false;
      for (const m of so.glowingMushrooms) if (m) m.visible = false;
    },

    _setEnv() {
      setEnvironment(0x0a2a0a, 130, 0x1a3a1a, 0x22aa22, 0.3, 0x44ff44, 0.4);
    },

    teleportTo() {
      doTeleport(this, 'star_core', 'star_core', '星斗核心秘境', { x: 0, z: 45 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 绿色光点漂浮
      for (const p of this.sceneObjects.greenLightParticles) {
        p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 2;
        p.position.x = Math.cos(p.userData.angle + time * 0.1) * p.userData.radius;
        p.position.z = Math.sin(p.userData.angle + time * 0.1) * p.userData.radius;
        p.material.opacity = 0.4 + Math.sin(time * p.userData.speed * 0.8 + p.userData.phase) * 0.3;
      }

      // 灵花轻微摇摆
      for (const f of this.sceneObjects.spiritFlowers) {
        f.rotation.x = Math.sin(time * 1.5 + f.userData.phase) * 0.05;
        f.rotation.z = Math.cos(time * 1.2 + f.userData.phase) * 0.05;
      }

      // 发光蘑菇明暗
      for (const m of this.sceneObjects.glowingMushrooms) {
        for (const child of m.children) {
          if (child.material && child.material.emissiveIntensity !== undefined) {
            child.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + m.userData.phase) * 0.3;
          }
        }
      }

      // 祭坛水晶脉动
      if (this.sceneObjects.ancientAltar) {
        const crystal = this.sceneObjects.ancientAltar.children[this.sceneObjects.ancientAltar.children.length - 1];
        if (crystal && crystal.userData && crystal.userData.baseY !== undefined) {
          crystal.position.y = crystal.userData.baseY + Math.sin(time * 2) * 0.3;
          crystal.material.emissiveIntensity = 0.5 + Math.sin(time * 1.5) * 0.3;
          crystal.rotation.y += dt * 0.5;
        }
      }
    },
  };

  // ============================================================
  // 8. 神界 - 众神居所
  // ============================================================
  const DivineRealmMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 120,
    groundY: 0,

    sceneObjects: {
      ground: null,
      cloudFloor: null,
      divinePalace: null,
      divinePillars: [],
      goldenClouds: [],
      rainbowBridges: [],
      divineLights: [],
      starParticles: [],
      floatingIslands: [],
      deityStatues: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 金色云气地面
      const cloudGeom = new THREE.CircleGeometry(this.radius, 64);
      cloudGeom.rotateX(-Math.PI / 2);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xfff8dc,
        roughness: 0.9,
        transparent: true,
        opacity: 0.9,
      });
      so.ground = new THREE.Mesh(cloudGeom, cloudMat);
      so.ground.receiveShadow = true;
      scene.add(so.ground);

      // 中心神圣广场
      const plazaGeom = new THREE.CircleGeometry(40, 64);
      plazaGeom.rotateX(-Math.PI / 2);
      const plazaMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.3,
      });
      so.cloudFloor = new THREE.Mesh(plazaGeom, plazaMat);
      so.cloudFloor.position.y = 0.05;
      so.cloudFloor.receiveShadow = true;
      scene.add(so.cloudFloor);

      // 广场金色花纹
      for (let i = 0; i < 6; i++) {
        const ringGeom = new THREE.RingGeometry(8 + i * 5, 8.3 + i * 5, 64);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          roughness: 0.3,
          metalness: 0.9,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.y = 0.06 + i * 0.005;
        scene.add(ring);
      }

      // 神界宫殿
      const palaceGroup = new THREE.Group();

      // 宫殿基座
      for (let i = 0; i < 5; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(40 - i * 3, 1.5, 30 - i * 2.5),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
        );
        step.position.y = i * 1.5 + 0.75;
        palaceGroup.add(step);
      }

      // 宫殿主体
      const palaceBody = new THREE.Mesh(
        new THREE.BoxGeometry(30, 20, 22),
        new THREE.MeshStandardMaterial({ color: 0xfffff0, roughness: 0.4 })
      );
      palaceBody.position.y = 7.5 + 10;
      palaceGroup.add(palaceBody);

      // 金色装饰带
      for (let i = 0; i < 4; i++) {
        const trim = new THREE.Mesh(
          new THREE.BoxGeometry(31, 0.5, 23),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        trim.position.y = 9 + i * 5;
        palaceGroup.add(trim);
      }

      // 宫殿屋顶（多层飞檐）
      const roofBase = new THREE.Mesh(
        new THREE.BoxGeometry(35, 2, 27),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.8 })
      );
      roofBase.position.y = 7.5 + 20 + 1;
      palaceGroup.add(roofBase);

      const roofMid = new THREE.Mesh(
        new THREE.BoxGeometry(28, 3, 20),
        new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.4, metalness: 0.7 })
      );
      roofMid.position.y = 7.5 + 22 + 1.5;
      palaceGroup.add(roofMid);

      const roofTop = new THREE.Mesh(
        new THREE.BoxGeometry(18, 2, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.8 })
      );
      roofTop.position.y = 7.5 + 25 + 1;
      palaceGroup.add(roofTop);

      // 顶部神塔
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
      );
      spire.position.y = 7.5 + 27 + 4;
      palaceGroup.add(spire);

      // 神塔顶端宝珠
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffd700,
          emissiveIntensity: 0.8,
        })
      );
      orb.position.y = 7.5 + 27 + 8 + 1;
      orb.userData.baseY = 7.5 + 27 + 8 + 1;
      palaceGroup.add(orb);

      // 宫殿大门
      const mainDoor = new THREE.Mesh(
        new THREE.BoxGeometry(8, 12, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.4, metalness: 0.8 })
      );
      mainDoor.position.set(0, 7.5 + 6, 11.1);
      palaceGroup.add(mainDoor);

      // 门钉
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 3; c++) {
          const nail = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
          );
          nail.position.set(-2.5 + c * 2.5, 7.5 + 2 + r * 2.5, 11.6);
          palaceGroup.add(nail);
        }
      }

      // 大窗户
      for (let i = 0; i < 3; i++) {
        const windowFrame = new THREE.Mesh(
          new THREE.BoxGeometry(5, 6, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.8 })
        );
        windowFrame.position.set(-10 + i * 10, 7.5 + 13, 11.1);
        palaceGroup.add(windowFrame);

        const windowGlass = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 5),
          new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            emissive: 0x4488cc,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.7,
          })
        );
        windowGlass.position.set(-10 + i * 10, 7.5 + 13, 11.4);
        palaceGroup.add(windowGlass);
      }

      palaceGroup.position.set(0, 0, -20);
      so.divinePalace = palaceGroup;
      scene.add(palaceGroup);

      // 神圣天柱
      so.divinePillars = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pillarGroup = new THREE.Group();

        // 柱身
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 2, 20, 16),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
        );
        shaft.position.y = 10;
        pillarGroup.add(shaft);

        // 金色彩带装饰
        for (let r = 0; r < 5; r++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.7, 0.15, 8, 32),
            new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 3 + r * 4;
          pillarGroup.add(ring);
        }

        // 柱头
        const capital = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 1.5, 3.5),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        capital.position.y = 20.75;
        pillarGroup.add(capital);

        // 柱基
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 1.5, 3.5),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        base.position.y = 0.75;
        pillarGroup.add(base);

        // 柱顶发光球
        const topOrb = new THREE.Mesh(
          new THREE.SphereGeometry(1, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffd700,
            emissiveIntensity: 0.6,
          })
        );
        topOrb.position.y = 23;
        pillarGroup.add(topOrb);

        pillarGroup.position.set(Math.cos(angle) * 45, 0, Math.sin(angle) * 45);
        so.divinePillars.push(pillarGroup);
        scene.add(pillarGroup);
      }

      // 金色云朵
      so.goldenClouds = [];
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 50;
        const cloud = new THREE.Group();

        for (let c = 0; c < 5; c++) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(2 + Math.random() * 2, 10, 10),
            new THREE.MeshStandardMaterial({
              color: 0xfff0c0,
              transparent: true,
              opacity: 0.7,
              roughness: 1,
            })
          );
          puff.position.set(
            (Math.random() - 0.5) * 6,
            Math.random() * 2,
            (Math.random() - 0.5) * 6
          );
          cloud.add(puff);
        }

        cloud.position.set(
          Math.cos(angle) * dist,
          10 + Math.random() * 20,
          Math.sin(angle) * dist
        );
        cloud.userData.baseY = cloud.position.y;
        cloud.userData.speed = 0.1 + Math.random() * 0.15;
        cloud.userData.phase = Math.random() * Math.PI * 2;
        cloud.userData.angle = angle;
        cloud.userData.radius = dist;
        so.goldenClouds.push(cloud);
        scene.add(cloud);
      }

      // 彩虹桥
      so.rainbowBridges = [];
      const rainbowColors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x00ffff, 0x0088ff, 0x8800ff];
      for (let i = 0; i < 7; i++) {
        const bridge = new THREE.Mesh(
          new THREE.TorusGeometry(30, 0.3, 8, 32, Math.PI),
          new THREE.MeshBasicMaterial({
            color: rainbowColors[i],
            transparent: true,
            opacity: 0.5,
          })
        );
        bridge.rotation.x = Math.PI / 2;
        bridge.position.y = 5 + i * 0.5;
        so.rainbowBridges.push(bridge);
        scene.add(bridge);
      }

      // 神圣光柱
      so.divineLights = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 3, 80, 12, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
          })
        );
        beam.position.set(Math.cos(angle) * 20, 40, Math.sin(angle) * 20);
        beam.userData.baseOpacity = 0.1;
        so.divineLights.push(beam);
        scene.add(beam);
      }

      // 中心主光柱
      const mainBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 8, 100, 16, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
        })
      );
      mainBeam.position.set(0, 50, 0);
      mainBeam.userData.baseOpacity = 0.08;
      so.divineLights.push(mainBeam);
      scene.add(mainBeam);

      // 星光粒子
      so.starParticles = [];
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 80;
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 6, 6),
          new THREE.MeshBasicMaterial({
            color: [0xffffff, 0xfff0c0, 0xffffcc, 0xe0e0ff][Math.floor(Math.random() * 4)],
            transparent: true,
            opacity: 0.8,
          })
        );
        star.position.set(
          Math.cos(angle) * dist,
          10 + Math.random() * 50,
          Math.sin(angle) * dist
        );
        star.userData.baseY = star.position.y;
        star.userData.speed = 0.5 + Math.random() * 0.5;
        star.userData.phase = Math.random() * Math.PI * 2;
        star.userData.angle = angle;
        star.userData.radius = dist;
        so.starParticles.push(star);
        scene.add(star);
      }

      // 浮空岛
      so.floatingIslands = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
        const dist = 70 + Math.random() * 30;
        const island = new THREE.Group();

        // 岛屿主体
        const islandBody = new THREE.Mesh(
          new THREE.ConeGeometry(8, 10, 16),
          new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 })
        );
        islandBody.rotation.x = Math.PI;
        islandBody.position.y = -3;
        island.add(islandBody);

        // 顶部草地
        const islandTop = new THREE.Mesh(
          new THREE.CylinderGeometry(7, 8, 2, 16),
          new THREE.MeshStandardMaterial({ color: 0x4a8a4a, roughness: 0.8 })
        );
        islandTop.position.y = 1;
        island.add(islandTop);

        // 岛上小树
        for (let t = 0; t < 3; t++) {
          const tAngle = (t / 3) * Math.PI * 2;
          const tinyTree = new THREE.Group();
          const tTrunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2, 6),
            new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 })
          );
          tTrunk.position.y = 2;
          tinyTree.add(tTrunk);
          const tTop = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 })
          );
          tTop.position.y = 3.5;
          tinyTree.add(tTop);
          tinyTree.position.set(Math.cos(tAngle) * 3, 2, Math.sin(tAngle) * 3);
          island.add(tinyTree);
        }

        // 岛上小建筑
        const temple = new THREE.Mesh(
          new THREE.BoxGeometry(2, 3, 2),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
        );
        temple.position.set(0, 3.5, 0);
        island.add(temple);

        const templeRoof = new THREE.Mesh(
          new THREE.ConeGeometry(1.5, 1.5, 4),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5, metalness: 0.7 })
        );
        templeRoof.position.set(0, 5.75, 0);
        templeRoof.rotation.y = Math.PI / 4;
        island.add(templeRoof);

        island.position.set(
          Math.cos(angle) * dist,
          15 + Math.random() * 20,
          Math.sin(angle) * dist
        );
        island.userData.baseY = island.position.y;
        island.userData.phase = Math.random() * Math.PI * 2;
        island.userData.speed = 0.15 + Math.random() * 0.1;
        so.floatingIslands.push(island);
        scene.add(island);
      }

      // 神祇雕像（两侧排列）
      so.deityStatues = [];
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const statueGroup = new THREE.Group();

          // 基座
          const sBase = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 3),
            new THREE.MeshStandardMaterial({ color: 0xfff0c0, roughness: 0.6 })
          );
          sBase.position.y = 1;
          statueGroup.add(sBase);

          // 神像身体
          const sBody = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.3, 5, 12),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
          );
          sBody.position.y = 2 + 2.5;
          statueGroup.add(sBody);

          // 神像头部
          const sHead = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.4 })
          );
          sHead.position.y = 2 + 5 + 0.7;
          statueGroup.add(sHead);

          // 光环
          const sHalo = new THREE.Mesh(
            new THREE.TorusGeometry(1.2, 0.1, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0xffd700 })
          );
          sHalo.rotation.x = Math.PI / 2;
          sHalo.position.y = 2 + 5 + 1.8;
          statueGroup.add(sHalo);

          statueGroup.position.set(side * 25, 0, -5 + i * 8);
          statueGroup.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          so.deityStatues.push(statueGroup);
          scene.add(statueGroup);
        }
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.cloudFloor) so.cloudFloor.visible = true;
      if (so.divinePalace) so.divinePalace.visible = true;
      for (const p of so.divinePillars) if (p) p.visible = true;
      for (const c of so.goldenClouds) if (c) c.visible = true;
      for (const b of so.rainbowBridges) if (b) b.visible = true;
      for (const l of so.divineLights) if (l) l.visible = true;
      for (const s of so.starParticles) if (s) s.visible = true;
      for (const i of so.floatingIslands) if (i) i.visible = true;
      for (const d of so.deityStatues) if (d) d.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.cloudFloor) so.cloudFloor.visible = false;
      if (so.divinePalace) so.divinePalace.visible = false;
      for (const p of so.divinePillars) if (p) p.visible = false;
      for (const c of so.goldenClouds) if (c) c.visible = false;
      for (const b of so.rainbowBridges) if (b) b.visible = false;
      for (const l of so.divineLights) if (l) l.visible = false;
      for (const s of so.starParticles) if (s) s.visible = false;
      for (const i of so.floatingIslands) if (i) i.visible = false;
      for (const d of so.deityStatues) if (d) d.visible = false;
    },

    _setEnv() {
      setEnvironment(0xfff0c0, 180, 0xfff8dc, 0xfff8dc, 0.5, 0xffd700, 0.7);
    },

    teleportTo() {
      doTeleport(this, 'divine_realm', 'divine_realm', '神界', { x: 0, z: 50 });
    },

    leave() {
      doLeave(this);
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 金色云朵漂浮
      for (const c of this.sceneObjects.goldenClouds) {
        c.position.y = c.userData.baseY + Math.sin(time * c.userData.speed + c.userData.phase) * 2;
        c.position.x = Math.cos(c.userData.angle + time * 0.05) * c.userData.radius;
        c.position.z = Math.sin(c.userData.angle + time * 0.05) * c.userData.radius;
      }

      // 星光粒子闪烁
      for (const s of this.sceneObjects.starParticles) {
        s.material.opacity = 0.5 + Math.sin(time * s.userData.speed + s.userData.phase) * 0.4;
        s.position.y = s.userData.baseY + Math.sin(time * s.userData.speed * 0.5 + s.userData.phase) * 1;
      }

      // 神圣光柱呼吸
      for (let i = 0; i < this.sceneObjects.divineLights.length; i++) {
        const l = this.sceneObjects.divineLights[i];
        l.material.opacity = l.userData.baseOpacity + Math.sin(time * 1.5 + i) * 0.03;
      }

      // 浮空岛上下浮动
      for (const isl of this.sceneObjects.floatingIslands) {
        isl.position.y = isl.userData.baseY + Math.sin(time * isl.userData.speed + isl.userData.phase) * 2;
        isl.rotation.y += dt * 0.05;
      }

      // 宫殿顶部宝珠脉动
      if (this.sceneObjects.divinePalace) {
        const orb = this.sceneObjects.divinePalace.children[this.sceneObjects.divinePalace.children.length - 1];
        if (orb && orb.userData && orb.userData.baseY !== undefined) {
          orb.position.y = orb.userData.baseY + Math.sin(time * 2) * 0.5;
          orb.material.emissiveIntensity = 0.6 + Math.sin(time * 1.5) * 0.3;
        }
      }
    },
  };

  // ============================================================
  // 导出到全局
  // ============================================================
  window.TempleAngelMap = TempleAngelMap;
  window.TempleRakshasaMap = TempleRakshasaMap;
  window.TempleWarMap = TempleWarMap;
  window.TempleSpeedMap = TempleSpeedMap;
  window.TempleFoodMap = TempleFoodMap;
  window.TemplePhoenixMap = TemplePhoenixMap;
  window.StarCoreMap = StarCoreMap;
  window.DivineRealmMap = DivineRealmMap;

  // 合并到 DivineMaps 注册表
  if (!window.DivineMaps) {
    window.DivineMaps = {};
  }
  window.DivineMaps.temple_angel = TempleAngelMap;
  window.DivineMaps.temple_rakshasa = TempleRakshasaMap;
  window.DivineMaps.temple_war = TempleWarMap;
  window.DivineMaps.temple_speed = TempleSpeedMap;
  window.DivineMaps.temple_food = TempleFoodMap;
  window.DivineMaps.temple_phoenix = TemplePhoenixMap;
  window.DivineMaps.star_core = StarCoreMap;
  window.DivineMaps.divine_realm = DivineRealmMap;

})();
