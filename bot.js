const tmi = require("tmi.js");
const rp = require("request-promise");
const $ = require("cheerio");
const fs = require('fs');
const moment = require('moment');
const gofundme_url = 'https://www.gofundme.com/f/gu9tre-trying-to-escape';

const opts = JSON.parse(fs.readFileSync("credentials.json"));

// Create client 
const client = new tmi.client(opts);

// Register event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectHandler);

// Connect to Twitch
client.connect()
    .then(main);

function onConnectHandler(addr, port) {
    log(`* Connected to ${addr}:${port}`)
}

function onMessageHandler(target, context, msg, self) {
    if (self) return;

    const commandName = msg.trim().split(' ')[0];

    if (commandName === "!dice") {
        const num = rollDice();
        client.say(target, `You rolled a ${num}`)
            .then((data) => {
                log(`Message sent! Data: ${data}`);
            })
            .catch(err => {
                log(`Error: ${err}`);
            });
        log(`* Executed ${commandName} command`);
    } else {
        log(`* Unknown command ${commandName}`);
    }
}

// Function called when the "dice" command is issued
function rollDice() {
    const sides = 6;
    return Math.floor(Math.random() * sides) + 1;
}

function main() {
    checkDonoAndAlertIfNew();
    setInterval(checkDonoAndAlertIfNew, 60000);
}

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

                client.say("#Nyvena", `GoFundMe: ${lastDonator} just donated ${lastDonation}!`);

                fs.writeFileSync('lastdono.json', JSON.stringify({
                    lastDonator,
                    lastDonation
                }));
            } else
                log("* It's not new, aborting...");

        })
}

function log(message) {
    console.log("[" + moment().format("DD/MM/YYYY HH:mm:ss") + "] " + message);
}