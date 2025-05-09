
const heart = document.getElementById("heart");

heart.addEventListener("click", () => {
    // Toggle between outlined (far) and solid (fas)
    if (heart.classList.contains("far")) {
        heart.classList.remove("far");
        heart.classList.add("fas");
    } else {
        heart.classList.remove("fas");
        heart.classList.add("far");
    }
});
