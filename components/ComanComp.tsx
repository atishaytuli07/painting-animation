"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/use-theme";

const CommonComp = () => {
  const { currentTheme } = useTheme();

  return (
    <>
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-[5]"
        animate={{ color: currentTheme.text }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <h1 className="text-[6vw] leading-[1] font-black max-w-[80%] tracking-tight">
          A Canvas That, Listens to Your Motion.
        </h1>
      </motion.div>

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
            Duo-Pattren Paint Animation
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
    </>
  );
};

export default CommonComp;
