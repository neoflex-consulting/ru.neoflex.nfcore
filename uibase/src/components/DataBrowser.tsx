import * as React from "react";
import SearchGridTrans from "./SearchGrid";

export interface Props {}

export class DataBrowser extends React.Component<any, any> {

    render() {
        return (
            <SearchGridTrans showAction={true} specialEClass={undefined}/>
        );
    }}
