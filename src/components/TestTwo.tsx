import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

const TestTwo = () => {
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
    setupCustomModel();
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
    camera.position.z = 4;
  };

  const setupLight = () => {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  };

  const setupCustomModel = () => {
    const rawPositions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
    const rawNormals = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const rawColors = [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0];
    const rawUVs = [0, 0, 1, 0, 0, 1, 1, 1];

    const positions = new Float32Array(rawPositions); //4개의 정점
    const normals = new Float32Array(rawNormals); //4개의 정점에 대한 법선
    const colors = new Float32Array(rawColors); //정점의 색상
    const uvs = new Float32Array(rawUVs); //uv좌표

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    geometry.setIndex([0, 1, 2, 2, 1, 3]); //삼각면으로 그리는 순서를 지정해줌.

    //geometry.computeVertexNormals();
    //자동으로 법선계산화함 보통은 이걸 사용해도 될듯

    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("src/images/uv_grid_opengl.jpg");

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      vertexColors: true,
      map,
    });

    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    const helper = new VertexNormalsHelper(box, 0.1, 0xffff00);
    scene.add(helper);
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

export default TestTwo;
