import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Decision Trees
  decisionTrees: router({
    list: publicProcedure.query(async () => {
      const { getAllDecisionTrees } = await import("./db");
      return getAllDecisionTrees(true); // Only published trees for public
    }),
    
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const { getAllDecisionTrees } = await import("./db");
      return getAllDecisionTrees(false); // All trees for authenticated users
    }),
    
    getById: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input: expected { id: number }");
      })
      .query(async ({ input }) => {
        const { getDecisionTreeById } = await import("./db");
        return getDecisionTreeById(input.id);
      }),
    
    create: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "name" in val &&
          typeof val.name === "string" &&
          "dslContent" in val &&
          typeof val.dslContent === "string"
        ) {
          return val as { name: string; description?: string; dslContent: string; isPublished?: boolean };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createDecisionTree } = await import("./db");
        const { parseDSL } = await import("./dsl-parser");
        
        // Validate DSL before saving
        parseDSL(input.dslContent);
        
        const id = await createDecisionTree({
          name: input.name,
          description: input.description,
          dslContent: input.dslContent,
          isPublished: input.isPublished || false,
          isPreset: false,
          createdBy: ctx.user!.id,
        });
        
        return { id };
      }),
    
    update: protectedProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "id" in val &&
          typeof val.id === "number"
        ) {
          return val as { id: number; name?: string; description?: string; dslContent?: string; isPublished?: boolean };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { updateDecisionTree } = await import("./db");
        const { parseDSL } = await import("./dsl-parser");
        
        // Validate DSL if provided
        if (input.dslContent) {
          parseDSL(input.dslContent);
        }
        
        await updateDecisionTree(input.id, {
          name: input.name,
          description: input.description,
          dslContent: input.dslContent,
          isPublished: input.isPublished,
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input }) => {
        const { deleteDecisionTree } = await import("./db");
        await deleteDecisionTree(input.id);
        return { success: true };
      }),
    
    validate: publicProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "dslContent" in val && typeof val.dslContent === "string") {
          return val as { dslContent: string };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { validateDSL } = await import("./dsl-parser");
        return validateDSL(input.dslContent);
      }),
  }),
  
  // Bookings
  bookings: router({
    create: publicProcedure
      .input((val: unknown) => {
        if (
          typeof val === "object" &&
          val !== null &&
          "decisionTreeId" in val &&
          typeof val.decisionTreeId === "number" &&
          "selectedServices" in val &&
          typeof val.selectedServices === "string" &&
          "totalPrice" in val &&
          typeof val.totalPrice === "number" &&
          "totalDuration" in val &&
          typeof val.totalDuration === "number"
        ) {
          return val as {
            decisionTreeId: number;
            selectedServices: string;
            totalPrice: number;
            totalDuration: number;
            appliedRules?: string;
            clientName?: string;
            clientEmail?: string;
            clientPhone?: string;
            preferredDateTime?: string;
            notes?: string;
          };
        }
        throw new Error("Invalid input");
      })
      .mutation(async ({ input, ctx }) => {
        const { createBooking } = await import("./db");
        
        const id = await createBooking({
          decisionTreeId: input.decisionTreeId,
          userId: ctx.user?.id,
          selectedServices: input.selectedServices,
          totalPrice: input.totalPrice,
          totalDuration: input.totalDuration,
          appliedRules: input.appliedRules,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          preferredDateTime: input.preferredDateTime ? new Date(input.preferredDateTime) : undefined,
          notes: input.notes,
        });
        
        return { id };
      }),
    
    list: protectedProcedure.query(async () => {
      const { getAllBookings } = await import("./db");
      return getAllBookings();
    }),
    
    getById: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === "object" && val !== null && "id" in val && typeof val.id === "number") {
          return val as { id: number };
        }
        throw new Error("Invalid input");
      })
      .query(async ({ input }) => {
        const { getBookingById } = await import("./db");
        return getBookingById(input.id);
      }),
  }),
  
  // AI Assistant
  ai: router({
    chat: protectedProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.union([
                z.string(),
                z.array(
                  z.union([
                    z.object({ type: z.literal("text"), text: z.string() }),
                    z.object({
                      type: z.literal("image_url"),
                      image_url: z.object({
                        url: z.string(),
                        detail: z.enum(["auto", "low", "high"]).optional(),
                      }),
                    }),
                  ])
                ),
              ]),
            })
          ),
          treeId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const systemPrompt = `You are an expert hair salon service designer. Help the user create or modify decision tree configurations for salon service intake flows.

The decision tree uses YAML format with this structure:
- name: Tree name
- root: Starting node ID
- nodes: Object with node definitions
  - Each node has: question, options array
  - Options have: label, price (in cents), duration, next (node ID)
  - Options can have price_with_cut for combo pricing
  - Terminal nodes have: type: terminal, action: book_appointment
- rules: Array of pricing rules

When the user provides images (like handwritten notes or sketches), analyze them to extract:
- Service names and categories
- Prices (convert to cents by multiplying by 100)
- Duration estimates
- Service flow and dependencies

Provide complete, valid YAML that can be directly used. Always include prices in cents (e.g., $55 = 5500).

When generating YAML:
1. Start with a clear name and root node
2. Create logical service flow with appropriate next nodes
3. Always convert dollar prices to cents (multiply by 100)
4. Include duration in format like "45min", "1hr", "1hr 30min"
5. For combo pricing, use price_with_cut field
6. End with a terminal node
7. Wrap YAML in \`\`\`yaml code blocks`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages,
        ];

        const response = await invokeLLM({ messages });
        
        return {
          content: response.choices[0]?.message?.content || "No response",
          usage: response.usage,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
