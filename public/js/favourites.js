document.querySelectorAll('.heart').forEach(heart => {
    heart.addEventListener("click", async () => {
      const campsiteId = heart.dataset.campsiteId;
      const isAdding = heart.classList.contains("far");

      heart.classList.toggle("far", !isAdding);
      heart.classList.toggle("fas", isAdding);

      try {
        const res = await fetch(`/favourites/${campsiteId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: isAdding ? "add" : "remove" })
        });

        if (!res.ok) {
          console.error("Failed to update favourites.");
          // Revert on failure
          heart.classList.toggle("far", isAdding);
          heart.classList.toggle("fas", !isAdding);
        }
      } catch (err) {
        console.error("Error updating favourites:", err);
        heart.classList.toggle("far", isAdding);
        heart.classList.toggle("fas", !isAdding);
      }
    });
  });