import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import React, { useEffect, useRef, useState } from "react";

const TestGltf = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;

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
    new OrbitControls(camera, divContainer.current!);
  };

  const zoomFit = (
    object3D: THREE.Object3D,
    pcamera: THREE.PerspectiveCamera
  ) => {
    const box = new THREE.Box3().setFromObject(object3D);
    //모델의 경계 박스

    const sizeBox = box.getSize(new THREE.Vector3()).length();
    //모델의 경계 박스 대각 길이

    const centerBox = box.getCenter(new THREE.Vector3());
    //모델의 경계 박스 중심 위치

    const halfSizeModel = sizeBox * 0.5;
    //모델 크기의 절반값

    const halfFov = THREE.MathUtils.degToRad(pcamera.fov * 0.5);
    //카메라의 fov의 절반값

    const distance = halfSizeModel / Math.tan(halfFov);
    //모델을 화면에 꽉 채우기 위한 적정거리

    const direction = new THREE.Vector3()
      .subVectors(pcamera.position, centerBox)
      .normalize();
    //모델 중심에서 카메라 위치로 향하는 방향 단위 벡터 계산

    const position = direction.multiplyScalar(distance).add(centerBox);
    pcamera.position.copy(position);
    // 단위 방향 벡터 방향으로 모델 중심 위치에서 distance거리에 대한 위치

    pcamera.near = sizeBox / 100;
    pcamera.far = sizeBox * 100;
    //모델 크기에 맞춰 카메라의 near, far값을 대략적으로 조정 카메라에서 나가지 않게 조절

    pcamera.updateProjectionMatrix();
    //카메라 기본 속성 변경에 따른 투영행렬 업데이트

    pcamera.lookAt(centerBox.x, centerBox.y, centerBox.z);
    //카메라가 모델의 중심을 바라 보도록함.
  };

  const setupCamera = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 4;
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
    const gltfLoader = new GLTFLoader();
    const url = "src/images/adamHead/adamHead.gltf";
    gltfLoader.load(url, (gltf) => {
      const root = gltf.scene;
      scene.add(root);

      zoomFit(root, camera);
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

export default TestGltf;
