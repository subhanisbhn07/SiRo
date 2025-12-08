/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			teal: {
  				DEFAULT: '#00CED1',
  				50: '#E0FAFA',
  				100: '#B3F3F4',
  				200: '#80EBEC',
  				300: '#4DE3E5',
  				400: '#1ADBDD',
  				500: '#00CED1',
  				600: '#00A8AA',
  				700: '#008284',
  				800: '#005C5D',
  				900: '#003637',
  			},
  			snow: {
  				DEFAULT: '#FFFAFA',
  				50: '#FFFFFF',
  				100: '#FFFAFA',
  			},
  			gold: {
  				DEFAULT: '#FFD700',
  				50: '#FFF9E0',
  				100: '#FFF3B3',
  				200: '#FFEC80',
  				300: '#FFE54D',
  				400: '#FFDE1A',
  				500: '#FFD700',
  				600: '#CCB000',
  				700: '#998400',
  				800: '#665800',
  				900: '#332C00',
  			},
  			purple: {
  				DEFAULT: '#9D7BE8',
  				50: '#F3EFFE',
  				100: '#E1D4FC',
  				200: '#C9B3F9',
  				300: '#B192F5',
  				400: '#9D7BE8',
  				500: '#8A64DB',
  				600: '#6F4BC0',
  				700: '#553A96',
  				800: '#3B296C',
  				900: '#211842',
  			},
  			coral: {
  				DEFAULT: '#FF6F61',
  				50: '#FFF0EE',
  				100: '#FFD9D5',
  				200: '#FFB8B0',
  				300: '#FF978B',
  				400: '#FF6F61',
  				500: '#E65A4D',
  				600: '#CC4539',
  				700: '#993326',
  				800: '#662213',
  				900: '#331100',
  			},
  			sage: {
  				DEFAULT: '#8FBC8F',
  				50: '#F0F7F0',
  				100: '#D9ECD9',
  				200: '#B8D9B8',
  				300: '#97C697',
  				400: '#8FBC8F',
  				500: '#7AAF7A',
  				600: '#5F9A5F',
  				700: '#477847',
  				800: '#2F562F',
  				900: '#173417',
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [import("tailwindcss-animate")],
}

