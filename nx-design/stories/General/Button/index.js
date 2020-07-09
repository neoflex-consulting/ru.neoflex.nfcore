import React, { Component, Fragment } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {okaidia} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {NXButton} from '../../../index'
import {PropsTab} from "../../../utils/helpers";

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
          <SyntaxHighlighter language='jsx' style={okaidia} >
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
                <SyntaxHighlighter language='jsx' style={okaidia} >
                    {`<NXButton primary> Primary </NXButton>

<NXButton> Default </NXButton>

<NXButton disabled> Disabled </NXButton>`}
                </SyntaxHighlighter>
        </section>
        <PropsTab Props={
            [
                {name:'primary', default:'-', description:'Кнопка для первичного призыва к действию (Primary)'},
                {name:'secondary', default:'-', description:'Кнопка вторичного призыва к действию (Secondary)'},
                {name:'disabled', default:'-', description:'Кнопка, запрещающая выполнение действия'},
                {name:'padding', default:'9px 32px', description:'Внутренний отступ'},
                {name:'margin', default:'-', description:'Внешний отступ'},
                {name:'height', default:'32px', description:'Высота'},
                {name:'width', default:'0', description:'Ширина'},
                {name:'isIcon', default:'-', description:'Применяется, если кнопка содержит в себе иконку'}
            ]
        }/>
      </Fragment>
    );
  }
}

