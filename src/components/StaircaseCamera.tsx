import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

interface StaircaseCameraProps {
  polarAngle: number;
  distance: number;
}

export default function StaircaseCamera({
  polarAngle,
  distance
}: StaircaseCameraProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useEffect(() => {
    const targetY = -3.6;
    camera.position.set(
      distance * Math.sin(polarAngle),
      targetY + distance * Math.cos(polarAngle),
      0
    );
    camera.lookAt(0, targetY, 0);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, targetY, 0);
      controlsRef.current.update();
    }
  }, [camera, polarAngle, distance]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      enableRotate
      minPolarAngle={polarAngle}
      maxPolarAngle={polarAngle}
      minDistance={distance}
      maxDistance={distance}
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.55}
    />
  );
}
