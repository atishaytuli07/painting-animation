'use client';

import React from "react";
import { motion } from "framer-motion";
import PaintingCanvas from "../../components/painting-canvas";
import CommonComp from "../../components/ComanComp";
import Canvas from "../../components/canvas-paint";
import CustomCursor from "../../components/custom-cursor";
import { useTheme } from "../../hooks/use-theme";

const HomeContent = () => {
  const { setBackgroundState, currentTheme } = useTheme();

  return (
    <motion.main
      className="relative w-full h-screen px-12 overflow-hidden"
      animate={{ backgroundColor: currentTheme.background }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <Canvas />
      <CustomCursor />
      
      <PaintingCanvas
        onFillThresholdReached={() => setBackgroundState("filled")}
        paintColors={{
          primary: currentTheme.paintPrimary,
          secondary: currentTheme.paintSecondary,
        }}
      />

      <CommonComp />
      
      <div className="absolute bottom-14 right-8 text-[#452216] text-sm z-10">
        Move your mouse to create paint strokes
      </div>
    </motion.main>
  );
};

const Index = () => {
  return (
      <HomeContent />
  );
};

export default Index;
