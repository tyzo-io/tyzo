import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./editor";

export function EditorClient() {
  return <App />;
}

const root = createRoot(document.getElementById("root")!);
root.render(<EditorClient />);
