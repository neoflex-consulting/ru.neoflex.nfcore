import {ViewFactory, View} from './View'
import Ecore from "ecore";
import * as React from "react";
import {Col, Row} from "antd";
import UserComponent from "./components/app/UserComponent";

abstract class ViewContainer extends View {
    renderChildren = () => {
        const children = this.viewObject.get("children") as Ecore.EObject[];
        return children.map(c=>this.viewFactory.createView(c, this.props))
    };

    render = () => {
        return <div>{this.renderChildren()}</div>
    }
}

class Div_ extends ViewContainer {
    render = () => {
        return <div>{this.renderChildren()}</div>
    }
}

class Span_ extends ViewContainer {
    render = () => {
        return <span>{this.renderChildren()}</span>
    }
}

class Row_ extends ViewContainer {
    render = () => {
        return <Row>{this.renderChildren()}</Row>
    }
}

class Col_ extends ViewContainer {
    render = () => {
        return <Col>{this.renderChildren()}</Col>
    }
}

class ComponentElement_ extends ViewContainer {
    render = () => {
        return <UserComponent componentClassName="MandatoryReportingTrans"/>
    }
}

class AntdFactory implements ViewFactory {
    name = 'antd';
    components = new Map<string, typeof View>();
    constructor() {
        this.components.set('ru.neoflex.nfcore.application#//Div', Div_);
        this.components.set('ru.neoflex.nfcore.application#//Span', Span_);
        this.components.set('ru.neoflex.nfcore.application#//Row', Row_);
        this.components.set('ru.neoflex.nfcore.application#//Col', Col_);
        this.components.set('ru.neoflex.nfcore.application#//ComponentElement', ComponentElement_)
    }
    createView = (viewObject: Ecore.EObject, props: any) => {
        let Component = this.components.get(viewObject.eClass.eURI());
        if (!Component) {
            Component = View
        }
        return <Component viewObject={viewObject} vievFactory={this} {...props}/>
    }
}

export default new AntdFactory()
