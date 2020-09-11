import React from 'react';
//CSS
import './../../../../styles/MetaBrowser.css';
import {NeoButton} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";

interface Props {
    node: any;
    getValue: ()=>string,
    data: {[key: string]: any}
}

interface State {
}

export default class Expand extends React.Component<Props, State> {

    getExpandButton = () => {
        return <NeoButton className={"meta-browser-button"}
                          type={'link'}
            onClick={() => {
                this.props.data.show(true);
            }}
            style={{color: 'rgb(151, 151, 151)'}}
        >
            <NeoIcon icon={"arrowDown"}/>
        </NeoButton>
    };

    getCollapseButton = () => {
        return <NeoButton className={"meta-browser-button"}
                          type={'link'}
            onClick={() => {
                this.props.data.hide(true);
            }}
            style={{color: 'rgb(151, 151, 151)'}}
        >
            <NeoIcon icon={"arrowUp"}/>
        </NeoButton>
    };

    render() {
        let className = "";
        if (this.props.data.children) {
            className = "meta-browser-highlighted-text meta-browser-parent-element"
        } else {
            className = "meta-browser-text"
        }
        return (
            <div className={className}>
                <div style={{marginLeft: this.props.data.depth === 0 ? "0px" : "40px"}}
                     data-color={this.props.data.isExpanded ? "yellow" :"blue"}
                     className={className}
                     dangerouslySetInnerHTML={{__html: this.props.getValue()}}/>
                <div>
                {!this.props.data.isExpanded && this.props.data.children
                    ? this.getExpandButton()
                    : this.props.data.isExpanded && this.props.data.children
                        ? this.getCollapseButton()
                        : null}
                </div>
            </div>
        );
    }
}