let testing = false;
let autostart = false;
let addGreenScreen = false;
let useBoostWord = false; 
let useFallingEmotes = true;
let forceAndyInRace = true;
let AndyCars = [];
let andyCar = 9;
let andyCarNumber = 9;
let andyRotateCar = false;
let andyCarUpdateTime = 5000;
let andyNoInLeaderboard = true; 

let readying; // if true, we are waiting for the race to start
let broadcaster = "";
let broadcasterChannelId = "";
let raceStartTime; // time in ms
let setupDuration = 5;
let raceDuration = 30;
let totalRoadHeight = 95;
let boostCooldown = 10; // time in seconds
let winner;
let finishX;
let trackType;
let activateHoles = true;
let fieldData;
let widthRace = 1920;
let paddingRace = 1920;
var imgDrops;
var x = 0;
var y = 0;
var noOfDrops = 0; // number of drops to fall
var fallingDrops = []; // array of drops to fall
let emotes = {}; // emotes to fall
let limitDrops = 100; // limit the number of drops to fall

let canvasColoredCar = document.createElement("canvas");
let imgColoredCar = document.createElement("img");
let coloredCar = {};

let dayBoard = [];
let monthBoard = [];
let IMAGES_BASE64 = {};
let holePositions = []; 
let casques = [];
var tails = [];
var tailVersion = true;
let randomViewer = "";
setImages();

let testRacers = [];
if (testing) {
    testRacers = [
        "AndyTheFrenchy", 
        //"Bjorn_Jordson", 
        // "COREYTOWNZ", 
        // "SeiKen_DMs",
        // "ThunderP00P",
        // "Drhahn_qc",
        // "Polorbaer" ,
        // "KnuthingIsReal", 
        //"NowImABeliever", 
        //"pencils45",
        // "TheSolid7",
        "DarkPanther9999",
         "EnigmaticGnu",
         "MermaidUnicorn",
        // "albinounounou",  "CafeSparrow",
        // "thesolid7", "MatMan2855", "Asixel", 
        // "jtbeaman"
        // , "ndlme",
         //"SpiderSaucisse",
        //  "THORpine",
        //  "apocalypse_squirrel",
        //  "Asixel",
        // "Verth987",
        // "LadyGrimoireQc",
        // "eluane23",
        // "Oreillepurulente", 
        //"looptydude",
        // "WeeZ51626",
        // "OmegaPrimal",
        // "mermaidroadie",
        //"MarcValley",
       // "GurtDontCare",
        
       /* "Verth987",*/
        //"neiluj04", "thecomplements",  "pyobum", "yoshi2084", "AndyTheFrenchy", 
        /*"kungfuskull", "RonTheFlyingDutchman" ,
     "Michael_249", "looptydude", "GurtDontCare", "bernardguitare", "Drhahn_qc", "GabDeNowel",
     "Oreillepurulente",  "MisterJBay", "cob4_le_hibou", "Sthellae", "kheelauld", "technofist", "Fitzooouu",
     "lechalet_gang", "kakashissjblue", "k_merax",
     "jewelshadows", "hibouyave", "BunjiroSama", "vMAYURA", "ayanafd", "Ivzern", "SSKriiKz", "numerosixx", "Callisto1707", "Gon66600", */
    //  "Zell_mt", "WhereISMrRager", "celestialtwitching",
    //  "fastdontlie", 
    //  "pim211"
    ];

    //addTodaysLeaderboardToRace();

    //addMonthLeaderboardToRace();
}

let defaultDrawings = {};
let racers = ({});
let racersBackup = ({});
let racerAndy = ({});
let canvas = document.getElementById("maincanvas");
let ctx = canvas.getContext("2d");
let cameraLocPos = 0.75;
let cameraLocOffset = 1200;
let cameraLoc = [canvas.width * cameraLocPos, 0];
let backgrounds = [[], [], []];
let foregrounds = [];
let holes = [];
let sortedRacers = []; 
let leaderboard = [];
let standings = [];
let prevStandingsUpdateTime = 0;
let standingsUpdateDur = 0.5; // time in seconds between live standings updates
let stopRace = false;
let isUpdatingRacers = true;
let finishingVel = 1000;
let hidden = false;
let customDefaultCar = 'Rainbow'; 
let whatIsThat = 'All';

let fallingParts = [];
const GRAVITY = 0.5;
const BOUNCE_FACTOR = 0.6;
const GROUND_Y = 1080 - 25;

let clientID, clientSecret, accessToken, jebaitedToken;

let backupButton = document.getElementById("startbutton")
backupButton.addEventListener("click", function () {
    console.log('click start detected')
    if (sortedRacers.length > 0) {
        startRace();
    }
});

let wordBank = {
    "food": ["pizza", "chocolate", "sushi", "ice cream", "burger", "pasta", "salad", "potato", "taco", "steak", "papaya", "cake", "popcorn", "pancake", "sandwich", "cheese", "fruit", "cookie", "ramen", "grilled cheese"],
    "video game titles": ["Zelda", "Mario", "Fortnite", "Minecraft", "Call of Duty", "Overwatch", "Assassin's Creed", "Grand Theft Auto", "FIFA", "World of Warcraft", "Destiny", "Halo", "Dota", "League of Legends", "Final Fantasy", "Skyrim", "Rocket League", "Mortal Kombat", "Witcher", "Splatoon"],
    "music genre": ["rock", "pop", "hip hop", "jazz", "classical", "country", "rap", "blues", "reggae", "electronic", "indie", "folk", "punk", "metal", "soul", "R&B", "dance", "alternative", "latin", "world"],
    "disney character": ["Mickey Mouse", "Cinderella", "Simba", "Mufasa", "Aladdin", "Mulan", "Woody", "Elsa", "Donald Duck", "Moana", "Belle", "Beast", "Pocahontas", "Goofy", "Ariel", "Dumbo", "Snow White", "Peter Pan"],
    "musical instruments": ["guitar", "piano", "violin", "trumpet", "drum", "flute", "saxophone", "clarinet", "bass", "cello", "trombone", "ukulele", "accordion", "harmonica", "banjo", "bagpipe", "harp", "mandolin", "piano matt", "stella"],
    "french verbs": ["aller", "avoir", "faire", "pouvoir", "vouloir", "dire", "savoir", "voir", "venir", "devoir", "prendre", "mettre", "aimer", "parler", "manger", "boire", "travailler", "partir", "habiter"],
    "colors": ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "gray", "brown", "teal", "maroon", "navy", "lavender", "turquoise", "gold", "silver", "indigo", "crimson"],
    "animals": ["dog", "cat", "elephant", "lion", "tiger", "giraffe", "zebra", "monkey", "bear", "fox", "rabbit", "deer", "horse", "cow", "sheep", "goat", "pig", "chicken", "duck", "fish"],
    "drinks": ["water", "coffee", "tea", "juice", "soda", "smoothie", "milk", "wine", "beer", "cocktail", "lemonade", "iced tea", "hot chocolate", "red bull", "chai", "sake", "whiskey", "vodka", "rum", "gin"],
    "clothes": ["shirt", "pants", "dress", "skirt", "jacket", "sweater", "coat", "blouse", "tie", "scarf", "hat", "gloves", "socks", "shoes", "boots", "sandals", "oodie", "jeans", "trousers", "belt"],
    "fruits": ["apple", "banana", "orange", "strawberry", "grape", "watermelon", "kiwi", "pineapple", "peach", "pear", "plum", "cherry", "mango", "blueberry", "raspberry", "blackberry", "lemon", "lime", "coconut", "dragonfruit"],
    "something green": ["grass", "tree", "leaf", "lime", "cucumber", "broccoli", "avocado", "pickle", "pea", "lettuce", "spinach", "cabbage", "emerald", "lime", "zucchini", "pepper", "seaweed", "mint"],
    "furniture": ["chair", "table", "sofa", "bed", "desk", "dresser", "couch", "bookshelf", "wardrobe", "ottoman", "nightstand", "cabinet", "armchair", "bench", "stool", "futon", "recliner"]
};
let chosenWord = null;
let sentClue = false;
let foundWord = false;

let IMAGES;

function loadScriptSynchronously() {
    const token = '';
    const owner = 'RandomCodingForYou';
    const repo = 'Race-Widget-Images';
    const path = 'images.js';

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    //console.log(url)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // Synchronous XMLHttpRequest
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3.raw');
    xhr.send();


    if (xhr.status === 200) {
       // console.log(xhr.responseText)
        eval(xhr.responseText); // Execute the script content
        IMAGES = IMAGES_IMPORTED;
        console.log('Script loaded and executed successfully');
    } else {
        console.error('Error loading or executing script:', xhr.status);
    }
}
//loadScriptSynchronously();

//console.log("Images loaded:", IMAGES);
let chooseRandomWord = () => {
    if (!foundWord) { // havent figured out the word yet
        if (chosenWord && Date.now() - chosenWord.time > 12 * 60 * 60 * 1000) { // have a word & expired
            chooseNewWord();
        } else {
            SE_API.store.get('boostWord').then(data => {
                if (data && Date.now() - data.time < 12 * 60 * 60 * 1000 && !data.found) { // if word exists and is still valid,
                    chosenWord = data;
                    console.log(chosenWord);
                } else {
                    chooseNewWord();
                }
            }).catch(() => {
                chooseNewWord();
            });
        }
    } else {
        chooseNewWord();
    }
};

let chooseNewWord = () => {
    let allkeys = Object.keys(wordBank);
    let randKey = allkeys[Math.floor((Math.random() * allkeys.length))];
    let allWords = wordBank[randKey];
    let randWord = allWords[Math.floor((Math.random() * allWords.length))];
    chosenWord = { "word": randWord.toLowerCase(), "category": randKey, "time": Date.now(), "found": false };
    foundWord = false;
    SE_API.store.set('boostWord', chosenWord);
    console.log(chosenWord)
};

let resetRandomWord = () => {
    chosenWord = null;
    sentClue = false;
};

function containsChosenWord(input) {
    if (!chosenWord) return false;
    return input.toLowerCase().includes(chosenWord["word"]);
};

let customRacers = {};

function boostRacer(racerName) {
    let racer = racers[racerName];
    if (racer) {
        if (!foundWord) {
            foundWord = true;
            chosenWord.found = true;
            setTimeout(() => sendMessageInChat("OUI! " + racerName + " FOUND IT!"), 1000);
            SE_API.store.set('boostWord', chosenWord);
        }
        if (!racer.lastBoost || (racer.lastBoost && Date.now() - racer.lastBoost > (boostCooldown * 1000))) {
            // racer.vel[0] *= 1.2;
            racer.lastBoost = Date.now();
            racer.showBoost = true;
            setTimeout(() => {
                racer.showBoost = false;
            }, 2000);
        };
    };
};

function getImage(imageName) {
    return Object.assign(new Image(), { src: imageName });
}

async function loadAssets() {
    const drawingNames = ['vehicle', 'boost', 'wheel1', 'wheel2', 'avatar', 'startLine', 'finishLine'];
    drawingNames.forEach(name => {
        defaultDrawings[name] = getImage(IMAGES_BASE64.assets[`defaultDrawings_${name}`]);
    });
    defaultDrawings.backgrounds = [[], [], []];
    defaultDrawings.foregrounds = [];
    defaultDrawings.holes =[];
    switch (trackType) {
        case "winter":
            const imagesWinter = [
                { name: 'bisbi', scale: 1 / 3, background: [2] },
                { name: 'car_crash', scale: 1 / 3, background: [2] },
                { name: 'champion', scale: 1 / 3, background: [2] },
                { name: 'charly', scale: 1 / 3, background: [2] },
                { name: 'christmas_tree', scales: [1 / 2, 1 / 3, 1 / 4], background: [0, 1, 2] },
                { name: 'finn', scale: 1 / 3, background: [2] },
                { name: 'fort', scale: 1 / 2, background: [0] },
                { name: 'gnu', scale: 1 / 3, background: [2] },
                { name: 'hockey', scale: 1 / 3, background: [2] },
                { name: 'ice_fishing', scale: 1 / 3, background: [2] },
                { name: 'large_tree', scales: [1 / 2, 1 / 3, 1 / 4], background: [0, 1, 2] },
                { name: 'mountains', scale: 1 / 2, DIM: [800, 500], background: [0] },
                { name: 'noot_img', scale: 1 / 3, background: [2] },
                { name: 'papakaboom_img', scale: 1 / 2, background: [2] },
                { name: 'skidoo_img', scale: 1 / 4, background: [2] },
                { name: 'small_tree_img', scale: 1 / 4, background: [2] },
                { name: 'thorpine_img', scale: 1 / 4, background: [2] },
                { name: 'snow_bank_img', scale: 1 / 2, background: [2] },
                { name: 'snow_pile_1_img', scale: 1 / 4, background: [2], foreground: true },
                { name: 'snow_pile_2_img', scale: 1 / 4, background: [2], foreground: true },
                { name: 'snow_pile_3_img', scales: [1 / 2, 1 / 3, 1 / 4], background: [0, 1, 2], foreground: true },
                { name: 'snow_pile_4_img', scale: 1 / 4, background: [2], foreground: true },
                { name: 'snow_pile_5_img', scale: 1 / 2, background: [2], foreground: true },
                { name: 'snowstorm_img', scales: [1 / 2, 1 / 2, 1 / 2], background: [0, 1, 2] },
                { name: 'tennant_img', scale: 1 / 3, background: [2] }
            ];
            imagesWinter.forEach(image => {
                const img = getImage(IMAGES_BASE64.assets[image.name]);
                const DIM = image.DIM || [500, 500];
                if (image.scales) {
                    image.scales.forEach((scale, index) => {
                        defaultDrawings.backgrounds[index].push({ img, DIM, scale });
                        if (image.foreground) {
                            defaultDrawings.foregrounds.push({ img, DIM, scale });
                        }
                    });
                } else {
                    defaultDrawings.backgrounds[image.background[0]].push({ img, DIM, scale: image.scale });
                    if (image.foreground) {
                        defaultDrawings.foregrounds.push({ img, DIM, scale: image.scale });
                    }
                }
            });
            let stands = { img: getImage(IMAGES_BASE64.assets.stands_img), DIM: [1100, 800], scale: 1 / 1.75 };
            defaultDrawings.stands = stands;
            let wicked = { img: getImage(IMAGES_BASE64.assets.wicked), DIM: [559, 447], scale: 1, wicked: true };
            defaultDrawings.wicked = wicked;
            let snowpiles_background = { img: getImage(IMAGES_BASE64.assets.snowpiles_background_img), DIM: [widthRace, 1080], scale: 1 };
            defaultDrawings.snowpiles_background = snowpiles_background;
            let snowpiles_foreground = { img: getImage(IMAGES_BASE64.assets.snowpiles_foreground_img), DIM: [widthRace, 1080], scale: 1 };
            defaultDrawings.snowpiles_foreground = snowpiles_foreground;
            let yellow_lines = { img: getImage(IMAGES_BASE64.assets.yellow_lines_img), DIM: [widthRace, 1080], scale: 1 };
            defaultDrawings.yellow_lines = yellow_lines;
            break;
        case "secret":
            let fruitcakeRoad = { img: getImage(IMAGES_BASE64.Fruitcaketrack.Road), DIM: [628, 164], scale: 1 }
            defaultDrawings.fruitcakeRoad = fruitcakeRoad;
            const cherry = getImage(IMAGES_BASE64.Fruitcaketrack.Cherry);
            const KendraLyssa = getImage(IMAGES_BASE64.Fruitcaketrack.KendraLyssa);
            const imagesDefault2 = [
                { img: cherry, DIM: [48, 48], scale: 4, background: 0, foreground: true },
                { img: cherry, DIM: [48, 48], scale: 3, background: 1, foreground: true },
                { img: cherry, DIM: [48, 48], scale: 2.85, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.assets.stands_img), DIM: [1100, 800], scale: 1 / 1.75, stands: true },
                { img: getImage(IMAGES_BASE64.assets.wicked), DIM: [559, 447], scale: 1, wicked: true },
                { img: getImage(IMAGES_BASE64.Fruitcaketrack.Bow), DIM: [200, 94], scale: 2, background: 0 },
                { img: getImage(IMAGES_BASE64.Fruitcaketrack.Thour), DIM: [200, 200], scale: 1, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.Fruitcaketrack.cake1), DIM: [150, 150], scale: 1, background: 2, foreground: true},
                { img: KendraLyssa, DIM: [319, 261], scale: 1, background: 0, foreground: true },
                { img: KendraLyssa, DIM: [319, 261], scale: 1/2, background: 1, foreground: true },
                { img: KendraLyssa, DIM: [319, 261], scale: 1/3, background: 2, foreground: true }
            ];
            imagesDefault2.forEach((image, index) => {
                //console.log('Current index:', index);
                if (image.background !== undefined) {
                    defaultDrawings.backgrounds[image.background].push(image);
                }
                if (image.foreground) {
                    defaultDrawings.foregrounds.push(image);
                }
                if (image.stands) {
                    defaultDrawings.stands = image;
                }
                if (image.wicked) {
                    defaultDrawings.wicked = image;
                }
            });
            break;
        case "montreal":
            const imagesMontreal = [
                { name: 'cone1', DIM: [223, 197], scales: [1/2, 1/3], background: [1, 2], foreground: true },
                { name: 'cone2', DIM: [126, 257], scales: [1/2, 1/3], background: [1, 2], foreground: true },
                { name: 'cone3', DIM: [78, 252], scales: [1, 1/2], background: [1, 2], foreground: true },
                { name: 'panneau', DIM: [135, 202], scales: [1/2, 1/3], background: [1, 2], foreground: true },
                { name: 'tree1_img', scales: [1/2, 1/3, 1/4], background: [0, 1, 2] },
                { name: 'tree2_img', scales: [1/2, 1/3, 1/4], background: [0, 1, 2] },
                { name: 'bush_img', scales: [1/4, 1/5], background: [1, 2], foreground: true },
                { name: 'appleTree_img', scales: [1/2.5], background: [1, 2] },
                { name: 'rock_img', scale: 1/5, background: [2], foreground: true },
                { name: 'mall_img', scale: 1/3, background: [2] },
                { name: 'barbies_img', scale: 1/1.5, background: [2] },
                { name: 'sign_img', scale: 1/3, background: [2] },
                { name: 'mountain_img', scale: 1/2, background: [0] },
                { name: 'hole1', DIM: [81, 49], scales: [1, 1/2], onRoad: true },
                { name: 'hole2', DIM: [99, 43], scales: [1, 1/2], onRoad: true },
                { name: 'hole3', DIM: [121, 62], scales: [1, 1/2], onRoad: true },
                { name: 'hole4', DIM: [87, 49], scales: [1, 1/2], onRoad: true },
                { name: 'hole5', DIM: [197, 35], scales: [1, 1/2], onRoad: true },
                { name: 'hole6', DIM: [206, 48], scales: [1, 1/2], onRoad: true },
                { name: 'hole7', DIM: [99, 65], scales: [1, 1/2], onRoad: true }
            ];
            let ration = totalRoadHeight / 192;
            let montrealRoad = { img: getImage(IMAGES_BASE64.assets.motrealRoad), DIM: [960, 192], scale: 1 };
            defaultDrawings.montrealRoad = montrealRoad;

            imagesMontreal.forEach(image => {
                const img = getImage(IMAGES_BASE64.assets[image.name]);
                const DIM = image.DIM || [500, 500];
                if (image.scales) {
                    image.scales.forEach((scale, index) => {
                        if (image.onRoad) {
                            let roadY = 1080 - 25 - totalRoadHeight + Math.random() * (totalRoadHeight - DIM[1] * scale);
                            let roadX = Math.random() * widthRace * 3;
                                defaultDrawings.holes.push( { img, DIM, scale, XY: [roadX, roadY] });
                        } else {
                            defaultDrawings.backgrounds[index].push({ img, DIM, scale });
                            if (image.foreground) {
                                defaultDrawings.foregrounds.push({ img, DIM, scale });
                            }
                        }
                    });
                } else {
                    defaultDrawings.backgrounds[image.background[0]].push({ img, DIM, scale: image.scale });
                    if (image.foreground) {
                        defaultDrawings.foregrounds.push({ img, DIM, scale: image.scale });
                    }
                    if (image.onRoad) {
                        defaultDrawings.holes.push( { img, DIM, scale});
                    }
                }
            });

            let stands2 = { img: getImage(IMAGES_BASE64.assets.stands_img), DIM: [1100, 800], scale: 1/1.75 };
            defaultDrawings.stands = stands2;
            let wicked2 = { img: getImage(IMAGES_BASE64.assets.wicked), DIM: [559, 447], scale: 1, wicked: true };
            defaultDrawings.wicked = wicked2;
            break;
        default:
            const imagesDefault = [
                { img: getImage(IMAGES_BASE64.assets.mountain_img), DIM: [800, 500], scale: 1 / 2, background: 0 },
                { img: getImage(IMAGES_BASE64.assets.clouds_img), DIM: [564, 516], scale: 1 / 3, background: 0 },
                { img: getImage(IMAGES_BASE64.assets.fan_img), DIM: [628, 728], scale: 1 / 3, background: 0 },
                { img: getImage(IMAGES_BASE64.assets.sign_img), DIM: [1100, 800], scale: 1 / 3, background: 2 },
                { img: getImage(IMAGES_BASE64.assets.barbies_img), DIM: [800, 500], scale: 1 / 1.5, background: 2 },
                { img: getImage(IMAGES_BASE64.assets.tree1_img), DIM: [500, 500], scale: 1 / 2, background: 0 },
                { img: getImage(IMAGES_BASE64.assets.tree1_img), DIM: [500, 500], scale: 1 / 2.3, background: 1 },
                { img: getImage(IMAGES_BASE64.assets.tree1_img), DIM: [500, 500], scale: 1 / 2.6, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.assets.tree2_img), DIM: [500, 500], scale: 1 / 2.3, background: 1 },
                { img: getImage(IMAGES_BASE64.assets.tree2_img), DIM: [500, 500], scale: 1 / 2.6, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.assets.bush_img), DIM: [500, 500], scale: 1 / 4, background: 1 },
                { img: getImage(IMAGES_BASE64.assets.bush_img), DIM: [500, 500], scale: 1 / 5, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.assets.rock_img), DIM: [500, 500], scale: 1 / 5, background: 2, foreground: true },
                { img: getImage(IMAGES_BASE64.assets.appleTree_img), DIM: [500, 500], scale: 1 / 2.5, background: 1 },
                { img: getImage(IMAGES_BASE64.assets.appleTree_img), DIM: [500, 500], scale: 1 / 2.5, background: 2 },
                { img: getImage(IMAGES_BASE64.assets.rainbow_img), DIM: [500, 500], scale: 1, background: 0 },
                { img: getImage(IMAGES_BASE64.assets.mall_img), DIM: [1440, 810], scale: 1 / 3, background: 2 },
                { img: getImage(IMAGES_BASE64.assets.stands_img), DIM: [1100, 800], scale: 1 / 1.75, stands: true },
                { img: getImage(IMAGES_BASE64.assets.wicked), DIM: [559, 447], scale: 1, wicked: true }
            ];
            imagesDefault.forEach(image => {
                if (image.background !== undefined) {
                    defaultDrawings.backgrounds[image.background].push(image);
                }
                if (image.foreground) {
                    defaultDrawings.foregrounds.push(image);
                }
                if (image.stands) {
                    defaultDrawings.stands = image;
                }
                if (image.wicked) {
                    defaultDrawings.wicked = image;
                }
            });
            break;
    }
};

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer'
    }
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (addGreenScreen) {
        ctx.fillStyle = "rgb(191, 64, 191)"
        ctx.fillRect(0, 0, widthRace, 1080)
        ctx.z
    }

    if (!hidden) {
        displayWinner();
        drawBackground();
        drawHoles();
        drawRacers();
        if (trackType === "montreal") {
            drawFallingParts();
        }
        if (trackType === "secret") noOfDrops = 50;
        //drawRain();
        drawForeground();
    }
};

function displayWinner() {
    ctx.font = "32px Oswald";
    ctx.letterSpacing = "1.5px";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    let topLeftCorner = [1450, 360];

    // draw black box
    if (standings.length) {
        ctx.fillStyle = "rgba(0,0,0,1.0)";
        ctx.beginPath();
        ctx.roundRect(topLeftCorner[0] - 25, topLeftCorner[1] - 42, 480, 400, 30)
        ctx.fill();
        ctx.closePath();
    }

    ctx.fillStyle = "white";

    if (winner) {
        // show standings
        ctx.textAlign = "left";
        ctx.fillText("Leaderboard", ...topLeftCorner);
        for (let i = 0; i < standings.length; i++) {
            if (leaderboard.length <= i) ctx.fillText(i + 1 + ". " + standings[i], topLeftCorner[0], topLeftCorner[1] + 34 * (i + 1));
            if (i + 1 === 10) break;
        }

        // show leaderboard
        ctx.fillStyle = "cyan";
        ctx.textAlign = "left";
        for (let i = 0; i < leaderboard.length; i++) {
            ctx.fillText(i + 1 + ". " + leaderboard[i], topLeftCorner[0], topLeftCorner[1] + 34 * (i + 1));
            if (i + 1 === 10) break;
        }
        ctx.resetTransform();
    } else {
        // show standings
        ctx.textAlign = "left";
        if (standings.length) ctx.fillText("Leaderboard", topLeftCorner[0], topLeftCorner[1]);
        for (let i = 0; i < standings.length; i++) {
            ctx.fillText(i + 1 + ". " + standings[i], topLeftCorner[0], topLeftCorner[1] + 34 * (i + 1));
            if (i + 1 === 10) break;
        }
    }
};

