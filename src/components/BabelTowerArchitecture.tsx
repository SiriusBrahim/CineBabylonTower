import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export interface TowerTierConfig {
  id: "bronze" | "silver" | "gold" | "premium";
  name: string;
  targetTotal: number;
  segments: number;
  baseUnits: number;
  topUnits: number;
  accentColor: string;
}

export const TOWER_TIERS: TowerTierConfig[] = [
  { id: "bronze", name: "Bronz Kule (100)", targetTotal: 100, segments: 3, baseUnits: 12, topUnits: 10, accentColor: "#cd7f32" },
  { id: "silver", name: "Gümüş Kule (365)", targetTotal: 365, segments: 4, baseUnits: 16, topUnits: 10, accentColor: "#c0c0c0" },
  { id: "gold", name: "Altın Kule (835)", targetTotal: 835, segments: 5, baseUnits: 20, topUnits: 10, accentColor: "#ffd700" },
  { id: "premium", name: "Premium Kule (1550)", targetTotal: 1550, segments: 6, baseUnits: 24, topUnits: 10, accentColor: "#38bdf8" }
];

const POSTER_WIDTH = 1.0;
const POSTER_HEIGHT = 1.5;
const HORIZONTAL_GAP = 0.15;
const VERTICAL_GAP = 0.3;
const FLOOR_HEIGHT = POSTER_HEIGHT + VERTICAL_GAP;
const UNIT_ARC_LENGTH = POSTER_WIDTH + HORIZONTAL_GAP;

function InstancedMeshes({
  matrices,
  geometry,
  material
}: {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, Math.max(1, matrices.length));
    matrices.forEach((matrix, idx) => instance.setMatrixAt(idx, matrix));
    instance.count = matrices.length;
    instance.instanceMatrix.needsUpdate = true;
    instance.castShadow = true;
    instance.receiveShadow = true;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, matrices]);

  useEffect(() => {
    return () => {
      mesh.dispose();
    };
  }, [mesh]);

  return <primitive object={mesh} />;
}

