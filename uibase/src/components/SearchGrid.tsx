import * as React from "react";
import {Button, Form, Icon, Table} from 'antd';
import Ecore from "ecore";
import {API} from "../modules/api";
import {Link} from "react-router-dom";
import forEach from "lodash/forEach"
import {FormComponentProps} from "antd/lib/form";
import DataSearchTrans from "./DataSearch";
import SearchFilterTrans from "./SearchFilter";
import {withTranslation, WithTranslation} from "react-i18next";

interface Props {
    onSelect?: (resources: Ecore.Resource[]) => void;
    showAction: boolean;
    specialEClass: Ecore.EClass | undefined;
}

interface State {
    resources: Ecore.Resource[];
    columns: Array<any>;
    tableData: Array<any>;
    tableDataFilter: Array<any>;
    notFoundActivator: boolean;
    result: string;
    selectedRowKeys: any[];
}

class SearchGrid extends React.Component<Props & FormComponentProps & WithTranslation, State> {
    private refDataSearchRef: any = React.createRef();

    state = {
        resources: [],
        columns: [],
        tableData: [],
        tableDataFilter: [],
        notFoundActivator: false,
        result: '',
        selectedRowKeys: []
    };

    handleSearch = (resources : Ecore.Resource[]): void => {
        this.setState({selectedRowKeys: []});
        const tableData:Array<any> = this.prepareTableData(resources);
        this.setState({ tableData: tableData });
        const columns:Array<Ecore.EStructuralFeature> = resources.length > 0 ? this.prepareColumns(resources): [];
        this.setState({ resources: resources, columns: columns});
        this.setState({notFoundActivator: true});
        this.setState({tableDataFilter: []});
    };

