import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const WebGLIntro = ({ durationMs = 2200 }) => {
  const mountRef = useRef(null);
  const rafRef = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Skip if already shown in this session
    if (sessionStorage.getItem('webgl_intro_shown') === '1') {
      setVisible(false);
      return;
    }

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // Geometry: logo-like swirling particles
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color('#4f46e5'); // indigo-600
    const colorB = new THREE.Color('#22d3ee'); // cyan-400

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 8; // spirals
      const radius = 0.2 + 1.5 * t;
      const x = Math.cos(angle) * radius;
      const y = (t - 0.5) * 1.8;
      const z = Math.sin(angle) * radius;

      positions.set([x, y, z], i * 3);

      const c = colorA.clone().lerp(colorB, t);
      colors.set([c.r, c.g, c.b], i * 3);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0.0 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Intro fade-in
    let start = performance.now();

    const onResize = () => {
      if (!mount) return;
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    const tick = (now) => {
      const t = (now - start) / 1000;
      points.rotation.y = t * 0.5;
      points.rotation.x = Math.sin(t * 0.3) * 0.15;
      // ease opacity in first 0.6s, keep, then out before removal
      const fadeIn = Math.min(1, t / 0.6);
      material.opacity = fadeIn;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const timeout = setTimeout(() => {
      // Fade out CSS and remove
      setVisible(false);
      sessionStorage.setItem('webgl_intro_shown', '1');
    }, durationMs);

    // Skip on user interaction
    const skip = () => {
      setVisible(false);
      sessionStorage.setItem('webgl_intro_shown', '1');
    };
    mount.addEventListener('click', skip);
    mount.addEventListener('keydown', skip);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('click', skip);
      mount.removeEventListener('keydown', skip);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden"
      style={{ animation: 'fadeOut 0.4s ease 1 forwards', animationDelay: `${Math.max(0, (durationMs-400))}ms` }}
      aria-label="Intro animation"
    >
      {/* Fallback branding while WebGL warms up */}
      <div className="absolute text-center select-none pointer-events-none">
        <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          SkillUp
        </div>
        <div className="text-sm text-gray-500 mt-2">Загрузка...</div>
      </div>
      <style>{`@keyframes fadeOut{to{opacity:0;visibility:hidden}}`}</style>
    </div>
  );
};

export default WebGLIntro; 