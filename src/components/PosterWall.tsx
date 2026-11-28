import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

const POSTER_COUNT = 100;
const POSTER_WIDTH = 1.22;
const POSTER_HEIGHT = 1.82;
const POSTER_THICKNESS = 0.1;
const POSTER_GAP = 0.22;

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

// Merdivenin tüm köşelerinin X/Y/Z sınırlarından sahne merkezini hesapla.
// Böylece başlangıç noktasına göre değil, 100 basamağın tamamına göre ortalanır.
const SPIRAL_BOUNDS = SPIRAL_SLOT_POINTS.flatMap((slot) => slot).reduce(
  (bounds, point) => ({
    minX: Math.min(bounds.minX, point[0]),
    maxX: Math.max(bounds.maxX, point[0]),
    minY: Math.min(bounds.minY, point[1]),
    maxY: Math.max(bounds.maxY, point[1]),
    minZ: Math.min(bounds.minZ, point[2]),
    maxZ: Math.max(bounds.maxZ, point[2]),
  }),
  {
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity,
    minZ: Infinity, maxZ: -Infinity,
  },
);

const SPIRAL_CENTER = {
  x: (SPIRAL_BOUNDS.minX + SPIRAL_BOUNDS.maxX) / 2,
  y: (SPIRAL_BOUNDS.minY + SPIRAL_BOUNDS.maxY) / 2,
  z: (SPIRAL_BOUNDS.minZ + SPIRAL_BOUNDS.maxZ) / 2,
};

function toWorldPoint(point: Point3): Point3 {
  // X/Y/Z eksenlerinde tüm 100 basamağın geometrik merkezini orijine taşı.
  // Z ekseni, sahnenin mevcut kamera yönüyle uyumlu olması için ters çevrilir.
  return [
    point[0] - SPIRAL_CENTER.x,
    point[1] - SPIRAL_CENTER.y,
    SPIRAL_CENTER.z - point[2],
  ];
}


const SPIRAL_SLOT_CENTERS = SPIRAL_SLOT_POINTS.map((slot) => {
  const worldPoints = slot.map(toWorldPoint);
  const center = worldPoints.reduce(
    (sum, point) => ({
      x: sum.x + point[0] / worldPoints.length,
      y: sum.y + point[1] / worldPoints.length,
      z: sum.z + point[2] / worldPoints.length,
    }),
    { x: 0, y: 0, z: 0 },
  );
  return new THREE.Vector3(center.x, center.y, center.z);
});

const STEP_TURN_RADIANS = SPIRAL_ANGLE;

function SpiralClimbControls() {
  const { camera, gl } = useThree();
  const targetStep = useRef(0);
  const currentStep = useRef(0);
  const dragState = useRef({ active: false, lastX: 0 });
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const element = gl.domElement;
    const clampStep = (value: number) =>
      THREE.MathUtils.clamp(value, 0, POSTER_COUNT - 1);

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragState.current = { active: true, lastX: event.clientX };
      element.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragState.current.active) return;
      const deltaX = event.clientX - dragState.current.lastX;
      dragState.current.lastX = event.clientX;
      // Sağa sürükleme pozitif yaw ve merdivende ileri hareket üretir.
      targetStep.current = clampStep(
        targetStep.current + (deltaX * 0.006) / STEP_TURN_RADIANS,
      );
    };
    const stopDragging = () => {
      dragState.current.active = false;
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      // Aşağı kaydırma tırmanır, yukarı kaydırma aynı rotadan geri indirir.
      targetStep.current = clampStep(
        targetStep.current + (event.deltaY * 0.002) / STEP_TURN_RADIANS,
      );
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      if (event.repeat) return;
      targetStep.current = clampStep(
        targetStep.current + (event.key === "ArrowRight" ? 1 : -1),
      );
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", stopDragging);
    element.addEventListener("pointercancel", stopDragging);
    element.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", stopDragging);
      element.removeEventListener("pointercancel", stopDragging);
      element.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gl]);

  useFrame((_, delta) => {
    // Smoothing is frame-rate independent; fractional step values follow the spiral arc.
    const smoothing = 1 - Math.exp(-8 * delta);
    currentStep.current += (targetStep.current - currentStep.current) * smoothing;

    const lowerIndex = Math.floor(currentStep.current);
    const upperIndex = Math.min(lowerIndex + 1, POSTER_COUNT - 1);
    const fraction = currentStep.current - lowerIndex;
    const from = SPIRAL_SLOT_CENTERS[lowerIndex];
    const to = SPIRAL_SLOT_CENTERS[upperIndex];

    cameraPosition.lerpVectors(from, to, fraction);
    cameraPosition.y += 1.6;

    // Bakış noktası rotanın 2.5 basamak ilerisinde ve hafifçe yukarıdadır.
    const lookStep = Math.min(currentStep.current + 2.5, POSTER_COUNT - 1);
    const lookLower = Math.floor(lookStep);
    const lookUpper = Math.min(lookLower + 1, POSTER_COUNT - 1);
    const lookFraction = lookStep - lookLower;
    lookTarget.lerpVectors(
      SPIRAL_SLOT_CENTERS[lookLower],
      SPIRAL_SLOT_CENTERS[lookUpper],
      lookFraction,
    );
    lookTarget.y += 0.35;

    camera.position.copy(cameraPosition);
    camera.lookAt(lookTarget);
  });

  return null;
}
\nfunction createSlotGeometry(points: SlotPoints) {
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
  const slotPoints = SPIRAL_SLOT_POINTS[index];
  const spiralGeometry = useMemo(
    () => createSlotGeometry(slotPoints),
    [slotPoints],
  );

  // İlk üç basamağın köşe etiketleri görünür; diğer basamaklar etiketsizdir.
  const showCornerLabels = index < 3;

  const labelPoints = showCornerLabels ? slotPoints.map(toWorldPoint) : [];
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

function PosterLine() {
  return (
    <group>
      {Array.from({ length: POSTER_COUNT }, (_, index) => (
        <Poster key={index} index={index} />
      ))}
    </group>
  );
}

export default function PosterWall() {
  return (
    <main className="poster-3d-page">
      <header className="poster-3d-header">
        <span className="eyebrow">CINE BABYLON TOWER · FOUNDATION</span>
        <h1>100 Poster · 3D View</h1>
        <p>Birinci şahıs sarmal tırmanış: sağa dönerek yüksel, sola dönerek aynı rotadan in.</p>
      </header>
      <div className="poster-3d-stage">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 0], fov: 72, near: 0.1, far: 500, up: [0, 1, 0] }}
        >
          <color attach="background" args={["#0b0d12"]} />
          <ambientLight intensity={1.25} />
          <directionalLight position={[-5, 18, 8]} intensity={2.1} castShadow />
          <pointLight position={[0, 8, -8]} intensity={12} color="#8c9fc9" />
          <PosterLine />
          <SpiralClimbControls />
        </Canvas>
      </div>
      <footer className="poster-3d-footer">
        <span>100 ADET</span>
        <span>X EKSENİ · YATAY DİZİLİM</span>
        <span>Sağa sürükle / → / aşağı kaydır: tırman · Sola sürükle / ← / yukarı kaydır: in</span>
      </footer>
    </main>
  );
}
