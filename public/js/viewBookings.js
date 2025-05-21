document.querySelectorAll("button[data-booking-id]").forEach((button) => {
    button.onclick = () => contactOwner(button.dataset.bookingId);
  });

  function contactOwner(bookingId) {
    fetch(`/booking/${bookingId}/contact-info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        const { name, email, campsiteName, startDate, endDate, userFirstName } = data;
        const currentUser = "<%= currentUserFirstName %>"; // make sure this is passed from server

        const subject = `Re: ${campsiteName} Campsite Availability`;
        const body = `Hi ${userFirstName},%0D%0A%0D%0A` +
            `Thanks for offering to share your spot at ${campsiteName} — I’d love to join if there’s still room!%0D%0A%0D%0A` +
            `Those dates (${startDate} to ${endDate}) work great for me. I can bring my own gear and chip in for anything else you need.%0D%0A%0D%0A` +
            `Please let me know if you have any plans for the trip, if I can join, and what I should bring.%0D%0A%0D%0A` +
            `Looking forward to it!%0D%0A${currentUser}`;

        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to get contact info.");
      });
  }