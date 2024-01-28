
let testing = true;
let autostart = true;

let readying;
let broadcaster = "";
let broadcasterChannelId = "";
let raceStartTime;
let setupDuration = 5;
let raceDuration = 30;
let totalRoadHeight = 95;
let boostCooldown = 0.5; // time in seconds
let winner;
let finishX;

let testRacers = [];
if (testing){
  testRacers = ["apocalypse_squirrel", "boristhefrenchcat", "charlysmomm",
                    "medinamind", "neiluj04", "pyobum", "thecomplements",
                   "andythefrenchy", "thesolid7", "pencils45"];
};

let defaultDrawings = {};
let racers = ({});
let canvas = document.getElementById("maincanvas");
let ctx = canvas.getContext("2d");
let cameraLoc = [canvas.width*0.75, 0];
let backgrounds = [[],[],[]];
let foregrounds = [];
let sortedRacers = [];
let leaderboard = [];
let standings = [];
let prevStandingsUpdateTime = 0;
let standingsUpdateDur = 0.5; // time in seconds between live standings updates
let stopRace = false;
let isUpdatingRacers = true;
let finishingVel = 1000;
let hidden = false;

//// load custom font
//const myFont = new FontFace('Oswald Custom',
//                          'url(https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1xZosUJiZTaR.woff2)');
//document.fonts.add(myFont);
//myFont.load();

let clientID, clientSecret, accessToken, jebaitedToken;

let backupButton = document.getElementById("startbutton")
backupButton.addEventListener("click", function() {
  	console.log('click start detected')
	if (sortedRacers.length > 0){
        startRace();
    }
});

let wordBank = {
  "food": ["pizza", "chocolate", "sushi", "ice cream", "burger", "pasta", "salad", "potato", "tacos", "steak", "coffee", "cake", "popcorn", "pancake", "sandwich", "cheese", "fruit", "cookies", "ramen", "grilled cheese"],
  "video game titles": ["The Legend of Zelda", "Super Mario Bros.", "Fortnite", "Minecraft", "Call of Duty", "Overwatch", "Assassin's Creed", "Grand Theft Auto", "FIFA", "World of Warcraft", "Destiny", "Halo", "Dota 2", "League of Legends", "Final Fantasy", "Skyrim", "Rocket League", "Mortal Kombat", "The Witcher", "Splatoon"],
  "music genre": ["rock", "pop", "hip-hop", "jazz", "classical", "country", "rap", "blues", "reggae", "electronic", "indie", "folk", "punk", "metal", "soul", "R&B", "dance", "alternative", "latin", "world"],
  "disney character": ["Mickey Mouse", "Cinderella", "Frozen", "Lion King", "Aladdin", "Pixar", "Disneyland", "Magic Kingdom", "Mulan", "Toy Story", "Elsa", "Donald Duck", "Moana", "Beauty and the Beast", "Pocahontas", "Goofy", "Little Mermaid", "Dumbo", "Snow White", "Peter Pan"],
  "musical instruments": ["guitar", "piano", "violin", "trumpet", "drums", "flute", "saxophone", "clarinet", "bass guitar", "cello", "trombone", "ukulele", "accordion", "harmonica", "banjo", "bagpipes", "harp", "mandolin", "xylophone", "oboe"]
};
let chosenWord = null;
let sentClue = false;

let chooseRandomWord = () => {
  let allkeys = Object.keys(wordBank);
  let randKey = allkeys[Math.floor((Math.random()*allkeys.length))];
  let allWords = wordBank[randKey];
  let randWord = allWords[Math.floor((Math.random()*allWords.length))];
  chosenWord = {"word": randWord.toLowerCase(), "category": randKey};
};

let resetRandomWord = () => {
  chosenWord = null;
  sentClue = false;
};

function containsChosenWord(input) {
  if (!chosenWord) return false;
  return input.toLowerCase().includes(chosenWord["word"]);
};

function boostRacer(racerName) {
    let racer = racers[racerName];
    if (racer) {
        if (!racer.lastBoost || (racer.lastBoost && Date.now() - racer.lastBoost > (boostCooldown*1000))){
			racer.vel[0] *= 1.2;
            racer.lastBoost = boostCooldown
        };
    };
};

