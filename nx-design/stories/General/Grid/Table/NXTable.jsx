import React from "react";
import {NXTable}  from '../../../../index';
import styled from 'styled-components'

const columns = [
    {
        title: 'Column_1',
        dataIndex: 'Column_1',
    },
    {
        title: 'Column_2',
        dataIndex: 'Column_2',
        sorter: (a, b) => a.age - b.age,
    },
    {
        title: 'Column_3',
        dataIndex: 'Column_3',
        filters: [
            {
                text: 'London',
                value: 'London',
            },
            {
                text: 'New York',
                value: 'New York',
            },
        ],
        onFilter: (value, record) => record.address.indexOf(value) === 0,
    },
    {
        title: 'Column_4',
        key: 'Column_4',
        sorter: true,
        render: () => (
            <span>
        <a style={{ marginRight: 16 }}>Delete</a>
        <a className="ant-dropdown-link">
         fgdfg
        </a>
      </span>
        ),
    },
    {
        title: 'Column_5',
        dataIndex: 'Column_5',
    },
    {
        title: 'Column_6',
        dataIndex: 'Column_6',
    },
    {
        title: 'Column_6',
        dataIndex: 'Column_6',
    }
];

const data = [];
for (let i = 1; i <= 10; i++) {
    data.push({
        key: i,
        Column_1: `Row${i}`,
        Column_2: `Row${i}`,
        Column_3: `Row${i}`,
        Column_4: `Row${i}`,
    });
}


export default class Table extends React.Component {
    state = {
        bordered: true,
        loading: false,
        size: 'small',
        expandable: 'enable',
        title: undefined,
        showHeader: true,
        scroll: undefined,
        hasData: true,
        tableLayout: undefined,
        top: 'none',
        ellipsis: false,
    };

    render() {

        return (
            <>
                    <NXTable columns={columns} dataSource={data} size="middle" {...this.state} />
            </>
        );
    }
}