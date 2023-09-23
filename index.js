let racer = ({});

let vehicleForm = document.getElementById("vehicleForm");
let username = document.getElementById("username");
let vehicleImageURL = document.getElementById("vehicleImage");
let vehicleImageFormData = new FormData();
let vehicleUploadButton = document.getElementById("vehicleUpload");
let img = document.getElementById("main-image");

vehicleForm.addEventListener("submit", e => {
    e.preventDefault();
    console.log(racer);
})

username.addEventListener("input", e => {
    racer.username = e.target.value;
})

vehicleImageURL.addEventListener("change", e => {
    vehicleImageFormData.append("image", e.target.files[0]);
})

vehicleUploadButton.addEventListener("click", e => {
    e.preventDefault();

    fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
            Authorization: "Client-ID 90ef1830bd083ba",
            Accept: 'application/json'
        },
        body: vehicleImageFormData
    }).then(data => data.json()).then(data => {
        img.src = data.data.link
        racer.vehicleURL = data.data.link;
    })
})
