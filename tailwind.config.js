/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#F5F5DC',
                    100: '#F5F5DC',
                    500: '#F5F5DC',
                    600: '#F5F5DC',
                    700: '#F5F5DC',
                },
                soft: {
                    bg: '#F5F5DC',
                    panel: '#ffffff',
                    border: '#e2e8f0',
                    text: '#0f172a',
                    muted: '#475569',
                },
                darkNav: '#0c1a30',
                fortuna: {
                    purple: '#6d28d9',
                    navy: '#0f172a',
                    green: '#22c55e',
                    bg: '#F5F5DC'
                }
            },
            boxShadow: {
                soft: '0 10px 30px rgba(15, 23, 42, 0.06)',
                softHover: '0 18px 40px rgba(15, 23, 42, 0.08)',
            },
        },
    },
    plugins: [],
}
