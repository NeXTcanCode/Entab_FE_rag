import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  clearThreadMessages,
  updateThreadConfig,
  updateThreadTitle,
} from "../../store/threadsSlice";
import { setActiveSource, setChatQuote, toggleSourceSheet } from "../../store/uiSlice";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import LoadingDots from "./LoadingDots";
import Message from "./Message";
import GitHubLinks from "../GitHubLinks";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://entab-be-rag-qdrant-1.onrender.com";

const outputModes = [
  { value: "code", label: "Code" },
  { value: "css", label: "CSS" },
  { value: "both", label: "Both" },
];

function sortByQuery(items, query, fields) {
  const q = query.trim().toLowerCase();
  const scored = items
    .filter((item) => {
      if (!q) return true;
      return fields.some((field) => String(item[field] || "").toLowerCase().includes(q));
    })
    .map((item) => ({
      item,
      score: fields.reduce((acc, field) => {
        const value = String(item[field] || "").toLowerCase();
        return acc + (value.startsWith(q) ? 2 : value.includes(q) ? 1 : 0);
      }, 0),
    }));
  return scored
    .sort((a, b) => b.score - a.score || String(a.item.school_code || a.item.path).localeCompare(String(b.item.school_code || b.item.path)))
    .map((entry) => entry.item);
}

