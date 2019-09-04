import Splitter from 'm-react-splitters'

export default class CustomSplitter extends Splitter {

    componentWillUnmount() {
        window.removeEventListener('resize', (this as unknown as any).getSize);
    }

}