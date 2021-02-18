import React from 'react';
import Fullscreen from "react-full-screen";
import * as dateFns from "date-fns";
import {add} from "date-fns";
import Ecore, {EObject} from "ecore";
import {API} from "../../../modules/api";
import {enUS, ru} from "date-fns/locale";
import {withTranslation} from "react-i18next";
import {MainContext} from "../../../MainContext";
import {Dropdown, Menu} from "antd";
import StatusLegend from "./StatusLegend";
import CreateNotification from "./CreateNotification";
import {AgGridColumn, AgGridReact} from "@ag-grid-community/react";
import {AllCommunityModules} from "@ag-grid-community/all-modules";
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';

import EditNotification from "./EditNotification";
import {actionType, defaultTimestampFormat, eventType, grantType} from "../../../utils/consts";
import moment from "moment";
import {NeoButton, NeoCol, NeoColor, NeoDrawer, NeoInput, NeoRow, NeoSelect, NeoTypography, NeoHint, NeoOption} from "neo-design/lib";
import {NeoIcon} from "neo-icon/lib";
import {docxElementExportType, docxExportObject, handleExportDocx} from "../../../utils/docxExportUtils";
import {saveAs} from "file-saver";
import domtoimage from "dom-to-image";
import {Resizable} from "re-resizable";
import {Link} from "react-router-dom";
import {encodeAppURL} from "../../../EcoreApp";
import Paginator from "../dataset/Paginator";

const myNote = 'Личная заметка';

interface Props {
    paginationCurrentPage: number,
    paginationTotalPage: number,
    paginationPageSize: number,
    isGridReady: boolean,
    context: any,
    viewObject: any,
}

class Calendar extends React.Component<any, any> {

    private grid: React.RefObject<any>;
    private node: (Resizable|null);

    constructor(props: any) {
        super(props);
        this.state = {
            currentMonth: new Date(),
            selectedDate: new Date(),
            notificationStatus: [],
            notificationInstancesDTO: [],
            calendarLanguage: "",
            legendMenuVisible: false,
            createMenuVisible: false,
            editMenuVisible: false,
            fullScreenOn: false,
            periodicity: [],
            paginationPageSize: 10,
            isGridReady: false,
            years: [],
            months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            calendarVisible: true,
            editableNotification: {},
            gridOptions: {
                defaultColDef: {
                    resizable: true,
                    filter: true,
                    sortable: true
                }
            },
            columnDefs: [],
            rowData: [],
            filteredRowData: undefined,
            selectedValueInGrid: 'Системные заметки',
            frameworkComponents: {
                'actionMenu': this.actionMenu
            },
            myNotificationVisible: false,
            searchValue: undefined,
            deletedItem: false,
            classAppModule: undefined,
            isHidden: this.props.hidden,
            isDisabled: this.props.disabled,
            isReadOnly: this.props.grantType === grantType.read || this.props.disabled || this.props.isParentDisabled,
            isShowPrint: false
        };
        this.grid = React.createRef();
        this.handleEditMenu = this.handleEditMenu.bind(this)
    }

    actionMenu = (params: any) => (
        <div style={{marginLeft: '-32px', marginTop: '6px'}}>
            <NeoButton
                type="link"
                style={{width: '35px'}}
                onClick={() => this.handleEditMenu(params)}
            >
                <NeoIcon icon={"gear"} color={NeoColor.violete_5}/>
            </NeoButton>
            {
                this.state.myNotificationVisible &&
                <NeoButton
                    type="link"
                    style={{width: '35px'}}
                    onClick={() => this.deleteNotification(params)}
                >
                    <NeoIcon icon={"rubbish"} color={NeoColor.violete_5}/>
                </NeoButton>
            }
        </div>
    );

    onGridReady = (params: any) => {
        if (this.grid.current !== null) {
            this.grid.current.api = params.api;
            this.grid.current.columnApi = params.columnApi;
        }
    };

    getClassAppModule = () => {
        API.instance().fetchAllClasses(false).then(classes => {
            const eClass = classes.find((c: Ecore.EObject) => c._id === "//AppModule");
            if (eClass !== undefined) {
                this.setState({classAppModule: eClass})
            }
        });
    };

    getAllNotificationInstances(currentMonth: Date, updateViewObject: boolean) {
        if (this.props.viewObject.get('yearBook') !== null) {
            const monthStart = dateFns.startOfMonth(currentMonth);
            const monthEnd = dateFns.endOfMonth(monthStart);
            const dateFrom = moment(monthStart).format(defaultTimestampFormat);
            const dateTo = moment(monthEnd).format(defaultTimestampFormat);
            const ref: string = this.props.viewObject.eURI();
            const methodName: string = 'getNotificationInstances';

            if (updateViewObject && this.state.classAppModule !== undefined) {
                API.instance().findByKindAndName(this.state.classAppModule, this.props.context.viewObject.eContainer.get('name'), 999)
                    .then((result) => {
                        this.props.context.updateContext(({viewObject: result[0].eContents()[0].get('view')}))
                    })
            } else if (!updateViewObject) {
                API.instance().call(ref, methodName, [dateFrom, dateTo]).then((result: any) => {
                    let notificationInstancesDTO = JSON.parse(result).resources;
                    this.setState({notificationInstancesDTO});
                });
            }
        }
    };