function loadAssets() {
	defaultDrawings.vehicle = new Image();
  	defaultDrawings.vehicle.src = "https://www.dropbox.com/scl/fi/erc6teenvak8bzkdgkrfr/default_vehicle.png?rlkey=oz9y6z8gr6x3b4ek7nv3s5csh&raw=1";

  	defaultDrawings.wheel1 = new Image();
  	defaultDrawings.wheel1.src = "https://www.dropbox.com/scl/fi/h40xha1db6oqsa7n5nibi/default_wheel1.png?rlkey=xtolfaiwu6fsj3w7f23jyt6h8&raw=1";

    defaultDrawings.wheel2 = new Image();
  	defaultDrawings.wheel2.src = "https://www.dropbox.com/scl/fi/avrdy5jpr2ky0xfo5h6bz/default_wheel2.png?rlkey=msdi1tkjhoot006z1n0cuic5u&raw=1";

  	defaultDrawings.avatar = new Image();
  	defaultDrawings.avatar.src = "https://images.vexels.com/media/users/3/236404/isolated/lists/972cb1b1bfe5506f43c5b824766d0205-semi-flat-smiloing-poop-emoji.png";

  	defaultDrawings.startLine = new Image();
  	defaultDrawings.startLine.src = "https://www.dropbox.com/scl/fi/bnou8ckx2enjsn1ntox5d/start_line.png?rlkey=jvibcvg72fxet75n5gu21bo4n&raw=1";

  	defaultDrawings.finishLine = new Image();
  	defaultDrawings.finishLine.src = "https://www.dropbox.com/scl/fi/vrbqretom1k4qm9pyx4w2/finish_line.png?rlkey=z2fvdtmitr4vhzsiy9sf19d6b&raw=1";

  	defaultDrawings.backgrounds = [[],[],[]];
  	defaultDrawings.foregrounds = [];

  	let mountain = {img: new Image(), DIM: [800, 500], scale: 1/2};
  	mountain.img.src = "https://www.dropbox.com/scl/fi/yeygg4k2sy2sum5g18dsp/mountains.png?rlkey=nibv2s6ewbmxbo35p2wn9m0qm&raw=1";
  	defaultDrawings.backgrounds[0].push(mountain);

  	let clouds = {img: new Image(), DIM: [564,516], scale: 1/3};
  	clouds.img.src = "https://www.dropbox.com/scl/fi/nw5qrer7q70z61vzcy2q3/DoTheGayCloud.MatMan.png?rlkey=a8rfof98i3lxqeih908c9k0wy&raw=1";
  	defaultDrawings.backgrounds[0].push(clouds);

  	let fan = {img: new Image(), DIM: [628,728], scale: 1/3};
  	fan.img.src = "https://www.dropbox.com/scl/fi/i9einckdxllcblbakhxdp/Moulin3.png?rlkey=9q3myaqxpd62l7adszb9w6jae&raw=1";
  	defaultDrawings.backgrounds[0].push({...fan});
  	fan.scale = 1/4;
  	defaultDrawings.backgrounds[1].push({...fan});

  	let sign = {img: new Image(), DIM: [1100,800], scale: 1/3};
  	sign.img.src = "https://www.dropbox.com/scl/fi/eydk5ey2uf8s5hfn1p9jb/better_call_asixel.png?rlkey=iaznxl8qfzwftdgvexacteoth&raw=1";
  	defaultDrawings.backgrounds[2].push(sign);

  	let barbies = {img: new Image(), DIM: [800,500], scale: 1/1.5};
  	barbies.img.src = "https://www.dropbox.com/scl/fi/qil9bpr86tc9crdef3nuh/barnies_restobar_grill.png?rlkey=tdqq0u666ayq77xhus0vcdypo&raw=1";
  	defaultDrawings.backgrounds[2].push(barbies);

  	let tree1 = {img: new Image(), DIM: [500,500], scale: 1/2};
  	tree1.img.src = "https://www.dropbox.com/scl/fi/rsqpqpv0mel94vq7yd9lv/tree1.png?rlkey=wfsqqgbz1k3aev977it6gm19s&raw=1";
  	defaultDrawings.backgrounds[0].push({...tree1});
  	tree1.scale = 1/2.3;
  	defaultDrawings.backgrounds[1].push({...tree1});
  	tree1.scale = 1/2.6;
  	defaultDrawings.backgrounds[2].push({...tree1});
  	defaultDrawings.foregrounds.push({...tree1});

  	let tree2 = {img: new Image(), DIM: [500,500], scale: 1/2.3};
  	tree2.img.src = "https://www.dropbox.com/scl/fi/4o8bjpt42vp7by6bi2i1l/tree2.png?rlkey=p0auz5elxsrn2n2ja357m8ohs&raw=1";
  	defaultDrawings.backgrounds[1].push({...tree2});
  	tree2.scale = 1/2.6;
  	defaultDrawings.backgrounds[2].push({...tree2});
  	defaultDrawings.foregrounds.push({...tree2});

  	let bush = {img: new Image(), DIM: [500,500], scale: 1/4};
  	bush.img.src = "https://www.dropbox.com/scl/fi/4pv0w2xh32xmuffgkdb8n/bush.png?rlkey=hnbnnbpdcnp596qolz91f8jvn&raw=1";
  	defaultDrawings.backgrounds[1].push({...bush});
  	bush.scale = 1/5;
  	defaultDrawings.backgrounds[2].push(bush);
  	defaultDrawings.foregrounds.push(bush);

  	let rock = {img: new Image(), DIM: [500,500], scale: 1/5};
  	rock.img.src = "https://www.dropbox.com/scl/fi/wedf2wf50e8dfpgt65wir/rock.png?rlkey=59l6o5ibfuie6y2m3wu137dfv&raw=1";
  	defaultDrawings.backgrounds[2].push(rock);
  	defaultDrawings.foregrounds.push(rock);

  	let appleTree = {img: new Image(), DIM: [500,500], scale: 1/2.5};
  	appleTree.img.src = "https://www.dropbox.com/scl/fi/0lop56qnil503u1fp9h43/apple_tree.png?rlkey=rkcdlj91xzvz7q8musz8lw9pw&raw=1";
  	defaultDrawings.backgrounds[1].push(appleTree);
  	defaultDrawings.backgrounds[2].push(appleTree);

  	let rainbow = {img: new Image(), DIM: [500,500], scale: 1};
  	rainbow.img.src = "https://www.dropbox.com/scl/fi/x0zfus1zohj9a26n6kde3/rainbow.png?rlkey=2zorp76sgnadj8lga7arfgbux&raw=1";
  	defaultDrawings.backgrounds[0].push(rainbow);

  	let mall = {img: new Image(), DIM: [1440,810], scale: 1/3};
  	mall.img.src = "https://www.dropbox.com/scl/fi/7zugsmvnqcx2bexl1iehs/DestroyTheMall.MatMan.png.png?rlkey=m7ou7box49px8b8xz5dhnwcz6&raw=1";
  	defaultDrawings.backgrounds[2].push(mall);

  	let stands = {img: new Image(), DIM: [1100,800], scale: 1/1.75};
  	stands.img.src = "https://www.dropbox.com/scl/fi/oentkgnkqv04nyv3fvomu/stands.png?rlkey=pbjarhgbnpg7oemn3xu6ytacg&raw=1";
  	defaultDrawings.stands = stands;
};

