import React from "react";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { ApiProvider, useApiClientContext } from "./useApi";
import "./index.css";

import { CollectionItemEditor } from "./EditEntry";
import { GlobalEditor } from "./GlobalEditor";
import { EntriesList } from "./EntriesList";
import { AssetsList } from "./AssetsList";
import { Menu } from "./Menu";

function Shell() {
  return (
    <ApiProvider>
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="border-r h-full overflow-y-auto">
          <Menu />
        </div>
        <main className="flex-1 p-2 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </ApiProvider>
  );
}

function EnriesListWithPrefix() {
  const { routePrefix } = useApiClientContext();
  return <EntriesList linkPrefix={routePrefix} />;
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Shell,
    children: [
      {
        path: "/local",
        children: [
          {
            path: "/local/collections/:collection",
            Component: EnriesListWithPrefix,
          },
          {
            path: "/local/collections/:collection/new",
            Component: CollectionItemEditor,
          },
          {
            path: "/local/collections/:collection/:id",
            Component: CollectionItemEditor,
          },
          {
            path: "/local/globals/:global",
            Component: GlobalEditor,
          },
          {
            path: "/local/assets",
            Component: AssetsList,
          },
        ],
      },
      {
        path: "/remote/:stage",
        children: [
          {
            path: "/remote/:stage/collections/:collection",
            Component: EnriesListWithPrefix,
          },
          {
            path: "/remote/:stage/collections/:collection/new",
            Component: CollectionItemEditor,
          },
          {
            path: "/remote/:stage/collections/:collection/:id",
            Component: CollectionItemEditor,
          },
          {
            path: "/remote/:stage/globals/:global",
            Component: GlobalEditor,
          },
          {
            path: "/remote/:stage/assets",
            Component: AssetsList,
          },
        ],
      },
    ],
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
