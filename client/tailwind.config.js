/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#07110c",
          900: "#0b1a13",
          800: "#10261b",
          700: "#173528",
          600: "#1f4938",
          500: "#2b6b4c",
          400: "#56a36f",
        },
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(86, 163, 111, 0.25), 0 16px 40px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        turf:
          "radial-gradient(circle at top, rgba(43,107,76,0.35), transparent 35%), linear-gradient(135deg, rgba(10,18,14,0.98), rgba(9,28,20,0.95))",
      },
    },
  },
  plugins: [],
};
