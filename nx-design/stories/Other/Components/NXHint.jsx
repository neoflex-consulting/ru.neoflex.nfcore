import React,{Component} from 'react';
import { Tooltip } from 'antd';
import styled from 'styled-components';

    const StyledNXHint = styled(Tooltip)`
`
export default class NXHint extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <StyledNXHint placement="bottomLeft" {...this.props}></StyledNXHint>
        );
    }
}



