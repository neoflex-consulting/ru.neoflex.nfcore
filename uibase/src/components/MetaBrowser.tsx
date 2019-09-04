import * as React from "react";
import {Col, Row, Table} from 'antd';
import Ecore from "ecore"
import {API} from "../modules/api";
import {withTranslation, WithTranslation} from "react-i18next";

export interface Props {
}

interface State {
    ePackages: Ecore.EPackage[];
}

class MetaBrowser extends React.Component<Props & WithTranslation, State> {
    state = {ePackages: Ecore.EPackage.Registry.ePackages()};

    componentDidMount(): void {
        API.instance().fetchPackages().then(packages=>{
            this.setState({ePackages: packages})
        })
    }

    getName = (eObject: any): JSX.Element => {
        let prefix: string = '';
        let name: string = eObject.get('name');
        let postfix: string = '';
        if (eObject.isKindOf('EReference')) {
            let isContainment = Boolean(eObject.get('containment'));
            if (isContainment) {
                prefix = prefix + 'contains ';
            } else {
                prefix = prefix + 'refers ';
            }
            let eReferenceType = eObject.get('eType');
            if (eReferenceType) {
                let typeName = eReferenceType.get('name');
                prefix = prefix + typeName;
            }
        }
        if (eObject.isKindOf('EAttribute')) {
            let eType = eObject.get('eType');
            if (eType) {
                let typeName = eType.get('name');
                prefix = prefix + typeName;
            }
        }
        if (eObject.isKindOf('EStructuralFeature')) {
            let upperBound = eObject.get('upperBound');
            if (upperBound && upperBound !== 1) {
                prefix = prefix + '[] ';
            } else {
                prefix = prefix + ' ';
            }
        }
        if (eObject.isKindOf('EEnum')) {
            prefix = 'enum ';
        }
        if (eObject.isTypeOf('EDataType')) {
            prefix = 'type ';
        }
        if (eObject.isKindOf('EClass')) {
            if (eObject.get('abstract')) {
                prefix = prefix + 'abstract ';
            }
            if (eObject.get('interface')) {
                prefix = prefix + 'interface ';
            } else {
                prefix = prefix + 'class ';
            }
            let eSuperTypes = (eObject.get('eSuperTypes') as any[]).filter(e => e.get('name') !== 'EObject');
            if (eSuperTypes.length > 0) {
                postfix = " extends " + eSuperTypes.map(e => e.get('name')).join(", ")
            }
        }
        if (eObject.isKindOf('EOperation')) {
            let eType = eObject.get('eType');
            if (eType) {
                prefix = eType.get('name') + ' ';
            }
            let eParameters = eObject.get('eParameters') as any[];
            postfix = '(' + eParameters.map(p => {
                return p.get('eType').get('name') + ' ' + p.get('name')
            }).join(', ') + ')';
        }
        return <span>{prefix}<b>{name}</b>{postfix}</span>;
    };

    render() {
        let data: any[] = [];
        for (let ePackage of this.state.ePackages) {
            let eClassifiers: any[] = [];
            data.push({key: ePackage.eURI(), name: this.getName(ePackage), type: ePackage.eClass.get('name'), children: eClassifiers});
            for (let eClassifier of ePackage.get('eClassifiers').array()) {
                let children2: any[] = [];
                let child = {
                    key: eClassifier.eURI(),
                    name: this.getName(eClassifier),
                    type: eClassifier.eClass.get('name'),
                    children: children2
                };
                eClassifiers.push(child);
                let eStructuralFeatures = eClassifier.get('eStructuralFeatures');
                if (eStructuralFeatures) {
                    for (let eStructuralFeature of eStructuralFeatures.array()) {
                        children2.push({
                            key: eStructuralFeature.eURI(),
                            name: this.getName(eStructuralFeature),
                            type: eStructuralFeature.eClass.get('name')
                        })
                    }
                }
                let eLiterals = eClassifier.get('eLiterals');
                if (eLiterals) {
                    for (let eLiteral of eLiterals.array()) {
                        children2.push({
                            key: eLiteral.eURI(),
                            name: eLiteral.get('name'),
                            type: eLiteral.eClass.get('name')
                        })
                    }
                }
                let eOperations = eClassifier.get('eOperations');
                if (eOperations) {
                    for (let eOperation of eOperations.array()) {
                        children2.push({
                            key: eOperation.eURI(),
                            name: this.getName(eOperation),
                            type: eOperation.eClass.get('name')
                        })
                    }
                }
                if (children2.length === 0) {
                    delete child['children']
                }
            }
        }
        const {t} = this.props as Props & WithTranslation;
        return (
            <Row>
                <Col span={1}/>
                <Col span={22}>
                    <Table dataSource={data} pagination={false}>
                        <Table.Column title={t("datasource.eClasses.Driver.eStructuralFeatures.name.caption",
                            {ns: 'packages'})} dataIndex="name" key="name"/>
                        <Table.Column title={t("datasource.eClasses.ValueType.eStructuralFeatures.dataType.caption",
                            {ns: 'packages'})} dataIndex="type" key="type"/>
                        <Table.Column title="URI" dataIndex="key" key="key"/>
                    </Table>
                </Col>
                <Col span={1}/>
            </Row>
        );
    }
}

const MetaBrowserTrans = withTranslation()(MetaBrowser);
export default MetaBrowserTrans;
