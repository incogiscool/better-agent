"use client";

import { useActionState } from "react";
import {
  regenerateProjectKeysAction,
  updateProjectSettingsAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  RegenerateKeysActionState,
  UpdateProjectActionState,
} from "@/lib/types";

const initialUpdateState: UpdateProjectActionState = {};
const initialRegenerateState: RegenerateKeysActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-xs text-destructive">{errors[0]}</p>;
}

type ProjectSettingsFormProps = {
  project: {
    id: string;
    name: string;
    baseUrl: string | null;
    systemPrompt: string | null;
    clientKey: string;
    allowedOrigins: string[];
  };
};

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const updateAction = updateProjectSettingsAction.bind(null, project.id);
  const regenerateAction = regenerateProjectKeysAction.bind(null, project.id);

  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    initialUpdateState,
  );
  const [regenerateState, regenerateFormAction, regeneratePending] =
    useActionState(regenerateAction, initialRegenerateState);

  return (
    <div className="space-y-8">
      <form action={updateFormAction} className="space-y-6 border border-border p-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Project name
          </label>
          <Input id="name" name="name" defaultValue={project.name} required />
          <FieldError errors={updateState.errors?.name} />
        </div>

        <div className="space-y-2">
          <label htmlFor="baseUrl" className="text-sm font-medium">
            Base URL
          </label>
          <Input
            id="baseUrl"
            name="baseUrl"
            defaultValue={project.baseUrl ?? ""}
            type="url"
          />
          <FieldError errors={updateState.errors?.baseUrl} />
        </div>

        <div className="space-y-2">
          <label htmlFor="systemPrompt" className="text-sm font-medium">
            System prompt
          </label>
          <textarea
            id="systemPrompt"
            name="systemPrompt"
            defaultValue={project.systemPrompt ?? ""}
            className="min-h-36 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
          <FieldError errors={updateState.errors?.systemPrompt} />
        </div>

        <div className="space-y-2">
          <label htmlFor="allowedOrigins" className="text-sm font-medium">
            Allowed origins
          </label>
          <p className="text-xs text-muted-foreground">
            One origin per line (e.g. https://app.example.com). Only these sites
            may use this project&apos;s client key. localhost is always allowed,
            on any port.
          </p>
          <textarea
            id="allowedOrigins"
            name="allowedOrigins"
            defaultValue={project.allowedOrigins.join("\n")}
            placeholder="https://app.example.com"
            className="min-h-24 w-full rounded-none border border-input bg-transparent px-2.5 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
          <FieldError errors={updateState.errors?.allowedOrigins} />
          {project.allowedOrigins.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              Any website can use this project&apos;s client key. Add your
              domains to lock it down.
            </p>
          ) : null}
        </div>

        {updateState.message ? (
          <p className="text-sm text-muted-foreground">{updateState.message}</p>
        ) : null}

        <Button type="submit" disabled={updatePending}>
          {updatePending ? "Saving..." : "Save settings"}
        </Button>
      </form>

      <div className="space-y-4 border border-border p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Project keys</h2>
          <p className="text-sm text-muted-foreground">
            Regenerating keys immediately invalidates the previous secret.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Current client key</p>
          <p className="break-all border border-border p-3 font-mono text-xs">
            {regenerateState.credentials?.clientKey ?? project.clientKey}
          </p>
        </div>

        {regenerateState.credentials ? (
          <div className="space-y-1">
            <p className="text-sm font-medium">New secret key</p>
            <p className="break-all border border-border p-3 font-mono text-xs">
              {regenerateState.credentials.secretKey}
            </p>
          </div>
        ) : null}

        {regenerateState.message ? (
          <p className="text-sm text-muted-foreground">
            {regenerateState.message}
          </p>
        ) : null}

        <form action={regenerateFormAction}>
          <Button
            type="submit"
            variant="outline"
            disabled={regeneratePending}
          >
            {regeneratePending ? "Regenerating..." : "Regenerate keys"}
          </Button>
        </form>
      </div>
    </div>
  );
}
