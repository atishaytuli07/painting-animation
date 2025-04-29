'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let prevTimestamp = 0;
    const updatePosition = (e: MouseEvent) => {
      const now = Date.now();
      if (now - prevTimestamp > 10) {
        setPosition({ x: e.clientX, y: e.clientY });
        prevTimestamp = now;
      }
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseDown = () => {
      setIsClicked(true);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    window.addEventListener("mousemove", updatePosition);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-50"
      style={{
        x: position.x - 8,
        y: position.y - 8,
        backgroundColor: "rgba(0,0,0,0.4)",
        mixBlendMode: "difference",
      }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isClicked ? 0.8 : 1,
        width: 32,
        height: 32,
      }}
      transition={{
        type: "spring",
        damping: 40,
        stiffness: 400,
        mass: 0.2,
      }}
    />
  );
};

export default CustomCursor;
