import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

const TestFont = () => {
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
    camera.position.z = 2;
    scene.add(camera);
  };

  const setupLight = () => {
    const color = "#fff";
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    camera.add(light);
  };

  const setupModel = () => {
    const loader = new FontLoader();

    loader.load("src/data/Satisfy_Regular.json", (font) => {
      const geometry = new TextGeometry("Hello\nWorld!", {
        font,
        size: 0.3,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelOffset: 0.005,
        bevelSegments: 24,
      });

      const material = new THREE.MeshStandardMaterial({
        color: "#d9eb3b",
        roughness: 0.3,
        metalness: 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // geometry.computeBoundingBox(); //가세높을 계산

      // const midX =
      //   (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x) / 2.0; //중심 x 계산
      // const midZ =
      //   (geometry.boundingBox!.max.z - geometry.boundingBox!.min.z) / 2.0; //중심 z 계산

      // geometry.translate(-midX, 0, midZ); //geometry 위치 이동

      geometry.center();
    });
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

export default TestFont;
