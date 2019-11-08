import * as React from "react";
import SearchGrid from "./SearchGrid";

export interface Props {}

export class DataBrowser extends React.Component<any, any> {

    render() {
        return (
            <SearchGrid showAction={true} specialEClass={undefined}/>
        );
    }}
