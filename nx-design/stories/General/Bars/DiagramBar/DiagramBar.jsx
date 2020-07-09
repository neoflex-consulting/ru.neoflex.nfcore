import React, {Component} from 'react';
import {arrowLong, edit, rubbish, NXIcon, plus, mark, download, fullScreen, print, NXSelect, NXOption} from '../../../../index';

export default class NXDiagramBar extends Component {

    render() {
        return (
            <div className='functionalBar__header'>
                <div className='block'>
                    <a>
                    <NXIcon icon={arrowLong} margin='0 12px 0 0' fill='#5E6785' />
                    <span>Вернуться к таблице</span>
                    </a>
                    <div className='verticalLine' />
                    <NXIcon big icon={plus} fill='#5E6785' />
                    <NXIcon big icon={edit} fill='#5E6785' />
                    <div className='verticalLine' />
                    <NXIcon big icon={mark} fill='#5E6785' />
                    <NXIcon big icon={rubbish} fill='#5E6785' />
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
