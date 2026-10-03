// ============================================================
// 斗罗大陆 - 神位地图系统 (Divine Maps)
// 10张独立神位地图，每张对应一位神祇
// ============================================================

(function() {
  'use strict';

  // ------------------------------------------------------------
  // 通用辅助函数
  // ------------------------------------------------------------

  // 通用辅助函数统一来自 divine-map-core.js（window.DivineMapHelpers）
  const {
    savePrevState, hidePrevScene, restorePrevScene,
    setEnvironment, createGround, createParticles, updateParticles, doTeleport,
  } = window.DivineMapHelpers;

  // ============================================================
  // 1. 杀戮之都 - 修罗神
  // ============================================================
  const KillingCityMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,

    sceneObjects: {
      ground: null,
      plaza: null,
      buildings: [],
      pillars: [],
      purpleFog: [],
      redLights: [],
      throne: null,
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 暗红色石板地面
      so.ground = createGround(this.radius, 0x2d0a0a, 0);
      scene.add(so.ground);

      // 中心杀戮广场（更深的红色）
      const plazaGeom = new THREE.CircleGeometry(25, 32);
      plazaGeom.rotateX(-Math.PI / 2);
      const plazaMat = new THREE.MeshStandardMaterial({ color: 0x4a0808, roughness: 0.8 });
      so.plaza = new THREE.Mesh(plazaGeom, plazaMat);
      so.plaza.position.y = 0.02;
      so.plaza.receiveShadow = true;
      scene.add(so.plaza);

      // 中心修罗王座
      const throneGroup = new THREE.Group();
      const throneBase = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a0000, roughness: 0.7, metalness: 0.3 })
      );
      throneBase.position.y = 0.5;
      throneGroup.add(throneBase);

      const throneSeat = new THREE.Mesh(
        new THREE.BoxGeometry(3, 4, 2),
        new THREE.MeshStandardMaterial({ color: 0x2d0000, roughness: 0.6, metalness: 0.4 })
      );
      throneSeat.position.set(0, 3, -1);
      throneGroup.add(throneSeat);

      const throneBack = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 6, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x3d0000, roughness: 0.5, metalness: 0.5 })
      );
      throneBack.position.set(0, 5, -1.75);
      throneGroup.add(throneBack);

      throneGroup.position.set(0, 0, 0);
      so.throne = throneGroup;
      scene.add(throneGroup);

      // 周围破败建筑
      so.buildings = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 45 + Math.random() * 20;
        const bldg = new THREE.Group();

        const h = 5 + Math.random() * 8;
        const w = 4 + Math.random() * 4;
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, w),
          new THREE.MeshStandardMaterial({ color: 0x1a0505, roughness: 0.95 })
        );
        body.position.y = h / 2;
        bldg.add(body);

        // 破损的屋顶
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(w * 0.7, 2, 4),
          new THREE.MeshStandardMaterial({ color: 0x0d0202, roughness: 1 })
        );
        roof.position.y = h + 1;
        roof.rotation.y = Math.PI / 4;
        bldg.add(roof);

        bldg.position.set(
          Math.cos(angle) * dist,
          0,
          Math.sin(angle) * dist
        );
        bldg.rotation.y = angle + Math.PI;
        so.buildings.push(bldg);
        scene.add(bldg);
      }

      // 广场周围的石柱
      so.pillars = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1.2, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x2a0a0a, roughness: 0.8 })
        );
        pillar.position.set(Math.cos(angle) * 20, 4, Math.sin(angle) * 20);
        so.pillars.push(pillar);
        scene.add(pillar);
      }

      // 暗红色灯光
      so.redLights = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const light = new THREE.PointLight(0x8b0000, 1.5, 25);
        light.position.set(Math.cos(angle) * 20, 6, Math.sin(angle) * 20);
        so.redLights.push(light);
        scene.add(light);
      }

      // 紫色雾气粒子
      so.purpleFog = createParticles(80, 0x6a0dad, 1.5, 15, 0.5);
      for (const p of so.purpleFog) {
        p.material.opacity = 0.3;
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.plaza) so.plaza.visible = true;
      if (so.throne) so.throne.visible = true;
      for (const b of so.buildings) if (b) b.visible = true;
      for (const p of so.pillars) if (p) p.visible = true;
      for (const l of so.redLights) if (l) l.visible = true;
      for (const p of so.purpleFog) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.plaza) so.plaza.visible = false;
      if (so.throne) so.throne.visible = false;
      for (const b of so.buildings) if (b) b.visible = false;
      for (const p of so.pillars) if (p) p.visible = false;
      for (const l of so.redLights) if (l) l.visible = false;
      for (const p of so.purpleFog) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x1a001a, 120, 0x1a001a, 0x4a0040, 0.3, 0x660033, 0.4);
    },

    teleportTo() {
      doTeleport(this, 'killing_city', 'killing_city', '杀戮之都', { x: 0, z: 40 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.purpleFog, dt, time);

      // 灯光闪烁
      for (let i = 0; i < this.sceneObjects.redLights.length; i++) {
        const l = this.sceneObjects.redLights[i];
        l.intensity = 1.2 + Math.sin(time * 2 + i) * 0.3;
      }
    },
  };

  // ============================================================
  // 2. 毁灭神殿 - 毁灭之神
  // ============================================================
  const TempleDestructionLordMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,

    sceneObjects: {
      ground: null,
      temple: null,
      brokenPillars: [],
      debris: [],
      lightningParticles: [],
      purpleLight: null,
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 破碎黑石地面
      so.ground = createGround(this.radius, 0x1a0a2e, 0);
      scene.add(so.ground);

      // 地面裂纹（用深色圆环模拟）
      for (let i = 0; i < 5; i++) {
        const crackGeom = new THREE.RingGeometry(15 + i * 12, 16 + i * 12, 32);
        crackGeom.rotateX(-Math.PI / 2);
        const crackMat = new THREE.MeshBasicMaterial({ color: 0x0d0515, side: THREE.DoubleSide });
        const crack = new THREE.Mesh(crackGeom, crackMat);
        crack.position.y = 0.03;
        scene.add(crack);
      }

      // 巨大毁灭神殿主体
      const templeGroup = new THREE.Group();

      // 神殿基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 22, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x2d1b4e, roughness: 0.8, metalness: 0.2 })
      );
      base.position.y = 2;
      templeGroup.add(base);

      // 神殿主体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 18, 18, 6),
        new THREE.MeshStandardMaterial({ color: 0x1f1030, roughness: 0.7, metalness: 0.3 })
      );
      body.position.y = 13;
      templeGroup.add(body);

      // 神殿尖顶
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(12, 12, 6),
        new THREE.MeshStandardMaterial({ color: 0x150a20, roughness: 0.6, metalness: 0.4 })
      );
      spire.position.y = 28;
      templeGroup.add(spire);

      // 顶部紫水晶
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(3, 0),
        new THREE.MeshBasicMaterial({ color: 0x9932cc, transparent: true, opacity: 0.8 })
      );
      crystal.position.y = 38;
      templeGroup.add(crystal);

      so.temple = templeGroup;
      scene.add(templeGroup);

      // 周围破碎石柱
      so.brokenPillars = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 35 + Math.random() * 25;
        const pillarGroup = new THREE.Group();

        const h = 3 + Math.random() * 5;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.8, h, 6),
          new THREE.MeshStandardMaterial({ color: 0x2a1a3a, roughness: 0.9 })
        );
        pillar.position.y = h / 2;
        pillarGroup.add(pillar);

        // 断裂的上半截（斜倒在旁边）
        const brokenPart = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.4, 4, 6),
          new THREE.MeshStandardMaterial({ color: 0x251530, roughness: 0.9 })
        );
        brokenPart.position.set(2 + Math.random() * 2, 1, 1);
        brokenPart.rotation.z = Math.PI / 3 + Math.random() * 0.5;
        pillarGroup.add(brokenPart);

        pillarGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        pillarGroup.rotation.y = Math.random() * Math.PI;
        so.brokenPillars.push(pillarGroup);
        scene.add(pillarGroup);
      }

      // 碎石残骸
      so.debris = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 60;
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.5 + Math.random() * 2, 0),
          new THREE.MeshStandardMaterial({ color: 0x1a0a28, roughness: 0.95 })
        );
        rock.position.set(Math.cos(angle) * dist, 0.3 + Math.random(), Math.sin(angle) * dist);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        so.debris.push(rock);
        scene.add(rock);
      }

      // 紫色闪电粒子
      so.lightningParticles = createParticles(60, 0x9932cc, 0.8, 30, 1.2);
      for (const p of so.lightningParticles) {
        scene.add(p);
      }

      // 顶部紫光
      so.purpleLight = new THREE.PointLight(0x9932cc, 2, 80);
      so.purpleLight.position.set(0, 35, 0);
      scene.add(so.purpleLight);
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.temple) so.temple.visible = true;
      if (so.purpleLight) so.purpleLight.visible = true;
      for (const p of so.brokenPillars) if (p) p.visible = true;
      for (const d of so.debris) if (d) d.visible = true;
      for (const p of so.lightningParticles) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.temple) so.temple.visible = false;
      if (so.purpleLight) so.purpleLight.visible = false;
      for (const p of so.brokenPillars) if (p) p.visible = false;
      for (const d of so.debris) if (d) d.visible = false;
      for (const p of so.lightningParticles) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x0f0520, 100, 0x0f0520, 0x4a1a66, 0.25, 0x6a2d9b, 0.3);
    },

    teleportTo() {
      doTeleport(this, 'temple_destruction_lord', 'temple_destruction_lord', '毁灭神殿', { x: 0, z: 40 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.lightningParticles, dt, time);

      // 闪电闪烁效果
      if (Math.random() < 0.02) {
        this.sceneObjects.purpleLight.intensity = 4;
        setTimeout(() => {
          if (this.sceneObjects.purpleLight) this.sceneObjects.purpleLight.intensity = 2;
        }, 100);
      }
    },
  };

  // ============================================================
  // 3. 生命之森 - 生命女神
  // ============================================================
  const LifeForestMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 120,

    sceneObjects: {
      ground: null,
      lifeTree: null,
      trees: [],
      flowers: [],
      lake: null,
      greenParticles: [],
      butterflies: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 翠绿色草地地面
      so.ground = createGround(this.radius, 0x228b22, 0);
      scene.add(so.ground);

      // 中心巨大生命之树
      const treeGroup = new THREE.Group();

      // 树干
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 4, 15, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.9 })
      );
      trunk.position.y = 7.5;
      treeGroup.add(trunk);

      // 多层树冠
      for (let i = 0; i < 4; i++) {
        const r = 12 - i * 2;
        const canopy = new THREE.Mesh(
          new THREE.SphereGeometry(r, 12, 8),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x32cd32 : 0x228b22,
            roughness: 0.8,
          })
        );
        canopy.position.y = 12 + i * 5;
        treeGroup.add(canopy);
      }

      // 发光的生命果实
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const fruit = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x7fff00, transparent: true, opacity: 0.9 })
        );
        const r = 6 + Math.random() * 6;
        fruit.position.set(Math.cos(angle) * r, 15 + Math.random() * 12, Math.sin(angle) * r);
        treeGroup.add(fruit);
      }

      so.lifeTree = treeGroup;
      scene.add(treeGroup);

      // 周围树木
      so.trees = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 70;
        const tree = new THREE.Group();

        const h = 4 + Math.random() * 4;
        const tTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.6, h, 6),
          new THREE.MeshStandardMaterial({ color: 0x5d3a1a, roughness: 0.9 })
        );
        tTrunk.position.y = h / 2;
        tree.add(tTrunk);

        const tCanopy = new THREE.Mesh(
          new THREE.SphereGeometry(2 + Math.random(), 8, 6),
          new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x2e8b57 : 0x3cb371,
            roughness: 0.8,
          })
        );
        tCanopy.position.y = h + 1.5;
        tree.add(tCanopy);

        tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        so.trees.push(tree);
        scene.add(tree);
      }

      // 花草
      so.flowers = [];
      const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x87ceeb];
      for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 90;
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 6, 6),
          new THREE.MeshStandardMaterial({
            color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
            roughness: 0.7,
          })
        );
        flower.position.set(Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist);
        so.flowers.push(flower);
        scene.add(flower);
      }

      // 小湖泊
      const lakeGeom = new THREE.CircleGeometry(15, 32);
      lakeGeom.rotateX(-Math.PI / 2);
      const lakeMat = new THREE.MeshStandardMaterial({
        color: 0x40e0d0,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.8,
      });
      so.lake = new THREE.Mesh(lakeGeom, lakeMat);
      so.lake.position.set(40, 0.05, 20);
      so.lake.receiveShadow = true;
      scene.add(so.lake);

      // 绿色光点粒子
      so.greenParticles = createParticles(100, 0x7fff00, 0.4, 20, 0.6);
      for (const p of so.greenParticles) {
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.lifeTree) so.lifeTree.visible = true;
      if (so.lake) so.lake.visible = true;
      for (const t of so.trees) if (t) t.visible = true;
      for (const f of so.flowers) if (f) f.visible = true;
      for (const p of so.greenParticles) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.lifeTree) so.lifeTree.visible = false;
      if (so.lake) so.lake.visible = false;
      for (const t of so.trees) if (t) t.visible = false;
      for (const f of so.flowers) if (f) f.visible = false;
      for (const p of so.greenParticles) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x90ee90, 200, 0x87ceeb, 0x98fb98, 0.6, 0xffffff, 0.9);
    },

    teleportTo() {
      doTeleport(this, 'life_forest', 'life_forest', '生命之森', { x: 0, z: 50 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.greenParticles, dt, time);

      // 湖面波动
      if (this.sceneObjects.lake && this.sceneObjects.lake.material) {
        this.sceneObjects.lake.material.opacity = 0.75 + Math.sin(time * 1.5) * 0.05;
      }
    },
  };

  // ============================================================
  // 4. 美食殿堂 - 贪食之神
  // ============================================================
  const TempleGluttonyMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,

    sceneObjects: {
      ground: null,
      mainHall: null,
      foodDecorations: [],
      tables: [],
      goldenLights: [],
      aromaParticles: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 暖色调大理石地面
      so.ground = createGround(this.radius, 0xf5deb3, 0);
      scene.add(so.ground);

      // 中心美食殿堂主体
      const hallGroup = new THREE.Group();

      // 基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(22, 24, 3, 8),
        new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.5, metalness: 0.3 })
      );
      base.position.y = 1.5;
      hallGroup.add(base);

      // 殿堂主体（圆形餐厅）
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 20, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.4 })
      );
      body.position.y = 10.5;
      hallGroup.add(body);

      // 穹顶
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xff8c00, roughness: 0.3, metalness: 0.5 })
      );
      dome.position.y = 16.5;
      hallGroup.add(dome);

      // 顶部巨型金色汤匙装饰
      const spoon = new THREE.Mesh(
        new THREE.SphereGeometry(4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 })
      );
      spoon.position.y = 28;
      hallGroup.add(spoon);

      so.mainHall = hallGroup;
      scene.add(hallGroup);

      // 周围餐桌
      so.tables = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 40;
        const tableGroup = new THREE.Group();

        // 桌面
        const tableTop = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, 0.3, 8),
          new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
        );
        tableTop.position.y = 2;
        tableGroup.add(tableTop);

        // 桌腿
        for (let j = 0; j < 4; j++) {
          const legAngle = (j / 4) * Math.PI * 2;
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 2, 6),
            new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 })
          );
          leg.position.set(Math.cos(legAngle) * 2, 1, Math.sin(legAngle) * 2);
          tableGroup.add(leg);
        }

        tableGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        so.tables.push(tableGroup);
        scene.add(tableGroup);
      }

      // 食物装饰（巨型食物模型散布各处）
      so.foodDecorations = [];
      const foodTypes = [
        { color: 0xff6347, shape: 'sphere', size: 2 }, // 番茄
        { color: 0xffd700, shape: 'cylinder', size: 1.5 }, // 奶酪
        { color: 0x8b4513, shape: 'box', size: 1.8 }, // 面包
        { color: 0xff4500, shape: 'sphere', size: 1.2 }, // 苹果
        { color: 0x90ee90, shape: 'sphere', size: 1 }, // 青葡萄
        { color: 0xdda0dd, shape: 'sphere', size: 0.8 }, // 洋葱
      ];
      for (let i = 0; i < 30; i++) {
        const food = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        let mesh;
        if (food.shape === 'sphere') {
          mesh = new THREE.Mesh(
            new THREE.SphereGeometry(food.size, 8, 8),
            new THREE.MeshStandardMaterial({ color: food.color, roughness: 0.5 })
          );
        } else if (food.shape === 'cylinder') {
          mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(food.size, food.size, food.size * 0.8, 8),
            new THREE.MeshStandardMaterial({ color: food.color, roughness: 0.6 })
          );
        } else {
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(food.size * 2, food.size, food.size * 1.5),
            new THREE.MeshStandardMaterial({ color: food.color, roughness: 0.7 })
          );
        }
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 50;
        mesh.position.set(Math.cos(angle) * dist, food.size, Math.sin(angle) * dist);
        mesh.rotation.y = Math.random() * Math.PI;
        so.foodDecorations.push(mesh);
        scene.add(mesh);
      }

      // 金色灯光
      so.goldenLights = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const light = new THREE.PointLight(0xffd700, 1.2, 30);
        light.position.set(Math.cos(angle) * 30, 8, Math.sin(angle) * 30);
        so.goldenLights.push(light);
        scene.add(light);
      }

      // 食物香气粒子（金黄色）
      so.aromaParticles = createParticles(80, 0xffd700, 0.5, 15, 0.8);
      for (const p of so.aromaParticles) {
        p.material.opacity = 0.4;
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.mainHall) so.mainHall.visible = true;
      for (const t of so.tables) if (t) t.visible = true;
      for (const f of so.foodDecorations) if (f) f.visible = true;
      for (const l of so.goldenLights) if (l) l.visible = true;
      for (const p of so.aromaParticles) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.mainHall) so.mainHall.visible = false;
      for (const t of so.tables) if (t) t.visible = false;
      for (const f of so.foodDecorations) if (f) f.visible = false;
      for (const l of so.goldenLights) if (l) l.visible = false;
      for (const p of so.aromaParticles) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0xffe4b5, 150, 0xffd700, 0xffd700, 0.5, 0xffa500, 0.7);
    },

    teleportTo() {
      doTeleport(this, 'temple_gluttony', 'temple_gluttony', '美食殿堂', { x: 0, z: 45 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.aromaParticles, dt, time);
    },
  };

  // ============================================================
  // 5. 破坏战场 - 破坏神
  // ============================================================
  const TempleDestructionMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 110,

    sceneObjects: {
      ground: null,
      altar: null,
      brokenWalls: [],
      craters: [],
      smokeParticles: [],
      debris: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 暗紫色废墟地面
      so.ground = createGround(this.radius, 0x3d2b4a, 0);
      scene.add(so.ground);

      // 中心破坏祭坛
      const altarGroup = new THREE.Group();

      // 祭坛基座（三层）
      for (let i = 0; i < 3; i++) {
        const r = 12 - i * 2.5;
        const layer = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r + 1, 2, 8),
          new THREE.MeshStandardMaterial({ color: 0x2d1b3d, roughness: 0.85 })
        );
        layer.position.y = 1 + i * 2;
        altarGroup.add(layer);
      }

      // 祭坛顶部 - 破坏之球
      const orb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3, 0),
        new THREE.MeshBasicMaterial({ color: 0x9932cc, transparent: true, opacity: 0.8, wireframe: true })
      );
      orb.position.y = 8;
      altarGroup.add(orb);

      const orbInner = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xba55d3, transparent: true, opacity: 0.6 })
      );
      orbInner.position.y = 8;
      altarGroup.add(orbInner);

      so.altar = altarGroup;
      scene.add(altarGroup);

      // 破碎的城墙
      so.brokenWalls = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 60;
        const wallGroup = new THREE.Group();

        // 主墙段
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(15, 8 + Math.random() * 5, 3),
          new THREE.MeshStandardMaterial({ color: 0x4a3a5a, roughness: 0.95 })
        );
        wall.position.y = (8 + Math.random() * 5) / 2;
        wallGroup.add(wall);

        // 破损缺口
        const gap = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 3.1),
          new THREE.MeshStandardMaterial({ color: 0x3d2b4a, roughness: 0.95 })
        );
        gap.position.set(2 + Math.random() * 3, 6 + Math.random() * 3, 0);
        wallGroup.add(gap);

        wallGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        wallGroup.rotation.y = angle + Math.PI / 2;
        so.brokenWalls.push(wallGroup);
        scene.add(wallGroup);
      }

      // 地上坑洞
      so.craters = [];
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 70;
        const crater = new THREE.Mesh(
          new THREE.CircleGeometry(3 + Math.random() * 5, 16),
          new THREE.MeshBasicMaterial({ color: 0x1a0d28 })
        );
        crater.rotation.x = -Math.PI / 2;
        crater.position.set(Math.cos(angle) * dist, 0.04, Math.sin(angle) * dist);
        so.craters.push(crater);
        scene.add(crater);
      }

      // 碎石残骸
      so.debris = [];
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 75;
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.5 + Math.random() * 2.5, 0),
          new THREE.MeshStandardMaterial({ color: 0x3a2a4a, roughness: 0.9 })
        );
        rock.position.set(Math.cos(angle) * dist, 0.3 + Math.random() * 0.5, Math.sin(angle) * dist);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        so.debris.push(rock);
        scene.add(rock);
      }

      // 硝烟粒子
      so.smokeParticles = createParticles(70, 0x4a3a5a, 2, 25, 0.4);
      for (const p of so.smokeParticles) {
        p.material.opacity = 0.25;
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.altar) so.altar.visible = true;
      for (const w of so.brokenWalls) if (w) w.visible = true;
      for (const c of so.craters) if (c) c.visible = true;
      for (const d of so.debris) if (d) d.visible = true;
      for (const p of so.smokeParticles) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.altar) so.altar.visible = false;
      for (const w of so.brokenWalls) if (w) w.visible = false;
      for (const c of so.craters) if (c) c.visible = false;
      for (const d of so.debris) if (d) d.visible = false;
      for (const p of so.smokeParticles) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x2d1b3d, 120, 0x2d1b3d, 0x6a4a8a, 0.25, 0x8a6aaa, 0.35);
    },

    teleportTo() {
      doTeleport(this, 'temple_destruction', 'temple_destruction', '破坏战场', { x: 0, z: 45 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.smokeParticles, dt, time);

      // 破坏之球旋转
      if (this.sceneObjects.altar) {
        this.sceneObjects.altar.rotation.y += dt * 0.3;
      }
    },
  };

  // ============================================================
  // 6. 愤怒祭坛 - 愤怒之神
  // ============================================================
  const TempleWrathMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 100,

    sceneObjects: {
      ground: null,
      altar: null,
      flames: [],
      banners: [],
      redFog: [],
      fireRings: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 红黑色焦土地面
      so.ground = createGround(this.radius, 0x2a0a0a, 0);
      scene.add(so.ground);

      // 中心巨大祭坛
      const altarGroup = new THREE.Group();

      // 祭坛基座
      for (let i = 0; i < 4; i++) {
        const r = 15 - i * 2.5;
        const layer = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r + 1.5, 2, 8),
          new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x4a0000 : 0x330000, roughness: 0.8 })
        );
        layer.position.y = 1 + i * 2;
        altarGroup.add(layer);
      }

      // 祭坛顶座
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 7, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a0000, roughness: 0.7, metalness: 0.3 })
      );
      top.position.y = 9.75;
      altarGroup.add(top);

      // 中心愤怒之火
      const fireCore = new THREE.Mesh(
        new THREE.ConeGeometry(3, 6, 8),
        new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.9 })
      );
      fireCore.position.y = 13;
      altarGroup.add(fireCore);

      so.altar = altarGroup;
      scene.add(altarGroup);

      // 环绕祭坛的火焰圈
      so.fireRings = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = 22;
        const fireGroup = new THREE.Group();

        // 火焰主体
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(1.5, 4, 6),
          new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.85 })
        );
        flame.position.y = 2;
        fireGroup.add(flame);

        // 内焰
        const innerFlame = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 2.5, 6),
          new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.9 })
        );
        innerFlame.position.y = 1.8;
        fireGroup.add(innerFlame);

        fireGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        so.fireRings.push(fireGroup);
        scene.add(fireGroup);
      }

      // 周围战旗
      so.banners = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 50;
        const bannerGroup = new THREE.Group();

        // 旗杆
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 12, 6),
          new THREE.MeshStandardMaterial({ color: 0x1a0000, roughness: 0.8, metalness: 0.5 })
        );
        pole.position.y = 6;
        bannerGroup.add(pole);

        // 旗帜（红色）
        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 2.5),
          new THREE.MeshStandardMaterial({
            color: 0xcc0000,
            side: THREE.DoubleSide,
            roughness: 0.7,
          })
        );
        flag.position.set(2.2, 10, 0);
        bannerGroup.add(flag);

        // 旗顶装饰
        const tip = new THREE.Mesh(
          new THREE.ConeGeometry(0.5, 1.5, 6),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 })
        );
        tip.position.y = 12.5;
        bannerGroup.add(tip);

        bannerGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        bannerGroup.rotation.y = angle + Math.PI / 2;
        so.banners.push(bannerGroup);
        scene.add(bannerGroup);
      }

      // 红色雾气
      so.redFog = createParticles(90, 0xff2200, 1.2, 18, 0.6);
      for (const p of so.redFog) {
        p.material.opacity = 0.35;
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.altar) so.altar.visible = true;
      for (const f of so.fireRings) if (f) f.visible = true;
      for (const b of so.banners) if (b) b.visible = true;
      for (const p of so.redFog) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.altar) so.altar.visible = false;
      for (const f of so.fireRings) if (f) f.visible = false;
      for (const b of so.banners) if (b) b.visible = false;
      for (const p of so.redFog) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x330000, 100, 0x330000, 0xff3300, 0.3, 0xff4500, 0.5);
    },

    teleportTo() {
      doTeleport(this, 'temple_wrath', 'temple_wrath', '愤怒祭坛', { x: 0, z: 45 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.redFog, dt, time);

      // 火焰跳动效果
      for (let i = 0; i < this.sceneObjects.fireRings.length; i++) {
        const fire = this.sceneObjects.fireRings[i];
        const scale = 1 + Math.sin(time * 5 + i) * 0.15;
        fire.scale.y = scale;
      }

      // 祭坛火焰脉动
      if (this.sceneObjects.altar) {
        const fireCore = this.sceneObjects.altar.children[4];
        if (fireCore) {
          fireCore.scale.y = 1 + Math.sin(time * 4) * 0.2;
          fireCore.material.opacity = 0.8 + Math.sin(time * 3) * 0.1;
        }
      }
    },
  };

  // ============================================================
  // 7. 雷霆峡谷 - 雷神
  // ============================================================
  const TempleThunderMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 120,

    sceneObjects: {
      ground: null,
      thunderMountain: null,
      statue: null,
      canyonWalls: [],
      lightningBolts: [],
      thunderParticles: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 紫蓝色峡谷地面
      so.ground = createGround(this.radius, 0x1a1a3a, 0);
      scene.add(so.ground);

      // 高耸的雷神山（位于中心偏后）
      const mountainGroup = new THREE.Group();
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(25, 50, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a2a5a, roughness: 0.9 })
      );
      mountain.position.y = 25;
      mountainGroup.add(mountain);

      // 山尖闪电球
      const topOrb = new THREE.Mesh(
        new THREE.SphereGeometry(3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
      );
      topOrb.position.y = 52;
      mountainGroup.add(topOrb);

      so.thunderMountain = mountainGroup;
      mountainGroup.position.set(0, 0, -30);
      scene.add(mountainGroup);

      // 雷神雕像
      const statueGroup = new THREE.Group();

      // 基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 6, 3, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a3a6a, roughness: 0.8 })
      );
      base.position.y = 1.5;
      statueGroup.add(base);

      // 雕像身体
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(4, 8, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x4a4a7a, roughness: 0.7 })
      );
      body.position.y = 8.5;
      statueGroup.add(body);

      // 雕像头部
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a4a7a, roughness: 0.7 })
      );
      head.position.y = 14;
      statueGroup.add(head);

      // 手持的雷霆之锤
      const hammerHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 })
      );
      hammerHandle.position.set(3, 10, 0);
      hammerHandle.rotation.z = -Math.PI / 4;
      statueGroup.add(hammerHandle);

      const hammerHead = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x708090, roughness: 0.5, metalness: 0.7 })
      );
      hammerHead.position.set(5.2, 12, 0);
      statueGroup.add(hammerHead);

      so.statue = statueGroup;
      statueGroup.position.set(0, 0, 10);
      scene.add(statueGroup);

      // 峡谷两侧岩壁
      so.canyonWalls = [];
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 10; i++) {
          const wall = new THREE.Mesh(
            new THREE.BoxGeometry(15, 15 + Math.random() * 10, 8),
            new THREE.MeshStandardMaterial({ color: 0x252550, roughness: 0.95 })
          );
          wall.position.set(
            side * (70 + Math.random() * 20),
            (15 + Math.random() * 10) / 2,
            -50 + i * 12 + Math.random() * 5
          );
          so.canyonWalls.push(wall);
          scene.add(wall);
        }
      }

      // 闪电粒子（紫蓝色）
      so.thunderParticles = createParticles(100, 0x00ffff, 0.6, 40, 1.5);
      for (const p of so.thunderParticles) {
        scene.add(p);
      }

      // 闪电光柱
      so.lightningBolts = [];
      for (let i = 0; i < 3; i++) {
        const boltGeom = new THREE.CylinderGeometry(0.3, 0.5, 50, 6);
        const boltMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0,
        });
        const bolt = new THREE.Mesh(boltGeom, boltMat);
        bolt.position.set(
          (Math.random() - 0.5) * 60,
          25,
          (Math.random() - 0.5) * 60
        );
        so.lightningBolts.push(bolt);
        scene.add(bolt);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.thunderMountain) so.thunderMountain.visible = true;
      if (so.statue) so.statue.visible = true;
      for (const w of so.canyonWalls) if (w) w.visible = true;
      for (const b of so.lightningBolts) if (b) b.visible = true;
      for (const p of so.thunderParticles) if (p) p.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.thunderMountain) so.thunderMountain.visible = false;
      if (so.statue) so.statue.visible = false;
      for (const w of so.canyonWalls) if (w) w.visible = false;
      for (const b of so.lightningBolts) if (b) b.visible = false;
      for (const p of so.thunderParticles) if (p) p.visible = false;
    },

    _setEnv() {
      setEnvironment(0x0a0a2a, 130, 0x0a0a2a, 0x3333aa, 0.3, 0x4444cc, 0.5);
    },

    teleportTo() {
      doTeleport(this, 'temple_thunder', 'temple_thunder', '雷霆峡谷', { x: 0, z: 50 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.thunderParticles, dt, time);

      // 随机闪电
      if (Math.random() < 0.03) {
        const bolt = this.sceneObjects.lightningBolts[Math.floor(Math.random() * this.sceneObjects.lightningBolts.length)];
        if (bolt && bolt.material) {
          bolt.material.opacity = 0.8;
          bolt.position.x = (Math.random() - 0.5) * 80;
          bolt.position.z = (Math.random() - 0.5) * 80;
          setTimeout(() => {
            if (bolt.material) bolt.material.opacity = 0;
          }, 150);
        }
      }
    },
  };

  // ============================================================
  // 8. 风之平原 - 风神
  // ============================================================
  const TempleWindMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 130,

    sceneObjects: {
      ground: null,
      windTower: null,
      windmills: [],
      grass: [],
      windParticles: [],
      clouds: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 青绿色草原地面
      so.ground = createGround(this.radius, 0x7ccd7c, 0);
      scene.add(so.ground);

      // 中心风之塔
      const towerGroup = new THREE.Group();

      // 塔基
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 10, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x8fbc8f, roughness: 0.8 })
      );
      base.position.y = 2;
      towerGroup.add(base);

      // 塔身（三层逐渐变细）
      for (let i = 0; i < 3; i++) {
        const r = 6 - i * 1;
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r + 0.5, 6, 8),
          new THREE.MeshStandardMaterial({ color: 0x98fb98, roughness: 0.7 })
        );
        body.position.y = 5 + i * 6;
        towerGroup.add(body);
      }

      // 塔顶风之水晶
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.5, 0),
        new THREE.MeshBasicMaterial({ color: 0x40e0d0, transparent: true, opacity: 0.8 })
      );
      crystal.position.y = 24;
      towerGroup.add(crystal);

      // 塔顶风向标
      const vane = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.2, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x20b2aa, roughness: 0.4, metalness: 0.6 })
      );
      vane.position.y = 27;
      towerGroup.add(vane);

      so.windTower = towerGroup;
      scene.add(towerGroup);

      // 周围风车
      so.windmills = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = 55 + Math.random() * 20;
        const windmillGroup = new THREE.Group();

        // 风车塔
        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 2, 10, 6),
          new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.8 })
        );
        tower.position.y = 5;
        windmillGroup.add(tower);

        // 风车叶片组
        const bladesGroup = new THREE.Group();
        for (let j = 0; j < 4; j++) {
          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 5, 1),
            new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.7 })
          );
          blade.position.y = 2.5;
          blade.rotation.z = (j / 4) * Math.PI * 2;
          blade.position.x = Math.cos((j / 4) * Math.PI * 2) * 2.5;
          blade.position.y = Math.sin((j / 4) * Math.PI * 2) * 2.5 + 2.5;
          bladesGroup.add(blade);
        }
        bladesGroup.position.set(0, 10.5, 0);
        windmillGroup.add(bladesGroup);
        windmillGroup.userData.blades = bladesGroup;

        windmillGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        windmillGroup.rotation.y = angle + Math.PI;
        so.windmills.push(windmillGroup);
        scene.add(windmillGroup);
      }

      // 草丛装饰
      so.grass = [];
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 90;
        const grassClump = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 1.2, 4),
          new THREE.MeshStandardMaterial({ color: 0x3cb371, roughness: 0.9 })
        );
        grassClump.position.set(Math.cos(angle) * dist, 0.6, Math.sin(angle) * dist);
        so.grass.push(grassClump);
        scene.add(grassClump);
      }

      // 风粒子（半透明青色）
      so.windParticles = [];
      const windGeom = new THREE.PlaneGeometry(3, 0.3);
      const windMat = new THREE.MeshBasicMaterial({
        color: 0x40e0d0,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      for (let i = 0; i < 80; i++) {
        const p = new THREE.Mesh(windGeom, windMat.clone());
        p.position.set(
          (Math.random() - 0.5) * 200,
          Math.random() * 20 + 2,
          (Math.random() - 0.5) * 200
        );
        p.rotation.y = Math.random() * Math.PI;
        p.userData.speed = 10 + Math.random() * 15;
        so.windParticles.push(p);
        scene.add(p);
      }

      // 低空云朵
      so.clouds = [];
      for (let i = 0; i < 8; i++) {
        const cloud = new THREE.Group();
        for (let j = 0; j < 5; j++) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(2 + Math.random() * 2, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
          );
          puff.position.set(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 4
          );
          cloud.add(puff);
        }
        cloud.position.set(
          (Math.random() - 0.5) * 180,
          25 + Math.random() * 10,
          (Math.random() - 0.5) * 180
        );
        cloud.userData.speed = 0.5 + Math.random() * 0.5;
        so.clouds.push(cloud);
        scene.add(cloud);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.windTower) so.windTower.visible = true;
      for (const w of so.windmills) if (w) w.visible = true;
      for (const g of so.grass) if (g) g.visible = true;
      for (const p of so.windParticles) if (p) p.visible = true;
      for (const c of so.clouds) if (c) c.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.windTower) so.windTower.visible = false;
      for (const w of so.windmills) if (w) w.visible = false;
      for (const g of so.grass) if (g) g.visible = false;
      for (const p of so.windParticles) if (p) p.visible = false;
      for (const c of so.clouds) if (c) c.visible = false;
    },

    _setEnv() {
      setEnvironment(0x87ceeb, 250, 0x87ceeb, 0x98fb98, 0.6, 0xffffff, 0.9);
    },

    teleportTo() {
      doTeleport(this, 'temple_wind', 'temple_wind', '风之平原', { x: 0, z: 55 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 风车旋转
      for (const wm of this.sceneObjects.windmills) {
        if (wm.userData.blades) {
          wm.userData.blades.rotation.z += dt * 1.5;
        }
      }

      // 风粒子移动
      for (const p of this.sceneObjects.windParticles) {
        p.position.x += p.userData.speed * dt;
        if (p.position.x > 100) {
          p.position.x = -100;
          p.position.z = (Math.random() - 0.5) * 200;
        }
      }

      // 云朵飘动
      for (const c of this.sceneObjects.clouds) {
        c.position.x += c.userData.speed * dt * 5;
        if (c.position.x > 140) {
          c.position.x = -140;
          c.position.z = (Math.random() - 0.5) * 180;
        }
      }

      // 塔顶水晶旋转
      if (this.sceneObjects.windTower) {
        const crystal = this.sceneObjects.windTower.children[3];
        if (crystal) crystal.rotation.y += dt * 0.5;
      }
    },
  };

  // ============================================================
  // 9. 深海神殿 - 水神
  // ============================================================
  const TempleWaterMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 110,

    sceneObjects: {
      ground: null,
      waterSurface: null,
      temple: null,
      seaweed: [],
      corals: [],
      bubbles: [],
      fish: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 深海蓝色沙地
      so.ground = createGround(this.radius, 0x1e4d6b, 0);
      scene.add(so.ground);

      // 水面效果（半透明）
      const waterGeom = new THREE.CircleGeometry(this.radius, 64);
      waterGeom.rotateX(-Math.PI / 2);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x006994,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.5,
      });
      so.waterSurface = new THREE.Mesh(waterGeom, waterMat);
      so.waterSurface.position.y = 30;
      scene.add(so.waterSurface);

      // 水下神殿
      const templeGroup = new THREE.Group();

      // 神殿基座
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(18, 20, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x20b2aa, roughness: 0.5, metalness: 0.3 })
      );
      base.position.y = 2;
      templeGroup.add(base);

      // 神殿主体
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(14, 16, 14, 8),
        new THREE.MeshStandardMaterial({ color: 0x48d1cc, roughness: 0.4, metalness: 0.4 })
      );
      body.position.y = 11;
      templeGroup.add(body);

      // 穹顶
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(14, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x40e0d0, roughness: 0.3, metalness: 0.5, transparent: true, opacity: 0.7 })
      );
      dome.position.y = 18;
      templeGroup.add(dome);

      // 顶部海神三叉戟装饰
      const trident = new THREE.Group();
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 5, 6),
        new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
      );
      handle.position.y = 2;
      trident.add(handle);

      for (let i = -1; i <= 1; i++) {
        const prong = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 1.5, 6),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.9 })
        );
        prong.position.set(i * 0.6, 5, 0);
        trident.add(prong);
      }
      trident.position.y = 27;
      templeGroup.add(trident);

      so.temple = templeGroup;
      scene.add(templeGroup);

      // 海草装饰
      so.seaweed = [];
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        const seaweedGroup = new THREE.Group();
        const h = 3 + Math.random() * 5;
        for (let j = 0; j < 5; j++) {
          const leaf = new THREE.Mesh(
            new THREE.PlaneGeometry(0.5, h / 5),
            new THREE.MeshStandardMaterial({
              color: 0x006400,
              side: THREE.DoubleSide,
              roughness: 0.8,
            })
          );
          leaf.position.y = j * (h / 5) + h / 10;
          leaf.rotation.y = (j * 0.3);
          seaweedGroup.add(leaf);
        }
        seaweedGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        seaweedGroup.userData.baseY = 0;
        seaweedGroup.userData.phase = Math.random() * Math.PI * 2;
        so.seaweed.push(seaweedGroup);
        scene.add(seaweedGroup);
      }

      // 珊瑚装饰
      so.corals = [];
      const coralColors = [0xff6b6b, 0xff8c94, 0xffb6c1, 0xff7f50, 0xdda0dd];
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 70;
        const coralGroup = new THREE.Group();

        const baseCoral = new THREE.Mesh(
          new THREE.ConeGeometry(1 + Math.random(), 2 + Math.random() * 2, 6),
          new THREE.MeshStandardMaterial({
            color: coralColors[Math.floor(Math.random() * coralColors.length)],
            roughness: 0.7,
          })
        );
        baseCoral.position.y = 1 + Math.random();
        coralGroup.add(baseCoral);

        // 小分叉
        for (let j = 0; j < 3; j++) {
          const branch = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1.5, 5),
            new THREE.MeshStandardMaterial({
              color: coralColors[Math.floor(Math.random() * coralColors.length)],
              roughness: 0.7,
            })
          );
          branch.position.set(
            (Math.random() - 0.5) * 1.5,
            2 + Math.random() * 1.5,
            (Math.random() - 0.5) * 1.5
          );
          branch.rotation.z = (Math.random() - 0.5) * 0.5;
          coralGroup.add(branch);
        }

        coralGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
        coralGroup.rotation.y = Math.random() * Math.PI;
        so.corals.push(coralGroup);
        scene.add(coralGroup);
      }

      // 水泡粒子
      so.bubbles = [];
      const bubbleGeom = new THREE.SphereGeometry(0.3, 8, 8);
      const bubbleMat = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.4,
      });
      for (let i = 0; i < 60; i++) {
        const bubble = new THREE.Mesh(bubbleGeom, bubbleMat.clone());
        bubble.position.set(
          (Math.random() - 0.5) * 160,
          Math.random() * 25,
          (Math.random() - 0.5) * 160
        );
        bubble.scale.setScalar(0.5 + Math.random());
        bubble.userData.speed = 2 + Math.random() * 3;
        so.bubbles.push(bubble);
        scene.add(bubble);
      }

      // 鱼群
      so.fish = [];
      const fishColors = [0xff6347, 0xffd700, 0x00ced1, 0xff69b4, 0x9370db];
      for (let i = 0; i < 20; i++) {
        const fishGroup = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.6, 8, 6),
          new THREE.MeshStandardMaterial({
            color: fishColors[Math.floor(Math.random() * fishColors.length)],
            roughness: 0.5,
          })
        );
        body.scale.set(1.5, 0.7, 1);
        fishGroup.add(body);

        // 鱼尾
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 0.6, 4),
          new THREE.MeshStandardMaterial({
            color: fishColors[Math.floor(Math.random() * fishColors.length)],
            roughness: 0.5,
          })
        );
        tail.position.set(-0.7, 0, 0);
        tail.rotation.z = Math.PI / 2;
        fishGroup.add(tail);

        fishGroup.position.set(
          (Math.random() - 0.5) * 150,
          5 + Math.random() * 20,
          (Math.random() - 0.5) * 150
        );
        fishGroup.userData.speed = 3 + Math.random() * 4;
        fishGroup.userData.direction = Math.random() * Math.PI * 2;
        so.fish.push(fishGroup);
        scene.add(fishGroup);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.waterSurface) so.waterSurface.visible = true;
      if (so.temple) so.temple.visible = true;
      for (const s of so.seaweed) if (s) s.visible = true;
      for (const c of so.corals) if (c) c.visible = true;
      for (const b of so.bubbles) if (b) b.visible = true;
      for (const f of so.fish) if (f) f.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.waterSurface) so.waterSurface.visible = false;
      if (so.temple) so.temple.visible = false;
      for (const s of so.seaweed) if (s) s.visible = false;
      for (const c of so.corals) if (c) c.visible = false;
      for (const b of so.bubbles) if (b) b.visible = false;
      for (const f of so.fish) if (f) f.visible = false;
    },

    _setEnv() {
      setEnvironment(0x003366, 120, 0x003366, 0x1e90ff, 0.35, 0x4169e1, 0.5);
    },

    teleportTo() {
      doTeleport(this, 'temple_water', 'temple_water', '深海神殿', { x: 0, z: 45 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;

      // 水泡上升
      for (const b of this.sceneObjects.bubbles) {
        b.position.y += b.userData.speed * dt;
        b.position.x += Math.sin(time + b.position.z) * 0.5 * dt;
        if (b.position.y > 28) {
          b.position.y = 0;
          b.position.x = (Math.random() - 0.5) * 160;
          b.position.z = (Math.random() - 0.5) * 160;
        }
      }

      // 鱼群游动
      for (const f of this.sceneObjects.fish) {
        f.position.x += Math.cos(f.userData.direction) * f.userData.speed * dt;
        f.position.z += Math.sin(f.userData.direction) * f.userData.speed * dt;
        f.rotation.y = f.userData.direction + Math.PI / 2;

        // 边界反弹
        if (Math.abs(f.position.x) > 90 || Math.abs(f.position.z) > 90) {
          f.userData.direction += Math.PI;
        }

        // 偶尔转向
        if (Math.random() < 0.005) {
          f.userData.direction += (Math.random() - 0.5) * 0.5;
        }
      }

      // 海草摆动
      for (const s of this.sceneObjects.seaweed) {
        s.rotation.z = Math.sin(time * 1.5 + s.userData.phase) * 0.15;
      }

      // 水面波动
      if (this.sceneObjects.waterSurface && this.sceneObjects.waterSurface.material) {
        this.sceneObjects.waterSurface.material.opacity = 0.35 + Math.sin(time) * 0.05;
      }
    },
  };

  // ============================================================
  // 10. 大地神殿 - 土神
  // ============================================================
  const TempleEarthMap = {
    active: false,
    initialized: false,
    centerX: 0,
    centerZ: 0,
    radius: 110,

    sceneObjects: {
      ground: null,
      temple: null,
      mountains: [],
      boulders: [],
      earthStatue: null,
      dustParticles: [],
      cracks: [],
    },

    prevState: {},

    init() {
      const scene = game.scene;
      const so = this.sceneObjects;

      // 土黄色岩石地面
      so.ground = createGround(this.radius, 0x8b7355, 0);
      scene.add(so.ground);

      // 地裂纹理
      so.cracks = [];
      for (let i = 0; i < 20; i++) {
        const crack = new THREE.Mesh(
          new THREE.PlaneGeometry(2 + Math.random() * 3, 0.3),
          new THREE.MeshBasicMaterial({ color: 0x5c4033 })
        );
        crack.rotation.x = -Math.PI / 2;
        const angle = Math.random() * Math.PI * 2;
        const dist = 15 + Math.random() * 80;
        crack.position.set(Math.cos(angle) * dist, 0.03, Math.sin(angle) * dist);
        crack.rotation.z = Math.random() * Math.PI;
        so.cracks.push(crack);
        scene.add(crack);
      }

      // 巨大岩石神殿
      const templeGroup = new THREE.Group();

      // 基座（从地面升起的巨大岩石）
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 23, 5, 6),
        new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 0.95 })
      );
      base.position.y = 2.5;
      templeGroup.add(base);

      // 神殿主体（岩石雕刻）
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(18, 15, 14),
        new THREE.MeshStandardMaterial({ color: 0x7a6b5a, roughness: 0.9 })
      );
      body.position.y = 12.5;
      templeGroup.add(body);

      // 神殿入口
      const entrance = new THREE.Mesh(
        new THREE.BoxGeometry(4, 6, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1 })
      );
      entrance.position.set(0, 5.5, 7.2);
      templeGroup.add(entrance);

      // 神殿顶部
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(14, 6, 4),
        new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 })
      );
      roof.position.y = 23;
      roof.rotation.y = Math.PI / 4;
      templeGroup.add(roof);

      so.temple = templeGroup;
      scene.add(templeGroup);

      // 土神石像（神殿前）
      const statueGroup = new THREE.Group();

      // 石像基座
      const statueBase = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3.5, 2, 6),
        new THREE.MeshStandardMaterial({ color: 0x6b5b4b, roughness: 0.9 })
      );
      statueBase.position.y = 1;
      statueGroup.add(statueBase);

      // 石像身体
      const statueBody = new THREE.Mesh(
        new THREE.BoxGeometry(3, 6, 2),
        new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.85 })
      );
      statueBody.position.y = 6;
      statueGroup.add(statueBody);

      // 石像头部
      const statueHead = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x9b8365, roughness: 0.8 })
      );
      statueHead.position.y = 10.5;
      statueGroup.add(statueHead);

      // 石像双手抱岩石
      const rockInHands = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2, 0),
        new THREE.MeshStandardMaterial({ color: 0x7a6b5a, roughness: 0.9 })
      );
      rockInHands.position.set(0, 6.5, 1.5);
      statueGroup.add(rockInHands);

      so.earthStatue = statueGroup;
      statueGroup.position.set(0, 0, 18);
      scene.add(statueGroup);

      // 周围山脉地形
      so.mountains = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = 70 + Math.random() * 20;
        const mountain = new THREE.Mesh(
          new THREE.ConeGeometry(15 + Math.random() * 10, 25 + Math.random() * 15, 7),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x6b5b4b : 0x5a4a3a,
            roughness: 0.95,
          })
        );
        mountain.position.set(
          Math.cos(angle) * dist,
          (25 + Math.random() * 15) / 2,
          Math.sin(angle) * dist
        );
        so.mountains.push(mountain);
        scene.add(mountain);
      }

      // 巨石
      so.boulders = [];
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 65;
        const boulder = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1 + Math.random() * 3, 0),
          new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0x7a6b5a : 0x6b5b4b,
            roughness: 0.95,
          })
        );
        boulder.position.set(
          Math.cos(angle) * dist,
          0.5 + Math.random() * 1.5,
          Math.sin(angle) * dist
        );
        boulder.rotation.set(Math.random(), Math.random(), Math.random());
        so.boulders.push(boulder);
        scene.add(boulder);
      }

      // 尘土粒子（土黄色）
      so.dustParticles = createParticles(70, 0xd2b48c, 0.8, 10, 0.4);
      for (const p of so.dustParticles) {
        p.material.opacity = 0.25;
        scene.add(p);
      }
    },

    _show() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = true;
      if (so.temple) so.temple.visible = true;
      if (so.earthStatue) so.earthStatue.visible = true;
      for (const m of so.mountains) if (m) m.visible = true;
      for (const b of so.boulders) if (b) b.visible = true;
      for (const p of so.dustParticles) if (p) p.visible = true;
      for (const c of so.cracks) if (c) c.visible = true;
    },

    _hide() {
      const so = this.sceneObjects;
      if (so.ground) so.ground.visible = false;
      if (so.temple) so.temple.visible = false;
      if (so.earthStatue) so.earthStatue.visible = false;
      for (const m of so.mountains) if (m) m.visible = false;
      for (const b of so.boulders) if (b) b.visible = false;
      for (const p of so.dustParticles) if (p) p.visible = false;
      for (const c of so.cracks) if (c) c.visible = false;
    },

    _setEnv() {
      setEnvironment(0x8b7355, 150, 0xc4a882, 0xd2b48c, 0.5, 0xdeb887, 0.7);
    },

    teleportTo() {
      doTeleport(this, 'temple_earth', 'temple_earth', '大地神殿', { x: 0, z: 45 });
    },

    leave() {
      if (!this.active) return;
      this._hide();
      restorePrevScene(this);
      this.active = false;
      game.currentZone = 'village';
    },

    update(dt) {
      if (!this.active) return;
      const time = performance.now() / 1000;
      updateParticles(this.sceneObjects.dustParticles, dt, time);
    },
  };

  // ============================================================
  // 导出到全局
  // ============================================================
  window.KillingCityMap = KillingCityMap;
  window.TempleDestructionLordMap = TempleDestructionLordMap;
  window.LifeForestMap = LifeForestMap;
  window.TempleGluttonyMap = TempleGluttonyMap;
  window.TempleDestructionMap = TempleDestructionMap;
  window.TempleWrathMap = TempleWrathMap;
  window.TempleThunderMap = TempleThunderMap;
  window.TempleWindMap = TempleWindMap;
  window.TempleWaterMap = TempleWaterMap;
  window.TempleEarthMap = TempleEarthMap;

  // 地图注册表，便于遍历
  window.DivineMaps = {
    killing_city: KillingCityMap,
    temple_destruction_lord: TempleDestructionLordMap,
    life_forest: LifeForestMap,
    temple_gluttony: TempleGluttonyMap,
    temple_destruction: TempleDestructionMap,
    temple_wrath: TempleWrathMap,
    temple_thunder: TempleThunderMap,
    temple_wind: TempleWindMap,
    temple_water: TempleWaterMap,
    temple_earth: TempleEarthMap,
  };

})();
