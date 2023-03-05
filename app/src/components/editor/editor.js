import axios from 'axios';
import React, {useEffect, useState} from 'react';
import "../../helpers/iframeLoader"
import virtualDom from 'react-dom'
import {serializerDOMToString, unwrapTextNodes, parseStrDOM, wrapTextNodes} from "../../helpers/dom-helper";
import EditorText from "../editor-text/editor-text";
import UIkit from "uikit";
import Spinner from "../spinner/spinner";



const Editor =  () => {
  const [pageList, setPageList] = useState([])
  const [currentPage, setCurrentPage] = useState("index.html")
  const [newPageName, setNewPageName] = useState("")
  const [loading, setLoading] = useState(true)
  const spinner = loading? <Spinner active/> : <Spinner/>

  useEffect(()=> {
    init(currentPage)
  }, [])


  function loadPageList() {
    axios
      .get("./api")
      .then(res => setPageList(res.data))
  }

  function init (page){
    open(page, isLoaded)
    loadPageList()
  }

  function open(page, cb){
    const frame = document.querySelector('iframe')
    setCurrentPage(page)

    axios
      .get(`../${page}?rnd=${Math.random()}`)
      .then(res => parseStrDOM(res.data))
      .then(res => wrapTextNodes(res))
      .then(dom => {
        virtualDom = dom
        return dom
      })
      .then(res => serializerDOMToString(res))
      .then(html => axios.post("./api/saveTempPage.php",{html}))
      .then(()=> frame.load("../temp.html"))
      .then(()=> enableEditing(frame))
      .then(()=> injectStyles(frame))
      .then(cb)
  }

  function save(onSuccess, onError){
    isLoading()
    const newDom = virtualDom.cloneNode(virtualDom)
    unwrapTextNodes(newDom)
    const html = serializerDOMToString(newDom)
    axios
      .post("./api/savePage.php", {pageName: currentPage, html})
      .then(onSuccess)
      .catch(onError)
      .finally(isLoaded)
  }



  function enableEditing(frame) {
    frame.contentDocument.body.querySelectorAll("text-editor")
      .forEach(element =>{
        const id = element.getAttribute("nodeid")
        const virtualElement = virtualDom.body.querySelector(`[nodeid="${id}"]`)
        new EditorText(element, virtualElement)
      })
  }

  function injectStyles(frame) {
    const style = frame.contentDocument.createElement("style")
    style.innerHTML = `
      text-editor:hover{
      outline: 3px solid orange;
      outline-offset: 8px;
      }
      text-editor:focus{
      outline: 3px solid red;
      outline-offset: 8px;
      }
    `;
    frame.contentDocument.head.appendChild(style)
  }



  function createNewPage() {
    axios
      .post("./api/createNewPage.php", {"name": newPageName})
      .then(loadPageList())
      .catch(() => alert("Страница уже существует!"));
  }

  function deletePage(page) {
    axios
      .post("./api/deletePage.php", {"name": page})
      .then(loadPageList())
      .catch(() => alert("Страницы не существует!"));
  }

  function isLoading(){
    setLoading(true)
  }

  function isLoaded(){
    setLoading(false)
  }


  return (
    <>
      <iframe src={currentPage} frameBorder="0" />
      {spinner}
      <div className="panel">
        <button className="uk-button uk-button-primary" uk-toggle="target: #modal-save">Опубликовать</button>
      </div>
      <div id="modal-save" uk-modal="true" container="false">
        <div className="uk-modal-dialog uk-modal-body">
          <h2 className="uk-modal-title">Сохранение</h2>
          <p>Вы действительно хотите сохранить изменения?</p>
          <p className="uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close" type="button">Отменить</button>
            <button
              onClick={()=>{save(
                ()=> UIkit.notification({message: 'Успешно сохранено', status: 'success'}),
                ()=> UIkit.notification({message: 'Ошибка сохранения', status: 'danger'})
              )}}
              className="uk-button uk-button-primary uk-modal-close"
              type="button"
            >Опубликовать</button>
          </p>
        </div>
      </div>


    </>
  )
}

export default Editor