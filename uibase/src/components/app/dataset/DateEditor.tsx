import React from 'react';
import moment, {Moment} from "moment";
import {DatePicker} from "antd";

interface Props {
    value: string,
    mask: string,
    type: string
}

interface State {
    pickedDate: Moment,
    currentValue: string,
    format: string
}

const defaultDateFormat = 'YYYY-MM-DD';
const defaultTimestampFormat = 'YYYY-MM-DD HH:mm:ss' ;

export default class DateEditor extends React.Component<Props, State> {
    constructor(props:any) {
        super(props);
        const format = (this.props.type === 'Timestamp') ? defaultTimestampFormat : defaultDateFormat;
        const formatedValue = this.props.mask ? moment(this.props.value, format).format(this.props.mask) : undefined
        this.state = {
            pickedDate: formatedValue ? moment(formatedValue, this.props.mask) : moment(this.props.value, format),
            currentValue: formatedValue ? formatedValue : this.props.value,
            format: format
        };
    }

    onChange = (currentValue: string) => {
        this.setState({currentValue:currentValue});
    };

    getValue() {
        //Возвращаем в формате по умолчаню
        return moment(this.state.currentValue, this.props.mask).format(this.state.format);
    }

    render() {
        return (
                <DatePicker
                    defaultValue={this.state.pickedDate}
                    showToday={false}
                    showTime={this.props.type === 'Timestamp'}
                    onChange={(date, dateString) => {
                        this.onChange(dateString)
                    }}
                    format={this.props.mask}
                />
        );
    }
}