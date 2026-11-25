import { useMemo } from "react";
import * as THREE from "three";

interface StepPosterProps {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  depth: number;
}

const BORDER = 0.05;
const PLATFORM_THICKNESS = 0.08;

export default function StepPoster({
  index,
  position,
  rotation,
  width,
  depth
}: StepPosterProps) {
  // Local X is radial depth; local Y becomes tangential width after mesh rotation.
  const platformGeometry = useMemo(() => {
    const halfRadialDepth = depth / 2;
    const halfTangentialWidth = width / 2;
    const shape = new THREE.Shape();

    shape.moveTo(-halfRadialDepth, -halfTangentialWidth);
    shape.lineTo(halfRadialDepth, -halfTangentialWidth);
    shape.lineTo(halfRadialDepth, halfTangentialWidth);
    shape.lineTo(-halfRadialDepth, halfTangentialWidth);
    shape.closePath();

    const opening = new THREE.Path();
    opening.moveTo(-halfRadialDepth + BORDER, -halfTangentialWidth + BORDER);
    opening.lineTo(-halfRadialDepth + BORDER, halfTangentialWidth - BORDER);
    opening.lineTo(halfRadialDepth - BORDER, halfTangentialWidth - BORDER);
    opening.lineTo(halfRadialDepth - BORDER, -halfTangentialWidth + BORDER);
    opening.closePath();
    shape.holes.push(opening);

    return new THREE.ExtrudeGeometry(shape, {
      depth: PLATFORM_THICKNESS,
      bevelEnabled: false,
      curveSegments: 1
    });
  }, [width, depth]);

  const posterGeometry = useMemo(
    () => new THREE.PlaneGeometry(depth - BORDER * 2, width - BORDER * 2),
    [width, depth]
  );

  const posterColor = useMemo(() => {
    const hue = (index * 0.61803398875) % 1;
    return new THREE.Color().setHSL(hue, 0.48, 0.46);
  }, [index]);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        geometry={platformGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#cd7f32"
          metalness={0.72}
          roughness={0.34}
        />
      </mesh>

      <mesh
        geometry={posterGeometry}
        position={[0, PLATFORM_THICKNESS + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={posterColor}
          roughness={0.78}
          metalness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
