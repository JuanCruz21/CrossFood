/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        // Paleta personalizada
        "naranja-apagado": "#E86F24",
        "naranja-claro": "#FF8A3D",
        gris: "#2B2B2B",

        primary: {
          DEFAULT: "#E86F24",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FF8A3D",
          foreground: "#FFFFFF",
        },
        background: "#FFFFFF",
        foreground: "#111111",
      },

      //Tamaños de fuente adaptados para mobile
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 22,
        "2xl": 28,
        "3xl": 34,
      },

      //Radio adaptado a diseño mobile
      borderRadius: {
        sm: 6,
        md: 10,
        lg: 14,
        xl: 24,
        full: 999,
      },

      //Fuentes personalizadas al estilo móvil
      fontFamily: {
        opensans: ["OpenSans-Regular"],
        "opensans-bold": ["OpenSans-Bold"],
        roboto: ["Roboto-Regular"],
        "roboto-bold": ["Roboto-Bold"],
      },
    },
  },

  plugins: [],
};
