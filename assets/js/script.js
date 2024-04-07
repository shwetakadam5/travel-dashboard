//Selectors
const startDateEl = $("#start-date");
const endDateEl = $("#end-date");
const welcomeEl = $("#no-data");
const dashboardEl = $("#all-trips");

//Load dayjs relative time & isBetween plugin
dayjs.extend(window.dayjs_plugin_relativeTime);
dayjs.extend(window.dayjs_plugin_isBetween);
const API_KEY = "57693c20cc9de93006be32fd645ff9bb";
const GOOGLE_API = "AIzaSyBSGf6-LnqBBH9jGh_W2Irz3_DVhtad92s";
const AMADEUS_KEY = "mrEHjcteCO3BiOmdvrG2FBwo6oXb0MlF";
const AMADEUS_API = "NA55GdY4z1oK26uo";

//--------------------Homepage -----------------------
//Show the current year in the footer - GM
const year = dayjs().format("YYYY");
$("#year").text(year);

//--------------------Users---------------------------
//Function to get users from local storage
const getLocalUsers = () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  return users;
};

//Function to save the users to the local storage.
const addUsers = (newUserDetails) => {
  let users = getLocalUsers();

  //check if anything saved in local
  if (users === null) {
    //New user object
    users = localStorage.setItem("users", JSON.stringify([newUserDetails]));
  } else if (Array.isArray(users)) {
    let userArr = users;
    userArr.push(newUserDetails);
    localStorage.setItem("users", JSON.stringify(userArr));
  }
};

//--------------------Trip-----------------------------
//Function to get users from local storage
const getTrips = () => {
  const trips = JSON.parse(localStorage.getItem("trips")) || [];
  return trips;
};

//Function to save the trips to the local storage.
const addTrip = () => {};

//Find if any data in local storage
const data = localStorage.getItem("trips");
if (data === null) {
  $("#no-data").removeClass("hidden");
  $("#show-map").addClass("hidden");
} else {
  $("#data").removeClass("hidden");
  $("#no-data").addClass("hidden");
  $("#show-map").removeClass("hidden");
}

// Get the modal element
const modal = document.getElementById("travelModal");

// Get the button that opens the modal
const btn = document.getElementById("add-travel");
const submit = document.querySelector("#submitTravel");
const travelModal = document.getElementById("travelModal");

// Get the <span> element that closes the modal
const closeBtnUser = document.getElementsByClassName("close")[0];
const closeBtnTravel = document.querySelector(".Travelclose");
closeBtnTravel.addEventListener("click", function () {
  document.querySelector("#tripName").value = "";
  document.querySelector("#locationName").value = "";
  document.querySelector("#startDate").value = "";
  document.querySelector("#endDate").value = "";
  travelModal.style.display = "none";
});
const closeBtnTravelc = document.getElementById("close-btn");
closeBtnTravelc.addEventListener("click", function () {
  document.querySelector("#tripName").value = "";
  document.querySelector("#locationName").value = "";
  document.querySelector("#startDate").value = "";
  document.querySelector("#endDate").value = "";

  travelModal.style.display = "none";
  // document.querySelector('.close-btn').addEventListener('click', function() {
  //   document.getElementById('travelModal').style.display = 'none';
  // });
});

// Event listener for button click
btn.addEventListener("click", function () {
  // Show the modal (make it visible)
  travelModal.style.display = "flex";
  let users = getLocalUsers();
  for (let index = 0; index < users.length; index++) {

    let option = document.createElement("option");
    let userName = users[index].firstname + " " + users[index].lastname;
    option.textContent = userName;
    option.value = users[index].userid;
    document.querySelector("#users").appendChild(option);
  }
});

//GM - Check for overlapping dates

