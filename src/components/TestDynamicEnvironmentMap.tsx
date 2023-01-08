import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";

const TestDynamicEnvironmentMap = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;

  useEffect(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
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
    controls = new OrbitControls(camera, divContainer.current!);
  };

  const setupCamera = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 4, 9);
  };

  const setupLight = () => {
    scene.add(new THREE.AmbientLight("#fff", 0.5));

    const color = "#fff";
    const intensity = 5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  };

  const setupModel = () => {
    const renderTargetOptions = {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipMapLinearFilter,
    };

    const sphereRenderTarget = new THREE.WebGLCubeRenderTarget(
      512,
      renderTargetOptions
    );
    const sphereCamera = new THREE.CubeCamera(0.1, 1000, sphereRenderTarget);
    const sphereGeometry = new THREE.SphereGeometry(1.5);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: "#fff",
      envMap: sphereRenderTarget.texture,
      reflectivity: 0.95,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const spherePivot = new THREE.Object3D();
    spherePivot.add(sphere);
    spherePivot.add(sphereCamera);
    spherePivot.position.set(1, 0, 1);
    scene.add(spherePivot);

    const cylinderRenderTarget = new THREE.WebGLCubeRenderTarget(
      2048,
      renderTargetOptions
    );
    const cylinderCamera = new THREE.CubeCamera(
      0.1,
      1000,
      cylinderRenderTarget
    );
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 1, 3, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: "#fff",
      envMap: cylinderRenderTarget.texture,
      reflectivity: 0.95,
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    const cylinderPivot = new THREE.Object3D();
    cylinderPivot.add(cylinder);
    cylinderPivot.add(cylinderCamera);
    cylinderPivot.position.set(-1, 0, -1);
    scene.add(cylinderPivot);

    const torusRenderTarget = new THREE.WebGLCubeRenderTarget(
      2048,
      renderTargetOptions
    );
    const torusCamera = new THREE.CubeCamera(0.1, 1000, torusRenderTarget);
    const torusGeometry = new THREE.TorusGeometry(4, 0.5, 24, 64);
    const torusMaterial = new THREE.MeshPhongMaterial({
      color: "#fff",
      envMap: torusRenderTarget.texture,
      reflectivity: 0.95,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    const torusPivot = new THREE.Object3D();
    torusPivot.add(torus);
    torusPivot.add(torusCamera);
    torus.rotation.x = Math.PI / 2;
    scene.add(torusPivot);
    torus.name = "torus";

    const planeRenderTarget = new THREE.WebGLCubeRenderTarget(
      2048,
      renderTargetOptions
    );
    const planeCamera = new THREE.CubeCamera(0.1, 1000, planeRenderTarget);
    const planeGeometry = new THREE.PlaneGeometry(12, 12);
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: "#fff",
      envMap: planeRenderTarget.texture,
      reflectivity: 0.95,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    const planePivot = new THREE.Object3D();
    planePivot.add(plane);
    planePivot.add(planeCamera);
    plane.rotation.x = -Math.PI / 2;
    planePivot.position.y = -4.8;
    scene.add(planePivot);
  };

  const resize = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  const render = (time: number) => {
    scene.traverse((obj) => {
      //traverse는 이 객체와 모든 자손에 대한 콜백을 실행합니다.
      if (obj instanceof THREE.Object3D) {
        const mesh = obj.children[0];
        const cubeCamera = obj.children[1];

        if (
          mesh instanceof THREE.Mesh &&
          cubeCamera instanceof THREE.CubeCamera
        ) {
          mesh.visible = false;
          cubeCamera.update(renderer, scene);
          mesh.visible = true;
        }
      }
    });

    renderer.render(scene, camera);
    update(time);
    requestAnimationFrame(render.bind(this));
  };

  const update = (time: number) => {
    time *= 0.001;
    const torus = scene.getObjectByName("torus");
    if (torus) torus.rotation.x = Math.sin(time);
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestDynamicEnvironmentMap;
