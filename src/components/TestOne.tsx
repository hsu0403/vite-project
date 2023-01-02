import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";

const TestOne = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let cube: THREE.Mesh<any, THREE.MeshPhongMaterial> | THREE.Group;
  let shape: THREE.Shape;

  useEffect(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.current?.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    setupCamera();
    setupLight();
    //setupModelLine();
    //setupModelPoints();
    setupModelMaterial();
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
    camera.position.z = 3;
    scene.add(camera);
  };

  const setupLight = () => {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    camera.add(light);
  };

  const setupModelMaterial = () => {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load(
      "src/images/uv_grid_opengl.jpg",
      (texture) => {
        texture.repeat.x = 1;
        texture.repeat.y = 1;

        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        texture.offset.x = 0.5;
        texture.offset.y = 0.5;

        texture.rotation = THREE.MathUtils.degToRad(45);
        texture.center.x = 0.5;
        texture.center.y = 0.5;

        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestMipMapLinearFilter;
      }
    );
    const material = new THREE.MeshStandardMaterial({ map });

    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    box.position.set(-1, 0, 0);
    scene.add(box);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      material
    );
    sphere.position.set(1, 0, 0);
    scene.add(sphere);
  };

  const setupModelLine = () => {
    const vertices = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    // const material = new THREE.LineBasicMaterial({
    //   color: "#00ffff",
    // });

    const material = new THREE.LineDashedMaterial({
      color: "#00ffff",
      dashSize: 0.2,
      gapSize: 0.1,
      scale: 4,
    });

    const line = new THREE.LineLoop(geometry, material);

    line.computeLineDistances(); //LineDashedMaterial를 사용한다면 이걸 사용해서 선의 길이를 계산해줘야한다.
    scene.add(line);
  };

  const setupModelPoints = () => {
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(5);
      const y = THREE.MathUtils.randFloatSpread(5);
      const z = THREE.MathUtils.randFloatSpread(5);

      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    ); //3은 vertices로부터 한번에 가져오는 개수 여기선 (x,y,z)를 의미

    const sprite = new THREE.TextureLoader().load("src/images/snowflake.png");
    //TextureLoader를 통해서 이미지를 load해서 가져와 매핑시킴.

    const material = new THREE.PointsMaterial({
      map: sprite,
      alphaTest: 0.5, //해당 값보다 클 때만 픽셀이 렌더링됨
      color: "#ffffff",
      size: 0.1,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
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

export default TestOne;
