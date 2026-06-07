/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./client/src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10b981',
            }
        },
    },
    plugins: [],
    darkMode: 'class',
}