//Check if any of the trips are happening now, or passed
const handleDateCheck = (start, end, users) => {
  const trips = getTrips()
  let duplicateArr = [];
  if (trips) {
    trips.map((trip) => {
      //Is this trip's start date between previous trip start & end dates
      const between = dayjs(start).isBetween(trip.start, dayjs(trip.end));
      if (between) {
        users.map((user) => {
         let duplicateUser = trip.users.filter(tripUser => tripUser.userid === user.userid);
          duplicateUser.map((dup => {
            duplicateArr.push({
              name: `${dup.firstname} ${dup.lastname}`,
              trip: trip.location,
            })
          }))
        })
      }
    });

  return duplicateArr;
  }
};


//Function for the submit button
submit.addEventListener("click", async function () {
  // let user = document.querySelector("#users").value
  let userTrips = getTrips();
  let valid = true;
  valid = valid && checkLength($("#tripNameForm"), "Trip Name");
  valid = valid && checkLength($("#locationName"), "Destination City");
  valid = valid && checkLength($("#startDate"), "Trip Start Date");
  valid = valid && checkLength($("#endDate"), "Trip End Date");
  console.log(valid);


  if (valid) {
    let cityName = document.querySelector("#locationName").value.trim().toLowerCase();
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY_GEO}`;
    await fetch(geoUrl)
      .then(function (response) {
        if (!response.ok) {
          alert(`Error Msg: ${response.statusText}. Redirecting to error page.`);
          location.href = redirectUrl;
        } else {
          return response.json();
        }
      })
      //GM - adding the icon fetching function into the submit button
      .then(function (data) {
        return Promise.all(
          data.map((item) => {
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${item.lat}&lon=${item.lon}&units=metric&appid=${API_KEY}`).then(function (data) {
              return data.json();
            });
          })
        );
      })
      .then(function (data) {
        if (!Object.keys(data).length) {
          console.log("No data found");
          alert(`Error Msg: No data found :Invalid city. Redirecting to error page.`);
          location.href = redirectUrl;
        } else {
          console.log("Data received:", data);



          // Code to fix the issue of multi selection of users
          let userList = getLocalUsers();
          const userSelections = [];
          for (const option of document.querySelector("#users").options) {
            if (option.selected) {
              userSelections.push(option.value);
            }
            const newtripusers = [];
            for (const userlistitem of userList) {
              for (const selecteduser of userSelections) {
                if (userlistitem.userid == selecteduser) {
                  newtripusers.push(userlistitem);
                }
              }
            }

            let newTrip = {
              id: crypto.randomUUID(),
              tripName: document.querySelector("#tripNameForm").value.trim(),
              location: document.querySelector("#locationName").value.trim(),
              users: newtripusers,
              start: document.querySelector("#startDate").value,
              end: document.querySelector("#endDate").value,
              status: "upcoming",
              lat: data[0].lat,
              lon: data[0].lon,
            };

            // console.log(newTrip);
            if (!userTrips.some((trip) => trip.id === newTrip.id)) {
              userTrips.push(newTrip);
              // console.log(userTrips)
              localStorage.setItem("trips", JSON.stringify(userTrips));
              document.querySelector("#tripNameForm").value = "";
              document.querySelector("#locationName").value = "";
              document.querySelector("#startDate").value = "";
              document.querySelector("#endDate").value = "";
            }

          }
          const newtripusers = [];
          for (const userlistitem of userList) {
            for (const selecteduser of userSelections) {
              if (userlistitem.userid == selecteduser) {
                newtripusers.push(userlistitem);
              }
            }
          }
   
          const dateCheck = handleDateCheck(document.querySelector("#startDate").value, document.querySelector("#endDate").value, newtripusers)
          if (dateCheck !== undefined) {
            alert(`${dateCheck[0].name} has an existing trip to ${dateCheck[0].trip} during this time. Please select new dates.`)
          } else {

 

          let newTrip = {
            id: crypto.randomUUID(),
            tripName: document.querySelector("#tripNameForm").value.trim(),
            location: document.querySelector("#locationName").value.trim(),
            users: newtripusers,
            start: document.querySelector("#startDate").value,
            end: document.querySelector("#endDate").value,
            status: "upcoming",
            lat: data[0].city.coord.lat,
            lon: data[0].city.coord.lon,
            icon: data[0].list[0].weather[0].icon
          };

          // console.log(newTrip);
          if (!userTrips.some((trip) => trip.tripName === newTrip.tripName)) {
            //GM - adding fix to add multiple trips
            let tripArr = userTrips;
            tripArr.push(newTrip);
            // console.log(userTrips)
            localStorage.setItem("trips", JSON.stringify(tripArr));
            document.querySelector("#tripNameForm").value = "";
            document.querySelector("#locationName").value = "";
            document.querySelector("#startDate").value = "";
            document.querySelector("#endDate").value = "";
            travelModal.style.display = "none";
            $("#data").removeClass("hidden");
            $("#no-data").addClass("hidden");
            $("#show-map").removeClass("hidden");
            //Call the function to create the dashboard cards
            dashboardEl.empty();
            createDashboard();
          }
        }
        }
      });
  } else {
    // to do handle invalid keys on the form
    alert("Please fill in all required fields correctly.");
  }
});

