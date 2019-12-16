let extensionId = "agnaejlkbiiggajjmnpmeheigkflbnoo"; //Chrome
let tabURL = "";
let games = {};
(async function() {
    let response = await fetch("https://raw.githubusercontent.com/soap-less/StadiaJSON/master/games.json");
    games = await response.json();
})();

//Register Presence
chrome.runtime.sendMessage(extensionId, { mode: 'active' }, function (response) {
    console.log('Presence registred', response)
});

//Wait for presence Requests
chrome.runtime.onMessage.addListener(function (info, sender, sendResponse) {
    console.log('Presence requested', info);
    sendResponse(getPresence());
});

//Establish all options
let largeImgTxt = "";
let smallImgTxt = "Online";
let largeImg = "stadialogosquare";
let smallImg = "online";
let detailDisplay = "Playing an Unknown Game";
let prevDetailDisplay = "Playing an Unknown Game";

let stateDisplay = "";
let time = Date.now();

//Return presence   
function getPresence() {
    tabURL = location.href;
    //Updates the options
    if (tabURL === "https://stadia.google.com/home") {
        detailDisplay = "Chilling in Home";
        largeImgTxt = "On the Home Page";
        largeImg = "stadialogosquare";
        smallImg = "online";
    } else if (tabURL.startsWith("https://stadia.google.com/store")) {
        detailDisplay = "Browsing the Store";
        largeImgTxt = "Looking for Something New";
        largeImg = "store";
        smallImg = "online";

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
}