import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

const POSTER_COUNT = 100;
const POSTER_WIDTH = 1.22;
const POSTER_HEIGHT = 1.82;
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

function Poster({ index }: { index: number }) {
  const texture = useMemo(() => createPosterTexture(index), [index]);
  const x = (index - (POSTER_COUNT - 1) / 2) * SPACING;

  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[POSTER_WIDTH, POSTER_HEIGHT, 0.09]} />
        <meshStandardMaterial color="#24252b" metalness={0.28} roughness={0.48} />
      </mesh>
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[POSTER_WIDTH - 0.07, POSTER_HEIGHT - 0.07]} />
        <meshStandardMaterial map={texture} roughness={0.78} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, -0.051]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[POSTER_WIDTH - 0.07, POSTER_HEIGHT - 0.07]} />
        <meshStandardMaterial color="#17191f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PosterLine() {
  return (
    <group>
      {Array.from({ length: POSTER_COUNT }, (_, index) => (
        <Poster key={index} index={index} />
      ))}
      <mesh position={[0, -1.12, 0]} receiveShadow>
        <boxGeometry args={[POSTER_COUNT * SPACING + 2, 0.12, 1.2]} />
        <meshStandardMaterial color="#292a30" metalness={0.55} roughness={0.55} />
      </mesh>
    </group>
  );
}

export default function PosterWall() {
  return (
    <main className="poster-3d-page">
      <header className="poster-3d-header">
        <span className="eyebrow">CINE BABYLON TOWER · FOUNDATION</span>
        <h1>100 Poster · 3D Line</h1>
        <p>Posterler X ekseninde tek sıra halinde dizildi.</p>
      </header>
      <div className="poster-3d-stage">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 3.2, 25], fov: 42, near: 0.1, far: 500 }}
        >
          <color attach="background" args={["#0b0d12"]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[-5, 9, 12]} intensity={2.4} castShadow />
          <pointLight position={[0, 3, -8]} intensity={18} color="#8c9fc9" />
          <Stars radius={90} depth={45} count={900} factor={2} fade speed={0.15} />
          <PosterLine />
          <OrbitControls
            makeDefault
            enableRotate={false}
            enablePan
            enableZoom
            minDistance={8}
            maxDistance={90}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <footer className="poster-3d-footer">
        <span>100 ADET</span>
        <span>X EKSENİ · TEK SIRA</span>
        <span>Yatay kaydır / yakınlaştır</span>
      </footer>
    </main>
  );
}
