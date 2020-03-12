import * as React from 'react';
import { withTranslation } from 'react-i18next';
import {Button, Checkbox, Input} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave} from "@fortawesome/free-regular-svg-icons";
import Ecore, {EObject, Resource} from "ecore";
import {API} from "../../../modules/api";

interface Props {
}

interface State {
    changeCurrent: boolean;
    accessPublic: boolean;
    componentName: string;
}

class SaveDatasetComponent extends React.Component<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            changeCurrent: false,
            accessPublic: true,
            componentName: ''
        };
    }

    onClick(): void {
       this.saveDatasetComponentOptions()
    }

    saveDatasetComponentOptions(): void {
        let objectId = this.props.viewObject.get('datasetView')._id;
        let params: any = {};
        if (this.props.viewObject.get('theme') !== null) {params['theme'] = this.props.viewObject.get('theme')}
        if (this.props.viewObject.get('showUniqRow') !== null) {params['showUniqRow'] = this.props.viewObject.get('showUniqRow')}
        if (this.props.viewObject.get('rowPerPage') !== null) {params['rowPerPage'] = this.props.viewObject.get('rowPerPage')}
        this.props.context.changeUserProfile(objectId, params).then (()=> {
            if (this.state.changeCurrent){
                const resource = this.props.viewObject.get('datasetView').get('datasetComponent').eResource()
                this.updateViewObject(resource)
            }
            else {
                this.cloneResource()
            }
        });
    }

    cloneResource(): void {
        this.props.viewObject.get('datasetView').get('datasetComponent').set('access', !this.state.accessPublic ? 'Private' : 'Public')
        this.props.viewObject.get('datasetView').get('datasetComponent').get('audit').get('createdBy', null)
        this.props.viewObject.get('datasetView').get('datasetComponent').get('audit').set('created', null)
        this.props.viewObject.get('datasetView').get('datasetComponent').get('audit').set('modifiedBy', null)
        this.props.viewObject.get('datasetView').get('datasetComponent').get('audit').set('modified', null)

        const resource = this.props.viewObject.get('datasetView').get('datasetComponent').eResource()
        const contents = (eObject: EObject): EObject[] => [eObject, ...eObject.eContents().flatMap(contents)];
        contents(resource.eContents()[0]).forEach(eObject=>{(eObject as any)._id = null});
        resource.eContents()[0].set('name', `${this.state.componentName}`)
        resource.set('uri', null)
        if (resource) {
            this.props.context.changeUserProfile(this.props.viewObject.get('datasetView')._id, {name: this.state.componentName})
            this.updateViewObject(resource);
        }
    }

    private updateViewObject(resource: Resource) {
        API.instance().saveResource(resource)
            .then((newDatasetComponent: any) => {
                this.props.context.notification('Save component', 'Created', 'success')
                this.props.viewObject.get('datasetView').set('datasetComponent', newDatasetComponent.eContents()[0])
                const newResourceSet: Ecore.ResourceSet = this.props.viewObject.eResource().eContainer as Ecore.ResourceSet
                const newViewObject: Ecore.EObject[] = newResourceSet.elements()
                    .filter((r: Ecore.EObject) => r.eContainingFeature.get('name') === 'view')
                    .filter((r: Ecore.EObject) => r.eContainingFeature._id === this.props.context.viewObject.eContainingFeature._id)
                    .filter((r: Ecore.EObject) => r.eContainer.get('name') === this.props.context.viewObject.eContainer.get('name'))
                this.props.context.updateContext!(({viewObject: newViewObject[0]}))
            });
    }

    onChangeName(e: any): void {
        this.setState({componentName: e})
    }

    onChangeCurrent(): void {
        this.state.changeCurrent ? this.setState({changeCurrent: false}) : this.setState({changeCurrent: true})
    }

    onChangeAccess(): void {
        this.state.accessPublic ? this.setState({accessPublic: false}) : this.setState({accessPublic: true})
    }

    render() {
        const { t } = this.props;

        return (
            <div>
                <Input
                    placeholder={'new report name'}
                    disabled={this.state.changeCurrent}
                    style={{ width: '200px', marginRight: '10px', marginBottom: '20px'}}
                    allowClear={true}
                    onChange={(e: any) => this.onChangeName(e.target.value)}
                />
                <Checkbox
                    checked={this.state.changeCurrent}
                    disabled={false}
                    onChange={() => this.onChangeCurrent()}
                >
                    Change current
                </Checkbox>
                <Checkbox
                    checked={this.state.accessPublic}
                    disabled={false}
                    onChange={() => this.onChangeAccess()}
                >
                    Public
                </Checkbox>
                <div>
                <Button title={t('save')} style={{ width: '100px', color: 'rgb(151, 151, 151)'}} onClick={() => this.onClick()}>
                    <FontAwesomeIcon icon={faSave} size='1x'/>
                </Button>
                </div>
            </div>

        )
    }
}

export default withTranslation()(SaveDatasetComponent)
