"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Point {
  x: number;
  y: number;
  speed: number;
  colorIndex: number;
}

interface PaintingCanvasProps {
  onFillThresholdReached: () => void;
  paintColors: {
    primary: string[];
    secondary: string[];
  };
}

export default function PaintingCanvas({
  onFillThresholdReached,
  paintColors,
}: PaintingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  const lastMouseMoveTimeRef = useRef<number>(Date.now());
  const isInitializedRef = useRef(false);
  const fillPercentageRef = useRef(0);
  const thresholdReachedRef = useRef(false);

    const router = useRouter();

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { alpha: true });

    if (context) {
      // Set canvas size to match viewport with high resolution
      const setCanvasSize = () => {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        // Create offscreen canvas for fill detection
        if (!offscreenCanvasRef.current) {
          offscreenCanvasRef.current = document.createElement("canvas");
        }

        const offscreenCanvas = offscreenCanvasRef.current;
        offscreenCanvas.width = window.innerWidth;
        offscreenCanvas.height = window.innerHeight;

        // Configure drawing style
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.globalCompositeOperation = "source-over";
      };

      setCanvasSize();

      // Handle window resize
      window.addEventListener("resize", setCanvasSize);

      return () => {
        window.removeEventListener("resize", setCanvasSize);
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, []);

  // Calculate fill percentage
  const calculateFillPercentage = useCallback(() => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return 0;

    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    const offscreenCtx = offscreenCanvas.getContext("2d");

    if (!offscreenCtx) return 0;

    // Copy main canvas to offscreen canvas (scaled down for performance)
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      offscreenCanvas.width,
      offscreenCanvas.height
    );

    // Sample pixels (using a grid for performance)
    const sampleSize = 20; // Check every 20th pixel
    const imageData = offscreenCtx.getImageData(
      0,
      0,
      offscreenCanvas.width,
      offscreenCanvas.height
    );

    let nonTransparentPixels = 0;
    let totalSampledPixels = 0;

    for (let y = 0; y < offscreenCanvas.height; y += sampleSize) {
      for (let x = 0; x < offscreenCanvas.width; x += sampleSize) {
        const index = (y * offscreenCanvas.width + x) * 4;
        // Check alpha channel (index + 3)
        if (imageData.data[index + 3] > 0) {
          nonTransparentPixels++;
        }
        totalSampledPixels++;
      }
    }

    return (nonTransparentPixels / totalSampledPixels) * 100;
  }, []);

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
    router.push("/animationOne");
  };

  // Animation loop using requestAnimationFrame for smooth animation
  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time;
      }
      previousTimeRef.current = time;

      // Draw points if we have points
      if (pointsRef.current.length > 0) {
        drawPoints();
      }

      // Check fill percentage every 30 frames for performance
      if (time % 30 === 0) {
        const percentage = calculateFillPercentage();
        fillPercentageRef.current = percentage;

        // Check if we've reached the threshold (60-70%)
        if (
          percentage >= 60 &&
          percentage <= 70 &&
          !thresholdReachedRef.current
        ) {
          thresholdReachedRef.current = true;
          onFillThresholdReached();
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [calculateFillPercentage, onFillThresholdReached]
  );

  // Start animation loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  // Draw points with smooth interpolation
  const drawPoints = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = pointsRef.current;
    if (points.length < 1) return;

    const current = points[points.length - 1];

    if (!lastPointRef.current) {
      lastPointRef.current = current;
      return;
    }

    const last = lastPointRef.current;

    // Calculate distance between points
    const distance = Math.sqrt(
      Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2)
    );

    // Skip if points are too close (prevents tiny dots)
    if (distance < 3) {
      return;
    }

    // Choose colors based on the colorIndex
    const fillColor =
      paintColors.primary[current.colorIndex % paintColors.primary.length];
    const strokeColor =
      paintColors.secondary[current.colorIndex % paintColors.secondary.length];

    // Save current context state
    ctx.save();

    // Draw the fill (main blob)
    ctx.beginPath();
    ctx.fillStyle = fillColor;

    // Use bezier curves for ultra-smooth blob-like shapes
    const controlPoint1 = {
      x: last.x + (current.x - last.x) * 0.5 - (current.y - last.y) * 0.2,
      y: last.y + (current.y - last.y) * 0.5 + (current.x - last.x) * 0.2,
    };

    const controlPoint2 = {
      x: current.x - (current.x - last.x) * 0.5 - (current.y - last.y) * 0.2,
      y: current.y - (current.y - last.y) * 0.5 + (current.x - last.x) * 0.2,
    };

    // Start path
    ctx.moveTo(last.x, last.y);

    // Draw the bezier curve
    ctx.bezierCurveTo(
      controlPoint1.x,
      controlPoint1.y,
      controlPoint2.x,
      controlPoint2.y,
      current.x,
      current.y
    );

    // Complete the blob shape with another bezier curve
    ctx.bezierCurveTo(
      controlPoint2.x + (current.y - last.y) * 0.4,
      controlPoint2.y - (current.x - last.x) * 0.4,
      controlPoint1.x + (current.y - last.y) * 0.4,
      controlPoint1.y - (current.x - last.x) * 0.4,
      last.x,
      last.y
    );

    ctx.closePath();
    ctx.fill();

    // Draw the stroke (slightly lighter color)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4; // Thin stroke for the blob
    ctx.stroke();

    // Restore context state
    ctx.restore();

    // Update the last point
    lastPointRef.current = current;

    // Remove the used point
    pointsRef.current.shift();
  };

  // Mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const calculateSpeed = (x: number, y: number): number => {
      const now = Date.now();
      const timeDiff = Math.max(1, now - lastMouseMoveTimeRef.current);
      const distance = Math.sqrt(
        Math.pow(x - lastMousePositionRef.current.x, 2) +
        Math.pow(y - lastMousePositionRef.current.y, 2)
      );

      // Normalize speed between 0 and 1, but make it less sensitive
      // for smoother blob generation
      const speed = Math.min(1, distance / (timeDiff * 0.2));

      lastMousePositionRef.current = { x, y };
      lastMouseMoveTimeRef.current = now;

      return speed;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Initialize on first move if not already initialized
      if (!isInitializedRef.current) {
        lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
        lastMouseMoveTimeRef.current = Date.now();
        isInitializedRef.current = true;
        return;
      }

      const speed = calculateSpeed(e.clientX, e.clientY);

      // Add the current point to our points array
      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        speed,
        colorIndex: Math.floor(Math.random() * paintColors.primary.length),
      });

      // Limit the number of points to prevent memory issues
      if (pointsRef.current.length > 100) {
        pointsRef.current = pointsRef.current.slice(-100);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];

      // Initialize on first touch if not already initialized
      if (!isInitializedRef.current) {
        lastMousePositionRef.current = { x: touch.clientX, y: touch.clientY };
        lastMouseMoveTimeRef.current = Date.now();
        isInitializedRef.current = true;
        return;
      }

      const speed = calculateSpeed(touch.clientX, touch.clientY);

      // Add the current point to our points array
      pointsRef.current.push({
        x: touch.clientX,
        y: touch.clientY,
        speed,
        colorIndex: Math.floor(Math.random() * paintColors.primary.length),
      });

      // Limit the number of points to prevent memory issues
      if (pointsRef.current.length > 100) {
        pointsRef.current = pointsRef.current.slice(-100);
      }
    };

    // Handle when pointer enters the canvas
    const handlePointerEnter = (e: PointerEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
      lastMouseMoveTimeRef.current = Date.now();
    };

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("pointerenter", handlePointerEnter, {
      passive: false,
    });

    // Add document-level listeners to ensure we catch all movement
    document.addEventListener("mousemove", handleMouseMove, { passive: false });

    return () => {
      // Clean up event listeners
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("pointerenter", handlePointerEnter);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [paintColors.primary.length]);

  return (
    <>
      <motion.canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-[1] cursor-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <button
        onClick={changeani}
        className="fixed bottom-4 right-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Chnage Paint Animation
      </button>

      <button
        onClick={clearCanvas}
        className="fixed bottom-4 left-4 bg-white/80 py-1 px-4 rounded-md z-50 hover:bg-white"
      >
        Clear Canvas
      </button>
    </>
  );
}
