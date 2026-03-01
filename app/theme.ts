import { createTheme } from "@mui/material/styles";

export const lunaTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f3f4f6",
      paper: "#ffffff"
    },
    primary: {
      main: "#2f6bff"
    },
    text: {
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
