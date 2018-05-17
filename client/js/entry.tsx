declare var module;
declare var require;
require("react-hot-loader/patch");

require("./../css/reset.css");
require("./../css/monokai.css");
require("./../css/main.scss");

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {configure} from 'mobx';
import {Provider} from 'mobx-react';
import {AppContainer} from 'react-hot-loader'
import {App} from './comps/App';

// use MobX in strict mode
configure({ enforceActions: true,  isolateGlobalState: true});

// stores
import {AppStoreInstance as appStore} from "./stores/AppStore";
import {PastebinStoreInstance as pastebinStore} from "./stores/PastebinStore";
import {BinStoreInstance as binStore} from "./stores/BinStore";

let stores = {appStore, pastebinStore, binStore};

const render = Component => {
    ReactDOM.render(
        <AppContainer>
            <BrowserRouter>
                <Provider {...stores}>
                    <Component />
                </Provider>
            </BrowserRouter>
        </AppContainer>,
        document.getElementById('app')
    )
}

render(App);

if (module.hot) {
    module.hot.accept()
}