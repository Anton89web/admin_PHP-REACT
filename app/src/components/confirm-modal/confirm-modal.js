import React from 'react';

const ConfirmModal = ({modal, target, method, text:{title, descr, btn}}) => {
    return (
        <div id={target} uk-modal={modal.toString()} container="false">
            <div className="uk-modal-dialog uk-modal-body">
                <h2 className="uk-modal-title">{title}</h2>
                <p>{descr}</p>
                <p className="uk-text-right">
                    <button className="uk-margin-small-right uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
                    <button 
                        className="uk-button uk-button-primary uk-modal-close" 
                        type="button"
                        onClick={() => method()}>{btn}</button>
                </p>
            </div>
        </div>
    )
};

export default ConfirmModal;