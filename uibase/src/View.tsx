import * as React from "react";
import Ecore from "ecore";

export class View extends React.Component<any, any> {
    protected viewObject: Ecore.EObject
    protected viewFactory: ViewFactory

    constructor(props: any) {
        super(props)
        this.viewObject = props.viewObject
        this.viewFactory = props.viewFactory
    }

    render = () => {
        return <span>{this.viewObject.eClass.eURI()}</span>
    }
}

export interface ViewFactory {
    createView(viewObject: Ecore.EObject, props: any): JSX.Element;
    name: string;
}

