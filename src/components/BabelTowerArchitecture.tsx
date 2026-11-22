import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { PosterNode3D, TowerBuildResult, TowerContent, TowerTierConfig } from "../types/content";
import { DEFAULT_TOWER_METRICS } from "../types/content";

export interface ArchitectureTierMeta {
  id: TowerTierConfig["id"];
  accentColor: string;
}

export const TIER_ACCENT_COLORS: Record<TowerTierConfig["id"], string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#ffd700",
  premium: "#38bdf8"
};

const SLOT_COLORS = {
  watched: "#10B981",
  watchlist: "#F59E0B",
  blueprint: "#06B6D4"
} as const;

const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);

function createBeveledMonolithGeometry(width = 0.9, height = 1.38, depth = 0.055) {
  const bevel = 0.018;
  const w = width - bevel * 2;
  const h = height - bevel * 2;
  const r = 0.045;
  const hw = w / 2;
  const hh = h / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 4
  });
  geom.center();
  return geom;
}

function buildNodeMatrix(node: PosterNode3D, outwardOffset = 0, uniformScale = 1): THREE.Matrix4 {
  _euler.set(node.rotation[0], node.rotation[1], node.rotation[2], "YXZ");
  _quat.setFromEuler(_euler);
  _vec3.set(node.position[0], node.position[1], node.position[2]);
  if (outwardOffset !== 0) {
    _normal.set(0, 0, 1).applyQuaternion(_quat).multiplyScalar(outwardOffset);
    _vec3.add(_normal);
  }
  _scale.set(uniformScale, uniformScale, uniformScale);
  return new THREE.Matrix4().compose(_vec3, _quat, _scale);
}

interface SlotBucketProps {
  nodes: PosterNode3D[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  onHoverNode: (node: PosterNode3D | null) => void;
  onSelectFloor: (floorIndex: number) => void;
}

function SlotInstancedBucket({ nodes, geometry, material, onHoverNode, onSelectFloor }: SlotBucketProps) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, Math.max(1, nodes.length));
    nodes.forEach((node, idx) => {
      instance.setMatrixAt(idx, buildNodeMatrix(node));
    });
    instance.count = nodes.length;
    instance.instanceMatrix.needsUpdate = true;
    instance.castShadow = false;
    instance.receiveShadow = false;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, nodes]);

  useEffect(() => {
    return () => {
      mesh.dispose();
    };
  }, [mesh]);

  if (nodes.length === 0) return null;

  return (
    <primitive
      object={mesh}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (typeof e.instanceId === "number" && nodes[e.instanceId]) {
          onHoverNode(nodes[e.instanceId]);
        }
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHoverNode(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (typeof e.instanceId === "number" && nodes[e.instanceId]) {
          onSelectFloor(nodes[e.instanceId].floorIndex);
        }
      }}
    />
  );
}

function BlueprintWireframeLayer({ nodes }: { nodes: PosterNode3D[] }) {
  const mergedGeometry = useMemo(() => {
    if (nodes.length === 0) return null;
    const baseBox = new THREE.BoxGeometry(0.92, 1.4, 0.065);
    const baseEdges = new THREE.EdgesGeometry(baseBox);
    baseBox.dispose();

    const clones = nodes.map((node) => {
      const cloned = baseEdges.clone();
      cloned.applyMatrix4(buildNodeMatrix(node));
      return cloned;
    });
    baseEdges.dispose();

    const merged = mergeGeometries(clones, false);
    clones.forEach((c) => c.dispose());
    return merged;
  }, [nodes]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: SLOT_COLORS.blueprint,
        transparent: true,
        opacity: 0.72
      }),
    []
  );

  useEffect(() => {
    return () => {
      mergedGeometry?.dispose();
      lineMaterial.dispose();
    };
  }, [mergedGeometry, lineMaterial]);

  if (!mergedGeometry) return null;

  return <lineSegments geometry={mergedGeometry} material={lineMaterial} frustumCulled />;
}

