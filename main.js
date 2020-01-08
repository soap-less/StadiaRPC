// Gets a list of Stadia games and their information
let games = {};
(async function() {
    let response = await fetch("https://raw.githubusercontent.com/soap-less/StadiaJSON/master/games.json");
    games = await response.json();
})();

// Register Presence
chrome.runtime.sendMessage("agnaejlkbiiggajjmnpmeheigkflbnoo", {mode: 'active'}, function (response) {
    console.log('Presence registred', response)
});

let partyToken = ""
// Wait for presence requests
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
        console.log('Presence requested', info);
        sendResponse(getPresence());
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

let tabURL = "";

//Establish settings
let homeOn = true;
let storeOn = true;
let gameOn = true;
let ccOn = false;

//Return presence   
function getPresence() {
    try {
        tabURL = location.href;

        chrome.storage.local.get({rpcHomeOn: true, rpcStoreOn: true, rpcGameOn: true, rpcCCOn: false}, function(items) {
            homeOn = items.rpcHomeOn;
            storeOn = items.rpcStoreOn;
            gameOn = items.rpcGameOn;
            ccOn = items.rpcCCOn;
        });

        //Updates the options
        if (tabURL === "https://stadia.google.com/home") {
            detailDisplay = "Chilling in Home";
            largeImgTxt = "On the Home Page";
            largeImg = "stadialogosquare";
            smallImg = "online";
            
            if (ccOn) {
                
                let currentlyPlaying = document.getElementsByClassName("HDKZKb  LiQ6Hb");
                
                for (let i = 0; i < currentlyPlaying.length; i++) {
                    if (!currentlyPlaying[i].getAttribute("class").includes("FW3qke")) {
                        currentlyPlaying = currentlyPlaying[i].textContent;
                        break;
                    }
                }

                if (currentlyPlaying.slice(0, 7) === "Playing") {
                    detailDisplay = currentlyPlaying;

                    //Slice to just game name then make lowercase and remove special characters
                    currentlyPlaying = currentlyPlaying.slice(8).toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(" ", "");
                    
                    
                    Object.keys(games).forEach(gameName => {
                        let game = games[gameName];
                        game["aliases"].forEach(alias => {
                            if (alias === currentlyPlaying) {
                                largeImgTxt = gameName;
                                smallImgTxt = "on Chromecast"

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

        } else if (tabURL.startsWith("https://stadia.google.com/store")) {
            detailDisplay = "Browsing the Store";
            largeImgTxt = "Looking for Something New";
            largeImg = "store";
            smallImg = "online";

            if (!storeOn) {
                return {action: "disconnect"};
            }

            //Displays what game is being viewed on the store
            Object.keys(games).forEach(gameName => {
                let game = games[gameName];
                if (game["store"] === tabURL) {
                    largeImgTxt = "Browsing the Store";
                    detailDisplay = "Checking out " + gameName
                }
            });

        } else {
            Object.keys(games).forEach(gameName => {
                let game = games[gameName];
                if (game["play"] === tabURL) {
                    detailDisplay = "Playing " + gameName;
                    largeImgTxt = gameName;
                    smallImgTxt = "on Stadia"
                    if (game["hasIcon"]) {
                        largeImg = game["aliases"][0];
                        smallImg = "stadialogosquare";
                    } else {
                        largeImg = "stadialogosquare";
                        smallImg = "online"
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
        
        if (partyToken.length > 0) {
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
                    smallImageText: smallImgTxt,
                    partyId: "party:" + partyToken,
                    partySize: document.getElementsByClassName("z9e9Hc")[0],
                    partyMax: 6,
                    joinSecret: partyToken
                }
            })

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
                    smallImageText: smallImgTxt,
                    partyId: "party:" + partyToken,
                    partySize: document.getElementsByClassName("z9e9Hc")[0],
                    partyMax: 6,
                    joinSecret: partyToken
                }
            }; 
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
    } catch (e) {
        console.error(e);
        return {action: 'disconnect'}
    } 
}