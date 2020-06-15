import React from 'react';
// import React from 'react';
// import { Button } from 'antd';
import styled from 'styled-components';
//
//
// class NXButton extends React.Component {
//     constructor(props) {
//         super(props);
//     }
//     render() {
        const StyledNXButton = styled.button`
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
//         return (<Button></Button>
//         <StyledNXButton {...this.props}>{this.props.children}</StyledNXButton>
//         )
//     }
// }
// export {NXButton}


export const NXButton = ({children}) => <StyledNXButton>{children}</StyledNXButton>;