function drawBackground() {
    // draw road
    let numDiv = 10;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.rect(0, 1080 - 25 - totalRoadHeight * (numDiv + 1) / numDiv, widthRace, totalRoadHeight + totalRoadHeight * 2 / numDiv);
    ctx.fill();
    ctx.closePath();

    switch (trackType) {
        case "winter":
            // winter track
            ctx.fillStyle = "#B8B8B8";
            ctx.beginPath();
            ctx.rect(0, 1080 - 25 - totalRoadHeight - 10 * (numDiv + 1) / numDiv, widthRace, totalRoadHeight + 10 + totalRoadHeight * 2 / numDiv);
            ctx.fill();
            ctx.closePath();

            let imgs = [defaultDrawings.yellow_lines];
            for (let img of imgs) {
                if (img.img.complete && img.img.naturalWidth) {
                    drawToCanvas(ctx, img.img, -widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
                    drawToCanvas(ctx, img.img, cameraLoc[0] % widthRace, 0, widthRace, 1080);
                    drawToCanvas(ctx, img.img, widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
                }
            }
            break;
        case "secret":
            // secret track
            let imgs2 = [defaultDrawings.fruitcakeRoad];
            const decal = 628;
            for (let img of imgs2) {
                if (img.img.complete && img.img.naturalWidth) {
                    drawToCanvas(ctx, img.img, -decal + cameraLoc[0] % decal, 1080 - 164, 628, 164);
                    drawToCanvas(ctx, img.img, cameraLoc[0] % decal, 1080 - 164, 628, 164);
                    drawToCanvas(ctx, img.img, decal + cameraLoc[0] % decal, 1080 - 164, 628, 164);
                    drawToCanvas(ctx, img.img, 2 * decal + cameraLoc[0] % decal, 1080 - 164, 628, 164);
                    drawToCanvas(ctx, img.img, 3 * decal + cameraLoc[0] % decal, 1080 - 164, 628, 164);
                }
            }
            break;
        case "montreal":
            let ration = 164 / 192;
            const decal2 = 960 * ration;
            const decal3 = 192 * ration;
            let imgs3 = [defaultDrawings.montrealRoad];
            for (let img of imgs3) {
                if (img.img.complete && img.img.naturalWidth) {
                    drawToCanvas(ctx, img.img, -decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, 2 * decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, 3 * decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, 4 * decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                    drawToCanvas(ctx, img.img, 5 * decal2 + cameraLoc[0] % decal2, 1080 - decal3, decal2, decal3);
                }
            }

            // Dessiner les nids-de-poule
            // for (let hole of holePositions) {
            //     if (hole.img.complete && hole.img.naturalWidth) {
            //         let adjustedX = [hole.XY[0] - cameraLoc[0]];
            //         if(adjustedX > -hole.DIM[0] && adjustedX < widthRace) {
            //             drawToCanvas(ctx, hole.img, adjustedX, hole.XY[1], hole.DIM[0] * hole.scale, hole.DIM[1] * hole.scale);
            //         }
            //     }
            // }   
            break;
        default:
            // rainbow track
            for (let i = 0; i < numDiv; i++) {
                ctx.fillStyle = "hsl(" + Math.floor((i * 360 / numDiv)).toString() + ",100%,50%)";
                ctx.strokeStyle = "hsl(" + Math.floor((i * 360 / numDiv)).toString() + ",100%,50%)";
                
                ctx.fillRect(0, 1080 - 25 - totalRoadHeight * (numDiv - i) / numDiv, widthRace, totalRoadHeight / numDiv);
                ctx.strokeRect(0, 1080 - 25 - totalRoadHeight * (numDiv - i) / numDiv, widthRace, totalRoadHeight / numDiv);
            }
            break;
    }

    ctx.translate(...cameraLoc);

    // draw background images, images further back are slightly larger
    for (let i = 0; i < backgrounds.length; i++) {
        if (i === 2 && trackType === "winter") {
            ctx.resetTransform();
            let imgs = [defaultDrawings.snowpiles_background];
            for (let img of imgs) {
                if (img.img.complete && img.img.naturalWidth) {
                    drawToCanvas(ctx, img.img, -widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
                    drawToCanvas(ctx, img.img, cameraLoc[0] % widthRace, 0, widthRace, 1080);
                    drawToCanvas(ctx, img.img, widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
                }
            }
            ctx.translate(...cameraLoc);
        }
        let arr = backgrounds[i]
        for (let img of arr) {
            if (img.img.complete && img.img.naturalWidth) {
                drawToCanvas(ctx, img.img, ...img.XY, img.DIM[0] * img.scale, img.DIM[1] * img.scale + 10 * (2 - i));
            }
        }
    }

    // draw start line if relevant
    if (readying || -100 + cameraLoc[0] > -500) {
        if (defaultDrawings.startLine.complete && defaultDrawings.startLine.naturalWidth) {
            drawToCanvas(ctx, defaultDrawings.startLine, -100, 880, 200, 200);
        }
    };
                // draw finish line if relevant
    if (finishX) {
        if (defaultDrawings.finishLine.complete && defaultDrawings.finishLine.naturalWidth) {
            drawToCanvas(ctx, defaultDrawings.finishLine, finishX - 100, 880, 200, 200);

            let img = defaultDrawings.stands;
            let y = 960 - img.DIM[1] * img.scale
            
            let imgWicked = defaultDrawings.wicked;
            if (imgWicked.img.complete && imgWicked.img.naturalWidth) {
                drawToCanvas(ctx, imgWicked.img, finishX + 20, 220, imgWicked.DIM[0] * imgWicked.scale, imgWicked.DIM[1] * imgWicked.scale);
            }

            //ctx.drawImage(img.img, finishX-650, y, img.DIM[0]*img.scale, img.DIM[1]*img.scale);
            if (img.img.complete && img.img.naturalWidth) {
                drawToCanvas(ctx, img.img, finishX, y, img.DIM[0] * img.scale, img.DIM[1] * img.scale);
            }
        }
    };

    // reset everything
    ctx.resetTransform();
};

function drawHoles() {
    if (trackType === "montreal") {        
        ctx.translate(...cameraLoc);
        ctx.globalAlpha = 1; // make foreground somewhat transparent
        // draw foreground images
        for (let img of holes) {
            if (img.img.complete && img.img.naturalWidth) {
                drawToCanvas(ctx, img.img, ...img.XY, img.DIM[0] * img.scale, img.DIM[1] * img.scale);
            }
        }

        // reset everything
        ctx.resetTransform();
        ctx.globalAlpha = 1;
    }
}

function drawForeground() {
    if (trackType === "winter") {
        let imgs = [defaultDrawings.snowpiles_foreground];
        for (let img of imgs) {
            if (img.img.complete && img.img.naturalWidth) {
                drawToCanvas(ctx, img.img, -widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
                drawToCanvas(ctx, img.img, cameraLoc[0] % widthRace, 0, widthRace, 1080);
                drawToCanvas(ctx, img.img, widthRace + cameraLoc[0] % widthRace, 0, widthRace, 1080);
            }
        }
    }
    ctx.translate(...cameraLoc);
    ctx.globalAlpha = 1; // make foreground somewhat transparent
    // draw foreground images
    for (let img of foregrounds) {
        if (img.img.complete && img.img.naturalWidth) {
            drawToCanvas(ctx, img.img, ...img.XY, img.DIM[0] * img.scale, img.DIM[1] * img.scale);
        }
    }

    // reset everything
    ctx.resetTransform();
    ctx.globalAlpha = 1;
};

function drawRacers() {
    if (andyNoInLeaderboard) {
        drawRacer("AndyTheFrenchy");
    }

    for (let name of sortedRacers) {
        drawRacer(name);
    }
}

function drawRacer(name) {
    racer = racers[name];

    // translate by camera
    if (racer) {
        ctx.translate(...cameraLoc);

        // translate to actual XY position of racer
        if (racer.XY) {
            ctx.translate(...racer.XY);
            ctx.translate((racer.XY[1] - (1070 - totalRoadHeight / 2)), 0);
        }

        if(name != 'THORpine'){
        // draw avatar in a circle
            ctx.save()
            ctx.beginPath()
            ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
            
            ctx.clip()
            drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
            ctx.closePath();
            ctx.restore();
        }
        //drawWhatIsThatCustomCar(racer);

        // draw vehicle
        ctx.fillStyle = "blue";
        if (racer.vehicle) {
            if (racer.customDraw) {
                racer.customDraw();
            } else {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);  // rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR);
                ctx.rotate(racer.wheel2Theta);
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
            }
        }

        if(racer.whatIsThat == 'Country'){
            drawWhatIsThatCustomCarCountry(racer);
        }
        
        drawWhatIsThatCustomCar(racer);

        // reset before drawing next
        ctx.resetTransform();
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
    if (useBoostWord) chooseRandomWord();
    prevStandingsUpdateTime = raceStartTime;
    sendMessageInChat("Race started!");
};

function drawWhatIsThatCustomCar(racer) {
    switch (racer.whatIsThat) {
        case 'All':
            racer.whatIsThatTL = [racer.avatarTL[0] -50, racer.avatarTL[1] - 50];
            drawToCanvas(ctx, racer.casque, ...racer.avatarTL, ...racer.avatarDIM);
            break;
        case 'Classical':
            racer.whatIsThatTL = [racer.avatarTL[0] -50, racer.avatarTL[1] - 50];
            drawToCanvas(ctx, racer.casque, ...racer.whatIsThatTL, 180, 180);
            break;
        case 'Rock':
            racer.whatIsThatTL = [racer.avatarTL[0] -20, racer.avatarTL[1] - 20];
            drawToCanvas(ctx, racer.casque, ...racer.whatIsThatTL, 120, 120);
            break;
        // default:
        //     racer.whatIsThatTL = [racer.avatarTL[0] - 100, racer.avatarTL[1] - 105];
        //     drawToCanvas(ctx, racer.casque, ...racer.whatIsThatTL, 278, 279);
        //     break;
    }
}
function drawWhatIsThatCustomCarCountry(racer) {
    racer.whatIsThatTL = [racer.avatarTL[0] -50, racer.avatarTL[1] - 50]
    drawToCanvas(ctx, racer.casque, ...racer.whatIsThatTL, 160, 160);
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
        let message = event.data.text.toLowerCase();

        // if race is started, we can use falling emotes
        if (!readying && useFallingEmotes) {
            let mots = message.split(" ");
            let count = 0;
            for (let mot of mots) {
                if (count >= 5) break;
                if (emotes[mot]) {
                    if (fallingDrops.length < limitDrops) drawEmoticons(mot);
                    count++;
                }
            }
        }

        if (readying && (message.startsWith("!join") || message.startsWith("!start") || message.startsWith("andytherace"))) {
            await addRacer(event.data.displayName, event.data.displayColor)
        } else {
            if (isModerator(event.data.badges)) {
                if (message.startsWith("!checkracestatus")) {
                    //console.log(racers);
                    //requestAnimationFrame(updateRacers);
                } else if (message.startsWith("!showrace")) {
                    hidden = false;
                } else if (message.startsWith("!hiderace")) {
                    if (!hidden && (stopRace)) {
                        hidden = true;
                        resetRace(); // also reset the race
                    }
                } else if (message.startsWith("!resetrace")) {
                    if (stopRace) {
                        resetRace();
                        sendMessageInChat("Race reset");
                    }
                }

                if (isBroadcaster(event.data.badges) || event.data.displayName === 'pencils45') {
                    if (message.startsWith("!setuprace")) {
                        readying = true;
                        //sendMessageInChat("Race entries open, !join to enter");
                    } else if (message.startsWith("!go") || message.startsWith("!potato")) {
                        if (forceAndyInRace) {
                            await addRacer("AndyTheFrenchy");
                        }
                        if (sortedRacers.length > 0) {
                            testing = false;
                            startRace();
                        }
                    } else if (event.data.text.startsWith("!resetSEStore")) {
                        resetSEStore();
                    } else if (message.startsWith("!hiderace")) {
                        if (!hidden) {
                            hidden = true;
                        }
                        //console.log(event.data.text);
                    } else if (message.startsWith("!restart")) {
                        await restartRace();
                    }
                    //Start a race in test mode with the current day top 10
                    /*else if (message.startsWith("!dgo")) {  //start race with todays leaderboard
                        resetRace();
                        addTodaysLeaderboardToRace();
                        if (sortedRacers.length > 0) {
                            testing = true;
                            startRace();
                        }
                    }*/
                    //Start a race in test mode with the current month top 10
                    else if (message.startsWith("!race10")) {  //start race with month leaderboard
                        resetRace();
                        addMonthLeaderboardToRace().then(() => {
                            testing = true;
                            startRace();
                        });
                    }
                }
            }

            if (!readying && chosenWord && useBoostWord) {
                if (containsChosenWord(message) && message.length < 2 * chosenWord["word"].length) {
                    boostRacer(event.data.displayName);
                }
            }
        }
    }
});

window.addEventListener('onWidgetLoad', async function (obj) {
    broadcaster = obj.detail.channel.username;
    fieldData = obj.detail.fieldData;
    raceDuration = fieldData.race_duration;
    clientID = fieldData.client_id;
    clientSecret = fieldData.client_secret;
    jebaitedToken = fieldData.jebaited_token;
    trackType = fieldData.track_type;
    customDefaultCar = fieldData.CustomCarForAll;
    activateHoles = trackType == "montreal" ? true : false;
    //whatIsThat = "All";
    whatIsThat = fieldData.WhatIsThat;

    //if (customDefaultCar === 'Default') {
        customRacers = {
            "NowImABeliever": {}, "albinounounou": {}, "EnigmaticGnu": {}, "KnuthingIsReal": {}, "BuddyHott": {},
            "Fareeha": {}, "iamfridolin": {}, "MatMan2855": {}, "OmegaPrimal": {}, "MermaidUnicorn": {},
            "Verth987": {}, "pencils45": {}, "DpOblivion": {}, "Asixel": {}, "jtbeaman": {}, "ndlme": {}, "CafeSparrow": {}, "SpiderSaucisse": {},
            "apocalypse_squirrel": {}, "AndyTheFrenchy": {}, "Bjorn_Jordson": {}, "COREYTOWNZ": {}, "Polorbaer": {}, "SeiKen_DMs": {}, 
            "Drhahn_qc": {}, "ThunderP00P": {}, "looptydude": {}, "THORpine": {}, "WeeZ51626": {}, "mermaidroadie": {}, "rondoudou": {},
            "JonathanOng": {}, "MarcValley": {}, "LadyGrimoireQc": {}, "TheSolid7": {}, "DarkPanther9999": {},
        }
    //}
    
    options.headers.Authorization = 'Bearer ' + fieldData.JWT_TOKEN;

    await loadAssets();

    // get auth token?
    let twitchURL = 'https://id.twitch.tv/oauth2/token';
    fetch(twitchURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'client_id=' + clientID + "&client_secret=" + clientSecret + "&grant_type=client_credentials"
    })
        .then(res => {
            if (res.ok) {
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
                }
            })
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

            await getEmotes();

            //console.log("testRacers list", testRacers);
            for (let racerName of testRacers) {
                //console.log("testRacers", racerName);
                await addRacer(racerName);
            }
            
            if (forceAndyInRace && testRacers.length > 0) {
                await addRacer("AndyTheFrenchy");
            }

            resetBackgroundArt();

            readying = true;
            requestAnimationFrame(updateRacers);
        })
        .then(() => {
            //if (trackType === "secret") noOfDrops = 50;
            //setupRain();
            if (testing && autostart) {
                startRace();
                //clearTodaysWinners();
            }
        })


});

async function addTodaysLeaderboardToRace() {
    SE_API.store.get('StreamRacersLeaderboardData').then(async function (data) {
        let date = new Date();
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear().toString();

        let dayEntries = data[year + month + day];
        if (dayEntries) {
            dayBoard = Object.keys(dayEntries).sort((a, b) => {
                let pointsA = dayEntries[a];
                let pointsB = dayEntries[b];

                if (pointsA < pointsB) return 1;
                if (pointsA > pointsB) return -1;
                return 0;
            }).map(name => [name, dayEntries[name]]);
        }
        console.log(dayBoard)

        for (let i = 0; i < dayBoard.length; i++) {
            await addRacer(dayBoard[i][0]);
            if (i + 1 === 10) break;
        }
    });
}

async function addMonthLeaderboardToRace() {
    SE_API.store.get('StreamRacersLeaderboardData').then(async function (data) {
        let date = new Date();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear().toString();

        let monthEntries = data[year + month];
        if (monthEntries) {
            monthBoard = Object.keys(monthEntries).sort((a, b) => {
                let pointsA = monthEntries[a];
                let pointsB = monthEntries[b];

                if (pointsA < pointsB) return 1;
                if (pointsA > pointsB) return -1;
                return 0;
            }).map(name => [name, monthEntries[name]]);
        }
        for (let i = 0; i < monthBoard.length; i++) {
            await addRacer(monthBoard[i][0]);
            if (i + 1 === 10) break;
        }
    });
}

function addBackgroundItem(layer, drawAnywhere) {
    let choice = defaultDrawings.backgrounds[layer][Math.floor(Math.random() * (defaultDrawings.backgrounds[layer].length))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
    back.scale = choice.scale;
    if (drawAnywhere) {
        back.XY = [-canvas.width * cameraLocPos + Math.random() * canvas.width * 2 - back.DIM[0] * back.scale,
        951 - (2 - layer) * 10 - back.DIM[1] * back.scale];
    } else {
        // add item off canvas
        back.XY = [canvas.width - cameraLoc[0] + Math.random() * canvas.width / 4,
        951 - (2 - layer) * 10 - back.DIM[1] * back.scale];
    }

    let overlapping = true;
    while (overlapping) {
        overlapping = false;
        for (let img of backgrounds[layer]) {
            if (back.XY[0] > img.XY[0] && back.XY[0] < img.XY[0] + img.DIM[0] * img.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            } else if (img.XY[0] > back.XY[0] && img.XY[0] < back.XY[0] + back.DIM[0] * back.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            }
        }
    }

    backgrounds[layer].push(back);
}

function addHoleItem(drawAnywhere) {
    let choice = defaultDrawings.holes[Math.floor(Math.random() * (defaultDrawings.holes.length))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
    back.scale = choice.scale;

    if (drawAnywhere) {
        back.XY = [-canvas.width * cameraLocPos + Math.random() * canvas.width * 2 - back.DIM[0] * back.scale,
        950 + Math.random() * 120 - back.DIM[1] * back.scale];
    } else {
        // add item off canvas
        back.XY = [canvas.width - cameraLoc[0] + Math.random() * canvas.width / 4,
        950 + Math.random() * 120 - back.DIM[1] * back.scale];
    }

    // avoid overlaps?
    // never hide start or finish line
    if (back.XY[0] > -200 && back.XY[0] < 100) {
        back.XY[0] += 300;
    }   
    if (finishX) {
        if (back.XY[0] - finishX > -200 && back.XY[0] - finishX < 100) {
            back.XY[0] += 300;
        }
    }

    let overlapping = true;
    while (overlapping) {
        overlapping = false;
        for (let img of holes) {
            if (back.XY[0] > img.XY[0] && back.XY[0] < img.XY[0] + img.DIM[0] * img.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            } else if (img.XY[0] > back.XY[0] && img.XY[0] < back.XY[0] + back.DIM[0] * back.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            }
        }
    }

    holes.push(back);
}

function addForegroundItem(drawAnywhere) {
    let choice = defaultDrawings.foregrounds[Math.floor(Math.random() * (defaultDrawings.foregrounds.length))];
    let back = {};
    back.img = choice.img;
    back.DIM = choice.DIM;
    back.scale = choice.scale;
    if (drawAnywhere) {
        back.XY = [-canvas.width * cameraLocPos + Math.random() * canvas.width * 2 - back.DIM[0] * back.scale,
        1070 - back.DIM[1] * back.scale];
    } else {
        // add item off canvas
        back.XY = [canvas.width - cameraLoc[0] + Math.random() * canvas.width / 4,
        1070 - back.DIM[1] * back.scale];
    }
    // avoid overlaps?
    // never hide start or finish line
    if (back.XY[0] > -200 && back.XY[0] < 100) {
        back.XY[0] += 300;
    }
    if (finishX) {
        if (back.XY[0] - finishX > -200 && back.XY[0] - finishX < 100) {
            back.XY[0] += 300;
        }
    }

    let overlapping = true;
    while (overlapping) {
        overlapping = false;
        for (let img of foregrounds) {
            if (back.XY[0] > img.XY[0] && back.XY[0] < img.XY[0] + img.DIM[0] * img.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            } else if (img.XY[0] > back.XY[0] && img.XY[0] < back.XY[0] + back.DIM[0] * back.scale) {
                back.XY[0] += img.DIM[0] * img.scale;
                overlapping = true;
                break;
            }
        }
    }

    foregrounds.push(back);
}

async function getEmotes() {
    let url = "https://api.twitch.tv/helix/chat/emotes?broadcaster_id="  + broadcasterChannelId;

    await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            'Client-Id': clientID,
            Authorization: "Bearer " + accessToken
        }
    }) 
    .then(res => {
        if (res.ok) {
            return res.json();
        } else {
            return null;
        }
    })
    .then(async function(data) {
        if (data && data.data) {
            data.data.forEach(emote => {
                emotes[emote.name.toLowerCase()] = emote.images.url_1x;
            });
        }
    })
}

async function getRacerColoredCar(name) {    
    let url = "https://api.twitch.tv/helix/chat/color?user_id=" + name;
    let imageCar = "";
    await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            'Client-Id': clientID,
            Authorization: "Bearer " + accessToken
        }
    }) 
    .then(res => {
        //console.log("getRacerColoredCar res", res);
        if (res.ok) {
            return res.json();
        } else {
            return null;
        }
    })
    .then(async function(data) {
        try {
            //console.log("getRacerColoredCar data", data);
            if (data.data[0].color) {
                if(coloredCar[data.data[0].color]){
                    imageCar = coloredCar[data.data[0].color];
                }else{
                    let darkerColor = colorShade(data.data[0].color, 30);
                    imageCar = await changeColInUri(IMAGES_BASE64.default_vehicule.green, "#008000", data.data[0].color, "#006C00", darkerColor);

                    coloredCar[data.data[0].color] = imageCar;
                }
            } else {
                imageCar = IMAGES_BASE64.default_vehicule.red;
            }            
        } catch (error) {
            imageCar = IMAGES_BASE64.default_vehicule.red;
        }
        return imageCar;
    })
    return imageCar; 
}
const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}
async function changeColInUri(data, colfrom, colto, colfrom2, colto2) {
    // create fake image to calculate height / width
    //let img = document.createElement("img");
    imgColoredCar.src = data;
    imgColoredCar.style.visibility = "hidden";
    document.body.appendChild(imgColoredCar);
    //let canvas = document.createElement("canvas");
    canvasColoredCar.width = imgColoredCar.offsetWidth;
    canvasColoredCar.height = imgColoredCar.offsetHeight;
    let ctx = canvasColoredCar.getContext("2d");
    ctx.drawImage(imgColoredCar,0,0);
    // remove image
    imgColoredCar.parentNode.removeChild(imgColoredCar);
    // do actual color replacement
    var imageData = ctx.getImageData(0,0,canvasColoredCar.width,canvasColoredCar.height);
    var data = imageData.data;
    var rgbfrom = hexToRGB(colfrom);
    var rgbto = hexToRGB(colto);
    var rgbfrom2 = hexToRGB(colfrom2);
    var rgbto2 = hexToRGB(colto2);
    var r,g,b;
    for(let x = 0, len = data.length; x < len; x+=4) {
        r = data[x];
        g = data[x+1];
        b = data[x+2];
        if((r == rgbfrom.r) &&
           (g == rgbfrom.g) &&
           (b == rgbfrom.b)) {
            data[x] = rgbto.r;
            data[x+1] = rgbto.g;
            data[x+2] = rgbto.b;
        } else if((r == rgbfrom2.r) &&
           (g == rgbfrom2.g) &&
           (b == rgbfrom2.b)) {
            data[x] = rgbto2.r;
            data[x+1] = rgbto2.g;
            data[x+2] = rgbto2.b;
        }   
    }
    ctx.putImageData(imageData,0,0);
    return canvasColoredCar.toDataURL();
}

function hexToRGB(hexStr) {
    let col = {};
    col.r = parseInt(hexStr.substr(1,2),16);
    col.g = parseInt(hexStr.substr(3,2),16);
    col.b = parseInt(hexStr.substr(5,2),16);
    return col;
}

