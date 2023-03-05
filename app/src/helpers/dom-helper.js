
  export function unwrapTextNodes(dom){
    dom.body.querySelectorAll("text-editor").forEach(element =>{
      element.parentNode.replaceChild(element.firstChild, element)
    })
  }

  export function serializerDOMToString(dom){
    const serializer = new XMLSerializer();
    return serializer.serializeToString(dom)
  }

  export function wrapTextNodes(dom){
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

  export function parseStrDOM(str){
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html")
  }

