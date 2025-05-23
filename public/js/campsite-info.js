document.addEventListener("DOMContentLoaded", function () {
    // Heart icon toggle functionality
    const heart = document.getElementById("heart");

    if (heart) {
      // On page load: fill the heart if data-is-favorited="true"
      const isFavorited = heart.dataset.isFavorited === "true";
    
      if (isFavorited) {
        heart.classList.remove("far"); // empty heart
        heart.classList.add("fas");    // filled heart
      } else {
        heart.classList.remove("fas");
        heart.classList.add("far");
      }
    
      heart.addEventListener("click", async () => {
        // Get the campsite ID from a data attribute on the heart element
        const campsiteId = heart.dataset.campsiteId;
    
        // Determine if we are adding or removing the favorite
        const isAdding = heart.classList.contains("far");
    
        // Toggle heart appearance immediately
        heart.classList.toggle("far");
        heart.classList.toggle("fas");
    
        try {
          const response = await fetch(`/favourites/${campsiteId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: isAdding ? "add" : "remove" })
          });
    
          if (!response.ok) {
            console.error("Failed to update favourites.");
            // Revert toggle if the request failed
            heart.classList.toggle("far");
            heart.classList.toggle("fas");
          }
        } catch (error) {
          console.error("Error updating favourites:", error);
          // Revert toggle if there was an error
          heart.classList.toggle("far");
          heart.classList.toggle("fas");
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

// funfact 
document.addEventListener("DOMContentLoaded", function() {
    // ...other code...

    // Get the campsite name from the data attribute
    const funFactSection = document.getElementById("funFactSection");
    const campsiteName = funFactSection ? funFactSection.dataset.campsiteName : "";

    let funFactText = "";
    fetch(`/api/funfact/${encodeURIComponent(campsiteName)}`)
        .then(res => res.json())
        .then(data => {
            funFactText = data.funFact;
        })
        .catch(() => {
            funFactText = "Could not load fun fact.";
        });

    const funFactElem = document.getElementById("funFact");
    const lightbulb = document.getElementById("revealFunFact");
    let revealed = false;

    lightbulb.addEventListener("click", function() {
        if (!revealed) {
            funFactElem.style.filter = "none";
            funFactElem.style.userSelect = "auto";
            funFactElem.textContent = funFactText || "Could not load fun fact.";
            lightbulb.style.filter = "none";
            revealed = true;
        }
    });
});