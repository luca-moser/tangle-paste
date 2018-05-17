declare var __DEVELOPMENT__;
import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {PastebinStore, TEXT_STATE} from "../stores/PastebinStore";

interface Props {
    pastebinStore?: PastebinStore;
}

@inject("pastebinStore")
@observer
export class UploadError extends React.Component<Props, {}> {

    render() {
        const {text, upload_error} = this.props.pastebinStore;
        if(!upload_error) return null;
        return (
            <div className={'error_text'}>
                <i className="fas fa-exclamation-triangle icon_margin"></i>
                An error occurred while uploading: {upload_error}
            </div>
        );
    }
}