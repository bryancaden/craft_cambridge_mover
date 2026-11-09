import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BlockType, CharacterConfig, VoxelBlock, WeatherType, CameraView } from '../types/game';
import { BLOCK_DEFINITIONS } from '../data/cambridgeMoversData';
import { soundFx } from '../utils/soundEffects';

interface VoxelWorld3DProps {
  characterConfig: CharacterConfig;
  activeBlockType: BlockType;
  inventory: Record<string, number>;
  onConsumeBlock: (type: BlockType) => boolean;
  onAddBlock: (type: BlockType, count: number) => void;
  onOpenExamStation: () => void;
  timeOfDay: 'day' | 'sunset' | 'night';
  onToggleTimeOfDay: () => void;
  buildMode: 'place' | 'mine';
  onToggleBuildMode: (mode: 'place' | 'mine') => void;
  initialBlocks?: VoxelBlock[];
  onWorldUpdated?: (blocks: VoxelBlock[]) => void;
  weather: WeatherType;
  onToggleWeather: () => void;
  blueprintToBuild?: { name: string; blocks: VoxelBlock[] } | null;
  cameraView?: CameraView;
  onToggleCameraView?: () => void;
  digTrigger?: number;
}

export const VoxelWorld3D: React.FC<VoxelWorld3DProps> = ({
  characterConfig,
  activeBlockType,
  inventory,
  onConsumeBlock,
  onAddBlock,
  onOpenExamStation,
  timeOfDay,
  onToggleTimeOfDay,
  buildMode,
  onToggleBuildMode,
  initialBlocks,
  onWorldUpdated,
  weather,
  onToggleWeather,
  blueprintToBuild,
  cameraView: cameraViewProp,
  onToggleCameraView,
  digTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [internalCameraView, setInternalCameraView] = useState<CameraView>('thirdPerson');
  const activeCameraView = cameraViewProp ?? internalCameraView;
  const cameraViewRef = useRef(activeCameraView);
  useEffect(() => {
    cameraViewRef.current = activeCameraView;
  }, [activeCameraView]);

  const toggleCamera = useCallback(() => {
    soundFx.playClick();
    if (onToggleCameraView) {
      onToggleCameraView();
    } else {
      setInternalCameraView((v) =>
        v === 'firstPerson' ? 'thirdPerson' : 'firstPerson'
      );
    }
  }, [onToggleCameraView]);

  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number; z: number } | null>(null);
  const hoveredCoordsRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Pitch and drag controls for 1st person and camera look
  const playerPitch = useRef(0); // -1.2 to 1.2 radians
  const isPointerDragging = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Active dig particles pool
  const digParticlesRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
    }>
  >([]);

  // Stable references for event listeners and Three.js callbacks
  const onOpenExamStationRef = useRef(onOpenExamStation);
  const onToggleBuildModeRef = useRef(onToggleBuildMode);
  const onToggleTimeOfDayRef = useRef(onToggleTimeOfDay);
  const onToggleWeatherRef = useRef(onToggleWeather);
  const onWorldUpdatedRef = useRef(onWorldUpdated);
  const buildModeRef = useRef(buildMode);
  const activeBlockTypeRef = useRef(activeBlockType);
  const inventoryRef = useRef(inventory);
  const onConsumeBlockRef = useRef(onConsumeBlock);
  const onAddBlockRef = useRef(onAddBlock);
  const initialBlocksRef = useRef(initialBlocks);

  useEffect(() => {
    onOpenExamStationRef.current = onOpenExamStation;
    onToggleBuildModeRef.current = onToggleBuildMode;
    onToggleTimeOfDayRef.current = onToggleTimeOfDay;
    onToggleWeatherRef.current = onToggleWeather;
    onWorldUpdatedRef.current = onWorldUpdated;
    buildModeRef.current = buildMode;
    activeBlockTypeRef.current = activeBlockType;
    inventoryRef.current = inventory;
    onConsumeBlockRef.current = onConsumeBlock;
    onAddBlockRef.current = onAddBlock;
  });

  // References for three.js scene loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const blocksMapRef = useRef<Map<string, { mesh: THREE.Mesh; type: BlockType }>>(new Map());
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const playerPartsRef = useRef<{
    torso: THREE.Mesh;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    head: THREE.Group;
    tool: THREE.Mesh;
  } | null>(null);

  // Weather Particle Systems
  const rainPointsRef = useRef<THREE.Points | null>(null);
  const rainGeomRef = useRef<THREE.BufferGeometry | null>(null);
  const snowPointsRef = useRef<THREE.Points | null>(null);
  const snowGeomRef = useRef<THREE.BufferGeometry | null>(null);

  // Active weather ref for animation frame loop
  const currentWeatherRef = useRef<WeatherType>(weather);
  useEffect(() => {
    currentWeatherRef.current = weather;
  }, [weather]);

  // Player physics and animation state
  // Spawn in the open grassy lawn in front of the study cabin
  const playerPos = useRef(new THREE.Vector3(0.5, 3, 2.5));
  const playerVel = useRef(new THREE.Vector3(0, 0, 0));
  const playerRot = useRef(-Math.PI * 0.75); // Face towards the Cambridge cabin
  const isGrounded = useRef(true);
  const wasGrounded = useRef(true);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const walkCycle = useRef(0);
  const swingAction = useRef(0); // For placing/mining arm swing
  const landingSquash = useRef(0); // Smooth impact compression timer

  // Landing dust particles pool
  const landingDustRef = useRef<
    Array<{
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      maxLife: number;
    }>
  >([]);

  // Highlight box mesh
  const highlightBoxRef = useRef<THREE.LineSegments | null>(null);

  const showNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => {
      setActionNotification((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  // Texture generator for stylized voxel blocks
  const createBlockTexture = useCallback((type: BlockType, colorHex: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Base color
    ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 64, 64);

    // Bevel shading
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, 64, 4);
    ctx.fillRect(0, 0, 4, 64);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 60, 64, 4);
    ctx.fillRect(60, 0, 4, 64);

    // Texture grain & details based on type
    if (type === 'grass') {
      ctx.fillStyle = '#4ade80';
      for (let i = 0; i < 16; i++) {
        const rx = (i * 17) % 60;
        const ry = (i * 23) % 60;
        ctx.fillRect(rx, ry, 3, 3);
      }
    } else if (type === 'stone') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(8, 8, 20, 14);
      ctx.fillRect(36, 12, 18, 16);
      ctx.fillRect(16, 36, 32, 18);
    } else if (type === 'brick') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, 20, 64, 2);
      ctx.fillRect(0, 42, 64, 2);
      ctx.fillRect(30, 0, 2, 20);
      ctx.fillRect(14, 22, 2, 20);
      ctx.fillRect(46, 22, 2, 20);
      ctx.fillRect(30, 44, 2, 20);
    } else if (type === 'bookshelf') {
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(4, 4, 56, 56);
      const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = bookColors[b % bookColors.length];
        ctx.fillRect(10 + b * 9, 12, 7, 18);
        ctx.fillRect(10 + b * 9, 36, 7, 18);
      }
    } else if (type === 'lantern') {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(16, 16, 32, 32);
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 4;
      ctx.strokeRect(16, 16, 32, 32);
    } else if (type === 'diamond') {
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.moveTo(32, 12);
      ctx.lineTo(52, 32);
      ctx.lineTo(32, 52);
      ctx.lineTo(12, 32);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'gold') {
      ctx.fillStyle = '#fde047';
      ctx.fillRect(14, 14, 36, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }, []);

  // Block Material Cache
  const blockMaterialsCache = useRef<Map<BlockType, THREE.Material>>(new Map());

  const getBlockMaterial = useCallback(
    (type: BlockType): THREE.Material => {
      if (blockMaterialsCache.current.has(type)) {
        return blockMaterialsCache.current.get(type)!;
      }
      const def = BLOCK_DEFINITIONS[type] || BLOCK_DEFINITIONS.stone;
      const texture = createBlockTexture(type, def.color);

      let mat: THREE.Material;
      if (type === 'glass') {
        mat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          opacity: 0.5,
          roughness: 0.1,
          metalness: 0.1,
        });
      } else if (type === 'water') {
        mat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7,
          roughness: 0.2,
        });
      } else if (type === 'lantern') {
        mat = new THREE.MeshStandardMaterial({
          map: texture,
          emissive: 0xfef08a,
          emissiveIntensity: 0.7,
          roughness: 0.3,
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.8,
          metalness: 0.1,
        });
      }

      blockMaterialsCache.current.set(type, mat);
      return mat;
    },
    [createBlockTexture]
  );

  const blockGeometryRef = useRef(new THREE.BoxGeometry(1, 1, 1));

  // Add a block to Three.js scene
  const addBlockToScene = useCallback(
    (x: number, y: number, z: number, type: BlockType, scene: THREE.Scene) => {
      const key = `${x},${y},${z}`;
      if (blocksMapRef.current.has(key)) return;

      const mat = getBlockMaterial(type);
      const mesh = new THREE.Mesh(blockGeometryRef.current, mat);
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { voxelCoord: { x, y, z }, blockType: type };

      scene.add(mesh);
      blocksMapRef.current.set(key, { mesh, type });
    },
    [getBlockMaterial]
  );

  // Remove a block from Three.js scene
  const removeBlockFromScene = useCallback((x: number, y: number, z: number, scene: THREE.Scene): BlockType | null => {
    const key = `${x},${y},${z}`;
    const block = blocksMapRef.current.get(key);
    if (!block) return null;

    scene.remove(block.mesh);
    blocksMapRef.current.delete(key);
    return block.type;
  }, []);

  // Initialize initial island / terrain
  const initDefaultWorld = useCallback(
    (scene: THREE.Scene) => {
      blocksMapRef.current.forEach((b) => scene.remove(b.mesh));
      blocksMapRef.current.clear();

      if (initialBlocks && initialBlocks.length > 0) {
        initialBlocks.forEach((b) => addBlockToScene(b.x, b.y, b.z, b.type, scene));
        return;
      }

      // Generate a pleasant Minecraft floating island (16x16)
      const islandRadius = 8;
      for (let x = -islandRadius; x <= islandRadius; x++) {
        for (let z = -islandRadius; z <= islandRadius; z++) {
          const dist = Math.sqrt(x * x + z * z);
          if (dist <= islandRadius) {
            addBlockToScene(x, 0, z, 'stone', scene);
            addBlockToScene(x, 1, z, 'dirt', scene);

            if (x > 3 && z > 3 && x < 7 && z < 7) {
              addBlockToScene(x, 2, z, 'water', scene);
              addBlockToScene(x, 1, z, 'sand', scene);
            } else if (dist <= islandRadius - 0.5) {
              addBlockToScene(x, 2, z, 'grass', scene);
            } else {
              addBlockToScene(x, 2, z, 'sand', scene);
            }
          }
        }
      }

      // Small Cambridge Study Cabin
      for (let bx = -5; bx <= -1; bx++) {
        for (let bz = -5; bz <= -1; bz++) {
          if (bx === -5 || bx === -1 || bz === -5 || bz === -1) {
            // Inviting double doorway at front: bx = -3 and bx = -2, bz = -1
            if ((bx === -3 || bx === -2) && bz === -1) {
              // Level wooden floor extends under door
              addBlockToScene(bx, 2, bz, 'wood', scene);
              // Doorway is open and spacious at body height y=3 and y=4, wooden lintel at y=5
              addBlockToScene(bx, 5, bz, 'wood', scene);
            } else if ((bx === -5 && bz === -3) || (bx === -1 && bz === -3)) {
              // Side windows with glass panes to let natural light in!
              addBlockToScene(bx, 3, bz, 'brick', scene);
              addBlockToScene(bx, 4, bz, 'glass', scene);
              addBlockToScene(bx, 5, bz, 'wood', scene);
            } else {
              addBlockToScene(bx, 3, bz, 'brick', scene);
              addBlockToScene(bx, 4, bz, 'brick', scene);
              addBlockToScene(bx, 5, bz, 'wood', scene);
            }
          } else {
            // Interior polished wooden floor
            addBlockToScene(bx, 2, bz, 'wood', scene);
          }
        }
      }

      // Wooden Entrance Porch Deck for smooth, effortless entry
      addBlockToScene(-3, 2, 0, 'wood', scene);
      addBlockToScene(-2, 2, 0, 'wood', scene);

      // Wooden Roof
      for (let bx = -5; bx <= -1; bx++) {
        for (let bz = -5; bz <= -1; bz++) {
          addBlockToScene(bx, 6, bz, 'wood', scene);
        }
      }

      // Interior Cambridge Study Room Furniture (neatly placed along walls so center is open)
      addBlockToScene(-4, 3, -4, 'bookshelf', scene);
      addBlockToScene(-4, 4, -4, 'bookshelf', scene);
      addBlockToScene(-3, 3, -4, 'bookshelf', scene);
      addBlockToScene(-4, 3, -2, 'wood', scene); // Study Desk
      addBlockToScene(-4, 4, -2, 'lantern', scene); // Desk Reading Lantern
      addBlockToScene(-2, 5, -3, 'lantern', scene); // Warm ceiling study lantern

      // Oak tree near the pond
      const tx = 4;
      const tz = -3;
      addBlockToScene(tx, 3, tz, 'wood', scene);
      addBlockToScene(tx, 4, tz, 'wood', scene);
      addBlockToScene(tx, 5, tz, 'wood', scene);
      for (let lx = -1; lx <= 1; lx++) {
        for (let lz = -1; lz <= 1; lz++) {
          for (let ly = 6; ly <= 7; ly++) {
            if (!(lx === 0 && lz === 0 && ly === 6)) {
              addBlockToScene(tx + lx, ly, tz + lz, 'leaves', scene);
            }
          }
        }
      }

      // Decorative flowers & lanterns
      addBlockToScene(2, 3, 1, 'flower_red', scene);
      addBlockToScene(1, 3, 2, 'flower_yellow', scene);
      addBlockToScene(-2, 3, 2, 'flower_yellow', scene);
      addBlockToScene(0, 3, -3, 'lantern', scene);
    },
    [addBlockToScene, initialBlocks]
  );

  // Build Player articulated Voxel model
  const buildPlayerModel = useCallback((config: CharacterConfig, scene: THREE.Scene) => {
    if (playerGroupRef.current) {
      scene.remove(playerGroupRef.current);
    }

    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: config.skinColor });
    const hairMat = new THREE.MeshStandardMaterial({ color: config.hairColor });
    const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor });
    const pantsMat = new THREE.MeshStandardMaterial({ color: config.pantsColor });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x3b3a36 });

    // Torso
    const torsoGeom = new THREE.BoxGeometry(0.5, 0.7, 0.28);
    const torso = new THREE.Mesh(torsoGeom, shirtMat);
    torso.position.y = 1.05;
    torso.castShadow = true;
    group.add(torso);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.65;

    const headGeom = new THREE.BoxGeometry(0.44, 0.44, 0.44);
    const headMesh = new THREE.Mesh(headGeom, skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Hair
    const hairGeom = new THREE.BoxGeometry(0.48, 0.22, 0.48);
    const hairMesh = new THREE.Mesh(hairGeom, hairMat);
    hairMesh.position.y = 0.18;
    headGroup.add(hairMesh);

    if (config.gender === 'girl') {
      const ponytailGeom = new THREE.BoxGeometry(0.18, 0.35, 0.18);
      const ponytail = new THREE.Mesh(ponytailGeom, hairMat);
      ponytail.position.set(0, 0, -0.28);
      headGroup.add(ponytail);
    }

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), eyeMat);
    leftEye.position.set(-0.1, 0.02, 0.23);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), eyeMat);
    rightEye.position.set(0.1, 0.02, 0.23);
    headGroup.add(leftEye, rightEye);

    // Mouth
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xc2410c });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.02), mouthMat);
    mouth.position.set(0, -0.1, 0.23);
    headGroup.add(mouth);

    // Accessory
    if (config.accessory === 'miner_helmet') {
      const helmet = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.14, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xeab308 })
      );
      helmet.position.y = 0.24;
      const torch = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xf59e0b, emissiveIntensity: 1 })
      );
      torch.position.set(0, 0.22, 0.25);
      headGroup.add(helmet, torch);
    } else if (config.accessory === 'crown') {
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
      const crown = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), crownMat);
      crown.position.y = 0.28;
      headGroup.add(crown);
    } else if (config.accessory === 'flower_crown') {
      const flower = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      flower.position.set(0.2, 0.26, 0.2);
      headGroup.add(flower);
    }

    group.add(headGroup);

    // Limbs with joint pivots for smooth walking, jumping & idle articulation
    const limbGeom = new THREE.BoxGeometry(0.2, 0.65, 0.2);

    // Left Arm Pivot (at shoulder joint: y = 1.35)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.38, 1.35, 0);
    const leftArmMesh = new THREE.Mesh(limbGeom, shirtMat);
    leftArmMesh.position.set(0, -0.32, 0);
    leftArmMesh.castShadow = true;
    leftArmPivot.add(leftArmMesh);
    group.add(leftArmPivot);

    // Right Arm Pivot (at shoulder joint: y = 1.35)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.38, 1.35, 0);
    const rightArmMesh = new THREE.Mesh(limbGeom, shirtMat);
    rightArmMesh.position.set(0, -0.32, 0);
    rightArmMesh.castShadow = true;
    rightArmPivot.add(rightArmMesh);

    // Building tool attached to right arm
    const toolGroup = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.35, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 })
    );
    toolGroup.position.set(0, -0.5, 0.18);
    toolGroup.rotation.x = Math.PI / 4;
    rightArmPivot.add(toolGroup);
    group.add(rightArmPivot);

    // Left Leg Pivot (at hip joint: y = 0.68)
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.14, 0.68, 0);
    const leftLegMesh = new THREE.Mesh(limbGeom, pantsMat);
    leftLegMesh.position.set(0, -0.32, 0);
    leftLegMesh.castShadow = true;
    leftLegPivot.add(leftLegMesh);

    const bootGeom = new THREE.BoxGeometry(0.22, 0.15, 0.24);
    const leftBoot = new THREE.Mesh(bootGeom, bootsMat);
    leftBoot.position.set(0, -0.58, 0.02);
    leftLegPivot.add(leftBoot);
    group.add(leftLegPivot);

    // Right Leg Pivot (at hip joint: y = 0.68)
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.14, 0.68, 0);
    const rightLegMesh = new THREE.Mesh(limbGeom, pantsMat);
    rightLegMesh.position.set(0, -0.32, 0);
    rightLegMesh.castShadow = true;
    rightLegPivot.add(rightLegMesh);

    const rightBoot = new THREE.Mesh(bootGeom, bootsMat);
    rightBoot.position.set(0, -0.58, 0.02);
    rightLegPivot.add(rightBoot);
    group.add(rightLegPivot);

    group.position.copy(playerPos.current);
    scene.add(group);

    playerGroupRef.current = group;
    playerPartsRef.current = {
      torso,
      leftArm: leftArmPivot,
      rightArm: rightArmPivot,
      leftLeg: leftLegPivot,
      rightLeg: rightLegPivot,
      head: headGroup,
      tool: toolGroup,
    };
  }, []);

  const notifyWorldUpdated = useCallback(() => {
    if (!onWorldUpdatedRef.current) return;
    const blockList: VoxelBlock[] = [];
    blocksMapRef.current.forEach((val, key) => {
      const [x, y, z] = key.split(',').map(Number);
      blockList.push({ x, y, z, type: val.type });
    });
    onWorldUpdatedRef.current(blockList);
  }, []);

  // Spawn tactile 3D debris particles when digging
  const spawnDigParticles = useCallback((x: number, y: number, z: number, type: BlockType, scene: THREE.Scene) => {
    const def = BLOCK_DEFINITIONS[type];
    const color = def ? def.color : 0x78716c;
    const geom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        x + 0.5 + (Math.random() - 0.5) * 0.5,
        y + 0.5 + (Math.random() - 0.5) * 0.5,
        z + 0.5 + (Math.random() - 0.5) * 0.5
      );
      scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.2,
        Math.random() * 3.8 + 1.8,
        (Math.random() - 0.5) * 4.2
      );

      digParticlesRef.current.push({
        mesh,
        vel,
        life: 0.55,
        maxLife: 0.55,
      });
    }
  }, []);

  // Spawn subtle landing dust ring when touching ground after jump
  const spawnLandingDust = useCallback((x: number, y: number, z: number, scene: THREE.Scene) => {
    const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.65 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const mesh = new THREE.Mesh(geom, mat.clone());
      mesh.position.set(
        x + Math.cos(angle) * 0.25,
        y + 0.06,
        z + Math.sin(angle) * 0.25
      );
      scene.add(mesh);
      const vel = new THREE.Vector3(
        Math.cos(angle) * (1.2 + Math.random() * 0.6),
        Math.random() * 0.5 + 0.15,
        Math.sin(angle) * (1.2 + Math.random() * 0.6)
      );
      landingDustRef.current.push({
        mesh,
        vel,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }, []);

  // Core Dig Function: Excavates targeted block or ground beneath/in front of player
  const performDig = useCallback(
    (targetCoord?: { x: number; y: number; z: number } | null): boolean => {
      if (!sceneRef.current) return false;

      let target: { x: number; y: number; z: number } | null = null;

      // 1. If explicit coordinate specified and block exists
      if (
        targetCoord &&
        blocksMapRef.current.has(`${targetCoord.x},${targetCoord.y},${targetCoord.z}`)
      ) {
        target = targetCoord;
      }
      // 2. Else if hoveredCoords has an existing block
      else if (
        hoveredCoordsRef.current &&
        blocksMapRef.current.has(
          `${hoveredCoordsRef.current.x},${hoveredCoordsRef.current.y},${hoveredCoordsRef.current.z}`
        )
      ) {
        target = hoveredCoordsRef.current;
      }
      // 3. Otherwise find block under player feet or in front
      else {
        const px = Math.round(playerPos.current.x);
        const py = Math.round(playerPos.current.y);
        const pz = Math.round(playerPos.current.z);

        const rad = playerRot.current;
        const frontX = Math.round(px - Math.sin(rad) * 1.2);
        const frontZ = Math.round(pz - Math.cos(rad) * 1.2);

        // Prioritized candidates: front ground, body level, directly beneath feet, overhead, deeper
        const candidates = [
          { x: frontX, y: py - 1, z: frontZ }, // ground in front
          { x: frontX, y: py, z: frontZ },     // body level in front
          { x: px, y: py - 1, z: pz },         // directly beneath feet (dig down!)
          { x: frontX, y: py + 1, z: frontZ }, // overhead in front
          { x: px, y: py - 2, z: pz },         // deeper under feet
          { x: px, y: py, z: pz },             // inside player coord
        ];

        for (const cand of candidates) {
          if (blocksMapRef.current.has(`${cand.x},${cand.y},${cand.z}`)) {
            target = cand;
            break;
          }
        }
      }

      if (!target) {
        soundFx.playIncorrect();
        showNotification('⚠️ No block in range to dig!');
        return false;
      }

      // Trigger arm swing animation
      swingAction.current = 1.0;

      // Remove block from 3D scene
      const removedType = removeBlockFromScene(target.x, target.y, target.z, sceneRef.current);
      if (removedType) {
        // Spawn tactile voxel debris particles
        spawnDigParticles(target.x, target.y, target.z, removedType, sceneRef.current);

        soundFx.playDig();
        onAddBlockRef.current?.(removedType, 1);
        const blockName = BLOCK_DEFINITIONS[removedType]?.name || removedType;
        showNotification(`⛏️ Dug 1x ${blockName}!`);
        notifyWorldUpdated();
        return true;
      }

      return false;
    },
    [removeBlockFromScene, spawnDigParticles, notifyWorldUpdated]
  );

  const performDigRef = useRef(performDig);
  useEffect(() => {
    performDigRef.current = performDig;
  });

  // Trigger dig when digTrigger prop changes
  const prevDigTrigger = useRef(digTrigger || 0);
  useEffect(() => {
    if (digTrigger && digTrigger > prevDigTrigger.current) {
      performDigRef.current();
    }
    prevDigTrigger.current = digTrigger || 0;
  }, [digTrigger]);

  // Helper to create rain particle texture
  const createRainTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(8, 0, 8, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(0.3, 'rgba(186, 230, 253, 0.8)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(6, 0, 4, 64);
    return new THREE.CanvasTexture(canvas);
  };

  // Helper to create snow particle texture
  const createSnowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.85)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  };

  // Setup Dynamic Weather Particle Systems in Three.js
  const setupWeatherParticles = useCallback((scene: THREE.Scene) => {
    // 1. Rain Particles
    const rainCount = 1500;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 40;
      rainPositions[i * 3 + 1] = Math.random() * 30;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      map: createRainTexture(),
      size: 0.6,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const rainPoints = new THREE.Points(rainGeometry, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainPointsRef.current = rainPoints;
    rainGeomRef.current = rainGeometry;

    // 2. Snow Particles
    const snowCount = 1200;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 40;
      snowPositions[i * 3 + 1] = Math.random() * 26;
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const snowMat = new THREE.PointsMaterial({
      map: createSnowTexture(),
      size: 0.75,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const snowPoints = new THREE.Points(snowGeometry, snowMat);
    snowPoints.visible = false;
    scene.add(snowPoints);
    snowPointsRef.current = snowPoints;
    snowGeomRef.current = snowGeometry;
  }, []);

  // Update atmosphere & lighting based on Weather + Time of Day
  useEffect(() => {
    const scene = sceneRef.current;
    const hemi = hemiLightRef.current;
    const dir = dirLightRef.current;
    if (!scene || !hemi || !dir) return;

    let skyColor = 0x7dd3fc;
    let fogColor = 0xbae6fd;
    let fogDensity = 0.015;
    let dirColor = 0xfffbeb;
    let dirIntensity = 1.25;
    let hemiSky = 0xffffff;
    let hemiGround = 0x444444;
    let hemiIntensity = 0.85;

    if (weather === 'rain') {
      if (timeOfDay === 'day') {
        skyColor = 0x475569; // Moody overcast slate
        fogColor = 0x64748b;
        fogDensity = 0.032;
        dirColor = 0x94a3b8;
        dirIntensity = 0.65;
        hemiSky = 0x64748b;
        hemiGround = 0x334155;
        hemiIntensity = 0.6;
      } else if (timeOfDay === 'sunset') {
        skyColor = 0x581c87; // Dark stormy purple dusk
        fogColor = 0x6b21a8;
        fogDensity = 0.03;
        dirColor = 0xa855f7;
        dirIntensity = 0.55;
        hemiSky = 0x7e22ce;
        hemiGround = 0x3b0764;
        hemiIntensity = 0.5;
      } else {
        skyColor = 0x020617; // Midnight rainstorm
        fogColor = 0x0f172a;
        fogDensity = 0.036;
        dirColor = 0x38bdf8;
        dirIntensity = 0.25;
        hemiSky = 0x1e293b;
        hemiGround = 0x020617;
        hemiIntensity = 0.35;
      }
    } else if (weather === 'snow') {
      if (timeOfDay === 'day') {
        skyColor = 0xcfd8dc; // Soft arctic overcast
        fogColor = 0xe2e8f0;
        fogDensity = 0.024;
        dirColor = 0xf8fafc;
        dirIntensity = 1.05;
        hemiSky = 0xffffff;
        hemiGround = 0x64748b;
        hemiIntensity = 0.8;
      } else if (timeOfDay === 'sunset') {
        skyColor = 0xbe185d; // Alpine rose snow dusk
        fogColor = 0xf472b6;
        fogDensity = 0.022;
        dirColor = 0xfbcfe8;
        dirIntensity = 0.85;
        hemiSky = 0xf43f5e;
        hemiGround = 0x881337;
        hemiIntensity = 0.65;
      } else {
        skyColor = 0x1e1b4b; // Polar winter night
        fogColor = 0x312e81;
        fogDensity = 0.026;
        dirColor = 0x818cf8;
        dirIntensity = 0.45;
        hemiSky = 0x4338ca;
        hemiGround = 0x0f172a;
        hemiIntensity = 0.45;
      }
    } else {
      // Clear Weather
      if (timeOfDay === 'day') {
        skyColor = 0x7dd3fc;
        fogColor = 0xbae6fd;
        fogDensity = 0.015;
        dirColor = 0xfffbeb;
        dirIntensity = 1.25;
        hemiSky = 0xffffff;
        hemiGround = 0x444444;
        hemiIntensity = 0.85;
      } else if (timeOfDay === 'sunset') {
        skyColor = 0xf97316;
        fogColor = 0xfdba74;
        fogDensity = 0.018;
        dirColor = 0xfdba74;
        dirIntensity = 1.15;
        hemiSky = 0xfb923c;
        hemiGround = 0x7c2d12;
        hemiIntensity = 0.7;
      } else {
        skyColor = 0x0f172a;
        fogColor = 0x1e293b;
        fogDensity = 0.022;
        dirColor = 0x818cf8;
        dirIntensity = 0.35;
        hemiSky = 0x38bdf8;
        hemiGround = 0x020617;
        hemiIntensity = 0.4;
      }
    }

    scene.background = new THREE.Color(skyColor);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(fogColor);
      (scene.fog as THREE.FogExp2).density = fogDensity;
    }
    dir.color = new THREE.Color(dirColor);
    dir.intensity = dirIntensity;
    hemi.color = new THREE.Color(hemiSky);
    hemi.groundColor = new THREE.Color(hemiGround);
    hemi.intensity = hemiIntensity;
  }, [weather, timeOfDay]);

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.015);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 5, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lighting setup
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.85);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.25);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    const d = 15;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Highlight wireframe box for hovered voxel
    const highlightGeom = new THREE.BoxGeometry(1.02, 1.02, 1.02);
    const highlightEdges = new THREE.EdgesGeometry(highlightGeom);
    const highlightMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const highlightBox = new THREE.LineSegments(highlightEdges, highlightMat);
    highlightBox.visible = false;
    scene.add(highlightBox);
    highlightBoxRef.current = highlightBox;

    // Build World, Player & Weather Particles
    initDefaultWorld(scene);
    buildPlayerModel(characterConfig, scene);
    setupWeatherParticles(scene);

    // Window resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default window scrolling on arrow keys and space
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }

      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
      if (e.key) keysPressed.current[e.key.toLowerCase()] = true;

      // Key E: Open Cambridge Exam Station
      if (e.code === 'KeyE') {
        onOpenExamStationRef.current?.();
      }

      // Key M: Toggle place / mine mode
      if (e.code === 'KeyM') {
        onToggleBuildModeRef.current?.(buildModeRef.current === 'place' ? 'mine' : 'place');
      }

      // Key X or Key F: Instant Dig
      if (e.code === 'KeyX' || e.code === 'KeyF') {
        performDigRef.current();
      }

      // Key T: Toggle Time of Day
      if (e.code === 'KeyT') {
        onToggleTimeOfDayRef.current?.();
      }

      // Key K or Key P: Toggle Weather
      if (e.code === 'KeyK' || e.code === 'KeyP') {
        onToggleWeatherRef.current?.();
      }

      // Key C or Key V: Toggle Camera View (1st Person / 3rd Person)
      if (e.code === 'KeyC' || e.code === 'KeyV') {
        toggleCamera();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
      if (e.key) keysPressed.current[e.key.toLowerCase()] = false;
    };

    const handleBlur = () => {
      keysPressed.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Animation & Physics Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Input movement (Arrow keys and WASD work reliably across all views!)
      const moveSpeed = 6.0;
      let forward = 0;
      let strafe = 0;

      const isUp =
        keysPressed.current['ArrowUp'] ||
        keysPressed.current['KeyW'] ||
        keysPressed.current['w'] ||
        keysPressed.current['W'];
      const isDown =
        keysPressed.current['ArrowDown'] ||
        keysPressed.current['KeyS'] ||
        keysPressed.current['s'] ||
        keysPressed.current['S'];

      // Left & Right:
      // A / D = Strafe Left / Right
      // ArrowLeft / ArrowRight / Q = Smooth turning rotation
      const isStrafeLeft =
        keysPressed.current['KeyA'] ||
        keysPressed.current['a'] ||
        keysPressed.current['A'];
      const isStrafeRight =
        keysPressed.current['KeyD'] ||
        keysPressed.current['d'] ||
        keysPressed.current['D'];

      const isTurnLeft =
        keysPressed.current['ArrowLeft'] ||
        keysPressed.current['KeyQ'] ||
        keysPressed.current['q'] ||
        keysPressed.current['Q'];
      const isTurnRight =
        keysPressed.current['ArrowRight'];

      if (isUp) forward += 1;
      if (isDown) forward -= 1;
      if (isStrafeLeft) strafe -= 1;
      if (isStrafeRight) strafe += 1;

      // Turning rotation (ArrowLeft and ArrowRight turn camera & character smoothly!)
      if (isTurnLeft) {
        playerRot.current -= delta * 3.2;
      }
      if (isTurnRight) {
        playerRot.current += delta * 3.2;
      }

      // Smooth Jumping Trigger [SPACE key or on-screen JUMP]
      const isJumpPressed =
        keysPressed.current['Space'] ||
        keysPressed.current[' '] ||
        keysPressed.current['space'] ||
        keysPressed.current['virtual_jump'];

      if (isJumpPressed && isGrounded.current) {
        playerVel.current.y = 7.5; // Smooth, buoyant jump impulse
        isGrounded.current = false;
        soundFx.playJump();
      }

      // Compute horizontal velocity relative to player rotation
      if (forward !== 0 || strafe !== 0) {
        walkCycle.current += delta * 11;
        const angle = playerRot.current + Math.atan2(strafe, forward);
        playerVel.current.x = Math.sin(angle) * moveSpeed;
        playerVel.current.z = Math.cos(angle) * moveSpeed;
      } else {
        playerVel.current.x = 0;
        playerVel.current.z = 0;
      }

      // Horizontal Collision & Movement (X and Z against walls and doorways)
      const curX = playerPos.current.x;
      const curZ = playerPos.current.z;
      const curY = playerPos.current.y;
      // Slender collision cylinder so player never gets jammed entering doors or walking near walls
      const playerRadius = 0.18;

      // Passable blocks that should NEVER block movement (flowers, water)
      const isPassable = (type: BlockType): boolean => {
        return type === 'flower_red' || type === 'flower_yellow' || type === 'water';
      };

      // Robust AABB Block Collision Check
      const isColliding = (testX: number, testY: number, testZ: number): boolean => {
        const minBX = Math.floor(testX - playerRadius);
        const maxBX = Math.floor(testX + playerRadius);
        const minBZ = Math.floor(testZ - playerRadius);
        const maxBZ = Math.floor(testZ + playerRadius);
        // Vertical clearance: check from slightly above floor to head height
        const minBodyY = Math.floor(testY + 0.35);
        const maxBodyY = Math.floor(testY + 1.75);

        for (let bx = minBX; bx <= maxBX; bx++) {
          for (let bz = minBZ; bz <= maxBZ; bz++) {
            for (let by = minBodyY; by <= maxBodyY; by++) {
              const b = blocksMapRef.current.get(`${bx},${by},${bz}`);
              if (b && !isPassable(b.type)) {
                return true;
              }
            }
          }
        }
        return false;
      };

      // X Movement with collision check & step-up assist
      if (playerVel.current.x !== 0) {
        const nextX = curX + playerVel.current.x * delta;
        if (!isColliding(nextX, curY, curZ)) {
          playerPos.current.x = nextX;
        } else if (isColliding(curX, curY, curZ) && !isColliding(nextX, curY + 0.5, curZ)) {
          // If slightly clipped or at low ledge, allow resolution
          playerPos.current.x = nextX;
        } else {
          playerVel.current.x = 0;
        }
      }

      // Z Movement with collision check & step-up assist
      if (playerVel.current.z !== 0) {
        const nextZ = curZ + playerVel.current.z * delta;
        if (!isColliding(playerPos.current.x, curY, nextZ)) {
          playerPos.current.z = nextZ;
        } else if (isColliding(playerPos.current.x, curY, curZ) && !isColliding(playerPos.current.x, curY + 0.5, nextZ)) {
          // If slightly clipped or at low ledge, allow resolution
          playerPos.current.z = nextZ;
        } else {
          playerVel.current.z = 0;
        }
      }

      // Gravity & Ground / Ceiling collision
      playerVel.current.y -= 18.0 * delta; // Gravity
      let newY = playerPos.current.y + playerVel.current.y * delta;

      const pBX = Math.floor(playerPos.current.x);
      const pBZ = Math.floor(playerPos.current.z);

      // Ceiling Collision: Stop upward movement if head hits a solid ceiling block
      if (playerVel.current.y > 0) {
        const headBlockY = Math.floor(newY + 1.8);
        const ceilBlock = blocksMapRef.current.get(`${pBX},${headBlockY},${pBZ}`);
        if (ceilBlock && !isPassable(ceilBlock.type)) {
          newY = headBlockY - 1.85;
          playerVel.current.y = 0;
        }
      }

      // Multi-point ground check around character footprint
      const maxGroundSearchY = Math.floor(playerPos.current.y + 0.5);
      let groundHeight = -10;

      const sampleFootprint = [
        { x: playerPos.current.x, z: playerPos.current.z },
        { x: playerPos.current.x + 0.15, z: playerPos.current.z },
        { x: playerPos.current.x - 0.15, z: playerPos.current.z },
        { x: playerPos.current.x, z: playerPos.current.z + 0.15 },
        { x: playerPos.current.x, z: playerPos.current.z - 0.15 },
      ];

      for (const pt of sampleFootprint) {
        const bx = Math.floor(pt.x);
        const bz = Math.floor(pt.z);
        for (let y = maxGroundSearchY; y >= -4; y--) {
          const b = blocksMapRef.current.get(`${bx},${y},${bz}`);
          if (b && b.type !== 'flower_red' && b.type !== 'flower_yellow') {
            const h = y + 1;
            if (h > groundHeight && h <= playerPos.current.y + 0.6) {
              groundHeight = Math.max(groundHeight, h);
            }
            break;
          }
        }
      }

      if (newY <= groundHeight) {
        playerPos.current.y = groundHeight;
        playerVel.current.y = 0;
        if (!wasGrounded.current) {
          // Smooth landing impact: squash & tactile dust puffs
          landingSquash.current = 1.0;
          if (sceneRef.current) {
            spawnLandingDust(playerPos.current.x, groundHeight, playerPos.current.z, sceneRef.current);
          }
        }
        isGrounded.current = true;
      } else {
        playerPos.current.y = Math.max(-5, newY);
        isGrounded.current = false;
        if (playerPos.current.y <= -4) {
          // Respawn safely at island surface
          playerPos.current.set(0.5, 3, 2.5);
          playerVel.current.set(0, 0, 0);
        }
      }
      wasGrounded.current = isGrounded.current;

      // Update Player Mesh Position, Articulated Animations & Visibility
      if (playerGroupRef.current && playerPartsRef.current) {
        const parts = playerPartsRef.current;
        playerGroupRef.current.position.copy(playerPos.current);
        playerGroupRef.current.rotation.y = playerRot.current;

        // 1. Smooth Landing Squash & Stretch Impact Bounce
        if (landingSquash.current > 0) {
          landingSquash.current = Math.max(0, landingSquash.current - delta * 4.2);
          const squash = Math.sin(landingSquash.current * Math.PI) * 0.16;
          playerGroupRef.current.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
        } else {
          playerGroupRef.current.scale.set(1, 1, 1);
        }

        // 2. Jumping vs Ground Locomotion Articulation
        if (!isGrounded.current) {
          // Airborne: Smooth jumping pose
          const vy = playerVel.current.y;
          if (vy > 0) {
            // Ascending: Athletic jump tuck
            // Arms lift and flare out for lift & dynamic balance
            parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, -0.65, delta * 12);
            parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, -0.65, delta * 12);
            parts.leftArm.rotation.z = THREE.MathUtils.lerp(parts.leftArm.rotation.z, -0.3, delta * 10);
            parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, 0.3, delta * 10);

            // Legs tuck backward and bend for natural airborne silhouette
            parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, -0.45, delta * 12);
            parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, 0.35, delta * 12);
            parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, 0.12, delta * 10);
          } else {
            // Descending: Preparing for ground contact
            parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, -0.2, delta * 10);
            parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, -0.2, delta * 10);
            parts.leftArm.rotation.z = THREE.MathUtils.lerp(parts.leftArm.rotation.z, -0.4, delta * 10);
            parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, 0.4, delta * 10);

            // Legs straighten slightly downwards preparing to touch down
            parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, -0.15, delta * 10);
            parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, -0.15, delta * 10);
            parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, 0.05, delta * 10);
          }
        } else if (forward !== 0 || strafe !== 0) {
          // Ground locomotion: Running stride with articulated limb swings
          parts.leftArm.rotation.z = THREE.MathUtils.lerp(parts.leftArm.rotation.z, 0, delta * 10);
          parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, 0, delta * 10);
          parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, 0.08, delta * 10); // subtle forward run lean

          parts.leftArm.rotation.x = Math.sin(walkCycle.current) * 0.7;
          parts.rightArm.rotation.x = -Math.sin(walkCycle.current) * 0.7;
          parts.leftLeg.rotation.x = -Math.sin(walkCycle.current) * 0.7;
          parts.rightLeg.rotation.x = Math.sin(walkCycle.current) * 0.7;

          // Torso step bob
          parts.torso.position.y = 1.05 + Math.abs(Math.sin(walkCycle.current * 2)) * 0.04;
        } else {
          // Idle breathing and relaxed stance
          parts.leftArm.rotation.x = THREE.MathUtils.lerp(parts.leftArm.rotation.x, 0, delta * 8);
          parts.rightArm.rotation.x = THREE.MathUtils.lerp(parts.rightArm.rotation.x, 0, delta * 8);
          parts.leftArm.rotation.z = THREE.MathUtils.lerp(parts.leftArm.rotation.z, 0, delta * 8);
          parts.rightArm.rotation.z = THREE.MathUtils.lerp(parts.rightArm.rotation.z, 0, delta * 8);
          parts.leftLeg.rotation.x = THREE.MathUtils.lerp(parts.leftLeg.rotation.x, 0, delta * 8);
          parts.rightLeg.rotation.x = THREE.MathUtils.lerp(parts.rightLeg.rotation.x, 0, delta * 8);
          parts.torso.rotation.x = THREE.MathUtils.lerp(parts.torso.rotation.x, 0, delta * 8);

          // Gentle breathing rise and fall
          parts.torso.position.y = 1.05 + Math.sin(now * 0.003) * 0.015;
        }

        // Arm swing animation for placing/breaking
        if (swingAction.current > 0) {
          swingAction.current -= delta * 8;
          parts.rightArm.rotation.x = -Math.sin(swingAction.current * Math.PI) * 1.5;
        }

        // Hide character model in first-person view, show in third-person & orbit!
        playerGroupRef.current.visible = cameraViewRef.current !== 'firstPerson';
      }

      // DYNAMIC WEATHER PARTICLE ANIMATIONS
      const activeWeather = currentWeatherRef.current;
      const px = playerPos.current.x;
      const py = playerPos.current.y;
      const pz = playerPos.current.z;

      // 1. Rain Animation
      if (rainPointsRef.current && rainGeomRef.current) {
        if (activeWeather === 'rain') {
          rainPointsRef.current.visible = true;
          const pos = rainGeomRef.current.attributes.position.array as Float32Array;
          const count = pos.length / 3;

          for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] -= delta * 30.0; // Fast downward streak
            pos[i * 3] += delta * 1.2; // Slight diagonal wind drift

            // If fallen below player foot level, recycle up
            if (pos[i * 3 + 1] < py - 2) {
              pos[i * 3 + 1] = py + 16 + Math.random() * 8;
              pos[i * 3] = px + (Math.random() - 0.5) * 36;
              pos[i * 3 + 2] = pz + (Math.random() - 0.5) * 36;
            }
          }
          rainGeomRef.current.attributes.position.needsUpdate = true;
        } else {
          rainPointsRef.current.visible = false;
        }
      }

      // 2. Snow Animation
      if (snowPointsRef.current && snowGeomRef.current) {
        if (activeWeather === 'snow') {
          snowPointsRef.current.visible = true;
          const pos = snowGeomRef.current.attributes.position.array as Float32Array;
          const count = pos.length / 3;
          const time = now * 0.0018;

          for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] -= delta * 3.6; // Gentle drifting downward
            pos[i * 3] += Math.sin(time + i * 0.3) * delta * 1.5; // Soft swirling sway
            pos[i * 3 + 2] += Math.cos(time + i * 0.3) * delta * 1.2;

            // Recycle flake when below ground
            if (pos[i * 3 + 1] < py - 2) {
              pos[i * 3 + 1] = py + 15 + Math.random() * 7;
              pos[i * 3] = px + (Math.random() - 0.5) * 36;
              pos[i * 3 + 2] = pz + (Math.random() - 0.5) * 36;
            }
          }
          snowGeomRef.current.attributes.position.needsUpdate = true;
        } else {
          snowPointsRef.current.visible = false;
        }
      }

      // 3. Dynamic Digging Rubble Particles Animation
      if (digParticlesRef.current.length > 0) {
        for (let i = digParticlesRef.current.length - 1; i >= 0; i--) {
          const p = digParticlesRef.current[i];
          p.life -= delta;
          if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            (p.mesh.material as THREE.Material).dispose();
            digParticlesRef.current.splice(i, 1);
          } else {
            p.vel.y -= 14.0 * delta; // Gravity on debris
            p.mesh.position.addScaledVector(p.vel, delta);
            const scale = Math.max(0.01, p.life / p.maxLife);
            p.mesh.scale.set(scale, scale, scale);
          }
        }
      }

      // 4. Landing Impact Dust Puffs Animation
      if (landingDustRef.current.length > 0) {
        for (let i = landingDustRef.current.length - 1; i >= 0; i--) {
          const p = landingDustRef.current[i];
          p.life -= delta;
          if (p.life <= 0) {
            scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            (p.mesh.material as THREE.Material).dispose();
            landingDustRef.current.splice(i, 1);
          } else {
            p.vel.y -= 2.0 * delta;
            p.mesh.position.addScaledVector(p.vel, delta);
            const scale = Math.max(0.01, p.life / p.maxLife);
            p.mesh.scale.set(scale, scale, scale);
            const mat = p.mesh.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = (p.life / p.maxLife) * 0.65;
          }
        }
      }

      // Camera Follow
      if (cameraViewRef.current === 'firstPerson') {
        // First Person: Camera placed at character eye height (inside head)
        const eyeY = playerPos.current.y + 1.65;
        camera.position.set(playerPos.current.x, eyeY, playerPos.current.z);

        const yaw = playerRot.current;
        const pitch = playerPitch.current;
        const cosPitch = Math.cos(pitch);

        const lookDirX = Math.sin(yaw) * cosPitch;
        const lookDirY = Math.sin(pitch);
        const lookDirZ = Math.cos(yaw) * cosPitch;

        camera.lookAt(
          playerPos.current.x + lookDirX * 10,
          eyeY + lookDirY * 10,
          playerPos.current.z + lookDirZ * 10
        );
      } else if (cameraViewRef.current === 'thirdPerson') {
        // Third Person: Camera follows behind player
        const camTarget = playerPos.current.clone().add(new THREE.Vector3(0, 1.4, 0));
        const yaw = playerRot.current;
        const dist = 3.8;
        const targetCamX = playerPos.current.x - Math.sin(yaw) * dist;
        const targetCamY = playerPos.current.y + 2.2;
        const targetCamZ = playerPos.current.z - Math.cos(yaw) * dist;

        camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
        camera.lookAt(camTarget);
      } else {
        // Orbit Overview
        const orbitOffset = new THREE.Vector3(0, 16, 18);
        camera.position.lerp(playerPos.current.clone().add(orbitOffset), 0.05);
        camera.lookAt(playerPos.current.x, playerPos.current.y + 1, playerPos.current.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      digParticlesRef.current.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      digParticlesRef.current = [];
      landingDustRef.current.forEach((p) => {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      landingDustRef.current = [];
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update character model when config changes without reloading the world
  useEffect(() => {
    if (sceneRef.current) {
      buildPlayerModel(characterConfig, sceneRef.current);
    }
  }, [characterConfig, buildPlayerModel]);

  // Build blueprint schematic in world
  useEffect(() => {
    if (!blueprintToBuild || !sceneRef.current) return;
    blueprintToBuild.blocks.forEach((b) => {
      addBlockToScene(b.x, b.y, b.z, b.type, sceneRef.current!);
    });
    notifyWorldUpdated();
    showNotification(`🔨 Built ${blueprintToBuild.name}!`);
    soundFx.playCelebration();
  }, [blueprintToBuild, addBlockToScene, notifyWorldUpdated]);

  // Raycasting for Mouse interactions (hover highlight, break, place)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. If pointer is dragging, adjust pitch and yaw
    if (e.buttons > 0) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;

      if (!isPointerDragging.current) {
        const totalDist = Math.hypot(
          e.clientX - pointerStartPos.current.x,
          e.clientY - pointerStartPos.current.y
        );
        if (totalDist > 5) {
          isPointerDragging.current = true;
        }
      }

      if (isPointerDragging.current) {
        playerRot.current += dx * 0.005;
        playerPitch.current = Math.max(-1.2, Math.min(1.2, playerPitch.current - dy * 0.005));
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
      }
    }

    if (!cameraRef.current || !sceneRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Array.from(blocksMapRef.current.values()).map((b) => b.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0 && intersects[0].object.userData.voxelCoord) {
      const coord = intersects[0].object.userData.voxelCoord;
      setHoveredCoords(coord);
      hoveredCoordsRef.current = coord;
      if (highlightBoxRef.current) {
        highlightBoxRef.current.position.set(coord.x + 0.5, coord.y + 0.5, coord.z + 0.5);
        highlightBoxRef.current.visible = true;
      }
    } else {
      setHoveredCoords(null);
      hoveredCoordsRef.current = null;
      if (highlightBoxRef.current) {
        highlightBoxRef.current.visible = false;
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartPos.current = { x: e.clientX, y: e.clientY };
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    isPointerDragging.current = false;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    // If the user was dragging to turn the camera, do not trigger a block placement/mining click
    if (isPointerDragging.current) {
      isPointerDragging.current = false;
      return;
    }

    if (!cameraRef.current || !sceneRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = Array.from(blocksMapRef.current.values()).map((b) => b.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) return;

    const hit = intersects[0];
    const coord = hit.object.userData.voxelCoord;
    if (!coord) return;

    swingAction.current = 1.0;

    const isRightClick = e.button === 2;
    // In Place mode: Left click places, right click breaks/digs
    // In Mine mode: Left click breaks/digs, right click places
    const shouldPlace = buildMode === 'place' ? !isRightClick : isRightClick;

    if (shouldPlace) {
      if (!hit.face) return;
      const normal = hit.face.normal;
      const targetX = coord.x + Math.round(normal.x);
      const targetY = coord.y + Math.round(normal.y);
      const targetZ = coord.z + Math.round(normal.z);

      const count = inventory[activeBlockType] || 0;
      if (count <= 0) {
        soundFx.playIncorrect();
        showNotification(`⚠️ Out of ${BLOCK_DEFINITIONS[activeBlockType].name}s!`);
        return;
      }

      const consumed = onConsumeBlock(activeBlockType);
      if (consumed) {
        addBlockToScene(targetX, targetY, targetZ, activeBlockType, sceneRef.current);
        soundFx.playPlaceBlock();
        showNotification(`🔨 Placed ${BLOCK_DEFINITIONS[activeBlockType].name}`);
        notifyWorldUpdated();
      }
    } else {
      // Break / Dig block and collect it with tactile rubble particles
      performDig(coord);
    }
  };

  const handleVirtualMove = (direction: 'up' | 'down' | 'left' | 'right' | 'jump', active: boolean) => {
    const keyMap: Record<string, string[]> = {
      up: ['ArrowUp', 'KeyW', 'w'],
      down: ['ArrowDown', 'KeyS', 's'],
      left: ['ArrowLeft', 'KeyA', 'a'],
      right: ['ArrowRight', 'KeyD', 'd'],
      jump: ['Space', ' ', 'virtual_jump'],
    };
    keyMap[direction].forEach((k) => {
      keysPressed.current[k] = active;
    });
  };

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none cursor-crosshair"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Reticle / Crosshair */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative w-6 h-6 flex items-center justify-center opacity-70">
          <div className="w-0.5 h-4 bg-white shadow-sm" />
          <div className="h-0.5 w-4 bg-white shadow-sm absolute" />
        </div>
      </div>

      {/* On-screen Notification Banner */}
      {actionNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-slideDown">
          <div className="px-4 py-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 font-extrabold text-xs rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span>{actionNotification}</span>
          </div>
        </div>
      )}

      {/* Target voxel status hint */}
      {hoveredCoords && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-10 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono text-emerald-300 border border-emerald-500/20 flex items-center gap-2 shadow-xl">
          <span>Target: X:{hoveredCoords.x} Y:{hoveredCoords.y} Z:{hoveredCoords.z}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-bold">[X] Dig</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-200">
            {buildMode === 'place'
              ? `[Click] Place ${BLOCK_DEFINITIONS[activeBlockType]?.name || ''}`
              : '[Click] Dig Block'}
          </span>
        </div>
      )}

      {/* On-screen Arrow Controls (D-Pad, Jump & Dig) */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-24 left-4 z-20 flex flex-col items-center pointer-events-auto opacity-90 hover:opacity-100 transition-opacity"
      >
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            handleVirtualMove('up', true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            handleVirtualMove('up', false);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleVirtualMove('up', false);
          }}
          onPointerCancel={(e) => {
            e.stopPropagation();
            handleVirtualMove('up', false);
          }}
          className="w-12 h-12 bg-slate-900/90 border border-white/30 rounded-xl active:bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Move Forward [ArrowUp / W]"
        >
          ▲
        </button>
        <div className="flex gap-2 my-1">
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              handleVirtualMove('left', true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              handleVirtualMove('left', false);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              handleVirtualMove('left', false);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              handleVirtualMove('left', false);
            }}
            className="w-12 h-12 bg-slate-900/90 border border-white/30 rounded-xl active:bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Turn Left / Move Left [ArrowLeft / A]"
          >
            ◀
          </button>
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              handleVirtualMove('jump', true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              handleVirtualMove('jump', false);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              handleVirtualMove('jump', false);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              handleVirtualMove('jump', false);
            }}
            className="w-12 h-12 bg-amber-500/90 border border-amber-300 rounded-xl active:bg-amber-600 flex flex-col items-center justify-center text-slate-950 font-black text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Smooth Jump [Space]"
          >
            <span className="text-sm">🦘</span>
            <span>JUMP</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              performDig();
            }}
            className="w-12 h-12 bg-amber-600/90 hover:bg-amber-500 border border-amber-300 rounded-xl active:bg-amber-700 flex flex-col items-center justify-center text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Dig Block [X / F]"
          >
            <span className="text-base">⛏️</span>
            <span className="text-[9px]">DIG</span>
          </button>
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              handleVirtualMove('right', true);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              handleVirtualMove('right', false);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              handleVirtualMove('right', false);
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              handleVirtualMove('right', false);
            }}
            className="w-12 h-12 bg-slate-900/90 border border-white/30 rounded-xl active:bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            title="Turn Right / Move Right [ArrowRight / D]"
          >
            ▶
          </button>
        </div>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            handleVirtualMove('down', true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            handleVirtualMove('down', false);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleVirtualMove('down', false);
          }}
          onPointerCancel={(e) => {
            e.stopPropagation();
            handleVirtualMove('down', false);
          }}
          className="w-12 h-12 bg-slate-900/90 border border-white/30 rounded-xl active:bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Move Backward [ArrowDown / S]"
        >
          ▼
        </button>
      </div>
    </div>
  );
};
