import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {API} from "../../../modules/api";

interface Props {
    path: string
}

class FilesystemTextEditor extends React.Component<Props & WithTranslation, any> {
    state = {
        path: undefined,
        text: ""
    }

    componentDidMount() {
        this.setState({path: this.props.path}, this.loadContents)
    }

    componentDidUpdate(prevProps: Readonly<Props & WithTranslation>, prevState: Readonly<any>, snapshot?: any) {
        if (this.state.path !== this.props.path) {
            this.setState({path: this.props.path}, this.loadContents)
        }
    }

    loadContents = () => {
        if (this.state.path) {
            API.instance().fetch("/system/fs/data?path=" + this.state.path)
                .then(response => response.text())
                .then(text => this.setState({text: text}))
        }
    }

    render() {
        return <div>{this.state.text}</div>;
    }
}

export default withTranslation()(FilesystemTextEditor)
