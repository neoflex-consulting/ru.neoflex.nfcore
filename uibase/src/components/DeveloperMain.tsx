import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {NeoButton, NeoColor, NeoInput, NeoModal, NeoParagraph, NeoTable} from "neo-design/lib";
import './../styles/DeveloperMain.css'
import ChangeLogView, {ILogEntry} from "./ChangeLogView";
import moment, {Moment} from "moment";
import {API} from "../modules/api";
import Ecore from "ecore";
import {NeoIcon} from "neo-icon/lib";
import Paginator from "./app/Paginator";

interface Props {
    history: any
}

interface State {
    logEntries: ILogEntry[],
    applications: IApplicationData[],
    currentSection?: {name: string, modules: IModuleData[]}
    filter: string,
    currentPage: number,
    paginationPageSize: number,
    isModalVisible: boolean,
    deleteObject?: {ref: string, type: "section"|"module"}
}

interface IApplicationData {
    name: JSX.Element,
    modules: number,
    changeDate?: Moment,
    status?: string,
    author?: string,
    class: string,
    childrenModules: Ecore.EObject[],
    delete: JSX.Element,
}

interface IModuleData {
    name: JSX.Element,
    changeDate?: Moment,
    status?: string,
    author?: string,
    delete: JSX.Element,
}

function getReferencedObjects(tree: Ecore.EObject, referencedObjects:Ecore.EObject[] = []): Ecore.EObject[] {
    if (tree.get('AppModule')) {
        referencedObjects.push(tree.get('AppModule'))
    }
    if (tree.get('children') && tree.get('children').size() !== 0) {
        tree.get('children').each((c:Ecore.EObject) => {
            getReferencedObjects(c, referencedObjects)
        })
    }
    return referencedObjects
}

class DeveloperMain extends React.Component<Props & WithTranslation, State> {
    constructor(props: Props & WithTranslation) {
        super(props);
        this.state = {
            logEntries: [],
            applications: [],
            filter: "",
            currentPage: 1,
            paginationPageSize: 10,
            isModalVisible: true,
            deleteObject: undefined
        };
    }

    getModules = (modules: Ecore.EObject[]): IModuleData[] => {
        return modules.map((m,index)=>{
            return {
                key: `module${index}`,
                name: <a style={{color:NeoColor.grey_9, textDecoration:"underline"}}
                         href={`/developer/data/editor/${API.parseRef(m.eURI()).id}/${m.eResource().rev}`}>{m.get('name')}</a>,
                changeDate: undefined,
                status: undefined,
                author: undefined,
                delete: <NeoButton onClick={()=>{
                    this.setState({deleteObject: {ref: `${m.eResource().get('uri')}?rev=${m.eResource().rev}`, type: "module"}})
                }} type={"link"}><NeoIcon icon={"rubbish"}/></NeoButton>
            }
        })
    };

    prepareData = (resources: Ecore.Resource[]) => {
        return resources.map((r,index) => {
            const refObjs = r.eContents()[0].get('referenceTree')
                ? getReferencedObjects(r.eContents()[0].get('referenceTree'))
                : [];
            return {
                key: `section${index}`,
                name: refObjs.length !== 0
                    ? <NeoButton style={{color:NeoColor.grey_9, textDecoration:"underline"}} type={"link"} onClick={()=>{
                        this.setState({currentSection: {name: r.eContents()[0].get('name'), modules: this.getModules(refObjs)}, filter:""})
                    }}>{r.eContents()[0].get('name')}</NeoButton>
                    : <a style={{color:NeoColor.grey_9, textDecoration:"underline"}}
                         href={`/developer/data/editor/${API.parseRef(r.eURI()).id}/${r.eResource().rev}`}>{r.eContents()[0].get('name')}</a>,
                modules: refObjs.length,
                changeDate: undefined,
                status: undefined,
                author: undefined,
                delete: <NeoButton onClick={()=>{
                    this.setState({deleteObject: {ref: `${r.get('uri')}?rev=${r.rev}`, type: "section"}})
                }} type={"link"}><NeoIcon icon={"rubbish"}/></NeoButton>,
                class: r.eContents()[0].eClass.get('name'),
                childrenModules: refObjs,
            } as IApplicationData
        })
    };