const options = {
  method: 'GET',
  headers: {'Content-Type': 'application/json',
            Authorization: 'Bearer'
           }
};

function draw() {
  	ctx.clearRect(0,0,canvas.width,canvas.height);

  	if (!hidden){
        displayWinner();
        drawBackground();
        drawRacers();
        drawForeground();

        //if (winner) {
        //};
    }
};

function displayWinner(){
  	ctx.font = "32px Oswald";
  	//ctx.font = "23px Oswald";
  	ctx.letterSpacing = "1.5px";
  	ctx.fillStyle = "white";
  	ctx.strokeStyle = "black";
  	ctx.lineWidth = 2;
  	let topLeftCorner = [1450, 360];
    //let topLeftCorner = [1450, 42];

  	// draw black box
  	if (standings.length){
        ctx.fillStyle = "rgba(0,0,0,1.0)";
        ctx.beginPath();
        ctx.roundRect(topLeftCorner[0]-25, topLeftCorner[1]-42, 480,400, 30)
      	//ctx.roundRect(topLeftCorner[0]-25, topLeftCorner[1]-42, 480,318, 30)
        ctx.fill();
        ctx.closePath();
    }

  	ctx.fillStyle = "white";

  	if (winner){
      	// show standings
        ctx.textAlign = "left";
        ctx.fillText("Leaderboard", ...topLeftCorner);
        for (let i = 0; i < standings.length; i++){
            if (leaderboard.length <= i) ctx.fillText(i+1 + ". " + standings[i], topLeftCorner[0], topLeftCorner[1] + 34*(i+1));
            if (i+1 === 10) break;
        }

        // show leaderboard
  		ctx.fillStyle = "cyan";
        ctx.textAlign = "left";
        for (let i = 0; i < leaderboard.length; i++){
            ctx.fillText(i+1 + ". " + leaderboard[i], topLeftCorner[0], topLeftCorner[1] + 34*(i+1));
            if (i+1 === 10) break;
        }
        ctx.resetTransform();
    } else {
     	// show standings
        ctx.textAlign = "left";
        if (standings.length) ctx.fillText("Leaderboard", topLeftCorner[0], topLeftCorner[1]);
        for (let i = 0; i < standings.length; i++){
            ctx.fillText(i+1 + ". " + standings[i], topLeftCorner[0], topLeftCorner[1] + 34*(i+1));
            if (i+1 === 10) break;
        }
    }
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
          	ctx.drawImage(img.img, ...img.XY, img.DIM[0]*img.scale, img.DIM[1]*img.scale+10*(2-i));
        }
    }

  	// draw start line if relevant
  	if (readying || -100 + cameraLoc[0] > -500 ) {
      	ctx.drawImage(defaultDrawings.startLine, -100, 880, 200, 200);
    };

  	// draw finish line if relevant
  	if (finishX) {
      	ctx.drawImage(defaultDrawings.finishLine, finishX-100, 880, 200, 200);

      	let img = defaultDrawings.stands;
      	let y = 960-img.DIM[1]*img.scale
      	//ctx.drawImage(img.img, finishX-650, y, img.DIM[0]*img.scale, img.DIM[1]*img.scale);
      	ctx.drawImage(img.img, finishX, y, img.DIM[0]*img.scale, img.DIM[1]*img.scale);

    };

  	// reset everything
  	ctx.resetTransform();
};

