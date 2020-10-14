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
    isShortSize: boolean,
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
}


class DatasetBar extends React.Component<props, State> {

    barRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {
            barSize: barSize.large
        };
    }

    handleResize = () => {
        if ((this.barRef.current ? this.barRef.current.offsetWidth : 0) > 900) {
            this.setState({barSize:barSize.large})
        } else {
            this.setState({barSize:barSize.medium})
        }
    }

    componentDidMount(): void {
        window.addEventListener("appAdaptiveResize", this.handleResize);
        window.addEventListener("resize", this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener("appAdaptiveResize", this.handleResize);
        window.removeEventListener("resize", this.handleResize);
    }

    onAdaptiveMenuClick(e:{key:paramType|string}) {
        /*if (e.key === 'diagram') {
            this.DiagramButton()
        } else if (e.key === 'save') {
            this.setState({saveMenuVisible:!this.state.saveMenuVisible})
        } else if (e.key === 'delete') {
            this.setState({deleteMenuVisible:!this.state.deleteMenuVisible})
        } else {
            this.props.handleDrawerVisibility(e.key as paramType)
        }*/
    }

    getGridPanel = () => {
        const { t } = this.props;
        const adaptiveMenu =
            <Menu
                onClick={(e: any) => this.onAdaptiveMenuClick(e)}

            >
                <Menu.Item key={paramType.filter}>
                    <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>{t("filter")}
                </Menu.Item>
                <Menu.Item key={paramType.sort}>
                    <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>{t("sort")}
                </Menu.Item>
                <Menu.Item key={paramType.calculations}>
                    <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>{t("calculator")}
                </Menu.Item>
                <Menu.Item key={paramType.aggregate}>
                    <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>{t("aggregations")}
                </Menu.Item>
                <Menu.Item key={'diagram'}>
                    <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>{t("diagram")}
                </Menu.Item>
                <Menu.Item key={paramType.group}>
                    <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>{t("grouping")}
                </Menu.Item>
                <Menu.Item key={paramType.hiddenColumns}>
                    <NeoIcon icon={'hide'} color={'#5E6785'} size={'m'}/>{t("hiddencolumns")}
                </Menu.Item>
                <Menu.Item key='save'>
                    <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>{t("save")}
                </Menu.Item>
                <Menu.Item key='delete'>
                    <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{t("delete")}
                </Menu.Item>
                //TODO edit
                {/*<Menu.Item key='edit'>
                    <NeoIcon icon={'rubbish'} color={'#5E6785'} size={'m'}/>{t("delete")}
                </Menu.Item>*/}
            </Menu>;
        const menu = (<Menu
            key='actionMenu'
            onClick={this.props.onExportMenuClick}
            style={{width: '150px'}}
        >
            <Menu.Item key='exportToDocx'>
                {t("export to docx")}
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                {t("export to excel")}
            </Menu.Item>
        </Menu>);
        return <div
            ref={this.barRef}
            id='gridEditBar' className='functionalBar__header'>
            <div className='block'>
                <NeoInput
                    style={{width:'184px', height: "32px", marginTop: "4px"}}
                    type="search"
                    onChange={this.props.onFilterChange}
                    id={"quickFilter"}
                    placeholder={t("quick filter")}
                />
                <Dropdown
                    overlay={adaptiveMenu} placement="bottomRight">
                    <div className={this.state.barSize <= barSize.medium ? "adaptiveBarMenuVisible" : "adaptiveBarMenuHidden"}>
                        <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginLeft: "16px", marginTop:'8px'}}/>
                    </div>
                </Dropdown>
                <div className='verticalLine' style={{height: '40px', marginLeft: "24px"}}/>
                <NeoButton type={'link'} title={t('filters')}
                           style={{marginTop:'7px', marginLeft: "16px"}}
                           onClick={this.props.onFiltersClick}>
                    <NeoIcon icon={'filter'} color={'#5E6785'} size={'m'}/>
                </NeoButton>
                {!this.props.isShortSize ? <NeoButton type={'link'} title={t('sorts')} style={{marginTop:'7px', marginLeft: "11px"}}
                                                          onClick={this.props.onSortsClick}>
                    <NeoIcon icon={'sort'} color={'#5E6785'} size={'m'}/>
                </NeoButton> : null}
                <div className='verticalLine'  style={{height: '40px', marginLeft: "16px"}}/>
                <div className={this.state.barSize <= barSize.medium ? 'barButtonsMedium' : 'block'}>
                    {!this.props.isShortSize ? <NeoButton type={'link'} title={t('calculator')}
                                                              style={{marginLeft:'16px', marginTop:'7px'}}
                                                              onClick={this.props.onCalculatorClick}>
                        <NeoIcon icon={'calculator'} color={'#5E6785'} size={'m'}/>
                    </NeoButton> : null}
                    {!this.props.isShortSize ? <NeoButton type={'link'} title={t('aggregations')}
                                                              style={{marginLeft:'8px', marginTop:'7px'}}
                                                              onClick={this.props.onAggregationsClick}>
                        <NeoIcon icon={'plusBlock'} color={'#5E6785'} size={'m'}/>
                    </NeoButton> : null}
                    <NeoButton type={'link'} title={t('diagram')}
                               style={{marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onDiagramsClick}>
                        <NeoIcon icon={'barChart'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    {!this.props.isShortSize ? <NeoButton type={'link'} title={t('grouping')}
                                                              style={{marginLeft:'8px', marginTop:'7px'}}
                                                              onClick={this.props.onGroupingClick}>
                        <NeoIcon icon={'add'} color={'#5E6785'} size={'m'}/>
                    </NeoButton> : null}
                    <NeoButton type={'link'} title={t('hiddencolumns')}
                               style={{color: 'rgb(151, 151, 151)', marginLeft:'8px', marginTop:'7px'}}
                               onClick={this.props.onHiddenClick}
                    >
                        <NeoIcon icon={"hide"} color={'#5E6785'} size={'m'}/>
                    </NeoButton>

                    <div className='verticalLine'  style={{marginLeft:'16px', height: '40px'}}/>
                    <NeoButton type={'link'} title={t('save')}  style={{marginLeft:'16px', marginTop:'7px'}}
                               onClick={this.props.onSaveClick}>
                        <NeoIcon icon={'mark'} color={'#5E6785'} size={'m'}/>
                    </NeoButton>
                    {this.props.isDeleteButtonVisible
                    &&
                    <div>
                        <NeoButton type={'link'} title={t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
                                   onClick={this.props.onDeleteClick}>

                            <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
                        </NeoButton>
                    </div>
                    }
                    <div className='verticalLine' style={{marginLeft:'16px', height: '40px'}}/>
                    {this.props.isEditButtonVisible ?
                        <NeoButton
                            type={'link'}
                            title={t('edit')}
                            style={{color: 'rgb(151, 151, 151)', background: '#F2F2F2', marginTop:'7px', marginLeft: "20px"}}
                            onClick={this.props.onEditClick}
                        >
                            <NeoIcon icon={"edit"} color={'#5E6785'} size={'m'}/>
                        </NeoButton>
                        :
                        null
                    }
                </div>
            </div>
            <div className='block'>
                <span className='caption'>{t("version")}</span>
                {this.props.isComponentsLoaded
                &&
                <div id="selectsInFullScreen" style={{display: 'inline-block'}}>
                    <NeoSelect
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
                </div>
                }
                <div className='verticalLine' style={{height: '40px', marginLeft: "17px"}}/>

                <Dropdown overlay={menu} placement="bottomRight"
                          getPopupContainer={() => document.getElementById ('selectsInFullScreen') as HTMLElement}>
                    <div>
                        <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginLeft: "16px", marginTop:'8px'}}/>
                    </div>
                </Dropdown>
                <NeoButton
                    title={t('fullscreen')}
                    type={'link'} style={{marginLeft: "10px", marginTop:'7px'}}
                    onClick={this.props.onFullscreenClick}>
                    {this.props.isFullScreenOn  ?
                        <NeoIcon icon={'fullScreenUnDo'} color={'#5E6785'} size={'m'}/>
                        :
                        <NeoIcon icon={'fullScreen'} color={'#5E6785'} size={'m'}/>
                    }
                </NeoButton>
            </div>
        </div>
    };

    getDiagramPanel = () => {
        const { t } = this.props;
        const menu = (<Menu
            key='actionMenu'
            onClick={this.props.onExportMenuClick}
            style={{width: '150px'}}
        >
            <Menu.Item key='exportToDocx'>
                {t("export to docx")}
            </Menu.Item>
            <Menu.Item key='exportToExcel'>
                {t("export to excel")}
            </Menu.Item>
        </Menu>);
        return (
            <div className="functionalBar__header">
                <div className='block' style={{marginLeft: "17.33px", display: "flex", marginRight: "40px"}}>
                    <NeoButton
                        type={'link'}
                        title={t("back to table")}
                        style={{background: '#F2F2F2', color: NeoColor.grey_9, marginTop: "4px"}}
                        suffixIcon={<NeoIcon icon={"arrowLong"} color={NeoColor.grey_9}/>}
                        onClick={this.props.onBackToTableClick}
                    >
                        <span style={{marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal"}}>{t("back to table")}</span>
                    </NeoButton>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "40px"}}/>
                    <NeoButton type={'link'} title={t('add')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'16px'}}
                               onClick={this.props.onAddDiagramClick}
                    >
                        <NeoIcon icon={"plus"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                    <NeoButton type={'link'} title={t('edit')} style={{color: 'rgb(151, 151, 151)', marginTop: "6px", background: '#F2F2F2', marginLeft:'10px'}}
                               onClick={this.props.onEditDiagramClick}
                    >
                        <NeoIcon icon={"edit"} size={"m"} color={'#5E6785'}/>
                    </NeoButton>
                    <div className='verticalLine' style={{height: '40px', marginLeft: "16px"}}/>

                    <NeoButton type={'link'} title={t('delete')} style={{color: 'rgb(151, 151, 151)',  marginTop: "6px", background: '#F2F2F2', marginLeft: "16px"  }}
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
                  <span style={{display: 'inline-block', marginBottom: "5px", fontSize: "14px", lineHeight: "16px", fontWeight: "normal", fontStyle: "normal", marginLeft: "30px"}}>{t("download with table")}</span>
                </span>


                    <Dropdown overlay={menu} placement="bottomLeft"
                              getPopupContainer={() => document.getElementById ("dropdownInGridPanel") as HTMLElement}>
                        <div style={{marginRight: "5px"}}>
                            <NeoIcon icon={"download"} size={"m"} color={'#5E6785'} style={{marginTop: "7px", marginLeft: "16px"}}/>
                        </div>
                    </Dropdown>

                    <div id={"dropdownInGridPanel"}   className='verticalLine' style={{height: '40px', marginLeft: "16px" }}/>


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
        )
    };

    getEditPanel = () => {
        const { t } = this.props;
        return <div className="functionalBar__header">
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
