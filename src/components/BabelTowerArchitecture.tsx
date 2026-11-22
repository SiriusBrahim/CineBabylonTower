import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const BRONZE_TOWER = {
  name: "Bronz Kule",
  targetTotal: 100,
  segments: 3,
  baseUnits: 12,
  topUnits: 10,
  accentColor: "#cd7f32"
};

type Ring = { index: number; units: number; radius: number; y: number; };

function InstancedSlots({ matrices, geometry, material }: {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((matrix, index) => instance.setMatrixAt(index, matrix));
    instance.instanceMatrix.needsUpdate = true;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, matrices]);
  return <primitive object={mesh} />;
}

function BronzeTowerModel() {
  const dims = useMemo(() => {
    const posterWidth = 1, posterHeight = 1.5, horizontalGap = 0.15;
    const verticalGap = 0.16, rowPitch = posterHeight + verticalGap;
    const ringGap = 0.48;
    const ringHeight = 3 * rowPitch + ringGap;
    const pitch = posterWidth + horizontalGap;
    const unitsByRing = [12, 11, 10];
    const rings: Ring[] = unitsByRing.map((units, index) => ({
      index,
      units,
      radius: units * pitch / (2 * Math.PI),
      y: index * ringHeight
    }));
    const bodyHeight = rings.length * ringHeight;
    const baseRadius = rings[0].radius;
    const slots: THREE.Matrix4[] = [];

    // Her halka kendi çevresinde 3 dikey poster sırası taşır.
    // 12'lik halka: 12+12+12, 11'lik halka: 11+11+11,
    // 10'luk halka: 10+10+10. Posterler spiral boyunca yükselmez.
    rings.forEach(ring => {
      for (let row = 0; row < 3; row++) {
        const y = ring.y + row * rowPitch + posterHeight / 2 + 0.12;
        for (let slot = 0; slot < ring.units; slot++) {
          const theta = slot / ring.units * Math.PI * 2;
          const position = new THREE.Vector3(
            ring.radius * Math.cos(theta),
            y,
            ring.radius * Math.sin(theta)
          );
          const rotation = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(0, -theta + Math.PI / 2, 0)
          );
          slots.push(new THREE.Matrix4().compose(
            position, rotation, new THREE.Vector3(1, 1, 1)
          ));
        }
      }
    });

    // 99 halka yuvasına ek olarak ayrılmış tek tepe yuvası.
    slots.push(new THREE.Matrix4().compose(
      new THREE.Vector3(0, bodyHeight + 0.95, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ));

    return { rings, bodyHeight, baseRadius, slots, ringHeight };
  }, []);

  const accent = useMemo(() => new THREE.Color(BRONZE_TOWER.accentColor), []);
  const slotGeometry = useMemo(() => new THREE.BoxGeometry(0.92, 1.38, 0.075), []);
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#39404b",
    metalness: 0.68,
    roughness: 0.38,
    emissive: accent,
    emissiveIntensity: 0.12
  }), [accent]);
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

  return (
    <group>
      <mesh position={[0, -0.62, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[dims.baseRadius + 2.1, dims.baseRadius + 2.45, 0.42, 96]} />
        <meshStandardMaterial color="#24252a" roughness={0.82} />
      </mesh>
      <mesh position={[0, -0.31, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[dims.baseRadius + 1.85, dims.baseRadius + 2.1, 0.22, 96]} />
        <meshStandardMaterial color="#51483e" roughness={0.72} />
      </mesh>
      <mesh position={[0, -0.17, 0]}>
        <torusGeometry args={[dims.baseRadius + 1.92, 0.055, 10, 96]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.25} />
      </mesh>

      {dims.rings.map(ring => (
        <group key={ring.index}>
          <mesh position={[0, ring.y + dims.ringHeight / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[ring.radius - 0.12, ring.radius - 0.04, dims.ringHeight, 72]} />
            <meshStandardMaterial color={ring.index % 2 ? "#51483e" : "#625548"} roughness={0.82} metalness={0.12} />
          </mesh>
          <mesh position={[0, ring.y + 0.08, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[ring.radius + 0.24, ring.radius + 0.42, 0.16, 72]} />
            <meshStandardMaterial color="#81705b" roughness={0.72} metalness={0.2} />
          </mesh>
          <mesh position={[0, ring.y + 0.17, 0]}>
            <torusGeometry args={[ring.radius + 0.31, 0.055, 10, 72]} />
            <meshStandardMaterial color={accent} metalness={0.82} roughness={0.28} />
          </mesh>
          <group position={[0, ring.y + dims.ringHeight - 0.12, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <ringGeometry args={[ring.radius + 0.28, ring.radius + 1.05, 96]} />
              <primitive object={walkwayMaterial} attach="material" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ring.radius + 1.05, 0.075, 10, 96]} />
              <primitive object={railMaterial} attach="material" />
            </mesh>
          </group>
        </group>
      ))}

      {Array.from({ length: BRONZE_TOWER.segments }, (_, index) => {
        const theta = index / BRONZE_TOWER.segments * Math.PI * 2;
        const radius = dims.baseRadius + 0.12;
        return (
          <group key={index}
            position={[radius * Math.cos(theta), dims.bodyHeight / 2, radius * Math.sin(theta)]}
            rotation={[0, -theta, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.48, dims.bodyHeight + 0.3, 0.58]} />
              <meshStandardMaterial color="#a18a6c" roughness={0.66} metalness={0.25} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.54, dims.bodyHeight + 0.36, 0.62]} />
              <meshStandardMaterial color={accent} wireframe metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      <InstancedSlots matrices={dims.slots} geometry={slotGeometry} material={slotMaterial} />
    </group>
  );
}

export default function BabelTowerArchitecture() {
  const height = 3 * 1.8;
  const radius = 3 * 12 * 1.15 / (2 * Math.PI);
  return (
    <Canvas shadows dpr={[1, 1.7]}
      camera={{ position: [radius * 2.45, height * 0.72, radius * 3.05], fov: 39 }}>
      <color attach="background" args={["#090b12"]} />
      <fog attach="fog" args={["#090b12", height * 1.7, height * 4.8]} />
      <ambientLight intensity={0.68} />
      <directionalLight position={[18, height * 1.6, 14]} intensity={2.0}
        castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-radius * 2, height * 0.55, -radius]}
        intensity={height * 0.1} color={BRONZE_TOWER.accentColor} />
      <pointLight position={[radius, height * 0.9, radius * 1.5]}
        intensity={height * 0.065} color="#9eb7ff" />
      <BronzeTowerModel />
      <ContactShadows position={[0, -0.82, 0]} opacity={0.52}
        scale={radius * 5.2} blur={2.8} far={height * 1.5} />
      <Environment preset="city" />
      <OrbitControls makeDefault enableDamping dampingFactor={0.06}
        minDistance={radius * 1.3} maxDistance={height * 4.5}
        maxPolarAngle={Math.PI * 0.49} target={[0, height * 0.43, 0]} />
    </Canvas>
  );
}
