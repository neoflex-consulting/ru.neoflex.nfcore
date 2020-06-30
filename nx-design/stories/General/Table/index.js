import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import Table from "./NXTable";
import showCode from "../../../utils/helpers";

export default class TablesPage extends Component {
    render() {
        return (
            <Fragment>
                <h1 className="title">Таблицы</h1>

                <h2 className="title">Примеры:</h2>
                <section className="example">
                    <div>
                        <Table />
                    </div>
                    <div className='showCode'>
                        <button id='table' onClick={showCode}>Show Code</button>
                    <SyntaxHighlighter id='table' language='jsx' style={okaidia}>
                        {`import React from "react";
import {table, tableUp, NXIcon, NXTable, more} from 'nx-design';

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
                title: <NXIcon sm margin='0' icon={more} />,
                dataIndex: 'Column_7',
            }
        ];

        const data = [];
        for (let i = 1; i <= 10; i++) {
            data.push({
                key: i,
                Column_1: Row${`i`}
            });
        }

        return (
            <>
                    <NXTable columns={columns} dataSource={data} size="middle" {...this.state} />
            </>
        );
    }
}
`}
                    </SyntaxHighlighter>
                    </div>
                </section>
            </Fragment>
        );
    }
}

