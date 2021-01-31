const extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
let games = {};
let gamesDb = {};
let rpcDb = {};

//Establish settings
let homeOn = true;
let storeOn = true;
let captureOn = true;
let gameOn = true;
let ccOn = false;

(async function() {
    let gamesDbResponse = await fetch("https://raw.githubusercontent.com/nilicule/StadiaGameDB/master/data/gamedb.json");
    gamesDb = await gamesDbResponse.json();
    gamesDb = gamesDb["data"];

    let rpcDbResponse = await fetch("https://raw.githubusercontent.com/soap-less/StadiaJSON/master/stadiaRpc.json");
    rpcDb = await rpcDbResponse.json();

    let response = await fetch("https://raw.githubusercontent.com/soap-less/StadiaJSON/master/games.json");
    games = await response.json();

    // Get settings
    chrome.storage.local.get({rpcHomeOn: true, rpcStoreOn: true, rpcCaptureOn: true, rpcGameOn: true, rpcCCOn: false}, function(items) {
        homeOn = items.rpcHomeOn;
        storeOn = items.rpcStoreOn;
        gameOn = items.rpcGameOn;
        ccOn = items.rpcCCOn;
        captureOn = items.rpcCaptureOn;

        //Register presence after getting settings
        chrome.runtime.sendMessage(extensionId, { mode: 'active' }, function (response) {
            console.log('Presence registered', response)
        });
    });
})();

//Wait for presence requests
chrome.runtime.onMessage.addListener(function (info, sender, sendResponse) {
    if (info.action === "passToken") {
        partyToken = info.partyToken;
        console.log("Recieved Token" + partyToken);
    } else if (info.action === "joinRequest") {
        if (confirm(info.user.username + '#' + info.user.discriminator + ' wants to join you')) {
            sendResponse('YES');
        } else {
            sendResponse('NO');
        }
    } else {
        sendResponse(generatePresence());
    }
});

//Establish all options
let largeImgTxt = "Stadia";
let smallImgTxt = "Chrome";
let largeImg = "stadialogosquare";
let smallImg = "chrome";
let detailDisplay = "Using Stadia";
let clientId = "648430151390199818"; // Default Application ID, sets game as "Stadia"

let stateDisplay = "";
let time = Date.now();

let prevImgTxt = largeImgTxt; // cover ALL game status changes (including Chromecast/Pixel)
let prevUrl = location.href; // cover status changes to URLs (i.e., store)
let previousDetail = detailDisplay; //cover changes to viewing/browsing captures

