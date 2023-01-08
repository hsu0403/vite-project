import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";

class CustomMesh<
  TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
  TMaterial extends THREE.Material | THREE.Material[] =
    | THREE.Material
    | THREE.Material[]
> extends THREE.Mesh {
  declare wrapper: Particle;
  constructor(geometry?: TGeometry, material?: TMaterial) {
    super(geometry, material);
  }
}
//wrapper라는 새로운 속성을 주기위해 mesh를 상속받아서 만들어줬음.
//wrapper를 통해서 Particle객체에 접근하기 위해 사용

class Particle {
  declare awakenTime: number | undefined;
  declare _mesh: CustomMesh;
  constructor(
    scene: THREE.Scene,
    geometry: THREE.BufferGeometry,
    material: THREE.MeshStandardMaterial,
    x: number,
    y: number
  ) {
    const mesh = new CustomMesh(geometry, material);
    mesh.position.set(x, y, 0);
    scene.add(mesh);
    mesh.wrapper = this; //mesh.wrapper가 Particle객체를 가리킴.
    this.awakenTime = undefined;
    this._mesh = mesh;
  }

  awake(time: number) {
    //awakenTime을 저장시키기 위해
    if (!this.awakenTime) {
      this.awakenTime = time;
    }
  }

  update(time: number) {
    //객체에 저장된 시간과 render의 update시간을 비교해 값을 변경시켜 위치 및 색상 변경
    if (this.awakenTime) {
      const period = 12.0;
      const t = time - this.awakenTime;
      if (t >= period) {
        this.awakenTime = undefined;
      }
      this._mesh.rotation.x = THREE.MathUtils.lerp(
        0,
        Math.PI * 2 * period,
        t / period
      );

      let h_s, l;
      if (t < period / 2) {
        h_s = THREE.MathUtils.lerp(0.0, 1.0, t / (period / 2));
        l = THREE.MathUtils.lerp(0.1, 1.0, t / (period / 2));
      } else {
        h_s = THREE.MathUtils.lerp(1.0, 0.0, t / (period / 2.0) - 1);
        l = THREE.MathUtils.lerp(1.0, 0.1, t / (period / 2.0) - 1);
      }

      if (this._mesh.material instanceof THREE.MeshStandardMaterial) {
        this._mesh.material.color.setHSL(h_s, h_s, l);
        this._mesh.position.z = h_s * 15.0;
      }
    }
  }
}

const TestPickingAndParticle = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let mouse: THREE.Vector2;
  let raycaster: THREE.Raycaster;

  useEffect(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.current?.appendChild(renderer.domElement);
    mouse = new THREE.Vector2();

    scene = new THREE.Scene();
    setupCamera();
    setupLight();
    setupModel();
    setupControls();
    setupPicking();

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
    camera.position.z = 40;
  };

  const setupLight = () => {
    const color = "#fff";
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  };

  const setupPicking = () => {
    raycaster = new THREE.Raycaster();
    //이걸 통해서 화면위의 커서위치에 놓인 mesh를 확인 가능.
    //카메라에서 커서방향으로 가는 빛을 생성해 그 빛과 충돌하는 mesh를 확인하기 때문.
  };

  const onMouseMove = (event: MouseEvent) => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;

    mouse.x = (event.offsetX / width) * 2 - 1;
    mouse.y = -(event.offsetY / height) * 2 + 1;
    //마우스 계산식 중요
  };

  const setupModel = () => {
    const geometry = new THREE.BoxGeometry();

    for (let x = -20; x <= 20; x += 1.1) {
      for (let y = -20; y <= 20; y += 1.1) {
        const color = new THREE.Color();
        color.setHSL(0, 0, 0.1);
        const material = new THREE.MeshStandardMaterial({ color });

        new Particle(scene, geometry, material, x, y);
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

    if (raycaster && mouse) {
      raycaster.setFromCamera(mouse, camera); //마우스 및 카메라를 세팅해주고
      const targets = raycaster.intersectObjects(scene.children, true);
      //targets에 해당 커서위치의 mesh들을 배열에 저장.
      if (targets.length > 0) {
        const mesh = targets[0].object; //가장 처음에 보이는 mesh선택
        if (mesh instanceof CustomMesh) {
          const particle = mesh.wrapper;
          particle.awake(time);
        }
      }
    }

    scene.traverse((obj) => {
      if (obj instanceof CustomMesh) {
        obj.wrapper.update(time);
      }
    });
  };

  useEffect(() => {
    divContainer.current!.addEventListener("mousemove", onMouseMove);
    return () =>
      divContainer.current!.removeEventListener("mousemove", onMouseMove);
  }, []);
  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestPickingAndParticle;
