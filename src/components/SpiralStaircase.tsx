import { useCallback, useMemo, useState } from "react";
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
  cameraHeight: 1.8,
  cameraPolarOffsetDegrees: 7,
  cameraFov: 38
};

// Preserve the verified trapezoid geometry: each tread owns one equal angular sector.
const ANGULAR_STEP = STAIRCASE_CONFIG.totalTurn / STAIRCASE_CONFIG.totalSteps;

interface StepData {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  theta: number;
}

function StaircaseScene() {
  const sequence = usePosterSequence(STAIRCASE_CONFIG.totalSteps);
  const [activeStep, setActiveStep] = useState(0);
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
  const handleStepChange = useCallback((direction: number) => {
    setActiveStep((current) =>
      Math.max(0, Math.min(STAIRCASE_CONFIG.totalSteps - 1, current + direction))
    );
  }, []);

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
        steps={steps}
        activeStep={activeStep}
        onStepChange={handleStepChange}
        cameraHeight={STAIRCASE_CONFIG.cameraHeight}
        polarOffsetDegrees={STAIRCASE_CONFIG.cameraPolarOffsetDegrees}
      />
    </>
  );
}

export default function SpiralStaircase() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [2.5, STAIRCASE_CONFIG.cameraHeight, 0],
        fov: STAIRCASE_CONFIG.cameraFov,
        near: 0.1,
        far: 100
      }}
    >
      <StaircaseScene />
    </Canvas>
  );
}
