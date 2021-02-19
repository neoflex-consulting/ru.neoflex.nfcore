import React from "react";
import {Pagination, ConfigProvider} from "antd";
import {WithTranslation, withTranslation} from "react-i18next";
import Ru from 'antd/es/locale/ru_RU';
import En from 'antd/es/locale/en_US';
import NeoIcon from "neo-icon/lib/icon";
import {NeoButton, NeoHint} from "neo-design/lib";
import '../../../styles/Paginator.css';
import {adaptiveElementSize, getAdaptiveSize} from "../../../utils/adaptiveResizeUtils";

interface Props extends WithTranslation {
    paginationPageSize: number,
    currentPage: number,
    totalNumberOfPage: number;
    totalNumberOfRows: number;
    onPageChange: (page:number)=>void;
    onPageSizeChange: (size:number)=>void;
}

class PagesView extends React.Component<any, any> {
    render() {
        const from = (this.props.currentPage-1)*this.props.paginationPageSize+1;
        const to = this.props.currentPage*this.props.paginationPageSize <= this.props.totalNumberOfRows
            ? this.props.currentPage*this.props.paginationPageSize
            : this.props.totalNumberOfRows;
        const overAll = this.props.totalNumberOfRows;

        return (
            this.props.totalNumberOfRows === 0
                ? null
                : <div id={"pageView"}>
                        {`${from}-${to} из ${overAll}`}
                  </div>
        )
    }

}

class Paginator extends React.Component<Props, any> {
    paginatorRef = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);

        this.state = {
            paginationPageSize: this.props.paginationPageSize,
            paginatorSize: 0
        };
    }


    onSomePage = (e : any) => {
        this.props.onPageChange(e);
    };

    paginationSetPageSize = (p:any, pageSize : any) =>{
        if(isNaN(pageSize)){
            this.props.onPageSizeChange(this.props.totalNumberOfRows);
            this.setState({ paginationPageSize: this.props.totalNumberOfRows});
        }
        else {
            this.props.onPageSizeChange(pageSize);
            this.setState({paginationPageSize: pageSize});
        }
    };

    handleResize = () => {
        this.setState({paginatorSize: getAdaptiveSize(this.paginatorRef.current ? this.paginatorRef.current.offsetWidth : 0, "paginator")})
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

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.currentPage !== prevProps.currentPage
            || this.props.totalNumberOfPage !== prevProps.totalNumberOfPage
        ) {
            const size = (`${this.props.totalNumberOfRows}`.length * 10 * 3) + 40;
            const cssClass = document.createElement('style');
            cssClass.innerHTML = `
                .paginator.paginator-large .ant-pagination-next { margin-right: ${size}px }
                .paginator.paginator-large .page-view-container { min-width: ${size}px }
            `;
            document.getElementsByTagName('head')[0].appendChild(cssClass);
        }
    }

    itemRender = (current: any, type: any, originalElement: any) => {
        const {t} = this.props;
        if (type === 'prev') {
            return <NeoHint  title={t('previous page')}><NeoIcon className={"Arrow"} style={{marginTop: "4.5px"}} icon={"arrowLeft"}/></NeoHint>
        }
        if (type === 'next') {
            return <NeoHint title={t('next page')}><NeoIcon className={"Arrow"} style={{marginTop: "4.5px"}} icon={"arrowRight"}/></NeoHint>
        }
        if (type === 'jump-prev') {
            return <NeoHint title={t('previous 5 pages')}><NeoIcon className={"Arrow"} style={{marginTop: "4.5px"}} icon={"doubleLeft"}/></NeoHint>
        }
        if (type === 'jump-next') {
            return <NeoHint title={t('next 5 pages')}> <NeoIcon className={"Arrow"} style={{marginTop: "4.5px"}} icon={"doubleRight"}/></NeoHint>
        }
        return originalElement;
    };

    render() {
        return (
            <ConfigProvider locale={this.props.i18n.language === "ru" ? Ru : En}>
                <div ref={this.paginatorRef}
                    className={    `paginator ${this.props.totalNumberOfPage === 1 && this.state.paginatorSize >= adaptiveElementSize.medium  && "single-page"} ${this.state.paginatorSize >= adaptiveElementSize.medium ? "paginator-large" : "paginator-small"}`}
                    style={{float: "right"}}>
                    {this.props.totalNumberOfPage > 1 ? <NeoHint title={this.props.t('first page')}><NeoButton className={"jump-first"} type={"link"} onClick={() => this.onSomePage(0)}><NeoIcon icon={"arrowVerticalRight"}/></NeoButton></NeoHint> : null}
                    <div className={"page-view-container"}>
                        {this.props.totalNumberOfPage > 1 ? <NeoHint title={this.props.t('last page')}><NeoButton className={"jump-last"} type={"link"} onClick={() => this.onSomePage(this.props.totalNumberOfPage)}><NeoIcon icon={"arrowVerticalLeft"}/></NeoButton></NeoHint> : null}
                        {this.props.totalNumberOfRows && (this.state.paginatorSize >= adaptiveElementSize.medium)
                            ?
                              <PagesView
                                  currentPage={this.props.currentPage}
                                  paginationPageSize={this.state.paginationPageSize}
                                  totalNumberOfRows={this.props.totalNumberOfRows}
                              />
                            : null}
                    </div>
                    <Pagination
                        size="small"
                        current={this.props.currentPage}
                        total={this.props.totalNumberOfPage*this.state.paginationPageSize || 0}
                        onChange={(e : any) => this.onSomePage(e)}
                        showSizeChanger
                        showQuickJumper
                        pageSize={this.state.paginationPageSize}
                        locale={{ items_per_page: ''}}
                        pageSizeOptions={['10', '20', '30', '40', '100',this.props.i18n.language === "ru" ? 'Показать все' : 'Show all']}
                        onShowSizeChange={(p: any, pageSize : any) => this.paginationSetPageSize(p, pageSize)}
                        itemRender={this.itemRender}
                    />
                </div>
            </ConfigProvider>
        )
    }
}

export default withTranslation()(Paginator)
