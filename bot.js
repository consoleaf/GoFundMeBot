const rp = require("request-promise");
const $ = require("cheerio");
const fs = require('fs');
const moment = require('moment');
const gofundme_url = 'https://www.gofundme.com/f/gu9tre-trying-to-escape';  // Replace with your link

checkDonoAndAlertIfNew();  // Initial check
const N = 60;  // N = seconds between the checks. Do NOT set lower than 5.
setInterval(checkDonoAndAlertIfNew, N * 1000);  // Then check every N seconds

function checkDonoAndAlertIfNew() {
    var lastDonator = null;
    var lastDonation = null;

    try {
        const lastdono = JSON.parse(fs.readFileSync('lastdono.json'));

        lastDonator = lastdono["lastDonator"];
        lastDonation = lastdono['lastDonation'];
    } catch (e) {
        log(e);
    }

    rp(gofundme_url)
        .then(html => {
            const elements = $('.m-progress-meter > h2', html)[0].children;
            const currentlyRaised = elements[0].data;

            const donators = $('li.o-donation-list-item .m-person-info-name', html);
            const donations = $('li.o-donation-list-item .m-donation-meta .weight-900', html);

            const newDonor = donators[0].children[0].data;
            let newDono = donations[0].children[0].data;

            log(`* Newest donation on GoFundMe: ${newDonor} -> ${newDono}`);
            log(`* Checking if it's new...`);

            const regex = /[$ ]*([0-9]+)[$ ]*/gm;
            newDono = newDono.replace(regex, `$$$1`);

            if (lastDonator != newDonor || lastDonation != newDono) {
                lastDonator = newDonor;
                lastDonation = newDono;

                log("* Found new donation!");

                fs.writeFileSync('lastdono.json', JSON.stringify({
                    lastDonator,
                    lastDonation
                }));
            } else
                log("* It's not new.");

        })
}

function log(message) {
    console.log("[" + moment().format("DD/MM/YYYY HH:mm:ss") + "] " + message);
}