function HoveredSlotHighlight({
  node,
  contentItem,
  geometry
}: {
  node: PosterNode3D;
  contentItem?: TowerContent;
  geometry: THREE.BufferGeometry;
}) {
  const color = node.isWatched
    ? SLOT_COLORS.watched
    : node.isBlueprint
      ? SLOT_COLORS.blueprint
      : SLOT_COLORS.watchlist;

  const statusLabel = node.isWatched ? "İZLENDİ" : node.isBlueprint ? "BLUEPRINT" : "İZLEME LİSTESİ";
  const statusClass = node.isWatched ? "watched" : node.isBlueprint ? "blueprint" : "watchlist";

  const matrix = useMemo(() => buildNodeMatrix(node, 0.16, 1.14), [node]);
  const pos = useMemo(() => new THREE.Vector3().setFromMatrixPosition(matrix), [matrix]);
  const quat = useMemo(() => new THREE.Quaternion().setFromRotationMatrix(matrix), [matrix]);
  const scale = useMemo(() => new THREE.Vector3().setFromMatrixScale(matrix), [matrix]);

  return (
    <group position={pos} quaternion={quat}>
      <mesh geometry={geometry} scale={scale}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.85}
          roughness={0.22}
          metalness={0.5}
        />
      </mesh>
      <Html position={[0, 1.05, 0.1]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
        <div className="slot-tooltip">
          <div className={`slot-badge ${statusClass}`}>{statusLabel}</div>
          <strong>{contentItem ? contentItem.title : node.isFlag ? `Zirve Tacı #${node.index + 1}` : `Boş Slot #${node.index + 1}`}</strong>
          <small>
            {contentItem
              ? `${contentItem.releaseYear ?? "—"} · ${contentItem.mediaType === "movie" ? "Film" : "Dizi"} · Kat ${node.floorIndex + 1}`
              : `Kat ${node.floorIndex + 1} · İnşa edilmeyi bekliyor`}
          </small>
        </div>
      </Html>
    </group>
  );
}

