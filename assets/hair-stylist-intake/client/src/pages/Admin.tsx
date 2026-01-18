import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { AIChat } from "@/components/AIChat";
import { VisualEditor } from "@/components/VisualEditor";

/**
 * Admin interface for managing decision trees
 * Includes DSL editor with validation
 */
export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { data: trees, isLoading, refetch } = trpc.decisionTrees.listAll.useQuery(undefined, {
    enabled: !!user,
  });

  const [editingTree, setEditingTree] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dslContent: "",
    isPublished: false,
  });

  const createMutation = trpc.decisionTrees.create.useMutation({
    onSuccess: () => {
      toast.success("Decision tree created successfully");
      setIsCreating(false);
      setFormData({ name: "", description: "", dslContent: "", isPublished: false });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const updateMutation = trpc.decisionTrees.update.useMutation({
    onSuccess: () => {
      toast.success("Decision tree updated successfully");
      setEditingTree(null);
      setFormData({ name: "", description: "", dslContent: "", isPublished: false });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const deleteMutation = trpc.decisionTrees.delete.useMutation({
    onSuccess: () => {
      toast.success("Decision tree deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const { data: validation } = trpc.decisionTrees.validate.useQuery(
    { dslContent: formData.dslContent },
    { enabled: formData.dslContent.length > 0 }
  );

  const handleEdit = (tree: any) => {
    setEditingTree(tree.id);
    setFormData({
      name: tree.name,
      description: tree.description || "",
      dslContent: tree.dslContent,
      isPublished: tree.isPublished === 1,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTree(null);
    setFormData({ name: "", description: "", dslContent: "", isPublished: false });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTree(null);
    setFormData({ name: "", description: "", dslContent: "", isPublished: false });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dslContent) {
      toast.error("Name and DSL content are required");
      return;
    }

    if (validation && !validation.valid) {
      toast.error("Please fix DSL errors before saving");
      return;
    }

    if (editingTree) {
      updateMutation.mutate({
        id: editingTree,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this decision tree?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleTogglePublish = (tree: any) => {
    updateMutation.mutate({
      id: tree.id,
      isPublished: tree.isPublished === 1 ? false : true,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">Manage decision trees</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                View Site
              </Button>
              {!isCreating && !editingTree && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Tree
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Editor form */}
        {(isCreating || editingTree) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingTree ? "Edit Decision Tree" : "Create New Decision Tree"}</CardTitle>
              <CardDescription>Define your service decision tree using YAML DSL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hair Cuts Decision Tree"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this decision tree"
                />
              </div>

              <Tabs defaultValue="yaml" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="yaml">YAML Editor</TabsTrigger>
                  <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                </TabsList>

                <TabsContent value="yaml" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="dsl">DSL Content</Label>
                    <Textarea
                      id="dsl"
                      value={formData.dslContent}
                      onChange={(e) => setFormData({ ...formData, dslContent: e.target.value })}
                      placeholder="name: My Decision Tree&#10;root: start&#10;&#10;nodes:&#10;  start:&#10;    question: 'What service?'&#10;    options:&#10;      - label: 'Option 1'&#10;        price: 50&#10;        next: end&#10;  end:&#10;    type: terminal"
                      className="font-mono text-sm min-h-[400px]"
                    />
                    {validation && (
                      <div className={`mt-2 flex items-start gap-2 text-sm ${validation.valid ? "text-green-600" : "text-destructive"}`}>
                        {validation.valid ? (
                          <>
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>DSL is valid</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium mb-1">Validation errors:</div>
                              <ul className="list-disc list-inside space-y-1">
                                {validation.errors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="visual" className="mt-4">
                  <VisualEditor
                    yamlContent={formData.dslContent}
                    onYAMLChange={(yaml) => setFormData({ ...formData, dslContent: yaml })}
                  />
                </TabsContent>

                <TabsContent value="ai" className="mt-4">
                  <div className="h-[500px]">
                    <AIChat
                      onYAMLGenerated={(yaml) => {
                        setFormData({ ...formData, dslContent: yaml });
                        toast.success("YAML generated! Check the YAML Editor tab.");
                      }}
                      treeId={editingTree || undefined}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
                <Label htmlFor="published">Published (visible to clients)</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTree ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tree list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Decision Trees</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : trees && trees.length > 0 ? (
            <div className="grid gap-4">
              {trees.map((tree) => (
                <Card key={tree.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{tree.name}</h3>
                          {tree.isPublished === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-primary text-primary-foreground">
                              <Eye className="w-3 h-3" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </span>
                          )}
                          {tree.isPreset === 1 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
                              Preset
                            </span>
                          )}
                        </div>
                        {tree.description && (
                          <p className="text-sm text-muted-foreground">{tree.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleTogglePublish(tree)}
                          disabled={updateMutation.isPending}
                        >
                          {tree.isPublished === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(tree)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {tree.isPreset !== 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(tree.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No decision trees yet</p>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tree
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
