import { createTheme, type PaletteMode } from "@mui/material/styles";

export const createLunaTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      background:
        mode === "dark"
          ? {
              default: "#1a1b1f",
              paper: "#202229"
            }
          : {
              default: "#f3f4f6",
              paper: "#ffffff"
            },
      primary: {
        main: "#C47900",
        dark: "#BD6D00",
        light: "#f5e5cc",
        contrastText: "#ffffff"
      },
      secondary: {
        main: "#BD6D00",
        light: "#f5e5cc",
        contrastText: "#ffffff"
      },
      text:
        mode === "dark"
          ? {
              primary: "#f2f4f7",
              secondary: "#c7ccd5"
            }
          : {
              primary: "#25282e",
              secondary: "#6b7280"
            }
    },
    shape: {
      borderRadius: 8
    },
    typography: {
      fontFamily: "Poppins, Arial, sans-serif",
      fontSize: 14
    }
  });
