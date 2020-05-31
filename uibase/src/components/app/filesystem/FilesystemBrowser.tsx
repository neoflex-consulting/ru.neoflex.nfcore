import * as React from 'react';
import {WithTranslation, withTranslation} from "react-i18next";
import Splitter from '../../../components/CustomSplitter'
import FilesystemTree from "./FilesystemTree";

const backgroundColor = "#fdfdfd";

class FilesystemBrowser extends React.Component<any & WithTranslation, any> {
    private splitterRef: React.RefObject<any> = React.createRef();
    state = {}

    render() {
        return (
            <div style={{flexGrow: 1, height: '100%'}}>
                <Splitter
                    minimalizedPrimaryPane={false}
                    allowResize={true}
                    ref={this.splitterRef}
                    position="vertical"
                    primaryPaneMaxWidth="70%"
                    primaryPaneMinWidth={0}
                    primaryPaneWidth={localStorage.getItem('filebrowser_splitter_pos') || "233px"}
                    dispatchResize={true}
                    postPoned={false}
                    onDragFinished={() => {
                        const size: string = this.splitterRef.current!.panePrimary.props.style.width;
                        localStorage.setItem('filebrowser_splitter_pos', size)
                    }}
                >
                    <div style={{flexGrow: 1, backgroundColor: backgroundColor, height: '100%', overflow: "auto"}}>
                        <FilesystemTree/>
                    </div>
                    <div style={{backgroundColor: backgroundColor, height: '100%', overflow: 'auto'}}>
                    </div>
                </Splitter>
            </div>
        )
    }
}

export default withTranslation()(FilesystemBrowser)
