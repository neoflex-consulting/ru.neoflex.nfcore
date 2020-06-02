import React from 'react';
import { storiesOf } from '@storybook/react';
import '../../../uibase/src/styles/App.css'

import ButtonPage from './Button';
import IconPage from './Icon';
import InputPage from './Input';

storiesOf('General', module)
  .add('Button', () => <ButtonPage />)
  .add('Icon', () => <IconPage />)
  .add('Input', () => <InputPage />)

