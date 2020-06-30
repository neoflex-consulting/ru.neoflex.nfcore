import React, {Component} from 'react';
import {Row} from 'antd';
import styled from 'styled-components'

export default class NXRow extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const StyledRow = styled(Row)`
        display: flex;
        align-items: center;
        justify-content: ${(props) => (props.content==='center' ? 'center'
                : props.content==='flex-start' ? 'flex-start'
                    : props.content==='flex-end' ? 'flex-end'
                        : props.content==='space-around' ? 'space-around'
                            : props.content==='space-between' ? 'space-between'
                                : 'flex-start')};
        margin: ${(props) => (props.margin ? `${props.margin}` : "")};
        padding: ${(props) => (props.padding ? `${props.padding}` : "")};
        height: ${(props) => (props.height ? `${props.height}` : "auto")};
        width: ${(props) => (props.width ? `${props.width}` : "auto")};
        background-color: ${(props) => (props.color ? `${props.color}` : "")}
        `
        return (
            <StyledRow {...this.props} />
        );
    }
}