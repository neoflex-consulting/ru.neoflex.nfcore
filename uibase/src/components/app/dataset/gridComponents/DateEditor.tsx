import React from 'react';
import moment, {Moment} from "moment";
import {defaultDateFormat, defaultTimestampFormat} from "../../../../utils/consts";
import {NeoDatePicker} from "neo-design/lib";

interface Props {
    value: string,
    mask: string,
    type: string,
    gridId: string
}

interface State {
    pickedDate: Moment,
    currentValue: string,
    format: string,
    defaultValue: string,
}

export default class DateEditor extends React.Component<Props, State> {
    constructor(props:any) {
        super(props);
        const format = (this.props.type === 'Timestamp') ? defaultTimestampFormat : defaultDateFormat;
        const value = this.props.value ? this.props.value : '1900-01-01';
        const formattedValue = this.props.mask ? moment(value, format).format(this.props.mask) : undefined;
        this.state = {
            format: format,
            pickedDate: formattedValue ? moment(formattedValue, this.props.mask) : moment(value, format),
            currentValue: formattedValue ? formattedValue : value,
            defaultValue: formattedValue ? formattedValue : value
        };
    }

    onChange = (currentValue: string) => {
        this.setState({currentValue:currentValue});
    };

    getValue() {
        //Возвращаем в формате по умолчаню
        return this.state.currentValue !== this.state.defaultValue
                    ? moment(this.state.currentValue, this.props.mask).format(this.state.format)
                    : moment(this.state.defaultValue, this.props.mask).format(this.state.format);
    }

    render() {
        return (
            <NeoDatePicker
                //Fullscreen ag-grid render
                getCalendarContainer={this.props.gridId ? () => (document.getElementById (this.props.gridId)) as HTMLElement : undefined}
                    defaultValue={this.state.pickedDate}
                    showTime={this.props.type === 'Timestamp'}
                    onChange={(date: any, dateString: string) => {
                        this.onChange(dateString)
                    }}
                    format={this.props.mask}
                />
        );
    }
}