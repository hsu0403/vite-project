import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import { TeapotGeometry } from "three/examples/jsm/geometries/TeapotGeometry";

const TestGlassMaterial = () => {
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
    setupBackground();
    // setupModel();
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
    camera.position.set(0, 4, 5);
  };

  const setupLight = () => {
    const color = "#fff";
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  };

  const setupBackground = () => {
    const loader = new THREE.TextureLoader();
    loader.load("src/images/clarens.jpg", (texture) => {
      const renderTarget = new THREE.WebGLCubeRenderTarget(
        texture.image.height
      );
      renderTarget.fromEquirectangularTexture(renderer, texture);
      scene.background = renderTarget.texture;

      setupModel();
    });
  };

  const setupModel = () => {
    const teapotRenderTarget = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipMapLinearFilter,
    });
    const teapotCamera = new THREE.CubeCamera(0.01, 10, teapotRenderTarget);
    const teapotGeometry = new TeapotGeometry(0.7, 24);
    const teapotMaterial = new THREE.MeshPhysicalMaterial({
      color: "#fff",
      metalness: 0.1,
      roughness: 0.05,
      ior: 1.8,
      transmission: 1,
      side: THREE.DoubleSide,
      envMap: teapotRenderTarget.texture,
      envMapIntensity: 1,
    });
    teapotMaterial.thickness = 0.2;
    const teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
    teapot.add(teapotCamera);
    scene.add(teapot);
    teapot.name = "teapot";

    const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1.5, 32);
    const cylinderMaterial = new THREE.MeshNormalMaterial();
    const cylinderPivot = new THREE.Object3D();
    for (let degree = 0; degree <= 360; degree += 30) {
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      const radian = THREE.MathUtils.degToRad(degree);
      cylinder.position.set(2 * Math.sin(radian), 0, 2 * Math.cos(radian));
      cylinderPivot.add(cylinder);
    }
    scene.add(cylinderPivot);
    cylinderPivot.name = "cylinderPivot";
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
    const cylinder = scene.getObjectByName("cylinderPivot");
    if (cylinder) cylinder.rotation.y = Math.sin(time * 0.5);
    const teapot = scene.getObjectByName("teapot");
    if (teapot) {
      teapot.visible = false;
      const teapotCamera = teapot.children[0] as THREE.CubeCamera;
      teapotCamera.update(renderer, scene);
      teapot.visible = true;
    }
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestGlassMaterial;
