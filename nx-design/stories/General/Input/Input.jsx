import React, {Component} from 'react';
import {Checkbox, Input, Radio, DatePicker, Select} from "antd";
import styled from 'styled-components';
import calendar from '../../../icons/calendar.svg';

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

export class NXInputClear extends Component {

    render() {
  const StyledNXInputClear = styled(Input)`
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
      return <StyledNXInputClear allowClear {...this.props} />
    }
}


export default class NXInputSearch extends Component {
  render() {
    return (
      <NXInput placeholder={'Поиск'} {...this.props}/>
    )
  }
}

const NXRadio = styled(Radio)`
.ant-radio-inner::after {
  background-color: #2A356C !important;
  width: 12px;
  height: 12px;
}
.ant-radio-inner {
  border: 1px solid #2A356C !important;
  align-items:center;
  width: 20px;
  height: 20px;
}
`
const NXRadioGroup = styled(Radio.Group)`
display: flex;
justify-content: ${(props) => (props.content ? `${props.content}` : "")}
`

const NXRadioButton = styled(Radio.Button)`
    background: #FFFFFF;
    color: #424D78;
    font-size: 12px !important;
    line-height: ${(props) => (props.isIcon ? `${props.isIcon}` : "32px")};
    text-align: center !important;
    align-items: center !important;
    border: 1px solid #424D78;
    border-radius: 4px !important;
    padding: ${(props) => (props.isIcon? '0' : props.padding ? `${props.padding}` : "0 32px")};
    margin: ${(props) => (props.margin ? `${props.margin}` : "")};
    height: ${(props) => (props.isIcon ? `${props.isIcon}` : "32px")};
    width: ${(props) => (props.isIcon ? `${props.isIcon}` : props.width ? props.width : "auto")};
    
    :first-child{
    border: 1px solid #424D78;
    }
    
    ::before{
    display: none !important;
    }
    
    :hover {
    background: #FFFFFF;
    color: #171D45;
    border: 1px solid #171D45;
    box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
    }
   
`

const NXCheckbox = styled(Checkbox)`
 .ant-checkbox-inner{
 height: 20px;
 width: 20px;
 ::after{
 height: 12px;
 width: 8px;
 }
 }
.ant-checkbox-checked .ant-checkbox-inner {
  background-color: white !important;
  border: 2px solid #424D78;
}

.ant-checkbox-wrapper .ant-checkbox-inner,
.ant-checkbox .ant-checkbox-inner,
.ant-checkbox-input:focus + .ant-checkbox-inner {
  border: 2px solid #424D78 !important;
}

.ant-checkbox-checked .ant-checkbox-inner::after {
  border-color: #424D78 !important;
}

.ant-checkbox-checked::after {
  border: 2px solid #424D78 !important;
}
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
    border-radius: 4px;
    .ant-calendar-picker-icon{
    content: url(${calendar});
}
`

const NXSelect = styled(Select)`
    box-sizing: border-box;
    border-radius: 4px;
    margin: auto 0px;
    width: ${(props) => (props.width ? `${props.width}` : "250px")};
div{
border-radius: 4px !important;
}
`

const {Option} = Select
const NXOption = styled(Option)`

`

export {NXInput, NXCheckbox, NXTextArea, NXRadio, NXRadioGroup, NXRadioButton, NXDatePicker, NXSelect, NXOption}
