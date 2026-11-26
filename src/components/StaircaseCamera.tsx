import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type StepFocus = {
  position: [number, number, number];
  theta: number;
};

interface StaircaseCameraProps {
  steps: StepFocus[];
  activeStep: number;
  onStepChange: (direction: number) => void;
  cameraHeight?: number;
  polarOffsetDegrees?: number;
}

const DRAG_THRESHOLD = 42;
const CAMERA_LERP = 0.14;
const STEP_WIDTH = 1.05;

export default function StaircaseCamera({
  steps,
  activeStep,
  onStepChange,
  cameraHeight = 1.8,
  polarOffsetDegrees = 7
}: StaircaseCameraProps) {
  const { camera, gl, size } = useThree();
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  // A Camera (not Object3D) is essential here: Camera.lookAt points its -Z axis at the target.
  const lookCamera = useMemo(() => new THREE.PerspectiveCamera(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const screenUp = useMemo(() => new THREE.Vector3(), []);
  const active = steps[Math.max(0, Math.min(activeStep, steps.length - 1))];

  const advanceStep = useCallback((direction: number) => {
    onStepChange(direction);
  }, [onStepChange]);

  useEffect(() => {
    const element = gl.domElement;
    const previousTouchAction = element.style.touchAction;
    element.style.touchAction = "none";

    const handlePointerDown = (event: PointerEvent) => {
      dragStartX.current = event.clientX;
      dragStartY.current = event.clientY;
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (dragStartX.current === null || dragStartY.current === null) return;
      const dx = event.clientX - dragStartX.current;
      const dy = event.clientY - dragStartY.current;
      dragStartX.current = null;
      dragStartY.current = null;
      if (Math.abs(dx) < DRAG_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.15) return;
      advanceStep(dx > 0 ? 1 : -1);
    };
    const handlePointerCancel = () => {
      dragStartX.current = null;
      dragStartY.current = null;
    };

    element.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      element.style.touchAction = previousTouchAction;
      element.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [gl, advanceStep]);

  useFrame(() => {
    if (!active) return;
    const [x, y, z] = active.position;
    target.set(x, y, z);

    const theta = active.theta;
    const radialX = Math.cos(theta);
    const radialZ = Math.sin(theta);
    const tilt = THREE.MathUtils.degToRad(polarOffsetDegrees);

    // Fit the complete tread on narrow portrait screens while keeping it as large as possible.
    const aspect = Math.max(0.35, size.width / Math.max(1, size.height));
    const fitHeight = STEP_WIDTH / (2 * Math.tan(THREE.MathUtils.degToRad(19)) * aspect);
    const effectiveHeight = Math.max(cameraHeight, fitHeight * 1.08);
    const horizontalOffset = effectiveHeight * Math.tan(tilt);

    desiredPosition.set(
      x + radialX * horizontalOffset,
      y + effectiveHeight,
      z + radialZ * horizontalOffset
    );
    camera.position.lerp(desiredPosition, CAMERA_LERP);

    // Project the radial axis into the camera image plane as its screen-up direction.
    screenUp.set(
      radialX * Math.cos(tilt),
      -Math.sin(tilt),
      radialZ * Math.cos(tilt)
    ).normalize();
    lookCamera.position.copy(desiredPosition);
    lookCamera.up.copy(screenUp);
    lookCamera.lookAt(target);
    desiredQuaternion.copy(lookCamera.quaternion);
    camera.quaternion.slerp(desiredQuaternion, CAMERA_LERP);
  });

  return null;
}
