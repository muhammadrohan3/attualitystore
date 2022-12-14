module.exports = {
  content: [
    "./views/*.ejs",
    "./views/showpage/*.ejs",
    "./views/user/*.ejs",
    "./views/info/*.ejs",
    "./views/admin/*.ejs",
    "./views/partials/*.ejs",
  ],
  theme: {
    extend: {
      colors: {
        background: "#E7E7E7",
        primary: "#F94C43",
        secondary: "#E1E1E1",
        secondaryDark: "#CFCFCF",
        white: "#ffffff",
        black: "#191919",
      },
      width: {
        "280px": "280px",
        "330px": "330px",
        "360px": "360px",
        "400px": "400px",
      },
      maxWidth: {
        "340px": "340px",
        "330px": "330px",
      },
      maxHeight: {
        mainPhoto: "720px",
      },
      fontSize: {
        "96px": "96px",
        "72px": "72px",
        "64px": "64px",
        "60px": "60px",
        "52px": "52px",
        "48px": "48px",
        "40px": "40px",
        "36px": "36px",
        "32px": "32px",
        "28px": "28px",
        "26px": "26px",
        "25px": "25px",
        "24px": "24px",
        "22px": "22px",
        "20px": "20px",
        "18px": "18px",
        "17px": "17px",
        "16px": "16px",
        "15px": "15px",
        "14px": "14px",
        "13px": "13px",
        "12px": "12px",
        "11px": "11px",
        "10px": "10px",
        "8px": "8px",
      },
      spacing: {
        "186.5px": "186.5px",
        "130px": "130px",
        "124px": "124px",
        "110px": "110px",
        "102px": "102px",
        "80px": "80px",
        "70px": "70px",
        "50px": "50px",
        "40px": "40px",
        "30px": "30px",
        "20px": "20px",
        "10px": "10px",
        "33%": "33%",
        "30%": "28%",
        desktop: "50px",
        laptop: "30px",
        tablet: "20px",
        mobile: "20px",
      },
      gap: {
        "50px": "50px",
        "40px": "40px",
        "25px": "25px",
      },
      fontFamily: {
        main: ["Montserrat", "ui-sans-serif", "sans-serif", "serif"],
      },
      letterSpacing: {
        "1px": "1px",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: false,
    base: false,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
};
