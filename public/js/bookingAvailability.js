let exampleModal = document.getElementById("exampleModal");

if (exampleModal) {
    exampleModal.addEventListener("show.bs.modal", function (event) {
        let button = event.relatedTarget;
        let recipient = button.getAttribute("data-bs-whatever");
        let modalTitle = exampleModal.querySelector(".modal-title");
        let modalBodyInput = exampleModal.querySelector(".modal-body input");

        modalTitle.textContent = "Create New Tent Availability at " + recipient;
        modalBodyInput.value = recipient;
    });
}
