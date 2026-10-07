/* =========================
   LANGUAGE BM / EN
========================= */

const btnBM = document.getElementById("btnBM");
const btnEN = document.getElementById("btnEN");

function changeLanguage(language) {

    const elements =
        document.querySelectorAll("[data-bm][data-en]");

    elements.forEach(element => {

        if (language === "en") {
            element.textContent = element.dataset.en;
        } else {
            element.textContent = element.dataset.bm;
        }

    });


    // Button active
    if (language === "en") {

        btnEN.classList.add("active");
        btnBM.classList.remove("active");

        document.documentElement.lang = "en";

    } else {

        btnBM.classList.add("active");
        btnEN.classList.remove("active");

        document.documentElement.lang = "ms";
    }


    // Simpan pilihan pengguna
    localStorage.setItem(
        "paparEduLanguage",
        language
    );
}


/* BM BUTTON */

btnBM.addEventListener("click", function () {
    changeLanguage("bm");
});


/* EN BUTTON */

btnEN.addEventListener("click", function () {
    changeLanguage("en");
});


/* KEKALKAN LANGUAGE SELEPAS REFRESH */

const savedLanguage =
    localStorage.getItem("paparEduLanguage") || "bm";

changeLanguage(savedLanguage);