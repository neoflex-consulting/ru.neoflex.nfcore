import styled from 'styled-components';
import {Typography, Button, Input, DatePicker} from 'antd'

const NXTypography = {
    Text: styled(Typography.Text)`
    font-size: 14px;
    font-weight: ${(props) => {
        return props.strong && '500'
        return props.light && '300'
        return '400'
    }
    }
`
}

const NXButton = styled(Button)`
    background: ${(props) => {
        return props.primary && '#424D78';
        return props.disabled && "#B3B3B3";
        return 'white'}};
    color: ${(props) => {
        return props.primary && "white";
        return props.disabled && 'white';
        return "#424D78"}};
    font-size: 12px;
    line-height: 14px;
    border-radius: 4px;
    border: 1px solid #293468;
    padding: 9px 32px;
    height: 32px;
    width: auto;
    text-align: center;
    
    :hover {
    background: ${(props) => {
        return props.primary && "#424D78";
        return props.disabled && '#B3B3B3'
        return "white"}};
    color: ${(props) => {
        return props.primary && "white";
        return props.disabled && 'white';
        return "#424D78"}};
    border: 1px solid #293468;
    }
    
    :focus {
    background: ${(props) => {
        return props.primary && "#424D78";
        return props.disabled && '#B3B3B3'
        return "white"}};
    color: ${(props) => {
        return props.primary && "white";
        return props.disabled && 'white';
        return "#424D78"}};
    border: 1px solid #293468;
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


export {NXButton, NXInput, NXDatePicker, NXTypography}