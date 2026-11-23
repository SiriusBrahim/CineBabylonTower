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
    const horizontalGap = 0.04;
    const arcStep = posterWidth + horizontalGap;

    const unitsByRing = [12, 11, 10];
    const rowsPerRing = 3;
    const totalSlots = unitsByRing.reduce((sum, units) => sum + units * rowsPerRing, 0);

    // Babel silüeti için tabandan tepeye güçlü ve kontrollü daralma.
    const taper = 0.56;
    const turnGap = 0.65;
    const baseRadius = (arcStep / (2 * Math.sin(Math.PI / unitsByRing[0]))) * 5.0;
    const topRadius = baseRadius * (1 - taper);
    const radialStep = (baseRadius - topRadius) / (totalSlots - 1);

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

      // Yatay ilerleme: her adımın yay uzunluğu arcStep olarak korunur.
      theta += arcStep / radius;

      // Dikey ilerleme yarıçapa bağlıdır; bir turdaki yükselme yaklaşık
      // posterHeight + turnGap olur ve üst katlarda sabit rise kullanılmaz.
      y += (posterHeight + turnGap) * arcStep / (2 * Math.PI * radius);
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
  const arcStep = posterWidth + 0.04;
  const unitsByRing = [12, 11, 10];
  const rowsPerRing = 3;
  const totalSlots = unitsByRing.reduce((sum, units) => sum + units * rowsPerRing, 0);
  const taper = 0.56;
  const turnGap = 0.65;
  const baseRadius = (arcStep / (2 * Math.sin(Math.PI / unitsByRing[0]))) * 5.0;
  const topRadius = baseRadius * (1 - taper);
  const radialStep = (baseRadius - topRadius) / (totalSlots - 1);

  // Kamera yüksekliğini modelde kullanılan değişken yükselme adımlarıyla eşleştir.
  let bodyHeight = posterHeight / 2 + 0.12;
  for (let i = 0; i < totalSlots; i++) {
    const slotRadius = baseRadius - i * radialStep;
    bodyHeight += (posterHeight + turnGap) * arcStep / (2 * Math.PI * slotRadius);
  }
  const height = bodyHeight + 0.95;
  const radius = baseRadius;

  return (
    <Canvas shadows dpr={[1, 1.7]}
      camera={{ position: [radius * 5.5, height * 2.875, radius * 8.0], fov: 39 }}>
      <color attach="background" args={["#090b12"]} />
      <fog attach="fog" args={["#090b12", height * 10, height * 24]} />
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
        minDistance={radius * 3.25} maxDistance={height * 18}
        maxPolarAngle={Math.PI * 0.49} target={[0, height * 0.48, 0]} />
    </Canvas>
  );
}
