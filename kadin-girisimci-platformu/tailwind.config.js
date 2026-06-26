/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                fortuna: {
                    purple: '#6d28d9',
                    navy: '#0f172a',
                    green: '#22c55e',
                    bg: '#f8fafc'
                }
            }
        },
    },
    plugins: [],
}
