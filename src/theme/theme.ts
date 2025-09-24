import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1976d2",
    secondary: "#ef6c00",
    background: "#f5f5f5",
    surface: "#ffffff",
    onBackground: "#1c1b1f",
    onSurface: "#1c1b1f",
    onSurfaceVariant: "#49454f",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#64b5f6",
    secondary: "#ffb74d",
    background: "#121212",
    surface: "#1e1e1e",
    onBackground: "#e6e6e6",
    onSurface: "#e6e6e6",
    onSurfaceVariant: "#cac4d0",
    error: "#ff6b6b",
    errorContainer: "#2d1b1b",
  },
};
