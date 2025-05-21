function handleCategoryChange() {
    const categorySelect = document.getElementById("alertCategory");
    const customDiv = document.getElementById("customCategoryDiv");
    if (categorySelect.value === "Other") {
        customDiv.classList.remove("d-none");
    } else {
        customDiv.classList.add("d-none");
    }
}

document.getElementById("alertForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedCategory = document.getElementById("alertCategory").value;
    const customCategory = document.getElementById("customCategory").value;

    const formData = {
        alertDate: document.getElementById("alertDate").value,
        alertType: document.getElementById("alertCategory").value,
        campsiteId: document.getElementById("campsiteId").value,
        message: document.getElementById("alertDescription").value,
        userId: document.getElementById("userId").value
    };

    fetch("/api/alerts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Error creating alert. Please try again.");
        }
    })
    .then(function (data) {
        alert("Alert created successfully!");
        window.location.href = `/campsite-info/${data.campsiteId}`;
    })
    .catch(function (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    });
});
