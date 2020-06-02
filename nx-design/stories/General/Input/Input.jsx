import React from "react";
import {Checkbox, Input, Radio, DatePicker, Select} from "antd";
import styled from 'styled-components'


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
`

const NXCheckbox = styled(Checkbox)`
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
    width: 250px;
`

const {Option} = Select
const NXOption = styled(Option)`
`

export {NXInput, NXCheckbox, NXTextArea, NXRadio, NXDatePicker, NXSelect, NXOption}
