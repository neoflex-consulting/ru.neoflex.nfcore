import React, {Component} from 'react';
import {arrowLong, edit, rubbish, NXIcon, plus, mark, download, fullScreen, print, NXSelect, NXOption} from '../../../../index';

export default class NXDiagramBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>
                <div className='block'>
                    <a>
                    <NXIcon icon={arrowLong} margin='0 12px 0 0' sm fill='#5E6785' />
                    <span>Вернуться к таблице</span>
                    </a>
                    <div className='verticalLine' />
                    <NXIcon icon={plus} sm fill='#5E6785' />
                    <NXIcon icon={edit} sm fill='#5E6785' />
                    <div className='verticalLine' />
                    <NXIcon icon={mark} sm fill='#5E6785' />
                    <NXIcon icon={rubbish} sm fill='#5E6785' />
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
