import React from 'react';
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Button} from "antd";

interface Props {
    node: any,
    editGrid: any,
}

interface State {
}

export default class DeleteButton extends React.Component<Props, State> {
    onButtonClick = (event:any) => {
        this.props.editGrid.onDelete(this.props.node.data);
    };

    render() {
        return (
            <Button
                style={{color: 'rgb(151, 151, 151)'}}
                onClick={this.onButtonClick}
            >
                <FontAwesomeIcon icon={faTrash} size='lg' color="#7b7979"/>
            </Button>
        );
    }
}