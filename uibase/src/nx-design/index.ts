import styled from 'styled-components';
import {Typography, Button, Input, DatePicker, Checkbox} from 'antd'

const NXTypography = {
    Text: styled(Typography.Text)`
    font-size: 14px;
    font-weight: ${(props) => (props.light ? '300'
    : props.strong ? '500' 
    : '400')}
`
}

const NXCheckbox = styled(Checkbox)`
    .span {background-color: #424D78;}
`



const NXButton = styled(Button)`
    background: ${(props) => (props.primary ? '#424D78' 
    : props.disabled ? '#B3B3B3'
    : '#FFFFFF')};
    color: ${(props) => (props.primary || props.disabled ? '#FFFFFF'
    : '#424D78')};
    font-size: 12px;
    line-height: 14px;
    border-radius: 4px;
    padding: 9px 32px;
    height: 32px;
    width: auto;
    text-align: center;
    border: ${(props) => (props.primary ? 'none'
    : props.disabled ? 'none'
        : '1px solid #424D78')};
    
    :hover {
    background: ${(props) => (props.primary ? '#2A356C'
    : props.disabled ? "#B3B3B3"
    : '#FFFFFF')};
    color: ${(props) => (props.primary ? 'white'
    : props.disabled ? 'white'
    : '#171D45')};
    border: ${(props) => (props.primary ? 'none'
    : props.disabled ? 'none'
        : '1px solid #171D45')};
    }
    
    :focus {
    background: ${(props) => (props.primary ? '#424D78'
        : props.disabled ? "#B3B3B3"
            : '#FFF8E0')};
    color: ${(props) => (props.primary ? 'white'
    : props.disabled ? 'white'
    : '#090B1F')};
    border: ${(props) => (props.primary ? 'none'
    : props.disabled ? 'none'
        : '1px solid #FFCC66')};
    }
`

const NXInput = {
    Input: styled(Input)`
    background: #FFFFFF;
    border: 1px solid #E6E6E6;
    box-sizing: border-box;
    border-radius: 4px;
    height: 32px;
    width: ${(props) => (props.width ? `${props.width}` : "100%")};
`,
    TextArea: styled(Input.TextArea)`
    background: #FFFFFF;
    border: 1px solid #E6E6E6;
    box-sizing: border-box;
    border-radius: 4px;
    width: ${(props) => (props.width ? `${props.width}` : "100%")};
`
}

const NXDatePicker = styled(DatePicker)`
    width: ${(props) => (props.width ? `${props.width}` : "auto")};
    
`


export {NXButton, NXInput, NXDatePicker, NXTypography, NXCheckbox}