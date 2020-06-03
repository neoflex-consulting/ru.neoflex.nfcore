import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {API, Error} from "../../../modules/api";
import {Button} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRunning, faSave, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import Splitter from "../../CustomSplitter";
import AceEditor from "react-ace";
import 'brace/mode/groovy';
import 'brace/mode/text';
import 'brace/theme/tomorrow';
import {jsonRegex} from "ts-loader/dist/constants";

interface Props {
    path: string
}

class FilesystemGroovyEditor extends React.Component<Props & WithTranslation, any> {
    private splitterRef: React.RefObject<any> = React.createRef()
    state = {
        path: undefined,
        text: "",
        result: ""
    }

    componentDidMount() {
        this.setState({path: this.props.path}, this.loadContents)
    }

    componentDidUpdate(prevProps: Readonly<Props & WithTranslation>, prevState: Readonly<any>, snapshot?: any) {
        if (this.state.path !== this.props.path) {
            this.setState({path: this.props.path}, this.loadContents)
        }
    }

    loadContents = () => {
        if (this.state.path) {
            API.instance().fetch("/system/fs/data?path=" + this.state.path)
                .then(response => response.text())
                .then(text => this.setState({text: text || "", result: ""}))
        }
    }

    save = () => {
        API.instance().fetchJson("/system/fs?path=" + this.state.path, {
            method: 'PUT',
            body: this.state.text
        }).then(value => {
        })
    }

    run = () => {
        this.setState({result: "Wait..."})
        const errorHandlers = API.instance().errorHandlers
        API.instance().errorHandlers = [{
            handleError: (reason: Error) => {
                this.setState({result: reason.message});
                API.instance().errorHandlers = errorHandlers
            }
        }]
        API.instance().fetchJson("/script/evaluate?name=" + this.state.path, {
            method: 'POST',
            body: this.state.text
        }).then(ret => {
            let result = ""
            if (ret.out) {
                result = result + ret.out + "\n"
            }
            if (ret.result && ret.result !== "null") {
                result = result + ">> " + ret.result
            }
            this.setState({result})
            API.instance().errorHandlers = errorHandlers
        })
    }

    resizeEditors = () => {
        (this.refs.aceEditor as AceEditor).editor.resize()
        if (this.refs.console) {
            (this.refs.console as AceEditor).editor.resize()
        }
    };

    onSplitterChange = (value: number): void => {
        this.resizeEditors();
        this.setState({splitterPosition: value});
    };

    onTextChange = (text: string) => {
        this.resizeEditors();
        this.setState({text})
    };

    render() {
        const {t} = this.props
        return (
            <div style={{display: 'flex', flexFlow: 'column', height: '100%'}}>
                <div>
                    <Button title={t('refresh')} style={{color: 'rgb(151, 151, 151)'}} disabled={false}
                            onClick={this.loadContents}>
                        <FontAwesomeIcon icon={faSyncAlt} size='lg' color="#7b7979"/>
                    </Button>
                    <div style={{
                        display: 'inline-block',
                        height: '30px',
                        borderLeft: '1px solid rgb(217, 217, 217)',
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginBottom: '-10px',
                        borderRight: '1px solid rgb(217, 217, 217)',
                        width: '6px'
                    }}/>
                    <Button title={t('save')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={false} onClick={this.save}>
                        <FontAwesomeIcon icon={faSave} size='lg' color="#7b7979"/>
                    </Button>
                    <Button title={t('run')} style={{color: 'rgb(151, 151, 151)'}}
                            disabled={false} onClick={this.run}>
                        <FontAwesomeIcon icon={faRunning} size='lg' color="#7b7979"/>
                    </Button>
                </div>
                <div style={{flexGrow: 1}}>
                    <Splitter
                        ref={this.splitterRef}
                        position="horizontal"
                        primaryPaneMaxHeight="80%"
                        primaryPaneMinHeight={0}
                        primaryPaneHeight={localStorage.getItem('groovy_splitter_pos') || "400px"}
                        dispatchResize={true}
                        postPoned={false}
                        onDragFinished={() => {
                            const size: string = this.splitterRef.current!.panePrimary.props.style.height
                            localStorage.setItem('groovy_splitter_pos', size)
                        }}
                    >
                        <div style={{height: '100%', width: '100%', overflow: 'auto'}}>
                            <AceEditor
                                ref={"aceEditor"}
                                mode={"groovy"}
                                width={""}
                                onChange={this.onTextChange}
                                editorProps={{$blockScrolling: true}}
                                value={this.state.text}
                                showPrintMargin={false}
                                theme={"tomorrow"}
                                debounceChangePeriod={500}
                                height={"100%"}
                                minLines={5}
                                enableBasicAutocompletion={true}
                                commands={[
                                    {
                                        name: "Save",
                                        bindKey: {mac: "Cmd-S", win: "Ctrl-S"},
                                        exec: this.save
                                    },
                                    {
                                        name: "Run",
                                        bindKey: {mac: "Cmd-R", win: "Ctrl-R"},
                                        exec: this.run
                                    },
                                ]}
                            />
                        </div>
                        <div style={{height: '100%', width: '100%', overflow: 'auto'}}>
                            <AceEditor
                                ref={"console"}
                                mode={'text'}
                                width={''}
                                height={'100%'}
                                theme={'tomorrow'}
                                editorProps={{$blockScrolling: Infinity}}
                                value={this.state.result}
                                showPrintMargin={false}
                                focus={false}
                                readOnly={true}
                                minLines={5}
                                highlightActiveLine={false}
                            />
                        </div>
                    </Splitter>
                </div>
            </div>
        );
    }
}

export default withTranslation()(FilesystemGroovyEditor)
