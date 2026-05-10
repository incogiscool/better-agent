type ProjectSettingsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  const { id } = await params;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Project Settings</h1>
      <p className="text-sm text-muted-foreground">
        Settings UI for project <code>{id}</code> will be connected to the new
        backend models next.
      </p>
    </main>
  );
}
