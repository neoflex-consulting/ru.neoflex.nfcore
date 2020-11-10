import React from 'react';
import {NeoButton} from 'neo-design';
import {NeoIcon} from "neo-icon/lib";

interface Props {
    t: any,
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
            <NeoButton
                type={"link"}
                title={this.props.t('delete row')}
                style={{marginTop: "12px"}}
                onClick={this.onButtonClick}
            >
                <NeoIcon icon={"rubbish"} size={"m"} color={'#5E6785'}/>
            </NeoButton>
        );
    }
}