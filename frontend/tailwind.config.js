/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui'],
                display: ['Playfair Display', 'serif'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '65ch',
                        color: '#334155',
                        p: {
                            lineHeight: '1.75',
                        },
                        h1: {
                            fontFamily: '"Playfair Display", serif',
                        },
                        h2: {
                            fontFamily: '"Playfair Display", serif',
                        },
                        h3: {
                            fontFamily: '"Playfair Display", serif',
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}