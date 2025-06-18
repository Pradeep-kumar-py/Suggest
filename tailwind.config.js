/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1976D2", 
        textPrimary: "#1a4971",
        textSecondary: "#6d93b8", 
        textDark: "#0d2b43", 
        placeholderText: "#767676",
        background: "#e3f2fd", 
        cardBackground: "#f5f9ff",
        inputBackground: "#f0f8ff", 
        border: "#bbdefb",
        white: "#ffffff",
        black: "#000000",
      }
    },
  },
  plugins: [],
}