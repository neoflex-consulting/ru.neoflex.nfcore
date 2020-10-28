import React from "react";
import {Pagination, ConfigProvider} from "antd";
import {withTranslation} from "react-i18next";
import Ru from 'antd/es/locale/ru_RU';
import En from 'antd/es/locale/en_US';
import Ch from 'antd/es/locale/zh_TW';
import NeoIcon from "neo-icon/lib/icon";
import {NeoButton} from "neo-design/lib";
import '../../styles/Paginator.css';
import {adaptiveElementSize, getAdaptiveSize} from "../../utils/adaptiveResizeUtils";

interface Props {
    paginationPageSize: number,
    currentPage: number,
    totalNumberOfPage: number;
    totalNumberOfRows: number;
    i18n: any;
    grid: any;
    t: any;
    tReady: any;
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
        this.props.grid.current.api.paginationGoToPage(e - 1);
    };

    paginationSetPageSize = (pageSize : any) =>{
        this.props.grid.current.api.paginationSetPageSize(pageSize);
        this.setState({ paginationPageSize: pageSize});

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

    render() {
        return (
            <ConfigProvider locale={this.props.i18n.language === "ru" ? Ru : this.props.i18n.language === "us" ? En : Ch}>
                <div ref={this.paginatorRef}
                    id={"paginator"} className={`${this.props.totalNumberOfPage === 1 && "single-page"} ${this.state.paginatorSize >= adaptiveElementSize.medium ? "paginator-large" : "paginator-small"}`}
                    style={{marginTop: "10px", marginBottom: "10px", float: "right"}}>
                    {this.props.totalNumberOfPage > 1 ? <NeoButton id={"toFirst"} type={this.props.currentPage === 1 ? "disabled" : undefined} onClick={() => this.onSomePage(0)}><NeoIcon icon={"arrowVerticalRight"}/></NeoButton> : null}
                    {this.props.totalNumberOfPage > 1 ? <NeoButton id={"toLast"} type={this.props.currentPage === this.props.totalNumberOfPage ? "disabled" : undefined} onClick={() => this.onSomePage(this.props.totalNumberOfPage)}><NeoIcon icon={"arrowVerticalLeft"}/></NeoButton> : null}
                    {this.props.totalNumberOfRows && (this.state.paginatorSize >= adaptiveElementSize.medium)
                        ?
                          <PagesView
                              currentPage={this.props.currentPage}
                              paginationPageSize={this.state.paginationPageSize}
                              totalNumberOfRows={this.props.totalNumberOfRows}
                          />
                        : null}
                    <Pagination
                        size="small"
                        current={this.props.currentPage}
                        total={this.props.totalNumberOfPage*this.state.paginationPageSize || 0}
                        onChange={(e : any) => this.onSomePage(e)}
                        showSizeChanger
                        showQuickJumper
                        pageSize={this.state.paginationPageSize}
                        pageSizeOptions={['10', '20', '30', '40', '100']}
                        onShowSizeChange={(p: any, pageSize : any) => this.paginationSetPageSize(pageSize)}
                    />
                </div>
            </ConfigProvider>
        )
    }
}

export default withTranslation()(Paginator)