function drawForeground() {
  	ctx.translate(...cameraLoc);
  	ctx.globalAlpha = 1; // make foreground somewhat transparent
  	// draw foreground images
  	for (let img of foregrounds) {
      	ctx.drawImage(img.img, ...img.XY, img.DIM[0]*img.scale, img.DIM[1]*img.scale);
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

let startRace = () => {
  winner = null;
  finishX = null;
  leaderboard = [];
  standings = [];
  finishingVel = 1000;
  stopRace = false;
  readying = false;
  raceStartTime = Date.now();
  chooseRandomWord();
  prevStandingsUpdateTime = raceStartTime;
  sendMessageInChat("Race started!");
};

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
      	let message = event.data.text.toLowerCase();

      	if (readying && (message.startsWith("!join") || message.startsWith("!start"))) {
            await addRacer(event.data.displayName, event.data.displayColor)
        } else{
         	if (isModerator(event.data.badges)) {
             	if (message.startsWith("!checkracestatus")){
                  	console.log(racers);
                  	//requestAnimationFrame(updateRacers);
                } else if (message.startsWith("!showrace")){
                 	hidden = false;
                } else if (message.startsWith("!hiderace")){
                 	if (!hidden && (stopRace)){
                     	hidden = true;
                      	resetRace(); // also reset the race
                    }
                } else if (message.startsWith("!reset")) {
                  	if (stopRace){
                      resetRace();
                      sendMessageInChat("Race reset");
                    }
                }
              	if (isBroadcaster(event.data.badges) || event.data.displayName === 'pencils45') {
                 	if (message.startsWith("!setuprace")){
                     	readying = true;
                      	//sendMessageInChat("Race entries open, !join to enter");
                    } else if (message.startsWith("!go") || message.startsWith("!potato")){
                      	if (sortedRacers.length > 0){
                          //startRace();
                        }
                    } else if (event.data.text.startsWith("!resetSEStore")){
                      	resetSEStore();
                    } else {
                     	//console.log(event.data.text);
                    }
                }
            }

          	if (!readying && chosenWord){
                if (containsChosenWord(message) && message.length < 2 * chosenWord["word"].length){
                    boostRacer(event.data.displayName);
                }
            }
        }
    }
});

