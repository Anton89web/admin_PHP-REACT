import React from 'react';

const ChooseModal = ({modal, target, data, redirect}) => {
    const List = data.map(item => {
        if (item.time){
            return (
              <li key={item.file}>
                  <a
                    className="uk-link-muted uk-modal-close"
                    href="#"
                    onClick={(e) => redirect(e, item.file)}>Резервная копия от {item.time}</a>
              </li>
            )
        } else {
        return (
            <li key={item}>
                <a
                    className="uk-link-muted uk-modal-close"
                    href="#"
                    onClick={(e) => redirect(e, item)}>{item}</a>
            </li>
        )
    }})

  const msg = data.length < 1 ? <div>Резервные копии не найдены!</div> : null

  return (
        <div id={target} uk-modal={modal.toString()} container="false">
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">Открыть</h2>
              {msg}
                <ul className="uk-list uk-list-divider">
                    {List}
                </ul>
                <p className="uk-text-right">
                    <button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
                </p>
            </div>
        </div>
    )
};

export default ChooseModal;