import React, { useEffect, useState} from 'react';
import UIkit from "uikit";


const EditorMeta = ({modal, target, virtualDom}) => {

    const [meta, setMeta] = useState({
            title: '',
          keywords: '',
          description: ''
    })

    let title, keywords, description

    useEffect(()=>{
        getMeta(virtualDom);
        // if (virtualDom !== prev.virtualDom) {
        //     getMeta(this.props.virtualDom);
        // }
    }, [])

    function getMeta(virtualDom) {
         title = virtualDom.head.querySelector('title')

         keywords = virtualDom.head.querySelector('meta[name="keywords"]');
        if (!keywords) {
            keywords = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            keywords.setAttribute("name", "keywords");
            keywords.setAttribute("content", "");
        }

          description = virtualDom.head.querySelector('meta[name="description"]');
        if (!description) {
            description = virtualDom.head.appendChild(virtualDom.createElement('meta'));
            description.setAttribute("name", "description");
            description.setAttribute("content", "");
        }

        setMeta({
                title: title.innerHTML,
                keywords: keywords.getAttribute("content"),
                description: description.getAttribute("content")
        })


    }
    console.log(meta)

   function applyMeta() {
       title = virtualDom.head.querySelector('title')
       keywords = virtualDom.head.querySelector('meta[name="keywords"]');
       description = virtualDom.head.querySelector('meta[name="description"]');
       title.innerHTML = meta.title
       keywords.content= meta.keywords
       description.content= meta.description
    }

    function onValueChange(e) {

        if (e.target.getAttribute("data-title")) {
            e.persist();
            setMeta((meta) => {
                return {
                    ...meta,
                    title: e.target.value
                }
            })
        } else if (e.target.getAttribute("data-key")) {
            e.persist();
            setMeta((meta) => {
                return {
                    ...meta,
                    keywords: e.target.value
                }
            })
        } else {
            e.persist();
            setMeta((meta) => {
                return {
                    ...meta,
                    description: e.target.value
                }
            })
        }

    }
        return (
            <div id='modal-meta' uk-modal={modal.toString()} container="false">
                <div className="uk-modal-dialog uk-modal-body">
                    <h2 className="uk-modal-title">Редактирование Meta-тэгов</h2>

                    <form>
                        <div className="uk-margin">
                            <input
                                data-title
                                className="uk-input"
                                type="text"
                                placeholder="Title"
                                value={meta.title}
                                onChange={(e) => onValueChange(e)}/>
                        </div>

                        <div className="uk-margin">
                            <textarea
                                data-key
                                className="uk-textarea"
                                rows="5"
                                placeholder="Keywords"
                                value={meta.keywords}
                                onChange={(e) => onValueChange(e)}/>
                        </div>

                        <div className="uk-margin">
                            <textarea
                                data-descr
                                className="uk-textarea"
                                rows="5"
                                placeholder="Description"
                                value={meta.description}
                                onChange={(e) => onValueChange(e)}/>
                        </div>
                    </form>

                    <p className="uk-text-right">
                        <button className="uk-button uk-button-default uk-margin-small-right uk-modal-close" type="button">Отменить</button>
                        <button
                            className="uk-button uk-button-primary uk-modal-close"
                            type="button"
                            onClick={() => applyMeta()}>Применить</button>
                    </p>
                </div>
            </div>
        )
}

export default EditorMeta