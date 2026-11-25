import { useEffect, useMemo, useRef } from "react";
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

export default function StaircaseCamera({
  steps,
  activeStep,
  onStepChange,
  cameraHeight = 1.8,
  polarOffsetDegrees = 7
}: StaircaseCameraProps) {
  const { camera, gl } = useThree();
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const lookObject = useMemo(() => new THREE.Object3D(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const active = steps[Math.max(0, Math.min(activeStep, steps.length - 1))];

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
      // Dragging right advances down the staircase; dragging left returns upward.
      onStepChange(dx < 0 ? 1 : -1);
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
  }, [gl, onStepChange]);

  useFrame(() => {
    if (!active) return;
    const [x, y, z] = active.position;
    target.set(x, y, z);
    const theta = active.theta;
    const radialX = Math.cos(theta);
    const radialZ = Math.sin(theta);
    const tilt = THREE.MathUtils.degToRad(polarOffsetDegrees);
    const horizontalOffset = cameraHeight * Math.tan(tilt);

    desiredPosition.set(
      x + radialX * horizontalOffset,
      y + cameraHeight,
      z + radialZ * horizontalOffset
    );
    camera.position.lerp(desiredPosition, CAMERA_LERP);

    // Keep the active tread's radial direction vertical on screen.
    up.set(radialX, 0, radialZ).normalize();
    lookObject.position.copy(camera.position);
    lookObject.up.copy(up);
    lookObject.lookAt(target);
    desiredQuaternion.copy(lookObject.quaternion);
    camera.quaternion.slerp(desiredQuaternion, CAMERA_LERP);
  });

  return null;
}
