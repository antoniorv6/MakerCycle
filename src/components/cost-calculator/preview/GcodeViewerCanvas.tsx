'use client';

/**
 * Visor 3D de toolpaths G-code usando Three.js vanilla.
 * Se carga dinamicamente desde GcodeViewer.tsx con next/dynamic({ ssr: false }).
 * Usa Three.js directamente (sin React Three Fiber) para evitar problemas
 * de compatibilidad con Turbopack y React internals.
 */

import { useRef, useEffect } from 'react';
import type { GcodeToolpath } from '@/lib/gcode_parser';

interface GcodeViewerCanvasProps {
  toolpath: GcodeToolpath;
  filamentColor?: string;
}

/**
 * Configura la escena Three.js completa y retorna una funcion de cleanup.
 * Se ejecuta dentro de un useEffect despues del dynamic import de Three.js.
 */
async function setupScene(
  container: HTMLDivElement,
  toolpath: GcodeToolpath,
  color: string
): Promise<() => void> {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width === 0 || height === 0) return () => {};

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f1f5f9');

  // Camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  // Toolpath geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(toolpath.vertices, 3));

  const material = toolpath.colors
    ? (() => {
        geometry.setAttribute('color', new THREE.BufferAttribute(toolpath.colors, 3));
        return new THREE.LineBasicMaterial({ vertexColors: true });
      })()
    : new THREE.LineBasicMaterial({ color: new THREE.Color(color) });

  const lineSegments = new THREE.LineSegments(geometry, material);
  scene.add(lineSegments);

  // Grid (cama de impresion)
  const { bounds } = toolpath;
  const sizeX = bounds.maxX - bounds.minX;
  const sizeZ = bounds.maxZ - bounds.minZ;
  const gridSize = Math.max(sizeX, sizeZ) * 1.2;
  const grid = new THREE.GridHelper(gridSize, 10, 0xcccccc, 0xe5e5e5);
  grid.position.set(
    (bounds.minX + bounds.maxX) / 2,
    0,
    (bounds.minZ + bounds.maxZ) / 2
  );
  scene.add(grid);

  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(10, 10, 5);
  scene.add(dirLight);

  // Posicionar camara
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const maxDim = Math.max(sizeX, bounds.maxY - bounds.minY, sizeZ);
  const distance = maxDim * 1.5;
  camera.position.set(
    cx + distance * 0.6,
    cy + distance * 0.8,
    cz + distance * 0.6
  );
  camera.lookAt(cx, cy, cz);

  // OrbitControls para interaccion (rotar, zoom, pan)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(cx, cy, cz);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 5;
  controls.maxDistance = 1000;
  controls.update();

  // Resize observer
  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const { width: w, height: h } = entry.contentRect;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(container);

  // Render loop
  let disposed = false;
  let animationId: number;

  function animate() {
    if (disposed) return;
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Cleanup function
  return () => {
    disposed = true;
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    controls.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}

export default function GcodeViewerCanvas({ toolpath, filamentColor }: GcodeViewerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || toolpath.vertexCount === 0) return;

    // Limpiar instancia previa
    cleanupRef.current?.();
    cleanupRef.current = null;

    let cancelled = false;

    setupScene(container, toolpath, filamentColor || '#4f9cf5').then((cleanup) => {
      if (cancelled) {
        cleanup();
        return;
      }
      cleanupRef.current = cleanup;
    });

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [toolpath, filamentColor]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
