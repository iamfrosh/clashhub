import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { soft:"#F7F8FA", line:"#E8EAF0", ink:"#141824", muted:"#6B7280", primary:"#5B4CFF", coral:"#FF5A5F", mint:"#12B886", amber:"#F5A524" },
    fontFamily: { display:["var(--font-sora)","system-ui","sans-serif"], sans:["var(--font-inter)","system-ui","sans-serif"] },
    borderRadius: { card:"16px" },
    boxShadow: { card:"0 2px 12px rgba(20,24,36,.06)" },
  }},
} satisfies Config;
