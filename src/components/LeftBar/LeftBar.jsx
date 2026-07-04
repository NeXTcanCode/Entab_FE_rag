import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { addThread, setActiveThread } from "../../store/threadsSlice";
import { toggleSidebar } from "../../store/uiSlice";
import ThreadItem from "./ThreadItem";
import SearchBar from "./SearchBar";
import ClearAllModal from "./ClearAllModal";

export default function LeftBar() {
  const dispatch = useDispatch();
  const threads = useSelector((state) => state.threads.items);
  const activeId = useSelector((state) => state.threads.activeId);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery]);

  const pinnedThreads = filteredThreads.filter(
    (t) => t.pinned && t.messages.length > 0
  );
  const recentThreads = filteredThreads.filter(
    (t) => !t.pinned && t.messages.length > 0
  );

  const handleNewThread = () => {
    dispatch(addThread());
    if (window.innerWidth < 992) {
      dispatch(toggleSidebar(false));
    }
  };

  const handleSelectThread = (id) => {
    dispatch(setActiveThread(id));
    if (window.innerWidth < 992) {
      dispatch(toggleSidebar(false));
    }
  };

  return (
    <>
      <div className={`panel-left ${sidebarOpen ? "open" : ""}`}>
        <div
          className="d-flex justify-content-between align-items-center p-3 "
          style={{ borderColor: "var(--border) !important" }}
        >
          <h5 className="m-0 fw-semibold text-white">NeXTCodeNavigator</h5>
          <button
            className="d-lg-none btn btn-sm text-white"
            onClick={() => dispatch(toggleSidebar(false))}
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          <button
            className="btn w-100 fw-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            onClick={handleNewThread}
          >
            + New Thread
          </button>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="flex-grow-1 overflow-auto mt-2 pb-3">
          {pinnedThreads.length > 0 && (
            <div className="mb-3">
              <div
                className="px-3 pb-1 text-muted"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                PINNED
              </div>
              <AnimatePresence>
                {pinnedThreads.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ThreadItem
                      thread={t}
                      isActive={t.id === activeId}
                      onSelect={handleSelectThread}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div>
            <div
              className="px-3 pb-1 text-muted"
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              RECENT
            </div>
            <AnimatePresence>
              {recentThreads.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ThreadItem
                    thread={t}
                    isActive={t.id === activeId}
                    onSelect={handleSelectThread}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {recentThreads.length === 0 && pinnedThreads.length === 0 && (
              <div
                className="text-center text-muted p-3"
                style={{ fontSize: "0.85rem" }}
              >
                No threads found
              </div>
            )}
          </div>
        </div>

        <div
          className="p-3 border-top"
          style={{ borderColor: "var(--border) !important" }}
        >
          <button
            className="btn btn-sm w-100 text-muted d-flex align-items-center justify-content-center gap-2"
            onClick={() => setShowClearModal(true)}
            style={{
              backgroundColor: "transparent",
              border: "1px solid transparent",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
              e.currentTarget.style.color = "#dc3545";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <span>🗑</span> Clear All
          </button>
        </div>
      </div>

      <ClearAllModal
        show={showClearModal}
        onClose={() => setShowClearModal(false)}
      />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={() => dispatch(toggleSidebar(false))}
          style={{ zIndex: 1045 }}
        ></div>
      )}
    </>
  );
}
