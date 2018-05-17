import {action, computed, observable, remove, runInAction} from 'mobx';
import base64 from 'base-64';
import utf8 from 'utf8';

var IOTA = require('iota.lib.js');

const MAX_TRYTES = 2187;

var iota = new IOTA({
    'provider': 'http://nodes.iota.fm:80'
});

function removePadding(s) {
    if(s.charAt(s.length-1) !== '9') return s;
    let i = MAX_TRYTES - 1;
    while (s.charAt(i) === '9') {
        i--;
    }

    if (i % 2 || (MAX_TRYTES - i) % 2 !== 0) {
        i++
    }
    return s.substring(0, i);
}

export class BinStore {
    @observable txs = null;
    @observable txs_load_error = null;

    @action
    loadBundle = (hash: string) => {
        this.txs_load_error = null;
        this.txs = null;
        iota.api.findTransactionObjects({bundles: [hash]}, (err, txs) => {
            if (err || !txs || !txs.length) {
                runInAction('load_txs_error', () => {
                    this.txs_load_error = err || 'not found';
                });
            }
            runInAction('txs_loaded', () => {
                this.txs = txs.sort((a, b) => a.currentIndex < b.currentIndex ? -1 : 1);
            });
        });
    }

    @computed
    get tx_text() {
        const txs = this.txs;
        if (!txs) return "";
        let message = txs.reduce((prev, tx, i) => {
            return prev + removePadding(tx.signatureMessageFragment);
        }, '');
        const base64_bytes = iota.utils.fromTrytes(message);
        const base64_decoded = base64.decode(base64_bytes);
        return utf8.decode(base64_decoded);
    }
}

export var BinStoreInstance = new BinStore();