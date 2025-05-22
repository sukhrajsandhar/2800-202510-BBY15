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
      const currentUser = document.body.dataset.userFirstName;

      const subject = `Re: ${campsiteName} Campsite Availability`;
      const rawBody = `Hi ${userFirstName},

Thanks for offering to share your spot at ${campsiteName} — I’d love to join if there’s still room!

Those dates (${startDate} to ${endDate}) work great for me. I can bring my own gear and chip in for anything else you need.

Please let me know if you have any plans for the trip, if I can join, and what I should bring.

Looking forward to it!
${currentUser}`;

      const body = encodeURIComponent(rawBody);

      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`);
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to get contact info.");
    });
}
