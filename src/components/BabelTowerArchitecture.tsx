import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const BRONZE_TOWER = {
  name: "Bronz Kule",
  targetTotal: 100,
  segments: 3,
  accentColor: "#cd7f32"
};

const TOWER_CONFIG = {
  posterWidth: 0.92,
  posterHeight: 1.38,
  horizontalGap: 0.04,
  totalSlots: 99,
  taper: 0.70,
  initialSlotsPerTurn: 10,
  turnGap: 0.08,
  terraceBoundaries: [33, 66] as const
};

function createTowerLayout() {
  const {
    posterWidth,
    posterHeight,
    horizontalGap,
    totalSlots,
    taper,
    initialSlotsPerTurn,
    turnGap,
    terraceBoundaries
  } = TOWER_CONFIG;

  const arcStep = posterWidth + horizontalGap;
  const baseRadius = (initialSlotsPerTurn * arcStep) / (2 * Math.PI);
  const topRadius = baseRadius * (1 - taper);
  const radialStep = (baseRadius - topRadius) / (totalSlots - 1);

  const slots: THREE.Matrix4[] = [];
  const slotPositions: Array<{ radius: number; theta: number; y: number }> = [];
  let theta = 0;
  let y = posterHeight / 2 + 0.12;
  let totalTurns = 0;
  const initialY = y;

  for (let i = 0; i < totalSlots; i++) {
    const radius = baseRadius - i * radialStep;
    slotPositions.push({ radius, theta, y });

    slots.push(new THREE.Matrix4().compose(
      new THREE.Vector3(radius * Math.cos(theta), y, radius * Math.sin(theta)),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta + Math.PI / 2, 0)),
      new THREE.Vector3(1, 1, 1)
    ));

    // Sabit yay aralığı: yarıçap küçüldükçe açısal adım büyür.
    const angularStep = arcStep / radius;
    theta += angularStep;
    totalTurns += angularStep / (2 * Math.PI);

    // Her tam turdaki yükselme poster yüksekliği + küçük dikey boşluktur.
    y += (posterHeight + turnGap) * angularStep / (2 * Math.PI);
  }

  const terraceRings = terraceBoundaries.map((boundary) => {
    const before = slotPositions[boundary - 1];
    const after = slotPositions[boundary];
    return {
      radius: (before.radius + after.radius) / 2,
      y: (before.y + after.y) / 2
    };
  });

  const bodyHeight = y;
  const totalRise = bodyHeight - initialY;

  // Zirve elemanı, spiral gövdenin bitiş yüksekliğinin üzerinde konumlanır.
  slots.push(new THREE.Matrix4().compose(
    new THREE.Vector3(0, bodyHeight + 0.95, 0),
    new THREE.Quaternion(),
    new THREE.Vector3(1, 1, 1)
  ));

  return {
    slots,
    terraceRings,
    bodyHeight,
    totalRise,
    totalTurns,
    baseRadius,
    topRadius,
    posterHeight
  };
}

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
  const layout = useMemo(() => createTowerLayout(), []);
  const accent = useMemo(() => new THREE.Color(BRONZE_TOWER.accentColor), []);
  const slotGeometry = useMemo(
    () => new THREE.BoxGeometry(TOWER_CONFIG.posterWidth, TOWER_CONFIG.posterHeight, 0.075),
    []
  );
  const slotMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
    metalness: 0.68,
    roughness: 0.38,
    emissive: accent,
    emissiveIntensity: 0.12
  }), [accent]);
  const terraceGeometry = useMemo(
    () => new THREE.TorusGeometry(1, 0.035, 8, 96),
    []
  );
  const terraceMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: BRONZE_TOWER.accentColor,
    metalness: 0.78,
    roughness: 0.3,
    emissive: BRONZE_TOWER.accentColor,
    emissiveIntensity: 0.18
  }), []);

  return (
    <group>
      <InstancedSlots matrices={layout.slots} geometry={slotGeometry} material={slotMaterial} />
      {layout.terraceRings.map((ring, index) => (
        <mesh
          key={index}
          geometry={terraceGeometry}
          material={terraceMaterial}
          position={[0, ring.y, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[ring.radius, ring.radius, ring.radius]}
        />
      ))}
    </group>
  );
}

export default function BabelTowerArchitecture() {
  const layout = useMemo(() => createTowerLayout(), []);
  const height = layout.bodyHeight + 0.95;
  const centerY = height / 2;
  const cameraDistance = height * 1.7;
  const radius = layout.baseRadius;

  return (
    <Canvas shadows dpr={[1, 1.7]}
      camera={{
        position: [
          cameraDistance * 0.72,
          centerY + cameraDistance * 0.42,
          cameraDistance * 0.9
        ],
        fov: 39
      }}>
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
        maxPolarAngle={Math.PI * 0.49} target={[0, centerY, 0]} />
    </Canvas>
  );
}
