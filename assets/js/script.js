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

// Get the modal element
const modal = document.getElementById("travelModal");

// Get the button that opens the modal
const btn = document.getElementById("addTravelButton");

// Get the <span> element that closes the modal
const closeBtn = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
closeBtn.onclick = function () {
    modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Populate the users dropdown from local storage (you'll need to implement this)
// Example:
const usersDropdown = document.getElementById("users");
const savedUsers = JSON.parse(localStorage.getItem("users"));

for (let i = 0; i < savedUsers.length; i++) {
    const option = document.createElement('option');
    option.value = savedUsers[i]; // Set the value (you can use department IDs if needed)
    option.textContent = savedUsers[i]; // Set the display text
    selectElement.appendChild(option); // Add the option to the select
}

// Handle form submission (you'll need to implement this)
const submitButton = document.getElementById("submitTravel");
submitButton.addEventListener("click", function () {
    // Get form values and save to local storage
    // ...
    // Close the modal
    modal.style.display = "none";
});