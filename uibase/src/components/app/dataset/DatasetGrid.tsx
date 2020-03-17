import React from 'react';
import {AgGridColumn, AgGridReact} from '@ag-grid-community/react';
import {AllCommunityModules} from '@ag-grid-community/all-modules';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';
import '@ag-grid-community/core/dist/styles/ag-theme-fresh.css';
import '@ag-grid-community/core/dist/styles/ag-theme-blue.css';
import '@ag-grid-community/core/dist/styles/ag-theme-bootstrap.css';
import {Button, Dropdown, Menu, Modal} from 'antd';
import {withTranslation} from 'react-i18next';
import './../../../styles/RichGrid.css';
import Ecore from 'ecore';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {API} from '../../../modules/api';
import {rowPerPageMapper} from '../../../utils/consts';
import SaveDatasetComponent from "./SaveDatasetComponent";
import {handleExportDocx, docxExportObject, docxElementExportType} from "../../../utils/docxExportUtils";
import {handleExportExcel, excelExportObject, excelElementExportType} from "../../../utils/excelExportUtils";
import {saveAs} from "file-saver";

const backgroundColor = "#fdfdfd";
const rowPerPageMapper_: any = rowPerPageMapper;



interface Props {
    onCtrlA?: Function,
    onCtrlShiftA?: Function,
    headerSelection?: boolean,
    onHeaderSelection?: Function,
    activeReportDateField: boolean
}

class DatasetGrid extends React.Component<any, any> {

    private grid: React.RefObject<any>;

    constructor(props: any) {
        super(props);

        this.state = {
            themes: [],
            currentTheme: this.props.viewObject.get('theme') || 'material',
            rowPerPages: [],
            paginationPageSize: this.props.viewObject.get('rowPerPage') || 'ten',
            operations: [],
            selectedServerFilters: [],
            showUniqRow: this.props.viewObject.get('showUniqRow') || false,
            highlight: this.props.viewObject.get('highlight') || [],
            columnDefs: [],
            rowData: [],
            saveMenuVisible: false,
            gridOptions: {
                defaultColDef: {
                    resizable: true,
                    filter: true,
                    sortable: true
                },
            }
        };

        this.grid = React.createRef();
        this.exportToCSV = this.exportToCSV.bind(this);
        // this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // handleKeyDown(event: { [key:string]: any }) {
    //      const { onCtrlA, onCtrlShiftA } = this.props
    //      const rowData = this.grid.current.api.getSelectedRows()
    //      const focusedCell = this.grid.current.api.getFocusedCell()
    //      const row = this.grid.current.api.getDisplayedRowAtMIndex(focusedCell.rowIndex);
    //
    //      let charCode = String.fromCharCode(event.which).toLowerCase()
    //      if (rowData.length > 0 && focusedCell) {
    //          const cellData = row.data[focusedCell.column.colId]
    //          if (event.ctrlKey && charCode === 'c') {
    //              copyIntoClipboard!(cellData)
    //              event.preventDefault()
    //          }
    //          // For MAC
    //          if (event.metaKey && charCode === 'c') {
    //              copyIntoClipboard!(cellData)
    //              event.preventDefault()
    //          }
    //      }
    //      if (this.props.onCtrlA) {
    //          if (event.ctrlKey && charCode === 'a') {
    //              onCtrlA!(event)
    //              event.preventDefault()
    //          }
    //      }
    //      if (this.props.onCtrlShiftA) {
    //          if (event.ctrlKey && event.shiftKey && charCode === 'a') {
    //              onCtrlShiftA!(event)
    //              event.preventDefault()
    //          }
    //      }
    //  }

    exportToCSV(name: string) {
        this.grid.current.api.exportDataAsCsv({ fileName: name })
    }

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    };

    onPageSizeChanged(newPageSize: any) {
        this.grid.current.api.paginationSetPageSize(Number(rowPerPageMapper_[newPageSize]));
    }

