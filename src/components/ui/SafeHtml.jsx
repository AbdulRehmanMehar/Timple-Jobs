'use client'

import React, { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

export default function SafeHtml({ html }) {
  const [cleanHtml,setcleanHtml] = useState()
  
  useEffect(() => {
    if(html){
     setcleanHtml(DOMPurify.sanitize(html))
    }
  }, [html])
  
if(!cleanHtml){
  return <></>
}
  return (
    <div
      className="safe-html text-gray-700 leading-relaxed space-y-4"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}
