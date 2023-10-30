let racers = ({});
let readying = true;
let broadcaster = "";
let broadcasterChannelId = "";
let raceStartTime = Date.now();
let setupDuration = 5;
//let key = "";

let canvas = document.getElementById("maincanvas");
let ctx = canvas.getContext("2d");
//let tmpcanvas = document.getElementById("tmpcanvas");
//let tmpctx = tmpcanvas.getContext("2d");
let testRacers = ["mamzellerylo", "thecomplements","joplaysviolin", "andythefrenchy"];
let cameraLoc = [canvas.width, 0];
let cameraTime = 0;

const options = {
  method: 'GET',
  headers: {'Content-Type': 'application/json',
            Authorization: 'Bearer'
           }
};

function drawRacers() {
  	ctx.clearRect(0,0,canvas.width,canvas.height);
  	for (let racer of Object.values(racers)){
      	// draw vehicle
      	//tmpctx.clearRect(0,0,tmpcanvas.width,tmpcanvas.height);
      	//tmpctx.translate(...cameraLoc);
      	//tmpctx.translate(...racer.XY);
      	//tmpctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
      	//tmpctx.globalCompositeOperation = "source-in";
      	//tmpctx.fillStyle = "#09f";
  		//tmpctx.fillRect(0, 0, tmpcanvas.width, tmpcanvas.height);
      	//tmpctx.globalCompositeOperation = "source-over";
      	//ctx.drawImage(tmpcanvas, 0, 0,canvas.width,canvas.height);
      	//tmpctx.resetTransform();

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

window.addEventListener('onEventReceived', function (obj) {
    if (!obj.detail.event) {
      return;
    }
    if (typeof obj.detail.event.itemId !== "undefined") {
        obj.detail.listener = "redemption-latest"
    }
    const listener = obj.detail.listener.split("-")[0];
    const event = obj.detail.event;

    if (listener === 'message') {
      	//console.log(event);

      	if (readying && event.data.text.startsWith("!join")) {
          	console.log(event.data.channel);
            addRacer(event.data.displayName, event.data.channel, event.data.displayColor)
        } else{
         	if (isModerator(event.data.badges)) {
             	if (event.data.text.startsWith("!checkracestatus")){
                  	console.log(racers);
                  	requestAnimationFrame(updateRacers);
                }
              	if (isBroadcaster(event.data.badges)) {
                 	if (event.data.text.startsWith("!startrace")){
                     	readying = true;
                      	sendMessageInChat("Race entries open, !join to enter");
                    } else if (event.data.text.startsWith("!go")){
                     	readying = false;
                      	raceStartTime = Date.now();
                      	sendMessageInChat("Race started!");
                    } else if (event.data.text.startsWith("!resetrace")) {
                     	racers = ({});
                      	cameraLoc = [canvas.width, 0];
                      	sendMessageInChat("Race reset");
                    } else {
                     	console.log(event.data.text);
                    }
                }
            }
        }
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
  	broadcaster = obj.detail.channel.username;
  	let fieldData = obj.detail.fieldData;
  	options.headers.Authorization = 'Bearer ' + fieldData.JWT_TOKEN;

  	let url = "https://api.streamelements.com/kappa/v2/channels/" + broadcaster;
    fetch(url, {
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
      	broadcasterChannelId = data._id;
      	console.log("Broadcaster info loaded");
      })
  	.then(async function () {
      	for (let racer of testRacers) {
      		await addRacer(racer);
        }
      	requestAnimationFrame(updateRacers);
    })


});

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
      		racer.acc = [10,0];
      		racer.textCEN = [-100, -50];
      		racer.time = Date.now();

            racers[racer["name"]] = racer;
            console.log(racer["name"] + " joined the race!")
      	})
};

function sendMessageInChat(message) {
  	fetch("https://api.streamelements.com/kappa/v2/bot/"+broadcasterChannelId+"/say", {
      method: "POST",
      headers: {
        "Accept": 'application/json; charset=utf-8',
        "Authorization": options["headers"]["Authorization"],
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "message": message
      })
    })
      .then(res => {
      if (res.ok) {
        return res.json();
      }
    })
      .then(data => {
      //console.log(data)
    })
      .catch(err => {
      console.log(err)
    })
};

function isModerator(badgesArray) {
    return badgesArray.findIndex(element => element.type == "moderator") >=0 ||
      	   badgesArray.findIndex(element => element.type == "broadcaster") >= 0
};

function isBroadcaster(badgesArray) {
    return badgesArray.findIndex(element => element.type == "broadcaster") >= 0
};

function updateRacers() {
  	let curTime = Date.now();
  	if (readying){
      	for (let racer of Object.values(racers)) {
         	racer.XY[0] += racer.vel[0]*(curTime - racer.time)/1000;
          	if (racer.XY[0] > 0) {
             	 racer.XY[0] = 0; // dont let cars start yet
            }
          	racer.XY[1] += racer.vel[1]*(curTime - racer.time)/1000;
			racer.time = curTime;
        }
    } else {
      	if (curTime - raceStartTime < 1000 * setupDuration){
          	for (let racer of Object.values(racers)) {
              	// speed up racers to get them to the start line
                racer.XY[0] += 5*racer.vel[0]*(curTime - racer.time)/1000;
                if (racer.XY[0] > 0) {
                     racer.XY[0] = 0; // dont let cars start yet
                }
                racer.XY[1] += 5*racer.vel[1]*(curTime - racer.time)/1000;
                racer.time = curTime;
            }
          	cameraLoc[0] = canvas.width - ((canvas.width-300) / setupDuration) * ((curTime-raceStartTime)/1000);
        } else {
          	let maxXVel = 0;
          	for (let racer of Object.values(racers)) {
              	// update
              	racer.vel[0] += (Math.random()-0.5)*2*racer.acc[0];
                racer.vel[1] += (Math.random()-0.5)*2*racer.acc[1];

              	if (racer.vel[0] < 0) { racer.vel[0] = 0; }
                if (racer.vel[0] >= maxXVel) {
                  	maxXVel = racer.vel[0];
                  	cameraTime = curTime - racer.time;
                }

                racer.XY[0] += racer.vel[0]*(curTime - racer.time)/1000;
                racer.XY[1] += racer.vel[1]*(curTime - racer.time)/1000;
                racer.time = curTime;
            }
          	cameraLoc[0] -= 0.65*maxXVel*(cameraTime)/1000;
          	//console.log(cameraLoc[0])
        }
    }

  	drawRacers();

  	if (Object.keys(racers).length > 0 && (curTime - raceStartTime < 30000 || readying)) {
   		requestAnimationFrame(updateRacers);
  }
}
