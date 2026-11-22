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
    const horizontalGap = 0.06;
    const verticalGap = 0.16;
    const rowPitch = posterHeight + verticalGap;

    const unitsByRing = [12, 11, 10];
    const arcStep = posterWidth + horizontalGap;

    // Konik başlangıç ve bitiş yarıçapları pozitif tutulur.
    const baseRadius = arcStep / (2 * Math.sin(Math.PI / unitsByRing[0]));
    const topRadius = arcStep / (2 * Math.sin(Math.PI / unitsByRing[unitsByRing.length - 1]));

    const totalSlots = unitsByRing.reduce((sum, units) => sum + units * 3, 0);
    const radialStep = (baseRadius - topRadius) / (totalSlots - 1);

    // Yükselme oranı, başlangıç çevresinde yaklaşık 12 slot/tur olacak şekilde ayarlanır.
    const slotsPerTurn = (2 * Math.PI * baseRadius) / arcStep;
    const risePerSlot = rowPitch / slotsPerTurn;

    const slots: THREE.Matrix4[] = [];
    let theta = 0;
    let y = posterHeight / 2 + 0.12;

    for (let i = 0; i < totalSlots; i++) {
      const radius = baseRadius - i * radialStep;

      slots.push(new THREE.Matrix4().compose(
        new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta + Math.PI / 2, 0)),
        new THREE.Vector3(1, 1, 1)
      ));

      // Açı, mevcut yarıçaptaki yay uzunluğuna göre biriktirilir.
      theta += arcStep / radius;
      y += risePerSlot;
    }

    const bodyHeight = y;
    slots.push(new THREE.Matrix4().compose(
      new THREE.Vector3(0, bodyHeight + 0.95, 0),
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ));

    return { slots, bodyHeight, baseRadius, topRadius };
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
  // Kamera ve sis değerleri yeni spiral geometrisinin gerçek ölçülerinden türetilir.
  const posterWidth = 0.92;
  const posterHeight = 1.38;
  const arcStep = posterWidth + 0.06;
  const rowPitch = posterHeight + 0.16;
  const unitsByRing = [12, 11, 10];
  const totalSlots = unitsByRing.reduce((sum, units) => sum + units * 3, 0);
  const baseRadius = arcStep / (2 * Math.sin(Math.PI / unitsByRing[0]));
  const slotsPerTurn = (2 * Math.PI * baseRadius) / arcStep;
  const risePerSlot = rowPitch / slotsPerTurn;
  const height = totalSlots * risePerSlot + posterHeight / 2 + 0.12 + 0.95;
  const radius = baseRadius;

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
