import { useBackend } from "./components/EditorBackend";

export function useInput(name: string) {
  const { backend } = useBackend();
  const input = backend.inputs[name];
  return {
    input,
    Input: input,
  };
}
