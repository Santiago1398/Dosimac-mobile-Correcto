/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
            "./src/App3.{js,jsx,ts,tsx}", 
            "./src/**/*.{js,jsx,ts,tsx}"
],
  theme: {
    extend: {
      fontFamily: {
        RobotoRegular:["Roboto-Regular"],
        PoppinsLight:["Poppins-Light"]
      }
    },
  },
  plugins: [
    // require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/container-queries'),    
  ],
}

