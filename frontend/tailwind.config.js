/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'rf-sidebar': '#2F4F4F', // Dark Slate/Teal
                'rf-accent': '#FFD700',   // Gold/Yellow
                'rf-bg': '#F8F9FA',       // Light Grey Background
                'rf-text': '#333333',     // Primary Text
                'rf-muted': '#6c757d',    // Muted Text
            }
        },
    },
    plugins: [],
}
