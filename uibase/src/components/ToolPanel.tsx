import React from 'react';
import { Layout } from 'antd'

interface Props{
    children: Array<React.ReactNode>
}

class ToolPanel extends React.Component<Props, any>{
    render(){
        return(
            <Layout.Header className="head-panel">
                {this.props.children && [...this.props.children]}
            </Layout.Header>
        )
    }
}

export default ToolPanel;