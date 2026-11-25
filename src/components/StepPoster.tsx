import { useMemo } from "react";
import * as THREE from "three";

interface StepPosterProps {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  radius: number;
  depth: number;
  angularStep: number;
}

const BORDER = 0.045;
const PLATFORM_THICKNESS = 0.08;

function createPolarTrapezoid(
  centerRadius: number,
  innerRadius: number,
  outerRadius: number,
  halfAngle: number,
  inset: number
) {
  const shape = new THREE.Shape();
  const inner = innerRadius + inset;
  const outer = outerRadius - inset;
  const innerHalf = Math.max(0, halfAngle - inset / inner);
  const outerHalf = Math.max(0, halfAngle - inset / outer);
  const point = (r: number, angle: number): [number, number] => [
    r * Math.cos(angle) - centerRadius,
    r * Math.sin(angle)
  ];

  const innerLeft = point(inner, -innerHalf);
  const innerRight = point(inner, innerHalf);
  const outerRight = point(outer, outerHalf);
  const outerLeft = point(outer, -outerHalf);

  shape.moveTo(...innerLeft);
  shape.lineTo(...innerRight);
  shape.lineTo(...outerRight);
  shape.lineTo(...outerLeft);
  shape.closePath();
  return shape;
}

export default function StepPoster({
  index,
  position,
  rotation,
  radius,
  depth,
  angularStep
}: StepPosterProps) {
  const innerRadius = radius - depth / 2;
  const outerRadius = radius + depth / 2;
  const halfAngle = angularStep / 2;

  const platformGeometry = useMemo(() => {
    const shape = createPolarTrapezoid(
      radius, innerRadius, outerRadius, halfAngle, 0
    );
    return new THREE.ExtrudeGeometry(shape, {
      depth: PLATFORM_THICKNESS,
      bevelEnabled: false,
      curveSegments: 1
    });
  }, [radius, innerRadius, outerRadius, halfAngle]);

  const posterGeometry = useMemo(() => {
    const shape = createPolarTrapezoid(
      radius, innerRadius, outerRadius, halfAngle, BORDER
    );
    return new THREE.ShapeGeometry(shape);
  }, [radius, innerRadius, outerRadius, halfAngle]);

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
          side={THREE.DoubleSide}
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
