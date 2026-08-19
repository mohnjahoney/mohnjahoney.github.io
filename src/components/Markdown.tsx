import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);

const languageAliases: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "xml",
  py: "python",
  yml: "yaml",
};

const markdownComponents: Components = {
  code({ className, children }) {
    const languageLabel = /language-([\w-]+)/.exec(className ?? "")?.[1];
    const language = languageLabel ? (languageAliases[languageLabel] ?? languageLabel) : undefined;

    if (!language || !hljs.getLanguage(language)) {
      return <code className={className}>{children}</code>;
    }

    const source = String(children).replace(/\n$/, "");
    const highlighted = hljs.highlight(source, { language }).value;

    return (
      <code className={`hljs ${className}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
    );
  },
};

export default function Markdown({ source, baseUrl }: { source: string; baseUrl?: string }) {
  // Rewrite relative image/link paths so markdown next to the project file resolves correctly.
  const resolve = (url?: string) => {
    if (!url) return url;
    if (
      /^([a-z]+:)?\/\//i.test(url) ||
      url.startsWith("/") ||
      url.startsWith("#") ||
      url.startsWith("mailto:")
    ) {
      return url;
    }
    return baseUrl ? baseUrl + url : url;
  };
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
        urlTransform={(url) => resolve(url) ?? ""}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
