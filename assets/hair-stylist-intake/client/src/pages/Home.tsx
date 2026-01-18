import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

/**
 * All content in this page are only for example, replace with your own feature implementation
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { data: trees, isLoading } = trpc.decisionTrees.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Hair Stylist Intake</h1>
              <p className="text-lg text-muted-foreground">Select a service menu to begin</p>
            </div>
            <a
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trees?.map((tree) => (
            <a
              key={tree.id}
              href={`/intake/${tree.id}`}
              className="block group"
            >
              <div className="border border-border rounded bg-card p-6 hover:border-foreground transition-colors h-full">
                <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent-foreground">
                  {tree.name}
                </h2>
                {tree.description && (
                  <p className="text-muted-foreground text-sm">{tree.description}</p>
                )}
                <div className="mt-4 text-sm text-primary font-medium">
                  Start selection →
                </div>
              </div>
            </a>
          ))}
        </div>

        {(!trees || trees.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No decision trees available</p>
          </div>
        )}
      </main>
    </div>
  );
}
