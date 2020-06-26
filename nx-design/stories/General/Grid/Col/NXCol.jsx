import React, {Component} from 'react';
import {Col} from 'antd';
import styled from 'styled-components'

export default class NXCol extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const StyledCol = styled(Col)`
        display: flex;
        align-items: center;
        justify-content: ${(props) => (props.content==='center' ? 'center'
            : props.content==='flex-start' ? 'flex-start'
                : props.content==='flex-end' ? 'flex-end'
                    : props.content==='space-around' ? 'space-around'
                        : props.content==='space-between' ? 'space-between'
                            : 'flex-start')};
        margin: ${(props) => (props.margin ? `${props.margin}` : "")};
        `
        return (
            <StyledCol {...this.props} />
        );
    }
}
