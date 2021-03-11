import React from "react";
import {ConfigProvider, Pagination} from "antd";
import {WithTranslation, withTranslation} from "react-i18next";
import Ru from 'antd/es/locale/ru_RU';
import En from 'antd/es/locale/en_US';
import {NeoIcon} from "neo-icon/lib";
import {NeoButton, NeoHint} from "neo-design/lib";
import '../../../styles/Paginator.css';
import {adaptiveElementSize, getAdaptiveSize, getTextWidth} from "../../../utils/adaptiveResizeUtils";

interface Props extends WithTranslation {
    paginationPageSize: number,
    currentPage: number,
    totalNumberOfPage: number;
    totalNumberOfRows: number;
    onPageChange: (page:number)=>void;
    onPageSizeChange: (size:number)=>void;
}

function getPagesViewLabel(currentPage: number, paginationPageSize: number, totalNumberOfRows: number) {
    const from = (currentPage-1)*paginationPageSize+1;
    const to = currentPage*paginationPageSize <= totalNumberOfRows
        ? currentPage*paginationPageSize
        : totalNumberOfRows
    return `${from}-${to} из ${totalNumberOfRows}`
}

class PagesView extends React.Component<any, any> {
    render() {
        return (
            this.props.totalNumberOfRows === 0
                ? null
                : <div className={"pageView"} id={"pageView"}>
                    {getPagesViewLabel(this.props.currentPage, this.props.paginationPageSize, this.props.totalNumberOfRows)}
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
            paginatorSize: 0,
            isPagesViewVisible: true
        };
    }


    onSomePage = (e : any) => {
        this.props.onPageChange(e);
    };

    paginationSetPageSize = (pageSize : any) =>{
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
        const paginatorSize = getAdaptiveSize(this.paginatorRef.current ? this.paginatorRef.current.offsetWidth : 0, "paginator");
        this.setState({
            paginatorSize: paginatorSize,
            isPagesViewVisible: this.props.totalNumberOfRows && (paginatorSize >= adaptiveElementSize.medium)
        })
    };

    setPagesViewOffset = () => {
        const pageViewLabel = getPagesViewLabel(this.props.currentPage, this.props.paginationPageSize, this.props.totalNumberOfRows);
        //31px размер области jump-last + 8px next hint offset
        const jumpButtonSize = this.props.totalNumberOfPage > 1 ? 31 + 8 : 0;
        const size = this.state.isPagesViewVisible ? getTextWidth(`${pageViewLabel}`, '14px Roboto') + jumpButtonSize : jumpButtonSize;
        const children = [...this.paginatorRef.current?.children!];
        const paginator = children.find(c=>c.classList.contains("ant-pagination"));
        const nextButton = [...paginator!.children].find(c=>c.classList.contains("ant-pagination-next"));
        if (nextButton) {
            (nextButton as HTMLElement).style.marginRight = `${size}px`
        }
    };

    componentDidMount(): void {
        window.addEventListener("appAdaptiveResize", this.handleResize);
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
        this.setPagesViewOffset();
    }

    componentWillUnmount() {
        window.removeEventListener("appAdaptiveResize", this.handleResize);
        window.removeEventListener("resize", this.handleResize);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.currentPage !== prevProps.currentPage
            || this.props.totalNumberOfPage !== prevProps.totalNumberOfPage
            || this.state.isPagesViewVisible !== prevState.isPagesViewVisible
        ) {
            this.setPagesViewOffset()
        }
    }

    itemRender = (current: any, type: any, originalElement: any) => {
        const {t} = this.props;
        if (type === 'prev') {
            return <NeoHint  title={t('previous page')}><NeoIcon className={"Arrow"} style={{marginTop: "5px"}} icon={"arrowLeft"}/></NeoHint>
        }
        if (type === 'next') {
            return <NeoHint title={t('next page')}><NeoIcon className={"Arrow"} style={{marginTop: "5px"}} icon={"arrowRight"}/></NeoHint>
        }
        if (type === 'jump-prev') {
            return <NeoHint title={t('previous 5 pages')}><NeoIcon className={"Arrow"} style={{marginTop: "5px"}} icon={"doubleLeft"}/></NeoHint>
        }
        if (type === 'jump-next') {
            return <NeoHint title={t('next 5 pages')}> <NeoIcon className={"Arrow"} style={{marginTop: "5px"}} icon={"doubleRight"}/></NeoHint>
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
                        {this.state.isPagesViewVisible
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
                        onShowSizeChange={(p, pageSize : any) => this.paginationSetPageSize(pageSize)}
                        itemRender={this.itemRender}
                    />
                </div>
            </ConfigProvider>
        )
    }
}

export default withTranslation()(Paginator)
