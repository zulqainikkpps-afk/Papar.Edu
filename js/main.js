function searchCourse() {

    const search =
        document.getElementById("searchInput").value;

    if (search.trim() === "") {

        alert("Sila masukkan nama kursus yang ingin dicari.");

        return;
    }

    alert("Mencari kursus: " + search);
}
const adminForm = document.getElementById("adminForm");

if (adminForm) {

    adminForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const nama = document.getElementById("nama").value;
        const email = document.getElementById("email").value;
        const mesej = document.getElementById("mesej").value;

        if (
            nama.trim() === "" ||
            email.trim() === "" ||
            mesej.trim() === ""
        ) {
            alert("Sila lengkapkan maklumat yang diperlukan.");
            return;
        }

        alert(
            "Terima kasih " + nama +
            "! Mesej anda telah dihantar kepada Admin Papar.Edu."
        );

        adminForm.reset();
    });

}