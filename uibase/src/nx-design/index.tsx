import styled from 'styled-components';
import {Typography, Button, Input, DatePicker, Checkbox, Radio, Select, Alert} from 'antd'

const NXTypography = {
    Text: styled(Typography.Text)`
    font-size: 14px;
    font-weight: ${(props) => (props.light ? '300'
    : props.strong ? '500' 
    : '400')}
`
}

const NXCheckbox = styled(Checkbox)`
`

const NXRadio = styled(Radio)`
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

const NXInput = styled(Input)`
    background: #FFFFFF;
    border: 1px solid #E6E6E6;
    box-sizing: border-box;
    border-radius: 4px;
    height: 32px;
    font-size: 12px;
    line-height: 14px;
    color: #333333;
    width: ${(props) => (props.width ? `${props.width}` : "100%")};
`
const NXTextArea = styled(Input.TextArea)`
    background: #FFFFFF;
    border: 1px solid #E6E6E6;
    box-sizing: border-box;
    border-radius: 4px;
    width: ${(props) => (props.width ? `${props.width}` : "100%")};
`


const NXDatePicker = styled(DatePicker)`
    width: ${(props) => (props.width ? `${props.width}` : "auto")};
    
`

const NXSelect = styled(Select)`
    border: 1px solid #2A356C;
    box-sizing: border-box;
    border-radius: 4px;
`


const NXAlert = styled(Alert)`
    padding: 16px 32px !important;
    width: auto;
    border-radius: 4px;
    background: #FFFFFF;
    box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
    border: none;
    text-align: center;
    font-weight: 500;
    
`

export { NXCheckbox, NXRadio, NXButton, NXInput, NXTextArea, NXDatePicker, NXTypography, NXSelect, NXAlert}