    onActionMenu(e : any) {
        if (e.key.split('.').includes('theme')) {
            this.setSelectedKeys(e.key.split('.')[1])
        }
        if (e.key.split('.').includes('rowPerPage')) {
            this.setSelectedKeys(e.key.split('.')[1])
            this.onPageSizeChanged(e.key.split('.')[1])
        }
        if (e.key === 'saveReport') {
            this.handleSaveMenu()
        }
        if (e.key === 'exportToDocx') {
            handleExportDocx(this.props.context.docxHandlers).then(blob => {
                saveAs(blob, "example.docx");
                console.log("Document created successfully");
            });
        }
        if (e.key === 'exportToExcel') {
            handleExportExcel(this.props.context.excelHandlers).then((blob) => {
                    saveAs(new Blob([blob]), 'example.xlsx')
                    console.log("Document created successfully");
                }
            );
        }
    }

    private setSelectedKeys(parameter?: string) {
        let selectedKeys: string[] = [];
        if (this.state.themes.length !== 0) {
            if (parameter && this.state.themes.includes(parameter)) {
                selectedKeys.push(`theme.${parameter}`)
                this.setState({currentTheme: parameter})
                this.props.viewObject.set('theme', parameter)
            }
            else if (this.state.currentTheme === null) {
                selectedKeys.push(`theme.${this.state.themes[0]}`)
                this.setState({currentTheme: this.state.themes[0]})
                this.props.viewObject.set('theme', this.state.themes[0])
            }
            else {
                selectedKeys.push(`theme.${this.state.currentTheme}`)
            }
        }
        if (this.state.rowPerPages.length !== 0) {
            if (parameter && this.state.rowPerPages.includes(parameter)) {
                selectedKeys.push(`rowPerPage.${parameter}`)
                this.setState({paginationPageSize: parameter})
                this.props.viewObject.set('rowPerPage', parameter)
            }
            else if (this.state.paginationPageSize === null) {
                selectedKeys.push(`rowPerPage.${this.state.rowPerPages[0]}`)
                this.setState({paginationPageSize: this.state.rowPerPages[0]})
                this.props.viewObject.set('rowPerPage', this.state.rowPerPages[0])
            }
            else {
                selectedKeys.push(`rowPerPage.${this.state.paginationPageSize}`)
            }
        }
        return selectedKeys;
    }

    private getDocxData() : docxExportObject {
        let header = [];
        for (const elem of this.state.columnDefs) {
            header.push(elem.get("headerName"))
        }
        let tableData = [];
        tableData.push(header);
        for (const elem of this.state.rowData) {
            let dataRow = [];
            for (const prop in elem) {
                dataRow.push(elem[prop])
            }
            tableData.push(dataRow)
        }
        return  {
            docxComponentType : docxElementExportType.grid,
            gridData:(tableData.length === 0) ? [[]] : tableData
        };
    }

    private getExcelData() : excelExportObject {
        let header = [];
        for (const elem of this.state.columnDefs) {
            header.push({name: elem.get("headerName"), filterButton: true})
        }
        let tableData = [];
        for (const elem of this.state.rowData) {
            let dataRow = [];
            for (const prop in elem) {
                dataRow.push(elem[prop])
            }
            tableData.push(dataRow)
        }
        return  {
            excelComponentType : excelElementExportType.grid,
            gridData: {
                tableName: this.props.viewObject.get('name'),
                columns: header,
                rows: (tableData.length === 0) ? [[]] : tableData
            }
        };
    }

    getAllThemes() {
        API.instance().findEnum('application', 'Theme')
            .then((result: Ecore.EObject[]) => {
                let themes = result.map( (t: any) => {
                    return t.get('name').toLowerCase()
                });
                this.setState({themes})
            })
    };

    getAllRowPerPage() {
        API.instance().findEnum('application', 'RowPerPage')
            .then((result: Ecore.EObject[]) => {
                let rowPerPages = result.map( (t: any) => {
                    return t.get('name') /*rowPerPageMapper_[t.get('name')]*/
                });
                this.setState({rowPerPages})
            })
    };

