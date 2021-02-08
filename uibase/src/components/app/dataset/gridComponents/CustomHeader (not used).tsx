import React, { Component } from 'react';
import {IHeaderParams} from "ag-grid-community";
import {IHeaderReactComp} from "ag-grid-react";
import {ViewRegistry} from "../../../../ViewRegistry";
import Ecore from "ecore";


interface Props extends IHeaderReactComp,IHeaderParams  {
    viewObject: Ecore.EObject,
    appContext: any,
}

export default class CustomHeaderNotUsed extends Component<Props, any> {
    private viewFactory = ViewRegistry.INSTANCE.get('antd');
    constructor(props: Readonly<Props>) {
        super(props);

        this.state = {
            ascSort: 'inactive',
            descSort: 'inactive',
            noSort: 'inactive',
        };

        props.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
    }

    componentDidMount() {
        this.onSortChanged();
    }

    render() {
        let menu = null;
        let sort = null;
        return (
            <div>
                {menu}
            {this.viewFactory.createView(this.props.viewObject, {context: this.props.appContext})}
        {sort}
        </div>
    );
    }

    onSortChanged() {
        this.setState({
            ascSort: this.props.column.isSortAscending() ? 'active' : 'inactive',
            descSort: this.props.column.isSortDescending() ? 'active' : 'inactive',
            noSort:
                !this.props.column.isSortAscending() &&
                !this.props.column.isSortDescending()
                    ? 'active'
                    : 'inactive',
        });
    }
}
