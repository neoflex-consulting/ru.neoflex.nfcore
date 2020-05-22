import * as React from 'react';
import {withTranslation, WithTranslation} from "react-i18next";
import {EObject} from "ecore";
import {API} from "../../../modules/api";
import {Button, Modal, Typography} from "antd";
import {getCaption} from "./utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import MasterdataEditor from "./MasterdataEditor";

interface Props {
    entityType: EObject,
    rid: string,
    onSelect: (rid?: string)=>void
}

interface State {
    rid?: string,
    row?: any,
    showDialog: boolean
}

class MasterdataLookup extends React.Component<Props&WithTranslation, State> {
    state = {
        rid: undefined,
        row: undefined,
        showDialog: false
    }

    componentDidMount() {
        this.loadRecord()
    }

    componentDidUpdate(prevProps: Readonly<Props & WithTranslation>, prevState: Readonly<State>, snapshot?: any) {
        if (this.props.rid !== this.state.rid) {
            this.loadRecord()
        }
    }

    loadRecord = () => {
        const {rid} = this.props
        if (rid) {
            API.instance().fetchJson("/masterdata/entity?id=" + encodeURIComponent(rid)).then(json => {
                this.setState({row: json, rid})
            })
        }
        else {
            this.setState({rid: undefined, row: undefined})
        }
    }

    getCaption = () => {
        const {entityType} = this.props
        const {row, rid} = this.state
        const attrs = entityType.get('attributes') as EObject[]
        return (row && attrs.filter(a => a.get('display')).map(a=>row![a.get('name')]).join(" ")) ||
            rid || ''
    }

    render() {
        const {t, onSelect, entityType} = this.props
        return <div>
            {this.state.showDialog && <Modal title={getCaption(entityType)}
                                             onCancel={()=>this.setState({showDialog: false})}
                                             visible={true}
            >
                <MasterdataEditor entityType={entityType} onSelect={(row)=>{
                    const rid = row['@rid']
                    onSelect(rid)
                    this.setState({showDialog: false, row, rid})
                }}/>
            </Modal>}
            <Button title={t('search')} size={'small'}
                    style={{color: 'rgb(151, 151, 151)'}}
                    onClick={(event) => {this.setState({showDialog: true})}}>
                <FontAwesomeIcon icon={faPlus} size='sm' color="#7b7979"/>
            </Button>
            <Button title={t('clear')} size={'small'}
                    style={{color: 'rgb(151, 151, 151)'}}
                    onClick={(event) => {onSelect(undefined)}}>
                <FontAwesomeIcon icon={faTrashAlt} size='sm' color="#7b7979"/>
            </Button>
            <Typography.Text>{this.getCaption()}</Typography.Text>
        </div>;
    }
}

export default withTranslation()(MasterdataLookup)