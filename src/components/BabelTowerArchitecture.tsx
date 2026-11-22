import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const BRONZE_TOWER = {
  name: "Bronz Kule",
  targetTotal: 100,
  segments: 3,
  baseUnits: 12,
  topUnits: 10,
  accentColor: "#cd7f32"
};

function InstancedSlots({ matrices, geometry, material }: {
  matrices: THREE.Matrix4[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}) {
  const mesh = useMemo(() => {
    const instance = new THREE.InstancedMesh(geometry, material, matrices.length);
    const slotColor = new THREE.Color();
    matrices.forEach((matrix, index) => {
      instance.setMatrixAt(index, matrix);
      // Her yuvaya komşularından ayırt edilebilen, dengeli bir renk ver.
      slotColor.setHSL((index * 0.61803398875) % 1, 0.62, 0.56);
      instance.setColorAt(index, slotColor);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    instance.computeBoundingSphere();
    return instance;
  }, [geometry, material, matrices]);
  return <primitive object={mesh} />;
}

function BronzeTowerModel() {
  const dims = useMemo(() => {
    const posterWidth = 0.92;
    const posterHeight = 1.38;
    const verticalGap = 0.16;
    const rowPitch = posterHeight + verticalGap;

    const unitsByRing = [12, 11, 10];
    const centerSpacing = posterWidth;

    // En alt halkanın başlangıç yarıçapını referans alıyoruz.
    const baseRadius = centerSpacing / (2 * Math.sin(Math.PI / unitsByRing[0]));

    const slots: THREE.Matrix4[] = [];

    // --- SÜREKLİ SPİRAL (HELIX) ---
    let globalIndex = 0;
    const slotsPerTurn = 12;
    const risePerSlot = rowPitch / slotsPerTurn;
    const shrinkPerTurn = posterWidth * 0.85;

    unitsByRing.forEach((units) => {
      const totalSlotsInRing = units * 3;

      for (let i = 0; i < totalSlotsInRing; i++) {
        const theta = globalIndex * (2 * Math.PI / slotsPerTurn);
        const y = globalIndex * risePerSlot + posterHeight / 2 + 0.12;

        const turnsCompleted = globalIndex / slotsPerTurn;
        const currentRadius = baseRadius - (turnsCompleted * shrinkPerTurn);

        const position = new THREE.Vector3(
          currentRadius * Math.cos(theta),
          y,
          currentRadius * Math.sin(theta)
        );

        const rotation = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, -theta + Math.PI / 2, 0)
        );

        slots.push(new THREE.Matrix4().compose(
          position,
          rotation,
          new THREE.Vector3(1, 1, 1)
        ));

        globalIndex++;
      }
    });

    // Tepe yuvası: globalIndex toplam slot sayısına eşittir.
    const bodyHeight = globalIndex * risePerSlot + posterHeight / 2 + 0.12;
    slots.push(new THREE.Matrix4().compose(
      new THREE.Vector3(0, bodyHeight + 0.95, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ));

    return { slots, bodyHeight };
  }, []);

  const accent = useMemo(() => new THREE.Color(BRONZE_TOWER.accentColor), []);
  const slotGeometry = useMemo(() => new THREE.BoxGeometry(0.92, 1.38, 0.075), []);
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 0.68,
    roughness: 0.38,
    emissive: accent,
    emissiveIntensity: 0.12
  }), [accent]);

  return (
    <group>
      <InstancedSlots matrices={dims.slots} geometry={slotGeometry} material={slotMaterial} />
    </group>
  );
}

export default function BabelTowerArchitecture() {
  const height = 3 * (3 * (1.5 + 0.16) + 0.48);
  const radius = 3 * 12 * 1.84 / (2 * Math.PI);
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
      <Environment preset="city" />
      <OrbitControls makeDefault enableDamping dampingFactor={0.06}
        minDistance={radius * 1.3} maxDistance={height * 4.5}
        maxPolarAngle={Math.PI * 0.49} target={[0, height * 0.43, 0]} />
    </Canvas>
  );
}
