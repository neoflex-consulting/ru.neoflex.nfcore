import * as React from 'react';
import { Button } from '@storybook/react/demo';

export default {
    title: 'Button',
    component: Button,
};

export const Text = () => <Button>Hello Buttonnn</Button>;

export const Emoji = () => (
    <Button >
<span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
    </Button>
);