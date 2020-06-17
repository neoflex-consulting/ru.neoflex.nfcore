import React from 'react';
import { storiesOf } from '@storybook/react';

import AlertPage from './Alert';



storiesOf('Feedback|Alerts', module)
  .add('Alerts', () => <AlertPage />)