function TowerBody({
  build,
  content,
  accentColor,
  hoveredNode,
  onHoverNode,
  onSelectFloor
}: {
  build: TowerBuildResult;
  content: TowerContent[];
  accentColor: string;
  hoveredNode: PosterNode3D | null;
  onHoverNode: (node: PosterNode3D | null) => void;
  onSelectFloor: (floorIndex: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);

  const floorHeight = DEFAULT_TOWER_METRICS.posterHeight + DEFAULT_TOWER_METRICS.verticalGap;
  const unitArcLength = DEFAULT_TOWER_METRICS.posterWidth + DEFAULT_TOWER_METRICS.horizontalGap;

  const architecture = useMemo(() => {
    const capacities: number[] = [];
    for (let u = build.tier.baseUnits; u >= build.tier.topUnits; u--) {
      capacities.push(build.tier.segments * u);
    }

    const floors = capacities.map((capacity, floorIdx) => ({
      floorIdx,
      radius: (capacity * unitArcLength) / (2 * Math.PI),
      yBase: floorIdx * floorHeight
    }));

    const buttressMatrices: THREE.Matrix4[] = [];
    floors.forEach((floor) => {
      for (let seg = 0; seg < build.tier.segments; seg++) {
        const theta = (seg / build.tier.segments) * Math.PI * 2;
        const buttressR = floor.radius + 0.08;
        _vec3.set(buttressR * Math.cos(theta), floor.yBase + floorHeight / 2, buttressR * Math.sin(theta));
        _euler.set(0, -theta, 0);
        _quat.setFromEuler(_euler);
        _scale.set(1, 1, 1);
        buttressMatrices.push(new THREE.Matrix4().compose(_vec3, _quat, _scale));
      }
    });

    const watchedNodes: PosterNode3D[] = [];
    const watchlistNodes: PosterNode3D[] = [];
    const blueprintNodes: PosterNode3D[] = [];

    build.nodes.forEach((node) => {
      if (node.isWatched) watchedNodes.push(node);
      else if (node.isBlueprint) blueprintNodes.push(node);
      else watchlistNodes.push(node);
    });

    const bodyTopY = floors.length * floorHeight;
    const topBodyRadius = floors[floors.length - 1].radius;

    return {
      floors,
      buttressMatrices,
      watchedNodes,
      watchlistNodes,
      blueprintNodes,
      bodyTopY,
      topBodyRadius
    };
  }, [build, floorHeight, unitArcLength]);

  const monolithGeometry = useMemo(() => createBeveledMonolithGeometry(0.9, 1.38, 0.06), []);
  const buttressGeometry = useMemo(() => new THREE.BoxGeometry(0.36, floorHeight + 0.04, 0.36), [floorHeight]);

  const watchedMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: SLOT_COLORS.watched,
        emissive: "#064e3b",
        emissiveIntensity: 0.2,
        roughness: 0.28,
        metalness: 0.45,
        clearcoat: 0.45,
        clearcoatRoughness: 0.22
      }),
    []
  );

  const watchlistMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SLOT_COLORS.watchlist,
        emissive: "#78350f",
        emissiveIntensity: 0.22,
        roughness: 0.26,
        metalness: 0.42,
        transparent: true,
        opacity: 0.85
      }),
    []
  );

  const blueprintMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SLOT_COLORS.blueprint,
        emissive: SLOT_COLORS.blueprint,
        emissiveIntensity: 0.14,
        roughness: 0.35,
        metalness: 0.3,
        transparent: true,
        opacity: 0.26,
        depthWrite: false
      }),
    []
  );

  const buttressMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#27272f",
        roughness: 0.55,
        metalness: 0.35
      }),
    []
  );

  useEffect(() => {
    return () => {
      monolithGeometry.dispose();
      buttressGeometry.dispose();
      watchedMaterial.dispose();
      watchlistMaterial.dispose();
      blueprintMaterial.dispose();
      buttressMaterial.dispose();
    };
  }, [monolithGeometry, buttressGeometry, watchedMaterial, watchlistMaterial, blueprintMaterial, buttressMaterial]);

  const buttressMesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(
      buttressGeometry,
      buttressMaterial,
      Math.max(1, architecture.buttressMatrices.length)
    );
    architecture.buttressMatrices.forEach((matrix, idx) => instance.setMatrixAt(idx, matrix));
    instance.count = architecture.buttressMatrices.length;
    instance.instanceMatrix.needsUpdate = true;
    instance.castShadow = false;
    instance.receiveShadow = true;
    instance.computeBoundingSphere();
    return instance;
  }, [architecture.buttressMatrices, buttressGeometry, buttressMaterial]);

  useEffect(() => {
    return () => {
      buttressMesh.dispose();
    };
  }, [buttressMesh]);

  // Subtle auto-rotation pauses on hover + gentle core light flicker
  useFrame((state, delta) => {
    if (groupRef.current && !hoveredNode) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    if (coreLightRef.current) {
      const t = state.clock.elapsedTime;
      coreLightRef.current.intensity = 2.4 + Math.sin(t * 3.1) * 0.28 + Math.sin(t * 7.4) * 0.14;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Merkezi Çekirdek Işığı (hafif titreyen yukarı vuran iç ışık) */}
      <pointLight
        ref={coreLightRef}
        position={[0, architecture.bodyTopY * 0.35, 0]}
        color="#34d399"
        intensity={2.4}
        distance={build.baseRadius * 3.5 + 10}
        decay={0.8}
      />

      {/* Faz 5.3: Yansıtıcı Dairesel Taban Platformu (metalness: 0.8, roughness: 0.2) */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <cylinderGeometry args={[build.baseRadius + 2.4, build.baseRadius + 2.9, 0.7, 72]} />
        <meshStandardMaterial color="#141821" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[build.baseRadius + 2.38, 0.06, 12, 96]} />
        <meshStandardMaterial color={accentColor} metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Kat Silindirleri, Yatay Teras Basamakları ve Korniş Halkaları */}
      {architecture.floors.map((floor) => (
        <group
          key={floor.floorIdx}
          onClick={(e) => {
            e.stopPropagation();
            onSelectFloor(floor.floorIdx);
          }}
        >
          <mesh position={[0, floor.yBase + floorHeight / 2, 0]} receiveShadow>
            <cylinderGeometry args={[floor.radius - 0.18, floor.radius - 0.12, floorHeight, 64]} />
            <meshStandardMaterial color={floor.floorIdx % 2 === 0 ? "#1b202c" : "#222836"} roughness={0.58} metalness={0.28} />
          </mesh>
          <mesh position={[0, floor.yBase + 0.07, 0]} receiveShadow>
            <cylinderGeometry args={[floor.radius + 0.18, floor.radius + 0.26, 0.14, 64]} />
            <meshStandardMaterial color="#2a3142" roughness={0.48} metalness={0.38} />
          </mesh>
          <mesh position={[0, floor.yBase + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[floor.radius + 0.2, 0.048, 10, 72]} />
            <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.24} />
          </mesh>
        </group>
      ))}

      {/* Dikey Mimari Segment Kolonları */}
      <primitive object={buttressMesh} />

      {/* Faz 4: InstancedMesh Slot Katmanları (Watched, Watchlist, Blueprint) */}
      <SlotInstancedBucket
        nodes={architecture.watchedNodes}
        geometry={monolithGeometry}
        material={watchedMaterial}
        onHoverNode={onHoverNode}
        onSelectFloor={onSelectFloor}
      />
      <SlotInstancedBucket
        nodes={architecture.watchlistNodes}
        geometry={monolithGeometry}
        material={watchlistMaterial}
        onHoverNode={onHoverNode}
        onSelectFloor={onSelectFloor}
      />
      <SlotInstancedBucket
        nodes={architecture.blueprintNodes}
        geometry={monolithGeometry}
        material={blueprintMaterial}
        onHoverNode={onHoverNode}
        onSelectFloor={onSelectFloor}
      />

      {/* Faz 2.4: Blueprint Slotları için Emissive CAD Kenar Çizgileri */}
      <BlueprintWireframeLayer nodes={architecture.blueprintNodes} />

      {/* Faz 3.1 & 3.2: Hover Parlaması, Öne Çıkma ve Html Tooltip */}
      {hoveredNode && (
        <HoveredSlotHighlight
          node={hoveredNode}
          contentItem={content[hoveredNode.index]}
          geometry={monolithGeometry}
        />
      )}

      {/* Faz 5: Zirve Taç Platformu, Zirve Işığı ve Parçacıklar */}
      <mesh position={[0, architecture.bodyTopY + 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[architecture.topBodyRadius * 0.72, architecture.topBodyRadius, 0.34, 48]} />
        <meshStandardMaterial color={accentColor} metalness={0.82} roughness={0.2} />
      </mesh>

      <spotLight
        position={[0, architecture.bodyTopY + 8, 0]}
        angle={0.55}
        penumbra={0.65}
        intensity={45}
        distance={18}
        color={accentColor}
      />

      <Sparkles
        position={[0, architecture.bodyTopY + 1.8, 0]}
        count={48}
        scale={[architecture.topBodyRadius * 1.4 + 2, 3.6, architecture.topBodyRadius * 1.4 + 2]}
        size={2.8}
        speed={0.45}
        opacity={0.75}
        color={accentColor}
      />
    </group>
  );
}

