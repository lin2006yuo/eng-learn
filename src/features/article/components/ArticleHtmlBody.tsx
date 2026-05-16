'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ArticleHtmlBodyProps {
  content: string;
}

const HEIGHT_REPORT_SCRIPT = `
<style>html,body{min-height:auto!important;height:auto!important}</style>
<script>
(function(){
  var send = function(){
    var maxBottom = 0;
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var r = children[i].getBoundingClientRect();
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    }
    var style = getComputedStyle(document.body);
    var padB = parseFloat(style.paddingBottom) || 0;
    var h = Math.ceil(maxBottom + padB);
    parent.postMessage({type:'article-resize',h:h},'*');
  };
  if (window.ResizeObserver) {
    new ResizeObserver(send).observe(document.body);
  }
  send();
  window.addEventListener('load', send);
})();
</script>
`;

function injectHeightReporter(html: string): string {
  const wrapper = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>';
  const closing = '</body></html>';

  if (html.includes('<body')) {
    if (html.includes('</body>')) {
      return html.replace('</body>', HEIGHT_REPORT_SCRIPT + '</body>');
    }
    return html + HEIGHT_REPORT_SCRIPT;
  }

  return wrapper + html + HEIGHT_REPORT_SCRIPT + closing;
}

export function ArticleHtmlBody({ content }: ArticleHtmlBodyProps) {
  const [height, setHeight] = useState(600);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data?.type === 'article-resize' && typeof event.data.h === 'number') {
      setHeight(event.data.h + 32);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const srcDoc = injectHeightReporter(content);

  return (
    <div className="article-html-body w-full">
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-forms allow-popups"
        className="article-html-iframe w-full border-0"
        style={{ height: `${height}px`, minHeight: '200px' }}
        title="文章内容"
      />
    </div>
  );
}
