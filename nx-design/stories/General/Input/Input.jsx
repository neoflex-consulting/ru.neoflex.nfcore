import React from "react";
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
    .ant-calendar-picker-icon{
    content: url(${calendar});
}
`

const NXSelect = styled(Select)`
    border: 1px solid #2A356C;
    box-sizing: border-box;
    border-radius: 4px;
    width: 250px;
`

const {Option} = Select
const NXOption = styled(Option)`
`

export {NXInput, NXCheckbox, NXTextArea, NXRadio, NXDatePicker, NXSelect, NXOption}
