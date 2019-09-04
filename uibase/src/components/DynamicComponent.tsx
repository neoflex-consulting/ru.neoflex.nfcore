import * as React from "react";
import {FC} from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import {API} from "../modules/api";

const urlCache = new Map<string, any>();

const loadRemoteComponent = (path: string) => {
    if (urlCache.has(path)) {
        const exports = urlCache.get(path);
        return Promise.resolve(exports)
    }
    var exports: any = {};
    var module = {exports};
    return API.instance().fetch(path)
        .then(res => res.text())
        .then((body) => {
            eval(body); // eslint-disable-line no-eval
            urlCache.set(path, module.exports);
            return module.exports
        })
};

export interface Props {
    componentPath: string;
    componentName: string;
}

class DynamicComponent extends React.Component<Props & WithTranslation, any> {
    state = { Component: ()=><span>Loading...</span> };

    componentDidMount(): void {
        const {t} = this.props;
        loadRemoteComponent(this.props.componentPath)
            .then((R) => {
                if (R[this.props.componentName]) {
                    this.setState({
                        Component: withTranslation()(R[this.props.componentName])
                    });
                } else {
                    this.notDownload(t)
                }
            })
            .catch(() => {this.notDownload(t)})
    }

    private notDownload(t: any) {
        this.setState({
            Component: () =>
                <div>"{this.props.componentName}" {t("dynamiccomponent")} "{this.props.componentPath}"</div>
        })
    }

    render() {
        const Component = this.state.Component as unknown as FC;
        return (
            <Component/>
        )}
    }

export default withTranslation()(DynamicComponent)
