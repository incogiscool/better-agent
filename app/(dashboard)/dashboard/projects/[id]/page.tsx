type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Project Overview</h1>
      <p className="text-sm text-muted-foreground">
        Backend scaffolding for project <code>{id}</code> is in progress.
      </p>
    </main>
  );
}