window.addEventListener('onWidgetLoad', async function (obj) {
  	broadcaster = obj.detail.channel.username;
  	let fieldData = obj.detail.fieldData;
  	raceDuration = fieldData.race_duration;
  	clientID = fieldData.client_id;
  	clientSecret = fieldData.client_secret;
  	jebaitedToken = fieldData.jebaited_token;
  	options.headers.Authorization = 'Bearer ' + fieldData.JWT_TOKEN;

  	loadAssets();

  	// get auth token?
  	let twitchURL = 'https://id.twitch.tv/oauth2/token';
  	fetch(twitchURL, {
      	method: "POST",
      	headers: {
         	'Content-Type': 'application/x-www-form-urlencoded'
        },
      	body: 'client_id='+clientID+"&client_secret="+clientSecret+"&grant_type=client_credentials"
    })
  	.then(res => {
      	if (res.ok){
         	return res.json();
        } else {
         	return null;
        }
    })
  	.then(data => {
      	accessToken = data.access_token;

        let url = "https://api.streamelements.com/kappa/v2/channels/" + broadcaster;
        return fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            charset: "utf-8",
            Authorization: "Bearer undefined"
          }})
    })
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

            resetBackgroundArt();

            readying = true;
            requestAnimationFrame(updateRacers);
        })
  		.then(() => {
      		if (testing && autostart){
              startRace();
              //clearTodaysWinners();
            }
    	})


});

function addBackgroundItem(layer, drawAnywhere){
  	let choice = defaultDrawings.backgrounds[layer][Math.floor(Math.random()*(defaultDrawings.backgrounds[layer].length))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
  	back.scale = choice.scale;
  	if (drawAnywhere){
      	back.XY = [-canvas.width*0.75 + Math.random()*canvas.width*2 - back.DIM[0]*back.scale,
                 	951-(2-layer)*10-back.DIM[1]*back.scale];
    } else {
      	// add item off canvas
      	back.XY = [canvas.width - cameraLoc[0] + Math.random()*canvas.width/4,
                 	951-(2-layer)*10-back.DIM[1]*back.scale];
    }

  	let overlapping = true;
  	while (overlapping){
     	overlapping = false;
      	for (let img of backgrounds[layer]){
         	if (back.XY[0] > img.XY[0] && back.XY[0] < img.XY[0]+img.DIM[0]*img.scale){
             	back.XY[0] += img.DIM[0]*img.scale;
              	overlapping = true;
              	break;
            } else if (img.XY[0] > back.XY[0] && img.XY[0] < back.XY[0]+back.DIM[0]*back.scale){
             	back.XY[0] += img.DIM[0]*img.scale;
              	overlapping = true;
              	break;
            }
        }
    }

    backgrounds[layer].push(back);
}

function addForegroundItem(drawAnywhere){
  	let choice = defaultDrawings.foregrounds[Math.floor(Math.random()*(defaultDrawings.foregrounds.length))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
  	back.scale = choice.scale;
  	if (drawAnywhere){
      	back.XY = [-canvas.width*0.75 + Math.random()*canvas.width*2 - back.DIM[0]*back.scale,
                 	1070-back.DIM[1]*back.scale];
    } else {
      	// add item off canvas
      	back.XY = [canvas.width - cameraLoc[0] + Math.random()*canvas.width/4,
                 	1070-back.DIM[1]*back.scale];
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

  	let overlapping = true;
  	while (overlapping){
     	overlapping = false;
      	for (let img of foregrounds){
         	if (back.XY[0] > img.XY[0] && back.XY[0] < img.XY[0]+img.DIM[0]*img.scale){
             	back.XY[0] += img.DIM[0]*img.scale;
              	overlapping = true;
              	break;
            } else if (img.XY[0] > back.XY[0] && img.XY[0] < back.XY[0]+back.DIM[0]*back.scale){
             	back.XY[0] += img.DIM[0]*img.scale;
              	overlapping = true;
              	break;
            }
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
        //let url = "https://api.streamelements.com/kappa/v2/channels/" + name;
        //await fetch(url, {
        //        method: "GET",
        //        headers: {
        //          Accept: "application/json",
        //          charset: "utf-8",
        //          Authorization: "Bearer undefined"
        //        }})
        //        .then(res => {
        //        //console.log(res);
        //        if (res.ok) {
        //            return res.json();
        //        } else {
        //            return null;
        //        }
        //    })

        let url = "https://api.twitch.tv/helix/users?login=" + name;
       	await fetch(url, {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  'Client-Id': clientID,
                  Authorization: "Bearer " + accessToken
                }})
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return null;
                    }
                })
            .then(data => {
                // avatar
                if (data && data.data && data.data[0] && data.data[0].profile_image_url) {
                	racer.avatar = new Image();
                    racer.avatar.src = data.data[0].profile_image_url;
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
            	console.log(err);
            })
    	} catch (err) {
        	console.log(err);
        }
	}
};

