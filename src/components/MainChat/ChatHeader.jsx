import { useDispatch } from "react-redux";
import { toggleSidebar } from "../../store/uiSlice";
import GitHubLinks from "../GitHubLinks";

export default function ChatHeader({ title, onToggleSidebar }) {
  const dispatch = useDispatch();

  return (
    <div
      className="d-flex align-items-center justify-content-between p-3 "
      style={{
        borderColor: "var(--border) !important",
        backgroundColor: "var(--bg-body)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <button
          className="d-lg-none btn btn-sm text-white px-2 py-1 border"
          onClick={() => dispatch(toggleSidebar(true))}
        >
          ☰
        </button>
        <h6 className="m-0 fw-semibold text-white">{title || "New Thread"}</h6>
      </div>
      <GitHubLinks />
    </div>
  );
}
