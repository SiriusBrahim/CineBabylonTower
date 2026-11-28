import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const POSTER_COUNT = 100;
const POSTER_WIDTH = 1.22;
const POSTER_HEIGHT = 1.82;
const POSTER_THICKNESS = 0.1;
const POSTER_GAP = 0.22;
const SPACING = POSTER_WIDTH + POSTER_GAP;

function createPosterTexture(index: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext("2d")!;
  const hue = (index * 37) % 360;

  const gradient = ctx.createLinearGradient(0, 0, 220, 384);
  gradient.addColorStop(0, `hsl(${hue}, 48%, 42%)`);
  gradient.addColorStop(1, `hsl(${(hue + 34) % 360}, 52%, 9%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 384);

  ctx.strokeStyle = "rgba(255,255,255,.38)";
  ctx.lineWidth = 3;
  ctx.strokeRect(17, 17, 222, 350);

  ctx.fillStyle = "rgba(255,255,255,.78)";
  ctx.font = "18px Arial";
  ctx.fillText("CINEMA COLLECTION", 28, 48);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,.16)";
  ctx.beginPath();
  ctx.arc(128, 172, 82, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff4e5";
  ctx.font = "bold 27px Georgia";
  ctx.fillText("POSTER", 128, 292);
  ctx.font = "bold 34px Arial";
  ctx.fillText(String(index + 1).padStart(3, "0"), 128, 335);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const CORNER_LABELS = [
  { label: "A", x: -1, y: 1, z: -1 },
  { label: "B", x: 1, y: 1, z: -1 },
  { label: "C", x: 1, y: 1, z: 1 },
  { label: "D", x: -1, y: 1, z: 1 },
  { label: "E", x: -1, y: -1, z: -1 },
  { label: "F", x: 1, y: -1, z: -1 },
  { label: "G", x: 1, y: -1, z: 1 },
  { label: "H", x: -1, y: -1, z: 1 },
];

function toWorldPoint(point: [number, number, number]): [number, number, number] {
  // User coordinates are expressed relative to slot 1's A-H coordinate frame.
  // Map that frame onto slot 1's existing world-space position without moving slot 1.
  return [point[0] - 71.89, point[1] - 0.05, 0.91 - point[2]];
}

type Point3 = [number, number, number];
type SlotPoints = [Point3, Point3, Point3, Point3, Point3, Point3, Point3, Point3];

const SPIRAL_ANGLE = Math.asin(POSTER_GAP / POSTER_HEIGHT);

/**
 * Slot 1'in B köşesinden başlayarak 2–100 arasındaki bütün basamakları
 * formülden üretir. Koordinatlar ara adımlarda yuvarlanmaz.
 *
 * Köşe sırası: A, B, C, D (üst); E, F, G, H (alt).
 */
function generateSpiralSlots(): SlotPoints[] {
  const slots: SlotPoints[] = [];

  // Slot 1, kullanıcının verdiği koordinat sisteminde sabit başlangıçtır.
  const slot1: SlotPoints = [
    [0, 0.1, 1.82], [1.22, 0.1, 1.82],
    [1.22, 0.1, 0], [0, 0.1, 0],
    [0, 0, 1.82], [1.22, 0, 1.82],
    [1.22, 0, 0], [0, 0, 0],
  ];
  slots.push(slot1);

  // E₂ = B₁. Her yeni E noktası önceki slotun hesaplanmış B noktasıdır.
  let pivot: Point3 = [...slot1[1]];

  for (let n = 2; n <= POSTER_COUNT; n += 1) {
    const alpha = (n - 1) * SPIRAL_ANGLE;
    const cos = Math.cos(alpha);
    const sin = Math.sin(alpha);

    const right: Point3 = [cos, 0, sin];
    const back: Point3 = [sin, 0, -cos];

    const E: Point3 = [pivot[0], (n - 1) * POSTER_THICKNESS, pivot[2]];
    const F: Point3 = [
      E[0] + POSTER_WIDTH * right[0],
      E[1],
      E[2] + POSTER_WIDTH * right[2],
    ];
    const H: Point3 = [
      E[0] + POSTER_HEIGHT * back[0],
      E[1],
      E[2] + POSTER_HEIGHT * back[2],
    ];
    const G: Point3 = [
      F[0] + POSTER_HEIGHT * back[0],
      E[1],
      F[2] + POSTER_HEIGHT * back[2],
    ];

    const lift = POSTER_THICKNESS;
    const A: Point3 = [E[0], E[1] + lift, E[2]];
    const B: Point3 = [F[0], F[1] + lift, F[2]];
    const C: Point3 = [G[0], G[1] + lift, G[2]];
    const D: Point3 = [H[0], H[1] + lift, H[2]];

    slots.push([A, B, C, D, E, F, G, H]);

    // Bir sonraki basamağın E noktası bu B ile birebir aynı değerleri alır.
    pivot = B;
  }

  return slots;
}

const SPIRAL_SLOT_POINTS = generateSpiralSlots();

function createSlotGeometry(points: SlotPoints) {
  const geometry = new THREE.BufferGeometry();
  const vertices = points.map(toWorldPoint);
  const positions = vertices.flat();
  const uvs = [
    0, 1, 1, 1, 1, 0, 0, 0,
    0, 1, 1, 1, 1, 0, 0, 0,
  ];
  const indices = [
    0, 2, 1, 0, 3, 2, // üst yüzey
    4, 6, 5, 4, 7, 6, // alt yüzey
    0, 4, 5, 0, 5, 1, // ön yüz
    1, 5, 6, 1, 6, 2, // sağ yüz
    2, 6, 7, 2, 7, 3, // arka yüz
    3, 7, 4, 3, 4, 0, // sol yüz
  ];

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.addGroup(0, 6, 1);
  geometry.addGroup(6, 30, 0);
  geometry.computeVertexNormals();
  return geometry;
}

function Poster({ index }: { index: number }) {
  const texture = useMemo(() => createPosterTexture(index), [index]);
  const baseX = (index - (POSTER_COUNT - 1) / 2) * SPACING;
  const baseY = index * POSTER_THICKNESS;
  const slotPoints = SPIRAL_SLOT_POINTS[index];
  const spiralGeometry = useMemo(
    () => (index === 0 ? null : createSlotGeometry(slotPoints)),
    [index, slotPoints],
  );

  // İlk üç basamağın köşe etiketleri görünür; diğer basamaklar etiketsizdir.
  const showCornerLabels = index < 3;

  if (index > 0 && spiralGeometry) {
    const labelPoints = slotPoints.map(toWorldPoint);
    const labelOffsets = [
      [-0.045, 0.075, -0.045],
      [0.045, 0.075, -0.045],
      [0.045, 0.075, 0.045],
      [-0.045, 0.075, 0.045],
      [-0.045, -0.075, -0.045],
      [0.045, -0.075, -0.045],
      [0.045, -0.075, 0.045],
      [-0.045, -0.075, 0.045],
    ];

    return (
      <group>
        <mesh geometry={spiralGeometry} castShadow receiveShadow>
          <meshStandardMaterial attach="material-0" color="#24252b" metalness={0.18} roughness={0.72} />
          <meshStandardMaterial attach="material-1" map={texture} roughness={0.82} metalness={0.01} />
        </mesh>
        {showCornerLabels && labelPoints.map((point, i) => (
          <Billboard key={i} position={[
            point[0] + labelOffsets[i][0],
            point[1] + labelOffsets[i][1],
            point[2] + labelOffsets[i][2],
          ]}>
            <Text fontSize={0.12} color="#ffd98a" outlineColor="#17191f" outlineWidth={0.012} anchorX="center" anchorY="middle">
              {"ABCDEFGH"[i]}
            </Text>
          </Billboard>
        ))}
      </group>
    );
  }

  const x = baseX;
  const y = baseY;

  return (
    <group position={[x, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[POSTER_WIDTH, POSTER_THICKNESS, POSTER_HEIGHT]} />
        <meshStandardMaterial color="#24252b" metalness={0.18} roughness={0.72} />
      </mesh>
      <mesh position={[0, POSTER_THICKNESS / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[POSTER_WIDTH - 0.07, POSTER_HEIGHT - 0.07]} />
        <meshStandardMaterial map={texture} roughness={0.82} metalness={0.01} />
      </mesh>
      <mesh position={[0, -POSTER_THICKNESS / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[POSTER_WIDTH - 0.07, POSTER_HEIGHT - 0.07]} />
        <meshStandardMaterial color="#17191f" roughness={0.9} />
      </mesh>
      {showCornerLabels &&
        CORNER_LABELS.map(({ label, x: sx, y: sy, z: sz }) => {
          const offset = 0.075;
          const position: [number, number, number] = [
            sx * (POSTER_WIDTH / 2 + offset),
            sy * (POSTER_THICKNESS / 2 + offset),
            sz * (POSTER_HEIGHT / 2 + offset),
          ];

          return (
            <Billboard key={label} position={position}>
              <Text fontSize={0.12} color="#ffd98a" outlineColor="#17191f" outlineWidth={0.012} anchorX="center" anchorY="middle">
                {label}
              </Text>
            </Billboard>
          );
        })}
    </group>
  );
}

function PosterLine() {
  return (
    <group>
      {Array.from({ length: POSTER_COUNT }, (_, index) => (
        <Poster key={index} index={index} />
      ))}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[POSTER_COUNT * SPACING + 2, 0.12, POSTER_HEIGHT + 0.7]} />
        <meshStandardMaterial color="#292a30" metalness={0.35} roughness={0.72} />
      </mesh>
    </group>
  );
}

export default function PosterWall() {
  return (
    <main className="poster-3d-page">
      <header className="poster-3d-header">
        <span className="eyebrow">CINE BABYLON TOWER · FOUNDATION</span>
        <h1>100 Poster · 3D View</h1>
        <p>Posterler X ekseninde yatay; kamera Y ve Z yönlerinde serbestçe gezebilir.</p>
      </header>
      <div className="poster-3d-stage">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 18, 24], fov: 42, near: 0.1, far: 500, up: [0, 1, 0] }}
        >
          <color attach="background" args={["#0b0d12"]} />
          <ambientLight intensity={1.25} />
          <directionalLight position={[-5, 18, 8]} intensity={2.1} castShadow />
          <pointLight position={[0, 8, -8]} intensity={12} color="#8c9fc9" />
          <PosterLine />
          <OrbitControls
            makeDefault
            enableRotate
            enablePan
            enableZoom
            minPolarAngle={0.12}
            maxPolarAngle={Math.PI / 2 - 0.04}
            minDistance={5}
            maxDistance={180}
            rotateSpeed={0.65}
            panSpeed={0.8}
            zoomSpeed={0.9}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <footer className="poster-3d-footer">
        <span>100 ADET</span>
        <span>X EKSENİ · YATAY DİZİLİM</span>
        <span>Çevir: 3D açı · Kaydır: konum · Yakınlaştır: detay</span>
      </footer>
    </main>
  );
}
