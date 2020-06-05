import React from 'react';
import Fullscreen from "react-full-screen";
import * as dateFns from "date-fns";
import Ecore, {EObject} from "ecore";
import {API} from "../../../modules/api";
import {ru, enUS} from "date-fns/locale";
import {zhCN} from "date-fns/esm/locale";
import {withTranslation} from "react-i18next";
import {MainContext} from "../../../MainContext";
import {Button, Drawer, Input, Select} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarAlt} from "@fortawesome/free-regular-svg-icons";
import {faAlignJustify, faPlus, faExpandArrowsAlt, faCompressArrowsAlt} from "@fortawesome/free-solid-svg-icons";
import StatusLegend from "./StatusLegend";
import CreateNotification from "./CreateNotification";
import {add} from "date-fns";
import Paginator from "../Paginator";
import {AgGridColumn, AgGridReact} from "@ag-grid-community/react";
import {AllCommunityModules} from "@ag-grid-community/all-modules";
import '@ag-grid-community/core/dist/styles/ag-theme-material.css';

import legend from '../../../icons/legend.svg';
import searchIcon from '../../../icons/searchIcon.svg';
import printIcon from '../../../icons/printIcon.svg';
import trashcanIcon from '../../../icons/trashcanIcon.svg';
import settingsIcon from '../../../icons/settingsIcon.svg';
import EditNotification from "./EditNotification";

const myNote = 'Личная заметка';

interface Props {
    paginationCurrentPage: number,
    paginationTotalPage: number,
    paginationPageSize: number,
    isGridReady: boolean,
}

class Calendar extends React.Component<any, any> {

