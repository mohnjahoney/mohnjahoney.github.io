import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ source, baseUrl }: { source: string; baseUrl?: string }) {
  // Rewrite relative image/link paths so markdown next to the project file resolves correctly.
  const resolve = (url?: string) => {
    if (!url) return url;
    if (/^([a-z]+:)?\/\//i.test(url) || url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:")) {
      return url;
    }
    return baseUrl ? baseUrl + url : url;
  };
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => resolve(url) ?? ""}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}