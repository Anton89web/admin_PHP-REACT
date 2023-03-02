import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import "../../helpers/iframeLoader"

const Editor =  () => {

  const [pageList, setPageList] = useState([])
  const [currentPage, setCurrentPage] = useState("index.html")
  const [newPageName, setNewPageName] = useState("")
  const [frame, setFrame] = useState()

  useEffect(()=> {
  init(currentPage)
  }, [])

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
    setCurrentPage(`../${page}`)
    const frame = document.querySelector('iframe')
    frame.load(currentPage, ()=> {
      const body = frame.contentDocument.body;
      let textNodes = []
      function recurse(el){
        el.childNodes.forEach(node => {
          if (node.nodeName === '#text' && node.nodeValue.replace(/\s+/, '').length > 0){
            textNodes.push(node)
            console.log(node)
          } else {
            recurse(node)
          }
        })
      }

      recurse(body)

      textNodes.forEach(node => {
        const wrapper = frame.contentDocument.createElement('text-editor');
        node.parentNode.replaceChild(wrapper, node);
        wrapper.appendChild(node)
        wrapper.contentEditable = 'true'
      })

    })
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