function CameraController({
  tierId,
  baseRadius,
  maxHeight,
  focusedFloorY,
  onUserInteract
}: {
  tierId: string;
  baseRadius: number;
  maxHeight: number;
  focusedFloorY: number | null;
  onUserInteract: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const transitioningRef = useRef(false);

  useEffect(() => {
    _targetPos.set(baseRadius * 2.15, maxHeight * 0.68 + 2.5, baseRadius * 2.65);
    _targetLook.set(0, maxHeight * 0.44, 0);
    camera.position.copy(_targetPos);
    if (controlsRef.current) {
      controlsRef.current.target.copy(_targetLook);
      controlsRef.current.update();
    }
    transitioningRef.current = false;
  }, [tierId, baseRadius, maxHeight, camera]);

  useEffect(() => {
    if (focusedFloorY === null) return;
    const dist = Math.max(8, baseRadius * 1.65);
    const angle = Math.atan2(camera.position.z, camera.position.x);
    _targetPos.set(Math.cos(angle) * dist, focusedFloorY + 2.2, Math.sin(angle) * dist);
    _targetLook.set(0, focusedFloorY + 0.75, 0);
    transitioningRef.current = true;
  }, [focusedFloorY, baseRadius, camera]);

  useFrame((_, delta) => {
    if (!transitioningRef.current || !controlsRef.current) return;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetPos.x, 4.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetPos.y, 4.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetPos.z, 4.5, delta);

    controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, _targetLook.x, 5, delta);
    controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, _targetLook.y, 5, delta);
    controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, _targetLook.z, 5, delta);
    controlsRef.current.update();

    if (camera.position.distanceTo(_targetPos) < 0.08) {
      transitioningRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={Math.max(4.5, baseRadius * 0.9)}
      maxDistance={Math.max(48, maxHeight * 3.8 + baseRadius * 2.2)}
      maxPolarAngle={Math.PI / 2 - 0.04}
      onStart={() => {
        transitioningRef.current = false;
        onUserInteract();
      }}
    />
  );
}

