import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

const TestThree = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let light: THREE.DirectionalLight;

  useEffect(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    divContainer.current?.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    setupCamera();
    setupLight();
    setupModel();
    setupControls();

    window.onresize = resize.bind(this);
    resize();

    requestAnimationFrame(render.bind(this));
  }, []);

  const setupControls = () => {
    new OrbitControls(camera, divContainer.current!);
  };

  const setupCamera = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(7, 7, 0);
    camera.lookAt(0, 0, 0);
  };

  const setupLight = () => {
    const auxLight = new THREE.DirectionalLight(0xffffff, 0.5);
    auxLight.position.set(0, 5, 0);
    auxLight.target.position.set(0, 0, 0);
    scene.add(auxLight);
    scene.add(auxLight.target);

    light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 5, 0);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    scene.add(light.target);
    light.shadow.camera.top = light.shadow.camera.right = 6;
    light.shadow.camera.bottom = light.shadow.camera.left = -6;

    light.shadow.mapSize.width = light.shadow.mapSize.height = 2048;
    light.shadow.radius = 10;

    scene.add(light);
  };

  const setupModel = () => {
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "#2c3e50",
      roughness: 0.5,
      metalness: 0.5,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = THREE.MathUtils.degToRad(-90);
    ground.receiveShadow = true;
    scene.add(ground);

    //const bigSphereGeometry = new THREE.SphereGeometry(1.5, 64, 64, 0, Math.PI);
    const bigSphereGeometry = new THREE.TorusKnotGeometry(
      1,
      0.3,
      128,
      64,
      2,
      3
    );
    const bigSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#fff",
      roughness: 0.1,
      metalness: 0.2,
    });
    const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
    //bigSphere.rotation.x = THREE.MathUtils.degToRad(-90);
    bigSphere.position.y = 1.6;
    bigSphere.receiveShadow = true;
    bigSphere.castShadow = true;
    scene.add(bigSphere);

    const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 32, 32);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: "#9b59b6",
      roughness: 0.5,
      metalness: 0.9,
    });
    for (let i = 0; i < 8; i++) {
      const torusPivot = new THREE.Object3D();
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torusPivot.rotation.y = THREE.MathUtils.degToRad(45 * i);
      torus.position.set(3, 0.5, 0);
      torus.receiveShadow = true;
      torus.castShadow = true;
      torusPivot.add(torus);
      scene.add(torusPivot);
    }
    //pivot은 물체의 위치를 정하기 위해사용

    const smallSphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const smallSphereMaterial = new THREE.MeshStandardMaterial({
      color: "#e74c3c",
      roughness: 0.2,
      metalness: 0.5,
    });
    const smallSpherePivot = new THREE.Object3D();
    const smallSphere = new THREE.Mesh(
      smallSphereGeometry,
      smallSphereMaterial
    );
    smallSpherePivot.add(smallSphere);
    smallSpherePivot.name = "smallSpherePivot"; //이름 부여시 scene에서 언제든지 조회가능
    smallSphere.position.set(3, 0.5, 0);
    smallSphere.receiveShadow = true;
    smallSphere.castShadow = true;
    scene.add(smallSpherePivot);

    const targetPivot = new THREE.Object3D();
    const target = new THREE.Object3D();
    targetPivot.add(target);
    targetPivot.name = "targetPivot";
    target.position.set(3, 0.5, 0);
    scene.add(targetPivot);
  };

  const resize = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const render = (time: number) => {
    renderer.render(scene, camera);
    update(time);
    requestAnimationFrame(render.bind(this));
  };

  const update = (time: number) => {
    time *= 0.001;
    const smallSpherePivot = scene.getObjectByName("smallSpherePivot");
    if (smallSpherePivot) {
      smallSpherePivot.rotation.y = THREE.MathUtils.degToRad(time * 50);

      if (light.target) {
        const smallSphere = smallSpherePivot.children[0];
        smallSphere.getWorldPosition(light.target.position);
      }

      //   const smallSphere = smallSpherePivot.children[0];
      //   smallSphere.getWorldPosition(camera.position);

      //   const targetPivot = scene.getObjectByName("targetPivot");
      //   if (targetPivot) {
      //     targetPivot.rotation.y = THREE.MathUtils.degToRad(time * 50 + 10);

      //     const target = targetPivot.children[0];
      //     const pt = new THREE.Vector3();

      //     target.getWorldPosition(pt);
      //     camera.lookAt(pt);
      //   }
    }
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestThree;
