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

    document.getElementById("settings").addEventListener("click", function() {
        let mainPage = document.getElementById("mainPage");
        let settingsPage = document.getElementById("settingsPage");
        let settingsIcon = document.getElementById("settings")

        if(settingsPage.getAttribute("style") === "height: 0") {
            settingsIcon.setAttribute("src", "/assets/arrow.png")
            settingsIcon.setAttribute("class", "imgLink left")

            mainPage.setAttribute("style", "height: 0");
            settingsPage.setAttribute("style", "");

        } else {
            settingsIcon.setAttribute("src", "/assets/settings.png")
            settingsIcon.setAttribute("class", "imgLink right")

            settingsPage.setAttribute("style", "height: 0");
            mainPage.setAttribute("style", "");
        }
    });
});