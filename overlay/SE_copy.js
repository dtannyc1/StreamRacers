let racers = ({});
let readying;
let broadcaster = "";
let broadcasterChannelId = "";
let raceStartTime;
let setupDuration = 5;
let raceDuration = 30;
let totalRoadHeight = 95;
let winner;
let finishX;

//let key = "";

let canvas = document.getElementById("maincanvas");
let ctx = canvas.getContext("2d");
//let tmpcanvas = document.getElementById("tmpcanvas");
//let tmpctx = tmpcanvas.getContext("2d");
let testRacers = ["apocalypse_squirrel", "asixel", "boristhefrenchcat", "cafesparrow", "charlysmomm",
                  "drhahn_qc", "medinamind", "neiluj04", "pencils45", "pyobum", "thecomplements", "thesolid7"];
let cameraLoc = [canvas.width*0.75, 0];
let cameraTime = 0;
let defaultDrawings = {};
let backgrounds = [[],[],[]];
let foregrounds = [];
let sortedRacers = [];
let leaderboard = [];

var myFont = new FontFace('Oswald', 'url(https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap)');

myFont.load().then((font) => {
  	document.fonts.add(font);
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

  	let barbies = {img: new Image(), DIM: [800/2.5,500/2.5]};
  	barbies.img.src = "https://www.dropbox.com/scl/fi/qil9bpr86tc9crdef3nuh/barnies_restobar_grill.png?rlkey=tdqq0u666ayq77xhus0vcdypo&raw=1";
  	defaultDrawings.backgrounds[2].push(barbies);

  	let tree1 = {img: new Image(), DIM: [500/2.5,500/2.5]};
  	tree1.img.src = "https://www.dropbox.com/scl/fi/rsqpqpv0mel94vq7yd9lv/tree1.png?rlkey=wfsqqgbz1k3aev977it6gm19s&raw=1";
  	defaultDrawings.backgrounds[2].push(tree1);
  	defaultDrawings.foregrounds.push(tree1);

  	let tree2 = {img: new Image(), DIM: [500/2.5,500/2.5]};
  	tree2.img.src = "https://www.dropbox.com/scl/fi/4o8bjpt42vp7by6bi2i1l/tree2.png?rlkey=p0auz5elxsrn2n2ja357m8ohs&raw=1";
  	defaultDrawings.backgrounds[2].push(tree2);
  	defaultDrawings.foregrounds.push(tree2);

  	let rock = {img: new Image(), DIM: [500/5,500/5]};
  	rock.img.src = "https://www.dropbox.com/scl/fi/wedf2wf50e8dfpgt65wir/rock.png?rlkey=59l6o5ibfuie6y2m3wu137dfv&raw=1";
  	defaultDrawings.backgrounds[2].push(rock);
  	defaultDrawings.foregrounds.push(rock);

  	let appleTree = {img: new Image(), DIM: [500/2.5,500/2.5]};
  	appleTree.img.src = "https://www.dropbox.com/scl/fi/0lop56qnil503u1fp9h43/apple_tree.png?rlkey=rkcdlj91xzvz7q8musz8lw9pw&raw=1";
  	defaultDrawings.backgrounds[1].push(appleTree);
  	defaultDrawings.backgrounds[2].push(appleTree);
};

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

  	if (winner) {
      	displayWinner();
    };
};

function displayWinner(){
  	ctx.font = "60px Oswald";
  	ctx.fillStyle = "white";
  	ctx.strokeStyle = "black";
  	ctx.lineWidth = 2;
  	let textPos = racers[winner].XY.slice();
  	textPos[0] += racers[winner].vehicleTL[0] + racers[winner].vehicleDIM[0]/2;
  	textPos[1] += racers[winner].avatarTL[1] - 50;

  	// show leaderboard
  	ctx.textAlign = "left";
  	ctx.fillText("Leaderboard", 50, 100);
  	for (let i = 0; i < leaderboard.length; i++){
     	ctx.fillText(i+1 + ". " + leaderboard[i], 50, 100 + 60*(i+1));
      	if (i+1 === 10) break;
    }

  	// show winner
	ctx.textAlign = "center";
  	ctx.translate(...cameraLoc);
	ctx.fillText("Winner is", textPos[0], textPos[1] - 30);
	ctx.fillText(winner, textPos[0], textPos[1] + 30);
	ctx.strokeText("Winner is", textPos[0], textPos[1] - 30);
	ctx.strokeText(winner, textPos[0], textPos[1] + 30);
  	ctx.resetTransform();
};

