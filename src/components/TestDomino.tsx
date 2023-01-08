import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import React, { useEffect, useRef, useState } from "react";
import ammo from "ammojs-typed";

class CustomMesh<
  TGeometry extends THREE.BufferGeometry = THREE.BufferGeometry,
  TMaterial extends THREE.Material | THREE.Material[] =
    | THREE.Material
    | THREE.Material[]
> extends THREE.Mesh {
  declare physicsBody: ammo.btRigidBody;
  constructor(geometry?: TGeometry, material?: TMaterial) {
    super(geometry, material);
  }
}

const TestDomino = () => {
  const [loading, setLoading] = useState(false);
  const divContainer = useRef<HTMLDivElement | null>(null);

  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let controls: OrbitControls;
  let physicsWorld: ammo.btDiscreteDynamicsWorld;
  let clock: THREE.Clock;
  let tmpTrans: ammo.btTransform;
  let Ammo: typeof ammo;

  useEffect(() => {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    divContainer.current?.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    setupCamera();
    setupLight();
    setupAmmo();
    //setupModel();
    setupControls();
    setupShot();
    clock = new THREE.Clock();

    window.onresize = resize.bind(this);
    resize();

    requestAnimationFrame(render.bind(this));
  }, []);

  const setupShot = () => {
    const raycaster = new THREE.Raycaster();
    window.addEventListener("click", (event: MouseEvent) => {
      if (!event.ctrlKey) return;
      const width = divContainer.current!.clientWidth;
      const height = divContainer.current!.clientHeight;
      const pt = {
        x: (event.clientX / width) * 2 - 1,
        y: -(event.clientY / height) * 2 + 1,
      };

      raycaster.setFromCamera(pt, camera);

      const tmpPos = new THREE.Vector3();
      tmpPos.copy(raycaster.ray.origin);

      const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z };
      const radius = 0.25;
      const quat = { x: 0, y: 0, z: 0, w: 1 };
      const mass = 1;

      const ball = new CustomMesh(
        new THREE.SphereGeometry(radius),
        new THREE.MeshStandardMaterial({
          color: 0xff0000,
          metalness: 0.7,
          roughness: 0.4,
        })
      );
      ball.position.set(pos.x, pos.y, pos.z);
      scene.add(ball);

      const transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );
      const motionState = new Ammo.btDefaultMotionState(transform);
      const colShape = new Ammo.btSphereShape(radius);
      colShape.calculateLocalInertia(mass, new Ammo.btVector3(0, 0, 0));

      const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        colShape
      );
      const body = new Ammo.btRigidBody(rbInfo);

      physicsWorld.addRigidBody(body);

      tmpPos.copy(raycaster.ray.direction);
      tmpPos.multiplyScalar(20);
      //공이 날아가는 방향과 속도를 지정함.

      body.setLinearVelocity(new Ammo.btVector3(tmpPos.x, tmpPos.y, tmpPos.z));

      ball.physicsBody = body;
    });
  };

  const setupAmmo = async () => {
    Ammo = await ammo.bind(window)();

    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      overlappingPairCache,
      solver,
      collisionConfiguration
    );
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0));
    //physicsWorld에서 y축 방향으로 -9.807정도의 중력값을 지정
    setupModel();

    // Ammo(Ammo).then(() => {
    //   //아래 4개는 물리적인 충돌과 관련된 객체
    // const overlappingPairCache = new Ammo.btDbvtBroadphase();
    // const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    // const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    // const solver = new Ammo.btSequentialImpulseConstraintSolver();
    // physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    //   dispatcher,
    //   overlappingPairCache,
    //   solver,
    //   collisionConfiguration
    // );
    // physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0));
    // //physicsWorld에서 y축 방향으로 -9.807정도의 중력값을 지정
    // setupModel();
    // });
  };

  const setupControls = () => {
    controls = new OrbitControls(camera, divContainer.current!);
  };

  const setupCamera = () => {
    const width = divContainer.current!.clientWidth;
    const height = divContainer.current!.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 15, 25);
    scene.add(camera);
  };

  const setupLight = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const color = "#fff";
    const intensity = 0.9;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-10, 15, 10);
    camera.add(light);

    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    let d = 15;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
  };

  const createTable = () => {
    const position = { x: 0, y: -0.525, z: 0 };
    const scale = { x: 30, y: 0.5, z: 30 };

    const tableGeometry = new THREE.BoxGeometry();
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x878787 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);

    table.position.set(position.x, position.y, position.z);
    table.scale.set(scale.x, scale.y, scale.z);
    table.receiveShadow = true;
    scene.add(table);

    //물리객체 생성
    const transform = new Ammo.btTransform(); //위치와 회전값을 정해주기위함.
    const quaternion = { x: 0, y: 0, z: 0, w: 1 };
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    transform.setRotation(
      new Ammo.btQuaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w
      )
    );
    const motionState = new Ammo.btDefaultMotionState(transform);
    const colShape = new Ammo.btBoxShape(
      new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
    );

    const mass = 0;
    colShape.calculateLocalInertia(mass, new Ammo.btVector3(0, 0, 0));
    //table의 질량 지정. 질량이 0이면 물리적 영향을 받지 않음.
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      colShape
    );
    const body = new Ammo.btRigidBody(rbInfo);
    physicsWorld.addRigidBody(body);
  };

  const createDomino = () => {
    const controlPoints: [x: number, y: number, z: number][] = [
      [-10, 0, -10],
      [10, 0, -10],
      [10, 0, 10],
      [-10, 0, 10],
      [-10, 0, -8],
      [8, 0, -8],
      [8, 0, 8],
      [-8, 0, 8],
      [-8, 0, -6],
      [6, 0, -6],
      [6, 0, 6],
      [-6, 0, 6],
      [-6, 0, -4],
      [4, 0, -4],
      [4, 0, 4],
      [-4, 0, 4],
      [-4, 0, -2],
      [2, 0, -2],
      [2, 0, 2],
      [-2, 0, 2],
      [-2, 0, 0],
      [0, 0, 0],
    ];

    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const curve = new THREE.CatmullRomCurve3(
      controlPoints
        .map((p, ndx) => {
          if (ndx === controlPoints.length - 1) return p0.set(...p);
          p0.set(...p);
          p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);
          return [
            new THREE.Vector3().copy(p0),
            new THREE.Vector3().lerpVectors(p0, p1, 0.3),
            new THREE.Vector3().lerpVectors(p0, p1, 0.7),
          ];
        })
        .flat(),
      false
    );

    // const points = curve.getPoints(1000);
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
    // const curveObject = new THREE.Line(geometry, material);
    // scene.add(curveObject);

    const scale = { x: 0.75, y: 1, z: 0.1 };
    const dominoGeometry = new THREE.BoxGeometry();
    const dominoMaterial = new THREE.MeshNormalMaterial();
    const mass = 1;
    const step = 0.0001;
    let length = 0.0;
    for (let t = 0; t < 1.0; t += step) {
      const pt1 = curve.getPoint(t);
      const pt2 = curve.getPoint(t + step);

      length += pt1.distanceTo(pt2);

      if (length > 0.4) {
        const domino = new CustomMesh(dominoGeometry, dominoMaterial);
        domino.position.copy(pt1);
        domino.scale.set(scale.x, scale.y, scale.z);
        domino.lookAt(pt2);

        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(domino.rotation);

        domino.castShadow = true;
        domino.receiveShadow = true;
        scene.add(domino);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pt1.x, pt1.y, pt1.z));
        transform.setRotation(
          new Ammo.btQuaternion(
            quaternion.x,
            quaternion.y,
            quaternion.z,
            quaternion.w
          )
        );
        const motionState = new Ammo.btDefaultMotionState(transform);
        const colShape = new Ammo.btBoxShape(
          new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
        );

        const localIntertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localIntertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
          mass,
          motionState,
          colShape,
          localIntertia
        );
        const body = new Ammo.btRigidBody(rbInfo);
        physicsWorld.addRigidBody(body);

        domino.physicsBody = body;

        length = 0.0;
      }
    }
  };

  const setupModel = () => {
    createTable();
    createDomino();
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

    const deltaTime = clock.getDelta();

    if (physicsWorld) {
      physicsWorld.stepSimulation(deltaTime);
      scene.traverse((obj) => {
        if (obj instanceof CustomMesh) {
          const objThree = obj;
          const objAmmo = objThree.physicsBody;
          if (objAmmo) {
            const motionState = objAmmo.getMotionState();

            if (motionState) {
              let tmp = tmpTrans;
              if (tmp === undefined) tmp = tmpTrans = new Ammo.btTransform();
              motionState.getWorldTransform(tmp);

              const pos = tmp.getOrigin();
              const quat = tmp.getRotation();

              objThree.position.set(pos.x(), pos.y(), pos.z());
              objThree.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
            }
          }
        }
      });
    }
  };

  return <div ref={divContainer} id="webgl-container"></div>;
};

export default TestDomino;