// Populate the users dropdown from local storage
// Example:
const handleSelectUsers = () => {
  const usersDropdown = document.getElementById("#users");
  const savedUsers = JSON.parse(localStorage.getItem("users"));

  for (let i = 0; i < savedUsers.length; i++) {
    const option = document.createElement("option");
    option.value = savedUsers[i]; // Set the value (you can use department IDs if needed)
    option.textContent = savedUsers[i]; // Set the display text
    usersDropdown.appendChild(option); // Add the option to the select
  }
};


//-------------Dashboard -----------------------------

//Calculate time from now until trip start date
const calculateCountdown = (start) => {
  const today = dayjs();
  const startDate = dayjs(start);

  let countdown;
  let hoursCalc = startDate.diff(today, "hours");
  let daysCalc = Math.floor(hoursCalc / 24);
  hoursCalc = hoursCalc - daysCalc * 24;
  if (daysCalc > 1) {
    daysCalc = daysCalc + 1;
    countdown = `${daysCalc} days`;
  } else {
    countdown = `${daysCalc} days, ${hoursCalc} hours`;
  }
  return countdown;
};

//Calculate the travel time from
const calculateTime = (seconds) => {
  const time = Number(seconds);
  const calcHour = Math.floor(time / 3600);
  const calcMinutes = Math.floor((time % 3600) / 60);

  const hour = calcHour > 0 ? calcHour + (calcHour == 1 ? " hour, " : " hours, ") : "";
  var minutes = calcMinutes > 0 ? calcMinutes + (calcMinutes == 1 ? " minute " : " minutes ") : "";
  return hour + minutes;
};

//Calculate the distance with Distance.to API
const calculateDistance = async (homeCoordinates, destinationCoordinates) => {
  const options = {
    method: "POST",
    url: "https://distanceto.p.rapidapi.com/distance/route",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "301d329a91msha1c6a687f656696p1b5bb9jsnff59ba98ffff",
      "X-RapidAPI-Host": "distanceto.p.rapidapi.com",
    },
    data: {
      route: [{ name: homeCoordinates }, { name: destinationCoordinates }],
    },
  };
  try {
    let time;
    let distance;
    let mode;
    const response = await axios.request(options);

    //Setting driving as first option
    if (response.data.route.car.status === "found") {
      time = calculateTime(response.data.route.car.duration);
      distance = response.data.route.car.distance;
      mode = "Driving";
    }
    //setting flight as secondary response
    else if (response.data.route.car.status === "not found") {
      distance = response.data.route.greatCircle;

      //Average speed of a commerical airplane is 900km/h
      let rawTime = (distance / 900) * 60 * 60;
      time = calculateTime(rawTime);
      mode = "Flight";
    }
    const travel = {
      time: time,
      distance: distance,
      mode: mode,
    };
    return travel;
  } catch (error) {
    console.error(error);
  }
};

