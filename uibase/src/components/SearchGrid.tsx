import * as React from "react";
import {Button, Form, Select} from 'antd';
import Ecore, {EObject, Resource} from "ecore";
import {API} from "../modules/api";
import {Link} from "react-router-dom";
import forEach from "lodash/forEach"
import {FormComponentProps} from "antd/lib/form";
import DataSearch from "./DataSearch";
import SearchFilter from "./SearchFilter";
import {withTranslation, WithTranslation} from "react-i18next";
import {Helmet} from "react-helmet";
import './../styles/Data.css'
import {NeoButton, NeoDrawer, NeoHint, NeoTable} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import Paginator from "./app/Paginator";
import FormComponentMapper from "./FormComponentMapper";

interface Props {
    onSelect?: (resources: Ecore.Resource[]) => void;
    showAction: boolean;
    specialEClass: Ecore.EClass | undefined;
}

interface State {
    resources: Ecore.Resource[];
    columns: Array<any>;
    tableData: { resource:EObject, name: string, [key:string]: any}[];
    tableDataFilter: Array<any>;
    notFoundActivator: boolean;
    result: string;
    selectedRowKeys: any[];
    filterMenuVisible:any;
    paginationPageSize?: number;
    currentPage?: number;
    possibleTags: Ecore.EObject[];

}

class SearchGrid extends React.Component<Props & FormComponentProps & WithTranslation, State> {
    private refDataSearchRef: any = React.createRef();
    private grid: React.RefObject<any>;

    state = {
        resources: [],
        columns: [],
        tableData: [],
        tableDataFilter: [],
        notFoundActivator: false,
        result: '',
        selectedRowKeys: [],
        filterMenuVisible:false,
        paginationPageSize: 10,
        currentPage: 1,
        possibleTags: [] as Ecore.EObject[],
 }

    componentDidMount(): void {
        API.instance().findClass("tag","Tag").then(tag => {
            API.instance().findByClass(tag, {contents: {eClass: tag.eURI()}}).then(possibleTags => {
                this.setState({
                    possibleTags: possibleTags
                })
            })
        })
    }

    onTagChange = (newTags:string[], objectName: string) => {
        const newEObjectTags = this.state.possibleTags.filter((td:any) => newTags.includes(td.eContents()[0].get('name')));
        const tableData = this.state.tableData.find((td: any) => td.name === objectName) as never as { resource:Resource, name: string, [key:string]: any};
        if (tableData) {
            const changeEObject:EObject = tableData.resource.eContents()[0];
            if (changeEObject) {
                const resource = tableData.resource;
                const resourceList: Ecore.EList = resource.eResource().eContainer.get('resources');
                resource.eContents()[0].get('tags').clear();
                newEObjectTags.forEach(r=>{
                    if (!resourceList.find(rl=>rl.eContents()[0].eURI() === r.eURI())) {
                        resourceList.add(r);
                        const last = resourceList.last();
                        const json = last.eResource().to()
                        last.eResource().clear()
                        last.eResource().parse(json)
                        resource.eContents()[0].get('tags').add(last.eContents()[0])
                    }
                });
                API.instance().saveResource(resource).then(result=>{
                    tableData!.resource = result;
                    this.setState({tableData: this.state.tableData})
                })
            }
        }
    }

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
        let title: string = 'eClass';
        let type: string = 'stringType';
        let AllColumns:Array<any> = [{title: title, dataIndex: name, key: name, type: name,
            sorter: (a: any, b: any) => this.sortColumns(a, b, name, type),
            ...this.getColumnSearchProps(name, title),
            filterIcon: (filtered: any) => (
                <NeoIcon icon={"search"} style={{ color: filtered ? "#1890ff" : undefined }} />
            ),
            onFilter: (value: any, record: any) => record.eClass.toLowerCase() === value.toLowerCase(),
            onFilterDropdownVisibleChange: () => {
                this.state.filterMenuVisible ? this.setState({filterMenuVisible: false})
                    : this.setState({filterMenuVisible: true})
            },
        }];

