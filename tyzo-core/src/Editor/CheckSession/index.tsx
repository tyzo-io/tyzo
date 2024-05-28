import { useEffect, useState } from "react";
import { useConfig } from "../Context";
import { Button } from "@/components/ui/button";
import { Outlet, useSearchParams } from "react-router-dom";
import s from "./style.module.css";

export function CheckSession() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const config = useConfig();
  const [searchParams] = useSearchParams();
  const auth = searchParams.get("auth");
  const didLogout = searchParams.get("didLogout");

  useEffect(() => {
    // const params = window.location.search?.substring(1).split("&");
    // const authParam = params.find((param) => param.split("=")[0] === "auth");

    async function startAuth() {
      const session = await config.authentication.getSession();
      if (!session?.user) {
        // user needs to login
        setIsLoading(false);
        if (!didLogout) {
          config.authentication.login();
        }
      } else {
        if (auth) {
          window.location.href = window.location.href.split("?")[0];
        }
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }

    if (auth) {
      // const auth = authParam.split("=")[1];
      config.authentication
        .saveSession(decodeURIComponent(auth))
        .then(startAuth);
    } else {
      startAuth();
    }
  }, []);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className={s.CheckSession}>
      <Button
        onClick={() => {
          config.authentication.login();
        }}
      >
        Login
      </Button>
    </div>
  );
}
