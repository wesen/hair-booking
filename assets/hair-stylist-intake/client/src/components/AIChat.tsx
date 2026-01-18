import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Image as ImageIcon, X } from "lucide-react";
import { Streamdown } from "streamdown";
import { storagePut } from "@/lib/storage";

interface Message {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

interface AIChatProps {
  onYAMLGenerated?: (yaml: string) => void;
  treeId?: number;
}

export function AIChat({ onYAMLGenerated, treeId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file: File }>>([]);
  const [tokenCount, setTokenCount] = useState<{ prompt: number; completion: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content as string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>,
        },
      ]);
      if (data.usage) {
        setTokenCount({
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        });
      }

      // Extract YAML from code blocks
      if (typeof data.content === "string") {
        const yamlMatch = data.content.match(/```yaml\n([\s\S]*?)\n```/);
        if (yamlMatch && onYAMLGenerated) {
          onYAMLGenerated(yamlMatch[1]);
        }
      }
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Upload to S3
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const result = await storagePut(`chat-images/${Date.now()}-${file.name}`, uint8Array, file.type);
      
      setUploadedImages((prev) => [...prev, { url: result.url, file }]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedImages.length === 0) return;

    // Build message content
    let content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
    
    if (uploadedImages.length > 0) {
      const contentArray: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [];
      if (input.trim()) {
        contentArray.push({ type: "text", text: input });
      }
      uploadedImages.forEach((img) => {
        contentArray.push({ type: "image_url", image_url: { url: img.url } });
      });
      content = contentArray;
    } else {
      content = input;
    }

    const userMessage: Message = {
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImages([]);

    await chatMutation.mutateAsync({
      messages: [...messages, userMessage],
      treeId,
    });
  };

  const renderMessageContent = (content: Message["content"]) => {
    if (typeof content === "string") {
      return <Streamdown>{content}</Streamdown>;
    }

    return (
      <div className="space-y-2">
        {content.map((item, idx) => {
          if (item.type === "text") {
            return <Streamdown key={idx}>{item.text}</Streamdown>;
          } else {
            return (
              <img
                key={idx}
                src={item.image_url.url}
                alt="Uploaded"
                className="max-w-full rounded-lg border"
              />
            );
          }
        })}
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        {tokenCount && (
          <p className="text-xs text-muted-foreground">
            Tokens: {tokenCount.prompt} prompt + {tokenCount.completion} completion = {tokenCount.total} total
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p className="mb-2">Ask me to help you create or modify a decision tree.</p>
                <p className="text-sm">You can upload images of handwritten notes or sketches!</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img.file)}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={chatMutation.isPending}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to create or modify a decision tree..."
              className="flex-1 min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={chatMutation.isPending || (!input.trim() && uploadedImages.length === 0)}
              size="icon"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
