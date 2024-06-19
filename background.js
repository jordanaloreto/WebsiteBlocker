let blockedSites = {};
let blockSchedule = {};

// Carregar dados armazenados
chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
    blockedSites = data.blockedSites || {};
    blockSchedule = data.blockSchedule || {};
});

// Listener para interceptar requisições web
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        const hostname = url.hostname;

        if (shouldBlockSite(hostname)) {
            return { cancel: true };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Função para verificar se o site deve ser bloqueado
function shouldBlockSite(hostname) {
    const currentTime = new Date();
    const day = currentTime.getDay(); // Domingo = 0, Segunda = 1, etc.
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    for (const site in blockedSites) {
        if (hostname.includes(site)) {
            const [start, end] = blockedSites[site] || ["", ""];
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);

            if (blockSchedule[site].includes(day) && 
                (hours > startHours || (hours === startHours && minutes >= startMinutes)) &&
                (hours < endHours || (hours === endHours && minutes < endMinutes))) {
                return true;
            }
        }
    }
    return false;
}

// Listener para mensagens da popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'isSiteBlocked') {
        const currentTime = new Date();
        const day = currentTime.getDay();
        const hours = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const site = request.site;

        sendResponse({ blocked: shouldBlockSite(site) });
    }
});

// Atualizar dados armazenados
chrome.storage.onChanged.addListener(function(changes) {
    if (changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue || {};
    }
    if (changes.blockSchedule) {
        blockSchedule = changes.blockSchedule.newValue || {};
    }
});
