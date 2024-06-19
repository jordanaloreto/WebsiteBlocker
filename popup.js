document.addEventListener('DOMContentLoaded', function() {
    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        day.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    document.getElementById('addSite').addEventListener('click', function() {
        const site = document.getElementById('site').value;
        const startTime = document.getElementById('start').value;
        const endTime = document.getElementById('end').value;
        const selectedDays = Array.from(document.querySelectorAll('.day.selected')).map(day => parseInt(day.getAttribute('data-day')));

        if (site && startTime && endTime && selectedDays.length) {
            chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
                let blockedSites = data.blockedSites || {};
                let blockSchedule = data.blockSchedule || {};

                blockedSites[site] = [startTime, endTime];
                blockSchedule[site] = selectedDays;

                chrome.storage.sync.set({ blockedSites: blockedSites, blockSchedule: blockSchedule }, function() {
                    updateBlockedSitesList();
                });
            });
        }
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
                siteDiv.classList.add('blocked-site');
                
                const siteInfo = document.createElement('span');
                siteInfo.textContent = `${site}: ${days} das ${start} às ${end}`;
                
                const toggle = document.createElement('div');
                toggle.classList.add('toggle');
                toggle.addEventListener('click', function() {
                    if (!this.classList.contains('disabled')) {
                        this.classList.toggle('active');
                        toggleSiteBlock(site, this.classList.contains('active'));
                    }
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.addEventListener('click', function() {
                    deleteSiteBlock(site);
                });

                chrome.runtime.sendMessage({ action: 'isSiteBlocked', site: site }, function(response) {
                    if (response && response.blocked) {
                        toggle.classList.add('active', 'disabled');
                    }
                });

                siteDiv.appendChild(siteInfo);
                siteDiv.appendChild(toggle);
                siteDiv.appendChild(deleteButton);
                blockedSitesDiv.appendChild(siteDiv);
            }
        });
    }

    function toggleSiteBlock(site, block) {
        chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
            let blockedSites = data.blockedSites || {};
            let blockSchedule = data.blockSchedule || {};

            if (block) {
                chrome.storage.sync.set({ blockedSites: blockedSites, blockSchedule: blockSchedule });
            } else {
                delete blockedSites[site];
                delete blockSchedule[site];
                chrome.storage.sync.set({ blockedSites: blockedSites, blockSchedule: blockSchedule }, function() {
                    updateBlockedSitesList();
                });
            }
        });
    }

    function deleteSiteBlock(site) {
        chrome.storage.sync.get(['blockedSites', 'blockSchedule'], function(data) {
            let blockedSites = data.blockedSites || {};
            let blockSchedule = data.blockSchedule || {};

            delete blockedSites[site];
            delete blockSchedule[site];
            chrome.storage.sync.set({ blockedSites: blockedSites, blockSchedule: blockSchedule }, function() {
                updateBlockedSitesList();
            });
        });
    }

    updateBlockedSitesList();
});
