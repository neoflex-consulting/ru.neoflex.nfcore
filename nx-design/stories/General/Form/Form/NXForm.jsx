import React, {Component} from 'react';
import {Form} from 'antd';
import styled from 'styled-components';

export default class NXForm extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const StyledForm = styled(Form)`
        width: ${(props) => (props.width ? `${props.width}` : "auto")};
        `

        return (
            <StyledForm {...this.props}></StyledForm>
    )
    }
}