async function addRacer(name, displayColor) {
    if(randomViewer == ""){
        randomViewer = Math.random() < 0.25 && !Object.keys(customRacers).includes(name) && name != "AndyTheFrenchy" ? name : "";
    }
    if (!racers[name]) {
        try {
            let racer = ({});
            racer.displayColor = displayColor || "#FFFFFF";
            racer.name = name; 

            // racer location
            racer.XY = [-widthRace - Math.random() * widthRace / 2, 1080 - 25 - Math.random() * totalRoadHeight];
            if (customRacers[name] && customRacers[name]["flyingHeight"]) {
                racer.XY[1] -= customRacers[name]["flyingHeight"];
            }

            racer.vel = [200, 0]; // px/sec
            racer.acc = [6, 0];
            racer.textCEN = [-100, -50];
            racer.time = Date.now();

            let url = "https://api.twitch.tv/helix/users?login=" + name;
            await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    'Client-Id': clientID,
                    Authorization: "Bearer " + accessToken
                }
            })
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return null;
                    }
                })
                .then(async data => {
                    // avatar
                    if (data && data.data && data.data[0] && data.data[0].profile_image_url) {
                        racer.avatar = getImage(data.data[0].profile_image_url);
                    } else {
                        racer.avatar = defaultDrawings.avatar;
                    }

                    if(whatIsThat != 'Default'){
                        racer.whatIsThat = whatIsThat === 'All' ? casquesNames[Math.floor(Math.random() * casquesNames.length)] : whatIsThat;
                        racer.casque = getImage(IMAGES_BASE64.AndyThe[racer.whatIsThat]);
                    }
                    /*switch (whatIsThat) {
                        case 'All':
                            racer.casque = new Image();
                            let indexCasque = Math.floor(Math.random() * casques.length);
                            racer.casque.src = casques[indexCasque];

                            switch (indexCasque) {
                                case 0:
                                    racer.whatIsThat = 'Classical';  
                                    break;
                                case 1:
                                    racer.whatIsThat = 'Country';  
                                    break;
                                case 2:
                                    racer.whatIsThat = 'Rock';  
                                    break;
                            }
                            break;
                        case 'Classical':
                            racer.whatIsThat = whatIsThat;
                            racer.casque = new Image();
                            racer.casque.src = IMAGES_BASE64.AndyThe[whatIsThat];
                            break;
                        case 'Country':
                            racer.whatIsThat = whatIsThat;
                            racer.casque = new Image();
                            racer.casque.src = IMAGES_BASE64.AndyThe[whatIsThat];
                            break;
                        case 'Rock':
                            racer.whatIsThat = whatIsThat;
                            racer.casque = new Image();
                            racer.casque.src = IMAGES_BASE64.AndyThe[whatIsThat];
                            break;
                    }*/

                            //console.log("customDefaultCar:", name, customDefaultCar, customRacers[name]);
                    if (customRacers[name] || customDefaultCar === "Default" || name == randomViewer) {
                        //console.log("customRacers[name]", name,customRacers[name]);
                        await setupCustomRacer(name, racer, data.data[0].id, randomViewer);
                        let keys = ["avatarTL", "avatarDIM", "avatarTheta", "avatarRadius", "avatarCR",
                            "vehicle", "vehicleTL", "vehicleDIM", "vehicleCR", "vehicleTheta", "vehicleRadius", "vehicleThetaDot", "flyingHeight",
                            "vehicleAdd", "vehicleAddTL", "vehicleAddDIM",
                            "showBoost", "boost", "boostTL", "boostDIM",
                            "fireballs", "lastFireballTime", "fireballInterval", "fireballDIM",
                            "lasers", "lastLaserTime", "laserInterval", "laserDelay", "laserDIM", "secondLaserFired",
                            "wheel1", "wheel1TL", "wheel1DIM", "wheel1CR", "wheel1Theta", "wheel1Radius", "wheel1ThetaDot",
                            "wheel2", "wheel2TL", "wheel2DIM", "wheel2CR", "wheel2Theta", "wheel2Radius", "wheel2ThetaDot",
                            "wheel3", "wheel3TL", "wheel3DIM", "wheel3CR", "wheel3Theta", "wheel3Radius", "wheel3ThetaDot",
                            "wheel4", "wheel4TL", "wheel4DIM", "wheel4CR", "wheel4Theta", "wheel4Radius", "wheel4ThetaDot",
                            "wheel5", "wheel5TL", "wheel5DIM", "wheel5CR", "wheel5Theta", "wheel5Radius", "wheel5ThetaDot",
                            "chantal", "chantalTL", "chantalDIM",
                            "car1_vehicle", "car1_vehicleTL", "car1_vehicleDIM",
                            "car1_wheel1", "car1_wheel1TL", "car1_wheel1DIM", "car1_wheel1CR", "car1_wheel1Theta", "car1_wheel1Radius",
                            "car1_wheel2", "car1_wheel2TL", "car1_wheel2DIM", "car1_wheel2CR", "car1_wheel2Theta", "car1_wheel2Radius", 
                            "car1_wheel3", "car1_wheel3TL", "car1_wheel3DIM", "car1_wheel3CR", "car1_wheel3Theta", "car1_wheel3Radius",
                            "car1_wheel4", "car1_wheel4TL", "car1_wheel4DIM", "car1_wheel4CR", "car1_wheel4Theta", "car1_wheel4Radius",
                            "car1_chantal", "car1_chantalTL", "car1_chantalDIM",
                            "car2_vehicle", "car2_vehicleTL", "car2_vehicleDIM",
                            "car2_wheel1", "car2_wheel1TL", "car2_wheel1DIM", "car2_wheel1CR", "car2_wheel1Theta", "car2_wheel1Radius",
                            "car2_wheel2", "car2_wheel2TL", "car2_wheel2DIM", "car2_wheel2CR", "car2_wheel2Theta", "car2_wheel2Radius",
                            "car2_wheel3", "car2_wheel3TL", "car2_wheel3DIM", "car2_wheel3CR", "car2_wheel3Theta", "car2_wheel3Radius", 
                            "car3_vehicle", "car3_vehicleTL", "car3_vehicleDIM",
                            "car3_wheel1", "car3_wheel1TL", "car3_wheel1DIM", "car3_wheel1CR", "car3_wheel1Theta", "car3_wheel1Radius",
                            "car3_wheel2", "car3_wheel2TL", "car3_wheel2DIM", "car3_wheel2CR", "car3_wheel2Theta", "car3_wheel2Radius",
                            "car3_wheel3", "car3_wheel3TL", "car3_wheel3DIM", "car3_wheel3CR", "car3_wheel3Theta", "car3_wheel3Radius",
                            "car3_wheel4", "car3_wheel4TL", "car3_wheel4DIM", "car3_wheel4CR", "car3_wheel4Theta", "car3_wheel4Radius",
                            "car4_vehicle", "car4_vehicleTL", "car4_vehicleDIM", 
                            "car5_vehicle", "car5_vehicleTL", "car5_vehicleDIM",
                            "car5_cloud", "car5_cloudTL", "car5_cloudDIM",
                            "car7_vehicle", "car7_vehicleTL", "car7_vehicleDIM", "car7_andy", "car7_andyTL", "car7_andyDIM",  "car7_andyTheta", "car7_andyRadius",
                            "customDraw", "customUpdate", "vehicle_back", "vehicle_front", "manche", "mancheTL", "mancheDIM", 
                            "choux", "chouxTL", "chouxDIM", "chouxOffset", "chouxAmplitude", "chouxSpeed",
                            "choux3", "choux3TL", "choux3DIM", "choux3Offset", "choux3Amplitude", "choux3Speed",
                            "choux4", "choux4TL", "choux4DIM", "choux4Offset", "choux4Amplitude", "choux4Speed",
                            "choux2", "choux2TL", "choux2DIM", "choux2CR", "choux2Theta", "choux2Radius",
                            "fallingChoux", "fallingChouxTL", "fallingChouxDIM", "fallingChouxTheta", "fallingChouxTimer", "fallingChouxState", "fallingChouxSpeed", "fallingChouxRotationSpeed"]
                        
                        for (let key of keys) {
                            racer[key] = name == randomViewer ? customRacers["rondoudou"][key] : customRacers[name][key];
                        }
                    } else {
                        racer.avatarTL = [-150, -145 + 14.597];
                        racer.avatarDIM = [80, 80];
                        switch (customDefaultCar) {
                            case 'Verth987':                                
                                racer = await setupVerth987Car(racer);
                                break;
                            case "KnuOverboard":
                                racer.avatarTL = [-158.64, -131.787];
                                racer.avatarDIM = [80, 80];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.knu_0_vehicle);
                                racer.vehicleTL = [-214, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-293.3, -149.79];
                                racer.boostDIM = [259.6, 200];

                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                }
                                break;
                            case "KnuTapis":
                                racer.avatarTL = [-200 + 74.646, -80 - 52.5];
                                racer.avatarDIM = [80, 80];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.knu_1_vehicle);
                                racer.vehicleTL = [-200 + 14, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 37.87, -200 + 47.35];
                                racer.boostDIM = [259.6, 200];

                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                }
                                break;
                            case "KnuHug":
                                racer.avatarTL = [-200 + 91.860 + 5, -80 - 61.430];
                                racer.avatarDIM = [90, 90];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.knu_2_vehicle);
                                racer.vehicleTL = [-200 + 4, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 18.871, -200 + 8.067];
                                racer.boostDIM = [259.6, 200];

                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                }
                                break;
                            case "KnuChair":
                                racer.avatarTL = [-200 + 75.256, -90 - 52.023];
                                racer.avatarDIM = [90, 90];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.knu_3_back);
                                racer.vehicleTL = [-200 + 17.678, -200];
                                racer.vehicleDIM = [0, 0];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 32.957, -200 + 43.550];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.assets.knu_3_back);
                                racer.wheel1TL = [-200 + 17.678, -200];
                                racer.wheel1DIM = [200, 200];
                                racer.wheel1CR = [-90, -90];
                                racer.wheel1Theta = 0;
                                racer.wheel1Radius = 100;

                                racer.wheel2 = getImage(IMAGES_BASE64.assets.knu_3_front);
                                racer.wheel2TL = [-200 + 17.678, -200];
                                racer.wheel2DIM = [200, 200];
                                racer.wheel2CR = [-90, -90];
                                racer.wheel2Theta = 0;
                                racer.wheel2Radius = 100;

                                custom.customDraw = () => {

                                    // draw wheel 2
                                    ctx.translate(...racer.wheel2CR);
                                    ctx.rotate(racer.wheel2Theta);
                                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                                    drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                                    ctx.translate(...racer.wheel2CR); // translate back
                                    ctx.rotate(-racer.wheel2Theta); // undo rotation
                                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back                                    

                                    // draw avatar in a circle
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                    // draw wheel 1
                                    ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                                    ctx.rotate(racer.wheel1Theta);  // rotate
                                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                                    ctx.translate(...racer.wheel1CR); // translate back
                                    ctx.rotate(-racer.wheel1Theta); // undo rotation
                                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back
                                }
                                                break;
                            case "EnigmaticGnu":
                                const gnuCarChoice = Math.random() < 0.5 ? "limousine" : "normal";
                                //gnuCarChoice = " ";
                                
                                if (gnuCarChoice === "limousine") {
                                    racer.avatarTL = [-325 - 20, -130];
                                    racer.avatarDIM = [80, 80];

                                    racer.vehicle = getImage(IMAGES_BASE64.Gnu.limousine.vehicle);
                                    racer.vehicleTL = [-400 - 20, -200];
                                    racer.vehicleDIM = [400, 200];

                                    racer.showBoost = false;
                                    racer.boost = defaultDrawings.boost;
                                    racer.boostTL = [-400 - 66 - 20, -200 + 60];
                                    racer.boostDIM = [259.6, 200];

                                    racer.wheel1 = getImage(IMAGES_BASE64.Gnu.limousine.wheel1);
                                    racer.wheel1TL = [-400 - 20, -200];
                                    racer.wheel1DIM = [400, 200];
                                    racer.wheel1CR = [-330 - 20, -15.5];
                                    racer.wheel1Theta = Math.PI / 6;
                                    racer.wheel1Radius = 15.5;

                                    racer.wheel2 = getImage(IMAGES_BASE64.Gnu.limousine.wheel2);
                                    racer.wheel2TL = [-400 - 20, -200];
                                    racer.wheel2DIM = [400, 200];
                                    racer.wheel2CR = [-43 - 20, -15];
                                    racer.wheel2Theta = Math.PI / 6;
                                    racer.wheel2Radius = 15.5;
                                } else {
                                    let scaleGnu = 0.6;
                                    // Nouvelle voiture
                                    racer.avatarTL = [(-200 + 109 - 40) * scaleGnu, (-200 + 87 - 40) * scaleGnu]; // Centre de l'avatar aux coordonnées [109, 87]
                                    racer.avatarDIM = [80, 80];
                            
                                    // Véhicules avant et arrière
                                    racer.vehicle_back = getImage(IMAGES_BASE64.Gnu.baby.vehicle_back);
                                    racer.vehicle_front = getImage(IMAGES_BASE64.Gnu.baby.vehicle_front);
                                    racer.vehicleTL = [-200 * scaleGnu, -200 * scaleGnu];
                                    racer.vehicleDIM = [200 * scaleGnu, 200 * scaleGnu];
                            
                                    // Roues
                                    racer.wheel1 = getImage(IMAGES_BASE64.Gnu.baby.wheel1);
                                    racer.wheel1TL = [-200 * scaleGnu, -200 * scaleGnu];
                                    racer.wheel1DIM = [45 * scaleGnu, 44 * scaleGnu];
                                    racer.wheel1CR = [(-200 + 26) * scaleGnu, (-200 + 197) * scaleGnu]; // Centre de rotation de la roue 1
                                    racer.wheel1Theta = 0;
                                    racer.wheel1Radius = 22 * scaleGnu; // Moitié de la hauteur de la roue
                            
                                    racer.wheel2 = getImage(IMAGES_BASE64.Gnu.baby.wheel2);
                                    racer.wheel2TL = [-200 * scaleGnu, -200 * scaleGnu];
                                    racer.wheel2DIM = [48 * scaleGnu, 40 * scaleGnu];
                                    racer.wheel2CR = [(-200 + 171) * scaleGnu, (-200 + 197) * scaleGnu]; // Centre de rotation de la roue 2
                                    racer.wheel2Theta = 0;
                                    racer.wheel2Radius = 20 * scaleGnu; // Moitié de la hauteur de la roue
                            
                                    // Mise à jour personnalisée pour la rotation des roues
                                    racer.customUpdate = async (curTime) => {
                                        let dt = (curTime - racer.time) / 1000;
                                        
                                        // Rotation des roues proportionnelle à la vitesse
                                        let wheelRotation = (racer.vel[0] * dt) / racer.wheel1Radius;
                                        racer.wheel1Theta += wheelRotation;
                                        racer.wheel2Theta += wheelRotation;
                                    };
                            
                                    // Dessin personnalisé avec ordre de superposition correct
                                    racer.customDraw = async () => {
                                        // 1. Dessiner l'arrière du véhicule
                                        drawToCanvas(ctx, racer.vehicle_back, ...racer.vehicleTL, ...racer.vehicleDIM);
                            
                                        // 2. Dessiner l'avatar
                                        ctx.save();
                                        ctx.beginPath();
                                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), 
                                               racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                                        ctx.clip();
                                        drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                        ctx.restore();
                            
                                        // 3. Dessiner les roues avec rotation
                                        // Roue 1
                                        ctx.save();
                                        ctx.translate(...racer.wheel1CR);
                                        ctx.rotate(racer.wheel1Theta);
                                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]);
                                        drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                                        ctx.restore();
                            
                                        // Roue 2
                                        ctx.save();
                                        ctx.translate(...racer.wheel2CR);
                                        ctx.rotate(racer.wheel2Theta);
                                        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                                        drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                                        ctx.restore();
                            
                                        // 4. Dessiner l'avant du véhicule
                                        drawToCanvas(ctx, racer.vehicle_front, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    };
                                }
                                break;
                            case "albinounounou":
                                racer.avatarTL = [-200 + 130.857, -58 - 15.357];
                                racer.avatarDIM = [58, 58];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.albinounounou_vehicle);
                                racer.vehicleTL = [-200 + 14, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = getImage(IMAGES_BASE64.assets.albinounounou_boost);
                                racer.boostTL = [-200 + 14, -200];
                                racer.boostDIM = [200, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.assets.albinounounou_wheel1);
                                racer.wheel1TL = [-200 + 14, -200];
                                racer.wheel1DIM = [200, 200];
                                racer.wheel1CR = [-200 + 175.36, -9.64];
                                racer.wheel1Theta = 0;
                                racer.wheel1Radius = 9.64;

                                racer.wheel2 = getImage(IMAGES_BASE64.assets.albinounounou_wheel2);
                                racer.wheel2TL = [-200 + 14, -200];
                                racer.wheel2DIM = [200, 200];
                                racer.wheel2CR = [-200 + 102.5, -9.64];
                                racer.wheel2Theta = 0;
                                racer.wheel2Radius = 9.64;
                                break;
                            case "BuddyHott":
                                racer.avatarTL = [-154 - 3.5, -139];
                                racer.avatarDIM = [80, 80];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.buddy_hott_vehicle);
                                racer.vehicleTL = [-200 - 3.5, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 82.3 - 3.5, -200 + 39.286];
                                racer.boostDIM = [259.6, 200];

                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                }
                                break;
                            case "CafeSparrow":
                                racer.avatarTL = [-200 + 75.7, -80 - 106.571];
                                racer.avatarDIM = [80, 80];

                                racer.vehicle = getImage(IMAGES_BASE64.Brit.vehicule);
                                racer.vehicleTL = [-200 + 6, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = true;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 11.107, -200 + 41.92];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.Brit.wheel1);
                                racer.wheel1TL = [-200 + 6, -200];
                                racer.wheel1DIM = [200, 200];
                                racer.wheel1CR = [-200 + 152.5325, -29.8];
                                racer.wheel1Theta = 0;
                                racer.wheel1Radius = 24.75;

                                racer.wheel2 = getImage(IMAGES_BASE64.Brit.wheel2);
                                racer.wheel2TL = [-200 + 6, -200];
                                racer.wheel2DIM = [200, 200];
                                racer.wheel2CR = [-200 + 99.5, -29.8];
                                racer.wheel2Theta = 0;
                                racer.wheel2Radius = 24.75;
                                break;
                            case "DpOblivion":
                                racer.avatarTL = [-200 + 102.4, -80 - 69.5];
                                racer.avatarDIM = [80, 80];

                                racer.vehicle = getImage(IMAGES_BASE64.assets.dpoblivion_vehicle);
                                racer.vehicleTL = [-200, -200];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 42.871, -200 + 36.071];
                                racer.boostDIM = [259.6, 200];
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                }
                                break;
                            case "Fareeha":
                                racer.avatarTL = [-200 + 84.2, -80 - 90.17];
                                racer.avatarDIM = [80, 80];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.assets.fareeha_vehicle);
                                racer.vehicleTL = [-200, -200];
                                racer.vehicleDIM = [200, 200];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 59, -200 + 19.91];
                                racer.boostDIM = [259.6, 200];
                    
                                racer.wheel1 = getImage(IMAGES_BASE64.assets.fareeha_wheel1);
                                racer.wheel1TL = [-200, -200];
                                racer.wheel1DIM = [200, 200];
                                racer.wheel1CR = [-200 + 57.58, -30];
                                racer.wheel1Theta = Math.PI / 6;
                                racer.wheel1Radius = 30;
                    
                                racer.wheel2 = getImage(IMAGES_BASE64.assets.fareeha_wheel2);
                                racer.wheel2TL = [-200, -200];
                                racer.wheel2DIM = [200, 200];
                                racer.wheel2CR = [-200 + 143.4, -30];
                                racer.wheel2Theta = Math.PI / 6;
                                racer.wheel2Radius = 30;
                                break;
                            case "iamfridolin":
                                racer.avatarTL = [-200 + 130.6, -50 - 89.67];
                                racer.avatarDIM = [50, 50];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.assets.fridolin_vehicle);
                                racer.vehicleTL = [-200 + 6, -200];
                                racer.vehicleDIM = [200, 200];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 34.346, -124.74 - 40.195];
                                racer.boostDIM = [161.917, 124.74];
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                }
                                break;
                            case "jtbeaman":
                                racer.avatarTL = [-200 + 77.988, -80 - 51.217];
                                racer.avatarDIM = [80, 80];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.jtbeaman.vehicule);
                                racer.vehicleTL = [-200 + 2.571, -200];
                                racer.vehicleDIM = [200, 200];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 31.07, -119.286 + 32.014];
                                racer.boostDIM = [154.554, 119.286];

                                // Système de fireballs
                                racer.fireballs = []; // Array pour stocker les fireballs actives
                                racer.lastFireballTime = Date.now(); // Temps du dernier tir
                                racer.fireballInterval = 2000; // Intervalle de 2 secondes entre les tirs
                                racer.fireballDIM = [60, 60]; // Dimensions des fireballs
                            
                                racer.customUpdate = (curTime) => {
                                    // Vérifier s'il faut créer une nouvelle fireball
                                    if (curTime - racer.lastFireballTime >= racer.fireballInterval) {
                                        // Créer une nouvelle fireball
                                        racer.fireballs.push({
                                            x: racer.vehicleTL[0] + racer.vehicleDIM[0], // Position de départ (droite du véhicule)
                                            y: racer.vehicleTL[1] + racer.vehicleDIM[1]/2 - 30, // Aligné verticalement avec le véhicule
                                            speed: racer.vel[0] + 200, // Vitesse = vitesse du véhicule + 50
                                            flipTime: curTime,
                                            isFlipped: false
                                        });
                                        racer.lastFireballTime = curTime;
                                    }
                            
                                    // Mettre à jour la position de chaque fireball
                                    racer.fireballs.forEach((fireball, index) => {
                                        fireball.x += fireball.speed * (curTime - racer.time) / 1000;
                                        
                                        // Flip vertical toutes les 0.5 secondes
                                        if (curTime - fireball.flipTime >= 500) {
                                            fireball.isFlipped = !fireball.isFlipped;
                                            fireball.flipTime = curTime;
                                        }
                                    });
                            
                                    // Supprimer les fireballs qui sont trop loin
                                    racer.fireballs = racer.fireballs.filter(fireball => 
                                        fireball.x < racer.vehicleTL[0] + 2000
                                    );
                                }
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                    
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
        
                                    // Dessin de chaque fireball
                                    racer.fireballs.forEach(fireball => {
                                        ctx.save();
                                        
                                        // Application des transformations
                                        ctx.translate(fireball.x + racer.fireballDIM[0]/2, 
                                                    fireball.y + 60 + (fireball.isFlipped ? racer.fireballDIM[1] : 0));
                                        ctx.scale(1, fireball.isFlipped ? -1 : 1);
                                        ctx.translate(-(fireball.x + racer.fireballDIM[0]/2), 
                                                    -(fireball.y));
                                        
                                        // Dessin de la fireball retournée horizontalement
                                        ctx.scale(-1, 1);
                                        ctx.drawImage(defaultDrawings.boost, 
                                                     -fireball.x, // - racer.fireballDIM[0], 
                                                     fireball.y, 
                                                     racer.fireballDIM[0], 
                                                     racer.fireballDIM[1]);
                                        
                                        ctx.restore();
                                    });
                    
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                }
                                break;
                            case "MatMan2855":
                                racer.avatarTL = [-200 + 67.938, -80 - 106.27];
                                racer.avatarDIM = [80, 80];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.assets.matman_vehicle);
                                racer.vehicleTL = [-200 + 28.284, -200];
                                racer.vehicleDIM = [200, 200];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-259.6 + 1.52, -200 - 7.581];
                                racer.boostDIM = [259.6, 200];
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                }
                                break;
                            case "ndlme":
                                racer.avatarTL = [-200 + 66.56, -80 - 78.717];
                                racer.avatarDIM = [80, 80];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.ndlme.vehicule);
                                racer.vehicleTL = [-200, -200];
                                racer.vehicleDIM = [200, 200];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 38.717, -200 + 31.3];
                                racer.boostDIM = [259.133, 200];
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                    
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                    
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                }
                                break;
                            case "NowImABeliever":
                                racer = await genNowImABelieverCar(racer);                    
                                break;
                            case "OmegaPrimal":
                                racer = await setupOmegaPrimal(racer);
                                break;
                            case "pencils45":
                                racer = await setupPencil(racer);
                                break;
                            case "SpiderSaucisse":
                                racer = await setupSpiderSaucisse(racer);                    
                                break;
                            case "AndyTheFrenchy":
                                racer = await genAndythefrenchyCar(racer);
                                break;
                            case "Asixel": 
                                racer = await setupAsixel(racer);
                                break;   
                            case "apocalypse_squirrel":
                                racer = await setupApocalypseSquirrel(racer);
                                break;
                            case "THORpine":
                                racer = await setupTHORpine(racer);
                                break;
                            case "Rainbow":
                                racer.curRainbow = 1;
                                racer.vehicle = getImage(IMAGES_BASE64.default_rainbow_vehicule.v1);

                                racer.vehicle.style = { filter: "hue-rotate(60deg)" };
                                racer.vehicleTL = [-200, -175 + 14.597];
                                racer.vehicleDIM = [200, 200];
                                racer.vehicleCR = [-150, -60]; // center of rotation

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-259.6, -175 + 14.597];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = defaultDrawings.wheel1;
                                //racer.wheel1.src = IMAGES.racer_wheel1;
                                racer.wheel1TL = [-200, -135 + 14.597];
                                racer.wheel1DIM = [481 / 2.5, 301 / 2.5];
                                racer.wheel1CR = [-150, -37 + 14.597];
                                racer.wheel1Theta = Math.PI / 6;
                                racer.wheel1Radius = 50 / 2.5;

                                racer.wheel2 = defaultDrawings.wheel2;
                                //racer.wheel2.src = IMAGES.racer_wheel2;
                                racer.wheel2TL = [-196, -135 + 14.597];
                                racer.wheel2DIM = [481 / 2.5, 301 / 2.5];
                                racer.wheel2CR = [-58, -37 + 14.597];
                                racer.wheel2Theta = Math.PI / 6;
                                racer.wheel2Radius = 50 / 2.5;

                                racer.customDraw = () => {
                                    //drawToCanvasGIF(ctx, X, Y, width, height);
                                    drawToCanvasGIF(ctx, ...racer.vehicleTL, ...racer.vehicleDIM);

                                    // draw wheel 1
                                    ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                                    ctx.rotate(racer.wheel1Theta);	// rotate
                                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                                    ctx.translate(...racer.wheel1CR); // translate back
                                    ctx.rotate(-racer.wheel1Theta); // undo rotation
                                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                                    // draw wheel 2
                                    ctx.translate(...racer.wheel2CR);
                                    ctx.rotate(racer.wheel2Theta);
                                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                                    drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                                    ctx.translate(...racer.wheel2CR); // translate back
                                    ctx.rotate(-racer.wheel2Theta); // undo rotation
                                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
                                }                            
                                break;
                            case "Secret":
                            case "Secret2":
                                    // vehicle main // 800x350
                                    racer.vehicle = getImage(customDefaultCar == "Secret" ? IMAGES_BASE64.default_vehicule.fruitcake : IMAGES_BASE64.default_vehicule.fruitcake2);
    
                                    racer.vehicle.style = { filter: "hue-rotate(60deg)" };
                                    racer.vehicleTL = [-200, -175 + 14.597];
                                    racer.vehicleDIM = [200, 200];
                                    racer.vehicleCR = [-150, -60]; // center of rotation
    
                                    racer.showBoost = false;
                                    racer.boost = defaultDrawings.boost;
                                    racer.boostTL = [-259.6, -175 + 14.597];
                                    racer.boostDIM = [259.6, 200];
    
                                    racer.wheel1 = getImage(IMAGES_BASE64.default_vehicule.fruitcakeWheel1);
                                    //racer.wheel1.src = IMAGES.racer_wheel1;
                                    racer.wheel1TL = [-200, -135 + 14.597];
                                    racer.wheel1DIM = [481 / 2.5, 301 / 2.5];
                                    racer.wheel1CR = [-150, -37 + 14.597];
                                    racer.wheel1Theta = Math.PI / 6;
                                    racer.wheel1Radius = 50 / 2.5;
    
                                    racer.wheel2 = getImage(IMAGES_BASE64.default_vehicule.fruitcakeWheel2);
                                    //racer.wheel2.src = IMAGES.racer_wheel2;
                                    racer.wheel2TL = [-196, -135 + 14.597];
                                    racer.wheel2DIM = [481 / 2.5, 301 / 2.5];
                                    racer.wheel2CR = [-58, -37 + 14.597];
                                    racer.wheel2Theta = Math.PI / 6;
                                    racer.wheel2Radius = 50 / 2.5;
                            
                                    break;
                            case "Bjorn_Jordson":
                                racer.avatarTL = [-182 + 58, -154 + 12];
                                racer.avatarDIM = [76, 76];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.Bjorn_Jordson.vehicule);
                                racer.vehicleTL = [-182, -154];
                                racer.vehicleDIM = [182, 154];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-182 - 38.717, -154 + 31.3];
                                racer.boostDIM = [259.133, 200];
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();
                    
                                }
                                //customRacers[name] = racer;
                                break;
                            case "COREYTOWNZ":
                                racer.avatarTL = [-182 + 58, -154 + 12];
                                racer.avatarDIM = [76, 76];

                                racer.vehicle = getImage(IMAGES_BASE64.COREYTOWNZ.vehicule);

                                racer.vehicleTL = [-250, -250 + 14.597];
                                racer.vehicleDIM = [200, 200];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-250, -250 + 14.597];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.COREYTOWNZ.wheel1);;
                                //racer.wheel1.src = IMAGES.racer_wheel1;
                                racer.wheel1TL = [-200, -200 + 14.597];
                                racer.wheel1DIM = [(481 / 2.5) * 0.8, (301 / 2.5) * 0.8];
                                racer.wheel1CR = [-21, -50];
                                racer.wheel1Theta = -Math.PI / 4;
                                racer.wheel1Radius = 42;

                                racer.wheel2 = getImage(IMAGES_BASE64.COREYTOWNZ.wheel2);;
                                //racer.wheel2.src = IMAGES.racer_wheel2;
                                racer.wheel2TL = [-200, -200 + 14.597];
                                racer.wheel2DIM = [(481 / 2.5) * 0.8, (301 / 2.5) * 0.8]; 
                                racer.wheel2CR = [-24, -50];
                                racer.wheel2Theta = -Math.PI / 4;
                                racer.wheel2Radius = 47;

                                racer.customUpdate = (curTime) => {
                                    racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                                    if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
                                        racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
                                        racer.wheel1ThetaDot *= -1;
                                    } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
                                        racer.wheel1Theta = - racer.wheel1Theta;
                                        racer.wheel1ThetaDot *= -1;
                                    }

                                    racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
                                    if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
                                        racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
                                        racer.wheel2ThetaDot *= -1;
                                    } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
                                        racer.wheel2Theta = - racer.wheel2Theta;
                                        racer.wheel2ThetaDot *= -1;
                                    }
                                }
                                
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();    
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);    
                                    
                                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                                    drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);              
                                }
                    
                                break;
                            case "Polorbaer":                                
                                racer.avatarTL = [-250 + 66.56, -70 - 78.717];
                                racer.avatarDIM = [80, 80];
                    
                                racer.vehicle = getImage(IMAGES_BASE64.Polorbaer.vehicule);
                                racer.vehicleTL = [-250, -150];
                                racer.vehicleDIM = [250, 150];
                    
                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-200 - 38.717, -200 + 31.3];
                                racer.boostDIM = [259.133, 200];
                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                    
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();                    
                                }
                                break;
                            case "SeiKen_DMs":
                                racer.avatarTL = [-167 + 58, -154 + 12];
                                racer.avatarDIM = [76, 76];

                                racer.vehicle = getImage(IMAGES_BASE64.Seiken.vehicule);

                                racer.vehicleTL = [-250, -250 + 14.597];
                                racer.vehicleDIM = [250, 250];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-250, -250 + 14.597];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.Seiken.rame);
                                //racer.wheel1.src = IMAGES.racer_wheel1;
                                racer.wheel1TL = [-190, -107];
                                racer.wheel1DIM = [89, 107];
                                racer.wheel1CR = [-89, -53.5];
                                racer.wheel1Theta = -Math.PI / 4;
                                racer.wheel1Radius = 90;

                                racer.customUpdate = (curTime) => {
                                    racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                                    if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
                                        racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
                                        racer.wheel1ThetaDot *= -1;
                                    } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
                                        racer.wheel1Theta = - racer.wheel1Theta;
                                        racer.wheel1ThetaDot *= -1;
                                    }
                                }
                                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();    
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);                                                                          
                                    
                                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                                }                       
                    
                                break;    
                            case "ThunderP00P":
                                racer.avatarTL = [-120, -190];
                                racer.avatarDIM = [76, 76];

                                racer.vehicle = getImage(IMAGES_BASE64.Thunfsrwppoool.vehicule);

                                racer.vehicleTL = [-179, -185 + 14.597];
                                racer.vehicleDIM = [179, 185];

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-250, -250 + 14.597];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = getImage(IMAGES_BASE64.Thunfsrwppoool.wheel1);
                                racer.wheel1TL = [-90, -10];
                                racer.wheel1DIM = [68, 41];
                                
                                racer.wheel2 = getImage(IMAGES_BASE64.Thunfsrwppoool.wheel2);
                                racer.wheel2TL = [-200, -10];
                                racer.wheel2DIM = [72, 44];
                                    
                                racer.customDraw = () => {
                                    if (racer.showBoost) {
                                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                                    }
                                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);                                                                          
                                    
                                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                                    drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);

                                    ctx.save()
                                    ctx.beginPath()
                                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                                    
                                    ctx.clip()
                                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                                    ctx.closePath();
                                    ctx.restore();    
                                }    
                                
                                break;        
                            default:
                                // vehicle main // 800x350
                                racer.vehicle = new Image();
                                let colorrrr = await getRacerColoredCar(data.data[0].id);
                                racer.vehicle.src = colorrrr;

                                racer.vehicle.style = { filter: "hue-rotate(60deg)" };
                                racer.vehicleTL = [-200, -175 + 14.597];
                                racer.vehicleDIM = [200, 200];
                                racer.vehicleCR = [-150, -60]; // center of rotation

                                racer.showBoost = false;
                                racer.boost = defaultDrawings.boost;
                                racer.boostTL = [-259.6, -175 + 14.597];
                                racer.boostDIM = [259.6, 200];

                                racer.wheel1 = defaultDrawings.wheel1;
                                //racer.wheel1.src = IMAGES.racer_wheel1;
                                racer.wheel1TL = [-200, -135 + 14.597];
                                racer.wheel1DIM = [481 / 2.5, 301 / 2.5];
                                racer.wheel1CR = [-150, -37 + 14.597];
                                racer.wheel1Theta = Math.PI / 6;
                                racer.wheel1Radius = 50 / 2.5;

                                racer.wheel2 = defaultDrawings.wheel2;
                                //racer.wheel2.src = IMAGES.racer_wheel2;
                                racer.wheel2TL = [-196, -135 + 14.597];
                                racer.wheel2DIM = [481 / 2.5, 301 / 2.5];
                                racer.wheel2CR = [-58, -37 + 14.597];
                                racer.wheel2Theta = Math.PI / 6;
                                racer.wheel2Radius = 50 / 2.5;
                        
                                break;
                        }
                    }

                    if (!racers[racer["name"]]) {
                        racers[racer["name"]] = racer;
                        if (name != "AndyTheFrenchy" || name == "AndyTheFrenchy" && !andyNoInLeaderboard) {
                            sortedRacers.push(racer["name"]);
                            let j = sortedRacers.length - 1;
                            while (j > 0 & racers[sortedRacers[j]]?.XY[1] < racers[sortedRacers[j - 1]]?.XY[1]) {
                                [sortedRacers[j], sortedRacers[j - 1]] = [sortedRacers[j - 1], sortedRacers[j]];
                                j--;
                            }
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

async function setupAsixel(racer) {
    racer.avatarTL = [-200 + 75, -80 - 129 + 15];
    racer.avatarDIM = [80, 80];

    racer.vehicle = getImage(IMAGES_BASE64.Asixel.vehicule);
    racer.vehicleTL = [-200 - 14.9, -250 + 15];
    racer.vehicleDIM = [250, 250];

    racer.showBoost = false;
    racer.boost = getImage(IMAGES_BASE64.Asixel.boost);
    racer.boostTL = [-200 - 54.544, -200 - 25.764 + 15];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.Asixel.wheel1);
    racer.wheel1TL = [-200 - 14.9, -250 + 15];
    racer.wheel1DIM = [250, 250];
    racer.wheel1CR = [-200 + 55.05, -47.48 + 15];
    racer.wheel1Theta = 0;
    racer.wheel1Radius = 38.89;

    racer.wheel2 = getImage(IMAGES_BASE64.Asixel.wheel2);
    racer.wheel2TL = [-200 - 14.9, -250 + 15];
    racer.wheel2DIM = [250, 250];
    racer.wheel2CR = [-200 + 110.11, -21.72 + 15];
    racer.wheel2Theta = 0;
    racer.wheel2Radius = 45.962;

    racer.wheel3 = getImage(IMAGES_BASE64.Asixel.wheel3);
    racer.wheel3TL = [-200 - 14.9, -250 + 15];
    racer.wheel3DIM = [250, 250];
    racer.wheel3CR = [-200 + 180.31, -52.02 + 15];
    racer.wheel3Theta = 0;
    racer.wheel3Radius = 41.416;

    racer.customDraw = () => {
        if (racer.showBoost) {
            drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }
        drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();

        // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel1Theta);	// rotate
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
        if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
        ctx.rotate(-racer.wheel1Theta); // undo rotation
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

        // draw wheel 2
        ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
        ctx.rotate(racer.wheel2Theta);	// rotate
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
        if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
        ctx.translate(...racer.wheel2CR); // translate back
        ctx.rotate(-racer.wheel2Theta); // undo rotation
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

        // draw wheel 3
        ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel3Theta);	// rotate
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
        if (racer.wheel3) drawToCanvas(ctx, racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
        ctx.translate(...racer.wheel3CR); // translate back
        ctx.rotate(-racer.wheel3Theta); // undo rotation
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back
    }

    racer.customUpdate = (curTime) => {
        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
        racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI)

        racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
        racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI)

        racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * (curTime - racer.time) / 1000;
        racer.wheel3Theta = racer.wheel3Theta % (2 * Math.PI)
    }           
    return racer;
}

async function setupPencil(racer) {
    racer.avatarTL = [-200 + 50.12, -80 - 127.98];
    racer.avatarDIM = [80, 80];

    racer.vehicle = getImage(IMAGES_BASE64.assets.pencils_vehicle);
    racer.vehicleTL = [-200 - 12, -200];
    racer.vehicleDIM = [200, 200];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 47.4, -200 + 20.87];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.assets.pencils_wheel1);
    racer.wheel1TL = [-200 - 12, -200];
    racer.wheel1DIM = [200, 200];
    racer.wheel1CR = [-200 + 67.5, -15];
    racer.wheel1Theta = Math.PI / 6;
    racer.wheel1Radius = 15;

    racer.wheel2 = getImage(IMAGES_BASE64.assets.pencils_wheel2);
    racer.wheel2TL = [-200 - 12, -200];
    racer.wheel2DIM = [200, 200];
    racer.wheel2CR = [-200 + 125.71, -19.29];
    racer.wheel2Theta = Math.PI / 6;
    racer.wheel2Radius = 19.29;

    racer.customDraw = () => {
        if (racer.showBoost) {
            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }
        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();

        // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel1Theta);	// rotate
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
        if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
        ctx.rotate(-racer.wheel1Theta); // undo rotation
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

        // draw wheel 2
        ctx.translate(...racer.wheel2CR);
        ctx.rotate(racer.wheel2Theta);
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
        if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
        ctx.translate(...racer.wheel2CR); // translate back
        ctx.rotate(-racer.wheel2Theta); // undo rotation
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
    }
    return racer;
}

async function setupOmegaPrimal(racer) {
    racer.avatarTL = [-200 + 82.83, -54.286 - 70.48];
    racer.avatarDIM = [54.286, 54.286];

    racer.vehicle = getImage(IMAGES_BASE64.assets.omega_primal_vehicle);
    racer.vehicleTL = [-200 - 18, -200];
    racer.vehicleDIM = [200, 200];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 100.4, -200 + 23.73];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.assets.omega_primal_wheel1);
    racer.wheel1TL = [-200 - 18, -200];
    racer.wheel1DIM = [200, 200];
    racer.wheel1CR = [-200 + 39.3, -25];
    racer.wheel1Theta = Math.PI / 6;
    racer.wheel1Radius = 25;

    racer.wheel2 = getImage(IMAGES_BASE64.assets.omega_primal_wheel2);
    racer.wheel2TL = [-200 - 18, -200];
    racer.wheel2DIM = [200, 200];
    racer.wheel2CR = [-200 + 136.43, -25];
    racer.wheel2Theta = Math.PI / 6;
    racer.wheel2Radius = 25;

    return racer;
}

async function setupMermaidUnicorn(racer) {
    racer.avatarTL = [-200 + 62.83, -54.286 - 60.48];
    racer.avatarDIM = [54.286, 54.286];
    console.log(IMAGES_BASE64);
    racer.vehicle = getImage(IMAGES_BASE64.MermaidUnicorn.vehicule);
    racer.vehicleTL = [-165 - 18, -135];
    racer.vehicleDIM = [165, 135];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 100.4, -200 + 23.73];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.MermaidUnicorn.wheel1);
    racer.wheel1CR = [racer.vehicleTL[0] + 40, racer.vehicleTL[1] + 151];
    racer.wheel1TL = [racer.wheel1CR[0] - 22, racer.wheel1CR[1] - 22];
    racer.wheel1DIM = [44, 45];
    racer.wheel1Theta = Math.PI / 6;
    racer.wheel1Radius = 22;

    racer.wheel2 = getImage(IMAGES_BASE64.MermaidUnicorn.wheel2);
    racer.wheel2DIM = [44, 43];
    racer.wheel2CR = [racer.vehicleTL[0] + 115, racer.vehicleTL[1] + 151];
    racer.wheel2TL = [racer.wheel2CR[0] - 22, racer.wheel2CR[1] - 22];
    racer.wheel2Theta = Math.PI / 6;
    racer.wheel2Radius = 22;

    return racer;
}   

async function setupDarkPanther9999(racer) {

    racer.avatarTL = [-208 + 90 - 35, -123 - 28];
    racer.avatarDIM = [70, 70];
    console.log(IMAGES_BASE64);
    racer.vehicle = getImage(IMAGES_BASE64.DarkPanther9999.vehicule);
    racer.vehicleTL = [-208 - 18, -123];
    racer.vehicleDIM = [208, 123];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 100.4, -200 + 23.73];
    racer.boostDIM = [259.6, 200];

    racer.customDraw = () => {
        if (racer.showBoost) {
            drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        ctx.clip()
        if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();


        drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
    }

    return racer;
}

async function setupTheSolid7(racer) {
    racer.avatarTL = [-231 + 145 - 35, -85 - 40];
    racer.avatarDIM = [70, 70];
    console.log(IMAGES_BASE64);
    racer.vehicle = getImage(IMAGES_BASE64.thesolid7.vehicule);
    racer.vehicleTL = [-231 - 18, -85];
    racer.vehicleDIM = [231, 85];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 100.4, -200 + 23.73];
    racer.boostDIM = [259.6, 200];

    racer.customDraw = () => {
        if (racer.showBoost) {
            drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        ctx.clip()
        if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();


        drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
    }

    return racer;
}

async function genNowImABelieverCar(racer) {
    racer.avatarTL = [-200 + 54.043, -90 - 68.690];
    racer.avatarDIM = [90, 90];

    racer.vehicle = getImage(IMAGES_BASE64.assets.now_i_am_believer_vehicle);
    racer.vehicleTL = [-200, -200];
    racer.vehicleDIM = [200, 200];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 60.099, -200 + 26.764];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.assets.now_i_am_believer_wheel1);
    racer.wheel1TL = [-200, -200];
    racer.wheel1DIM = [200, 200];
    racer.wheel1CR = [-200 + 44.29, -30];
    racer.wheel1Theta = -Math.PI / 4;
    racer.wheel1Radius = 30;
    racer.wheel1ThetaDot = -1;

    racer.wheel2 = getImage(IMAGES_BASE64.assets.now_i_am_believer_wheel2);
    racer.wheel2TL = [-200, -200];
    racer.wheel2DIM = [200, 200];
    racer.wheel2CR = [-200 + 135.71, -30];
    racer.wheel2Theta = -Math.PI / 8;
    racer.wheel2Radius = 30;
    racer.wheel2ThetaDot = -1;

    racer.wheel3 = getImage(IMAGES_BASE64.assets.now_i_am_believer_wheel3);
    racer.wheel3TL = [-200, -200];
    racer.wheel3DIM = [200, 200];
    racer.wheel3CR = [-200 + 48.57, -25];
    racer.wheel3Theta = Math.PI / 8;
    racer.wheel3Radius = 30;
    racer.wheel3ThetaDot = 1;

    racer.wheel4 = getImage(IMAGES_BASE64.assets.now_i_am_believer_wheel4);
    racer.wheel4TL = [-200, -200];
    racer.wheel4DIM = [200, 200];
    racer.wheel4CR = [-200 + 136.07, -25];
    racer.wheel4Theta = 0;
    racer.wheel4Radius = 30;
    racer.wheel4ThetaDot = 1;

    racer.customUpdate = (curTime) => {
        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
            racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
            racer.wheel1ThetaDot *= -1;
        } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
            racer.wheel1Theta = - racer.wheel1Theta;
            racer.wheel1ThetaDot *= -1;
        }

        racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
            racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
            racer.wheel2ThetaDot *= -1;
        } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
            racer.wheel2Theta = - racer.wheel2Theta;
            racer.wheel2ThetaDot *= -1;
        }

        racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * racer.wheel3ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel3Theta < 0 && racer.wheel3ThetaDot === -1) {
            racer.wheel3Theta = - racer.wheel3Theta;
            racer.wheel3ThetaDot *= -1;
        } else if (racer.wheel3Theta > Math.PI / 2 && racer.wheel3ThetaDot === 1) {
            racer.wheel3Theta = 2 * Math.PI / 2 - racer.wheel3Theta;
            racer.wheel3ThetaDot *= -1;
        }

        racer.wheel4Theta += racer.vel[0] / racer.wheel4Radius * racer.wheel4ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel4Theta < 0 && racer.wheel4ThetaDot === -1) {
            racer.wheel4Theta = - racer.wheel4Theta;
            racer.wheel4ThetaDot *= -1;
        } else if (racer.wheel4Theta > Math.PI / 2 && racer.wheel4ThetaDot === 1) {
            racer.wheel4Theta = 2 * Math.PI / 2 - racer.wheel4Theta;
            racer.wheel4ThetaDot *= -1;
        }
    }

    racer.customDraw = () => {
        if (racer.showBoost) {
            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        // draw avatar
        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();

        // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel1Theta);	// rotate
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
        if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
        ctx.rotate(-racer.wheel1Theta); // undo rotation
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

        // draw wheel 2
        ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
        ctx.rotate(racer.wheel2Theta);	// rotate
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
        if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
        ctx.translate(...racer.wheel2CR); // translate back
        ctx.rotate(-racer.wheel2Theta); // undo rotation
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

        // draw vehicle
        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        // draw wheel 3
        ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel3Theta);	// rotate
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
        if (racer.wheel3) ctx.drawImage(racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
        ctx.translate(...racer.wheel3CR); // translate back
        ctx.rotate(-racer.wheel3Theta); // undo rotation
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back

        // draw wheel 4
        ctx.translate(...racer.wheel4CR); // translate to center of rotation for wheel
        ctx.rotate(racer.wheel4Theta);	// rotate
        ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation
        if (racer.wheel4) ctx.drawImage(racer.wheel4, ...racer.wheel4TL, ...racer.wheel4DIM); // draw wheel
        ctx.translate(...racer.wheel4CR); // translate back
        ctx.rotate(-racer.wheel4Theta); // undo rotation
        ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation back
    }
    return racer;
}