    getGridData = () => {
        API.instance().fetchAllClasses().then(eClasses=> {
            eClasses
                .filter(c=> c.get('name') === "AppModule")
                .forEach(c => {
                    API.instance().findByKindAndName(c).then(resources=>{
                        this.setState({applications: this.prepareData(resources)})
                    })
                })
        });
    };

    getColumns = () => {
        return this.state.currentSection ? [
            {title: this.props.t("module name"), dataIndex: "name", width: "30%", align: "left"},
            {title: this.props.t("change date"), dataIndex: "changeDate", width: "40%", align: "center"},
            {title: this.props.t("status"), dataIndex: "status", width: "10%", align: "center"},
            {title: this.props.t("author"), dataIndex: "author", width: "15%", align: "center"},
            {title: "", dataIndex: "delete", width: "5%", align: "center"}
        ] : [
            {title: this.props.t("section name"), dataIndex: "name", width: "30%", align: "left"},
            {title: this.props.t("modules"), dataIndex: "modules", width: "10%", align: "center"},
            {title: this.props.t("change date"), dataIndex: "changeDate", width: "30%", align: "center"},
            {title: this.props.t("status"), dataIndex: "status", width: "10%", align: "center"},
            {title: this.props.t("author"), dataIndex: "author", width: "15%", align: "center"},
            {title: "", dataIndex: "delete", width: "5%", align: "center"}
        ]
    };

    getDataSource = () => {
        return this.state.currentSection
            ? this.state.currentSection.modules
            : this.state.applications.filter(a=> a.modules !== 0 || a.class === "Application")
    };

