import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

const Test = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let cube: THREE.Mesh<any, THREE.MeshPhongMaterial> | THREE.Group;
  let shape: THREE.Shape;
  let solarSystem: THREE.Object3D<THREE.Event>;
  let earthOrbit: THREE.Object3D<THREE.Event>;
  let moonOrbit: THREE.Object3D<THREE.Event>;

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

  const setupCamera = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 50;
  };

  const setupLight = () => {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  };

  const setupModel = () => {
    //태양계
    solarSystem = new THREE.Object3D();
    scene.add(solarSystem);

    const radius = 1;
    const widhSegments = 12;
    const heightSegments = 12;
    const sphereGeometry = new THREE.SphereGeometry(
      radius,
      widhSegments,
      heightSegments
    );

    //sun
    const sunMaterial = new THREE.MeshPhongMaterial({
      emissive: 0xffff00,
      flatShading: true,
    });

    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(3, 3, 3);
    solarSystem.add(sunMesh);

    //earth
    earthOrbit = new THREE.Object3D();
    solarSystem.add(earthOrbit);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      flatShading: true,
    });

    const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthOrbit.position.x = 10;
    earthOrbit.add(earthMesh);

    //moon
    moonOrbit = new THREE.Object3D();
    moonOrbit.position.x = 2;
    earthOrbit.add(moonOrbit);

    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      emissive: 0x222222,
      flatShading: true,
    });

    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.set(0.4, 0.4, 0.4);
    moonOrbit.add(moonMesh);
  };

  //   const setupModel = () => {
  //     class CustomSinCurve extends THREE.Curve<THREE.Vector3> {
  //       private scale: number;
  //       constructor(scale: number) {
  //         super();
  //         this.scale = scale;
  //       }
  //       getPoint(t: number): THREE.Vector3 {
  //         const tx = t * 3 - 1.5;
  //         const ty = Math.sin(2 * Math.PI * t);
  //         const tz = 0;
  //         return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
  //       }
  //     }

  //     const path = new CustomSinCurve(4);
  //     const geometry = new THREE.TubeGeometry(path);
  //     const material = new THREE.MeshPhongMaterial({ color: 0x515151 });
  //     cube = new THREE.Mesh(geometry, material);

  //     const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  //     const line = new THREE.LineSegments(
  //       new THREE.WireframeGeometry(geometry),
  //       lineMaterial
  //     );

  //     const group = new THREE.Group();
  //     group.add(cube);
  //     group.add(line);
  //     scene.add(group);
  //     cube = group;
  //   };

  // const setupModel = () => {
  //   const points = [];
  //   for (let i = 0; i < 10; i++) {
  //     points.push(new THREE.Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * 0.8));
  //   }

  //   //points에 기록된 THREE.Vector2값들로 이루어진 선을 y축으로 한바뀌 돌려줌
  //   const geometry = new THREE.LatheGeometry(points);
  //   const material = new THREE.MeshPhongMaterial({ color: 0x515151 });
  //   cube = new THREE.Mesh(geometry, material);

  //   const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  //   const line = new THREE.LineSegments(
  //     new THREE.WireframeGeometry(geometry),
  //     lineMaterial
  //   );

  //   const group = new THREE.Group();
  //   group.add(cube);
  //   group.add(line);
  //   scene.add(group);
  //   cube = group;
  // };

  // const setupModel = () => {
  //   shape = new THREE.Shape();
  //   shape.moveTo(1, 1);
  //   shape.lineTo(1, -1);
  //   shape.lineTo(-1, -1);
  //   shape.lineTo(-1, 1);
  //   shape.closePath();
  //   const geometry = new THREE.ShapeGeometry(shape);
  //   const material = new THREE.MeshPhongMaterial({ color: 0x515151 });
  //   cube = new THREE.Mesh(geometry, material);

  //   const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  //   const line = new THREE.LineSegments(
  //     new THREE.WireframeGeometry(geometry),
  //     lineMaterial
  //   );
  //   const group = new THREE.Group();
  //   group.add(cube);
  //   group.add(line);
  //   scene.add(group);
  //   cube = group;
  // };

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
    solarSystem.rotation.y = time / 2;
    earthOrbit.rotation.y = time * 2;
    moonOrbit.rotation.y = time * 4;
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default Test;
