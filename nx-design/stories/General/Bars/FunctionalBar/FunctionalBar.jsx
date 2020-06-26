import React, {Component} from 'react';
import NXInputSearch, {NXSelect, NXOption} from "../../Input/Input";
import {NXIcon, filter, plus, sort, calculator, plusBlock, barChart, add, mark, download, fullScreen, print} from '../../../../index';
import './index.css';

export default class NXFunctionalBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>

                <div className='block'>
                    <NXInputSearch width='192px' />
                        <div className='verticalLine' />
                    <NXIcon icon={plus} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={filter} className='NXIcon fill' />
                    <NXIcon icon={sort} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={calculator} className='NXIcon fill' />
                    <NXIcon icon={plusBlock} className='NXIcon fill' />
                    <NXIcon icon={barChart} className='NXIcon fill' />
                    <NXIcon icon={add} className='NXIcon fill' />
                        <div className='verticalLine' />
                    <NXIcon icon={mark} className='NXIcon fill' />
                        <div className='verticalLine' />
                </div>

                <div className='block'>
                    <span className='caption'>Версия</span>
                    <NXSelect width='185px' defaultValue='default'>
                        <NXOption value='default'>
                            По умолчанию
                        </NXOption>
                    </NXSelect>
                <div className='verticalLine' />
                <NXIcon icon={download} className='NXIcon fill' />
                <NXIcon icon={print} className='NXIcon fill' />
                <NXIcon icon={fullScreen} className='NXIcon fill' />
                </div>

            </div>
        );
    }
}
