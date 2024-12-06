import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import {
  localApiUrl,
  remoteBaseUrl,
  useApiClientContext,
  useSchema,
} from "./useApi";
import { Button } from "./ui/button";
import { capitalizeFirstLetter, getAuthToken, saveAuthToken } from "./utils";
import { Switch } from "./ui/switch";
import {
  ChevronRight,
  Loader2,
  LogOut,
  ExternalLink,
  MenuIcon,
} from "lucide-react";
import useFetch from "./useFetch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SyncToRemote } from "./SyncToRemote";
import { SyncFromRemote } from "./SyncFromRemote";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MenuLayout, type MenuGroup } from "./MenuLayout";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export const Menu = () => {
  const { data, loading } = useSchema();
  const [showDialog, setShowDialog] = useState(false);
  const { routePrefix, isLocal, space, setSpace, stage, setTarget } =
    useApiClientContext();
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
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();

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

  const header = (
    <div className="flex flex-col p-3 rounded-lg border border-border bg-muted/30 mb-8">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-colors duration-200",
              isLocal ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-sm font-medium">
            {isLocal ? "Local API" : "CDN API"}
          </span>
        </div>
        <Switch
          disabled={userLoading}
          checked={!isLocal}
          onCheckedChange={(checked) => {
            if (!checked || (user?.user && space)) {
              setTarget(
                checked ? { remote: true, stage: "main" } : { local: true }
              );
            } else {
              setShowDialog(true);
            }
          }}
        />
      </div>
      <AnimatePresence initial={false}>
        {!isLocal && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{
              duration: 0.2,
              height: {
                type: "spring",
                damping: 20,
                stiffness: 200,
              },
            }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Space: {space || "Not selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={stage}
                  onValueChange={(value) => {
                    setTarget({ remote: true, stage: value });
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs focus:outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Development
                      </span>
                    </SelectItem>
                    <SelectItem value="staging">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        Staging
                      </span>
                    </SelectItem>
                    <SelectItem value="production">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Production
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col items-stretch mt-4">
        {isLocal && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Sync remote to local</Button>
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
        {!isLocal && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Sync local to remote</Button>
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
      </div>
    </div>
  );

  const menuGroups: MenuGroup[] = [
    {
      title: "Collections",
      items: Object.values(data?.collections ?? {}).map((collection) => ({
        key: collection.name,
        label: (
          <Link
            to={`${routePrefix}/collections/${collection.name}`}
            className="flex items-center gap-2 w-full"
          >
            {capitalizeFirstLetter(collection.name)}
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
          </Link>
        ),
        isActive: location.pathname === `/collections/${collection.name}`,
      })),
    },
    {
      title: "Globals",
      items: Object.values(data?.globals ?? {}).map((global) => ({
        key: global.name,
        label: (
          <Link
            to={`${routePrefix}/globals/${global.name}`}
            className="flex items-center gap-2 w-full"
          >
            {capitalizeFirstLetter(global.name)}
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
          </Link>
        ),
        isActive: location.pathname === `/globals/${global.name}`,
      })),
    },
    {
      items: [
        {
          key: "assets",
          label: (
            <Link
              to={`${routePrefix}/assets`}
              className="flex items-center gap-2 w-full font-bold"
            >
              Assets
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50 transition-opacity duration-200" />
            </Link>
          ),
          isActive: location.pathname === "/assets",
        },
      ],
    },
  ];

  const footer = (
    <>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {user?.user ? (
          <div className="flex items-center justify-between gap-3 w-full">
            <Avatar>
              <AvatarFallback>
                {user.user.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-xs text-muted-foreground"
                onClick={() => {
                  localStorage.removeItem("tyzo:local:token");
                  window.location.reload();
                }}
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const authUrl = `${
                process.env.TYZO_AUTH_URL ?? "https://www.tyzo.io"
              }/auth/local-auth?redirect_url=${encodeURIComponent(
                window.location.href
              )}`;
              window.location.href = authUrl;
            }}
          >
            Sign in
          </Button>
        )}
      </div>

      {/* Live app link */}
      {!isLocal && space && (
        <div className="text-center flex flex-col items-center">
          <a
            href={`https://www.tyzo.io/spaces/${space}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            View in Tyzo app
          </a>
        </div>
      )}
    </>
  );

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu */}
      <div className="lg:hidden p-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-2">
            <div className="h-full overflow-auto py-4 mt-8">
              <MenuLayout groups={menuGroups} header={header} footer={footer} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen p-4 overflow-y-auto">
        <MenuLayout groups={menuGroups} header={header} footer={footer} />
      </div>
    </>
  );
};
