let canvas = document.getElementById("main-canvas");
let ctx = canvas.getContext("2d");
let racers = ({});
let cameraLoc = [canvas.width, 0];

function updateRacers() {
    if (readying){
        for (let racer of Object.values(racers)) {
            let curTime = Date.now();
            racer.XY[0] += racer.vel[0]*(curTime - racer.time)/1000;
            if (racer.XY[0] > 0) {
                racer.XY[0] = 0; // dont let cars start yet
            }
            racer.XY[1] += racer.vel[1]*(curTime - racer.time)/1000;
          racer.time = curTime;
        }
    } else {

    }

    draw();

    if (Object.keys(racers).length > 0) {
        requestAnimationFrame(updateRacers);
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground();
    drawRacers();
}

function drawBackground() {

}

function drawRacers() {
    for (let racer of Object.values(racers)){
        // translate by camera
        ctx.translate(...cameraLoc);

        // translate to actual XY position of racer
        ctx.translate(...racer.XY);

        // draw vehicle
        ctx.fillStyle = "blue";
        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        // draw avatar in a circle
        ctx.save()
            ctx.beginPath()
            ctx.arc(...racer.avatarTL.map((val, ii) => val+racer.avatarDIM[ii]/2), racer.avatarDIM[0]/2, 0, Math.PI * 2, false)
            //ctx.strokeStyle = '#2465D3' // optional outline around avatars
            //ctx.stroke()
            ctx.clip()
            ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.restore();

        // reset before drawing next
        ctx.resetTransform();
  }
}

async function addRacer(name, channel, displayColor) {
    let racer = ({});
    racer.displayColor = displayColor || "#FFFFFF";
    racer.name = name; // or event.data.nick
    channel ||= name;
    let url = "https://api.streamelements.com/kappa/v2/channels/" + channel;
    await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            charset: "utf-8",
            Authorization: "Bearer undefined"
        }})
        .then(res => {
            //console.log(res);
            if (res.ok) {
                return res.json();
            }
        })
        .then(data => {
            //console.log(data);

            // avatar
            racer.avatar = new Image();
            racer.avatar.src = data.avatar;
            racer.avatarTL = [-165,-130];
            racer.avatarDIM = [50, 50];

            // vehicle main // 800x350
            racer.vehicle = new Image();
            racer.vehicle.src = "https://static.vecteezy.com/system/resources/thumbnails/016/720/433/small_2x/black-car-vehicle-transparent-background-side-view-png.png";
            racer.vehicle.style = {filter: "hue-rotate(60deg)"};
            racer.vehicleTL = [-300, -131.25];
            racer.vehicleDIM = [300, 131.25];
            racer.vehicleCR = [-150, -60]; // center of rotation

            racer.wheel1 = new Image();
            racer.wheel1.src = "https://static.vecteezy.com/system/resources/thumbnails/013/362/883/small_2x/black-rubber-car-tires-transparent-free-png.png";
            racer.wheel2 = new Image();
            racer.wheel2.src = "https://static.vecteezy.com/system/resources/thumbnails/013/362/883/small_2x/black-rubber-car-tires-transparent-free-png.png";

            // racer location
            racer.XY = [-1920 - Math.random()*1920/2, 1080];
            racer.vel = [200,0]; // px/sec
            racer.textCEN = [-100, -50];
            racer.time = Date.now();

            racers[racer["name"]] = racer;
            console.log(racer["name"] + " joined the race!")
        })
};

// startup code
// 1. seed racers

function initRacers() {

};

initRacers();

// 2. seed backgrounds

function drawBackground(camera_location, scale) {
    this.ctx.resetTransform();

    for (let i = 0; i < Train.BACKGROUND_IMAGES.length; i++){
        let multiplier = Train.BACKGROUND_IMAGES[i][1];
        let sx = -scale*(Train.BACKGROUND_OFFSET_X - camera_location*multiplier);
        let sy = -scale*(Train.BACKGROUND_OFFSET_Y);
        let sw = 720/Train.BACKGROUND_SCALE/scale;
        let sh = 540/Train.BACKGROUND_SCALE/scale;
        this.ctx.drawImage(this.backgroundImgs[i],
            sx, sy, sw, sh,
            0, 0, 720, 540);
    }
}

function drawForeground(camera_location, scale) {
    this.ctx.resetTransform();

    for (let i = 0; i < Train.FOREGROUND_IMAGES.length; i++){
        let multiplier = Train.FOREGROUND_IMAGES[i][1];
        let sx = -(Train.BACKGROUND_OFFSET_X - camera_location*multiplier)/scale;
        let sy = -(Train.BACKGROUND_OFFSET_Y)/scale;
        let sw = 720/Train.BACKGROUND_SCALE/scale;
        let sh = 540/Train.BACKGROUND_SCALE/scale;
        this.ctx.drawImage(this.foregroundImgs[i],
            sx, sy, sw, sh,
            0, 0, 720, 540);
    }
}
