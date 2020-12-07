import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {Dropdown, Menu, Select} from 'antd';
import './../../../styles/DatasetBar.css';

import {NeoButton, NeoColor, NeoHint, NeoInput, NeoSelect, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {IDiagram, paramType} from "./DatasetView";
import {IServerQueryParam} from "../../../MainContext";
import {adaptiveElementSize, getAdaptiveSize} from "../../../utils/adaptiveResizeUtils";

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
    barSize: adaptiveElementSize;
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
                    className={"search-input"}
                    type="search"
                    onChange={this.props.onChange}
                    id={"quickFilter"}
                    placeholder={this.props.t(this.props.placeholder)}
                />
                <NeoHint title={this.props.t('close')}>
                <NeoButton
                    className={"search-button"}
                    type={'link'}
                    onClick={()=>{
                        this.setState({isExpanded: false});
                        this.props.onCollapse && this.props.onCollapse()
                    }}
                    id={"quickFilter"}>
                    <NeoIcon icon={"close"} color={NeoColor.grey_6}/>
                </NeoButton>
                </NeoHint>
            </div>
            :
            <div id={this.props.id} className={this.props.className}>
                <NeoHint title={this.props.t(this.props.placeholder)}>
                    <NeoButton
                        className={"search-button"}
                        type={'link'}
                        onClick={() => {
                            this.setState({isExpanded: true});
                            this.props.onExpand && this.props.onExpand()
                        }}
                        id={"quickFilter"}>
                        <NeoIcon icon={"search"} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                </NeoHint>
            </div>

    }
}

class DatasetBar extends React.Component<props, State> {

    barRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {
            barSize: adaptiveElementSize.large,
            isQuickSearchExpanded: false,
            isExportChecked: false
        };
    }

    handleResize = () => {
        const barSize = getAdaptiveSize(this.barRef.current ? this.barRef.current.offsetWidth : 0, this.props.barMode);
        if (barSize >= adaptiveElementSize.large) {
            this.setState({barSize, isQuickSearchExpanded: false})
        } else {
            this.setState({barSize})
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
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden &&
            <Menu.Item className={"action-menu-item"} key={paramType.filter}>
                <NeoIcon icon={'filter'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("filters")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden &&
            <Menu.Item className={"action-menu-item"} key={paramType.sort}>
                <NeoIcon icon={'sort'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("sorts")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <div className={"menu-horizontal-line"}/>}
            {!this.props.isServerFunctionsHidden &&
            <Menu.Item className={"action-menu-item"} key={paramType.calculations}>
                <NeoIcon icon={'calculator'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("calculator")}
            </Menu.Item>}
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.aggregate}>
                <NeoIcon icon={'plusBlock'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("aggregations")}
            </Menu.Item>}
            <Menu.Item className={"action-menu-item"} key={'diagram'}>
                <NeoIcon icon={'barChart'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("diagram")}
            </Menu.Item>
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"action-menu-item"} key={paramType.group}>
                <NeoIcon icon={'add'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("grouping")}
            </Menu.Item>}
            <Menu.Item className={"action-menu-item"} key={paramType.hiddenColumns}>
                <NeoIcon icon={'hide'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("hiddencolumns")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='save'>
                <NeoIcon icon={'mark'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("save")}
            </Menu.Item>
            {this.props.isDeleteButtonVisible && <Menu.Item className={"action-menu-item"} key='delete'>
                <NeoIcon icon={'rubbish'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("delete")}
            </Menu.Item>}
            {this.props.isEditButtonVisible && <div className={"menu-horizontal-line"}/>}
            {this.props.isEditButtonVisible && <Menu.Item className={"action-menu-item"} key='edit'>
                <NeoIcon icon={'edit'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("edit")}
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
                <NeoIcon icon={'plus'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("add")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='edit'>
                <NeoIcon icon={'edit'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("edit")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='delete'>
                <NeoIcon icon={'rubbish'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("delete")}
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
                <NeoIcon icon={'plus'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("add row")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='apply changes'>
                <NeoIcon icon={'mark'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("apply changes")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='delete selected'>
                <NeoIcon icon={'rubbish'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("delete selected")}
            </Menu.Item>
            <div className={"menu-horizontal-line"}/>
            <Menu.Item className={"action-menu-item"} key='copy selected'>
                <NeoIcon icon={'duplicate'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("copy selected")}
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
                className={"search-input"}
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
        });
        this.props.serverSorts.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                isSort = true;
            }
        });
        this.props.serverCalculatedExpression.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                isCalculator = true;
            }
        });
        this.props.serverAggregates.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined){
                serverAggregates = true;
            }
        });
        if (this.props.diagrams.length > 0){
            isDiagramms = true
        }
        this.props.serverGroupBy.forEach(element => {
            if (element.datasetColumn !== undefined  && element.operation !== undefined && element.value !== undefined) {
                serverGroupBy = true;
            }
        });
        this.props.groupByColumn.forEach(element => {
            if (element.datasetColumn !== undefined) {
                serverGroupBy = true;
            }
        });

        return !this.props.isServerFunctionsHidden
            ?
            <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                    <div className='vertical-line'/>
                    <NeoHint  title={this.props.t('filters')}>
                    <NeoButton type={'link'} className={"bar-button--margin-medium"}
                               onClick={this.props.onFiltersClick}>
                        <NeoIcon icon={isFilter ? 'filterCheck' : 'filter'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('sorts')}>
                        <NeoButton type={'link'} className={"bar-button--margin-small"}
                                   onClick={this.props.onSortsClick}>
                            <NeoIcon icon={isSort ? 'sortCheck' : 'sort'} color={NeoColor.violete_4} size={'m'}/>
                        </NeoButton>
                    </NeoHint>
                    <div className='vertical-line'/>
                </div>
                <div className={this.state.barSize <= barSize.medium ? 'adaptive-bar-hidden' : 'flex-bar-item'}>
                    <NeoHint  title={this.props.t('calculator')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-medium"}
                               onClick={this.props.onCalculatorClick}>
                        <NeoIcon icon={isCalculator ? 'calculatorCheck' : 'calculator'} color={NeoColor.violete_4}
                                 size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('aggregations')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-small"}
                               onClick={this.props.onAggregationsClick}>
                        <NeoIcon icon={serverAggregates ? 'plusBlockCheck' : 'plusBlock'} color={NeoColor.violete_4}
                                 size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('diagram')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-small"}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={isDiagramms ? 'barChartCheck' : 'barChart'} color={NeoColor.violete_4}
                                 size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('grouping')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-small"}
                               onClick={this.props.onGroupingClick}>
                        <NeoIcon icon={serverGroupBy ? 'addCheck' : 'add'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('hiddencolumns')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-small"}
                               onClick={this.props.onHiddenClick}>
                        <NeoIcon icon={"hide"} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <div className='vertical-line'/>
                    <NeoHint  title={this.props.t('save')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-medium"}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    {
                        this.props.isDeleteButtonVisible &&
                        <div>
                            <NeoHint  title={this.props.t('delete')}>
                            <NeoButton type={'link'}
                                       className={"bar-button--margin-small"}
                                       onClick={this.props.onDeleteClick}>
                                <NeoIcon icon={"rubbish"} size={"m"} color={NeoColor.violete_4}/>
                            </NeoButton>
                            </NeoHint>
                        </div>
                    }
                    <div className='vertical-line'/>
                    {
                        this.props.isEditButtonVisible &&
                        <NeoHint  title={this.props.t('edit')}>
                        <NeoButton
                            type={'link'}
                            className={"bar-button--margin-medium"}
                            onClick={this.props.onEditClick}>
                            <NeoIcon icon={"edit"} color={NeoColor.violete_4} size={'m'}/>
                        </NeoButton>
                        </NeoHint>
                    }
                </div>
            </div>
            :
            <div className={this.state.barSize <= barSize.small ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                <div className={this.state.barSize < barSize.large ? "adaptive-bar-hidden"  : "flex-bar-item"}>
                    <div className='vertical-line'/>
                    <NeoHint  title={this.props.t('diagram')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-medium"}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={'barChart'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <NeoHint  title={this.props.t('hiddencolumns')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-small"}
                               onClick={this.props.onHiddenClick}>
                        <NeoIcon icon={"hide"} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    <div className='vertical-line'/>
                    <NeoHint  title={this.props.t('save')}>
                    <NeoButton type={'link'}
                               className={"bar-button--margin-medium"}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                    </NeoHint>
                    {
                        this.props.isDeleteButtonVisible &&
                        <div>
                            <NeoHint  title={this.props.t('delete')}>
                            <NeoButton type={'link'}
                                       className={"bar-button--margin-small"}
                                       onClick={this.props.onDeleteClick}>
                                <NeoIcon icon={"rubbish"} size={"m"} color={NeoColor.violete_4}/>
                            </NeoButton>
                            </NeoHint>
                        </div>
                    }
                    <div className='vertical-line'/>
                    {
                        this.props.isEditButtonVisible &&
                        <NeoHint  title={this.props.t('edit')}>
                        <NeoButton
                            type={'link'}
                            className={"bar-button--margin-medium"}
                            onClick={this.props.onEditClick}>
                            <NeoIcon icon={"edit"} color={NeoColor.violete_4} size={'m'}/>
                        </NeoButton>
                        </NeoHint>
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
                <span className={"checkbox-diagram"}>
                       <NeoInput type={'checkbox'} onChange={this.flipExportCheckbox}
                       checked={this.state.isExportChecked}/>
                       <span>{this.props.t("download with table")}</span>
                   </span>
            </Menu.Item>}
            {this.props.barMode === "diagram"
            && this.state.barSize <= barSize.small
            && <div className={"menu-horizontal-line"}/>}
            <Menu.Item className={"action-menu-item"} key='exportToDocx'>
                <NeoIcon icon={'fileWord'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("export to docx")}
            </Menu.Item>
            <Menu.Item className={"action-menu-item"} key='exportToExcel'>
                <NeoIcon icon={'fileExcel'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("export to excel")}
            </Menu.Item>
        </Menu>
    };

    getExportButtons = () => {
        return <div className={"flex-bar-item"}>
            <div className='vertical-line'/>
            <Dropdown overlay={this.getExportMenu()} placement="bottomRight">
                <div>
                    <NeoIcon icon={"download"} size={"m"} color={NeoColor.violete_4}
                             className={"export-download-icon"}/>
                </div>
            </Dropdown>
            <NeoHint title={this.props.t('fullscreen')}>
                <NeoButton
                    type={'link'} className={"full-screen-icon"}
                    onClick={this.props.onFullscreenClick}>
                    {this.props.isFullScreenOn ?
                        <NeoIcon icon={'fullScreenUnDo'} color={NeoColor.violete_4} size={'m'}/>
                        :
                        <NeoIcon icon={'fullScreen'} color={NeoColor.violete_4} size={'m'}/>
                    }
                </NeoButton>
            </NeoHint>
        </div>
    };

    getGridPanel = () => {
        return <div
            ref={this.barRef}
            className={this.state.barSize <= barSize.extraSmall ? "functionalBar__header adaptive-bar-column-flex"  : "functionalBar__header"}>
            <div className={"block flex-bar-item " + (this.state.barSize !== adaptiveElementSize.extraSmall && "fill-space")}>
                {this.getSearch()}
                {!this.state.isQuickSearchExpanded && <div className={this.state.barSize <= barSize.medium ? "vertical-line" : "adaptive-bar-hidden"}/>}
                {!this.state.isQuickSearchExpanded && <Dropdown
                    className={"adaptive-dropdown"}
                    overlay={this.getAdaptiveMenu()} placement="bottomRight">
                    <div
                        className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                        <NeoIcon icon={"more"} size={"m"} color={NeoColor.violete_4}/>
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
                    className={this.state.barSize === adaptiveElementSize.extraSmall ? "fill-space dataset-component-select" : "dataset-component-select"}
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
                <div className={'block space-between ' + (this.state.barSize !== adaptiveElementSize.extraSmall && "fill-space")}>
                    <div className='flex-bar-item'>
                        <NeoHint  title={this.props.t("back to table")}>
                        <NeoButton
                            type={'link'}
                            className={"bar-button"}
                            style={{color: NeoColor.grey_9}}
                            suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                            onClick={this.props.onBackToTableClick}
                        >
                            {this.state.barSize - 1 === adaptiveElementSize.large && <span className={"back-span-text"}>{this.props.t("back to table")}</span>}
                        </NeoButton>
                        </NeoHint>
                        <div className='vertical-line'/>
                        {this.state.barSize - 1 === adaptiveElementSize.large &&
                        <NeoHint  title={this.props.t('add')}>
                            <NeoButton type={'link'} className={"bar-button--margin-medium"}
                                       onClick={this.props.onAddDiagramClick}
                            >
                                <NeoIcon icon={"plus"} size={"m"} color={NeoColor.violete_4}/>
                            </NeoButton>
                        </NeoHint>}
                        {this.state.barSize - 1 === adaptiveElementSize.large &&
                        <NeoHint  title={this.props.t('edit')}>
                            <NeoButton type={'link'} className={"bar-button--margin-small"}
                                       onClick={this.props.onEditDiagramClick}
                            >
                                <NeoIcon icon={"edit"} size={"m"} color={NeoColor.violete_4}/>
                            </NeoButton>
                        </NeoHint>}
                        {this.state.barSize - 1 === adaptiveElementSize.large && <div className='vertical-line'/>}

                        {this.state.barSize - 1 === adaptiveElementSize.large &&
                        <NeoHint  title={this.props.t('delete')}>
                            <NeoButton type={'link'} className={"bar-button--margin-medium"}
                                       onClick={this.props.onDeleteDiagramClick}
                            >
                                <NeoIcon icon={"rubbish"} size={"m"} color={NeoColor.violete_4}/>
                            </NeoButton>
                        </NeoHint>}
                        {this.state.barSize - 1 === adaptiveElementSize.large && <div className='vertical-line'/>}
                        {this.state.barSize <= barSize.medium && <Dropdown
                            className={"adaptive-dropdown"}
                            overlay={this.getDiagramAdaptiveMenu()} placement="bottomRight">
                            <div
                                className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                                <NeoIcon icon={"more"} size={"m"} color={NeoColor.violete_4}/>
                            </div>
                        </Dropdown>}
                    </div>
                    <div className='flex-bar-item'>
                        {this.state.barSize > barSize.extraSmall && <div id="selectInGetDiagramPanel">
                            <NeoSelect
                                getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                                className={"diagram-select"}
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
                        {this.state.barSize >= barSize.medium && <div id={"dropdownInGridPanel"}   className='vertical-line'/>}
                        {this.state.barSize >= barSize.medium && <span className={"checkbox-diagram"}>
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
                        className={"diagram-select fill-space"}
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
            <div className={'block space-between ' + (this.state.barSize !== adaptiveElementSize.extraSmall && "fill-space")}>
                <div className='flex-bar-item'>
                    <NeoHint  title={this.props.t('back to table')}>
                    <NeoButton
                        type={'link'}
                        className={'bar-button'}
                        style={{color: NeoColor.grey_9}}
                        suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                        onClick={this.props.onBackFromEditClick}
                    >
                        {this.state.barSize === adaptiveElementSize.large && <span><NeoTypography style={{color: NeoColor.grey_9}} type={'body_regular'}>{this.props.t("exitFromEditMode")}</NeoTypography></span>}
                    </NeoButton>
                    </NeoHint>
                    <div className='vertical-line'/>
                    {this.state.barSize < barSize.medium && <Dropdown
                        className={"adaptive-dropdown"}
                        overlay={this.getEditAdaptiveMenu()} placement="bottomRight">
                        <div
                            className={this.state.barSize <= barSize.medium ? "flex-bar-item" : "adaptive-bar-hidden"}>
                            <NeoIcon icon={"more"} size={"m"} color={NeoColor.violete_4}/>
                        </div>
                    </Dropdown>}
                    {this.state.barSize >= barSize.medium &&
                    <NeoHint  title={this.props.t("add row")}>
                    <NeoButton
                        type={'link'}
                        hidden={this.props.isInsertRowHidden}
                        className={"bar-button--margin-medium"}
                        onClick={this.props.onInsertRowClick}
                    >
                        <NeoIcon icon={"plus"}  size={'m'}/>
                    </NeoButton>
                    </NeoHint>}
                    {this.state.barSize >= barSize.medium && <div className='vertical-line'/>}
                    {this.state.barSize >= barSize.medium &&
                    <NeoHint  title={this.props.t("apply changes")}>
                    <NeoButton
                        type={'link'}
                        hidden={false}
                        className={"bar-button--margin-medium"}
                        onClick={this.props.onApplyEditChangesClick}
                    >
                        <NeoIcon icon={"mark"} size={'m'}/>
                    </NeoButton>
                    </NeoHint>}
                    {this.state.barSize>= barSize.medium &&
                    <NeoHint  title={this.props.t("delete selected")}>
                    <NeoButton
                        type={'link'}
                        hidden={this.props.isDeleteRowsHidden}
                        className={"bar-button--margin-small"}
                        onClick={this.props.onDeleteSelectedRowsClick}
                    >
                        <NeoIcon icon={"rubbish"} size={'m'}/>
                    </NeoButton>
                    </NeoHint>}
                    {this.state.barSize >= barSize.medium && <div className='vertical-line'/>}
                    {this.state.barSize >= barSize.medium &&
                    <NeoHint  title={this.props.t("copy selected")}>
                    <NeoButton
                        type={'link'}
                        hidden={this.props.isCopySelectedHidden}
                        className={"bar-button--margin-medium"}
                        onClick={this.props.onCopySelectedRowsClick}
                    >
                        <NeoIcon icon={"duplicate"} size={'m'}/>
                    </NeoButton>
                    </NeoHint>}
                </div>
                <div className='flex-bar-item'>
                    {this.state.barSize > barSize.extraSmall && <NeoInput
                        hidden={false}
                        className={"search-input"}
                        type={"search"}
                        onChange={this.props.onEditFilterChange}
                        id={"quickFilter"}
                        placeholder={this.props.t("quick filter")}
                    />}
                    <div className='vertical-line'/>
                    <NeoHint  title={this.props.t('fullscreen')}>
                    <NeoButton
                        className="buttonFullScreen bar-button--margin-medium"
                        type="link"
                        onClick={this.props.onFullscreenClick}
                    >
                        {this.props.isFullScreenOn ?
                            <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={NeoColor.violete_4}/>
                            :
                            <NeoIcon icon={"fullScreen"} size={"m"} color={NeoColor.violete_4}/>}
                    </NeoButton>
                    </NeoHint>
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
