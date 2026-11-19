import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const MODEL_PATH = "/models/human-base-rigged.glb";

function Model() {
  const { scene } = useGLTF(MODEL_PATH);

  const mannequin = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const targetHeight = 2.8;
    const scale = targetHeight / size.y;

    clone.scale.setScalar(scale);
    clone.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );

    return clone;
  }, [scene]);

  return <primitive object={mannequin} />;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />
      const MODEL_PATH =
      require("../../assets/models/human-base-rigged.glb");;nalLight position=
      {[4, 6, 5]}
      intensity={2.2}
      /
      <directionalLight position={[-4, 3, -3]} intensity={0.8} />
      <Model />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.3}
        scale={4}
        blur={2}
        far={3}
      />
      <OrbitControls
        makeDefault
        target={[0, 1.4, 0]}
        minDistance={2.5}
        maxDistance={8}
        enablePan={false}
        enableZoom
        enableRotate
      />
    </>
  );
}

export default function Mannequin3D() {
  return (
    <Canvas
      camera={{
        position: [0, 1.5, 5],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      gl={{ antialias: true, alpha: true }}
      style={{ flex: 1 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_PATH);
