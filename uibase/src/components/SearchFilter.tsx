import * as React from "react";
import {Button, Form, Input, Table} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {withTranslation, WithTranslation} from "react-i18next";

interface Props {
    onName: any;
    onTitle: any;
    tableData: Array<any>;
    tableDataFilter: (tableDataFilter: Array<any>) => void;
}

interface State {
    selectedRowKeys: any[];
    searchText: string;
    selectedKeys: any[];
}

class SearchFilter extends React.Component<Props & FormComponentProps & WithTranslation, State> {
    state = {
        selectedRowKeys: [],
        searchText: '',
        selectedKeys: []
    };

    sortColumns = (a: any, b: any, name: string, type: string): number => {
        if (b !== undefined) {
            if (type === "stringType") {
                if (a[name] !== undefined && b[name] !== undefined) {
                    if (a[name].toLowerCase() < b[name].toLowerCase()) return -1;
                    else if(a[name].toLowerCase() > b[name].toLowerCase()) return 1;
                    else return 0;
                }
                else if (a[name] === undefined && b[name] !== undefined) return -1;
                else if (a[name] !== undefined && b[name] === undefined) return 1;
                else return 0;
            }
            else if (type === "numberType") {
                if (a[name] !== undefined && b[name] !== undefined) { return a[name] - b[name] }
                else if (a[name] === undefined && b[name] !== undefined) return -1;
                else if (a[name] !== undefined && b[name] === undefined) return 1;
                else return 0;
            }
            else if (type === "dateType") return 0;
            else return 0;
        } else return 0;
    };

    filterDataSource = (name: string, searchText: string): Array<any> => {
        const result: Array<any> = [];
        for (let td of this.props.tableData){
            let tdName: string = td[name];
                if (searchText === "" || searchText === undefined) {
                    if (result.every((value) => value[name] !== tdName))
                    {result.push(td)}
                }
                else if (tdName.toLowerCase().includes(searchText.toLowerCase()) && result.every((value) =>
                        value[name] !== tdName))
                {result.push(td)}
        }
        result.sort((a: any, b: any) => this.sortColumns(a, b, name, "stringType"));
        return result
    };

    setSelectedKeys = (selectedKeys: any) => {
        this.setState({ selectedKeys, selectedRowKeys: [] });
    };

    onSelectChange = (selectedRowKeys: any) => {
        this.setState({ selectedRowKeys });
    };

    handleSearchFilterDropdown = (selectedKeys: string[]) => {
        this.setState({ searchText: selectedKeys[0] });
        let temp: Array<any> = this.state.selectedRowKeys.map(i=> this.props.tableData[i][this.props.onName]);
        const result: Array<any> = [];
        for (let td of this.props.tableData){
            if (temp.includes(td[this.props.onName])) {
                result.push(td)
            }
        }
        if (this.props.tableDataFilter) {this.props.tableDataFilter(result)}
    };

    render() {
        const {t} = this.props;
        const columnsT = t(this.props.onTitle, {ns: 'packages'});
            const {selectedRowKeys} = this.state;
            const rowSelection = {
                selectedRowKeys,
                onChange: this.onSelectChange
            };
            return (
                <Form style={{ padding: 9 }} >
                    <Input
                        placeholder={`${t('search')} ${columnsT}`}
                        value={this.state.selectedKeys[0]}
                        onChange={e => this.setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => this.handleSearchFilterDropdown(this.state.selectedKeys)}
                        style={{ width: 188, marginBottom: 8, display: "block"}}
                        defaultChecked={true}
                        allowClear={true}
                    />
                    <Table
                        size={"small"}
                        style={{whiteSpace: "pre", maxWidth: "300px", maxHeight: "400px", marginTop: "15px" }}
                        scroll={{x: 200}}
                        columns={[{title: columnsT, dataIndex: this.props.onName, key: this.props.onName}]}
                        dataSource={this.filterDataSource(this.props.onName, this.state.selectedKeys[0])}
                        rowSelection={rowSelection}
                        pagination={false}
                    />
                    <Button
                        type="primary"
                        onClick={() => this.handleSearchFilterDropdown(this.state.selectedKeys)}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8, marginTop: 15 }}
                    />
                    <Button
                        onClick={() => {
                            this.setState({selectedKeys: [], selectedRowKeys: []});
                            if (this.props.tableDataFilter) {
                                this.props.tableDataFilter(this.props.tableData);
                            }
                        }}
                        size="small"
                        style={{ width: 90 }}
                        icon="rest"
                    />
                </Form>
            );
        }}

const WrappedSearchFilter = Form.create<Props & FormComponentProps & WithTranslation>()(SearchFilter);
const SearchFilterTrans = withTranslation()(WrappedSearchFilter);
export default SearchFilterTrans;
