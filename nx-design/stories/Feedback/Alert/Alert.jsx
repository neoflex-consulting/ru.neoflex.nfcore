import React from "react";
import {Alert} from "antd";
import styled from 'styled-components';
import alert from '../../../icons/alert.svg';

export const NXAlert = {
  small: styled(Alert)`
  display: flex !important;
  width: 233px;
  height: 56px !important;
  padding: 16px 32px !important;
  box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
  background: #FFFFFF;
  border: none;

  span{
  display: flex;
  height: 24px;
  align-items: center;
  font-weight: 500;
  line-height: 16px;
  font-size: 14px;
  }

  ::before {
  content: url(${alert});
  height: 24px;
  margin-right: 14px;
}
`,
  // error: styled(Alert)`
  // `,
  // info: styled(Alert)`
  // `,
  // warning:styled(Alert)`
  // `,
  // success:styled(Alert)`
  // `,

}
