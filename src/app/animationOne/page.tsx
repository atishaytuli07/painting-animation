"use client";

import React from "react";
import { motion } from "framer-motion";
import PaintingCanvas from "./painting-canvas";
import Canvas from "../../../components/canvas-paint";
import { useTheme } from "../../../hooks/use-theme";
import CustomCursor from "./cursor";

const AnimationOnePage = () => {
  const { currentTheme } = useTheme();

  return (
    <motion.main
      className="relative w-full h-screen px-12 overflow-hidden"
      animate={{ backgroundColor: currentTheme?.background || "#ffffff" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <header className="relative w-full flex justify-between items-center z-50 ">
        <div className="flex items-center">
          <motion.span
            className="font-medium"
            animate={{ color: currentTheme.text }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            Atishay Tuli
          </motion.span>
          <motion.span
            className="ml-1"
            animate={{ color: currentTheme.text }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            ↗
          </motion.span>
        </div>
        <div className="flex items-center">
          <motion.span
            className="font-medium"
            animate={{ color: currentTheme.text }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            Painting Animation
          </motion.span>
          <div className="ml-5 flex items-center">
            <motion.span
              className="mr-2"
              animate={{ color: currentTheme.text }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
          </div>
        </div>
      </header>
      <CustomCursor />
      <Canvas />
      <PaintingCanvas />

      <div className="absolute bottom-14 right-8 text-[#452216] text-sm z-10">
        Move your mouse to create paint strokes
      </div>
    </motion.main>
  );
};

export default AnimationOnePage;
