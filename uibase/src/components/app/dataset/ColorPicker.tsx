import * as React from "react";
import {CirclePicker, SketchPicker} from "react-color";

export class ColorPicker extends React.Component<any, any>{
    constructor(props: any) {
        super(props);
        this.state = {
            color: this.props.type === 'background' ? this.props.value.backgroundColor :
            this.props.type === 'text' && this.props.value.color ? this.props.value.color : '#ffffff'
        }
    }
    changeColor(e: any) {
        this.setState({color: e})
        this.props.value.changeColor(e)
    }
    render() {
        return <CirclePicker
            circleSize={24}
            circleSpacing={3}
            width='100%'
            onChange={(e: any) => this.changeColor(e.hex)}
            color={ this.state.color }
            colors={['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                '#8b1a10', '#eb3223', '#f29d38', '#fffd54', '#75f94c', '#73fbfd', '#5687e1', '#0023f5', '#8b2ef5', '#ea3ff7',
                '#dfbab1', '#eecdcd', '#f8e5d0', '#fdf2d0', '#dce9d5', '#d3e0e3', '#ccdaf5', '#d2e2f1', '#d8d3e7', '#e6d2dc',
                '#d18270', '#df9d9b', '#f2cca2', '#fbe5a3', '#bdd5ac', '#a8c3c8', '#a9c2f0', '#a6c5e5', '#b2a8d3', '#cea8bc',
                '#bd4b31', '#d16d6a', '#ecb476', '#f9d978', '#9dc284', '#80a4ae', '#769ee5', '#7ba8d7', '#8b7ebe', '#b87f9e',
                '#992a15', '#bc261a', '#db944b', '#eac251', '#78a55a', '#53808c', '#4979d1', '#4e85c1', '#6252a2', '#9b5377',
                '#7b2817', '#8c1a11', '#a96324', '#b89130', '#48742c', '#254e5a', '#2358c5', '#22538f', '#312170', '#6b2346',
                '#531607', '#5d0e07', '#714116', '#7b601d', '#314c1c', '#18333c', '#254683', '#153760', '#1d154a', '#46162f']}
        />
    }
}

export class SketchColorPicker extends React.Component<any, any>{
    constructor(props: any) {
        super(props);
        this.state = {
            color: this.props.type === 'background' ? this.props.value.backgroundColor :
                this.props.type === 'text' && this.props.value.color ? this.props.value.color : '#ffffff'
        }
    }
    changeColor(e: any) {
        this.setState({color: e})
        this.props.value.changeColor(e)
    }

    render() {
    return <SketchPicker
        disableAlpha={true}
        onChange={(e: any) => this.changeColor(e.hex)}
        color={ this.state.color ? this.state.color : '#ffffff' }
    />
    }
}
