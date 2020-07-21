import React from 'react';
import moment, {Moment} from "moment";
import {DatePicker} from "antd";

interface Props {
    value: string,
    t: any
}

interface State {
    pickedDate: Moment,
    currentValue: string
}

export default class DateEditor extends React.Component<Props, State> {
    nv: any;
    constructor(props:any) {
        super(props);
        this.state = {
            pickedDate: this.props.value ? moment(this.props.value, 'YYYY-MM-DD') : moment(),
            currentValue: this.props.value
        };
    }


    onChange = (currentValue: string) => {
        this.setState({currentValue:currentValue});
    };

    getValue() {
        return this.state.currentValue;
    }

    render() {
        return (
            <DatePicker
                defaultValue={moment(this.props.value, 'YYYY-MM-DD')}
                showToday={false}
                onChange={(date, dateString) => {
                    this.onChange(dateString)
                }}
            />
        );
    }
}