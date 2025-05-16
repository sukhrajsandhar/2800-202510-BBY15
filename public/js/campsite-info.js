document.addEventListener("DOMContentLoaded", function () {
    // Heart icon toggle functionality
    const heart = document.getElementById("heart");
    if (heart) {
        heart.addEventListener("click", () => {
            if (heart.classList.contains("far")) {
                heart.classList.remove("far");
                heart.classList.add("fas");
            } else {
                heart.classList.remove("fas");
                heart.classList.add("far");
            }
        });
    }
    
    // Star rating functionality
    const rating = parseFloat(
        document.getElementById("ratingValue").textContent
    );
    const starContainer = document.getElementById("starContainer");
    if (starContainer) {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.25 && rating % 1 < 0.75;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
        for (let i = 0; i < fullStars; i++) {
            starContainer.innerHTML += ' <i class="fas fa-star"></i>';
        }
        if (hasHalf) {
            starContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starContainer.innerHTML += '<i class="far fa-star"></i>';
        }
    }
});
