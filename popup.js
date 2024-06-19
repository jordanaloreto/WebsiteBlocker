document.getElementById('addSite').addEventListener('click', function(){
    const site = document.getElementById('site').value;
    const days = document.getElementById('days').value.split(',').map(Number);
    const start = parseInt(document.getElementById('start').value);
    const end = parseInt(document.getElementById('end').value);

    chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data){
        let blockedSites = data.blockedSites || {};
        let blockSchedule = data.blockSchedule || {};

        blockedSites[site] = [start, end];
        blockSchedule[site] = days;

        chrome.storage.sync.set({ blockedSites: blockedSites, blockSchedule: blockSchedule}, function(){
            updateBlockedSitesList();
        });
    });
});

function updateBlockedSitesList() {
    chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
        const blockedSites = data.blockedSites || {};
        const blockSchedule = data.blockSchedule || {};
        const blockedSitesDiv = document.getElementById('blockedSites');
        blockedSitesDiv.innerHTML = '';

        for (const site in blockedSites) {
            const [start, end] = blockedSites[site];
            const days = blockSchedule[site].join(', ');
            const siteDiv = document.createElement('div');
            siteDiv.textContent = `${site}: ${days} das ${start}h às ${end}h`;
            blockedSitesDiv.appendChild(siteDiv);
        }
    });
}

updateBlockedSitesList();