// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'oro-radial': 'radial-gradient(circle, #ffffff 0%, #fdf3dc 50%, #f4d38a 100%)',
            },
        },
    },
    plugins: [],
}

export default config