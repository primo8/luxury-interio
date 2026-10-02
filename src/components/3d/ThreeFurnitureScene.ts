import * as THREE from 'three';

export interface FurnitureSceneOptions {
  modelType: 'sofa' | 'chair' | 'table' | 'bed' | 'sideboard' | 'desk' | 'shelf' | 'lamp';
  primaryColor: number;
  secondaryColor?: number;
  metalColor?: number;
  autoRotate?: boolean;
  wireframe?: boolean;
  exploded?: boolean;
}

export class Furniture3DScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private modelGroup: THREE.Group;
  private options: FurnitureSceneOptions;
  
  // Materials
  private mainMaterial: THREE.MeshStandardMaterial;
  private metalMaterial: THREE.MeshStandardMaterial;
  private woodMaterial: THREE.MeshStandardMaterial;
  private cushionMaterial: THREE.MeshStandardMaterial;

  // Orbit controls state
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private rotationMomentum = { x: 0, y: 0 };
  private cameraDistance = 4.8;
  private targetCameraDistance = 4.8;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, options: FurnitureSceneOptions) {
    this.container = container;
    this.options = {
      autoRotate: true,
      wireframe: false,
      exploded: false,
      metalColor: 0xd4af37, // Gold / brass
      secondaryColor: 0x250d33,
      ...options
    };

    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container);
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent background for seamless blending

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.set(2.8, 2.2, this.cameraDistance);
    this.camera.lookAt(0, 0.4, 0);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Model Group
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // 5. Materials setup
    this.mainMaterial = new THREE.MeshStandardMaterial({
      color: this.options.primaryColor,
      roughness: 0.72,
      metalness: 0.08,
      wireframe: this.options.wireframe,
    });

    this.metalMaterial = new THREE.MeshStandardMaterial({
      color: this.options.metalColor || 0xd4af37,
      roughness: 0.25,
      metalness: 0.88,
      wireframe: this.options.wireframe,
    });

    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.55,
      metalness: 0.05,
      wireframe: this.options.wireframe,
    });

    this.cushionMaterial = new THREE.MeshStandardMaterial({
      color: this.options.secondaryColor || 0x3b184f,
      roughness: 0.8,
      metalness: 0.02,
      wireframe: this.options.wireframe,
    });

    // 6. Lighting & Studio Environment
    this.setupLighting();
    this.setupFloorShadow();

    // 7. Build 3D Furniture Geometry
    this.buildModel(this.options.modelType);

    // 8. Event listeners
    this.addEventListeners();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Ambient soft studio light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Key directional light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(4, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Fill Light (Cool purple tone for brand cohesion)
    const fillLight = new THREE.DirectionalLight(0xbfa0d9, 1.2);
    fillLight.position.set(-4, 3, -3);
    this.scene.add(fillLight);

    // Warm Rim light for silhouette separation
    const rimLight = new THREE.PointLight(0xffeedd, 1.0, 10);
    rimLight.position.set(0, 4, -4);
    this.scene.add(rimLight);
  }

  private setupFloorShadow() {
    // Shadow receiver ground plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const shadowMesh = new THREE.Mesh(shadowPlaneGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.02;
    shadowMesh.receiveShadow = true;
    this.scene.add(shadowMesh);

    // Ambient Occlusion Radial Gradient Circle under furniture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(37, 13, 51, 0.35)');
      grad.addColorStop(0.5, 'rgba(37, 13, 51, 0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const contactMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const contactPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = -0.01;
    this.scene.add(contactPlane);
  }

  public buildModel(type: FurnitureSceneOptions['modelType']) {
    // Clear existing model children
    while (this.modelGroup.children.length > 0) {
      const obj = this.modelGroup.children[0];
      this.modelGroup.remove(obj);
    }

    if (type === 'sofa') {
      this.buildSofa();
    } else if (type === 'chair') {
      this.buildLoungeChair();
    } else if (type === 'table') {
      this.buildCoffeeTable();
    } else if (type === 'bed') {
      this.buildBed();
    } else if (type === 'sideboard') {
      this.buildSideboard();
    } else if (type === 'desk') {
      this.buildDesk();
    } else if (type === 'shelf') {
      this.buildShelf();
    } else {
      this.buildSofa();
    }
  }

  private createRoundedBox(w: number, h: number, d: number): THREE.BufferGeometry {
    const geo = new THREE.BoxGeometry(w, h, d, 4, 4, 4);
    return geo;
  }

  // 1. Modular Luxury Velvet Sectional Sofa
  private buildSofa() {
    const sofa = new THREE.Group();

    // Main Seat Base
    const baseGeo = this.createRoundedBox(2.2, 0.28, 1.1);
    const baseMesh = new THREE.Mesh(baseGeo, this.mainMaterial);
    baseMesh.position.set(0, 0.28, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    sofa.add(baseMesh);

    // Chaise extension (L-shape)
    const chaiseGeo = this.createRoundedBox(0.9, 0.28, 0.9);
    const chaiseMesh = new THREE.Mesh(chaiseGeo, this.mainMaterial);
    chaiseMesh.position.set(-0.65, 0.28, 0.9);
    chaiseMesh.castShadow = true;
    chaiseMesh.receiveShadow = true;
    sofa.add(chaiseMesh);

    // Seat Cushions (Plush tufted feel)
    for (let i = 0; i < 3; i++) {
      const seatCushionGeo = this.createRoundedBox(0.68, 0.18, 1.05);
      const seatCushion = new THREE.Mesh(seatCushionGeo, this.mainMaterial);
      seatCushion.position.set(-0.72 + i * 0.72, 0.48, 0.02);
      seatCushion.castShadow = true;
      seatCushion.name = `cushion-${i}`;
      sofa.add(seatCushion);
    }
    // Chaise top cushion
    const chaiseTopGeo = this.createRoundedBox(0.85, 0.18, 0.88);
    const chaiseTop = new THREE.Mesh(chaiseTopGeo, this.mainMaterial);
    chaiseTop.position.set(-0.65, 0.48, 0.9);
    chaiseTop.castShadow = true;
    sofa.add(chaiseTop);

    // Backrest (Rear long panel)
    const backGeo = this.createRoundedBox(2.36, 0.65, 0.28);
    const backMesh = new THREE.Mesh(backGeo, this.mainMaterial);
    backMesh.position.set(0, 0.68, -0.48);
    backMesh.castShadow = true;
    sofa.add(backMesh);

    // Back Cushions
    for (let i = 0; i < 3; i++) {
      const backCushionGeo = this.createRoundedBox(0.68, 0.46, 0.18);
      const backCushion = new THREE.Mesh(backCushionGeo, this.mainMaterial);
      backCushion.position.set(-0.72 + i * 0.72, 0.76, -0.32);
      backCushion.rotation.x = 0.08;
      backCushion.castShadow = true;
      sofa.add(backCushion);
    }

    // Right Armrest
    const armGeo = this.createRoundedBox(0.24, 0.48, 1.2);
    const rightArm = new THREE.Mesh(armGeo, this.mainMaterial);
    rightArm.position.set(1.18, 0.54, 0.06);
    rightArm.castShadow = true;
    sofa.add(rightArm);

    // Left Armrest
    const leftArm = new THREE.Mesh(armGeo, this.mainMaterial);
    leftArm.position.set(-1.18, 0.54, 0.46);
    leftArm.castShadow = true;
    sofa.add(leftArm);

    // Throw Pillows
    const pillowGeo = this.createRoundedBox(0.38, 0.38, 0.12);
    const pillow1 = new THREE.Mesh(pillowGeo, this.cushionMaterial);
    pillow1.position.set(0.92, 0.65, -0.15);
    pillow1.rotation.set(-0.1, -0.45, 0.2);
    pillow1.castShadow = true;
    sofa.add(pillow1);

    const pillow2 = new THREE.Mesh(pillowGeo, this.metalMaterial);
    pillow2.position.set(-0.95, 0.65, 0.4);
    pillow2.rotation.set(0.1, 0.4, -0.2);
    pillow2.castShadow = true;
    sofa.add(pillow2);

    // Turned Brass Sofa Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.22, 16);
    const legPositions = [
      [1.15, 0.11, -0.5],
      [1.15, 0.11, 0.5],
      [-1.15, 0.11, -0.5],
      [-1.15, 0.11, 1.3],
      [-0.2, 0.11, 1.3],
      [0.3, 0.11, -0.5],
    ];

    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.metalMaterial);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      sofa.add(leg);
    });

    this.modelGroup.add(sofa);
    this.modelGroup.position.set(0, 0, 0);
  }

  // 2. Velvet Accent / Lounge Chair
  private buildLoungeChair() {
    const chair = new THREE.Group();

    // Seat cushion
    const seatGeo = new THREE.CylinderGeometry(0.55, 0.52, 0.18, 32);
    const seat = new THREE.Mesh(seatGeo, this.mainMaterial);
    seat.position.set(0, 0.46, 0);
    seat.castShadow = true;
    chair.add(seat);

    // Curved Barrel Backrest
    const backGeo = new THREE.CylinderGeometry(0.62, 0.6, 0.65, 32, 1, true, -Math.PI * 0.75, Math.PI * 1.5);
    const backMat = this.mainMaterial.clone();
    backMat.side = THREE.DoubleSide;
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.set(0, 0.75, 0.05);
    backMesh.rotation.y = Math.PI * 0.25;
    backMesh.castShadow = true;
    chair.add(backMesh);

    // Thick padded border on top of barrel back
    const rimGeo = new THREE.TorusGeometry(0.61, 0.06, 16, 32, Math.PI * 1.5);
    const rimMesh = new THREE.Mesh(rimGeo, this.mainMaterial);
    rimMesh.position.set(0, 1.07, 0.05);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.rotation.z = -Math.PI * 0.75;
    chair.add(rimMesh);

    // Splayed Brass Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.012, 0.42, 16);
    const legAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    legAngles.forEach((angle) => {
      const leg = new THREE.Mesh(legGeo, this.metalMaterial);
      const rad = 0.38;
      leg.position.set(Math.cos(angle) * rad, 0.21, Math.sin(angle) * rad);
      leg.rotation.z = Math.cos(angle) * -0.22;
      leg.rotation.x = Math.sin(angle) * 0.22;
      leg.castShadow = true;
      chair.add(leg);
    });

    this.modelGroup.add(chair);
  }

  // 3. Modern Oval Coffee Table
  private buildCoffeeTable() {
    const table = new THREE.Group();

    // Top Surface (Dark Walnut Oval)
    const topGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32);
    topGeo.scale(1.4, 1, 0.8);
    const topMesh = new THREE.Mesh(topGeo, this.woodMaterial);
    topMesh.position.set(0, 0.48, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    table.add(topMesh);

    // Lower Shelf (Smoked Glass / Secondary Wood)
    const shelfGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.03, 32);
    shelfGeo.scale(1.3, 1, 0.7);
    const shelfMesh = new THREE.Mesh(shelfGeo, this.mainMaterial);
    shelfMesh.position.set(0, 0.24, 0);
    shelfMesh.castShadow = true;
    table.add(shelfMesh);

    // Metallic Tubular Frame & Legs
    const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.48, 16);
    const positions = [
      [-1.0, 0.24, -0.4],
      [1.0, 0.24, -0.4],
      [-1.0, 0.24, 0.4],
      [1.0, 0.24, 0.4],
    ];

    positions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.metalMaterial);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      table.add(leg);
    });

    this.modelGroup.add(table);
  }

  // 4. Upholstered Platform Bed
  private buildBed() {
    const bed = new THREE.Group();

    // Platform Base Frame
    const frameGeo = this.createRoundedBox(1.9, 0.28, 2.3);
    const frame = new THREE.Mesh(frameGeo, this.woodMaterial);
    frame.position.set(0, 0.2, 0);
    frame.castShadow = true;
    bed.add(frame);

    // Mattress
    const mattressGeo = this.createRoundedBox(1.78, 0.26, 2.15);
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf4f1eb, roughness: 0.9 });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.set(0, 0.44, 0.04);
    mattress.castShadow = true;
    bed.add(mattress);

    // Linen Duvet / Quilt (Matching Brand Plum Accent)
    const duvetGeo = this.createRoundedBox(1.8, 0.16, 1.45);
    const duvet = new THREE.Mesh(duvetGeo, this.mainMaterial);
    duvet.position.set(0, 0.52, 0.38);
    duvet.castShadow = true;
    bed.add(duvet);

    // Pillows
    const pillowGeo = this.createRoundedBox(0.65, 0.14, 0.4);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const p1 = new THREE.Mesh(pillowGeo, pillowMat);
    p1.position.set(-0.48, 0.62, -0.75);
    p1.rotation.x = 0.2;
    p1.castShadow = true;
    bed.add(p1);

    const p2 = new THREE.Mesh(pillowGeo, pillowMat);
    p2.position.set(0.48, 0.62, -0.75);
    p2.rotation.x = 0.2;
    p2.castShadow = true;
    bed.add(p2);

    // Headboard (Vertical Tufted Channels)
    const headboardBackGeo = this.createRoundedBox(2.0, 1.15, 0.18);
    const headboard = new THREE.Mesh(headboardBackGeo, this.mainMaterial);
    headboard.position.set(0, 0.82, -1.1);
    headboard.castShadow = true;
    bed.add(headboard);

    // Brass accent feet
    const legGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.14, 16);
    const legPos = [
      [0.9, 0.07, 1.05],
      [-0.9, 0.07, 1.05],
      [0.9, 0.07, -1.05],
      [-0.9, 0.07, -1.05],
    ];
    legPos.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.metalMaterial);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      bed.add(leg);
    });

    this.modelGroup.add(bed);
  }

  // 5. Wooden Fluted Sideboard / Credenza
  private buildSideboard() {
    const sb = new THREE.Group();

    // Main Case Cabinet
    const caseGeo = this.createRoundedBox(2.2, 0.85, 0.65);
    const caseMesh = new THREE.Mesh(caseGeo, this.woodMaterial);
    caseMesh.position.set(0, 0.72, 0);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    sb.add(caseMesh);

    // Front Fluted Panels / Doors
    const doorGeo = this.createRoundedBox(0.68, 0.78, 0.04);
    for (let i = 0; i < 3; i++) {
      const door = new THREE.Mesh(doorGeo, this.mainMaterial);
      door.position.set(-0.72 + i * 0.72, 0.72, 0.33);
      door.castShadow = true;
      sb.add(door);

      // Brass Handle Knob
      const knobGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 16);
      knobGeo.rotateX(Math.PI / 2);
      const knob = new THREE.Mesh(knobGeo, this.metalMaterial);
      knob.position.set(-0.72 + i * 0.72 + 0.24, 0.72, 0.36);
      sb.add(knob);
    }

    // Tapered Mid-century Brass Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.32, 16);
    const legPositions = [
      [0.98, 0.16, 0.24],
      [-0.98, 0.16, 0.24],
      [0.98, 0.16, -0.24],
      [-0.98, 0.16, -0.24],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.metalMaterial);
      leg.position.set(x, y, z);
      leg.rotation.z = x > 0 ? -0.1 : 0.1;
      leg.castShadow = true;
      sb.add(leg);
    });

    this.modelGroup.add(sb);
  }

  // 6. Solid Oak Writing Desk
  private buildDesk() {
    const desk = new THREE.Group();

    // Desktop
    const topGeo = this.createRoundedBox(1.8, 0.06, 0.85);
    const topMesh = new THREE.Mesh(topGeo, this.woodMaterial);
    topMesh.position.set(0, 0.88, 0);
    topMesh.castShadow = true;
    desk.add(topMesh);

    // Slim Under-Desk Drawer Unit
    const drawerGeo = this.createRoundedBox(0.65, 0.14, 0.75);
    const drawer = new THREE.Mesh(drawerGeo, this.mainMaterial);
    drawer.position.set(-0.48, 0.76, 0);
    drawer.castShadow = true;
    desk.add(drawer);

    // Desk Legs (Angled Scandinavian)
    const legGeo = new THREE.CylinderGeometry(0.024, 0.016, 0.88, 16);
    const legPositions = [
      [0.82, 0.44, 0.35],
      [-0.82, 0.44, 0.35],
      [0.82, 0.44, -0.35],
      [-0.82, 0.44, -0.35],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, this.woodMaterial);
      leg.position.set(x, y, z);
      leg.rotation.z = x > 0 ? -0.08 : 0.08;
      leg.rotation.x = z > 0 ? 0.08 : -0.08;
      leg.castShadow = true;
      desk.add(leg);

      // Brass foot cap
      const capGeo = new THREE.CylinderGeometry(0.018, 0.017, 0.08, 16);
      const cap = new THREE.Mesh(capGeo, this.metalMaterial);
      cap.position.set(x, 0.04, z);
      desk.add(cap);
    });

    this.modelGroup.add(desk);
  }

  // 7. Architectural Open Bookshelf
  private buildShelf() {
    const shelf = new THREE.Group();

    // Vertical Upright Posts
    const postGeo = new THREE.BoxGeometry(0.05, 1.8, 0.05);
    const postPositions = [
      [-0.7, 0.9, -0.2],
      [0.7, 0.9, -0.2],
      [-0.7, 0.9, 0.2],
      [0.7, 0.9, 0.2],
    ];
    postPositions.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, this.metalMaterial);
      post.position.set(x, y, z);
      post.castShadow = true;
      shelf.add(post);
    });

    // 5 Horizontal Shelves
    for (let i = 0; i < 5; i++) {
      const tierGeo = this.createRoundedBox(1.55, 0.04, 0.46);
      const tier = new THREE.Mesh(tierGeo, i % 2 === 0 ? this.woodMaterial : this.mainMaterial);
      tier.position.set(0, 0.18 + i * 0.38, 0);
      tier.castShadow = true;
      shelf.add(tier);
    }

    this.modelGroup.add(shelf);
  }

  // Interaction handlers
  private addEventListeners() {
    const dom = this.renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.rotationMomentum.x = deltaX * 0.005;
      this.rotationMomentum.y = deltaY * 0.005;

      this.modelGroup.rotation.y += this.rotationMomentum.x;
      this.modelGroup.rotation.x += this.rotationMomentum.y;

      // Limit pitch to prevent flips
      this.modelGroup.rotation.x = Math.max(-0.4, Math.min(0.6, this.modelGroup.rotation.x));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetCameraDistance += e.deltaY * 0.003;
      this.targetCameraDistance = Math.max(2.5, Math.min(8.0, this.targetCameraDistance));
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    window.addEventListener('resize', this.onResize);
  }

  public updatePrimaryColor(hexNumber: number) {
    this.mainMaterial.color.setHex(hexNumber);
  }

  public setAutoRotate(rotate: boolean) {
    this.options.autoRotate = rotate;
  }

  public setWireframe(wireframe: boolean) {
    this.mainMaterial.wireframe = wireframe;
    this.metalMaterial.wireframe = wireframe;
    this.woodMaterial.wireframe = wireframe;
  }

  public setExplodedView(exploded: boolean) {
    this.options.exploded = exploded;
    // Animate cushion displacement
    this.modelGroup.traverse((child) => {
      if (child.name.startsWith('cushion-')) {
        if (exploded) {
          child.position.y += 0.35;
        } else {
          child.position.y = 0.48;
        }
      }
    });
  }

  public resetCamera() {
    this.modelGroup.rotation.set(0, 0, 0);
    this.targetCameraDistance = 4.8;
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Smooth inertia rotation
    if (!this.isDragging) {
      if (this.options.autoRotate) {
        this.modelGroup.rotation.y += 0.004;
      }
      this.rotationMomentum.x *= 0.92;
      this.rotationMomentum.y *= 0.92;
      this.modelGroup.rotation.y += this.rotationMomentum.x;
      this.modelGroup.rotation.x += this.rotationMomentum.y;
    }

    // Smooth zoom lerp
    this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.1;
    this.camera.position.setLength(this.cameraDistance);
    this.camera.lookAt(0, 0.4, 0);

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
