import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {Dropdown, Menu, Select} from 'antd';
import './../../../styles/DatasetBar.css';

import {NeoButton, NeoColor, NeoInput, NeoSelect, NeoTypography} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {ClickParam} from "antd/lib/menu";
import {IDiagram, paramType} from "./DatasetView";

const { Option, OptGroup } = Select;

enum barSize {
    extraSmall,
    small,
    medium,
    large
}

interface props {
    onExportMenuClick: (e:ClickParam) => void,
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
                    style={{marginLeft: "16px", height: "32px", marginTop: "4px"}}
                    type="search"
                    onChange={this.props.onChange}
                    id={"quickFilter"}
                    placeholder={this.props.t(this.props.placeholder)}
                />
                <NeoButton
                    style={{marginLeft: "16px", marginTop: "8px"}}
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
                    style={{marginLeft: "16px", marginTop: "8px"}}
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

class DatasetBar extends React.Component<props, State> {

    barRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {
            barSize: barSize.large,
            isQuickSearchExpanded: false
        };
    }

    handleResize = () => {
        if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > 900) {
            this.setState({barSize:barSize.large, isQuickSearchExpanded: false})
        } else if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > 630) {
            this.setState({barSize:barSize.medium})
        } else if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > 510) {
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
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <Menu.Item className={"actionMenuItem"} key={paramType.filter}>
                <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>{this.props.t("filters")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <Menu.Item className={"actionMenuItem"} key={paramType.sort}>
                <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>{this.props.t("sorts")}
            </Menu.Item>}
            {this.state.barSize <= barSize.small && !this.props.isServerFunctionsHidden && <div className={"menuHorizontalLine"}/>}
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"actionMenuItem"} key={paramType.calculations}>
                <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>{this.props.t("calculator")}
            </Menu.Item>}
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"actionMenuItem"} key={paramType.aggregate}>
                <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>{this.props.t("aggregations")}
            </Menu.Item>}
            <Menu.Item className={"actionMenuItem"} key={'diagram'}>
                <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>{this.props.t("diagram")}
            </Menu.Item>
            {!this.props.isServerFunctionsHidden && <Menu.Item className={"actionMenuItem"} key={paramType.group}>
                <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>{this.props.t("grouping")}
            </Menu.Item>}
            <Menu.Item className={"actionMenuItem"} key={paramType.hiddenColumns}>
                <NeoIcon icon={'hide'} color={'#5E6785'} size={'m'}/>{this.props.t("hiddencolumns")}
            </Menu.Item>
            <div className={"menuHorizontalLine"}/>
            <Menu.Item className={"actionMenuItem"} key='save'>
                <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>{this.props.t("save")}
            </Menu.Item>
            {this.props.isDeleteButtonVisible && <Menu.Item className={"actionMenuItem"} key='delete'>
                <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{this.props.t("delete")}
            </Menu.Item>}
            {this.props.isEditButtonVisible && <div className={"menuHorizontalLine"}/>}
            {this.props.isEditButtonVisible && <Menu.Item className={"actionMenuItem"} key='edit'>
                <NeoIcon icon={'edit'} color={'#5E6785'} size={'m'}/>{this.props.t("edit")}
            </Menu.Item>}
        </Menu>
    };

    getSearch = () => {
        return this.state.barSize <= barSize.medium
            ?
            <SearchTransformer
                id={"searchTransformer"}
                className={this.state.isQuickSearchExpanded ? "adaptiveBarFlex fillSpace" : "adaptiveBarFlex"}
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
                style={{width:'184px', height: "32px", marginTop: "4px"}}
                type="search"
                onChange={this.props.onFilterChange}
                id={"quickFilter"}
                placeholder={this.props.t("quick filter")}
            />
    };

    getActionButtons = () => {
        return !this.props.isServerFunctionsHidden
            ?
            <div className={this.state.barSize <= barSize.small ? "adaptiveBarHidden"  : "adaptiveBarFlex"}>
                <div className={this.state.barSize <= barSize.small ? "adaptiveBarHidden"  : "adaptiveBarFlex"}>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>
                    <NeoButton type={'link'} title={this.props.t('filters')} style={{marginTop:'7px', marginLeft: "16px"}}
                               onClick={this.props.onFiltersClick}>
                        <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('sorts')} style={{marginTop:'7px', marginLeft: "11px"}}
                               onClick={this.props.onSortsClick}>
                        <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <div className='verticalLine'  style={{height: '40px', marginLeft: "16px"}}/>
                </div>
                <div className={this.state.barSize <= barSize.medium ? 'adaptiveBarHidden' : 'adaptiveBarFlex'}>
                    <NeoButton type={'link'} title={this.props.t('calculator')}
                               style={{marginLeft:'16px', marginTop:'7px'}}
                               onClick={this.props.onCalculatorClick}>
                        <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('aggregations')}
                               style={{marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onAggregationsClick}>
                        <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('diagram')}
                               style={{marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('grouping')}
                               style={{marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onGroupingClick}>
                        <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('hiddencolumns')}
                               style={{color: 'rgb(151, 151, 151)', marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onHiddenClick}>
                        <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    <div className='verticalLine'  style={{marginLeft:'16px', height: '40px'}}/>
                    <NeoButton type={'link'} title={this.props.t('save')}  style={{marginLeft:'16px', marginTop:'7px'}}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    {
                        this.props.isDeleteButtonVisible &&
                        <div>
                            <NeoButton type={'link'} title={this.props.t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
                                       onClick={this.props.onDeleteClick}>
                                <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                            </NeoButton>
                        </div>
                    }
                    <div className='verticalLine' style={{marginLeft:'16px', height: '40px'}}/>
                    {
                        this.props.isEditButtonVisible &&
                        <NeoButton
                            type={'link'}
                            title={this.props.t('edit')}
                            style={{color: 'rgb(151, 151, 151)', background: '#F2F2F2', marginTop:'7px', marginLeft: "20px"}}
                            onClick={this.props.onEditClick}>
                            <NeoIcon icon={"edit"} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                    }
                </div>
            </div>
            :
            <div>
                <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>
                <NeoButton type={'link'} title={this.props.t('diagram')}
                           style={{marginLeft:'8px', marginTop:'7px'}}
                           onClick={this.props.onDiagramsClick}>
                    <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>
                </NeoButton>
                <NeoButton type={'link'} title={this.props.t('hiddencolumns')}
                           style={{color: 'rgb(151, 151, 151)', marginLeft:'8px', marginTop:'7px'}}
                           onClick={this.props.onHiddenClick}>
                    <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                </NeoButton>
            </div>
    };

    getExportMenu = () => {
        return <Menu
            key='actionMenu'
            onClick={this.props.onExportMenuClick}
            style={{width: '150px'}}>
            <Menu.Item key='exportToDocx'>
                {this.props.t("export to docx")}
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                {this.props.t("export to excel")}
            </Menu.Item>
        </Menu>
    };

    getExportButtons = () => {
        return <div className={"adaptiveBarFlex"}>
            <div className='verticalLine' style={{height: '40px', marginLeft: "17px"}}/>
            <Dropdown overlay={this.getExportMenu()} placement="bottomRight">
                <div>
                    <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginLeft: "16px", marginTop:'8px'}}/>
                </div>
            </Dropdown>
            <NeoButton
                title={this.props.t('fullscreen')}
                type={'link'} style={{marginLeft: "10px", marginTop:'7px'}}
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
            id='gridEditBar' className={this.state.barSize <= barSize.extraSmall ? "functionalBar__header adaptiveBarColumnFlex"  : "functionalBar__header"}>
            <div className={"block adaptiveBarMenuVisible " + (this.state.barSize !== barSize.extraSmall && "fillSpace")} style={{}}>
                {this.getSearch()}
                {!this.state.isQuickSearchExpanded && <div className={this.state.barSize <= barSize.medium ? "verticalLine" : "adaptiveBarHidden"} style={{height: '40px', marginLeft: "24px"}}/>}
                {!this.state.isQuickSearchExpanded && <Dropdown
                    overlay={this.getAdaptiveMenu()} placement="bottomRight">
                    <div
                        style={{marginLeft: "16px", marginTop:'9px'}}
                        className={this.state.barSize <= barSize.medium ? "adaptiveBarFlex" : "adaptiveBarHidden"}>
                        <NeoIcon icon={"more"} size={"m"} color={'#5E6785'}/>
                    </div>
                </Dropdown>}
                {!this.state.isQuickSearchExpanded && this.getActionButtons()}
                {this.state.barSize <= barSize.extraSmall && this.getExportButtons()}
            </div>
            <div className={this.state.barSize <= barSize.extraSmall ? "horizontalLine"  : "adaptiveBarHidden"}/>
            <div id={"selectsInFullScreen"} className={"block adaptiveBarMenuVisible"}>
                {(!this.state.isQuickSearchExpanded || this.state.barSize <= barSize.extraSmall)
                && <span className='caption'>{this.props.t("version")}</span>}
                {this.props.isComponentsLoaded
                && (!this.state.isQuickSearchExpanded || this.state.barSize <= barSize.extraSmall)
                &&
                <NeoSelect
                    className={this.state.barSize === barSize.extraSmall ? "fillSpace" : undefined}
                    getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}
                    width={'184px'}
                    allowClear={this.props.currentDatasetComponent.eContents()[0].get('access') !== "Default"}
                    style={{marginTop:'6px'}}
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
            <div
                ref={this.barRef}
                className="functionalBar__header">
                <div className='block' style={{marginLeft: "17.33px", display: "flex", marginRight: "40px"}}>
                    <NeoButton
                        type={'link'}
                        title={this.props.t("back to table")}
                        style={{background: '#F2F2F2', color: NeoColor.grey_9, marginTop: "4px"}}
                        suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                        onClick={this.props.onBackToTableClick}
                    >
                        <span style={{marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal"}}>{this.props.t("back to table")}</span>
                    </NeoButton>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "40px"}}/>
                    <NeoButton type={'link'} title={this.props.t('add')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'16px'}}
                               onClick={this.props.onAddDiagramClick}
                    >
                        <NeoIcon icon={"plus"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={this.props.t('edit')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'10px'}}
                               onClick={this.props.onEditDiagramClick}
                    >
                        <NeoIcon icon={"edit"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>

                    <NeoButton type={'link'} title={this.props.t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
                               onClick={this.props.onDeleteDiagramClick}
                    >
                        <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>
                </div>

                <div className='block'>


                    <div id="selectInGetDiagramPanel" style={{display: 'inline-block', marginTop: "5px"}}>
                        <NeoSelect
                            getPopupContainer={() => document.getElementById ('selectInGetDiagramPanel') as HTMLElement}
                            style={{ width: '192x'}}
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
                    </div>
                    <div id={"dropdownInGridPanel"}   className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>


                    <span className={"checkboxDiagram"} style={{marginTop: "10px", marginLeft: "16px"}}>
                        <NeoInput type={'checkbox'} onChange={this.props.onWithTableCheck} style={{marginTop: "6px", background: '#F2F2F2'}}/>
                      <span style={{display: 'inline-block', marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal", marginLeft: "30px"}}>{this.props.t("download with table")}</span>
                    </span>
                    {this.getExportButtons()}
                </div>

            </div>
        )
    };

    getEditPanel = () => {
        const { t } = this.props;
        return <div ref={this.barRef} className="functionalBar__header">
            <div className='block' style={{margin: "auto 16px", display: "flex"}}>
                <NeoButton
                    type={'link'}
                    title={t('edit')}
                    style={{color: NeoColor.grey_9, marginTop: "4px"}}
                    suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                    onClick={this.props.onBackFromEditClick}
                >
                    <span><NeoTypography style={{color: NeoColor.grey_9}} type={'body-regular'}>{t("exitFromEditMode")}</NeoTypography></span>
                </NeoButton>
                <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>
                <NeoButton
                    type={'link'}
                    hidden={this.props.isInsertRowHidden}
                    title={t("add row")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                    onClick={this.props.onInsertRowClick}
                >
                    <NeoIcon icon={"plus"}  size={'m'}/>
                </NeoButton>
                <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>
                <NeoButton
                    type={'link'}
                    hidden={false}
                    title={t("apply changes")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                    onClick={this.props.onApplyEditChangesClick}
                >
                    <NeoIcon icon={"mark"} size={'m'}/>
                </NeoButton>
                <NeoButton
                    type={'link'}
                    hidden={this.props.isDeleteRowsHidden}
                    title={t("delete selected")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "8px"}}
                    onClick={this.props.onDeleteSelectedRowsClick}
                >
                    <NeoIcon icon={"rubbish"} size={'m'}/>
                </NeoButton>
                <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>
                <NeoButton
                    type={'link'}
                    hidden={this.props.isCopySelectedHidden}
                    title={t("copy selected")}
                    style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"}}
                    onClick={this.props.onCopySelectedRowsClick}
                >
                    <NeoIcon icon={"duplicate"} size={'m'}/>
                </NeoButton>
            </div>
            <div className='block' style={{margin: "auto 16px", display: "flex"}}>
                <NeoInput
                    hidden={false}
                    style={{width:'184px', height: "32px", marginTop: "5px"}}
                    type={"search"}
                    onChange={this.props.onEditFilterChange}
                    id={"quickFilter"}
                    placeholder={t("quick filter")}
                />
                <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>

                <NeoButton
                    title={t('fullscreen')}
                    className="buttonFullScreen"
                    type="link"
                    style={{
                        float: "right",
                        marginLeft: '16px',
                        color: 'rgb(151, 151, 151)',
                        marginTop: "6px",
                        background: '#F2F2F2'
                    }}
                    onClick={this.props.onFullscreenClick}
                >
                    {this.props.isFullScreenOn  ?
                        <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={'#5E6785'}/>
                        :
                        <NeoIcon icon={"fullScreen"} size={"m"} color={'#5E6785'}/>}
                </NeoButton>
            </div>
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
