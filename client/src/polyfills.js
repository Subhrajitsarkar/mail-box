// Fix for draft-js expecting global in browser (Vite)
if (typeof window !== "undefined" && !window.global) {
    window.global = window;
}