    getLogEntries = () => {
        this.setState({logEntries:[
                {logDateTime:moment('2020-04-01 10:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:40'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:50'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 12:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 14:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-03 23:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:40'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:50'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 12:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 14:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-03 23:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:40'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-01 10:20:50'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 12:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-02 14:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
                {logDateTime:moment('2020-04-03 23:20:30'), author:"Иванов И.И.", change:"Обязательная отчётность"},
            ]})
    };

    componentDidMount(): void {
        this.getGridData();
        this.getLogEntries();
    }

    render() {
        const filteredData = this.getDataSource()
            .filter(d=>this.state.filter === "" || d.name.props.children.search(new RegExp(this.state.filter,"i")) >= 0)
        return (
            <div className={"developer-main"}>
                <div className={"interactive-area"}>
                    <div className={"buttons-bar"}>
                        <button onClick={()=>{
                            this.props.history.push({ pathname: "/developer/data/editor/new/resource", state: { selectedEClass: "application.Application", name: "application" }})
                        }}>
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M75.4375 11.125H74.125V4.5625C74.125 3.51821 73.7102 2.51669 72.9717 1.77827C72.2333 1.03984 71.2318 0.625 70.1875 0.625H9.8125C8.76821 0.625 7.76669 1.03984 7.02827 1.77827C6.28984 2.51669 5.875 3.51821 5.875 4.5625V11.125H4.5625C3.51821 11.125 2.51669 11.5398 1.77827 12.2783C1.03984 13.0167 0.625 14.0182 0.625 15.0625V57.0625C0.625 58.1068 1.03984 59.1083 1.77827 59.8467C2.51669 60.5852 3.51821 61 4.5625 61H29.5V68.875H22.9375C21.8932 68.875 20.8917 69.2898 20.1533 70.0283C19.4148 70.7667 19 71.7682 19 72.8125V79.375H61V72.8125C61 71.7682 60.5852 70.7667 59.8467 70.0283C59.1083 69.2898 58.1068 68.875 57.0625 68.875H50.5V61H75.4375C76.4818 61 77.4833 60.5852 78.2217 59.8467C78.9602 59.1083 79.375 58.1068 79.375 57.0625V15.0625C79.375 14.0182 78.9602 13.0167 78.2217 12.2783C77.4833 11.5398 76.4818 11.125 75.4375 11.125ZM51.1103 50.5C51.5685 49.2375 51.806 47.9056 51.8125 46.5625C51.8233 44.8358 51.4554 43.1277 50.7347 41.5586C50.0141 39.9894 48.9582 38.5974 47.6413 37.4804C46.3245 36.3634 44.7789 35.5487 43.1132 35.0937C41.4475 34.6387 39.7023 34.5543 38.0005 34.8466C36.2987 35.139 34.6816 35.8008 33.2633 36.7856C31.8449 37.7704 30.6597 39.0542 29.7911 40.5466C28.9225 42.0389 28.3916 43.7036 28.2359 45.4233C28.0801 47.143 28.3033 48.8759 28.8897 50.5H16.375V42.625H22.3862C22.6684 42.6251 22.9432 42.5343 23.1697 42.3659C23.3961 42.1976 23.5624 41.9607 23.6436 41.6905C23.9824 40.5652 24.4326 39.4766 24.9876 38.4408C25.1203 38.1926 25.1698 37.9084 25.1287 37.63C25.0875 37.3516 24.958 37.0938 24.7593 36.8946L20.5146 32.6382L26.0757 27.0771L30.3321 31.3218C30.5313 31.5205 30.7891 31.65 31.0675 31.6912C31.3459 31.7323 31.6301 31.6828 31.8783 31.5501C32.9141 30.9951 34.0027 30.5449 35.128 30.2061C35.3982 30.1249 35.6351 29.9586 35.8034 29.7322C35.9718 29.5057 36.0626 29.2309 36.0625 28.9487V22.9375H43.9375V28.9487C43.9374 29.2309 44.0282 29.5057 44.1966 29.7322C44.3649 29.9586 44.6018 30.1249 44.872 30.2061C45.9971 30.5443 47.0853 30.9946 48.1204 31.5501C48.3687 31.6831 48.6532 31.7328 48.9319 31.6916C49.2106 31.6505 49.4686 31.5208 49.6679 31.3218L53.9243 27.0758L59.4867 32.6382L55.2407 36.8946C55.042 37.0938 54.9125 37.3516 54.8713 37.63C54.8302 37.9084 54.8797 38.1926 55.0124 38.4408C55.5667 39.4775 56.0173 40.5665 56.3577 41.6918C56.4391 41.9616 56.6052 42.198 56.8314 42.3661C57.0577 42.5341 57.3319 42.6249 57.6137 42.625H63.625V50.5H51.1103ZM31.7313 50.5C31.1322 49.2735 30.8181 47.9275 30.8125 46.5625C30.8125 44.1258 31.7805 41.7889 33.5035 40.066C35.2264 38.343 37.5633 37.375 40 37.375C42.4367 37.375 44.7736 38.343 46.4965 40.066C48.2195 41.7889 49.1875 44.1258 49.1875 46.5625C49.1828 47.9276 48.8687 49.2738 48.2687 50.5H31.7313ZM64.9375 40H58.564C58.3323 39.3458 58.0668 38.704 57.7686 38.0772L62.2705 33.5635C62.5162 33.3174 62.6541 32.9839 62.6541 32.6362C62.6541 32.2885 62.5162 31.955 62.2705 31.7089L54.8549 24.2933C54.6088 24.0477 54.2753 23.9097 53.9276 23.9097C53.5799 23.9097 53.2464 24.0477 53.0003 24.2933L48.4879 28.7952C47.8601 28.4971 47.2174 28.2312 46.5625 27.9985V21.625C46.5625 21.2769 46.4242 20.9431 46.1781 20.6969C45.9319 20.4508 45.5981 20.3125 45.25 20.3125H34.75C34.4019 20.3125 34.0681 20.4508 33.8219 20.6969C33.5758 20.9431 33.4375 21.2769 33.4375 21.625V27.9985C32.7832 28.23 32.1414 28.4955 31.5147 28.7939L27.0063 24.292C26.7602 24.0463 26.4267 23.9084 26.079 23.9084C25.7313 23.9084 25.3978 24.0463 25.1517 24.292L17.7361 31.7076C17.4904 31.9537 17.3524 32.2872 17.3524 32.6349C17.3524 32.9826 17.4904 33.3161 17.7361 33.5622L22.2379 38.0759C21.9373 38.7028 21.6696 39.3451 21.436 40H15.0625C14.7144 40 14.3806 40.1383 14.1344 40.3844C13.8883 40.6306 13.75 40.9644 13.75 41.3125V50.5H8.5V13.75H71.5V50.5H66.25V41.3125C66.25 40.9644 66.1117 40.6306 65.8656 40.3844C65.6194 40.1383 65.2856 40 64.9375 40ZM8.5 4.5625C8.5 4.2144 8.63828 3.88056 8.88442 3.63442C9.13056 3.38828 9.4644 3.25 9.8125 3.25H70.1875C70.5356 3.25 70.8694 3.38828 71.1156 3.63442C71.3617 3.88056 71.5 4.2144 71.5 4.5625V11.125H8.5V4.5625ZM57.0625 71.5C57.4106 71.5 57.7444 71.6383 57.9906 71.8844C58.2367 72.1306 58.375 72.4644 58.375 72.8125V76.75H21.625V72.8125C21.625 72.4644 21.7633 72.1306 22.0094 71.8844C22.2556 71.6383 22.5894 71.5 22.9375 71.5H57.0625ZM47.875 68.875H32.125V61H47.875V68.875ZM76.75 57.0625C76.75 57.4106 76.6117 57.7444 76.3656 57.9906C76.1194 58.2367 75.7856 58.375 75.4375 58.375H4.5625C4.2144 58.375 3.88056 58.2367 3.63442 57.9906C3.38828 57.7444 3.25 57.4106 3.25 57.0625V15.0625C3.25 14.7144 3.38828 14.3806 3.63442 14.1344C3.88056 13.8883 4.2144 13.75 4.5625 13.75H5.875V51.8125C5.875 52.1606 6.01328 52.4944 6.25942 52.7406C6.50556 52.9867 6.8394 53.125 7.1875 53.125H72.8125C73.1606 53.125 73.4944 52.9867 73.7406 52.7406C73.9867 52.4944 74.125 52.1606 74.125 51.8125V13.75H75.4375C75.7856 13.75 76.1194 13.8883 76.3656 14.1344C76.6117 14.3806 76.75 14.7144 76.75 15.0625V57.0625Z" fill="#424D78"/>
                            </svg>
                            <NeoParagraph type={"h3_medium"} style={{color:NeoColor.violete_5}}>
                                {this.props.t("create application")}
                            </NeoParagraph>
                        </button>
                        <button onClick={()=>{
                            this.props.history.push({ pathname: "/developer/data/editor/new/resource", state: { selectedEClass: "application.AppModule", name: "applicationModule" }})
                        }}>
                            <svg width="66" height="78" viewBox="0 0 66 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M65.4831 19.4181C65.4766 19.3042 65.4543 19.1917 65.4168 19.084C65.4025 19.0424 65.3921 19.0021 65.3739 18.9618C65.3107 18.8204 65.2226 18.6914 65.1139 18.5809L46.9139 0.3809C46.8034 0.272188 46.6744 0.184112 46.533 0.1209C46.4927 0.1027 46.4524 0.0923 46.4121 0.078C46.3034 0.040625 46.1901 0.017875 46.0754 0.0104C46.0533 0.0143 46.0286 0 46 0H9.6C8.88207 0 8.3 0.582075 8.3 1.3V5.2H1.8C1.08207 5.2 0.5 5.78207 0.5 6.5V76.7C0.5 77.4179 1.08207 78 1.8 78H56.4C57.1179 78 57.7 77.4179 57.7 76.7V70.2H64.2C64.9179 70.2 65.5 69.6179 65.5 68.9V19.5C65.5 19.4714 65.4857 19.4467 65.4831 19.4181ZM47.3 4.4382L61.0618 18.2H47.3V4.4382ZM55.1 75.4H3.1V7.8H8.3V68.9C8.3 69.6179 8.88207 70.2 9.6 70.2H55.1V75.4ZM62.9 67.6H10.9V2.6H44.7V19.5C44.7 20.2179 45.2821 20.8 46 20.8H62.9V67.6Z" fill="#424D78"/>
                            </svg>
                            <NeoParagraph type={"h3_medium"} style={{color:NeoColor.violete_5}}>{this.props.t("create application module")}</NeoParagraph>
                        </button>
                        <button onClick={()=>{
                            this.props.history.push({ pathname: "/developer/data/" })
                        }}>
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M45.8542 31.9999C45.8542 39.6391 39.6393 45.8541 32 45.8541C31.6066 45.8541 31.2159 45.8374 30.8483 45.8055C27.3939 45.5215 24.1909 43.9597 21.8291 41.4074C19.454 38.8407 18.1459 35.4996 18.1459 31.9999C18.1459 28.5003 19.454 25.1592 21.8291 22.5924C24.1909 20.0402 27.3939 18.4784 30.8386 18.1952C31.2159 18.1625 31.6066 18.1458 32 18.1458C39.6393 18.1458 45.8542 24.3607 45.8542 31.9999ZM41.8959 31.9999C41.8959 26.5434 37.4566 22.1041 32 22.1041C31.7207 22.1041 31.4456 22.1157 31.1726 22.1395C26.0875 22.5574 22.1042 26.8886 22.1042 31.9999C22.1042 37.1112 26.0875 41.4424 31.1823 41.8612C31.4456 41.8841 31.7207 41.8958 32 41.8958C37.4566 41.8958 41.8959 37.4565 41.8959 31.9999Z" fill="#424D78"/>
                                <path d="M38.9271 56.7395C38.9271 60.5591 35.8197 63.6666 32 63.6666C31.5398 63.6666 31.0758 63.6202 30.6209 63.5289L30.6166 63.528C29.284 63.2574 28.0688 62.6035 27.1023 61.6371C25.7937 60.3284 25.0731 58.589 25.0731 56.7395V54.7236C23.6057 54.2774 22.1871 53.6896 20.8312 52.9656L19.4045 54.3923C18.0543 55.7425 16.281 56.4175 14.5068 56.4174C12.7332 56.4173 10.9588 55.7423 9.60787 54.3922C8.30001 53.0842 7.57972 51.3444 7.57972 49.4933C7.57972 47.6429 8.30001 45.9036 9.60787 44.5956L11.0346 43.1689C10.3106 41.813 9.72267 40.3944 9.27661 38.927H7.26046C3.44079 38.927 0.333374 35.8195 0.333374 31.9999C0.333374 30.1504 1.05404 28.411 2.36276 27.1022C3.67149 25.7935 5.4108 25.0727 7.26046 25.0727H9.27661C9.72279 23.6054 10.3106 22.1867 11.0346 20.8309L9.60787 19.4041C6.90779 16.7042 6.90755 12.3096 9.60775 9.60763C10.9156 8.29977 12.6554 7.57948 14.5067 7.57948C16.3571 7.57948 18.0964 8.29977 19.4044 9.60763L20.8311 11.0344C22.187 10.3104 23.6055 9.72242 25.073 9.27636V7.26034C25.073 3.9795 27.4043 1.12442 30.6209 0.470928C31.0758 0.379639 31.5398 0.333252 32 0.333252C33.8497 0.333252 35.589 1.05404 36.8979 2.36276C38.2065 3.67149 38.9271 5.4108 38.9271 7.26034V9.27636C40.3946 9.72254 41.8131 10.3104 43.169 11.0344L44.5957 9.60763C47.2958 6.90755 51.6903 6.90718 54.3923 9.60763C55.7002 10.9156 56.4205 12.6554 56.4205 14.5066C56.4205 16.357 55.7002 18.0963 54.3922 19.4043L52.9655 20.831C53.6895 22.1868 54.2774 23.6054 54.7235 25.0728H56.7396C60.5593 25.0728 63.6667 28.1804 63.6667 31.9999C63.6667 33.8495 62.9461 35.5889 61.6373 36.8976C60.3286 38.2063 58.5893 38.9271 56.7396 38.9271H54.7235C54.2773 40.3944 53.6895 41.8131 52.9655 43.169L54.3922 44.5957C57.0923 47.2957 57.0925 51.6903 54.3923 54.3922C53.0845 55.7001 51.3447 56.4204 49.4934 56.4204C47.643 56.4204 45.9037 55.7001 44.5957 54.3922L43.169 52.9655C41.8131 53.6895 40.3946 54.2774 38.9271 54.7235V56.7395ZM42.4491 48.8128C42.7719 48.6117 43.1343 48.5136 43.4947 48.5136C44.006 48.5136 44.5128 48.7114 44.8947 49.0931L47.3946 51.5929C47.9548 52.1532 48.7004 52.4618 49.4934 52.4618C50.2873 52.4618 51.0332 52.1533 51.5929 51.5934C52.7505 50.4352 52.7506 48.5516 51.5934 47.3944L49.0935 44.8946C48.4426 44.2438 48.3263 43.2302 48.8128 42.4489C49.9601 40.6067 50.7894 38.6054 51.2776 36.5005C51.4857 35.6036 52.2849 34.9687 53.2056 34.9687H56.7396C57.5319 34.9687 58.2773 34.6597 58.8383 34.0986C59.3994 33.5375 59.7084 32.7922 59.7084 31.9999C59.7084 30.363 58.3765 29.0312 56.7396 29.0312H53.2056C52.2848 29.0312 51.4856 28.3962 51.2776 27.4992C50.7894 25.3943 49.96 23.393 48.8128 21.5508C48.3264 20.7696 48.4426 19.7561 49.0935 19.1052L51.5933 16.6053C52.1537 16.0451 52.4622 15.2997 52.4622 14.5067C52.4622 13.7128 52.1535 12.967 51.5937 12.4072C50.4355 11.2497 48.5518 11.2495 47.3946 12.4067L44.8947 14.9066C44.2439 15.5575 43.23 15.6738 42.4491 15.1871C40.6069 14.04 38.6056 13.2107 36.5007 12.7223C35.6037 12.5143 34.9688 11.7151 34.9688 10.7944V7.26034C34.9688 6.46805 34.6598 5.72277 34.0988 5.16168C33.5377 4.60058 32.7923 4.29159 32 4.29159C31.8009 4.29159 31.599 4.31187 31.4046 4.35084C30.0293 4.63027 29.0313 5.85389 29.0313 7.26034V10.7944C29.0313 11.7151 28.3964 12.5143 27.4994 12.7225C25.3945 13.2108 23.3931 14.0401 21.551 15.1873C20.7699 15.6738 19.7563 15.5577 19.1054 14.9067L16.6055 12.4069C16.0452 11.8467 15.2997 11.5381 14.5067 11.5381C13.7128 11.5381 12.9669 11.8466 12.4072 12.4064C11.2496 13.5646 11.2495 15.4483 12.4067 16.6055L14.9066 19.1053C15.5575 19.7561 15.6738 20.7696 15.1873 21.5509C14.04 23.3931 13.2107 25.3945 12.7225 27.4993C12.5144 28.3962 11.7152 29.0312 10.7945 29.0312H7.26046C6.46817 29.0312 5.72277 29.3402 5.1618 29.9014C4.60071 30.4625 4.29171 31.2078 4.29171 32C4.29171 33.6369 5.62356 34.9688 7.26046 34.9688H10.7945C11.7152 34.9688 12.5144 35.6037 12.7225 36.5007C13.2107 38.6055 14.0401 40.6068 15.1873 42.4491C15.6736 43.2302 15.5575 44.2438 14.9066 44.8947L12.4068 47.3945C11.8464 47.9547 11.5379 48.7001 11.5379 49.4932C11.5379 50.2871 11.8466 51.0328 12.4064 51.5927C13.5646 52.7502 15.4483 52.7502 16.6055 51.5932L19.1054 49.0932C19.7561 48.4423 20.77 48.3262 21.551 48.8127C23.3931 49.9599 25.3945 50.7891 27.4994 51.2775C28.3964 51.4856 29.0313 52.2848 29.0313 53.2055V56.7395C29.0313 57.5318 29.3403 58.2771 29.9013 58.8382C30.3161 59.2529 30.8357 59.5332 31.4037 59.6488C31.6015 59.6882 31.802 59.7083 32 59.7083C33.6369 59.7083 34.9688 58.3764 34.9688 56.7395V53.2056C34.9688 52.2849 35.6037 51.4857 36.5007 51.2776C38.6056 50.7893 40.6069 49.96 42.4491 48.8128Z" fill="#424D78"/>
                            </svg>
                            <NeoParagraph type={"h3_medium"} style={{color:NeoColor.violete_5}}>{this.props.t("universal editor")}</NeoParagraph>
                        </button>
                    </div>
                    <div className={"grid-search"}>
                        <NeoInput
                            value={this.state.filter}
                            type={'search'}
                            width={"250px"}
                            onSearch={(e:string)=>{this.setState({filter:e})}}
                            onChange={(e:any)=>{this.setState({filter:e.currentTarget.value})}}
                        />
                        {this.state.currentSection && <NeoParagraph type={"h4_medium"} style={{color:NeoColor.violete_6}}>{this.state.currentSection.name}</NeoParagraph>}
                        {this.state.currentSection && <NeoButton type={"link"} onClick={()=>this.setState({currentSection: undefined})}>
                            <NeoIcon icon={"arrowLong"}/>
                            <NeoParagraph type={"body_regular"} style={{color:NeoColor.grey_9}}>{this.props.t("back to sections")}</NeoParagraph>
                        </NeoButton>}
                    </div>
                    <div className={"grid-area"}>
                        <NeoTable
                            className={"developer_table"}
                            /*scroll={{x: 300}}*/
                            columns={this.getColumns()}
                            dataSource={filteredData}
                            bordered={true}
                            pagination={{current: this.state.currentPage}}
                        />
                        <div className={'developer_paginator'} style={{ width: "100%", padding: '0px 35px' }}>
                            <Paginator
                                currentPage = {this.state.currentPage}
                                totalNumberOfPage = {Math.ceil(filteredData.length/this.state.paginationPageSize)}
                                paginationPageSize = {this.state.paginationPageSize}
                                totalNumberOfRows = {filteredData.length}
                                onPageChange={(page: number) => {
                                    this.setState({currentPage: page})
                                }}
                                onPageSizeChange={(size: number)=>{
                                    this.setState({paginationPageSize: size})
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className={"application-changes"}>
                    <ChangeLogView
                        logEntries={this.state.logEntries}
                    />
                </div>
                {!!this.state.deleteObject && <NeoModal onCancel={()=>this.setState({deleteObject:undefined})}
                          closable={true} type={'edit'}
                           title={this.state.deleteObject ? this.props.t(`delete ${this.state.deleteObject.type}`) : this.props.t(`delete module`)}
                           content={this.state.deleteObject ? this.props.t(`delete ${this.state.deleteObject.type} with references`) : this.props.t(`delete module with references`)}
                           visible={true}
                           onLeftButtonClick={()=>{
                               API.instance().deleteResource(this.state.deleteObject!.ref).then(()=>{
                                   this.setState({deleteObject:undefined})
                                   this.getGridData()
                               })
                           }}
                           onRightButtonClick={()=>this.setState({deleteObject:undefined})}
                           textOfLeftButton={this.props.t("delete")}
                           textOfRightButton={this.props.t("cancel")}
                >
                </NeoModal>}
            </div>
        )
    }
}

export default withTranslation()(DeveloperMain)
