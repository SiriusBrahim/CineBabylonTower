import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import StepPoster from "./StepPoster";
import { usePosterSequence } from "./PosterSequence";

const STAIRCASE_CONFIG = {
  totalSteps: 10,
  visibleLowerSteps: 4,
  stepWidth: 1.55,
  stepDepth: 0.98,
  stepHeight: 0.34,
  spiralRadius: 2.45,
  anglePerStep: (Math.PI * 2) / 10,
  cameraHeight: 13,
  cameraFov: 42
};

interface StaircaseModelProps {
  activeStep: number;
}

function StaircaseModel({ activeStep }: StaircaseModelProps) {
  const sequence = usePosterSequence(STAIRCASE_CONFIG.totalSteps);
  const staircaseRef = useRef<THREE.Group>(null);

  const visibleSteps = useMemo(() => {
    const firstVisible = Math.max(
      0,
      activeStep - STAIRCASE_CONFIG.visibleLowerSteps
    );
    return sequence.filter(
      ({ index }) => index >= firstVisible && index <= activeStep
    );
  }, [sequence, activeStep]);

  useFrame((_, delta) => {
    if (!staircaseRef.current) return;
    const targetRotation = -activeStep * STAIRCASE_CONFIG.anglePerStep;
    staircaseRef.current.rotation.y = THREE.MathUtils.damp(
      staircaseRef.current.rotation.y,
      targetRotation,
      5,
      delta
    );
  });

  return (
    <group ref={staircaseRef}>
      {visibleSteps.map(({ index }) => {
        const angle = index * STAIRCASE_CONFIG.anglePerStep;
        return (
          <StepPoster
            key={index}
            index={index}
            width={STAIRCASE_CONFIG.stepWidth}
            depth={STAIRCASE_CONFIG.stepDepth}
            rotation={angle}
            position={[
              Math.sin(angle) * STAIRCASE_CONFIG.spiralRadius,
              (index - activeStep) * STAIRCASE_CONFIG.stepHeight,
              Math.cos(angle) * STAIRCASE_CONFIG.spiralRadius
            ]}
          />
        );
      })}
    </group>
  );
}

function FixedTopDownCamera() {
  const { camera } = useThree();

  useEffect(() => {
    // The camera looks straight down the Y axis: exactly 90 degrees to the floor.
    camera.position.set(0, STAIRCASE_CONFIG.cameraHeight, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function SpiralStaircase() {
  const [activeStep, setActiveStep] = useState(0);
  const maxStep = STAIRCASE_CONFIG.totalSteps - 1;
  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(maxStep, step)));
  }, [maxStep]);

  return (
    <section className="staircase-stage" aria-label="Spiral poster staircase">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: [0, STAIRCASE_CONFIG.cameraHeight, 0],
          fov: STAIRCASE_CONFIG.cameraFov,
          near: 0.1,
          far: 60,
          up: [0, 0, -1]
        }}
      >
        <color attach="background" args={["#090b12"]} />
        <ambientLight intensity={0.72} />
        <hemisphereLight args={["#dce5f4", "#17131a", 0.3]} />
        <directionalLight
          position={[-3, 10, 4]}
          intensity={1.65}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <FixedTopDownCamera />
        <StaircaseModel activeStep={activeStep} />
      </Canvas>

      <aside className="step-navigator" aria-label="Basamak kontrolü">
        <button
          className="step-nav-button"
          type="button"
          onClick={() => goToStep(activeStep + 1)}
          disabled={activeStep === maxStep}
          aria-label="Sonraki basamak"
        >
          +
        </button>
        <div className="step-nav-track">
          <input
            aria-label="Basamak seç"
            type="range"
            min={0}
            max={maxStep}
            step={1}
            value={activeStep}
            onChange={(event) => goToStep(Number(event.target.value))}
          />
        </div>
        <button
          className="step-nav-button"
          type="button"
          onClick={() => goToStep(activeStep - 1)}
          disabled={activeStep === 0}
          aria-label="Önceki basamak"
        >
          −
        </button>
        <output className="step-counter">
          {activeStep + 1}/{STAIRCASE_CONFIG.totalSteps}
        </output>
      </aside>
    </section>
  );
}
