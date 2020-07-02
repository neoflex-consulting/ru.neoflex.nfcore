import React from "react";
import {Alert} from "antd";
import styled from 'styled-components';
import alert from '../../../icons/alert/alert.svg';

export const NXAlert = {
  small: styled(Alert)`
  display: flex !important;
  width: ${(props) => (props.width ? `${props.width}` : '233px')};
  height: 56px !important;
  padding: 16px 32px !important;
  box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.1);
  background: #FFFFFF;
  border: none;
  justify-content: center;
  
  .ant-alert-message {

    color: #8C8C8C;
    display: flex;
    height: 24px;
    align-items: center;
    font-weight: 500;
    line-height: 16px;
    font-size: 14px;

      ::before {
      content: url(${alert});
      height: 24px;
      margin-right: 14px
      }
}
`,
  error: styled(Alert)`
    min-height: 80px;
    width: ${(props) => (props.width ? `${props.width}` : '370px')};
    background: #FFFFFF;
    border: 1px solid #D47F9B;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 16px;
    font-size: 14px;

    .ant-alert-close-icon{
    margin-right: 0px !important;
    right: 16px;
    top: 16px !important;
    }
    
    .ant-alert-description{
    color: #8C8C8C;
    }
    
    .ant-alert-message {
    color: #8C8C8C;
    display: flex;
    height: 24px;
    align-items: center;
    font-weight: 500;
    line-height: 19px;
    font-size: 16px;

      ::before {
      content: url('data:image/svg+xml;utf8, <svg width="20" height="20" viewBox="0 0 24 24" fill="rgb(186,52,106)" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.47254 2 2 6.47293 2 12C2 17.5275 6.47293 22 12 22C17.5275 22 22 17.5271 22 12C22 6.47254 17.5271 2 12 2ZM12 20.4375C7.33621 20.4375 3.5625 16.6635 3.5625 12C3.5625 7.33621 7.33652 3.5625 12 3.5625C16.6638 3.5625 20.4375 7.33652 20.4375 12C20.4375 16.6638 16.6635 20.4375 12 20.4375Z" fill="rgb(186,52,106)"/>
<path d="M12 7.03418C11.5685 7.03418 11.2188 7.38395 11.2188 7.81543V12.8464C11.2188 13.2779 11.5685 13.6277 12 13.6277C12.4315 13.6277 12.7812 13.2779 12.7812 12.8464V7.81543C12.7812 7.38395 12.4315 7.03418 12 7.03418Z" fill="rgb(186,52,106)"/>
<path d="M12 16.6938C12.5825 16.6938 13.0547 16.2216 13.0547 15.6392C13.0547 15.0567 12.5825 14.5845 12 14.5845C11.4175 14.5845 10.9453 15.0567 10.9453 15.6392C10.9453 16.2216 11.4175 16.6938 12 16.6938Z" fill="rgb(186,52,106)"/>
</svg>');
      height: 20px;
      width: auto;
      margin-right: 10px
      }
}
`,
  info: styled(Alert)`
  min-height: 80px;
    width: ${(props) => (props.width ? `${props.width}` : '370px')};
    background: #FFFFFF;
    border: 1px solid #424D78;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 16px;
    font-size: 14px;

    .ant-alert-close-icon{
    margin-right: 0px !important;
    right: 16px;
    top: 16px !important;
    }
    
    .ant-alert-description{
    color: #8C8C8C;
    }
    
    .ant-alert-message {
    color: #8C8C8C;
    display: flex;
    height: 24px;
    align-items: center;
    font-weight: 500;
    line-height: 19px;
    font-size: 16px;

      ::before {
      content: url('data:image/svg+xml;utf8, <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C17.5275 2 22 6.47293 22 12C22 17.5275 17.5271 22 12 22C6.47254 22 2 17.5271 2 12C2 6.47254 6.47297 2 12 2ZM12 20.4375C16.6638 20.4375 20.4375 16.6635 20.4375 12C20.4375 7.33621 16.6635 3.5625 12 3.5625C7.33621 3.5625 3.5625 7.33652 3.5625 12C3.5625 16.6638 7.33656 20.4375 12 20.4375Z" fill="rgb(66,77,120)"/>
<path d="M12 10.3721C12.4315 10.3721 12.7812 10.7218 12.7812 11.1533V16.1843C12.7812 16.6158 12.4315 16.9655 12 16.9655C11.5685 16.9655 11.2188 16.6157 11.2188 16.1843V11.1533C11.2188 10.7218 11.5685 10.3721 12 10.3721Z" fill="rgb(66,77,120)"/>
<path d="M12 9.41553C11.4175 9.41553 10.9453 8.94333 10.9453 8.36084C10.9453 7.77835 11.4175 7.30615 12 7.30615C12.5825 7.30615 13.0547 7.77835 13.0547 8.36084C13.0547 8.94333 12.5825 9.41553 12 9.41553Z" fill="rgb(66,77,120)"/>
</svg>');
      height: 20px;
      width: auto;
      margin-right: 10px
      }
}
  `,
  warning:styled(Alert)`
    min-height: 80px;
    width: ${(props) => (props.width ? `${props.width}` : '370px')};
    background: #FFFFFF;
    border: 1px solid #FFCC66;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 16px;
    font-size: 14px;
    
    .ant-alert-close-icon{
    margin-right: 0px !important;
    right: 16px;
    top: 16px !important;
    }
    
    .ant-alert-description{
    color: #8C8C8C;
    }
    
    .ant-alert-message {
    color: #8C8C8C;
    display: flex;
    height: 24px;
    align-items: center;
    font-weight: 500;
    line-height: 19px;
    font-size: 16px;

      ::before {
      content: url('data:image/svg+xml;utf8, <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C17.5275 2 22 6.47293 22 12C22 17.5275 17.5271 22 12 22C6.47254 22 2 17.5271 2 12C2 6.47254 6.47297 2 12 2ZM12 20.4375C16.6638 20.4375 20.4375 16.6635 20.4375 12C20.4375 7.33621 16.6635 3.5625 12 3.5625C7.33621 3.5625 3.5625 7.33652 3.5625 12C3.5625 16.6638 7.33656 20.4375 12 20.4375Z" fill="rgb(217,165,76)"/>
<path d="M12 10.3721C12.4315 10.3721 12.7812 10.7218 12.7812 11.1533V16.1843C12.7812 16.6158 12.4315 16.9655 12 16.9655C11.5685 16.9655 11.2188 16.6157 11.2188 16.1843V11.1533C11.2188 10.7218 11.5685 10.3721 12 10.3721Z" fill="rgb(217,165,76)"/>
<path d="M12 9.41553C11.4175 9.41553 10.9453 8.94333 10.9453 8.36084C10.9453 7.77835 11.4175 7.30615 12 7.30615C12.5825 7.30615 13.0547 7.77835 13.0547 8.36084C13.0547 8.94333 12.5825 9.41553 12 9.41553Z" fill="rgb(217,165,76)"/>
</svg>');
      height: 20px;
      width: auto;
      margin-right: 10px
      }
}
  `,
  success: styled(Alert)`
    min-height: 80px;
    width: ${(props) => (props.width ? `${props.width}` : '370px')};
    background: #FFFFFF;
    border: 1px solid #417A8A;
    box-sizing: border-box;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 16px;
    font-size: 14px;
    
    .ant-alert-close-icon{
    margin-right: 0px !important;
    right: 16px;
    top: 16px !important;
    }

    .ant-alert-description{
    color: #8C8C8C;
    }

    .ant-alert-message {
    color: #8C8C8C;
    display: flex;
    height: 24px;
    align-items: center;
    font-weight: 500;
    line-height: 19px;
    font-size: 16px;

      ::before {
      content: url('data:image/svg+xml;utf8, <svg width="20" height="20" viewBox="2 2 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="rgb(65,122,138)"/>
<path d="M11.2624 17.7895L6.21094 13.9359L7.64725 12.1309L10.7492 14.4973L15.8688 7.26318L17.7899 8.56635L11.2624 17.7895Z" fill="white"/>
</svg>');
      height: 20px;
      width: auto;
      margin-right: 10px
      }
}
`
}
