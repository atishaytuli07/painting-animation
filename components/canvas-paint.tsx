"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

export default function CanvasPaint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });

    if (context) {
      // Set canvas size to match viewport
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Configure drawing style
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      context.strokeStyle = "#4A55FF"; // Single color (blue)
      context.lineJoin = "round";
      context.lineCap = "round";
      context.lineWidth = 100;
      context.globalCompositeOperation = "source-over";
    }

    // Handle window resize
    const handleResize = () => {
      if (canvas && context) {
        // Save current drawing
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
        }

        // Resize canvas
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        // Restore drawing style
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.strokeStyle = "#4A55FF";
        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = 100;
        context.globalCompositeOperation = "source-over";

        // Restore drawing
        context.drawImage(tempCanvas, 0, 0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Animation loop using requestAnimationFrame
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }

    previousTimeRef.current = time;

    // Draw points if we're drawing and have at least 2 points
    if (isDrawing && pointsRef.current.length >= 2) {
      drawPoints();
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  // Start animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isDrawing]);

  // Draw points with smooth interpolation
  const drawPoints = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = pointsRef.current;
    if (points.length < 2) return;

    // Get the two most recent points
    const current = points[points.length - 1];
    const previous = points[points.length - 2];

    // Draw a bezier curve between the points for smoothness
    ctx.beginPath();

    if (points.length === 2) {
      // If we only have two points, draw a line
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(current.x, current.y);
    } else {
      // For more points, use a bezier curve for smoothness
      const beforePrevious = points[points.length - 3];

      // Calculate control points
      const controlPoint1 = {
        x: previous.x + (current.x - beforePrevious.x) * 0.2,
        y: previous.y + (current.y - beforePrevious.y) * 0.2,
      };

      const controlPoint2 = {
        x: current.x - (current.x - previous.x) * 0.2,
        y: current.y - (current.y - previous.y) * 0.2,
      };

      // Draw the curve
      ctx.moveTo(previous.x, previous.y);
      ctx.bezierCurveTo(
        controlPoint1.x,
        controlPoint1.y,
        controlPoint2.x,
        controlPoint2.y,
        current.x,
        current.y
      );
    }

    ctx.stroke();
  };

  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Mouse event handlers with throttling for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      pointsRef.current = [
        {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
        },
      ];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;

      // Add point with timestamp
      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // Keep only the last 50 points for performance
      if (pointsRef.current.length > 50) {
        pointsRef.current = pointsRef.current.slice(-50);
      }
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      pointsRef.current = [];
      clearCanvas();
    };

    const handleMouseOut = () => {
      setIsDrawing(false);
      pointsRef.current = [];
      clearCanvas();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isDrawing]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}
