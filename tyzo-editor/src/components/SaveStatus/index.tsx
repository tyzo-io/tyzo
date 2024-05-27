import { AlertCircle, Check, Loader } from "lucide-react";
import s from "./SaveStatus.module.css";

export function SaveStatus({
  hasChanges,
  isSaving,
  // saveErrors,
  showInfoWhenSaved,
}: {
  hasChanges: boolean;
  isSaving: boolean;
  // saveErrors: Error[] | undefined;
  showInfoWhenSaved?: boolean;
}) {
  // const { t } = useTranslation("wizely");
  if (!hasChanges && showInfoWhenSaved) {
    return (
      <div className={s.saveInfo}>
        <Check /> Saved
      </div>
    );
  }
  if (!hasChanges) {
    return <div className={s.saveInfo}></div>;
  }

  return (
    <div className={s.saveInfo}>
      {isSaving ? (
        <Loader className={s.icon} />
      ) : (
        <AlertCircle className={s.icon} />
      )}
      <p>
        {/* {isSaving && (saveErrors?.length ?? 0) === 0 */}
        {isSaving ? "Saving" : "Unsaved Changes"}
      </p>
      {/* <p>
        {!isSaving && (saveErrors?.length ?? 0) > 0 ? "Error Saving" : null}
      </p> */}
    </div>
  );
}
