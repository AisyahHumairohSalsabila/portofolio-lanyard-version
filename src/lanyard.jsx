/*
 * Lanyard ID card untuk portofolio.
 * Fisika kartu dan tali diambil dari repo fattahmaulana/3D_CARD (react-three-fiber + Rapier),
 * lalu desain muka kartu dan tali digambar sendiri lewat canvas supaya tidak perlu mengedit GLB.
 *
 * Pasang: <div id="lanyard"></div> + <script src="lanyard.js" defer></script>
 * Ubah isi kartu: window.LANYARD_CONFIG = { name: '...', role: '...' } sebelum script dimuat.
 */
import * as THREE from 'three';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import photoUrl from '../foto.jpg';
import modelUrl from '../assets/kartu.glb';

extend({ MeshLineGeometry, MeshLineMaterial });

/* ------------------------------------------------------------------ */
/* Konfigurasi: ubah lewat window.LANYARD_CONFIG                        */
/* ------------------------------------------------------------------ */
const DEFAULTS = {
  name: 'Aisyah Humairoh Salsabila',
  roles: ['Quality Assurance', 'System Analyst', 'Business Analyst'],
  subtitle: 'Sistem Informasi · Universitas Gunadarma',
  skills: ['Excel', 'Python', 'Power BI'],
  initials: 'AHS',
  photo: photoUrl,
  photoFocus: [0.5, 0.35],                     // titik fokus foto [kiri-kanan, atas-bawah], 0 sampai 1
  linkedin: 'linkedin.com/in/aisyahhumairohsalsabila',
  github: 'github.com/AisyahHumairohSalsabila',
  hint: 'Tarik kartunya',
  strapText: 'AISYAH · QA · SA · BA ·',
  offsetX: 0,                                  // geser posisi kartu ke kiri (-) atau kanan (+)
  glb: modelUrl,
  colors: { ink: '#0e1b26', paper: '#f4f7f9', soft: '#3c4b57', accent: '#0b6e8f', accent2: '#4fb8d8', strap: '#0b6e8f' },
};

function getConfig() {
  const user = (typeof window !== 'undefined' && window.LANYARD_CONFIG) || {};
  return { ...DEFAULTS, ...user, colors: { ...DEFAULTS.colors, ...(user.colors || {}) } };
}

/* ------------------------------------------------------------------ */
/* Menggambar tekstur (canvas)                                          */
/* ------------------------------------------------------------------ */
function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function spaced(ctx, px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

function fitText(ctx, text, maxW, maxPx, weight, family) {
  let px = maxPx;
  ctx.font = `${weight} ${px}px ${family}`;
  const w = ctx.measureText(text).width;
  if (w > maxW) { px = Math.floor(px * (maxW / w)); ctx.font = `${weight} ${px}px ${family}`; }
  return px;
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const FW = 716, FH = 1000; // ukuran logis kartu (rasio sama dengan model 3D)
const RES = 3;             // kanvas muka digambar 3x untuk mempertajam teks dan detail

function drawFront(cfg, photo, family) {
  const c = document.createElement('canvas');
  c.width = FW * RES; c.height = FH * RES;
  const ctx = c.getContext('2d');
  ctx.scale(RES, RES);
  const k = cfg.colors;
  ctx.fillStyle = k.paper; ctx.fillRect(0, 0, FW, FH);

  // pita atas (area lubang tali + penjepit)
  ctx.fillStyle = k.ink; ctx.fillRect(0, 0, FW, 170);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = k.accent2; ctx.font = `600 22px ${family}`; spaced(ctx, 6);
  ctx.fillText('PORTOFOLIO', FW / 2, 140);
  spaced(ctx, 0);

  // foto atau inisial
  const cx = FW / 2, cy = 312, r = 105;
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, Math.PI * 2); ctx.fillStyle = k.accent; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  if (photo) {
    const s = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
    const w = photo.width * s, h = photo.height * s;
    const fx = cfg.photoFocus[0], fy = cfg.photoFocus[1];
    ctx.drawImage(photo, cx - r - (w - 2 * r) * fx, cy - r - (h - 2 * r) * fy, w, h);
  } else {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, k.accent); g.addColorStop(1, k.accent2);
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#ffffff'; ctx.font = `700 80px ${family}`; ctx.textBaseline = 'middle';
    ctx.fillText(cfg.initials, cx, cy + 4);
  }
  ctx.restore();

  // nama
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = k.ink; ctx.font = `700 58px ${family}`;
  let y = 496;
  wrapText(ctx, cfg.name, FW - 110).forEach((ln) => { ctx.fillText(ln, FW / 2, y); y += 62; });

  // peran: satu baris per peran
  y += 2;
  ctx.fillStyle = k.accent; ctx.font = `700 30px ${family}`; spaced(ctx, 3);
  cfg.roles.forEach((ro) => { ctx.fillText(ro.toUpperCase(), FW / 2, y); y += 38; });
  spaced(ctx, 0);

  // keterangan
  y += 8;
  ctx.fillStyle = k.soft; ctx.font = `500 27px ${family}`;
  wrapText(ctx, cfg.subtitle, FW - 100).forEach((ln) => { ctx.fillText(ln, FW / 2, y); y += 36; });

  // chip keahlian
  ctx.font = `600 26px ${family}`;
  const pad = 22, gap = 12, ch = 48;
  const widths = cfg.skills.map((s) => ctx.measureText(s).width + pad * 2);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let x = (FW - total) / 2; const cyChip = Math.min(y + 24, 818);
  cfg.skills.forEach((s, i) => {
    rrect(ctx, x, cyChip - ch / 2, widths[i], ch, ch / 2);
    ctx.strokeStyle = k.accent; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = k.ink; ctx.textBaseline = 'middle';
    ctx.fillText(s, x + widths[i] / 2, cyChip + 1);
    x += widths[i] + gap;
  });

  // barcode dekoratif (deterministik dari nama)
  let seed = 0; for (const ch2 of cfg.name) seed = (seed * 31 + ch2.charCodeAt(0)) >>> 0;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  let bx = 96; ctx.fillStyle = k.ink;
  while (bx < FW - 96) {
    const bw = 3 + Math.floor(rnd() * 6);
    if (Math.floor(rnd() * 3) !== 0) ctx.fillRect(bx, 868, Math.min(bw, FW - 96 - bx), 36);
    bx += bw + 3;
  }
  ctx.textBaseline = 'alphabetic'; ctx.fillStyle = k.soft; ctx.font = `500 22px ${family}`;
  ctx.fillText(cfg.linkedin, FW / 2, 936);
  return c;
}

