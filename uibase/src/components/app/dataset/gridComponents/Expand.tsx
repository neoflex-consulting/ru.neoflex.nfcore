import React from 'react';
import {ReactComponent as ExpandIcon} from './../../../../icons/expandIcon.svg'
import {ReactComponent as CollapseIcon} from './../../../../icons/collapseIcon.svg'
//CSS
import './../../../../styles/MetaBrowser.css';

interface Props {
    node: any;
    getValue: ()=>string,
    data: {[key: string]: any}
}

interface State {
}

export default class Expand extends React.Component<Props, State> {

    getExpandButton = () => {
        return <button className={"meta-browser-button"}
            onClick={() => {
                this.props.data.show(true);
            }}
            style={{color: 'rgb(151, 151, 151)'}}
        >
            <ExpandIcon/>
        </button>
    };

    getCollapseButton = () => {
        return <button className={"meta-browser-button"}
            onClick={() => {
                this.props.data.hide(true);
            }}
            style={{color: 'rgb(151, 151, 151)'}}
        >
            <CollapseIcon/>
        </button>
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