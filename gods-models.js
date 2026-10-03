// ========== 众神精细建模系统 ==========
// 每位神都有独特的造型、武器、装饰和特效
// 根据原著和神位特点设计，威武霸气，符合神的威名

const GodModels = {
  // 创建神的Boss模型（根据神ID调用对应的创建函数）
  createGodBoss(god) {
    const group = new THREE.Group();
    const scale = 2.0;
    
    // 根据神的ID调用对应的创建函数
    // 注意：只有已实现精细建模的神才列在这里，其他走默认模板
    switch(god.id) {
      case 'asura': this.createAsuraGod(group, god, scale); break;
      case 'destruction_lord': this.createDestructionLord(group, god, scale); break;
      case 'life': this.createLifeGoddess(group, god, scale); break;
      case 'sea': this.createSeaGod(group, god, scale); break;
      case 'fire': this.createFireGod(group, god, scale); break;
      case 'thunder': this.createThunderGod(group, god, scale); break;
      case 'angel': this.createAngelGod(group, god, scale); break;
      case 'rakshasa': this.createRakshasaGod(group, god, scale); break;
      case 'phoenix': this.createPhoenixGod(group, god, scale); break;
      case 'beast': this.createBeastGod(group, god, scale); break;
      default: this.createDefaultGod(group, god, scale); break;
    }
    
    // 设置通用属性
    group.userData = {
      type: 'god_boss',
      godId: god.id,
      god: god,
      hp: 0,
      maxHp: 0,
      atk: 0,
      def: 0,
      level: 100,
      isGodBoss: true,
      animPhase: 0,
      ...group.userData, // 保留各神建模函数中已设置的userData
    };
    
    // 核心神列表（有专属武器和精细建模的神）
    const coreGods = ['asura', 'destruction_lord', 'life', 'sea', 'fire', 'thunder', 'angel', 'rakshasa', 'phoenix', 'beast'];
    const isCoreGod = coreGods.includes(god.id);
    
    // 设置动画部件
    this.setupAnimationParts(group, isCoreGod);
    
    // 核心神：将武器绑定到右手
    if (isCoreGod && group.userData.weapon) {
      this.bindWeaponToRightHand(group);
    }
    
    // 非核心神：移除武器
    if (!isCoreGod && group.userData.weapon) {
      group.remove(group.userData.weapon);
      delete group.userData.weapon;
    }
    
    return group;
  },
  
  // 设置动画部件引用（精确识别）
  setupAnimationParts(group, isCoreGod) {
    const ud = group.userData;
    
    // 收集所有网格及其信息
    const meshes = [];
    group.traverse((child) => {
      if (child.isMesh && child !== group) {
        meshes.push({
          mesh: child,
          geomType: child.geometry.type,
          posY: child.position.y,
          posX: child.position.x,
          posZ: child.position.z,
          height: this.estimateHeight(child.geometry),
        });
      }
    });
    
    // 按y坐标排序
    meshes.sort((a, b) => a.posY - b.posY);
    
    // 找腿：最下方的两个圆柱体，在左右两侧
    const lowerCylinders = meshes.filter(m => m.geomType === 'CylinderGeometry' && m.posY < 2.5 && Math.abs(m.posX) > 0.15);
    lowerCylinders.sort((a, b) => a.posY - b.posY);
    
    let leftLeg = null, rightLeg = null;
    for (const m of lowerCylinders) {
      if (m.posX < 0 && !leftLeg) leftLeg = m.mesh;
      if (m.posX > 0 && !rightLeg) rightLeg = m.mesh;
      if (leftLeg && rightLeg) break;
    }
    
    // 找手臂：中间偏上的两个圆柱体，在左右两侧，x偏移大
    const upperCylinders = meshes.filter(m => m.geomType === 'CylinderGeometry' && m.posY > 2.8 && m.posY < 4.5 && Math.abs(m.posX) > 0.35);
    
    let leftArm = null, rightArm = null;
    for (const m of upperCylinders) {
      if (m.posX < 0 && !leftArm) leftArm = m.mesh;
      if (m.posX > 0 && !rightArm) rightArm = m.mesh;
      if (leftArm && rightArm) break;
    }
    
    // 找身体：中间最大的立方体或圆柱体
    const bodies = meshes.filter(m => 
      (m.geomType === 'BoxGeometry' || m.geomType === 'CylinderGeometry') && 
      m.posY > 1.5 && m.posY < 3.8 && Math.abs(m.posX) < 0.25 && Math.abs(m.posZ) < 0.2
    );
    bodies.sort((a, b) => b.height - a.height);
    const body = bodies.length > 0 ? bodies[0].mesh : null;
    
    // 找头：最上方的球体
    const heads = meshes.filter(m => m.geomType === 'SphereGeometry' && m.posY > 3.8);
    heads.sort((a, b) => b.posY - a.posY);
    const head = heads.length > 0 ? heads[0].mesh : null;
    
    // 找披风：在身后的平面
    const capes = meshes.filter(m => m.geomType === 'PlaneGeometry' && m.posZ < -0.15);
    capes.sort((a, b) => b.height - a.height);
    const cape = capes.length > 0 ? capes[0].mesh : null;
    
    // 存入 userData
    if (leftLeg) ud.leftLeg = leftLeg;
    if (rightLeg) ud.rightLeg = rightLeg;
    if (leftArm) ud.leftArm = leftArm;
    if (rightArm) ud.rightArm = rightArm;
    if (body) ud.body = body;
    if (head) ud.head = head;
    if (cape) ud.cape = cape;
    
    // 保存初始位置和旋转（用于相对动画）
    if (ud.body) {
      ud.body._basePosY = ud.body.position.y;
      ud.body._baseRotZ = ud.body.position.z;
    }
    if (ud.head) {
      ud.head._basePosY = ud.head.position.y;
    }
    if (ud.leftArm) {
      ud.leftArm._baseRotX = ud.leftArm.rotation.x;
      ud.leftArm._baseRotZ = ud.leftArm.rotation.z;
    }
    if (ud.rightArm) {
      ud.rightArm._baseRotX = ud.rightArm.rotation.x;
      ud.rightArm._baseRotZ = ud.rightArm.rotation.z;
    }
    if (ud.leftLeg) {
      ud.leftLeg._baseRotX = ud.leftLeg.rotation.x;
    }
    if (ud.rightLeg) {
      ud.rightLeg._baseRotX = ud.rightLeg.rotation.x;
    }
    
    // 添加动画相位
    ud.walkPhase = 0;
    ud.idlePhase = Math.random() * Math.PI * 2;
    ud.attackPhase = 0;
    ud.isAttacking = false;
    ud.isGodMesh = true;
  },
  
  // 估算几何体高度
  estimateHeight(geom) {
    geom.computeBoundingBox();
    const bb = geom.boundingBox;
    return bb.max.y - bb.min.y;
  },
  
  // 将武器绑定到右手
  bindWeaponToRightHand(group) {
    const ud = group.userData;
    const weapon = ud.weapon;
    const rightArm = ud.rightArm;
    
    if (!weapon || !rightArm) return;
    
    // 将武器从 group 中取出，作为右臂的子物体
    // 这样右臂挥动时，武器会自动跟随
    group.remove(weapon);
    rightArm.add(weapon);
    
    // 调整武器相对于右臂的位置和角度
    // 右臂是倾斜的（rotation.z 为负），武器放在手臂末端附近
    weapon.position.set(0.15, -0.7, 0.05);
    // 调整武器角度，使其指向正确方向
    weapon.rotation.set(-0.2, 0.3, -0.4);
    
    // 标记武器已绑定
    ud.weaponBound = true;
  },

  // 辅助函数：创建发光材质
  createGlowMaterial(color, intensity = 0.5, metalness = 0.8, roughness = 0.2) {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
      emissive: color,
      emissiveIntensity: intensity,
    });
  },

  // 辅助函数：创建基础材质
  createBasicMaterial(color, metalness = 0.7, roughness = 0.3) {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
    });
  },

  // ========== 神王级建模 ==========

  // 修罗神 - 杀戮之神，修罗魔剑，血红铠甲，威严恐怖
  createAsuraGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xff3333);
    const darkColor = new THREE.Color(0x4a0000);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部 - 血色战铠 =====
    const legHeight = 1.8 * s;
    const legGeom = new THREE.CylinderGeometry(0.18 * s, 0.22 * s, legHeight, 10);
    const legMat = this.createGlowMaterial(darkColor, 0.2, 0.9, 0.1);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.35 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.35 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 腿甲装饰
    for (let i = 0; i < 3; i++) {
      const bandGeom = new THREE.TorusGeometry(0.2 * s, 0.03 * s, 6, 16);
      const bandMat = this.createGlowMaterial(goldColor, 0.3);
      const band1 = new THREE.Mesh(bandGeom, bandMat);
      band1.rotation.x = Math.PI / 2;
      band1.position.set(-0.35 * s, 0.4 + i * 0.5, 0);
      group.add(band1);
      const band2 = new THREE.Mesh(bandGeom, bandMat);
      band2.rotation.x = Math.PI / 2;
      band2.position.set(0.35 * s, 0.4 + i * 0.5, 0);
      group.add(band2);
    }
    
    // ===== 躯干 - 修罗神铠 =====
    const torsoHeight = 1.6 * s;
    const torsoGeom = new THREE.BoxGeometry(1.0 * s, torsoHeight, 0.5 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.15, 0.9, 0.1);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲凸起
    const chestGeom = new THREE.BoxGeometry(0.9 * s, 0.8 * s, 0.15 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.3, 0.9, 0.1);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.6, 0.28 * s);
    group.add(chest);
    
    // 修罗神纹（胸前血色魔纹）
    const emblemGeom = new THREE.CircleGeometry(0.3 * s, 6);
    const emblemMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const emblem = new THREE.Mesh(emblemGeom, emblemMat);
    emblem.position.set(0, legHeight + torsoHeight * 0.6, 0.38 * s);
    emblem.rotation.z = Math.PI / 6;
    group.add(emblem);
    
    // 肩甲 - 狰狞兽头肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.3 * s, 8, 8);
    const shoulderMat = this.createGlowMaterial(godColor, 0.25, 0.9, 0.1);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.55 * s, legHeight + torsoHeight * 0.85, 0);
    leftShoulder.scale.set(1, 0.8, 1.2);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.55 * s, legHeight + torsoHeight * 0.85, 0);
    rightShoulder.scale.set(1, 0.8, 1.2);
    group.add(rightShoulder);
    
    // 肩甲尖刺
    for (let i = 0; i < 3; i++) {
      const spikeGeom = new THREE.ConeGeometry(0.05 * s, 0.3 * s, 6);
      const spikeMat = this.createGlowMaterial(goldColor, 0.4);
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(-0.55 * s + (i - 1) * 0.15, legHeight + torsoHeight * 0.85 + 0.25, 0.1);
      group.add(spike);
      const spike2 = new THREE.Mesh(spikeGeom, spikeMat);
      spike2.position.set(0.55 * s + (i - 1) * 0.15, legHeight + torsoHeight * 0.85 + 0.25, 0.1);
      group.add(spike2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.4 * s;
    const armGeom = new THREE.CylinderGeometry(0.12 * s, 0.09 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.15, 0.9, 0.1);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.65 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.65 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 护手
    const gauntletGeom = new THREE.BoxGeometry(0.18 * s, 0.3 * s, 0.15 * s);
    const gauntletMat = this.createGlowMaterial(godColor, 0.25, 0.9, 0.1);
    const leftGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    leftGauntlet.position.set(-0.72 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.4, 0);
    group.add(leftGauntlet);
    const rightGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    rightGauntlet.position.set(0.72 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.4, 0);
    group.add(rightGauntlet);
    
    // ===== 头部 - 修罗面具 =====
    const headSize = 0.4 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.6);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 修罗面具（半面面具）
    const maskGeom = new THREE.SphereGeometry(headSize * 1.05, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const maskMat = this.createGlowMaterial(godColor, 0.4, 0.9, 0.1);
    const mask = new THREE.Mesh(maskGeom, maskMat);
    mask.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(mask);
    
    // 面具纹路
    const maskLineGeom = new THREE.TorusGeometry(headSize * 0.8, 0.02 * s, 4, 16);
    const maskLineMat = new THREE.MeshBasicMaterial({ color: goldColor });
    const maskLine = new THREE.Mesh(maskLineGeom, maskLineMat);
    maskLine.position.y = legHeight + torsoHeight + headSize * 0.9;
    maskLine.rotation.x = Math.PI / 2;
    group.add(maskLine);
    
    // 眼睛（血色发光）
    const eyeGeom = new THREE.SphereGeometry(0.05 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.12 * s, legHeight + torsoHeight + headSize * 0.85, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.12 * s, legHeight + torsoHeight + headSize * 0.85, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 王冠 - 修罗神冠 =====
    const crownGroup = new THREE.Group();
    // 底座
    const crownBaseGeom = new THREE.TorusGeometry(0.35 * s, 0.06 * s, 8, 20);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 尖刺（修罗神冠有6根尖刺）
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spikeGeom = new THREE.ConeGeometry(0.06 * s, 0.35 * s, 6);
      const spikeMat = this.createGlowMaterial(godColor, 0.3, 0.9, 0.1);
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(Math.cos(angle) * 0.3 * s, 0.2 * s, Math.sin(angle) * 0.3 * s);
      crownGroup.add(spike);
    }
    
    // 中央宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.12 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.35 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.4;
    group.add(crownGroup);
    
    // ===== 修罗魔剑（主武器）=====
    const swordGroup = new THREE.Group();
    
    // 剑身
    const bladeGeom = new THREE.BoxGeometry(0.12 * s, 2.5 * s, 0.04 * s);
    const bladeMat = this.createGlowMaterial(brightColor, 0.6, 0.95, 0.05);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.y = 1.25 * s;
    swordGroup.add(blade);
    
    // 剑刃边缘（更亮）
    const edgeGeom = new THREE.BoxGeometry(0.02 * s, 2.5 * s, 0.06 * s);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edge1 = new THREE.Mesh(edgeGeom, edgeMat);
    edge1.position.set(-0.05 * s, 1.25 * s, 0);
    swordGroup.add(edge1);
    const edge2 = new THREE.Mesh(edgeGeom, edgeMat);
    edge2.position.set(0.05 * s, 1.25 * s, 0);
    swordGroup.add(edge2);
    
    // 剑尖
    const tipGeom = new THREE.ConeGeometry(0.08 * s, 0.3 * s, 4);
    const tipMat = this.createGlowMaterial(brightColor, 0.7, 0.95, 0.05);
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.y = 2.65 * s;
    tip.rotation.z = Math.PI / 4;
    swordGroup.add(tip);
    
    // 护手（十字形）
    const guardGeom = new THREE.BoxGeometry(0.5 * s, 0.08 * s, 0.12 * s);
    const guardMat = this.createGlowMaterial(goldColor, 0.5);
    const guard = new THREE.Mesh(guardGeom, guardMat);
    guard.position.y = 0.1 * s;
    swordGroup.add(guard);
    
    // 剑柄
    const hiltGeom = new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 0.4 * s, 8);
    const hiltMat = this.createBasicMaterial(darkColor, 0.5, 0.5);
    const hilt = new THREE.Mesh(hiltGeom, hiltMat);
    hilt.position.y = -0.15 * s;
    swordGroup.add(hilt);
    
    // 剑柄末端宝石
    const pommelGeom = new THREE.SphereGeometry(0.08 * s, 8, 8);
    const pommelMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.38 * s;
    swordGroup.add(pommel);
    
    // 血光缠绕（剑身发光粒子效果模拟）
    for (let i = 0; i < 8; i++) {
      const particleGeom = new THREE.SphereGeometry(0.03 * s, 4, 4);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true,
        opacity: 0.6,
      });
      const particle = new THREE.Mesh(particleGeom, particleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 2.0 * s;
      const radius = 0.1 + Math.random() * 0.1;
      particle.position.set(Math.cos(angle) * radius, 0.3 * s + height, Math.sin(angle) * radius);
      particle.userData.angle = angle;
      particle.userData.height = height;
      particle.userData.radius = radius;
      particle.userData.speed = 0.5 + Math.random() * 0.5;
      swordGroup.add(particle);
    }
    
    swordGroup.position.set(0.9 * s, legHeight + torsoHeight * 0.2, 0.2 * s);
    swordGroup.rotation.z = -0.4;
    swordGroup.rotation.x = 0.1;
    group.add(swordGroup);
    
    // ===== 血色披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.5 * s, 2.5 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.3,
      roughness: 0.6,
      emissive: godColor,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.7, -0.4 * s);
    cape.rotation.x = -0.15;
    group.add(cape);
    
    // 披风内衬（更亮的红色）
    const capeInnerGeom = new THREE.PlaneGeometry(1.3 * s, 2.3 * s, 8, 5);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, legHeight + torsoHeight * 0.7, -0.38 * s);
    capeInner.rotation.x = -0.15;
    group.add(capeInner);
    
    // ===== 神环（脚下光环）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.08 * s, 12, 32);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.6,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.1;
    group.add(halo);
    
    // 内圈光环
    const haloInnerGeom = new THREE.TorusGeometry(0.5 * s, 0.05 * s, 12, 32);
    const haloInnerMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.5,
    });
    const haloInner = new THREE.Mesh(haloInnerGeom, haloInnerMat);
    haloInner.rotation.x = -Math.PI / 2;
    haloInner.position.y = 0.12;
    group.add(haloInner);
    
    group.userData.weapon = swordGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = emblem;
  },

  // 毁灭之神 - 神界执法，毁灭权柄，紫黑神袍，毁灭权杖
  createDestructionLord(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xa855f7);
    const darkColor = new THREE.Color(0x1a0a2e);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部（神袍覆盖）=====
    const robeHeight = 2.0 * s;
    const robeGeom = new THREE.CylinderGeometry(0.45 * s, 0.55 * s, robeHeight, 16);
    const robeMat = this.createGlowMaterial(darkColor, 0.1, 0.7, 0.3);
    const robe = new THREE.Mesh(robeGeom, robeMat);
    robe.position.y = robeHeight * 0.5;
    group.add(robe);
    
    // 神袍褶皱装饰
    for (let i = 0; i < 6; i++) {
      const foldGeom = new THREE.BoxGeometry(0.03 * s, robeHeight * 0.8, 0.1 * s);
      const foldMat = this.createGlowMaterial(godColor, 0.15, 0.6, 0.4);
      const fold = new THREE.Mesh(foldGeom, foldMat);
      const angle = (i / 6) * Math.PI * 2;
      fold.position.set(Math.cos(angle) * 0.45 * s, robeHeight * 0.5, Math.sin(angle) * 0.45 * s);
      fold.rotation.y = angle;
      group.add(fold);
    }
    
    // 神袍金边
    const trimGeom = new THREE.TorusGeometry(0.52 * s, 0.04 * s, 8, 32);
    const trimMat = this.createGlowMaterial(goldColor, 0.4);
    const trim1 = new THREE.Mesh(trimGeom, trimMat);
    trim1.rotation.x = Math.PI / 2;
    trim1.position.y = 0.2;
    group.add(trim1);
    const trim2 = new THREE.Mesh(trimGeom, trimMat);
    trim2.rotation.x = Math.PI / 2;
    trim2.position.y = robeHeight * 0.7;
    group.add(trim2);
    
    // ===== 躯干 =====
    const torsoHeight = 1.4 * s;
    const torsoGeom = new THREE.BoxGeometry(0.9 * s, torsoHeight, 0.45 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.1, 0.7, 0.3);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = robeHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸前毁灭符文
    const runeGroup = new THREE.Group();
    const runeOuterGeom = new THREE.RingGeometry(0.2 * s, 0.28 * s, 6);
    const runeMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const runeOuter = new THREE.Mesh(runeOuterGeom, runeMat);
    runeGroup.add(runeOuter);
    
    // 内部符文
    const runeInnerGeom = new THREE.OctahedronGeometry(0.15 * s, 0);
    const runeInnerMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const runeInner = new THREE.Mesh(runeInnerGeom, runeInnerMat);
    runeGroup.add(runeInner);
    
    runeGroup.position.set(0, robeHeight + torsoHeight * 0.55, 0.25 * s);
    group.add(runeGroup);
    
    // 肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.28 * s, 8, 8);
    const shoulderMat = this.createGlowMaterial(godColor, 0.25, 0.8, 0.2);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.5 * s, robeHeight + torsoHeight * 0.8, 0);
    leftShoulder.scale.set(1, 0.9, 1.1);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.5 * s, robeHeight + torsoHeight * 0.8, 0);
    rightShoulder.scale.set(1, 0.9, 1.1);
    group.add(rightShoulder);
    
    // 肩甲尖刺（毁灭尖刺）
    for (let i = 0; i < 4; i++) {
      const spikeGeom = new THREE.ConeGeometry(0.04 * s, 0.25 * s, 5);
      const spikeMat = this.createGlowMaterial(brightColor, 0.4, 0.8, 0.2);
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(-0.5 * s + (i - 1.5) * 0.12, robeHeight + torsoHeight * 0.8 + 0.2, 0.08);
      group.add(spike);
      const spike2 = new THREE.Mesh(spikeGeom, spikeMat);
      spike2.position.set(0.5 * s + (i - 1.5) * 0.12, robeHeight + torsoHeight * 0.8 + 0.2, 0.08);
      group.add(spike2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.11 * s, 0.08 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.1, 0.7, 0.3);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.6 * s, robeHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.15;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.6 * s, robeHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.15;
    group.add(rightArm);
    
    // 袖袍
    const sleeveGeom = new THREE.CylinderGeometry(0.15 * s, 0.1 * s, 0.6 * s, 10);
    const sleeveMat = this.createGlowMaterial(godColor, 0.15, 0.6, 0.4);
    const leftSleeve = new THREE.Mesh(sleeveGeom, sleeveMat);
    leftSleeve.position.set(-0.62 * s, robeHeight + torsoHeight * 0.4 - armHeight * 0.2, 0);
    leftSleeve.rotation.z = 0.15;
    group.add(leftSleeve);
    const rightSleeve = new THREE.Mesh(sleeveGeom, sleeveMat);
    rightSleeve.position.set(0.62 * s, robeHeight + torsoHeight * 0.4 - armHeight * 0.2, 0);
    rightSleeve.rotation.z = -0.15;
    group.add(rightSleeve);
    
    // ===== 头部 =====
    const headSize = 0.38 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xf0e0d0, 0.1, 0.6);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = robeHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（紫色毁灭之瞳）
    const eyeGeom = new THREE.SphereGeometry(0.045 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.11 * s, robeHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.11 * s, robeHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 神冠 - 毁灭神冠 =====
    const crownGroup = new THREE.Group();
    // 底座
    const crownBaseGeom = new THREE.TorusGeometry(0.32 * s, 0.05 * s, 8, 20);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.4);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 毁灭尖塔（5座）
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const towerGeom = new THREE.ConeGeometry(0.07 * s, 0.4 * s, 5);
      const towerMat = this.createGlowMaterial(godColor, 0.3, 0.8, 0.2);
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.set(Math.cos(angle) * 0.28 * s, 0.25 * s, Math.sin(angle) * 0.28 * s);
      crownGroup.add(tower);
    }
    
    // 中央毁灭之珠
    const orbGeom = new THREE.IcosahedronGeometry(0.15 * s, 0);
    const orbMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    orb.position.y = 0.4 * s;
    crownGroup.add(orb);
    
    crownGroup.position.y = robeHeight + torsoHeight + headSize * 1.35;
    group.add(crownGroup);
    
    // ===== 毁灭权杖 =====
    const staffGroup = new THREE.Group();
    
    // 杖身
    const staffGeom = new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 2.8 * s, 10);
    const staffMat = this.createGlowMaterial(darkColor, 0.2, 0.8, 0.2);
    const staff = new THREE.Mesh(staffGeom, staffMat);
    staff.position.y = 1.4 * s;
    staffGroup.add(staff);
    
    // 杖身纹路
    for (let i = 0; i < 6; i++) {
      const ringGeom = new THREE.TorusGeometry(0.05 * s, 0.015 * s, 6, 16);
      const ringMat = this.createGlowMaterial(goldColor, 0.5);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.4 + i * 0.4 * s;
      staffGroup.add(ring);
    }
    
    // 权杖顶部 - 毁灭之球
    const topOrbGeom = new THREE.IcosahedronGeometry(0.25 * s, 1);
    const topOrbMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.85,
    });
    const topOrb = new THREE.Mesh(topOrbGeom, topOrbMat);
    topOrb.position.y = 2.9 * s;
    staffGroup.add(topOrb);
    
    // 环绕光球
    for (let i = 0; i < 4; i++) {
      const miniOrbGeom = new THREE.SphereGeometry(0.06 * s, 6, 6);
      const miniOrbMat = new THREE.MeshBasicMaterial({ 
        color: godColor,
        transparent: true,
        opacity: 0.7,
      });
      const miniOrb = new THREE.Mesh(miniOrbGeom, miniOrbMat);
      const angle = (i / 4) * Math.PI * 2;
      miniOrb.position.set(Math.cos(angle) * 0.25 * s, 2.9 * s, Math.sin(angle) * 0.25 * s);
      miniOrb.userData.angle = angle;
      miniOrb.userData.speed = 0.8;
      staffGroup.add(miniOrb);
    }
    
    // 底部尖刺
    const tipGeom = new THREE.ConeGeometry(0.06 * s, 0.2 * s, 6);
    const tipMat = this.createGlowMaterial(goldColor, 0.4);
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.y = -0.1 * s;
    tip.rotation.x = Math.PI;
    staffGroup.add(tip);
    
    staffGroup.position.set(-0.8 * s, robeHeight * 0.6, 0.1 * s);
    staffGroup.rotation.z = 0.15;
    staffGroup.rotation.x = -0.1;
    group.add(staffGroup);
    
    // ===== 毁灭神袍（披风）=====
    const capeGeom = new THREE.PlaneGeometry(1.6 * s, 2.8 * s, 10, 7);
    const capeMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.2,
      roughness: 0.7,
      emissive: godColor,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, robeHeight + torsoHeight * 0.5, -0.45 * s);
    cape.rotation.x = -0.1;
    group.add(cape);
    
    // 披风内衬紫光
    const capeInnerGeom = new THREE.PlaneGeometry(1.4 * s, 2.6 * s, 8, 6);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, robeHeight + torsoHeight * 0.5, -0.43 * s);
    capeInner.rotation.x = -0.1;
    group.add(capeInner);
    
    // ===== 毁灭光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.85 * s, 0.1 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 暗紫色雾气粒子
    for (let i = 0; i < 12; i++) {
      const fogGeom = new THREE.SphereGeometry(0.08 * s + Math.random() * 0.05 * s, 6, 6);
      const fogMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true,
        opacity: 0.3,
      });
      const fog = new THREE.Mesh(fogGeom, fogMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.4;
      fog.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.5, Math.sin(angle) * radius * s);
      fog.userData.angle = angle;
      fog.userData.radius = radius;
      fog.userData.speed = 0.2 + Math.random() * 0.3;
      fog.userData.baseY = fog.position.y;
      group.add(fog);
    }
    
    group.userData.weapon = staffGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = runeGroup;
  },

  // 生命女神 - 生机之源，翠绿长裙，生命权杖，温柔而神圣
  createLifeGoddess(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0x6ee7b7);
    const lightColor = new THREE.Color(0xd1fae5);
    const goldColor = new THREE.Color(0xfcd34d);
    const s = scale;
    
    // ===== 长裙（生命女神的翠绿长裙）=====
    const dressHeight = 2.2 * s;
    const dressGeom = new THREE.CylinderGeometry(0.35 * s, 0.6 * s, dressHeight, 20);
    const dressMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.2,
      roughness: 0.6,
      emissive: godColor,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
    });
    const dress = new THREE.Mesh(dressGeom, dressMat);
    dress.position.y = dressHeight * 0.5;
    group.add(dress);
    
    // 裙摆层次
    for (let i = 0; i < 3; i++) {
      const layerGeom = new THREE.CylinderGeometry(0.45 * s + i * 0.08 * s, 0.55 * s + i * 0.08 * s, 0.3 * s, 16);
      const layerMat = new THREE.MeshStandardMaterial({
        color: brightColor,
        metalness: 0.1,
        roughness: 0.7,
        emissive: brightColor,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.7 - i * 0.15,
      });
      const layer = new THREE.Mesh(layerGeom, layerMat);
      layer.position.y = 0.2 + i * 0.25 * s;
      group.add(layer);
    }
    
    // 金色腰带
    const beltGeom = new THREE.TorusGeometry(0.38 * s, 0.04 * s, 8, 24);
    const beltMat = this.createGlowMaterial(goldColor, 0.5);
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = dressHeight * 0.55;
    group.add(belt);
    
    // 腰带上的生命宝石
    const gemGeom = new THREE.OctahedronGeometry(0.08 * s, 0);
    const gemMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.position.set(0, dressHeight * 0.55, 0.4 * s);
    group.add(gem);
    
    // ===== 躯干 =====
    const torsoHeight = 1.2 * s;
    const torsoGeom = new THREE.BoxGeometry(0.75 * s, torsoHeight, 0.4 * s);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: lightColor,
      metalness: 0.2,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.1,
    });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = dressHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸前生命符文
    const lifeRuneGeom = new THREE.ShapeGeometry(new THREE.Shape()
      .absarc(0, 0, 0.2 * s, 0, Math.PI * 2, false)
      .absarc(0, 0, 0.1 * s, 0, Math.PI * 2, true));
    const lifeRuneMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const lifeRune = new THREE.Mesh(lifeRuneGeom, lifeRuneMat);
    lifeRune.position.set(0, dressHeight + torsoHeight * 0.5, 0.22 * s);
    group.add(lifeRune);
    
    // 生命之树图案
    const treeGeom = new THREE.ConeGeometry(0.12 * s, 0.25 * s, 6);
    const treeMat = new THREE.MeshBasicMaterial({ color: godColor });
    const tree = new THREE.Mesh(treeGeom, treeMat);
    tree.position.set(0, dressHeight + torsoHeight * 0.52, 0.24 * s);
    group.add(tree);
    
    // 肩部装饰（花朵形状）
    const flowerShoulderGeom = new THREE.CircleGeometry(0.2 * s, 8);
    const flowerMat = new THREE.MeshBasicMaterial({ 
      color: lightColor,
      transparent: true,
      opacity: 0.9,
    });
    const leftFlower = new THREE.Mesh(flowerShoulderGeom, flowerMat);
    leftFlower.position.set(-0.45 * s, dressHeight + torsoHeight * 0.75, 0.1 * s);
    leftFlower.rotation.y = 0.3;
    group.add(leftFlower);
    const rightFlower = new THREE.Mesh(flowerShoulderGeom, flowerMat);
    rightFlower.position.set(0.45 * s, dressHeight + torsoHeight * 0.75, 0.1 * s);
    rightFlower.rotation.y = -0.3;
    group.add(rightFlower);
    
    // ===== 手臂 =====
    const armHeight = 1.2 * s;
    const armGeom = new THREE.CylinderGeometry(0.09 * s, 0.07 * s, armHeight, 8);
    const armMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.6);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.5 * s, dressHeight + torsoHeight * 0.35, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.5 * s, dressHeight + torsoHeight * 0.35, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 飘袖
    const sleeveGeom = new THREE.ConeGeometry(0.2 * s, 0.7 * s, 10);
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: lightColor,
      metalness: 0.1,
      roughness: 0.7,
      emissive: brightColor,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const leftSleeve = new THREE.Mesh(sleeveGeom, sleeveMat);
    leftSleeve.position.set(-0.52 * s, dressHeight + torsoHeight * 0.35 - armHeight * 0.2, 0);
    leftSleeve.rotation.z = 0.2;
    leftSleeve.rotation.x = Math.PI;
    group.add(leftSleeve);
    const rightSleeve = new THREE.Mesh(sleeveGeom, sleeveMat);
    rightSleeve.position.set(0.52 * s, dressHeight + torsoHeight * 0.35 - armHeight * 0.2, 0);
    rightSleeve.rotation.z = -0.2;
    rightSleeve.rotation.x = Math.PI;
    group.add(rightSleeve);
    
    // ===== 头部 - 温柔女神面容 =====
    const headSize = 0.36 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = dressHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（翠绿色温柔眼眸）
    const eyeGeom = new THREE.SphereGeometry(0.04 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: godColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1 * s, dressHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.1 * s, dressHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 长发（生命女神的飘逸长发）=====
    const hairGeom = new THREE.SphereGeometry(headSize * 1.1, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const hairMat = this.createBasicMaterial(0x2d5016, 0.3, 0.5);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = dressHeight + torsoHeight + headSize * 0.8;
    group.add(hair);
    
    // 长发垂落
    for (let i = 0; i < 6; i++) {
      const strandGeom = new THREE.CylinderGeometry(0.03 * s, 0.02 * s, 1.0 * s, 6);
      const strandMat = this.createBasicMaterial(0x2d5016, 0.3, 0.5);
      const strand = new THREE.Mesh(strandGeom, strandMat);
      const angle = -0.5 + (i / 5) * 1.0;
      strand.position.set(Math.sin(angle) * headSize * 0.9, dressHeight + torsoHeight + headSize * 0.2, -Math.cos(angle) * headSize * 0.5);
      strand.rotation.x = 0.3;
      strand.rotation.z = angle * 0.5;
      group.add(strand);
    }
    
    // ===== 花冠 - 生命女神花冠 =====
    const crownGroup = new THREE.Group();
    
    // 花冠底座（藤蔓）
    const vineGeom = new THREE.TorusGeometry(0.3 * s, 0.03 * s, 8, 24);
    const vineMat = this.createBasicMaterial(godColor, 0.3, 0.5);
    const vine = new THREE.Mesh(vineGeom, vineMat);
    vine.rotation.x = Math.PI / 2;
    crownGroup.add(vine);
    
    // 花朵装饰
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const flowerGeom = new THREE.SphereGeometry(0.06 * s, 6, 6);
      const flowerColor = i % 2 === 0 ? lightColor : goldColor;
      const flowerMat = new THREE.MeshBasicMaterial({ 
        color: flowerColor,
        transparent: true,
        opacity: 0.9,
      });
      const flower = new THREE.Mesh(flowerGeom, flowerMat);
      flower.position.set(Math.cos(angle) * 0.28 * s, 0.08 * s, Math.sin(angle) * 0.28 * s);
      crownGroup.add(flower);
    }
    
    // 中央生命之花
    const centerFlowerGeom = new THREE.OctahedronGeometry(0.1 * s, 0);
    const centerFlowerMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const centerFlower = new THREE.Mesh(centerFlowerGeom, centerFlowerMat);
    centerFlower.position.y = 0.2 * s;
    crownGroup.add(centerFlower);
    
    crownGroup.position.y = dressHeight + torsoHeight + headSize * 1.2;
    group.add(crownGroup);
    
    // ===== 生命权杖 =====
    const staffGroup = new THREE.Group();
    
    // 杖身（木质藤蔓纹理）
    const staffGeom = new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 2.6 * s, 10);
    const staffMat = this.createBasicMaterial(0x8b4513, 0.2, 0.7);
    const staff = new THREE.Mesh(staffGeom, staffMat);
    staff.position.y = 1.3 * s;
    staffGroup.add(staff);
    
    // 藤蔓缠绕
    for (let i = 0; i < 5; i++) {
      const vineRingGeom = new THREE.TorusGeometry(0.05 * s, 0.01 * s, 4, 12);
      const vineRingMat = this.createBasicMaterial(godColor, 0.3, 0.5);
      const vineRing = new THREE.Mesh(vineRingGeom, vineRingMat);
      vineRing.rotation.x = Math.PI / 2 + i * 0.3;
      vineRing.position.y = 0.3 + i * 0.5 * s;
      staffGroup.add(vineRing);
    }
    
    // 权杖顶部 - 生命之树
    const treeTopGroup = new THREE.Group();
    
    // 树干
    const trunkGeom = new THREE.CylinderGeometry(0.03 * s, 0.05 * s, 0.3 * s, 6);
    const trunkMat = this.createBasicMaterial(0x8b4513, 0.2, 0.6);
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 2.6 * s;
    treeTopGroup.add(trunk);
    
    // 树冠（多层球体）
    for (let i = 0; i < 3; i++) {
      const leafGeom = new THREE.SphereGeometry(0.18 * s - i * 0.04 * s, 8, 8);
      const leafMat = new THREE.MeshBasicMaterial({ 
        color: i === 0 ? brightColor : godColor,
        transparent: true,
        opacity: 0.85,
      });
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.y = 2.85 * s + i * 0.1 * s;
      treeTopGroup.add(leaf);
    }
    
    // 生命光点
    for (let i = 0; i < 6; i++) {
      const lightGeom = new THREE.SphereGeometry(0.025 * s, 4, 4);
      const lightMat = new THREE.MeshBasicMaterial({ 
        color: lightColor,
        transparent: true,
        opacity: 0.8,
      });
      const light = new THREE.Mesh(lightGeom, lightMat);
      const angle = (i / 6) * Math.PI * 2;
      const radius = 0.12 + Math.random() * 0.08;
      light.position.set(Math.cos(angle) * radius * s, 2.85 * s + Math.random() * 0.2 * s, Math.sin(angle) * radius * s);
      light.userData.angle = angle;
      light.userData.radius = radius;
      light.userData.speed = 0.3 + Math.random() * 0.3;
      treeTopGroup.add(light);
    }
    
    staffGroup.add(treeTopGroup);
    
    staffGroup.position.set(0.7 * s, dressHeight * 0.5, 0.15 * s);
    staffGroup.rotation.z = -0.2;
    staffGroup.rotation.x = -0.05;
    group.add(staffGroup);
    
    // ===== 生命光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.08 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 内圈
    const haloInnerGeom = new THREE.TorusGeometry(0.55 * s, 0.05 * s, 12, 32);
    const haloInnerMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.5,
    });
    const haloInner = new THREE.Mesh(haloInnerGeom, haloInnerMat);
    haloInner.rotation.x = -Math.PI / 2;
    haloInner.position.y = 0.1;
    group.add(haloInner);
    
    // 飘落的生命光点
    for (let i = 0; i < 15; i++) {
      const particleGeom = new THREE.SphereGeometry(0.02 * s + Math.random() * 0.02 * s, 4, 4);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true,
        opacity: 0.6,
      });
      const particle = new THREE.Mesh(particleGeom, particleMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.4 + Math.random() * 0.5;
      particle.position.set(Math.cos(angle) * radius * s, Math.random() * 3 * s, Math.sin(angle) * radius * s);
      particle.userData.angle = angle;
      particle.userData.radius = radius;
      particle.userData.speed = 0.1 + Math.random() * 0.2;
      particle.userData.baseY = particle.position.y;
      group.add(particle);
    }
    
    group.userData.weapon = staffGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = lifeRune;
  },

  // ========== 一级神建模 ==========

  // 海神 - 海洋主宰，三叉戟，蓝金铠甲，威严霸气
  createSeaGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0x38bdf8);
    const darkColor = new THREE.Color(0x0369a1);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部 - 海神战铠 =====
    const legHeight = 1.7 * s;
    const legGeom = new THREE.CylinderGeometry(0.17 * s, 0.21 * s, legHeight, 10);
    const legMat = this.createGlowMaterial(darkColor, 0.2, 0.85, 0.15);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.32 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.32 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 腿甲鳞片装饰
    for (let i = 0; i < 4; i++) {
      const scaleGeom = new THREE.CircleGeometry(0.08 * s, 6);
      const scaleMat = this.createGlowMaterial(brightColor, 0.3, 0.8, 0.2);
      const scaleMesh1 = new THREE.Mesh(scaleGeom, scaleMat);
      scaleMesh1.position.set(-0.32 * s, 0.4 + i * 0.35, 0.15 * s);
      group.add(scaleMesh1);
      const scaleMesh2 = new THREE.Mesh(scaleGeom, scaleMat);
      scaleMesh2.position.set(0.32 * s, 0.4 + i * 0.35, 0.15 * s);
      group.add(scaleMesh2);
    }
    
    // 金色护膝
    const kneeGeom = new THREE.SphereGeometry(0.12 * s, 8, 8);
    const kneeMat = this.createGlowMaterial(goldColor, 0.4);
    const leftKnee = new THREE.Mesh(kneeGeom, kneeMat);
    leftKnee.position.set(-0.32 * s, legHeight * 0.6, 0.05 * s);
    leftKnee.scale.set(1, 0.7, 1.1);
    group.add(leftKnee);
    const rightKnee = new THREE.Mesh(kneeGeom, kneeMat);
    rightKnee.position.set(0.32 * s, legHeight * 0.6, 0.05 * s);
    rightKnee.scale.set(1, 0.7, 1.1);
    group.add(rightKnee);
    
    // ===== 躯干 - 海神之铠 =====
    const torsoHeight = 1.5 * s;
    const torsoGeom = new THREE.BoxGeometry(0.95 * s, torsoHeight, 0.48 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.15, 0.85, 0.15);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲
    const chestGeom = new THREE.BoxGeometry(0.85 * s, 0.9 * s, 0.15 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.3, 0.85, 0.15);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.55, 0.28 * s);
    group.add(chest);
    
    // 海神三叉戟徽记
    const tridentEmblemGroup = new THREE.Group();
    // 中央长戟
    const tridentCenterGeom = new THREE.BoxGeometry(0.03 * s, 0.35 * s, 0.03 * s);
    const tridentMat = this.createGlowMaterial(goldColor, 0.6);
    const tridentCenter = new THREE.Mesh(tridentCenterGeom, tridentMat);
    tridentEmblemGroup.add(tridentCenter);
    // 左右短戟
    const tridentLeftGeom = new THREE.BoxGeometry(0.025 * s, 0.2 * s, 0.025 * s);
    const tridentLeft = new THREE.Mesh(tridentLeftGeom, tridentMat);
    tridentLeft.position.set(-0.08 * s, 0.05 * s, 0);
    tridentLeft.rotation.z = 0.3;
    tridentEmblemGroup.add(tridentLeft);
    const tridentRight = new THREE.Mesh(tridentLeftGeom, tridentMat);
    tridentRight.position.set(0.08 * s, 0.05 * s, 0);
    tridentRight.rotation.z = -0.3;
    tridentEmblemGroup.add(tridentRight);
    // 底部横杠
    const tridentBaseGeom = new THREE.BoxGeometry(0.18 * s, 0.03 * s, 0.03 * s);
    const tridentBase = new THREE.Mesh(tridentBaseGeom, tridentMat);
    tridentBase.position.y = -0.12 * s;
    tridentEmblemGroup.add(tridentBase);
    
    tridentEmblemGroup.position.set(0, legHeight + torsoHeight * 0.55, 0.38 * s);
    group.add(tridentEmblemGroup);
    
    // 肩甲 - 波浪形肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.28 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(godColor, 0.25, 0.85, 0.15);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.55 * s, legHeight + torsoHeight * 0.82, 0);
    leftShoulder.scale.set(1, 0.75, 1.2);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.55 * s, legHeight + torsoHeight * 0.82, 0);
    rightShoulder.scale.set(1, 0.75, 1.2);
    group.add(rightShoulder);
    
    // 肩甲金边
    const shoulderTrimGeom = new THREE.TorusGeometry(0.25 * s, 0.03 * s, 6, 16);
    const shoulderTrimMat = this.createGlowMaterial(goldColor, 0.4);
    const leftShoulderTrim = new THREE.Mesh(shoulderTrimGeom, shoulderTrimMat);
    leftShoulderTrim.position.set(-0.55 * s, legHeight + torsoHeight * 0.82, 0.1 * s);
    leftShoulderTrim.rotation.y = 0.3;
    group.add(leftShoulderTrim);
    const rightShoulderTrim = new THREE.Mesh(shoulderTrimGeom, shoulderTrimMat);
    rightShoulderTrim.position.set(0.55 * s, legHeight + torsoHeight * 0.82, 0.1 * s);
    rightShoulderTrim.rotation.y = -0.3;
    group.add(rightShoulderTrim);
    
    // ===== 手臂 =====
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.11 * s, 0.08 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.15, 0.85, 0.15);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.65 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.65 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 护臂
    const bracerGeom = new THREE.BoxGeometry(0.16 * s, 0.4 * s, 0.12 * s);
    const bracerMat = this.createGlowMaterial(godColor, 0.25, 0.85, 0.15);
    const leftBracer = new THREE.Mesh(bracerGeom, bracerMat);
    leftBracer.position.set(-0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(leftBracer);
    const rightBracer = new THREE.Mesh(bracerGeom, bracerMat);
    rightBracer.position.set(0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(rightBracer);
    
    // ===== 头部 =====
    const headSize = 0.38 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xf0e0d0, 0.1, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（深蓝色海洋之瞳）
    const eyeGeom = new THREE.SphereGeometry(0.045 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 海神冠 =====
    const crownGroup = new THREE.Group();
    
    // 底座
    const crownBaseGeom = new THREE.TorusGeometry(0.33 * s, 0.05 * s, 8, 22);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 波浪形装饰（5道波浪）
    for (let i = 0; i < 5; i++) {
      const waveGeom = new THREE.TorusGeometry(0.08 * s, 0.025 * s, 6, 12, Math.PI);
      const waveMat = this.createGlowMaterial(godColor, 0.3, 0.8, 0.2);
      const wave = new THREE.Mesh(waveGeom, waveMat);
      const xPos = -0.2 + i * 0.1;
      wave.position.set(xPos * s, 0.12 * s, 0);
      wave.rotation.x = -Math.PI / 2;
      crownGroup.add(wave);
    }
    
    // 中央蓝宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.12 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.9,
    });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.3 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.35;
    group.add(crownGroup);
    
    // ===== 海神三叉戟（主武器）=====
    const tridentGroup = new THREE.Group();
    
    // 戟杆
    const handleGeom = new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 2.8 * s, 10);
    const handleMat = this.createGlowMaterial(goldColor, 0.4);
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.y = 1.4 * s;
    tridentGroup.add(handle);
    
    // 戟杆纹路
    for (let i = 0; i < 7; i++) {
      const ringGeom = new THREE.TorusGeometry(0.065 * s, 0.015 * s, 6, 16);
      const ringMat = this.createGlowMaterial(darkColor, 0.3);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.3 + i * 0.35 * s;
      tridentGroup.add(ring);
    }
    
    // 三叉戟头部
    const headGroup = new THREE.Group();
    
    // 中央长刃
    const centerBladeGeom = new THREE.ConeGeometry(0.06 * s, 0.6 * s, 4);
    const bladeMat = this.createGlowMaterial(brightColor, 0.6, 0.9, 0.1);
    const centerBlade = new THREE.Mesh(centerBladeGeom, bladeMat);
    centerBlade.position.y = 2.9 * s;
    headGroup.add(centerBlade);
    
    // 左刃
    const leftBladeGeom = new THREE.ConeGeometry(0.05 * s, 0.4 * s, 4);
    const leftBlade = new THREE.Mesh(leftBladeGeom, bladeMat);
    leftBlade.position.set(-0.2 * s, 2.7 * s, 0);
    leftBlade.rotation.z = 0.4;
    headGroup.add(leftBlade);
    
    // 右刃
    const rightBladeGeom = new THREE.ConeGeometry(0.05 * s, 0.4 * s, 4);
    const rightBlade = new THREE.Mesh(rightBladeGeom, bladeMat);
    rightBlade.position.set(0.2 * s, 2.7 * s, 0);
    rightBlade.rotation.z = -0.4;
    headGroup.add(rightBlade);
    
    // 连接基座
    const baseGeom = new THREE.BoxGeometry(0.35 * s, 0.1 * s, 0.08 * s);
    const baseMat = this.createGlowMaterial(goldColor, 0.5);
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 2.55 * s;
    headGroup.add(base);
    
    tridentGroup.add(headGroup);
    
    // 底部装饰
    const pommelGeom = new THREE.SphereGeometry(0.07 * s, 8, 8);
    const pommelMat = this.createGlowMaterial(goldColor, 0.5);
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.05 * s;
    tridentGroup.add(pommel);
    
    // 水流环绕效果
    for (let i = 0; i < 6; i++) {
      const waterGeom = new THREE.TorusGeometry(0.15 * s, 0.02 * s, 6, 16);
      const waterMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true,
        opacity: 0.5,
      });
      const water = new THREE.Mesh(waterGeom, waterMat);
      const height = 0.5 + Math.random() * 2.0;
      water.position.y = height * s;
      water.rotation.x = Math.PI / 2;
      water.userData.baseY = height * s;
      water.userData.speed = 0.5 + Math.random() * 0.5;
      water.userData.phase = Math.random() * Math.PI * 2;
      tridentGroup.add(water);
    }
    
    tridentGroup.position.set(0.9 * s, legHeight * 0.7, 0.15 * s);
    tridentGroup.rotation.z = -0.3;
    tridentGroup.rotation.x = 0.1;
    group.add(tridentGroup);
    
    // ===== 海神披风（蓝金色）=====
    const capeGeom = new THREE.PlaneGeometry(1.5 * s, 2.5 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.3,
      roughness: 0.5,
      emissive: darkColor,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.65, -0.4 * s);
    cape.rotation.x = -0.12;
    group.add(cape);
    
    // 披风金色内衬
    const capeInnerGeom = new THREE.PlaneGeometry(1.3 * s, 2.3 * s, 8, 5);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: goldColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, legHeight + torsoHeight * 0.65, -0.38 * s);
    capeInner.rotation.x = -0.12;
    group.add(capeInner);
    
    // ===== 海洋光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.08 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 水波粒子
    for (let i = 0; i < 10; i++) {
      const waveGeom = new THREE.SphereGeometry(0.04 * s + Math.random() * 0.03 * s, 6, 6);
      const waveMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true,
        opacity: 0.4,
      });
      const wave = new THREE.Mesh(waveGeom, waveMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.4;
      wave.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.3, Math.sin(angle) * radius * s);
      wave.userData.angle = angle;
      wave.userData.radius = radius;
      wave.userData.speed = 0.3 + Math.random() * 0.4;
      wave.userData.baseY = wave.position.y;
      group.add(wave);
    }
    
    group.userData.weapon = tridentGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = tridentEmblemGroup;
  },

  // 火神 - 烈焰之神，火焰铠甲，烈焰巨剑，焚天灭地
  createFireGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xfbbf24);
    const darkColor = new THREE.Color(0x991b1b);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部 - 烈焰战铠 =====
    const legHeight = 1.7 * s;
    const legGeom = new THREE.CylinderGeometry(0.16 * s, 0.2 * s, legHeight, 10);
    const legMat = this.createGlowMaterial(darkColor, 0.25, 0.8, 0.2);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.32 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.32 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 火焰纹路
    for (let i = 0; i < 3; i++) {
      const flameGeom = new THREE.ConeGeometry(0.06 * s, 0.15 * s, 5);
      const flameMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.8 });
      const flame1 = new THREE.Mesh(flameGeom, flameMat);
      flame1.position.set(-0.32 * s, 0.5 + i * 0.4, 0.12 * s);
      group.add(flame1);
      const flame2 = new THREE.Mesh(flameGeom, flameMat);
      flame2.position.set(0.32 * s, 0.5 + i * 0.4, 0.12 * s);
      group.add(flame2);
    }
    
    // ===== 躯干 - 火神之铠 =====
    const torsoHeight = 1.5 * s;
    const torsoGeom = new THREE.BoxGeometry(0.9 * s, torsoHeight, 0.48 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.2, 0.8, 0.2);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲（燃烧的烈焰）
    const chestGeom = new THREE.BoxGeometry(0.8 * s, 0.85 * s, 0.15 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.4, 0.8, 0.2);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.55, 0.28 * s);
    group.add(chest);
    
    // 火焰徽记
    const fireEmblemGeom = new THREE.ConeGeometry(0.18 * s, 0.3 * s, 6);
    const fireEmblemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const fireEmblem = new THREE.Mesh(fireEmblemGeom, fireEmblemMat);
    fireEmblem.position.set(0, legHeight + torsoHeight * 0.6, 0.38 * s);
    group.add(fireEmblem);
    
    // 肩甲 - 火焰肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.28 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(godColor, 0.35, 0.8, 0.2);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.55 * s, legHeight + torsoHeight * 0.8, 0);
    leftShoulder.scale.set(1, 0.8, 1.2);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.55 * s, legHeight + torsoHeight * 0.8, 0);
    rightShoulder.scale.set(1, 0.8, 1.2);
    group.add(rightShoulder);
    
    // 肩甲火焰
    for (let i = 0; i < 3; i++) {
      const fireGeom = new THREE.ConeGeometry(0.05 * s, 0.2 * s, 5);
      const fireMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.85 });
      const fire = new THREE.Mesh(fireGeom, fireMat);
      fire.position.set(-0.55 * s + (i - 1) * 0.12, legHeight + torsoHeight * 0.8 + 0.22, 0.08);
      fire.userData.baseY = legHeight + torsoHeight * 0.8 + 0.22;
      fire.userData.speed = 2 + Math.random();
      fire.userData.phase = Math.random() * Math.PI * 2;
      group.add(fire);
      const fire2 = new THREE.Mesh(fireGeom, fireMat);
      fire2.position.set(0.55 * s + (i - 1) * 0.12, legHeight + torsoHeight * 0.8 + 0.22, 0.08);
      fire2.userData.baseY = legHeight + torsoHeight * 0.8 + 0.22;
      fire2.userData.speed = 2 + Math.random();
      fire2.userData.phase = Math.random() * Math.PI * 2;
      group.add(fire2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.11 * s, 0.08 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.2, 0.8, 0.2);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.65 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.65 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 火焰护手
    const gauntletGeom = new THREE.BoxGeometry(0.16 * s, 0.35 * s, 0.13 * s);
    const gauntletMat = this.createGlowMaterial(godColor, 0.4, 0.8, 0.2);
    const leftGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    leftGauntlet.position.set(-0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.35, 0);
    group.add(leftGauntlet);
    const rightGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    rightGauntlet.position.set(0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.35, 0);
    group.add(rightGauntlet);
    
    // ===== 头部 =====
    const headSize = 0.38 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xf0d0b0, 0.1, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（烈焰之瞳）
    const eyeGeom = new THREE.SphereGeometry(0.045 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 火焰冠 =====
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.32 * s, 0.045 * s, 8, 20);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 火焰尖顶（7道火焰）
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const flameCrownGeom = new THREE.ConeGeometry(0.05 * s, 0.3 * s, 5);
      const flameCrownMat = i % 2 === 0 
        ? new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 })
        : this.createGlowMaterial(godColor, 0.5, 0.8, 0.2);
      const flameCrown = new THREE.Mesh(flameCrownGeom, flameCrownMat);
      flameCrown.position.set(Math.cos(angle) * 0.28 * s, 0.2 * s, Math.sin(angle) * 0.28 * s);
      crownGroup.add(flameCrown);
    }
    
    // 中央火焰宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.1 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.35 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.35;
    group.add(crownGroup);
    
    // ===== 烈焰巨剑 =====
    const swordGroup = new THREE.Group();
    
    // 剑身（燃烧的火焰剑）
    const bladeGeom = new THREE.BoxGeometry(0.13 * s, 2.2 * s, 0.05 * s);
    const bladeMat = this.createGlowMaterial(brightColor, 0.6, 0.9, 0.1);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.y = 1.1 * s;
    swordGroup.add(blade);
    
    // 火焰剑刃
    for (let i = 0; i < 8; i++) {
      const flameBladeGeom = new THREE.ConeGeometry(0.04 * s, 0.15 * s, 4);
      const flameBladeMat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? brightColor : godColor, 
        transparent: true, opacity: 0.7 
      });
      const flameBlade = new THREE.Mesh(flameBladeGeom, flameBladeMat);
      flameBlade.position.set(-0.07 * s, 0.3 + i * 0.22 * s, 0);
      flameBlade.rotation.z = -0.3;
      swordGroup.add(flameBlade);
      const flameBlade2 = new THREE.Mesh(flameBladeGeom, flameBladeMat);
      flameBlade2.position.set(0.07 * s, 0.3 + i * 0.22 * s, 0);
      flameBlade2.rotation.z = 0.3;
      swordGroup.add(flameBlade2);
    }
    
    // 剑柄
    const hiltGeom = new THREE.BoxGeometry(0.3 * s, 0.08 * s, 0.08 * s);
    const hiltMat = this.createGlowMaterial(goldColor, 0.5);
    const hilt = new THREE.Mesh(hiltGeom, hiltMat);
    hilt.position.y = 0.05 * s;
    swordGroup.add(hilt);
    
    // 握柄
    const gripGeom = new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.35 * s, 8);
    const gripMat = this.createBasicMaterial(darkColor, 0.5, 0.5);
    const grip = new THREE.Mesh(gripGeom, gripMat);
    grip.position.y = -0.18 * s;
    swordGroup.add(grip);
    
    // 末端宝石
    const pommelGeom = new THREE.SphereGeometry(0.07 * s, 8, 8);
    const pommelMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.38 * s;
    swordGroup.add(pommel);
    
    // 环绕火焰粒子
    for (let i = 0; i < 10; i++) {
      const fireParticleGeom = new THREE.SphereGeometry(0.025 * s + Math.random() * 0.02 * s, 4, 4);
      const fireParticleMat = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? brightColor : godColor,
        transparent: true, opacity: 0.6
      });
      const fireParticle = new THREE.Mesh(fireParticleGeom, fireParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.8 * s;
      const radius = 0.08 + Math.random() * 0.12;
      fireParticle.position.set(Math.cos(angle) * radius * s, 0.2 * s + height, Math.sin(angle) * radius * s);
      fireParticle.userData.angle = angle;
      fireParticle.userData.height = height;
      fireParticle.userData.radius = radius;
      fireParticle.userData.speed = 1 + Math.random() * 2;
      swordGroup.add(fireParticle);
    }
    
    swordGroup.position.set(0.9 * s, legHeight + torsoHeight * 0.25, 0.15 * s);
    swordGroup.rotation.z = -0.4;
    swordGroup.rotation.x = 0.1;
    group.add(swordGroup);
    
    // ===== 火焰披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.5 * s, 2.4 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.2,
      roughness: 0.6,
      emissive: brightColor,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.6, -0.4 * s);
    cape.rotation.x = -0.12;
    group.add(cape);
    
    // 披风火焰内衬
    const capeInnerGeom = new THREE.PlaneGeometry(1.3 * s, 2.2 * s, 8, 5);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, legHeight + torsoHeight * 0.6, -0.38 * s);
    capeInner.rotation.x = -0.12;
    group.add(capeInner);
    
    // ===== 烈焰光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.09 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 火焰粒子环绕
    for (let i = 0; i < 15; i++) {
      const fireFloaterGeom = new THREE.SphereGeometry(0.03 * s + Math.random() * 0.03 * s, 5, 5);
      const fireFloaterMat = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? brightColor : godColor,
        transparent: true, opacity: 0.5
      });
      const fireFloater = new THREE.Mesh(fireFloaterGeom, fireFloaterMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;
      fireFloater.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.8, Math.sin(angle) * radius * s);
      fireFloater.userData.angle = angle;
      fireFloater.userData.radius = radius;
      fireFloater.userData.speed = 0.5 + Math.random() * 0.8;
      fireFloater.userData.baseY = fireFloater.position.y;
      group.add(fireFloater);
    }
    
    group.userData.weapon = swordGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = fireEmblem;
  },

  // 雷神 - 雷霆之神，雷霆铠甲，雷神之锤，天罚神威
  createThunderGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xc4b5fd);
    const darkColor = new THREE.Color(0x4c1d95);
    const goldColor = new THREE.Color(0xfcd34d);
    const s = scale;
    
    // ===== 腿部 - 雷霆战铠 =====
    const legHeight = 1.7 * s;
    const legGeom = new THREE.CylinderGeometry(0.17 * s, 0.21 * s, legHeight, 10);
    const legMat = this.createGlowMaterial(darkColor, 0.2, 0.8, 0.2);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.33 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.33 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 雷电纹路
    for (let i = 0; i < 3; i++) {
      const boltGeom = new THREE.BoxGeometry(0.02 * s, 0.2 * s, 0.02 * s);
      const boltMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.8 });
      const bolt1 = new THREE.Mesh(boltGeom, boltMat);
      bolt1.position.set(-0.33 * s, 0.5 + i * 0.4, 0.13 * s);
      bolt1.rotation.z = 0.2;
      group.add(bolt1);
      const bolt2 = new THREE.Mesh(boltGeom, boltMat);
      bolt2.position.set(0.33 * s, 0.5 + i * 0.4, 0.13 * s);
      bolt2.rotation.z = -0.2;
      group.add(bolt2);
    }
    
    // ===== 躯干 - 雷神之铠 =====
    const torsoHeight = 1.5 * s;
    const torsoGeom = new THREE.BoxGeometry(0.92 * s, torsoHeight, 0.48 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.15, 0.8, 0.2);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲
    const chestGeom = new THREE.BoxGeometry(0.82 * s, 0.85 * s, 0.15 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.3, 0.8, 0.2);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.55, 0.28 * s);
    group.add(chest);
    
    // 雷电徽记
    const thunderEmblemGroup = new THREE.Group();
    const boltMainGeom = new THREE.BoxGeometry(0.06 * s, 0.35 * s, 0.04 * s);
    const boltMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const boltMain = new THREE.Mesh(boltMainGeom, boltMat);
    boltMain.rotation.z = 0.2;
    thunderEmblemGroup.add(boltMain);
    const boltLeftGeom = new THREE.BoxGeometry(0.04 * s, 0.15 * s, 0.03 * s);
    const boltLeft = new THREE.Mesh(boltLeftGeom, boltMat);
    boltLeft.position.set(-0.1 * s, 0.05 * s, 0);
    boltLeft.rotation.z = -0.5;
    thunderEmblemGroup.add(boltLeft);
    const boltRightGeom = new THREE.BoxGeometry(0.04 * s, 0.12 * s, 0.03 * s);
    const boltRight = new THREE.Mesh(boltRightGeom, boltMat);
    boltRight.position.set(0.08 * s, -0.05 * s, 0);
    boltRight.rotation.z = -0.3;
    thunderEmblemGroup.add(boltRight);
    
    thunderEmblemGroup.position.set(0, legHeight + torsoHeight * 0.55, 0.38 * s);
    group.add(thunderEmblemGroup);
    
    // 肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.28 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(godColor, 0.25, 0.8, 0.2);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.55 * s, legHeight + torsoHeight * 0.82, 0);
    leftShoulder.scale.set(1, 0.75, 1.2);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.55 * s, legHeight + torsoHeight * 0.82, 0);
    rightShoulder.scale.set(1, 0.75, 1.2);
    group.add(rightShoulder);
    
    // 肩甲尖刺（雷电尖刺）
    for (let i = 0; i < 3; i++) {
      const spikeGeom = new THREE.ConeGeometry(0.05 * s, 0.25 * s, 5);
      const spikeMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.85 });
      const spike = new THREE.Mesh(spikeGeom, spikeMat);
      spike.position.set(-0.55 * s + (i - 1) * 0.15, legHeight + torsoHeight * 0.82 + 0.22, 0.08);
      group.add(spike);
      const spike2 = new THREE.Mesh(spikeGeom, spikeMat);
      spike2.position.set(0.55 * s + (i - 1) * 0.15, legHeight + torsoHeight * 0.82 + 0.22, 0.08);
      group.add(spike2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.11 * s, 0.08 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.15, 0.8, 0.2);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.65 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.18;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.65 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.18;
    group.add(rightArm);
    
    // 护臂
    const bracerGeom = new THREE.BoxGeometry(0.17 * s, 0.4 * s, 0.13 * s);
    const bracerMat = this.createGlowMaterial(godColor, 0.3, 0.8, 0.2);
    const leftBracer = new THREE.Mesh(bracerGeom, bracerMat);
    leftBracer.position.set(-0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(leftBracer);
    const rightBracer = new THREE.Mesh(bracerGeom, bracerMat);
    rightBracer.position.set(0.7 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(rightBracer);
    
    // ===== 头部 =====
    const headSize = 0.38 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xe8d5c0, 0.1, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（雷霆之瞳）
    const eyeGeom = new THREE.SphereGeometry(0.045 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(rightEye);
    
    // ===== 雷神冠 =====
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.32 * s, 0.05 * s, 8, 20);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 雷霆尖塔（5座）
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const towerGeom = new THREE.ConeGeometry(0.06 * s, 0.35 * s, 5);
      const towerMat = i % 2 === 0 
        ? this.createGlowMaterial(godColor, 0.4, 0.8, 0.2)
        : new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.set(Math.cos(angle) * 0.28 * s, 0.22 * s, Math.sin(angle) * 0.28 * s);
      crownGroup.add(tower);
    }
    
    // 中央雷霆宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.12 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.95 });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.4 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.35;
    group.add(crownGroup);
    
    // ===== 雷神之锤 =====
    const hammerGroup = new THREE.Group();
    
    // 锤柄
    const handleGeom = new THREE.CylinderGeometry(0.045 * s, 0.055 * s, 1.8 * s, 10);
    const handleMat = this.createBasicMaterial(0x8b4513, 0.4, 0.6);
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.y = 0.9 * s;
    hammerGroup.add(handle);
    
    // 锤柄缠绕
    for (let i = 0; i < 4; i++) {
      const wrapGeom = new THREE.TorusGeometry(0.06 * s, 0.015 * s, 6, 16);
      const wrapMat = this.createBasicMaterial(0x654321, 0.5, 0.5);
      const wrap = new THREE.Mesh(wrapGeom, wrapMat);
      wrap.rotation.x = Math.PI / 2;
      wrap.position.y = 0.3 + i * 0.35 * s;
      hammerGroup.add(wrap);
    }
    
    // 锤头主体
    const headGroup = new THREE.Group();
    const hammerHeadGeom = new THREE.BoxGeometry(0.5 * s, 0.4 * s, 0.4 * s);
    const hammerHeadMat = this.createGlowMaterial(godColor, 0.4, 0.85, 0.15);
    const hammerHead = new THREE.Mesh(hammerHeadGeom, hammerHeadMat);
    hammerHead.position.y = 1.9 * s;
    headGroup.add(hammerHead);
    
    // 锤头装饰边
    const trimGeom = new THREE.BoxGeometry(0.52 * s, 0.06 * s, 0.42 * s);
    const trimMat = this.createGlowMaterial(goldColor, 0.5);
    const trimTop = new THREE.Mesh(trimGeom, trimMat);
    trimTop.position.y = 2.1 * s;
    headGroup.add(trimTop);
    const trimBottom = new THREE.Mesh(trimGeom, trimMat);
    trimBottom.position.y = 1.7 * s;
    headGroup.add(trimBottom);
    
    // 锤头雷电符文
    const runeGeom = new THREE.BoxGeometry(0.04 * s, 0.2 * s, 0.03 * s);
    const runeMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const rune1 = new THREE.Mesh(runeGeom, runeMat);
    rune1.position.set(0, 1.9 * s, 0.22 * s);
    rune1.rotation.z = 0.3;
    headGroup.add(rune1);
    const rune2 = new THREE.Mesh(runeGeom, runeMat);
    rune2.position.set(0.15 * s, 1.9 * s, 0.22 * s);
    rune2.rotation.z = -0.2;
    headGroup.add(rune2);
    
    hammerGroup.add(headGroup);
    
    // 底部装饰
    const pommelGeom = new THREE.SphereGeometry(0.06 * s, 8, 8);
    const pommelMat = this.createGlowMaterial(goldColor, 0.4);
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.05 * s;
    hammerGroup.add(pommel);
    
    // 环绕电弧
    for (let i = 0; i < 8; i++) {
      const arcGeom = new THREE.BoxGeometry(0.02 * s, 0.15 * s, 0.02 * s);
      const arcMat = new THREE.MeshBasicMaterial({ 
        color: brightColor, 
        transparent: true, opacity: 0.7 
      });
      const arc = new THREE.Mesh(arcGeom, arcMat);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.35 + Math.random() * 0.15;
      const height = 1.5 + Math.random() * 0.6;
      arc.position.set(Math.cos(angle) * radius * s, height * s, Math.sin(angle) * radius * s);
      arc.rotation.z = Math.random() * 0.5 - 0.25;
      arc.userData.angle = angle;
      arc.userData.radius = radius;
      arc.userData.speed = 2 + Math.random() * 2;
      arc.userData.phase = Math.random() * Math.PI * 2;
      hammerGroup.add(arc);
    }
    
    hammerGroup.position.set(-0.85 * s, legHeight * 0.5, 0.1 * s);
    hammerGroup.rotation.z = 0.3;
    hammerGroup.rotation.x = -0.1;
    group.add(hammerGroup);
    
    // ===== 雷电披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.5 * s, 2.5 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.3,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.6, -0.4 * s);
    cape.rotation.x = -0.1;
    group.add(cape);
    
    // 披风雷电内衬
    const capeInnerGeom = new THREE.PlaneGeometry(1.3 * s, 2.3 * s, 8, 5);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, legHeight + torsoHeight * 0.6, -0.38 * s);
    capeInner.rotation.x = -0.1;
    group.add(capeInner);
    
    // ===== 雷霆光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.08 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 电弧粒子
    for (let i = 0; i < 12; i++) {
      const sparkGeom = new THREE.SphereGeometry(0.025 * s + Math.random() * 0.02 * s, 4, 4);
      const sparkMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true, opacity: 0.6
      });
      const spark = new THREE.Mesh(sparkGeom, sparkMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.4;
      spark.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.6, Math.sin(angle) * radius * s);
      spark.userData.angle = angle;
      spark.userData.radius = radius;
      spark.userData.speed = 1 + Math.random() * 1.5;
      spark.userData.baseY = spark.position.y;
      group.add(spark);
    }
    
    group.userData.weapon = hammerGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = thunderEmblemGroup;
  },

  // 天使神 - 光明主宰，六翼天使，天使圣剑，神圣光辉
  createAngelGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xfef3c7);
    const whiteColor = new THREE.Color(0xffffff);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部 - 洁白圣袍 =====
    const legHeight = 1.9 * s;
    const robeGeom = new THREE.CylinderGeometry(0.35 * s, 0.45 * s, legHeight, 16);
    const robeMat = new THREE.MeshStandardMaterial({
      color: whiteColor,
      metalness: 0.2,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
    });
    const robe = new THREE.Mesh(robeGeom, robeMat);
    robe.position.y = legHeight * 0.5;
    group.add(robe);
    
    // 金色镶边
    const trimGeom = new THREE.TorusGeometry(0.42 * s, 0.035 * s, 8, 28);
    const trimMat = this.createGlowMaterial(goldColor, 0.5);
    const trim1 = new THREE.Mesh(trimGeom, trimMat);
    trim1.rotation.x = Math.PI / 2;
    trim1.position.y = 0.3;
    group.add(trim1);
    const trim2 = new THREE.Mesh(trimGeom, trimMat);
    trim2.rotation.x = Math.PI / 2;
    trim2.position.y = legHeight * 0.65;
    group.add(trim2);
    
    // ===== 躯干 - 神圣铠甲 =====
    const torsoHeight = 1.3 * s;
    const torsoGeom = new THREE.BoxGeometry(0.8 * s, torsoHeight, 0.45 * s);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: whiteColor,
      metalness: 0.4,
      roughness: 0.3,
      emissive: godColor,
      emissiveIntensity: 0.2,
    });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲（金色纹饰）
    const chestGeom = new THREE.BoxGeometry(0.7 * s, 0.75 * s, 0.12 * s);
    const chestMat = this.createGlowMaterial(goldColor, 0.35);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.55, 0.26 * s);
    group.add(chest);
    
    // 天使十字徽记
    const crossGroup = new THREE.Group();
    const crossVGeom = new THREE.BoxGeometry(0.06 * s, 0.3 * s, 0.04 * s);
    const crossMat = this.createGlowMaterial(goldColor, 0.6);
    const crossV = new THREE.Mesh(crossVGeom, crossMat);
    crossGroup.add(crossV);
    const crossHGeom = new THREE.BoxGeometry(0.2 * s, 0.06 * s, 0.04 * s);
    const crossH = new THREE.Mesh(crossHGeom, crossMat);
    crossH.position.y = 0.05 * s;
    crossGroup.add(crossH);
    
    crossGroup.position.set(0, legHeight + torsoHeight * 0.55, 0.34 * s);
    group.add(crossGroup);
    
    // ===== 六翼天使之翼 =====
    const wingsGroup = new THREE.Group();
    
    // 翅膀创建函数
    const createWing = (side, layer) => {
      const wingGroup = new THREE.Group();
      const wingLength = 1.8 - layer * 0.35;
      const wingWidth = 0.6 - layer * 0.1;
      
      // 翅膀主体
      const wingGeom = new THREE.PlaneGeometry(wingLength * s, wingWidth * s, 8, 4);
      const wingMat = new THREE.MeshStandardMaterial({
        color: whiteColor,
        metalness: 0.2,
        roughness: 0.4,
        emissive: godColor,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const wing = new THREE.Mesh(wingGeom, wingMat);
      wing.position.x = side * (wingLength * 0.5) * s;
      wing.rotation.y = side * 0.3;
      wingGroup.add(wing);
      
      // 羽毛纹理
      for (let i = 0; i < 6; i++) {
        const featherGeom = new THREE.ConeGeometry(0.05 * s, 0.15 * s, 4);
        const featherMat = new THREE.MeshBasicMaterial({ 
          color: i % 2 === 0 ? whiteColor : godColor,
          transparent: true, opacity: 0.8
        });
        const feather = new THREE.Mesh(featherGeom, featherMat);
        feather.position.set(side * (0.2 + i * 0.2) * s, 0.1 * s, 0);
        feather.rotation.z = side * 0.2;
        wingGroup.add(feather);
      }
      
      wingGroup.position.y = layer * 0.25 * s;
      wingGroup.rotation.z = side * (0.1 + layer * 0.05);
      return wingGroup;
    };
    
    // 三对翅膀（六翼）
    for (let i = 0; i < 3; i++) {
      const leftWing = createWing(-1, i);
      leftWing.position.z = -0.1 * s;
      wingsGroup.add(leftWing);
      
      const rightWing = createWing(1, i);
      rightWing.position.z = -0.1 * s;
      wingsGroup.add(rightWing);
    }
    
    wingsGroup.position.set(0, legHeight + torsoHeight * 0.6, -0.3 * s);
    group.add(wingsGroup);
    
    // 肩部装饰
    const shoulderGeom = new THREE.SphereGeometry(0.22 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(goldColor, 0.4);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.5 * s, legHeight + torsoHeight * 0.78, 0.05 * s);
    leftShoulder.scale.set(1, 0.8, 1.1);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.5 * s, legHeight + torsoHeight * 0.78, 0.05 * s);
    rightShoulder.scale.set(1, 0.8, 1.1);
    group.add(rightShoulder);
    
    // ===== 手臂 =====
    const armHeight = 1.2 * s;
    const armGeom = new THREE.CylinderGeometry(0.09 * s, 0.07 * s, armHeight, 8);
    const armMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.5);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.55 * s, legHeight + torsoHeight * 0.35, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.55 * s, legHeight + torsoHeight * 0.35, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 金色护腕
    const cuffGeom = new THREE.CylinderGeometry(0.1 * s, 0.09 * s, 0.2 * s, 10);
    const cuffMat = this.createGlowMaterial(goldColor, 0.5);
    const leftCuff = new THREE.Mesh(cuffGeom, cuffMat);
    leftCuff.position.set(-0.58 * s, legHeight + torsoHeight * 0.35 - armHeight * 0.25, 0);
    leftCuff.rotation.z = 0.2;
    group.add(leftCuff);
    const rightCuff = new THREE.Mesh(cuffGeom, cuffMat);
    rightCuff.position.set(0.58 * s, legHeight + torsoHeight * 0.35 - armHeight * 0.25, 0);
    rightCuff.rotation.z = -0.2;
    group.add(rightCuff);
    
    // ===== 头部 - 天使面容 =====
    const headSize = 0.36 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.4);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（金色神圣之瞳）
    const eyeGeom = new THREE.SphereGeometry(0.04 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: goldColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1 * s, legHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.1 * s, legHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(rightEye);
    
    // 金色长发
    const hairGeom = new THREE.SphereGeometry(headSize * 1.08, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hairMat = this.createGlowMaterial(goldColor, 0.3, 0.4, 0.5);
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.y = legHeight + torsoHeight + headSize * 0.85;
    group.add(hair);
    
    // ===== 天使冠冕 =====
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.3 * s, 0.04 * s, 8, 24);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.6);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 光环尖塔（7座，代表神圣完美）
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const towerGeom = new THREE.ConeGeometry(0.05 * s, 0.28 * s, 5);
      const towerMat = this.createGlowMaterial(goldColor, 0.5);
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.set(Math.cos(angle) * 0.26 * s, 0.18 * s, Math.sin(angle) * 0.26 * s);
      crownGroup.add(tower);
    }
    
    // 中央太阳宝石
    const sunGemGeom = new THREE.OctahedronGeometry(0.1 * s, 0);
    const sunGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.95 });
    const sunGem = new THREE.Mesh(sunGemGeom, sunGemMat);
    sunGem.position.y = 0.35 * s;
    crownGroup.add(sunGem);
    
    // 太阳光芒
    for (let i = 0; i < 8; i++) {
      const rayGeom = new THREE.BoxGeometry(0.02 * s, 0.15 * s, 0.02 * s);
      const rayMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.8 });
      const ray = new THREE.Mesh(rayGeom, rayMat);
      const angle = (i / 8) * Math.PI * 2;
      ray.position.set(Math.cos(angle) * 0.15 * s, 0.35 * s, Math.sin(angle) * 0.15 * s);
      ray.rotation.z = -angle;
      ray.rotation.x = Math.PI / 6;
      crownGroup.add(ray);
    }
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.3;
    group.add(crownGroup);
    
    // 头顶光环
    const haloTopGeom = new THREE.TorusGeometry(0.4 * s, 0.04 * s, 12, 28);
    const haloTopMat = new THREE.MeshBasicMaterial({ 
      color: goldColor,
      transparent: true,
      opacity: 0.6,
    });
    const haloTop = new THREE.Mesh(haloTopGeom, haloTopMat);
    haloTop.position.y = legHeight + torsoHeight + headSize * 1.9;
    haloTop.rotation.x = Math.PI / 2;
    group.add(haloTop);
    
    // ===== 天使圣剑 =====
    const swordGroup = new THREE.Group();
    
    // 剑身（神圣光辉之剑）
    const bladeGeom = new THREE.BoxGeometry(0.1 * s, 2.0 * s, 0.04 * s);
    const bladeMat = this.createGlowMaterial(whiteColor, 0.5, 0.9, 0.1);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.y = 1.0 * s;
    swordGroup.add(blade);
    
    // 剑刃金边
    const edgeGeom = new THREE.BoxGeometry(0.015 * s, 2.0 * s, 0.05 * s);
    const edgeMat = this.createGlowMaterial(goldColor, 0.6);
    const edge1 = new THREE.Mesh(edgeGeom, edgeMat);
    edge1.position.set(-0.045 * s, 1.0 * s, 0);
    swordGroup.add(edge1);
    const edge2 = new THREE.Mesh(edgeGeom, edgeMat);
    edge2.position.set(0.045 * s, 1.0 * s, 0);
    swordGroup.add(edge2);
    
    // 剑尖
    const tipGeom = new THREE.ConeGeometry(0.07 * s, 0.25 * s, 4);
    const tipMat = this.createGlowMaterial(whiteColor, 0.6, 0.9, 0.1);
    const tip = new THREE.Mesh(tipGeom, tipMat);
    tip.position.y = 2.1 * s;
    tip.rotation.z = Math.PI / 4;
    swordGroup.add(tip);
    
    // 十字护手
    const guardGeom = new THREE.BoxGeometry(0.4 * s, 0.06 * s, 0.08 * s);
    const guardMat = this.createGlowMaterial(goldColor, 0.6);
    const guard = new THREE.Mesh(guardGeom, guardMat);
    guard.position.y = 0.05 * s;
    swordGroup.add(guard);
    
    // 剑柄
    const hiltGeom = new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 0.3 * s, 8);
    const hiltMat = this.createBasicMaterial(0x8b4513, 0.4, 0.5);
    const hilt = new THREE.Mesh(hiltGeom, hiltMat);
    hilt.position.y = -0.13 * s;
    swordGroup.add(hilt);
    
    // 剑柄宝石
    const pommelGeom = new THREE.OctahedronGeometry(0.07 * s, 0);
    const pommelMat = new THREE.MeshBasicMaterial({ color: godColor });
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.32 * s;
    swordGroup.add(pommel);
    
    // 圣光粒子
    for (let i = 0; i < 10; i++) {
      const lightParticleGeom = new THREE.SphereGeometry(0.02 * s + Math.random() * 0.02 * s, 4, 4);
      const lightParticleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true, opacity: 0.6
      });
      const lightParticle = new THREE.Mesh(lightParticleGeom, lightParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.6 * s;
      const radius = 0.08 + Math.random() * 0.12;
      lightParticle.position.set(Math.cos(angle) * radius * s, 0.2 * s + height, Math.sin(angle) * radius * s);
      lightParticle.userData.angle = angle;
      lightParticle.userData.height = height;
      lightParticle.userData.radius = radius;
      lightParticle.userData.speed = 0.5 + Math.random() * 1;
      swordGroup.add(lightParticle);
    }
    
    swordGroup.position.set(0.85 * s, legHeight + torsoHeight * 0.3, 0.15 * s);
    swordGroup.rotation.z = -0.35;
    swordGroup.rotation.x = 0.08;
    group.add(swordGroup);
    
    // ===== 神圣光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.85 * s, 0.08 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 内圈
    const haloInnerGeom = new THREE.TorusGeometry(0.55 * s, 0.05 * s, 12, 32);
    const haloInnerMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.4,
    });
    const haloInner = new THREE.Mesh(haloInnerGeom, haloInnerMat);
    haloInner.rotation.x = -Math.PI / 2;
    haloInner.position.y = 0.1;
    group.add(haloInner);
    
    // 圣光粒子环绕
    for (let i = 0; i < 15; i++) {
      const holyParticleGeom = new THREE.SphereGeometry(0.02 * s + Math.random() * 0.025 * s, 4, 4);
      const holyParticleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true, opacity: 0.5
      });
      const holyParticle = new THREE.Mesh(holyParticleGeom, holyParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;
      holyParticle.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 2, Math.sin(angle) * radius * s);
      holyParticle.userData.angle = angle;
      holyParticle.userData.radius = radius;
      holyParticle.userData.speed = 0.3 + Math.random() * 0.5;
      holyParticle.userData.baseY = holyParticle.position.y;
      group.add(holyParticle);
    }
    
    group.userData.weapon = swordGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = crossGroup;
    group.userData.wings = wingsGroup;
  },

  // 罗刹神 - 幽冥主宰，暗紫神袍，罗刹镰刀，噬魂幽冥
  createRakshasaGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0x8b5cf6);
    const darkColor = new THREE.Color(0x1e1b4b);
    const boneColor = new THREE.Color(0xd4d4d4);
    const s = scale;
    
    // ===== 腿部 - 幽冥神袍 =====
    const robeHeight = 2.0 * s;
    const robeGeom = new THREE.CylinderGeometry(0.4 * s, 0.55 * s, robeHeight, 18);
    const robeMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.2,
      roughness: 0.6,
      emissive: godColor,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 0.95,
    });
    const robe = new THREE.Mesh(robeGeom, robeMat);
    robe.position.y = robeHeight * 0.5;
    group.add(robe);
    
    // 神袍暗纹
    for (let i = 0; i < 8; i++) {
      const runeGeom = new THREE.BoxGeometry(0.02 * s, 0.3 * s, 0.02 * s);
      const runeMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.4 });
      const rune = new THREE.Mesh(runeGeom, runeMat);
      const angle = (i / 8) * Math.PI * 2;
      rune.position.set(Math.cos(angle) * 0.45 * s, robeHeight * 0.4, Math.sin(angle) * 0.45 * s);
      rune.rotation.y = angle;
      rune.rotation.z = 0.1 + Math.random() * 0.2;
      group.add(rune);
    }
    
    // 骷髅装饰腰带
    const beltGeom = new THREE.TorusGeometry(0.42 * s, 0.04 * s, 8, 28);
    const beltMat = this.createBasicMaterial(boneColor, 0.3, 0.5);
    const belt = new THREE.Mesh(beltGeom, beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = robeHeight * 0.55;
    group.add(belt);
    
    // 骷髅头装饰
    for (let i = 0; i < 5; i++) {
      const skullGeom = new THREE.SphereGeometry(0.06 * s, 8, 8);
      const skullMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
      const skull = new THREE.Mesh(skullGeom, skullMat);
      const angle = (i / 5) * Math.PI * 2;
      skull.position.set(Math.cos(angle) * 0.42 * s, robeHeight * 0.55, Math.sin(angle) * 0.42 * s);
      group.add(skull);
    }
    
    // ===== 躯干 =====
    const torsoHeight = 1.3 * s;
    const torsoGeom = new THREE.BoxGeometry(0.8 * s, torsoHeight, 0.45 * s);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.3,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.12,
    });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = robeHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲（幽冥骨甲）
    const chestGeom = new THREE.BoxGeometry(0.7 * s, 0.75 * s, 0.13 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.25, 0.7, 0.3);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, robeHeight + torsoHeight * 0.55, 0.26 * s);
    group.add(chest);
    
    // 骷髅徽记
    const skullEmblemGroup = new THREE.Group();
    const skullHeadGeom = new THREE.SphereGeometry(0.15 * s, 10, 10);
    const skullHeadMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const skullHead = new THREE.Mesh(skullHeadGeom, skullHeadMat);
    skullEmblemGroup.add(skullHead);
    // 眼窝
    const eyeSocketGeom = new THREE.SphereGeometry(0.04 * s, 6, 6);
    const eyeSocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftSocket = new THREE.Mesh(eyeSocketGeom, eyeSocketMat);
    leftSocket.position.set(-0.06 * s, 0.02 * s, 0.12 * s);
    skullEmblemGroup.add(leftSocket);
    const rightSocket = new THREE.Mesh(eyeSocketGeom, eyeSocketMat);
    rightSocket.position.set(0.06 * s, 0.02 * s, 0.12 * s);
    skullEmblemGroup.add(rightSocket);
    
    skullEmblemGroup.position.set(0, robeHeight + torsoHeight * 0.55, 0.35 * s);
    group.add(skullEmblemGroup);
    
    // 肩甲（骨刺肩甲）
    const shoulderGeom = new THREE.SphereGeometry(0.28 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(godColor, 0.2, 0.7, 0.3);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.52 * s, robeHeight + torsoHeight * 0.78, 0);
    leftShoulder.scale.set(1, 0.85, 1.15);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.52 * s, robeHeight + torsoHeight * 0.78, 0);
    rightShoulder.scale.set(1, 0.85, 1.15);
    group.add(rightShoulder);
    
    // 骨刺
    for (let i = 0; i < 4; i++) {
      const boneSpikeGeom = new THREE.ConeGeometry(0.04 * s, 0.22 * s, 5);
      const boneSpikeMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
      const boneSpike = new THREE.Mesh(boneSpikeGeom, boneSpikeMat);
      boneSpike.position.set(-0.52 * s + (i - 1.5) * 0.12, robeHeight + torsoHeight * 0.78 + 0.2, 0.06);
      group.add(boneSpike);
      const boneSpike2 = new THREE.Mesh(boneSpikeGeom, boneSpikeMat);
      boneSpike2.position.set(0.52 * s + (i - 1.5) * 0.12, robeHeight + torsoHeight * 0.78 + 0.2, 0.06);
      group.add(boneSpike2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.25 * s;
    const armGeom = new THREE.CylinderGeometry(0.1 * s, 0.07 * s, armHeight, 8);
    const armMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.2,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.1,
    });
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.6 * s, robeHeight + torsoHeight * 0.35, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.6 * s, robeHeight + torsoHeight * 0.35, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 骨爪护手
    const gauntletGeom = new THREE.BoxGeometry(0.15 * s, 0.3 * s, 0.12 * s);
    const gauntletMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const leftGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    leftGauntlet.position.set(-0.65 * s, robeHeight + torsoHeight * 0.35 - armHeight * 0.3, 0);
    group.add(leftGauntlet);
    const rightGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    rightGauntlet.position.set(0.65 * s, robeHeight + torsoHeight * 0.35 - armHeight * 0.3, 0);
    group.add(rightGauntlet);
    
    // ===== 头部 - 罗刹面具 =====
    const headSize = 0.37 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xd0c0b0, 0.1, 0.6);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = robeHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 罗刹面具（全脸骷髅面具）
    const maskGeom = new THREE.SphereGeometry(headSize * 1.05, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const maskMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const mask = new THREE.Mesh(maskGeom, maskMat);
    mask.position.y = robeHeight + torsoHeight + headSize * 0.75;
    group.add(mask);
    
    // 眼窝（紫光闪烁）
    const maskEyeGeom = new THREE.SphereGeometry(0.05 * s, 6, 6);
    const maskEyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const maskLeftEye = new THREE.Mesh(maskEyeGeom, maskEyeMat);
    maskLeftEye.position.set(-0.1 * s, robeHeight + torsoHeight + headSize * 0.82, headSize * 0.9);
    group.add(maskLeftEye);
    const maskRightEye = new THREE.Mesh(maskEyeGeom, maskEyeMat);
    maskRightEye.position.set(0.1 * s, robeHeight + torsoHeight + headSize * 0.82, headSize * 0.9);
    group.add(maskRightEye);
    
    // ===== 罗刹神冠 =====
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.32 * s, 0.045 * s, 8, 20);
    const crownBaseMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 骨刺尖塔（6座）
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const towerGeom = new THREE.ConeGeometry(0.06 * s, 0.32 * s, 5);
      const towerMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
      const tower = new THREE.Mesh(towerGeom, towerMat);
      tower.position.set(Math.cos(angle) * 0.28 * s, 0.2 * s, Math.sin(angle) * 0.28 * s);
      crownGroup.add(tower);
    }
    
    // 中央幽冥宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.11 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.38 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = robeHeight + torsoHeight + headSize * 1.3;
    group.add(crownGroup);
    
    // ===== 罗刹镰刀 =====
    const scytheGroup = new THREE.Group();
    
    // 镰柄
    const handleGeom = new THREE.CylinderGeometry(0.04 * s, 0.05 * s, 2.5 * s, 10);
    const handleMat = this.createBasicMaterial(0x2d1b4e, 0.5, 0.5);
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.y = 1.25 * s;
    scytheGroup.add(handle);
    
    // 柄身缠绕
    for (let i = 0; i < 6; i++) {
      const wrapGeom = new THREE.TorusGeometry(0.055 * s, 0.015 * s, 6, 16);
      const wrapMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
      const wrap = new THREE.Mesh(wrapGeom, wrapMat);
      wrap.rotation.x = Math.PI / 2;
      wrap.position.y = 0.2 + i * 0.38 * s;
      scytheGroup.add(wrap);
    }
    
    // 镰刀头部
    const bladeGroup = new THREE.Group();
    
    // 主镰刃
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, 0);
    bladeShape.quadraticCurveTo(0.5 * s, 0.2 * s, 0.8 * s, 0.6 * s);
    bladeShape.quadraticCurveTo(0.9 * s, 0.9 * s, 0.7 * s, 1.0 * s);
    bladeShape.quadraticCurveTo(0.4 * s, 0.7 * s, 0.1 * s, 0.3 * s);
    bladeShape.lineTo(0, 0);
    
    const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.04 * s, bevelEnabled: false });
    const bladeMat = this.createGlowMaterial(godColor, 0.4, 0.8, 0.2);
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.set(0.05 * s, 2.3 * s, -0.02 * s);
    bladeGroup.add(blade);
    
    // 刀刃（更亮）
    const edgeShape = new THREE.Shape();
    edgeShape.moveTo(0.02 * s, 0.02 * s);
    edgeShape.quadraticCurveTo(0.52 * s, 0.22 * s, 0.82 * s, 0.62 * s);
    edgeShape.quadraticCurveTo(0.88 * s, 0.85 * s, 0.72 * s, 0.98 * s);
    edgeShape.lineTo(0.7 * s, 0.95 * s);
    edgeShape.quadraticCurveTo(0.5 * s, 0.65 * s, 0.08 * s, 0.28 * s);
    edgeShape.lineTo(0.02 * s, 0.02 * s);
    
    const edgeGeom = new THREE.ExtrudeGeometry(edgeShape, { depth: 0.02 * s, bevelEnabled: false });
    const edgeMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.8 });
    const edge = new THREE.Mesh(edgeGeom, edgeMat);
    edge.position.set(0.05 * s, 2.3 * s, 0.01 * s);
    bladeGroup.add(edge);
    
    // 镰尾尖刺
    const spikeGeom = new THREE.ConeGeometry(0.05 * s, 0.2 * s, 5);
    const spikeMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const spike = new THREE.Mesh(spikeGeom, spikeMat);
    spike.position.set(-0.1 * s, 2.25 * s, 0);
    spike.rotation.z = -0.8;
    bladeGroup.add(spike);
    
    scytheGroup.add(bladeGroup);
    
    // 底部尖刺
    const pommelGeom = new THREE.ConeGeometry(0.06 * s, 0.2 * s, 6);
    const pommelMat = this.createBasicMaterial(boneColor, 0.4, 0.5);
    const pommel = new THREE.Mesh(pommelGeom, pommelMat);
    pommel.position.y = -0.1 * s;
    pommel.rotation.x = Math.PI;
    scytheGroup.add(pommel);
    
    // 幽冥粒子
    for (let i = 0; i < 10; i++) {
      const ghostParticleGeom = new THREE.SphereGeometry(0.025 * s + Math.random() * 0.02 * s, 4, 4);
      const ghostParticleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true, opacity: 0.5
      });
      const ghostParticle = new THREE.Mesh(ghostParticleGeom, ghostParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 2.0 * s;
      const radius = 0.1 + Math.random() * 0.15;
      ghostParticle.position.set(Math.cos(angle) * radius * s, 0.2 * s + height, Math.sin(angle) * radius * s);
      ghostParticle.userData.angle = angle;
      ghostParticle.userData.height = height;
      ghostParticle.userData.radius = radius;
      ghostParticle.userData.speed = 0.4 + Math.random() * 0.6;
      scytheGroup.add(ghostParticle);
    }
    
    scytheGroup.position.set(-0.85 * s, robeHeight * 0.5, 0.1 * s);
    scytheGroup.rotation.z = 0.25;
    scytheGroup.rotation.x = -0.1;
    group.add(scytheGroup);
    
    // ===== 幽冥披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.6 * s, 2.6 * s, 10, 7);
    const capeMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.2,
      roughness: 0.6,
      emissive: godColor,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.93,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, robeHeight + torsoHeight * 0.55, -0.45 * s);
    cape.rotation.x = -0.08;
    group.add(cape);
    
    // 披风内衬（幽紫色）
    const capeInnerGeom = new THREE.PlaneGeometry(1.4 * s, 2.4 * s, 8, 6);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, robeHeight + torsoHeight * 0.55, -0.43 * s);
    capeInner.rotation.x = -0.08;
    group.add(capeInner);
    
    // ===== 幽冥光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.85 * s, 0.09 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.45,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 幽冥雾气粒子
    for (let i = 0; i < 15; i++) {
      const mistGeom = new THREE.SphereGeometry(0.05 * s + Math.random() * 0.05 * s, 6, 6);
      const mistMat = new THREE.MeshBasicMaterial({ 
        color: darkColor,
        transparent: true, opacity: 0.35
      });
      const mist = new THREE.Mesh(mistGeom, mistMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.5;
      mist.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.6, Math.sin(angle) * radius * s);
      mist.userData.angle = angle;
      mist.userData.radius = radius;
      mist.userData.speed = 0.2 + Math.random() * 0.3;
      mist.userData.baseY = mist.position.y;
      group.add(mist);
    }
    
    group.userData.weapon = scytheGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = skullEmblemGroup;
  },

  // 凤凰之神 - 涅槃之神，火焰凤凰，涅槃重生，不死不灭
  createPhoenixGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xfcd34d);
    const fireColor = new THREE.Color(0xef4444);
    const goldColor = new THREE.Color(0xffd700);
    const s = scale;
    
    // ===== 腿部 - 火焰羽袍 =====
    const robeHeight = 1.8 * s;
    const robeGeom = new THREE.CylinderGeometry(0.35 * s, 0.5 * s, robeHeight, 16);
    const robeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.3,
      roughness: 0.5,
      emissive: fireColor,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
    });
    const robe = new THREE.Mesh(robeGeom, robeMat);
    robe.position.y = robeHeight * 0.5;
    group.add(robe);
    
    // 羽毛装饰
    for (let i = 0; i < 6; i++) {
      const featherGeom = new THREE.ConeGeometry(0.06 * s, 0.25 * s, 4);
      const featherMat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? brightColor : fireColor,
        transparent: true, opacity: 0.8 
      });
      const feather = new THREE.Mesh(featherGeom, featherMat);
      const angle = (i / 6) * Math.PI * 2;
      feather.position.set(Math.cos(angle) * 0.42 * s, robeHeight * 0.3, Math.sin(angle) * 0.42 * s);
      feather.rotation.y = angle + Math.PI / 2;
      feather.rotation.x = 0.3;
      group.add(feather);
    }
    
    // ===== 躯干 - 凤凰战甲 =====
    const torsoHeight = 1.2 * s;
    const torsoGeom = new THREE.BoxGeometry(0.75 * s, torsoHeight, 0.42 * s);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.5,
      roughness: 0.3,
      emissive: fireColor,
      emissiveIntensity: 0.2,
    });
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = robeHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲
    const chestGeom = new THREE.BoxGeometry(0.65 * s, 0.7 * s, 0.12 * s);
    const chestMat = this.createGlowMaterial(brightColor, 0.35);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, robeHeight + torsoHeight * 0.55, 0.25 * s);
    group.add(chest);
    
    // 凤凰徽记
    const phoenixEmblemGroup = new THREE.Group();
    // 凤凰身体
    const bodyGeom = new THREE.SphereGeometry(0.08 * s, 8, 8);
    const bodyMat = new THREE.MeshBasicMaterial({ color: fireColor });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    phoenixEmblemGroup.add(body);
    // 凤凰翅膀
    const wingGeom = new THREE.ConeGeometry(0.06 * s, 0.15 * s, 4);
    const wingMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.set(-0.1 * s, 0.02 * s, 0);
    leftWing.rotation.z = 0.5;
    phoenixEmblemGroup.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeom, wingMat);
    rightWing.position.set(0.1 * s, 0.02 * s, 0);
    rightWing.rotation.z = -0.5;
    phoenixEmblemGroup.add(rightWing);
    // 凤凰尾羽
    const tailGeom = new THREE.ConeGeometry(0.04 * s, 0.12 * s, 4);
    const tailMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.9 });
    const tail = new THREE.Mesh(tailGeom, tailMat);
    tail.position.y = -0.08 * s;
    tail.rotation.x = Math.PI;
    phoenixEmblemGroup.add(tail);
    
    phoenixEmblemGroup.position.set(0, robeHeight + torsoHeight * 0.55, 0.33 * s);
    group.add(phoenixEmblemGroup);
    
    // ===== 凤凰之翼（火焰翅膀）=====
    const wingsGroup = new THREE.Group();
    
    const createPhoenixWing = (side) => {
      const wingGroup = new THREE.Group();
      
      // 主翼
      const mainWingGeom = new THREE.PlaneGeometry(1.5 * s, 0.8 * s, 6, 4);
      const mainWingMat = new THREE.MeshStandardMaterial({
        color: godColor,
        metalness: 0.2,
        roughness: 0.5,
        emissive: fireColor,
        emissiveIntensity: 0.25,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const mainWing = new THREE.Mesh(mainWingGeom, mainWingMat);
      mainWing.position.x = side * 0.7 * s;
      mainWing.rotation.y = side * 0.4;
      wingGroup.add(mainWing);
      
      // 火焰羽毛
      for (let i = 0; i < 8; i++) {
        const featherWingGeom = new THREE.ConeGeometry(0.05 * s + Math.random() * 0.03 * s, 0.2 * s + Math.random() * 0.15 * s, 4);
        const featherWingMat = new THREE.MeshBasicMaterial({ 
          color: Math.random() > 0.5 ? brightColor : fireColor,
          transparent: true, opacity: 0.8 
        });
        const featherWing = new THREE.Mesh(featherWingGeom, featherWingMat);
        featherWing.position.set(side * (0.3 + i * 0.15) * s, 0.1 + Math.random() * 0.2, 0);
        featherWing.rotation.z = side * (0.3 + Math.random() * 0.3);
        wingGroup.add(featherWing);
      }
      
      return wingGroup;
    };
    
    const leftPhoenixWing = createPhoenixWing(-1);
    leftPhoenixWing.position.z = -0.1 * s;
    wingsGroup.add(leftPhoenixWing);
    
    const rightPhoenixWing = createPhoenixWing(1);
    rightPhoenixWing.position.z = -0.1 * s;
    wingsGroup.add(rightPhoenixWing);
    
    wingsGroup.position.set(0, robeHeight + torsoHeight * 0.55, -0.25 * s);
    group.add(wingsGroup);
    
    // 肩甲（火焰羽毛肩甲）
    const shoulderGeom = new THREE.SphereGeometry(0.24 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(fireColor, 0.35, 0.7, 0.3);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.48 * s, robeHeight + torsoHeight * 0.75, 0.05 * s);
    leftShoulder.scale.set(1, 0.8, 1.1);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.48 * s, robeHeight + torsoHeight * 0.75, 0.05 * s);
    rightShoulder.scale.set(1, 0.8, 1.1);
    group.add(rightShoulder);
    
    // ===== 手臂 =====
    const armHeight = 1.15 * s;
    const armGeom = new THREE.CylinderGeometry(0.09 * s, 0.065 * s, armHeight, 8);
    const armMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.4,
      roughness: 0.4,
      emissive: fireColor,
      emissiveIntensity: 0.15,
    });
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.55 * s, robeHeight + torsoHeight * 0.35, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.55 * s, robeHeight + torsoHeight * 0.35, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 火焰护腕
    const cuffGeom = new THREE.CylinderGeometry(0.1 * s, 0.09 * s, 0.18 * s, 10);
    const cuffMat = this.createGlowMaterial(brightColor, 0.4);
    const leftCuff = new THREE.Mesh(cuffGeom, cuffMat);
    leftCuff.position.set(-0.58 * s, robeHeight + torsoHeight * 0.35 - armHeight * 0.25, 0);
    leftCuff.rotation.z = 0.2;
    group.add(leftCuff);
    const rightCuff = new THREE.Mesh(cuffGeom, cuffMat);
    rightCuff.position.set(0.58 * s, robeHeight + torsoHeight * 0.35 - armHeight * 0.25, 0);
    rightCuff.rotation.z = -0.2;
    group.add(rightCuff);
    
    // ===== 头部 - 凤凰面容 =====
    const headSize = 0.35 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = robeHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛（火红色凤目）
    const eyeGeom = new THREE.SphereGeometry(0.04 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: fireColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1 * s, robeHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.1 * s, robeHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(rightEye);
    
    // 凤凰羽冠
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.3 * s, 0.035 * s, 8, 22);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.5);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 凤羽头冠（7根凤羽）
    for (let i = 0; i < 7; i++) {
      const angle = -0.6 + (i / 6) * 1.2;
      const featherCrownGeom = new THREE.ConeGeometry(0.04 * s, 0.35 * s, 4);
      const featherCrownMat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? brightColor : fireColor,
        transparent: true, opacity: 0.9 
      });
      const featherCrown = new THREE.Mesh(featherCrownGeom, featherCrownMat);
      featherCrown.position.set(Math.sin(angle) * 0.25 * s, 0.25 * s, Math.cos(angle) * 0.1 * s);
      featherCrown.rotation.x = -angle * 0.5;
      featherCrown.rotation.z = angle * 0.3;
      crownGroup.add(featherCrown);
    }
    
    // 中央火焰宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.1 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.95 });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.4 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = robeHeight + torsoHeight + headSize * 1.25;
    group.add(crownGroup);
    
    // 头顶火焰光环
    const haloTopGeom = new THREE.TorusGeometry(0.38 * s, 0.04 * s, 12, 28);
    const haloTopMat = new THREE.MeshBasicMaterial({ 
      color: fireColor,
      transparent: true,
      opacity: 0.55,
    });
    const haloTop = new THREE.Mesh(haloTopGeom, haloTopMat);
    haloTop.position.y = robeHeight + torsoHeight + headSize * 1.85;
    haloTop.rotation.x = Math.PI / 2;
    group.add(haloTop);
    
    // ===== 凤凰权杖 =====
    const staffGroup = new THREE.Group();
    
    // 杖身
    const staffHandleGeom = new THREE.CylinderGeometry(0.035 * s, 0.045 * s, 2.0 * s, 10);
    const staffHandleMat = this.createGlowMaterial(goldColor, 0.4);
    const staffHandle = new THREE.Mesh(staffHandleGeom, staffHandleMat);
    staffHandle.position.y = 1.0 * s;
    staffGroup.add(staffHandle);
    
    // 杖身纹路
    for (let i = 0; i < 5; i++) {
      const staffRingGeom = new THREE.TorusGeometry(0.05 * s, 0.012 * s, 6, 16);
      const staffRingMat = this.createGlowMaterial(fireColor, 0.5);
      const staffRing = new THREE.Mesh(staffRingGeom, staffRingMat);
      staffRing.rotation.x = Math.PI / 2;
      staffRing.position.y = 0.25 + i * 0.35 * s;
      staffGroup.add(staffRing);
    }
    
    // 权杖顶部 - 凤凰火焰
    const topGroup = new THREE.Group();
    
    // 火焰球
    const fireOrbGeom = new THREE.IcosahedronGeometry(0.18 * s, 1);
    const fireOrbMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true, opacity: 0.9 
    });
    const fireOrb = new THREE.Mesh(fireOrbGeom, fireOrbMat);
    fireOrb.position.y = 2.2 * s;
    topGroup.add(fireOrb);
    
    // 火焰尖刺
    for (let i = 0; i < 6; i++) {
      const fireSpikeGeom = new THREE.ConeGeometry(0.05 * s, 0.2 * s, 5);
      const fireSpikeMat = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? fireColor : brightColor,
        transparent: true, opacity: 0.85 
      });
      const fireSpike = new THREE.Mesh(fireSpikeGeom, fireSpikeMat);
      const angle = (i / 6) * Math.PI * 2;
      fireSpike.position.set(Math.cos(angle) * 0.15 * s, 2.2 * s, Math.sin(angle) * 0.15 * s);
      fireSpike.rotation.x = -Math.PI / 4;
      fireSpike.rotation.z = angle;
      topGroup.add(fireSpike);
    }
    
    // 小凤凰
    const miniPhoenixGeom = new THREE.SphereGeometry(0.08 * s, 8, 8);
    const miniPhoenixMat = new THREE.MeshBasicMaterial({ color: goldColor });
    const miniPhoenix = new THREE.Mesh(miniPhoenixGeom, miniPhoenixMat);
    miniPhoenix.position.y = 2.4 * s;
    topGroup.add(miniPhoenix);
    
    staffGroup.add(topGroup);
    
    // 底部装饰
    const staffPommelGeom = new THREE.ConeGeometry(0.05 * s, 0.15 * s, 6);
    const staffPommelMat = this.createGlowMaterial(goldColor, 0.5);
    const staffPommel = new THREE.Mesh(staffPommelGeom, staffPommelMat);
    staffPommel.position.y = -0.08 * s;
    staffPommel.rotation.x = Math.PI;
    staffGroup.add(staffPommel);
    
    // 火焰粒子
    for (let i = 0; i < 10; i++) {
      const fireParticleGeom = new THREE.SphereGeometry(0.02 * s + Math.random() * 0.02 * s, 4, 4);
      const fireParticleMat = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? brightColor : fireColor,
        transparent: true, opacity: 0.6
      });
      const fireParticle = new THREE.Mesh(fireParticleGeom, fireParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.6 * s;
      const radius = 0.08 + Math.random() * 0.12;
      fireParticle.position.set(Math.cos(angle) * radius * s, 0.3 * s + height, Math.sin(angle) * radius * s);
      fireParticle.userData.angle = angle;
      fireParticle.userData.height = height;
      fireParticle.userData.radius = radius;
      fireParticle.userData.speed = 0.8 + Math.random() * 1.2;
      staffGroup.add(fireParticle);
    }
    
    staffGroup.position.set(0.8 * s, robeHeight * 0.55, 0.12 * s);
    staffGroup.rotation.z = -0.3;
    staffGroup.rotation.x = -0.08;
    group.add(staffGroup);
    
    // ===== 涅槃披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.4 * s, 2.2 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.2,
      roughness: 0.5,
      emissive: fireColor,
      emissiveIntensity: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, robeHeight + torsoHeight * 0.55, -0.38 * s);
    cape.rotation.x = -0.1;
    group.add(cape);
    
    // 披风火焰内衬
    const capeInnerGeom = new THREE.PlaneGeometry(1.2 * s, 2.0 * s, 8, 5);
    const capeInnerMat = new THREE.MeshBasicMaterial({
      color: brightColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const capeInner = new THREE.Mesh(capeInnerGeom, capeInnerMat);
    capeInner.position.set(0, robeHeight + torsoHeight * 0.55, -0.36 * s);
    capeInner.rotation.x = -0.1;
    group.add(capeInner);
    
    // ===== 涅槃光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.75 * s, 0.08 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 火焰粒子环绕
    for (let i = 0; i < 12; i++) {
      const fireFloaterGeom = new THREE.SphereGeometry(0.025 * s + Math.random() * 0.025 * s, 5, 5);
      const fireFloaterMat = new THREE.MeshBasicMaterial({ 
        color: Math.random() > 0.5 ? brightColor : fireColor,
        transparent: true, opacity: 0.55
      });
      const fireFloater = new THREE.Mesh(fireFloaterGeom, fireFloaterMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.45 + Math.random() * 0.45;
      fireFloater.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.7, Math.sin(angle) * radius * s);
      fireFloater.userData.angle = angle;
      fireFloater.userData.radius = radius;
      fireFloater.userData.speed = 0.6 + Math.random() * 0.6;
      fireFloater.userData.baseY = fireFloater.position.y;
      group.add(fireFloater);
    }
    
    group.userData.weapon = staffGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = phoenixEmblemGroup;
    group.userData.wings = wingsGroup;
  },

  // 兽神 - 万兽之王，兽神铠甲，泰坦巨斧，统御万兽
  createBeastGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = new THREE.Color(0xd97706);
    const darkColor = new THREE.Color(0x44403c);
    const goldColor = new THREE.Color(0xfbbf24);
    const s = scale;
    
    // ===== 腿部 - 兽神战铠 =====
    const legHeight = 1.7 * s;
    const legGeom = new THREE.CylinderGeometry(0.18 * s, 0.22 * s, legHeight, 10);
    const legMat = this.createGlowMaterial(darkColor, 0.15, 0.6, 0.4);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.35 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.35 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 兽毛装饰
    for (let i = 0; i < 3; i++) {
      const furGeom = new THREE.ConeGeometry(0.07 * s, 0.18 * s, 5);
      const furMat = this.createBasicMaterial(godColor, 0.3, 0.6);
      const fur1 = new THREE.Mesh(furGeom, furMat);
      fur1.position.set(-0.35 * s, 0.5 + i * 0.4, 0.12 * s);
      group.add(fur1);
      const fur2 = new THREE.Mesh(furGeom, furMat);
      fur2.position.set(0.35 * s, 0.5 + i * 0.4, 0.12 * s);
      group.add(fur2);
    }
    
    // 兽牙护膝
    const kneeGeom = new THREE.BoxGeometry(0.18 * s, 0.15 * s, 0.14 * s);
    const kneeMat = this.createBasicMaterial(0xfafaf9, 0.4, 0.5);
    const leftKnee = new THREE.Mesh(kneeGeom, kneeMat);
    leftKnee.position.set(-0.35 * s, legHeight * 0.55, 0.08 * s);
    group.add(leftKnee);
    const rightKnee = new THREE.Mesh(kneeGeom, kneeMat);
    rightKnee.position.set(0.35 * s, legHeight * 0.55, 0.08 * s);
    group.add(rightKnee);
    
    // ===== 躯干 - 兽神重甲 =====
    const torsoHeight = 1.5 * s;
    const torsoGeom = new THREE.BoxGeometry(0.95 * s, torsoHeight, 0.5 * s);
    const torsoMat = this.createGlowMaterial(darkColor, 0.1, 0.6, 0.4);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸甲（兽纹重甲）
    const chestGeom = new THREE.BoxGeometry(0.85 * s, 0.9 * s, 0.16 * s);
    const chestMat = this.createGlowMaterial(godColor, 0.25, 0.6, 0.4);
    const chest = new THREE.Mesh(chestGeom, chestMat);
    chest.position.set(0, legHeight + torsoHeight * 0.55, 0.28 * s);
    group.add(chest);
    
    // 兽王徽记（虎头）
    const beastEmblemGroup = new THREE.Group();
    // 虎头
    const tigerHeadGeom = new THREE.SphereGeometry(0.15 * s, 10, 10);
    const tigerHeadMat = this.createBasicMaterial(godColor, 0.4, 0.5);
    const tigerHead = new THREE.Mesh(tigerHeadGeom, tigerHeadMat);
    beastEmblemGroup.add(tigerHead);
    // 王字纹
    const wangGeom = new THREE.BoxGeometry(0.06 * s, 0.02 * s, 0.02 * s);
    const wangMat = new THREE.MeshBasicMaterial({ color: goldColor });
    const wang1 = new THREE.Mesh(wangGeom, wangMat);
    wang1.position.y = 0.05 * s;
    wang1.position.z = 0.13 * s;
    beastEmblemGroup.add(wang1);
    const wang2 = new THREE.Mesh(wangGeom, wangMat);
    wang2.position.y = 0.02 * s;
    wang2.position.z = 0.13 * s;
    beastEmblemGroup.add(wang2);
    const wang3 = new THREE.Mesh(wangGeom, wangMat);
    wang3.scale.x = 0.6;
    wang3.position.y = -0.01 * s;
    wang3.position.z = 0.13 * s;
    beastEmblemGroup.add(wang3);
    // 虎眼
    const tigerEyeGeom = new THREE.SphereGeometry(0.025 * s, 4, 4);
    const tigerEyeMat = new THREE.MeshBasicMaterial({ color: 0xfcd34d });
    const tigerLeftEye = new THREE.Mesh(tigerEyeGeom, tigerEyeMat);
    tigerLeftEye.position.set(-0.06 * s, 0.02 * s, 0.13 * s);
    beastEmblemGroup.add(tigerLeftEye);
    const tigerRightEye = new THREE.Mesh(tigerEyeGeom, tigerEyeMat);
    tigerRightEye.position.set(0.06 * s, 0.02 * s, 0.13 * s);
    beastEmblemGroup.add(tigerRightEye);
    
    beastEmblemGroup.position.set(0, legHeight + torsoHeight * 0.55, 0.38 * s);
    group.add(beastEmblemGroup);
    
    // 肩甲（巨兽肩甲）
    const shoulderGeom = new THREE.SphereGeometry(0.3 * s, 10, 10);
    const shoulderMat = this.createGlowMaterial(godColor, 0.2, 0.6, 0.4);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.58 * s, legHeight + torsoHeight * 0.82, 0);
    leftShoulder.scale.set(1, 0.75, 1.2);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.58 * s, legHeight + torsoHeight * 0.82, 0);
    rightShoulder.scale.set(1, 0.75, 1.2);
    group.add(rightShoulder);
    
    // 肩甲兽角
    for (let i = 0; i < 2; i++) {
      const hornGeom = new THREE.ConeGeometry(0.05 * s, 0.3 * s, 6);
      const hornMat = this.createBasicMaterial(0xfafaf9, 0.4, 0.5);
      const horn = new THREE.Mesh(hornGeom, hornMat);
      horn.position.set(-0.58 * s + (i - 0.5) * 0.2, legHeight + torsoHeight * 0.82 + 0.25, 0.05);
      horn.rotation.x = -0.2;
      horn.rotation.z = (i - 0.5) * 0.3;
      group.add(horn);
      const horn2 = new THREE.Mesh(hornGeom, hornMat);
      horn2.position.set(0.58 * s + (i - 0.5) * 0.2, legHeight + torsoHeight * 0.82 + 0.25, 0.05);
      horn2.rotation.x = -0.2;
      horn2.rotation.z = -(i - 0.5) * 0.3;
      group.add(horn2);
    }
    
    // ===== 手臂 =====
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.12 * s, 0.09 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(darkColor, 0.1, 0.6, 0.4);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.7 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.7 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);
    
    // 兽爪护手
    const gauntletGeom = new THREE.BoxGeometry(0.18 * s, 0.38 * s, 0.15 * s);
    const gauntletMat = this.createGlowMaterial(godColor, 0.25, 0.6, 0.4);
    const leftGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    leftGauntlet.position.set(-0.75 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(leftGauntlet);
    const rightGauntlet = new THREE.Mesh(gauntletGeom, gauntletMat);
    rightGauntlet.position.set(0.75 * s, legHeight + torsoHeight * 0.4 - armHeight * 0.3, 0);
    group.add(rightGauntlet);
    
    // 爪尖
    for (let i = 0; i < 3; i++) {
      const clawGeom = new THREE.ConeGeometry(0.02 * s, 0.1 * s, 4);
      const clawMat = this.createBasicMaterial(0xfafaf9, 0.5, 0.4);
      const claw = new THREE.Mesh(clawGeom, clawMat);
      claw.position.set(-0.75 * s + (i - 1) * 0.05, legHeight + torsoHeight * 0.4 - armHeight * 0.3 - 0.2, 0.06);
      claw.rotation.x = 0.3;
      group.add(claw);
      const claw2 = new THREE.Mesh(clawGeom, clawMat);
      claw2.position.set(0.75 * s + (i - 1) * 0.05, legHeight + torsoHeight * 0.4 - armHeight * 0.3 - 0.2, 0.06);
      claw2.rotation.x = 0.3;
      group.add(claw2);
    }
    
    // ===== 头部 - 兽神面容 =====
    const headSize = 0.38 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xd4a574, 0.2, 0.5);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 兽耳
    const earGeom = new THREE.ConeGeometry(0.06 * s, 0.15 * s, 5);
    const earMat = this.createBasicMaterial(godColor, 0.4, 0.5);
    const leftEar = new THREE.Mesh(earGeom, earMat);
    leftEar.position.set(-0.18 * s, legHeight + torsoHeight + headSize * 1.1, 0);
    leftEar.rotation.z = -0.3;
    group.add(leftEar);
    const rightEar = new THREE.Mesh(earGeom, earMat);
    rightEar.position.set(0.18 * s, legHeight + torsoHeight + headSize * 1.1, 0);
    rightEar.rotation.z = 0.3;
    group.add(rightEar);
    
    // 眼睛（金色兽瞳）
    const eyeGeom = new THREE.SphereGeometry(0.045 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: goldColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.11 * s, legHeight + torsoHeight + headSize * 0.82, headSize * 0.85);
    group.add(rightEye);
    
    // 兽神冠
    const crownGroup = new THREE.Group();
    const crownBaseGeom = new THREE.TorusGeometry(0.32 * s, 0.045 * s, 8, 20);
    const crownBaseMat = this.createGlowMaterial(goldColor, 0.4);
    const crownBase = new THREE.Mesh(crownBaseGeom, crownBaseMat);
    crownBase.rotation.x = Math.PI / 2;
    crownGroup.add(crownBase);
    
    // 兽角冠（5根兽角）
    for (let i = 0; i < 5; i++) {
      const angle = -0.6 + (i / 4) * 1.2;
      const hornCrownGeom = new THREE.ConeGeometry(0.05 * s, 0.3 * s, 6);
      const hornCrownMat = i === 2 
        ? this.createGlowMaterial(goldColor, 0.5)
        : this.createBasicMaterial(0xfafaf9, 0.4, 0.5);
      const hornCrown = new THREE.Mesh(hornCrownGeom, hornCrownMat);
      hornCrown.position.set(Math.sin(angle) * 0.26 * s, 0.2 * s, Math.cos(angle) * 0.1 * s);
      hornCrown.rotation.x = -angle * 0.3;
      hornCrown.rotation.z = angle * 0.2;
      crownGroup.add(hornCrown);
    }
    
    // 中央兽王宝石
    const crownGemGeom = new THREE.OctahedronGeometry(0.1 * s, 0);
    const crownGemMat = new THREE.MeshBasicMaterial({ color: brightColor, transparent: true, opacity: 0.9 });
    const crownGem = new THREE.Mesh(crownGemGeom, crownGemMat);
    crownGem.position.y = 0.38 * s;
    crownGroup.add(crownGem);
    
    crownGroup.position.y = legHeight + torsoHeight + headSize * 1.3;
    group.add(crownGroup);
    
    // ===== 泰坦巨斧 =====
    const axeGroup = new THREE.Group();
    
    // 斧柄
    const handleAxeGeom = new THREE.CylinderGeometry(0.05 * s, 0.06 * s, 2.2 * s, 10);
    const handleAxeMat = this.createBasicMaterial(0x8b4513, 0.4, 0.6);
    const handleAxe = new THREE.Mesh(handleAxeGeom, handleAxeMat);
    handleAxe.position.y = 1.1 * s;
    axeGroup.add(handleAxe);
    
    // 斧柄缠绕
    for (let i = 0; i < 5; i++) {
      const wrapAxeGeom = new THREE.TorusGeometry(0.065 * s, 0.015 * s, 6, 16);
      const wrapAxeMat = this.createBasicMaterial(0x654321, 0.5, 0.5);
      const wrapAxe = new THREE.Mesh(wrapAxeGeom, wrapAxeMat);
      wrapAxe.rotation.x = Math.PI / 2;
      wrapAxe.position.y = 0.2 + i * 0.4 * s;
      axeGroup.add(wrapAxe);
    }
    
    // 斧头
    const axeHeadGroup = new THREE.Group();
    
    // 斧头主体
    const axeMainGeom = new THREE.BoxGeometry(0.6 * s, 0.4 * s, 0.08 * s);
    const axeMainMat = this.createGlowMaterial(godColor, 0.3, 0.7, 0.3);
    const axeMain = new THREE.Mesh(axeMainGeom, axeMainMat);
    axeMain.position.y = 2.2 * s;
    axeHeadGroup.add(axeMain);
    
    // 斧刃
    const bladeAxeGeom = new THREE.BoxGeometry(0.05 * s, 0.45 * s, 0.1 * s);
    const bladeAxeMat = this.createGlowMaterial(brightColor, 0.5, 0.8, 0.2);
    const bladeLeft = new THREE.Mesh(bladeAxeGeom, bladeAxeMat);
    bladeLeft.position.set(-0.3 * s, 2.2 * s, 0);
    axeHeadGroup.add(bladeLeft);
    const bladeRight = new THREE.Mesh(bladeAxeGeom, bladeAxeMat);
    bladeRight.position.set(0.3 * s, 2.2 * s, 0);
    axeHeadGroup.add(bladeRight);
    
    // 斧背兽纹
    const beastMarkGeom = new THREE.SphereGeometry(0.1 * s, 8, 8);
    const beastMarkMat = this.createGlowMaterial(goldColor, 0.5);
    const beastMark = new THREE.Mesh(beastMarkGeom, beastMarkMat);
    beastMark.position.set(0, 2.2 * s, 0.06 * s);
    beastMark.scale.set(1.2, 0.8, 0.3);
    axeHeadGroup.add(beastMark);
    
    // 斧顶尖刺
    const spikeAxeGeom = new THREE.ConeGeometry(0.06 * s, 0.2 * s, 6);
    const spikeAxeMat = this.createGlowMaterial(goldColor, 0.5);
    const spikeAxe = new THREE.Mesh(spikeAxeGeom, spikeAxeMat);
    spikeAxe.position.y = 2.5 * s;
    axeHeadGroup.add(spikeAxe);
    
    axeGroup.add(axeHeadGroup);
    
    // 底部装饰
    const pommelAxeGeom = new THREE.SphereGeometry(0.07 * s, 8, 8);
    const pommelAxeMat = this.createGlowMaterial(goldColor, 0.4);
    const pommelAxe = new THREE.Mesh(pommelAxeGeom, pommelAxeMat);
    pommelAxe.position.y = -0.05 * s;
    axeGroup.add(pommelAxe);
    
    // 兽气粒子
    for (let i = 0; i < 8; i++) {
      const beastParticleGeom = new THREE.SphereGeometry(0.03 * s + Math.random() * 0.02 * s, 4, 4);
      const beastParticleMat = new THREE.MeshBasicMaterial({ 
        color: brightColor,
        transparent: true, opacity: 0.5
      });
      const beastParticle = new THREE.Mesh(beastParticleGeom, beastParticleMat);
      const angle = Math.random() * Math.PI * 2;
      const height = Math.random() * 1.8 * s;
      const radius = 0.1 + Math.random() * 0.2;
      beastParticle.position.set(Math.cos(angle) * radius * s, 0.3 * s + height, Math.sin(angle) * radius * s);
      beastParticle.userData.angle = angle;
      beastParticle.userData.height = height;
      beastParticle.userData.radius = radius;
      beastParticle.userData.speed = 0.5 + Math.random() * 0.8;
      axeGroup.add(beastParticle);
    }
    
    axeGroup.position.set(-0.9 * s, legHeight * 0.45, 0.1 * s);
    axeGroup.rotation.z = 0.35;
    axeGroup.rotation.x = -0.1;
    group.add(axeGroup);
    
    // ===== 兽王披风 =====
    const capeGeom = new THREE.PlaneGeometry(1.5 * s, 2.4 * s, 10, 6);
    const capeMat = new THREE.MeshStandardMaterial({
      color: darkColor,
      metalness: 0.1,
      roughness: 0.7,
      emissive: godColor,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.93,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.6, -0.4 * s);
    cape.rotation.x = -0.1;
    group.add(cape);
    
    // 披风毛领
    const furCollarGeom = new THREE.TorusGeometry(0.4 * s, 0.08 * s, 10, 24);
    const furCollarMat = this.createBasicMaterial(godColor, 0.3, 0.6);
    const furCollar = new THREE.Mesh(furCollarGeom, furCollarMat);
    furCollar.position.set(0, legHeight + torsoHeight * 0.85, -0.3 * s);
    furCollar.rotation.x = Math.PI / 2;
    furCollar.scale.set(1, 0.5, 1);
    group.add(furCollar);
    
    // ===== 兽王光环（脚下）=====
    const haloGeom = new THREE.TorusGeometry(0.8 * s, 0.09 * s, 12, 36);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.45,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.08;
    group.add(halo);
    
    // 兽气粒子环绕
    for (let i = 0; i < 10; i++) {
      const auraGeom = new THREE.SphereGeometry(0.04 * s + Math.random() * 0.03 * s, 5, 5);
      const auraMat = new THREE.MeshBasicMaterial({ 
        color: darkColor,
        transparent: true, opacity: 0.35
      });
      const aura = new THREE.Mesh(auraGeom, auraMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.4;
      aura.position.set(Math.cos(angle) * radius * s, 0.1 + Math.random() * 0.5, Math.sin(angle) * radius * s);
      aura.userData.angle = angle;
      aura.userData.radius = radius;
      aura.userData.speed = 0.3 + Math.random() * 0.4;
      aura.userData.baseY = aura.position.y;
      group.add(aura);
    }
    
    group.userData.weapon = axeGroup;
    group.userData.halo = halo;
    group.userData.crown = crownGroup;
    group.userData.emblem = beastEmblemGroup;
  },

  // 默认神的建模（通用模板）
  createDefaultGod(group, god, scale) {
    const godColor = new THREE.Color(god.color);
    const brightColor = godColor.clone().offsetHSL(0, 0, 0.2);
    const s = scale;
    
    // 腿部
    const legHeight = 1.8 * s;
    const legGeom = new THREE.CylinderGeometry(0.15 * s, 0.18 * s, legHeight, 8);
    const legMat = this.createGlowMaterial(godColor, 0.2, 0.7, 0.3);
    const leftLeg = new THREE.Mesh(legGeom, legMat);
    leftLeg.position.set(-0.3 * s, legHeight * 0.5, 0);
    group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeom, legMat);
    rightLeg.position.set(0.3 * s, legHeight * 0.5, 0);
    group.add(rightLeg);
    
    // 躯干
    const torsoHeight = 1.5 * s;
    const torsoGeom = new THREE.BoxGeometry(0.85 * s, torsoHeight, 0.45 * s);
    const torsoMat = this.createGlowMaterial(godColor, 0.25, 0.7, 0.3);
    const torso = new THREE.Mesh(torsoGeom, torsoMat);
    torso.position.y = legHeight + torsoHeight * 0.5;
    group.add(torso);
    
    // 胸前徽章
    const emblemGeom = new THREE.CircleGeometry(0.22 * s, 8);
    const emblemMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.85,
    });
    const emblem = new THREE.Mesh(emblemGeom, emblemMat);
    emblem.position.set(0, legHeight + torsoHeight * 0.5, 0.26 * s);
    group.add(emblem);
    
    // 肩甲
    const shoulderGeom = new THREE.SphereGeometry(0.25 * s, 8, 8);
    const shoulderMat = this.createGlowMaterial(brightColor, 0.3, 0.7, 0.3);
    const leftShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    leftShoulder.position.set(-0.5 * s, legHeight + torsoHeight * 0.8, 0);
    leftShoulder.scale.set(1, 0.8, 1.1);
    group.add(leftShoulder);
    const rightShoulder = new THREE.Mesh(shoulderGeom, shoulderMat);
    rightShoulder.position.set(0.5 * s, legHeight + torsoHeight * 0.8, 0);
    rightShoulder.scale.set(1, 0.8, 1.1);
    group.add(rightShoulder);
    
    // 手臂
    const armHeight = 1.3 * s;
    const armGeom = new THREE.CylinderGeometry(0.1 * s, 0.07 * s, armHeight, 8);
    const armMat = this.createGlowMaterial(godColor, 0.2, 0.7, 0.3);
    const leftArm = new THREE.Mesh(armGeom, armMat);
    leftArm.position.set(-0.6 * s, legHeight + torsoHeight * 0.4, 0);
    leftArm.rotation.z = 0.15;
    group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeom, armMat);
    rightArm.position.set(0.6 * s, legHeight + torsoHeight * 0.4, 0);
    rightArm.rotation.z = -0.15;
    group.add(rightArm);
    
    // 头部
    const headSize = 0.36 * s;
    const headGeom = new THREE.SphereGeometry(headSize, 12, 12);
    const headMat = this.createBasicMaterial(0xffe4c4, 0.1, 0.6);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = legHeight + torsoHeight + headSize * 0.7;
    group.add(head);
    
    // 眼睛
    const eyeGeom = new THREE.SphereGeometry(0.04 * s, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: brightColor });
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.1 * s, legHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.1 * s, legHeight + torsoHeight + headSize * 0.8, headSize * 0.85);
    group.add(rightEye);
    
    // 王冠
    const crownGeom = new THREE.ConeGeometry(0.18 * s, 0.28 * s, 6);
    const crownMat = this.createGlowMaterial(0xffd700, 0.4);
    const crown = new THREE.Mesh(crownGeom, crownMat);
    crown.position.y = legHeight + torsoHeight + headSize * 1.4;
    group.add(crown);
    
    // 光环
    const haloGeom = new THREE.TorusGeometry(0.35 * s, 0.04 * s, 8, 20);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: brightColor,
      transparent: true,
      opacity: 0.7,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.y = legHeight + torsoHeight + headSize * 1.8;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
    
    // 武器（通用长剑）
    const weaponGroup = new THREE.Group();
    const weaponGeom = new THREE.BoxGeometry(0.08 * s, 1.3 * s, 0.04 * s);
    const weaponMat = this.createGlowMaterial(brightColor, 0.5, 0.8, 0.2);
    const weapon = new THREE.Mesh(weaponGeom, weaponMat);
    weapon.position.y = 0.65 * s;
    weaponGroup.add(weapon);
    
    // 剑柄
    const hiltGeom = new THREE.BoxGeometry(0.25 * s, 0.06 * s, 0.06 * s);
    const hiltMat = this.createGlowMaterial(0xffd700, 0.4);
    const hilt = new THREE.Mesh(hiltGeom, hiltMat);
    hilt.position.y = 0.05 * s;
    weaponGroup.add(hilt);
    
    weaponGroup.position.set(0.75 * s, legHeight + torsoHeight * 0.3, 0.1 * s);
    weaponGroup.rotation.z = -0.35;
    group.add(weaponGroup);
    
    // 披风
    const capeGeom = new THREE.PlaneGeometry(1.3 * s, 2.2 * s, 8, 5);
    const capeMat = new THREE.MeshStandardMaterial({
      color: godColor,
      metalness: 0.3,
      roughness: 0.5,
      emissive: godColor,
      emissiveIntensity: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const cape = new THREE.Mesh(capeGeom, capeMat);
    cape.position.set(0, legHeight + torsoHeight * 0.6, -0.35 * s);
    cape.rotation.x = -0.1;
    group.add(cape);
    
    // 脚下光环
    const footHaloGeom = new THREE.TorusGeometry(0.7 * s, 0.06 * s, 12, 32);
    const footHaloMat = new THREE.MeshBasicMaterial({ 
      color: godColor,
      transparent: true,
      opacity: 0.4,
    });
    const footHalo = new THREE.Mesh(footHaloGeom, footHaloMat);
    footHalo.rotation.x = -Math.PI / 2;
    footHalo.position.y = 0.08;
    group.add(footHalo);
    
    group.userData.weapon = weaponGroup;
    group.userData.halo = footHalo;
    group.userData.crown = crown;
    group.userData.emblem = emblem;
    
    // 添加动画系统引用（与玩家模型兼容）
    group.userData.leftArm = leftArm;
    group.userData.rightArm = rightArm;
    group.userData.leftLeg = leftLeg;
    group.userData.rightLeg = rightLeg;
    group.userData.body = torso;
    group.userData.head = head;
    group.userData.cape = cape;
    group.userData.walkPhase = 0;
    group.userData.idlePhase = 0;
    group.userData.attackPhase = 0;
    group.userData.isAttacking = false;
    group.userData.isGodMesh = true;
  },
};

// 将 GodModels 暴露到全局
window.GodModels = GodModels;
