let racers = ({});
let readying = true;
let broadcaster = "";
let broadcasterChannelId = "";
let raceStartTime = Date.now();
let setupDuration = 5;
let raceDuration = 30;
//let key = "";

let canvas = document.getElementById("maincanvas");
let ctx = canvas.getContext("2d");
//let tmpcanvas = document.getElementById("tmpcanvas");
//let tmpctx = tmpcanvas.getContext("2d");
let testRacers = ["thecomplements","joplaysviolin", "AndyTheFrenchy"];
let cameraLoc = [canvas.width*0.75, 0];
let cameraTime = 0;
let defaultDrawings = {};
let backgrounds = [[],[],[]];
let foregrounds = [];

const options = {
  method: 'GET',
  headers: {'Content-Type': 'application/json',
            Authorization: 'Bearer'
           }
};

function draw() {
  	ctx.clearRect(0,0,canvas.width,canvas.height);

  	drawBackground();
  	drawRacers();
  	drawForeground();
};

function drawBackground() {
  	ctx.translate(...cameraLoc);

  	// draw moving background w/ some parallax
  	for (let arr of backgrounds){
      	for (let img of arr) {
          	ctx.drawImage(img.img, ...img.XY, ...img.DIM);
        }
    }

  	// reset everything
  	ctx.resetTransform();
};

function drawForeground() {
  	ctx.translate(...cameraLoc);

  	// draw moving foreground, moving at same speed as camera
  	for (let img of foregrounds) {
      	ctx.drawImage(img.img, ...img.XY, ...img.DIM);
    }

  	// draw start line if relevant
  	if (readying || Date.now() - raceStartTime < 1000 * (setupDuration + 2)) {
        //ctx.fillStyle = "black";
        //ctx.beginPath();
        //ctx.rect(0,880,5,200); // replace w/ image of start line
        //ctx.fill();
        //ctx.closePath();
      	ctx.drawImage(defaultDrawings.startLine, -100, 900, 200, 200);
    };

  	// draw finish line if relevant

  	// reset everything
  	ctx.resetTransform();
};

function drawRacers() {
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

      	// draw avatar in a circle
      	ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val+racer.avatarDIM[ii]/2), racer.avatarDIM[0]/2, 0, Math.PI * 2, false)
        //ctx.strokeStyle = '#2465D3' // optional outline around avatars
        //ctx.stroke()
        ctx.clip()
  		ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
      	ctx.closePath();
      	ctx.restore();

      	// draw vehicle
      	ctx.fillStyle = "blue";
      	ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

      	// draw wheel 1
      	ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
      	ctx.rotate(racer.wheel1Theta);	// rotate
      	ctx.translate(-racer.wheel1CR[0],-racer.wheel1CR[1]); // undo translation
      	ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
      	ctx.rotate(-racer.wheel1Theta); // undo rotation
      	ctx.translate(-racer.wheel1CR[0],-racer.wheel1CR[1]); // undo translation back

      	// draw wheel 2
      	ctx.translate(...racer.wheel2CR);
      	ctx.rotate(-racer.wheel2Theta);
      	ctx.translate(-racer.wheel2CR[0],-racer.wheel2CR[1]);
      	ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);

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

      	if (readying && (event.data.text.startsWith("!join") || event.data.text.startsWith("!start"))) {
            addRacer(event.data.displayName, null, event.data.displayColor)
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
  	raceDuration = fieldData.race_duration;
  	options.headers.Authorization = 'Bearer ' + fieldData.JWT_TOKEN;

  	loadAssets();

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

      	// throw in random background assets
      	for (let j = 0; j < 3; j++) {
          for (let i = 0; i < 7; i++) {
              let choice = defaultDrawings.backgrounds[j][Math.floor(Math.random()*(defaultDrawings.backgrounds[j].length-1))];
              let back = {};
              back.img = choice.img;
              back.DIM = choice.DIM;
              back.XY = [-canvas.width*0.75 + Math.random()*canvas.width*2 - back.DIM[0],
                         930-(2-j)*50-back.DIM[1]];
              // avoid overlaps?
              backgrounds[j].push(back);
          }
        }
      	console.log(backgrounds)

      	// throw in random foreground assets

      	requestAnimationFrame(updateRacers);
    })


});

