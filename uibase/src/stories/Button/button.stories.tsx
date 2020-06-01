import * as React from 'react';
import {NXButton} from "./button";
import { action } from '@storybook/addon-actions';
import {Button} from 'antd';
export default {
    title: 'Atoms/Button',
    component: NXButton,
};

export const Primary = () => <NXButton primary onClick={action('clicked')}>Применить</NXButton>;

export const Secondary = () => <NXButton secondary>Применить</NXButton>;

export const Disabled = () => <NXButton disabled>Применить</NXButton>;

export const but = () => <Button>Antd Button</Button>