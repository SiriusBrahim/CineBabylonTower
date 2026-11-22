import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export interface ArchitectureTier {
  id: "bronze" | "silver" | "gold" | "premium";
  name: string;
  targetTotal: number;
  segments: number;
  baseUnits: number;
  topUnits: number;
  accentColor: string;
}
export const ARCHITECTURE_TIERS: ArchitectureTier[] = [
  { id: "bronze", name: "Bronz Kule", targetTotal: 100, segments: 3, baseUnits: 12, topUnits: 10, accentColor: "#cd7f32" },
  { id: "silver", name: "Gümüş Kule", targetTotal: 365, segments: 4, baseUnits: 16, topUnits: 10, accentColor: "#c0c0c0" },
  { id: "gold", name: "Altın Kule", targetTotal: 835, segments: 5, baseUnits: 20, topUnits: 10, accentColor: "#ffd700" },
  { id: "premium", name: "Premium Kule", targetTotal: 1550, segments: 6, baseUnits: 24, topUnits: 10, accentColor: "#38bdf8" }
];
type Floor = { index: number; capacity: number; radius: number; y: number };
function InstancedBlocks({ matrices, geometry, material }: { matrices: THREE.Matrix4[]; geometry: THREE.BufferGeometry; material: THREE.Material }) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, index) => instance.setMatrixAt(index, matrix));
    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, matrices]);
  return <primitive object={mesh} />;
}
function ArchitectureModel({ tier }: { tier: ArchitectureTier }) {
  const dims = useMemo(() => {
    const posterWidth = 1, posterHeight = 1.5, horizontalGap = 0.15, verticalGap = 0.3;
    const floorHeight = posterHeight + verticalGap, pitch = posterWidth + horizontalGap;
    const capacities: number[] = [];
    for (let u = tier.baseUnits; u >= tier.topUnits; u--) capacities.push(tier.segments * u);
    const floors: Floor[] = capacities.map((capacity, index) => ({ index, capacity, radius: capacity * pitch / (2 * Math.PI), y: index * floorHeight }));
    const bodyCapacity = capacities.reduce((a, b) => a + b, 0);
    const flagCount = Math.max(0, tier.targetTotal - bodyCapacity);
    const bodyHeight = floors.length * floorHeight;
    const baseRadius = floors[0].radius, topRadius = floors[floors.length - 1].radius;
    const crownCapacity = Math.min(Math.max(flagCount, 1), Math.max(tier.segments, 5));
    const crownRadius = Math.max(0.9, Math.min(topRadius * 0.55, crownCapacity * pitch / (2 * Math.PI)));
    const slots: THREE.Matrix4[] = [];
    floors.forEach(floor => {
      const phase = floor.index * Math.PI / tier.segments;
      for (let s = 0; s < floor.capacity; s++) {
        const theta = s / floor.capacity * Math.PI * 2 + phase;
        const y = floor.y + s / floor.capacity * floorHeight + posterHeight / 2;
        const p = new THREE.Vector3(floor.radius * Math.cos(theta), y, floor.radius * Math.sin(theta));
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta + Math.PI / 2, 0));
        slots.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1)));
      }
    });
    const crowns: { position: [number, number, number]; rotation: number }[] = [];
    for (let i = 0; i < flagCount; i++) {
      const ring = Math.floor(i / crownCapacity), slot = i % crownCapacity;
      const count = Math.min(crownCapacity, flagCount - ring * crownCapacity);
      const theta = slot / count * Math.PI * 2 + ring * 0.4, r = crownRadius * Math.pow(0.85, ring);
      crowns.push({ position: [r * Math.cos(theta), bodyHeight + ring * floorHeight + posterHeight * 0.65, r * Math.sin(theta)], rotation: -theta + Math.PI / 2 });
    }
    return { floors, bodyCapacity, flagCount, bodyHeight, floorHeight, baseRadius, topRadius, crowns, slots };
  }, [tier]);
  const accent = useMemo(() => new THREE.Color(tier.accentColor), [tier.accentColor]);
  const slotGeometry = useMemo(() => new THREE.BoxGeometry(0.92, 1.38, 0.075), []);
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#39404b", metalness: 0.68, roughness: 0.38, emissive: accent, emissiveIntensity: 0.12 }), [accent]);
  const ringWalkways = useMemo(() => dims.floors.map(floor => ({
    index: floor.index,
    y: floor.y + dims.floorHeight - 0.12,
    innerRadius: floor.radius + 0.28,
    outerRadius: floor.radius + 1.05,
    railRadius: floor.radius + 1.05
  })), [dims]);
  const walkwayMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#8e7b63",
    roughness: 0.68,
    metalness: 0.24,
    side: THREE.DoubleSide
  }), []);
  const railMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: accent,
    metalness: 0.82,
    roughness: 0.24
  }), [accent]);
  return <group>
    {/* Broad stepped stone plinth */}
    <mesh position={[0, -0.62, 0]} castShadow receiveShadow><cylinderGeometry args={[dims.baseRadius + 2.1, dims.baseRadius + 2.45, 0.42, 96]} /><meshStandardMaterial color="#24252a" roughness={0.82} /></mesh>
    <mesh position={[0, -0.31, 0]} castShadow receiveShadow><cylinderGeometry args={[dims.baseRadius + 1.85, dims.baseRadius + 2.1, 0.22, 96]} /><meshStandardMaterial color="#51483e" roughness={0.72} /></mesh>
    <mesh position={[0, -0.17, 0]}><torusGeometry args={[dims.baseRadius + 1.92, 0.055, 10, 96]} /><meshStandardMaterial color={accent} metalness={0.8} roughness={0.25} /></mesh>
    {/* Tapered circular body, terrace lips and cornices */}
    {dims.floors.map(floor => <group key={floor.index}>
      <mesh position={[0, floor.y + dims.floorHeight / 2, 0]} castShadow receiveShadow><cylinderGeometry args={[floor.radius - 0.12, floor.radius - 0.04, dims.floorHeight, 72]} /><meshStandardMaterial color={floor.index % 2 ? "#51483e" : "#625548"} roughness={0.82} metalness={0.12} /></mesh>
      <mesh position={[0, floor.y + 0.08, 0]} castShadow receiveShadow><cylinderGeometry args={[floor.radius + 0.24, floor.radius + 0.42, 0.16, 72]} /><meshStandardMaterial color="#81705b" roughness={0.72} metalness={0.2} /></mesh>
      <mesh position={[0, floor.y + 0.17, 0]}><torusGeometry args={[floor.radius + 0.31, 0.055, 10, 72]} /><meshStandardMaterial color={accent} metalness={0.82} roughness={0.28} /></mesh>
    </group>)}
    {/* Structural ribs / vertical piers, one per segment */}
    {Array.from({ length: tier.segments }, (_, i) => {
      const theta = i / tier.segments * Math.PI * 2, r = dims.baseRadius + 0.12;
      return <group key={i} position={[r * Math.cos(theta), dims.bodyHeight / 2, r * Math.sin(theta)]} rotation={[0, -theta, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.48, dims.bodyHeight + 0.3, 0.58]} /><meshStandardMaterial color="#a18a6c" roughness={0.66} metalness={0.25} /></mesh>
        <mesh><boxGeometry args={[0.54, dims.bodyHeight + 0.36, 0.62]} /><meshStandardMaterial color={accent} wireframe metalness={0.7} roughness={0.3} /></mesh>
      </group>;
    })}
    {/* Horizontal annular walkways: one complete, level ring per tower floor.
        No helical connector means there are no vertical floor-transition joints to break. */}
    {ringWalkways.map(ring => <group key={ring.index} position={[0, ring.y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[ring.innerRadius, ring.outerRadius, 96]} />
        <primitive object={walkwayMaterial} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ring.railRadius, 0.075, 10, 96]} />
        <primitive object={railMaterial} attach="material" />
      </mesh>
    </group>)}
    {/* Empty poster-slot architectural frames */}
    <InstancedBlocks matrices={dims.slots} geometry={slotGeometry} material={slotMaterial} />
    {/* Crown terrace */}
    <mesh position={[0, dims.bodyHeight + 0.02, 0]} castShadow><cylinderGeometry args={[dims.topRadius * 0.78, dims.topRadius * 1.03, 0.38, 64]} /><meshStandardMaterial color="#8b765b" metalness={0.42} roughness={0.45} /></mesh>
    <mesh position={[0, dims.bodyHeight + 0.24, 0]}><torusGeometry args={[dims.topRadius * 0.76, 0.07, 12, 64]} /><meshStandardMaterial color={accent} metalness={0.85} roughness={0.2} /></mesh>
    {dims.flagCount === 1 ? <group position={[0, dims.bodyHeight + 1.05, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow><cylinderGeometry args={[0.045, 0.07, 1.7, 12]} /><meshStandardMaterial color="#d7bd88" metalness={0.8} /></mesh>
      <mesh position={[0.42, 1.32, 0]}><planeGeometry args={[0.85, 0.48]} /><meshStandardMaterial color={accent} side={THREE.DoubleSide} metalness={0.45} /></mesh>
      <mesh position={[0, 1.72, 0]}><octahedronGeometry args={[0.16, 0]} /><meshStandardMaterial color={accent} metalness={0.9} /></mesh>
    </group> : dims.crowns.map((flag, i) => <group key={i} position={flag.position} rotation={[0, flag.rotation, 0]}>
      <mesh castShadow><boxGeometry args={[0.96, 1.38, 0.08]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.22} metalness={0.78} roughness={0.25} /></mesh>
    </group>)}
  </group>;
}
export default function BabelTowerArchitecture({ tier }: { tier: ArchitectureTier }) {
  const height = (tier.baseUnits - tier.topUnits + 1) * 1.8;
  const radius = tier.segments * tier.baseUnits * 1.15 / (2 * Math.PI);
  return <Canvas shadows dpr={[1, 1.7]} camera={{ position: [radius * 2.45, height * 0.72, radius * 3.05], fov: 39 }}>
    <color attach="background" args={["#090b12"]} />
    <fog attach="fog" args={["#090b12", height * 1.7, height * 4.8]} />
    <ambientLight intensity={0.68} />
    <directionalLight position={[18, height * 1.6, 14]} intensity={2.0} castShadow shadow-mapSize={[2048, 2048]} />
    <pointLight position={[-radius * 2, height * 0.55, -radius]} intensity={height * 0.1} color={tier.accentColor} />
    <pointLight position={[radius, height * 0.9, radius * 1.5]} intensity={height * 0.065} color="#9eb7ff" />
    <ArchitectureModel tier={tier} />
    <ContactShadows position={[0, -0.82, 0]} opacity={0.52} scale={radius * 5.2} blur={2.8} far={height * 1.5} />
    <Environment preset="city" />
    <OrbitControls makeDefault enableDamping dampingFactor={0.06} minDistance={radius * 1.3} maxDistance={height * 4.5} maxPolarAngle={Math.PI * 0.49} target={[0, height * 0.43, 0]} />
  </Canvas>;
}