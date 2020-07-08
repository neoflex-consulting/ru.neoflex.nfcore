import React, {Component} from 'react';
import {NXIcon, filter, plus, sort, calculator, plusBlock, barChart, add, mark, download, fullScreen, print, NXInputSearch, NXSelect, NXOption} from '../../../../index';

export default class NXFunctionalBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>

                <div className='block'>
                    <NXInputSearch width='192px' />
                        <div className='verticalLine' />
                    <NXIcon big icon={plus} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={filter} fill='#5E6785' />
                    <NXIcon big icon={sort} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={calculator} fill='#5E6785' />
                    <NXIcon big icon={plusBlock} fill='#5E6785' />
                    <NXIcon big icon={barChart} fill='#5E6785' />
                    <NXIcon big icon={add} fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon big icon={mark} fill='#5E6785' />
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
                <NXIcon big icon={download} fill='#5E6785' />
                <NXIcon big icon={print} fill='#5E6785' />
                <NXIcon big icon={fullScreen} fill='#5E6785' />
                </div>

            </div>
        );
    }
}
