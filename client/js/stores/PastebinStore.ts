import {action, observable, runInAction} from 'mobx';
import IOTA from 'iota.lib.js';
import base64 from 'base-64';
import utf8 from 'utf8';
import axios from 'axios';

const iota = new IOTA({});

const MAX_TRYTES = 2187;
const MAX_MESSAGES = 2187 * 10;

export const TEXT_STATE = {
    OK: 0,
    TOO_LARGE: 1,
    INVALID_CHARACTERS: 2,
};

export const MESSAGES = {
    TEXT: 0,
    TEXT_INVALID: 1,
    PREPARING_TRANSFER: 2,
    SENDING_TX: 3,
    TX_SEND_ERROR: 4,
    TX_SEND_SUCCESS: 5,
};

const isValidText = (text) => {
    return iota.utils.fromTrytes(iota.utils.toTrytes(text)) === text;
};

export class PastebinStore {
    @observable text = "";
    @observable text_state = 0;
    @observable uploading = false;
    @observable upload_progress;
    @observable txs = null;
    @observable upload_error = false;

    ws_conn: WebSocket;
    @observable ws_connected = false;

    constructor() {
        setTimeout(() => {

            this.initWebSocket();
        }, 1000);
    }

    @action
    reset = () => {
        this.text_state = 0;
        this.uploading = false;
        this.upload_progress = 0;
        this.upload_error = false;
        this.txs = null;
    }

    initWebSocket = () => {
        this.ws_conn = new WebSocket('ws://' + location.host + '/');

        this.ws_conn.addEventListener('open', (e) => {
            runInAction('ws_connected', () => {
                this.ws_connected = true;
            });
        });

        this.ws_conn.addEventListener('message', (e) => {
            const obj = JSON.parse(e.data);
            if (!obj) return;
            switch (obj.msg) {
                case MESSAGES.TEXT_INVALID:
                    this.handleInvalidTextRes(obj.payload);
                    break;
                case MESSAGES.PREPARING_TRANSFER:
                    runInAction('set_progress_prep_transfer', () => {
                        this.upload_progress = MESSAGES.PREPARING_TRANSFER;
                    });
                    break;
                case MESSAGES.SENDING_TX:
                    runInAction('set_progress_sending_tx', () => {
                        this.upload_progress = MESSAGES.SENDING_TX;
                    });
                    break;
                case MESSAGES.TX_SEND_SUCCESS:
                    runInAction('set_progress_tx_send_success', () => {
                        this.upload_progress = MESSAGES.TX_SEND_SUCCESS;
                        this.uploading = false;
                        this.txs = obj.payload;
                    });
                    break;
                case MESSAGES.TX_SEND_ERROR:
                    runInAction('set_progress_tx_send_error', () => {
                        this.upload_progress = MESSAGES.TX_SEND_ERROR;
                        this.uploading = false;
                    });
                    break;
                default:
                    console.log(obj.payload);
            }
        });

        this.ws_conn.addEventListener('close', (e) => {
            console.log('websocket connection closed');
        });
    }

    @action
    handleInvalidTextRes = (err) => {
        this.uploading = false;
        this.upload_error = err;
    }

    @action
    updateText = (rawText: string) => {
        this.text = rawText;
        const text = base64.encode(utf8.encode(rawText));
        const trytes = iota.utils.toTrytes(text);
        if (!isValidText(text)) {
            this.text_state = TEXT_STATE.INVALID_CHARACTERS;
            return;
        }
        if (trytes > MAX_MESSAGES) {
            this.text_state = TEXT_STATE.TOO_LARGE;
            return;
        }

        this.text_state = TEXT_STATE.OK;
    }

    @action
    uploadText = () => {
        this.uploading = true;
        this.upload_error = null;
        this.upload_progress = 0;
        this.ws_conn.send(JSON.stringify({msg: MESSAGES.TEXT, text: this.text}));
    }
}

export var PastebinStoreInstance = new PastebinStore();