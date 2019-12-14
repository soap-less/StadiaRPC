let extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
let tabURL = "";
let games = {};
(async function() {
    let response = await fetch("https://gist.githubusercontent.com/soap-less/30e9f0409ba0a99a5df4af6e07987e35/raw/stadiaGames.json");
    games = await response.json();
})();

// Register Presence
chrome.runtime.sendMessage(extensionId, { mode: 'active' }, function (response) {
    console.log('Presence registred', response)
});

// Wait for presence Requests
chrome.runtime.onMessage.addListener(function (info, sender, sendResponse) {
    console.log('Presence requested', info);
    sendResponse(getPresence());
});

//Why these need to be declared globally, I'll never know.
let largeImgTxt = "";
let smallImgTxt = "Online";
let largeImg = "stadialogosquare";
let smallImg = "online";
// Return Presence   
function getPresence() {
    tabURL = location.href;
    let time = Date.now();

    largeImgTxt = "";
    smallImgTxt = "Online";
    largeImg = "stadialogosquare";
    smallImg = "online";


    //Set details
    let stateDisplay = "Unknown Game";
    if (tabURL === "https://stadia.google.com/home") {
        stateDisplay = "Chilling in Home";
        largeImgTxt = "On the Home Page";
    } else if (tabURL.startsWith("https://stadia.google.com/store")) {
        stateDisplay = "Browsing the Store";
        largeImgTxt = "Looking for Something New";
    } else {
        Object.keys(games).forEach(gameName => {
            let game = games[gameName];
            if (game["play"] === tabURL) {
                stateDisplay = "Playing " + gameName;
                largeImgTxt = gameName;
                smallImgTxt = "on Stadia"
                if (game["hasIcon"] === true) {
                    largeImg = game["aliases"][0];
                    smallImg = "stadialogosquare"
                }
            }
        });
    } 

    return {
        clientId: '648430151390199818',
        presence: {
            details: stateDisplay,
            startTimestamp: time,
            instance: true,
            largeImageKey: largeImg,
            smallImageKey: smallImg,
            largeImageText: largeImgTxt,
            smallImageText: smallImgTxt
        }
    };  
}