import * as React from "react";
import Ecore from "ecore"
import {API} from "../modules/api";
import {withTranslation, WithTranslation} from "react-i18next";
import {Helmet} from "react-helmet";
import {NeoInput, NeoTabs} from "neo-design/lib";
//CSS
import './../styles/MetaBrowser.css';
import DatasetGrid from "./app/dataset/DatasetGrid";
import {getClassAnnotationByClassAndKey} from "../utils/eCoreUtil";

export interface Props {
}

interface State {
    ePackages: Ecore.EPackage[];
    data: {
        gridRef:any;
        name:string,
        type:string,
        uri:string,
        description:string,
        children:any,
        show:any,
        hide:any,
        isVisible__:boolean
    }[];
}

class MetaBrowser extends React.Component<Props & WithTranslation, State> {


    gridRef : any;
    height: any;

    state = {
        ePackages: Ecore.EPackage.Registry.ePackages(),
        data: [] as {
            gridRef:any;
            name:string,
            type:string,
            uri:string,
            description:any,
            children:any,
            show:any,
            hide:any,
            isVisible__:boolean
        }[],
    };

    componentDidMount(): void {
        API.instance().fetchPackages().then(packages=>{
            this.setState({ePackages: packages},
                ()=>{
                    this.setState({data: this.getData()})
                })
        })
        this.gridRef = React.createRef();
        this.height = window.innerHeight;
    }

    getName = (eObject: any): string => {
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
        return `<span>${prefix}<b>${name}</b>${postfix}</span>`;
    };


    getColDefs = () => {
        let colDef = [];
        let rowData = new Map();
        rowData.set('field', 'name');
        rowData.set('headerName', this.props.t('metadata name'));
        rowData.set('textAlign','right');
        rowData.set('component','expand');
        rowData.set('width', '554');
        colDef.push(rowData);
        rowData = new Map();
        rowData.set('field', 'type');
        rowData.set('headerName', this.props.t('metadata type'));
        rowData.set('textAlign','right');
        rowData.set('width', '242');
        colDef.push(rowData);
        rowData = new Map();
        rowData.set('field', 'key');
        rowData.set('headerName', this.props.t('metadata uri'));
        rowData.set('textAlign','right');
        rowData.set('width', '532');
        colDef.push(rowData);
        rowData = new Map();
        rowData.set('field', 'description');
        rowData.set('headerName', this.props.t('description'));
        rowData.set('textAlign','right');
        rowData.set('width', '600');
        colDef.push(rowData);
        return colDef
    };

    getData = () => {
        let data: any[] = [];
        for (let ePackage of this.state.ePackages) {
            let eClassifiers: any[] = [];
            let parent = {
                //mock
                gridRef: {onFilterChanged:()=>{},redraw:()=>{}},
                key: ePackage.eURI(),
                name: ePackage.get('name'),
                type: ePackage.eClass.get('name'),
                children: eClassifiers,
                isVisible__: true
            };
            data.push(parent);
            for (let eClassifier of ePackage.get('eClassifiers').array()) {
                let children2: any[] = [];
                let description = getClassAnnotationByClassAndKey(eClassifier,'documentation');
                let child = {
                    key: eClassifier.eURI(),
                    name: this.getName(eClassifier),
                    type: eClassifier.eClass.get('name'),
                    depth: 0,
                    children: children2,
                    isExpanded: false,
                    isVisible__: true,
                    description: description,
                    show: (redraw: boolean = false) => {
                        child.isExpanded = true;
                        children2.forEach(c => {
                            c.isVisible__ = true;
                        });
                        if (redraw && parent.gridRef) {
                            parent.gridRef.onFilterChanged();
                            parent.gridRef.redraw();
                        }
                    },
                    hide: (redraw: boolean = false) => {
                        child.isExpanded = false;
                        children2.forEach(c => {
                            c.isVisible__ = false;
                        });
                        if (redraw && parent.gridRef) {
                            parent.gridRef.onFilterChanged();
                            parent.gridRef.redraw();
                        }
                    }
                };
                eClassifiers.push(child);
                let children2Index = 0;
                let eStructuralFeatures = eClassifier.get('eStructuralFeatures');
                if (eStructuralFeatures) {
                    for (let eStructuralFeature of eStructuralFeatures.array()) {
                        let description = getClassAnnotationByClassAndKey(eStructuralFeature,'documentation');
                        children2.push({
                            key: eStructuralFeature.eURI(),
                            name: this.getName(eStructuralFeature),
                            type: eStructuralFeature.eClass.get('name'),
                            depth: 1,
                            isVisible__: false,
                            description: description,
                            showParent: () => {
                                child.isVisible__ = true;
                                child.isExpanded = true;
                            },
                            index: children2Index
                        });
                        children2Index += 1;
                    }
                }
                let eLiterals = eClassifier.get('eLiterals');
                if (eLiterals) {
                    for (let eLiteral of eLiterals.array()) {
                        let description = getClassAnnotationByClassAndKey(eLiteral,'documentation');
                        children2.push({
                            key: eLiteral.eURI(),
                            name: eLiteral.get('name'),
                            type: eLiteral.eClass.get('name'),
                            depth: 1,
                            isVisible__: false,
                            description: description,
                            showParent: ()=>{
                                child.isVisible__ = true;
                                child.isExpanded = true;
                            },
                            index: children2Index
                        });
                        children2Index += 1;
                    }
                }
                let eOperations = eClassifier.get('eOperations');
                if (eOperations) {
                    for (let eOperation of eOperations.array()) {
                        let description = getClassAnnotationByClassAndKey(eOperation,'documentation');
                        children2.push({
                            key: eOperation.eURI(),
                            name: this.getName(eOperation),
                            type: eOperation.eClass.get('name'),
                            depth: 1,
                            isVisible__: false,
                            description: description,
                            showParent: ()=> {
                                child.isVisible__ = true;
                                child.isExpanded = true;
                            },
                            index: children2Index
                        });
                        children2Index += 1;
                    }
                }
                if (children2.length === 0) {
                    delete child['children'];
                }
                children2.forEach(c=>{
                    eClassifiers.push(c);
                })
            }
        }
        return data
    };

