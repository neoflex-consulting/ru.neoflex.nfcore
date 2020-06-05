import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import {API} from "../../../modules/api";
import {Button} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSave, faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import AceEditor from "react-ace";
import 'brace/mode/json';
import 'brace/mode/css';
import 'brace/mode/scss';
import 'brace/mode/jsx';
import 'brace/mode/html';
import 'brace/mode/tsx';
import 'brace/mode/text';
import 'brace/mode/markdown';
import 'brace/theme/tomorrow';

interface Props {
    path: string
}

const extModeMap = new Map<string, string>([
    ["json", "json"],
    ["css", "css"],
    ["scss", "scss"],
    ["sass", "scss"],
    ["js", "jsx"],
    ["jsx", "jsx"],
    ["ts", "tsx"],
    ["tsx", "tsx"],
    ["md", "markdown"],
])
const getMode = (path: string): string => {
    const ext = path.split('.').pop() || ""
    return extModeMap.get(ext) || "text"
}

class FilesystemTextEditor extends React.Component<Props & WithTranslation, any> {
    state = {
        path: "",
        text: "",
        mode: "text"
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
                .then(text => this.setState({text, mode: getMode(this.state.path)}))
        }
    }

    save = () => {
        API.instance().fetchJson("/system/fs?path=" + this.state.path, {
            method: 'PUT',
            body: this.state.text
        }).then(value => {
        })
    }

    onTextChange = (text: string) => {
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
                </div>
                <div style={{height: '100%', width: '100%', overflow: 'auto'}}>
                    <AceEditor
                        ref={"aceEditor"}
                        mode={this.state.mode}
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
                        ]}
                    />
                </div>
            </div>
        );
    }
}

export default withTranslation()(FilesystemTextEditor)
