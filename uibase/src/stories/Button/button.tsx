import styled from 'styled-components';
import { Button } from 'antd'

export const NXButton = styled(Button)`
    background: ${(props) => (props.primary ? '#424D78'
    : props.secondary ? 'white'
        : props.disabled ? "#B3B3B3"
            : '#424D78')};
    color: ${(props) => (props.primary ? 'white'
    : props.secondary ? '#424D78'
        : props.disabled ? 'white'
            : 'white')};
    font-size: 12px;
    line-height: 14px;
    border-radius: 4px;
    border: 1px solid #293468;
    padding: 9px 32px;
    height: 32px;
    width: auto;
    text-align: center;
    
    :hover {
    background: ${(props) => (props.primary ? '#424D78'
    : props.secondary ? 'white'
        : props.disabled ? "#B3B3B3"
            : '#424D78')};
    color: ${(props) => (props.primary ? 'white'
    : props.secondary ? '#424D78'
        : props.disabled ? 'white'
            : 'white')};
    border: 1px solid #293468;
    box-shadow: 0px 0px 3px black;
    }
    
    :focus {
    background: ${(props) => (props.primary ? '#424D78'
    : props.secondary ? 'white'
        : props.disabled ? "#B3B3B3"
            : '#424D78')};
    color: ${(props) => (props.primary ? 'white'
    : props.secondary ? '#424D78'
        : props.disabled ? 'white'
            : 'white')};
    border: 1px solid #293468;
    }
`