//Get the coordinates of the location for the distance api
const getCoordinates = async (city) => {
  let cityName = city.toLowerCase();
  const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`);
  const result = response.data;
  const dataString = `${result[0].lat},${result[0].lon}`;
  return dataString;
};

//Get list of local activities - Amadeus API
// const getActivities = async (lat, lon) => {
//   const urlencoded = new URLSearchParams();
//   urlencoded.append("client_id", AMADEUS_KEY);
//   urlencoded.append("client_secret", AMADEUS_API);
//   urlencoded.append("grant_type", "client_credentials");

//   const requestOptions = {
//     method: "POST",
//     body: urlencoded,
//     redirect: "follow",
//   };
//   //get the token for API
//   let token = await fetch("https://api.amadeus.com/v1/security/oauth2/token", requestOptions)
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (data) {
//       return data;
//     });
//   const headers = { Authorization: `Bearer ${token.access_token}` };

//   //Get the activity data
//   let activity = await fetch(`https://api.amadeus.com/v1/reference-data/locations/pois?latitude=${lat}&longitude=${lon}&radius=2`, { headers })
//     .then(function (response) {
//       return response.json();
//     })
//     .then(function (datas) {
//       return datas;
//     });
//   return activity;
// };

//Check if any of the trips are happening now, or passed
const handlePastTrips = () => {
  const trips = JSON.parse(localStorage.getItem("trips"));
  if (trips) {
    trips.map((trip) => {
      //is today before the start date (trip in the future)
      const before = dayjs().isBefore(dayjs(trip.start));
      //is today after the end date
      const after = dayjs().isAfter(dayjs(trip.end));
      //is today between start and end date
      const between = dayjs().isBetween(trip.start, dayjs(trip.end));
      if (before) {
        if (trip.status !== "upcoming") {
          trip.status = "upcoming";
        }
      } else if (after) {
        if (trip.status === "upcoming" || trip.status === "current") {
          trip.status = "completed";
        }
      } else if (between) {
        if (trip.status === "upcoming" || trip.status === "completed") {
          trip.status = "current";
        }
      }
    });
  }
  return trips;
};

//Sort the trips by specified field
const handleSortTrip = (trips) => {
  const sort = JSON.parse(localStorage.getItem("sort-travel-data"));
  let uniqueArr = [];
  if (trips) {
    trips.filter(function (trip) {
      let i = uniqueArr.findIndex((x) => x.id === trip.id);
      if (i <= -1) {
        uniqueArr.push(trip);
      }
    });
    localStorage.setItem("trips", JSON.stringify(uniqueArr));
    localStorage.removeItem("newTrips");
  }
  //check if anything saved in local
  if (sort === null || sort === "tripName") {
    //use default sort by trip name & set sort option to local storage
    localStorage.setItem("sort-travel-data", JSON.stringify("tripName"));
    $("#icon-tripName").removeClass("hidden");
    uniqueArr.sort((a, b) => {
      const tripA = a.tripName.toUpperCase();
      a = tripA.replace(/\s+/g, "");
      const tripB = b.tripName.toUpperCase();
      b = tripB.replace(/\s+/g, "");

      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
  } else if (sort === "countdown") {
    $("#icon-countdown").removeClass("hidden");
    uniqueArr = trips.sort((a, b) => {
      if (dayjs(a.start).isBefore(dayjs(b.start))) {
        return -1;
      }
      if (dayjs(a.start).isAfter(dayjs(b.start))) {
        return 1;
      }
      return 0;
    });
  } else if (sort === "location") {
    $("#icon-location").removeClass("hidden");
    uniqueArr = trips.sort((a, b) => {
      const tripA = a.location.toUpperCase();
      const tripB = b.location.toUpperCase();
      if (tripA < tripB) {
        return -1;
      }
      if (tripA > tripB) {
        return 1;
      } else {
        return 0;

      }
    });
  }

  return uniqueArr;
};

//Dashboard - Function is called on page load, and creating a new trip to dynamically create the dashboard from local storage data.
const createDashboard = () => {
  //Get the saved local data of trips and users
  const savedTrips = handlePastTrips();
  const sortedTrips = handleSortTrip(savedTrips);
  const savedUsers = getLocalUsers();
  let icons;
  let countdownTime;

  // Map through each saved trip to create data & create Bulma card
  sortedTrips.map(async (trip) => {
    const activities = await getActivities(trip.lat, trip.lon);

    //get the countdown time from dayjs function
    if (trip.status === "upcoming") {
      countdownTime = calculateCountdown(trip.start);
    } else if (trip.status === "current") {
      countdownTime = "Trip in progress";
    } else if (trip.status === "completed") {
      countdownTime = "Completed";
    }
    //Create the card
    const card = $("<div></div>").addClass("card fixed-grid has-5-cols").attr("id", "travel-card").appendTo(dashboardEl);
    //Create the header
    const header = $("<header></header>").addClass("card-header grid").appendTo(card);
    const status = $("<div></div>").addClass("status").appendTo(header);
    //Assigns correct icon to the card
    if (trip.status === "upcoming") {
      $("<i></i>").addClass("fa-solid fa-suitcase-rolling has-text-primary").appendTo(status);
    } else if (trip.status === "completed") {
      $("<i></i>").addClass("fa-solid fa-circle-check").appendTo(status);
    } else {
      $("<i></i>").addClass("fa-solid fa-plane-departure").appendTo(status);
    }
    $("<p></p>").addClass("cell card-header-title is-flex").text(trip.tripName).appendTo(status);
    $("<p></p>").addClass("cell card-header-title").text(trip.location).appendTo(header);
    $("<p></p>").addClass("cell card-header-title").text(countdownTime).appendTo(header);
    $("<img />").addClass("cell card-header-title").attr("src", `https://openweathermap.org/img/w/${trip.icon}.png`).appendTo(header);

    const buttonHolder = $("<div></div>").addClass("button-holder is-flex is-flex-direction-row	").appendTo(header);
    //Create the accordion button
    const downButton = $("<button></button>").addClass("card-header-icon").attr("id", "open-icon").attr("value", trip.id).appendTo(buttonHolder);
    $("<i></i>").addClass("fas fa-angle-down has-text-black").attr("id", "down-icon").attr("value", trip.id).appendTo(downButton);

    //create the delete button
    const deleteButton = $("<button></button>").addClass("card-header-icon").attr("id", "delete-icon").attr("value", trip.id).appendTo(buttonHolder);
    const deleteSpan = $('<span></span>').appendTo(deleteButton)
    $("<i></i>").addClass("fas fa-trash has-text-black").attr("id", "down-icon").attr("value", trip.id).appendTo(deleteSpan);

    //Create the content
    const content = $("<div></div>").addClass("card-content hidden").attr("id", trip.id).appendTo(card);
    const contentInner = $("<div></div>").addClass("content level").appendTo(content);

    //The User left side
    const userInner = $("<div></div>").addClass("content level-left has-background-primary-light p-5").appendTo(contentInner);
    $("<h4></h4>").addClass("mt-1 is-size-3").text("Travel Partners").appendTo(userInner);
    //Header for each user section
    const travelHeader = $("<div></div>").addClass("fixed-grid has-4-cols").appendTo(userInner);
    const travelGrid = $("<div></div>").addClass("grid travel-title").appendTo(travelHeader);
    $("<h5></h5>").addClass("cell mt-1").text("User").appendTo(travelGrid);
    $("<h5></h5>").addClass("cell mt-1").text("Home Location").appendTo(travelGrid);
    $("<h5></h5>").addClass("cell mt-1").text("Travel Mode").appendTo(travelGrid);
    $("<h5></h5>").addClass("cell mt-1").text("Approx Duration").appendTo(travelGrid);
    const travelData = $("<div></div>").addClass("fixed-grid has-4-cols").appendTo(userInner);

    //Map through each user to create a record to show user, home location and distance
    if (trip.users.length > 0) {
      trip.users.map(async (user) => {
        //Filter all users to get current user data
        const localUser = savedUsers.filter(
          // (savedUser) => user.name === savedUser.firstname
          (savedUser) => user.userid === savedUser.userid
        );

        //Calculate the travel distance for each user
        let home = `${localUser[0].userlocationcoordinates.lat},${localUser[0].userlocationcoordinates.lon}`;
        let destination = await getCoordinates(trip.location);
        const travel = await calculateDistance(home, destination);

        //Create a unique id for each travel mode dropdown
        const tripName = trip.tripName.toLowerCase().replace(/\s/g, "");
        const tripId = `${localUser[0].firstname}-${tripName}`;
        const userDiv = $("<div></div>").addClass("grid travel-data").appendTo(travelData);
        $("<p></p>").addClass("cell name").text(localUser[0].firstname).appendTo(userDiv);
        $("<p></p>").addClass("cell city").text(localUser[0].usercity).appendTo(userDiv);
        $("<p></p>").addClass("cell mode").text(travel.mode).appendTo(userDiv);
        $("<p></p>").addClass("cell duration").attr("id", "duration").text(travel.time).appendTo(userDiv);
      });
      //The activities right side
      const activityInner = $("<div></div>").addClass("content level-right has-background-primary-dark p-5").appendTo(contentInner);
      $("<h4></h4>").addClass("mt-1 is-size-3").text("Activity Ideas").appendTo(activityInner);
      const activityul = $("<ul></ul>").addClass("").appendTo(activityInner);

      activities.data.map((activity) => {
        $("<li></li>").addClass("sight").text(`${activity.name} - ${activity.tags[0]}`).appendTo(activityul);
      });
    }
  });
};

//----------Event Handlers---------------

//Add in travel button handler
createDashboard();

//Event handler for opening the accordion. Checks if main button is clicked, or just the icon
$("#data").on("click", function (e) {

  if (e.target.id === "open-icon") {
    const cardData = $(`#${e.target.value}`);
    cardData.toggleClass("hidden");
  } else if (e.target.id === "down-icon") {
    const iconData = $(`#${e.target.attributes[2].value}`);
    iconData.toggleClass("hidden");

    //Delete travel cards
  } else if (e.target.id === "delete-icon") {
    let trips = getTrips();
    let tripsArr = trips
    trips.map((trip) => {
      if (e.target.value === trip.id) {
        let removeItem = tripsArr.filter(trip => trip.id != e.target.value);
        localStorage.setItem("trips", JSON.stringify(removeItem));
        dashboardEl.empty();
        createDashboard();

      }
    })
  }
});

//Event handlers for sorting data
$(".sort-button").on("click", function (e) {
  const previous = JSON.parse(localStorage.getItem("sort-travel-data"));
  localStorage.setItem("sort-travel-data", JSON.stringify(e.currentTarget.id));
  $(`#icon-${previous}`).addClass("hidden");
  dashboardEl.empty();
  createDashboard();
});

$('#delete-icon').on("click", function(e) {
  console.log(e)
})

//Add User Code Starts - Shweta

const API_KEY_GEO = "6afdca3269d40e485ee98de1af3ed1db";
const API_KEY_MAPS = "AIzaSyB9ViKmP3YhPiC9Mqz6jdr9Rio9MrtItaE";
const userFirstNameEl = $("#first-name");
const userLastNameEl = $("#last-name");
const userDateOfBirthEl = $("#user-dob");
const userAddressEl = $("#user-address");
const userCityEl = $("#user-city");
const userCountryEl = $("#user-country");
const userZipCodeEl = $("#user-zipcode");

const allFields = $([]).add(userFirstNameEl).add(userLastNameEl).add(userDateOfBirthEl).add(userAddressEl).add(userCityEl).add(userCountryEl).add(userZipCodeEl);
const userErrMsgEl = $(".validateTips");
const userSuccessMsgEl = $(".successMsg");
const MINOR_AGE_LIMIT = 12;

//Function to update the error message and highlight the fields
function updateErrorMsg(errMsg) {
  userErrMsgEl.text(errMsg).addClass("ui-state-error has-text-danger");
  setTimeout(function () {
    userErrMsgEl.removeClass("ui-state-error", 1500);
  }, 500);
}

//Function to validate the input fields of the user
function checkLength(textInput, fieldName) {
  if (textInput.val().trim() == "") {
    textInput.addClass("ui-state-error");
    updateErrorMsg(fieldName + " is required and must be valid");
    return false;
  } else {
    return true;
  }
}

//Function to add a user. This function validates the input fields and stores the validated details in local storage
// It also updates the coordinates for the city by invoking the weather api and provides a user age check parameter.

function addUser() {
  // add code to validate and add user to local storage

  let valid = true;
  let isMinorAge = false;
  const redirectUrl = "./servererrorpage.html";
  allFields.removeClass("ui-state-error");
  valid = valid && checkLength(userFirstNameEl, "First Name");
  valid = valid && checkLength(userLastNameEl, "Last Name");
  valid = valid && checkLength(userDateOfBirthEl, "Date of birth");
  valid = valid && checkLength(userAddressEl, "Address");
  valid = valid && checkLength(userCityEl, "City");
  valid = valid && checkLength(userCountryEl, "Country");
  valid = valid && checkLength(userZipCodeEl, "Zip Code");

  if (valid) {
    console.log("All form validations successful");

    // Validate the age and update if user is a minor.
    const currentDate = dayjs();

    // Calculate the difference in years
    const ageInYears = currentDate.diff(userDateOfBirthEl.val(), "year");

    if (ageInYears < MINOR_AGE_LIMIT) {
      isMinorAge = true;
    }

    console.log(`The person's age is approximately ${ageInYears} years and is minor check: ${isMinorAge}`);

    let newUserToCreate = {
      userid: crypto.randomUUID(),
      firstname: userFirstNameEl.val(),
      lastname: userLastNameEl.val(),
      dateofbirth: userDateOfBirthEl.val(),
      address: userAddressEl.val(),
      usercity: userCityEl.val(),
      usercountry: userCountryEl.val(),
      userzipcode: userZipCodeEl.val(),
      isminor: isMinorAge,
      userlocationcoordinates: {
        lat: "",
        lon: "",
      },
    };

    //start to get location coords
    if (userCityEl.val().trim() != "") {
      let cityName = userCityEl.val().toLowerCase();
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY_GEO}`;
      fetch(geoUrl)
        .then(function (response) {
          if (!response.ok) {
            alert(`Error Msg: ${response.statusText}. Redirecting to error page.`);
            location.href = redirectUrl;
          } else {
            return response.json();
          }
        })
        .then(function (data) {
          if (!Object.keys(data).length) {
            console.log("No data found");
            alert(`Error Msg: No data found :Invalid city. Redirecting to error page.`);
            location.href = redirectUrl;
          } else {
            console.log("Data received:", data);

            let coordinates = {
              lat: data[0].lat,
              lon: data[0].lon,
            };
            newUserToCreate.userlocationcoordinates.lat = coordinates.lat;
            newUserToCreate.userlocationcoordinates.lon = coordinates.lon;

            addUsers(newUserToCreate); // Stores data in local storage.
            initMap(); // Invoked to create user location markers on the map.
            dialog.dialog("close");
          }
        });
    }
    //end to get location coords
  }
  return valid;
}

// Event listerner to open the create user modal dialog
$("#add-user")
  .button()
  .on("click", function () {
    dialog.dialog("open");
  });

let dialog = $("#dialog-form").dialog({
  autoOpen: false,
  height: "auto",
  width: "auto",
  modal: true,
  responsive: true,
  resizable: true,
  dialogClass: "userformdialog",
  position: { my: "center", at: "top" }, // Center vertically
  buttons: {
    Submit: addUser,
    Cancel: function () {
      console.log("In Cancel function");
      dialog.dialog("close");
    },
  },
  close: function () {
    //add code to reset the form fields
    console.log("In close function");
    userform[0].reset();
    allFields.removeClass("ui-state-error");
    userErrMsgEl.removeClass("has-text-danger");

    userErrMsgEl.text("All form fields are required."); //reset the user form
    userSuccessMsgEl.attr("display", "block");
  },
});

// Event to identify if the submit of user form was clicked.
let userform = dialog.find("form").on("submit", function (event) {
  event.preventDefault();
  addUser();
});

// When the page loads make the  date field a date picker and also initialize the map
$(document).ready(function () {
  initMap();
  // addTrip();
  //datepicker initialization (jQueryUI)
  $("#user-dob").datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: "-100:+0",
    maxDate: "0",
  });

  $("#startDate").datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: "0:+50",
    minDate: "0",
  });

  $("#endDate").datepicker({
    changeMonth: true,
    changeYear: true,
    yearRange: "0:+50",
    minDate: "0",
  });
});

// Logic to display the map and map markers.

let map;
// initMap is now async
async function initMap() {
  // console.log("INIT MAP INVOKED");

  let addedUsers = getLocalUsers(); //retrieve the users from localstorage

  let addedTrips = getTrips();

  //To enable the add travel button if atleast one user is available.
  if (addedUsers.length != 0) {
    $("#add-travel").removeAttr("disabled");
  }

  // Request libraries when needed, not in the script tag.
  let { Map } = await google.maps.importLibrary("maps");
  let { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Short namespaces can be used.
  map = new Map(document.getElementById("map"), {
    center: new google.maps.LatLng(-37.814, 144.96332),
    zoom: 6,
    mapId: "DEMO_MAP_ID",
  });

  if (addedUsers != null || addedTrips != null) {
    for (const user of addedUsers) {
      addMapMarkers({
        locationcoords: new google.maps.LatLng(user.userlocationcoordinates.lat, user.userlocationcoordinates.lon),
        markerimg: "./assets/images/userlocationpin.png",
        markerInfo: "Info ( User Name : " + user.firstname + " " + user.lastname + " & City : " + user.usercity + " )",
      });
    }

    for (const trip of addedTrips) {
      addMapMarkers({
        locationcoords: new google.maps.LatLng(trip.lat, trip.lon),
        markerimg: "./assets/images/travellocationpin.png",
        markerInfo: "Info ( Trip Name : " + trip.tripName + ", Trip Status : " + trip.status + "& Trip Partners : " + trip.users.map((user) => user.firstname) + " )",
      });
    }

    //function to add markers
    function addMapMarkers(markerDetails) {
      // A marker with a with a URL pointing to a PNG.
      let markerImage;
      let markerInformation = document.createElement("p");
      markerInformation.textContent = markerDetails.markerInfo;

      //if no custom marker image then default marker pin
      if (markerDetails.markerimg != null || markerDetails.markerimg != undefined) {
        markerImage = document.createElement("img");
        markerImage.src = markerDetails.markerimg;
      }

      //create new marker and set the marker parameters.
      let marker = new AdvancedMarkerElement({
        map,
        position: markerDetails.locationcoords,
        content: markerImage,
        title: markerDetails.titleTxt,
      });

      //create new marker information window and set the marker info parameters.
      let markerInfo = new google.maps.InfoWindow({
        content: markerInformation,
      });

      // create an event listener for the info window to open
      marker.addListener("click", function () {
        markerInfo.open(map, marker);
      });
    }
  }
}

// Maps API invocation
((g) => {
  var h,
    a,
    k,
    p = "The Google Maps JavaScript API",
    c = "google",
    l = "importLibrary",
    q = "__ib__",
    m = document,
    b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}),
    r = new Set(),
    e = new URLSearchParams(),
    u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r] + "");
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k]
          );
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
  d[l] ? console.warn(p + " only loads once. Ignoring:", g) : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
})({
  key: API_KEY_MAPS,
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});
