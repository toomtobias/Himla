import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['"Space Grotesk"', "sans-serif"],
      },
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        brand: "var(--brand)",
        now: "var(--now)",
        rain: "var(--rain)",
        wind: "var(--wind)",
        uv: "var(--uv)",
        tape: "var(--tape)",
        air: "var(--air)",
      },
    },
  },
  plugins: [],
} satisfies Config;
