import Splitter, {SplitterProps} from 'm-react-splitters'
import React from "react";

export default class CustomSplitter extends Splitter {

    componentDidUpdate(prevProps: Readonly<SplitterProps>, prevState: Readonly<React.ComponentState>, snapshot?: any): void {
        if (this.state.isDragging) {
            window.dispatchEvent(new Event('appAdaptiveResize'));
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', (this as unknown as any).getSize);
    }
}