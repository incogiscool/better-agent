"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "@/lib/actions";
import posthog from "posthog-js";
import { WizardShell, type Step } from "./WizardShell";
import { StepBasics, type BasicsValue, type BasicsErrors } from "./StepBasics";
import { StepKeys } from "./StepKeys";
import { StepCli } from "./StepCli";
import { StepWaiting } from "./StepWaiting";

const STEPS: Step[] = [
  { key: "basics", label: "Project" },
  { key: "keys", label: "Keys" },
  { key: "cli", label: "Install CLI" },
  { key: "waiting", label: "Sync" },
];

type Credentials = {
  projectId: string;
  clientKey: string;
  secretKey: string;
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [basics, setBasics] = React.useState<BasicsValue>({
    name: "",
    baseUrl: "",
  });
  const [basicsErrors, setBasicsErrors] = React.useState<BasicsErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [creds, setCreds] = React.useState<Credentials | null>(null);
  const [acknowledged, setAcknowledged] = React.useState(false);

  async function handleCreate() {
    setBasicsErrors({});

    if (!basics.name.trim()) {
      setBasicsErrors({ name: "Project name is required." });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", basics.name);
      formData.set("baseUrl", basics.baseUrl);
      formData.set("systemPrompt", "");

      const result = await createProjectAction({}, formData);

      if (result.errors) {
        setBasicsErrors({
          name: result.errors.name?.[0],
          baseUrl: result.errors.baseUrl?.[0],
        });
        return;
      }

      if (!result.project) {
        setBasicsErrors({
          name: result.message ?? "Could not create the project.",
        });
        return;
      }

      setCreds({
        projectId: result.project.id,
        clientKey: result.project.clientKey,
        secretKey: result.project.secretKey,
      });
      posthog.capture("project_created", { project_id: result.project.id });
      posthog.capture("onboarding_step_advanced", { step: "basics", next_step: "keys" });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  }

  const stepConfig = [
    {
      title: "Create your project",
      description:
        "Two fields. You can edit everything else after the wizard.",
      footer: (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard?skip=1">Cancel</Link>
          </Button>
          <Button onClick={handleCreate} disabled={submitting} size="sm">
            {submitting ? "Creating…" : "Continue"}
          </Button>
        </>
      ),
      body: (
        <StepBasics
          value={basics}
          errors={basicsErrors}
          onChange={(patch) => setBasics((b) => ({ ...b, ...patch }))}
        />
      ),
    },
    {
      title: "Your project keys",
      description:
        "Use the client key in browsers, the secret key in trusted environments only.",
      footer: (
        <>
          <span className="text-[11px] text-muted-foreground">
            Step 2 of 4
          </span>
          <Button
            onClick={() => {
              posthog.capture("onboarding_step_advanced", { step: "keys", next_step: "cli" });
              setStep(2);
            }}
            disabled={!acknowledged}
            size="sm"
          >
            I&apos;ve saved it
          </Button>
        </>
      ),
      body: creds && (
        <StepKeys
          clientKey={creds.clientKey}
          secretKey={creds.secretKey}
          acknowledged={acknowledged}
          onAcknowledge={setAcknowledged}
        />
      ),
    },
    {
      title: "Install the BetterAgent CLI",
      description:
        "Three commands in your project. Step 4 will detect the first sync automatically.",
      footer: (
        <>
          <Button onClick={() => setStep(1)} variant="ghost" size="sm">
            Back
          </Button>
          <Button
            onClick={() => {
              posthog.capture("onboarding_step_advanced", { step: "cli", next_step: "waiting" });
              setStep(3);
            }}
            size="sm"
          >
            I&apos;ve installed it
          </Button>
        </>
      ),
      body: creds && <StepCli secretKey={creds.secretKey} />,
    },
    {
      title: "Waiting for your first sync",
      description: "We&apos;ll detect it automatically — usually within a few seconds.",
      footer: (
        <>
          <Button onClick={() => setStep(2)} variant="ghost" size="sm">
            Back
          </Button>
          <Button
            onClick={() => creds && router.push(`/dashboard/projects/${creds.projectId}/runs`)}
            disabled={!creds}
            variant="outline"
            size="sm"
          >
            Skip for now
          </Button>
        </>
      ),
      body: creds && <StepWaiting projectId={creds.projectId} />,
    },
  ];

  const current = stepConfig[step];

  return (
    <WizardShell
      steps={STEPS}
      current={step}
      title={current.title}
      description={current.description}
      footer={current.footer}
    >
      {current.body}
    </WizardShell>
  );
}
