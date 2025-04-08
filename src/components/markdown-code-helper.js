"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Terminal, Check, Plus } from "lucide-react";

export function MarkdownCodeHelper({ onInsert, sectionType }) {
  // Use useEffect to ensure this component only renders fully on the client
  const [isClient, setIsClient] = useState(false);
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const codeTemplates = {
    bash: "```bash\n# Example bash command\nnpm install package-name\n```",
    javascript:
      "```javascript\n// Example JavaScript code\nconst example = () => {\n  console.log('Hello world');\n};\n```",
    typescript:
      "```typescript\n// Example TypeScript code\nconst example = (): void => {\n  console.log('Hello world');\n};\n```",
    html: '```html\n<!-- Example HTML -->\n<div class="container">\n  <h1>Hello World</h1>\n</div>\n```',
    css: "```css\n/* Example CSS */\n.container {\n  display: flex;\n  justify-content: center;\n}\n```",
    json: '```json\n{\n  "name": "project-name",\n  "version": "1.0.0"\n}\n```',
    sql: "```sql\n-- Example SQL query\nSELECT * FROM users WHERE id = 1;\n```",
  };

  const handleCopyClick = (type, template) => {
    navigator.clipboard.writeText(template);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInsertClick = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    onInsert(template);
  };

  // Determine which templates to show based on section type
  const getRelevantTemplates = () => {
    switch (sectionType) {
      case "installationContent":
        return ["bash", "json"];
      case "frontendConfigContent":
        return [
          "bash",
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];
      case "backendConfigContent":
        return [
          "bash",
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];
      case "databaseSetupContent":
        return [
          "bash",
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];
      case "authenticationContent":
        return [
          "bash",
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];
      default:
        return [
          "bash",
          "javascript",
          "typescript",
          "html",
          "css",
          "json",
          "sql",
        ];
    }
  };

  const relevantTemplates = getRelevantTemplates();

  // Return a simple placeholder during server rendering to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="border rounded-md p-3 bg-slate-50 mt-2">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-slate-500" />
          <span className="text-sm font-medium">Insert Code Block</span>
        </div>
      </div>
    );
  }

  if (!expanded) {
    return (
      <div className="flex items-center justify-between border rounded-md p-3 bg-slate-50 mt-2">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-slate-500" />
          <span className="text-sm font-medium">Insert Code Block</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setExpanded(true);
          }}
          className="text-xs h-7"
        >
          <Plus size={14} className="mr-1" /> Add Code
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-3 bg-slate-50 mt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-slate-500" />
          <span className="text-sm font-medium">Insert Code Block</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setExpanded(false);
          }}
          className="text-xs h-7"
        >
          Close
        </Button>
      </div>

      <Tabs defaultValue={relevantTemplates[0]} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 h-auto mb-3">
          {relevantTemplates.map((type) => (
            <TabsTrigger key={type} value={type} className="text-xs py-1 px-2">
              {type === "bash" ? <Terminal size={12} className="mr-1" /> : null}
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        {relevantTemplates.map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            <div className="mb-3">
              <pre className="text-xs bg-slate-100 p-2 rounded border overflow-x-auto max-h-32">
                <code>
                  {codeTemplates[type].replace(/```\w+\n|\n```/g, "")}
                </code>
              </pre>
            </div>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs h-7 flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyClick(type, codeTemplates[type]);
                }}
              >
                {copied === type ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
                {copied === type ? "Copied!" : "Copy"}
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => handleInsertClick(e, codeTemplates[type])}
              >
                Insert {type} code block
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
