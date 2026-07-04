import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChatQuote, toggleSourceSheet } from "../../store/uiSlice";
import ReactMarkdown from "react-markdown";
import FileTab from "./FileTab";
import SelectionPopover from "../MainChat/SelectionPopover";

// Simple helper to guess language for syntax highlighting
const getLanguage = (path) => {
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".json")) return "json";
  return "text";
};

export default function SourceBar() {
  const dispatch = useDispatch();

  const activeSourceMessage = useSelector(
    (state) => state.ui.activeSourceMessage
  );
  const sourceSheetOpen = useSelector((state) => state.ui.sourceSheetOpen);
  const activeThreadId = useSelector((state) => state.threads.activeId);
  const thread = useSelector((state) =>
    state.threads.items.find((t) => t.id === activeThreadId)
  );

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [quoteSelection, setQuoteSelection] = useState(null);

  // Get the message that we want to show sources for
  const sourceMessage = useMemo(() => {
    if (!thread) return null;

    // If we clicked a specific source chip, show that
    if (
      activeSourceMessage &&
      activeSourceMessage.threadId === activeThreadId
    ) {
      return thread.messages.find(
        (m) => m.id === activeSourceMessage.messageId
      );
    }

    // Otherwise show the latest message that has sources
    const msgsWithSources = thread.messages.filter(
      (m) => m.role === "assistant" && m.sources && m.sources.length > 0
    );
    return msgsWithSources.length > 0
      ? msgsWithSources[msgsWithSources.length - 1]
      : null;
  }, [thread, activeSourceMessage, activeThreadId]);

  // Extract all files from contexts
  const files = useMemo(() => {
    if (!sourceMessage || !sourceMessage.sources) return [];

    const allFiles = [];
    const seen = new Set();

    sourceMessage.sources.forEach((context) => {
      if (context.source_files) {
        context.source_files.forEach((sf) => {
          if (!seen.has(sf.path)) {
            seen.add(sf.path);
            allFiles.push(sf);
          }
        });
      }
    });

    // Sort files based on thread config (put preferred mode first)
    if (thread && thread.config) {
      allFiles.sort((a, b) => {
        const aIsCss = a.path.endsWith(".css");
        const bIsCss = b.path.endsWith(".css");
        if (thread.config.output_mode === "css") {
          if (aIsCss && !bIsCss) return -1;
          if (!aIsCss && bIsCss) return 1;
        } else if (thread.config.output_mode === "code") {
          if (!aIsCss && bIsCss) return -1;
          if (aIsCss && !bIsCss) return 1;
        }
        return 0;
      });
    }

    return allFiles;
  }, [sourceMessage, thread]);

  // Reset active file when sources change
  useEffect(() => {
    setActiveFileIndex(0);
  }, [files]);

  const handleSourceMouseUp = (event) => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || !event.currentTarget.contains(selection.anchorNode)) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setQuoteSelection({
      text,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    });
  };

  const handleQuote = (text) => {
    dispatch(setChatQuote({
      threadId: activeThreadId,
      text,
      path: files[activeFileIndex]?.path || "",
    }));
    setQuoteSelection(null);
    window.getSelection()?.removeAllRanges();
    if (window.innerWidth < 992) {
      dispatch(toggleSourceSheet(false));
    }
  };

  const headerText = thread
    ? `${thread.config.school_code} › ${thread.config.output_mode}`
    : "Source";

  const panelContent = (
    <>
      <div
        className="d-flex justify-content-between align-items-center p-3 "
        style={{ borderColor: "var(--border) !important" }}
      >
        <h6 className="m-0 fw-semibold text-white">📄 {headerText}</h6>
        <button
          className="d-lg-none btn btn-sm text-white px-2 py-1"
          onClick={() => dispatch(toggleSourceSheet(false))}
        >
          ✕
        </button>
      </div>

      {files.length === 0 ? (
        <div className="p-4 text-center text-muted h-100 d-flex flex-column justify-content-center">
          <div>No source code yet.</div>
          <div style={{ fontSize: "0.85rem" }} className="mt-2">
            Ask a question to explore the codebase.
          </div>
        </div>
      ) : (
        <>
          <div className="source-tabs">
            {files.map((file, idx) => (
              <FileTab
                key={file.path}
                path={file.path}
                isActive={idx === activeFileIndex}
                onClick={() => setActiveFileIndex(idx)}
              />
            ))}
          </div>

          <div className="source-selection-hint">
            Highlight code or CSS, then click <strong>Add to chat</strong>.
          </div>

          <div className="source-content" onMouseUp={handleSourceMouseUp}>
            <ReactMarkdown>
              {`\`\`\`${getLanguage(files[activeFileIndex]?.path)}\n${
                files[activeFileIndex]?.content || ""
              }\n\`\`\``}
            </ReactMarkdown>
          </div>
        </>
      )}

      <SelectionPopover
        selection={quoteSelection?.text}
        position={quoteSelection?.position}
        onQuote={handleQuote}
        onClose={() => setQuoteSelection(null)}
      />
    </>
  );

  return (
    <>
      {/* Desktop Panel */}
      <div className="panel-right d-none d-lg-flex">{panelContent}</div>

      {/* Mobile Bottom Sheet */}
      <div className={`panel-right d-lg-none ${sourceSheetOpen ? "open" : ""}`}>
        {panelContent}
      </div>

      {/* Mobile Backdrop */}
      {sourceSheetOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={() => dispatch(toggleSourceSheet(false))}
          style={{ zIndex: 1035 }}
        ></div>
      )}
    </>
  );
}
