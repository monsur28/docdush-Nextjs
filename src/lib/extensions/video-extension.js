"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Video component that will be rendered in the editor
const VideoComponent = ({ node, updateAttributes, deleteNode }) => {
  const { src, width, height, controls, autoplay, loop } = node.attrs;

  return (
    <NodeViewWrapper className="relative group">
      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6"
          onClick={deleteNode}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="my-4 rounded-md overflow-hidden">
        <video
          src={src}
          width={width || "100%"}
          height={height || "auto"}
          controls={controls !== false}
          autoPlay={autoplay || false}
          loop={loop || false}
          className="w-full rounded-md"
        />
      </div>
    </NodeViewWrapper>
  );
};

// Create the extension
export const VideoExtension = Node.create({
  name: "video",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      loop: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      return (
        <VideoComponent
          {...props}
          deleteNode={() => {
            props.editor.commands.deleteNode("video");
          }}
        />
      );
    });
  },
});
