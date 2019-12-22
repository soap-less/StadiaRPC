document.addEventListener('DOMContentLoaded', function () {

    //Set version #
    document.getElementById("signature").innerHTML = "soapless (" + chrome.runtime.getManifest()["version"] + ")";

    let mainPage = document.getElementById("mainPage");
    let settingsPage = document.getElementById("settingsPage");
    document.getElementById("settings").addEventListener("click", function() {
        mainPage.setAttribute("class", "moveLeft");
        settingsPage.setAttribute("class", "moveLeft");
    });

    document.getElementById("backArrow").addEventListener("click", function() {
        mainPage.setAttribute("class", "moveRight");
        settingsPage.setAttribute("class", "moveRight");
    }); 
    
    let homeToggle = document.getElementById("homeToggle");
    let storeToggle = document.getElementById("storeToggle");
    let gameToggle = document.getElementById("gameToggle");

    chrome.storage.local.get("rpcHomeOn", function(items) {
        if (items.rpcHomeOn) {
            homeToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    homeToggle.addEventListener("click", function() {
        if (homeToggle.getAttribute("src") === "/assets/icon128.png") {
            chrome.storage.local.set({rpcHomeOn: false});
            homeToggle.setAttribute("src", "/assets/rpcOff.png");
        } else {
            chrome.storage.local.set({rpcHomeOn: true});
            homeToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    chrome.storage.local.get({"rpcStoreOn": true}, function(items) {
        if (items.rpcStoreOn) {
            storeToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    storeToggle.addEventListener("click", function() {
        if (storeToggle.getAttribute("src") === "/assets/icon128.png") {
            chrome.storage.local.set({rpcStoreOn: false});
            storeToggle.setAttribute("src", "/assets/rpcOff.png");
        } else {
            chrome.storage.local.set({rpcStoreOn: true});
            storeToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    chrome.storage.local.get({"rpcGameOn": true}, function(items) {
        if (items.rpcGameOn) {
            gameToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    gameToggle.addEventListener("click", function() {
        if (gameToggle.getAttribute("src") === "/assets/icon128.png") {
            chrome.storage.local.set({rpcGameOn: false});
            gameToggle.setAttribute("src", "/assets/rpcOff.png");
        } else {
            chrome.storage.local.set({rpcGameOn: true});
            gameToggle.setAttribute("src", "/assets/icon128.png");
        }
    });
});
