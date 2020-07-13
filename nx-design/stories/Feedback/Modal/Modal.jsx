import React, {Component} from 'react';
import styled from "styled-components";
import {Modal} from "antd";
import {NXButton, NXIcon, info, success} from "../../../index";

export class NXModal extends Component {
    state = { visible: false };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.setState({
            visible: false,
        });
    };

    handleCancel = () => {
        this.setState({
            visible: false,
        });
    };
    render() {
const StyledNXModal = styled(Modal)`
.ant-modal-content{
border-radius: 4px;
width: ${(props) => (props.width ? `${props.width}` : '430px')};;
}

.ant-modal-content .ant-modal-close{
display: none
}

.ant-modal-header{
padding: 24px 24px 16px;
border: none;
}

.ant-modal-title{
color: #2A356C;
}

.ant-modal-body{
padding: 0 24px;
font-size: 12px;
}

.ant-modal-footer{
border: none;
padding: 10px 16px 20px;
text-align: center;
}
`
        return (
            <div>
                <NXButton type="primary" onClick={this.showModal}>
                    Open Modal
                </NXButton>
                <StyledNXModal
                    title={this.props.info || this.props.success || this.props.error ? <div style={{width: '100%', display:'flex', alignItems:'center', flexDirection:'column'}}>
                            {this.props.info && <NXIcon width='64px' fill='#424D78' icon={info} margin='0 0 24px' noPoint />}
                            {this.props.success && <NXIcon width='64px' fill='#27677C' icon={success} margin='0 0 24px' noPoint />}
                            {this.props.error && <NXIcon width='64px' fill='#AD1457' icon={info} margin='0 0 24px' noPoint />}
                            {this.props.title}
                        </div>
                        : this.props.title}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    footer={this.props.info || this.props.success || this.props.error ? <>
                            <NXButton margin='16px 0 0 0' width='87px' primary onClick={this.handleOk}>OK</NXButton>
                        </>
                        :
                        <div style={{width: '100%', display:'flex', justifyContent:'flex-end', marginTop:'16px'}}>
                         <NXButton width='87px' padding='0' onClick={this.handleCancel}>Close</NXButton>
                         <NXButton width='87px' primary onClick={this.handleOk}>OK</NXButton>
                        </div>}
                >
                    {this.props.info || this.props.success || this.props.error ? <div style={{width: '100%', display:'flex', alignItems:'center', flexDirection:'column'}}>
                            {this.props.content}
                        </div>
                        : this.props.content}
                </StyledNXModal>
            </div>
        );
    }
}

