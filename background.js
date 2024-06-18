let blockedSites = {};
let blockSchedule = {};

chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
    blockedSites = data.blockedSites || {};
    blockSchedule = data.blockSchedule || {};
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        const hostname = url.hostname;

        if(shouldBlockStite(hostname)){
            return { cancel: true};
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

function shouldBlockStite(hostname){
    const currentTime = new Date();
    const day = currentTime.getDay();
    const hours = currentTime.getHours();

    for (const site in blockedSites){
        if (hostname.includes(site)) {
            const [start, end] = blockedSites[site];
            if(blockSchedule[site].includes(day) && hours >= start && hours < end){
                return true;
            }
        }
    }
    return false;
}