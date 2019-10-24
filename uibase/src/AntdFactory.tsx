import {ViewFactory, View} from './View'
import Ecore from "ecore";
import * as React from "react";
import {Col, Form, Row, Tabs} from "antd";
import UserComponent from "./components/app/UserComponent";

abstract class ViewContainer extends View {
    renderChildren = () => {
        let children = this.viewObject.get("children") as Ecore.EObject[];
        let childrenView = children.map(
            (c: Ecore.EObject) => this.viewFactory.createView(c, this.props));
        return <div>{childrenView}</div>
    };

    render = () => {
        return <div>{this.renderChildren()}</div>
    }
}

class Div_ extends ViewContainer {
    render = () => {
        return (
            <div>
                {this.renderChildren()}
            </div>
        )
    }
}

class Span_ extends ViewContainer {
    render = () => {
        return (
            <span>
                {this.renderChildren()}
            </span>
        )
    }
}

class Row_ extends ViewContainer {
    render = () => {
        return (
            <Row>
                {this.renderChildren()}
            </Row>
        )
    }
}

class Col_ extends ViewContainer {
    render = () => {
        return (
            <Col>
                {this.renderChildren()}
            </Col>
            )
    }
}

class Form_ extends ViewContainer {
    render = () => {
        return (
            <Form>
                {this.renderChildren()}
            </Form>
            )
    }
}

class Tabs_ extends ViewContainer {
    render = () => {
        const { TabPane } = Tabs;
        return (
            <Tabs>
                <TabPane tab={`${this.viewObject.get('code')}`}>
                {this.renderChildren()}
                </TabPane>
            </Tabs>
        )
    }
}

class ComponentElement_ extends ViewContainer {
    render = () => {
        if (this.viewObject.eClass.get("name") === "ComponentElement" && this.viewObject.get('component')) {
            return <UserComponent componentClassName={this.viewObject.get('component').get('componentClassName')}/>
        } else return <div></div>
    }
}

class AntdFactory implements ViewFactory {
    name = 'antd';
    components = new Map<string, typeof View>();
    getComponent(){

    }
    constructor() {
        this.components.set('ru.neoflex.nfcore.application#//Div', Div_);
        this.components.set('ru.neoflex.nfcore.application#//Span', Span_);
        this.components.set('ru.neoflex.nfcore.application#//Row', Row_);
        this.components.set('ru.neoflex.nfcore.application#//Column', Col_);
        this.components.set('ru.neoflex.nfcore.application#//ComponentElement', ComponentElement_);
        this.components.set('ru.neoflex.nfcore.application#//Form', Form_);
        this.components.set('ru.neoflex.nfcore.application#//Tabs', Tabs_);
    }

    createView(viewObject: Ecore.EObject, props: any): JSX.Element {
        let Component = this.components.get(viewObject.eClass.eURI());
        if (!Component) {
            Component = View
        }
        return (
            <Component {...props} key={viewObject.get('uri')} viewObject={viewObject} viewFactory={this}/>
        )
    }
}

export default new AntdFactory()
