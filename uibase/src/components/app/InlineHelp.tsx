import * as React from "react";
import {withTranslation, WithTranslation} from "react-i18next";
import {NeoIcon} from "neo-icon/lib";
import {NeoHint} from "neo-design/lib";
import './../../styles/InlineHelp.css'

interface Props {
    helpText: string,
    helpOrientation: "Top"|"Right"|"Bottom"|"Left"
}

interface State {

}

class InlineHelp extends React.Component<Props & WithTranslation, State> {
    render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
        return <NeoHint style={{width:"16px", height: "16px"}} className={"inline-help"} placement={this.props.helpOrientation} title={this.props.helpText}>
            <NeoIcon icon={"question"} size={"m"}/>
        </NeoHint>;
    }
}

export default  withTranslation()(InlineHelp);
