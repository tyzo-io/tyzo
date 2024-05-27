import { useBackend } from "./components/EditorBackend";

export function useInputs() {
  const { backend } = useBackend();
  const inputs = backend.inputs;

  return {
    inputs,
  };
}
