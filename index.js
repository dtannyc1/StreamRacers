require('dotenv').config();

let racer = ({});

let vehicleForm = document.getElementById("vehicleForm");
let username = document.getElementById("username");
let vehicleImageURL = document.getElementById("vehicleImage");
let vehicleImageFormData = new FormData();
let changed = false;
let vehicleUploadButton = document.getElementById("vehicleUpload");
let img = document.getElementById("main-image");

let accountId = process.env.SE_ACCOUNT_ID;
let jwt = process.env.SE_JWT;

vehicleForm.addEventListener("submit", e => {
    e.preventDefault();
    console.log(racer);
})

username.addEventListener("input", e => {
    racer.username = e.target.value;
})

vehicleImageURL.addEventListener("change", e => {
    vehicleImageFormData.append('file', e.target.files[0]);
    // vehicleImageFormData.append('album', 'EVGILvAjGfArJFI');
    changed = true;
})

vehicleUploadButton.addEventListener("click", e => {
    e.preventDefault();
    if (changed){
        changed = false; // prevent multiple uploads
        console.log('image uploading...')
        // fetch("https://api.imgur.com/3/image", {
        //     mode: 'cors',
        //     method: "POST",
        //     headers: {
        //         Authorization: "Client-ID 90ef1830bd083ba",
        //         Accept: 'application/json'
        //     },
        //     body: vehicleImageFormData
        // }).then(data => {
        //     if (data.ok){
        //         return data.json()
        //     } else {
        //         console.log(data)
        //     }
        // }).then(data => {
        //     console.log('success!');
        //     img.src = data.data.link
        //     racer.vehicleURL = data.data.link;
        // }).catch(err => {
        //     console.log(err);
        // })

        fetch(`https://api.streamelements.com/kappa/v2/uploads/${accountId}`, {
                method: 'POST',
                body: vehicleImageFormData,
                headers: {
                authorization: `Bearer ${jwt}`,
                accept: 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => console.log("Uploaded! Image URL: ", res.url))
    }
})
