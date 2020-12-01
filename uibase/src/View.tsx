import * as React from "react";
import Ecore from "ecore";

export class Component extends React.Component<any, any> {
    protected viewObject: Ecore.EObject;
    protected viewFactory: ViewFactory;

    constructor(props: any) {
        super(props);
        this.viewObject = props.viewObject;
        this.viewFactory = props.viewFactory;
    }
}

export class View extends Component {
    render = () => {
        return <span>{this.viewObject.eClass.eURI()}</span>
    }
}

export interface ViewFactory {
    createView(viewObject: Ecore.EObject, props: any, ref?: any): JSX.Element;
    name: string;
}

