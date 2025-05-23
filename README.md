# Project Name
Wildpath

---

## About Us
Team Name: BBY-15
Team Members: 
- Sukhraj Sandhar
- Kevin Romero
- Ken Lee
- Cali Heung
- Sydney Jennings

---

## Overview

Wildpath connects campers of all levels, helping them share skills, find trusted campsite reviews, and avoid red flags, so every adventure feels safer and more welcoming.

---

## Key Features
- Interactive Map
- Geolocation 
- Real-time weather integration for campsites
- Reviews, Bookings and Alerts for each campsite
- Email connectivity
- Profile customization

---

## Technologies Used

For this project our team has chosen a variety of software and tools to bring the project to completion:

### Front-end

- HTML5 to present the content on the web. It’s widely supported across all browsers making the obvious choice for building web content.
- CSS to style and format the appearance of HTML elements on our web app. 
- Bootstrap provides a front-end framework for web development. It simplifies the process of building responsive and visually appealing websites -with a collection of ready-made HTML, CSS and JavaScript components.
- Embedded JavaScript (ejs) to generate HTML dynamically using JavaScript.

### Back-end

- JavaScript for the interactive web elements.
- Various modules for functionality of the app
#### Modules

- node.js
- express
- express-session
- connect-mongo
- dotenv
- ejs
- joi
- bcrypt
- cohere-ai
- mongoose
- axios
- node-cron

### Database

- MongoDB to provide database and authentication of users
- Atlas on web browers to manage the database
- Render for hosting.

### Project Management

- Trello as a project management tool to organize tasks for sprints.
- Figma for real-time collaboration on the design and prototyping for user interface (UI) and user experience (UX). 
- Slack to streamline communication with supervisors
- Discord for team communication and file sharing.
- Github to host, share and collaborate on our project code repository. It is a convenient tool that allows us to track changes, revert to previous -versions and manage the project with multiple contributors.
- Visual Studio Code as our main code editor.

We are using the memberships for the software that is readily available to students. No paid versions or subscriptions are being used.

---
## Usage

Example:
1. Open your browser and visit https://two800-202510-bby15.onrender.com/
2. Enter your username and password to login, or sign-up.
3. Click on one of the green campsite icons to view a campsite.
4. View or create your booking, review, or alert for the campsite
5. Create your own campsite from the homepage and clicking the 'Create campsite' button beside the search bar.
6. View or cancel your saved bookings by clicking the 'Bookings' icon on the navbar.
7. Click the profile button to see your profile and click the edit button to change your profile details.

---

## Project Structure

```
2800-202510-BBY15-MAIN/
├── .env
├── .gitignore
├── README.md
├── index.js
├── package.json
├── package-lock.json
├── databaseConnection.js
├── scripts/
│   ├── .env
│   ├── cleanupBookings.js
│   └── seedDatabase.js
├── models/
│   ├── Campsite.js
│   ├── Trail.js
│   ├── Review.js
│   ├── Alert.js
│   ├── Booking.js
│   └── User.js
├── routes/
│   └── api/
│       ├── campsites.js
│       ├── trails.js
│       ├── reviews.js
│       ├── bookings.js
│       └── alerts.js
├── public/
│   ├── images/
│   │   ├── avatars/
│   │   │   ├── avatar1.png
│   │   │   ├── avatar2.png
│   │   │   └── ... (other avatar images)
│   │   ├── alert.png
│   │   ├── booking.png
│   │   └── ... (other images)
│   │   
│   └── js/
│       ├── campsites-info.js
│       ├── campsites.js
│       ├── createAlert.js
│       ├── createBooking.js
│       ├── createReview.js
│       ├── favourites.js
│       ├── logout.js
│       ├── profile.js
│       └── viewBookings.js
│  
├── styles/
│   ├── 404.css
│   ├── alerts.css
│   ├── bg.css
│   ├── booked.css
│   ├── bookingAvailability.css
│   ├── campsite-info.css
│   ├── favourites.css
│   ├── footer.css
│   ├── funFact.css
│   ├── header.css
│   ├── main.css
│   ├── map.css
│   ├── profile.css
│   ├── reviews.css
│   ├── signUp.css
│   ├── style.css
│   ├── styles.css
│   └── viewBooking.css
├── views/
│   ├── 404.ejs
│   ├── admin.ejs
│   ├── booked.ejs
│   ├── campsite-Info.ejs
│   ├── createAlert.ejs
│   ├── createBooking.ejs
│   ├── createReview.ejs
│   ├── errorMessage.ejs
│   ├── favourites.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── logout.ejs
│   ├── main.ejs
│   ├── profile.ejs
│   ├── signUp.ejs
│   ├── viewAlerts.ejs
│   ├── viewBookings.ejs
│   ├── viewReviews.ejs
│   └── templates/
│       ├── header.ejs
│       ├── footer.ejs
│       └── bg.ejs
└── node_modules/
    └── (various packages and dependencies)

```
---

## Acknowledgments

- Used Bootstrap Library for various icons, buttons, cards and layouts.
- MongoDB for database and storage
- Used CodePen to create button animations and the wave background, and speech bubble.
- Avatars were from a stock images site called FreePik

---

## Limitations and Future Work

### Limitations

- Can only be used in used in the English Language
- Campsites locations are limited to Lower Mainland, BC


### Future Work
- Add more campsites
- Finalize user interface elements
- Make app more responsive

## If cloning to local repo
In order to make this app work, please install the following modules:
- use npm i 
- express
- express-session
- connect-mongo
- dotenv
- ejs
- joi
- bcrypt
- cohere-ai
- mongoose
- axios
- node-cron

For your convenience: 

npm i express express-session connect-mongo dotenv ejs joi bcrypt cohere-ai mongoose axios node-cron

- Add .env file to connect with MongoDB, node session, Mapbox API, Openweather API, and cohere AI.
- Add second .env file in scripts folder.

## License
No paid subscriptions or licenses were used.