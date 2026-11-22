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
  horizontalGap: 0.10,
  verticalGap: 0.08,
  rowsPerFloor: 3,
  slotsByFloor: [36, 33, 30] as const,
  segmentsByFloor: [12, 11, 10] as const,
  // 10 posteri 0.92 genişlik + 0.10 boşlukla çakışmadan taşıyabilmek
  // için üst kat yarıçapı 1.30 yerine 1.67 seçildi.
  radiusByFloor: [2.5, 1.9, 1.67] as const,
  floorGap: 0.5,
  crownExtraGap: 0.5
};
type TerraceRing = {
  radius: number;
  y: number;
};

function createTowerLayout() {
  const {
    posterHeight,
    verticalGap,
    rowsPerFloor,
    segmentsByFloor,
    radiusByFloor,
    floorGap,
    crownExtraGap
  } = TOWER_CONFIG;

  const rowHeight = posterHeight + verticalGap;
  const floorHeight = rowsPerFloor * rowHeight + floorGap;
  const slots: THREE.Matrix4[] = [];
  const terraceRings: TerraceRing[] = [];

  segmentsByFloor.forEach((segments, floorIndex) => {
    const radius = radiusByFloor[floorIndex];
    const floorBaseY = floorIndex * floorHeight;

    // Her kat 3 ardışık spiral sıradan oluşur. Her yeni sıranın açısı
    // yarım segment kadar kaydırılır; böylece sıralar üst üste halka gibi
    // görünmek yerine birbirine şaşırtmalı biçimde bağlanır.
    for (let slotIndex = 0; slotIndex < segments * rowsPerFloor; slotIndex++) {
      const row = Math.floor(slotIndex / segments);
      const segment = slotIndex % segments;
      const rowPhase = row * (Math.PI / 12);
      const theta = (segment * 2 * Math.PI) / segments + rowPhase;
      const y = floorBaseY + posterHeight / 2 + row * rowHeight;

      const position = new THREE.Vector3(
        radius * Math.cos(theta),
        y,
        radius * Math.sin(theta)
      );
      const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, -theta + Math.PI / 2, 0)
      );

      slots.push(new THREE.Matrix4().compose(
        position,
        rotation,
        new THREE.Vector3(1, 1, 1)
      ));
    }

    // Katlar arasında belirgin teras boşluğu ve iki katın arasında
    // yarıçapı kademeli bağlayan yatay bronz korniş.
    if (floorIndex < segmentsByFloor.length - 1) {
      terraceRings.push({
        radius: (radius + radiusByFloor[floorIndex + 1]) / 2,
        y: floorBaseY + rowsPerFloor * rowHeight + floorGap / 2
      });
    }
  });

  const lastFloorBaseY = (segmentsByFloor.length - 1) * floorHeight;
  const lastFloorTop = lastFloorBaseY
    + posterHeight / 2
    + (rowsPerFloor - 1) * rowHeight
    + posterHeight / 2;
  const crownY = lastFloorTop + crownExtraGap + posterHeight / 2;

  // Dördüncü kat: merkezde tek taç slotu.
  slots.push(new THREE.Matrix4().compose(
    new THREE.Vector3(0, crownY, 0),
    new THREE.Quaternion(),
    new THREE.Vector3(1, 1, 1)
  ));

  const bodyHeight = crownY + posterHeight / 2;
  const totalSlots = slots.length;

  return {
    slots,
    terraceRings,
    floorRadii: [...radiusByFloor],
    bodyHeight,
    totalSlots,
    baseRadius: radiusByFloor[0],
    topRadius: radiusByFloor[radiusByFloor.length - 1]
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
    () => new THREE.BoxGeometry(
      TOWER_CONFIG.posterWidth,
      TOWER_CONFIG.posterHeight,
      0.075
    ),
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
  const height = layout.bodyHeight;
  const centerY = height / 2;
  const radius = layout.baseRadius;
  const cameraDistance = height * 1.75;

  return (
    <Canvas shadows dpr={[1, 1.7]}
      camera={{
        position: [
          cameraDistance * 0.72,
          centerY + cameraDistance * 0.34,
          cameraDistance * 0.9
        ],
        fov: 39
      }}>
      <color attach="background" args={["#090b12"]} />
      <fog attach="fog" args={["#090b12", height * 1.7, height * 4.8]} />
      <ambientLight intensity={0.68} />
      <directionalLight position={[18, height * 1.25, 14]} intensity={2.0}
        castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-radius * 2, height * 0.55, -radius]}
        intensity={height * 0.1} color={BRONZE_TOWER.accentColor} />
      <pointLight position={[radius, height * 0.9, radius * 1.5]}
        intensity={height * 0.065} color="#9eb7ff" />
      <BronzeTowerModel />
      <Environment preset="city" />
      <OrbitControls makeDefault enableDamping dampingFactor={0.06}
        minDistance={radius * 1.3} maxDistance={height * 3.5}
        maxPolarAngle={Math.PI * 0.49} target={[0, centerY, 0]} />
    </Canvas>
  );
}
