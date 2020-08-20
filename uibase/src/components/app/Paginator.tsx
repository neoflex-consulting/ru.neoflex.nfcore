import React from "react";
import {Pagination, ConfigProvider} from "antd";
import {withTranslation} from "react-i18next";
import Ru from 'antd/es/locale/ru_RU';
import En from 'antd/es/locale/en_US';
import Ch from 'antd/es/locale/zh_TW';

interface Props {
    paginationPageSize: number,
    currentPage: number,
    totalNumberOfPage: number;
}


class Paginator extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

        this.state = {
            paginationPageSize: this.props.paginationPageSize,
        };
    }


    onSomePage = (e : any) =>{
        this.props.grid.current.api.paginationGoToPage(e-1);
    }

    paginationSetPageSize = (pageSize : any) =>{
        this.props.grid.current.api.paginationSetPageSize(pageSize);
        this.setState({ paginationPageSize: pageSize});

    }

    render() {
        return (
            <ConfigProvider locale={this.props.i18n.language === "ru" ? Ru : this.props.i18n.language === "us" ? En : Ch}>
                <div style={{marginTop: "21.33px", marginBottom: "21.33px", float: "right"}}>
                    <Pagination
                        size="small"
                        current={this.props.currentPage}
                        total={this.props.totalNumberOfPage*this.state.paginationPageSize || 0}
                        onChange={(e : any) => this.onSomePage(e)}
                        showSizeChanger
                        showQuickJumper
                        pageSizeOptions={['10', '20', '30', '40', '100']}
                        onShowSizeChange={(p: any, pageSize : any) => this.paginationSetPageSize(pageSize)}
                    />
                </div>
            </ConfigProvider>
        )
    }
}

export default withTranslation()(Paginator)