    componentDidMount(): void {
        if (this.props.context.docxHandlers !== undefined) {
            this.props.context.docxHandlers.push(this.getDocxData.bind(this))
        }
        if (this.props.context.excelHandlers !== undefined) {
            this.props.context.excelHandlers.push(this.getExcelData.bind(this))
        }
        if (this.state.themes.length === 0) {
            this.getAllThemes()
        }
        if (this.state.rowPerPages.length === 0) {
            this.getAllRowPerPage()
        }
        this.changeSettings();
    }

    componentWillUnmount(): void {
        if (this.props.context.docxHandlers !== undefined && this.props.context.docxHandlers.length > 0) {
            this.props.context.docxHandlers.pop()
        }
        if (this.props.context.excelHandlers !== undefined && this.props.context.excelHandlers.length > 0) {
            this.props.context.excelHandlers.pop()
        }
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any): void {
        const userComponentName = this.props.context.userProfile.get('params').array()
            .filter( (p: any) => p.get('key') === this.props.viewObject.get('datasetView')._id);

        if (JSON.stringify(prevProps.context.userProfile.eResource().to()) !== JSON.stringify(this.props.context.userProfile.eResource().to())) {
            this.changeSettings();
        }
        const componentName = userComponentName.length === 0 || JSON.parse(userComponentName[0].get('value'))['name'] === undefined ?
            this.props.viewObject.get('datasetView').get('datasetComponent').get('name')
            : JSON.parse(userComponentName[0].get('value'))['name']
        if (this.props.context.datasetComponents
            && this.props.context.datasetComponents[componentName] !== undefined) {
            if (this.state.columnDefs.length === 0
                && this.state.rowData.length === 0) {
                if (this.props.context.datasetComponents[componentName]['columnDefs'] !== undefined
                    && this.props.context.datasetComponents[componentName]['rowData'] !== undefined) {
                    const columnDefs = this.props.context.datasetComponents[componentName]['columnDefs'];
                    this.setState({columnDefs});
                    const rowData = this.props.context.datasetComponents[componentName]['rowData'];
                    this.setState({rowData})
                }
            }
            if (JSON.stringify(prevState.rowData) !== JSON.stringify(this.props.context.datasetComponents[componentName]['rowData'])) {
                const rowData = this.props.context.datasetComponents[componentName]['rowData'];
                this.setState({rowData})
            }
            if (JSON.stringify(prevState.columnDefs) !== JSON.stringify(this.props.context.datasetComponents[componentName]['columnDefs'])) {
                const columnDefs = this.props.context.datasetComponents[componentName]['columnDefs'];
                this.setState({columnDefs})
            }
        }
    }

    private changeSettings() {
        this.props.context.userProfile.get('params').array()
            .forEach((p: any) => {
                if (p.get('key') === this.props.viewObject.get('datasetView')._id) {
                    if (JSON.parse(p.get('value'))['theme'] !== undefined) {
                        this.setState({currentTheme: JSON.parse(p.get('value'))['theme']})
                    }
                    if (JSON.parse(p.get('value'))['showUniqRow'] !== undefined) {
                        this.setState({showUniqRow: JSON.parse(p.get('value'))['showUniqRow']})
                    }
                    if (JSON.parse(p.get('value'))['rowPerPage'] !== undefined) {
                        const newPageSize = JSON.parse(p.get('value'))['rowPerPage']
                        this.setState({paginationPageSize: newPageSize})
                    }
                }
            });
    }

    handleSaveMenu = () => {
        this.state.saveMenuVisible ? this.setState({ saveMenuVisible: false }) : this.setState({ saveMenuVisible: true })
    };

