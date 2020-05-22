const extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
let games = {};
let gamesDb = {};
let rpcDb = {};

//Establish settings
let homeOn = true;
let storeOn = true;
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
    chrome.storage.local.get({rpcHomeOn: true, rpcStoreOn: true, rpcGameOn: true, rpcCCOn: false}, function(items) {
        homeOn = items.rpcHomeOn;
        storeOn = items.rpcStoreOn;
        gameOn = items.rpcGameOn;
        ccOn = items.rpcCCOn;

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
let largeImgTxt = "";
let smallImgTxt = "Stadia (Chrome)";
let largeImg = "stadialogosquare";
let smallImg = "chrome";
let detailDisplay = "Using Stadia";
let clientId = "648430151390199818"; // Default Application ID, sets game as "Stadia"

let stateDisplay = "";
let time = Date.now();

let prevUrl = location.href;

function generatePresence() {
        try {
            const tabURL = location.href;
            clientId = "648430151390199818";

            if (tabURL.includes("home")) {
                console.log(tabURL)
                detailDisplay = "Home Page";
                largeImgTxt = "On Stadia Home";
                largeImg = "stadialogosquare";
                smallImg = "chrome";
                
                if (ccOn) {

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

                    if (currentlyPlaying.slice(0, 7) === "Playing") {
                        detailDisplay = currentlyPlaying;
                        smallImgTxt = "on Stadia"

                        //Slice to just game name then make lowercase and remove special characters
                        currentlyPlaying = currentlyPlaying.slice(8).toLowerCase().replace(/[^a-z0-9]/g, "");
                        
                        Object.keys(games).forEach(gameName => {
                            let game = games[gameName];
                            game["aliases"].forEach(alias => {
                                if (alias === currentlyPlaying) {
                                    largeImgTxt = gameName;
                                    
                                    if (game["hasIcon"]) {
                                        largeImg = game["aliases"][0];
                                        smallImg = "stadialogosquare";

                                    } else {
                                        largeImg = "stadialogosquare";
                                        smallImg = "online"
                                    }
                                }
                            });
                        });
                    } else if (!homeOn) {
                        return {action: "disconnect"};
                    }
                }

                if (!homeOn && !ccOn) {
                    return {action: "disconnect"};
                }
                
            } else if (tabURL.includes("store")) {
                detailDisplay = "Browsing the Store";
                largeImgTxt = "Looking for Something New";
                largeImg = "stadialogosquare";
                smallImg = "chrome";

                if (!storeOn) {
                    return {action: "disconnect"};
                }

                const splitUrl = tabURL.split("/");
                const currentlyViewingSku = splitUrl[splitUrl.length - 1]
                const currentlyViewingId = splitUrl[splitUrl.length - 3]

                gamesDb.forEach(function(dbGame) {
                    let dbStoreLink = dbGame[0].split("'")[1]
                    let dbGameId = dbStoreLink.split("/")[5] // Grabs the GameID from the DB's store link
                    let dbGameSku = dbStoreLink.split("/")[7] // Grabs the GameID from the DB's store link
                    
                    if (currentlyViewingId === dbGameId && currentlyViewingSku === dbGameSku) {

                        largeImgTxt = "Browsing the Store";
                        detailDisplay = "Checking out " + dbGame[1];

                    }
                });
            
            } else if (tabURL.includes("player")) {

                if (!gameOn) {
                    return {action: "disconnect"};
                }

                // Extracts the id from the game currently being played
                let currentlyPlayingId = tabURL.split("/");
                currentlyPlayingId = currentlyPlayingId[currentlyPlayingId.length - 1]

                //For every game in the DB
                gamesDb.forEach(function(dbGame) {
                    let dbGameId = dbGame[0].split("'")[1] // Grabs just the store link
                    dbGameId = dbGameId.split("/")[5] // Grabs the GameID from the DB's store link

                    if (currentlyPlayingId === dbGameId) {
                        let dbGameName = dbGame[1];

                        detailDisplay = "Playing " + dbGameName;
                        largeImgTxt = dbGameName;
                        smallImgTxt = "On Stadia (Chrome)";
                        smallImg = "chrome";

                        // Checking for icon and setting it if it's there
                        if (rpcDb["gamesWithIcon"].includes(dbGameName)) {
                            largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");
                        
                        // Checking for Custom Application ID
                        } else if (Object.keys(rpcDb["gamesWithCustomApp"]).includes(dbGameName)) {

                            largeImg = dbGameName.toLowerCase().replace(/[^a-z0-9]/g, "");
                            clientId = rpcDb["gamesWithCustomApp"][dbGameName];
                            detailDisplay = "Playing on Stadia";

                        }
                    }
                });
            }

            //Check to see if presence has changed, resets time if so
            if (prevUrl !== tabURL) {
                time = Date.now();
            }

            prevUrl = tabURL;

            //Multi-line drifting
            stateDisplay = ""
            if (detailDisplay.length > 25) {
                for (i = detailDisplay.length - 1; i >= 0; i--) {
                    if ((detailDisplay[i] === " " || detailDisplay[i] === ":") && detailDisplay.slice(0, i + 1).length < 25) {
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
