import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ApiProvider,
  localApiUrl,
  useApiClientContext,
  useSchema,
} from "./useApi";
import { Button } from "./ui/button";
import "./index.css";
import { capitalizeFirstLetter, getAuthToken, saveAuthToken } from "./utils";

import { CollectionItemEditor } from "./EditEntry";
import { GlobalEditor } from "./GlobalEditor";
import { EntriesList } from "./EntriesList";
import { Switch } from "./ui/switch";
import { ChevronRight, Loader2 } from "lucide-react";
import useFetch from "./useFetch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { SyncToRemote } from "./SyncToRemote";
import { SyncFromRemote } from "./SyncFromRemote";
import { SyncStatus } from "./SyncStatus";
import { AssetsList } from "./AssetsList";

// Sidebar navigation
const Sidebar = () => {
  const { data, loading, error, refetch } = useSchema();
  const [space, setSpace] = useState<string>();
  const remoteBaseUrl = process.env.REMOTE_TYZO_URL ?? "https://api.tyzo.io";
  const remoteUrl = `${remoteBaseUrl}/content/${space}`;
  const { apiClient, setApiUrl } = useApiClientContext();
  const { data: user, loading: userLoading } = useFetch<{
    user: { id: string; email: string } | null;
  }>(
    `${remoteBaseUrl}/me`,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
    {
      skip: !getAuthToken(),
    }
  );
  const [showDialog, setShowDialog] = useState(false);
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    const savedSpace = process.env.TYZO_SPACE;
    if (savedSpace) {
      setSpace(savedSpace);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const spaceParam = params.get("space");

    if (token) {
      saveAuthToken(token);
    }

    if (spaceParam) {
      setSpace(spaceParam);
      fetch(`${localApiUrl}/save-space`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ space: spaceParam }),
      });
    }

    if (token || spaceParam) {
      setSearchParams({});
    }
  }, [location]);

  const handleDialogClose = () => {
    const authUrl = `${
      process.env.TYZO_AUTH_URL ?? "https://www.tyzo.io"
    }/auth/local-auth?redirect_url=${encodeURIComponent(window.location.href)}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    refetch();
  }, [apiClient.apiUrl]);

  return (
    <div className="w-64 border-r h-screen p-4 overflow-y-auto">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <p className="mb-4">
            You need to be authenticated and select a space to use the remote
            API. You will be redirected to the authentication page.
          </p>
          <DialogFooter>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDialogClose();
                return false;
              }}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-row gap-2 items-center">
        Local API{" "}
        <Switch
          disabled={userLoading}
          checked={apiClient.apiUrl === remoteUrl}
          onCheckedChange={(checked) => {
            if (!checked || (user?.user && space)) {
              setApiUrl(checked ? remoteUrl : localApiUrl);
            } else {
              setShowDialog(true);
            }
          }}
        />{" "}
        CDN API {space ? `(${space})` : ""}
      </div>
      <div className="flex flex-col items-stretch mt-4">
        {apiClient.apiUrl === localApiUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Sync remote to local</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync remote to local</DialogTitle>
                <DialogDescription>
                  Sync the schema and content from the live CDN to the local
                  file system.
                </DialogDescription>
              </DialogHeader>
              <SyncFromRemote />
            </DialogContent>
          </Dialog>
        )}
        {apiClient.apiUrl === remoteUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Sync local to remote</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync local to remote</DialogTitle>
                <DialogDescription>
                  Sync the schema as well as all local changes to the live CDN.
                </DialogDescription>
              </DialogHeader>
              <SyncToRemote />
            </DialogContent>
          </Dialog>
        )}
        <SyncStatus />
      </div>
      <nav className="mt-8">
        {loading && (
          <div>
            <Loader2 className="animate-spin" />
          </div>
        )}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Collections</h3>
          <div className="flex flex-col gap-2">
            {Object.values(data?.collections ?? {})?.map((collection) => (
              <Link
                to={`/collections/${collection.name}`}
                key={collection.name}
              >
                {capitalizeFirstLetter(collection.name)}
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Globals</h3>
          <div className="flex flex-col gap-2">
            {Object.values(data?.globals ?? {})?.map((global) => (
              <Link key={global.name} to={`/globals/${global.name}`}>
                {capitalizeFirstLetter(global.name)}
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <Link to={`/assets`} className="hover:underline">
            <h3 className="font-semibold mb-2">
              Assets
              <ChevronRight className="inline w-4 h-4 ml-2" />
            </h3>
          </Link>
        </div>
      </nav>
    </div>
  );
};

function Shell() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Shell,
    children: [
      {
        path: "/collections/:collection",
        Component: EntriesList,
      },
      {
        path: "/collections/:collection/new",
        Component: CollectionItemEditor,
      },
      {
        path: "/collections/:collection/:id",
        Component: CollectionItemEditor,
      },
      {
        path: "/globals/:global",
        Component: GlobalEditor,
      },
      {
        path: "/assets",
        Component: AssetsList,
      },
    ],
  },
]);

export const App = () => {
  return (
    <ApiProvider apiUrl="http://localhost:3456/api">
      <RouterProvider router={router} />
    </ApiProvider>
  );
};
