import * as React from 'react';
import { Component } from 'react';

import {WithTranslation, withTranslation} from "react-i18next";
import {EObject} from "ecore";

interface Props {
    serverFilters?: Array<EObject>
}

class ServerFilter extends Component<Props & WithTranslation, any> {

    constructor(props: any) {
        super(props);
        this.state = {};
    }


    render() {
        const { t } = this.props
        return (
            "Some"
        )
    }
}

export default withTranslation()(ServerFilter)
