let racer = ({});

let vehicleForm = document.getElementById("vehicleForm");
let username = document.getElementById("username");
let vehicleImageURL = document.getElementById("vehicleImage");

vehicleForm.addEventListener("submit", e => {
    e.preventDefault();
    console.log(racer);
})

username.addEventListener("input", e => {
    racer.username = e.target.value;
})
