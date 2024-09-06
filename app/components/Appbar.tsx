"use client";

import { Button } from "@/components/ui/button";
import { Link, Music, Music2 } from "lucide-react";
import { signIn, useSession, signOut } from "next-auth/react";

export function Appbar() {
  const session = useSession();

  return (
    <header className="px-5 py-10 lg:px-12 lg:py-10 h-16 flex items-center flex-row justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <Music2 className="mr-2" />
          FanTune
        </h1>
        {session.data?.user && (
            <Button className="m-2 p-2 bg-blue-400" onClick={() => signOut()}>
              Logout
            </Button>
          )}
          {!session.data?.user && (
            <Button className="m-2 p-2 bg-blue-400" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
      </header>
  );
}