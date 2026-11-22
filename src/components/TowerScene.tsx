import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { TowerBuildResult, TowerContent } from "../types/content";

function Poster({ node, content }: { node: TowerBuildResult["nodes"][number]; content?: TowerContent }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 384;
    const ctx = canvas.getContext("2d")!;
    const hue = (node.index * 47) % 360;
    ctx.fillStyle = node.isBlueprint ? "#18202d" : `hsl(${hue} 42% 24%)`;
    ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = node.isBlueprint ? "rgba(150,180,210,.22)" : "rgba(255,255,255,.10)";
    ctx.fillRect(14, 14, 228, 356);
    ctx.fillStyle = node.isBlueprint ? "#8fa1b8" : "#f5f1e9";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    const title = content?.title ?? (node.isFlag ? "CROWN" : "UNWRITTEN");
    const words = title.split(" ");
    let line = ""; let y = 260;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > 210 && line) { ctx.fillText(line, 128, y); y += 27; line = word; }
      else line = test;
    }
    if (line) ctx.fillText(line, 128, y);
    ctx.font = "13px Arial"; ctx.fillText(node.isBlueprint ? "POTENTIAL" : (content?.mediaType ?? "CINE").toUpperCase(), 128, 330);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [content, node.index, node.isBlueprint, node.isFlag]);
  return (
    <mesh position={node.position} rotation={node.rotation}>
      <planeGeometry args={[0.92, 1.38]} />
      <meshStandardMaterial map={texture} transparent opacity={node.isBlueprint ? 0.22 : node.isWatched ? 1 : 0.48} side={THREE.DoubleSide} roughness={0.82} />
    </mesh>
  );
}

function Tower({ build, content }: { build: TowerBuildResult; content: TowerContent[] }) {
  return <group>
    {build.nodes.map(node => <Poster key={node.index} node={node} content={content[node.index]} />)}
    <mesh position={[0, -0.08, 0]} receiveShadow>
      <cylinderGeometry args={[build.baseRadius * 1.22, build.baseRadius * 1.3, 0.16, 64]} />
      <meshStandardMaterial color="#151c2b" metalness={0.5} roughness={0.6} />
    </mesh>
  </group>;
}

export default function TowerScene({ build, content }: { build: TowerBuildResult; content: TowerContent[] }) {
  return <Canvas camera={{ position: [0, build.maxHeight * 0.62, build.baseRadius * 3.8], fov: 42 }} dpr={[1, 1.7]} shadows>
    <color attach="background" args={["#090b12"]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[12, build.maxHeight, 10]} intensity={2.2} castShadow />
    <pointLight position={[-10, build.maxHeight * 0.5, -8]} intensity={35} color="#647cff" />
    <Stars radius={130} depth={55} count={1800} factor={3} fade speed={0.25} />
    <Tower build={build} content={content} />
    <gridHelper args={[100, 80, "#20283a", "#121927"]} position={[0, -0.18, 0]} />
    <OrbitControls makeDefault enableDamping dampingFactor={0.07} minDistance={3} maxDistance={build.maxHeight * 5 + 20} target={[0, build.maxHeight * 0.45, 0]} />
  </Canvas>;
}