import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";

const TestBackground = () => {
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
    //setupModel();
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
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 80;
    scene.add(camera);
  };

  const setupLight = () => {
    const color = "#fff";
    const intensity = 1.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    camera.add(light);
  };

  const setupBackground = () => {
    //단일 색상, fog
    // scene.background = new THREE.Color("#ff5321");
    // //scene.fog = new THREE.Fog("#ff5321", 0, 150);
    // scene.fog = new THREE.FogExp2("#ff5321", 0.01);

    //단일 배경
    // const loader = new THREE.TextureLoader();
    // loader.load("src/images/wallpaperbetter.jpg", (texture) => {
    //   scene.background = texture;

    //   setupModel();
    // });

    //cube 배경
    // const loader = new THREE.CubeTextureLoader();

    // loader.load(
    //   [
    //     "src/images/Yokohama/posx.jpg",
    //     "src/images/Yokohama/negx.jpg",
    //     "src/images/Yokohama/posy.jpg",
    //     "src/images/Yokohama/negy.jpg",
    //     "src/images/Yokohama/posz.jpg",
    //     "src/images/Yokohama/negz.jpg",
    //   ],
    //   (cubeTexture) => {
    //     scene.background = cubeTexture;
    //     setupModel();
    //   }
    // );

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
    const pmremG = new THREE.PMREMGenerator(renderer);
    const renderTarget = pmremG.fromEquirectangular(
      scene.background as THREE.Texture
    );

    const geometry = new THREE.SphereGeometry();

    const material1 = new THREE.MeshStandardMaterial({
      color: "#2ecc71",
      roughness: 0,
      metalness: 1,
      envMap: renderTarget.texture,
    });
    const material2 = new THREE.MeshStandardMaterial({
      color: "#e74c3c",
      roughness: 0.3,
      metalness: 0.9,
      envMap: renderTarget.texture,
    });

    const rangeMin = -20.0,
      rangeMax = 20.0;
    const gap = 10.0;
    let flag = true;

    for (let x = rangeMin; x <= rangeMax; x += gap) {
      for (let y = rangeMin; y <= rangeMax; y += gap) {
        for (let z = rangeMin * 10; z <= rangeMax; z += gap) {
          flag = !flag;

          const mesh = new THREE.Mesh(geometry, flag ? material1 : material2);

          mesh.position.set(x, y, z);

          scene.add(mesh);
        }
      }
    }
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
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestBackground;
