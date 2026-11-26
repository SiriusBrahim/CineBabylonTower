import { useMemo } from "react";
import * as THREE from "three";

interface StepPosterProps {
  index: number;
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
}

const PLATFORM_HEIGHT = 0.14;
const POSTER_INSET = 0.08;

export default function StepPoster({
  index,
  position,
  rotation,
  width,
  depth
}: StepPosterProps) {
  const posterColor = useMemo(() => {
    const hue = (index * 0.61803398875) % 1;
    return new THREE.Color().setHSL(hue, 0.42, 0.42);
  }, [index]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh
        position={[0, -PLATFORM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, PLATFORM_HEIGHT, depth]} />
        <meshStandardMaterial
          color="#a66b35"
          metalness={0.58}
          roughness={0.42}
        />
      </mesh>
      {/* Poster slot lies flat on the horizontal tread surface. */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <boxGeometry
          args={[
            width - POSTER_INSET * 2,
            0.012,
            depth - POSTER_INSET * 2
          ]}
        />
        <meshStandardMaterial
          color={posterColor}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}
