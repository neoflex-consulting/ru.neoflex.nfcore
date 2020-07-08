import React from 'react';
import {NXTable} from '../index';

export default function showCode(e) {
    let code = document&&document.querySelector(`pre#${e.target.id}`)
    if (code.style.display === "none") {
        code.style.display = "inline-block";
    }else{
        code.style.display = "none";
    }
}

export class PropsTab extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            propsArray: this.props.Props,
            bordered: true,
            loading: false,
            size: 'small',
            expandable: 'enable',
            title: undefined,
            showHeader: true,
            scroll: undefined,
            hasData: true,
            tableLayout: 'unset',
            top: 'none',
            ellipsis: false,
            pagination: false,
        }
    }
    render(){
        const columns = [
            {
                title: <div className='table__column_header'>
                    <span style={{width:'100%', textAlign: 'center'}}>Name</span>
                </div>,
                dataIndex: 'name',
            },
            {
                title: <div className='table__column_header'>
                    <span style={{width:'100%', textAlign: 'center'}}>Default</span>
                </div>,
                dataIndex: 'default',
            },
            {
                title: <div className='table__column_header'>
                    <span style={{width:'100%', textAlign: 'center'}}>Description</span>
                </div>,
                dataIndex: 'description'}]

                return <div>
                <h2 className="title">API:</h2>
                <NXTable columns={columns} dataSource={this.state.propsArray} size="middle" fixed {...this.state} />
                </div>
}
}
