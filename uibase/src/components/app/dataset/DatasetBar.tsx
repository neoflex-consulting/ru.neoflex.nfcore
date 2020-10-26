import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {Dropdown, Menu, Select} from 'antd';
import './../../../styles/DatasetBar.css';

import {NeoButton, NeoColor, NeoInput, NeoSelect, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {IDiagram, paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";

const { Option, OptGroup } = Select;

enum barSize {
    extraSmall,
    small,
    medium,
    large
}

interface props {
    onDocExportClick: () => void,
    onExcelExportClick: () => void,
    onFilterChange: () => void,
    onFiltersClick: () => void,
    onSortsClick: () => void,
    onCalculatorClick: () => void,
    onAggregationsClick: () => void,
    onDiagramsClick: () => void,
    onGroupingClick: () => void,
    onHiddenClick: () => void,
    onSaveClick: () => void,
    onDeleteClick: () => void,
    onEditClick: () => void,
    onFullscreenClick: () => void,
    onChangeDatasetComponent: (e:any) => void,
    onBackToTableClick: () => void,
    onAddDiagramClick: () => void,
    onEditDiagramClick: () => void,
    onDiagramChange: (e: string) => void,
    onDeleteDiagramClick: () => void,
    onWithTableCheck: (e: any) => void,
    onBackFromEditClick: () => void,
    onInsertRowClick: () => void,
    onApplyEditChangesClick: () => void,
    onDeleteSelectedRowsClick: () => void,
    onCopySelectedRowsClick: () => void,
    onEditFilterChange: () => void,
    currentDatasetComponent: any,
    allDatasetComponents: any,
    currentDiagram?: IDiagram,
    diagrams: IDiagram[],
    serverFilters: IServerQueryParam[],
    serverAggregates: IServerQueryParam[],
    serverSorts: IServerQueryParam[],
    serverGroupBy: IServerQueryParam[],
    groupByColumn: IServerQueryParam[],
    serverCalculatedExpression: IServerQueryParam[],
    barMode: "edit"|"diagram"|"normal",
    t: any,
    i18n: any,
    tReady: any,
    isServerFunctionsHidden: boolean,
    isDeleteButtonVisible: boolean,
    isEditButtonVisible: boolean,
    isComponentsLoaded: boolean,
    isFullScreenOn: boolean,
    isInsertRowHidden: boolean,
    isDeleteRowsHidden: boolean,
    isCopySelectedHidden: boolean
}

interface State {
    barSize: barSize;
    isQuickSearchExpanded: boolean;
    isExportChecked: boolean;
}

interface transformerProps {
    id?: string,
    className?: string,
    t: any,
    i18n: any,
    tReady: any,
    placeholder: string,
    onChange: () => void,
    onExpand?: () => void,
    onCollapse?: () => void
}

interface transformerState {
    isExpanded: boolean
}

class SearchTransformer extends React.Component<transformerProps, transformerState> {

    constructor(props: any) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }

    render() {
        return this.state.isExpanded
            ?
            <div id={this.props.id} className={this.props.className}>
                <NeoInput
                    className={"search-input element-top-margin"}
                    type="search"
                    onChange={this.props.onChange}
                    id={"quickFilter"}
                    placeholder={this.props.t(this.props.placeholder)}
                />
                <NeoButton
                    className={"search-button"}
                    type={'link'} title={this.props.t('close')}
                    onClick={()=>{
                        this.setState({isExpanded: false});
                        this.props.onCollapse && this.props.onCollapse()
                    }}
                    id={"quickFilter"}>
                    <NeoIcon  icon={"close"} color={'#8C8C8C'} />
                </NeoButton>
            </div>
            :
            <div id={this.props.id} className={this.props.className}>
                <NeoButton
                    className={"search-button"}
                    type={'link'} title={this.props.t(this.props.placeholder)}
                    onClick={()=>{
                        this.setState({isExpanded: true});
                        this.props.onExpand && this.props.onExpand()
                    }}
                    id={"quickFilter"}>
                    <NeoIcon  icon={"search"} color={'#5E6785'} size={'m'}/>
                </NeoButton>
            </div>

    }
}

//adaptive break point px xs/s/m/l
const breakPoints = {
    diagram: [375, 400, 638, 878],
    edit: [375, 375, 522, 750],
    normal: [375, 510, 630, 900]
};

class DatasetBar extends React.Component<props, State> {

    barRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {
            barSize: barSize.large,
            isQuickSearchExpanded: false,
            isExportChecked: false
        };
    }

    handleResize = () => {
        if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > breakPoints[this.props.barMode][barSize.large]) {
            this.setState({barSize:barSize.large, isQuickSearchExpanded: false})
        } else if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > breakPoints[this.props.barMode][barSize.medium]) {
            this.setState({barSize:barSize.medium})
        } else if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > breakPoints[this.props.barMode][barSize.small]) {
            this.setState({barSize:barSize.small})
        } else {
            this.setState({barSize:barSize.extraSmall})
        }
    };

    componentDidMount(): void {
        window.addEventListener("appAdaptiveResize", this.handleResize);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    }

    componentWillUnmount() {
        window.removeEventListener("appAdaptiveResize", this.handleResize);
        window.removeEventListener("resize", this.handleResize);
    }

    onAdaptiveMenuClick(e:{key:string}) {
        switch (e.key) {
            case paramType.filter:
                this.props.onFiltersClick();
                break;
            case paramType.sort:
                this.props.onSortsClick();
                break;
            case paramType.calculations:
                this.props.onCalculatorClick();
                break;
            case paramType.aggregate:
                this.props.onAggregationsClick();
                break;
            case 'diagram':
                this.props.onDiagramsClick();
                break;
            case paramType.group:
                this.props.onGroupingClick();
                break;
            case paramType.hiddenColumns:
                this.props.onHiddenClick();
                break;
            case 'save':
                this.props.onSaveClick();
                break;
            case 'delete':
                this.props.onDeleteClick();
                break;
            case 'edit':
                this.props.onEditClick();
                break;
            default:
                break;
        }
    }

    getAdaptiveMenu = () => {
        return <Menu onClick={(e: any) => this.onAdaptiveMenuClick(e)}>
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.filter}>
                <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>{this.props.t("filters")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.sort}>
                <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>{this.props.t("sorts")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <div className={"menu-horizontal-line"}/>}
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.calculations}>
                <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>{this.props.t("calculator")}
            </Menu.Item>}
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.aggregate}>
                <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>{this.props.t("aggregations")}
            </Menu.Item>}
            <Menu.Item className={"action-menu-item"} key={'diagram'}>
                <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>{this.props.t("diagram")}
            </Menu.Item>
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.group}>
                <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>{this.props.t("grouping")}
            </Menu.Item>}
            <Menu.Item className={"action-menu-item"} key={paramType.hiddenColumns}>
                <NeoIcon icon={'hide'} color={'#5E6785'} size={'m'}/>{this.props.t("hiddencolumns")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='save'>
                <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>{this.props.t("save")}
            </Menu.Item>
            {this.props.isDeleteButtonVisible && <Menu.Item className={"action-menu-item"} key='delete'>
                <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{this.props.t("delete")}
            </Menu.Item>}
            {this.props.isEditButtonVisible && <div className={"menu-horizontal-line"}/>}
            {this.props.isEditButtonVisible && <Menu.Item className={"action-menu-item"} key='edit'>
                <NeoIcon icon={'edit'} color={'#5E6785'} size={'m'}/>{this.props.t("edit")}
            </Menu.Item>}
        </Menu>
    };

    onDiagramAdaptiveMenuClick(e:{key:string}) {
        switch (e.key) {
            case 'add':
                this.props.onAddDiagramClick();
                break;
            case 'edit':
                this.props.onEditDiagramClick();
                break;
            case 'delete':
                this.props.onDeleteClick();
                break;
            default:
                break;
        }
    }

    getDiagramAdaptiveMenu = () => {
        return <Menu onClick={(e: any) => this.onDiagramAdaptiveMenuClick(e)}>
            <Menu.Item className={"action-menu-item"} key='add'>
                <NeoIcon icon={'plus'} color={'#5E6785'} size={'m'}/>{this.props.t("add")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='edit'>
                <NeoIcon icon={'edit'} color={'#5E6785'} size={'m'}/>{this.props.t("edit")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='delete'>
                <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{this.props.t("delete")}
            </Menu.Item>
        </Menu>
    };

    onEditAdaptiveMenuClick(e:{key:string}) {
        switch (e.key) {
            case 'add row':
                this.props.onInsertRowClick();
                break;
            case 'apply changes':
                this.props.onApplyEditChangesClick();
                break;
            case 'delete selected':
                this.props.onDeleteSelectedRowsClick();
                break;
            case 'copy selected':
                this.props.onCopySelectedRowsClick();
                break;
            default:
                break;
        }
    }

    getEditAdaptiveMenu = () => {
        return <Menu onClick={(e: any) => this.onEditAdaptiveMenuClick(e)}>
            <Menu.Item className={"action-menu-item"} key='add row'>
                <NeoIcon icon={'plus'} color={'#5E6785'} size={'m'}/>{this.props.t("add row")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='apply changes'>
                <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>{this.props.t("apply changes")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='delete selected'>
                <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{this.props.t("delete selected")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='copy selected'>
                <NeoIcon icon={'duplicate'} color={'#5E6785'} size={'m'}/>{this.props.t("copy selected")}
            </Menu.Item>
        </Menu>
    };

    getSearch = () => {
        return this.state.barSize <= barSize.medium
            ?
            <SearchTransformer
                id={"searchTransformer"}
                className={this.state.isQuickSearchExpanded ? "flex-bar-item fill-space" : "flex-bar-item"}
                i18n={this.props.i18n}
                t={this.props.t}
                tReady={this.props.tReady}
                placeholder={"quick filter"}
                onChange={this.props.onFilterChange}
                onExpand={()=>this.setState({isQuickSearchExpanded:true})}
                onCollapse={()=>this.setState({isQuickSearchExpanded:false})}
            />
            :
            <NeoInput
                className={"search-input element-top-margin"}
                type="search"
                onChange={this.props.onFilterChange}
                id={"quickFilter"}
                placeholder={this.props.t("quick filter")}
            />
    };

    getActionButtons = () => {
        let isFilter, isSort, isCalculator, serverAggregates, isDiagramms, serverGroupBy  = false;
        this.props.serverFilters.forEach(element => {
            if (element.datasetColumn !== undefined && element.value !== undefined && element.operation !== undefined){
                isFilter = true;
            }
        })
        this.props.serverSorts.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                isSort = true;
            }
        })
        this.props.serverCalculatedExpression.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                isCalculator = true;
            }
        })
        this.props.serverAggregates.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                serverAggregates = true;
            }
        })
        if (this.props.diagrams.length > 0){
            isDiagramms = true
        }
        this.props.serverGroupBy.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined && element.value !== undefined) {
                serverGroupBy = true;
            }
        })


        return !this.props.isServerFunctionsHidden
            ?
            <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                    <div className='verticalLine'/>
                    <NeoButton type={'link'} title={this.props.t('filters')} className={"margin-top margin-left"}
                               onClick={this.props.onFiltersClick}>
                        <NeoIcon icon={isFilter ? 'filterCheck' : 'filter'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('sorts')} className={"margin-top inter-button-margin"}
                               onClick={this.props.onSortsClick}>
                        <NeoIcon icon={isSort ? 'sortCheck' : 'sort'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <div className='verticalLine'/>
                </div>
                <div className={this.state.barSize <= barSize.medium ? 'adaptive-bar-hidden' : 'flex-bar-item'}>
                    <NeoButton type={'link'} title={this.props.t('calculator')}
                               className={"margin-top margin-left"}
                               onClick={this.props.onCalculatorClick}>
                        <NeoIcon icon={isCalculator ? 'calculatorCheck' : 'calculator'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('aggregations')}
                               className={"margin-top inter-button-margin"}
                               onClick={this.props.onAggregationsClick}>
                        <NeoIcon icon={serverAggregates ?  'plusBlockCheck' : 'plusBlock'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('diagram')}
                               className={"margin-top inter-button-margin"}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={isDiagramms ? 'barChartCheck' : 'barChart'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('grouping')}
                               className={"margin-top inter-button-margin"}
                               onClick={this.props.onGroupingClick}>
                        <NeoIcon icon={serverGroupBy ? 'addCheck' : 'add'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('hiddencolumns')}
                               className={"margin-top inter-button-margin"}
                               onClick={this.props.onHiddenClick}>
                        <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <div className='verticalLine'/>
                    <NeoButton type={'link'} title={this.props.t('save')}
                               className={"margin-top margin-left"}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    {
                        this.props.isDeleteButtonVisible &&
                        <div>
                            <NeoButton type={'link'} title={this.props.t('delete')}
                                       className={"margin-top inter-button-margin"}
                                       onClick={this.props.onDeleteClick}>
                                <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                            </NeoButton>
                        </div>
                    }
                    <div className='verticalLine'/>
                    {
                        this.props.isEditButtonVisible &&
                        <NeoButton
                            type={'link'}
                            title={this.props.t('edit')}
                            className={"margin-top margin-left"}
                            onClick={this.props.onEditClick}>
                            <NeoIcon icon={"edit"} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                    }
                </div>
            </div>
            :
            <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                <div className={this.state.barSize < barSize.large ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                    <div className='verticalLine'/>
                    <NeoButton type={'link'} title={this.props.t('diagram')}
                               className={"margin-top margin-left"}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('hiddencolumns')}
                               className={"margin-top inter-button-margin"}
                               onClick={this.props.onHiddenClick}>
                        <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <div className='verticalLine'/>
                    <NeoButton type={'link'} title={this.props.t('save')}
                               className={"margin-top margin-left"}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    {
                        this.props.isDeleteButtonVisible &&
                        <div>
                            <NeoButton type={'link'} title={this.props.t('delete')}
                                       className={"margin-top inter-button-margin"}
                                       onClick={this.props.onDeleteClick}>
                                <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                            </NeoButton>
                        </div>
                    }
                    <div className='verticalLine'/>
                    {
                        this.props.isEditButtonVisible &&
                        <NeoButton
                            type={'link'}
                            title={this.props.t('edit')}
                            className={"margin-top margin-left"}
                            onClick={this.props.onEditClick}>
                            <NeoIcon icon={"edit"} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                    }
                </div>
            </div>
    };

    flipExportCheckbox = () => {
        this.props.onWithTableCheck(!this.state.isExportChecked);
        this.setState({isExportChecked: !this.state.isExportChecked});
    };

    onExportMenuClick(e:{key:string}) {
        switch (e.key) {
            case 'exportToDocx':
                this.props.onDocExportClick();
                break;
            case 'exportToExcel':
                this.props.onExcelExportClick();
                break;
            case 'checkboxDiagram':
                this.flipExportCheckbox();
                break;
            default:
                break;
        }
    }

    getExportMenu = () => {
        return <Menu
            key='actionMenu'
            onClick={this.onExportMenuClick.bind(this)}
            className={"export-menu"}>
            {this.props.barMode === "diagram"
            && this.state.barSize <= barSize.small
            && <Menu.Item className={"action-menu-item"} key='checkboxDiagram'>
                <span className={"checkboxDiagram"}>
                       <NeoInput type={'checkbox'} onChange={this.flipExportCheckbox}
                       checked={this.state.isExportChecked}/>
                       <span>{this.props.t("download with table")}</span>
                   </span>
            </Menu.Item>}
            {this.props.barMode === "diagram"
            && this.state.barSize <= barSize.small
            && <div className={"menu-horizontal-line"}/>}
            <Menu.Item className={"action-menu-item"} key='exportToDocx'>
                <NeoIcon icon={'fileWord'} color={'#5E6785'} size={'m'}/>{this.props.t("export to docx")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='exportToExcel'>
                <NeoIcon icon={'fileExcel'} color={'#5E6785'} size={'m'}/>{this.props.t("export to excel")}
            </Menu.Item>
        </Menu>
    };

    getExportButtons = () => {
        return <div className={"flex-bar-item"}>
            <div className='verticalLine'/>
            <Dropdown overlay={this.getExportMenu()} placement="bottomRight" className={"export-dropdown"}>
                <div>
                    <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} className={"margin-top margin-left"}/>
                </div>
            </Dropdown>
            <NeoButton
                title={this.props.t('fullscreen')}
                type={'link'} className={"margin-top inter-button-margin"}
                onClick={this.props.onFullscreenClick}>
                {this.props.isFullScreenOn  ?
                    <NeoIcon icon={'fullScreenUnDo'} color={'#5E6785'} size={'m'}/>
                    :
                    <NeoIcon icon={'fullScreen'} color={'#5E6785'} size={'m'}/>
                }
            </NeoButton>
        </div>
    };

    getGridPanel = () => {
        return <div
            ref={this.barRef}
            className={this.state.barSize <= barSize.extraSmall ? "functionalBar__header adaptive-bar-column-flex"  : "functionalBar__header"}>
            <div className={"block flex-bar-item " + (this.state.barSize !== barSize.extraSmall && "fill-space")}>
                {this.getSearch()}
                {!this.state.isQuickSearchExpanded && <div className={this.state.barSize <= barSize.medium ? "verticalLine" : "adaptive-bar-hidden"}/>}
                {!this.state.isQuickSearchExpanded && <Dropdown
                    className={"adaptive-dropdown"}
                    overlay={this.getAdaptiveMenu()} placement="bottomRight">
                    <div
                        className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                        <NeoIcon icon={"more"} size={"m"} color={'#5E6785'}/>
                    </div>
                </Dropdown>}
                {!this.state.isQuickSearchExpanded && this.getActionButtons()}
                {this.state.barSize <= barSize.extraSmall && this.getExportButtons()}
            </div>
            {this.state.barSize <= barSize.extraSmall && <div className={"horizontal-line"}/>}
            <div id={"selectsInFullScreen"} className={"block flex-bar-item"}>
                {(!this.state.isQuickSearchExpanded || this.state.barSize <= barSize.extraSmall)
                && <span className='caption'>{this.props.t("version")}</span>}
                {this.props.isComponentsLoaded
                && (!this.state.isQuickSearchExpanded || this.state.barSize <= barSize.extraSmall)
                &&
                <NeoSelect
                    className={this.state.barSize === barSize.extraSmall ? "fill-space element-top-margin" : "element-top-margin"}
                    getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}
                    width={'184px'}
                    value={this.props.currentDatasetComponent.eContents()[0].get('name')}
                    onChange={this.props.onChangeDatasetComponent}
                >
                    <OptGroup
                        label='Default'>
                        {
                            this.props.allDatasetComponents
                                .filter((c: any) => c.eContents()[0].get('access') === 'Default')
                                .map((c: any) =>
                                    <Option
                                        key={c.eContents()[0].get('name')}
                                        value={c.eContents()[0].get('name')}>
                                        {c.eContents()[0].get('name')}
                                    </Option>)
                        }
                    </OptGroup>
                    <OptGroup label='Private'>
                        {
                            this.props.allDatasetComponents
                                .filter((c: any) => c.eContents()[0].get('access') === 'Private')
                                .map((c: any) =>
                                    <Option
                                        key={c.eContents()[0].get('name')}
                                        value={c.eContents()[0].get('name')}>
                                        {c.eContents()[0].get('name')}
                                    </Option>)
                        }
                    </OptGroup>
                    <OptGroup label='Public'>
                        {
                            this.props.allDatasetComponents
                                .filter((c: any) => c.eContents()[0].get('access') !== 'Private' && c.eContents()[0].get('access') !== 'Default')
                                .map((c: any) =>
                                    <Option
                                        key={c.eContents()[0].get('name')}
                                        value={c.eContents()[0].get('name')}>
                                        {c.eContents()[0].get('name')}
                                    </Option>)
                        }
                    </OptGroup>
                </NeoSelect>
                }
                {this.state.barSize > barSize.extraSmall && this.getExportButtons()}
            </div>
        </div>
    };

    getDiagramPanel = () => {
        return (
            <div ref={this.barRef} className={this.state.barSize <= barSize.extraSmall ?
                "functionalBar__header adaptive-bar-column-flex"  : "functionalBar__header"}>
                <div className={'block space-between ' + (this.state.barSize !== barSize.extraSmall && "fill-space")}>
                    <div className='flex-bar-item'>
                        <NeoButton
                            type={'link'}
                            title={this.props.t("back to table")}
                            className={"element-top-margin"}
                            style={{color: NeoColor.grey_9}}
                            suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                            onClick={this.props.onBackToTableClick}
                        >
                            {this.state.barSize === barSize.large && <span className={"back-span-text"}>{this.props.t("back to table")}</span>}
                        </NeoButton>
                        <div className='verticalLine'/>
                        {this.state.barSize === barSize.large && <NeoButton type={'link'} title={this.props.t('add')} className={"margin-top margin-left"}
                                   onClick={this.props.onAddDiagramClick}
                        >
                            <NeoIcon icon={"plus"} size={"m"} color={'#5E6785'}/>
                        </NeoButton>}
                        {this.state.barSize === barSize.large && <NeoButton type={'link'} title={this.props.t('edit')} className={"margin-top inter-button-margin"}
                                   onClick={this.props.onEditDiagramClick}
                        >
                            <NeoIcon icon={"edit"} size={"m"} color={'#5E6785'}/>
                        </NeoButton>}
                        {this.state.barSize === barSize.large && <div className='verticalLine'/>}

                        {this.state.barSize === barSize.large && <NeoButton type={'link'} title={this.props.t('delete')} className={"margin-top margin-left"}
                                                                            onClick={this.props.onDeleteDiagramClick}
                        >
                            <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                        </NeoButton>}
                        {this.state.barSize === barSize.large && <div className='verticalLine'/>}
                        {this.state.barSize <= barSize.medium && <Dropdown
                            className={"adaptive-dropdown"}
                            overlay={this.getDiagramAdaptiveMenu()} placement="bottomRight">
                            <div
                                className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                                <NeoIcon icon={"more"} size={"m"} color={'#5E6785'}/>
                            </div>
                        </Dropdown>}
                    </div>
                    <div className='flex-bar-item'>
                        {this.state.barSize > barSize.extraSmall && <div id="selectInGetDiagramPanel">
                            <NeoSelect
                                getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                                className={"diagram-select element-top-margin"}
                                showSearch={true}
                                value={this.props.currentDiagram?.diagramName}
                                onChange={this.props.onDiagramChange}
                            >
                                {
                                    this.props.diagrams.map((c: IDiagram) =>
                                        <Option
                                            key={c.diagramName}
                                            value={c.diagramName}>
                                            {c.diagramName}
                                        </Option>)
                                }
                            </NeoSelect>
                        </div>}
                        {this.state.barSize >= barSize.medium && <div id={"dropdownInGridPanel"}   className='verticalLine'/>}
                        {this.state.barSize >= barSize.medium && <span className={"checkboxDiagram margin-top margin-left"}>
                            <NeoInput type={'checkbox'} onChange={this.flipExportCheckbox}
                            checked={this.state.isExportChecked}
                            />
                          <span className={"checkbox-span-text"}>{this.props.t("download with table")}</span>
                        </span>}
                        {this.getExportButtons()}
                    </div>
                </div>
                {this.state.barSize <= barSize.extraSmall && <div className={"horizontal-line"}/>}
                {this.state.barSize <= barSize.extraSmall && <div id="selectInGetDiagramPanel" className={"block"}>
                    <NeoSelect
                        getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                        className={"diagram-select element-top-margin fill-space"}
                        showSearch={true}
                        value={this.props.currentDiagram?.diagramName}
                        onChange={this.props.onDiagramChange}
                    >
                        {
                            this.props.diagrams.map((c: IDiagram) =>
                                <Option
                                    key={c.diagramName}
                                    value={c.diagramName}>
                                    {c.diagramName}
                                </Option>)
                        }
                    </NeoSelect>
                </div>}
            </div>
        )
    };

    getEditPanel = () => {
        return <div ref={this.barRef} className={this.state.barSize <= barSize.extraSmall ?
            "functionalBar__header adaptive-bar-column-flex"  : "functionalBar__header"}>
            <div className={'block space-between ' + (this.state.barSize !== barSize.extraSmall && "fill-space")}>
                <div className='flex-bar-item'>
                    <NeoButton
                        type={'link'}
                        className={'element-top-margin'}
                        title={this.props.t('edit')}
                        style={{color: NeoColor.grey_9}}
                        suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                        onClick={this.props.onBackFromEditClick}
                    >
                        {this.state.barSize === barSize.large && <span><NeoTypography style={{color: NeoColor.grey_9}} type={'body_regular'}>{this.props.t("exitFromEditMode")}</NeoTypography></span>}
                    </NeoButton>
                    <div className='verticalLine'/>
                    {this.state.barSize < barSize.medium && <Dropdown
                        className={"adaptive-dropdown"}
                        overlay={this.getEditAdaptiveMenu()} placement="bottomRight">
                        <div
                            className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                            <NeoIcon icon={"more"} size={"m"} color={'#5E6785'}/>
                        </div>
                    </Dropdown>}
                    {this.state.barSize >= barSize.medium && <NeoButton
                        type={'link'}
                        hidden={this.props.isInsertRowHidden}
                        title={this.props.t("add row")}
                        className={"margin-left margin-top"}
                        onClick={this.props.onInsertRowClick}
                    >
                        <NeoIcon icon={"plus"}  size={'m'}/>
                    </NeoButton>}
                    {this.state.barSize >= barSize.medium && <div className='verticalLine'/>}
                    {this.state.barSize >= barSize.medium && <NeoButton
                        type={'link'}
                        hidden={false}
                        title={this.props.t("apply changes")}
                        className={"margin-left margin-top"}
                        onClick={this.props.onApplyEditChangesClick}
                    >
                        <NeoIcon icon={"mark"} size={'m'}/>
                    </NeoButton>}
                    {this.state.barSize>= barSize.medium && <NeoButton
                        type={'link'}
                        hidden={this.props.isDeleteRowsHidden}
                        title={this.props.t("delete selected")}
                        className={"margin-top inter-button-margin"}
                        onClick={this.props.onDeleteSelectedRowsClick}
                    >
                        <NeoIcon icon={"rubbish"} size={'m'}/>
                    </NeoButton>}
                    {this.state.barSize >= barSize.medium && <div className='verticalLine'/>}
                    {this.state.barSize >= barSize.medium && <NeoButton
                        type={'link'}
                        hidden={this.props.isCopySelectedHidden}
                        title={this.props.t("copy selected")}
                        className={"margin-top margin-left"}
                        onClick={this.props.onCopySelectedRowsClick}
                    >
                        <NeoIcon icon={"duplicate"} size={'m'}/>
                    </NeoButton>}
                </div>
                <div className='flex-bar-item'>
                    {this.state.barSize > barSize.extraSmall && <NeoInput
                        hidden={false}
                        className={"search-input element-top-margin"}
                        type={"search"}
                        onChange={this.props.onEditFilterChange}
                        id={"quickFilter"}
                        placeholder={this.props.t("quick filter")}
                    />}
                    <div className='verticalLine'/>
                    <NeoButton
                        title={this.props.t('fullscreen')}
                        className="buttonFullScreen margin-top margin-left"
                        type="link"
                        onClick={this.props.onFullscreenClick}
                    >
                        {this.props.isFullScreenOn  ?
                            <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={'#5E6785'}/>
                            :
                            <NeoIcon icon={"fullScreen"} size={"m"} color={'#5E6785'}/>}
                    </NeoButton>
                </div>
            </div>
            {this.state.barSize <= barSize.extraSmall && <div className={"horizontal-line"}/>}
            {this.state.barSize <= barSize.extraSmall && <div className={"block action-menu-item"}>
                <NeoInput
                hidden={false}
                className={"search-input fill-space"}
                type={"search"}
                onChange={this.props.onEditFilterChange}
                id={"quickFilter"}
                placeholder={this.props.t("quick filter")}
                />
            </div>}
        </div>
    };

    render() {
        return this.props.barMode === "edit" 
            ? this.getEditPanel() 
            : this.props.barMode === "diagram" 
                ? this.getDiagramPanel() 
                : this.getGridPanel()
    }
}

export default withTranslation()(DatasetBar)
