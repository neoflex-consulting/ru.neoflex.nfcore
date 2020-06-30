import * as React from 'react';
import {withTranslation} from 'react-i18next';
import {Button} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave} from "@fortawesome/free-regular-svg-icons";
import {faBan} from "@fortawesome/free-solid-svg-icons";
import {API} from "../../../modules/api";

interface Props {
    closeModal?: () => void;
    handleDeleteMenuForCancel: () => void;
    currentDatasetComponent: any;
}

class DeleteDatasetComponent extends React.Component<any, any> {

    onClick(): void {
        const name = this.props.currentDatasetComponent.eContents()[0].get('name')
        this.props.closeModal!();
            const ref: string = `${this.props.currentDatasetComponent.get('uri')}?rev=${this.props.currentDatasetComponent.rev}`;
            API.instance().deleteResource(ref).then((response: any) => {
                if (response.result === "ok") {
                        this.props.context.notification(name, "deleted ", "info")
                }
            })
    }

    render() {
        const { t } = this.props;
        return (
            <div>
                    <Button title={t('delete')} style={{ width: '100px', color: 'rgb(151, 151, 151)'}} onClick={() => this.onClick()}>
                        <FontAwesomeIcon icon={faSave} size='1x'/>
                    </Button>
                    <Button title={t('cancel')} style={{ width: '100px', color: 'rgb(151, 151, 151)'}} onClick={() => this.props.handleDeleteMenuForCancel()}>
                        <FontAwesomeIcon icon={faBan} size='1x'/>
                    </Button>

            </div>


        )
    }
}

export default withTranslation()(DeleteDatasetComponent)
