import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0F4C81" },
    secondary: { main: "#FF8A00" },
    background: { default: "#F6F7FB", paper: "#FFFFFF" }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: "\"Nunito\", sans-serif"
  }
});
