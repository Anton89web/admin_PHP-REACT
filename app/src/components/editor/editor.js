import axios from 'axios';
import React, {useEffect, useState} from 'react';
import "../../helpers/iframeLoader"
import virtualDom from 'react-dom'
import {
  serializerDOMToString,
  unwrapTextNodes,
  parseStrDOM,
  wrapTextNodes,
  wrapImages,
  unWrapImages
} from "../../helpers/dom-helper";
import EditorText from "../editor-text/editor-text";
import UIkit from "uikit";
import Spinner from "../spinner/spinner";
import ConfirmModal from "../confirm-modal";
import ChooseModal from "../choose-modal";
import Panel from "../panel";
import EditorMeta from "../editor-meta";
import EditorImages from "../editor-images";
import Login from "../login";





const Editor =  () => {
  const [pageList, setPageList] = useState([])
  const [currentPage, setCurrentPage] = useState("index.html")
  const [loading, setLoading] = useState(true)
  const [backupsList, setBackupsList] = useState([])
  const [virtualDomState, setVirtualDomState] = useState()
  const [auth, setAuth] = useState(false)
  const spinner = loading? <Spinner active/> : <Spinner/>


  useEffect(()=> {
    checkAuth();
    init(null, currentPage)
  }, [])

  function checkAuth() {
  axios
    .get('./api/checkAuth.php')
    .then(res => setAuth(res.data.auth))
  }

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
      .then(res => wrapImages(res))
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

  async function save(){
    isLoading()
    const newDom = virtualDom.cloneNode(virtualDom)
    unwrapTextNodes(newDom)
    unWrapImages(newDom)
    const html = serializerDOMToString(newDom)
    await axios
      .post("./api/savePage.php", {pageName: currentPage, html})
      .then(()=> showNotifications('Успешно сохранено', 'success'))
      .catch(()=> showNotifications('Ошибка сохранения', 'danger'))
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

    frame.contentDocument.body.querySelectorAll("[editableimgid]")
      .forEach(element =>{
        const id = element.getAttribute("editableimgid")
        const virtualElement = virtualDom.body.querySelector(`[editableimgid="${id}"]`)
        new EditorImages(element, virtualElement, isLoading, isLoaded, showNotifications)
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
      [editableimgid]:hover{
       outline: 3px solid orange;
       outline-offset: 8px;
      }
    `;
    frame.contentDocument.head.appendChild(style)
  }

  function showNotifications(message, status){
    UIkit.notification({message, status})
  }

  function isLoading(){
    setLoading(true)
  }

  function isLoaded(){
    setLoading(false)
  }

  if(!auth){
    return <Login/>
  }

  return (
    <>
      <iframe src='' frameBorder="0" />
      <input id="img-upload" type="file" accept="image/*" style={{display: 'none'}}/>
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