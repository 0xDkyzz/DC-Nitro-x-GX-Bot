/* eslint-disable no-sync */
const fs = require('fs');
const crypto = require('crypto');

// this is CLI app, so we need to ask user for input from command line
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// we need to ask user for input from command line how much generated links he wants to get
const askQuestion = () => new Promise((resolve) => {
    readline.question('How much generated links you want to get? ', (answer) => {
        resolve(answer);
    });
});

const PROMOTION_ID = '1180231712274387115'
const DISCORD_BASE_URL = 'https://discord.com/billing/partner-promotions'
const DISCORD_API_URL = 'https://api.discord.gx.games/v1/direct-fulfillment'

const requestToken = (partnerUserId) => fetch(DISCORD_API_URL, {
    'headers': {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'sec-ch-ua': '"Opera GX";v="105", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'Referer': 'https://www.opera.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    'body': JSON.stringify({ partnerUserId }),
    'method': 'POST'
}).then((res) => res.json());

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, (c) => {
    const r = Math.floor(Math.random() * 16);
    // eslint-disable-next-line no-mixed-operators, no-bitwise
    const v = c === 'x' ? r : r & 0x3 | 0x8;
    const u = v.toString(16);

    return u
});

const generateHASHEDUUID = () => {
    const uuid = generateUUID();
    const hashedUUID = crypto.createHash('sha256').update(uuid).digest('hex');

    return hashedUUID;
};

(async () => {
    try {
        const amount = await askQuestion();
        // loop through the amount of links we want to generate
        for (let i = 0; i < amount; i++) {
            const partnerUserId = generateHASHEDUUID();
            console.log(`Generating link ${i + 1}: ${partnerUserId}`)
            const getToken = await requestToken(partnerUserId);

             // if we get no token, we need to stop the script
            if (!getToken.token) {
                console.error('No token received, please try again');
                // eslint-disable-next-line no-process-exit
                readline.close() && process.exit(0);
            }

            const token = getToken.token;

            const combineURL = `${DISCORD_BASE_URL}/${PROMOTION_ID}/${token}`;

            // append generated links to links.txt file
            fs.appendFileSync('links.txt', `${combineURL}\n`);
        }
    } catch (error) {
        console.error(error);
    }

    fs.appendFileSync('links.txt', '\n');

    // eslint-disable-next-line no-process-exit
    readline.close() && process.exit(0);
})();