    getAllStatuses() {
        this.props.context.userProfilePromise.then((userProfile: Ecore.Resource) => {
            const userProfileValue = userProfile.eContents()[0].get('params').array()
                .filter( (p: any) => p.get('key') === this.props.viewObject._id);
            if (userProfileValue.length !== 0) {
                let notificationStatus = JSON.parse(userProfileValue[0].get('value')).notificationStatus;
                this.setState({notificationStatus})
            }
            else {
                API.instance().fetchAllClasses(false).then(classes => {
                    const temp = classes.find((c: Ecore.EObject) => c._id === "//NotificationStatus");
                    if (temp !== undefined) {
                        API.instance().findByClass(temp, {contents: {eClass: temp.eURI()}})
                            .then((result) => {
                                let notificationStatus = result.map ((r: any) => {
                                    return {
                                        name: r.eContents()[0].get('name'),
                                        color: r.eContents()[0].get('color'),
                                        enable: true
                                    }
                                });
                                this.setState({notificationStatus})
                            })
                    }
                })
            }
        });
    };

    getAllPeriodicity() {
        API.instance().findEnum('notification', 'Periodicity')
            .then((result: Ecore.EObject[]) => {
                let periodicity = result.map( (p: any) => {
                    return p.get('name')
                });
                this.setState({periodicity})
            })
    };

    createNotification = (newNotification: any) => {
        const ref: string = this.props.viewObject.eURI();
        const methodName: string = 'createNotification';

        return API.instance().call(ref, methodName, [JSON.stringify(newNotification)]).then(() => {
            this.getAllNotificationInstances(this.state.currentMonth, true);
            this.setGridData(this.state.myNotificationVisible, newNotification);
        })
    };

    deleteNotification = (params: any) => {
        if (!this.state.deletedItem) {
            this.setState({deletedItem: true})
        }
        const oldNotifications = this.props.viewObject.get('notifications').array()
            .filter((n: EObject) =>
                (this.state.myNotificationVisible && n.get('defaultStatus').get('name') === myNote)
                ||
                (!this.state.myNotificationVisible && n.get('defaultStatus').get('name') !== myNote)
            );
        const deleteNotification = oldNotifications[params.node.id];
        const newNotifications = this.props.viewObject.get('notifications').array()
            .filter((n: EObject) => n.get('name') !== deleteNotification.get('name'));
        this.props.viewObject.get('notifications').clear();
        this.props.viewObject.get('notifications').addAll(newNotifications);

        const resource = this.props.viewObject.eResource();
        API.instance().saveResource(resource, 99999).then((newResource: Ecore.Resource) => {
            const newViewObject: Ecore.EObject[] = (newResource.eContainer as Ecore.ResourceSet).elements()
                .filter((r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
            this.props.context.updateContext!(({viewObject: newViewObject[0]}))
            this.setGridData(this.state.myNotificationVisible);
        })
    };

    editNotification = (editableNotification: any) => {
        const notifications = this.props.viewObject.get('notifications').array()
            .filter((n: EObject) =>
                (this.state.myNotificationVisible && n.get('defaultStatus').get('name') === myNote)
                ||
                (!this.state.myNotificationVisible && n.get('defaultStatus').get('name') !== myNote)
            );
        const newEditableNotification = notifications[editableNotification['id']];
        const resource = newEditableNotification.eResource();
        if (resource) {
            if (resource.eContents()[0].get('defaultStatus').get('name') !== myNote) {
                resource.eContents()[0].set('name', `${editableNotification.fullName}`);
                resource.eContents()[0].set('deadlineDay', `${editableNotification.deadlineDay}`);
            } else {
                resource.eContents()[0].set('name', `${editableNotification.fullName}`);
                resource.eContents()[0].set('shortName', `${editableNotification.shortName}`);
                resource.eContents()[0].set('weekendReporting', `${
                    editableNotification.weekendReporting ? true : false
                }`);
                resource.eContents()[0].set('periodicity', `${
                    editableNotification.periodicity === 'Месячная' ? 'Month' : editableNotification.periodicity
                }`);
                resource.eContents()[0].set('deadlineDay', `${editableNotification.deadlineDay}`);
                resource.eContents()[0].set('deadlineTime', `${editableNotification.deadlineTime}`);
            }
        }
        API.instance().saveResource(resource, 99999).then( (newResource: Ecore.Resource) => {
            const id_ = newEditableNotification._id;
            const notifications = this.props.viewObject.get('notifications').array()
                .map((n: EObject) =>
                    {
                        if (n._id === id_) {
                            return newResource.eContents()[0]
                        }
                        else {
                            return n
                        }
                    }
                );
            this.props.viewObject.get('notifications').clear();
            this.props.viewObject.get('notifications').addAll(notifications);

            const newViewObject: Ecore.EObject[] = (this.props.viewObject.eResource().eContainer as Ecore.ResourceSet).elements()
                .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'));
            this.props.context.updateContext!(({viewObject: newViewObject[0]}))
            this.setGridData(this.state.myNotificationVisible);
        })
    };

    onActionMenu = () => {
        handleExportDocx(this.props.context.getDocxHandlers(), false, false).then(blob => {
            saveAs(new Blob([blob]), "example.docx");
            console.log("Document created successfully");
        });
    }


    updateAllStatuses = (notificationStatus: any[]) => {
        this.setState({notificationStatus})
    };

    getYears() {
        const currentYear = new Date().getFullYear();
        let years = [];
        for (let i = -10; i <= 10; i++) {
            years.push(currentYear + i)
        }
        this.setState({years});
    };

    handleChange(e: any, type: string) {
        let newDate = null;
        if (type === 'year') {
            newDate = add(this.state.currentMonth, {years: e - this.state.currentMonth.getFullYear()});
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate, false)
        }
        else if (type === 'today') {
            newDate = new Date();
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate, false)
        }
        else if (type === 'month') {
            newDate = add(this.state.currentMonth, {months: e - this.state.currentMonth.getMonth() - 1});
            this.setState({currentMonth: newDate});
            this.getAllNotificationInstances(newDate, false)
        }
        else if (type === 'select') {
            this.setState({selectedValueInGrid: e});
            e === this.props.viewObject.get('defaultStatus').get('name') ?
                this.setGridData(true) : this.setGridData(false)
        }
    }

