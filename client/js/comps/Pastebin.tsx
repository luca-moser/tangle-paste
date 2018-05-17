declare var __DEVELOPMENT__;
import classNames from 'classnames';
import {TextStateInfo} from "../stores/TextStateInfo";
import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {PastebinStore, TEXT_STATE, MESSAGES} from "../stores/PastebinStore";
import DevTools from 'mobx-react-devtools';
import {UploadError} from "../stores/UploadError";
import { withRouter, Redirect } from 'react-router'

interface Props {
    pastebinStore?: PastebinStore;
    history?: any;
}

@withRouter
@inject("pastebinStore")
@observer
export class Pastebin extends React.Component<Props, {}> {
    componentWillUnmount() {
        this.props.pastebinStore.reset();
    }

    changeText = (e: any) => {
        const {updateText} = this.props.pastebinStore;
        updateText(e.target.value);
    }

    upload = () => {
        const {uploadText} = this.props.pastebinStore;
        uploadText();
    }

    render() {
        const {text, text_state, uploading} = this.props.pastebinStore;
        return (
            <div>
                <p>
                    Messages up to 10 * 2187 trytes (~10,935 kilobytes) and UTF-8 symbols are supported.
                </p>
                <br/>
                <textarea className={'pastebin_textarea'} onChange={this.changeText} value={text} disabled={uploading}/>
                <TextStateInfo />
                <UploadError />
                <UploadFinished/>
                <button className={'button'} disabled={text_state !== TEXT_STATE.OK || uploading || !text.trim()} onClick={this.upload}>
                    {uploading ?
                        <span>
                            <ButtonUploadProgress/>
                        </span>
                        :
                        <span>Upload {text.length} characters To Tangle</span>
                    }
                </button>
            </div>
        );
    }
}

@withRouter
@inject("pastebinStore")
@observer
class UploadFinished extends React.Component<Props, {}> {

    render() {
        const {upload_progress, txs, upload_error} = this.props.pastebinStore;

        if(txs) {
            return <Redirect to={`/bin/${txs[0].bundle}`}/>;
        }

        switch (upload_progress) {
            case MESSAGES.TX_SEND_ERROR:
                return (
                    <div className={'progress_tx_error'}>
                        Couldn't send transaction: {upload_error}
                    </div>
                );
        }

        return null;
    }
}

@inject("pastebinStore")
@observer
class ButtonUploadProgress extends React.Component<Props, {}> {
    render() {
        const {upload_progress} = this.props.pastebinStore;
        let text = "";

        switch (upload_progress) {
            case MESSAGES.PREPARING_TRANSFER:
                text = "Preparing Transfer";
                break;
            case MESSAGES.SENDING_TX:
                text = "Sending Transaction";
                break;
            default:
                return null;
        }

        return (
            <span>
                <i className="fas fa-spinner fa-pulse icon_margin" />
                {text}
            </span>
        );
    }
}