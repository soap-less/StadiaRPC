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

//Set default options
let stateDisplay = "";  
let largeImgTxt = "";
let smallImgTxt = "Online";
let largeImg = "stadialogosquare";
let smallImg = "online";
let time = Date.now();
let detailDisplay = "Playing an Unknown Game";
let prevDetailDisplay = "Playing an Unknown Game";
let prevStateDisplay = ""

//Return presence   
function getPresence() {
    tabURL = location.href;

    //Updates the options
    if (tabURL === "https://stadia.google.com/home") {
        detailDisplay = "Chilling in Home";
        largeImgTxt = "On the Home Page";
    } else if (tabURL.startsWith("https://stadia.google.com/store")) {
        detailDisplay = "Browsing the Store";
        largeImgTxt = "Looking for Something New";

        //Displays what game is being viewed on the store
        Object.keys(games).forEach(gameName => {
            let game = games[gameName];
            if (game["store"] === tabURL) {
                stateDisplay = "Checking out " + gameName;
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
                }
                //Way too much work for seperating names onto different lines, may have to optimize later
                if (gameName.includes(":") && gameName.length + 8 > 25) {
                    for (i = 0; i < gameName.length; i++) {
                        if (gameName[i] == ":") {
                            detailDisplay = "Playing " + gameName.slice(0, i + 1);
                            stateDisplay = gameName.slice(i + 2);
                        }
                    }
                } else if (gameName.length + 8 > 25 && gameName.length <= 25) {
                    detailDisplay = "Playing";
                    stateDisplay = gameName;
                } else if (gameName.length + 8 > 25) {
                    for (i = gameName.length - 1; i >= 0; i--) {
                        if (gameName[i] == " " && gameName.slice(0, i).length + 8 < 25) {
                            detailDisplay = "Playing" + gameName.slice(0, i);
                            stateDisplay = gameName.slice(i + 1);
                        }
                    }
                }
            }
        });
    } 

    //Check to see if presence has changed, resets time if so
    if (prevDetailDisplay !== detailDisplay || prevStateDisplay !== stateDisplay) {
        time = Date.now();
    }
    prevDetailDisplay = detailDisplay;
    prevStateDisplay = stateDisplay;

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