    private getLocale(i18n: any) {
        return i18n.language === "ru" ? ru
                : enUS;
    }

    handleCreateMenu = () => {
        this.state.createMenuVisible ? this.setState({ createMenuVisible: false})
            : this.setState({ createMenuVisible: true});
    };

    updateViewObject = () => {
        const updatedViewObject__: Ecore.Resource = this.props.viewObject.eResource();
        const newViewObject: Ecore.EObject[] = (updatedViewObject__.eContainer as Ecore.ResourceSet).elements()
            .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
            .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
            .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
        this.props.context.updateContext!(({viewObject: newViewObject[0]}));

        API.instance().saveResource(this.props.viewObject.eResource(), 99999)
            .then( (newResource: Ecore.Resource) => {
                const newViewObject: Ecore.EObject[] = (newResource.eContainer as Ecore.ResourceSet).elements()
                    .filter( (r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                    .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                    .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
                this.props.context.updateContext!(({viewObject: newViewObject[0]}));
        })
    };

    handleEditMenu = (params: any) => {
        const {t} = this.props;
        if (params.data !== undefined) {
            const newPeriodicity = this.state.periodicity.filter((p: any) => t(p) === params.data["Периодичность сдачи"]);
            const editableNotification: any = {
                'id': params.node.id,
                'fullName': params.data["Полное название формы"],
                'shortName': params.data["Краткое название формы"],
                'weekendReporting': params.data["Отчетность по выходным"],
                'periodicity': newPeriodicity[0],
                'deadlineDay': params.data["Рабочий день сдачи"],
                'deadlineTime': params.data["Время сдачи"]
            };
            this.setState({editableNotification})
        }
        this.state.editMenuVisible ? this.setState({ editMenuVisible: false})
            : this.setState({ editMenuVisible: true});
    };

    handleLegendMenu = () => {
        this.state.legendMenuVisible ? this.setState({ legendMenuVisible: false})
            : this.setState({ legendMenuVisible: true});
    };

    onFullScreen = () => {
        if (this.state.fullScreenOn){
            this.setState({ fullScreenOn: false});
        }
        else{
            this.setState({ fullScreenOn: true});
        }
    };

    handleCalendarVisible = () => {
        if (this.state.calendarVisible) {
            this.setState({ calendarVisible: false, notificationInstancesDTO: [] });
        } else if (this.state.currentMonth != null) {
            this.setState({ calendarVisible: true});
            if (this.state.deletedItem) {
                this.setState({deletedItem: false})
                this.updateViewObject();
                this.getAllNotificationInstances(this.state.currentMonth, false)
            } else {

                this.getAllNotificationInstances(this.state.currentMonth, true)
            }
        }
    };

    changeSearchValue = (e: any) => {
        this.setState({searchValue: e})
        this.searchValue(e)
    };

    searchValue = (searchValue :any) => {
        if (searchValue === "") {
            this.setState({filteredRowData: undefined})
        } else {
            let filteredRowData: any = [];
            this.state.rowData.forEach((r:any) => {
                if (
                    r['Полное название формы'].includes(searchValue) ||
                    r['Краткое название формы'].includes(searchValue) ||
                    r['Периодичность сдачи'].includes(searchValue) ||
                    r['Рабочий день сдачи'].includes(searchValue) ||
                    r['Время сдачи'].includes(searchValue) ||
                    r['Отчетность по выходным'].includes(searchValue) ||
                    r['Интервал расчета'].includes(searchValue)
                    ||
                    r['Отчетная дата "на"'].find((d:any) => d.includes(searchValue))
                ) {
                    filteredRowData.push(r)
                }
            });
            this.setState({filteredRowData})
        }
    };

    onPaginationChanged = () => {
        this.setState({ paginationCurrentPage: this.grid.current.api.paginationGetCurrentPage() + 1});
        this.setState({ paginationTotalPage: this.grid.current.api.paginationGetTotalPages()});
        this.setState({isGridReady: true});
    };

    openNotification(notification: any, context: any): void  {
        let params: Object[] = [{
            parameterName: 'reportDate',
            parameterValue: notification.contents[0]['notificationDateOn'],
            parameterDataType: "Date"
        }];
        if (notification.contents[0]['AppModuleName'] !== null) {
            context.changeURL(
                notification.contents[0]['AppModuleName'],
                false,
                undefined,
                params
            )
        }
    }

    openNotification2(notification: any, context: any): any  {
        let params: Object[] = [{
            parameterName: 'reportDate',
            parameterValue: notification.contents[0]['notificationDateOn'],
            parameterDataType: "Date"
        }];
        if (notification.contents[0]['AppModuleName'] !== null) {
            let path: any = context.getURL(
                notification.contents[0]['AppModuleName'],
                false,
                undefined,
                params
            )
            return path
        }
    }

    private getTitle(day: any) {
        let temp: any = [];
        this.props.viewObject.get('yearBook') !== null && this.props.viewObject.get('yearBook').get('days').array().filter((r: any) =>
                dateFns.isSameYear(day, dateFns.parseISO(r.get('date')))
                && dateFns.isSameMonth(day, dateFns.parseISO(r.get('date')))
                && dateFns.isSameDay(day, dateFns.parseISO(r.get('date')))
            ).map((r: any) => temp.push(r.get('title')));
            if (temp.length === 0) {
                temp.push(this.props.viewObject.get('defaultTitle'))
            }
        return temp;
    }

    private getContents(day: any) {
        let temp: any = [];
        let result: any = [];
        this.state.notificationInstancesDTO.filter((r: any) =>
            dateFns.isSameYear(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameMonth(day, dateFns.parseISO(r.contents[0]['calendarDate']))
            && dateFns.isSameDay(day, dateFns.parseISO(r.contents[0]['calendarDate']))
        ).map((r: any) => temp.push(r));
        if (temp.length !== 0 && this.state.notificationStatus) {
            let colors = this.state.notificationStatus
                .filter((s: any) => s['enable'] === true)
                .map((s: any) => {return s['color']});
            temp.forEach((r: any) => {
                if (colors.includes(r.contents[0]['statusColor'])) {
                    result.push(r)
                }
            })
        }
        return result;
    }

    nextMonth = () => {
        const newMonth = dateFns.addMonths(this.state.currentMonth, 1);
        this.setState({currentMonth: newMonth});
        this.getAllNotificationInstances(newMonth, false)
    };

    prevMonth = () => {
        const newMonth = dateFns.subMonths(this.state.currentMonth, 1);
        this.setState({currentMonth: newMonth})
        this.getAllNotificationInstances(newMonth, false)
    };

    componentDidMount(): void {
        this.getAllStatuses();
        this.getAllNotificationInstances(this.state.currentMonth, false);
        this.getAllPeriodicity();
        this.getYears();
        this.setGridData(false);
        this.getClassAppModule();
        this.props.context.addEventAction({
            itemId:this.props.viewObject.eURI(),
            actions: [
                {actionType: actionType.show, callback: ()=>this.setState({isHidden:false})},
                {actionType: actionType.hide, callback: ()=>this.setState({isHidden:true})},
                {actionType: actionType.enable, callback: ()=>this.setState({isDisabled:false})},
                {actionType: actionType.disable, callback: ()=>this.setState({isDisabled:true})},
            ]
        });
        this.props.context.notifyAllEventHandlers({
            type:eventType.componentLoad,
            itemId:this.props.viewObject.eURI()
        });
        this.props.context.addDocxHandler(this.getDocxData.bind(this));
    }

    filter (node: any) {
        return (node.className !== "verticalLine") && (node.className !== "btn btn-disabled calendarAlt") && (node.className !== "btn btn-link alignJustify") && (node.className !== "ant-dropdown ant-dropdown-placement-bottomRight slide-up-leave");
    }

    private getDocxData(): docxExportObject {
        const width = (this.node) ? this.node.size.width : 700;
        const height = (this.node) ? this.node.size.height : 400;
        if (this.node && this.node!.resizable !== null) {
            return {
                hidden: this.props.hidden,
                docxComponentType : docxElementExportType.diagram,
                diagramData: {
                    blob: domtoimage.toBlob(this.node!.resizable,{
                        width: width,
                        height: height,
                        filter: this.filter
                    }),
                    width: width,
                    height: height
                }
            };
        }

        return {hidden: this.props.hidden, docxComponentType: docxElementExportType.diagram}
    }


    componentWillUnmount() {
        this.props.context.removeEventAction()
        this.props.context.removeDocxHandler()
    }

    setGridData(myNotificationVisible: boolean, newNotification?: any): void {
        const {t} = this.props;
        let rowData: any = [];
        let columnDefs = [
            {field: 'Полное название формы'},
            {field: 'Краткое название формы'},
            {field: 'Отчетная дата "на"'},
            {field: 'Периодичность сдачи'},
            {field: 'Рабочий день сдачи'},
            {field: 'Время сдачи'},
            {field: 'Отчетность по выходным'},
            {field: 'Интервал расчета'}
        ];
        this.setState({myNotificationVisible});
        if (myNotificationVisible) {
            const newRowData = this.props.viewObject.get('notifications').array()
                .filter((n: EObject) => n.get('defaultStatus') !== null && n.get('defaultStatus').get('name') === myNote);
            if (newRowData.length !== 0) {
                newRowData.forEach((n: EObject) => {
                    rowData.push(
                        {
                            /* eslint-disable no-useless-computed-key */
                            ['Полное название формы']: n.get('name'),
                            ['Краткое название формы']: n.get('shortName'),
                            ['Отчетная дата "на"']: n.get('reportingDateOn').array().map((d: any) => d.get('name')),
                            ['Периодичность сдачи']: n.get('periodicity') === null ? t('Day') : t(n.get('periodicity')),
                            ['Рабочий день сдачи']: n.get('deadlineDay'),
                            ['Время сдачи']: n.get('deadlineTime'),
                            ['Отчетность по выходным']: n.get('weekendReporting') ? 'Да' : 'Нет',
                            ['Интервал расчета']: t(n.get('calculationInterval'))
                            /* eslint-enable no-useless-computed-key */
                        }
                    )
                })
            }

            if (newNotification) {
                rowData.push(
                    {
                        /* eslint-disable no-useless-computed-key */
                        ['Полное название формы']: newNotification['fullName'],
                        ['Краткое название формы']: newNotification['shortName'],
                        ['Отчетная дата "на"']: newNotification['deadlineDay'],
                        ['Периодичность сдачи']: newNotification['periodicity'] === null ? t('Day') : t(newNotification['periodicity']),
                        ['Рабочий день сдачи']: newNotification['deadlineDay'],
                        ['Время сдачи']: newNotification['deadlineTime'],
                        ['Отчетность по выходным']: newNotification['weekendReporting'] ? 'Да' : 'Нет',
                        ['Интервал расчета']: null
                        /* eslint-enable no-useless-computed-key */
                    }
                )
            }
        }
        else {
            const newRowData = this.props.viewObject.get('notifications').array()
                .filter((n: EObject) => n.get('defaultStatus') !== null && n.get('defaultStatus').get('name') !== myNote);
            if (newRowData.length !== 0) {
                newRowData.forEach((n: EObject) => {
                    rowData.push(
                        {
                            /* eslint-disable no-useless-computed-key */
                            ['Полное название формы']: n.get('name'),
                            ['Краткое название формы']: n.get('shortName'),
                            ['Отчетная дата "на"']: n.get('reportingDateOn').array().map((d: any) => d.get('name')),
                            ['Периодичность сдачи']: n.get('periodicity') === null ? t('Day') : t(n.get('periodicity')),
                            ['Рабочий день сдачи']: n.get('deadlineDay'),
                            ['Время сдачи']: n.get('deadlineTime'),
                            ['Отчетность по выходным']: n.get('weekendReporting') ? 'Да' : 'Нет',
                            ['Интервал расчета']: t(n.get('calculationInterval')),
                            ['Удалена']: n.get('archive') ? 'Да' : 'Нет'
                            /* eslint-enable no-useless-computed-key */
                        }
                    )
                });
            }
        }
        this.setState({rowData, columnDefs});
    }

    renderCreateNotification() {
        const {t} = this.props;
        return (
            <div id="PlusIconInFullScreen" key={"CreateNotificationDrawer"}>
            <NeoDrawer
                getContainer={() => document.getElementById ('PlusIconInFullScreen') as HTMLElement}
                title={t('createNotification')}
                width={'488px'}
                visible={this.state.createMenuVisible}
                onClose={this.handleCreateMenu}
                mask={false}
            >
                {
                    <CreateNotification
                        {...this.props}
                        onCreateNotification={this.createNotification}
                        periodicity={this.state.periodicity}
                        handleCreateMenu={this.handleCreateMenu}
                    />
                }
            </NeoDrawer>
            </div>
        );
    }

    renderEditNotification() {
        const {t} = this.props;
        return (
            <div id="EditNotification" key={"EditNotification"}>
            <NeoDrawer
                getContainer={() => document.getElementById ('EditNotification') as HTMLElement}
                title={t('editNotification')}
                width={'488px'}
                visible={this.state.editMenuVisible}
                onClose={this.handleEditMenu}
                mask={false}
            >
                {
                    this.state.editableNotification !== undefined && <EditNotification
                        {...this.props}
                        onEditNotification={this.editNotification}
                        periodicity={this.state.periodicity}
                        editableNotification={this.state.editableNotification}
                        myNotificationVisible={this.state.myNotificationVisible}
                        handleEditMenu={this.handleEditMenu}
                    />
                }
            </NeoDrawer>
            </div>
        );
    }

    renderLegend() {
        const {t} = this.props;
        return (
            <div id="legendIconInFullScreen" key={"legendDrawer"}>
            <NeoDrawer
                className="legendDrawer"
                getContainer={() => document.getElementById ('legendIconInFullScreen') as HTMLElement}
                title={t('legend')}
                width={'488px'}
                visible={this.state.legendMenuVisible}
                onClose={this.handleLegendMenu}
                mask={false}
            >
                {
                    <StatusLegend
                        {...this.props}
                        notificationStatus={this.state.notificationStatus}
                        onChangeNotificationStatus={this.updateAllStatuses}
                        handleLegendMenu={this.handleLegendMenu}
                    />
                }
            </NeoDrawer>
            </div>
        );
    }

    renderGrid() {
        const {gridOptions} = this.state;
        return (
            <div
                style={{
                    height: this.state.fullScreenOn ?  550*5.5/4 - 100 : 550,
                }}
                className={'ag-theme-material'}
            >
                {this.state.columnDefs.length !== 0 && <AgGridReact
                    ref={this.grid}
                    rowData={this.state.filteredRowData === undefined ? this.state.rowData : this.state.filteredRowData}
                    modules={AllCommunityModules}
                    onGridReady={this.onGridReady}
                    suppressFieldDotNotation //позволяет не обращать внимание на точки в названиях полей
                    suppressMenuHide //Всегда отображать инконку меню у каждого столбца, а не только при наведении мыши (слева три полосочки)
                    allowDragFromColumnsToolPanel //Возможность переупорядочивать и закреплять столбцы, перетаскивать столбцы из панели инструментов столбцов в грид
                    headerHeight={40} //высота header в px (25 по умолчанию)
                    suppressRowClickSelection //строки не выделяются при нажатии на них
                    pagination={true}
                    suppressPaginationPanel={true}
                    paginationPageSize={this.state.paginationPageSize}
                    onPaginationChanged={this.onPaginationChanged.bind(this)}
                    frameworkComponents={this.state.frameworkComponents}
                    {...gridOptions}
                >
                    {this.state.columnDefs.map((col: any) =>
                        <AgGridColumn
                            key={col['field']}
                            field={col['field']}
                            headerName={col['field']}
                        />
                    )}
                    <AgGridColumn
                        key={'settings'}
                        cellRenderer='actionMenu'
                        width={85}
                        suppressMenu={true}
                    />
                </AgGridReact>
                }
                <div style={{float: "right", opacity: this.state.isGridReady ? 1 : 0, width: "100%", backgroundColor: "#E6E6E6"}}>
                    <Paginator
                        {...this.props}
                        currentPage = {this.state.paginationCurrentPage}
                        totalNumberOfPage = {this.state.paginationTotalPage}
                        paginationPageSize = {this.state.paginationPageSize}
                        totalNumberOfRows = {this.state.rowData.length}
                        onPageSizeChange = {(size:number )=>{this.grid.current.api.paginationSetPageSize(size)}}
                        onPageChange={(page:number)=>this.grid.current.api.paginationGoToPage(page - 1)}
                    />
                </div>
            </div>
        )
    }

    renderHeader() {
        const {i18n, t} = this.props;
        const dateFormat = "LLLL yyyy";
        const dateFormat_ = "LLLL";
        const menu = (<Menu
            key='actionMenu'
            onClick={this.onActionMenu}
            className={"export-menu"}
        >
            <Menu.Item className={"action-menu-item"} key='exportToDocx'>
                <NeoIcon icon={'fileWord'} color={NeoColor.violete_4} size={'m'}/>{this.props.t("export to docx")}
            </Menu.Item>
        </Menu>);
        return (

            <div id="selectInFullScreen" className="header row flex-middle">
                {
                    this.state.calendarVisible &&
                    <div
                        style={{display: "contents"}}
                    >
                        <div
                            className="date"
                        style={{flexGrow: 0.2, marginLeft: '16px'}}>

                        <NeoButton style={{width: "111px", height: "32px"}}
                            type={'secondary'}
                                onClick={(e: any) => {this.handleChange(e, 'today')}}
                        >
                            <NeoTypography style={{color: NeoColor.violete_5, margin: "0px 10px"}}
                                           type={'capture_regular'}>{t('today')}</NeoTypography>
                        </NeoButton>

                        <NeoSelect className='selectYear'
                            getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                            defaultValue={this.state.currentMonth.getFullYear()}
                            style={{width: '96px', height: "32px" , fontWeight: "normal", position: "relative"}}
                            onChange={(e: any) => {this.handleChange(e, 'year')}}
                            value={this.state.currentMonth.getFullYear()}
                            width={'96px'}>
                            {
                                this.state.years!.map((y: any) =>
                                    <NeoOption
                                        key={y}
                                        value={y}
                                    >
                                        <NeoTypography style={{marginTop: "10px", color: NeoColor.grey_9}} type={'capture_regular'}>{y}</NeoTypography>
                                    </NeoOption>
                                )
                            }
                        </NeoSelect>

                        <NeoSelect
                            /*className='selectMonth'*/
                            getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                            defaultValue={dateFns.format(this.state.currentMonth, dateFormat_, {locale: this.getLocale(i18n)})}
                            style={{width: '124px', height: "32px", fontWeight: "normal"}}
                            onChange={(e: any) => {this.handleChange(e, 'month')}}
                            value={dateFns.format(this.state.currentMonth, dateFormat_, {locale: this.getLocale(i18n)})}
                            width={'124px'}
                        >
                            {
                                this.state.months!.map((m: any) =>
                                    <NeoOption
                                        className='selectMonth2'
                                        key={m}
                                        value={m}
                                    >
                                        <NeoTypography style={{marginTop: "10px", color: "#333333"}} type={'capture_regular'}>
                                        {
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).charAt(0).toUpperCase() +
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).slice(1)
                                        }</NeoTypography>
                                    </NeoOption>
                                )
                            }
                        </NeoSelect>
                        </div>

                        <div className="col col-start">
                            <NeoButton type={'link'} onClick={this.prevMonth}
                                       style={{marginRight: '20px'}}>
                                <NeoIcon icon={"arrowLeft"} color={NeoColor.violete_8}/>
                            </NeoButton>
                        </div>
                        <div className="col-col-center">
                    <span className="col-text" style={{fontSize: "120%"}}>
                        <NeoTypography style={{color: NeoColor.grey_9}} type={'h3_medium'}>{dateFns.format(this.state.currentMonth, dateFormat, {locale: this.getLocale(i18n)})}</NeoTypography>
                    </span>
                        </div>
                        <div className="col col-end" >
                            <NeoButton type={'link'} onClick={this.nextMonth}
                                       style={{marginLeft: '20px'}}>
                                <NeoIcon icon={"arrowRight"} color={NeoColor.violete_8}/>
                            </NeoButton>
                        </div>
                        <NeoHint title={t('legend')}>
                        <NeoButton
                            style={{width: '24px'}}
                            type="link"
                            onClick={this.handleLegendMenu}>
                            <NeoIcon icon={'legend'} size={'m'} />
                        </NeoButton>
                    </NeoHint>

                    </div>
                }

                {
                    !this.state.calendarVisible &&
                    <div
                        style={{display: "contents", marginTop: '2px'}}
                    >
                            <div style={{flexGrow: 1, marginLeft: '21px', marginTop: this.state.fullScreenOn ? '1px' : '0px'}}>
                                <NeoInput
                                    style={{width: "188px", height: "32px"}}
                                    type={'search'}
                                    placeholder={this.props.t("quick filter")}
                                    onChange={(e: any) => {
                                        this.changeSearchValue(e.target.value)
                                    }}
                                />
                            </div>

                        <div style={{marginBottom: this.state.fullScreenOn ? '6px' : '0px'}}>
                            <NeoSelect
                                getPopupContainer={() => document.getElementById('selectInFullScreen') as HTMLElement}
                                value={this.state.selectedValueInGrid}
                                style={{width: '182px', marginRight: '-2px', fontWeight: "normal", marginTop: this.state.fullScreenOn ?'8px' : '1px', height: "32px"}}
                                onChange={(e: any) => {
                                    this.handleChange(e, 'select')
                                }}
                            >
                                <NeoOption
                                    key={this.props.viewObject.get('defaultStatus').get('name')}
                                    value={this.props.viewObject.get('defaultStatus').get('name')}
                                >

                                   {this.props.viewObject.get('defaultStatus').get('name') === "Личная заметка" ?
                                        t('personal notes')
                                        :
                                        this.props.viewObject.get('defaultStatus').get('name')

                                    }
                                </NeoOption>

                                <NeoOption
                                    key={'Системные заметки'}
                                    value={'Системные заметки'}
                                >
                                    {t('system notes')}
                                </NeoOption>
                            </NeoSelect>
                        </div>


                    </div>
                }

                <div className="verticalLine" style={{borderLeft: '1px solid #B3B3B3', marginLeft: '16px', marginRight: '16px', height: '40px'}}/>

                <NeoHint title={t('add event')}>
                    <NeoButton
                        type="link"
                        onClick={this.handleCreateMenu}>
                        <NeoIcon icon={'plus'} color={NeoColor.violete_4} size={'m'}/>
                    </NeoButton>
                </NeoHint>

                <div className="verticalLine" style={{borderLeft: '1px solid #B3B3B3', marginLeft: '16px', marginRight: '16px', height: '40px'}}/>
                <NeoHint  title={t('calendar')}>
                <NeoButton
                    type={this.state.calendarVisible ? 'disabled' : 'link'}
                    className="calendarAlt"
                    style={{
                        marginRight: '8px',
                        width: '24px',
                        height: '24px',
                        padding: '3px',
                        backgroundColor: this.state.calendarVisible ? '#FFFFFF' : NeoColor.yellow_2,
                        border: this.state.calendarVisible ? '1px solid #424D78' : '1px solid #FFCC66'
                    }}
                    onClick={this.state.calendarVisible ? ()=>{} : this.handleCalendarVisible}
                >
                    <NeoIcon icon={"calendarFull"}
                             color={!this.state.calendarVisible ? NeoColor.grey_9 : NeoColor.violete_4}/>
                </NeoButton>
                </NeoHint>
                <NeoHint title={t('list')}>
                <NeoButton
                    type={!this.state.calendarVisible ? 'disabled' : "link"}
                    // disabled={!this.state.calendarVisible}
                    className="alignJustify"
                    style={{
                        width: '24px',
                        height: '24px',
                        padding: '3px',
                        backgroundColor: this.state.calendarVisible ? NeoColor.yellow_2 : '#FFFFFF',
                        border: this.state.calendarVisible ? '1px solid #FFCC66' : '1px solid #424D78'
                    }}
                    onClick={this.state.calendarVisible && this.handleCalendarVisible}
                >
                    <NeoIcon icon={"table"} color={this.state.calendarVisible ? NeoColor.grey_9 : NeoColor.violete_4}/>
                </NeoButton>
                </NeoHint>

                <div className="verticalLine" style={{borderLeft: '1px solid #B3B3B3', marginLeft: '16px', height: '40px'}}/>
                {this.state.calendarVisible ?
                    <Dropdown getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                        overlay={menu} placement="bottomLeft">
                        <div>
                            <NeoIcon icon={"download"} size={"m"} color={NeoColor.violete_4}
                                     style={{marginLeft: '16px'}}/>
                        </div>
                    </Dropdown>
                    :
                    null
                }
                <NeoHint  title={t('fullscreen')}>
        <NeoButton
            type="link"
            style={{
                marginRight: '18px',
                marginLeft: this.state.calendarVisible ? '8px' : '16px'
            }}
            onClick={this.onFullScreen}
        >
            {this.state.fullScreenOn ?
                <NeoIcon icon={"fullScreenUnDo"} size={"m"} color={NeoColor.violete_4}/>
                :
                <NeoIcon icon={"fullScreen"} size={"m"} color={NeoColor.violete_4}/>}
        </NeoButton>
                </NeoHint>
            </div>



        )
    }

    renderDays() {
        const {i18n} = this.props;
        const dateFormat = "EEEE";
        const days = [];
        let startDate = dateFns.startOfWeek(this.state.currentMonth, {locale: ru});
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i}
                     className="col col-center col-text border-line" style={{fontSize: "110%"}}
                >
                    {dateFns.format(dateFns.addDays(startDate, i), dateFormat, {locale: this.getLocale(i18n)})}
                </div>
            );
        }
        return <NeoRow className="days row">{days}</NeoRow>;


    }

    renderCells(context: any) {
        const {t} = this.props;
        const { currentMonth, selectedDate } = this.state;
        const monthStart = dateFns.startOfMonth(currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const startDate = dateFns.startOfWeek(monthStart, {locale: ru});
        const endDate = dateFns.endOfWeek(monthEnd, {locale: ru});

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";
        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                let content = this.getContents(day);
                formattedDate = dateFns.format(day, dateFormat);
                let title = this.getTitle(day);
                days.push(
                    <div
                        className={`col cell ${
                            !dateFns.isSameMonth(day, monthStart)
                                ? "disabled"
                                : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
                            }`}
                        key = {day.toString()}
                    >
                        <div className="days-header">
                        <span className="number">{formattedDate}</span>
                        <span className="title">{title}</span>
                        </div>
                        <div className="notification-block">
                            {content.length !== 0
                                ?
                                content.map( (r: any, index: number) =>
                                    <div className="notification-btn" key={`btn-div-${index}`}
                                    style={{backgroundColor: r.contents[0]['statusColor'] ? r.contents[0]['statusColor'] : "white"}}
                                    >

                                    <NeoButton
                                        onClick={ () => this.openNotification(r, context)}
                                        key={`${index}`}
                                        title={`${r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}\n${dateFns.format(dateFns.parseISO(r.contents[0]['calendarDate']), "PPpp ",{locale: ru})}\n
[отчетная дата "на": ${dateFns.format(dateFns.parseISO(r.contents[0]['notificationDateOn']), "P ",{locale: ru})}]
[интервал: ${t(r.contents[0]['calculationInterval'])}]`}
                                    >
                                         <Link to={encodeAppURL(this.openNotification2(r, context))}>
                                            {r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}
                                        </Link>
                                    </NeoButton>

                                    </div>

                                )
                                : ""}
                        </div>
                    </div>
                );
                day = dateFns.addDays(day, 1);
            }
            rows.push(
                <div className="row" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return (
            <div>
                {this.calendarNotifications()}
                <div className="body">{rows}</div>
            </div>
        )
    }

    calendarNotifications = () => {
        let description = []
        if (this.props.viewObject.get('yearBook') === null) {
            description.push('YearBook not connected to calendar')
        }
        if (this.props.viewObject.get('notifications').array().length === 0) {
            description.push(' Calendar does not contain notifications')
        }
        if (description.length !== 0) {
            this.props.context.notification('Calendar', description.toString(), 'info')
        }
    };

    render() {
        return (
            <div hidden={this.state.isHidden} style={{width:'100%'}}>
                <MainContext.Consumer>
                    { context => (
                        <Fullscreen
                            enabled={this.state.fullScreenOn}
                            onChange={fullScreenOn => this.setState({ fullScreenOn })}>
                            <Resizable ref={(n) => { this.node = n}}>
                            <div style={{margin:'1em 0 0 4em'}}>
                                <h2>{this.props.appModuleName}</h2>
                            </div>
                        <div className="calendar">
                            {this.state.createMenuVisible && this.renderCreateNotification()}
                            {this.state.editMenuVisible && this.renderEditNotification()}
                            {this.state.legendMenuVisible && this.renderLegend()}
                            {this.renderHeader()}
                            {this.state.calendarVisible && this.renderDays()}
                            {this.state.calendarVisible && this.renderCells(context)}
                            {!this.state.calendarVisible && this.renderGrid()}
                        </div>
                            </Resizable>
                        </Fullscreen>
                    )}
                </MainContext.Consumer>
            </div>
        );
    }
}

export default withTranslation()(Calendar)
