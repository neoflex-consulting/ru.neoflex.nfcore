import React from 'react';
import { storiesOf } from '@storybook/react';
import '../css/style.css';
import '../css/icons.css';
import ButtonPage from "./General/Button";
import IconPage from "./General/Icon";
import InputPage from "./General/Input";
import BarsPage from "./General/Bars";
import DiagramsPage from "./General/Diagrams";
import TablesPage from "./General/Table";
import ComponentsPage from "./Other/Components";
import DescriptionPageDoc from "./Documentation/Description";
import AlertPage from "./Feedback/Alert";
import GridPageDoc from "./Documentation/Grid";
import GridPage from "./General/Grid";
import TypographyPageDoc from "./Documentation/Typography";
import MainColorPageDoc from "./Documentation/ColorPallete/Main";
import AccentColorPageDoc from "./Documentation/ColorPallete/Accent";
import ModalPage from "./Feedback/Modal";

/*Documentation*/
storiesOf('Documentation|Description', module)
    .add('Description', () => <DescriptionPageDoc />)

storiesOf('Documentation|Grid', module)
    .add('Grid', () => <GridPageDoc />)

storiesOf('Documentation|Typography', module)
    .add('Typography', () => <TypographyPageDoc />)

storiesOf('Documentation|Color', module)
    .add('Main', () => <MainColorPageDoc />)

storiesOf('Documentation|Color', module)
    .add('Accent', () => <AccentColorPageDoc />)
/*General*/
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

storiesOf('General|Tables', module)
    .add('Tables', () => <TablesPage />)

storiesOf('General|Grid', module)
    .add('Grid', () => <GridPage />)

/*Feedback*/
storiesOf('Feedback|Alerts', module)
    .add('Alerts', () => <AlertPage />)

storiesOf('Feedback|Modal', module)
    .add('Modal', () => <ModalPage />)

/*Others*/
storiesOf('Others|Components', module)
    .add('Components', () => <ComponentsPage />)