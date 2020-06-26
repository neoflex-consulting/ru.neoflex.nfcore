import React from "react";
import {table, tableUp, NXIcon, NXTable, more} from '../../../../index';
import './index.css'

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
        pagination: false,
    };

    render() {

        const columns = [
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_1',
            },
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_2',
            },
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_3',
            },
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_4',

            },
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_5',
            },
            {
                title: <div className='table__column_header'>
                    <span>Название колонки</span>
                    <div>
                        <NXIcon sm icon={tableUp} />
                        <NXIcon sm icon={table} />
                    </div>
                </div>,
                dataIndex: 'Column_6',
            },
            {
                title: <NXIcon sm margin='3px auto' icon={more} />,
                dataIndex: 'Column_6',
            }
        ];

        const data = [];
        for (let i = 1; i <= 10; i++) {
            data.push({
                key: i,
                Column_1: `Row${i}`,
            });
        }

        return (
            <>
                    <NXTable columns={columns} dataSource={data} size="middle" {...this.state} />
            </>
        );
    }
}