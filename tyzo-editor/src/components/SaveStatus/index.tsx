import { AlertCircle, Check, Loader } from "lucide-react";
import s from "./SaveStatus.module.css";
import { useTranslations } from "../../i18n";

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
  const { translations } = useTranslations();
  if (!hasChanges && showInfoWhenSaved) {
    return (
      <div className={s.saveInfo}>
        <Check /> {translations.saved}
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
        {isSaving ? translations.saving : translations.unsavedChanges}
      </p>
      {/* <p>
        {!isSaving && (saveErrors?.length ?? 0) > 0 ? "Error Saving" : null}
      </p> */}
    </div>
  );
}
