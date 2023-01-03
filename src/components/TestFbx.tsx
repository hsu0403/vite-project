import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import React, { useEffect, useRef, useState } from "react";

const TestFbx = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let clock: THREE.Clock;
  let mixer: THREE.AnimationMixer;

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

  const zoomFit = (
    object3D: THREE.Object3D,
    pcamera: THREE.PerspectiveCamera,
    viewMode: String,
    bFront: boolean
  ) => {
    const box = new THREE.Box3().setFromObject(object3D);
    const sizeBox = box.getSize(new THREE.Vector3()).length();
    const centerBox = box.getCenter(new THREE.Vector3());

    let offsetX = 0,
      offsetY = 0,
      offsetZ = 0;
    viewMode === "X"
      ? (offsetX = 1)
      : viewMode === "Y"
      ? (offsetY = 1)
      : (offsetZ = 1);

    if (!bFront) {
      offsetX *= -1;
      offsetY *= -1;
      offsetZ *= -1;
    }

    pcamera.position.set(
      centerBox.x + offsetX,
      centerBox.y + offsetY,
      centerBox.z + offsetZ
    );

    const halfSizeModel = sizeBox * 0.5;
    const halfFov = THREE.MathUtils.degToRad(pcamera.fov * 0.5);
    const distance = halfSizeModel / Math.tan(halfFov);
    const direction = new THREE.Vector3()
      .subVectors(pcamera.position, centerBox)
      .normalize();
    const position = direction.multiplyScalar(distance).add(centerBox);

    pcamera.position.copy(position);
    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;

    pcamera.updateProjectionMatrix();

    pcamera.lookAt(centerBox.x, centerBox.y, centerBox.z);

    controls.target.set(centerBox.x, centerBox.y, centerBox.z);
    //orbitcontrols가 보는방향도 이렇게 세팅해줘야 원래보던 0,0,0이 아닌 여기서 정한 model의 center를 바라봄.
  };

  const setupModel = () => {
    clock = new THREE.Clock();

    const loader = new FBXLoader();
    loader.load("src/images/Silly Dancing.fbx", (object) => {
      mixer = new THREE.AnimationMixer(object);
      const action = mixer.clipAction(object.animations[0]);
      //첫번째 애니메이션가져옴.
      action.play();
      //애니메이션 동작시킴.

      scene.add(object);

      zoomFit(object, camera, "Z", true);
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

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    //clock을 통해서 경과시간을 받아와서 update시킴.
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestFbx;
