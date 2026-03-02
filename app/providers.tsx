"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { createLunaTheme } from "./theme";

type ColorMode = "light" | "dark";

type ColorModeContextValue = {
  mode: ColorMode;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

type UiStateContextValue = {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

const UiStateContext = createContext<UiStateContextValue | null>(null);

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [mode, setMode] = useState<ColorMode>("light");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("luna-color-mode", mode);
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  const colorModeValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode((previous) => (previous === "light" ? "dark" : "light"))
    }),
    [mode]
  );

  const theme = useMemo(() => createLunaTheme(mode), [mode]);
  const uiStateValue = useMemo<UiStateContextValue>(
    () => ({
      isSidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebarCollapsed: () => setSidebarCollapsed((previous) => !previous)
    }),
    [isSidebarCollapsed]
  );

  return (
    <AppRouterCacheProvider>
      <ColorModeContext.Provider value={colorModeValue}>
        <UiStateContext.Provider value={uiStateValue}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </UiStateContext.Provider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within Providers");
  }
  return context;
}

export function useUiState() {
  const context = useContext(UiStateContext);
  if (!context) {
    throw new Error("useUiState must be used within Providers");
  }
  return context;
}
