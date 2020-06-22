import React, { Component, Fragment } from 'react';
import {NXAlert} from "./Alert";
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';

export default class AlertPage extends Component {
  state = {}
  render() {
    return (
      <Fragment>
        <h1 className="title">Alert</h1>

        <p className="text">
            Alert показывает короткое и важное сообщение для того, чтобы привлечь внимание пользователя, не отвлекая его от задачи. Сообщение призвано помочь пользователю не допустить ошибку, устранить уже имеющуюся или о чем-то проинформировать важном, но не влияющем на работу приложения в целом.
        </p>

          <h2 className="title">Как использовать</h2>
          <SyntaxHighlighter language='jsx' style={okaidia} >
              {`import { NXAlert } from "nx-design";`}
          </SyntaxHighlighter>

        <h2 className="title">Примеры:</h2>

        <section className="example space-between">
            <div>
          <h3 className="ex-title">Basic</h3>
          <NXAlert.small message="Success Text" width='233px' />
            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`<NXAlert.small message="Success Text" />`}
            </SyntaxHighlighter>
            </div>
        </section>

        <section className="example space-between">
            <div>
          <h3 className="ex-title">Error</h3>
          <NXAlert.error message="Error" description='This is an error alert' />

            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`<NXAlert.error message='Error' description='This is an error alert' />`}
            </SyntaxHighlighter>
            </div>
            <div className='comp-descr'>
                <p className='text'>
                    Alert error сообщает пользователю о какой-то критической ошибке, которая уже произошла и влияет на работу приложения или не дает пройти сценарий.                </p>
            </div>
        </section>

        <section className="example space-between">
            <div>
          <h3 className="ex-title">Info</h3>
          <NXAlert.info message="Info" description='This is an info alert' />

            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`<NXAlert.info message="Info" description='This is an info alert' />`}
            </SyntaxHighlighter>
            </div>
            <div className='comp-descr'>
                <p className='text'>
                    Alert info информационные алерты, которые не сообщают об ошибках и возможных проблемах, а несут строго информационный характе. Это может быть информация о скором обновлении или добавлении нового функционала, все, что может быть полезно.
                </p>
            </div>
        </section>

        <section className="example space-between">
            <div>
          <h3 className="ex-title">Warning</h3>
          <NXAlert.warning message="Warning" description='This is a warning alert' />

            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`<NXAlert.warning message="Warning" description='This is a warning alert' />`}
            </SyntaxHighlighter>
            </div>
            <div className='comp-descr'>
                <p className='text'>
                    Alert warning предупреждает пользователя об опасном действии, которое может привести к ошибке или остановки приложения.
                </p>
            </div>
        </section>

        <section className="example space-between">
            <div>
          <h3 className="ex-title">Success</h3>
          <NXAlert.success message="Success" description='This is a success alert' />

            <SyntaxHighlighter language='jsx' style={okaidia} >
                {`<NXAlert.success message="Success" description='This is a success alert' />`}
            </SyntaxHighlighter>
            </div>
            <div className='comp-descr'>
                <p className='text'>
                    Alert success содержат положительную информацию, могут сообщать пользователю об успешном устранении ошибки.
                </p>
            </div>
        </section>

      </Fragment>
    );
  }
}

