/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // The fix is here
    autoprefixer: {},
  },
}

export default config
