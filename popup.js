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
    let ccToggle = document.getElementById("ccToggle");

    chrome.storage.local.get({"rpcHomeOn": true, "rpcStoreOn": true, "rpcGameOn": true, "rpcCCOn": false}, function(items) {
        if (items.rpcHomeOn) {
            homeToggle.setAttribute("src", "/assets/icon128.png");
        }

        if (items.rpcStoreOn) {
            storeToggle.setAttribute("src", "/assets/icon128.png");
        }

        if (items.rpcGameOn) {
            gameToggle.setAttribute("src", "/assets/icon128.png");
        }

        if (items.rpcCCOn) {
            ccToggle.setAttribute("src", "/assets/icon128.png");
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

    storeToggle.addEventListener("click", function() {
        if (storeToggle.getAttribute("src") === "/assets/icon128.png") {
            chrome.storage.local.set({rpcStoreOn: false});
            storeToggle.setAttribute("src", "/assets/rpcOff.png");
        } else {
            chrome.storage.local.set({rpcStoreOn: true});
            storeToggle.setAttribute("src", "/assets/icon128.png");
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

    ccToggle.addEventListener("click", function() {
        chrome.storage.local.get({firstTimeCC: true}, function(items) {
            if (items.firstTimeCC) {
                chrome.tabs.create({url: "https://github.com/soap-less/StadiaRPC/wiki/Getting-Started-with-Chromecast-Pixel-RPC-(WIP)"})
                chrome.storage.local.set({firstTimeCC: false});
            }
        });
        if (ccToggle.getAttribute("src") === "/assets/icon128.png") {
            chrome.storage.local.set({rpcCCOn: false});
            ccToggle.setAttribute("src", "/assets/rpcOff.png");
        } else {
            chrome.storage.local.set({rpcCCOn: true});
            ccToggle.setAttribute("src", "/assets/icon128.png");
        }
    });

    document.getElementById("wiki").addEventListener("click", function(){
        chrome.tabs.create({url: "https://github.com/soap-less/StadiaRPC/wiki/Getting-Started-with-Chromecast-Pixel-RPC-(WIP)"})
    });
});