export function TowerMesh({ tier }: { tier: TowerTierConfig }) {
  const architecture = useMemo(() => {
    const floorCapacities: number[] = [];
    for (let u = tier.baseUnits; u >= tier.topUnits; u--) {
      floorCapacities.push(tier.segments * u);
    }

    const bodyCapacity = floorCapacities.reduce((acc, c) => acc + c, 0);
    const flagCount = Math.max(0, tier.targetTotal - bodyCapacity);

    const slotMatrices: THREE.Matrix4[] = [];
    const buttressMatrices: THREE.Matrix4[] = [];

    const floors = floorCapacities.map((capacity, floorIdx) => {
      const radius = (capacity * UNIT_ARC_LENGTH) / (2 * Math.PI);
      const yBase = floorIdx * FLOOR_HEIGHT;
      const phaseOffset = (floorIdx * Math.PI) / tier.segments;

      // Level ring of empty slot architectural frames (no spiral rise)
      for (let s = 0; s < capacity; s++) {
        const theta = (s / capacity) * Math.PI * 2 + phaseOffset;
        const y = yBase + POSTER_HEIGHT / 2 + 0.14;
        const pos = new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta));
        const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta + Math.PI / 2, 0));
        slotMatrices.push(new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1)));
      }

      // Stepped architectural buttresses/columns (segments: 3, 4, 5, 6) seated flush per ring
      for (let seg = 0; seg < tier.segments; seg++) {
        const theta = (seg / tier.segments) * Math.PI * 2;
        const buttressR = radius + 0.14;
        const pos = new THREE.Vector3(buttressR * Math.cos(theta), yBase + FLOOR_HEIGHT / 2, buttressR * Math.sin(theta));
        const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta, 0));
        buttressMatrices.push(new THREE.Matrix4().compose(pos, quat, new THREE.Vector3(1, 1, 1)));
      }

      return {
        floorIdx,
        radius,
        yBase
      };
    });

    // Zirve Bayrak / Taç Pozisyonları
    const bodyTopY = floors.length * FLOOR_HEIGHT;
    const topBodyRadius = floors[floors.length - 1].radius;
    const flags: { position: [number, number, number]; rotation: [number, number, number] }[] = [];

    if (flagCount === 1) {
      flags.push({
        position: [0, bodyTopY + POSTER_HEIGHT * 0.85, 0],
        rotation: [0, 0, 0]
      });
    } else if (flagCount > 1) {
      const crownCap = Math.min(flagCount, Math.max(tier.segments, 5));
      const crownRadius = Math.max(0.9, Math.min(topBodyRadius * 0.55, (crownCap * UNIT_ARC_LENGTH) / (2 * Math.PI)));

      for (let f = 0; f < flagCount; f++) {
        const subFloor = Math.floor(f / crownCap);
        const slotIdx = f % crownCap;
        const ringItems = Math.min(crownCap, flagCount - subFloor * crownCap);
        const theta = (slotIdx / ringItems) * Math.PI * 2 + subFloor * 0.4;
        const r = crownRadius * Math.pow(0.85, subFloor);

        flags.push({
          position: [r * Math.cos(theta), bodyTopY + subFloor * FLOOR_HEIGHT + POSTER_HEIGHT * 0.65, r * Math.sin(theta)],
          rotation: [0, -theta + Math.PI / 2, 0]
        });
      }
    }

    return {
      floors,
      flags,
      slotMatrices,
      buttressMatrices,
      bodyTopY,
      baseRadius: floors[0].radius,
      topBodyRadius
    };
  }, [tier]);

  const slotGeometry = useMemo(
    () => new THREE.BoxGeometry(POSTER_WIDTH * 0.92, POSTER_HEIGHT * 0.92, 0.05),
    []
  );
  const slotMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3f3f46",
        emissive: tier.accentColor,
        emissiveIntensity: 0.08,
        roughness: 0.4,
        metalness: 0.5
      }),
    [tier.accentColor]
  );

  const buttressGeometry = useMemo(() => new THREE.BoxGeometry(0.46, FLOOR_HEIGHT + 0.04, 0.46), []);
  const buttressMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3f3f46",
        roughness: 0.58,
        metalness: 0.28
      }),
    []
  );

  useEffect(() => {
    return () => {
      slotGeometry.dispose();
      slotMaterial.dispose();
      buttressGeometry.dispose();
      buttressMaterial.dispose();
    };
  }, [slotGeometry, slotMaterial, buttressGeometry, buttressMaterial]);

  return (
    <group>
      {/* Ana Zemin Kaidesi */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[architecture.baseRadius + 1.2, architecture.baseRadius + 1.8, 0.8, 64]} />
        <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Kat Silindirleri (İç Çekirdek + Yatay Teras Basamakları + Korniş Halkaları) */}
      {architecture.floors.map((floor) => (
        <group key={floor.floorIdx}>
          {/* İç Çekirdek Gövde */}
          <mesh position={[0, floor.yBase + FLOOR_HEIGHT / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[floor.radius - 0.12, floor.radius - 0.08, FLOOR_HEIGHT, 64]} />
            <meshStandardMaterial color="#27272a" roughness={0.65} metalness={0.2} />
          </mesh>

          {/* Teras Basamak Tabliyesi */}
          <mesh position={[0, floor.yBase + 0.07, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[floor.radius + 0.18, floor.radius + 0.28, 0.14, 64]} />
            <meshStandardMaterial color="#323238" roughness={0.62} metalness={0.24} />
          </mesh>

          {/* Kat Arası Taş Silme (Yatay Korniş Halkası) */}
          <mesh position={[0, floor.yBase + 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[floor.radius + 0.2, 0.06, 12, 72]} />
            <meshStandardMaterial color={tier.accentColor} metalness={0.75} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Dikey Mimari Kaburgalar / Sütunlar (segments: 3, 4, 5, 6) */}
      <InstancedMeshes
        matrices={architecture.buttressMatrices}
        geometry={buttressGeometry}
        material={buttressMaterial}
      />

      {/* Boş Poster Yuva Çerçeveleri (Kat halkaları boyunca yatay dizilim) */}
      <InstancedMeshes
        matrices={architecture.slotMatrices}
        geometry={slotGeometry}
        material={slotMaterial}
      />

      {/* Zirve Taç Platformu ve Bayrak Yuvaları */}
      <mesh position={[0, architecture.bodyTopY + 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[architecture.topBodyRadius * 0.7, architecture.topBodyRadius, 0.35, 48]}
        />
        <meshStandardMaterial color={tier.accentColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {architecture.flags.map((flag, idx) => (
        <mesh key={`flag-${idx}`} position={flag.position} rotation={flag.rotation} castShadow>
          <boxGeometry args={[POSTER_WIDTH * 1.05, POSTER_HEIGHT * 1.05, 0.08]} />
          <meshStandardMaterial
            color={tier.accentColor}
            emissive={tier.accentColor}
            emissiveIntensity={0.35}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig({ tierId, radius, height }: { tierId: string; radius: number; height: number }) {
  const { camera } = useThree();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  useEffect(() => {
    camera.position.set(radius * 2.1, height * 0.72 + 2, radius * 2.55);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, height * 0.45, 0);
      controlsRef.current.update();
    }
  }, [tierId, radius, height, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={Math.max(5, radius * 1.15)}
      maxDistance={Math.max(45, height * 3.8 + radius * 2)}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[0, height * 0.45, 0]}
    />
  );
}

export default function BabelTowerArchitecture({ tier }: { tier: TowerTierConfig }) {
  const floorCount = tier.baseUnits - tier.topUnits + 1;
  const height = floorCount * FLOOR_HEIGHT;
  const radius = (tier.segments * tier.baseUnits * UNIT_ARC_LENGTH) / (2 * Math.PI);
  const shadowBound = radius * 1.6;

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [radius * 2.1, height * 0.72 + 2, radius * 2.55], fov: 45 }}>
      <color attach="background" args={["#09090b"]} />
      <fog attach="fog" args={["#09090b", Math.max(25, height * 2.2), Math.max(65, height * 5.2 + radius * 2)]} />

      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#b4c8ff", "#27272a", 0.35]} />
      <directionalLight
        position={[radius * 1.5, height * 1.8 + 8, radius * 1.5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowBound}
        shadow-camera-right={shadowBound}
        shadow-camera-top={height * 1.6}
        shadow-camera-bottom={-shadowBound}
        shadow-camera-near={1}
        shadow-camera-far={height * 4 + radius * 3}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={[-radius * 1.5, height * 0.65, -radius * 1.5]} intensity={0.8} decay={0} color={tier.accentColor} />

      <TowerMesh tier={tier} />

      <ContactShadows
        key={tier.id}
        frames={1}
        position={[0, -0.79, 0]}
        opacity={0.6}
        scale={Math.max(40, radius * 4.5)}
        blur={2}
        far={height * 1.6}
      />
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={3} position={[0, 5, -9]} scale={10} color="#fff4dc" />
          <Lightformer form="rect" intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} color="#bcd4ff" />
          <Lightformer form="rect" intensity={2} position={[10, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} color="#ffe9c7" />
        </group>
      </Environment>
      <CameraRig tierId={tier.id} radius={radius} height={height} />
    </Canvas>
  );
}