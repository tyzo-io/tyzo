import React, { lazy, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useApiClientContext,
  useCollection,
  useDeleteEntry,
  useEntry,
  useGetEntry,
  usePutEntry,
} from "./useApi";
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
  const getEntry = useGetEntry(collection);
  const putEntry = usePutEntry(collection);
  const deleteEntry = useDeleteEntry(collection);
  const isNew = !id;
  const idField = data?.collection.idField
  const [error, setError] = useState<string | null>(null);

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
        const newId = idField ? data[idField] : undefined;
        const didUpdateIdField = newId !== id;
        if (newId && didUpdateIdField) {
          const existing = await getEntry.mutate({ id: newId });
          if (existing?.entry) {
            throw new Error(`An entry with this ${idField} already exists`);
          }
          await putEntry.mutate({ id: newId, data });
          await deleteEntry.mutate(id);
        } else {
          await putEntry.mutate({ id, data });
        }
      } else {
        await putEntry.mutate({ id: data[currentCollection.idField], data });
      }
      navigate(`${routePrefix}/collections/${collection}`);
    } catch (error) {
      console.error("Failed to save entry:", error);
      setError((error as Error).message ?? "Failed to save entry");
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
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};