async function setupTHORpine(racer) {
    let THORpineRandomVehicle = Math.random() < 0.5 ? 'pompe' : 'chariot';
    // THORpineRandomVehicle =  'chariot';
    let THORpine = {};
    switch (THORpineRandomVehicle) {
        case 'pompe':
            THORpine.avatarTL = [-236 + 50.12, -133 + 37];
            THORpine.avatarTheta = Math.PI / 6;
            THORpine.avatarRadius = 37.5;
            THORpine.avatarDIM = [75, 75];
            THORpine.avatarCR = [-236 + 87, -133 + 74.5];

            THORpine.vehicle = getImage(IMAGES_BASE64.THORpine.pompe.vehicule);
            THORpine.vehicleTL = [-236, -133];
            THORpine.vehicleDIM = [236, 133];

            THORpine.vehicleAdd = getImage(IMAGES_BASE64.THORpine.pompe.grid);
            THORpine.vehicleAddTL = [-236 + 44, -133 + 33];
            THORpine.vehicleAddDIM = [85, 74];

            THORpine.showBoost = false;
            THORpine.boost = defaultDrawings.boost;
            THORpine.boostTL = [-200 - 47.4, -200 + 20.87];
            THORpine.boostDIM = [259.6, 200];

            THORpine.wheel1 = getImage(IMAGES_BASE64.THORpine.pompe.wheel1);
            THORpine.wheel1TL = [-236 + 12 -9.5, -133 + 38 -9.5];
            THORpine.wheel1DIM = [19, 19];
            THORpine.wheel1CR = [-236 + 12, -133 + 38];
            THORpine.wheel1Theta = Math.PI / 6;
            THORpine.wheel1Radius = 9.5;

            THORpine.wheel2 = getImage(IMAGES_BASE64.THORpine.pompe.wheel2);
            THORpine.wheel2TL = [-236 + 12 - 8.5, -133 + 89 - 8.5];
            THORpine.wheel2DIM = [17, 17];
            THORpine.wheel2CR = [-236 + 12, -133 + 89];
            THORpine.wheel2Theta = Math.PI / 6;
            THORpine.wheel2Radius = 8.5;

            THORpine.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                    
                // Rotation de l'avatar
                ctx.save();
                ctx.translate(...racer.avatarCR);
                ctx.rotate(racer.avatarTheta);
                ctx.translate(-racer.avatarCR[0], -racer.avatarCR[1]);
                
                ctx.beginPath();
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                ctx.clip();
                drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                ctx.drawImage(racer.vehicleAdd, ...racer.vehicleAddTL, ...racer.vehicleAddDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR);
                ctx.rotate(racer.wheel2Theta);
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

            }

            THORpine.customUpdate = (curTime) => {              
                // Fait tourner l'avatar en fonction de la vitesse
                racer.avatarTheta -= racer.vel[0] / racer.avatarRadius * (curTime - racer.time) / 1000;
                racer.avatarTheta = racer.avatarTheta % (2 * Math.PI);

                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);
                racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI);
            }
            break;
        case 'chariot':                    
            THORpine.avatarTL = [-228, -115];
            THORpine.avatarTheta = Math.PI / 6;
            THORpine.avatarRadius = 37.5;
            THORpine.avatarDIM = [75, 75];
            THORpine.avatarCR = [-198, -70];

            THORpine.vehicle = getImage(IMAGES_BASE64.THORpine.chariot.vehicule);
            THORpine.vehicleTL = [-198, -212];
            THORpine.vehicleDIM = [198, 212];

            THORpine.showBoost = false;
            THORpine.boost = defaultDrawings.boost;
            THORpine.boostTL = [-200 - 47.4, -200 + 20.87];
            THORpine.boostDIM = [259.6, 200];

            THORpine.wheel1 = getImage(IMAGES_BASE64.THORpine.chariot.wheel1);
            THORpine.wheel1DIM = [70, 58];
            THORpine.wheel1CR = [THORpine.vehicleTL[0] + 168, THORpine.vehicleTL[1] + 195];
            THORpine.wheel1TL = [THORpine.wheel1CR[0] - THORpine.wheel1DIM[0]/2, THORpine.wheel1CR[1] - THORpine.wheel1DIM[1]/2];
            THORpine.wheel1Theta = Math.PI / 6;
            THORpine.wheel1Radius = 35;

            THORpine.manche = getImage(IMAGES_BASE64.THORpine.chariot.manche);
            THORpine.mancheTL = [-190, -90];
            THORpine.mancheDIM = [52, 13];

                            
            // Ajout du choux qui tombe
            THORpine.fallingChoux = getImage(IMAGES_BASE64.THORpine.chariot.choux);
            THORpine.fallingChouxTL = [-75, -130]; // Même position initiale que THORpine.choux
            THORpine.fallingChouxDIM = [42*0.9, 46*0.9];
            THORpine.fallingChouxTheta = 0; // Pour la rotation
            THORpine.fallingChouxTimer = 0; // Pour gérer le cycle de 10s
            THORpine.fallingChouxState = 'waiting'; // États: waiting, falling, rolling
            THORpine.fallingChouxSpeed = { x: 0, y: 0 }; // Vitesse de chute
            THORpine.fallingChouxRotationSpeed = 0; // Vitesse de rotation

            ratio = 0.85;

            THORpine.choux = getImage(IMAGES_BASE64.THORpine.chariot.choux);
            THORpine.chouxTL = [-75, -130];
            THORpine.chouxDIM = [42*ratio, 46*ratio];
            THORpine.chouxOffset = 0; // Pour l'animation
            THORpine.chouxAmplitude = 5; // Amplitude du mouvement
            THORpine.chouxSpeed = 12; // Vitesse de l'animation
            

            THORpine.vehicleAdd = getImage(IMAGES_BASE64.THORpine.chariot.chouxArriere);
            THORpine.vehicleAddTL = [-133, -131];
            THORpine.vehicleAddDIM = [100, 55];

            THORpine.choux3 = getImage(IMAGES_BASE64.THORpine.chariot.choux1);
            THORpine.choux3TL = [-101, -108];
            THORpine.choux3DIM = [46*ratio, 41*ratio];
            THORpine.choux3Offset = 0; // Pour l'animation
            THORpine.choux3Amplitude = 8; // Amplitude du mouvement

            THORpine.choux4 = getImage(IMAGES_BASE64.THORpine.chariot.choux2);
            THORpine.choux4TL = [-130, -128];
            THORpine.choux4DIM = [41*ratio, 46*ratio];
            THORpine.choux4Offset = 0; // Pour l'animation
            THORpine.choux4Amplitude = 5; // Amplitude du mouvement

            THORpine.choux2 = getImage(IMAGES_BASE64.THORpine.chariot.choux);
            THORpine.choux2TL = [-148, -96];
            THORpine.choux2DIM = [42, 46];
            THORpine.choux2CR = [-8, -124];
            THORpine.choux2Theta = Math.PI / 6;
            THORpine.choux2Radius = 13;

            THORpine.customDraw = () => {
                ctx.drawImage(racer.vehicleAdd, ...racer.vehicleAddTL, ...racer.vehicleAddDIM);
                ctx.drawImage(racer.choux, ...racer.chouxTL, ...racer.chouxDIM);
                ctx.drawImage(racer.choux4, ...racer.choux4TL, ...racer.choux4DIM);
                ctx.drawImage(racer.choux3, ...racer.choux3TL, ...racer.choux3DIM);
                ctx.drawImage(racer.manche, ...racer.mancheTL, ...racer.mancheDIM);
                    
                // Rotation de l'avatar
                ctx.save();
                ctx.translate(...racer.avatarCR);
                ctx.rotate(racer.avatarTheta);
                ctx.translate(-racer.avatarCR[0], -racer.avatarCR[1]);
                
                ctx.beginPath();
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                ctx.clip();
                drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();                        
                
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // Dessin du choux qui tombe
                if (racer.fallingChouxState !== 'waiting') {
                    ctx.save();
                    ctx.translate(
                        racer.fallingChouxTL[0] + racer.fallingChouxDIM[0]/2, 
                        racer.fallingChouxTL[1] + racer.fallingChouxDIM[1]/2
                    );
                    ctx.rotate(racer.fallingChouxTheta);
                    ctx.drawImage(
                        racer.fallingChoux, 
                        -racer.fallingChouxDIM[0]/2, 
                        -racer.fallingChouxDIM[1]/2, 
                        racer.fallingChouxDIM[0], 
                        racer.fallingChouxDIM[1]
                    );
                    ctx.restore();
                }
            }
            THORpine.customUpdate = (curTime) => {
                const wheelRotationSpeed = racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;

                racer.wheel1Theta += wheelRotationSpeed;
                racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);

                // Gestion du choux qui tombe
                racer.fallingChouxTimer += (curTime - racer.time);
                
                // Réinitialisation toutes les 10 secondes
                if (racer.fallingChouxTimer >= 10000) {
                    racer.fallingChouxTimer = 0;
                    racer.fallingChouxState = 'falling';
                    racer.fallingChouxTL = [-75, -130]; // Position initiale
                    racer.fallingChouxTheta = 0;
                    racer.fallingChouxSpeed = { x: -2, y: 2 }; // Vitesse initiale
                }

                // Animation de chute
                if (racer.fallingChouxState === 'falling') {
                    racer.fallingChouxTL[0] += racer.fallingChouxSpeed.x;
                    racer.fallingChouxTL[1] += racer.fallingChouxSpeed.y;
                    racer.fallingChouxTheta += wheelRotationSpeed * 2;
                    racer.fallingChouxSpeed.y += 0.2; // Gravité
        
                    // Détection du sol (bas du véhicule)
                    if (racer.fallingChouxTL[1] >= racer.vehicleTL[1] + racer.vehicleDIM[1] - racer.fallingChouxDIM[1]) {
                        racer.fallingChouxState = 'rolling';
                        racer.fallingChouxTL[1] = racer.vehicleTL[1] + racer.vehicleDIM[1] - racer.fallingChouxDIM[1];
                        racer.fallingChouxSpeed = { x: -3, y: 0 };
                    }
                }
        
                // Animation de roulement
                if (racer.fallingChouxState === 'rolling') {
                    racer.fallingChouxTL[0] += racer.fallingChouxSpeed.x;
                    racer.fallingChouxTheta += wheelRotationSpeed * 3;
        
                    // Ralentissement progressif
                    // racer.fallingChouxSpeed.x *= 0.99;
        
                    // Arrêt quand le choux sort de l'écran
                    if (racer.fallingChouxTL[0] < -1600) {
                        racer.fallingChouxState = 'waiting';
                    }
                }

                // Fait tourner l'avatar en fonction de la vitesse
                racer.avatarTheta -= racer.vel[0] / racer.avatarRadius * (curTime - racer.time) / 1000;
                racer.avatarTheta = racer.avatarTheta % (2 * Math.PI);

                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);

                racer.choux2Theta += racer.vel[0] / racer.choux2Radius * (curTime - racer.time) / 1000;
                racer.choux2Theta = racer.choux2Theta % (2 * Math.PI);

                // Animation des choux
                racer.chouxOffset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                // Calcul du déplacement vertical
                const chouxY = Math.sin(racer.chouxOffset) * racer.chouxAmplitude;
                // Mise à jour des positions
                racer.chouxTL[1] = -130 + chouxY;

                // Animation des choux
                racer.choux3Offset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                // Calcul du déplacement vertical
                const choux3Y = Math.sin(racer.choux3Offset) * racer.choux3Amplitude;
                // Mise à jour des positions
                racer.choux3TL[1] = -138 + choux3Y;

                // Animation des choux
                racer.choux4Offset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                // Calcul du déplacement vertical
                const choux4Y = Math.sin(racer.choux4Offset) * racer.choux4Amplitude;
                // Mise à jour des positions
                racer.choux4TL[1] = -128 + choux4Y; 
            }
            break;
        }
    
    return THORpine;
}

async function setupApocalypseSquirrel(racer) {
    racer.avatarTL = [-200 + 20, -105];
    racer.avatarDIM = [80, 80];

    racer.vehicle = getImage(IMAGES_BASE64.Squirrel.vehicule);
    racer.vehicleTL = [-200 - 12, -200];
    racer.vehicleDIM = [200, 200];
    
    racer.vehicle_background = getImage(IMAGES_BASE64.Squirrel.vehicule_inside);
    racer.vehicle_backgroundTL = [-200 - 12, -200];
    racer.vehicle_backgroundDIM = [200, 200];

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 47.4, -200 + 20.87];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.Squirrel.wheel1);
    racer.wheel1TL = [-200 - 12, -200];
    racer.wheel1DIM = [200, 200];
    racer.wheel1CR = [-200 + 35, -21.29];
    racer.wheel1Theta = Math.PI / 6;
    racer.wheel1Radius = 19.29;

    //Front wheel
    racer.wheel2 = getImage(IMAGES_BASE64.Squirrel.wheel2);
    racer.wheel2TL = [-200 - 12, -200];
    racer.wheel2DIM = [200, 200];
    racer.wheel2CR = [-200 + 120.71, -21.29];
    racer.wheel2Theta = Math.PI / 6;
    racer.wheel2Radius = 19.29;

    racer.customDraw = () => {
        
        let vehicle_background = getImage(IMAGES_BASE64.Squirrel.vehicule_inside);
        let vehicle_backgroundTL = [-200 - 12, -200];
        let vehicle_backgroundDIM = [200, 200];
    
        if (racer.showBoost) {
            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }
        
        //if (racer.vehicle_background && racer.vehicle_background.src) 
        ctx.drawImage(vehicle_background, ...vehicle_backgroundTL, ...vehicle_backgroundDIM);

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();

        
        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);// draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel1Theta);	// rotate
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
        if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
        ctx.rotate(-racer.wheel1Theta); // undo rotation
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

        // draw wheel 2
        ctx.translate(...racer.wheel2CR);
        ctx.rotate(racer.wheel2Theta);
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
        if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
        ctx.translate(...racer.wheel2CR); // translate back
        ctx.rotate(-racer.wheel2Theta); // undo rotation
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
    }    
    
    return racer;
}

