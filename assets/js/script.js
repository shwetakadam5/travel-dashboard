//Selectors
const startDateEl = $("#start-date");
const endDateEl = $("#end-date");
const welcomeEl = $("#no-data");
const dashboardEl = $("#trip-inner");

//Load dayjs relative time plugin
dayjs.extend(window.dayjs_plugin_relativeTime);
const API_KEY = "57693c20cc9de93006be32fd645ff9bb";
const GOOGLE_API = "AIzaSyBSGf6-LnqBBH9jGh_W2Irz3_DVhtad92s";

//--------------------Homepage -----------------------

//Find if any data in local storage and shows/hides element accordingly
const data = localStorage.getItem("trips");
if (data === null) {
  $("#no-data").removeClass("hidden");
} else {
  $("#data").removeClass("hidden");
  $("#no-data").addClass("hidden");
}

//--------------------Users---------------------------

// //Get users from local storage
// const getLocalUsers = () => {
//   const users = JSON.parse(localStorage.getItem("users"));
//   return users;
// };

// const addUsers = () => {
//   let users = getLocalUsers();
//   //New user object
//   const newUser = {};
//   //check if anything saved in local
//   if (users === null) {
//     users = localStorage.setItem("users", JSON.stringify([newUser]));
//   } else if (Array.isArray(users)) {
//     let userArr = users;
//     userArr.push(newUser);
//     localStorage.setItem("users", JSON.stringify(userArr));
//   }
// };

//--------------------Trip-----------------------------

// const addTrip = () => {};

//-------------Dashboard

//Calculate time from now until trip start date
const calculateCountdown = (start) => {
  const today = new Date();
  const startDate = dayjs(start);
  let countdown = dayjs(today).to(startDate, true);
  return countdown;
};

//Gets saved data, calculates time until each trip, gets the weather for each trip location
const getLocalTrips = () => {
  let savedTrips = JSON.parse(localStorage.getItem("trips"));
  let icons;
  //Map through each saved trip to create data
  if (savedTrips !== null) {
    savedTrips.map(async (trip) => {
      //get the countdown time from dayjs
      let countdownTime = calculateCountdown(trip.start);
      //Get the weather icon
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${trip.location}&limit=1&appid=${API_KEY}`;
      let getIcon = await fetch(geoUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return Promise.all(
            data.map((item) => {
              return fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${item.lat}&lon=${item.lon}&units=metric&appid=${API_KEY}`
              ).then(function (data) {
                return data.json();
              });
            })
          );
        })
        .then(function (data) {
          let icon = data[0].list[0].weather[0].icon;
          icons = icon;
          return icon;
        });
      //Create the Bulma card for each trip
      if (getIcon !== undefined) {
        const card = $("<div></div>").addClass("card");
        const header = $("<header></header>").addClass("card-header fixed-grid has-5-cols");
        const grid = $("<div></div>").addClass("grid");
        const name = $("<p></p>").addClass("cell card-header-title").text(trip.tripName);
        const location = $("<p></p>").addClass("cell card-header-title").text(trip.location);
        const countdown = $("<p></p>").addClass("cell card-header-title").text(countdownTime);
        const weather = $("<img />")
          .addClass("cell card-header-title")
          .attr("src", `https://openweathermap.org/img/w/${getIcon}.png`);
        const downButton = $("<button></button>").addClass("card-header-icon").attr("id", "accordion");
        const span = $("<span></span>").addClass("icons");
        const icon = $("<i></i>").addClass("fas fa-angle-down has-text-black").attr("id", "accordion-icon");
        span.append(icon);
        downButton.append(span);
        grid.append(name, location, countdown, weather, downButton);
        header.append(grid);
        card.append(header);
        dashboardEl.append(card);
      }
    });
  }
};


const calculateDistance = async () => {
  // let origin = "Melbourne Australia";
  // let destination = "Castlemaine Australia"
//  const distanceApi =  `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=metric&key=${GOOGLE_API}`;
let distanceApi = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=Melbourne%20Australia&destinations=Castlemaine%20Australia&units=imperial&key=AIzaSyBSGf6-LnqBBH9jGh_W2Irz3_DVhtad92s' 
let headers = new Headers();
headers.append('Access-Control-Allow-Origin', 'file:///C:/Users/gayle/Dev/bootcamp/travel-dashboard');
await fetch(distanceApi, {
  mode: "same-origin"
})
  .then(async function (response) {
    console.log(response)
    await response.json()
  })
  .then(function (data) {
    console.log(data)
    return data

  });

};

// "No 'Access-Control-Allow-Origin'


const getWeather = async (lat, lon) => {
  if (lat !== undefined && lon !== undefined) {
    let todayArr = [];
    let forecastArr = [];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  }
};

calculateDistance()
//----------Event Handlers---------------

//Add in travel button handler
getLocalTrips();


//Dashboard - opening the accordion dropdown
$(".card-header-icon").on("click", (e) => {
  console.log(e);
});