function sendMessageInChat(message) {
  	//fetch("https://api.streamelements.com/kappa/v2/bot/"+broadcasterChannelId+"/say", {
    //  method: "POST",
    //  headers: {
    //    "Accept": 'application/json; charset=utf-8',
    //    "Authorization": options["headers"]["Authorization"],
    //    "Content-Type": "application/json"
    //  },
    //  body: JSON.stringify({
    //    "message": message
    //  })
    //})
    //  .then(res => {
    //  if (res.ok) {
    //    return res.json();
    //  }
    //})
    //  .then(data => {
    //  //console.log(data)
    //})
    //  .catch(err => {
    //  console.log(err)
    //})

    const encodedMessage = encodeURIComponent(message);
  	fetch(`https://api.jebaited.net/botMsg/${jebaitedToken}/${encodedMessage}`)
};

function resetRace() {
  	winner = null;
  	finishX = null;
  	racers = ({});
	sortedRacers = [];
	leaderboard = [];
	standings = [];
	prevStandingsUpdateTime = 0;
  	raceStartTime = null;
    cameraLoc = [canvas.width*0.75, 0];
  	readying = true;
  	finishingVel = 1000;
  	stopRace = false;
  	resetBackgroundArt();
    resetRandomWord();
  	if (!isUpdatingRacers) requestAnimationFrame(updateRacers);
};

function resetBackgroundArt() {
  	backgrounds = [[],[],[]];
  	foregrounds = [];

  	// throw in random background assets
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 2-j+Math.random()*2; i++) {
        addBackgroundItem(j, true);
      }
    }

    // throw in random foreground assets
    for (let i = 0; i < 2+Math.random()*2; i++) {
      addForegroundItem(true);
    }
};

