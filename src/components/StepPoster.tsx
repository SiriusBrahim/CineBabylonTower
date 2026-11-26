import { useMemo } from "react";
import * as THREE from "three";

interface StepPosterProps {
  index: number;
  position: [number, number, number];
  width: number;
  depth: number;
}

const PLATFORM_HEIGHT = 0.16;
const POSTER_INSET = 0.09;

export default function StepPoster({
  index,
  position,
  width,
  depth
}: StepPosterProps) {
  const posterColor = useMemo(() => {
    const hue = (index * 0.61803398875) % 1;
    return new THREE.Color().setHSL(hue, 0.42, 0.42);
  }, [index]);

  return (
    <group position={position}>
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
