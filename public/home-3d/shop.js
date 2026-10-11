// Ephileo Workshop — a two-storey miniature workshop diorama, built at real-world scale (metres).
// Exports buildShop(), which returns the scene graph plus the handles the page needs (lights, hotspots, animated parts).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const MODELS = [
  'Television_01', 'vintage_telephone_wall_clock', 'desk_lamp_arm_01', 'retro_multimeter', 'circuit_board', 'bench_vice_01',
  'vintage_wooden_drawer_01', 'steel_frame_shelves_01', 'metal_toolbox', 'lightbulb_01', 'plastic_crate_02', 'cardboard_box_01',
  'power_box_01', 'trashbag', 'spray_paint_bottles', 'oil_tin', 'lubricant_spray', 'pliers', 'screwdrivers_02',
  'magnifying_glass_01', 'measuring_tape_01', 'stationery_supplies', 'alarm_clock_01', 'portable_cassette_player', 'boombox',
  'gamepad', 'potted_plant_02', 'planter_box_01', 'utility_box_01', 'exterior_aircon_unit', 'chinese_stool', 'painted_wooden_stool',
];

export async function buildShop(renderer, onProgress = () => {}) {
  const root = new THREE.Group();
  const support = []; // meshes small props can be dropped onto
  const anim = {};
  const lights = {};

  /* ---------- loading ---------- */
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_u, done, total) => onProgress(done / total);
  const gltfLoader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
  const texLoader = new THREE.TextureLoader(manager);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const hdrP = new RGBELoader(manager).loadAsync('tex/night_1k.hdr');
  const modelP = Promise.all(MODELS.map((n) => gltfLoader.loadAsync('models/' + n + '.glb').then((g) => [n, g.scene])));
  const texCache = {};
  const textureLoads = [];
  function tex(name, kind) {
    const key = name + '_' + kind;
    if (!texCache[key]) {
      let resolve, reject;
      textureLoads.push(new Promise((ok, fail) => { resolve = ok; reject = fail; }));
      const t = texLoader.load('tex/' + key + '.jpg', resolve, undefined, reject);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso;
      if (kind === 'diff') t.colorSpace = THREE.SRGBColorSpace;
      texCache[key] = t;
    }
    return texCache[key];
  }
  // PBR material from a Poly Haven set; rx/ry = texture repeats across the surface.
  function pbr(name, rx = 1, ry = 1, o = {}) {
    const rep = (t) => { const c = t.clone(); c.repeat.set(rx, ry); return c; };
    const m = new THREE.MeshStandardMaterial({
      map: o.noMap ? null : rep(tex(name, 'diff')), normalMap: rep(tex(name, 'nor')), roughnessMap: rep(tex(name, 'rough')),
      color: o.color ?? 0xffffff, roughness: o.roughness ?? 1, metalness: o.metalness ?? 0,
      normalScale: new THREE.Vector2(o.normal ?? 1, o.normal ?? 1),
    });
    return m;
  }

  const [hdr, modelList] = await Promise.all([hdrP, modelP]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(hdr).texture; hdr.dispose();
  const models = Object.fromEntries(modelList.map(([n, s]) => {
    s.updateMatrixWorld(true);
    let b = new THREE.Box3().setFromObject(s);
    const fix = { steel_frame_shelves_01: 0.1 }[n]; if (fix) { s.scale.multiplyScalar(fix); s.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(s); }
    const c = b.getCenter(new THREE.Vector3());
    s.traverse((m) => { if (m.isMesh) [].concat(m.material).forEach((mm) => (mm.userData.prop = true)); });
    const wrap = new THREE.Group(); s.position.sub(new THREE.Vector3(c.x, b.min.y, c.z)); wrap.add(s);
    wrap.userData.size = b.getSize(new THREE.Vector3());
    return [n, wrap];
  }));

  /* ---------- helpers ---------- */
  const shadowy = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  function rbox(w, h, d, mat, r = 0.01) {
    const rr = Math.max(0.0005, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
    const geometry = new RoundedBoxGeometry(w, h, d, 3, rr);
    // Each box face gets the same physical tile size, including deep side walls
    // and thin slab edges. A single BoxGeometry UV repeat stretches those faces.
    if (mat.userData.kitDimensions) {
      const [mapW, mapH] = mat.userData.kitDimensions;
      const p = geometry.attributes.position, n = geometry.attributes.normal, uv = geometry.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
        const u = nx > ny && nx > nz ? p.getZ(i) : p.getX(i);
        const v = ny > nx && ny > nz ? p.getZ(i) : p.getY(i);
        uv.setXY(i, u / mapW, v / mapH);
      }
    }
    return new THREE.Mesh(geometry, mat);
  }
  function put(parent, obj, x, y, z, ry = 0, rx = 0, rz = 0) {
    obj.position.set(x, y, z); obj.rotation.set(rx, ry, rz); shadowy(obj); parent.add(obj); return obj;
  }
  function model(name, parent, x, y, z, ry = 0, s = 1) {
    const o = models[name].clone(true); o.scale.setScalar(s); return put(parent, o, x, y, z, ry);
  }
  const ray = new THREE.Raycaster();
  // drop a model onto whatever support surface is below (x, z)
  function drop(name, parent, x, z, ry = 0, s = 1, fromY = 3) {
    root.updateMatrixWorld(true);
    ray.set(new THREE.Vector3(x, fromY, z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObjects(support, true)[0];
    return model(name, parent, x, hit ? hit.point.y : 0, z, ry, s);
  }
  function tube(pts, r, mat, seg = 48) {
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, 8, false), mat);
  }
  function sag(a, b, drop, r, mat) {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - drop, (a[2] + b[2]) / 2];
    return tube([a, m, b], r, mat, 40);
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
  }
  function decal(w, h, t, o = {}) {
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: o.roughness ?? 0.85, transparent: !!o.transparent,
      emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow ?? 0 });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.receiveShadow = true; return p;
  }
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
  const HINDI = '"Noto Sans Devanagari", sans-serif';
  const TELUGU = '"Noto Sans Telugu", sans-serif';
  const INDIC = '"Noto Sans Devanagari", "Noto Sans Telugu", sans-serif';
  function signText(c, text, x, y, maxWidth, fontSize, family = INDIC) {
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `700 ${fontSize}px ${family}`;
    const width = c.measureText(text).width;
    if (width > maxWidth) c.font = `700 ${Math.floor(fontSize * maxWidth / width)}px ${family}`;
    c.fillText(text, x, y); c.restore();
  }

  function agedPaint(color, initialSeed, metalness = 0.2) {
    let seed = initialSeed; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.fillStyle = '#' + color.toString(16).padStart(6, '0'); g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 95; i++) {
      const x = rnd() * 512, y = rnd() * 512, r = 3 + rnd() * 14;
      for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) {
        g.fillStyle = i % 3 ? 'rgba(58,49,36,0.24)' : 'rgba(200,185,145,0.38)';
        g.beginPath(); g.ellipse(x + ox, y + oy, r, r * 0.45, rnd() * Math.PI, 0, Math.PI * 2); g.fill();
      }
    }
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = i % 3 ? 'rgba(224,220,194,0.19)' : 'rgba(41,36,27,0.21)';
      g.fillRect(rnd() * 512, rnd() * 512, 0.5 + rnd() * 2, 0.5 + rnd() * 2);
    }
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 512, y = rnd() * 512;
      g.strokeStyle = i % 2 ? 'rgba(222,215,190,0.3)' : 'rgba(53,45,29,0.3)'; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + rnd() * 20, y + rnd() * 4); g.stroke();
    }
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = maxAniso;
    const m = M(0xffffff, { map, roughness: 0.84, metalness });
    m.userData.kitDimensions = [0.9, 0.9]; m.userData.weatherStrength = 0.85;
    return m;
  }

  /* ---------- materials ---------- */
  const mat = {
    pavers: null,
    facade: pbr('rounded_square_tiled_wall', 5, 3.4, { color: 0xCFE0E2, normal: 1.6 }),
    pillarTile: pbr('square_tiled_wall', 0.4, 4, { color: 0xEDE6D6 }),
    plaster: pbr('plastered_wall_02', 3, 3, { color: 0xC9D2D0 }),
    sidePlaster: pbr('plastered_wall_02', 2, 5, { color: 0xBAC6C6 }),
    shopWall: pbr('plastered_wall_02', 2.5, 2.5, { color: 0x8FAE9E }),
    floorTiles: pbr('square_tiles_02', 4, 2, { color: 0xD0C8BC }),
    shutter: pbr('painted_metal_shutter', 1, 2.4, { color: 0x6E95C8, metalness: 0.3 }),
    shutterShop: pbr('painted_metal_shutter', 2, 2.4, { color: 0x6E95C8, metalness: 0.3 }),
    greenMetal: pbr('green_metal_rust', 1, 1, { metalness: 0.4 }),
    wood: pbr('wood_table_worn', 2, 0.6),
    woodShelf: pbr('wood_table_worn', 1, 0.4, { color: 0x9A8270 }),
    safe: pbr('blue_metal_plate', 1, 1, { color: 0x56706A, metalness: 0.6 }),
    roof: pbr('concrete_floor_worn_001', 3, 2, { color: 0x9C9890 }),
    rust: pbr('rusty_painted_metal', 2, 1, { color: 0x8CCFC6, metalness: 0.45 }),
    band: pbr('plastered_wall_02', 6, 0.5, { color: 0xD9DEDA }),
    roofTeal: null,
    unitMetal: new THREE.MeshStandardMaterial({ color: 0xA7AEAB, roughness: 0.55, metalness: 0.3 }),
    baseGreen: M(0x2E6B4F, { roughness: 0.45 }),
    baseRed: M(0x9E2B25, { roughness: 0.45 }),
    baseWood: M(0x3A2A1E, { roughness: 0.55 }),
    pipe: M(0x8D9496, { roughness: 0.35, metalness: 0.7 }),
    pipeDark: M(0x4F5557, { roughness: 0.45, metalness: 0.6 }),
    cable: M(0x101010, { roughness: 0.5 }),
    iron: M(0x2D3A35, { roughness: 0.5, metalness: 0.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0A1418, roughness: 0.05, metalness: 0.0, clearcoat: 1, reflectivity: 0.6 }),
    plasticRed: new THREE.MeshPhysicalMaterial({ color: 0xB3221C, roughness: 0.35, clearcoat: 0.4 }),
    phoneBody: new THREE.MeshPhysicalMaterial({ color: 0x1A1C1F, roughness: 0.25, metalness: 0.6, clearcoat: 1 }),
    steel: M(0xC6CACD, { roughness: 0.25, metalness: 0.95 }),
    brass: M(0xC9A14A, { roughness: 0.3, metalness: 0.9 }),
    yellowPlastic: new THREE.MeshPhysicalMaterial({ color: 0xE0A531, roughness: 0.4, clearcoat: 0.3 }),
    black: M(0x151515, { roughness: 0.4 }),
  };


  // Seamless ceramic mosaics: shallow grout, subtle glaze variation and worn print.
  function kitTiles(o) {
    const N = 1024, cell = o.cell, grout = o.grout ?? 3;
    const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
    const b = document.createElement('canvas'); b.width = b.height = N; const gb = b.getContext('2d');
    const roughCanvas = document.createElement('canvas'); roughCanvas.width = roughCanvas.height = N; const grh = roughCanvas.getContext('2d');
    g.fillStyle = o.groutColor; g.fillRect(0, 0, N, N); gb.fillStyle = '#000'; gb.fillRect(0, 0, N, N);
    grh.fillStyle = '#F4F4F4'; grh.fillRect(0, 0, N, N);
    let seed = o.seed ?? 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let y = 0; y < N; y += cell) for (let x = 0; x < N; x += cell) {
      const base = o.colors[(rnd() * o.colors.length) | 0];
      const v = 0.96 + rnd() * 0.08;
      g.fillStyle = `rgb(${base[0] * v | 0},${base[1] * v | 0},${base[2] * v | 0})`;
      g.fillRect(x + grout / 2, y + grout / 2, cell - grout, cell - grout);
      const height = 208 + rnd() * 12 | 0;
      gb.fillStyle = `rgb(${height},${height},${height})`;
      gb.fillRect(x + grout / 2, y + grout / 2, cell - grout, cell - grout);
      g.strokeStyle = 'rgba(255,255,238,0.13)'; g.lineWidth = 1;
      g.strokeRect(x + grout / 2 + 1, y + grout / 2 + 1, cell - grout - 2, cell - grout - 2);
      const rough = 170 + rnd() * 45 | 0; grh.fillStyle = `rgb(${rough},${rough},${rough})`;
      grh.fillRect(x + grout / 2, y + grout / 2, cell - grout, cell - grout);
      if (o.wear && rnd() < 0.1) {
        // Small chipped corners and hairline cracks, rather than deep tile relief.
        g.fillStyle = '#A6A18C'; g.beginPath(); g.moveTo(x + 2, y + 2);
        g.lineTo(x + 4 + rnd() * 6, y + 2); g.lineTo(x + 2, y + 4 + rnd() * 7); g.fill();
        if (rnd() < 0.5) {
          g.strokeStyle = 'rgba(83,78,58,0.32)'; g.lineWidth = 0.7; g.beginPath();
          g.moveTo(x + cell * 0.22, y + 3); g.lineTo(x + cell * 0.38, y + cell * 0.46);
          g.lineTo(x + cell * 0.25, y + cell - 3); g.stroke();
        }
      }
    }
    // grime: soft dark blotches and vertical drips baked into the print
    for (let i = 0; i < (o.grime ?? 40); i++) {
      const x = rnd() * N, y = rnd() * N, r = 30 + rnd() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(62,57,43,0.10)'); gr.addColorStop(1, 'rgba(62,57,43,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < (o.drips ?? 26); i++) {
      const x = rnd() * N, y = rnd() * N * 0.6, w = 4 + rnd() * 14, h = 80 + rnd() * 320;
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(62,57,43,0.16)'); gr.addColorStop(1, 'rgba(62,57,43,0)');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
    }
    for (let i = 0; i < 22000; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,250,232,0.07)' : 'rgba(55,50,40,0.05)';
      g.fillRect(rnd() * N, rnd() * N, 1, 1);
    }
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = maxAniso;
    const bump = new THREE.CanvasTexture(b); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.anisotropy = maxAniso;
    const roughness = new THREE.CanvasTexture(roughCanvas); roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping; roughness.anisotropy = maxAniso;
    return { map, bump, roughness, metres: N / cell * o.size };
  }
  const WALL = kitTiles({ cell: 32, grout: 1.5, size: 0.105, groutColor: '#A5A393', colors: [[207, 203, 183], [201, 199, 181], [213, 208, 190], [193, 197, 180]], grime: 34, drips: 20 });
  const ROOF = kitTiles({ cell: 32, grout: 2, size: 0.11, groutColor: '#497F79', colors: [[78, 155, 145], [82, 163, 150], [86, 166, 154], [76, 157, 148]], grime: 24, drips: 0, seed: 23 });
  const UPPER_WALL = kitTiles({ cell: 32, grout: 1.8, size: 0.095, groutColor: '#92937F', colors: [[203, 198, 177], [194, 191, 173], [207, 200, 181], [185, 189, 169]], grime: 62, drips: 42, wear: true, seed: 53 });
  const PAVE = kitTiles({ cell: 128, grout: 5, size: 0.32, groutColor: '#262A28', colors: [[92, 98, 94], [84, 90, 88], [100, 104, 98], [78, 86, 84]], grime: 60, drips: 0, seed: 11 });
  function kitMat(T, w, h, color = 0xffffff, o = {}) {
    const rep = (t) => { const c = t.clone(); c.repeat.set(w / T.metres, h / T.metres); return c; };
    const material = new THREE.MeshStandardMaterial({ map: rep(T.map), bumpMap: rep(T.bump), roughnessMap: rep(T.roughness), bumpScale: o.bump ?? 0.006, color, roughness: o.roughness ?? 0.82, metalness: 0 });
    material.userData.kitDimensions = [w, h];
    material.userData.weatherStrength = 0.55;
    return material;
  }
  const ventTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#9BA19C'; c.fillRect(0, 0, w, h); c.fillStyle = '#2B302D'; for (let y = 18; y < h - 10; y += 22) c.fillRect(18, y, w - 36, 10); });
  const curtainTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = '#E9B46A'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) { c.fillStyle = i % 2 ? 'rgba(120,60,20,0.18)' : 'rgba(255,230,180,0.25)'; c.fillRect(i * 15, 0, 9, h); }
  });

  /* =====================================================================
     Corner shop layout (metres). Square-ish footprint at the back-left of a
     square plinth; the shop opens onto the front street (z+) and the side
     street (x+) around a corner post. Pavement wraps both streets.
     ===================================================================== */
  const X0 = -4.0, XL = -2.0, X1 = 1.2;   // left wing | main block | right face
  const ZB = -3.35, Z0 = 0.6;              // back face | front face
  const H1 = 3.0, EAVE = 4.55, OH = 0.35;  // ground storey, eave, upper-floor overhang
  const LWH = 3.5;                         // left wing height
  const AX1 = 2.45, AZ1 = -2.3, AH = 2.7;   // back-right annex
  const ZS = -1.6;                         // shop back wall
  const tileMat = (w, h, color = 0xffffff) => kitMat(WALL, Math.max(0.3, w), Math.max(0.3, h), color === 0xB4C0BE || color === 0xC4C9C2 ? 0xffffff : color);
  const plasterMat = (w, h, color = 0xB2BEBE) => pbr('plastered_wall_02', Math.max(0.5, w * 0.7), Math.max(0.5, h * 0.7), { color });

  function windowWithCage(parent, x, y, z, ry, lit, size = 1.0) {
    const g = new THREE.Group(); put(parent, g, x, y, z, ry); g.scale.setScalar(size);
    put(g, rbox(1.06, 1.06, 0.06, M(0xD8D4CA, { roughness: 0.5 }), 0.01), 0, 0, 0);
    const glass = put(g, new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.94), mat.glass.clone()), 0, 0, 0.032);
    if (lit) { const c = decal(0.92, 0.92, curtainTex, { glow: 1.2 }); c.position.z = 0.02; g.add(c); glass.material.transparent = true; glass.material.opacity = 0.35; }
    for (const xx of [-0.24, 0.24]) put(g, rbox(0.03, 0.94, 0.05, M(0xD8D4CA), 0.005), xx, 0, 0.04);
    const cage = new THREE.Group(); put(g, cage, 0, -0.02, 0.24);
    const bar = (w, h, d, bx, by, bz) => put(cage, rbox(w, h, d, mat.iron, 0.004), bx, by, bz);
    bar(1.2, 0.035, 0.46, 0, -0.56, 0); bar(1.2, 0.035, 0.46, 0, 0.58, 0);
    for (let i = 0; i <= 11; i++) bar(0.018, 1.14, 0.018, -0.59 + i * (1.18 / 11), 0.01, 0.22);
    for (const by of [-0.2, 0.25]) bar(1.2, 0.02, 0.02, 0, by, 0.22);
    for (const bx of [-0.59, 0.59]) for (let k = 0; k < 4; k++) bar(0.018, 1.14, 0.018, bx, 0.01, -0.18 + k * 0.13);
    return g;
  }
  // Matte, printed miniature canopies with fine cloth grain and shallow pressed ribs.
  function awningSurface(w, depth, initialSeed) {
    const width = Math.min(1536, Math.max(512, Math.round(w * 750)));
    const height = Math.max(256, Math.round(depth * 1100));
    const colorCanvas = document.createElement('canvas'); colorCanvas.width = width; colorCanvas.height = height;
    const bumpCanvas = document.createElement('canvas'); bumpCanvas.width = width; bumpCanvas.height = height;
    const roughCanvas = document.createElement('canvas'); roughCanvas.width = width; roughCanvas.height = height;
    const c = colorCanvas.getContext('2d'), b = bumpCanvas.getContext('2d'), r = roughCanvas.getContext('2d');
    let seed = initialSeed; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
    c.fillStyle = '#2F7656'; c.fillRect(0, 0, width, height);
    b.fillStyle = '#808080'; b.fillRect(0, 0, width, height);
    r.fillStyle = '#E8E8E8'; r.fillRect(0, 0, width, height);
    const faded = c.createLinearGradient(0, 0, 0, height);
    faded.addColorStop(0, 'rgba(14,43,29,0.19)'); faded.addColorStop(0.45, 'rgba(129,164,132,0.12)');
    faded.addColorStop(1, 'rgba(87,87,45,0.22)'); c.fillStyle = faded; c.fillRect(0, 0, width, height);
    // Fine interwoven fibres, rather than the old broad metallic normal-map stripes.
    for (let y = 0; y < height; y += 3) {
      c.fillStyle = y % 6 ? 'rgba(19,45,28,0.08)' : 'rgba(199,204,146,0.13)'; c.fillRect(0, y, width, 0.65);
      b.fillStyle = y % 6 ? '#797979' : '#898989'; b.fillRect(0, y, width, 0.6);
    }
    for (let x = 0; x < width; x += 4) {
      c.fillStyle = 'rgba(199,204,146,0.06)'; c.fillRect(x, 0, 0.6, height);
    }
    for (let i = 0; i < width * height / 22; i++) {
      const x = rnd() * width, y = rnd() * height;
      c.fillStyle = rnd() > 0.4 ? 'rgba(215,211,151,0.16)' : 'rgba(16,41,27,0.17)';
      c.fillRect(x, y, 0.5 + rnd() * 1.6, 0.5 + rnd() * 1.3);
    }
    // Peeling paint is concentrated at the exposed front edge and mounting corners.
    for (let i = 0; i < 170 * w; i++) {
      const x = rnd() * width, y = height * (0.78 + rnd() * 0.22), size = 1 + rnd() * 6;
      c.fillStyle = i % 4 ? 'rgba(174,171,114,0.48)' : 'rgba(58,51,29,0.52)';
      c.fillRect(x, y, size, 0.6 + rnd() * 2.5);
      b.fillStyle = '#626262'; b.fillRect(x, y, size, 1);
      r.fillStyle = '#FAFAFA'; r.fillRect(x, y, size, 3);
    }
    for (let i = 0; i < 18; i++) {
      const x = rnd() * width, y = rnd() * height, radius = 14 + rnd() * 55;
      const stain = c.createRadialGradient(x, y, 0, x, y, radius);
      stain.addColorStop(0, 'rgba(33,41,22,0.18)'); stain.addColorStop(1, 'rgba(33,41,22,0)');
      c.fillStyle = stain; c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    const texture = (canvas, srgb = false) => {
      const t = new THREE.CanvasTexture(canvas); t.anisotropy = maxAniso;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const m = M(0xBCCBC1, { map: texture(colorCanvas, true), bumpMap: texture(bumpCanvas), roughnessMap: texture(roughCanvas), bumpScale: 0.0012, roughness: 0.96, metalness: 0, side: THREE.DoubleSide });
    m.userData.weatherStrength = 0.5; return m;
  }
  function corrugated(w, d) {
    const geometry = new THREE.PlaneGeometry(w, d, Math.max(12, Math.ceil(w / 0.07) * 6), 6);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, Math.sin(x / 0.07 * Math.PI * 2) * 0.003 + Math.sin(x * 8 + y * 4) * 0.0015);
    }
    geometry.computeVertexNormals(); return geometry;
  }
  const awningFrame = agedPaint(0x365441, 277, 0.12);
  const awningCutEdge = agedPaint(0x9B9971, 281, 0);
  const awningPatch = agedPaint(0x3E4434, 283, 0.15);
  const awningBolt = M(0xB0B39B, { roughness: 0.7, metalness: 0.35 });
  const awningBoltGeometry = new THREE.SphereGeometry(1, 8, 6);
  const awningThread = M(0x93A38C, { roughness: 1 });
  const awningStitchGeometry = new THREE.BoxGeometry(0.011, 0.0018, 0.0015);
  let awningIndex = 0;
  // All dimensions are measured from the wall, so the hem and braces fit short and deep canopies.
  function awning(x, y, z, ry, w, depth = 0.7) {
    const g = new THREE.Group(); g.name = 'detailed-green-awning'; put(bld, g, x, y, z, ry);
    const pitch = 0.29, frontY = -depth * Math.sin(pitch), frontZ = depth * Math.cos(pitch);
    const roof = new THREE.Group(); roof.name = 'awning-pitched-cover'; put(g, roof, 0, 0, 0, 0, pitch);
    const surface = awningSurface(w, depth, 307 + awningIndex++ * 47);
    const cover = put(roof, new THREE.Mesh(corrugated(w, depth), surface), 0, 0, depth / 2, 0, -Math.PI / 2);
    cover.name = 'weathered-green-cover';
    // Exposed miniature card edges, folded hems, and underside cross members.
    for (const xx of [-w / 2, w / 2]) put(roof, rbox(0.019, 0.021, depth, awningCutEdge, 0.002), xx, -0.008, depth / 2);
    for (const zz of [0.012, depth / 2, depth - 0.013]) put(roof, rbox(w, 0.026, 0.025, awningFrame, 0.003), 0, -0.018, zz);
    put(roof, rbox(w + 0.025, 0.015, 0.02, awningFrame, 0.003), 0, 0.002, depth);
    const panels = Math.max(2, Math.ceil(w / 0.55));
    for (let i = 1; i < panels; i++) {
      const xx = -w / 2 + w * i / panels;
      put(roof, rbox(0.013, 0.009, depth - 0.022, awningFrame, 0.002), xx, 0.006, depth / 2);
    }
    // Scallops have slightly uneven cut edges and a pale, visible core along the thickness.
    const hang = Math.min(0.145, depth * 0.21 + 0.03), scallops = Math.max(6, Math.round(w / 0.09)), sw = w / scallops;
    const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0); shape.lineTo(w / 2, -hang * 0.58);
    for (let i = scallops; i > 0; i--) {
      const wear = Math.sin(i * 2.37) * 0.004;
      shape.quadraticCurveTo(-w / 2 + (i - 0.5) * sw, -hang * 1.37 + wear, -w / 2 + (i - 1) * sw, -hang * 0.58 + wear);
    }
    shape.closePath();
    const edgeGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.009, bevelEnabled: false });
    const uv = edgeGeo.attributes.uv, pos = edgeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / hang + 1);
    const hem = put(g, new THREE.Mesh(edgeGeo, [surface, awningCutEdge]), 0, frontY + 0.004, frontZ + 0.003);
    hem.name = 'scalloped-awning-hem';
    const stitchCount = Math.max(8, Math.floor(w / 0.034));
    const stitches = new THREE.InstancedMesh(awningStitchGeometry, awningThread, stitchCount);
    stitches.name = 'awning-hem-stitching';
    for (let i = 0; i < stitchCount; i++) {
      const xx = -w / 2 + w * (i + 0.5) / stitchCount;
      stitches.setMatrixAt(i, new THREE.Matrix4().makeTranslation(xx, frontY - 0.015, frontZ + 0.013));
    }
    stitches.instanceMatrix.needsUpdate = true; g.add(stitches);
    // Triangular iron supports with wall plates and screw heads.
    const brackets = w > 1.4 ? [-w / 2 + 0.08, 0, w / 2 - 0.08] : [-w / 2 + 0.055, w / 2 - 0.055];
    for (const xx of brackets) {
      put(g, rbox(0.048, 0.19 - frontY, 0.025, awningFrame, 0.004), xx, (frontY - 0.29) / 2, 0.022);
      put(g, tube([[xx, frontY - 0.22, 0.035], [xx, frontY - 0.025, frontZ - 0.04]], 0.009, awningFrame, 2), 0, 0, 0);
      put(g, tube([[xx, -0.03, 0.035], [xx, frontY - 0.025, frontZ - 0.04]], 0.008, awningFrame, 2), 0, 0, 0);
      for (const yy of [-0.08, frontY - 0.19]) put(g, new THREE.Mesh(awningBoltGeometry, awningBolt), xx, yy, 0.038).scale.set(0.006, 0.006, 0.003);
    }
    // Reinforcing tabs and instanced washers along the rear and front attachment lines.
    const washers = [], fastenerCount = Math.max(4, Math.ceil(w / 0.18));
    for (let i = 0; i < fastenerCount; i++) {
      const xx = -w / 2 + 0.06 + (w - 0.12) * i / (fastenerCount - 1);
      for (const zz of [0.035, depth - 0.035]) washers.push([xx, 0.008, zz]);
    }
    for (let i = 0; i < Math.max(1, Math.round(w / 0.9)); i++) {
      const xx = -w / 2 + w * (i + 0.5) / Math.max(1, Math.round(w / 0.9));
      put(roof, rbox(0.038, 0.006, 0.078, awningPatch, 0.002), xx, 0.008, depth * 0.27);
      washers.push([xx, 0.014, depth * 0.27]);
    }
    const fasteners = new THREE.InstancedMesh(awningBoltGeometry, awningBolt, washers.length);
    fasteners.name = 'awning-seam-fasteners';
    washers.forEach(([xx, yy, zz], i) => fasteners.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(xx, yy, zz), new THREE.Quaternion(), new THREE.Vector3(0.0055, 0.0025, 0.0055))));
    fasteners.instanceMatrix.needsUpdate = true; roof.add(fasteners);
    g.userData.cover = cover; g.userData.hem = hem;
    return g;
  }
  function lightbox(parent, x, y, z, ry, w, h, tex, glow = 0.3) {
    const g = new THREE.Group(); put(parent, g, x, y, z, ry);
    put(g, rbox(w, h, 0.22, M(0xE9E4DA, { roughness: 0.4 }), 0.03), 0, 0, 0);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, h - 0.06), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow, roughness: 0.3 }));
    face.material.color.setHex(0xD9D6CF); face.position.z = 0.111; g.add(face); g.userData.face = face; return g;
  }
  // miniature-kit furniture: oversized, chunky, thick cut edges
  const stoolRed = new THREE.MeshPhysicalMaterial({ color: 0xB0241E, roughness: 0.42, clearcoat: 0.3 });
  const stoolDark = new THREE.MeshStandardMaterial({ color: 0x7E1A16, roughness: 0.6 });
  function plasticStool(x, z, ry) {
    const s = new THREE.Group(); put(root, s, x, 0, z, ry);
    put(s, rbox(0.46, 0.09, 0.46, stoolRed, 0.03), 0, 0.6, 0);
    put(s, rbox(0.4, 0.03, 0.4, stoolDark, 0.01), 0, 0.545, 0);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) put(s, rbox(0.075, 0.56, 0.075, stoolRed, 0.015), lx, 0.28, lz);
    for (const r of [0, Math.PI / 2]) { const bar = new THREE.Group(); put(s, bar, 0, 0.2, 0, r); for (const d of [-0.18, 0.18]) put(bar, rbox(0.36, 0.05, 0.05, stoolRed, 0.01), 0, 0, d); }
  }
  const tableTop = pbr('wood_table_worn', 1, 0.7, { color: 0x6B5446 });
  const tableLeg = new THREE.MeshStandardMaterial({ color: 0x3B3A36, roughness: 0.6, metalness: 0.2 });
  function foldTable(x, z, ry) {
    const t = new THREE.Group(); put(root, t, x, 0, z, ry);
    const top = put(t, rbox(1.15, 0.07, 0.78, tableTop, 0.02), 0, 0.92, 0); support.push(top);
    put(t, rbox(1.08, 0.08, 0.7, tableLeg, 0.01), 0, 0.85, 0);
    for (const sx of [-1, 1]) for (const tz of [0.26, -0.26]) put(t, rbox(0.07, 1.05, 0.07, tableLeg, 0.015), 0.28 * sx, 0.46, tz, 0, 0, sx * 0.5);
    for (const tz of [0.26, -0.26]) put(t, rbox(0.12, 0.12, 0.1, tableLeg, 0.02), 0, 0.46, tz);
  }
  function displayCase(parent, x, z, ry) {
    const cab = new THREE.Group(); put(parent, cab, x, 0.06, z, ry);
    put(cab, rbox(0.74, 0.5, 0.42, mat.woodShelf, 0.015), 0, 0.25, 0);
    put(cab, rbox(0.74, 0.04, 0.42, mat.iron, 0.008), 0, 1.66, 0);
    for (const cx of [-0.36, 0.36]) put(cab, rbox(0.025, 1.18, 0.42, mat.iron, 0.006), cx, 1.08, 0);
    const gl = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.18 });
    const pane = put(cab, new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.16, 0.4), gl), 0, 1.08, 0); pane.castShadow = false;
    const shelves = [];
    for (const sy of [0.5, 0.88, 1.26]) { const s = put(cab, rbox(0.7, 0.012, 0.38, M(0xDDE6E4, { roughness: 0.1, transparent: true, opacity: 0.5 }), 0.003), 0, sy, 0); s.castShadow = false; shelves.push(sy); }
    // little phones and gadgets on the glass shelves
    shelves.forEach((sy, i) => {
      for (let k = 0; k < 4; k++) {
        const ph = put(cab, rbox(0.06, 0.12, 0.012, mat.phoneBody, 0.01), -0.24 + k * 0.16, 0.06 + sy + 0.06, 0.02, 0, -0.2);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.052, 0.105), new THREE.MeshStandardMaterial({ color: 0x0B1418, emissive: [0x7FE3FF, 0xFFB868, 0xFF4D6D, 0xB8E986][(i + k) % 4], emissiveIntensity: 0.25, roughness: 0.1 }));
        scr.position.z = 0.0065; ph.add(scr);
      }
    });
    const l = new THREE.PointLight(0xFFF1DC, 0.6, 1.6, 2); l.position.set(0, 1.55, 0.05); cab.add(l);
    return cab;
  }

  /* ---------- plinth + L-shaped pavement ---------- */
  const padDepth = Z0 - ZB + 2.2, padZ = (ZB + 2.0) / 2;
  const pave = put(root, rbox(8.4, 0.2, padDepth, kitMat(PAVE, 8.4, padDepth), 0.02), -0.2, -0.1, padZ); support.push(pave);
  put(root, rbox(8.43, 0.025, padDepth + 0.03, mat.baseRed, 0.006), -0.2, -0.2, padZ);
  put(root, rbox(8.46, 0.07, padDepth + 0.06, mat.baseGreen, 0.01), -0.2, -0.25, padZ);
  const kerb = M(0x8E8A82, { roughness: 0.8 });
  put(root, rbox(8.4, 0.05, 0.2, kerb, 0.01), -0.2, 0.025, 2.3);
  put(root, rbox(0.2, 0.05, padDepth, kerb, 0.01), 3.9, 0.025, padZ);
  const drain = put(root, rbox(0.5, 0.012, 0.3, mat.iron, 0.004), 1.0, 0.006, 2.05);
  const manhole = put(root, new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.015, 40), M(0x3E4140, { roughness: 0.6, metalness: 0.5 })), 3.2, 0.008, -0.6);

  const bld = new THREE.Group(); root.add(bld);

  /* ---------- left wing: tall single storey, flat roof stacked with units ---------- */
  const lwW = XL - X0, lwX = (X0 + XL) / 2, depth = Z0 - ZB, midZ = (Z0 + ZB) / 2;
  // The outer left wing has its own low eave and rising cap, as marked in the reference.
  const leftCapFrontZ = Z0 + 0.15, leftCapBackZ = Z0 - 1.35;
  const leftLowY = LWH - 0.29, leftHighY = LWH + 0.18, leftCapWidth = 0.52;
  const leftProfile = new THREE.Shape();
  leftProfile.moveTo(Z0, 0); leftProfile.lineTo(ZB, 0); leftProfile.lineTo(ZB, leftHighY);
  leftProfile.lineTo(leftCapBackZ, leftHighY); leftProfile.lineTo(Z0, leftLowY); leftProfile.closePath();
  const leftGeo = new THREE.ExtrudeGeometry(leftProfile, { depth: 0.15, bevelEnabled: false });
  const leftUV = leftGeo.attributes.uv, leftPos = leftGeo.attributes.position;
  for (let i = 0; i < leftPos.count; i++) leftUV.setXY(i, leftPos.getX(i) / depth, leftPos.getY(i) / LWH);
  put(bld, new THREE.Mesh(leftGeo, tileMat(depth, LWH)), X0 + 0.075, 0, 0, -Math.PI / 2);
  const leftCap = new THREE.Group(); leftCap.name = 'left-wing-sloping-cap';
  const leftRun = leftCapFrontZ - leftCapBackZ, leftRise = leftHighY - leftLowY, leftLength = Math.hypot(leftRun, leftRise);
  put(bld, leftCap, X0 + 0.1, (leftLowY + leftHighY) / 2 + 0.035, (leftCapFrontZ + leftCapBackZ) / 2, 0, Math.atan2(leftRise, leftRun));
  const leftCapPaint = agedPaint(0x58766A, 193, 0.1), leftCutEdge = agedPaint(0x655A4C, 181, 0.05);
  put(leftCap, rbox(leftCapWidth, 0.09, leftLength, leftCapPaint, 0.006), 0, 0, 0);
  for (const xx of [-leftCapWidth / 2, leftCapWidth / 2]) put(leftCap, rbox(0.035, 0.1, leftLength + 0.08, leftCutEdge, 0.003), xx, 0, 0);
  put(leftCap, rbox(leftCapWidth + 0.06, 0.09, 0.05, leftCutEdge, 0.004), 0, 0, leftLength / 2);
  put(bld, rbox(leftCapWidth, 0.09, leftCapBackZ - ZB + 0.08, leftCapPaint, 0.006), X0 + 0.1, leftHighY + 0.035, (leftCapBackZ + ZB) / 2);
  put(bld, rbox(lwW, LWH, 0.15, plasterMat(lwW, LWH), 0.01), lwX, LWH / 2, ZB);
  put(bld, rbox(lwW - 0.26, 0.5, 0.2, tileMat(lwW - 0.26, 0.5), 0.012), lwX + 0.18, 3.25, Z0);
  put(bld, rbox(lwW - 0.22, 0.14, 0.3, mat.band, 0.012), lwX + 0.19, LWH + 0.06, Z0);
  for (const [x, w] of [[X0 + 0.05, 0.2], [-2.9, 0.14], [XL - 0.02, 0.2]]) put(bld, rbox(w, 2.88, 0.26, tileMat(w, 2.88), 0.015), x, 1.44, Z0);
  const lwRoof = put(bld, rbox(lwW - 0.32, 0.16, depth + 0.1, mat.roof, 0.012), lwX + 0.21, LWH + 0.08, midZ); support.push(lwRoof);
  // Keep the raised rim behind the left ramp so it cannot hide the sloping silhouette.
  put(bld, rbox(0.1, 0.15, leftCapBackZ - ZB + 0.08, leftCutEdge, 0.008), X0 - 0.16, leftHighY + 0.08, (leftCapBackZ + ZB) / 2);
  put(leftCap, rbox(0.1, 0.15, leftLength + 0.06, leftCutEdge, 0.008), -leftCapWidth / 2, 0.04, 0);
  put(bld, rbox(lwW + 0.1, 0.36, 0.14, mat.band, 0.02), lwX, LWH + 0.3, ZB);
  const louvre = (x, y, z, ry = 0) => {
    const g = new THREE.Group(); put(bld, g, x, y, z, ry);
    put(g, rbox(0.74, 0.4, 0.06, mat.greenMetal, 0.01), 0, 0, -0.02);
    for (let i = 0; i < 6; i++) put(g, rbox(0.66, 0.012, 0.075, M(0x2F6B4F, { roughness: 0.5, metalness: 0.3 }), 0.004), 0, -0.15 + i * 0.06, 0.03, 0, 0.6);
  };
  louvre(-3.45, 3.24, Z0 + 0.12); louvre(-2.5, 3.24, Z0 + 0.12);
  const unit = (x, y, z, w, h, d, ry = 0) => {
    const g = new THREE.Group(); put(bld, g, x, y, z, ry);
    put(g, rbox(w, h, d, mat.unitMetal, 0.03), 0, h / 2, 0);
    const gr = decal(w * 0.82, h * 0.7, ventTex); gr.position.set(0, h / 2, d / 2 + 0.003); g.add(gr);
    put(g, rbox(w + 0.04, 0.04, d + 0.04, mat.iron, 0.01), 0, h, 0);
    return g;
  };
  const RY = LWH + 0.16;
  const utilityCream = agedPaint(0xC4C3AF, 29, 0.14);
  utilityCream.userData.weatherStrength = 0.85;
  const utilityBlue = agedPaint(0x3A7076, 41, 0.22);
  utilityBlue.userData.weatherStrength = 0.75;
  function rooftopStack(x, z, h) {
    const stack = new THREE.Group(); stack.name = 'stacked-rooftop-utility'; put(bld, stack, x, RY, z);
    for (let i = 0; i < 3; i++) {
      const sh = h / 3, yy = sh * (i + 0.5);
      put(stack, rbox(0.62, sh - 0.025, 0.55, utilityCream, 0.008), 0, yy, 0);
      put(stack, rbox(0.085, sh, 0.58, utilityBlue, 0.004), 0.24, yy, 0);
      put(stack, rbox(0.69, 0.065, 0.62, utilityCream, 0.004), 0, sh * i + 0.045, 0.012);
      for (const xx of [-0.2, -0.14, -0.08]) put(stack, rbox(0.021, 0.045, 0.012, mat.pipeDark, 0.003), xx, sh * i + 0.13, 0.287);
      put(stack, rbox(0.075, 0.095, 0.08, utilityBlue, 0.004), -0.3, yy, 0.24);
      put(stack, rbox(0.11, 0.055, 0.045, mat.iron, 0.004), 0.21, yy + sh * 0.25, 0.29);
    }
    put(stack, rbox(0.69, 0.07, 0.61, mat.roof, 0.006), 0, h + 0.025, 0);
  }
  rooftopStack(-3.32, -0.38, 1.27); rooftopStack(-2.55, -0.43, 1.32);
  unit(-3.15, RY, -1.45, 0.8, 0.5, 0.48);
  put(bld, tube([[-3.5, RY + 0.6, 0.25], [-3.5, RY + 0.7, 0.55], [-3.5, RY - 0.05, Z0 + 0.14], [-3.1, RY - 0.05, Z0 + 0.16], [XL, RY - 0.05, Z0 + 0.16]], 0.035, mat.pipe, 40), 0, 0, 0);
  put(bld, tube([[-2.7, RY + 0.5, 0.25], [-2.7, RY + 0.4, Z0 + 0.1], [-2.7, RY - 0.15, Z0 + 0.2], [XL, RY - 0.15, Z0 + 0.2]], 0.03, mat.pipeDark, 40), 0, 0, 0);
  put(bld, tube([[-3.8, RY, ZB + 0.3], [-3.8, RY + 2.1, ZB + 0.3]], 0.015, mat.pipeDark, 4), 0, 0, 0);
  put(bld, tube([[-4.05, RY + 1.85, ZB + 0.3], [-3.55, RY + 1.85, ZB + 0.3]], 0.01, mat.pipeDark, 4), 0, 0, 0);
  // shutter bay + glass cabinet bay
  put(bld, rbox(0.86, 2.5, 0.04, mat.shutter, 0.004), -3.43, 1.27, Z0 - 0.1);
  put(bld, rbox(0.9, 0.3, 0.32, mat.greenMetal, 0.02), -3.43, 2.66, Z0 - 0.04);
  put(bld, rbox(0.86, 0.06, 0.07, M(0x5D6E7E, { metalness: 0.5, roughness: 0.4 }), 0.01), -3.43, 0.06, Z0 - 0.08);
  put(bld, rbox(0.07, 0.06, 0.03, mat.brass, 0.008), -3.43, 0.11, Z0 - 0.04);
  const poster = (w, h, draw, x, y, z, ry = 0, rz = 0) => { const p = decal(w, h, canvasTex(Math.round(w * 1000), Math.round(h * 1000), draw)); p.position.set(x, y, z); p.rotation.set(0, ry, rz); bld.add(p); return p; };
  poster(0.36, 0.5, (c, w, h) => {
    c.fillStyle = '#F2E9D3'; c.fillRect(0, 0, w, h); c.fillStyle = '#B3221C'; c.fillRect(0, 0, w, 110);
    c.fillStyle = '#F2E9D3'; c.textAlign = 'center'; signText(c, 'मोबाइल रिपेयर', w / 2, 62, w - 28, 50, HINDI);
    c.fillStyle = '#1B1A17'; c.font = '600 30px "IBM Plex Mono", monospace'; c.fillText('PHONE REPAIR', w / 2, 165);
    c.font = '400 24px "IBM Plex Mono", monospace'; ['SCREENS', 'BATTERIES', 'CHARGING PORTS', 'WATER DAMAGE'].forEach((t, i) => c.fillText(t, w / 2, 230 + i * 42));
    c.fillStyle = '#B3221C'; c.font = '700 40px "IBM Plex Mono", monospace'; c.fillText('ASK INSIDE', w / 2, 460);
  }, -3.55, 1.45, Z0 - 0.076, 0, 0.02);
  poster(0.28, 0.2, (c, w, h) => { c.fillStyle = '#E8D36A'; c.fillRect(0, 0, w, h); c.fillStyle = '#1B1A17'; c.textAlign = 'center'; signText(c, 'కొనుగోలు', w / 2, 68, w - 22, 52, TELUGU); c.font = '600 24px "IBM Plex Mono", monospace'; c.fillText('OLD CONSOLES', w / 2, 140); c.fillText('& TVs', w / 2, 175); }, -3.2, 1.85, Z0 - 0.076, 0, -0.05);
  put(bld, rbox(0.8, 2.84, 0.04, mat.shopWall, 0.005), -2.45, 1.44, Z0 - 0.5);
  displayCase(bld, -2.45, Z0 - 0.25, 0);
  awning(-3.43, 2.9, Z0, 0, 1.0); awning(-2.45, 2.84, Z0, 0, 0.95);
  // left side face: sunburst grille, caged window, power box
  const sun = new THREE.Group(); put(bld, sun, X0 - 0.09, 2.95, -0.6, -Math.PI / 2);
  for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; put(sun, rbox(0.016, 0.62, 0.016, mat.iron, 0.004), Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0, 0, 0, a - Math.PI / 2); }
  put(sun, new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.014, 8, 48, Math.PI), mat.iron), 0, 0, 0);
  put(sun, new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 32, Math.PI), mat.iron), 0, 0, 0);
  put(sun, rbox(1.3, 0.03, 0.03, mat.iron, 0.006), 0, 0, 0);
  windowWithCage(bld, X0 - 0.08, 1.9, -2.0, -Math.PI / 2, true);
  model('power_box_01', bld, X0 - 0.26, 1.2, -3.2, -Math.PI / 2, 0.8);
  model('exterior_aircon_unit', bld, X0 - 0.3, 2.75, -2.0, -Math.PI / 2, 0.34);
  model('utility_box_01', root, -4.2, 0, 0.75, Math.PI / 2, 0.6);
  put(bld, tube([[X0 - 0.08, LWH + 0.3, Z0 + 0.08], [X0 - 0.08, 0.2, Z0 + 0.08], [X0 - 0.08, 0.08, Z0 + 0.3]], 0.045, mat.pipe, 40), 0, 0, 0);

  /* ---------- left service recess and sloping louvre hoods from the reference ---------- */
  const serviceRecess = new THREE.Group(); serviceRecess.name = 'left-pipe-and-meter-recess';
  put(bld, serviceRecess, X0 + 0.1, 0, Z0 + 0.16);
  const recessFrame = agedPaint(0x586453, 211, 0.1), meterHousing = agedPaint(0xB9BAA7, 223, 0.15);
  put(serviceRecess, rbox(0.38, 1.63, 0.035, M(0x293B35, { roughness: 0.95 }), 0.004), 0, 1.49, 0);
  for (const xx of [-0.2, 0.2]) put(serviceRecess, rbox(0.028, 1.74, 0.1, recessFrame, 0.004), xx, 1.49, 0.025);
  const meterPrint = canvasTex(256, 320, (c, w, h) => {
    c.fillStyle = '#B8BDAE'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#D3D4BF'; c.beginPath(); c.arc(128, 121, 94, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#596658'; c.lineWidth = 7; c.stroke();
    c.lineWidth = 2; for (let i = 0; i < 40; i++) {
      const a = i * Math.PI / 20; c.beginPath(); c.moveTo(128 + Math.cos(a) * 73, 121 + Math.sin(a) * 73);
      c.lineTo(128 + Math.cos(a) * 85, 121 + Math.sin(a) * 85); c.stroke();
    }
    c.fillStyle = '#3A453B'; c.fillRect(76, 92, 108, 38); c.fillStyle = '#D9D7B9';
    c.font = '700 22px monospace'; c.fillText('03827', 87, 119);
    c.strokeStyle = '#8E3C2C'; c.lineWidth = 4; c.beginPath(); c.moveTo(128, 142); c.lineTo(158, 164); c.stroke();
    c.fillStyle = '#3F4C43'; c.font = '700 22px monospace'; c.fillText('220V', 24, 276);
    c.fillStyle = '#976444'; c.fillRect(210, 276, 13, 22);
  });
  for (const [i, yy] of [2.08, 1.68, 1.28].entries()) {
    put(serviceRecess, rbox(0.25, 0.31, 0.105, meterHousing, 0.012), 0, yy, 0.05);
    const face = decal(0.205, 0.26, meterPrint); face.position.set(0, yy, 0.104); serviceRecess.add(face);
    put(serviceRecess, rbox(0.05, 0.025, 0.015, mat.iron, 0.003), 0.07, yy - 0.13, 0.113);
    for (const xx of [-0.095, 0.095]) put(serviceRecess, new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), mat.pipeDark), xx, yy + 0.12, 0.106);
    put(serviceRecess, tube([[-0.11, yy - 0.14, 0.03], [-0.15, yy - 0.22, 0.03], [-0.15, yy - 0.34, 0.03]], 0.014, mat.pipeDark, 8), 0, 0, 0);
  }
  const leftDrain = agedPaint(0x547E76, 239, 0.18);
  put(bld, tube([[X0 - 0.08, leftLowY - 0.11, Z0 + 0.2], [X0 - 0.24, leftLowY - 0.12, Z0 + 0.23], [X0 - 0.23, 2.82, Z0 + 0.24], [X0 - 0.07, 2.64, Z0 + 0.25], [X0 - 0.07, 0.35, Z0 + 0.25]], 0.053, leftDrain, 40), 0, 0, 0);
  for (const yy of [0.78, 1.55, 2.5]) {
    put(bld, new THREE.Mesh(new THREE.CylinderGeometry(0.061, 0.061, 0.075, 12), recessFrame), X0 - 0.07, yy, Z0 + 0.25);
    put(bld, rbox(0.12, 0.028, 0.04, mat.pipe, 0.004), X0 - 0.04, yy, Z0 + 0.19);
  }
  const recessAwning = awning(X0 + 0.1, 2.58, Z0 + 0.12, 0, 0.53, 0.43);
  recessAwning.name = 'left-service-awning';
  const hoodFrame = agedPaint(0x3C7163, 263, 0.2);
  for (const xx of [-3.45, -2.5]) {
    const hood = new THREE.Group(); hood.name = 'left-sloped-glass-louvre-hood';
    put(bld, hood, xx, 3.43, Z0 + 0.26, 0, 0.55);
    const glazing = new THREE.MeshPhysicalMaterial({ color: 0x1C4E46, roughness: 0.37, metalness: 0.15, transparent: true, opacity: 0.82, clearcoat: 0.35 });
    put(hood, rbox(0.85, 0.016, 0.37, glazing, 0.003), 0, 0, 0);
    for (const hx of [-0.45, 0.45]) put(hood, rbox(0.035, 0.04, 0.44, hoodFrame, 0.005), hx, 0.01, 0);
    for (const hz of [-0.21, 0.21]) put(hood, rbox(0.94, 0.04, 0.035, hoodFrame, 0.005), 0, 0.01, hz);
    for (const hx of [-0.16, 0.16]) put(hood, rbox(0.022, 0.035, 0.4, hoodFrame, 0.003), hx, 0.013, 0);
    for (const hx of [-0.43, 0.43]) for (const hz of [-0.18, 0.18]) put(hood, new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), mat.pipe), hx, 0.034, hz);
  }

  /* ---------- main block: ground-floor corner shop ---------- */
  const mbW = X1 - XL, mbX = (XL + X1) / 2;
  const shopFloor = put(bld, rbox(mbW, 0.06, Z0 - ZB, mat.floorTiles, 0.005), mbX, 0.03, midZ); support.push(shopFloor);
  put(bld, rbox(mbW, 0.08, Z0 - ZS, M(0x6E6A62, { roughness: 0.9 }), 0.005), mbX, H1 - 0.12, (Z0 + ZS) / 2);
  put(bld, rbox(mbW - 0.1, 2.84, 0.04, mat.shopWall, 0.005), mbX, 1.44, ZS);
  put(bld, rbox(0.04, 2.84, Z0 - ZS, mat.shopWall, 0.005), XL + 0.08, 1.44, (Z0 + ZS) / 2);
  const post = put(bld, rbox(0.22, H1, 0.22, tileMat(0.22, H1), 0.02), X1 - 0.09, H1 / 2, Z0 - 0.09);
  // ground-floor solid walls behind the shop (right face) + back face
  put(bld, rbox(0.15, H1, ZS - ZB, plasterMat(ZS - ZB, H1), 0.01), X1, H1 / 2, (ZS + ZB) / 2);
  put(bld, rbox(mbW, H1 + 0.16, 0.15, plasterMat(mbW, H1), 0.01), mbX, (H1 + 0.16) / 2, ZB);
  // first-floor slab with overhang on both streets
  put(bld, rbox(mbW + OH + 0.1, 0.28, depth + OH + 0.05, mat.band, 0.03), mbX + OH / 2, H1 + 0.02, midZ + OH / 2);
  for (const bx of [XL + 0.2, -0.4, X1 - 0.1]) put(bld, rbox(0.12, 0.26, OH + 0.08, mat.band, 0.02), bx, H1 - 0.24, Z0 + OH / 2);
  for (const bz of [-0.6, ZS, -3.2]) put(bld, rbox(OH + 0.08, 0.26, 0.12, mat.band, 0.02), X1 + OH / 2, H1 - 0.24, bz);

  /* ---------- the shop interior ---------- */
  const shop = new THREE.Group(); bld.add(shop);
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0xF2FBFF, emissive: 0xE6F6FF, emissiveIntensity: 0.2 });
  put(shop, new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 1.2, 6, 16), tubeMat), -0.4, H1 - 0.22, ZS + 0.3, 0, 0, Math.PI / 2);
  put(shop, rbox(1.3, 0.04, 0.08, M(0xDDDDDD), 0.01), -0.4, H1 - 0.18, ZS + 0.3);
  const tubeLight = new THREE.PointLight(0xDDF2FF, 0, 0, 2); tubeLight.position.set(-0.4, H1 - 0.4, ZS + 0.6); shop.add(tubeLight);
  const bulbs = [];
  for (const [bx, len] of [[-1.1, 0.5], [0.2, 0.62]]) {
    put(shop, tube([[bx, H1 - 0.16, -0.2], [bx, H1 - 0.16 - len, -0.2]], 0.004, mat.cable, 2), 0, 0, 0);
    put(shop, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.06, 20), M(0x2A2A2A, { metalness: 0.5 })), bx, H1 - 0.19 - len, -0.2);
    const b = model('lightbulb_01', shop, bx, H1 - 0.22 - len, -0.2, 0, 1); b.rotation.x = Math.PI;
    b.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.material = m.material.clone(); m.material.emissive = new THREE.Color(0xFFC27A); m.material.emissiveIntensity = 0.1; bulbs.push(m.material); } });
  }
  const bulbLight = new THREE.PointLight(0xFFB466, 0, 0, 2); bulbLight.position.set(-0.45, 2.05, -0.2);
  bulbLight.castShadow = true; bulbLight.shadow.mapSize.set(1024, 1024); bulbLight.shadow.radius = 5; bulbLight.shadow.bias = -0.003; bulbLight.shadow.camera.near = 0.05;
  shop.add(bulbLight);
  // back wall: shelving, TV bracket, drawers, corkboard
  const shelves = model('steel_frame_shelves_01', shop, -1.3, 0.06, ZS + 0.27, 0, 0.98); shelves.traverse((m) => { if (m.isMesh) support.push(m); });
  const bracket = put(shop, rbox(0.72, 0.04, 0.52, mat.woodShelf, 0.01), 0.45, 1.66, ZS + 0.28); support.push(bracket);
  for (const bx of [0.18, 0.72]) put(shop, rbox(0.03, 0.22, 0.4, mat.iron, 0.005), bx, 1.55, ZS + 0.2);
  const tv = drop('Television_01', shop, 0.45, ZS + 0.28, -0.1, 1.0);
  const drawers = drop('vintage_wooden_drawer_01', shop, 0.5, ZS + 0.27, 0, 0.95); drawers.traverse((m) => { if (m.isMesh) support.push(m); });
  put(shop, rbox(0.52, 0.4, 0.03, mat.woodShelf, 0.008), -0.38, 1.12, ZS + 0.04);
  put(shop, rbox(0.48, 0.36, 0.012, M(0xA77B4F, { roughness: 1 }), 0.004), -0.38, 1.12, ZS + 0.056);
  const ticketTex = canvasTex(256, 336, (c, w, h) => {
    c.fillStyle = '#EFE6D2'; c.fillRect(0, 0, w, h); c.fillStyle = '#A8322A'; c.fillRect(0, 0, w, 50);
    c.fillStyle = '#EFE6D2'; c.font = '600 26px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.fillText('JOB TICKET', w / 2, 34);
    c.fillStyle = '#B7AC96'; [[70, 190], [100, 150], [130, 210], [160, 120], [210, 180], [240, 140]].forEach(([y, l]) => c.fillRect(26, y, l, 8));
    c.fillStyle = '#A8322A'; c.font = '700 44px Kalam, cursive'; c.textAlign = 'left'; c.fillText('Ephileo', 26, 312);
  });
  const ticket = decal(0.12, 0.16, ticketTex); ticket.position.set(-0.27, 1.13, ZS + 0.065); ticket.rotation.z = -0.07; shop.add(ticket);
  const cal = decal(0.13, 0.17, canvasTex(160, 200, (c, w, h) => { c.fillStyle = '#EFE6D2'; c.fillRect(0, 0, w, h); c.fillStyle = '#A8322A'; c.fillRect(0, 0, w, 40); c.fillStyle = '#EFE6D2'; c.font = '600 22px "IBM Plex Mono", monospace'; c.textAlign = 'center'; signText(c, 'अक्टूबर · OCT', w / 2, 23, w - 12, 22, HINDI); c.fillStyle = '#B7AC96'; for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) c.fillRect(14 + k * 28, 58 + r * 34, 20, 20); }));
  cal.position.set(-0.5, 1.15, ZS + 0.064); cal.rotation.z = 0.05; shop.add(cal);
  const wallCalendar = decal(0.36, 0.5, canvasTex(360, 500, (c, w, h) => { c.fillStyle = '#F4EFE4'; c.fillRect(0, 0, w, h); c.fillStyle = '#B3221C'; c.textAlign = 'center'; signText(c, 'శుభం', w / 2, 126, w - 40, 100, TELUGU); c.fillStyle = '#1B1A17'; c.font = '600 30px "IBM Plex Mono", monospace'; c.fillText('2026', w / 2, 230); c.fillStyle = '#C9C0AE'; for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) c.fillRect(30 + k * 44, 270 + r * 42, 30, 28); }));
  wallCalendar.position.set(XL + 0.105, 1.85, 0.1); wallCalendar.rotation.y = Math.PI / 2; shop.add(wallCalendar);
  // wall telephone on the left wall, facing the side opening — Contact
  const wallPhone = model('vintage_telephone_wall_clock', shop, XL + 0.18, 1.3, -0.75, Math.PI / 2, 0.85);
  // front counter
  const counter = new THREE.Group(); shop.add(counter);
  const CZ = 0.12, CX0 = -1.75, CX1 = 0.35, cX = (CX0 + CX1) / 2, cW = CX1 - CX0;
  const top = put(counter, rbox(cW, 0.05, 0.64, mat.wood, 0.012), cX, 0.92, CZ); support.push(top);
  for (const lx of [CX0 + 0.05, CX1 - 0.05]) for (const lz of [CZ + 0.27, CZ - 0.27]) put(counter, rbox(0.05, 0.86, 0.05, mat.iron, 0.008), lx, 0.49, lz);
  const low = put(counter, rbox(cW - 0.05, 0.03, 0.58, mat.woodShelf, 0.008), cX, 0.24, CZ); support.push(low);
  put(counter, rbox(cW, 0.12, 0.02, mat.wood, 0.005), cX, 0.84, CZ + 0.32);
  // safe — Escape Game
  const safe = new THREE.Group(); put(counter, safe, -0.05, 0.255, CZ - 0.01, -0.12);
  put(safe, rbox(0.46, 0.46, 0.42, mat.safe, 0.03), 0, 0.23, 0);
  put(safe, rbox(0.38, 0.38, 0.02, mat.safe, 0.015), 0, 0.23, 0.215);
  const dial = new THREE.Group(); put(safe, dial, 0, 0.28, 0.232);
  put(dial, new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 48), mat.steel), 0, 0, 0, 0, Math.PI / 2);
  put(dial, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 24), M(0x777777, { metalness: 0.9, roughness: 0.3 })), 0, 0, 0.01, 0, Math.PI / 2);
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; put(dial, rbox(0.002, i % 6 ? 0.007 : 0.012, 0.002, mat.black, 0.0005), Math.cos(a) * 0.046, Math.sin(a) * 0.046, 0.0135, 0, 0, a + Math.PI / 2); }
  const handle = new THREE.Group(); put(safe, handle, 0.11, 0.15, 0.235);
  put(handle, new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 24), mat.steel), 0, 0, 0, 0, Math.PI / 2);
  put(handle, new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.07, 6, 12), mat.steel), 0, -0.045, 0.015);
  put(safe, rbox(0.1, 0.028, 0.004, mat.brass, 0.002), 0, 0.08, 0.227);
  for (const hy of [0.12, 0.34]) put(safe, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 16), mat.steel), -0.2, hy, 0.215);
  root.updateMatrixWorld(true);
  drop('metal_toolbox', counter, -0.7, CZ, 0.15, 0.95);
  drop('plastic_crate_02', counter, -1.3, CZ, 0.05, 0.8);
  drop('bench_vice_01', counter, -1.55, CZ - 0.05, 0.35, 1.0);
  drop('circuit_board', counter, -0.9, CZ - 0.02, 0.2, 0.9);
  drop('retro_multimeter', counter, -0.45, CZ - 0.12, -0.4, 0.9);
  drop('desk_lamp_arm_01', counter, 0.22, CZ - 0.18, -2.5, 0.85);
  drop('stationery_supplies', counter, -0.05, CZ - 0.2, 0.6, 0.9);
  drop('pliers', counter, -0.62, CZ + 0.2, 1.2, 1.0);
  drop('screwdrivers_02', counter, -0.2, CZ + 0.16, -0.2, 0.9);
  drop('magnifying_glass_01', counter, -1.2, CZ + 0.22, 0.9, 1.0);
  drop('measuring_tape_01', counter, 0.15, CZ + 0.2, 0.4, 1.0);
  const station = new THREE.Group(); put(counter, station, -1.15, 0.945, CZ - 0.14, 0.25);
  put(station, rbox(0.2, 0.1, 0.15, mat.yellowPlastic, 0.015), 0, 0.05, 0);
  put(station, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 24), mat.black), -0.05, 0.05, 0.082, 0, Math.PI / 2);
  const lcd = decal(0.07, 0.032, canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#1B1F18'; c.fillRect(0, 0, w, h); c.fillStyle = '#FF4D6D'; c.font = '600 40px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.fillText('350', w / 2, 46); }), { glow: 1.2 });
  lcd.position.set(0.045, 0.055, 0.0755); station.add(lcd);
  const coil = new THREE.Mesh(new THREE.TubeGeometry(new (class extends THREE.Curve { getPoint(t, o = new THREE.Vector3()) { const a = t * Math.PI * 12; return o.set(Math.cos(a) * 0.028, t * 0.09, Math.sin(a) * 0.028); } })(), 200, 0.003, 6), mat.steel);
  put(station, coil, 0.17, 0.005, 0.0);
  const iron = new THREE.Group(); put(station, iron, 0.17, 0.08, 0.02, 0, 0.5, -0.7);
  put(iron, new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.1, 6, 16), M(0x2A2A2A, { roughness: 0.7 })), 0, 0, 0);
  put(iron, new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.0025, 0.12, 12), mat.steel), 0, 0.11, 0);
  const smokeFrom = new THREE.Vector3(-1.08, 1.13, CZ - 0.06);
  // phone — Roamates
  const phone = new THREE.Group(); put(counter, phone, -0.35, 1.03, CZ + 0.15, 0.3, -0.32);
  put(phone, rbox(0.075, 0.155, 0.009, mat.phoneBody, 0.012), 0, 0, 0);
  const mapTex = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = '#0F2A2E'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(127,227,255,0.16)'; c.lineWidth = 2;
    for (let x = 0; x < w; x += 42) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.fillStyle = 'rgba(127,227,255,0.12)'; c.fillRect(40, 120, 90, 70); c.fillRect(150, 300, 70, 110);
    c.strokeStyle = '#7FE3FF'; c.lineWidth = 9; c.setLineDash([18, 12]); c.lineCap = 'round';
    c.beginPath(); c.moveTo(52, 430); c.bezierCurveTo(110, 360, 70, 280, 140, 240); c.bezierCurveTo(210, 200, 190, 140, 205, 80); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#FFB868'; c.beginPath(); c.arc(52, 430, 16, 0, 7); c.fill(); c.fillStyle = '#FF4D6D'; c.beginPath(); c.arc(205, 80, 16, 0, 7); c.fill();
    c.fillStyle = '#EFE6D2'; c.font = '600 26px "IBM Plex Mono", monospace'; c.fillText('ROAMATES', 22, 486);
  });
  const phoneScreenMat = new THREE.MeshStandardMaterial({ map: mapTex, emissive: 0xffffff, emissiveMap: mapTex, emissiveIntensity: 0.3, roughness: 0.1 });
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.067, 0.146), phoneScreenMat); phoneScreen.position.z = 0.0047; phone.add(phoneScreen);
  put(counter, rbox(0.05, 0.05, 0.05, mat.black, 0.008), -0.35, 0.97, CZ + 0.12, 0.3, 0.5);
  // shelf contents
  for (const [n, x, ry, s, from] of [['boombox', -1.38, 0.1, 0.62, 1.95], ['portable_cassette_player', -0.95, -0.3, 1.0, 1.95], ['alarm_clock_01', -1.7, 0.3, 0.9, 1.95], ['cardboard_box_01', -1.5, 0.2, 0.55, 1.45], ['gamepad', -1.05, 0.5, 1.0, 1.45], ['spray_paint_bottles', -1.6, 0.2, 1.0, 1.0], ['oil_tin', -1.2, -0.4, 1.0, 1.0], ['lubricant_spray', -0.95, 0, 1.0, 1.0], ['cardboard_box_01', -1.45, -0.1, 0.6, 0.55], ['plastic_crate_02', -1.0, 0, 0.7, 0.55]])
    drop(n, shop, x, ZS + 0.33, ry, s, from);
  drop('oil_tin', shop, 0.7, ZS + 0.3, 0.6, 0.9, 1.4);
  // display case by the side opening
  const sideCase = displayCase(shop, 0.75, -0.95, Math.PI / 2);
  // shop roller shutters (front + side) — they roll up on start
  const shutters = [];
  const sf = new THREE.Group(); put(bld, sf, (XL + X1 - 0.2) / 2, 2.64, Z0 + 0.02); shutters.push(sf);
  put(sf, rbox(X1 - 0.2 - XL - 0.1, 2.6, 0.04, mat.shutterShop, 0.004), 0, -1.3, 0);
  put(bld, rbox(X1 - XL, 0.3, 0.32, mat.greenMetal, 0.02), mbX - 0.1, 2.66, Z0 + 0.08);
  const ss = new THREE.Group(); put(bld, ss, X1 + 0.02, 2.64, (ZS + Z0 - 0.2) / 2, Math.PI / 2); shutters.push(ss);
  put(ss, rbox(Z0 - 0.2 - ZS - 0.05, 2.6, 0.04, mat.shutterShop, 0.004), 0, -1.3, 0);
  put(bld, rbox(0.32, 0.3, Z0 - ZS, mat.greenMetal, 0.02), X1 + 0.08, 2.66, (ZS + Z0) / 2 - 0.1);

  /* ---------- signs ---------- */
  const signTex = canvasTex(2048, 400, (c, w, h) => {
    c.fillStyle = '#F7F3EA'; c.fillRect(0, 0, w, h); c.fillStyle = '#C3241C'; c.textBaseline = 'middle'; c.textAlign = 'center';
    c.font = '400 143px Bungee, sans-serif'; c.fillText('EPHILEO WORKSHOP', w / 2, 128);
    c.fillStyle = '#343C32';
    signText(c, 'कार्यशाला', w * 0.27, 288, w * 0.4, 124, HINDI);
    signText(c, 'వర్క్‌షాప్', w * 0.73, 288, w * 0.4, 118, TELUGU);
    c.fillStyle = '#AFAD94'; c.fillRect(w / 2 - 2, 234, 4, 96);
  });
  const signBox = lightbox(bld, mbX - 0.05, 2.36, Z0 + 0.45, 0, 3.3, 0.8, signTex, 0.3);
  const sideTex = canvasTex(1600, 420, (c, w, h) => {
    c.fillStyle = '#F7F3EA'; c.fillRect(0, 0, w, h); c.fillStyle = '#C3241C'; c.textAlign = 'center'; c.textBaseline = 'middle';
    signText(c, 'मोबाइल · टीवी', w / 2, 116, w - 100, 150, HINDI);
    signText(c, 'మొబైల్ · టీవీ', w / 2, 253, w - 100, 138, TELUGU);
    c.font = '600 60px "IBM Plex Mono", monospace'; c.fillStyle = '#1B1A17'; c.fillText('PHONES · TVs · CONSOLES', w / 2, 365);
  });
  const sideSign = lightbox(bld, X1 + 0.45, 2.4, (ZS + Z0) / 2 - 0.1, Math.PI / 2, 2.2, 0.68, sideTex, 0.3);
  const signLight = new THREE.SpotLight(0xF4F8FF, 7, 6, 1.0, 1, 2); signLight.position.set(mbX, 2.1, Z0 + 0.7); signLight.target.position.set(mbX, 0, Z0 + 2.4); bld.add(signLight, signLight.target);
  const sideLight = new THREE.SpotLight(0xF4F8FF, 6, 6, 1.0, 1, 2); sideLight.position.set(X1 + 0.7, 2.1, -0.5); sideLight.target.position.set(X1 + 2.4, 0, -0.5); bld.add(sideLight, sideLight.target);
  const vTex = canvasTex(600, 1100, (c, w, h) => {
    c.fillStyle = '#F7F3EA'; c.fillRect(0, 0, w, h); c.fillStyle = '#C3241C'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.strokeStyle = '#A7BAA8'; c.lineWidth = 8; c.strokeRect(15, 15, w - 30, h - 30);
    c.font = '400 79px Bungee, sans-serif'; c.fillText('EPHILEO', w / 2, 142);
    c.fillRect(66, 228, w - 132, 7);
    signText(c, 'कार्यशाला', w / 2, 401, w - 70, 150, HINDI);
    signText(c, 'వర్క్‌షాప్', w / 2, 656, w - 70, 145, TELUGU);
    c.font = '600 69px "IBM Plex Mono", monospace'; c.fillStyle = '#1B1A17'; c.fillText('WORKSHOP', w / 2, 850);
    c.font = '600 38px "IBM Plex Mono", monospace'; c.fillText('APPS · GAMES', w / 2, 1002);
  });
  // Mount the projecting sign farther along the side wall so the upper grille stays visible.
  const vSign = lightbox(bld, X1 + OH + 1.0, 3.9, -1.65, Math.PI / 5, 0.72, 2.2, vTex, 0.3);
  for (const by of [0.75, -0.75]) put(bld, rbox(1.0, 0.04, 0.04, mat.iron, 0.01), X1 + OH + 0.5, 3.9 + by, -1.65);
  const vLight = new THREE.PointLight(0xF2F6FF, 0.25, 2, 2); vLight.position.set(X1 + OH + 1.15, 4.2, -1.3); bld.add(vLight);
  const sTex = canvasTex(400, 560, (c, w, h) => {
    c.fillStyle = '#C3241C'; c.fillRect(0, 0, w, h); c.strokeStyle = '#F7F3EA'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = '#F7F3EA'; c.textAlign = 'center'; signText(c, 'मोबाइल', w / 2, 112, w - 50, 100, HINDI); signText(c, 'టీవీ', w / 2, 238, w - 50, 95, TELUGU); signText(c, 'गेम्स', w / 2, 346, w - 50, 100, HINDI);
    c.font = '600 30px "IBM Plex Mono", monospace'; c.fillText('PHONES · TVs', w / 2, 440); c.fillText('CONSOLES', w / 2, 480);
  });
  const sand = new THREE.Group(); put(root, sand, -3.7, 0, 1.75, 0.3);
  sand.scale.setScalar(1.55);
  put(sand, rbox(0.5, 0.7, 0.14, M(0x2A2A2A, { roughness: 0.5, metalness: 0.3 }), 0.02), 0, 0.5, 0);
  const sFace = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.62), new THREE.MeshStandardMaterial({ map: sTex, emissive: 0xffffff, emissiveMap: sTex, emissiveIntensity: 0.45, roughness: 0.3 }));
  sFace.position.set(0, 0.5, 0.071); sand.add(sFace);
  for (const lx of [-0.2, 0.2]) put(sand, rbox(0.03, 0.15, 0.1, M(0x2A2A2A), 0.005), lx, 0.075, 0);
  const sLight = new THREE.PointLight(0xFF5A4A, 1.0, 2.5, 2); sLight.position.set(-3.5, 0.7, 2.2); root.add(sLight);

  /* ---------- upper floor: tiled room, recessed grille and a single pitched roof ---------- */
  const UF = H1 + 0.16, UH = EAVE - UF, fz = Z0 + OH, rx = X1 + OH;
  const upW = rx - XL, upX = (XL + rx) / 2;
  // Three roof surfaces from the reference sketch: low ledge, ramp, high deck.
  const TOP = EAVE + 1.65, slopeFrontZ = fz - 1.05, ridgeZ = ZB + 1.55;
  const dz = fz - ZB, tH = TOP - UF;
  const BX0 = -0.45, BX1 = rx - 0.15, bW = BX1 - BX0, bX = (BX0 + BX1) / 2, BD = 0.42;
  const BZ1 = -0.7;
  const upper = new THREE.Group(); upper.name = 'reference-upper-floor'; bld.add(upper);
  const upperTile = (w, h) => {
    const m = kitMat(UPPER_WALL, w, h, 0xD7CDB5, { bump: 0.0045 });
    m.userData.weatherStrength = 0.9; return m;
  };
  const balZ = -0.45;
  const balcony = new THREE.Group(); balcony.name = 'recessed-side-balcony';
  put(upper, balcony, rx - fz, 0, balZ + bX, Math.PI / 2);
  // The side cheeks follow the roof. There is no rectangular tower above the front window.
  function upperSide(x, name) {
    const profile = new THREE.Shape();
    profile.moveTo(fz, 0); profile.lineTo(ZB, 0); profile.lineTo(ZB, tH);
    profile.lineTo(ridgeZ, tH); profile.lineTo(slopeFrontZ, UH); profile.lineTo(fz, UH); profile.closePath();
    if (x === rx) {
      const opening = new THREE.Path();
      opening.moveTo(balZ - bW / 2, 0.13); opening.lineTo(balZ + bW / 2, 0.13);
      opening.lineTo(balZ + bW / 2, UH - 0.18); opening.lineTo(balZ - bW / 2, UH - 0.18); opening.closePath();
      profile.holes.push(opening);
    }
    const geo = new THREE.ExtrudeGeometry(profile, { depth: 0.14, bevelEnabled: false });
    const uv = geo.attributes.uv, pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / dz, pos.getY(i) / tH);
    const wall = put(upper, new THREE.Mesh(geo, upperTile(dz, tH)), x + 0.07, UF, 0, -Math.PI / 2);
    wall.name = name;
  }
  upperSide(XL, 'left-roof-cheek'); upperSide(rx, 'right-roof-cheek');
  put(upper, rbox(upW, tH, 0.14, upperTile(upW, tH), 0.006), upX, UF + tH / 2, ZB);
  put(upper, rbox(upW, UH, 0.16, upperTile(upW, UH), 0.006), upX, UF + UH / 2, fz);
  put(balcony, rbox(bW, UH, 0.1, plasterMat(bW, UH, 0xC5C3AD), 0.006), bX, UF + UH / 2, fz - BD);
  put(balcony, rbox(0.1, UH, BD, upperTile(BD, UH), 0.006), BX0 + 0.05, UF + UH / 2, fz - BD / 2);
  const balFloor = put(balcony, rbox(bW + 0.08, 0.08, BD + 0.24, mat.roof, 0.008), bX, UF + 0.04, fz - BD / 2 + 0.1);
  support.push(balFloor);
  put(balcony, rbox(bW - 0.16, 1.1, 0.06, M(0x344740, { roughness: 0.82 }), 0.008), bX, UF + 0.68, fz - BD + 0.065);
  const upperInterior = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#394C40'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) {
      c.fillStyle = i % 2 ? '#54634E' : '#455542'; c.fillRect(i * 38, 0, 15, h);
    }
    c.fillStyle = '#AD4436'; c.fillRect(225, 160, 52, 320);
    c.fillStyle = '#BDBAA2'; c.fillRect(94, 190, 65, 280);
    c.fillStyle = '#263F35'; c.fillRect(368, 170, 62, 330);
  });
  const bDoor = decal(bW - 0.24, 0.98, upperInterior, { glow: 0.12 });
  bDoor.position.set(bX, UF + 0.68, fz - BD + 0.1); balcony.add(bDoor);
  for (const xx of [bX - bW / 6, bX + bW / 6]) put(balcony, rbox(0.028, 1.05, 0.06, mat.iron, 0.004), xx, UF + 0.68, fz - BD + 0.11);
  const balLight = new THREE.PointLight(0xFFBA7B, 0.28, 1.8, 2);
  balLight.position.set(bX, UF + 0.9, fz - 0.2); balcony.add(balLight);
  model('potted_plant_02', balcony, BX0 + 0.24, UF + 0.08, fz - 0.15, 0.2, 0.25);
  model('potted_plant_02', balcony, BX1 - 0.2, UF + 0.08, fz - 0.16, 1.4, 0.22);

  // Thin metal bars and four flower rosettes, modeled in relief like the reference grille.
  const grille = new THREE.Group(); grille.name = 'flower-window-grille';
  put(balcony, grille, bX, UF + 0.14, fz + 0.08);
  const grilleMetal = M(0x8B9D8B, { roughness: 0.72, metalness: 0.35 });
  const gw = bW - 0.08, gh = 1.08;
  for (const yy of [0, 0.26, 0.7, gh]) put(grille, rbox(gw, 0.025, 0.025, grilleMetal, 0.004), 0, yy, 0);
  for (const xx of [-gw / 2, gw / 2]) put(grille, rbox(0.026, gh, 0.025, grilleMetal, 0.004), xx, gh / 2, 0);
  for (let i = 1; i < 16; i++) put(grille, rbox(0.012, gh, 0.012, grilleMetal, 0.003), -gw / 2 + gw * i / 16, gh / 2, -0.025);
  for (let i = 0; i < 4; i++) {
    const cx = -gw / 2 + gw * (i + 0.5) / 4, cy = 0.69;
    for (let petal = 0; petal < 6; petal++) {
      const angle = petal * Math.PI / 3, pts = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24 * Math.PI * 2, radial = 0.105 + Math.cos(t) * 0.105, tangent = Math.sin(t) * 0.047;
        pts.push([cx + Math.cos(angle) * radial - Math.sin(angle) * tangent, cy + Math.sin(angle) * radial + Math.cos(angle) * tangent, 0.016]);
      }
      put(grille, tube(pts, 0.008, grilleMetal, 24), 0, 0, 0);
    }
    put(grille, new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 6, 20), grilleMetal), cx, cy, 0.022);
  }
  for (const xx of [-gw / 2, gw / 2]) {
    for (const yy of [0, gh]) put(grille, rbox(0.024, 0.024, BD + 0.12, grilleMetal, 0.004), xx, yy, -(BD + 0.12) / 2);
  }
  put(balcony, rbox(bW + 0.1, 0.1, 0.28, mat.band, 0.012), bX, UF + 0.025, fz + 0.05);
  const canopy = awning(bX, EAVE - 0.08, fz + 0.03, 0, bW + 0.18, 0.6);
  balcony.add(canopy); canopy.name = 'upper-scalloped-canopy';
  // White condenser and three conduit runs on the plain tiled section.
  const fanTex = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#D6D4C9'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#737E75'; c.beginPath(); c.arc(w / 2, h / 2, 206, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#C2C4B8'; c.lineWidth = 3;
    for (let r = 24; r < 206; r += 12) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, Math.PI * 2); c.stroke(); }
    for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12; c.beginPath(); c.moveTo(w / 2, h / 2);
      c.lineTo(w / 2 + Math.cos(a) * 206, h / 2 + Math.sin(a) * 206); c.stroke();
    }
    c.fillStyle = '#ABB3A5'; c.beginPath(); c.arc(w / 2, h / 2, 30, 0, Math.PI * 2); c.fill();
  });
  const ac = new THREE.Group(); ac.name = 'upper-white-condenser';
  put(upper, ac, -1.05, UF + 0.27, fz + 0.22);
  put(ac, rbox(0.88, 0.79, 0.28, M(0xE4E1D3, { roughness: 0.83, metalness: 0.08 }), 0.014), 0, 0.4, 0);
  const fan = decal(0.66, 0.68, fanTex); fan.position.set(-0.065, 0.4, 0.142); ac.add(fan);
  for (let i = 0; i < 8; i++) put(ac, rbox(0.09, 0.012, 0.018, mat.pipeDark, 0.003), 0.34, 0.15 + i * 0.065, 0.15);
  for (const xx of [-0.31, 0.31]) put(ac, rbox(0.045, 0.06, 0.38, mat.iron, 0.008), xx, -0.03, -0.03);
  for (let i = 0; i < 3; i++) {
    const yy = UF + 0.11 + i * 0.065;
    put(upper, tube([[XL - 0.25, yy, fz + 0.18], [-1.7, yy, fz + 0.18], [-0.6, yy + 0.14, fz + 0.18], [BX0 + 0.2, yy + 0.14, fz + 0.18]], 0.018, mat.pipeDark, 32), 0, 0, 0);
  }
  windowWithCage(bld, rx + 0.1, UF + 0.72, -2.9, Math.PI / 2, true, 0.75);
  model('exterior_aircon_unit', bld, rx + 0.22, UF + 0.05, -2.2, Math.PI / 2, 0.3);
  put(bld, rbox(0.34, 0.03, 0.6, mat.iron, 0.005), rx + 0.16, UF + 0.04, -2.2);

  /* ---------- teal roof: two inset red skylights, grey flashing, tank at the rear ridge ---------- */
  const roofWidth = upW + 0.3, run = slopeFrontZ - ridgeZ;
  const rise = TOP - EAVE, roofLength = Math.hypot(run, rise), pitch = Math.atan2(rise, run);
  const roofAssembly = new THREE.Group(); roofAssembly.name = 'teal-pitched-roof';
  put(upper, roofAssembly, upX, (TOP + EAVE) / 2 + 0.05, (ridgeZ + slopeFrontZ) / 2, 0, pitch);
  const roofMat = kitMat(ROOF, roofWidth, roofLength, 0xA2C2B7, { bump: 0.009, roughness: 0.76 });
  put(roofAssembly, rbox(roofWidth, 0.1, roofLength, roofMat, 0.008), 0, 0, 0);
  const flashing = agedPaint(0x6B6D65, 127, 0.18);
  const ledgeFrontZ = fz + 0.18, ledgeDepth = ledgeFrontZ - slopeFrontZ;
  const lowLedge = put(upper, rbox(roofWidth, 0.12, ledgeDepth, mat.roof, 0.008), upX, EAVE + 0.04, (ledgeFrontZ + slopeFrontZ) / 2);
  lowLedge.name = 'lower-flat-roof-ledge'; support.push(lowLedge);
  put(upper, rbox(roofWidth + 0.12, 0.16, 0.14, flashing, 0.01), upX, EAVE + 0.05, ledgeFrontZ);
  for (const xx of [upX - roofWidth / 2, upX + roofWidth / 2]) put(upper, rbox(0.12, 0.14, ledgeDepth, flashing, 0.008), xx, EAVE + 0.06, (ledgeFrontZ + slopeFrontZ) / 2);
  for (const xx of [-roofWidth / 2, roofWidth / 2]) put(roofAssembly, rbox(0.12, 0.15, roofLength + 0.1, flashing, 0.01), xx, 0.025, 0);
  for (const zz of [-roofLength / 2, roofLength / 2]) put(roofAssembly, rbox(roofWidth + 0.12, 0.16, 0.14, flashing, 0.01), 0, 0.01, zz);
  const skyFrame = M(0x235C54, { roughness: 0.72, metalness: 0.35 });
  const skyMat = new THREE.MeshPhysicalMaterial({ color: 0x220101, emissive: 0xEB0501, emissiveIntensity: 0.62, roughness: 0.34, clearcoat: 0.45 });
  for (const zz of [-0.67, 0.65]) {
    const skylight = new THREE.Group(); skylight.name = 'red-roof-skylight';
    put(roofAssembly, skylight, 0.08, 0.065, zz);
    put(skylight, rbox(0.53, 0.055, 0.68, flashing, 0.01), 0, 0, 0);
    put(skylight, rbox(0.45, 0.07, 0.6, skyFrame, 0.012), 0, 0.035, 0);
    put(skylight, rbox(0.32, 0.018, 0.44, skyMat, 0.008), 0, 0.079, 0);
    put(skylight, rbox(0.33, 0.012, 0.025, mat.pipe, 0.004), 0, 0.091, -0.21);
  }
  const rearDeck = put(upper, rbox(roofWidth, 0.12, ridgeZ - ZB + 0.2, mat.roof, 0.01), upX, TOP + 0.04, (ridgeZ + ZB) / 2);
  rearDeck.name = 'upper-flat-roof-deck'; support.push(rearDeck);
  for (const xx of [upX - roofWidth / 2, upX + roofWidth / 2]) put(upper, rbox(0.12, 0.14, ridgeZ - ZB + 0.2, flashing, 0.008), xx, TOP + 0.06, (ridgeZ + ZB) / 2);
  put(upper, rbox(roofWidth, 0.14, 0.12, flashing, 0.008), upX, TOP + 0.06, ZB - 0.1);
  model('planter_box_01', upper, rx - 0.5, TOP + 0.1, ridgeZ - 0.13, 0, 0.38);
  const tank = new THREE.Group(); tank.name = 'ribbed-rooftop-water-tank';
  const tankZ = ridgeZ - 0.62;
  put(upper, tank, rx - 0.58, TOP + 0.1, tankZ);
  for (const [lx, lz] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]]) put(tank, rbox(0.045, 0.34, 0.045, mat.iron, 0.006), lx, 0.17, lz);
  put(tank, rbox(0.76, 0.055, 0.76, mat.iron, 0.008), 0, 0.34, 0);
  const tankPrint = canvasTex(512, 768, (c, w, h) => {
    c.fillStyle = '#BCD1CA'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      const x = i * 64;
      const grad = c.createLinearGradient(x, 0, x + 64, 0);
      grad.addColorStop(0, '#688D87'); grad.addColorStop(0.13, '#D0DBCB'); grad.addColorStop(0.75, '#ADC9C2'); grad.addColorStop(1, '#7D9E96');
      c.fillStyle = grad; c.fillRect(x, 0, 64, h);
      c.fillStyle = 'rgba(112,76,43,0.24)'; c.fillRect(x + 4, 0, 3, 170 + i % 3 * 100);
    }
    c.fillStyle = 'rgba(75,106,99,0.24)'; for (const y of [210, 520]) c.fillRect(0, y, w, 3);
  });
  const tankMat = new THREE.MeshStandardMaterial({ map: tankPrint, roughness: 0.7, metalness: 0.35 });
  tankMat.userData.weatherStrength = 0.4;
  put(tank, new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 1.12, 8), tankMat), 0, 0.94, 0);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    put(tank, rbox(0.018, 1.14, 0.018, mat.iron, 0.003), Math.sin(a) * 0.373, 0.94, Math.cos(a) * 0.373);
  }
  for (const yy of [0.38, 1.5]) put(tank, new THREE.Mesh(new THREE.TorusGeometry(0.372, 0.023, 6, 8), mat.iron), 0, yy, 0, 0, Math.PI / 2);
  put(tank, new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.38, 0.1, 8), mat.unitMetal), 0, 1.56, 0);
  put(tank, new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 8), mat.iron), 0, 1.65, 0);
  put(upper, tube([[rx - 0.38, TOP + 0.75, tankZ], [rx + 0.1, TOP + 0.6, tankZ], [rx + 0.1, UF + 0.3, tankZ + 0.14]], 0.025, mat.pipe, 36), 0, 0, 0);
  // The small utility box sits on the upper side cheek beneath the ridge.
  unit(rx + 0.12, TOP - 0.52, ridgeZ - 0.1, 0.48, 0.38, 0.28, Math.PI / 2);
  put(upper, tube([[rx - 0.45, TOP + 0.1, ZB + 0.1], [rx - 0.45, TOP + 1.45, ZB + 0.1]], 0.014, mat.pipeDark, 4), 0, 0, 0);

  /* ---------- upper-floor miniature construction details ---------- */
  const upperDetails = new THREE.Group(); upperDetails.name = 'upper-floor-fine-details'; upper.add(upperDetails);
  const rivets = [], boltColor = M(0x9C9D8B, { metalness: 0.45, roughness: 0.64 });
  function rivet(parent, x, y, z, radius = 0.008) {
    parent.updateWorldMatrix(true, false);
    rivets.push({ position: parent.localToWorld(new THREE.Vector3(x, y, z)), radius });
  }
  // Overlapping flashing joints and exposed fasteners along all three roof surfaces.
  for (let i = 0; i <= 12; i++) {
    const xx = -roofWidth / 2 + 0.09 + (roofWidth - 0.18) * i / 12;
    rivet(upper, upX + xx, EAVE + 0.04, ledgeFrontZ + 0.076);
    rivet(roofAssembly, xx, 0.094, -roofLength / 2);
  }
  const flashingJoint = agedPaint(0x828278, 71, 0.25);
  for (const xx of [-roofWidth / 2, roofWidth / 2]) {
    for (let i = 0; i <= 8; i++) rivet(roofAssembly, xx, 0.106, -roofLength / 2 + roofLength * i / 8);
    for (const zz of [-roofLength * 0.24, roofLength * 0.25]) {
      put(roofAssembly, rbox(0.13, 0.008, 0.075, flashingJoint, 0.002), xx, 0.108, zz);
    }
  }
  for (const zz of [-0.67, 0.65]) {
    for (const xx of [-0.2, 0.2]) for (const dz of [-0.27, 0.27]) rivet(roofAssembly, xx + 0.08, 0.14, zz + dz, 0.006);
    put(roofAssembly, rbox(0.36, 0.028, 0.045, mat.pipeDark, 0.004), 0.08, 0.16, zz - 0.29);
  }
  // A thin gutter under the low ledge, with brackets and a drain elbow.
  put(upperDetails, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, roofWidth - 0.14, 10), mat.pipeDark), upX, EAVE - 0.075, ledgeFrontZ + 0.02, 0, 0, Math.PI / 2);
  for (const xx of [XL + 0.18, upX, rx - 0.12]) {
    put(upperDetails, rbox(0.028, 0.15, 0.08, flashing, 0.004), xx, EAVE - 0.03, ledgeFrontZ + 0.005);
    rivet(upperDetails, xx, EAVE + 0.03, ledgeFrontZ + 0.05);
  }
  put(upperDetails, tube([[rx + 0.035, EAVE - 0.075, ledgeFrontZ + 0.02], [rx + 0.13, EAVE - 0.12, fz + 0.1], [rx + 0.13, EAVE - 0.34, fz + 0.1]], 0.029, mat.pipeDark, 16), 0, 0, 0);

  // Fan grille in relief; housing fasteners, service label and conduit saddles.
  const fanGrille = M(0x8C9788, { roughness: 0.75, metalness: 0.3 });
  for (let i = 0; i < 7; i++) put(ac, new THREE.Mesh(new THREE.TorusGeometry(0.055 + i * 0.034, 0.0024, 5, 48), fanGrille), -0.065, 0.4, 0.154);
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    put(ac, tube([[-0.065, 0.4, 0.158], [-0.065 + Math.cos(a) * 0.29, 0.4 + Math.sin(a) * 0.29, 0.158]], 0.0027, fanGrille, 2), 0, 0, 0);
  }
  for (const xx of [-0.39, 0.39]) for (const yy of [0.07, 0.73]) rivet(ac, xx, yy, 0.149, 0.007);
  const serviceLabel = decal(0.08, 0.16, canvasTex(128, 256, (c, w, h) => {
    c.fillStyle = '#E1DECA'; c.fillRect(0, 0, w, h); c.fillStyle = '#456263';
    c.fillRect(0, 0, w, 45); c.fillStyle = '#E1DECA'; c.font = '700 22px monospace'; c.fillText('E-08', 12, 31);
    c.fillStyle = '#6F7666'; for (let y = 70; y < 170; y += 18) c.fillRect(12, y, 85, 5);
    c.fillStyle = '#A24C35'; c.beginPath(); c.moveTo(64, 190); c.lineTo(93, 238); c.lineTo(35, 238); c.fill();
  })); serviceLabel.position.set(0.34, 0.61, 0.16); ac.add(serviceLabel);
  for (const xx of [-1.68, -0.48]) {
    put(upperDetails, rbox(0.033, 0.26, 0.026, mat.pipe, 0.005), xx, UF + 0.19, fz + 0.204);
    for (const yy of [UF + 0.075, UF + 0.305]) rivet(upperDetails, xx, yy, fz + 0.22, 0.007);
  }
  for (let i = 0; i < 3; i++) {
    const yy = UF + 0.11 + i * 0.065;
    put(upperDetails, new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.035, 8), mat.pipe), -1.45, yy + 0.012, fz + 0.18, 0, 0, Math.PI / 2);
  }
  for (const yy of [UF + 0.3, UF + 0.88, EAVE - 0.15]) {
    put(upperDetails, rbox(0.09, 0.028, 0.08, mat.pipe, 0.006), rx + 0.1, yy, fz + 0.1);
    rivet(upperDetails, rx + 0.065, yy, fz + 0.144, 0.006);
  }
  // Printed stains sit at the eave and around the pipe runs rather than uniformly darkening the wall.
  const damp = canvasTex(1024, 512, (c, w, h) => {
    let seed = 89; const rnd = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
    for (let i = 0; i < 34; i++) {
      const x = rnd() * w, start = rnd() * 40, len = 70 + rnd() * 240, width = 2 + rnd() * 7;
      const gradient = c.createLinearGradient(0, start, 0, start + len);
      gradient.addColorStop(0, 'rgba(65,60,38,0.22)'); gradient.addColorStop(1, 'rgba(65,60,38,0)');
      c.fillStyle = gradient; c.fillRect(x, start, width, len);
    }
    for (let i = 0; i < 12; i++) {
      const x = rnd() * w, r = 30 + rnd() * 75;
      const gradient = c.createRadialGradient(x, h - 15, 0, x, h - 15, r);
      gradient.addColorStop(0, 'rgba(56,80,48,0.21)'); gradient.addColorStop(1, 'rgba(56,80,48,0)');
      c.fillStyle = gradient; c.fillRect(x - r, h - r - 15, r * 2, r * 2);
    }
  });
  const stains = decal(upW - 0.025, UH - 0.025, damp, { transparent: true });
  stains.material.depthWrite = false; stains.castShadow = false;
  stains.position.set(upX, UF + UH / 2, fz + 0.085); upperDetails.add(stains);
  const wallNotice = decal(0.14, 0.51, canvasTex(160, 600, (c, w, h) => {
    c.fillStyle = '#325F65'; c.fillRect(0, 0, w, h); c.fillStyle = '#D6CBB0';
    c.textAlign = 'center'; c.save(); c.translate(w / 2, 263); c.rotate(-Math.PI / 2);
    signText(c, 'मरम्मत · రిపేర్', 0, 0, 454, 46, INDIC); c.restore();
    c.font = '700 28px monospace'; c.fillText('08–22', w / 2, 566);
    c.strokeStyle = '#958875'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
  })); wallNotice.position.set(XL + 0.18, UF + 0.88, fz + 0.09); upperDetails.add(wallNotice);
  put(upperDetails, rbox(0.025, UH, 0.035, agedPaint(0x827D6B, 23, 0), 0.002), rx - 0.006, UF + UH / 2, fz + 0.075);
  // Window cage fixings, tiny hinges and a scalloped canopy with worn cut edges.
  for (const xx of [BX0 + 0.065, BX1 - 0.065]) for (const yy of [UF + 0.19, UF + 1.14]) {
    put(balcony, rbox(0.06, 0.11, 0.018, fanGrille, 0.004), xx, yy, fz + 0.092);
    rivet(balcony, xx, yy, fz + 0.106, 0.006);
  }
  for (const xx of [bX - bW / 6, bX + bW / 6]) {
    put(balcony, rbox(0.018, 0.09, 0.027, mat.brass, 0.003), xx + 0.035, UF + 0.66, fz - BD + 0.13);
  }
  // Tank inspection cover, band joints, valve and rooftop planting.
  const tankCover = agedPaint(0xA9C2B4, 97, 0.35);
  put(tank, rbox(0.13, 0.18, 0.025, tankCover, 0.004), 0, 0.99, 0.345);
  put(tank, rbox(0.017, 0.055, 0.03, mat.iron, 0.003), 0.035, 0.99, 0.366);
  for (const yy of [0.41, 1.49]) {
    put(tank, rbox(0.08, 0.055, 0.035, flashing, 0.004), 0.14, yy, 0.343);
    rivet(tank, 0.14, yy, 0.367, 0.006);
  }
  put(tank, new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 10), mat.brass), 0.24, 0.45, 0.31, 0, Math.PI / 2);
  put(tank, new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.006, 6, 20), mat.iron), 0.24, 0.46, 0.39);
  model('potted_plant_02', upper, upX - 0.3, TOP + 0.1, ridgeZ - 0.3, 0.5, 0.28);
  model('potted_plant_02', upper, rx - 0.95, TOP + 0.1, ridgeZ - 0.27, 1.7, 0.22);
  for (const [yy, width] of [[TOP + 0.9, 0.68], [TOP + 1.18, 0.48], [TOP + 1.4, 0.3]]) {
    put(upperDetails, tube([[rx - 0.45 - width / 2, yy, ZB + 0.1], [rx - 0.45 + width / 2, yy, ZB + 0.1]], 0.008, mat.pipeDark, 2), 0, 0, 0);
  }
  // Instancing keeps the many small fasteners cheap to render.
  const fasteners = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), boltColor, rivets.length);
  fasteners.name = 'upper-floor-fasteners';
  rivets.forEach(({ position, radius }, i) => {
    fasteners.setMatrixAt(i, new THREE.Matrix4().compose(position, new THREE.Quaternion(), new THREE.Vector3(radius, radius, radius * 0.6)));
  });
  fasteners.instanceMatrix.needsUpdate = true; upperDetails.add(fasteners);

  /* ---------- back-right annex with the water tank ---------- */
  const aW = AX1 - X1, aX = (X1 + AX1) / 2, aD = AZ1 - ZB, aZ = (AZ1 + ZB) / 2;
  // open stall: corner posts + headers on both street faces, low counter on the side street
  const annex = new THREE.Group(); bld.add(annex);
  put(annex, rbox(aW, AH, 0.15, plasterMat(aW, AH), 0.01), aX, AH / 2, ZB);
  const aFloor = put(annex, rbox(aW, 0.06, aD, mat.floorTiles, 0.005), aX, 0.03, aZ); support.push(aFloor);
  put(annex, rbox(aW, 0.06, aD, M(0x6E6A62, { roughness: 0.9 }), 0.005), aX, AH - 0.05, aZ);
  const aRoof = put(annex, rbox(aW + 0.12, 0.16, aD + 0.12, mat.roof, 0.02), aX, AH + 0.08, aZ); support.push(aRoof);
  put(annex, rbox(aW + 0.12, 0.3, 0.12, mat.band, 0.02), aX, AH + 0.3, AZ1 + 0.02);
  put(annex, rbox(0.12, 0.3, aD + 0.12, mat.band, 0.02), AX1 + 0.02, AH + 0.3, aZ);
  for (const [px, pz] of [[AX1 - 0.08, AZ1 - 0.08], [AX1 - 0.08, ZB + 0.08]]) put(annex, rbox(0.16, AH, 0.16, tileMat(0.16, AH, 0xCFD8D3), 0.015), px, AH / 2, pz);
  put(annex, rbox(aW + 0.04, 0.3, 0.2, tileMat(aW, 0.3, 0xCFD8D3), 0.02), aX, AH - 0.15, AZ1);
  put(annex, rbox(0.2, 0.3, aD + 0.04, tileMat(aD, 0.3, 0xCFD8D3), 0.02), AX1, AH - 0.15, aZ);
  const aCounter = new THREE.Group(); put(annex, aCounter, AX1 - 0.3, 0, aZ + 0.2);
  put(aCounter, rbox(0.44, 0.9, 0.9, mat.woodShelf, 0.015), 0, 0.45, 0);
  const aTop = put(aCounter, rbox(0.56, 0.05, 1.0, mat.wood, 0.012), 0.04, 0.92, 0); support.push(aTop);
  const priceTex = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#F2E9D3'; c.fillRect(0, 0, w, h); c.fillStyle = '#B3221C'; c.textAlign = 'center'; signText(c, 'వాడినవి · $', w / 2, 45, w - 20, 40, TELUGU); c.fillStyle = '#1B1A17'; c.font = '600 28px "IBM Plex Mono", monospace'; c.fillText('USED · AS IS', w / 2, 108); });
  const price = decal(0.3, 0.15, priceTex); price.position.set(0.225, 0.62, 0); price.rotation.y = Math.PI / 2; aCounter.add(price);
  const aShelf = model('steel_frame_shelves_01', annex, aX - 0.2, 0.06, ZB + 0.33, 0, 0.8); aShelf.traverse((m) => { if (m.isMesh) support.push(m); });
  model('Television_01', annex, X1 + 0.42, 0.06, AZ1 - 0.45, 0.4, 0.8);
  model('Television_01', annex, X1 + 0.42, 0.43, AZ1 - 0.47, 0.25, 0.8);
  model('Television_01', annex, X1 + 0.4, 0.8, AZ1 - 0.45, 0.5, 0.72);
  root.updateMatrixWorld(true);
  for (const [n, x, ry, sc, from] of [['boombox', aX - 0.35, 0.1, 0.5, 1.6], ['cardboard_box_01', aX, -0.2, 0.45, 1.6], ['portable_cassette_player', aX - 0.3, 0.3, 1.0, 1.2], ['alarm_clock_01', aX - 0.05, -0.4, 0.9, 1.2], ['oil_tin', aX - 0.4, 0.2, 1.0, 0.8], ['plastic_crate_02', aX - 0.2, 0, 0.55, 0.45]])
    drop(n, annex, x, ZB + 0.36, ry, sc, from);
  for (const [n, z, ry, sc] of [['boombox', aZ - 0.05, 1.4, 0.45], ['gamepad', aZ + 0.3, 0.6, 1.0], ['portable_cassette_player', aZ + 0.5, 1.9, 1.0]])
    drop(n, annex, AX1 - 0.28, z, ry, sc, 1.3);
  put(annex, tube([[aX, AH - 0.08, aZ], [aX, AH - 0.6, aZ]], 0.004, mat.cable, 2), 0, 0, 0);
  const aBulb = model('lightbulb_01', annex, aX, AH - 0.66, aZ, 0, 1); aBulb.rotation.x = Math.PI;
  aBulb.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.material = m.material.clone(); m.material.emissive = new THREE.Color(0xFFC27A); m.material.emissiveIntensity = 0.1; bulbs.push(m.material); } });
  const annexLight = new THREE.PointLight(0xFFB466, 0, 0, 2); annexLight.position.set(aX, AH - 0.85, aZ); annex.add(annexLight);
  awning(aX, 2.38, AZ1 + 0.1, 0, aW + 0.05, 0.55);
  awning(AX1 + 0.1, 2.38, aZ, Math.PI / 2, aD + 0.05, 0.55);
  model('planter_box_01', bld, aX + 0.35, AH + 0.16, aZ - 0.55, 0, 0.45);
  model('exterior_aircon_unit', bld, aX - 0.3, AH + 0.16, ZB + 0.3, 0, 0.32);
  const dish = new THREE.Group(); put(bld, dish, aX - 0.45, AH + 0.16, AZ1 - 0.35, 0.7);
  put(dish, rbox(0.04, 0.5, 0.04, mat.iron, 0.01), 0, 0.25, 0);
  put(dish, new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 12, 0, Math.PI * 2, 0, 0.6), new THREE.MeshStandardMaterial({ color: 0xD9D9D4, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide })), 0, 0.6, 0.05, 0, Math.PI / 2 + 0.5);

  /* ---------- back alley face ---------- */
  const backDoor = new THREE.Group(); put(bld, backDoor, -0.6, 0, ZB - 0.08, Math.PI);
  put(backDoor, rbox(1.0, 2.2, 0.08, M(0xD8D4CA, { roughness: 0.6 }), 0.01), 0, 1.1, 0);
  put(backDoor, rbox(0.84, 2.04, 0.06, mat.greenMetal, 0.01), 0, 1.06, 0.03);
  put(backDoor, new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 16), mat.brass), 0.32, 1.05, 0.08, 0, Math.PI / 2);
  put(backDoor, rbox(1.2, 0.12, 0.4, mat.band, 0.02), 0, 0.06, 0.22);
  put(backDoor, new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 12), new THREE.MeshStandardMaterial({ color: 0xFFE2B0, emissive: 0xFFC27A, emissiveIntensity: 3 })), 0, 2.38, 0.14).castShadow = false;
  const backLight = new THREE.PointLight(0xFFB466, 2.0, 4.5, 2); backLight.position.set(-0.6, 2.3, ZB - 0.5); bld.add(backLight);
  windowWithCage(bld, -3.0, 2.0, ZB - 0.08, Math.PI, false);
  windowWithCage(bld, -1.3, UF + 0.72, ZB - 0.08, Math.PI, false, 0.8);
  windowWithCage(bld, 0.6, UF + 0.72, ZB - 0.08, Math.PI, true, 0.8);
  model('exterior_aircon_unit', bld, 0.4, UF + 0.1, ZB - 0.3, Math.PI, 0.42);
  put(bld, rbox(0.82, 0.03, 0.42, mat.iron, 0.005), 0.4, UF + 0.09, ZB - 0.28);
  model('exterior_aircon_unit', bld, -2.4, 2.95, ZB - 0.28, Math.PI, 0.34);
  const bamboo = M(0xB8A06A, { roughness: 0.6 });
  [[-1.6, EAVE - 0.5], [-0.6, EAVE - 0.45], [0.7, EAVE - 0.55]].forEach(([px, py], i) => {
    put(bld, tube([[px, py, ZB - 0.08], [px + 0.05, py + 0.12, ZB - 1.3]], 0.02, bamboo, 4), 0, 0, 0);
    [[0x2F4A6B, 0xE8E1D2, 0xB3221C], [0xD9C27A, 0x6F8F7E], [0xE8E1D2, 0x3A3A3A, 0xC9D6E4]][i].forEach((col, k) => {
      put(bld, new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.42 + (k % 2) * 0.12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.95, side: THREE.DoubleSide })), px + 0.02 + k * 0.012, py - 0.18 - (k % 2) * 0.06, ZB - 0.4 - k * 0.32, Math.PI / 2 + 0.1 * (k - 1));
    });
  });
  for (const px of [-1.95, 1.1]) put(bld, tube([[px, EAVE, ZB - 0.1], [px, 0.15, ZB - 0.1], [px, 0.08, ZB - 0.3]], 0.045, mat.pipe, 40), 0, 0, 0);
  put(bld, tube([[X0, 3.4, ZB - 0.12], [AX1, 3.3, ZB - 0.12]], 0.025, mat.pipeDark, 2), 0, 0, 0);
  for (const [a, b, d] of [[[X0, 3.6, ZB - 0.1], [AX1, 3.55, ZB - 0.1], 0.35], [[X0, 3.5, ZB - 0.12], [0.5, 3.45, ZB - 0.12], 0.22]]) put(bld, sag(a, b, d, 0.011, mat.cable), 0, 0, 0);
  poster(1.2, 0.7, (c, w, h) => {
    c.fillStyle = '#B9B1A4'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(179,34,28,0.85)'; c.textAlign = 'center'; signText(c, 'पार्किंग मना है', w / 2, 163, w - 80, 118, HINDI); signText(c, 'పార్కింగ్ వద్దు', w / 2, 297, w - 80, 107, TELUGU);
    c.fillStyle = 'rgba(27,26,23,0.8)'; c.font = '600 70px "IBM Plex Mono", monospace'; c.fillText('NO PARKING', w / 2, 457);
    c.font = '400 44px "IBM Plex Mono", monospace'; c.fillText('LOADING ONLY · 23:00–07:00', w / 2, 582);
  }, -3.0, 0.75, ZB - 0.08, Math.PI);
  // back-right corner alley: gas, bins, crates, bucket
  const gasMat = new THREE.MeshPhysicalMaterial({ color: 0xA9231B, roughness: 0.4, metalness: 0.3, clearcoat: 0.5 });
  for (const [gx, gz] of [[3.1, ZB + 0.2], [3.4, ZB + 0.25]]) {
    const g = new THREE.Group(); put(root, g, gx, 0, gz);
    put(g, new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.45, 8, 24), gasMat), 0, 0.38, 0);
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16), mat.steel), 0, 0.8, 0);
  }
  model('trashbag', root, 3.65, 0, ZB + 0.25, 0.4, 0.8);
  model('trashbag', root, 3.7, 0, ZB + 0.8, 2.1, 0.7);
  model('cardboard_box_01', root, 3.2, 0, -2.9, 0.2, 0.8);
  model('cardboard_box_01', root, 3.22, 0.4, -2.92, -0.3, 0.6);
  model('plastic_crate_02', root, -1.6, 0, ZB - 0.25, -0.2, 0.8);
  const bucket = new THREE.Group(); put(root, bucket, -0.05, 0, ZB - 0.2);
  put(bucket, new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.32, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x2F6FA8, roughness: 0.4, side: THREE.DoubleSide })), 0, 0.16, 0);
  put(bucket, tube([[0.02, 0.3, 0], [0.12, 1.15, 0.05]], 0.012, M(0xC9B48A), 2), 0, 0, 0);

  /* ---------- street furniture, cables, pipes ---------- */
  put(bld, tube([[rx + 0.09, EAVE, fz + 0.09], [rx + 0.09, H1 + 0.2, fz + 0.09], [X1 + 0.04, H1 - 0.1, Z0 + 0.04], [X1 + 0.04, 0.2, Z0 + 0.04], [X1 + 0.2, 0.08, Z0 + 0.2]], 0.045, mat.pipe, 64), 0, 0, 0);
  put(bld, tube([[X0, 2.83, Z0 + 0.2], [X1, 2.83, Z0 + 0.2]], 0.022, mat.pipeDark, 2), 0, 0, 0);
  const cables = [
    [[X0, 3.62, Z0 + 0.24], [XL, 3.6, fz + 0.2], 0.12], [[XL, EAVE - 0.4, fz + 0.2], [rx, EAVE - 0.38, fz + 0.2], 0.3], [[XL, EAVE - 0.5, fz + 0.22], [rx, EAVE - 0.46, fz + 0.22], 0.42],
    [[-4.6, 4.7, 4.6], [X0, 3.62, Z0 + 0.24], 0.3], [[rx, EAVE - 0.4, fz + 0.2], [4.7, 5.6, 4.7], 0.45], [[rx + 0.1, EAVE - 0.4, ZB], [rx + 0.1, EAVE - 0.38, fz], 0.3],
    [[rx + 0.12, UF + 0.3, ZB + 0.5], [rx + 0.12, UF + 0.3, BZ1], 0.18], [[rx + 0.1, EAVE - 0.5, -1.0], [4.6, 5.2, -1.6], 0.35],
  ];
  for (const [a, b, d] of cables) put(bld, sag(a, b, d, 0.011, mat.cable), 0, 0, 0);
  const meter = decal(0.22, 0.3, canvasTex(220, 300, (c, w, h) => { c.fillStyle = '#D7D9D3'; c.fillRect(0, 0, w, h); c.fillStyle = '#1B1A17'; c.fillRect(30, 40, 160, 60); c.fillStyle = '#B8E986'; c.font = '600 40px "IBM Plex Mono", monospace'; c.fillText('04217', 42, 86); c.fillStyle = '#555'; c.beginPath(); c.arc(110, 190, 50, 0, 7); c.fill(); }));
  meter.position.set(XL - 0.02, 1.85, Z0 + 0.135); bld.add(meter);
  // front street tables
  foldTable(-2.45, 1.35, 0.08); plasticStool(-2.4, 2.0, -0.15); plasticStool(-3.25, 1.3, 0.12);
  foldTable(-0.25, 1.45, -0.1); plasticStool(0.5, 1.4, -0.1); plasticStool(-0.35, 2.1, 0.2);
  // side street tables
  foldTable(2.85, 0.45, 1.5); plasticStool(2.2, 0.55, 0.1); plasticStool(2.85, -0.35, 0.25);
  
  root.updateMatrixWorld(true);
  drop('portable_cassette_player', root, -2.75, 1.25, 0.5, 1.6, 1.4);
  drop('magnifying_glass_01', root, -2.2, 1.45, -0.6, 1.6, 1.4);
  drop('boombox', root, -0.45, 1.4, -0.1, 0.75, 1.4);
  drop('gamepad', root, 0.05, 1.55, 0.7, 1.6, 1.4);
  drop('oil_tin', root, 2.95, 0.3, 0.4, 1.4, 1.4);
  drop('alarm_clock_01', root, 2.75, 0.7, -0.5, 1.3, 1.4);
  drop('spray_paint_bottles', root, 2.9, 0.05, 0.4, 1.4, 1.4);
  // chunky table-top clutter: tea cups, bottles, a tin of screws
  const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xF1ECE2, roughness: 0.3, clearcoat: 0.5 });
  const bottleMats = [new THREE.MeshPhysicalMaterial({ color: 0xC0281F, roughness: 0.3, clearcoat: 0.6 }), new THREE.MeshPhysicalMaterial({ color: 0xE3B23C, roughness: 0.3, clearcoat: 0.6 }), new THREE.MeshPhysicalMaterial({ color: 0x2F8F6A, roughness: 0.3, clearcoat: 0.6 })];
  function clutter(x, z, seed) {
    ray.set(new THREE.Vector3(x, 2, z), new THREE.Vector3(0, -1, 0)); const hit = ray.intersectObjects(support, true)[0]; const y = hit ? hit.point.y : 0;
    const g = new THREE.Group(); put(root, g, x, y, z, seed);
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.11, 24), cupMat), 0.12, 0.055, 0.08);
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.11, 24), cupMat), -0.05, 0.055, 0.14);
    const b = bottleMats[seed % 3 | 0];
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.24, 20), b), -0.18, 0.12, -0.05);
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 16), cupMat), -0.18, 0.265, -0.05);
    put(g, new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 28), M(0x9AA0A4, { metalness: 0.7, roughness: 0.35 })), 0.2, 0.03, -0.12);
  }
  root.updateMatrixWorld(true);
  clutter(-2.35, 1.3, 1); clutter(-0.15, 1.35, 2); clutter(2.95, 0.6, 3);
  model('chinese_stool', root, 1.95, 0, 1.8, 0.3, 1.35);
  model('painted_wooden_stool', root, 3.3, 0, 1.85, -0.4, 1.3);
  model('potted_plant_02', root, -4.0, 0, 1.95, 0.3, 1.6);
  model('planter_box_01', root, 3.5, 0, -0.9, Math.PI / 2, 1.0);
  model('plastic_crate_02', root, -2.95, 0, 0.95, 0.3, 1.0);
  model('plastic_crate_02', root, -2.93, 0.29, 0.97, 0.1, 1.0);
  model('cardboard_box_01', root, 3.5, 0, 1.95, -0.4, 1.0);
  
  model('trashbag', root, 3.55, 0, -2.0, 0.6, 0.75);

  /* ---------- global lights ---------- */
  const hemi = new THREE.HemisphereLight(0x9CC6DC, 0x26302E, 1.95);
  const moon = new THREE.DirectionalLight(0xE4F0FA, 2.4); moon.position.set(-7, 9, 9); moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -8, right: 8, top: 10, bottom: -5, near: 1, far: 36 }); moon.shadow.radius = 4; moon.shadow.bias = -0.0004; moon.shadow.normalBias = 0.02;
  const street = new THREE.SpotLight(0xFFEBD6, 40, 32, 0.45, 1, 2); street.position.set(8, 9, 6); street.target.position.set(0, 2.5, 0);
  street.castShadow = true; street.shadow.mapSize.set(2048, 2048); street.shadow.bias = -0.0004; street.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0x5CC6D6, 2.0); rim.position.set(3, 7, -11);
  root.add(hemi, moon, street, street.target, rim);
  // wooden tabletop the diorama sits on (fades into the dark)
  const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), pbr('wood_table_worn', 7, 7, { color: 0xB0764A }));
  table.material.roughness = 0.6; table.material.envMapIntensity = 0.25; table.material.emissive = new THREE.Color(0x5A2E14); table.material.emissiveMap = table.material.map; table.rotation.x = -Math.PI / 2; table.position.y = -0.29; table.receiveShadow = true; table.visible = false; root.add(table);
  const tableWarm = new THREE.SpotLight(0xFFB070, 60, 16, 0.7, 1, 2); tableWarm.position.set(-1, 1.2, 9); tableWarm.target.position.set(0, -0.3, 3.5); 
  const winLight = new THREE.PointLight(0xFFB466, 1.2, 3, 2); winLight.position.set(-1.2, UF + 1.5, fz + 0.5); root.add(winLight);
  const lampLight = new THREE.SpotLight(0xFFE0B0, 0, 2.5, 0.8, 0.7, 2); lampLight.castShadow = true; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -0.002;
  lampLight.position.set(-0.05, 1.55, CZ); lampLight.target.position.set(-0.6, 0.94, CZ); shop.add(lampLight, lampLight.target);
  const phoneLight = new THREE.PointLight(0x7FE3FF, 0, 0.6, 2); phoneLight.position.set(-0.35, 1.08, CZ + 0.3); counter.add(phoneLight);

  // TV screen overlay (Chain Reaction)
  tv.updateMatrixWorld(true);
  const tvSize = models.Television_01.userData.size;
  const tvTex = canvasTex(512, 384, (c, w, h) => {
    c.fillStyle = '#061C24'; c.fillRect(0, 0, w, h); const cell = 80, ox = 56, oy = 32;
    c.strokeStyle = 'rgba(127,227,255,0.35)'; c.lineWidth = 3;
    for (let i = 0; i <= 5; i++) { c.beginPath(); c.moveTo(ox + i * cell, oy); c.lineTo(ox + i * cell, oy + 4 * cell); c.stroke(); }
    for (let j = 0; j <= 4; j++) { c.beginPath(); c.moveTo(ox, oy + j * cell); c.lineTo(ox + 5 * cell, oy + j * cell); c.stroke(); }
    const orbs = [[0, 0, 1, '#7FE3FF'], [1, 0, 2, '#7FE3FF'], [1, 1, 3, '#7FE3FF'], [3, 2, 2, '#FF4D6D'], [4, 3, 1, '#FF4D6D'], [3, 3, 3, '#FF4D6D'], [2, 1, 1, '#FFB868']];
    for (const [cx, cy, n, col] of orbs) { c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 24; const pts = n === 1 ? [[0, 0]] : n === 2 ? [[-14, 0], [14, 0]] : [[-14, 10], [14, 10], [0, -14]]; for (const [px, py] of pts) { c.beginPath(); c.arc(ox + cx * cell + cell / 2 + px, oy + cy * cell + cell / 2 + py, 15, 0, 7); c.fill(); } }
    c.shadowBlur = 0; c.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 2);
  });
  const tvScreenMat = new THREE.MeshStandardMaterial({ map: tvTex, emissive: 0xffffff, emissiveMap: tvTex, emissiveIntensity: 0.2, roughness: 0.12, transparent: true, opacity: 0.96 });
  const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(tvSize.x * 0.58, tvSize.y * 0.6), tvScreenMat);
  tvScreen.position.set(-tvSize.x * 0.11, tvSize.y * 0.53, tvSize.z / 2 + 0.004); tv.add(tvScreen);
  const tvLight = new THREE.PointLight(0x7FE3FF, 0, 2, 2); tvLight.position.set(0.4, 1.9, ZS + 0.8); shop.add(tvLight);

  const softTex = canvasTex(64, 64, (c) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = r; c.fillRect(0, 0, 64, 64); });
  const smoke = [];
  for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xD6D8E0, transparent: true, opacity: 0, depthWrite: false })); s.userData.t = i / 8; shop.add(s); smoke.push(s); }
  const rain = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3)), new THREE.LineBasicMaterial());
  const RAIN = 0;

  function setLit(k) {
    bulbLight.intensity = 4 * k; bulbs.forEach((m) => (m.emissiveIntensity = 0.1 + 9 * k));
    tubeLight.intensity = 1.2 * k; tubeMat.emissiveIntensity = 0.2 + 4 * k;
    lampLight.intensity = 3 * k; annexLight.intensity = 2.2 * k; tvScreenMat.emissiveIntensity = 0.2 + 1.5 * k; tvLight.intensity = 1.2 * k;
    phoneScreenMat.emissiveIntensity = 0.3 + 1.4 * k; phoneLight.intensity = 0.25 * k;
    smoke.forEach((s) => (s.visible = k > 0.5));
  }
  setLit(0);


  /* ---------- weathering: dirt patches, rain streaks, ground grime, rust on metal ---------- */
  const WEATHER_GLSL = `
    varying vec3 vWPos; uniform float uWeather; uniform float uRust;
    float wh3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float wn3(vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(wh3(i), wh3(i + vec3(1, 0, 0)), f.x), mix(wh3(i + vec3(0, 1, 0)), wh3(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(wh3(i + vec3(0, 0, 1)), wh3(i + vec3(1, 0, 1)), f.x), mix(wh3(i + vec3(0, 1, 1)), wh3(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
    float wfbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * wn3(p); p *= 2.03; a *= 0.5; } return s; }`;
  const weathered = new Set();
  function weather(m, strength, rust) {
    if (weathered.has(m)) return; weathered.add(m);
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uWeather = { value: strength }; sh.uniforms.uRust = { value: rust };
      sh.vertexShader = 'varying vec3 vWPos;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = WEATHER_GLSL + '\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        vec3 wp = vWPos;
        float patches = smoothstep(0.42, 0.85, wfbm(wp * 1.4));
        float streak = smoothstep(0.5, 0.92, wn3(vec3(wp.x * 11.0, wp.y * 0.3, wp.z * 11.0))) * smoothstep(0.35, 0.75, wfbm(wp * 0.7 + 3.0));
        float ground = 1.0 - smoothstep(0.0, 0.9, wp.y);
        float speck = step(0.93, wn3(wp * 38.0)) * 0.5;
        float g = clamp(patches * 0.4 + streak * 0.55 + ground * 0.35 + speck * 0.3, 0.0, 0.85) * uWeather;
        vec3 dirt = mix(vec3(0.3, 0.27, 0.22), vec3(0.55, 0.26, 0.1), uRust * smoothstep(0.35, 0.7, wfbm(wp * 2.2 + 7.0)));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * dirt * 1.5, g);`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor + 0.25 * uWeather * (1.0 - smoothstep(0.0, 0.9, vWPos.y)), 0.0, 1.0);');
    };
    m.customProgramCacheKey = () => 'weather';
    m.needsUpdate = true;
  }
  bld.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (!m || !m.isMeshStandardMaterial || m.userData.prop || m.transparent || m.emissiveMap || m.alphaMap || m.emissiveIntensity > 0.05 && m.emissive.getHex() !== 0) continue;
      weather(m, m.userData.weatherStrength ?? (m.metalness > 0.25 ? 1.8 : 1.7), m.metalness > 0.25 ? 1.0 : 0.25);
    }
  });
  [pave.material].forEach((m) => weather(m, 0.7, 0.0));

  root.updateMatrixWorld(true);
  const wp = (o, dx = 0, dy = 0, dz = 0) => o.localToWorld(new THREE.Vector3(dx, dy, dz));
  const tvC = wp(tv, -tvSize.x * 0.1, tvSize.y * 0.55, tvSize.z / 2);
  const phoneC = wp(phone);
  const safeC = wp(safe, 0, 0.25, 0.22);
  const wallC = wp(wallPhone, 0, 0.25, 0.1);
  const signC = wp(signBox, 0, 0, 0.12);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const hotspots = {
    phone: { objs: [phone], anchor: phoneC, cam: phoneC.clone().add(V(0.35, 0.25, 0.75)) },
    tv: { objs: [tv], anchor: tvC, cam: tvC.clone().add(V(0.5, 0.05, 1.75)) },
    safe: { objs: [safe], anchor: safeC, cam: safeC.clone().add(V(0.35, 0.3, 1.25)) },
    rotary: { objs: [wallPhone], anchor: wallC, cam: wallC.clone().add(V(1.5, 0.15, 0.7)) },
    ticket: { objs: [signBox], anchor: signC, cam: signC.clone().add(V(0.9, -0.2, 3.6)) },
  };

  // Cloned PBR maps share their image source. Wait for it before the first render,
  // then mark every clone ready so no material uploads an empty texture.
  await Promise.all(textureLoads);
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const material of [].concat(o.material)) {
      for (const key of ['map', 'normalMap', 'roughnessMap', 'bumpMap', 'emissiveMap']) {
        if (material[key]) material[key].needsUpdate = true;
      }
    }
  });
  return { root, envMap, hotspots, setLit, anim: { smokeFrom, bulbsGroup: bulbs, smoke, rain, RAIN, shopShutter: shutters, dial, signFace: signBox.userData.face, vFace: vSign.userData.face } };
}
