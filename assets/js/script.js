//import axios from 'axios';

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


//--------------------Trip-----------------------------


//-------------Dashboard -----------------------------con

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
        const card = $("<div></div>").addClass("card fixed-grid has-5-cols");
        const header = $("<header></header>").addClass("card-header grid");
        const name = $("<p></p>").addClass("cell card-header-title").text(trip.tripName);
        const location = $("<p></p>").addClass("cell card-header-title").text(trip.location);
        const countdown = $("<p></p>").addClass("cell card-header-title").text(countdownTime);
        const weather = $("<img />")
          .addClass("cell card-header-title")
          .attr("src", `https://openweathermap.org/img/w/${getIcon}.png`);
        const downButton = $("<button></button>").addClass("card-header-icon").attr("id", "open-icon").attr("value", trip.id);
        const icon = $("<i></i>").addClass("fas fa-angle-down has-text-black").attr("id", "down-icon").attr("value", trip.id);
        const content = $('<div></div>').addClass("card-content hidden").attr("id", trip.id)
        const testContent = $('<div></div>').addClass("content").text("soomethingkfjkjk")
        content.append(testContent)
        downButton.append(icon)
        header.append(name, location, countdown, weather, downButton);
        card.append(header, content);
        dashboardEl.append(card);
      }
    });
  }
};


//Get the distance from Distance.to API
//TODO - figure out the inputs and call
const calculateDistance = async () => {
  const options = {
    method: 'POST',
    url: 'https://distanceto.p.rapidapi.com/distance/route',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '301d329a91msha1c6a687f656696p1b5bb9jsnff59ba98ffff',
      'X-RapidAPI-Host': 'distanceto.p.rapidapi.com'
    },
    data: {
      route: [
        {
          country: 'AUS',
          name: 'Castlemaine'
        },
        {
          country: 'AUS',
          name: 'Melbourne'
        }
      ]
    }
  };
  
  try {
    const response = await axios.request(options);
    let time = response.data.route.car.duration;
    let distance = response.data.route.car.distance;
    const travel = {
      time: time,
      distance: distance

    }
    // console.log(calculateTime(time))

    return travel
  } catch (error) {
    console.error(error);
  }
}

//Calculate the travel time
const calculateTime = (seconds) => {
  const time = Number(seconds);
  const calcHour = Math.floor(time / 3600);
  const calcMinutes = Math.floor(time % 3600 / 60);

  const hour = calcHour > 0 ? calcHour + (calcHour == 1 ? " hour, " : " hours, ") : "";
  var minutes = calcMinutes > 0 ? calcMinutes + (calcMinutes == 1 ? " minute, " : " minutes, ") : "";
  return hour + minutes
}

// calculateDistance()




//----------Event Handlers---------------

//Add in travel button handler
getLocalTrips();


//Event handler for opening the accordion. Checks if main button is clicked, or just the icon
$('#data').on("click",function(e) {
    if(e.target.id === "open-icon") {
      const cardData = $(`#${e.target.value}`);
      cardData.toggleClass("hidden")
      console.log(e)

    } 
    else if (e.target.id === "down-icon") {
      const iconData = $(`#${e.target.attributes[2].value}`)
      iconData.toggleClass("hidden")
    }
  });