function drawBack(cfg, family) {
  const c = document.createElement('canvas');
  c.width = FW * RES; c.height = FH * RES;
  const ctx = c.getContext('2d');
  ctx.scale(RES, RES);
  const k = cfg.colors;
  ctx.fillStyle = k.ink; ctx.fillRect(0, 0, FW, FH);

  // lingkaran konsentris halus
  ctx.strokeStyle = k.accent2; ctx.lineWidth = 2;
  for (let i = 1; i <= 9; i++) { ctx.globalAlpha = 0.22 - i * 0.018; ctx.beginPath(); ctx.arc(FW / 2, 520, i * 62, 0, Math.PI * 2); ctx.stroke(); }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = k.accent2; ctx.font = `600 22px ${family}`; spaced(ctx, 6);
  ctx.fillText('PORTOFOLIO', FW / 2, 140); spaced(ctx, 0);

  // tiga peran, masing-masing disesuaikan lebarnya
  ctx.fillStyle = '#ffffff';
  const n = cfg.roles.length;
  let y = 400 - (n - 1) * 44;
  cfg.roles.forEach((ro) => { fitText(ctx, ro.toUpperCase(), FW - 130, 76, 700, family); ctx.fillText(ro.toUpperCase(), FW / 2, y); y += 90; });

  ctx.fillStyle = k.accent2; ctx.font = `600 28px ${family}`; spaced(ctx, 2);
  ctx.fillText(cfg.skills.join('  ·  '), FW / 2, y + 6); spaced(ctx, 0);

  ctx.fillStyle = '#ffffff'; ctx.font = `500 25px ${family}`;
  ctx.fillText(cfg.github, FW / 2, 828);
  ctx.fillText(cfg.linkedin, FW / 2, 866);
  ctx.fillStyle = k.accent2; ctx.font = `600 20px ${family}`; spaced(ctx, 4);
  ctx.fillText(cfg.hint.toUpperCase(), FW / 2, 920); spaced(ctx, 0);
  return c;
}

function drawStrap(cfg, family) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 248;
  const ctx = c.getContext('2d');
  ctx.fillStyle = cfg.colors.strap; ctx.fillRect(0, 0, 1024, 248);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(0, 22, 1024, 5); ctx.fillRect(0, 221, 1024, 5);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
  let size = 80; ctx.font = `700 ${size}px ${family}`;
  const target = 940;
  const w = ctx.measureText(cfg.strapText).width;
  size = Math.max(28, Math.floor(size * (target / w)));
  ctx.font = `700 ${size}px ${family}`;
  ctx.fillText(cfg.strapText, 512, 126);
  return c;
}

