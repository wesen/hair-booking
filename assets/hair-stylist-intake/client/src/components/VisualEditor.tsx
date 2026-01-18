import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import yaml from "js-yaml";

interface DecisionTreeNode {
  question?: string;
  options?: Array<{
    label: string;
    price?: number;
    price_with_cut?: number;
    duration?: string;
    next?: string;
    note?: string;
  }>;
  type?: string;
  action?: string;
  optional?: boolean;
}

interface DecisionTree {
  name: string;
  root: string;
  nodes: Record<string, DecisionTreeNode>;
  rules?: Array<Record<string, unknown>>;
}

interface VisualEditorProps {
  yamlContent: string;
  onYAMLChange: (yaml: string) => void;
}

export function VisualEditor({ yamlContent, onYAMLChange }: VisualEditorProps) {
  const [tree, setTree] = useState<DecisionTree | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!yamlContent.trim()) {
      setTree(null);
      setParseError(null);
      return;
    }

    try {
      const parsed = yaml.load(yamlContent) as DecisionTree;
      setTree(parsed);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse YAML");
      setTree(null);
    }
  }, [yamlContent]);

  const syncToYAML = (updatedTree: DecisionTree) => {
    try {
      const newYAML = yaml.dump(updatedTree, { indent: 2, lineWidth: -1 });
      onYAMLChange(newYAML);
      toast.success("Changes synced to YAML");
    } catch (error) {
      toast.error("Failed to sync changes");
    }
  };

  const updateTreeName = (name: string) => {
    if (!tree) return;
    const updated = { ...tree, name };
    setTree(updated);
    syncToYAML(updated);
  };

  const updateNodeQuestion = (nodeId: string, question: string) => {
    if (!tree) return;
    const updated = {
      ...tree,
      nodes: {
        ...tree.nodes,
        [nodeId]: {
          ...tree.nodes[nodeId],
          question,
        },
      },
    };
    setTree(updated);
    syncToYAML(updated);
  };

  const updateOption = (
    nodeId: string,
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    if (!tree || !tree.nodes[nodeId]?.options) return;

    const options = [...tree.nodes[nodeId].options!];
    options[optionIndex] = {
      ...options[optionIndex],
      [field]: value,
    };

    const updated = {
      ...tree,
      nodes: {
        ...tree.nodes,
        [nodeId]: {
          ...tree.nodes[nodeId],
          options,
        },
      },
    };
    setTree(updated);
    syncToYAML(updated);
  };

  const addOption = (nodeId: string) => {
    if (!tree || !tree.nodes[nodeId]) return;

    const options = tree.nodes[nodeId].options || [];
    const newOption = {
      label: "New Option",
      price: 0,
      duration: "30min",
      next: "end",
    };

    const updated = {
      ...tree,
      nodes: {
        ...tree.nodes,
        [nodeId]: {
          ...tree.nodes[nodeId],
          options: [...options, newOption],
        },
      },
    };
    setTree(updated);
    syncToYAML(updated);
  };

  const removeOption = (nodeId: string, optionIndex: number) => {
    if (!tree || !tree.nodes[nodeId]?.options) return;

    const options = tree.nodes[nodeId].options!.filter((_, i) => i !== optionIndex);

    const updated = {
      ...tree,
      nodes: {
        ...tree.nodes,
        [nodeId]: {
          ...tree.nodes[nodeId],
          options,
        },
      },
    };
    setTree(updated);
    syncToYAML(updated);
  };

  const addNode = () => {
    if (!tree) return;

    const newNodeId = `node_${Date.now()}`;
    const updated = {
      ...tree,
      nodes: {
        ...tree.nodes,
        [newNodeId]: {
          question: "New Question",
          options: [
            {
              label: "Option 1",
              price: 0,
              duration: "30min",
              next: "end",
            },
          ],
        },
      },
    };
    setTree(updated);
    syncToYAML(updated);
  };

  const removeNode = (nodeId: string) => {
    if (!tree || nodeId === tree.root) {
      toast.error("Cannot delete root node");
      return;
    }

    const { [nodeId]: removed, ...remainingNodes } = tree.nodes;
    const updated = {
      ...tree,
      nodes: remainingNodes,
    };
    setTree(updated);
    syncToYAML(updated);
  };

  if (parseError) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border border-destructive rounded">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Cannot parse YAML</p>
          <p className="text-sm">{parseError}</p>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Enter YAML content in the YAML Editor tab to start editing visually</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tree Name */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Tree Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tree-name">Tree Name</Label>
            <Input
              id="tree-name"
              value={tree.name}
              onChange={(e) => updateTreeName(e.target.value)}
            />
          </div>
          <div>
            <Label>Root Node</Label>
            <Input value={tree.root} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Nodes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Decision Nodes</CardTitle>
            <Button onClick={addNode} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(tree.nodes).map(([nodeId, node]) => (
              <AccordionItem key={nodeId} value={nodeId}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{nodeId}</span>
                    {nodeId === tree.root && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        Root
                      </span>
                    )}
                    {node.type === "terminal" && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        Terminal
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Question */}
                    {node.question && (
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={node.question}
                          onChange={(e) => updateNodeQuestion(nodeId, e.target.value)}
                        />
                      </div>
                    )}

                    {/* Options */}
                    {node.options && node.options.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Options</Label>
                          <Button
                            onClick={() => addOption(nodeId)}
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </Button>
                        </div>

                        {node.options.map((option, optionIndex) => (
                          <Card key={optionIndex}>
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  Option {optionIndex + 1}
                                </span>
                                <Button
                                  onClick={() => removeOption(nodeId, optionIndex)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Label</Label>
                                  <Input
                                    value={option.label}
                                    onChange={(e) =>
                                      updateOption(nodeId, optionIndex, "label", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Next Node</Label>
                                  <Input
                                    value={option.next || ""}
                                    onChange={(e) =>
                                      updateOption(nodeId, optionIndex, "next", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Price (cents)</Label>
                                  <Input
                                    type="number"
                                    value={option.price || 0}
                                    onChange={(e) =>
                                      updateOption(
                                        nodeId,
                                        optionIndex,
                                        "price",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ${((option.price || 0) / 100).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs">Duration</Label>
                                  <Input
                                    value={option.duration || ""}
                                    onChange={(e) =>
                                      updateOption(nodeId, optionIndex, "duration", e.target.value)
                                    }
                                    placeholder="e.g., 30min, 1hr"
                                  />
                                </div>
                                {option.price_with_cut !== undefined && (
                                  <div>
                                    <Label className="text-xs">Price with Cut (cents)</Label>
                                    <Input
                                      type="number"
                                      value={option.price_with_cut}
                                      onChange={(e) =>
                                        updateOption(
                                          nodeId,
                                          optionIndex,
                                          "price_with_cut",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      ${((option.price_with_cut || 0) / 100).toFixed(2)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {option.note && (
                                <div>
                                  <Label className="text-xs">Note</Label>
                                  <Input
                                    value={option.note}
                                    onChange={(e) =>
                                      updateOption(nodeId, optionIndex, "note", e.target.value)
                                    }
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Terminal Node Info */}
                    {node.type === "terminal" && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          This is a terminal node. Action: {node.action || "book_appointment"}
                        </p>
                      </div>
                    )}

                    {/* Delete Node */}
                    {nodeId !== tree.root && (
                      <Button
                        onClick={() => removeNode(nodeId)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete Node
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