function drawBackground() {
  	// draw road
  	let numDiv = 10;
  	ctx.fillStyle = "black";
  	ctx.beginPath();
  	ctx.rect(0,1080-25-totalRoadHeight*(numDiv+1)/numDiv,1920,totalRoadHeight+totalRoadHeight*2/numDiv);
  	ctx.fill();
  	ctx.closePath();
  	for (let i=0; i < numDiv; i++){
        ctx.fillStyle = "hsl(" + Math.floor((i*360/numDiv)).toString() + ",100%,50%)";
      	ctx.strokeStyle = "hsl(" + Math.floor((i*360/numDiv)).toString() + ",100%,50%)";
        //ctx.beginPath();
        ctx.fillRect(0,1080-25-totalRoadHeight*(numDiv-i)/numDiv,1920,totalRoadHeight/numDiv);
      	ctx.strokeRect(0,1080-25-totalRoadHeight*(numDiv-i)/numDiv,1920,totalRoadHeight/numDiv);
        //ctx.fill();
        //ctx.closePath();
    }

  	ctx.translate(...cameraLoc);

  	// draw background images, images further back are slightly larger
  	for (let i = 0; i < backgrounds.length; i++){
      	let arr = backgrounds[i]
      	for (let img of arr) {
          	ctx.drawImage(img.img, ...img.XY, img.DIM[0]+10*(2-i), img.DIM[1]+10*(2-i));
        }
    }

  	// draw start line if relevant
  	if (readying || -100 + cameraLoc[0] > -500 ) {
      	ctx.drawImage(defaultDrawings.startLine, -100, 880, 200, 200);
    };

  	// draw finish line if relevant
  	if (finishX) {
      	ctx.drawImage(defaultDrawings.finishLine, finishX-100, 890, 200, 200);
    };

  	// reset everything
  	ctx.resetTransform();
};

function drawForeground() {
  	ctx.translate(...cameraLoc);
  	ctx.globalAlpha = 0.75; // make foreground somewhat transparent
  	// draw foreground images
  	for (let img of foregrounds) {
      	ctx.drawImage(img.img, ...img.XY, ...img.DIM);
    }

  	// reset everything
  	ctx.resetTransform();
  	ctx.globalAlpha = 1;
};

function drawRacers() {
  	for (let name of sortedRacers){
      	racer = racers[name];
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
      	if (racer){
            ctx.translate(...cameraLoc);

            // translate to actual XY position of racer
          	if (racer.XY) {
              	ctx.translate(...racer.XY);
              	ctx.translate((racer.XY[1] - (1070 - totalRoadHeight/2)),0);
            }

            // draw avatar in a circle
            ctx.save()
            ctx.beginPath()
            ctx.arc(...racer.avatarTL.map((val, ii) => val+racer.avatarDIM[ii]/2), racer.avatarDIM[0]/2, 0, Math.PI * 2, false)
            //ctx.strokeStyle = '#2465D3' // optional outline around avatars
            //ctx.stroke()
            ctx.clip()
            if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
            ctx.closePath();
            ctx.restore();

            // draw vehicle
            ctx.fillStyle = "blue";
            if (racer.vehicle) {
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0],-racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0],-racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR);
                ctx.rotate(-racer.wheel2Theta);
                ctx.translate(-racer.wheel2CR[0],-racer.wheel2CR[1]);
                if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
            }

            // reset before drawing next
            ctx.resetTransform();
        }
    }
}

