// Take all the heart icons on the page
var hearts = document.querySelectorAll('.heart');

for (var i = 0; i < hearts.length; i++) {
  var heart = hearts[i];

  heart.addEventListener("click", function () {
    var heartIcon = this;
    var campsiteId = heartIcon.getAttribute("data-campsite-id");
    var isAdding = heartIcon.classList.contains("far");

    // on/off the icon classes
    if (isAdding) {
      heartIcon.classList.remove("far");
      heartIcon.classList.add("fas");
    } else {
      heartIcon.classList.remove("fas");
      heartIcon.classList.add("far");
    }

    // Sends the request 
    var action = isAdding ? "add" : "remove";
    var data = { action: action };

    fetch("/favourites/" + campsiteId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(function (response) {
      if (!response.ok) {
        // If failed ... 
        if (isAdding) {
          heartIcon.classList.remove("fas");
          heartIcon.classList.add("far");
        } else {
          heartIcon.classList.remove("far");
          heartIcon.classList.add("fas");
        }
        console.error("Failed to update favourites.");
      }
    })
    .catch(function (error) {
      // Handle erorrs if it doesn't work 
      if (isAdding) {
        heartIcon.classList.remove("fas");
        heartIcon.classList.add("far");
      } else {
        heartIcon.classList.remove("far");
        heartIcon.classList.add("fas");
      }
      console.error("Error updating favourites:", error);
    });
  });
}