    render() {
        const {t} = this.props as Props & WithTranslation;
        return (
            <div id={"meta-browser"}>
                <Helmet>
                    <title>{t('metadata')}</title>
                    <link rel="shortcut icon" type="image/png" href="/developer.ico" />
                </Helmet>
                <div style={{top:'-100px', height:'0'}} className={"meta-browser-tabs-region meta-browser-center-element"}>
                    <NeoInput
                        className={"meta-browser-input"}
                        type={"search"}
                        onSearch={(str:string)=>{
                            this.state.data.forEach(el=>{
                                el.isVisible__ = str === "";
                                el.children.forEach((c1:any)=>{
                                    if (str !== "") {
                                        if (c1.name.match(new RegExp(str,'gi'))) {
                                            c1.isVisible__ = true;
                                            el.isVisible__ = true;
                                            if (c1.showParent)
                                                c1.showParent();
                                        } else {
                                            c1.isVisible__ = false;
                                        }
                                    } else {
                                        if (c1.depth === 0) {
                                            el.isVisible__ = true;
                                            c1.isVisible__ = true;
                                            c1.isExpanded = false;
                                        } else {
                                            c1.isVisible__ = false;
                                        }
                                    }
                                })
                            });
                            if (this.state.data.filter((el:any)=>el.isVisible__).length > 0) {
                                this.state.data.forEach(e=>{
                                    if (e.isVisible__ && e.gridRef) {
                                        e.gridRef.onFilterChanged();
                                        e.gridRef.redraw();
                                    }
                                })
                            }
                            this.setState({data:this.state.data.slice()})
                        }}
                    />
                </div>
                <NeoTabs className={"meta-browser-tabs-region meta-browser-center-element"}
                         defaultActiveKey={"ecore"}
                         tabPosition={'top'}>
                    {this.state.data.map(eObj=>{
                        if (eObj.isVisible__ ){
                            return <NeoTabs.NeoTabPane tab={eObj.name}
                                                       key={eObj.name}>
                                <DatasetGrid
                                    ref={(ref:any)=> {
                                        eObj.gridRef = ref;
                                        this.gridRef = ref;
                                    }}
                                    paginationPageSize={40}
                                    height={this.height > 1078 ? 874 : this.height > 920 ? 690 : 504}
                                    rowData = {eObj.children}
                                    columnDefs = {this.getColDefs()}
                                    highlightClassFunction = {(params: any) => {
                                        if (params.data.depth > 0 && params.data.index % 2 === 0)
                                            return "meta-browser-highlight-even";
                                        if (params.data.depth > 0 && params.data.index % 2 !== 0)
                                            return "meta-browser-highlight-odd";
                                        return ""
                                    }}
                                />
                            </NeoTabs.NeoTabPane>}
                        else{
                            return null
                        }
                    })}
                </NeoTabs>
            </div>
        )
    }
}

export default withTranslation()(MetaBrowser)
