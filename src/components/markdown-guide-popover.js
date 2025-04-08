"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";

export function MarkdownGuidePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-slate-400 hover:text-slate-600"
        >
          <HelpCircle size={14} />
          <span className="sr-only">Markdown Help</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Markdown Formatting Guide</h3>
          <div className="text-xs space-y-1">
            <p className="font-medium">Basic Formatting</p>
            <div className="grid grid-cols-2 gap-1">
              <code className="bg-slate-100 px-1 rounded text-xs">
                **bold**
              </code>
              <span>
                → <strong>bold</strong>
              </span>

              <code className="bg-slate-100 px-1 rounded text-xs">
                *italic*
              </code>
              <span>
                → <em>italic</em>
              </span>

              <code className="bg-slate-100 px-1 rounded text-xs">
                [link](url)
              </code>
              <span>
                → <span className="text-blue-500 underline">link</span>
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-medium">Lists</p>
            <div className="grid grid-cols-2 gap-1">
              <code className="bg-slate-100 px-1 rounded text-xs">- item</code>
              <span>→ • item</span>

              <code className="bg-slate-100 px-1 rounded text-xs">1. item</code>
              <span>→ 1. item</span>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-medium">Code</p>
            <div className="grid grid-cols-2 gap-1">
              <code className="bg-slate-100 px-1 rounded text-xs">
                `inline code`
              </code>
              <span>
                →{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">
                  inline code
                </code>
              </span>

              <div className="col-span-2">
                <code className="bg-slate-100 px-1 rounded text-xs">
                  ```language
                  <br />
                  code block
                  <br />
                  ```
                </code>
              </div>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <p className="font-medium">Headings</p>
            <div className="grid grid-cols-2 gap-1">
              <code className="bg-slate-100 px-1 rounded text-xs">
                # Heading 1
              </code>
              <span className="font-bold">Heading 1</span>

              <code className="bg-slate-100 px-1 rounded text-xs">
                ## Heading 2
              </code>
              <span className="font-semibold">Heading 2</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