export default function MainChat() {
  const dispatch = useDispatch();
  const activeThreadId = useSelector((state) => state.threads.activeId);
  const activeThread = useSelector((state) =>
    state.threads.items.find((thread) => thread.id === state.threads.activeId)
  );
  const storedChatQuote = useSelector((state) => state.ui.chatQuote);
  const chatQuote = storedChatQuote?.threadId === activeThreadId ? storedChatQuote : null;
  const [schools, setSchools] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [schoolError, setSchoolError] = useState("");
  const [fileError, setFileError] = useState("");
  const [step, setStep] = useState(1);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [fileQuery, setFileQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [outputMode, setOutputMode] = useState("");
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatScrollRef = useRef(null);
  const chatAbortRef = useRef(null);

  useEffect(() => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    dispatch(setChatQuote(null));
    const config = activeThread?.config;
    if (config?.source_file_path) {
      setSelectedSchool(config.school_code || "");
      setSelectedFile(config.source_file_path);
      setOutputMode(config.output_mode || "code");
      setChatOpen(true);
      return;
    }
    setChatOpen(false);
    setStep(1);
    setSelectedSchool("");
    setSelectedFile("");
    setOutputMode("");
  }, [activeThreadId, dispatch]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages?.length, chatLoading, chatOpen]);

  useEffect(() => {
    let cancelled = false;
    async function loadSchools() {
      setLoadingSchools(true);
      setSchoolError("");
      try {
        const res = await fetch(`${backendUrl}/inventory/schools`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setSchools(Array.isArray(data.schools) ? data.schools : []);
        }
      } catch (error) {
        if (!cancelled) {
          setSchoolError("Unable to load schools from the backend.");
          setSchools([]);
        }
      } finally {
        if (!cancelled) setLoadingSchools(false);
      }
    }
    loadSchools();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSchool) {
      setFiles([]);
      setSelectedFile("");
      setFileError("");
      return;
    }

    let cancelled = false;
    async function loadFiles() {
      setLoadingFiles(true);
      setFileError("");
      try {
        const res = await fetch(`${backendUrl}/inventory/schools/${encodeURIComponent(selectedSchool)}/files`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setFiles(Array.isArray(data.files) ? data.files : []);
        }
      } catch (error) {
        if (!cancelled) {
          setFileError("Unable to load source files for the selected school.");
          setFiles([]);
        }
      } finally {
        if (!cancelled) setLoadingFiles(false);
      }
    }

    loadFiles();
    return () => {
      cancelled = true;
    };
  }, [selectedSchool]);

  const filteredSchools = useMemo(
    () => sortByQuery(schools, schoolQuery, ["school_code", "school_name"]),
    [schools, schoolQuery]
  );

  const filteredFiles = useMemo(
    () => sortByQuery(files, fileQuery, ["path", "filename"]),
    [files, fileQuery]
  );

  const selectedSchoolRecord = useMemo(
    () => schools.find((school) => school.school_code === selectedSchool),
    [schools, selectedSchool]
  );

  const selectedFileRecord = useMemo(
    () => files.find((file) => file.path === selectedFile),
    [files, selectedFile]
  );

  const canAdvanceFromStep1 = Boolean(selectedSchool);
  const canAdvanceFromStep2 = Boolean(selectedFile);
  const canSubmit = canAdvanceFromStep1 && canAdvanceFromStep2 && Boolean(outputMode);

  const handleSchoolChange = (schoolCode) => {
    setSelectedSchool(schoolCode);
    setSelectedFile("");
    setOutputMode("");
    setSourceError("");
  };

  const handleFileChange = (path) => {
    setSelectedFile(path);
    setOutputMode("");
    setSourceError("");
  };

  const handleSubmit = async () => {
    if (!canSubmit || sourceLoading || !activeThreadId) return;
    const payload = {
      school_code: selectedSchool,
      source_file_path: selectedFile,
      output_mode: outputMode,
    };
    setSourceLoading(true);
    setSourceError("");
    try {
      const response = await fetch(`${backendUrl}/source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      const messageId = crypto.randomUUID();
      dispatch(clearThreadMessages(activeThreadId));
      dispatch(updateThreadConfig({ id: activeThreadId, config: payload }));
      dispatch(updateThreadTitle({ id: activeThreadId, title: selectedFileRecord?.filename || selectedFile }));
      dispatch(addMessage({
        threadId: activeThreadId,
        message: {
          id: messageId,
          role: "assistant",
          content: data.answer || "Source loaded.",
          sources: Array.isArray(data.contexts) ? data.contexts : [],
          isSourceSnapshot: true,
        },
      }));
      dispatch(setActiveSource({ threadId: activeThreadId, messageId }));
      setChatOpen(true);
      if (window.innerWidth < 992) {
        dispatch(toggleSourceSheet(true));
      }
    } catch (error) {
      setSourceError(error.message || "Unable to load the selected source.");
    } finally {
      setSourceLoading(false);
    }
  };

  const handleChatSend = async () => {
    const question = chatInput.trim();
    const config = activeThread?.config;
    if (!question || chatLoading || !activeThreadId || !config?.source_file_path) return;

    const userContent = chatQuote?.text
      ? `Referenced excerpt from ${chatQuote.path || config.source_file_path}:\n${chatQuote.text}\n\nQuestion: ${question}`
      : question;
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userContent,
    };
    const conversation = [
      ...(activeThread.messages || [])
        .filter((message) =>
          (message.role === "user" || message.role === "assistant")
          && !message.isSourceSnapshot
        )
        .map((message) => ({ role: message.role, content: message.content })),
      { role: "user", content: userContent },
    ];

    dispatch(addMessage({ threadId: activeThreadId, message: userMessage }));
    setChatInput("");
    dispatch(setChatQuote(null));
    setChatError("");
    setChatLoading(true);
    const controller = new AbortController();
    chatAbortRef.current = controller;
    try {
      const response = await fetch(`${backendUrl}/source/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_code: config.school_code,
          source_file_path: config.source_file_path,
          output_mode: config.output_mode,
          messages: conversation,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`);
      }
      dispatch(addMessage({
        threadId: activeThreadId,
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer || "The model returned an empty response.",
          sources: Array.isArray(data.contexts) ? data.contexts : [],
        },
      }));
    } catch (error) {
      if (error.name !== "AbortError") {
        setChatError(error.message || "Unable to ask the model about this source.");
        setChatInput(question);
      }
    } finally {
      if (chatAbortRef.current === controller) {
        chatAbortRef.current = null;
      }
      setChatLoading(false);
    }
  };

  const handleStopGenerating = () => {
    chatAbortRef.current?.abort();
    chatAbortRef.current = null;
    setChatLoading(false);
  };

  if (chatOpen && activeThread?.config?.source_file_path) {
    const config = activeThread.config;
    return (
      <main className="panel-main">
        <ChatHeader title={`${config.school_code} · ${config.source_file_path}`} />
        <div className="chat-context-strip">
          <div>
            <span>Context memory</span>
            <strong>{config.output_mode} · {config.source_file_path}</strong>
          </div>
          <button type="button" onClick={() => { setChatOpen(false); setStep(1); }}>
            Change selection
          </button>
        </div>
        <div className="chat-scroll-area" ref={chatScrollRef}>
          {(activeThread.messages || []).map((message) => (
            <Message
              key={message.id}
              threadId={activeThreadId}
              message={message}
              onSelectText={(selection) => dispatch(setChatQuote({
                threadId: activeThreadId,
                text: selection.text,
                path: "chat response",
              }))}
            />
          ))}
          {chatLoading && (
            <div className="msg-container msg-assistant">
              <div className="msg-content"><LoadingDots /></div>
            </div>
          )}
        </div>
        {chatError && <div className="chat-error">{chatError}</div>}
        <Composer
          input={chatInput}
          setInput={setChatInput}
          onSend={handleChatSend}
          onStop={handleStopGenerating}
          loading={chatLoading}
          quote={chatQuote?.text || null}
          onDismissQuote={() => dispatch(setChatQuote(null))}
          placeholder={`Ask about ${config.source_file_path}`}
        />
      </main>
    );
  }

  return (
    <main className="panel-main wizard-main">
      <div className="wizard-shell">
        <div className="wizard-topbar">
          <GitHubLinks />
        </div>
        <div className="wizard-hero">
          <div className="wizard-kicker">Source browser</div>
          <h1>Browse school source code.</h1>
          <p>Complete one step at a time. Your earlier selections stay available when you go back.</p>
        </div>

        <div className="wizard-progress" aria-label="Progress">
          <div className={step >= 1 ? "active" : ""}>1. School</div>
          <div className={step >= 2 ? "active" : ""}>2. Source file</div>
          <div className={step >= 3 ? "active" : ""}>3. Output</div>
        </div>

        {step === 1 && (
          <section className="wizard-card active">
            <div className="wizard-card-head">
              <div>
                <div className="wizard-step-label">Step 1 of 3</div>
                <h2>Choose school</h2>
              </div>
              {!loadingSchools && !schoolError && <span className="wizard-count">{schools.length} schools</span>}
            </div>
            <input
              className="wizard-search"
              value={schoolQuery}
              onChange={(e) => setSchoolQuery(e.target.value)}
              placeholder="Search school code or school name"
              aria-label="Search schools"
            />
            <div className="wizard-list" role="listbox" aria-label="Available schools">
              {loadingSchools && <div className="wizard-empty">Loading schools from Qdrant...</div>}
              {!loadingSchools && schoolError && <div className="wizard-empty error">{schoolError}</div>}
              {!loadingSchools && !schoolError && filteredSchools.length === 0 && (
                <div className="wizard-empty">No schools match your search.</div>
              )}
              {filteredSchools.map((school) => (
                <button
                  key={school.school_code}
                  type="button"
                  className={`wizard-row ${selectedSchool === school.school_code ? "selected" : ""}`}
                  onClick={() => handleSchoolChange(school.school_code)}
                  aria-selected={selectedSchool === school.school_code}
                >
                  <span className="wizard-row-primary">{school.school_code}</span>
                  <span className="wizard-row-secondary">{school.school_name || school.school_code}</span>
                </button>
              ))}
            </div>
            <div className="wizard-actions end">
              <button className="wizard-next" type="button" disabled={!canAdvanceFromStep1} onClick={() => setStep(2)}>
                Next: source file
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="wizard-card active">
            <div className="wizard-card-head">
              <div>
                <div className="wizard-step-label">Step 2 of 3</div>
                <h2>Available source files</h2>
              </div>
              <span className="wizard-count">{selectedSchool}</span>
            </div>
            <input
              className="wizard-search"
              value={fileQuery}
              onChange={(e) => setFileQuery(e.target.value)}
              placeholder="Search exact filenames or relative paths"
              aria-label="Search source files"
            />
            <div className="wizard-list" role="listbox" aria-label="Available source files">
              {loadingFiles && <div className="wizard-empty">Loading files for {selectedSchool}...</div>}
              {fileError && <div className="wizard-empty error">{fileError}</div>}
              {!loadingFiles && !fileError && filteredFiles.length === 0 && (
                <div className="wizard-empty">No files match your search.</div>
              )}
              {filteredFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  className={`wizard-row file ${selectedFile === file.path ? "selected" : ""}`}
                  onClick={() => handleFileChange(file.path)}
                  aria-selected={selectedFile === file.path}
                >
                  <span className="wizard-row-primary">{file.filename || file.path}</span>
                  <span className="wizard-row-secondary">{file.path}</span>
                </button>
              ))}
            </div>
            <div className="wizard-actions">
              <button className="wizard-back" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="wizard-next" type="button" disabled={!canAdvanceFromStep2} onClick={() => setStep(3)}>
                Next: output
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="wizard-card active output-step">
            <div className="wizard-card-head">
              <div>
                <div className="wizard-step-label">Step 3 of 3</div>
                <h2>Choose output</h2>
              </div>
            </div>
            <div className="wizard-summary compact">
              <strong>{selectedSchoolRecord ? `${selectedSchoolRecord.school_code} — ${selectedSchoolRecord.school_name}` : selectedSchool}</strong>
              <span>{selectedFileRecord?.path}</span>
            </div>
            <div className="wizard-radio-group" role="radiogroup" aria-label="Output mode">
              {outputModes.map((mode) => {
                return (
                  <label key={mode.value} className={`wizard-radio ${outputMode === mode.value ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="outputMode"
                      value={mode.value}
                      checked={outputMode === mode.value}
                      onChange={() => setOutputMode(mode.value)}
                    />
                    <span>{mode.label}</span>
                  </label>
                );
              })}
            </div>
            <div className="wizard-note">CSS is matched from the project styles and includes responsive media-query rules.</div>
            {sourceError && <div className="wizard-empty error">{sourceError}</div>}
            <div className="wizard-actions">
              <button className="wizard-back" type="button" onClick={() => setStep(2)}>Back</button>
              <button className="wizard-submit" type="button" onClick={handleSubmit} disabled={!canSubmit || sourceLoading}>
                {sourceLoading ? "Loading source..." : "View source"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
