/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Amaranth', 'sans-serif'],
            },
            colors: {
                primary: '#00A9E0',
                'primary-dark': '#0087B3',
                secondary: '#8CC63F',
                accent: '#F7941D',
                sidebar: '#F9FAFB',
                'sidebar-accent': '#E5E7EB',
            },
            keyframes: {
                'toast-in': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
            animation: {
                'toast-in': 'toast-in 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
