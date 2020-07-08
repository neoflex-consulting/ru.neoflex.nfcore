import React from "react";
import { Table } from 'antd';
import styled from 'styled-components';


       export const NXTable = styled(Table)`
       .ant-table-cell{
       width: ${(props) => (props.fixed ? `${100/props.columns.length}%` : "auto")};
       }
    `
