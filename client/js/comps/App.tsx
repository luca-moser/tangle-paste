import {PastebinStore} from "../stores/PastebinStore";

declare var __DEVELOPMENT__;
import * as React from 'react';
import {observer, inject} from 'mobx-react';
import { Switch, Route } from 'react-router'
import {ApplicationStore} from "../stores/AppStore";
import DevTools from 'mobx-react-devtools';
import {Pastebin} from './Pastebin';
import {Bin} from "./Bin";
import { withRouter } from 'react-router'

interface Props {
    appStore: ApplicationStore;
    pastebinStore: PastebinStore;
}

@withRouter
@inject("appStore")
@inject("pastebinStore")
@observer
export class App extends React.Component<Props, {}> {
    render() {
        const {ws_connected} = this.props.pastebinStore;

        return (
            <React.Fragment>
                <div className={'main_box'}>

                    {ws_connected ?
                        <div>
                            <h1>Tangle Bin</h1>
                            <Switch>
                                <Route path="/bin/:hash" component={Bin}/>
                                <Route path="/" component={Pastebin}/>
                            </Switch>
                        </div>
                        :
                        <div>
                            <h3>
                                Waiting for WebSocket connection...
                            </h3>
                        </div>
                    }

                </div>

                {__DEVELOPMENT__ ? <DevTools /> : <span></span>}
            </React.Fragment>
        );
    }
}