import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import StepPoster from "./StepPoster";
import StaircaseCamera from "./StaircaseCamera";
import { usePosterSequence } from "./PosterSequence";

const STAIRCASE_CONFIG = {
  totalSteps: 10,
  radius: 2.5,
  stepHeight: 0.8,
  stepDepth: 1.0,
  totalTurn: (196 * Math.PI) / 180,
  startAngle: 0,
  cameraPolarAngle: Math.PI / 4,
  cameraDistance: 2.5 * 4,
  cameraFov: 38
};

// Each tread spans one equal angular sector; neighboring trapezoids share radial edges.
const ANGULAR_STEP = STAIRCASE_CONFIG.totalTurn / STAIRCASE_CONFIG.totalSteps;

interface StepData {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  theta: number;
}

function StaircaseScene() {
  const sequence = usePosterSequence(STAIRCASE_CONFIG.totalSteps);
  const steps = useMemo<StepData[]>(
    () => sequence.map(({ index }): StepData => {
      const theta = STAIRCASE_CONFIG.startAngle + index * ANGULAR_STEP;
      return {
        index,
        position: [
          STAIRCASE_CONFIG.radius * Math.cos(theta),
          -index * STAIRCASE_CONFIG.stepHeight,
          STAIRCASE_CONFIG.radius * Math.sin(theta)
        ],
        rotation: [0, -theta, 0],
        theta
      };
    }),
    [sequence]
  );

  return (
    <>
      <color attach="background" args={["#090b12"]} />
      <ambientLight intensity={0.72} />
      <directionalLight
        position={[7, 10, 5]}
        intensity={1.45}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#d9e2f2", "#17131a", 0.35]} />
      {steps.map((step) => (
        <StepPoster
          key={step.index}
          index={step.index}
          position={step.position}
          rotation={step.rotation}
          radius={STAIRCASE_CONFIG.radius}
          depth={STAIRCASE_CONFIG.stepDepth}
          angularStep={ANGULAR_STEP}
        />
      ))}
      <StaircaseCamera
        polarAngle={STAIRCASE_CONFIG.cameraPolarAngle}
        distance={STAIRCASE_CONFIG.cameraDistance}
        targetY={-((STAIRCASE_CONFIG.totalSteps - 1) * STAIRCASE_CONFIG.stepHeight) / 2}
      />
    </>
  );
}

export default function SpiralStaircase() {
  const targetY = -((STAIRCASE_CONFIG.totalSteps - 1) * STAIRCASE_CONFIG.stepHeight) / 2;
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [
          STAIRCASE_CONFIG.cameraDistance * Math.sin(STAIRCASE_CONFIG.cameraPolarAngle),
          targetY + STAIRCASE_CONFIG.cameraDistance * Math.cos(STAIRCASE_CONFIG.cameraPolarAngle),
          0
        ],
        fov: STAIRCASE_CONFIG.cameraFov,
        near: 0.1,
        far: 100
      }}
    >
      <StaircaseScene />
    </Canvas>
  );
}
