import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Paper3DHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 9);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffaee, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(6, 8, 6);
    scene.add(mainLight);

    // Warm terracotta accent rim light
    const accentLight = new THREE.PointLight(0xc85a32, 1.8, 15);
    accentLight.position.set(-5, -4, 4);
    scene.add(accentLight);

    const softBlueLight = new THREE.PointLight(0x4a90e2, 0.8, 15);
    softBlueLight.position.set(5, -3, 3);
    scene.add(softBlueLight);

    // 5. Create Floating Paper Documents
    const paperGroup = new THREE.Group();
    scene.add(paperGroup);

    interface PaperData {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      floatSpeed: number;
      floatOffset: number;
    }

    const papers: PaperData[] = [];

    // Helper to create a curved paper plane geometry
    const createPaperGeometry = (width: number, height: number) => {
      const geom = new THREE.PlaneGeometry(width, height, 16, 16);
      const posAttr = geom.attributes.position;

      // Subtle gentle wave/curl at corners to simulate real physical paper
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const curveZ = Math.sin((x / width) * Math.PI) * 0.08 + Math.cos((y / height) * Math.PI) * 0.06;
        posAttr.setZ(i, curveZ);
      }
      geom.computeVertexNormals();
      return geom;
    };

    // Paper Material - Warm cream paper texture feel
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf9f6,
      roughness: 0.75,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const accentPaperMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff6f0,
      roughness: 0.65,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    // Configuration for 5 floating paper sheets in background
    const paperConfigs = [
      { w: 2.2, h: 3.1, x: -3.8, y: 1.2, z: -1.5, rotX: 0.2, rotY: 0.4, rotZ: -0.15, isAccent: false },
      { w: 1.8, h: 2.5, x: 3.9, y: 1.8, z: -2.0, rotX: -0.25, rotY: -0.3, rotZ: 0.2, isAccent: true },
      { w: 2.4, h: 3.3, x: 3.6, y: -1.8, z: -1.2, rotX: 0.15, rotY: -0.5, rotZ: -0.1, isAccent: false },
      { w: 1.6, h: 2.2, x: -3.5, y: -1.9, z: -2.2, rotX: -0.3, rotY: 0.35, rotZ: 0.25, isAccent: true },
      { w: 1.4, h: 1.9, x: 0.0, y: 3.2, z: -3.5, rotX: 0.1, rotY: 0.1, rotZ: 0.05, isAccent: false },
    ];

    paperConfigs.forEach((cfg, idx) => {
      const geom = createPaperGeometry(cfg.w, cfg.h);
      const mat = cfg.isAccent ? accentPaperMaterial : paperMaterial;
      const mesh = new THREE.Mesh(geom, mat);

      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);

      paperGroup.add(mesh);

      papers.push({
        mesh,
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        rotSpeedX: 0.0005 * (idx % 2 === 0 ? 1 : -1),
        rotSpeedY: 0.0007 * (idx % 3 === 0 ? 1 : -1),
        rotSpeedZ: 0.0004 * (idx % 2 === 0 ? -1 : 1),
        floatSpeed: 0.0012 + idx * 0.0003,
        floatOffset: idx * 1.3,
      });
    });

    // 6. Floating Ambient Particles (Warm Paper Dust / Sparkles)
    const particleCount = 60;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8 - 1;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc85a32,
      size: 0.045,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // 7. Smooth Mouse Parallax Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetMouseX = (event.clientX / innerWidth - 0.5) * 2;
      targetMouseY = (event.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse positions for silky smooth fluid motion
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      // Group parallax movement
      paperGroup.rotation.y = currentMouseX * 0.18;
      paperGroup.rotation.x = -currentMouseY * 0.12;

      // Animate individual paper sheets
      papers.forEach((p) => {
        p.mesh.position.y = p.baseY + Math.sin(elapsedTime * p.floatSpeed * 2.0 + p.floatOffset) * 0.22;
        p.mesh.position.x = p.baseX + Math.cos(elapsedTime * p.floatSpeed * 1.5 + p.floatOffset) * 0.12;

        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.z += p.rotSpeedZ;
      });

      // Animate floating particles
      const positions = particleGeom.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.0025;
        if (positions[i] > 5) {
          positions[i] = -5;
        }
      }
      particleGeom.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean Up on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      paperGroup.clear();
      particleGeom.dispose();
      particleMat.dispose();
      paperMaterial.dispose();
      accentPaperMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-85"
      aria-hidden="true"
    />
  );
};
