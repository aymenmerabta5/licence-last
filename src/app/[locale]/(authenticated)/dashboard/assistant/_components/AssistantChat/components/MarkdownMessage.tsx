"use client"

import { Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vs, vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  language: string
  code: string
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const t = useTranslations("dashboard.assistant")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const style = resolvedTheme === "dark" ? vscDarkPlus : vs

  return (
    <div className="relative group my-4 rounded-none border border-border/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border/60">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language || "text"}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={copied ? t("copied") : t("copyCode")}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

interface MarkdownMessageProps {
  content: string
  className?: string
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        resolvedTheme === "dark" ? "prose-invert" : "",
        "prose-headings:font-serif prose-headings:font-medium",
        "prose-p:leading-relaxed prose-p:my-2",
        "prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:rounded-sm",
        "prose-blockquote:border-s-2 prose-blockquote:border-primary/40 prose-blockquote:ps-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
        "prose-ul:ps-6 prose-ol:ps-6",
        "prose-li:my-1",
        "prose-table:border-collapse prose-table:w-full",
        "prose-th:border prose-th:border-border/60 prose-th:px-3 prose-th:py-2 prose-th:text-start prose-th:font-medium prose-th:bg-muted/50",
        "prose-td:border prose-td:border-border/60 prose-td:px-3 prose-td:py-2",
        "prose-tr:nth-child(even):bg-muted/20",
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-primary/80",
        "prose-hr:border-border/60",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const code = String(children).replace(/\n$/, "")

            // Inline code
            if (!className) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 text-sm rounded-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }

            // Code block
            return <CodeBlock language={language} code={code} />
          },
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
                {...props}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
