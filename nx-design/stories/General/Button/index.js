import React, { Component, Fragment } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import NXButton from '../../../index'

export default class ButtonPage extends Component {
  render() {
    return (
      <Fragment>
        <h1 className="title">Кнопки</h1>
        <h2 className="title">Когда использовать</h2>

        <p className="text">
            Кнопка - это элемент интерфейса для совершения действия. С помощью кнопки пользователь взаимодействует и интерфейсом.
        </p>

          <h2 className="title">Отличие кнопки от ссылки</h2>

          <p className="text">
              Есть несколько способов показать, что надпись является ссылкой. Это может быть цвет, подчеркивание, положение ссылки, или просто сам текст (например, «Читать дальше»).
              Кнопка третичного вида визуально почти не отличается от ссылки, но основное отличие в том, что ссылка, как правило - это переход на сторонний сайт, ресурс, документ. Кнопка третичного вида не перебрасывает пользователя никуда и не прерывает сценарий взаимодействия с интерфейсом.
          </p>

          <h2 className="title">Название</h2>

          <p className="text">
              Назвать кнопки стоит по тому действию, которое произойдет при нажатии.<br/>
              Названия кнопок с большой буквы.<br/>
              Название не должно быть в две строчки.<br/>
              Если мы называем первичную кнопку «Сохранить», то вторичную кнопку мы должны назвать, например, «Отменить» ( не «Отмена»)<br/>
              <br/>
              Нельзя сокращать название кнопки.<br/>
              <br/>
              При необходимости можно дополнять кнопку иконкой, если она не противоречит смысловой нагрузки, которую несет кнопка и не мешает пользователю.
          </p>

          <h2 className="title">Как использовать</h2>
          <SyntaxHighlighter language='javascript' style={docco} >
              {`import NXButton from 'nx-design';`}
          </SyntaxHighlighter>

        <h2 className="title">Примеры:</h2>
        <section className="example">
          <div>
            <NXButton primary className='ml20'>
              Primary
            </NXButton>

            <NXButton className="ml20">
              Default
            </NXButton>

            <NXButton className="ml20" disabled>
              Disabled
            </NXButton>

          </div>
                <SyntaxHighlighter language='javascript' style={docco} >
                    {`
<NXButton primary> Primary </NXButton>

<NXButton> Default </NXButton>

<NXButton disabled> Disabled </NXButton>`}
                </SyntaxHighlighter>
        </section>
      </Fragment>
    );
  }
}

