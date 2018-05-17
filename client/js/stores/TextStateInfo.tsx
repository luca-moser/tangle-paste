declare var __DEVELOPMENT__;
import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {PastebinStore, TEXT_STATE} from "../stores/PastebinStore";

interface Props {
    pastebinStore?: PastebinStore;
}

@inject("pastebinStore")
@observer
export class TextStateInfo extends React.Component<Props, {}> {

    render() {
        const {text_state} = this.props.pastebinStore;
        let error_text = "";
        switch(text_state) {
            case TEXT_STATE.OK:
                return null;
            case TEXT_STATE.INVALID_CHARACTERS:
                error_text = "Only extended ASCII symbols are supported.";
                break;
            case TEXT_STATE.TOO_LARGE:
                error_text = "The text exceeds the max. limit of 5 * 2187 trytes.";
                break;
        }

        return (<div className={'error_text'}>{error_text}</div>);
    }
}