async function setupSpiderSaucisse(racer) {    
    racer.avatarTL = [(-200 + 91.043), (-90 - 58.690)];
    racer.avatarDIM = [90, 90];

    racer.vehicle = getImage(IMAGES_BASE64.SpiderSaucisse.vehicule);
    racer.vehicleTL = [(-200), (-190)];
    racer.vehicleDIM = [200, 200];

    // Système de lasers
    racer.lasers = []; // Array pour stocker les lasers actifs
    racer.lastLaserTime = Date.now(); // Temps du dernier tir
    racer.laserInterval = 2000; // Intervalle de 2 secondes entre les paires de tirs
    racer.laserDelay = 200; // Délai de 0.2 seconde entre les deux lasers d'une paire
    racer.secondLaserFired = false; // Pour suivre si le deuxième laser a été tiré
    racer.laserDIM = [40, 4]; // Dimensions des lasers (longueur, hauteur)

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [(-200 - 60.099), (-200 + 26.764)];
    racer.boostDIM = [259.6, 200];

    racer.wheel1 = getImage(IMAGES_BASE64.SpiderSaucisse.back_paw_back);
    racer.wheel1TL = [(-200), (-200)];
    racer.wheel1DIM = [200, 200];
    racer.wheel1CR = [(-200 + 25), (-45)];
    racer.wheel1Theta = -Math.PI / 4;
    racer.wheel1Radius = 42;
    racer.wheel1ThetaDot = -1;

    racer.wheel2 = getImage(IMAGES_BASE64.SpiderSaucisse.front_paw_back);
    racer.wheel2TL = [(-200), (-200)];
    racer.wheel2DIM = [200, 200];
    racer.wheel2CR = [(-200 + 91), (-45)];
    racer.wheel2Theta = -Math.PI / 8;
    racer.wheel2Radius = 42;
    racer.wheel2ThetaDot = -1;

    racer.wheel3 = getImage(IMAGES_BASE64.SpiderSaucisse.back_paw_front);
    racer.wheel3TL = [(-200), (-200)];
    racer.wheel3DIM = [200, 200];
    racer.wheel3CR = [(-200 + 30), (-45)];
    racer.wheel3Theta = Math.PI / 8;
    racer.wheel3Radius = 42;
    racer.wheel3ThetaDot = 1;

    racer.wheel4 = getImage(IMAGES_BASE64.SpiderSaucisse.front_paw_front);
    racer.wheel4TL = [(-200), (-200)];
    racer.wheel4DIM = [200, 200];
    racer.wheel4CR = [(-200 + 95), (-45)];
    racer.wheel4Theta = 0;
    racer.wheel4Radius = 42;
    racer.wheel4ThetaDot = 1;

    racer.customUpdate = (curTime) => {
        // Vérifier s'il faut créer un nouveau laser
        if (curTime - racer.lastLaserTime >= racer.laserInterval) {
            // Premier laser de la paire
            racer.lasers.push({
                x: racer.vehicleTL[0] + racer.vehicleDIM[0] - 20, // Position de départ (droite du véhicule)
                y: racer.vehicleTL[1] + racer.vehicleDIM[1]/2 + 28, // Premier laser légèrement au-dessus
                speed: racer.vel[0] + 50 // Vitesse = vitesse du véhicule + 50
            });
            racer.lastLaserTime = curTime;
            racer.secondLaserFired = false;
        } else if (!racer.secondLaserFired && curTime - racer.lastLaserTime >= racer.laserDelay) {
            // Deuxième laser de la paire, 0.2 seconde après le premier
            racer.lasers.push({
                x: racer.vehicleTL[0] + racer.vehicleDIM[0] - 20,
                y: racer.vehicleTL[1] + racer.vehicleDIM[1]/2 + 36, // Deuxième laser légèrement en-dessous
                speed: racer.vel[0] + 50
            });
            racer.secondLaserFired = true;
        }

        // Mettre à jour la position de chaque laser
        racer.lasers.forEach(laser => {
            laser.x += laser.speed * (curTime - racer.time) / 1000;
        });

        // Supprimer les lasers qui sont trop loin
        racer.lasers = racer.lasers.filter(laser => 
            laser.x < racer.vehicleTL[0] + 2000
        );

        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
            racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
            racer.wheel1ThetaDot *= -1;
        } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
            racer.wheel1Theta = - racer.wheel1Theta;
            racer.wheel1ThetaDot *= -1;
        }

        racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
            racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
            racer.wheel2ThetaDot *= -1;
        } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
            racer.wheel2Theta = - racer.wheel2Theta;
            racer.wheel2ThetaDot *= -1;
        }

        racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * racer.wheel3ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel3Theta < 0 && racer.wheel3ThetaDot === -1) {
            racer.wheel3Theta = - racer.wheel3Theta;
            racer.wheel3ThetaDot *= -1;
        } else if (racer.wheel3Theta > Math.PI / 2 && racer.wheel3ThetaDot === 1) {
            racer.wheel3Theta = 2 * Math.PI / 2 - racer.wheel3Theta;
            racer.wheel3ThetaDot *= -1;
        }

        racer.wheel4Theta += racer.vel[0] / racer.wheel4Radius * racer.wheel4ThetaDot * (curTime - racer.time) / 1000;
        if (racer.wheel4Theta < 0 && racer.wheel4ThetaDot === -1) {
            racer.wheel4Theta = - racer.wheel4Theta;
            racer.wheel4ThetaDot *= -1;
        } else if (racer.wheel4Theta > Math.PI / 2 && racer.wheel4ThetaDot === 1) {
            racer.wheel4Theta = 2 * Math.PI / 2 - racer.wheel4Theta;
            racer.wheel4ThetaDot *= -1;
        }
    }
    racer.customDraw = () => {
        // Dessin des lasers
        ctx.save();
        ctx.fillStyle = 'red';
        racer.lasers.forEach(laser => {
            ctx.fillRect(laser.x, laser.y, racer.laserDIM[0], racer.laserDIM[1]);
        });
        ctx.restore();

        if (racer.showBoost) {
            drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        // draw avatar
        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();

        // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel1Theta);	// rotate
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
        if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
        ctx.translate(...racer.wheel1CR); // translate back
        ctx.rotate(-racer.wheel1Theta); // undo rotation
        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

        // draw wheel 2
        ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
        ctx.rotate(racer.wheel2Theta);	// rotate
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
        if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
        ctx.translate(...racer.wheel2CR); // translate back
        ctx.rotate(-racer.wheel2Theta); // undo rotation
        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

        // draw vehicle
        drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        // draw wheel 3
        ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
        ctx.rotate(racer.wheel3Theta);	// rotate
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
        if (racer.wheel3) drawToCanvas(ctx, racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
        ctx.translate(...racer.wheel3CR); // translate back
        ctx.rotate(-racer.wheel3Theta); // undo rotation
        ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back

        // draw wheel 4
        ctx.translate(...racer.wheel4CR); // translate to center of rotation for wheel
        ctx.rotate(racer.wheel4Theta);	// rotate
        ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation
        if (racer.wheel4) drawToCanvas(ctx, racer.wheel4, ...racer.wheel4TL, ...racer.wheel4DIM); // draw wheel
        ctx.translate(...racer.wheel4CR); // translate back
        ctx.rotate(-racer.wheel4Theta); // undo rotation
        ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation back
    }
    
    return racer;
}

async function setupVerth987Car(racer) {
    
    // Sélection aléatoire entre les deux voitures (50% de chance chacune)
    const useVehicle2 = Math.random() < 0.5;

    if (useVehicle2) {
        // Voiture 2
        racer.vehicle = getImage(IMAGES_BASE64.assets.verth_vehicle2);
        racer.vehicleTL = [-200 - 96.5 - 8, -300];
        racer.vehicleDIM = [193, 196];
        
        // Avatar à 290x267 par rapport au coin top left de l'image
        racer.avatarTL = [racer.vehicleTL[0] + 160, racer.vehicleTL[1] + 137];
        racer.avatarDIM = [69, 69];
    } else {
        // Voiture 1 (configuration originale)
        racer.vehicle = getImage(IMAGES_BASE64.assets.verth_vehicle);
        racer.avatarTL = [-200 - 8 - 8, -69 - 63.7];
        racer.avatarDIM = [69, 69];

        racer.vehicleTL = [-200 - 100 - 8, -300];
        racer.vehicleDIM = [300, 300];
    }

    racer.showBoost = false;
    racer.boost = defaultDrawings.boost;
    racer.boostTL = [-200 - 182 - 8, -200 + 5.56];
    racer.boostDIM = [259.6, 200];

    racer.customDraw = () => {
        if (racer.showBoost) {
            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

        ctx.save()
        ctx.beginPath()
        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
        
        ctx.clip()
        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
        ctx.closePath();
        ctx.restore();
    }
    
    return racer;
}

async function genAndythefrenchyCar(racer) {
    if(!andyRotateCar) andyCar = Math.floor(Math.random() * andyCarNumber) + 1;
    // ["Carriage", "Chest", "Cuzy", "RainbowDash", "Guitare", "Pacman", "TRex", "dAndy", "Nezubot"]
    // andyCar = 9;

    // Car 1 attributes Carriage
    racer.avatarTL = [(-200 + 91.043), (-90 - 58.690)];
    racer.avatarDIM = [0, 0];

    let paddingY = -300;

    racer.vehicle = getImage(IMAGES_BASE64.AndyCars.Carriage.vehicule);
    racer.car1_vehicle = getImage(IMAGES_BASE64.AndyCars.Carriage.vehicule);
    racer.car1_vehicleTL = [(-342), (-271 + 50 + paddingY)];
    racer.car1_vehicleDIM = [342, 201];

    racer.car1_chantal = getImage(IMAGES_BASE64.AndyCars.Carriage.chantal);
    racer.car1_chantalTL = [(-411), (-185 + 50 + paddingY)];
    racer.car1_chantalDIM = [111, 92];   

    racer.car1_wheel1 = getImage(IMAGES_BASE64.AndyCars.Carriage.wheel);
    racer.car1_wheel1TL = [-105, -145 + 50 + paddingY];
    racer.car1_wheel1DIM = [105, 105];
    racer.car1_wheel1CR = [-52.5, -92.5 + 50 + paddingY];
    racer.car1_wheel1Theta = 0;
    racer.car1_wheel1Radius = 52.5;

    racer.car1_wheel2 = racer.car1_wheel1;
    racer.car1_wheel2TL = [-345, -145 + 50 + paddingY];
    racer.car1_wheel2DIM = [105, 105];
    racer.car1_wheel2CR = [-292.5, -92.5 + 50 + paddingY];
    racer.car1_wheel2Theta = 0;
    racer.car1_wheel2Radius = 52.5;

    racer.car1_wheel3 = getImage(IMAGES_BASE64.AndyCars.Carriage.chantal_leg1);
    racer.car1_wheel3TL = [(-387), (-64 + paddingY)];
    racer.car1_wheel3DIM = [57, 77];
    racer.car1_wheel3CR = [(-370), -50 + paddingY];
    racer.car1_wheel3Theta = Math.PI / 8;
    racer.car1_wheel3Radius = 42;
    racer.car1_wheel3ThetaDot = 1;

    racer.car1_wheel4 = getImage(IMAGES_BASE64.AndyCars.Carriage.chantal_leg2);
    racer.car1_wheel4TL = [(-420), (-70 + paddingY)];
    racer.car1_wheel4DIM = [55, 67];
    racer.car1_wheel4CR = [(-370), (-70 + paddingY)];
    racer.car1_wheel4Theta = -Math.PI / 8;
    racer.car1_wheel4Radius = 42;
    racer.car1_wheel4ThetaDot = 1;

    // Car 2 attributes Chest
    racer.car2_avatarTL = [(-200 + 91.043), (-90 - 58.690 + paddingY)];
    racer.car2_avatarDIM = [0, 0];

    racer.car2_vehicle = getImage(IMAGES_BASE64.AndyCars.Chest.vehicule);
    racer.car2_vehicleTL = [(-200), (-178 - 25 + paddingY)];
    racer.car2_vehicleDIM = [200, 178];
    
    racer.car2_wheel3 = getImage(IMAGES_BASE64.AndyCars.Chest.top);
    racer.car2_wheel3TL = [(-200), (-208 - 25 + paddingY)];
    racer.car2_wheel3DIM = [200, 92];
    racer.car2_wheel3CR = [-200, -115 - 25 + paddingY];
    racer.car2_wheel3Theta = Math.PI / 8;
    racer.car2_wheel3Radius = 42;
    racer.car2_wheel3ThetaDot = 1;

    racer.car2_wheel1 = getImage(IMAGES_BASE64.AndyCars.Chest.wheel1);
    racer.car2_wheel1TL = [-200, -25 - 25 + paddingY];
    racer.car2_wheel1DIM = [50, 50];
    racer.car2_wheel1CR = [-175, -25 + paddingY];
    racer.car2_wheel1Theta = 0;
    racer.car2_wheel1Radius = 25;

    racer.car2_wheel2 = getImage(IMAGES_BASE64.AndyCars.Chest.wheel2);
    racer.car2_wheel2TL = [-50, -25 - 25 + paddingY];
    racer.car2_wheel2DIM = [50, 50];
    racer.car2_wheel2CR = [-25, -25 + paddingY];
    racer.car2_wheel2Theta = 0;
    racer.car2_wheel2Radius = 25;

    // Car 3 attributes Cuzy
    racer.car3_avatarTL = [(-400 + 91.043), (-90 - 58.690 + paddingY)];
    racer.car3_avatarDIM = [0, 0];

    racer.car3_vehicle = getImage(IMAGES_BASE64.AndyCars.Cuzy.vehicule);
    racer.car3_vehicleTL = [(-400), (-137 - 25 + paddingY)];
    racer.car3_vehicleDIM = [400, 137];

    racer.car3_wheel1 = getImage(IMAGES_BASE64.AndyCars.Cuzy.wheel1);
    racer.car3_wheel1TL = [-390, -52 - 25 + paddingY];
    racer.car3_wheel1DIM = [58, 58];
    racer.car3_wheel1CR = [-390 + 58/2, -52 - 25 + 58/2 + paddingY  ];
    racer.car3_wheel1Theta = 0;
    racer.car3_wheel1Radius = 58/2;
    
    racer.car3_wheel2 = getImage(IMAGES_BASE64.AndyCars.Cuzy.wheel2);
    racer.car3_wheel2TL = [-400 + 315 - 28, -25 - 25 - 28 + paddingY];
    racer.car3_wheel2DIM = [56, 56];
    racer.car3_wheel2CR = [-400 + 315 - 28 + 56/2, -25 - 25 - 28 + 56/2 + paddingY  ];
    racer.car3_wheel2Theta = 0;
    racer.car3_wheel2Radius = 56/2;

    // Car 4 attributes Rainbow Dash
    racer.car4_avatarTL = [(-400 + 91.043), (-90 - 58.690)];
    racer.car4_avatarDIM = [0, 0];

    racer.car4_vehicle = getImage(IMAGES_BASE64.AndyCars.RainbowDash.vehicule);
    racer.car4_vehicleTL = [(-200), (-511 - 25)];
    racer.car4_vehicleDIM = [200, 135];

    racer.car4_wing_front = getImage(IMAGES_BASE64.AndyCars.RainbowDash.wing_front);
    racer.car4_wing_frontTL = [(-200), (-511 - 25 )];
    racer.car4_wing_frontDIM = [200, 135];
    racer.car4_wing_frontCR = [(-92), (-511 - 25+101 )];
    racer.car4_wing_frontTheta = -Math.PI / 6;
    racer.car4_wing_frontRadius = 45;
    racer.car4_wing_frontThetaDot = -1;

    racer.car4_wing_back = getImage(IMAGES_BASE64.AndyCars.RainbowDash.wing_back);
    racer.car4_wing_backTL = [(-200), (-511 - 25)];
    racer.car4_wing_backDIM = [200, 135];
    racer.car4_wing_backCR = [(-92), (-511 - 25+98)];
    racer.car4_wing_backTheta = -Math.PI / 6;
    racer.car4_wing_backRadius = 45;
    racer.car4_wing_backThetaDot = -1;

    racer.car4_tail = getImage(IMAGES_BASE64.AndyCars.RainbowDash.tail);
    racer.car4_tailTL = [(-200), (-511 - 25)];
    racer.car4_tailDIM = [200, 135];

    racer.car4_andy = getImage(IMAGES_BASE64.AndyCars.RainbowDash.andy);
    racer.car4_andyTL = [(-200), (-511 - 25)];
    racer.car4_andyDIM = [200, 135];

    racer.car4_hat = getImage(IMAGES_BASE64.AndyCars.RainbowDash.hat);
    racer.car4_hatTL = [(-200), (-511 - 25 + 20)];
    racer.car4_hatDIM = [200, 135];
    racer.hat4OriginalTL = [(-200), (-511 - 25)];

    racer.car4_braid_long = getImage(IMAGES_BASE64.AndyCars.RainbowDash.braid_long);
    racer.car4_braid_longTL = [(-200), (-511 - 25)];
    racer.car4_braid_longDIM = [200, 135];
    racer.car4_braid_longCR = [(-92), (-511 - 25+28 )];
    racer.car4_braid_longTheta = -Math.PI / 8;
    racer.car4_braid_longRadius = 30;
    racer.car4_braid_longThetaDot = -1;

    racer.car4_braid_short = getImage(IMAGES_BASE64.AndyCars.RainbowDash.braid_short);
    racer.car4_braid_shortTL = [(-200), (-511 - 25)];
    racer.car4_braid_shortDIM = [200, 135];
    racer.car4_braid_shortCR = [(-79), (-511 - 25+35 )];
    racer.car4_braid_shortTheta = -Math.PI / 8;
    racer.car4_braid_shortRadius = 30;
    racer.car4_braid_shortThetaDot = -1;
    
    // Car 5 attributes Guitare
    racer.car5_vehicle = getImage(IMAGES_BASE64.AndyCars.Guitare.vehicule);
    racer.car5_vehicleTL = [(-300), (-200 - 25 + paddingY)];
    racer.car5_vehicleDIM = [300, 200];
    
    racer.car5_cloud = getImage(IMAGES_BASE64.AndyCars.Guitare.cloud);
    racer.car5_cloudTL = [(-300), (-115 - 25 + paddingY)];
    racer.car5_cloudDIM = [300, 115];

    racer.car6_pacmanClose = getImage(IMAGES_BASE64.AndyCars.Pacman.close);
    racer.car6_pacmanOpen = getImage(IMAGES_BASE64.AndyCars.Pacman.open);
    racer.car6_pacmanTL = [(-100), (-100 - 25 + paddingY)];
    racer.car6_pacmanDIM = [100, 100];

    // Car 6 attributes Pacman
    racer.car6_blue1 = getImage(IMAGES_BASE64.AndyCars.Pacman.blue1);
    racer.car6_blue2 = getImage(IMAGES_BASE64.AndyCars.Pacman.blue2);
    racer.car6_blueTL = [(-50 - 150), (-53 - 25 + paddingY)];
    racer.car6_blueDIM = [50, 53];

    racer.car6_pink1 = getImage(IMAGES_BASE64.AndyCars.Pacman.pink1);
    racer.car6_pink2 = getImage(IMAGES_BASE64.AndyCars.Pacman.pink2);
    racer.car6_pinkTL = [(-50 - 250), (-53 - 25 + paddingY)];
    racer.car6_pinkDIM = [50, 53]; 

    racer.car6_orange1 = getImage(IMAGES_BASE64.AndyCars.Pacman.orange1);
    racer.car6_orange2 = getImage(IMAGES_BASE64.AndyCars.Pacman.orange2);
    racer.car6_orangeTL = [(-50 - 350), (-53 - 25 + paddingY)];
    racer.car6_orangeDIM = [50, 53];   

    racer.car6_red1 = getImage(IMAGES_BASE64.AndyCars.Pacman.red1);
    racer.car6_red2 = getImage(IMAGES_BASE64.AndyCars.Pacman.red2);
    racer.car6_redTL = [(-50 - 450), (-53 - 25 + paddingY)];
    racer.car6_redDIM = [50, 53];   

    racer.car6_dot1 = getImage(IMAGES_BASE64.AndyCars.Chest.wheel1);
    racer.car6_dot2 = getImage(IMAGES_BASE64.AndyCars.Chest.wheel2);    
    racer.car6_dotTL1 = [(-50 + 100), (-53 - 43 + paddingY)];
    racer.car6_dotTL2 = [(-50 + 200), (-53 - 43 + paddingY)];
    racer.car6_dotTL3 = [(-50 + 300), (-53 - 43 + paddingY)];
    racer.car6_dotTL4 = [(-50 + 400), (-53 - 43 + paddingY)];  
    racer.car6_dotTL5 = [(-50 + 500), (-53 - 43 + paddingY)]; 

    racer.car6_dotDIM = [50, 53]; 
    racer.car6_state = 0;
    racer.car6_stateTime = Date.now();
    racer.car6_nbDotes = 10;

    racer.car7_vehicle = getImage(IMAGES_BASE64.AndyCars.TRex.vehicule);
    racer.car7_vehicleTL = [(-100), (-100 - 25 + paddingY)];
    racer.car7_vehicleDIM = [587, 348];

    racer.car7_andy = getImage(IMAGES_BASE64.AndyCars.TRex.Andy);
    racer.car7_andyTL = [(-100), (-100 - 25 + paddingY)];
    racer.car7_andyDIM = [278, 226];
    racer.car7_andyTheta = 0;
    racer.car7_andyThetaDot = -1;
    racer.car7_andyMaxTheta = Math.PI/6;
    racer.car7_andyRadius = 45;

    // Car 8 attributes dAndy
    racer.car8_vehicle1 = getImage(IMAGES_BASE64.AndyCars.dAndy.vehicule1);
    racer.car8_vehicle1TL = [(-100), (-100 - 25 + paddingY)];
    racer.car8_vehicle1DIM = [559/2, 355/2];

    racer.car8_vehicle2 = getImage(IMAGES_BASE64.AndyCars.dAndy.vehicule2);
    racer.car8_vehicle2TL = [(-100), (-100 - 25 + paddingY)];
    racer.car8_vehicle2DIM = [559/2, 355/2];

    racer.notesImages = [];
    racer.notesImages.push({img: getImage(IMAGES_BASE64.AndyCars.dAndy.notes.note1), height: 45, width: 45});
    racer.notesImages.push({img: getImage(IMAGES_BASE64.AndyCars.dAndy.notes.note2), height: 50, width: 96});
    racer.notesImages.push({img: getImage(IMAGES_BASE64.AndyCars.dAndy.notes.note3), height: 31, width: 50});
    racer.notesImages.push({img: getImage(IMAGES_BASE64.AndyCars.dAndy.notes.note4), height: 51, width: 51});

    racer.car8_state = 0;
    racer.car8_stateTime = Date.now();
    // Système de fireballs
    racer.fireballs = []; // Array pour stocker les fireballs actives
    racer.lastFireballTime = Date.now(); // Temps du dernier tir
    racer.fireballInterval = 2000; // Intervalle de 2 secondes entre les tirs
    racer.fireballDIM = [60, 60]; // Dimensions des fireballs

    // Car 9 attributes Nezubot
    racer.car9_avatarTL = [(-400 + 91.043), (-90 - 58.690 + paddingY)];
    racer.car9_avatarDIM = [0, 0];

    racer.car9_vehicle = getImage(IMAGES_BASE64.AndyCars.Nezubot.vehicule);
    racer.car9_vehicleTL = [(-170), (-248 - 25 + paddingY)];
    racer.car9_vehicleDIM = [170, 248]; 

    if (!racer.vel) racer.vel = [200, 0];
    //racer.vel[0] = 0;

    create_tail(racer.car4_vehicleTL);

    racer.customUpdate = async (curTime) => {
        /*switch(andyCar) {
            case 1:*/
                racer.car1_wheel1Theta += racer.vel[0] / racer.car1_wheel1Radius * (curTime - racer.time) / 1000;
                racer.car1_wheel1Theta = racer.car1_wheel1Theta % (2 * Math.PI);

                racer.car1_wheel2Theta += racer.vel[0] / racer.car1_wheel2Radius * (curTime - racer.time) / 1000;
                racer.car1_wheel2Theta = racer.car1_wheel2Theta % (2 * Math.PI);

                racer.car1_wheel3Theta += racer.vel[0] / racer.car1_wheel3Radius * racer.car1_wheel3ThetaDot * (curTime - racer.time) / 1000;
                if (racer.car1_wheel3Theta < -Math.PI / 2 && racer.car1_wheel3ThetaDot === -1) {
                    racer.car1_wheel3Theta = -2 * Math.PI / 2 - racer.car1_wheel3Theta;
                    racer.car1_wheel3ThetaDot *= -1;
                } else if (racer.car1_wheel3Theta > 0 && racer.car1_wheel3ThetaDot === 1) {
                    racer.car1_wheel3Theta = - racer.car1_wheel3Theta;
                    racer.car1_wheel3ThetaDot *= -1;
                }

                racer.car1_wheel4Theta += racer.vel[0] / racer.car1_wheel4Radius * racer.car1_wheel4ThetaDot * (curTime - racer.time) / 1000;
                if (racer.car1_wheel4Theta < -Math.PI / 2 && racer.car1_wheel4ThetaDot === -1) {
                    racer.car1_wheel4Theta = -2 * Math.PI / 2 - racer.car1_wheel4Theta;
                    racer.car1_wheel4ThetaDot *= -1;
                } else if (racer.car1_wheel4Theta > 0 && racer.car1_wheel4ThetaDot === 1) {
                    racer.car1_wheel4Theta = - racer.car1_wheel4Theta;
                    racer.car1_wheel4ThetaDot *= -1;
                }
               /* break;

            case 2:*/
                racer.car2_wheel1Theta += racer.vel[0] / racer.car2_wheel1Radius * (curTime - racer.time) / 1000;
                racer.car2_wheel1Theta = racer.car2_wheel1Theta % (2 * Math.PI);

                racer.car2_wheel2Theta += racer.vel[0] / racer.car2_wheel2Radius * (curTime - racer.time) / 1000;
                racer.car2_wheel2Theta = racer.car2_wheel2Theta % (2 * Math.PI);

                racer.car2_wheel3Theta += racer.vel[0] / racer.car2_wheel3Radius * racer.car2_wheel3ThetaDot * (curTime - racer.time) / 1000;
                if (racer.car2_wheel3Theta < -Math.PI / 2 && racer.car2_wheel3ThetaDot === -1) {
                    racer.car2_wheel3Theta = -2 * Math.PI / 2 - racer.car2_wheel3Theta;
                    racer.car2_wheel3ThetaDot *= -1;
                } else if (racer.car2_wheel3Theta > 0 && racer.car2_wheel3ThetaDot === 1) {
                    racer.car2_wheel3Theta = - racer.car2_wheel3Theta;
                    racer.car2_wheel3ThetaDot *= -1;
                }
             /*   break;

            case 3:*/
                racer.car3_wheel1Theta += racer.vel[0] / racer.car3_wheel1Radius * (curTime - racer.time) / 1000;
                racer.car3_wheel1Theta = racer.car3_wheel1Theta % (2 * Math.PI);

                racer.car3_wheel2Theta += racer.vel[0] / racer.car3_wheel2Radius * (curTime - racer.time) / 1000;
                racer.car3_wheel2Theta = racer.car3_wheel2Theta % (2 * Math.PI);
              /*  break;

            case 4:*/
                if (!racer.hatOffset) {
                    racer.hatOffset = 0;
                    racer.hatInitialTL = -511 - 35;
                    racer.hatDirection = 1;
                    racer.hatSpeed = 1;
                }

                racer.hatOffset += racer.hatSpeed * racer.hatDirection;

                if(Math.abs(racer.hatOffset) > 10) {
                    racer.hatDirection *= -1;
                }
                racer.car4_hatTL[1] = racer.hatInitialTL + racer.hatOffset;
                
                racer.car4_braid_longTheta += racer.vel[0] / racer.car4_braid_longRadius * racer.car4_braid_longThetaDot * (curTime - racer.time) / 1000;
                if (racer.car4_braid_longTheta < -Math.PI / 2 && racer.car4_braid_longThetaDot === -1) {
                    racer.car4_braid_longTheta = -2 * Math.PI / 2 - racer.car4_braid_longTheta;
                    racer.car4_braid_longThetaDot *= -1;
                } else if (racer.car4_braid_longTheta > 0 && racer.car4_braid_longThetaDot === 1) {
                    racer.car4_braid_longTheta = - racer.car4_braid_longTheta;
                    racer.car4_braid_longThetaDot *= -1;
                }
                
                racer.car4_braid_shortTheta += racer.vel[0] / racer.car4_braid_shortRadius * racer.car4_braid_shortThetaDot * (curTime - racer.time) / 1000;
                if (racer.car4_braid_shortTheta < -Math.PI / 2 && racer.car4_braid_shortThetaDot === -1) {
                    racer.car4_braid_shortTheta = -2 * Math.PI / 2 - racer.car4_braid_shortTheta;
                    racer.car4_braid_shortThetaDot *= -1;
                } else if (racer.car4_braid_shortTheta > 0 && racer.car4_braid_shortThetaDot === 1) {
                    racer.car4_braid_shortTheta = - racer.car4_braid_shortTheta;
                    racer.car4_braid_shortThetaDot *= -1;
                }

                racer.car4_wing_frontTheta += racer.vel[0] / racer.car4_wing_frontRadius * racer.car4_wing_frontThetaDot * (curTime - racer.time) / 1000;
                if (racer.car4_wing_frontTheta < -Math.PI / 2 && racer.car4_wing_frontThetaDot === -1) {
                    racer.car4_wing_frontTheta = -2 * Math.PI / 2 - racer.car4_wing_frontTheta;
                    racer.car4_wing_frontThetaDot *= -1;
                } else if (racer.car4_wing_frontTheta > 0 && racer.car4_wing_frontThetaDot === 1) {
                    racer.car4_wing_frontTheta = - racer.car4_wing_frontTheta;
                    racer.car4_wing_frontThetaDot *= -1;
                }   

                racer.car4_wing_backTheta += racer.vel[0] / racer.car4_wing_backRadius * racer.car4_wing_backThetaDot * (curTime - racer.time) / 1000;
                if (racer.car4_wing_backTheta < -Math.PI / 2 && racer.car4_wing_backThetaDot === -1) {
                    racer.car4_wing_backTheta = -2 * Math.PI / 2 - racer.car4_wing_backTheta;
                    racer.car4_wing_backThetaDot *= -1;
                } else if (racer.car4_wing_backTheta > 0 && racer.car4_wing_backThetaDot === 1) {
                    racer.car4_wing_backTheta = - racer.car4_wing_backTheta;
                    racer.car4_wing_backThetaDot *= -1;
                }   

                // Rotation continue basée sur la vitesse du véhicule
                if (!racer.car7_andyTheta) racer.car7_andyTheta = 0;
                
                // Vitesse de rotation proportionnelle à la vitesse du véhicule
                let rotationSpeed = racer.vel[0] / 100; // Ajuster ce diviseur pour changer la vitesse de rotation
                racer.car7_andyTheta += rotationSpeed * (curTime - racer.time) / 1000;
                
                // Garder l'angle entre 0 et 2π
                racer.car7_andyTheta = racer.car7_andyTheta % (2 * Math.PI);

                let dt = (curTime - racer.time) / 1000;
        
                // Mise à jour de la vitesse
                if (!racer.finished) {
                    racer.vel[0] += racer.acc[0] * dt;
                }
                if(andyCar == 8){
                    // Vérifier s'il faut créer une nouvelle fireball
                    if (curTime - racer.lastFireballTime >= racer.fireballInterval) {
                        // Créer une nouvelle fireball
                        racer.fireballs.push({
                            x: racer.car8_vehicle1TL[0] + racer.car8_vehicle1DIM[0], // Position de départ (droite du véhicule)
                            y: racer.car8_vehicle1TL[1] + racer.car8_vehicle1DIM[1]/2 - 30, // Aligné verticalement avec le véhicule
                            speed: racer.vel[0] + 200, // Vitesse = vitesse du véhicule + 50
                            flipTime: curTime,
                            isFlipped: false
                        });
                        racer.lastFireballTime = curTime;
                    }
            
                    // Mettre à jour la position de chaque fireball
                    racer.fireballs.forEach((fireball, index) => {
                        fireball.x += fireball.speed * (curTime - racer.time) / 1000;
                        
                        // Flip vertical toutes les 0.5 secondes
                        if (curTime - fireball.flipTime >= 1000) {
                            fireball.isFlipped = !fireball.isFlipped;
                            fireball.flipTime = curTime;
                        }
                    });
            
                    // Supprimer les fireballs qui sont trop loin
                    racer.fireballs = racer.fireballs.filter(fireball => 
                        fireball.x < racer.car8_vehicle1TL[0] + 2000
                    );
                }         
                
                // Mise à jour de la position
                // racer.pos[0] += racer.vel[0] * dt;
                
                // Mise à jour du temps
                racer.time = curTime;

            /*    break;

            case 5:
                

        }*/
       if (curTime - racer.car6_stateTime > 250) {
        racer.car6_state = racer.car6_state === 0 ? 1 : 0;
        racer.car6_stateTime = curTime;
        racer.car6_nbDotes--;
            if (racer.car6_nbDotes < 0) {
                racer.car6_nbDotes = 10;
            }
       }
       
       if (curTime - racer.car8_stateTime > 250) {
        racer.car8_state = racer.car8_state === 0 ? 1 : 0;
        racer.car8_stateTime = curTime;
       }
    }

    racer.customDraw = async () => {
        if (racer.showBoost) {
            drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
        }

        ctx.save();
        ctx.beginPath();
        ctx.clip();
        ctx.closePath();
        ctx.restore();
        switch(andyCar) {
            case 1: // Carriage
                ctx.drawImage(racer.car1_vehicle, ...racer.car1_vehicleTL, ...racer.car1_vehicleDIM);
                
                ctx.translate(...racer.car1_wheel3CR);
                ctx.rotate(racer.car1_wheel3Theta);
                ctx.translate(-racer.car1_wheel3CR[0], -racer.car1_wheel3CR[1]);
                if (racer.car1_wheel3) drawToCanvas(ctx, racer.car1_wheel3, ...racer.car1_wheel3TL, ...racer.car1_wheel3DIM);
                ctx.translate(...racer.car1_wheel3CR);
                ctx.rotate(-racer.car1_wheel3Theta);
                ctx.translate(-racer.car1_wheel3CR[0], -racer.car1_wheel3CR[1]);

                ctx.translate(...racer.car1_wheel4CR);
                ctx.rotate(racer.car1_wheel4Theta);
                ctx.translate(-racer.car1_wheel4CR[0], -racer.car1_wheel4CR[1]);
                if (racer.car1_wheel4) drawToCanvas(ctx, racer.car1_wheel4, ...racer.car1_wheel4TL, ...racer.car1_wheel4DIM);
                ctx.translate(...racer.car1_wheel4CR);
                ctx.rotate(-racer.car1_wheel4Theta);
                ctx.translate(-racer.car1_wheel4CR[0], -racer.car1_wheel4CR[1]);

                ctx.drawImage(racer.car1_chantal, ...racer.car1_chantalTL, ...racer.car1_chantalDIM);

                ctx.translate(...racer.car1_wheel1CR);
                ctx.rotate(racer.car1_wheel1Theta);
                ctx.translate(-racer.car1_wheel1CR[0], -racer.car1_wheel1CR[1]);
                if (racer.car1_wheel1) drawToCanvas(ctx, racer.car1_wheel1, ...racer.car1_wheel1TL, ...racer.car1_wheel1DIM);
                ctx.translate(...racer.car1_wheel1CR);
                ctx.rotate(-racer.car1_wheel1Theta);
                ctx.translate(-racer.car1_wheel1CR[0], -racer.car1_wheel1CR[1]);

                ctx.translate(...racer.car1_wheel2CR);
                ctx.rotate(racer.car1_wheel2Theta);
                ctx.translate(-racer.car1_wheel2CR[0], -racer.car1_wheel2CR[1]);
                if (racer.car1_wheel2) drawToCanvas(ctx, racer.car1_wheel2, ...racer.car1_wheel2TL, ...racer.car1_wheel2DIM);
                ctx.translate(...racer.car1_wheel2CR);
                ctx.rotate(-racer.car1_wheel2Theta);
                ctx.translate(-racer.car1_wheel2CR[0], -racer.car1_wheel2CR[1]);

                drawToCanvas(ctx, racer.car1_vehicle, ...racer.car1_vehicleTL, ...racer.car1_vehicleDIM);
                break;

            case 2: // Chest 
                drawToCanvas(ctx, racer.car2_vehicle, ...racer.car2_vehicleTL, ...racer.car2_vehicleDIM);
                ctx.drawImage(racer.car2_vehicle, ...racer.car2_vehicleTL, ...racer.car2_vehicleDIM);
                
                ctx.translate(...racer.car2_wheel3CR);
                ctx.rotate(racer.car2_wheel3Theta);
                ctx.translate(-racer.car2_wheel3CR[0], -racer.car2_wheel3CR[1]);
                if (racer.car2_wheel3) drawToCanvas(ctx, racer.car2_wheel3, ...racer.car2_wheel3TL, ...racer.car2_wheel3DIM);
                ctx.translate(...racer.car2_wheel3CR);
                ctx.rotate(-racer.car2_wheel3Theta);
                ctx.translate(-racer.car2_wheel3CR[0], -racer.car2_wheel3CR[1]);

                ctx.translate(...racer.car2_wheel1CR);
                ctx.rotate(racer.car2_wheel1Theta);
                ctx.translate(-racer.car2_wheel1CR[0], -racer.car2_wheel1CR[1]);
                if (racer.car2_wheel1) drawToCanvas(ctx, racer.car2_wheel1, ...racer.car2_wheel1TL, ...racer.car2_wheel1DIM);
                ctx.translate(...racer.car2_wheel1CR);
                ctx.rotate(-racer.car2_wheel1Theta);
                ctx.translate(-racer.car2_wheel1CR[0], -racer.car2_wheel1CR[1]);

                ctx.translate(...racer.car2_wheel2CR);
                ctx.rotate(racer.car2_wheel2Theta);
                ctx.translate(-racer.car2_wheel2CR[0], -racer.car2_wheel2CR[1]);
                if (racer.car2_wheel2) drawToCanvas(ctx, racer.car2_wheel2, ...racer.car2_wheel2TL, ...racer.car2_wheel2DIM);
                ctx.translate(...racer.car2_wheel2CR);
                ctx.rotate(-racer.car2_wheel2Theta);
                ctx.translate(-racer.car2_wheel2CR[0], -racer.car2_wheel2CR[1]);
                break;

            case 3: // Cuzy
                drawToCanvas(ctx, racer.car3_vehicle, ...racer.car3_vehicleTL, ...racer.car3_vehicleDIM);
                ctx.drawImage(racer.car3_vehicle, ...racer.car3_vehicleTL, ...racer.car3_vehicleDIM);

                ctx.translate(...racer.car3_wheel1CR);
                ctx.rotate(racer.car3_wheel1Theta);
                ctx.translate(-racer.car3_wheel1CR[0], -racer.car3_wheel1CR[1]);
                if (racer.car3_wheel1) drawToCanvas(ctx, racer.car3_wheel1, ...racer.car3_wheel1TL, ...racer.car3_wheel1DIM);
                ctx.translate(...racer.car3_wheel1CR);
                ctx.rotate(-racer.car3_wheel1Theta);
                ctx.translate(-racer.car3_wheel1CR[0], -racer.car3_wheel1CR[1]);

                ctx.translate(...racer.car3_wheel2CR);
                ctx.rotate(racer.car3_wheel2Theta);
                ctx.translate(-racer.car3_wheel2CR[0], -racer.car3_wheel2CR[1]);
                if (racer.car3_wheel2) drawToCanvas(ctx, racer.car3_wheel2, ...racer.car3_wheel2TL, ...racer.car3_wheel2DIM);
                ctx.translate(...racer.car3_wheel2CR);
                ctx.rotate(-racer.car3_wheel2Theta);
                ctx.translate(-racer.car3_wheel2CR[0], -racer.car3_wheel2CR[1]);
                break;

            case 4: // Rainbow Dash
               // drawRainbowDashTail();
                drawToCanvas(ctx, racer.car4_vehicle, ...racer.car4_vehicleTL, ...racer.car4_vehicleDIM);
                ctx.drawImage(racer.car4_vehicle, ...racer.car4_vehicleTL, ...racer.car4_vehicleDIM);

                ctx.translate(...racer.car4_wing_backCR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.car4_wing_backTheta);	// rotate
                ctx.translate(-racer.car4_wing_backCR[0], -racer.car4_wing_backCR[1]); // undo translation
                if (racer.car4_wing_back) drawToCanvas(ctx, racer.car4_wing_back, ...racer.car4_wing_backTL, ...racer.car4_wing_backDIM); // draw wheel 1
                ctx.translate(...racer.car4_wing_backCR); // translate back
                ctx.rotate(-racer.car4_wing_backTheta); // undo rotation
                ctx.translate(-racer.car4_wing_backCR[0], -racer.car4_wing_backCR[1]); // undo translation back

                ctx.drawImage(racer.car4_tail, ...racer.car4_tailTL, ...racer.car4_tailDIM);
                ctx.drawImage(racer.car4_andy, ...racer.car4_andyTL, ...racer.car4_andyDIM);
                ctx.drawImage(racer.car4_hat, ...racer.car4_hatTL, ...racer.car4_hatDIM);

                ctx.translate(...racer.car4_braid_longCR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.car4_braid_longTheta);	// rotate
                ctx.translate(-racer.car4_braid_longCR[0], -racer.car4_braid_longCR[1]); // undo translation
                if (racer.car4_braid_long) drawToCanvas(ctx, racer.car4_braid_long, ...racer.car4_braid_longTL, ...racer.car4_braid_longDIM); // draw wheel 1
                ctx.translate(...racer.car4_braid_longCR); // translate back
                ctx.rotate(-racer.car4_braid_longTheta); // undo rotation
                ctx.translate(-racer.car4_braid_longCR[0], -racer.car4_braid_longCR[1]); // undo translation back

                ctx.translate(...racer.car4_braid_shortCR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.car4_braid_shortTheta);	// rotate
                ctx.translate(-racer.car4_braid_shortCR[0], -racer.car4_braid_shortCR[1]); // undo translation
                if (racer.car4_braid_short) drawToCanvas(ctx, racer.car4_braid_short, ...racer.car4_braid_shortTL, ...racer.car4_braid_shortDIM); // draw wheel 1
                ctx.translate(...racer.car4_braid_shortCR); // translate back
                ctx.rotate(-racer.car4_braid_shortTheta); // undo rotation
                ctx.translate(-racer.car4_braid_shortCR[0], -racer.car4_braid_shortCR[1]); // undo translation back

                ctx.translate(...racer.car4_wing_frontCR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.car4_wing_frontTheta);	// rotate
                ctx.translate(-racer.car4_wing_frontCR[0], -racer.car4_wing_frontCR[1]); // undo translation
                if (racer.car4_wing_front) drawToCanvas(ctx, racer.car4_wing_front, ...racer.car4_wing_frontTL, ...racer.car4_wing_frontDIM); // draw wheel 1
                ctx.translate(...racer.car4_wing_frontCR); // translate back
                ctx.rotate(-racer.car4_wing_frontTheta); // undo rotation
                ctx.translate(-racer.car4_wing_frontCR[0], -racer.car4_wing_frontCR[1]); // undo translation back
                break;
            case 5: // Guitare
                drawToCanvas(ctx, racer.car5_vehicle, ...racer.car5_vehicleTL, ...racer.car5_vehicleDIM);
                ctx.drawImage(racer.car5_vehicle, ...racer.car5_vehicleTL, ...racer.car5_vehicleDIM);

                drawToCanvas(ctx, racer.car5_cloud, ...racer.car5_cloudTL, ...racer.car5_cloudDIM);
                ctx.drawImage(racer.car5_cloud, ...racer.car5_cloudTL, ...racer.car5_cloudDIM);
                break;
            case 6: // Pacman
            if(racer.car6_state == 0) {
                drawToCanvas(ctx, racer.car6_pacmanClose, ...racer.car6_pacmanTL, ...racer.car6_pacmanDIM);
                drawToCanvas(ctx, racer.car6_blue1, ...racer.car6_blueTL, ...racer.car6_blueDIM);
                drawToCanvas(ctx, racer.car6_pink1, ...racer.car6_pinkTL, ...racer.car6_pinkDIM);
                drawToCanvas(ctx, racer.car6_orange1, ...racer.car6_orangeTL, ...racer.car6_orangeDIM);
                drawToCanvas(ctx, racer.car6_red1, ...racer.car6_redTL, ...racer.car6_redDIM);

                ctx.drawImage(racer.car6_pacmanClose, ...racer.car6_pacmanTL, ...racer.car6_pacmanDIM);
                ctx.drawImage(racer.car6_blue1, ...racer.car6_blueTL, ...racer.car6_blueDIM);
                ctx.drawImage(racer.car6_pink1, ...racer.car6_pinkTL, ...racer.car6_pinkDIM);
                ctx.drawImage(racer.car6_orange1, ...racer.car6_orangeTL, ...racer.car6_orangeDIM);
                ctx.drawImage(racer.car6_red1, ...racer.car6_redTL, ...racer.car6_redDIM);
                
                if (racer.car6_nbDotes >= 2) {
                    drawToCanvas(ctx, racer.car6_dot1, ...racer.car6_dotTL1, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot1, ...racer.car6_dotTL1, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 4) {
                    drawToCanvas(ctx, racer.car6_dot2, ...racer.car6_dotTL2, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot2, ...racer.car6_dotTL2, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 6) {
                    drawToCanvas(ctx, racer.car6_dot1, ...racer.car6_dotTL3, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot1, ...racer.car6_dotTL3, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 8) {
                    drawToCanvas(ctx, racer.car6_dot2, ...racer.car6_dotTL4, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot2, ...racer.car6_dotTL4, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 10) {
                    drawToCanvas(ctx, racer.car6_dot1, ...racer.car6_dotTL5, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot1, ...racer.car6_dotTL5, ...racer.car6_dotDIM);
                }
            } else {
                drawToCanvas(ctx, racer.car6_pacmanOpen, ...racer.car6_pacmanTL, ...racer.car6_pacmanDIM);
                drawToCanvas(ctx, racer.car6_blue2, ...racer.car6_blueTL, ...racer.car6_blueDIM);
                drawToCanvas(ctx, racer.car6_pink2, ...racer.car6_pinkTL, ...racer.car6_pinkDIM);
                drawToCanvas(ctx, racer.car6_orange2, ...racer.car6_orangeTL, ...racer.car6_orangeDIM);
                drawToCanvas(ctx, racer.car6_red2, ...racer.car6_redTL, ...racer.car6_redDIM);

                ctx.drawImage(racer.car6_pacmanOpen, ...racer.car6_pacmanTL, ...racer.car6_pacmanDIM);
                ctx.drawImage(racer.car6_blue2, ...racer.car6_blueTL, ...racer.car6_blueDIM);
                ctx.drawImage(racer.car6_pink2, ...racer.car6_pinkTL, ...racer.car6_pinkDIM);
                ctx.drawImage(racer.car6_orange2, ...racer.car6_orangeTL, ...racer.car6_orangeDIM);
                ctx.drawImage(racer.car6_red2, ...racer.car6_redTL, ...racer.car6_redDIM);

                if (racer.car6_nbDotes >= 2) {
                    drawToCanvas(ctx, racer.car6_dot2, ...racer.car6_dotTL1, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot2, ...racer.car6_dotTL1, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 4) {
                    drawToCanvas(ctx, racer.car6_dot1, ...racer.car6_dotTL2, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot1, ...racer.car6_dotTL2, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 6) {
                    drawToCanvas(ctx, racer.car6_dot2, ...racer.car6_dotTL3, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot2, ...racer.car6_dotTL3, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 8) {
                    drawToCanvas(ctx, racer.car6_dot1, ...racer.car6_dotTL4, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot1, ...racer.car6_dotTL4, ...racer.car6_dotDIM);
                }
                if (racer.car6_nbDotes >= 10) {
                    drawToCanvas(ctx, racer.car6_dot2, ...racer.car6_dotTL5, ...racer.car6_dotDIM);
                    ctx.drawImage(racer.car6_dot2, ...racer.car6_dotTL5, ...racer.car6_dotDIM);
                }
            }
            break;
            case 7: // TRex
                ctx.save();
                
                // Dessiner le véhicule principal
                drawToCanvas(ctx, racer.car7_vehicle, ...racer.car7_vehicleTL, ...racer.car7_vehicleDIM);
                
                // Point d'attache sur le véhicule
                const attachX = racer.car7_vehicleTL[0] + 540;
                const attachY = racer.car7_vehicleTL[1] + 122;
                
                // Position initiale d'Andy
                const andyX = attachX - 142; // Position pour que le point [142,52] soit sur le point d'attache
                const andyY = attachY - 52;
                
                // Appliquer la rotation autour du point [142,52] de l'image d'Andy
                ctx.translate(attachX, attachY); // Déplacer au point d'attache
                ctx.rotate(racer.car7_andyTheta); // Appliquer la rotation
                ctx.translate(-142, -52); // Déplacer pour que le point [142,52] soit au centre de rotation
                
                // Dessiner Andy
                drawToCanvas(ctx, racer.car7_andy, 0, 0, ...racer.car7_andyDIM);
                
                ctx.restore();
                break;
            case 8: // Car8
                if (racer.car8_state == 0) {
                    drawToCanvas(ctx, racer.car8_vehicle1, ...racer.car8_vehicle1TL, ...racer.car8_vehicle1DIM);
                } else {
                    drawToCanvas(ctx, racer.car8_vehicle2, ...racer.car8_vehicle2TL, ...racer.car8_vehicle2DIM);
                }
                // Dessin de chaque fireball
                racer.fireballs.forEach(fireball => {
                    ctx.save();
                    
                    // Application des transformations
                    ctx.translate(fireball.x + racer.fireballDIM[0]/2, 
                                fireball.y + 10 + (fireball.isFlipped ? racer.fireballDIM[1] : 0));
                    ctx.scale(1, fireball.isFlipped ? -1 : 1);
                    ctx.translate(-(fireball.x + racer.fireballDIM[0]/2), 
                                -(fireball.y));
                    
                    // Dessin de la fireball retournée horizontalement
                    ctx.scale(-1, 1);
                    var note = racer.notesImages[Math.floor(Math.random() * racer.notesImages.length)];
                    ctx.drawImage(note.img,
                                -fireball.x, // - racer.fireballDIM[0], 
                                fireball.y, 
                                note.width, 
                                note.height);
                    
                    ctx.restore();
                });
                break;
            case 9: // Nezubot
                drawToCanvas(ctx, racer.car9_vehicle, ...racer.car9_vehicleTL, ...racer.car9_vehicleDIM);
                ctx.drawImage(racer.car9_vehicle, ...racer.car9_vehicleTL, ...racer.car9_vehicleDIM);
                break;
        }
    }
    return racer;
}

function create_tail(vehicleTL) {
	for(let i = 0; i < 20; i++) {
		var tail = {};
		tail.x = vehicleTL[0] - (40 * i);
		tail.y = vehicleTL[1]; //i%2 == 0 ? vehicleTL[1] : vehicleTL[1] + 10;
		tail.width = 10;
		tails.push(tail);
	}
}

function remove_tail() {
	tails.forEach(function(el, index) {
		if (el.x < 0) {
			tails.splice(index, 1);
		}
	})
}

function drawRainbowDashTail() {
	for (var i = 0; i < tails.length; i++) {
		var tail = tails[i];

		//tail.x += -40 * i;
		//tail.y += 0;
		tail.width++;

		// ============== NYANCATTAIL ================= //

		ctx.beginPath();

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(tail.x, tail.y + 65 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(tail.x, tail.y + 70 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(tail.x, tail.y + 75 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
        ctx.fillStyle = '#33ff00';
        ctx.fillRect(tail.x, tail.y + 80 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
        ctx.fillStyle = '#0099ff';
        ctx.fillRect(tail.x, tail.y + 85 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
        ctx.fillStyle = '#6633ff';
        ctx.fillRect(tail.x, tail.y + 90 + 24 + (tailVersion ? 5 : -5) * (i % 2 == 0 ? 1 : -1), 40, 5);
	}
	    tailVersion = !tailVersion;
}

function sendMessageInChat(message) {
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
    cameraLoc = [canvas.width * cameraLocPos, 0];
    readying = true;
    finishingVel = 1000;
    stopRace = false;

    // Réinitialiser les positions des nids-de-poule
    if (trackType === "montreal") {
        holePositions = [];
        for (let i = 0; i < 15; i++) { // Créer 15 nids-de-poule
            holePositions.push({
                x: -widthRace + Math.random() * widthRace * 3,
                y: 1080 - 25 - totalRoadHeight + Math.random() * (totalRoadHeight - 100),
                type: Math.floor(Math.random() * 7) + 1 // Choisir aléatoirement entre hole1 et hole7
            });
        }
    }

    resetBackgroundArt();
    resetRandomWord();
    if (!isUpdatingRacers) requestAnimationFrame(updateRacers);
};

async function restartRace() {
    winner = null;
    finishX = null;
    sortedRacers = [];
    leaderboard = [];
    standings = [];
    prevStandingsUpdateTime = 0;
    raceStartTime = null;
    cameraLoc = [canvas.width * cameraLocPos, 0];
    readying = true;
    finishingVel = 1000;
    stopRace = false;

    var racersSaved = racers;
    racers = ({});

    // Réinitialiser la position et la vitesse des coureurs
    for (let name in racersSaved) {
        await addRacer(name);
    }

    resetBackgroundArt();
    resetRandomWord();
    if (sortedRacers.length > 0) {
        testing = false;
        startRace();
    }
    if (!isUpdatingRacers) requestAnimationFrame(updateRacers);
};

function resetBackgroundArt() {
    backgrounds = [[], [], []];
    foregrounds = [];
    holes = [];

    // throw in random background assets
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 2 - j + Math.random() * 2; i++) {
            addBackgroundItem(j, true);
        }
    }

    // throw in random foreground assets
    for (let i = 0; i < 2 + Math.random() * 2; i++) {
        addForegroundItem(true);
    }

    // throw in random hole assets
    if(trackType == "montreal") {
        for (let i = 0; i < 4 + Math.random() * 4; i++) {
            addHoleItem(true);
        }
    }
};

function resetSEStore() {
    SE_API.store.set('StreamRacersLeaderboardData', {});
    SE_API.store.set('raceHistory', []);
};

function isModerator(badgesArray) {
    return badgesArray.findIndex(element => element.type == "moderator") >= 0 ||
        badgesArray.findIndex(element => element.type == "broadcaster") >= 0
};

function isBroadcaster(badgesArray) {
    return badgesArray.findIndex(element => element.type == "broadcaster") >= 0
};

// ... existing code ...
let lastAndyCarUpdate = Date.now();

function updateAndyCar() {
    if (andyRotateCar) {
        if (Date.now() - lastAndyCarUpdate >= andyCarUpdateTime) { // 3000ms = 3 secondes
            andyCar = (andyCar % andyCarNumber) + 1; // Incrémente de 1 à 4 puis revient à 1
            lastAndyCarUpdate = Date.now();
        }
    }
}

function updateRacers() {
    updateAndyCar();
    //console.log("updateRacers racers", racers);
    let curTime = Date.now();
    if (readying) {
        for (let name of sortedRacers) {
            racer = racers[name];
            racer.XY[0] += racer.vel[0] * (curTime - racer.time) / 1000;
            racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;
            if (racer.XY[0] > 0) {
                racer.XY[0] = 0; // dont let cars start yet
            } else {
                if (racer.customUpdate) {
                    racer.customUpdate(curTime);
                } else {
                    racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                    racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);
                    racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                    racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI);
                }
                    
                // 10% de chance de déclencher l'animation
                if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                    bumpAnimation(racer);
                }
            }
            racer.time = curTime;
        }
        if (racers["AndyTheFrenchy"]) {
            racer = racers["AndyTheFrenchy"];
            racer.XY[0] += racer.vel[0] * (curTime - racer.time) / 1000;
            racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;
            if (racer.XY[0] > 0) {
                racer.XY[0] = 0; // dont let cars start yet
            } else {
                if (racer.customUpdate) {
                    racer.customUpdate(curTime);
                }
                    
                // 10% de chance de déclencher l'animation
                if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                    bumpAnimation(racer);
                }
            }
            racer.time = curTime;
        }
    } else {
        if (curTime - raceStartTime < 1000 * setupDuration) {
            for (let name of sortedRacers) {
                racer = racers[name];
                // speed up racers to get them to the start line
                racer.XY[0] += 5 * racer.vel[0] * (curTime - racer.time) / 1000;
                racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;
                if (racer.XY[0] > 0) {
                    racer.XY[0] = 0; // dont let cars start yet
                } else {
                    if (racer.customUpdate) {
                        racer.customUpdate(curTime);
                    } else {
                        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                        racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);
                        racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                        racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI);
                    }
                }
                    
                // 10% de chance de déclencher l'animation
                if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                    bumpAnimation(racer);
                }
                racer.time = curTime;
            }
            if (sortedRacers[0] && racers["AndyTheFrenchy"]) {
                racer = racers["AndyTheFrenchy"];
                // speed up racers to get them to the start line
                // racer.XY[0] += 5 * racer.vel[0] * (curTime - racer.time) / 1000;
                // racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;
                racer.XY = racers[sortedRacers[0]].XY;
                    if (racer.customUpdate) {
                        racer.customUpdate(curTime);
                    } 
                    racer.time = curTime;   
            }
            
            let newCameraLoc = canvas.width * cameraLocPos - ((canvas.width * cameraLocPos - cameraLocOffset) / setupDuration) * ((curTime - raceStartTime) / 1000);
            let dX = newCameraLoc - cameraLoc[0];
            cameraLoc[0] = newCameraLoc;
            updateBackground(dX);
        } else {
            if (!sentClue) {
                if (useBoostWord) sendMessageInChat("Guess the word I'm thinking of for a boost! The category is: " + chosenWord["category"]);
                sentClue = true;
            };

            let maxXPos = 0;
            let maxXVel = 0;
            let finishers = [];
            stopRace = true;
            for (let name of sortedRacers) {
                racer = racers[name];
                // update
                racer.vel[0] += (Math.random() - 1 / 3) * racer.acc[0];
                racer.vel[1] += (Math.random() - 1 / 3) * racer.acc[1];

                if (racer.vel[0] < 0) { racer.vel[0] = 0; }
                if (finishX && racer.XY[0] > finishX) { racer.vel[0] = finishingVel }

                if (racer.customUpdate) {
                    racer.customUpdate(curTime);
                } else {
                    racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                    racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);
                    racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                    racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI);
                }

                racer.XY[0] += racer.vel[0] * (curTime - racer.time) / 1000;
                racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;

                if (racer.XY[0] > maxXPos) {
                    maxXPos = racer.XY[0];
                    maxXVel = racer.vel[0];
                }

                if (finishX && racer.XY[0] > finishX && racer.XY[0] - racer.vel[0] * (curTime - racer.time) / 1000 <= finishX) {
                    finishers.push(racer.name);
                }

                if (racer.XY[0] + cameraLoc[0] < canvas.width + 8000) {
                    stopRace = false;
                }
                    
                // 10% de chance de déclencher l'animation
                if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                    bumpAnimation(racer);
                }

                racer.time = curTime;
            }
            if (standings[0] && racers["AndyTheFrenchy"]) {
                racer = racers["AndyTheFrenchy"];
                // speed up racers to get them to the start line
                // racer.XY[0] += 5 * racer.vel[0] * (curTime - racer.time) / 1000;
                // racer.XY[1] += racer.vel[1] * (curTime - racer.time) / 1000;
                racer.XY = [racers[standings[0]].XY[0] + 150, racers[standings[0]].XY[1]];
                if (racer.customUpdate) {
                    racer.customUpdate(curTime);
                }
                    
                // 10% de chance de déclencher l'animation
                if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                    bumpAnimation(racer);
                }
                racer.time = curTime;   
            }

            if ((curTime - prevStandingsUpdateTime) / 1000 > standingsUpdateDur) {
                standings = Object.keys(racers)
                    .filter(name => name !== "AndyTheFrenchy")
                    .sort((a, b) => {
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
                leaderboard = leaderboard.concat(finishers
                    .filter(name => name !== "AndyTheFrenchy")
                    .sort((a, b) => {
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
                Math.max(-maxXPos + cameraLocOffset + (canvas.width - cameraLocOffset - 200) * Math.min(1, (curTime - raceStartTime - setupDuration * 1000) / (raceDuration * 1000)),
                    canvas.width * 0.5 - finishX) :
                -maxXPos + cameraLocOffset + (canvas.width - cameraLocOffset - 200) * (curTime - raceStartTime - setupDuration * 1000) / (raceDuration * 1000);
            let dX = newCameraLocX - cameraLoc[0];
            cameraLoc[0] = newCameraLocX;
            updateBackground(dX);

            if (!finishX && (raceDuration + setupDuration) * 1000 - (curTime - raceStartTime) < 5000) {
                finishX = canvas.width - cameraLoc[0] + 5 * maxXVel - 800;
            }
        }
    }

    draw();

    if (curTime - raceStartTime < (raceDuration + setupDuration) * 1000 || readying) {
        requestAnimationFrame(updateRacers);
    } else if (raceStartTime && (leaderboard.length < sortedRacers.length || !stopRace)) {
        requestAnimationFrame(updateRacers);
    } else {
        if (!testing) {
            sendMessageInChat("!addqwoin " + winner + " 5");

            SE_API.store.get('StreamRacersLeaderboardData').then(data => {
                let date = new Date();
                let day = date.getDate().toString().padStart(2, '0');
                let month = (date.getMonth() + 1).toString().padStart(2, '0');
                let year = date.getFullYear().toString();

                data[year + month + day] ||= {};
                data[year + month] ||= {};
                for (let i = 0; i < Math.min(leaderboard.length, 10); i++) {
                    // daily scores
                    data[year + month + day][leaderboard[i]] ||= 0;
                    data[year + month + day][leaderboard[i]] += Math.min(leaderboard.length, 10) - i; // 3, 2, 1 points to top 3

                    // monthly scores
                    data[year + month][leaderboard[i]] ||= 0;
                    data[year + month][leaderboard[i]] += Math.min(leaderboard.length, 10) - i; // 3, 2, 1 points to top 3
                }

                SE_API.store.set('StreamRacersLeaderboardData', data);
                });
            saveRaceResults(leaderboard);
        }
        isUpdatingRacers = false;
    }
};

function updateBackground(dX) {
    // parallax effect here
    for (let j = 0; j < backgrounds.length; j++) {
        let rem = [];
        for (let i = 0; i < backgrounds[j].length; i++) {
            let img = backgrounds[j][i];
            img.XY[0] -= dX * (0.6 - 0.3 * j);

            // remove img if off canvas on left side
            if (img.XY[0] + cameraLoc[0] < -500) {
                rem.push(i);
            }
        }
        while (rem.length) {
            backgrounds[j].splice(rem.pop(), 1);

            // add a new one
            for (let i = 0; i < (Math.random() - 1 / 3) * 3; i++) {
                addBackgroundItem(j);
            }
        }
    }

    let rem = [];
    for (let i = 0; i < foregrounds.length; i++) {
        let img = foregrounds[i];

        // remove img if off canvas on left side
        if (img.XY[0] + cameraLoc[0] < -500) {
            rem.push(i);
        }
    }
    while (rem.length) {
        foregrounds.splice(rem.pop(), 1);

        // add a new one
        //for (let i = 0; i < (Math.random()-1/3)*3; i++){
        addForegroundItem();
        //}
    }

    rem = [];
    for (let i = 0; i < holes.length; i++) {
        let img = holes[i];
        if (img.XY[0] + cameraLoc[0] < -500) {
            rem.push(i);
        }   
    }
    while (rem.length) {
        holes.splice(rem.pop(), 1);
        addHoleItem();
    }
    
};

function clearTodaysWinners() {
    SE_API.store.get('StreamRacersLeaderboardData').then(data => {
        let date = new Date();
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let year = date.getFullYear().toString();

        data[year + month + day] ||= {};
        data[year + month] ||= {};
        for (let [name, points] of Object.entries(data[year + month + day])) {
            // remove all points from today
            data[year + month][name] -= points;
        }
        data[year + month + day] = {};

        SE_API.store.set('StreamRacersLeaderboardData', data);
    });
};

async function setupCustomRacer(nameViewer, racer, idRacer, randomViewer) {
    let custom = {};

    let name = randomViewer == nameViewer ? "rondoudou" : nameViewer;

    //console.log("setupCustomRacer", name);
    switch (name) {        
        case "EnigmaticGnu":
            let gnuCarChoice = Math.random() < 0.5 ? "limousine" : "normal";
            
            let gnu = {};
            
            if (gnuCarChoice === "limousine") {
                // Sélecteur aléatoire avec distribution 90/5/5
                let randomValue = Math.random();
                let selector = randomValue < 0.9 ? IMAGES_BASE64.Gnu.limousine.vehicle : (randomValue < 0.95 ? IMAGES_BASE64.Gnu.limousine.vehicle2 : IMAGES_BASE64.Gnu.limousine.vehicle3);

                let scale = 0.4;
                gnu.avatarTL = [-325 - 20, -130];
                gnu.avatarDIM = [80, 80];

                gnu.vehicle = getImage(selector);
                gnu.vehicleTL = [-400 - 20, -200];
                gnu.vehicleDIM = [400, 200];

                gnu.showBoost = false;
                gnu.boost = defaultDrawings.boost;
                gnu.boostTL = [-400 - 66 - 20, -200 + 60];
                gnu.boostDIM = [259.6, 200];

                gnu.wheel1 = getImage(IMAGES_BASE64.Gnu.limousine.wheel1);
                gnu.wheel1TL = [-400 - 20, -200];
                gnu.wheel1DIM = [400, 200];
                gnu.wheel1CR = [-330 - 20, -15.5];
                gnu.wheel1Theta = Math.PI / 6;
                gnu.wheel1Radius = 15.5;

                gnu.wheel2 = getImage(IMAGES_BASE64.Gnu.limousine.wheel2);
                gnu.wheel2TL = [-400 - 20, -200];
                gnu.wheel2DIM = [400, 200];
                gnu.wheel2CR = [-43 - 20, -15];
                gnu.wheel2Theta = Math.PI / 6;
                gnu.wheel2Radius = 15.5;
            } else {
                let scale = 0.4;
                // Nouvelle voiture
                gnu.avatarTL = [-197 * scale - 5, -205 * scale -5]; // Centre de l'avatar aux coordonnées [109, 87]
                gnu.avatarDIM = [90, 90];
        
                // Véhicules avant et arrière
                gnu.vehicle = getImage(IMAGES_BASE64.Gnu.baby.vehicle_back);
                gnu.vehicle_back = getImage(IMAGES_BASE64.Gnu.baby.vehicle_back);
                gnu.vehicle_front = getImage(IMAGES_BASE64.Gnu.baby.vehicle_front);
                gnu.vehicleTL = [-197 * scale, -205 * scale];
                gnu.vehicleDIM = [197 * scale, (205 + 15) * scale];
        
                // Roues
                gnu.wheel1 = getImage(IMAGES_BASE64.Gnu.baby.wheel1);
                gnu.wheel1DIM = [45 * scale, 44 * scale];
                gnu.wheel1CR = [gnu.vehicleTL[0] + 26 * scale, gnu.vehicleTL[1] + (197 + 15) * scale];
                gnu.wheel1TL = [gnu.wheel1CR[0] - 22 * scale, gnu.wheel1CR[1] - 22 * scale]; // Centre de rotation de la roue 1
                gnu.wheel1Theta = 0;
                gnu.wheel1Radius = 22 * scale; // Moitié de la hauteur de la roue
        
                gnu.wheel2 = getImage(IMAGES_BASE64.Gnu.baby.wheel2);
                gnu.wheel2DIM = [48 * scale, 40 * scale];
                gnu.wheel2CR = [gnu.vehicleTL[0] + 171 * scale, gnu.vehicleTL[1] + (197 + 15) * scale]; 
                gnu.wheel2TL = [gnu.wheel2CR[0] - 24 * scale, gnu.wheel2CR[1] - 20 * scale];// Centre de rotation de la roue 2
                gnu.wheel2Theta = 0;
                gnu.wheel2Radius = 20 * scale; // Moitié de la hauteur de la roue
        
                // Mise à jour personnalisée pour la rotation des roues
                gnu.customUpdate = async (curTime) => {
                    let dt = (curTime - racer.time) / 1000;
                    
                    // Rotation des roues proportionnelle à la vitesse
                    let wheelRotation = (racer.vel[0] * dt) / racer.wheel1Radius;
                    racer.wheel1Theta += wheelRotation;
                    racer.wheel2Theta += wheelRotation;
                };
        
                // Dessin personnalisé avec ordre de superposition correct
                gnu.customDraw = async () => {
                    // 1. Dessiner l'arrière du véhicule
                    drawToCanvas(ctx, racer.vehicle_back, ...racer.vehicleTL, ...racer.vehicleDIM);
        
                    // 2. Dessiner l'avatar
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), 
                           racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                    ctx.clip();
                    drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                    ctx.restore();
        
                    // 4. Dessiner l'avant du véhicule
                    drawToCanvas(ctx, racer.vehicle_front, ...racer.vehicleTL, ...racer.vehicleDIM);
        
                    // 3. Dessiner les roues avec rotation
                    // Roue 1
                    ctx.save();
                    ctx.translate(...racer.wheel1CR);
                    ctx.rotate(racer.wheel1Theta);
                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]);
                    drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                    ctx.restore();
        
                    // Roue 2
                    ctx.save();
                    ctx.translate(...racer.wheel2CR);
                    ctx.rotate(racer.wheel2Theta);
                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                    drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                    ctx.restore();
                };
            }
                customRacers[name] = gnu;
            break;
        case "albinounounou":
            custom.avatarTL = [-200 + 130.857, -58 - 15.357];
            custom.avatarDIM = [58, 58];

            custom.vehicle = getImage(IMAGES_BASE64.assets.albinounounou_vehicle);
            custom.vehicleTL = [-200 + 14, -200];
            custom.vehicleDIM = [200, 200];

            custom.showBoost = false;
            custom.boost = getImage(IMAGES_BASE64.assets.albinounounou_boost);
            custom.boostTL = [-200 + 14, -200];
            custom.boostDIM = [200, 200];

            custom.wheel1 = getImage(IMAGES_BASE64.assets.albinounounou_wheel1);
            custom.wheel1TL = [-200 + 14, -200];
            custom.wheel1DIM = [200, 200];
            custom.wheel1CR = [-200 + 175.36, -9.64];
            custom.wheel1Theta = 0;
            custom.wheel1Radius = 9.64;

            custom.wheel2 = getImage(IMAGES_BASE64.assets.albinounounou_wheel2);
            custom.wheel2TL = [-200 + 14, -200];
            custom.wheel2DIM = [200, 200];
            custom.wheel2CR = [-200 + 102.5, -9.64];
            custom.wheel2Theta = 0;
            custom.wheel2Radius = 9.64;

            customRacers[name] = custom;
            break;
        case "Asixel":
            custom.avatarTL = [-200 + 75, -80 - 129 + 15];
            custom.avatarDIM = [80, 80];

            custom.vehicle = getImage(IMAGES_BASE64.Asixel.vehicule);
            custom.vehicleTL = [-200 - 14.9, -250 + 15];
            custom.vehicleDIM = [250, 250];

            custom.showBoost = false;
            custom.boost = getImage(IMAGES_BASE64.Asixel.boost);
            custom.boostTL = [-200 - 54.544, -200 - 25.764 + 15];
            custom.boostDIM = [259.6, 200];

            custom.wheel1 = getImage(IMAGES_BASE64.Asixel.wheel1);
            custom.wheel1TL = [-200 - 14.9, -250 + 15];
            custom.wheel1DIM = [250, 250];
            custom.wheel1CR = [-200 + 55.05, -47.48 + 15];
            custom.wheel1Theta = 0;
            custom.wheel1Radius = 38.89;

            custom.wheel2 = getImage(IMAGES_BASE64.Asixel.wheel2);
            custom.wheel2TL = [-200 - 14.9, -250 + 15];
            custom.wheel2DIM = [250, 250];
            custom.wheel2CR = [-200 + 110.11, -21.72 + 15];
            custom.wheel2Theta = 0;
            custom.wheel2Radius = 45.962;

            custom.wheel3 = getImage(IMAGES_BASE64.Asixel.wheel3);
            custom.wheel3TL = [-200 - 14.9, -250 + 15];
            custom.wheel3DIM = [250, 250];
            custom.wheel3CR = [-200 + 180.31, -52.02 + 15];
            custom.wheel3Theta = 0;
            custom.wheel3Radius = 41.416;

            custom.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
                ctx.rotate(racer.wheel2Theta);	// rotate
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
                if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

                // draw wheel 3
                ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel3Theta);	// rotate
                ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
                if (racer.wheel3) drawToCanvas(ctx, racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
                ctx.translate(...racer.wheel3CR); // translate back
                ctx.rotate(-racer.wheel3Theta); // undo rotation
                ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back
            }

            custom.customUpdate = (curTime) => {
                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI)

                racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI)

                racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * (curTime - racer.time) / 1000;
                racer.wheel3Theta = racer.wheel3Theta % (2 * Math.PI)
            }

            customRacers[name] = custom;
            break;
        case "BuddyHott":
            let buddy_hott = {};
            buddy_hott.avatarTL = [-154 - 3.5, -139];
            buddy_hott.avatarDIM = [80, 80];

            buddy_hott.vehicle = getImage(IMAGES_BASE64.assets.buddy_hott_vehicle);
            buddy_hott.vehicleTL = [-200 - 3.5, -200];
            buddy_hott.vehicleDIM = [200, 200];

            buddy_hott.showBoost = false;
            buddy_hott.boost = defaultDrawings.boost;
            buddy_hott.boostTL = [-200 - 82.3 - 3.5, -200 + 39.286];
            buddy_hott.boostDIM = [259.6, 200];

            buddy_hott.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();
            }
            customRacers["BuddyHott"] = buddy_hott;
            break;
        case "CafeSparrow":
            custom.avatarTL = [-200 + 75.7, -80 - 106.571];
            custom.avatarDIM = [80, 80];

            custom.vehicle = getImage(IMAGES_BASE64.Brit.vehicule);
            custom.vehicleTL = [-200 + 6, -200];
            custom.vehicleDIM = [200, 200];

            custom.showBoost = true;
            custom.boost = defaultDrawings.boost;
            custom.boostTL = [-200 - 11.107, -200 + 41.92];
            custom.boostDIM = [259.6, 200];

            custom.wheel1 = getImage(IMAGES_BASE64.Brit.wheel1);
            custom.wheel1TL = [-200 + 6, -200];
            custom.wheel1DIM = [200, 200];
            custom.wheel1CR = [-200 + 152.5325, -29.8];
            custom.wheel1Theta = 0;
            custom.wheel1Radius = 24.75;

            custom.wheel2 = getImage(IMAGES_BASE64.Brit.wheel2);
            custom.wheel2TL = [-200 + 6, -200];
            custom.wheel2DIM = [200, 200];
            custom.wheel2CR = [-200 + 99.5, -29.8];
            custom.wheel2Theta = 0;
            custom.wheel2Radius = 24.75;

            customRacers[name] = custom;
            break;
        case "DpOblivion":
            let dpoblivion = {};
            dpoblivion.avatarTL = [-200 + 102.4, -80 - 69.5];
            dpoblivion.avatarDIM = [80, 80];

            dpoblivion.vehicle = getImage(IMAGES_BASE64.assets.dpoblivion_vehicle);
            dpoblivion.vehicleTL = [-200, -200];
            dpoblivion.vehicleDIM = [200, 200];

            dpoblivion.showBoost = false;
            dpoblivion.boost = defaultDrawings.boost;
            dpoblivion.boostTL = [-200 - 42.871, -200 + 36.071];
            dpoblivion.boostDIM = [259.6, 200];
            dpoblivion.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
            }
            customRacers["DpOblivion"] = dpoblivion;
            break;
        case "Fareeha":
            let fareeha = {};
            fareeha.avatarTL = [-200 + 84.2, -80 - 90.17];
            fareeha.avatarDIM = [80, 80];

            fareeha.vehicle = getImage(IMAGES_BASE64.assets.fareeha_vehicle);
            fareeha.vehicleTL = [-200, -200];
            fareeha.vehicleDIM = [200, 200];

            fareeha.showBoost = false;
            fareeha.boost = defaultDrawings.boost;
            fareeha.boostTL = [-200 - 59, -200 + 19.91];
            fareeha.boostDIM = [259.6, 200];

            fareeha.wheel1 = getImage(IMAGES_BASE64.assets.fareeha_wheel1);
            fareeha.wheel1TL = [-200, -200];
            fareeha.wheel1DIM = [200, 200];
            fareeha.wheel1CR = [-200 + 57.58, -30];
            fareeha.wheel1Theta = Math.PI / 6;
            fareeha.wheel1Radius = 30;

            fareeha.wheel2 = getImage(IMAGES_BASE64.assets.fareeha_wheel2);
            fareeha.wheel2TL = [-200, -200];
            fareeha.wheel2DIM = [200, 200];
            fareeha.wheel2CR = [-200 + 143.4, -30];
            fareeha.wheel2Theta = Math.PI / 6;
            fareeha.wheel2Radius = 30;
            customRacers["Fareeha"] = fareeha;
            break;
        case "iamfridolin":
            let iamfridolin = {};
            iamfridolin.avatarTL = [-200 + 130.6, -50 - 89.67];
            iamfridolin.avatarDIM = [50, 50];

            iamfridolin.vehicle = getImage(IMAGES_BASE64.assets.fridolin_vehicle);
            iamfridolin.vehicleTL = [-200 + 6, -200];
            iamfridolin.vehicleDIM = [200, 200];

            iamfridolin.showBoost = false;
            iamfridolin.boost = defaultDrawings.boost;
            iamfridolin.boostTL = [-200 - 34.346, -124.74 - 40.195];
            iamfridolin.boostDIM = [161.917, 124.74];

            iamfridolin.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();
            }
            customRacers["iamfridolin"] = iamfridolin;
            break;
        case "jtbeaman":
            custom.avatarTL = [-200 + 77.988, -80 - 51.217];
            custom.avatarDIM = [80, 80];

            custom.vehicle = getImage(IMAGES_BASE64.jtbeaman.vehicule);
            custom.vehicleTL = [-200 + 2.571, -200];
            custom.vehicleDIM = [200, 200];

            custom.showBoost = false;
            custom.boost = defaultDrawings.boost;
            custom.boostTL = [-200 - 31.07, -119.286 + 32.014];
            custom.boostDIM = [154.554, 119.286];

            // Système de fireballs
            custom.fireballs = []; // Array pour stocker les fireballs actives
            custom.lastFireballTime = Date.now(); // Temps du dernier tir
            custom.fireballInterval = 2000; // Intervalle de 2 secondes entre les tirs
            custom.fireballDIM = [60, 60]; // Dimensions des fireballs

            custom.customUpdate = (curTime) => {
                // Vérifier s'il faut créer une nouvelle fireball
                if (curTime - racer.lastFireballTime >= racer.fireballInterval) {
                    // Créer une nouvelle fireball
                    racer.fireballs.push({
                        x: racer.vehicleTL[0] + racer.vehicleDIM[0], // Position de départ (droite du véhicule)
                        y: racer.vehicleTL[1] + racer.vehicleDIM[1]/2 - 30, // Aligné verticalement avec le véhicule
                        speed: racer.vel[0] + 200, // Vitesse = vitesse du véhicule + 50
                        flipTime: curTime,
                        isFlipped: false
                    });
                    racer.lastFireballTime = curTime;
                }
        
                // Mettre à jour la position de chaque fireball
                racer.fireballs.forEach((fireball, index) => {
                    fireball.x += fireball.speed * (curTime - racer.time) / 1000;
                    
                    // Flip vertical toutes les 0.5 secondes
                    if (curTime - fireball.flipTime >= 500) {
                        fireball.isFlipped = !fireball.isFlipped;
                        fireball.flipTime = curTime;
                    }
                });
        
                // Supprimer les fireballs qui sont trop loin
                racer.fireballs = racer.fireballs.filter(fireball => 
                    fireball.x < racer.vehicleTL[0] + 2000
                );
            }

            custom.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                // Dessin de chaque fireball
                racer.fireballs.forEach(fireball => {
                    ctx.save();
                    
                    // Application des transformations
                    ctx.translate(fireball.x + racer.fireballDIM[0]/2, 
                                fireball.y + 60 + (fireball.isFlipped ? racer.fireballDIM[1] : 0));
                    ctx.scale(1, fireball.isFlipped ? -1 : 1);
                    ctx.translate(-(fireball.x + racer.fireballDIM[0]/2), 
                                -(fireball.y));
                    
                    // Dessin de la fireball retournée horizontalement
                    ctx.scale(-1, 1);
                    ctx.drawImage(defaultDrawings.boost, 
                                -fireball.x, // - racer.fireballDIM[0], 
                                fireball.y, 
                                racer.fireballDIM[0], 
                                racer.fireballDIM[1]);
                    
                    ctx.restore();
                });

                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
            }
            customRacers[name] = custom;
            break;
        case "KnuthingIsReal":
            let num_vars = 4;
            let val = Math.floor(Math.random() * num_vars);
            // 0 Overboard
            // 1 Tapis
            // 2 Andy Hug
            // 3 Massage
            switch (val) {
                case 0:
                    let knu_0 = {};
                    knu_0.avatarTL = [-200 + 41.36, -80 - 51.787];
                    knu_0.avatarDIM = [80, 80];

                    knu_0.vehicle = getImage(IMAGES_BASE64.assets.knu_0_vehicle);
                    knu_0.vehicleTL = [-200 - 14, -200];
                    knu_0.vehicleDIM = [200, 200];

                    knu_0.showBoost = false;
                    knu_0.boost = defaultDrawings.boost;
                    knu_0.boostTL = [-200 - 93.3, -200 + 50.21];
                    knu_0.boostDIM = [259.6, 200];

                    knu_0.customDraw = () => {
                        if (racer.showBoost) {
                            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                        }
                        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                        
                        ctx.clip()
                        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();
                    }
                    customRacers["KnuthingIsReal"] = knu_0;
                    break;
                case 1:
                    let knu_1 = {};
                    knu_1.avatarTL = [-200 + 74.646, -80 - 52.5];
                    knu_1.avatarDIM = [80, 80];

                    knu_1.vehicle = getImage(IMAGES_BASE64.assets.knu_1_vehicle);
                    knu_1.vehicleTL = [-200 + 14, -200];
                    knu_1.vehicleDIM = [200, 200];

                    knu_1.showBoost = false;
                    knu_1.boost = defaultDrawings.boost;
                    knu_1.boostTL = [-200 - 37.87, -200 + 47.35];
                    knu_1.boostDIM = [259.6, 200];

                    knu_1.customDraw = () => {
                        if (racer.showBoost) {
                            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                        }
                        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                        
                        ctx.clip()
                        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();
                    }
                    customRacers["KnuthingIsReal"] = knu_1;
                    break;
                case 2:
                    let knu_2 = {};
                    knu_2.avatarTL = [-200 + 91.860 + 5, -80 - 61.430];
                    knu_2.avatarDIM = [90, 90];

                    knu_2.vehicle = getImage(IMAGES_BASE64.assets.knu_2_vehicle);
                    knu_2.vehicleTL = [-200 + 4, -200];
                    knu_2.vehicleDIM = [200, 200];

                    knu_2.showBoost = false;
                    knu_2.boost = defaultDrawings.boost;
                    knu_2.boostTL = [-200 - 18.871, -200 + 8.067];
                    knu_2.boostDIM = [259.6, 200];

                    knu_2.customDraw = () => {
                        if (racer.showBoost) {
                            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                        }
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                        
                        ctx.clip()
                        if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();
                        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                    }
                    customRacers["KnuthingIsReal"] = knu_2;
                    break;
                case 3:
                    custom.avatarTL = [-200 + 75.256, -90 - 52.023];
                    custom.avatarDIM = [90, 90];

                    custom.vehicle = getImage(IMAGES_BASE64.assets.knu_3_back);
                    custom.vehicleTL = [-200 + 17.678, -200];
                    custom.vehicleDIM = [0, 0];

                    custom.showBoost = false;
                    custom.boost = defaultDrawings.boost;
                    custom.boostTL = [-200 - 32.957, -200 + 43.550];
                    custom.boostDIM = [259.6, 200];

                    custom.wheel1 = getImage(IMAGES_BASE64.assets.knu_3_front);
                    custom.wheel1TL = [-200 + 17.678, -200];
                    custom.wheel1DIM = [200, 200];
                    custom.wheel1CR = [-90, -90];
                    custom.wheel1Theta = 0;
                    custom.wheel1Radius = 100;
                    
                    custom.wheel2 = getImage(IMAGES_BASE64.assets.knu_3_back);
                    custom.wheel2TL = [-200 + 17.678, -200];
                    custom.wheel2DIM = [200, 200];
                    custom.wheel2CR = [-90, -90];
                    custom.wheel2Theta = 0;
                    custom.wheel2Radius = 100;

                    custom.customDraw = () => {
                        // draw wheel 2
                        ctx.translate(...racer.wheel2CR);
                        ctx.rotate(racer.wheel2Theta);
                        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                        drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                        ctx.translate(...racer.wheel2CR); // translate back
                        ctx.rotate(-racer.wheel2Theta); // undo rotation
                        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
                        

                        // draw avatar in a circle
                        ctx.save()
                        ctx.beginPath()
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                        
                        ctx.clip()
                        drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();

                        // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                        ctx.rotate(racer.wheel1Theta);  // rotate
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                        drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate back
                        ctx.rotate(-racer.wheel1Theta); // undo rotation
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                    }
                    customRacers[name] = custom;
                    break;
            }
            break;
        case "MatMan2855":
            let matman = {};
            matman.avatarTL = [-200 + 67.938, -80 - 106.27];
            matman.avatarDIM = [80, 80];

            matman.vehicle = getImage(IMAGES_BASE64.assets.matman_vehicle);
            matman.vehicleTL = [-200 + 28.284, -200];
            matman.vehicleDIM = [200, 200];

            matman.showBoost = false;
            matman.boost = defaultDrawings.boost;
            matman.boostTL = [-259.6 + 1.52, -200 - 7.581];
            matman.boostDIM = [259.6, 200];

            matman.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();
                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
            }
            customRacers["MatMan2855"] = matman;
            break;
        case "ndlme":
            custom.avatarTL = [-200 + 66.56, -80 - 78.717];
            custom.avatarDIM = [80, 80];

            custom.vehicle = getImage(IMAGES_BASE64.ndlme.vehicule);
            custom.vehicleTL = [-200, -200];
            custom.vehicleDIM = [200, 200];

            custom.showBoost = false;
            custom.boost = defaultDrawings.boost;
            custom.boostTL = [-200 - 38.717, -200 + 31.3];
            custom.boostDIM = [259.133, 200];

            custom.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
            }
            customRacers[name] = custom;
            break;
        case "NowImABeliever":
            customRacers[name] = await genNowImABelieverCar(racer);  
            break;
        case "OmegaPrimal":
            customRacers["OmegaPrimal"] = await setupOmegaPrimal(racer);
            break;
        case "MermaidUnicorn":
            customRacers["MermaidUnicorn"] = await setupMermaidUnicorn(racer);
            break;
        case "TheSolid7":
            customRacers["TheSolid7"] = await setupTheSolid7(racer);
            break;
        case "DarkPanther9999":
            customRacers["DarkPanther9999"] = await setupDarkPanther9999(racer);
            break;
        case "pencils45":
            customRacers["pencils45"] = await setupPencil(racer);
            break;
        case "Verth987":
            let verth = {};
            
            // Sélection aléatoire entre les deux voitures (50% de chance chacune)
            const useVehicle2 = true; //Math.random() < 0.5;

            if (useVehicle2) {
                // Voiture 2
                verth.vehicle = getImage(IMAGES_BASE64.assets.verth_vehicle2);
                verth.vehicleTL = [-193 -30, -196];
                verth.vehicleDIM = [193, 196];
                
                // Avatar à 290x267 par rapport au coin top left de l'image
                verth.avatarTL = [verth.vehicleTL[0] + 160, verth.vehicleTL[1] + 137];
                verth.avatarDIM = [69, 69];
            } else {
                // Voiture 1 (configuration originale)
                verth.avatarTL = [-200 - 8 - 8, -69 - 63.7];
                verth.avatarDIM = [69, 69];
                verth.vehicle = getImage(IMAGES_BASE64.assets.verth_vehicle);
                verth.vehicleTL = [-200 - 100 - 8, -300];
                verth.vehicleDIM = [300, 300];
            }

            verth.showBoost = false;
            verth.boost = defaultDrawings.boost;
            verth.boostTL = [-200 - 182 - 8, -200 + 5.56];
            verth.boostDIM = [259.6, 200];

            verth.customDraw = () => {
                if (verth.showBoost) {
                    ctx.drawImage(verth.boost, ...verth.boostTL, ...verth.boostDIM);
                }

                ctx.drawImage(verth.vehicle, ...verth.vehicleTL, ...verth.vehicleDIM);

                ctx.save()
                ctx.beginPath()
                ctx.arc(...verth.avatarTL.map((val, ii) => val + verth.avatarDIM[ii] / 2), verth.avatarDIM[0] / 2, 0, Math.PI * 2, false)                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...verth.avatarTL, ...verth.avatarDIM);
                ctx.closePath();
                ctx.restore();
            }
            customRacers["Verth987"] = verth;
            break;
        case "SpiderSaucisse":
            customRacers[name] = await setupSpiderSaucisse(racer);
            break;
        case "Asixel":
            customRacers[name] = await setupAsixel(racer);
            break;
        case "apocalypse_squirrel":
            customRacers[name] = await setupApocalypseSquirrel(racer);
            break;
        case "THORpine":
            customRacers[name] = await setupTHORpine(racer);
            break;
        case "AndyTheFrenchy":
            custom = await genAndythefrenchyCar(racer);
            customRacers["AndyTheFrenchy"] = custom;
            break;
        case "Secret":
        case "Secret2":
                // vehicle main // 800x350
                racer.vehicle = getImage(customDefaultCar = "Secret" ? IMAGES_BASE64.default_vehicule.fruitcake : IMAGES_BASE64.default_vehicule.fruitcake2);

                racer.vehicle.style = { filter: "hue-rotate(60deg)" };
                racer.vehicleTL = [-200, -175 + 14.597];
                racer.vehicleDIM = [200, 200];
                racer.vehicleCR = [-150, -60]; // center of rotation

                racer.showBoost = false;
                racer.boost = defaultDrawings.boost;
                racer.boostTL = [-259.6, -175 + 14.597];
                racer.boostDIM = [259.6, 200];

                racer.wheel1 = getImage(IMAGES_BASE64.default_vehicule.fruitcakeWheel1);
                //racer.wheel1.src = IMAGES.racer_wheel1;
                racer.wheel1TL = [-200, -135 + 14.597];
                racer.wheel1DIM = [481 / 2.5, 301 / 2.5];
                racer.wheel1CR = [-150, -37 + 14.597];
                racer.wheel1Theta = Math.PI / 6;
                racer.wheel1Radius = 50 / 2.5;

                racer.wheel2 = getImage(IMAGES_BASE64.default_vehicule.fruitcakeWheel2);
                //racer.wheel2.src = IMAGES.racer_wheel2;
                racer.wheel2TL = [-196, -135 + 14.597];
                racer.wheel2DIM = [481 / 2.5, 301 / 2.5];
                racer.wheel2CR = [-58, -37 + 14.597];
                racer.wheel2Theta = Math.PI / 6;
                racer.wheel2Radius = 50 / 2.5;
        
                break;
        case "Bjorn_Jordson":
            custom.avatarTL = [-182 + 58, -154 + 12];
            custom.avatarDIM = [76, 76];

            custom.vehicle = getImage(IMAGES_BASE64.Bjorn_Jordson.vehicule);
            custom.vehicleTL = [-182, -154];
            custom.vehicleDIM = [182, 154];

            custom.showBoost = false;
            custom.boost = defaultDrawings.boost;
            custom.boostTL = [-182 - 38.717, -154 + 31.3];
            custom.boostDIM = [259.133, 200];

            custom.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

            }
            customRacers[name] = custom;
            break;
        case "COREYTOWNZ":
            let COREYTOWNZ = {};
            COREYTOWNZ.avatarTL = [-130.25, -175];
            COREYTOWNZ.avatarDIM = [116, 116];
            COREYTOWNZ.vehicle = getImage(IMAGES_BASE64.COREYTOWNZ.vehicule);

            COREYTOWNZ.vehicle.style = { filter: "hue-rotate(60deg)" };
            COREYTOWNZ.vehicleTL = [-170, -170 + 12.407];
            COREYTOWNZ.vehicleDIM = [170, 170];
            COREYTOWNZ.vehicleCR = [-102, -40.8]; // center of rotation

            COREYTOWNZ.showBoost = false;
            COREYTOWNZ.boost = defaultDrawings.boost;
            COREYTOWNZ.boostTL = [-212.5, -212.5 + 12.407];
            COREYTOWNZ.boostDIM = [220.66, 170];

            COREYTOWNZ.wheel1 = getImage(IMAGES_BASE64.COREYTOWNZ.wheel1);;
            //racer.wheel1.src = IMAGES.racer_wheel1;
            COREYTOWNZ.wheel1TL = [-115.6, -18.7];
            COREYTOWNZ.wheel1DIM = [28.9, 36.55];
            COREYTOWNZ.wheel1CR = [-108.8, -10.2];
            COREYTOWNZ.wheel1Theta = Math.PI / 6;
            COREYTOWNZ.wheel1Radius = 13.6;
            COREYTOWNZ.wheel1ThetaDot = -1;

            COREYTOWNZ.wheel2 = getImage(IMAGES_BASE64.COREYTOWNZ.wheel2);;
            //racer.wheel2.src = IMAGES.racer_wheel2;
            COREYTOWNZ.wheel2TL = [-54.4, -17];
            COREYTOWNZ.wheel2DIM = [32.3, 35.7];
            COREYTOWNZ.wheel2CR = [-58.65, -10.2];
            COREYTOWNZ.wheel2Theta = -Math.PI / 6;
            COREYTOWNZ.wheel2Radius = 13.6;
            COREYTOWNZ.wheel2ThetaDot = -1;

            COREYTOWNZ.customUpdate = (curTime) => {
                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
                    racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
                    racer.wheel1Theta = - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                }

                racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
                    racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
                    racer.wheel2ThetaDot *= -1;
                } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
                    racer.wheel2Theta = - racer.wheel2Theta;
                    racer.wheel2ThetaDot *= -1;
                }
            }

            COREYTOWNZ.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();    
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);    
                
                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
                ctx.rotate(racer.wheel2Theta);	// rotate
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
                if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back            
            }
            
            customRacers[name] = COREYTOWNZ;
            break;
        case "Polorbaer":    
            let Polorbaer = {};
            Polorbaer.avatarTL = [-250 + 66.56, -70 - 78.717];
            Polorbaer.avatarDIM = [80, 80];

            Polorbaer.vehicle = getImage(IMAGES_BASE64.Polorbaer.vehicule);
            Polorbaer.vehicleTL = [-250, -150];
            Polorbaer.vehicleDIM = [250, 150];

            Polorbaer.showBoost = false;
            Polorbaer.boost = defaultDrawings.boost;
            Polorbaer.boostTL = [-200 - 38.717, -200 + 31.3];
            Polorbaer.boostDIM = [259.133, 200];

            Polorbaer.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
               
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

            }
            customRacers[name] = Polorbaer;
            break;         
        case "SeiKen_DMs":
            let SeiKen_DMs = {};
            SeiKen_DMs.avatarTL = [-167 + 58, -154 + 12];
            SeiKen_DMs.avatarDIM = [76, 76];

            SeiKen_DMs.vehicle = getImage(IMAGES_BASE64.Seiken.vehicule);

            SeiKen_DMs.vehicleTL = [-250, -250 + 14.597];
            SeiKen_DMs.vehicleDIM = [250, 250];

            SeiKen_DMs.showBoost = false;
            SeiKen_DMs.boost = defaultDrawings.boost;
            SeiKen_DMs.boostTL = [-250, -250 + 14.597];
            SeiKen_DMs.boostDIM = [259.6, 200];

            SeiKen_DMs.wheel1 = getImage(IMAGES_BASE64.Seiken.rame);
            //racer.wheel1.src = IMAGES.racer_wheel1;
            SeiKen_DMs.wheel1TL = [-280, -100];
            SeiKen_DMs.wheel1DIM = [109, 94];
            SeiKen_DMs.wheel1CR = [-185, -80];
            SeiKen_DMs.wheel1Theta = Math.PI/8; // Changé le signe pour tourner dans l'autre sens
            SeiKen_DMs.wheel1Radius = 90;
            SeiKen_DMs.wheel1ThetaDot = -1; // Inversé le sens de rotation

            SeiKen_DMs.customUpdate = (curTime) => {
                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
                    racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
                    racer.wheel1Theta = - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                }
            }
                
            SeiKen_DMs.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();    
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);    
                
                    // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back           
            }
    
            customRacers[name] = SeiKen_DMs;
            break;  
        case "ThunderP00P":
            let Thunfsrwppoool = {};
            Thunfsrwppoool.avatarTL = [-120, -190];
            Thunfsrwppoool.avatarDIM = [76, 76];

            Thunfsrwppoool.vehicle = getImage(IMAGES_BASE64.Thunfsrwppoool.vehicule);

            Thunfsrwppoool.vehicleTL = [-179, -185 + 14.597];
            Thunfsrwppoool.vehicleDIM = [179, 185];

            Thunfsrwppoool.showBoost = false;
            Thunfsrwppoool.boost = defaultDrawings.boost;
            Thunfsrwppoool.boostTL = [-250, -250 + 14.597];
            Thunfsrwppoool.boostDIM = [259.6, 200];

            Thunfsrwppoool.wheel1 = getImage(IMAGES_BASE64.Thunfsrwppoool.wheel1);
            //racer.wheel1.src = IMAGES.racer_wheel1;
            Thunfsrwppoool.wheel1TL = [-90, -10];
            Thunfsrwppoool.wheel1DIM = [68, 41];
            
            Thunfsrwppoool.wheel2 = getImage(IMAGES_BASE64.Thunfsrwppoool.wheel2);
            //racer.wheel1.src = IMAGES.racer_wheel1;
            Thunfsrwppoool.wheel2TL = [-200, -10];
            Thunfsrwppoool.wheel2DIM = [72, 44];
                
            Thunfsrwppoool.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);                                                                          
                
                drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM);
                drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();    
            }    
            
            customRacers[name] = Thunfsrwppoool;
            break;  
        case "THORpine":
            let THORpineRandomVehicle = Math.random() < 0.5 ? 'pompe' : 'chariot';
            // THORpineRandomVehicle =  'chariot';
            let THORpine = {};
            switch (THORpineRandomVehicle) {
                case 'pompe':
                    THORpine.avatarTL = [-236 + 50.12, -133 + 37];
                    THORpine.avatarTheta = Math.PI / 6;
                    THORpine.avatarRadius = 37.5;
                    THORpine.avatarDIM = [75, 75];
                    THORpine.avatarCR = [-236 + 87, -133 + 74.5];

                    THORpine.vehicle = getImage(IMAGES_BASE64.THORpine.pompe.vehicule);
                    THORpine.vehicleTL = [-236, -133];
                    THORpine.vehicleDIM = [236, 133];

                    THORpine.vehicleAdd = getImage(IMAGES_BASE64.THORpine.pompe.grid);
                    THORpine.vehicleAddTL = [-236 + 44, -133 + 33];
                    THORpine.vehicleAddDIM = [85, 74];

                    THORpine.showBoost = false;
                    THORpine.boost = defaultDrawings.boost;
                    THORpine.boostTL = [-200 - 47.4, -200 + 20.87];
                    THORpine.boostDIM = [259.6, 200];

                    THORpine.wheel1 = getImage(IMAGES_BASE64.THORpine.pompe.wheel1);
                    THORpine.wheel1TL = [-236 + 12 -9.5, -133 + 38 -9.5];
                    THORpine.wheel1DIM = [19, 19];
                    THORpine.wheel1CR = [-236 + 12, -133 + 38];
                    THORpine.wheel1Theta = Math.PI / 6;
                    THORpine.wheel1Radius = 9.5;

                    THORpine.wheel2 = getImage(IMAGES_BASE64.THORpine.pompe.wheel2);
                    THORpine.wheel2TL = [-236 + 12 - 8.5, -133 + 89 - 8.5];
                    THORpine.wheel2DIM = [17, 17];
                    THORpine.wheel2CR = [-236 + 12, -133 + 89];
                    THORpine.wheel2Theta = Math.PI / 6;
                    THORpine.wheel2Radius = 8.5;

                    THORpine.customDraw = () => {
                        if (racer.showBoost) {
                            ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                        }
                        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                            
                        // Rotation de l'avatar
                        ctx.save();
                        ctx.translate(...racer.avatarCR);
                        ctx.rotate(racer.avatarTheta);
                        ctx.translate(-racer.avatarCR[0], -racer.avatarCR[1]);
                        
                        ctx.beginPath();
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                        ctx.clip();
                        drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();

                        ctx.drawImage(racer.vehicleAdd, ...racer.vehicleAddTL, ...racer.vehicleAddDIM);

                        // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                        ctx.rotate(racer.wheel1Theta);	// rotate
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                        if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate back
                        ctx.rotate(-racer.wheel1Theta); // undo rotation
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                        // draw wheel 2
                        ctx.translate(...racer.wheel2CR);
                        ctx.rotate(racer.wheel2Theta);
                        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                        if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                        ctx.translate(...racer.wheel2CR); // translate back
                        ctx.rotate(-racer.wheel2Theta); // undo rotation
                        ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back

                    }

                    THORpine.customUpdate = (curTime) => {              
                        // Fait tourner l'avatar en fonction de la vitesse
                        racer.avatarTheta -= racer.vel[0] / racer.avatarRadius * (curTime - racer.time) / 1000;
                        racer.avatarTheta = racer.avatarTheta % (2 * Math.PI);

                        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                        racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);
                        racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * (curTime - racer.time) / 1000;
                        racer.wheel2Theta = racer.wheel2Theta % (2 * Math.PI);
                    }
                    break;
                case 'chariot':                    
                    THORpine.avatarTL = [-228, -115];
                    THORpine.avatarTheta = Math.PI / 6;
                    THORpine.avatarRadius = 37.5;
                    THORpine.avatarDIM = [75, 75];
                    THORpine.avatarCR = [-198, -70];

                    THORpine.vehicle = getImage(IMAGES_BASE64.THORpine.chariot.vehicule);
                    THORpine.vehicleTL = [-198, -212];
                    THORpine.vehicleDIM = [198, 212];

                    THORpine.showBoost = false;
                    THORpine.boost = defaultDrawings.boost;
                    THORpine.boostTL = [-200 - 47.4, -200 + 20.87];
                    THORpine.boostDIM = [259.6, 200];

                    THORpine.wheel1 = getImage(IMAGES_BASE64.THORpine.chariot.wheel1);
                    THORpine.wheel1DIM = [70, 58];
                    THORpine.wheel1CR = [THORpine.vehicleTL[0] + 168, THORpine.vehicleTL[1] + 195];
                    THORpine.wheel1TL = [THORpine.wheel1CR[0] - THORpine.wheel1DIM[0]/2, THORpine.wheel1CR[1] - THORpine.wheel1DIM[1]/2];
                    THORpine.wheel1Theta = Math.PI / 6;
                    THORpine.wheel1Radius = 35;

                    THORpine.manche = getImage(IMAGES_BASE64.THORpine.chariot.manche);
                    THORpine.mancheTL = [-190, -90];
                    THORpine.mancheDIM = [52, 13];
                                    
                    // Ajout du choux qui tombe
                    THORpine.fallingChoux = getImage(IMAGES_BASE64.THORpine.chariot.choux);
                    THORpine.fallingChouxTL = [-75, -130]; // Même position initiale que THORpine.choux
                    THORpine.fallingChouxDIM = [42*0.9, 46*0.9];
                    THORpine.fallingChouxTheta = 0; // Pour la rotation
                    THORpine.fallingChouxTimer = 0; // Pour gérer le cycle de 10s
                    THORpine.fallingChouxState = 'waiting'; // États: waiting, falling, rolling
                    THORpine.fallingChouxSpeed = { x: 0, y: 0 }; // Vitesse de chute
                    THORpine.fallingChouxRotationSpeed = 0; // Vitesse de rotation

                    ratio = 0.85;

                    THORpine.choux = getImage(IMAGES_BASE64.THORpine.chariot.choux);
                    THORpine.chouxTL = [-75, -130];
                    THORpine.chouxDIM = [42*ratio, 46*ratio];
                    THORpine.chouxOffset = 0; // Pour l'animation
                    THORpine.chouxAmplitude = 5; // Amplitude du mouvement
                    THORpine.chouxSpeed = 12; // Vitesse de l'animation                    

                    THORpine.vehicleAdd = getImage(IMAGES_BASE64.THORpine.chariot.chouxArriere);
                    THORpine.vehicleAddTL = [-133, -131];
                    THORpine.vehicleAddDIM = [100, 55];

                    THORpine.choux3 = getImage(IMAGES_BASE64.THORpine.chariot.choux1);
                    THORpine.choux3TL = [-101, -108];
                    THORpine.choux3DIM = [46*ratio, 41*ratio];
                    THORpine.choux3Offset = 0; // Pour l'animation
                    THORpine.choux3Amplitude = 8; // Amplitude du mouvement

                    THORpine.choux4 = getImage(IMAGES_BASE64.THORpine.chariot.choux2);
                    THORpine.choux4TL = [-130, -128];
                    THORpine.choux4DIM = [41*ratio, 46*ratio];
                    THORpine.choux4Offset = 0; // Pour l'animation
                    THORpine.choux4Amplitude = 5; // Amplitude du mouvement

                    THORpine.choux2 = getImage(IMAGES_BASE64.THORpine.chariot.choux);
                    THORpine.choux2TL = [-148, -96];
                    THORpine.choux2DIM = [42, 46];
                    THORpine.choux2CR = [-8, -124];
                    THORpine.choux2Theta = Math.PI / 6;
                    THORpine.choux2Radius = 13;

                    THORpine.customDraw = () => {
                        ctx.drawImage(racer.vehicleAdd, ...racer.vehicleAddTL, ...racer.vehicleAddDIM);
                        ctx.drawImage(racer.choux, ...racer.chouxTL, ...racer.chouxDIM);
                        ctx.drawImage(racer.choux4, ...racer.choux4TL, ...racer.choux4DIM);
                        ctx.drawImage(racer.choux3, ...racer.choux3TL, ...racer.choux3DIM);
                        ctx.drawImage(racer.manche, ...racer.mancheTL, ...racer.mancheDIM);
                            
                        // Rotation de l'avatar
                        ctx.save();
                        ctx.translate(...racer.avatarCR);
                        ctx.rotate(racer.avatarTheta);
                        ctx.translate(-racer.avatarCR[0], -racer.avatarCR[1]);
                        
                        ctx.beginPath();
                        ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false);
                        ctx.clip();
                        drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                        ctx.closePath();
                        ctx.restore();                        
                        
                        ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                        // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                        ctx.rotate(racer.wheel1Theta);	// rotate
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                        if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                        ctx.translate(...racer.wheel1CR); // translate back
                        ctx.rotate(-racer.wheel1Theta); // undo rotation
                        ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                        // Dessin du choux qui tombe
                        if (racer.fallingChouxState !== 'waiting') {
                            ctx.save();
                            ctx.translate(
                                racer.fallingChouxTL[0] + racer.fallingChouxDIM[0]/2, 
                                racer.fallingChouxTL[1] + racer.fallingChouxDIM[1]/2
                            );
                            ctx.rotate(racer.fallingChouxTheta);
                            ctx.drawImage(
                                racer.fallingChoux, 
                                -racer.fallingChouxDIM[0]/2, 
                                -racer.fallingChouxDIM[1]/2, 
                                racer.fallingChouxDIM[0], 
                                racer.fallingChouxDIM[1]
                            );
                            ctx.restore();
                        }
                    }
                    THORpine.customUpdate = (curTime) => {
                        const wheelRotationSpeed = racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;

                        racer.wheel1Theta += wheelRotationSpeed;
                        racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);

                        // Gestion du choux qui tombe
                        racer.fallingChouxTimer += (curTime - racer.time);
                        
                        // Réinitialisation toutes les 10 secondes
                        if (racer.fallingChouxTimer >= 10000) {
                            racer.fallingChouxTimer = 0;
                            racer.fallingChouxState = 'falling';
                            racer.fallingChouxTL = [-75, -130]; // Position initiale
                            racer.fallingChouxTheta = 0;
                            racer.fallingChouxSpeed = { x: -2, y: 2 }; // Vitesse initiale
                        }

                        // Animation de chute
                        if (racer.fallingChouxState === 'falling') {
                            racer.fallingChouxTL[0] += racer.fallingChouxSpeed.x;
                            racer.fallingChouxTL[1] += racer.fallingChouxSpeed.y;
                            racer.fallingChouxTheta += wheelRotationSpeed * 2;
                            racer.fallingChouxSpeed.y += 0.2; // Gravité
                
                            // Détection du sol (bas du véhicule)
                            if (racer.fallingChouxTL[1] >= racer.vehicleTL[1] + racer.vehicleDIM[1] - racer.fallingChouxDIM[1]) {
                                racer.fallingChouxState = 'rolling';
                                racer.fallingChouxTL[1] = racer.vehicleTL[1] + racer.vehicleDIM[1] - racer.fallingChouxDIM[1];
                                racer.fallingChouxSpeed = { x: -3, y: 0 };
                            }
                        }
                
                        // Animation de roulement
                        if (racer.fallingChouxState === 'rolling') {
                            racer.fallingChouxTL[0] += racer.fallingChouxSpeed.x;
                            racer.fallingChouxTheta += wheelRotationSpeed * 3;
                
                            // Arrêt quand le choux sort de l'écran
                            if (racer.fallingChouxTL[0] < -1600) {
                                racer.fallingChouxState = 'waiting';
                            }
                        }

                        // Fait tourner l'avatar en fonction de la vitesse
                        racer.avatarTheta -= racer.vel[0] / racer.avatarRadius * (curTime - racer.time) / 1000;
                        racer.avatarTheta = racer.avatarTheta % (2 * Math.PI);

                        racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * (curTime - racer.time) / 1000;
                        racer.wheel1Theta = racer.wheel1Theta % (2 * Math.PI);

                        racer.choux2Theta += racer.vel[0] / racer.choux2Radius * (curTime - racer.time) / 1000;
                        racer.choux2Theta = racer.choux2Theta % (2 * Math.PI);

                        // Animation des choux
                        racer.chouxOffset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                        // Calcul du déplacement vertical
                        const chouxY = Math.sin(racer.chouxOffset) * racer.chouxAmplitude;
                        // Mise à jour des positions
                        racer.chouxTL[1] = -130 + chouxY;

                        // Animation des choux
                        racer.choux3Offset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                        // Calcul du déplacement vertical
                        const choux3Y = Math.sin(racer.choux3Offset) * racer.choux3Amplitude;
                        // Mise à jour des positions
                        racer.choux3TL[1] = -138 + choux3Y;

                        // Animation des choux
                        racer.choux4Offset += racer.chouxSpeed * (curTime - racer.time) / 1000;
                        // Calcul du déplacement vertical
                        const choux4Y = Math.sin(racer.choux4Offset) * racer.choux4Amplitude;
                        // Mise à jour des positions
                        racer.choux4TL[1] = -128 + choux4Y; 
                    }
                    break;
                }

            customRacers[name] = THORpine;
            break;  
        case "looptydude":
            let looptydude = {};
            looptydude.avatarTL = [-250 - 12 + 162 - 25, -102 + 65 - 35];
            looptydude.avatarDIM = [70, 70];

            looptydude.vehicle = getImage(IMAGES_BASE64.looptydude.vehicule);
            looptydude.vehicleTL = [-250 - 12, -102];
            looptydude.vehicleDIM = [300, 122];

            looptydude.showBoost = false;
            looptydude.boost = defaultDrawings.boost;
            looptydude.boostTL = [-200 - 47.4, -200 + 20.87];
            looptydude.boostDIM = [259.6, 200];

            looptydude.wheel1 = getImage(IMAGES_BASE64.looptydude.wheel1);
            looptydude.wheel1CR = [looptydude.vehicleTL[0] + 80, looptydude.vehicleTL[1] + 105];
            looptydude.wheel1TL = [looptydude.wheel1CR[0] - 15, looptydude.wheel1CR[1] - 15];
            looptydude.wheel1DIM = [37, 32];
            looptydude.wheel1Theta = Math.PI / 6;
            looptydude.wheel1Radius = 15;

            looptydude.wheel2 = getImage(IMAGES_BASE64.looptydude.wheel2);
            looptydude.wheel2CR = [looptydude.vehicleTL[0] + 219, looptydude.vehicleTL[1] + 106];
            looptydude.wheel2TL = [looptydude.wheel2CR[0] - 15, looptydude.wheel2CR[1] - 15];
            looptydude.wheel2DIM = [38, 27];
            looptydude.wheel2Theta = Math.PI / 6;
            looptydude.wheel2Radius = 15;

            looptydude.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR);
                ctx.rotate(racer.wheel2Theta);
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
            }
            customRacers["looptydude"] = looptydude;
            break;
        case "rondoudou":
            let rondoudou = {};
            rondoudou.avatarTL = [-200 - 9.6 + 62.4, -200 + 30.4];
            rondoudou.avatarDIM = [104, 104];

            rondoudou.vehicle = getImage(IMAGES_BASE64.RandomPlayer.vehicule);
            rondoudou.vehicleTL = [-200 - 9.6, -200];
            rondoudou.vehicleDIM = [200, 200];

            rondoudou.showBoost = false;
            rondoudou.boost = defaultDrawings.boost;
            rondoudou.boostTL = [-160 - 37.92, -160 + 16.696];
            rondoudou.boostDIM = [207.68, 160];

            rondoudou.wheel1 = getImage(IMAGES_BASE64.RandomPlayer.wheel1);
            rondoudou.wheel1CR = [rondoudou.vehicleTL[0] + 32.8, rondoudou.vehicleTL[1] + 166.4];
            rondoudou.wheel1TL = [rondoudou.wheel1CR[0] - 36, rondoudou.wheel1CR[1] - 36];
            rondoudou.wheel1DIM = [72, 72];
            rondoudou.wheel1Theta = Math.PI / 6;
            rondoudou.wheel1Radius = 12;

            rondoudou.wheel2 = getImage(IMAGES_BASE64.RandomPlayer.wheel2);
            rondoudou.wheel2CR = [rondoudou.vehicleTL[0] + 164.8, rondoudou.vehicleTL[1] + 166.4];
            rondoudou.wheel2TL = [rondoudou.wheel2CR[0] - 36, rondoudou.wheel2CR[1] - 36];
            rondoudou.wheel2DIM = [72, 72];
            rondoudou.wheel2Theta = Math.PI / 6;
            rondoudou.wheel2Radius = 12;

            rondoudou.customDraw = () => {
                if (racer.showBoost) {
                    ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);

                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR);
                ctx.rotate(racer.wheel2Theta);
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
            }
            customRacers["rondoudou"] = rondoudou;
            break;
        case "WeeZ51626":
                let WeeZ51626 = {};
    
                WeeZ51626.vehicle = getImage(IMAGES_BASE64.WeeZ51626.vehicule);
                WeeZ51626.vehicleTL = [-226.6 - 13.2, -94.6];
                WeeZ51626.vehicleDIM = [226.6, 94.6];

                WeeZ51626.avatarTL = [WeeZ51626.vehicleTL[0] + 70, WeeZ51626.vehicleTL[1] - 50.5];
                WeeZ51626.avatarDIM = [77, 77];
    
                WeeZ51626.showBoost = false;
                WeeZ51626.boost = defaultDrawings.boost;
                WeeZ51626.boostTL = [-220 - 52.14, -220 + 22.957];
                WeeZ51626.boostDIM = [285.56, 220];
    
                WeeZ51626.wheel1 = getImage(IMAGES_BASE64.WeeZ51626.wheel1);
                WeeZ51626.wheel1CR = [WeeZ51626.vehicleTL[0] + 50.6, WeeZ51626.vehicleTL[1] + 94.6];
                WeeZ51626.wheel1TL = [WeeZ51626.wheel1CR[0] - 48.4, WeeZ51626.wheel1CR[1] - 41.8];
                WeeZ51626.wheel1DIM = [89.1, 85.8];
                WeeZ51626.wheel1Theta = Math.PI / 6;
                WeeZ51626.wheel1Radius = 16.5;

                WeeZ51626.wheel2 = getImage(IMAGES_BASE64.WeeZ51626.wheel2);
                WeeZ51626.wheel2CR = [WeeZ51626.vehicleTL[0] + 146.3, WeeZ51626.vehicleTL[1] + 96.8];
                WeeZ51626.wheel2TL = [WeeZ51626.wheel2CR[0] - 48.4, WeeZ51626.wheel2CR[1] - 41.8];
                WeeZ51626.wheel2DIM = [93.5, 84.7];
                WeeZ51626.wheel2Theta = Math.PI / 6;
                WeeZ51626.wheel2Radius = 16.5;
    
                WeeZ51626.customDraw = () => {
                    if (racer.showBoost) {
                        ctx.drawImage(racer.boost, ...racer.boostTL, ...racer.boostDIM);
                    }
    
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                    
                    ctx.clip()
                    if (racer.avatar.src) ctx.drawImage(racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                    ctx.closePath();
                    ctx.restore();
    
                    ctx.drawImage(racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
    
                    // draw wheel 1
                    ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                    ctx.rotate(racer.wheel1Theta);	// rotate
                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                    if (racer.wheel1) ctx.drawImage(racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                    ctx.translate(...racer.wheel1CR); // translate back
                    ctx.rotate(-racer.wheel1Theta); // undo rotation
                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back
    
                    // draw wheel 2
                    ctx.translate(...racer.wheel2CR);
                    ctx.rotate(racer.wheel2Theta);
                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]);
                    if (racer.wheel2) ctx.drawImage(racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM);
                    ctx.translate(...racer.wheel2CR); // translate back
                    ctx.rotate(-racer.wheel2Theta); // undo rotation
                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back
                }
                customRacers["WeeZ51626"] = WeeZ51626;
                break;
        case "Drhahn_qc":
            let Drhahn_qc = {};
            Drhahn_qc.avatarTL = [(-200), (-90 - 58.690)];
            Drhahn_qc.avatarDIM = [90, 90];

            Drhahn_qc.vehicle = getImage(IMAGES_BASE64.Drhahn.vehicule);
            Drhahn_qc.vehicleTL = [(-250), (-250)];
            Drhahn_qc.vehicleDIM = [250, 250];

            Drhahn_qc.showBoost = false;
            Drhahn_qc.boost = defaultDrawings.boost;
            Drhahn_qc.boostTL = [(-200 - 60.099), (-200 + 26.764)];
            Drhahn_qc.boostDIM = [259.6, 200];

            Drhahn_qc.wheel1 = getImage(IMAGES_BASE64.Drhahn.back_back);
            Drhahn_qc.wheel1TL = [(-235), -45];
            Drhahn_qc.wheel1DIM = [42, 44];
            Drhahn_qc.wheel1CR = [-205, -40];
            Drhahn_qc.wheel1Theta = -Math.PI / 4;
            Drhahn_qc.wheel1Radius = 42;
            Drhahn_qc.wheel1ThetaDot = -1;

            Drhahn_qc.wheel2 = getImage(IMAGES_BASE64.Drhahn.front_back);
            Drhahn_qc.wheel2TL = [(-140), -35];
            Drhahn_qc.wheel2DIM = [33, 35];
            Drhahn_qc.wheel2CR = [-120, -35];
            Drhahn_qc.wheel2Theta = -Math.PI / 8;
            Drhahn_qc.wheel2Radius = 42;
            Drhahn_qc.wheel2ThetaDot = -1;

            Drhahn_qc.wheel3 = getImage(IMAGES_BASE64.Drhahn.bcak_front);
            Drhahn_qc.wheel3TL = [(-185), -40];
            Drhahn_qc.wheel3DIM = [31, 44];
            Drhahn_qc.wheel3CR = [(-160), -40];
            Drhahn_qc.wheel3Theta = Math.PI / 8;
            Drhahn_qc.wheel3Radius = 42;
            Drhahn_qc.wheel3ThetaDot = -1;

            Drhahn_qc.wheel4 = getImage(IMAGES_BASE64.Drhahn.front_front);
            Drhahn_qc.wheel4TL = [(-100), -40];
            Drhahn_qc.wheel4DIM = [34, 36];
            Drhahn_qc.wheel4CR = [-80, -40];
            Drhahn_qc.wheel4Theta = 0;
            Drhahn_qc.wheel4Radius = 42;
            Drhahn_qc.wheel4ThetaDot = 1;

            Drhahn_qc.wheel5 = getImage(IMAGES_BASE64.Drhahn.tail);
            Drhahn_qc.wheel5TL = [(-245), -150];
            Drhahn_qc.wheel5DIM = [45, 98];
            Drhahn_qc.wheel5CR = [-215, -67];
            Drhahn_qc.wheel5Theta = 0;
            Drhahn_qc.wheel5Radius = 42;
            Drhahn_qc.wheel5ThetaDot = -1;

            Drhahn_qc.customUpdate = (curTime) => {
                racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel1Theta < -Math.PI / 2 && racer.wheel1ThetaDot === -1) {
                    racer.wheel1Theta = -2 * Math.PI / 2 - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                } else if (racer.wheel1Theta > 0 && racer.wheel1ThetaDot === 1) {
                    racer.wheel1Theta = - racer.wheel1Theta;
                    racer.wheel1ThetaDot *= -1;
                }

                racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
                    racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
                    racer.wheel2ThetaDot *= -1;
                } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
                    racer.wheel2Theta = - racer.wheel2Theta;
                    racer.wheel2ThetaDot *= -1;
                }

                racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * racer.wheel3ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel3Theta < 0 && racer.wheel3ThetaDot === -1) {
                    racer.wheel3Theta = - racer.wheel3Theta;
                    racer.wheel3ThetaDot *= -1;
                } else if (racer.wheel3Theta > Math.PI / 2 && racer.wheel3ThetaDot === 1) {
                    racer.wheel3Theta = 2 * Math.PI / 2 - racer.wheel3Theta;
                    racer.wheel3ThetaDot *= -1;
                }

                racer.wheel4Theta += racer.vel[0] / racer.wheel4Radius * racer.wheel4ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel4Theta < 0 && racer.wheel4ThetaDot === -1) {
                    racer.wheel4Theta = - racer.wheel4Theta;
                    racer.wheel4ThetaDot *= -1;
                } else if (racer.wheel4Theta > Math.PI / 2 && racer.wheel4ThetaDot === 1) {
                    racer.wheel4Theta = 2 * Math.PI / 2 - racer.wheel4Theta;
                    racer.wheel4ThetaDot *= -1;
                }

                racer.wheel5Theta += racer.vel[0] / racer.wheel5Radius * racer.wheel5ThetaDot * (curTime - racer.time) / 1000;
                if (racer.wheel5Theta < 0 && racer.wheel5ThetaDot === -1) {
                    racer.wheel5Theta = - racer.wheel5Theta;
                    racer.wheel5ThetaDot *= -1;
                } else if (racer.wheel5Theta > Math.PI / 2 && racer.wheel5ThetaDot === 1) {
                    racer.wheel5Theta = 2 * Math.PI / 2 - racer.wheel5Theta;
                    racer.wheel5ThetaDot *= -1;
                }
            }

            Drhahn_qc.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                // draw avatar
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();

                // draw wheel 3
                ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel3Theta);	// rotate
                ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
                if (racer.wheel3) drawToCanvas(ctx, racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
                ctx.translate(...racer.wheel3CR); // translate back
                ctx.rotate(-racer.wheel3Theta); // undo rotation
                ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back

                // draw wheel 4
                ctx.translate(...racer.wheel4CR); // translate to center of rotation for wheel
                ctx.rotate(racer.wheel4Theta);	// rotate
                ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation
                if (racer.wheel4) drawToCanvas(ctx, racer.wheel4, ...racer.wheel4TL, ...racer.wheel4DIM); // draw wheel
                ctx.translate(...racer.wheel4CR); // translate back
                ctx.rotate(-racer.wheel4Theta); // undo rotation
                ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation back

                // draw vehicle
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel1Theta);	// rotate
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                ctx.translate(...racer.wheel1CR); // translate back
                ctx.rotate(-racer.wheel1Theta); // undo rotation
                ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back

                // draw wheel 2
                ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
                ctx.rotate(racer.wheel2Theta);	// rotate
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
                if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
                ctx.translate(...racer.wheel2CR); // translate back
                ctx.rotate(-racer.wheel2Theta); // undo rotation
                ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back       

                // draw wheel 5
                ctx.translate(...racer.wheel5CR); // translate to center of rotation for wheel 1
                ctx.rotate(racer.wheel5Theta);	// rotate
                ctx.translate(-racer.wheel5CR[0], -racer.wheel5CR[1]); // undo translation
                if (racer.wheel5) drawToCanvas(ctx, racer.wheel5, ...racer.wheel5TL, ...racer.wheel5DIM); // draw wheel 1   
                ctx.translate(...racer.wheel5CR); // translate back
                ctx.rotate(-racer.wheel5Theta); // undo rotation
                ctx.translate(-racer.wheel5CR[0], -racer.wheel5CR[1]); // undo translation back
            }

            customRacers[name] = Drhahn_qc;
            break;
        case "mermaidroadie":
                let mermaidroadie = {};
                mermaidroadie.avatarTL = [(-180), (-90 - 35)];
                mermaidroadie.avatarDIM = [90, 90];
    
                mermaidroadie.vehicle = getImage(IMAGES_BASE64.mermaidroadie.vehicule);
                mermaidroadie.vehicleTL = [(-231), (-99)];
                mermaidroadie.vehicleDIM = [231, 99];
    
                mermaidroadie.showBoost = false;
                mermaidroadie.boost = defaultDrawings.boost;
                mermaidroadie.boostTL = [(-200 - 60.099), (-200 + 26.764)];
                mermaidroadie.boostDIM = [259.6, 200];
    
                mermaidroadie.wheel1 = getImage(IMAGES_BASE64.mermaidroadie.back_paw_back);
                mermaidroadie.wheel1DIM = [32, 37];
                mermaidroadie.wheel1CR = [mermaidroadie.vehicleTL[0] + 45, mermaidroadie.vehicleTL[1] + 79];
                mermaidroadie.wheel1TL = [(mermaidroadie.wheel1CR[0] - 22), (mermaidroadie.wheel1CR[1] - 6)];
                mermaidroadie.wheel1Theta = -Math.PI / 4;
                mermaidroadie.wheel1Radius = 30;
                mermaidroadie.wheel1ThetaDot = 1;
    
                mermaidroadie.wheel2 = getImage(IMAGES_BASE64.mermaidroadie.back_paw_front);
                mermaidroadie.wheel2DIM = [43, 39];
                mermaidroadie.wheel2CR = [mermaidroadie.vehicleTL[0] + 54, mermaidroadie.vehicleTL[1] + 86]; // Ajusté de 76 à 86 pour descendre la roue
                mermaidroadie.wheel2TL = [(mermaidroadie.wheel2CR[0] - 11), (mermaidroadie.wheel2CR[1] - 6)];
                mermaidroadie.wheel2Theta = -Math.PI / 6; // 5h correspond à -30 degrés soit -PI/6 radians
                mermaidroadie.wheel2Radius = 30;
                mermaidroadie.wheel2ThetaDot = -1;
    
                mermaidroadie.wheel3 = getImage(IMAGES_BASE64.mermaidroadie.front_paw_back);
                mermaidroadie.wheel3DIM = [28, 32];
                mermaidroadie.wheel3CR = [mermaidroadie.vehicleTL[0] + 152, mermaidroadie.vehicleTL[1] + 84];
                mermaidroadie.wheel3TL = [(mermaidroadie.wheel3CR[0] - 20), (mermaidroadie.wheel3CR[1] + 5)];
                mermaidroadie.wheel3Theta = Math.PI / 8;
                mermaidroadie.wheel3Radius = 30;
                mermaidroadie.wheel3ThetaDot = 1;
    
                mermaidroadie.wheel4 = getImage(IMAGES_BASE64.mermaidroadie.front_paw_front);
                mermaidroadie.wheel4DIM = [38, 44];
                mermaidroadie.wheel4CR = [mermaidroadie.vehicleTL[0] + 162, mermaidroadie.vehicleTL[1] + 70];
                mermaidroadie.wheel4TL = [(mermaidroadie.wheel4CR[0] - 7), (mermaidroadie.wheel4CR[1] - 4)];
                mermaidroadie.wheel4Theta = 0;
                mermaidroadie.wheel4Radius = 30;
                mermaidroadie.wheel4ThetaDot = 1;
    
                mermaidroadie.customUpdate = (curTime) => {
                    racer.wheel1Theta += racer.vel[0] / racer.wheel1Radius * racer.wheel1ThetaDot * (curTime - racer.time) / 1000;
                    if (racer.wheel1Theta > Math.PI / 2 && racer.wheel1ThetaDot === 1) {
                        racer.wheel1Theta = Math.PI / 2;
                        racer.wheel1ThetaDot *= -1;
                    } else if (racer.wheel1Theta < -Math.PI / 4 && racer.wheel1ThetaDot === -1) {
                        racer.wheel1Theta = -Math.PI / 4;
                        racer.wheel1ThetaDot *= -1;
                    }
    
                    racer.wheel2Theta += racer.vel[0] / racer.wheel2Radius * racer.wheel2ThetaDot * (curTime - racer.time) / 1000;
                    if (racer.wheel2Theta < -Math.PI / 2 && racer.wheel2ThetaDot === -1) {
                        racer.wheel2Theta = -2 * Math.PI / 2 - racer.wheel2Theta;
                        racer.wheel2ThetaDot *= -1;
                    } else if (racer.wheel2Theta > 0 && racer.wheel2ThetaDot === 1) {
                        racer.wheel2Theta = - racer.wheel2Theta;
                        racer.wheel2ThetaDot *= -1;
                    }
    
                    racer.wheel3Theta += racer.vel[0] / racer.wheel3Radius * racer.wheel3ThetaDot * (curTime - racer.time) / 1000;
                    if (racer.wheel3Theta < 0 && racer.wheel3ThetaDot === -1) {
                        racer.wheel3Theta = - racer.wheel3Theta;
                        racer.wheel3ThetaDot *= -1;
                    } else if (racer.wheel3Theta > Math.PI / 2 && racer.wheel3ThetaDot === 1) {
                        racer.wheel3Theta = 2 * Math.PI / 2 - racer.wheel3Theta;
                        racer.wheel3ThetaDot *= -1;
                    }
    
                    racer.wheel4Theta += racer.vel[0] / racer.wheel4Radius * racer.wheel4ThetaDot * (curTime - racer.time) / 1000;
                    if (racer.wheel4Theta < 0 && racer.wheel4ThetaDot === -1) {
                        racer.wheel4Theta = - racer.wheel4Theta;
                        racer.wheel4ThetaDot *= -1;
                    } else if (racer.wheel4Theta > Math.PI / 2 && racer.wheel4ThetaDot === 1) {
                        racer.wheel4Theta = 2 * Math.PI / 2 - racer.wheel4Theta;
                        racer.wheel4ThetaDot *= -1;
                    }
                }
    
                mermaidroadie.customDraw = () => {
                    if (racer.showBoost) {
                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                    }
    
                    // draw avatar
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                    //ctx.strokeStyle = '#2465D3' // optional outline around avatars
                    //ctx.stroke()
                    ctx.clip()
                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                    ctx.closePath();
                    ctx.restore();
    
                    // draw wheel 4
                    ctx.translate(...racer.wheel4CR); // translate to center of rotation for wheel
                    ctx.rotate(racer.wheel4Theta);	// rotate
                    ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation
                    if (racer.wheel4) drawToCanvas(ctx, racer.wheel4, ...racer.wheel4TL, ...racer.wheel4DIM); // draw wheel
                    ctx.translate(...racer.wheel4CR); // translate back
                    ctx.rotate(-racer.wheel4Theta); // undo rotation
                    ctx.translate(-racer.wheel4CR[0], -racer.wheel4CR[1]); // undo translation back  
    
                    // draw wheel 2
                    ctx.translate(...racer.wheel2CR); // translate to center of rotation for wheel
                    ctx.rotate(racer.wheel2Theta);	// rotate
                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation
                    if (racer.wheel2) drawToCanvas(ctx, racer.wheel2, ...racer.wheel2TL, ...racer.wheel2DIM); // draw wheel
                    ctx.translate(...racer.wheel2CR); // translate back
                    ctx.rotate(-racer.wheel2Theta); // undo rotation
                    ctx.translate(-racer.wheel2CR[0], -racer.wheel2CR[1]); // undo translation back  
    
                    // draw vehicle
                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                    // draw wheel 1
                    ctx.translate(...racer.wheel1CR); // translate to center of rotation for wheel 1
                    ctx.rotate(racer.wheel1Theta);	// rotate
                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation
                    if (racer.wheel1) drawToCanvas(ctx, racer.wheel1, ...racer.wheel1TL, ...racer.wheel1DIM); // draw wheel 1
                    ctx.translate(...racer.wheel1CR); // translate back
                    ctx.rotate(-racer.wheel1Theta); // undo rotation
                    ctx.translate(-racer.wheel1CR[0], -racer.wheel1CR[1]); // undo translation back   
    
                    // draw wheel 3
                    ctx.translate(...racer.wheel3CR); // translate to center of rotation for wheel 1
                    ctx.rotate(racer.wheel3Theta);	// rotate
                    ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation
                    if (racer.wheel3) drawToCanvas(ctx, racer.wheel3, ...racer.wheel3TL, ...racer.wheel3DIM); // draw wheel 1
                    ctx.translate(...racer.wheel3CR); // translate back
                    ctx.rotate(-racer.wheel3Theta); // undo rotation
                    ctx.translate(-racer.wheel3CR[0], -racer.wheel3CR[1]); // undo translation back    
                }
    
                customRacers[name] = mermaidroadie;
                break;
        case "JonathanOng":
            let JonathanOng = {};

            JonathanOng.vehicle = getImage(IMAGES_BASE64.JonathanOng.vehicule);
            JonathanOng.vehicleTL = [(-200), (-200)];
            JonathanOng.vehicleDIM = [200, 200]; 
            
            JonathanOng.avatarTL = [JonathanOng.vehicleTL[0] + 135 - 40, JonathanOng.vehicleTL[1] + 35 - 40];
            JonathanOng.avatarDIM = [80, 80];

            JonathanOng.showBoost = false;
            JonathanOng.boost = defaultDrawings.boost;
            JonathanOng.boostTL = [(-200 - 60.099), (-200 + 26.764)];
            JonathanOng.boostDIM = [259.6, 200];    

            JonathanOng.customDraw = () => {
                if (racer.showBoost) {
                    drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                }

                // draw vehicle
                drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                // draw avatar
                ctx.save()
                ctx.beginPath()
                ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                
                ctx.clip()
                if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                ctx.closePath();
                ctx.restore();
            }

            customRacers[name] = JonathanOng;
            break;
            case "LadyGrimoireQc":
                let Lady = {};
    
                Lady.vehicle = getImage(IMAGES_BASE64.lady.vehicule);
                Lady.vehicleTL = [(-200), (-200)];
                Lady.vehicleDIM = [200, 200]; 
                
                Lady.avatarTL = [Lady.vehicleTL[0] + 135 - 40, Lady.vehicleTL[1] + 50];
                Lady.avatarDIM = [75, 75];
    
                Lady.showBoost = false;
                Lady.boost = defaultDrawings.boost;
                Lady.boostTL = [(-200 - 60.099), (-200 + 26.764)];
                Lady.boostDIM = [259.6, 200];    
    
                Lady.customDraw = () => {
                    if (racer.showBoost) {
                        drawToCanvas(ctx, racer.boost, ...racer.boostTL, ...racer.boostDIM);
                    }
    
                    // draw avatar
                    ctx.save()
                    ctx.beginPath()
                    ctx.arc(...racer.avatarTL.map((val, ii) => val + racer.avatarDIM[ii] / 2), racer.avatarDIM[0] / 2, 0, Math.PI * 2, false)
                    
                    ctx.clip()
                    if (racer.avatar.src) drawToCanvas(ctx, racer.avatar, ...racer.avatarTL, ...racer.avatarDIM);
                    ctx.closePath();
                    ctx.restore();
                    drawToCanvas(ctx, racer.vehicle, ...racer.vehicleTL, ...racer.vehicleDIM);
                }
    
                customRacers[name] = Lady;
                break;
        case "MarcValley":
            let marcvalley = {};
            let scaleMarcvalley = 0.6;

            marcvalley.vehicle = getImage(IMAGES_BASE64.marcvalley.vehicle);
            marcvalley.vehicleTL = [(-170 - 20) * scaleMarcvalley, (-310) * scaleMarcvalley];
            marcvalley.vehicleDIM = [191 * scaleMarcvalley, 310 * scaleMarcvalley   ];

            marcvalley.avatarTL = [(-marcvalley.vehicleDIM[0] + 15 -20) , (-marcvalley.vehicleDIM[1] + 15 -20)];
            marcvalley.avatarDIM = [80, 80];

            marcvalley.showBoost = false;
            marcvalley.boost = defaultDrawings.boost;
            marcvalley.boostTL = [marcvalley.vehicleTL[0] - 66 - 20, marcvalley.vehicleTL[1] + 60];
            marcvalley.boostDIM = [259.6, 200];

            marcvalley.wheel1 = getImage(IMAGES_BASE64.marcvalley.wheel1);
            marcvalley.wheel1DIM = [30 * scaleMarcvalley, 33 * scaleMarcvalley];
            marcvalley.wheel1CR = [marcvalley.vehicleTL[0] + 6 * scaleMarcvalley, marcvalley.vehicleTL[1] + 305 * scaleMarcvalley];
            marcvalley.wheel1TL = [marcvalley.wheel1CR[0] - 15 * scaleMarcvalley, marcvalley.wheel1CR[1] - 16 * scaleMarcvalley];
            marcvalley.wheel1Theta = Math.PI / 6;
            marcvalley.wheel1Radius = 16 * scaleMarcvalley;

            marcvalley.wheel2 = getImage(IMAGES_BASE64.marcvalley.wheel2);
            marcvalley.wheel2DIM = [117 * scaleMarcvalley, 119 * scaleMarcvalley];
            marcvalley.wheel2CR = [marcvalley.vehicleTL[0] + 185 * scaleMarcvalley, marcvalley.vehicleTL[1] + 244 * scaleMarcvalley];
            marcvalley.wheel2TL = [marcvalley.wheel2CR[0] - 54 * scaleMarcvalley, marcvalley.wheel2CR[1] - 60 * scaleMarcvalley];
            marcvalley.wheel2Theta = Math.PI / 6;
            marcvalley.wheel2Radius = 59 * scaleMarcvalley;

            customRacers[name] = marcvalley;
            break;
        default:
            racer.avatarTL = [-150, -145 + 14.597];
            racer.avatarDIM = [80, 80];

            //racer.vehicle = defaultDrawings.vehicle;
            racer.vehicle = new Image();
            let colorrrr = await getRacerColoredCar(idRacer);
            racer.vehicle.src = colorrrr;
            racer.vehicle.style = { filter: "hue-rotate(60deg)" };
            racer.vehicleTL = [-200, -175 + 14.597];
            racer.vehicleDIM = [200, 200];
            racer.vehicleCR = [-150, -60]; // center of rotation

            racer.showBoost = false;
            racer.boost = defaultDrawings.boost;
            racer.boostTL = [-259.6, -175 + 14.597];
            racer.boostDIM = [259.6, 200];

            racer.wheel1 = defaultDrawings.wheel1;
            racer.wheel1TL = [-200, -135 + 14.597];
            racer.wheel1DIM = [481 / 2.5, 301 / 2.5];
            racer.wheel1CR = [-150, -37 + 14.597];
            racer.wheel1Theta = Math.PI / 6;
            racer.wheel1Radius = 50 / 2.5;

            racer.wheel2 = defaultDrawings.wheel2;
            racer.wheel2TL = [-196, -135 + 14.597];
            racer.wheel2DIM = [481 / 2.5, 301 / 2.5];
            racer.wheel2CR = [-58, -37 + 14.597];
            racer.wheel2Theta = Math.PI / 6;
            racer.wheel2Radius = 50 / 2.5;

            customRacers[name] = racer;
            break;
    }
};

