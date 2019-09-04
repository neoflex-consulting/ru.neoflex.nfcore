import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route} from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';

ReactDOM.render(
    <BrowserRouter>
        <I18nextProvider i18n={i18n}>
            <Route
                path='/' component={App}
            />
        </I18nextProvider>
    </BrowserRouter>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
