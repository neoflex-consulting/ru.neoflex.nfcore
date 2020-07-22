import React from 'react';
import moment, {Moment} from "moment";
import {DatePicker} from "antd";

interface Props {
    value: string,
    mask: string
}

interface State {
    pickedDate: Moment,
    defaultValue: Moment,
    currentValue: string
}

export default class DateEditor extends React.Component<Props, State> {
    constructor(props:any) {
        super(props);
        const formatedValue = this.props.mask ? moment(this.props.value, 'YYYY-MM-DD').format(this.props.mask) : undefined
        this.state = {
            pickedDate: formatedValue ? moment(formatedValue, this.props.mask) : moment(this.props.value, 'YYYY-MM-DD'),
            currentValue: formatedValue ? formatedValue : this.props.value,
            defaultValue: formatedValue ? moment(formatedValue, this.props.mask) : moment(this.props.value, 'YYYY-MM-DD'),
        };
    }

    onChange = (currentValue: string) => {
        this.setState({currentValue:currentValue});
    };

    getValue() {
        //Возвращаем в формате по умолчаню
        return moment(this.state.currentValue, this.props.mask).format('YYYY-MM-DD');
    }

    render() {
        return (
                <DatePicker
                    defaultValue={this.state.defaultValue}
                    showToday={false}
                    onChange={(date, dateString) => {
                        this.onChange(dateString)
                    }}
                    format={this.props.mask}
                />
        );
    }
}