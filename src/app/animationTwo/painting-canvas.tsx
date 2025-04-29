'use client'

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Point {
  x: number;
  y: number;
  radius: number;
  color: string;
  strokeColor: string;
  timestamp: number;
  velocity: number;
}

const Canvas: React.FC = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const colors = [
    { main: "#C9B3ED", stroke: "#DECFF3" }
  ];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    const animate = () => {
      if (pointsRef.current.length >= 2) {
        drawPoints(ctx);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    if (pointsRef.current.length < 2) return;

    const currentPoint = pointsRef.current[pointsRef.current.length - 1];
    
    if (!lastPointRef.current) {
      lastPointRef.current = currentPoint;
      return;
    }

    const lastPoint = lastPointRef.current;
    const distance = Math.sqrt(
      Math.pow(currentPoint.x - lastPoint.x, 2) + 
      Math.pow(currentPoint.y - lastPoint.y, 2)
    );

    if (distance < 2) return; 
    const velocityScale = 1.2 - Math.min(0.7, currentPoint.velocity * 0.9);
    ctx.beginPath();
    const angle = Math.atan2(currentPoint.y - lastPoint.y, currentPoint.x - lastPoint.x);
    const radius1 = lastPoint.radius * velocityScale;
    const radius2 = currentPoint.radius * velocityScale;

    ctx.fillStyle = currentPoint.color;
    const leftCurveCP1 = {
      x: lastPoint.x + Math.cos(angle - 0.5) * radius1 * 0.8,
      y: lastPoint.y + Math.sin(angle - 0.5) * radius1 * 0.8,
    };

    const leftCurveCP2 = {
      x: currentPoint.x + Math.cos(angle + Math.PI - 0.5) * radius2 * 0.8,
      y: currentPoint.y + Math.sin(angle + Math.PI - 0.5) * radius2 * 0.8,
    };

    const rightCurveCP1 = {
      x: lastPoint.x + Math.cos(angle + 0.5) * radius1 * 0.8,
      y: lastPoint.y + Math.sin(angle + 0.5) * radius1 * 0.8,
    };

    const rightCurveCP2 = {
      x: currentPoint.x + Math.cos(angle + Math.PI + 0.5) * radius2 * 0.8,
      y: currentPoint.y + Math.sin(angle + Math.PI + 0.5) * radius2 * 0.8,
    };

    // Start drawing the path
    ctx.moveTo(
      lastPoint.x + Math.cos(angle + Math.PI/2) * radius1,
      lastPoint.y + Math.sin(angle + Math.PI/2) * radius1
    );
    
    // First curve
    ctx.bezierCurveTo(
      leftCurveCP1.x, leftCurveCP1.y,
      leftCurveCP2.x, leftCurveCP2.y,
      currentPoint.x + Math.cos(angle + Math.PI/2) * radius2,
      currentPoint.y + Math.sin(angle + Math.PI/2) * radius2
    );
    
    // Arc around the end point
    ctx.arc(
      currentPoint.x, currentPoint.y,
      radius2,
      angle + Math.PI/2, angle - Math.PI/2,
      true
    );
    
    // Second curve back to start
    ctx.bezierCurveTo(
      rightCurveCP2.x, rightCurveCP2.y,
      rightCurveCP1.x, rightCurveCP1.y,
      lastPoint.x + Math.cos(angle - Math.PI/2) * radius1,
      lastPoint.y + Math.sin(angle - Math.PI/2) * radius1
    );
    
    // Arc around the start point
    ctx.arc(
      lastPoint.x, lastPoint.y,
      radius1,
      angle - Math.PI/2, angle + Math.PI/2,
      true
    );
    
    ctx.closePath();
    ctx.fill();

    // Draw the stroke (lighter outline) with enhanced smoothness
    ctx.strokeStyle = currentPoint.strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add semi-transparent overlays for depth and glossy effect
    ctx.save();
    const clipPath = new Path2D();
    clipPath.arc(currentPoint.x, currentPoint.y, radius2 * 0.8, 0, Math.PI * 2);
    ctx.clip(clipPath);
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fillRect(
      currentPoint.x - radius2,
      currentPoint.y - radius2,
      radius2 * 2,
      radius2 * 2
    );
    ctx.restore();
    
    
    // Draw circular caps at both ends for smooth blob endings
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, radius1, 0, Math.PI * 2);
    ctx.fillStyle = lastPoint.color;
    ctx.fill();
    ctx.strokeStyle = lastPoint.strokeColor;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, radius2, 0, Math.PI * 2);
    ctx.fillStyle = currentPoint.color;
    ctx.fill();
    ctx.strokeStyle = currentPoint.strokeColor;
    ctx.stroke();

    lastPointRef.current = currentPoint;
    
    // Remove early points to prevent memory issues but keep enough for smooth trails
    if (pointsRef.current.length > 100) {
      pointsRef.current.shift();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    const elapsed = Math.max(5, now - lastTimeRef.current);
    
    // Calculate mouse velocity for varying blob size
    const distance = Math.sqrt(
      Math.pow(e.clientX - lastPositionRef.current.x, 2) + 
      Math.pow(e.clientY - lastPositionRef.current.y, 2)
    );
    
    const velocity = distance / elapsed;
    const baseRadius = 35; // Base size of paint blobs (smaller than before)
    const radius = baseRadius * (1 - Math.min(0.6, velocity * 0.3));

    // Select random color from our palette with subtle variations
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    // Add point with enhanced properties
    pointsRef.current.push({
      x: e.clientX,
      y: e.clientY,
      radius: radius,
      color: colors[colorIndex].main,
      strokeColor: colors[colorIndex].stroke,
      timestamp: now,
      velocity: velocity
    });

    // Update last position and time
    lastPositionRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;
  };

  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pointsRef.current = [];
    lastPointRef.current = null;
  };

  const changeani = () => {
    router.push("/");
  };

  return (
    <>
      <motion.canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onMouseMove={handleMouseMove}
      />
            <button
        onClick={changeani}
        className="fixed bottom-4 right-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Change Paint Animation
      </button>
      <button
        onClick={clearCanvas}
        className="fixed bottom-4 left-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Clear Canvas
      </button>
    </>
  );
};

export default Canvas;