import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BranchSelector } from "./BranchSelector";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react/jsx-runtime";
import { useConfig } from "./Context";
import { useData } from "@/lib/useData";

export function NavBar({
  withBranchSelector,
  breadCrumbs,
}: {
  withBranchSelector?: boolean;
  breadCrumbs?: { link: string; label: string }[];
}) {
  const config = useConfig();
  const { data: user } = useData(() => config.authentication.getSession(), []);
  const navigate = useNavigate();
  const userName = user?.user?.name
    ?.split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? 'U';
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-4 mb-8",
        withBranchSelector || breadCrumbs ? "justify-between" : "justify-end"
      )}
    >
      {withBranchSelector && <BranchSelector />}
      {breadCrumbs && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadCrumbs.map(({ link, label }, i) => (
              <Fragment key={link}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={link}>{label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {i === breadCrumbs.length - 1 ? null : <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex flex-row gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full p-2">
            <Settings />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Space Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/team">Team</Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full">
            <Avatar>
              {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
              <AvatarFallback>{userName}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await config.authentication.logout();
                navigate("/?didLogout=true", { replace: true });
                window.location.reload();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