function generatePresence() {
        try {
            const tabURL = location.href;
            const captureViewerDisplayed = document.querySelector(".tNaJ7");

            clientId = "648430151390199818";

            if (tabURL.includes("home")) {
                console.log(tabURL)
                detailDisplay = "On home page";
                largeImgTxt = "Stadia Home";
                largeImg = "stadialogosquare";
                smallImg = "chrome";

                if (captureOn && captureViewerDisplayed)
                {
                  detailDisplay = "Viewing a capture"
                  smallImgTxt = "Chrome"
                }

                if (ccOn) {
                    //make sure we're not viewing a capture on home page
                    if ((!captureViewerDisplayed && captureOn) || !captureOn)
                    {
                      // ccOn can always be enabled, so just show as online for now
                      smallImg = "online";
                      smallImgTxt = "";
                      detailDisplay = "Home";
                    }

                    // Gets the users current status
                    let currentlyPlaying = document.getElementsByClassName("HDKZKb  LiQ6Hb");

                    // Disconnects StadiaRPC if the page isn't loaded
                    if (currentlyPlaying === undefined) {
                        return {'action': 'disconnect'}
                    }

                    for (let i = 0; i < currentlyPlaying.length; i++) {
                        if (!currentlyPlaying[i].getAttribute("class").includes("FW3qke")) {
                            currentlyPlaying = currentlyPlaying[i].textContent;
                            break;
                        }
                    }

                  if (currentlyPlaying.slice(0, 7) === "Playing" && !prevUrl.includes("player") && !captureViewerDisplayed) {
                        detailDisplay = currentlyPlaying;
                        largeImgTxt = currentlyPlaying.slice(8)
                        smallImgTxt = ""; //Casting

                        //Slice to just game name then make lowercase and remove special characters
                        currentlyPlayingLower = currentlyPlaying.slice(8).toLowerCase().replace(/[^a-z0-9]/g, "");

                        Object.keys(games).forEach(gameName => {
                            let game = games[gameName];
                            game["aliases"].forEach(alias => {
                                if (alias === currentlyPlayingLower) {
                                    largeImgTxt = gameName;

                                    if (game["hasIcon"]) {
                                        largeImg = game["aliases"][0];
                                        smallImg = "stadialogosquare";
                                        smallImgTxt = "Stadia";
                                    }
                                }
                            });
                        });

                        // Assume last played game is what is currently being played on Chromecast or Android
                        let currentlyPlayingId = document.querySelector(".n4qZSd.fcUT2e").getAttribute("data-app-id");
                        currentlyPlaying = currentlyPlaying.slice(8)

                        // For every game in the DB
                        gamesDb.forEach(function(dbGame) {
                            let dbGameId = dbGame[0].split("'")[1] // Grabs just the store link
                            dbGameId = dbGameId.split("/")[5] // Grabs the GameID from the DB's store link

                            let dbGameName = dbGame[1];
                            if (currentlyPlayingId === dbGameId && currentlyPlaying === dbGameName) {
                                detailDisplay = "Playing " + dbGameName;
                                largeImgTxt = dbGameName;
                                smallImgTxt = ""; //Casting

                                // Checking for icon and setting it if it's there
                                if (rpcDb["gamesWithIcon"].includes(dbGameName)) {
                                    largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");
                                    smallImg = "stadialogosquare";
                                    smallImgTxt = "Stadia";

                                // Checking for Custom Application ID
                                } else if (Object.keys(rpcDb["gamesWithCustomApp"]).includes(dbGameName)) {
                                    smallImg = "stadialogosquare";
                                    largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");
                                    clientId = rpcDb["gamesWithCustomApp"][dbGameName];
                                    smallImgTxt = "Stadia";
                                    detailDisplay = "Playing on Stadia";
                                }
                            }
                        });

                    } else if (!homeOn) {
                        return {action: "disconnect"};
                    }
                }

                if (!homeOn && !ccOn) {
                    return {action: "disconnect"};
                }

            } else if (tabURL.includes("store")) {
                detailDisplay = "Browsing the store";
                largeImgTxt = "Stadia Store";
                largeImg = "stadialogosquare";
                smallImg = "chrome";
                smallImgTxt = "Chrome";

                if (!storeOn) {
                    return {action: "disconnect"};
                }

                const splitUrl = tabURL.split("/");
                const currentlyViewingSku = splitUrl[splitUrl.length - 1]
                const currentlyViewingId = splitUrl[splitUrl.length - 3]

                // bundle pages exist, so let's try to catch some... page title is the easiest fallback
                let gameTitle = document.title.replace(" - Store - Stadia","").replace("®","").replace("™","").replace("©","");
                //used to tell when at end of the foreach below
                let gameCount = 0;

                gamesDb.forEach(function(dbGame) {
                    let dbStoreLink = dbGame[0].split("'")[1]
                    let dbGameId = dbStoreLink.split("/")[5] // Grabs the GameID from the DB's store link
                    let dbGameSku = dbStoreLink.split("/")[7] // Grabs the GameSKU from the DB's store link

                    if (currentlyViewingId === dbGameId && currentlyViewingSku === dbGameSku) {
                        detailDisplay = "Viewing " + dbGame[1];
                    } else if (dbGame[1] === gameTitle) {
                        //only if exact match... instead of dbGame[1].contains("DOOM"), plus "Stadia" or "Gold" editions, etc.
                        detailDisplay = "Viewing " + dbGame[1];
                    } else if (gameCount === dbGame.length - 1 && tabURL.includes("store/details")) {
                        //last item in foreach, still no match, use page title instead of gamesDB
                        detailDisplay = "Viewing " + gameTitle;
                    }
                    gameCount++;
                });

            } else if (tabURL.includes("player")) {

                if (!gameOn) {
                    return {action: "disconnect"};
                }

                // Gets the users current status
                let currentlyPlaying = document.getElementsByClassName("HDKZKb  LiQ6Hb");
                let controllerMenu = document.getElementsByClassName("hpog5e");

                // Disconnects StadiaRPC if the page isn't loaded
                if (currentlyPlaying === undefined) {
                    return {'action': 'disconnect'}
                }

                for (let i = 0; i < currentlyPlaying.length; i++) {
                    if (!currentlyPlaying[i].getAttribute("class").includes("FW3qke")) {
                        currentlyPlaying = currentlyPlaying[i].textContent;
                        break;
                    }
                }

                // Ensure controller connect dialog is not open
                if (controllerMenu.length === 0)
                {
                  if (currentlyPlaying.slice(0, 7) === "Playing") {
                      detailDisplay = currentlyPlaying;
                      largeImgTxt = currentlyPlaying.slice(8);
                      smallImg = "chrome";
                  }
                }

                // Extracts the id from the game currently being played
                let currentlyPlayingId = tabURL.split("/");
                currentlyPlayingId = currentlyPlayingId[currentlyPlayingId.length - 1]
                smallImgTxt = "Chrome";

                //For every game in the DB'
                gamesDb.forEach(function(dbGame) {
                    let dbGameId = dbGame[0].split("'")[1] // Grabs just the store link
                    dbGameId = dbGameId.split("/")[5] // Grabs the GameID from the DB's store link

                    if (currentlyPlayingId === dbGameId) {
                        let dbGameName = dbGame[1];
                        detailDisplay = "Playing " + dbGameName;
                        largeImgTxt = dbGameName;
                        smallImg = "chrome";

                        // Checking for icon and setting it if it's there
                        if (rpcDb["gamesWithIcon"].includes(dbGameName)) {
                            largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");

                        // Checking for Custom Application ID
                        } else if (Object.keys(rpcDb["gamesWithCustomApp"]).includes(dbGameName)) {
                            largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");
                            clientId = rpcDb["gamesWithCustomApp"][dbGameName];
                            detailDisplay = "Playing on Stadia";
                            smallImgTxt = "Chrome";
                        }
                    }
                });
            } else if (tabURL.includes("/captures")) {

                detailDisplay = "Browsing captures";
                largeImgTxt = "Stadia Captures";
                largeImg = "stadialogosquare";
                smallImg = "chrome";
                smallImgTxt = "Chrome";

                if (captureViewerDisplayed) {
                  detailDisplay = "Viewing a capture"
                }

                if (!captureOn) {
                    return {action: "disconnect"};
                }

            }

            //Check to see if presence has changed, resets time if so
            if (prevUrl !== tabURL || prevImgTxt !== largeImgTxt || detailDisplay !== previousDetail) {
                time = Date.now();
            }
            previousDetail = detailDisplay;
            prevImgTxt = largeImgTxt;
            prevUrl = tabURL;

            //Multi-line drifting
            stateDisplay = ""
            if (detailDisplay.length > 23) {
                for (i = detailDisplay.length - 1; i >= 0; i--) {
                    if ((detailDisplay[i] === " " || detailDisplay[i] === ":") && detailDisplay.slice(0, i + 1).length < 23) {
                        stateDisplay = detailDisplay.slice(i + 1);
                        detailDisplay = detailDisplay.slice(0, i + 1);
                        break;
                    }
                }
            }

            console.log({
                clientId: '648430151390199818',
                presence: {
                    details: detailDisplay,
                    state: stateDisplay,
                    startTimestamp: time,
                    instance: true,
                    largeImageKey: largeImg,
                    smallImageKey: smallImg,
                    largeImageText: largeImgTxt,
                    smallImageText: smallImgTxt
                }
            });

            return {
                clientId: clientId,
                presence: {
                    details: detailDisplay,
                    state: stateDisplay,
                    startTimestamp: time,
                    instance: true,
                    largeImageKey: largeImg,
                    smallImageKey: smallImg,
                    largeImageText: largeImgTxt,
                    smallImageText: smallImgTxt
                }
            };
        } catch(e) {
            console.error(e);
    }
}
