import React, {Component} from 'react';
import {NXIcon, filter, plus, sort, calculator, plusBlock, barChart, add, mark, download, fullScreen, print, NXInputSearch, NXSelect, NXOption} from '../../../../index';
import './index.css';

export default class NXFunctionalBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>

                <div className='block'>
                    <NXInputSearch width='192px' />
                        <div className='verticalLine' />
                    <NXIcon icon={plus} sm fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon icon={filter} sm fill='#5E6785' />
                    <NXIcon icon={sort} sm fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon icon={calculator} sm fill='#5E6785' />
                    <NXIcon icon={plusBlock} sm fill='#5E6785' />
                    <NXIcon icon={barChart} sm fill='#5E6785' />
                    <NXIcon icon={add} sm fill='#5E6785' />
                        <div className='verticalLine' />
                    <NXIcon icon={mark} sm fill='#5E6785' />
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
                <NXIcon icon={download} sm fill='#5E6785' />
                <NXIcon icon={print} sm fill='#5E6785' />
                <NXIcon icon={fullScreen} sm fill='#5E6785' />
                </div>

            </div>
        );
    }
}
