import {PastebinStore, TEXT_STATE} from "../stores/PastebinStore";

declare var __DEVELOPMENT__;
import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {BinStore} from "../stores/BinStore";
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import Highlight from 'react-highlight';
import dateformat from 'dateformat';

let sentences = [
    "We should question leechi's life",
    "So so so so so",
    "Sidewinders are the pinnacle of bad chat members",
    "You need at least an IQ of 2187 to understand the Tangle",
    "Bull run?",
    "Without the blocks or the chain",
    "A little fish...Nuriel, a little fish"
];

function randomNum(min, max) {
    return Math.random() * (max - min) + min;
}

interface Props {
    binStore?: BinStore;
    match?: { params: { hash } };
    history?: any;
}

@withRouter
@inject("binStore")
@observer
export class Bin extends React.Component<Props, {}> {
    componentWillMount() {
        this.props.binStore.loadBundle(this.props.match.params.hash);
    }

    render() {
        const {txs, txs_load_error, tx_text} = this.props.binStore;
        const {hash} = this.props.match.params;

        if (txs_load_error) {
            return <span>Unable to load bin bundle: {hash}</span>;
        }
        if (!txs) {
            return (
                <span className={'bin_loading'}>
                    {sentences[Math.floor(randomNum(0, sentences.length))]}...
                    <i className="fas fa-spinner fa-pulse icon_margin_left"/>
                </span>
            );
        }

        return (
            <div>
                <Link to='/'>
                    <button className={'button'}>
                        New Bin
                    </button>
                </Link>

                <h2>Bin Bundle: {hash}</h2>

                <p className={'bin_meta'}>
                    Uploaded on: {dateformat(new Date(txs[0].timestamp * 1000), 'dd mmm. yyyy HH:MM:ss')},
                    consisting of {txs.length} transaction(s).
                </p>

                <div className={'bin'}>
                    <Highlight className={'bin_code'}>
                        {tx_text}
                    </Highlight>
                </div>
            </div>
        );
    }
}