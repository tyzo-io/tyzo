import "../styles.css";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ConfigProvider, EditorProvider, TreeProvider } from "./Context";
import { CheckSession } from "./CheckSession";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PageEditor } from "./PageEditor";
import { EmailEditor } from "./EmailEditor";
import { SideBar } from "./SideBar";
import { Home } from "./Home";
import { Team } from "./Team";
import { SpaceSettings } from "./SpaceSettings";
import { Profile } from "./Profile";
import { ComponentInfo, Config } from "@tyzo/page-editor";
import { Branches } from "./Branches";
import { NavBar } from "./NavBar";
import { cn } from "@/lib/utils";
import s from "./style.module.css";

export * from "../std/Inputs";
export * from "../std/index";
export * from "./Context";

export { CheckSession } from "./CheckSession";
export { Branches } from "./Branches";
export { PageEditor } from "./PageEditor";
export { EmailEditor } from "./EmailEditor";
export { Home } from "./Home";
export { Profile } from "./Profile";
export { SpaceSettings } from "./SpaceSettings";
export { Team } from "./Team";
export {
  Link,
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";

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
  pagesConfig,
  emailTemplatesConfig,
  basename,
  serviceConfig,
}: {
  spaceId: string | null | undefined;
  pagesConfig: {
    components: Record<string, ComponentInfo>;
    config?: Partial<Config>;
  };
  emailTemplatesConfig: {
    components: Record<string, ComponentInfo>;
    config?: Partial<Config>;
  };
  basename?: string;
  serviceConfig?: {
    backendUrl?: string;
    anonKey?: string;
  };
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
              element: (
                <div className={cn("tyzo", s.Container)}>
                  <NavBar withBranchSelector />
                  <Home />
                </div>
              ),
            },
            {
              path: "/branches",
              element: (
                <div className={cn("tyzo", s.Container)}>
                  <NavBar
                    breadCrumbs={[
                      {
                        link: "/",
                        label: "Home",
                      },
                      { link: "/branches", label: "Branches" },
                    ]}
                  />
                  <Branches />
                </div>
              ),
            },
            {
              path: "/team",
              element: (
                <div className={cn("tyzo", s.Container)}>
                  <NavBar
                    breadCrumbs={[
                      {
                        link: "/",
                        label: "Home",
                      },
                      { link: "/team", label: "Team" },
                    ]}
                  />
                  <Team />
                </div>
              ),
            },
            {
              path: "/settings",
              element: (
                <div className={cn("tyzo", s.Container)}>
                  <NavBar
                    breadCrumbs={[
                      {
                        link: "/",
                        label: "Home",
                      },
                      { link: "/settings", label: "Settings" },
                    ]}
                  />
                  <SpaceSettings />
                </div>
              ),
            },
            {
              path: "/profile",
              element: (
                <div className={cn("tyzo", s.Container)}>
                  <NavBar
                    breadCrumbs={[
                      {
                        link: "/",
                        label: "Home",
                      },
                      { link: "/profile", label: "Profile" },
                    ]}
                  />
                  <Profile />
                </div>
              ),
            },
            {
              path: "/pages/:id",
              element: (
                <EditorProvider
                  components={pagesConfig.components}
                  config={pagesConfig.config}
                >
                  <PageEditor />
                </EditorProvider>
              ),
            },
            {
              path: "/email-templates/:id",
              element: (
                <EditorProvider
                  components={emailTemplatesConfig.components}
                  config={emailTemplatesConfig.config}
                >
                  <EmailEditor />
                </EditorProvider>
              ),
            },
          ],
        },
      ],
      {
        basename: basename ?? "/admin",
      }
    )
  );

  return (
    <ConfigProvider spaceId={spaceId} serviceConfig={serviceConfig}>
      <TreeProvider>
        <RouterProvider router={router} />
      </TreeProvider>
    </ConfigProvider>
  );
}