let drawToCanvas = function (ctx, img, X, Y, width, height) {
    if (img.complete && img.naturalWidth) {
        try {
            ctx.drawImage(img, X, Y, width, height);
        } catch (error) {
            console.log(error)
            //console.log(img.src)
        }
    }
};

let drawToCanvasGIF = function (ctx, X, Y, width, height) {
    let rainbowsImages = [];
    for (let i = 1; i <= 6; i++) {
        rainbowsImages[i-1] = getImage(IMAGES_BASE64.default_rainbow_vehicule[`v${i}`]);
    }
    
    //if (img.complete && img.naturalWidth) {
        try {
            //ctx.drawImage(img, X, Y, width, height);
            drawAnimatedImage(ctx, rainbowsImages, X, Y, width, height) 
        } catch (error) {
            console.log(error)
            //console.log(img.src)
        }
    //}
};

function drawAnimatedImage(ctx, arr, x, y, width, height) {
    let changespeed = 1/20;
    ctx.save();
    if (!!arr[Math.round(Date.now()/changespeed) % arr.length]) {
       // console.log("changespeed:", Math.round(Date.now()/changespeed) % arr.length, x, y, width, height);
        ctx.drawImage(
            arr[Math.round(Date.now()/changespeed) % arr.length], 
            x,  //-(arr[Math.round(Date.now()/changespeed) % arr.length].width * factor / 2), 
            y,  //-(arr[Math.round(Date.now()/changespeed) % arr.length].height * factor / 2), 
            width,  //arr[Math.round(Date.now()/changespeed) % arr.length].width * factor, 
            height  //arr[Math.round(Date.now()/changespeed) % arr.length].height * factor
        );
    }
    ctx.restore();
}

