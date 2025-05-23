# Project Name
Wildpath

---

## Project Description

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
- CSS (5.01) to style and format the appearance of HTML elements on our web app. 
- Bootstrap (v5.3.6) provides a front-end framework for web development. It simplifies the process of building responsive and visually appealing websites -with a collection of ready-made HTML, CSS and JavaScript components.
- Embedded JavaScript (v3.1.10) to generate HTML dynamically using JavaScript.

### Back-end

- JavaScript (ECMAScript 2024) for the interactive web elements.
- Various modules for functionality of the app

#### Modules

- node.js v24.1.0
- express v5.1.0
- express-session v1.18.1
- connect-mongo v5.1.0
- dotenv v16.5.0
- ejs v3.1.10
- joi v17.13.3
- bcrypt v5.1.1
- cohere-ai v7.17.1
- mongoose v8.15.0
- axios v1.9.0
- node-cron v4.0.6

### Database

- MongoDB to provide database and authentication of users - v8.0.9
- Atlas on web browers to manage the database - v8.0.9
- Render for hosting. (2025)

### Project Management

- Trello (2025) as a project management tool to organize tasks for sprints.
- Figma (2025) for real-time collaboration on the design and prototyping for user interface (UI) and user experience (UX). 
- Slack (v4.43.49) to streamline communication with supervisors
- Discord (2025) for team communication and file sharing.
- Github (2025) to host, share and collaborate on our project code repository. It is a convenient tool that allows us to track changes, revert to previous -versions and manage the project with multiple contributors.
- SourceTree (v3.4.12) for verion control and merge conflict resolutions
- Google Workspace (2025) for client deliverable submissions.
- Visual Studio Code (VSCode 1.100) as our main code editor.

We are using the memberships for the software that is readily available to students. No paid versions or subscriptions are being used.

---
## Usage

Example:
1. Open your browser and visit https://two800-202510-bby15.onrender.com/
2. Enter your email and password to login, or sign-up to create a new account.
3. Click the profile button to see your profile and click the edit button to change your profile details.
4. Click on one of the green campsite icons to view a campsite.
5. Create your own campsite from the homepage by clicking the 'Create campsite' button beside the search bar.
6. View or create your booking, review, or alert for the campsite
7. Click on purple heart at the top right to save the campsite as a favourite. 
8. Click on the 'Favorite' icon from the navbar to view favourites
9. View or cancel your saved bookings by clicking the 'Bookings' icon on the navbar.
 

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
## AI and APIs

- Mapbox API (vv3.12.0): Used to display a interactive map for the homepage of the app. Campsite icons are placed on the map for users to click on for more information. It also uses the geolocation feature to locate the user's location. 
- OpenWeather API (3.0): To provide real-world weather information of the user's location and for the campsites. Data obtained from the API include temperature, weather, and sky status
- Cohere AI (v7.17.1) : Used to provide a funfact about the campsite, in the campsite-info page. 
- GitHub Copilot (v1.206.0.0) and ChatGPT (GPT-4.1 mini) for basic code repetition and debugging tips

---

## Limitations and Future Work

### Limitations

- Can only be used in used in the English Language
- Campsites locations are limited to Lower Mainland, BC


### Future Work
- Add more campsites
- Finalize user interface elements
- Make app more responsive

## How to run the project
1. In order to make this app work, please install the following modules using npm install :
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

For your convenience below is a one line command to install all modules.

npm i express express-session connect-mongo dotenv ejs joi bcrypt cohere-ai mongoose axios node-cron

2. Make accounts  for the following:
- Mapbox GL API
- OpenWeather API
- Cohere AI

3. Make sure to copy the API keys

4. Order of installation does not matter. As long as all API keys are in the .env file.

5. In your .env file include your MongoDB database connection requirements, Node session secret, and API keys: 

- MONGODB_HOST
- MONGODB_USER
- MONGODB_PASSWORD
- MONGODB_DATABASE
- MONGODB_SESSION_SECRET
- NODE_SESSION_SECRET
- MAPBOX_ACCESS_TOKEN
- OPENWEATHER_API_KEY
- MONGODB_URI
- CO_API_KEY
- COHERE_API_KEY
- OPENWEATHER_API_KEY

Add second .env file in scripts folder.

6. Completed Testing log: 
- https://docs.google.com/spreadsheets/d/13MwjWwvfc7FxpqDhErARpA_i9zuFHwTyxc-X91iV3is/edit?gid=0#gid=0


---

## Acknowledgments (Credits, References, and Licenses)

- Used Bootstrap Library for various icons, buttons, cards and layouts.
- MongoDB for database and storage
- Used CodePen to create button animations and the wave background, and speech bubble.
- Avatars were from a stock images site called FreePik
- No paid subscriptions or licenses were used.

---

## About Us
Team Name: BBY-15
Team Members: 
- Sukhraj Sandhar - ssandhar8@my.bcit.ca
- Kevin Romero - kromero1@my.bcit.ca
- Ken Lee - klee474@my.bcit.ca
- Cali Heung - cheung3@my.bcit.ca
- Sydney Jennings - sjennings16@my.bcit.ca

