import * as THREE from "./vendor/three.module.js";

// A local WebGL still life. No remote models, trackers, textures, or CDN dependencies.
export function mountScene(host) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dark = host.classList.contains("hero-scene");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch {
    host.insertAdjacentHTML(
      "afterbegin",
      '<div class="scene-fallback" aria-hidden="true">{☕}</div>',
    );
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "scene-canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(4.4, 3.7, 6.7);
  camera.lookAt(0, 0.15, 0);
  scene.add(new THREE.AmbientLight(0xfff7e5, 2.4));
  const key = new THREE.DirectionalLight(0xfff0d1, 4);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.normalBias = 0.025;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd8ebcc, 2.2);
  rim.position.set(5, 2, -3);
  scene.add(rim);
  const group = new THREE.Group();
  scene.add(group);
  group.rotation.y = -0.28;
  const clay = new THREE.MeshStandardMaterial({
    color: 0xc97044,
    roughness: 0.3,
    metalness: 0.06,
  });
  const cream = new THREE.MeshStandardMaterial({
    color: 0xf1e4bc,
    roughness: 0.45,
    metalness: 0.05,
  });
  const green = new THREE.MeshStandardMaterial({
    color: dark ? 0xacc48a : 0x53765a,
    roughness: 0.5,
  });
  const edge = new THREE.MeshStandardMaterial({
    color: dark ? 0x89a16e : 0xb9c8a4,
    roughness: 0.5,
  });
  const brown = new THREE.MeshStandardMaterial({
    color: 0x452e20,
    roughness: 0.2,
    metalness: 0.1,
  });
  const mesh = (geo, mat, x, y, z, parent = group) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  // A lathed ceramic cup has a genuine inner wall and visible rim.
  const profile = [
    [0, -0.5],
    [0.59, -0.5],
    [0.64, -0.45],
    [0.73, 0.52],
    [0.71, 0.57],
    [0.65, 0.57],
    [0.63, 0.5],
    [0.55, -0.37],
    [0, -0.37],
  ].map((p) => new THREE.Vector2(...p));
  const cup = new THREE.Group();
  group.add(cup);
  cup.position.set(0.05, 0.55, 0);
  cup.rotation.z = -0.08;
  mesh(new THREE.LatheGeometry(profile, 64), clay, 0, 0, 0, cup);
  const coffee = mesh(
    new THREE.CircleGeometry(0.637, 64),
    brown,
    0,
    0.43,
    0,
    cup,
  );
  coffee.rotation.x = -Math.PI / 2;
  const handle = mesh(
    new THREE.TorusGeometry(0.36, 0.11, 20, 64),
    clay,
    0.77,
    0.04,
    0,
    cup,
  );
  handle.scale.set(0.8, 1, 1);
  const saucer = mesh(
    new THREE.CylinderGeometry(0.99, 0.9, 0.09, 64),
    cream,
    0,
    -0.09,
    0,
  );
  saucer.rotation.z = -0.035;
  const ring = mesh(
    new THREE.TorusGeometry(0.78, 0.022, 12, 64),
    cream,
    0,
    -0.025,
    0,
  );
  ring.rotation.x = Math.PI / 2;
  const slabs = [];
  for (let i = 0; i < 3; i++) {
    const slab = mesh(
      new THREE.BoxGeometry(2.2, 0.13, 1.65),
      i === 1 ? green : cream,
      -0.06,
      -0.38 - i * 0.2,
      0,
    );
    slab.rotation.y = -0.25 + i * 0.13;
    slab.rotation.z = 0.025 * (i - 1);
    slabs.push(slab);
  }
  const glyphCanvas = document.createElement("canvas");
  glyphCanvas.width = 256;
  glyphCanvas.height = 256;
  const ctx = glyphCanvas.getContext("2d");
  ctx.fillStyle = "#f1e4bc";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#254638";
  ctx.font = "bold 96px Georgia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("{ }", 128, 130);
  const glyphTexture = new THREE.CanvasTexture(glyphCanvas);
  glyphTexture.colorSpace = THREE.SRGBColorSpace;
  const glyphMat = new THREE.MeshStandardMaterial({
    map: glyphTexture,
    roughness: 0.6,
  });
  const cube = mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    [cream, cream, cream, cream, glyphMat, cream],
    -1.45,
    0.7,
    0.1,
  );
  cube.rotation.set(0.15, 0.45, 0.2);
  const sphere = mesh(
    new THREE.IcosahedronGeometry(0.22, 0),
    green,
    1.45,
    -0.15,
    0.5,
  );
  const little = mesh(
    new THREE.BoxGeometry(0.25, 0.25, 0.25),
    cream,
    -0.9,
    1.65,
    -0.3,
  );
  little.rotation.set(0.2, 0.6, 0.3);
  const orbit = mesh(
    new THREE.TorusGeometry(1.63, 0.012, 8, 120),
    edge,
    0,
    0.5,
    -0.3,
  );
  orbit.rotation.set(1.1, 0.4, 0.2);
  orbit.scale.set(1, 1.1, 1);
  const steam = [];
  for (let i = 0; i < 3; i++) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2 + i * 0.2, 1.22, 0),
      new THREE.Vector3(-0.3 + i * 0.2, 1.52, 0.03),
      new THREE.Vector3(-0.1 + i * 0.2, 1.8, 0),
    ]);
    const material = new THREE.MeshStandardMaterial({
      color: dark ? 0xbad09f : 0xa6b89a,
      transparent: true,
      opacity: 0.38,
      roughness: 1,
    });
    steam.push(
      mesh(
        new THREE.TubeGeometry(curve, 24, 0.014, 6, false),
        material,
        0,
        0,
        0,
      ),
    );
  }
  let mouseX = 0,
    mouseY = 0,
    frame = 0,
    visible = true,
    stopped = false;
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
    mouseY = ((e.clientY - r.top) / r.height - 0.5) * 0.25;
  };
  host.addEventListener("pointermove", onMove);
  const onLeave = () => {
    mouseX = 0;
    mouseY = 0;
  };
  host.addEventListener("pointerleave", onLeave);
  const resize = () => {
    if (!host.clientWidth || !host.clientHeight) return;
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.zoom = camera.aspect < 0.9 ? 0.72 : 1;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
    if (reduced) renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  });
  intersection.observe(host);
  const start = performance.now();
  function draw(now) {
    if (stopped) return;
    if (visible && !document.hidden) {
      const t = reduced ? 0 : (now - start) / 1000;
      group.rotation.y += (-0.28 + mouseX - group.rotation.y) * 0.035;
      group.rotation.x += (mouseY - group.rotation.x) * 0.035;
      group.position.y = reduced ? 0 : Math.sin(t * 0.85) * 0.065;
      cube.position.y = 0.7 + Math.sin(t * 0.9 + 1) * 0.12;
      cube.rotation.y = 0.45 + Math.sin(t * 0.45) * 0.25;
      sphere.position.y = -0.15 + Math.sin(t + 2) * 0.12;
      sphere.rotation.y = t * 0.2;
      little.position.y = 1.65 + Math.sin(t * 0.8 + 3) * 0.08;
      little.rotation.z = 0.3 + t * 0.12;
      orbit.rotation.z = 0.2 + Math.sin(t * 0.3) * 0.12;
      steam.forEach((s, i) => {
        s.material.opacity = 0.22 + Math.sin(t * 1.2 + i) * 0.1;
        s.position.y = Math.sin(t * 0.7 + i) * 0.025;
      });
      renderer.render(scene, camera);
    }
    if (!reduced) frame = requestAnimationFrame(draw);
  }
  draw(performance.now());
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    intersection.disconnect();
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (o.material)
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          m.dispose(),
        );
    });
    glyphTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
