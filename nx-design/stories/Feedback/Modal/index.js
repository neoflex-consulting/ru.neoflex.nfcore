import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {NXModal} from "./Modal";
import {PropsTab} from "../../../utils/helpers";

export default class ModalPage extends Component {
    state = {}
    render() {
        return (
            <Fragment>
                <h1 className="title">Modal</h1>

                <p className="text">
                    Модальное окно — это окно, которое блокирует работу пользователя с приложением до тех пор, пока это окно не закроют.
                    <br/>
                    Модальные окна нужны, чтобы предупредить пользователя о каком-то действии. Например, это может быть сообщение о завершении сценария.
                </p>

                <h2 className="title">Как использовать</h2>
                <SyntaxHighlighter language='jsx' style={okaidia} >
                    {`import { NXModal } from "nx-design";`}
                </SyntaxHighlighter>

                <h2 className="title">Примеры:</h2>

                <section className="example space-between">
                    <div>
                        <h3 className="ex-title">Basic</h3>
                        <br/>
                        <NXModal title={'Question?'} content={'This is a question modal'} />
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`<NXModal title={'Question?'} content={'This is a question modal'} />`}
                        </SyntaxHighlighter>
                    </div>
                </section>

                <section className="example space-between">
                    <div>
                        <h3 className="ex-title">Info</h3>
                        <br/>
                        <NXModal title={'Info'} content={'This is an info modal'} info />
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`<NXModal title={'Info'} content={'This is an info modal'} info />`}
                        </SyntaxHighlighter>
                    </div>
                </section>

                <section className="example space-between">
                    <div>
                        <h3 className="ex-title">Success</h3>
                        <br/>
                        <NXModal title={'Success'} content={'This is a success modal'} success />
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`<NXModal title={'Success'} content={'This is a success modal'} success />`}
                        </SyntaxHighlighter>
                    </div>
                </section>

                <section className="example space-between">
                    <div>
                        <h3 className="ex-title">Error</h3>
                        <br/>
                        <NXModal title={'Error'} content={'This is an error modal'} error />
                        <SyntaxHighlighter language='jsx' style={okaidia} >
                            {`<NXModal title={'Error'} content={'This is an error modal'} error />`}
                        </SyntaxHighlighter>
                    </div>
                </section>

                <PropsTab Props={
                    [
                        {name:'title', default:'-', description:'Заголовок'},
                        {name:'content', default:'-', description:'Сообщение'},
                        {name:'info', default:'-', description:'Тип модального окна'},
                        {name:'success', default:'-', description:'Тип модального окна'},
                        {name:'error', default:'-', description:'Тип модального окна'},
                    ]
                }/>

            </Fragment>
        );
    }
}

