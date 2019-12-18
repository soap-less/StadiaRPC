document.addEventListener('DOMContentLoaded', function () {
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
            document.body.insertBefore(bannerDiv, document.getElementById("header"));
        }
    });
});

