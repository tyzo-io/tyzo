import "../styles.css";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ConfigProvider, TreeProvider } from "./Context";
import { CheckSession } from "./CheckSession";
import { createBrowserRouter,  RouterProvider } from "react-router-dom";
import { PageEditor } from "./Editor";
import { SideBar } from "./SideBar";
import { Home } from "./Home";
import { Team } from "./Team";
import { SpaceSettings } from "./SpaceSettings";
import { Profile } from "./Profile";
import { ComponentInfo } from "@tyzo/page-editor";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25}>
        <SideBar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        {/* <Outlet /> */}
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export function Editor({
  spaceId,
  components,
}: {
  spaceId: string | null | undefined;
  components: Record<string, ComponentInfo>;
}) {
  const [router] = useState(
    createBrowserRouter(
      [
        // {
        //   path: "/",
        //   element: <SidebarLayout />,
        //   children: [
        //     {
        //       path: "/pages/:id",
        //       element: <PageEditor />,
        //     },
        //   ],
        // },
        {
          path: "/",
          element: <CheckSession />,
          children: [
            {
              path: "/",
              element: <Home />,
            },
            {
              path: "/team",
              element: <Team />,
            },
            {
              path: "/settings",
              element: <SpaceSettings />,
            },
            {
              path: "/profile",
              element: <Profile />,
            },
            {
              path: "/pages/:id",
              element: <PageEditor />,
            },
          ],
        },
      ],
      {
        basename: "/admin",
      }
    )
  );

  return (
    <ConfigProvider
      spaceId={spaceId}
      components={components}
    >
      <TreeProvider>
        <RouterProvider router={router} />
      </TreeProvider>
    </ConfigProvider>
  );
}
