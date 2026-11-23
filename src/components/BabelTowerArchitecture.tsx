import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Text } from "@react-three/drei";
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
    const slotCenters: THREE.Vector3[] = [];
    const roadCenters: THREE.Vector3[] = [];
    const slotLabels: { position: THREE.Vector3; rotation: THREE.Euler; number: number }[] = [];
    let theta = 0;
    let y = posterHeight / 2 + 0.12;

    for (let i = 0; i < totalSlots; i++) {
      const radius = baseRadius - i * radialStep;
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);

      const slotCenter = new THREE.Vector3(x, y, z);
      slotCenters.push(slotCenter.clone());
      const slotRotation = new THREE.Euler(0, -theta + Math.PI / 2, 0);
      slots.push(new THREE.Matrix4().compose(
        slotCenter,
        new THREE.Quaternion().setFromEuler(slotRotation),
        new THREE.Vector3(1, 1, 1)
      ));

      // Numarayı posterin ön yüzüne, yüzeyden çok az dışarıda yerleştir.
      const frontNormal = new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta));
      slotLabels.push({
        position: new THREE.Vector3(x, y, z).addScaledVector(frontNormal, 0.045),
        rotation: slotRotation.clone(),
        number: i + 1
      });

      // Yol, posterlerin iç tarafındaki boşluğu izleyerek aynı spiral yükselişi takip eder.
      const roadRadius = radius - 0.82;
      roadCenters.push(new THREE.Vector3(
        roadRadius * Math.cos(theta),
        y + posterHeight * 0.58 + 0.12,
        roadRadius * Math.sin(theta)
      ));

      // Yatay ilerleme: her adımın yay uzunluğu arcStep olarak korunur.
      theta += arcStep / radius;

      // Dikey ilerleme yarıçapa bağlıdır; bir turdaki yükselme yaklaşık
      // posterHeight + turnGap olur ve üst katlarda sabit rise kullanılmaz.
      y += (posterHeight + turnGap) * arcStep / (2 * Math.PI * radius);
    }

    // Yol yüzeyini merkez hattı boyunca genişliği sabit bir şerit olarak üret.
    const roadPositions: number[] = [];
    const roadIndices: number[] = [];
    const roadHalfWidth = 0.38;

    for (let i = 0; i < roadCenters.length; i++) {
      const previous = roadCenters[Math.max(0, i - 1)];
      const next = roadCenters[Math.min(roadCenters.length - 1, i + 1)];
      const tangent = next.clone().sub(previous).normalize();
      const radial = new THREE.Vector3(roadCenters[i].x, 0, roadCenters[i].z).normalize();
      const side = radial.addScaledVector(tangent, -radial.dot(tangent)).normalize();
      const left = roadCenters[i].clone().addScaledVector(side, roadHalfWidth);
      const right = roadCenters[i].clone().addScaledVector(side, -roadHalfWidth);

      roadPositions.push(left.x, left.y, left.z, right.x, right.y, right.z);

      if (i < roadCenters.length - 1) {
        const a = i * 2;
        roadIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const roadGeometry = new THREE.BufferGeometry();
    roadGeometry.setAttribute("position", new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeometry.setIndex(roadIndices);
    roadGeometry.computeVertexNormals();

    // Slotların altından aşağı sarkan, aynı helis hattını izleyen saydam mavi duvar.
    const wallPositions: number[] = [];
    const wallIndices: number[] = [];
    const wallTopOffset = posterHeight * 0.5 + 0.025;
    const wallDrop = 1.35;
    for (let i = 0; i < slotCenters.length; i++) {
      const center = slotCenters[i];
      const radial = new THREE.Vector3(center.x, 0, center.z).normalize();
      const wallCenter = center.clone().addScaledVector(radial, -0.085);
      const top = wallCenter.clone();
      top.y -= wallTopOffset;
      const bottom = top.clone();
      bottom.y -= wallDrop;
      wallPositions.push(top.x, top.y, top.z, bottom.x, bottom.y, bottom.z);

      if (i < slotCenters.length - 1) {
        const index = i * 2;
        wallIndices.push(index, index + 1, index + 2, index + 1, index + 3, index + 2);
      }
    }

    const wallGeometry = new THREE.BufferGeometry();
    wallGeometry.setAttribute("position", new THREE.Float32BufferAttribute(wallPositions, 3));
    wallGeometry.setIndex(wallIndices);
    wallGeometry.computeVertexNormals();

    const bodyHeight = y;
    const crownPosition = new THREE.Vector3(0, bodyHeight + 0.95, 0);
    slots.push(new THREE.Matrix4().compose(
      crownPosition,
      new THREE.Quaternion(),
      new THREE.Vector3(1, 1, 1)
    ));
    slotLabels.push({
      position: crownPosition.clone().add(new THREE.Vector3(0, 0, 0.045)),
      rotation: new THREE.Euler(0, 0, 0),
      number: 100
    });

    return { slots, slotLabels, roadGeometry, wallGeometry, bodyHeight, baseRadius, topRadius };
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
  const roadMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#343943",
    metalness: 0.42,
    roughness: 0.72,
    side: THREE.DoubleSide
  }), []);
  const wallMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#168cff",
    metalness: 0.18,
    roughness: 0.24,
    transparent: true,
    opacity: 0.34,
    transmission: 0.12,
    thickness: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false
  }), []);

  return (
    <group>
      <mesh geometry={dims.wallGeometry} material={wallMaterial} />
      <InstancedSlots matrices={dims.slots} geometry={slotGeometry} material={slotMaterial} />
      {dims.slotLabels.map((label) => (
        <Text
          key={label.number}
          position={label.position}
          rotation={label.rotation}
          fontSize={0.24}
          color="#ffffff"
          outlineColor="#090b12"
          outlineWidth={0.012}
          anchorX="center"
          anchorY="middle"
          renderOrder={2}
        >
          {label.number}
        </Text>
      ))}
      <mesh geometry={dims.roadGeometry} material={roadMaterial} castShadow receiveShadow />
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
      camera={{ position: [radius * 3.3, height * 1.8, radius * 4.8], fov: 50 }}>
      <color attach="background" args={["#090b12"]} />
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
