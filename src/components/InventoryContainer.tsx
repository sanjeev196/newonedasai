import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Settings2, RotateCcw } from 'lucide-react';
import TWEEN from '@tweenjs/tween.js';
import { useStore } from '../data/store';

interface InventoryContainerProps {
  totalInventory: number;
  maxInventory: number;
}

const InventoryContainer: React.FC<InventoryContainerProps> = ({ totalInventory, maxInventory }) => {
  const { inventory, medicines } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [liquid, setLiquid] = useState<THREE.Mesh | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const containerGroupRef = useRef<THREE.Group | null>(null);
  const rotationSpeed = useRef(0.002);
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const liquidLevel = useRef(0);

  // Calculate total inventory and percentages
  const percentage = (totalInventory / maxInventory) * 100;

  // Calculate percentage for each medicine
  const medicineStats = inventory
    .map(item => {
      const medicine = medicines.find(m => m.id === item.medicine_id);
      return {
        name: medicine?.name || 'Unknown',
        quantity: item.quantity,
        percentage: ((item.quantity / totalInventory) * 100).toFixed(1)
      };
    })
    .sort((a, b) => b.quantity - a.quantity);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );

    const newRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    newRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(newRenderer.domElement);

    // Container group
    const group = new THREE.Group();
    containerGroupRef.current = group;
    newScene.add(group);

    // Container geometry
    const containerGeometry = new THREE.CylinderGeometry(2, 2, 5, 32, 1, true);
    const containerMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    group.add(container);

    // Liquid
    const liquidGeometry = new THREE.CylinderGeometry(1.9, 1.9, 4, 32);
    const liquidMaterial = new THREE.MeshPhongMaterial({
      color: 0x22c55e, // Changed to green
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -2 + (4 * percentage) / 2;
    liquidMesh.scale.y = percentage;
    group.add(liquidMesh);
    setLiquid(liquidMesh);
    liquidLevel.current = percentage;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    newScene.add(directionalLight);

    newCamera.position.z = 10;
    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();

      if (isRotating && !isDragging) {
        if (containerGroupRef.current) {
          containerGroupRef.current.rotation.y += rotationSpeed.current;
        }
      }

      // Smooth rotation
      if (containerGroupRef.current) {
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.1;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.1;
        containerGroupRef.current.rotation.x = currentRotation.current.x;
        containerGroupRef.current.rotation.y = currentRotation.current.y;
      }

      newRenderer.render(newScene, newCamera);
    };

    animate();

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(newRenderer.domElement);
      }
    };
  }, []);

  // Update liquid level when inventory changes
  useEffect(() => {
    if (liquid) {
      const newPercentage = Math.min((totalInventory / maxInventory) * 0.8, 0.8);
      
      // Animate the liquid level
      new TWEEN.Tween(liquid.scale)
        .to({ y: newPercentage }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      new TWEEN.Tween(liquid.position)
        .to({ y: -2 + (4 * newPercentage) / 2 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      // Add wave animation
      const waveAnimation = new TWEEN.Tween({ wave: 0 })
        .to({ wave: Math.PI * 2 }, 2000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .repeat(Infinity)
        .onUpdate(({ wave }) => {
          if (liquid) {
            liquid.position.y = -2 + (4 * newPercentage) / 2 + Math.sin(wave) * 0.05;
          }
        })
        .start();
    }
  }, [totalInventory, liquid]);

  // Mouse controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.current.x,
      y: e.clientY - previousMousePosition.current.y,
    };

    targetRotation.current.x += deltaMove.y * 0.005;
    targetRotation.current.y += deltaMove.x * 0.005;

    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetRotation = () => {
    if (containerGroupRef.current) {
      targetRotation.current = { x: 0, y: 0 };
    }
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-0 right-0 z-10 p-2 flex gap-2">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsRotating(!isRotating)}
          title={isRotating ? "Pause rotation" : "Resume rotation"}
        >
          <Settings2 className="h-5 w-5 text-gray-600" />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={resetRotation}
          title="Reset rotation"
        >
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Stats Overlay */}
      <div 
        className="absolute top-4 left-4 z-10 bg-white/95 rounded-lg shadow-lg p-4 w-64 transition-opacity duration-200"
        style={{ 
          opacity: showStats ? 1 : 0,
          pointerEvents: showStats ? 'auto' : 'none',
          transform: 'translateY(0)',
          transition: 'opacity 0.2s, transform 0.2s'
        }}
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Inventory Distribution</h3>
        <div className="space-y-3">
          {medicineStats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate" title={stat.name}>
                  {stat.name}
                </span>
                <span className="text-gray-900 font-medium">
                  {stat.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${stat.percentage}%`,
                    opacity: 0.8 + (parseFloat(stat.percentage) / 500) // Slightly vary opacity based on percentage
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Total Inventory</span>
            <span className="text-gray-900 font-medium">{totalInventory.toLocaleString()} units</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-600">Capacity Used</span>
            <span className="text-gray-900 font-medium">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setShowStats(true)}
        onMouseLeave={() => {
          handleMouseUp();
          setShowStats(false);
        }}
      />
    </div>
  );
};

export default InventoryContainer;