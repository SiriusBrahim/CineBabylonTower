import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { PosterNode3D, TowerBuildResult, TowerContent, TowerWalkway3D } from "../types/content";

function getPosterOpacity(node: PosterNode3D) {
  return node.isBlueprint ? 0.22 : node.isWatched ? 1 : 0.48;
}

function RemotePosterMaterial({ url, opacity, fallback }: { url: string; opacity: number; fallback: THREE.Texture }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    setTexture(null);
    const loader = new THREE.TextureLoader();
    const loadedTexture = loader.load(
      url,
      loaded => {
        if (disposed) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTexture(loaded);
      },
      undefined,
      () => {
        if (!disposed) setTexture(null);
      }
    );

    return () => {
      disposed = true;
      loadedTexture.dispose();
    };
  }, [url]);

  return <meshStandardMaterial map={texture ?? fallback} transparent opacity={opacity} side={THREE.DoubleSide} roughness={0.82} />;
}

function Poster({ node, content }: { node: PosterNode3D; content?: TowerContent }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 192;
    const ctx = canvas.getContext("2d")!;
    const hue = (node.index * 47) % 360;
    ctx.fillStyle = node.isBlueprint ? "#18202d" : `hsl(${hue} 42% 24%)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = node.isBlueprint ? "rgba(150,180,210,.22)" : "rgba(255,255,255,.10)";
    ctx.fillRect(7, 7, 114, 178);
    ctx.fillStyle = node.isBlueprint ? "#8fa1b8" : "#f5f1e9";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    const title = content?.title ?? (node.isFlag ? "CROWN" : "UNWRITTEN");
    const words = title.split(" ");
    let line = "";
    let y = 130;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > 104 && line) {
        ctx.fillText(line, 64, y);
        y += 15;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 64, y);
    ctx.font = "8px Arial";
    ctx.fillText(node.isBlueprint ? "POTENTIAL" : (content?.mediaType ?? "CINE").toUpperCase(), 64, 165);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [content, node.index, node.isBlueprint, node.isFlag]);

  useEffect(() => () => texture.dispose(), [texture]);

  const opacity = getPosterOpacity(node);
  return (
    <mesh position={node.position} rotation={node.rotation}>
      <planeGeometry args={[0.92, 1.38]} />
      {content?.posterUrl ? (
        <RemotePosterMaterial url={content.posterUrl} opacity={opacity} fallback={texture} />
      ) : (
        <meshStandardMaterial map={texture} transparent opacity={opacity} side={THREE.DoubleSide} roughness={0.82} />
      )}
    </mesh>
  );
}

function Walkway({ ring }: { ring: TowerWalkway3D }) {
  const centerRadius = (ring.innerRadius + ring.outerRadius) / 2;
  return (
    <group>
      <mesh position={[0, ring.y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[ring.innerRadius, ring.outerRadius, 96]} />
        <meshStandardMaterial color="#273246" metalness={0.72} roughness={0.42} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, ring.y + 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ring.outerRadius - 0.035, 0.025, 8, 128]} />
        <meshStandardMaterial color="#b89a66" metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0, ring.y + 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.max(0.05, centerRadius - (ring.outerRadius - ring.innerRadius) / 2 + 0.035), 0.018, 8, 128]} />
        <meshStandardMaterial color="#647b9e" metalness={0.65} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Tower({ build, content }: { build: TowerBuildResult; content: TowerContent[] }) {
  return (
    <group>
      {build.walkways.map(ring => <Walkway key={ring.floorIndex} ring={ring} />)}
      {build.nodes.map(node => <Poster key={node.index} node={node} content={content[node.index]} />)}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <cylinderGeometry args={[build.baseRadius * 1.22, build.baseRadius * 1.3, 0.16, 64]} />
        <meshStandardMaterial color="#151c2b" metalness={0.5} roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function TowerScene({ build, content }: { build: TowerBuildResult; content: TowerContent[] }) {
  return (
    <Canvas camera={{ position: [0, build.maxHeight * 0.62, build.baseRadius * 3.8], fov: 42 }} dpr={[1, 1.5]} shadows>
      <color attach="background" args={["#090b12"]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[12, build.maxHeight, 10]} intensity={2.2} castShadow />
      <pointLight position={[-10, build.maxHeight * 0.5, -8]} intensity={35} color="#647cff" />
      <Stars radius={130} depth={55} count={1800} factor={3} fade speed={0.25} />
      <Tower build={build} content={content} />
      <gridHelper args={[100, 80, "#20283a", "#121927"]} position={[0, -0.18, 0]} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.07} minDistance={3} maxDistance={build.maxHeight * 5 + 20} target={[0, build.maxHeight * 0.45, 0]} />
    </Canvas>
  );
}