import s from "./UndoControls.module.css";
import { Y } from "@syncedstore/core";
import { Redo, Undo } from "lucide-react";
import { useEffect, useState } from "react";

export function UndoControls({
  undoManager,
}: {
  undoManager: Y.UndoManager | null;
}) {
  const [availableActions, setAvailableActions] = useState<{
    canUndo: boolean;
    canRedo: boolean;
  }>({
    canUndo: false,
    canRedo: false,
  });
  useEffect(() => {
    function listener() {
      setAvailableActions({
        canUndo: undoManager?.canUndo() ?? false,
        canRedo: undoManager?.canRedo() ?? false,
      });
    }
    undoManager?.on("stack-item-added", listener);
    undoManager?.on("stack-item-updated", listener);
    return () => {
      undoManager?.off("stack-item-added", listener);
      undoManager?.off("stack-item-updated", listener);
    };
  }, [undoManager]);
  return (
    <div className={s.documentActions}>
      <button
        className={s.button}
        disabled={!availableActions.canUndo}
        onClick={() => {
          undoManager?.undo();
        }}
      >
        <Undo />
      </button>
      <button
        className={s.button}
        disabled={!availableActions.canRedo}
        onClick={() => {
          undoManager?.redo();
        }}
      >
        <Redo />
      </button>
    </div>
  );
}