async function buildTextures(cfg) {
  const family = (getComputedStyle(document.body).fontFamily || 'sans-serif');
  try {
    await Promise.all([document.fonts.load(`700 40px ${family}`), document.fonts.load(`500 20px ${family}`), document.fonts.load(`600 20px ${family}`)]);
    await document.fonts.ready;
  } catch (e) { /* lanjut dengan font cadangan */ }
  const photo = await loadImage(cfg.photo);

  // atlas 3072x3072 memberi detail lebih tinggi pada tekstur kartu di layar HiDPI
  const S = 3;
  const atlas = document.createElement('canvas');
  atlas.width = 1024 * S; atlas.height = 1024 * S;
  const a = atlas.getContext('2d');
  a.fillStyle = cfg.colors.paper; a.fillRect(0, 0, 1024 * S, 1024 * S);
  a.imageSmoothingQuality = 'high';
  a.drawImage(drawFront(cfg, photo, family), 0, 3 * S, 512 * S, 771 * S);
  a.drawImage(drawBack(cfg, family), 512 * S, 3 * S, 512 * S, 771 * S);

  const card = new THREE.CanvasTexture(atlas);
  card.flipY = false; card.colorSpace = THREE.SRGBColorSpace; card.anisotropy = 16; card.needsUpdate = true;

  const strap = new THREE.CanvasTexture(drawStrap(cfg, family));
  strap.colorSpace = THREE.SRGBColorSpace; strap.wrapS = strap.wrapT = THREE.RepeatWrapping; strap.needsUpdate = true;
  return { card, strap };
}

/* ------------------------------------------------------------------ */
/* Kartu + tali (fisika dari repo asli)                                  */
/* ------------------------------------------------------------------ */
function Band({ cfg, tex, maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cfg.glb);
  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  // lepaskan kartu juga saat jari/kursor lepas di luar kartu, atau browser mengambil alih gestur
  useEffect(() => {
    if (!dragged) return;
    const release = () => drag(false);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => { window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); };
  }, [dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        // faktor dibatasi maks. 1 supaya frame yang lambat tidak membuat tali melempar keluar
        ref.current.lerped.lerp(ref.current.translation(), Math.min(1, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      const pts = curve.getPoints(32);
      // titik yang berimpit bisa menghasilkan NaN sesaat: lewati frame itu, geometri lama tetap dipakai
      if (pts.every((q) => Number.isFinite(q.x + q.y + q.z))) band.current.geometry.setPoints(pts);
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  return (
    <>
      <group position={[cfg.offsetX, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}><BallCollider args={[0.1]} /></RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={tex.card} map-anisotropy={16} emissive="#ffffff" emissiveMap={tex.card} emissiveIntensity={0.38} clearcoat={1} clearcoatRoughness={0.2} roughness={0.4} metalness={0.1} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={tex.strap} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Aplikasi: canvas transparan, berhenti saat di luar layar              */
/* ------------------------------------------------------------------ */
function App({ host }) {
  const cfg = useRef(getConfig()).current;
  const [tex, setTex] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => { buildTextures(cfg).then(setTex); useGLTF.preload(cfg.glb); }, [cfg]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '120px' });
    io.observe(host);
    return () => io.disconnect();
  }, [host]);

  if (!tex) return null;
  return (
    <Canvas
      camera={{ position: [0, 0, 10.5], fov: 20 }}
      dpr={[1, 2.25]}
      frameloop={visible ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
      <ambientLight intensity={Math.PI} />
      <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Suspense fallback={null}>
          <Band cfg={cfg} tex={tex} />
        </Suspense>
      </Physics>
      <Environment blur={0.75}>
        <color attach="background" args={['black']} />
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* Pemasangan otomatis ke <div id="lanyard"> atau [data-lanyard]         */
/* ------------------------------------------------------------------ */
function injectStyle() {
  if (document.getElementById('lanyard-style')) return;
  const s = document.createElement('style');
  s.id = 'lanyard-style';
  s.textContent = `
    :where(#lanyard, [data-lanyard]) { display:block; position:relative; width:100%; height:min(82vh,680px); min-height:420px; }
    :where(#lanyard, [data-lanyard]) canvas { touch-action: pan-y; }
    @media (hover:hover) and (pointer:fine) { :where(#lanyard, [data-lanyard]) canvas { touch-action: none; } }
  `;
  document.head.appendChild(s);
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

function start() {
  const hosts = new Set([...document.querySelectorAll('#lanyard, [data-lanyard]')]);
  if (!hosts.size) return;
  injectStyle();
  if (!hasWebGL()) { hosts.forEach((h) => h.setAttribute('data-lanyard-state', 'no-webgl')); return; }
  hosts.forEach((h) => {
    if (h.__lanyard) return;
    h.__lanyard = true;
    createRoot(h).render(<App host={h} />);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
