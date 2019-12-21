document.addEventListener('DOMContentLoaded', function () {

    //Set version #
    document.getElementById("signature").innerHTML = "soapless (" + chrome.runtime.getManifest()["version"] + ")";

    //Adds a banner when out of date
    chrome.browserAction.getBadgeText({}, function(badgeText) {
        if (badgeText === "!") {
            let bannerDiv = document.createElement("div");
            bannerDiv.setAttribute("id", "updateBanner");
            let bannerText = document.createElement("a");
            bannerText.innerHTML = "New Update Available";
            bannerText.setAttribute("href", "https://chrome.google.com/webstore/detail/stadiarpc/dmhhgpkmilabgjpdbkinimkihdiobljg?hl=en&gl=US")
            bannerText.setAttribute("target", "_newtab");
            bannerDiv.appendChild(bannerText);
            document.body.insertBefore(bannerDiv, document.getElementById("settingsPage"));
        }
    });

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
    
});
