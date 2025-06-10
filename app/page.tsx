"use client";

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignUpButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Cookies from "js-cookie";
import { useCallback } from "react";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Convex + Next.js + Clerk
        <UserButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">
          Convex + Next.js + Clerk
        </h1>
        <Authenticated>
          <Content />
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInForm() {
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <p>Log in to see the numbers</p>
      <SignInButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign up
        </button>
      </SignUpButton>
    </div>
  );
}

function Content() {
  const models = useQuery(api.generate.GetModels, {}) ?? [];

  const generateMessage = useMutation(api.generate.generateMessage);

  if (!models) {
    return <div>Loading...</div>;
  }

  const generate = (() => {
    const model = Cookies.get("model");
    if (!model) {
      return;
    }
    generateMessage({ user: "test", body: "test", model: model });
    
  });

  return (
    <div>
      {models?.map((model) => (
        <ModelCard key={model._id} name={model.name} description={model.description} />
      ))}
      <button onClick={generate}>
        Generate
      </button>
    </div>
  );
}

function ModelCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const onClick = useCallback(() => {
    Cookies.set("model", name);
  }, [name]);

  return (
    <div onClick={onClick} className="flex flex-col gap-2 bg-slate-200 dark:bg-slate-800 p-4 rounded-md h-28 overflow-auto">
      <p className="text-sm">
        {name}
      </p>
      <p className="text-xs">{description}</p>
    </div>
  );
}