function setImages() {
    const token = '';
    const owner = 'Sheik16';
    const repo = 'AndyRace';
    const path = 'images.js';

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    //console.log(url)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // Synchronous XMLHttpRequest
    xhr.setRequestHeader('Authorization', `token ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github.v3.raw');
    xhr.send();

    if (xhr.status === 200) {
        //console.log(xhr.responseText)
        eval(xhr.responseText); // Execute the script content
        IMAGES_BASE64 = IMAGES;
        //console.log(IMAGES_BASE64)

        casques = Object.values(IMAGES_BASE64.AndyThe).map(valeur => valeur);   
        console.log(casques)
        casquesNames = Object.keys(IMAGES_BASE64.AndyThe);   

        console.log('Script loaded and executed successfully');
    } else {
        console.error('Error loading or executing script:', xhr.status);
    }
}

function setupRain() {
    if (canvas.getContext) {                
        setInterval(drawRain, 36);
        
        const images = [ 
            IMAGES_BASE64.Fruitcaketrack.cake1,
            IMAGES_BASE64.Fruitcaketrack.Thour, 
            IMAGES_BASE64.Fruitcaketrack.Cherry,
            IMAGES_BASE64.Fruitcaketrack.KendraLyssa
        ];

        for (var i = 0; i < noOfDrops; i++) {
            var fallingDr = new Object();

            fallingDr["image"] = getImage(images[Math.floor(Math.random() * images.length)]);
            
            fallingDr["x"] = Math.random() * 2500; // Augmenté à 2500 pour plus de largeur
            fallingDr["y"] = Math.random() * 5;
            fallingDr["speed"] = 3 + Math.random() * 5;
            fallingDr["speedX"] = fallingDr["speed"] * 0.5; // Vitesse horizontale
            fallingDr["rotation"] = 0; // Angle de rotation initial
            fallingDr["rotationSpeed"] = (Math.random() * 10) - 5; // Vitesse de rotation aléatoire
            fallingDrops.push(fallingDr);
        }
    }
}

function drawRain() { 
    for (var i = 0; i < fallingDrops.length; i++) {
        drawDrop(fallingDrops[i]);
        updateDropPosition(fallingDrops[i]);
        if (fallingDrops[i].deleteOffScreen && fallingDrops[i].y > 1060) {
            fallingDrops.splice(i, 1);
            i--;
        }
    }
}

function drawDrop(drop) {
    ctx.save(); // Save context    
    // Move rotation point to image center
    ctx.translate(drop.x + 25, drop.y + 25);    
    // Apply rotation
    ctx.rotate(drop.rotation);    
    // Draw image with (0,0) at center
    //ctx.drawImage(drop.image, drop.x, drop.y, 50, 50);  
    ctx.drawImage(drop.image, -25, -25, 50, 50); // Fixed coordinates to center image
    ctx.restore(); // Restore context
}

function updateDropPosition(drop, toDelete = false) {
    drop.y += drop.speed; // Vertical movement
    drop.x -= drop.speedX; // Movement to the left
    drop.rotation += drop.rotationSpeed * Math.PI / 180; // Update rotation
    
    if (drop.y > 1080 || drop.x < -50) { // Reset when drop goes off screen
        drop.y = -25;
        drop.x = Math.random() * 2500 + 50; // Increased to 2500 for more width
    }
}

function drawEmoticons(message) { // draw an emote falling from the sky
    const fallingDr = {
        image: getImage(emotes[message]),
        x: Math.random() * 2500, // Increased to 2500 for more width
        y: Math.random() * 5,
        speed: 3 + Math.random() * 5,
        speedX: (3 + Math.random() * 5) * 0.5, // Horizontal speed
        rotation: 0, // Initial rotation angle
        rotationSpeed: Math.random() * 10 - 5, // Random rotation speed
        deleteOffScreen: true
    };
    
    fallingDrops.push(fallingDr);
}

function saveRaceResults(racers) {
    // Récupérer la date et l'heure actuelles
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    var raceHistory = [];
    // Récupérer l'historique existant
    SE_API.store.get('raceHistory').then(raceHistory => {
        // Ajouter les résultats de chaque racer
        const result = {
            date: date,
            time: time,
            racers: racers
        };
        raceHistory.push(result);
    // Limiter l'historique aux 1000 dernières courses pour éviter de surcharger le stockage
        // if (raceHistory.length > 1000) {
        //     raceHistory.splice(0, raceHistory.length - 1000);
        // }
        // Sauvegarder l'historique mis à jour
        // console.log("raceHistory  ", raceHistory);
        SE_API.store.set('raceHistory', raceHistory).then(() => {
            sendMessageInChat("Race results saved!");
        });
    });  
}
function bumpAnimation(racer) {
    if (!racer.isInBump) { // Évite les animations multiples simultanées
        racer.isInBump = true;
        
        const originalCarY = racer.XY[1];
        const bumpDuration = 300; // Durée totale de l'animation en ms
        const bumpHeight = 15; // Amplitude du mouvement
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / bumpDuration, 1);
            
            // Fonction sinusoïdale pour un mouvement fluide
            const carOffset = Math.sin(progress * Math.PI) * bumpHeight;
            const avatarOffset = -Math.sin(progress * Math.PI) * bumpHeight * 2;
            
            // Applique le décalage à la voiture
            racer.XY[1] = originalCarY + carOffset;
            
            // Applique le décalage inverse à l'avatar si présent
            if (racer.avatarTL) {
                racer.avatarTL[1] = racer.originalAvatarY + avatarOffset;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
                if (Math.random() < 0.04) {
                    // 50% de chance que la pièce soit éjectée vers le haut
                    const isEjected = Math.random() < 0.5;
                    fallingParts.push(createFallingPart(
                        racer.XY[0],
                        racer.XY[1],
                        isEjected
                    ));
                }
            } else {
                // Reset positions
                racer.XY[1] = originalCarY;
                if (racer.avatarTL) {
                    racer.avatarTL[1] = racer.originalAvatarY;
                }
                racer.isInBump = false;
            }
        }
        
        // Sauvegarde la position Y originale de l'avatar si pas encore fait
        if (racer.avatarTL && racer.originalAvatarY === undefined) {
            racer.originalAvatarY = racer.avatarTL[1];
        }
        
        animate();
    }
}

// Fonction pour démarrer le check aléatoire des trous
function startBumpCheck() {
    setInterval(() => {
        for (let name of sortedRacers) {
            const racer = racers[name];
            // 10% de chance de déclencher l'animation
            if (Math.random() < 0.1 && !racer.isInBump && activateHoles) {
                bumpAnimation(racer);
            }
        }

    }, 3000);
}

function createFallingPart(x, y, isEjected = false) {
    // Choisir une pièce aléatoire parmi les engineParts disponibles
    const partKeys = Object.keys(IMAGES_BASE64.engineParts);
    const randomPart = partKeys[Math.floor(Math.random() * partKeys.length)];
    
    return {
        img: getImage(IMAGES_BASE64.engineParts[randomPart]),
        x: x - (50 + Math.random() * 100),
        y: y,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: isEjected ? -15 - Math.random() * 5 : 0,
        scale: 0.5 + Math.random() * 0.3,
        bounced: false,
        opacity: 1
    };
}

function updateFallingParts() {
    for (let i = fallingParts.length - 1; i >= 0; i--) {
        const part = fallingParts[i];
        
        // Mettre à jour la position
        part.x += part.velocityX;
        part.y += part.velocityY;
        part.rotation += part.rotationSpeed;
        
        // Appliquer la gravité
        part.velocityY += GRAVITY;
        
        // Gérer le rebond au sol
        if (part.y >= GROUND_Y && !part.bounced) {
            part.velocityY = -part.velocityY * BOUNCE_FACTOR;
            part.velocityX *= 0.8;
            part.bounced = true;
        }
        
        // Faire disparaître progressivement après le rebond
        if (part.bounced) {
            part.opacity -= 0.02;
            if (part.opacity <= 0) {
                fallingParts.splice(i, 1);
            }
        }
    }
}

function drawFallingParts() {
    updateFallingParts();
    
    ctx.translate(...cameraLoc);
    
    for (const part of fallingParts) {
        ctx.save();
        ctx.translate(part.x, part.y);
        ctx.rotate(part.rotation);
        ctx.globalAlpha = part.opacity;
        
        // Dessiner la pièce
        if (part.img.complete && part.img.naturalWidth) {
            const width = part.img.naturalWidth * part.scale;
            const height = part.img.naturalHeight * part.scale;
            ctx.drawImage(part.img, 
                -width/2, -height/2, 
                width, height
            );
        }
        
        ctx.restore();
    }
    
    ctx.resetTransform();
}