function resetSEStore() {
  	SE_API.store.set('StreamRacersLeaderboardData', {});
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
            if (!sentClue){
                sendMessageInChat("Guess the word I'm thinking of for a boost! The category is: " + chosenWord["category"]);
                sentClue = true;
            };

          	let maxXPos = 0;
          	let maxXVel = 0;
          	let finishers = [];
          	stopRace = true;
          	for (let racer of Object.values(racers)) {
              	// update
              	racer.vel[0] += (Math.random()-1/3)*racer.acc[0];
                racer.vel[1] += (Math.random()-1/3)*racer.acc[1];

              	if (racer.vel[0] < 0) { racer.vel[0] = 0; }
              	if (finishX && racer.XY[0] > finishX) {racer.vel[0] = finishingVel}

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
                }

              	if (racer.XY[0] + cameraLoc[0] < canvas.width + 8000){
                 	stopRace = false;
                }

                racer.time = curTime;
            }

          	if ((curTime - prevStandingsUpdateTime)/1000 > standingsUpdateDur){
              	standings = Object.keys(racers).sort((a,b) => {
                  	let aX = racers[a].XY[0];
                    let bX = racers[b].XY[0];
                    if (aX < bX) return 1;
                    if (aX > bX) return -1;
                    return 0;
                });
              	//console.log(standings);
              	prevStandingsUpdateTime = curTime;
            }

          	// add finishers to leaderboard
          	if (finishers.length > 0) {
              	leaderboard = leaderboard.concat(finishers.sort((a,b) => {
                    let aX = racers[a].XY[0];
                    let bX = racers[b].XY[0];
                    if (aX < bX) return 1;
                    if (aX > bX) return -1;
                    return 0;
            	}));
              	//console.log(leaderboard)
              	if (!winner) {
                    winner = leaderboard[0];
                    finishingVel = racers[winner].vel[0];
                }
            }

           // finishX + cameraLoc[0] > -500
          	let newCameraLocX = finishX ?
                Math.max(-maxXPos + 300 + (canvas.width-300-200)*Math.min(1, (curTime - raceStartTime - setupDuration*1000)/(raceDuration * 1000)),
                         canvas.width*0.5 - finishX):
                -maxXPos + 300 + (canvas.width-300-200)*(curTime - raceStartTime - setupDuration*1000)/(raceDuration * 1000);
          	let dX = newCameraLocX - cameraLoc[0];
          	cameraLoc[0] = newCameraLocX;
          	updateBackground(dX);

          	if (!finishX && (raceDuration + setupDuration) * 1000 - (curTime - raceStartTime) < 5000) {
                finishX = canvas.width - cameraLoc[0] + 5*maxXVel - 800;
            }
        }
    }

  	draw();

  	if (curTime - raceStartTime < (raceDuration + setupDuration) * 1000 || readying) {
   		requestAnimationFrame(updateRacers);
  	} else if (raceStartTime && (leaderboard.length < sortedRacers.length || !stopRace)){
      	requestAnimationFrame(updateRacers);
    } else {
      	if (!testing){
          sendMessageInChat("!addqwoin " + winner + " 5");

          SE_API.store.get('StreamRacersLeaderboardData').then(data => {
              let date = new Date();
              let day = date.getDate().toString().padStart(2,'0');
              let month = (date.getMonth() + 1).toString().padStart(2,'0');
              let year = date.getFullYear().toString();

              data[year + month + day] ||= {};
              data[year + month] ||= {};
              for (let i = 0; i < Math.min(leaderboard.length, 10); i++){
                  // daily scores
                  data[year + month + day][leaderboard[i]] ||= 0;
                  data[year + month + day][leaderboard[i]] += Math.min(leaderboard.length, 10)-i; // 3, 2, 1 points to top 3

                  // monthly scores
                  data[year + month][leaderboard[i]] ||= 0;
                  data[year + month][leaderboard[i]] += Math.min(leaderboard.length, 10)-i; // 3, 2, 1 points to top 3
              }

              SE_API.store.set('StreamRacersLeaderboardData', data);
          });
        }
      	isUpdatingRacers = false;
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
      //for (let i = 0; i < (Math.random()-1/3)*3; i++){
      	addForegroundItem();
      //}
    }
};

function clearTodaysWinners() {
	SE_API.store.get('StreamRacersLeaderboardData').then(data => {
      let date = new Date();
      let day = date.getDate().toString().padStart(2,'0');
      let month = (date.getMonth() + 1).toString().padStart(2,'0');
      let year = date.getFullYear().toString();

      data[year + month + day] ||= {};
      data[year + month] ||= {};
      for (let [name, points] of Object.entries(data[year + month + day])){
         // remove all points from today
       	 data[year + month][name] -= points;
      }
      data[year + month + day] = {};

      SE_API.store.set('StreamRacersLeaderboardData', data);
    });
};
