import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import LeftBar from "./components/LeftBar/LeftBar";
import MainChat from "./components/MainChat/MainChat";
import SourceBar from "./components/SourceBar/SourceBar";
import { clearToast } from "./store/uiSlice";

export default function App() {
  const dispatch = useDispatch();
  const toast = useSelector(state => state.ui.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 5000); // Hide toast after 5s
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const handleUndo = () => {
    if (toast && toast.undoAction) {
      toast.undoAction();
      dispatch(clearToast());
    }
  };

  return (
    <div className="app-shell">
      <LeftBar />
      <MainChat />
      <SourceBar />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            className="toast show align-items-center text-white bg-dark border-0 position-fixed"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{ bottom: '24px', left: '50%', zIndex: 1060, minWidth: '300px' }}
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">
                {toast.message}
              </div>
              {toast.undoAction && (
                <button type="button" className="btn btn-sm text-accent me-2 m-auto" onClick={handleUndo}>
                  Undo
                </button>
              )}
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => dispatch(clearToast())} aria-label="Close"></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
