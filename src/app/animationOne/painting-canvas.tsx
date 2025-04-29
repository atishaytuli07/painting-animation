'use client'

import React, { useRef, useEffect} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Point {
  x: number;
  y: number;
  pressure: number;
}

const Canvas: React.FC = () => {
    const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathsRef = useRef<Point[][]>([]);
  const currentPathRef = useRef<Point[]>([]);
  const prevPointRef = useRef<Point | null>(null);
  
  // Increased paint color and width
  const paintColor = "#61ABBB";
  const baseWidth = 24;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match window size with higher resolution for smoother rendering
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Scale context according to device pixel ratio for sharper rendering
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      
      // Redraw all paths when resize
      redrawCanvas(ctx);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Redraw all paths when needed
  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw all saved paths
    pathsRef.current.forEach(path => {
      if (path.length < 2) return;
      drawSmoothPath(ctx, path);
    });
    
    // Draw current path if exists
    if (currentPathRef.current.length > 1) {
      drawSmoothPath(ctx, currentPathRef.current);
    }
  };
  
  // Draw a smooth path using Bezier curves for more natural strokes with increased width
  const drawSmoothPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;
    
    ctx.save();
    
    // Start a new path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    // Use Bezier curves for extremely smooth lines
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];
      
      if (i === 1) {
        // For the first segment, use the first point directly
        ctx.lineTo(curr.x, curr.y);
      } else {
        // Calculate control points for bezier curve
        const xc1 = (prev.x + points[i - 2].x) / 2;
        const yc1 = (prev.y + points[i - 2].y) / 2;
        const xc2 = (curr.x + prev.x) / 2;
        const yc2 = (curr.y + prev.y) / 2;
        
        // Use cubic Bezier for smoother curves
        ctx.bezierCurveTo(
          xc1, yc1,
          prev.x, prev.y,
          xc2, yc2
        );
      }
      
      // Adjust line width based on pressure for natural feel, with increased base width
      const width = Math.max(baseWidth/2, Math.min(baseWidth*1.5, baseWidth * curr.pressure));
      ctx.lineWidth = width;
    }
    
    // Style and draw the path
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = baseWidth; // Increased base width for thicker strokes
    ctx.stroke();
    
    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const currentPoint = {
      x: e.clientX,
      y: e.clientY,
      pressure: 0.5, // Default pressure
    };
    
    // Start a new path if we don't have one
    if (!prevPointRef.current) {
      currentPathRef.current = [currentPoint];
      prevPointRef.current = currentPoint;
      pathsRef.current.push(currentPathRef.current);
      return;
    }
    
    // Only add points with minimum distance for smoother curves
    const dx = currentPoint.x - prevPointRef.current.x;
    const dy = currentPoint.y - prevPointRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Lower threshold for more points and smoother curves
    if (distance > 2) {
      // Calculate natural pressure based on velocity (slower = more pressure)
      const velocity = Math.min(1, distance / 80);
      currentPoint.pressure = 1 - velocity * 0.5;
      
      // Add to current path
      currentPathRef.current.push(currentPoint);
      prevPointRef.current = currentPoint;
      
      // Redraw only the current path for efficiency
      redrawCanvas(ctx);
    }
  };
  
  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pathsRef.current = [];
    currentPathRef.current = [];
    prevPointRef.current = null;
  };

  const changeani = () => {
    router.push("/animationTwo");
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
        onClick={clearCanvas}
        className="fixed bottom-4 left-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Clear Canvas
      </button>
      <button
        onClick={changeani}
        className="fixed bottom-4 right-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Change Paint Animation
      </button>
    </>
  );
};

export default Canvas;