    prepareColumns(resources:Ecore.Resource[]):Array<Ecore.EStructuralFeature>{
        const AllFeatures:Array<Ecore.EStructuralFeature> = [];
        resources.forEach((res:Ecore.Resource) => {
            const attrs:Array<Ecore.EStructuralFeature> = res.get('contents').first().eClass.get('eAllStructuralFeatures');
            for (let attr of attrs){
                if (AllFeatures.every((value)=>value.get('name') !== attr.get('name'))) {
                    AllFeatures.push(attr);
                }
            }
        });

        let name: string = 'eClass';
        let title: string = 'application.eClasses.EClassView.eStructuralFeatures.eClass.caption';
        let type: string = 'stringType';
        let AllColumns:Array<any> = [{title: title, dataIndex: name, key: name, type: name,
            sorter: (a: any, b: any) => this.sortColumns(a, b, name, type),
            ...this.getColumnSearchProps(name, title),
            filterIcon: (filtered: any) => (
                <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
            onFilter: (value: any, record: any) => record.eClass.toLowerCase() === value.toLowerCase(),
        }];

        for (let column of AllFeatures){
            let name: string = "";
            let title: string = "";
            column.get('name') === "children" ? name = "_children" :
                name = column.get('name');
            title = column.eContainer.eContainer.get('name') + ".eClasses." + column.eContainer.get('name') + ".eStructuralFeatures." + column.get('name') + ".caption"
            const type: string = !!column.get('eType') && column.get('eType').eClass.get('name') === 'EDataType' ? this.getDataType(column.get('eType').get('name')) : "stringType";
            AllColumns.push({title: title, dataIndex: name, key: name, type: type,
                sorter: (a: any, b: any) => this.sortColumns(a, b, name, type),
                render: (text: any) => {
                if (text !== undefined && !!column.get('eType') && column.get('eType').eClass.get('name') !== 'EDataType') {
                        const maxJsonLength = text.indexOf('#') + 1;
                        return text.slice(0, maxJsonLength) + "..." }
                else {return text}},
                ...this.getColumnSearchProps(name, title),
                filterIcon: (filtered: any) => (
                    <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />
                ),
                onFilter: (value: any, record: any) => record.name !== undefined ?
                    record.name.toString().toLowerCase() === value.toString().toLowerCase() : undefined
            })
        }
        return AllColumns;
    }

    prepareTableData(resources:Ecore.Resource[]): Array<Ecore.EStructuralFeature>{
        const prepared: Array<Ecore.EStructuralFeature> = [];
        resources.forEach((res: Ecore.Resource) => {
            if (res.to().length === undefined) {
                const row = {...res.to(), resource: res};
                if (row.hasOwnProperty("children")) {
                    row["_children"] = row["children"];
                    delete row["children"]
                }
                prepared.push(row);
            }
        });
        prepared.map((res:any, idx) => {
            res["key"] = idx;
            forEach(res, (val,key)=>{
                if (typeof val === "object" && key !== "resource") {
                    res[key] = JSON.stringify(val)
                }
            });
            return res
        });
        return prepared
    }

    getDataType = (type: string): string => {
        const stringType: Array<string> = ["Timestamp", "ByteArray", "Password", "Text", "URL", "QName", "EString", "EBoolean", "EMap", "EDiagnosticChain", "JSObject"];
        const numberType: Array<string> = ["EInt", "EDouble", "EIntegerObject", "EFloatObject", "ELongObject", "EShort", "EFloat", "ELong", "EDoubleObject"];
        const dateType: Array<string> = ["Date", "EDate"];
        if (stringType.includes(type)) return "stringType";
        else if (numberType.includes(type)) return "numberType";
        else if (dateType.includes(type)) return "dateType";
        else return "hi, i don`t know this type"
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

    handleSelect = () => {
        if (this.props.onSelect) {
            this.props.onSelect(
                this.state.selectedRowKeys.map(i=>this.state.resources[i])
            );
        }
    };

    handleDeleteResource = (event:any, record:any) => {
        const ref:string = `${record.resource.get('uri')}?ref=${record.resource.rev}`;
        ref && API.instance().deleteResource(ref).then((response) => {
            if (response.result === "ok") {
                this.refDataSearchRef.refresh();
            }
        });
        event.preventDefault()
    };

    onSelectChange = (selectedRowKeys: any) => {
        this.setState({ selectedRowKeys });
    };

    filteredData = () => {
        if (this.state.tableDataFilter.length === 0) {
            return this.state.tableData
        } else {
            return this.state.tableDataFilter
        }
    };

    //for FilterMenu
    getColumnSearchProps = (name: any, title: any) => ({
        filterDropdown: () =>
                <SearchFilterTrans onName={name} onTitle={title} tableData={this.filteredData()}
                                     tableDataFilter={this.changeTableData}/>
    });

    changeTableData = (tableDataFilter: Array<any>) => {
        this.setState({tableDataFilter})
    };


    render() {
        const {t} = this.props;
        const columnsT = this.state.columns.map( (c: any) =>(
            {...c, title: t(c.title, {ns: 'packages'})}
        )) ;
            const actionColumnDef = [{
                title: t('action'),
                dataIndex: 'action',
                key: 'action',
                fixed: 'right',
                width: 100,
                render: (text:string, record:any) => {
                    const editButton = <Link key={`edit${record.key}`} to={`/settings/data/${record.resource.get('uri')}/${record.resource.rev}`}>
                        <span id="edit">{t('edit')}</span>
                    </Link>;
                    const deleteButton = <span id="delete" key={`delete${record.key}`} style={{ marginLeft: 8 }} onClick={(e:any)=>this.handleDeleteResource(e, record)}>{t('delete')}</span>;
                    return [editButton, deleteButton]
                }
            }];
            const {selectedRowKeys} = this.state;
            const rowSelection = {
                selectedRowKeys,
                onChange: this.onSelectChange
            };
            const hasSelected = selectedRowKeys.length > 0;

            return (
             <div style={{padding: '20px'}}>
                 <div>
                     <DataSearchTrans onSearch={this.handleSearch}
                                        specialEClass={this.props.specialEClass}
                                        wrappedComponentRef={(inst: any) => this.refDataSearchRef = inst}

                     />
                 </div>
                 <div>

                     {this.state.resources.length === 0
                         ?
                         !this.state.notFoundActivator ? '' : t('notfound')
                         :
                         this.props.onSelect !== undefined
                             ?
                             <div>
                                 <div>
                                     <Button type="primary" onClick={this.handleSelect} disabled={!hasSelected} style={{width: '100px', fontSize: '17px', marginBottom: '15px'}}>
                                         <Icon type="select" />
                                    </Button>
                                 </div>
                                 <Table
                                     scroll={{x: 1300}}
                                     columns={this.props.showAction ? columnsT.concat(actionColumnDef) : columnsT}
                                     dataSource={this.filteredData()}
                                     bordered={true}
                                     rowSelection={rowSelection}
                                     style={{whiteSpace: "pre"}}
                                 />
                             </div>
                             :
                             <Table
                                 scroll={{x: 1300}}
                                 columns={this.props.showAction ? columnsT.concat(actionColumnDef) : columnsT}
                                 dataSource={this.filteredData()}
                                 bordered={true}
                                 style={{whiteSpace: "pre"}}
                             />
                     }
                 </div>
             </div>
            );
        }}

const WrappedSearchGrid = Form.create<Props & FormComponentProps & WithTranslation>()(SearchGrid);
const SearchGridTrans = withTranslation()(WrappedSearchGrid);
export default SearchGridTrans;
