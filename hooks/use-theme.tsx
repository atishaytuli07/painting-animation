import { useState } from "react";

export interface Theme {
  background: string;
  text: string;
  paintPrimary: string[];
  paintSecondary: string[];
}

interface ThemeContextValue {
  backgroundState: "initial" | "filled";
  setBackgroundState: (state: "initial" | "filled") => void;
  currentTheme: Theme;
  themes: {
    initial: Theme;
    filled: Theme;
  };
}

export const useTheme = (): ThemeContextValue => {
  const [backgroundState, setBackgroundState] = useState<"initial" | "filled">("initial");
  
  const themes = {
    initial: {
      background: "#f2e9de",
      text: "#2D0A02",
      paintPrimary: ["#5AAFBE", "#F9B942"],
      paintSecondary: ["#7DCFDE", "#FFCF66"],
    },
    filled: {
      background: "#1a2639",
      text: "#f2e9de",
      paintPrimary: ["#D16BA5", "#5FFBF1"],
      paintSecondary: ["#E48CBF", "#86FFFA"],
    },
  };
  
  const currentTheme = themes[backgroundState];
  
  return {
    backgroundState,
    setBackgroundState,
    currentTheme,
    themes
  };
};