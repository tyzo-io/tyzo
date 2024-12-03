import React, { lazy, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobal, useGlobalValue, useUpdateGlobalValue } from "./useApi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { JSONSchemaType } from "ajv";
import { Check, Loader2 } from "lucide-react";
import { capitalizeFirstLetter } from "./utils";
import { Button } from "./ui/button";

const AutoForm = lazy(() => import("./AutoForm"));

// Global editor
export const GlobalEditor = () => {
  const { global } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: globalConfig, loading: configLoading } = useGlobal(global!);
  const { data: globalValue, loading: valueLoading } = useGlobalValue(global);
  const updateGlobal = useUpdateGlobalValue(global);

  if (configLoading || valueLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!globalConfig) {
    return <div>Global not found</div>;
  }

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      await updateGlobal.mutate(data);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to save global:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {capitalizeFirstLetter(globalConfig.name)}
      </h1>
      <AutoForm
        schema={globalConfig.schema as JSONSchemaType<any>}
        defaultValues={globalValue?.global ?? {}}
        onSubmit={handleSubmit}
        withSubmit={false}
      >
        <Button
          type="submit"
          className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${
            saveSuccess ? "bg-green-600" : ""
          }`}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            "Save"
          )}
        </Button>
      </AutoForm>
    </div>
  );
};