    render() {
        const { t } = this.props;
        const {gridOptions} = this.state;
        let selectedKeys = this.setSelectedKeys();
        const menu = (
            <Menu
                key='actionMenu'
                onClick={(e) => this.onActionMenu(e)}
                selectedKeys={selectedKeys}
                style={{width: '150px'}}
            >
                <Menu.Item key='selectColumns'>
                    Select Columns
                </Menu.Item>
                <Menu.SubMenu title={'Rows Per Page'}>
                    {this.state.rowPerPages.map((p: string) =>
                        <Menu.Item key={`rowPerPage.${p}`} style={{width: '65px'}}>
                            {rowPerPageMapper_[p]}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item key='format'>
                    Format
                </Menu.Item>
                <Menu.Item key='saveReport'>
                    Save Report
                </Menu.Item>
                <Menu.Item key='reset'>
                    Reset
                </Menu.Item>
                <Menu.SubMenu title={'Theme'}>
                    {this.state.themes.map((theme: string) =>
                        <Menu.Item key={`theme.${theme}`} style={{width: '100px'}}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </Menu.Item>
                    )}
                </Menu.SubMenu>
                <Menu.Item key='help'>
                    Help
                </Menu.Item>
                <Menu.Item key='download'>
                    Download
                </Menu.Item>
                <Menu.Item key='exportToDocx'>
                    exportToDocx
                </Menu.Item>
                <Menu.Item key='exportToExcel'>
                    exportToExcel
                </Menu.Item>
            </Menu>
        );
        return (
            <div
                style={{boxSizing: 'border-box', height: '100%', backgroundColor: backgroundColor }}
                className={'ag-theme-' + this.state.currentTheme}
            >
                <Dropdown overlay={menu} placement='bottomLeft'>
                    <Button style={{color: 'rgb(151, 151, 151)'}}> {t('action')}
                        <FontAwesomeIcon icon={faChevronDown} size='xs'
                                         style={{marginLeft: '5px'}}/>
                    </Button>
                </Dropdown>
                <div style={{ marginTop: '30px'}}>
                    {this.state.columnDefs.length !== 0 && <AgGridReact
                        ref={this.grid}
                        //columnDefs={this.state.columnDefs}
                        rowData={this.state.rowData}
                        modules={AllCommunityModules}
                        rowSelection='multiple' //выделение строки
                        onGridReady={this.onGridReady} //инициализация грида
                        //Выполняет глубокую проверку значений старых и новых данных и подгружает обновленные
                        //rowDataChangeDetectionStrategy={'DeepValueCheck' as ChangeDetectionStrategyType}
                        suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                        suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                        allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                        headerHeight={40} //высота header в px (25 по умолчанию)
                        suppressRowClickSelection //строки не выделяются при нажатии на них
                        pagination={true}
                        domLayout='autoHeight'
                        paginationPageSize={Number(rowPerPageMapper_[this.state.paginationPageSize])}
                        {...gridOptions}
                    >
                        {this.state.columnDefs.map((col: any) =>
                                <AgGridColumn
                                    key={col.get('field')}
                                    field={col.get('field')}
                                    headerName={col.get('headerName').toString().substring(0, 1).toUpperCase() + col.get('headerName').toString().substring(1)}
                                    headerTooltip={col.get('headerTooltip')}
                                    hide={col.get('hide') || false}
                                    editable={col.get('editable') || false}
                                    pinned={col.get('pinned') === 'Left' ? 'left' : col.get('pinned') === 'Right' ? 'right' : false}
                                    filter={col.get('filter') === 'NumberColumnFilter'
                                        ? 'agNumberColumnFilter' : col.get('filter') === 'DateColumnFilter' ?
                                            'agDateColumnFilter' : 'agTextColumnFilter'}
                                    checkboxSelection={col.get('checkboxSelection') || false}
                                    resizable={col.get('resizable') || false}
                                    sortable={col.get('sortable') || false}
                                    suppressMenu={col.get('suppressMenu') || false}
                                />
                                )}
                    </AgGridReact>
                    }
                </div>
                <Modal
                    key="save_menu"
                    width={'500px'}
                    title={t('saveReport')}
                    visible={this.state.saveMenuVisible}
                    footer={null}
                    onCancel={this.handleSaveMenu}
                >
                    <SaveDatasetComponent
                        {...this.props}
                    />
                </Modal>
            </div>
        )
    }
}
export default withTranslation()(DatasetGrid)