function loadAssets() {
	defaultDrawings.vehicle = new Image();
  	defaultDrawings.vehicle.src = "https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&raw=1";

  	defaultDrawings.wheel1 = new Image();
  	defaultDrawings.wheel1.src = "https://www.dropbox.com/scl/fi/6xqc3i22e9tudpbau8co3/default_wheel1.svg?rlkey=wvprdn16gvssjt0zoaedmv55s&raw=1";

    defaultDrawings.wheel2 = new Image();
  	defaultDrawings.wheel2.src = "https://www.dropbox.com/scl/fi/3p1k8pq5f8by1hxxmg8dp/default_wheel2.svg?rlkey=rq7s836y1qrl51kwvas8dnq96&raw=1";

  	defaultDrawings.avatar = new Image();
  	defaultDrawings.avatar.src = "https://images.vexels.com/media/users/3/236404/isolated/lists/972cb1b1bfe5506f43c5b824766d0205-semi-flat-smiloing-poop-emoji.png";

  	defaultDrawings.startLine = new Image();
  	defaultDrawings.startLine.src = "https://www.dropbox.com/scl/fi/bnou8ckx2enjsn1ntox5d/start_line.png?rlkey=jvibcvg72fxet75n5gu21bo4n&raw=1";

  	defaultDrawings.finishLine = new Image();
  	defaultDrawings.finishLine.src = "https://www.dropbox.com/scl/fi/vrbqretom1k4qm9pyx4w2/finish_line.png?rlkey=z2fvdtmitr4vhzsiy9sf19d6b&raw=1";

  	defaultDrawings.backgrounds = [[],[],[]];
  	defaultDrawings.foregrounds = [];

  	let mountain = {img: new Image(), DIM: [800/2, 500/2]};
  	mountain.img.src = "https://www.dropbox.com/scl/fi/yeygg4k2sy2sum5g18dsp/mountains.png?rlkey=nibv2s6ewbmxbo35p2wn9m0qm&raw=1";
  	defaultDrawings.backgrounds[0].push(mountain);
  	defaultDrawings.backgrounds[1].push(mountain);

  	let barbies = {img: new Image(), DIM: [800/2.5,500/2.5]};
  	barbies.img.src = "https://www.dropbox.com/scl/fi/qil9bpr86tc9crdef3nuh/barnies_restobar_grill.png?rlkey=tdqq0u666ayq77xhus0vcdypo&raw=1";
  	defaultDrawings.backgrounds[2].push(barbies);
};

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
            } else {
              	return null;
            }
      	})
        .then(data => {
            //console.log(data);

      		// avatar
            racer.avatar = new Image();
            racer.avatar.src = data?.avatar || defaultDrawings.avatar;
            racer.avatarTL = [-135,-125];
      		racer.avatarDIM = [50, 50];

      		// vehicle main // 800x350
      		racer.vehicle = defaultDrawings.vehicle;
      		//racer.vehicle.src = "https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&raw=1";
      		racer.vehicle.style = {filter: "hue-rotate(60deg)"};
      		racer.vehicleTL = [-200, -175];
      		racer.vehicleDIM = [200, 200];
      		racer.vehicleCR = [-150, -60]; // center of rotation

      		racer.wheel1 = defaultDrawings.wheel1;
      		//racer.wheel1.src = "https://www.dropbox.com/scl/fi/6xqc3i22e9tudpbau8co3/default_wheel1.svg?rlkey=wvprdn16gvssjt0zoaedmv55s&raw=1";
      		racer.wheel1TL = [-200, -135];
      		racer.wheel1DIM = [481/2.5, 301/2.5];
      		racer.wheel1CR = [-150,-37];
      		racer.wheel1Theta = Math.PI / 6;
      		racer.wheel1Radius = 50/2.5;

      		racer.wheel2 = defaultDrawings.wheel2;
      		//racer.wheel2.src = "https://www.dropbox.com/scl/fi/3p1k8pq5f8by1hxxmg8dp/default_wheel2.svg?rlkey=rq7s836y1qrl51kwvas8dnq96&raw=1";
      		racer.wheel2TL = [-196, -135];
      		racer.wheel2DIM = [481/2.5, 301/2.5];
      		racer.wheel2CR = [-58,-37];
      		racer.wheel2Theta = Math.PI / 6;
      		racer.wheel2Radius = 50/2.5;

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
            } else {
                racer.wheel1Theta += racer.vel[0]/racer.wheel1Radius;
              	racer.wheel1Theta = racer.wheel1Theta % 2 * Math.PI;
                racer.wheel2Theta += racer.vel[0]/racer.wheel2Radius;
              	racer.wheel2Theta = racer.wheel2Theta % 2 * Math.PI;
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
                } else {
                  racer.wheel1Theta += racer.vel[0]/racer.wheel1Radius;
                  racer.wheel1Theta = racer.wheel1Theta % 2 * Math.PI;
                  racer.wheel2Theta += racer.vel[0]/racer.wheel2Radius;
                  racer.wheel2Theta = racer.wheel2Theta % 2 * Math.PI;
                }
                racer.XY[1] += 5*racer.vel[1]*(curTime - racer.time)/1000;
                racer.time = curTime;
            }
          	let newCameraLoc = canvas.width*0.75 - ((canvas.width*0.75-300) / setupDuration) * ((curTime-raceStartTime)/1000);
          	let dX = newCameraLoc - cameraLoc[0];
          	cameraLoc[0] = newCameraLoc;
          	updateBackground(dX);
        } else {
          	let maxXPos = 0;
          	for (let racer of Object.values(racers)) {
              	// update
              	racer.vel[0] += (Math.random()-0.5)*2*racer.acc[0];
                racer.vel[1] += (Math.random()-0.5)*2*racer.acc[1];

              	if (racer.vel[0] < 0) { racer.vel[0] = 0; }

                racer.wheel1Theta += racer.vel[0]/racer.wheel1Radius;
              	racer.wheel1Theta = racer.wheel1Theta % 2 * Math.PI;
                racer.wheel2Theta += racer.vel[0]/racer.wheel2Radius;
              	racer.wheel2Theta = racer.wheel2Theta % 2 * Math.PI;

                racer.XY[0] += racer.vel[0]*(curTime - racer.time)/1000;
                racer.XY[1] += racer.vel[1]*(curTime - racer.time)/1000;
                racer.time = curTime;

              	if (racer.XY[0] > maxXPos){
                 	maxXPos = racer.XY[0];
                }
            }
          	let newCameraLocX = -maxXPos + 300 + (canvas.width-300)*(curTime - raceStartTime - setupDuration*1000)/(raceDuration * 1000);
          	let dX = newCameraLocX - cameraLoc[0];
          	cameraLoc[0] = newCameraLocX;
          	updateBackground(dX);
        }
    }

  	draw();

  	if (Object.keys(racers).length > 0 && (curTime - raceStartTime < (raceDuration + setupDuration) * 1000 || readying)) {
   		requestAnimationFrame(updateRacers);
  }
};

function updateBackground(dX) {
  	// parallax effect here
  	for (let img of backgrounds[0]){
     	img.XY[0] -= dX*0.9;

      	// remove img if off canvas on left side
    }
 	 for (let img of backgrounds[1]){
     	img.XY[0] -= dX*0.4;
    }

  	// if certain time has passed since last added background asset, consider adding a new one
};
