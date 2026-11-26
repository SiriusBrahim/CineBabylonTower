import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import StepPoster from "./StepPoster";
import { usePosterSequence } from "./PosterSequence";

const STAIRCASE_CONFIG = {
  totalSteps: 10,
  stepWidth: 2.55,
  stepDepth: 1.35,
  stepHeight: 0.58,
  cameraPosition: [0, 4.1, 8.2] as [number, number, number],
  cameraFov: 42,
  turnPerStep: THREE.MathUtils.degToRad(1.5)
};

interface StaircaseModelProps {
  activeStep: number;
}

function StaircaseModel({ activeStep }: StaircaseModelProps) {
  const sequence = usePosterSequence(STAIRCASE_CONFIG.totalSteps);
  const staircaseRef = useRef<THREE.Group>(null);

  const visibleSteps = useMemo(
    () => sequence.filter(({ index }) => index <= activeStep),
    [sequence, activeStep]
  );

  useFrame((_, delta) => {
    if (!staircaseRef.current) return;
    const targetRotation = activeStep * STAIRCASE_CONFIG.turnPerStep;
    staircaseRef.current.rotation.y = THREE.MathUtils.damp(
      staircaseRef.current.rotation.y,
      targetRotation,
      4.5,
      delta
    );
  });

  return (
    <group ref={staircaseRef}>
      {visibleSteps.map(({ index }) => (
        <StepPoster
          key={index}
          index={index}
          width={STAIRCASE_CONFIG.stepWidth}
          depth={STAIRCASE_CONFIG.stepDepth}
          position={[
            0,
            (index - activeStep) * STAIRCASE_CONFIG.stepHeight,
            (activeStep - index) * STAIRCASE_CONFIG.stepDepth
          ]}
        />
      ))}
    </group>
  );
}

export default function SpiralStaircase() {
  const [activeStep, setActiveStep] = useState(0);
  const maxStep = STAIRCASE_CONFIG.totalSteps - 1;
  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(maxStep, step)));
  }, [maxStep]);

  return (
    <section className="staircase-stage" aria-label="Poster staircase">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{
          position: STAIRCASE_CONFIG.cameraPosition,
          fov: STAIRCASE_CONFIG.cameraFov,
          near: 0.1,
          far: 60
        }}
      >
        <color attach="background" args={["#090b12"]} />
        <ambientLight intensity={0.68} />
        <hemisphereLight args={["#dce5f4", "#17131a", 0.28]} />
        <directionalLight
          position={[5, 9, 6]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
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
