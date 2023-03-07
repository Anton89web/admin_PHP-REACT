import axios from 'axios';
import React, {useEffect, useState} from 'react';
import "../../helpers/iframeLoader"
import virtualDom from 'react-dom'
import {serializerDOMToString, unwrapTextNodes, parseStrDOM, wrapTextNodes} from "../../helpers/dom-helper";
import EditorText from "../editor-text/editor-text";
import UIkit from "uikit";
import Spinner from "../spinner/spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";





const Editor =  () => {
  const [pageList, setPageList] = useState([])
  const [currentPage, setCurrentPage] = useState("index.html")
  const [loading, setLoading] = useState(true)
  const [backupsList, setBackupsList] = useState([])
  const [virtualDomState, setVirtualDomState] = useState()
  const spinner = loading? <Spinner active/> : <Spinner/>


  useEffect(()=> {
    init(null, currentPage)
  }, [])


  function loadPageList() {
    axios
      .get("./api/pageList.php")
      .then(res => setPageList(res.data))
  }

  function restoreBackup(e, backup) {
    if (e) {
      e.preventDefault();
    }
    UIkit.modal.confirm("Вы действительно хотите восстановить страницу из этой резервной копии? Все несохраненные данные будут потеряны!", {labels: {ok: 'Восстановить', cancel: 'Отмена'}})
      .then(() => {
        isLoading()
        return axios
          .post('./api/restoreBackup.php', {"page": currentPage, "file": backup})
      })
      .then(() => {
        open(currentPage, isLoaded);
      })
  }

  function loadBackupsList() {
    axios
      .get("./backups/backups.json")
      .then(res => setBackupsList( res.data.filter(backup => {
        return backup?.page === currentPage;
      })))
  }



  function init (e, page){
    if(e){
      e.preventDefault();
    }
    isLoading()
    open(page, isLoaded)
    loadPageList()
    loadBackupsList()
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
        setVirtualDomState(dom)
        return dom
      })
      .then(res => serializerDOMToString(res))
      .then(html => axios.post("./api/saveTempPage.php",{html}))
      .then(()=> frame.load("../rb4vok5db_sdgdr.html"))
      .then(()=> axios.post("./api/deleteTempPage.php"))
      .then(()=> enableEditing(frame))
      .then(()=> injectStyles(frame))
      .then(cb)

    loadBackupsList()

  }

  async function save(onSuccess, onError){
    isLoading()
    const newDom = virtualDom.cloneNode(virtualDom)
    unwrapTextNodes(newDom)
    const html = serializerDOMToString(newDom)
    await axios
      .post("./api/savePage.php", {pageName: currentPage, html})
      .then(onSuccess)
      .catch(onError)
      .finally(isLoaded)

    loadBackupsList()

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


  function isLoading(){
    setLoading(true)
  }

  function isLoaded(){
    setLoading(false)
  }


  return (
    <>
      <iframe src='' frameBorder="0" />
      {spinner}
      <Panel virtualDomState={virtualDomState}/>
      <ConfirmModal modal={true} target={'modal-save'} method={save}/>
      <ChooseModal modal={true} target={'modal-open'} data={pageList} redirect={init}/>
      <ChooseModal modal={true} target={'modal-backup'} data={backupsList} redirect={restoreBackup}/>
      {virtualDomState && <EditorMeta modal={true} target={'modal-meta'} virtualDom={virtualDomState}/>}
    </>
  )
}

export default Editor