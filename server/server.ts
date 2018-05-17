var path = require('path');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var IOTA = require('iota.lib.js');
var bodyParser = require('body-parser');
var base64 = require('base-64');
var utf8 = require('utf8');

const MAX_TRYTES = 2187;
const MAX_MESSAGE = 2187 * 10;
const DEPTH = 3;
const MWM = 14;
const ADDRESS = 'TANGLEBINOVIURQRBTBDLQXWIXOLEUXHYBGAVASVPZ9HBTYJJEWBR9PDTGMXZGKPTGSUDW9QLFPJHTIEQ';
const SEED = 'ZKOLYXNQULBTLREXUDHKCLRUVVVTSQCNCBVCPRXBX99DCFVEXLALXRWWIVVJIZXCDSHCKKZBKV9DXIOIS';
const TAG = 'TANGLEBIN999999999999999999';

let MESSAGES = {
    UNKNOWN: -1,
    TEXT: 0,
    TEXT_INVALID: 1,
    PREPARING_TRANSFER: 2,
    SENDING_TX: 3,
    TX_SEND_ERROR: 4,
    TX_SEND_SUCCESS: 5,
};

const isValidText = (text, trytes) => {
    return iota.utils.fromTrytes(trytes) === text;
};

const newTransferObj = (trytes) => {
    return {
        'address': ADDRESS,
        'value': 0,
        'message': trytes,
        'tag': TAG,
    }
};

var iota = new IOTA({
    'provider': 'https://field.carriota.com:443'
});

const payload = (msg: number, payload?: any) => {
    return JSON.stringify({msg, payload});
}

app.use(bodyParser.json());

const static_files_dir = path.join(__dirname, '../client');
app.use(express.static(static_files_dir));

// send SPA
app.get('/', (req, res) => {
    res.sendFile(path.join(static_files_dir, '/html/index.html'));
});

app.get('/bin/:hash', (req, res) => {
    res.sendFile(path.join(static_files_dir, '/html/index.html'));
});

app.ws('/', (ws, req) => {

    ws.on('message', (data) => {
        const obj = JSON.parse(data);
        switch (obj.msg) {
            case MESSAGES.TEXT:
                const rawText = JSON.parse(data).text.trim() || '';
                const text = base64.encode(utf8.encode(rawText));
                const trytes = iota.utils.toTrytes(text);
                if (!text || !isValidText(text, trytes)) {
                    if(ws.readyState !== 1) return;
                    ws.send(payload(MESSAGES.TEXT_INVALID, 'text is not convertible (symbols not supported)'));
                    return;
                }
                if (trytes.length > MAX_MESSAGE) {
                    if(ws.readyState !== 1) return;
                    ws.send(payload(MESSAGES.TEXT_INVALID, 'text is too long'));
                    return;
                }

                // chop up the message into txs to fit the message
                let transfers = [];
                let msg = '';
                let i = 0;
                for (; i < trytes.length; i++) {
                    msg += trytes.charAt(i);
                    if (i !== 0 && i + 1 % MAX_TRYTES === 0) {
                        transfers.push(newTransferObj(msg));
                        // reset message for next segment
                        msg = '';
                    }
                }
                if (i + 1 % MAX_TRYTES !== 0) {
                    transfers.push(newTransferObj(msg));
                }

                let snip = transfers.reduce((prev, current) => {
                    return prev + current.message;
                }, '');

                if (snip !== trytes) {
                    throw Error("segments not split correctly");
                }

                // create transfer
                if(ws.readyState !== 1) return;
                ws.send(payload(MESSAGES.PREPARING_TRANSFER));
                iota.api.prepareTransfers(SEED, transfers, {security: 1}, (err, transferTrytes) => {
                    // send transaction
                    if (err) {
                        if(ws.readyState !== 1) return;
                        ws.send(payload(MESSAGES.TX_SEND_ERROR, err));
                        return;
                    }
                    if (ws.readyState !== 1) return;
                    ws.send(payload(MESSAGES.SENDING_TX));
                    iota.api.sendTrytes(transferTrytes, DEPTH, MWM, (err, txs) => {
                        if (err) {
                            if (ws.readyState !== 1) return;
                            ws.send(payload(MESSAGES.TX_SEND_ERROR, err));
                            return;
                        }
                        if (ws.readyState !== 1) return;
                        ws.send(payload(MESSAGES.TX_SEND_SUCCESS, txs));

                    });
                });
                break;

            default:
                console.log('sending unknown message');
                ws.send(payload(MESSAGES.UNKNOWN));
        }
    });

    ws.on('close', (e) => {
        console.log('websocket connection closed');
    });
});


const listen_port = 9000;

app.listen(listen_port, function () {
    console.log(`Example app listening on port ${listen_port}!`);
});