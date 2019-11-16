import React, { Component, Fragment } from 'react'
import { Input } from 'antd'

const TextArea = Input.TextArea
const Password = Input.Password

const types: { [key:string]: any } = {
    text: TextArea,
    password: Password
}

interface State {
    editing: Boolean,
}

interface Props {
    editedProperty: any,
    value: any,
    onChange: Function,
    type: string
}

class EditableTextArea extends Component<Props, State>{

    state = {
        editing: false
    }

    render() {
        const splitedString = this.props.value ? this.props.value.toString().split('\n') : []
        const lines = splitedString.length
        const Input = types[this.props.type]

        return (
            <Fragment key="editableTextArea">
                {this.state.editing ?
                <Input autoFocus
                    key="textedit"
                    style={{ resize: 'none' }}
                    autosize={{ maxRows: lines <= 15 ? lines + 1.5 : 15 }}
                    defaultValue={this.props.value}
                    onBlur={(e:any) => {
                        const key = this.props.editedProperty
                        const newValue = e.target.value
                        if (newValue !== this.props.value) {
                            this.props.onChange({[key]: newValue}, e)
                        }
                        this.setState({ editing: false })
                    }}
                />
                :
                <Input readOnly
                    key="textview"
                    autosize={{ maxRows: lines <= 15 ? lines + 1.5 : 15 }}
                    value={this.props.value}
                    style={{
                        whiteSpace: 'pre',
                        overflow: 'auto',
                        resize: 'none'
                    }}
                    onClick={() => this.setState({ editing: true })} 
                />}
            </Fragment>
        )
    }
}

export default EditableTextArea
