
import CarManager from "./CarManager";
import TrackManager from "./TrackManager";

const carManager = new CarManager();
const trackManager = new TrackManager();

let canvas = document.createElement("canvas");
canvas.width = 1920;
canvas.height = 1080;
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");

let track = trackManager.currentTrack()

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cameraLoc = [0, 0]
    track.drawBackground(ctx, cameraLoc, ctx.canvas.width, ctx.canvas.height)
    carManager.draw(ctx, cameraLoc, track.racingLine)
    track.drawForeground(ctx, cameraLoc, ctx.canvas.width, null)

    requestAnimationFrame(gameLoop)
}

gameLoop();

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
                          startRace();
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
