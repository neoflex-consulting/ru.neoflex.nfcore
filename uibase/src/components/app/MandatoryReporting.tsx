import React from "react";

import Calendar from "./Calendar";
import './../../styles/MandatoryReporting.css';

class MandatoryReporting extends React.Component<any, any> {

    render() {
        return (
            <div>
                <header className="headerCalendar">
                    <div id="logo">
                        {/*<span>*/}
                            <b>Обязательная отчетность</b>
                        {/*</span>*/}
                    </div>
                </header>
                <main className="mainCalendar">
                    <Calendar />
                </main>
            </div>
        );
    }
}

export default MandatoryReporting;
