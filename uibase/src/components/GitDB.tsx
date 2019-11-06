import * as React from "react";
import {Form, Button, Tooltip} from 'antd';
//import { Ecore } from "ecore";
import { API } from "../modules/api";
import {Icon as IconFA} from 'react-fa';
import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/theme/tomorrow';
import Splitter from './CustomSplitter'
import {withTranslation, WithTranslation} from "react-i18next";

export interface Props {
}

interface State {
}

class GitDB extends React.Component<any, State> {

        constructor(props: any) {
        super(props);
    }

    state = {
    };

    render() {
        const {t} = this.props as Props & WithTranslation;
        return (
            <div>GitDB!</div>
        );
    }
}

export default withTranslation()(GitDB);
