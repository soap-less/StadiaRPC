const extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
let games = {};

//Establish settings
let homeOn = true;
let storeOn = true;
let gameOn = true;
let ccOn = false;

(async function() {
    // Fetch a JSON with all Stadia games and their info
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
let smallImgTxt = "Online";
let largeImg = "stadialogosquare";
let smallImg = "online";
let detailDisplay = "Using Stadia";
let prevDetailDisplay = "Using Stadia";

let stateDisplay = "";
let time = Date.now();

function generatePresence() {
        try {
            let tabURL = location.href;
            
            if (tabURL.includes("home")) {
                console.log(tabURL)
                detailDisplay = "Chilling in Home";
                largeImgTxt = "On the Home Page";
                largeImg = "stadialogosquare";
                smallImg = "online";
                
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
                largeImg = "store";
                smallImg = "online";

                if (!storeOn) {
                    return {action: "disconnect"};
                }

                // Displays what game is being viewed on the store
                // Loop through every game from the JSON and compare their SKU/GameID to the URL.
                Object.keys(games).forEach(gameName => {
                    let game = games[gameName];
                    let splitUrl = tabURL.split("/");
                    if (splitUrl[splitUrl.length - 1] === game["sku"] && splitUrl[splitUrl.length - 3] === game["gameId"]) {
                        largeImgTxt = "Browsing the Store";
                        detailDisplay = "Checking out " + gameName
                    }
                });
            
            } else if (tabURL.includes("player")) {
                Object.keys(games).forEach(gameName => {
                    let game = games[gameName];
                    let splitUrl = tabURL.split("/");
                    if (game["gameId"] === splitUrl[splitUrl.length - 1]) {
                        detailDisplay = "Playing " + gameName;
                        largeImgTxt = gameName;
                        smallImgTxt = "On Stadia through Chrome"
                        if (game["hasIcon"]) {
                            largeImg = game["aliases"][0];
                            smallImg = "chrome";
                        } else {
                            largeImg = "stadialogosquare";
                            smallImg = "chrome"
                        }
                    }
                });

                if (!gameOn) {
                    return {action: "disconnect"};
                }
            }

            //Check to see if presence has changed, resets time if so
            if (prevDetailDisplay !== detailDisplay) {
                time = Date.now();
            }
            prevDetailDisplay = detailDisplay;

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
            };
        } catch(e) {
            console.error(e);
    }
}
