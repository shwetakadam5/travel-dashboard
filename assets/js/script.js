//Selectors
const startDateEl = document.querySelector("#start-date");
const endDateEl = document.querySelector("#end-date");
const welcomeEl = document.querySelector('#no-data');
const dashboardEl = document.querySelector('#data');


//Get users from local storage
const getLocalUsers = () => {
  const users = JSON.parse(localStorage.getItem("users"));
  return users;
}

//Get saved trips from local storage
const getLocalTrips = () => {
  const trips = JSON.parse(localStorage.getItem("trips"));
  return trips;
}




const addUsers = () => {
  let users = getLocalUsers();
  //New user object
  const newUser = {

  }
  //check if anything saved in local
  if (users === null) {
    users = localStorage.setItem("users", JSON.stringify([newUser]));
  } else if (Array.isArray(users)) {
    let userArr = users;
    userArr.push(newUser);
    localStorage.setItem("users", JSON.stringify(userArr));
  }


}

const addTrip = () => {

}

$('.ui.accordion')
.accordion({
  selector: {
    trigger: '.title .icon'
  }
})
;

//Find if any data in local storage 
const data = localStorage.getItem('trips');
if (data === null) {
  $('#no-data').removeClass('hidden')
} else {
  $('#data').removeClass('hidden');
  $('#no-data').addClass('hidden')
}