        for (let column of AllFeatures){
            let name: string = "";
            let title: string = "";
            column.get('name') === "children" ? name = "_children" :
                name = column.get('name');
            title = column.get('name')/*column.eContainer.eContainer.get('name') + ".eClasses." + column.eContainer.get('name') + ".eStructuralFeatures." + column.get('name') + ".caption"*/
            const type: string = !!column.get('eType') && column.get('eType').eClass.get('name') === 'EDataType' ? this.getDataType(column.get('eType').get('name')) : "stringType";
            AllColumns.push({title: title, dataIndex: name, key: name, type: type,
                sorter: column.get('name') !== 'tags' ? (a: any, b: any) => this.sortColumns(a, b, name, type) : undefined,
                render: (text: any) => {
                if (column.get('name') === 'tags' && text.tags) {
                    return FormComponentMapper.getComponent({
                        componentType: "Tag",
                        value: text && text.resource.eContents()[0].get('tags') && text.resource.eContents()[0].get('tags').map((v:EObject)=>v.get('name')),
                        eType: Ecore.ResourceSet.create().create({ uri:"/"}).addAll(this.state.possibleTags.map(tag=>tag.eContents()[0])),
                        idx: "idx",
                        ukey: "key",
                        onChange: (tags:string[])=>this.onTagChange(tags, text.name),
                        edit: true
                    })
                }
                else if (text !== undefined && !!column.get('eType') && column.get('eType').eClass.get('name') !== 'EDataType') {
                        const maxJsonLength = text.indexOf('#') + 1;
                        return <NeoHint placement={'right'} width={'700px'} title={text}>{text.slice(0, maxJsonLength) + "..."}</NeoHint> }
                else if (text !== undefined && text.length > 100) {return "..."}
                else if (text !== undefined && text.length > 40) {return <NeoHint placement={'right'} width={'700px'} title={text}>{text.slice(0, 40) + "..."}</NeoHint>}
                else {return text}},
                ...this.getColumnSearchProps(name, title, column.get('name') === 'tags'),
                filterIcon: (filtered: any) => (
                    <NeoIcon icon={"search"} style={{ color: filtered ? "#1890ff" : undefined }} />
                ),
                onFilter: (value: any, record: any) => record.name !== undefined ?
                    record.name.toString().toLowerCase() === value.toString().toLowerCase() : undefined,
                onFilterDropdownVisibleChange: () => {
                    this.state.filterMenuVisible ? this.setState({ filterMenuVisible: false})
                        : this.setState({ filterMenuVisible: true});
                },
            })
        }
        return AllColumns;
    }

    prepareTableData(resources:Ecore.Resource[]): Array<Ecore.EStructuralFeature>{
        const prepared: Array<Ecore.EStructuralFeature> = [];
        resources.forEach((res: Ecore.Resource) => {
            if (res.to().length === undefined) {
                const row = {
                    tags: res.eContents()[0].eClass.get('eAllSuperTypes').find((c:EObject) => c.get('name') === 'Tagged') ? [] : undefined,
                    ...res.to(),
                    resource: res,
                };
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
                if (typeof val === "object" && key !== "resource" && key !== "tags") {
                    res[key] = JSON.stringify(val)
                } else if (key === "tags") {
                    res[key] = res
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
        const ref:string = `${record.resource.get('uri')}?rev=${record.resource.rev}`;
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
    getColumnSearchProps = (name: any, title: any, isTag?: boolean) => (!isTag && {
        filterDropdown: () =>
            <NeoDrawer
                className={'datasearch__filter__drawer'}
                mask={false}
                title={`${this.props.t('search by')} ${name}`}
                visible={this.state.filterMenuVisible}
                width={711}
                >
                <SearchFilter onName={name} onTitle={title} tableData={this.filteredData()}
                              tableDataFilter={this.changeTableData}/>
            </NeoDrawer>})


    changeTableData = (tableDataFilter: Array<any>) => {
        this.setState({tableDataFilter})
    };

    onPageChange = (page: number) => {
        this.setState({currentPage: page === 0 ? 1 : page})
    }

    render() {
        const {t} = this.props;
        const columnsT = this.state.columns.map( (c: any) =>(
            {...c, title: c.title === 'eClass' ? t(c.title, {ns: 'common'}) : t(c.title, {ns: 'packages'})}
        )) ;
            const actionColumnDef = [{
                title: t('action'),
                dataIndex: 'action',
                key: 'action',
                fixed: 'right',
                width: 130,
                render: (text:string, record:any) => {
                    const viewButton = <Link key={`edit${record.key}`} to={`/developer/data/editor/${record.resource.get('uri')}/${record.resource.rev}`} style={{display:'inline-block', margin:'auto 14px auto 5px'}}>
                        <NeoButton type={'link'} title={t('view')}>
                            <NeoIcon icon={"show"}/>
                        </NeoButton>
                    </Link>;
                    const editButton = <Link key={`edit${record.name}`} to={`/developer/data/editor/${record.resource.get('uri')}/${record.resource.rev}/true`} style={{display:'inline-block', margin:'auto 14px auto 5px'}}>
                        <NeoButton type={'link'} title={t('edit')}>
                            <NeoIcon icon={"edit"}/>
                        </NeoButton>
                    </Link>;
                    const deleteButton = <span id="delete" key={`delete${record.id}`} style={{ marginLeft: 8 }} onClick={(e:any)=>this.handleDeleteResource(e, record)}>
                        <NeoButton type={'link'} title={t('delete')}>
                            <NeoIcon icon={"rubbish"}/>
                        </NeoButton>
                    </span>;
                    return [viewButton, editButton, deleteButton]
                }
            }];
            const {selectedRowKeys} = this.state;
            const rowSelection = {
                selectedRowKeys,
                onChange: this.onSelectChange
            };
            const hasSelected = selectedRowKeys.length > 0;
            const columnsWidth = columnsT.length * 315;
            return (
             <div style={{padding: '20px'}}>
                 <Helmet>
                     <title>{this.props.t('data')}</title>
                     <link rel="shortcut icon" type="image/png" href="/developer.ico" />
                 </Helmet>
                 <div>
                     <DataSearch
                        onSearch={this.handleSearch}
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
                                     <Button title={t("select")} type="primary" onClick={this.handleSelect} disabled={!hasSelected} style={{width: '100px', fontSize: '17px', marginBottom: '15px'}}>
                                         <NeoIcon icon={"big-grid"}/>
                                    </Button>
                                 </div>
                                 <NeoTable
                                     scroll={{x: columnsWidth}}
                                     columns={this.props.showAction ? columnsT.concat(actionColumnDef) : columnsT}
                                     dataSource={this.filteredData()}
                                     bordered={true}
                                     rowSelection={rowSelection}
                                     style={{whiteSpace: "pre"}}
                                 />
                             </div>
                             :
                             <>
                             <NeoTable
                                 className={'developer_table'}
                                 scroll={{x: columnsWidth}}
                                 columns={this.props.showAction ? columnsT.concat(actionColumnDef) : columnsT}
                                 dataSource={this.filteredData()}
                                 bordered={true}
                                 style={{whiteSpace: "pre", padding:'6px 35px 0px'}}
                                 pagination={{current: this.state.currentPage, pageSize: this.state.paginationPageSize}}
                             />
                             <div className={'developer_paginator'} style={{ width: "100%", padding: '0px 35px' }}>
                             <Paginator
                                     {...this.props}
                                     currentPage = {this.state.currentPage}
                                     totalNumberOfPage = {Math.ceil(this.filteredData().length/this.state.paginationPageSize)}
                                     paginationPageSize = {this.state.paginationPageSize}
                                     totalNumberOfRows = {this.filteredData().length}
                                     onPageChange={this.onPageChange}
                                     onPageSizeChange = {(size)=>{this.setState({paginationPageSize: size})}}
                                 />
                             </div>
                             </>
                     }
                 </div>
             </div>
            );
        }}

export default withTranslation()(Form.create<Props & FormComponentProps & WithTranslation>()(SearchGrid))
