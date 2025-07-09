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
        screens: {
            // 'xs': '480px',      // 👈 Personalizado
            // 'sm': '640px',
            // 'md': '768px',
            'md2': '820px',
            // 'lg': '1024px',
            // 'xl': '1280px',
            // '2xl': '1536px',
            // // Puedes agregar más si deseas
            // '4k': '2560px'      // 👈 Otra personalizada
        },
    },
    plugins: [],
}

export default config