import React, { lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useApiClientContext,
  useCollection,
  useEntry,
  usePutEntry,
} from "./useApi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { JSONSchemaType } from "ajv";
import { Loader2 } from "lucide-react";

const AutoForm = lazy(() => import("./AutoForm"));

// Collection item editor
export const CollectionItemEditor = () => {
  const { collection, id } = useParams();
  const navigate = useNavigate();
  const { routePrefix } = useApiClientContext();

  const { data } = useCollection(collection);
  const { collection: currentCollection, collections } = data ?? {};
  const { data: entry, loading } = useEntry(collection, id);
  const putEntry = usePutEntry(collection);
  const isNew = !id;

  if (loading) {
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!currentCollection) return <div>Collection not found</div>;
  if (!isNew && !entry && !loading) {
    return <div>Entry not found</div>;
  }

  const handleSubmit = async (data: any) => {
    try {
      if (id) {
        await putEntry.mutate({ id, data });
      } else {
        await putEntry.mutate({ id: data[currentCollection.idField], data });
      }
      navigate(`${routePrefix}/collections/${collection}`);
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        {isNew ? "New Item" : "Edit Item"}
      </h1>
      <AutoForm
        schema={currentCollection.schema as JSONSchemaType<any>}
        allCollections={
          collections as Record<
            string,
            { schema: JSONSchemaType<any>; name: string }
          >
        }
        defaultValues={entry?.entry ?? {}}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
