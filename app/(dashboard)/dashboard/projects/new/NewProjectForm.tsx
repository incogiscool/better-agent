"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createProjectAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateProjectActionState } from "@/lib/types";

const initialState: CreateProjectActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialState,
  );

  if (state.project) {
    return (
      <div className="space-y-6 border border-border p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{state.project.name} is ready</h2>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </div>

        <dl className="space-y-4 text-sm">
          <div className="space-y-1">
            <dt className="font-medium">Client key</dt>
            <dd className="break-all border border-border p-3 font-mono text-xs">
              {state.project.clientKey}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="font-medium">Secret key</dt>
            <dd className="break-all border border-border p-3 font-mono text-xs">
              {state.project.secretKey}
            </dd>
          </div>
        </dl>

        <div className="flex gap-3">
          <Button asChild>
            <Link href={`/dashboard/projects/${state.project.id}`}>
              Open project
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 border border-border p-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Project name
        </label>
        <Input id="name" name="name" required />
        <FieldError errors={state.errors?.name} />
      </div>

      <div className="space-y-2">
        <label htmlFor="baseUrl" className="text-sm font-medium">
          Base URL
        </label>
        <Input
          id="baseUrl"
          name="baseUrl"
          placeholder="https://your-app.example.com"
          type="url"
        />
        <FieldError errors={state.errors?.baseUrl} />
      </div>

      <div className="space-y-2">
        <label htmlFor="systemPrompt" className="text-sm font-medium">
          System prompt
        </label>
        <textarea
          id="systemPrompt"
          name="systemPrompt"
          className="min-h-36 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        <FieldError errors={state.errors?.systemPrompt} />
      </div>

      {state.message ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create project"}
      </Button>
    </form>
  );
}
