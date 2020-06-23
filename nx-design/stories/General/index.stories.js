import React from 'react';
import { storiesOf } from '@storybook/react';
import '../../css/style.css';
import '../../css/icons.css';

import ButtonPage from './Button';
import IconPage from './Icon';
import InputPage from './Input';
import BarsPage from './Bars';
import DiagramsPage from './Diagrams';

storiesOf('General|Buttons', module)
    .add('Buttons', () => <ButtonPage />)

storiesOf('General|Icons', module)
    .add('Icons', () => <IconPage />)

storiesOf('General|Inputs', module)
    .add('Inputs', () => <InputPage />)

storiesOf('General|Bars', module)
    .add('FunctionalBars', () => <BarsPage />)

storiesOf('General|Diagrams', module)
    .add('Diagrams', () => <DiagramsPage />)

