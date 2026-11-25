import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import StepPoster from "./StepPoster";
import StaircaseCamera from "./StaircaseCamera";
import { usePosterSequence } from "./PosterSequence";

const STAIRCASE_CONFIG = {
  totalSteps: 10,
  radius: 3.5,
  stepHeight: 0.15,
  stepDepth: 1.0,
  stepWidth: 0.95,
  angularStep: 0.3,
  startAngle: 0,
  cameraPolarAngle: Math.PI / 3,
  cameraDistance: 8
};

interface StepData {
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  theta: number;
}

function StaircaseScene() {
  const sequence = usePosterSequence(STAIRCASE_CONFIG.totalSteps);

  const steps = useMemo<StepData[]>(
    () =>
      sequence.map(({ index }) => {
        const theta =
          STAIRCASE_CONFIG.startAngle + index * STAIRCASE_CONFIG.angularStep;
        const y = -index * STAIRCASE_CONFIG.stepHeight;

        return {
          index,
          position: [
            STAIRCASE_CONFIG.radius * Math.cos(theta),
            y,
            STAIRCASE_CONFIG.radius * Math.sin(theta)
          ],
          rotation: [0, -theta + Math.PI / 2, 0],
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
          width={STAIRCASE_CONFIG.stepWidth}
          depth={STAIRCASE_CONFIG.stepDepth}
        />
      ))}

      <StaircaseCamera
        polarAngle={STAIRCASE_CONFIG.cameraPolarAngle}
        distance={STAIRCASE_CONFIG.cameraDistance}
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
        position: [
          STAIRCASE_CONFIG.cameraDistance *
            Math.sin(STAIRCASE_CONFIG.cameraPolarAngle),
          STAIRCASE_CONFIG.cameraDistance *
            Math.cos(STAIRCASE_CONFIG.cameraPolarAngle),
          0
        ],
        fov: 50,
        near: 0.1,
        far: 100
      }}
    >
      <StaircaseScene />
    </Canvas>
  );
}
