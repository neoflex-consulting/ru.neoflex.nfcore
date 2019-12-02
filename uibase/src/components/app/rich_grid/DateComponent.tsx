import * as React from "react"

export default class ReportRichGrid extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            date: null,
            textBoxes: {
                dd: '',
                mm: '',
                yyyy: ''
            }
        }
    }

    render() {
        //Inlining styles to make simpler the component
        let filterStyle = {
            margin: '2px'
        };
        let ddStyle = {
            width: '30px'
        };
        let mmStyle = {
            width: '30px'
        };
        let yyyyStyle = {
            width: '40px'
        };
        let resetStyle = {
            padding: '2px',
            backgroundColor: 'red',
            borderRadius: '3px',
            fontSize: '10px',
            marginRight: '5px',
            color: 'white'
        };

        return (
            <div style={filterStyle}>
                <span style={resetStyle} onClick={this.resetDate.bind(this)}>x</span>
                <input onChange={this.onDateChanged.bind(this)} ref="dd" placeholder="dd" style={ddStyle}
                       value={this.state.textBoxes.dd} maxLength={2}/>/
                <input onChange={this.onDateChanged.bind(this)} ref="mm" placeholder="mm" style={mmStyle}
                       value={this.state.textBoxes.mm} maxLength={2}/>/
                <input onChange={this.onDateChanged.bind(this)} ref="yyyy" placeholder="yyyy" style={yyyyStyle}
                       value={this.state.textBoxes.yyyy} maxLength={4}/>
            </div>
        );
    }
    getDate() {
        return this.state.date;
    }

    setDate(date: any) {
        this.setState({
            date,
            textBoxes: {
                dd: date ? date.getDate() : '',
                mm: date ? date.getMonth() + 1 : '',
                yyyy: date ? date.getFullYear() : ''
            }
        })
    }

    updateAndNotifyAgGrid(date: any, textBoxes: any) {
        // updateAndNotifyAgGrid(date, textBoxes) {
        this.setState({
                date: date,
                textBoxes: textBoxes
            },
            this.props.onDateChanged
        );
    }

    resetDate() {
        let date = null;
        let textBoxes = {
            dd: '',
            mm: '',
            yyyy: '',
        };

        this.updateAndNotifyAgGrid(date, textBoxes)
    }

    onDateChanged() {
        let day = this.parseDate(this.refs.dd, this.refs.mm, this.refs.yyyy)
        // let date = this.parseDate(this.refs.dd.value, this.refs.mm.value, this.refs.yyyy.value);
        let textBoxes = {
            // dd: this.refs.dd.value,
            // mm: this.refs.mm.value,
            // yyyy: this.refs.yyyy.value,
            dd: this.refs.dd,
            mm: this.refs.mm,
            yyyy: this.refs.yyyy,
        };

        // this.updateAndNotifyAgGrid(date, textBoxes)
        this.updateAndNotifyAgGrid(Date, textBoxes)
    }

    parseDate(dd: any, mm: any, yyyy: any) {
       if (dd.trim() === '' || mm.trim() === '' || yyyy.trim() === '') {
            return null;
        }

        let day = Number(dd);
        let month = Number(mm);
        let year = Number(yyyy);

        let date = new Date(year, month - 1, day);

       if (isNaN(date.getTime())) {
            return null;
        }

       if (date.getDate() != day || date.getMonth() + 1 != month || date.getFullYear() != year) {
            return null;
        }

        return date;
    }
}
