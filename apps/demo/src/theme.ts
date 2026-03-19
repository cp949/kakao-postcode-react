import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2368ff",
    },
    secondary: {
      main: "#ff8a4c",
    },
    background: {
      default: "#f3f6fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f1728",
      secondary: "#5d6b82",
    },
  },
  shape: {
    // borderRadius: 24,
  },
  typography: {
    fontFamily: '"Pretendard Variable", "Noto Sans KR", sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.04em",
      lineHeight: 1.08,
      fontSize: "clamp(2.3rem, 5vw, 4.6rem)",
    },
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: "1px solid rgba(216, 227, 243, 0.9)",
          boxShadow: "0 16px 48px rgba(34, 58, 94, 0.08)",
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700,
          paddingInline: 18,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
  },
});
