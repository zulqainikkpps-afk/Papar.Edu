/* =========================
   LANGUAGE BM / EN
========================= */

function changeLanguage(language) {

    const elements = document.querySelectorAll("[data-bm][data-en]");

    elements.forEach(element => {
        element.textContent = language === "en"
            ? element.dataset.en
            : element.dataset.bm;
    });

    // Tukar placeholder input
    document.querySelectorAll("[data-placeholder-bm][data-placeholder-en]")
        .forEach(element => {
            element.placeholder = language === "en"
                ? element.dataset.placeholderEn
                : element.dataset.placeholderBm;
        });

    // Button active
    document.getElementById("btnBM")?.classList.toggle(
        "active", language === "bm"
    );

    document.getElementById("btnEN")?.classList.toggle(
        "active", language === "en"
    );

    document.documentElement.lang = language === "en" ? "en" : "ms";

    // Simpan pilihan
    localStorage.setItem("paparEduLanguage", language);
}

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("btnBM")?.addEventListener("click", function () {
        changeLanguage("bm");
    });

    document.getElementById("btnEN")?.addEventListener("click", function () {
        changeLanguage("en");
    });

    const savedLanguage =
        localStorage.getItem("paparEduLanguage") || "bm";

    changeLanguage(savedLanguage);
});