window.addEventListener('onEventReceived', async function (obj) {
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
            await addRacer(event.data.displayName, event.data.displayColor)
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
                      	if (sortedRacers.length > 0){
                          readying = false;
                          raceStartTime = Date.now();
                          sendMessageInChat("Race started!");
                        }
                    } else if (event.data.text.startsWith("!resetrace")) {
                     	resetRace();
                      	sendMessageInChat("Race reset");
                    } else {
                     	//console.log(event.data.text);
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
          for (let i = 0; i < 4-j+Math.random()*10; i++) {
              addBackgroundItem(j, true);
          }
        }

      	// throw in random foreground assets
      	for (let i = 0; i < 4+Math.random()*10; i++) {
              addForegroundItem(true);
        }

      	readying = true;
      	requestAnimationFrame(updateRacers);
    })


});

function addBackgroundItem(layer, drawAnywhere){
  	let choice = defaultDrawings.backgrounds[layer][Math.floor(Math.random()*(defaultDrawings.backgrounds[layer].length-1))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
  	if (drawAnywhere){
      	back.XY = [-canvas.width*0.75 + Math.random()*canvas.width*2 - back.DIM[0],
                 	960-(2-layer)*10-back.DIM[1]];
    } else {
      	// add item off canvas
      	back.XY = [canvas.width - cameraLoc[0] + Math.random()*canvas.width/4,
                 	960-(2-layer)*10-back.DIM[1]];
    }
    // avoid overlaps?
    backgrounds[layer].push(back);
}

function addForegroundItem(drawAnywhere){
  	let choice = defaultDrawings.foregrounds[Math.floor(Math.random()*(defaultDrawings.foregrounds.length-1))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
  	if (drawAnywhere){
      	back.XY = [-canvas.width*0.75 + Math.random()*canvas.width*2 - back.DIM[0],
                 	1070-back.DIM[1]];
    } else {
      	// add item off canvas
      	back.XY = [canvas.width - cameraLoc[0] + Math.random()*canvas.width/4,
                 	1070-back.DIM[1]];
    }
    // avoid overlaps?
  	// never hide start or finish line
  	if (back.XY[0] > -200 && back.XY[0] < 100){
     	back.XY[0] += 300;
    }
  	if (finishX) {
     	if (back.XY[0] - finishX > -200 && back.XY[0] - finishX < 100){
         	back.XY[0] += 300;
        }
    }
    foregrounds.push(back);
}

async function addRacer(name, displayColor) {
  	if (!racers[name]){
      	try{
        let racer = ({});
        racer.displayColor = displayColor || "#FFFFFF";
        racer.name = name; // or event.data.nick
        let url = "https://api.streamelements.com/kappa/v2/channels/" + name;
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
                if (data?.avatar) {
                	racer.avatar = new Image();
                    racer.avatar.src = data.avatar;
                } else {
                    racer.avatar = defaultDrawings.avatar;
                }
                racer.avatarTL = [-150,-145];
                racer.avatarDIM = [80, 80];

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
                racer.XY = [-1920 - Math.random()*1920/2, 1070 - Math.random()*totalRoadHeight];
                racer.vel = [200,0]; // px/sec
                racer.acc = [6,0];
                racer.textCEN = [-100, -50];
                racer.time = Date.now();

                if (!racers[racer["name"]]){
                    racers[racer["name"]] = racer;
                    sortedRacers.push(racer["name"]);
                    let j = sortedRacers.length-1;
                    while (j > 0 & racers[sortedRacers[j]]?.XY[1] < racers[sortedRacers[j-1]]?.XY[1]){
						[sortedRacers[j], sortedRacers[j-1]] = [sortedRacers[j-1], sortedRacers[j]];
                      	j--;
                    }
                    console.log(racer["name"] + " joined the race!")
                }
    		})
            .catch((err) => {
            	console.error(err);
            })
    	} catch (err) {
        	console.error(err);
        }
	}
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

function resetRace() {
  	winner = null;
  	finishX = null;
  	racers = ({});
	sortedRacers = [];
	leaderboard = [];
  	raceStartTime = null;
    cameraLoc = [canvas.width*0.75, 0];
  	readying = true;
  	requestAnimationFrame(updateRacers);
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
          	let maxXVel = 0;
          	let finishers = [];
          	for (let racer of Object.values(racers)) {
              	// update
              	racer.vel[0] += (Math.random()-1/3)*racer.acc[0];
                racer.vel[1] += (Math.random()-1/3)*racer.acc[1];

              	if (racer.vel[0] < 0) { racer.vel[0] = 0; }

                racer.wheel1Theta += racer.vel[0]/racer.wheel1Radius;
              	racer.wheel1Theta = racer.wheel1Theta % 2 * Math.PI;
                racer.wheel2Theta += racer.vel[0]/racer.wheel2Radius;
              	racer.wheel2Theta = racer.wheel2Theta % 2 * Math.PI;

                racer.XY[0] += racer.vel[0]*(curTime - racer.time)/1000;
                racer.XY[1] += racer.vel[1]*(curTime - racer.time)/1000;

              	if (racer.XY[0] > maxXPos){
                 	maxXPos = racer.XY[0];
                  	maxXVel = racer.vel[0];
                }

              	if (finishX && racer.XY[0] > finishX && racer.XY[0] - racer.vel[0]*(curTime - racer.time)/1000 <= finishX) {
                  	finishers.push(racer.name);
                  	//console.log(racer.name);
                }

                racer.time = curTime;
            }
          	// add finishers to leaderboard
          	if (finishers.length > 0) {
              	leaderboard = leaderboard.concat(finishers.sort((a,b) => {
                    let aX = racers[a].XY[0];
                    let bX = racers[b].XY[0];
                    if (aX < bX) return -1;
                    if (aX > bX) return 1;
                    return 0;
            	}));
              	//console.log(leaderboard)
              	if (!winner) winner = leaderboard[0];
            }

          	let newCameraLocX = winner ?
                -maxXPos + 300 + (canvas.width-300-200)*Math.min(1, (curTime - raceStartTime - setupDuration*1000)/(raceDuration * 1000)) :
                -maxXPos + 300 + (canvas.width-300-200)*(curTime - raceStartTime - setupDuration*1000)/(raceDuration * 1000);
          	let dX = newCameraLocX - cameraLoc[0];
          	cameraLoc[0] = newCameraLocX;
          	updateBackground(dX);

          	if (!finishX && (raceDuration + setupDuration) * 1000 - (curTime - raceStartTime) < 5000) {
                finishX = canvas.width - cameraLoc[0] + 5*maxXVel - 800;
              	console.log(maxXVel, finishX);
            }
        }
    }

  	draw();

  	if (curTime - raceStartTime < (raceDuration + setupDuration) * 1000 || readying) {
   		requestAnimationFrame(updateRacers);
  	} else if (raceStartTime && (leaderboard.length < sortedRacers.length || finishX + cameraLoc[0] > -500)){
      	requestAnimationFrame(updateRacers);
    } else {
     	console.log(leaderboard)
    }
};

function updateBackground(dX) {
  	// parallax effect here
  	for (let j = 0; j < backgrounds.length; j++){
        let rem = [];
        for (let i=0; i < backgrounds[j].length; i++){
            let img = backgrounds[j][i];
            img.XY[0] -= dX*(0.6-0.3*j);

            // remove img if off canvas on left side
            if (img.XY[0] + cameraLoc[0] < -500){
                rem.push(i);
            }
        }
        while (rem.length){
			backgrounds[j].splice(rem.pop(),1);

          	// add a new one
          	for (let i = 0; i < (Math.random()-1/3)*3; i++){
          		addBackgroundItem(j);
            }
        }
    }

  	let rem = [];
    for (let i=0; i < foregrounds.length; i++){
      let img = foregrounds[i];

      // remove img if off canvas on left side
      if (img.XY[0] + cameraLoc[0] < -500){
        rem.push(i);
      }
    }
    while (rem.length){
      foregrounds.splice(rem.pop(),1);

      // add a new one
      for (let i = 0; i < (Math.random()-1/3)*3; i++){
      	addForegroundItem();
      }
    }
};
