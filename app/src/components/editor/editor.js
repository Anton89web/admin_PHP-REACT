import axios from 'axios';
import React, {useEffect, useState} from 'react';
import "../../helpers/iframeLoader"
import virtualDom from 'react-dom'
import {logPlugin} from "@babel/preset-env/lib/debug";



const Editor =  () => {
  const [pageList, setPageList] = useState([])
  const [currentPage, setCurrentPage] = useState("index.html")
  const [newPageName, setNewPageName] = useState("")

  useEffect(()=> {
    init(currentPage)
  }, [])

  function parseStrDOM(str){
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html")

  }

  function wrapTextNodes(dom){
      const body = dom.body;
      let textNodes = []
      function recurse(el){
        el.childNodes.forEach(node => {
          if (node.nodeName === '#text' && node.nodeValue.replace(/\s+/, '').length > 0){
            textNodes.push(node)
          } else {
            recurse(node)
          }
        })
      }

      recurse(body)

      textNodes.forEach((node, i) => {
        const wrapper = dom.createElement('text-editor');
        node.parentNode.replaceChild(wrapper, node);
        wrapper.appendChild(node)
        wrapper.setAttribute("nodeid", i)
      })

    return dom;
  }

  function serializerDOMToString(dom){
  const serializer = new XMLSerializer();
  return serializer.serializeToString(dom)
  }

  function loadPageList() {
    axios
      .get("./api")
      .then(res => setPageList(res.data))

  }

  function init (page){
    open(page)
    loadPageList()
  }

  function open(page){
    const frame = document.querySelector('iframe')
    setCurrentPage(`../${page}?rnd=${Math.random()}`)

    axios
      .get(`../${page}`)
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
  }

  function enableEditing(frame) {
    frame.contentDocument.body.querySelectorAll("text-editor")
      .forEach(e =>{
        e.contentEditable = "true"
        e.addEventListener("input", ()=> {
          onTextEditor(e)
        })
      } )
  }

  function onTextEditor (e){
    const id = e.getAttribute("nodeid")
    virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML= e.innerHTML
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



  return (
    <>
      <iframe src={currentPage} frameBorder="0" />
      {/*    {pageList.length ? pageList.map((page, i) => {*/}
      {/*    return (*/}
      {/*        <h1 key={i}>{page}*/}
      {/*            <a*/}
      {/*            href="#"*/}
      {/*            onClick={() => deletePage(page)}>(x)</a>*/}
      {/*        </h1>*/}
      {/*    )*/}
      {/*}): ''}*/}
      {/*        <input*/}
      {/*            onChange={(e) => setNewPageName( e.target.value)}*/}
      {/*            type="text"/>*/}
      {/*        <button onClick={createNewPage}>Создать страницу</button>*/}
    </>
  )
}

export default Editor