export default function BabelTowerArchitecture({
  build,
  content,
  focusedFloor,
  onSelectFloor,
  onClearFocus
}: {
  build: TowerBuildResult;
  content: TowerContent[];
  focusedFloor: number | null;
  onSelectFloor: (floorIndex: number) => void;
  onClearFocus: () => void;
}) {
  const [hoveredNode, setHoveredNode] = useState<PosterNode3D | null>(null);
  const accentColor = TIER_ACCENT_COLORS[build.tier.id];
  const floorHeight = DEFAULT_TOWER_METRICS.posterHeight + DEFAULT_TOWER_METRICS.verticalGap;
  const focusedFloorY = focusedFloor !== null ? focusedFloor * floorHeight : null;

  useEffect(() => {
    document.body.style.cursor = hoveredNode ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hoveredNode]);

  // Clear stale hover state when tier or build changes
  useEffect(() => {
    setHoveredNode(null);
  }, [build.tier.id, build.watchedCount, build.watchlistCount]);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [build.baseRadius * 2.15, build.maxHeight * 0.68 + 2.5, build.baseRadius * 2.65], fov: 45 }}
      onPointerMissed={() => setHoveredNode(null)}
    >
      <color attach="background" args={["#09090b"]} />
      <fog
        attach="fog"
        args={["#09090b", Math.max(26, build.maxHeight * 2.1), Math.max(70, build.maxHeight * 5.2 + build.baseRadius * 2.5)]}
      />

      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#bcd2ff", "#1e293b", 0.35]} />
      <directionalLight position={[build.baseRadius * 1.8, build.maxHeight * 1.9 + 10, build.baseRadius * 1.6]} intensity={1.35} />

      {/* Halka Bazlı Çevre (Rim) Işıkları */}
      <pointLight
        position={[-build.baseRadius * 1.9, build.maxHeight * 0.45, -build.baseRadius * 1.7]}
        intensity={1.25}
        decay={0}
        color={accentColor}
      />
      <pointLight
        position={[build.baseRadius * 1.7, build.maxHeight * 0.85, -build.baseRadius * 1.8]}
        intensity={0.75}
        decay={0}
        color="#38bdf8"
      />

      <TowerBody
        build={build}
        content={content}
        accentColor={accentColor}
        hoveredNode={hoveredNode}
        onHoverNode={setHoveredNode}
        onSelectFloor={onSelectFloor}
      />

      <ContactShadows
        key={`${build.tier.id}-${build.targetTotal}`}
        frames={1}
        position={[0, -0.71, 0]}
        opacity={0.55}
        scale={Math.max(42, build.baseRadius * 4.8)}
        blur={2.2}
        far={build.maxHeight * 1.6}
      />

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={3.2} position={[0, 5, -9]} scale={10} color="#fff5e0" />
          <Lightformer form="rect" intensity={2.2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} color="#a5f3fc" />
          <Lightformer form="rect" intensity={2.2} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} color="#fde68a" />
        </group>
      </Environment>

      <CameraController
        tierId={build.tier.id}
        baseRadius={build.baseRadius}
        maxHeight={build.maxHeight}
        focusedFloorY={focusedFloorY}
        onUserInteract={onClearFocus}
      />
    </Canvas>
  );
}