    private grid: React.RefObject<any>;

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
            spinnerVisible: false,
            selectedValueInGrid: 'Системные заметки',
            frameworkComponents: {
                'actionMenu': this.actionMenu
            },
            myNotificationVisible: false,
            searchValue: undefined,
            deletedItem: false,
            classAppModule: undefined
        };
        this.grid = React.createRef();
        this.handleEditMenu = this.handleEditMenu.bind(this)
    }

    actionMenu = (params: any) => (
        <div style={{marginLeft: '-32px'}}>
            <Button
                type="link"
                style={{width: '35px'}}
                onClick={() => this.handleEditMenu(params)}
            >
                <img
                    alt="Not found"
                    src={settingsIcon}
                    style={{
                        color: '#515151'
                    }}
                />
            </Button>
            {
                this.state.myNotificationVisible &&
                <Button
                    type="link"
                    style={{width: '35px',}}
                    onClick={() => this.deleteNotification(params)}
                >
                    <img
                        alt="Not found"
                        src={trashcanIcon}
                        style={{
                            color: '#515151'
                        }}
                    />
                </Button>
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
        const monthStart = dateFns.startOfMonth(currentMonth);
        const monthEnd = dateFns.endOfMonth(monthStart);
        const dateFrom = monthStart.toString();
        const dateTo = monthEnd.toString();
        const ref: string = this.props.viewObject._id;
        const methodName: string = 'getNotificationInstances';

        if (updateViewObject && this.state.classAppModule !== undefined) {
            API.instance().findByKindAndName(this.state.classAppModule, this.props.context.viewObject.eContainer.get('name'), 999)
                .then((result) => {
                    this.props.context.updateContext(({viewObject: result[0].eContents()[0].get('view')}))
                })
        }

        API.instance().call(ref, methodName, [dateFrom, dateTo]).then((result: any) => {
            let notificationInstancesDTO = JSON.parse(result).resources;
            this.setState({notificationInstancesDTO, spinnerVisible: false});
        });
    };

    getAllStatuses() {
        const userProfileValue = this.props.context.userProfile.get('params').array()
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
        this.setState({spinnerVisible: true});
        const ref: string = this.props.viewObject._id;
        const methodName: string = 'createNotification';

        return API.instance().call(ref, methodName, [JSON.stringify(newNotification)]).then((result: any) => {
            this.getAllNotificationInstances(this.state.currentMonth, true);
            this.setGridData(this.state.myNotificationVisible, newNotification);
        })
    };

    editNotification = (editableNotification: any) => {
        this.setState({spinnerVisible: true});
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
            this.setState({spinnerVisible: false})
        })
    };

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
        return i18n.language === "cn" ? zhCN
            :
            i18n.language === "ru" ? ru
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

    deleteNotification = (params: any) => {
        if (!this.state.deletedItem) {this.setState({deletedItem: true})}
        this.setState({spinnerVisible: true});
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

        this.setGridData(this.state.myNotificationVisible);
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
    };

    searchValue = () => {
        if (this.state.searchValue === "") {
            this.setState({filteredRowData: undefined})
        } else {
            let filteredRowData: any = [];
            this.state.rowData.forEach((r:any) => {
                if (
                    r['Полное название формы'].includes(this.state.searchValue) ||
                    r['Краткое название формы'].includes(this.state.searchValue) ||
                    r['Периодичность сдачи'].includes(this.state.searchValue) ||
                    r['Рабочий день сдачи'].includes(this.state.searchValue) ||
                    r['Время сдачи'].includes(this.state.searchValue) ||
                    r['Отчетность по выходным'].includes(this.state.searchValue) ||
                    r['Интервал расчета'].includes(this.state.searchValue)
                    ||
                    r['Отчетная дата "на"'].find((d:any) => d.includes(this.state.searchValue))
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
    }

    openNotification(notification: any, context: any): void  {
        let params: Object[] = [{
            datasetColumn: 'reportDate',
            operation: 'EqualTo',
            value: notification.contents[0]['notificationDateOn'],
            enable: true,
            type: 'Date'
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

    private getTitle(day: any) {
        let temp: any = [];
            this.props.viewObject.get('yearBook').get('days').array().filter((r: any) =>
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
        this.getClassAppModule()
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
            <div id="PlusIconInFullScreen">
            <Drawer
                getContainer={() => document.getElementById ('PlusIconInFullScreen') as HTMLElement}
                placement='right'
                title={t('createNotification')}
                width={'450px'}
                visible={this.state.createMenuVisible}
                onClose={this.handleCreateMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    <CreateNotification
                        {...this.props}
                        onCreateNotification={this.createNotification}
                        periodicity={this.state.periodicity}
                        spinnerVisible={this.state.spinnerVisible}
                    />
                }
            </Drawer>
            </div>
        );
    }

    renderEditNotification() {
        const {t} = this.props;
        return (
            <Drawer
                placement='right'
                title={t('editNotification')}
                width={'450px'}
                visible={this.state.editMenuVisible}
                onClose={this.handleEditMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    this.state.editableNotification !== undefined && <EditNotification
                        {...this.props}
                        onEditNotification={this.editNotification}
                        periodicity={this.state.periodicity}
                        spinnerVisible={this.state.spinnerVisible}
                        editableNotification={this.state.editableNotification}
                        myNotificationVisible={this.state.myNotificationVisible}
                    />
                }
            </Drawer>
        );
    }

    renderLegend() {
        const {t} = this.props;
        return (
            <div id="legendIconInFullScreen">
            <Drawer
                className="legendDrawer"
                getContainer={() => document.getElementById ('legendIconInFullScreen') as HTMLElement}
                placement='right'
                title={t('legend')}
                width={'450px'}
                visible={this.state.legendMenuVisible}
                onClose={this.handleLegendMenu}
                mask={false}
                maskClosable={false}
            >
                {
                    <StatusLegend
                        {...this.props}
                        notificationStatus={this.state.notificationStatus}
                        onChangeNotificationStatus={this.updateAllStatuses}
                    />
                }
            </Drawer>
            </div>
        );
    }

    renderGrid() {
        const {gridOptions} = this.state;
        return (
            <div
                style={{
                    marginTop: '30px',
                    width: '98%',
                    height: 550
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
                <div style={{marginLeft: "800px", float: "right", opacity: this.state.isGridReady ? 1 : 0}}>
                    <Paginator
                        {...this.props}
                        currentPage = {this.state.paginationCurrentPage}
                        totalNumberOfPage = {this.state.paginationTotalPage}
                        paginationPageSize = {this.state.paginationPageSize}
                        grid = {this.grid}
                    />
                </div>
            </div>
        )
    }

    renderHeader() {
        const {i18n, t} = this.props;
        const dateFormat = "LLLL yyyy";
        const dateFormat_ = "LLLL";
        return (

            <div id="selectInFullScreen" className="header row flex-middle">
                {
                    this.state.calendarVisible &&
                    <div
                        style={{display: "contents"}}
                    >
                        <div
                            className="date">

                        <Button
                                className='buttonToday'
                                onClick={(e: any) => {this.handleChange(e, 'today')}}
                        >
                            {t('today')}
                        </Button>

                        <Select className='selectYear'
                                getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                            value={this.state.currentMonth.getFullYear()}
                            style={{width: '75px', marginLeft: '10px', fontWeight: "normal", position: "relative"}}
                            onChange={(e: any) => {this.handleChange(e, 'year')}}>
                            {
                                this.state.years!.map((y: any) =>
                                    <Select.Option
                                        key={y}
                                        value={y}
                                    >
                                        {y}
                                    </Select.Option>
                                )
                            }
                        </Select>

                        <Select
                            className='selectMonth'
                            getPopupContainer={() => document.getElementById ('selectInFullScreen') as HTMLElement}
                            value={dateFns.format(this.state.currentMonth, dateFormat_, {locale: this.getLocale(i18n)})}
                            style={{width: '100px', marginLeft: '10px', fontWeight: "normal"}}
                            onChange={(e: any) => {this.handleChange(e, 'month')}}
                        >
                            {
                                this.state.months!.map((m: any) =>
                                    <Select.Option
                                        className='selectMonth2'
                                        key={m}
                                        value={m}
                                    >
                                        {
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).charAt(0).toUpperCase() +
                                            dateFns.format(new Date(2020, m - 1, 1), dateFormat_, {locale: this.getLocale(i18n)}).slice(1)
                                        }
                                    </Select.Option>
                                )
                            }
                        </Select>
                        </div>

                        <div className="col col-start">
                            <div className="icon" onClick={this.prevMonth}>
                                chevron_left
                            </div>
                        </div>
                        <div className="col-col-center">
                    <span className="col-text" style={{fontSize: "120%"}}>
                        {dateFns.format(this.state.currentMonth, dateFormat, {locale: this.getLocale(i18n)})}
                    </span>
                        </div>
                        <div className="col col-end" >
                            <div className="icon" onClick={this.nextMonth}>
                                chevron_right
                            </div>
                        </div>

                        <Button className="buttonLegend" style={{width: '26px', height: '26px', color: '#6e6e6e'}} type="link"
                                onClick={this.handleLegendMenu}>
                            <img  alt="Not found" src={legend}  style={{marginLeft: '-9px', marginTop: '4px'}}/>
                        </Button>
                    </div>
                }

                {
                    !this.state.calendarVisible &&
                    <div
                        style={{display: "contents", marginTop: '2px'}}
                    >
                            <div style={{flexGrow: 1, marginLeft: '21px', marginTop: this.state.fullScreenOn ? '8px' : '0px'}}>
                                <Input
                                    style={{
                                        width: '186px',
                                        borderRadius: '4px',
                                        fill: '#ffffff',
                                        strokeWidth: 1,
                                        height: '32px'
                                    }}
                                    placeholder="Поиск"
                                    suffix={
                                        <img
                                            alt="Not found"
                                            src={searchIcon}
                                            onClick={this.searchValue}
                                        />
                                    }
                                    onChange={(e: any) => {
                                        this.changeSearchValue(e.target.value)
                                    }}
                                />
                            </div>


                            <Select
                                getPopupContainer={() => document.getElementById('selectInFullScreen') as HTMLElement}
                                value={this.state.selectedValueInGrid}
                                style={{width: '180px', marginRight: '-2px', fontWeight: "normal", marginTop: this.state.fullScreenOn ?'8px' : '1px'}}
                                onChange={(e: any) => {
                                    this.handleChange(e, 'select')
                                }}
                            >
                                <Select.Option
                                    key={this.props.viewObject.get('defaultStatus').get('name')}
                                    value={this.props.viewObject.get('defaultStatus').get('name')}
                                >
                                    {this.props.viewObject.get('defaultStatus').get('name')}
                                </Select.Option>

                                <Select.Option
                                    key={'Системные заметки'}
                                    value={'Системные заметки'}
                                >
                                    Системные заметки
                                </Select.Option>
                            </Select>


                    </div>
                }

                <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', marginRight: '6px', height: '34px'}}/>


                    <Button
                        className="buttonPlus"
                        type="primary"
                        style={{
                            width: '20px',
                            height: '30px',
                            marginTop: this.state.fullScreenOn ? '11px' : '2px',
                            backgroundColor: '#293468'
                        }}
                        onClick={this.handleCreateMenu}>
                        <FontAwesomeIcon icon={faPlus} size="1x" style={{marginLeft: '-6px'}}/>
                    </Button>




                <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '6px', marginRight: '10px', height: '34px'}}/>

                <Button
                    disabled={this.state.calendarVisible}
                    className="calendarAlt"
                    style={{
                        marginRight: '10px',
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#ffffff'
                    }}
                    onClick={this.handleCalendarVisible}
                >
                    <FontAwesomeIcon color={'#6e6e6e'} icon={faCalendarAlt} size="lg"
                                     style={{
                                         marginLeft: '-8px',
                                         color: this.state.calendarVisible ? '#293468' : '#a0a0a0'
                                     }}/>
                </Button>
                <Button
                    disabled={!this.state.calendarVisible}
                    className="alignJustify"
                    style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#ffffff'
                    }}
                    onClick={this.handleCalendarVisible}
                >
                    <FontAwesomeIcon icon={faAlignJustify} size="lg"
                                     style={{
                                         marginLeft: '-8px',
                                         color: this.state.calendarVisible ? '#a0a0a0' : '#293468'
                                     }}/>
                </Button>

                <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '10px', height: '34px'}}/>

                <Button
                    className="buttonPrint"
                    type="link"
                    ghost
                    style={{
                        marginRight: '10px',
                        width: '32px',
                        height: '32px'
                    }}
                >
                    <img
                        alt="Not found"
                        src={printIcon}
                        style={{
                            marginLeft: '-6px',
                            color: '#515151'
                        }}
                    />
                </Button>


        <div className="verticalLine" style={{borderLeft: '1px solid #858585', marginLeft: '0px', height: '34px'}}/>


        <Button
            className="buttonFullScreen"
            type="link"
            ghost
            style={{
                marginRight: '10px',
                width: '32px',
                height: '32px'
            }}
            onClick={this.onFullScreen}
        >
            {this.state.fullScreenOn  ?
                <FontAwesomeIcon icon={faCompressArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>
            :
            <FontAwesomeIcon icon={faExpandArrowsAlt} size="lg" style={{marginLeft: '-6px', color: '#515151'}}/>}
        </Button>
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
        return <div className="days row">{days}</div>;


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
                                content.map( (r: any) =>
                                    <div className="notification-btn"
                                    style={{backgroundColor: r.contents[0]['statusColor'] ? r.contents[0]['statusColor'] : "white"}}
                                    >
                                    <Button
                                        onClick={ () => this.openNotification(r, context)}
                                        key={`${r.contents[0]._id}`}
                                        size="small"
                                        title={`${r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}\n${dateFns.format(dateFns.parseISO(r.contents[0]['calendarDate']), "PPpp ",{locale: ru})}\n
[отчетная дата "на": ${dateFns.format(dateFns.parseISO(r.contents[0]['notificationDateOn']), "P ",{locale: ru})}]
[интервал: ${t(r.contents[0]['calculationInterval'])}]`}
                                    >
                                            {r.contents[0]['notificationShortName'] || r.contents[0]['notificationName']}
                                    </Button>
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
                <div className="body">{rows}</div>
            </div>
        )
    }

    render() {
        return (
            <MainContext.Consumer>
                { context => (
                    <Fullscreen
                        enabled={this.state.fullScreenOn}
                        onChange={fullScreenOn => this.setState({ fullScreenOn })}>
                    <div className="calendar">
                        {this.state.createMenuVisible && this.renderCreateNotification()}
                        {this.state.editMenuVisible && this.renderEditNotification()}
                        {this.state.legendMenuVisible && this.renderLegend()}
                        {this.renderHeader()}
                        {this.state.calendarVisible && this.renderDays()}
                        {this.state.calendarVisible && this.renderCells(context)}
                        {!this.state.calendarVisible && this.renderGrid()}
                    </div>
                    </Fullscreen>
                )}
            </MainContext.Consumer>

        );
    }
}

export default withTranslation()(Calendar)
