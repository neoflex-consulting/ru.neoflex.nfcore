import * as React from 'react';
import {WithTranslation, withTranslation} from 'react-i18next';
import {API} from "../../../modules/api";
import {NeoButton, NeoRow, NeoTypography} from "neo-design/lib";

interface Props {
    closeModal?: () => void;
    closeModalGrid: () => void;
    handleDeleteMenuForCancel: () => void;
    currentDatasetComponent: any;
    isGrid: boolean;
    context: any;
    currentDiagram: any;
}

class DeleteDatasetComponent extends React.Component<Props & WithTranslation, any> {

    onClick(): void {

        if (this.props.isGrid){
            this.props.closeModalGrid();
        }
        else {
            const name = this.props.currentDatasetComponent.eContents()[0].get('name');
            this.props.closeModal!();
            const ref: string = `${this.props.currentDatasetComponent.get('uri')}?rev=${this.props.currentDatasetComponent.rev}`;
            API.instance().deleteResource(ref).then((response: any) => {
                if (response.result === "ok") {
                    this.props.context.notification(name, "deleted ", "info")
                }
            })
        }
    }

    render() {
        const { t } = this.props;
        let name = this.props.currentDatasetComponent.eContents()[0].get('name');
        let nameOfDiagram = this.props.currentDiagram?.diagramName
        return (
            <div>
                <NeoTypography type={'capture_regular'} style={{color : "#333333"}}>{this.props.isGrid ? (t('diagram') + " " + nameOfDiagram) : (t('version') + " " + name )} {t('deleteVersionMessage')}</NeoTypography>
                <NeoRow style={{marginTop:'32px', justifyContent:'flex-start'}}>
                    <NeoButton title={t('save')} style={{width:'111px', marginRight:'20px'}} onClick={() => this.onClick()}>
                        {t('delete')}
                    </NeoButton>
                    <NeoButton type={"secondary"} title={t('save')} style={{ width:'120px', color: 'fff'}} onClick={() => this.props.handleDeleteMenuForCancel()}>
                        {t('cancel')}
                    </NeoButton>
                </NeoRow>
            </div>

        )
    }
}


export default withTranslation()(DeleteDatasetComponent)


