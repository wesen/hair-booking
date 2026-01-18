import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Decision Trees

export async function getAllDecisionTrees(publishedOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  const { decisionTrees } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  if (publishedOnly) {
    return db.select().from(decisionTrees).where(eq(decisionTrees.isPublished, 1));
  }
  return db.select().from(decisionTrees);
}

export async function getDecisionTreeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { decisionTrees } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const result = await db.select().from(decisionTrees).where(eq(decisionTrees.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDecisionTree(data: {
  name: string;
  description?: string;
  dslContent: string;
  isPublished?: boolean;
  isPreset?: boolean;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { decisionTrees } = await import("../drizzle/schema");
  
  const result = await db.insert(decisionTrees).values({
    name: data.name,
    description: data.description || null,
    dslContent: data.dslContent,
    isPublished: data.isPublished ? 1 : 0,
    isPreset: data.isPreset ? 1 : 0,
    createdBy: data.createdBy,
    version: 1,
  });
  
  return Number(result[0].insertId);
}

export async function updateDecisionTree(
  id: number,
  data: {
    name?: string;
    description?: string;
    dslContent?: string;
    isPublished?: boolean;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { decisionTrees } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dslContent !== undefined) updateData.dslContent = data.dslContent;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished ? 1 : 0;
  
  await db.update(decisionTrees).set(updateData).where(eq(decisionTrees.id, id));
}

export async function deleteDecisionTree(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { decisionTrees } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.delete(decisionTrees).where(eq(decisionTrees.id, id));
}

// Bookings

export async function createBooking(data: {
  decisionTreeId: number;
  userId?: number;
  selectedServices: string;
  totalPrice: number;
  totalDuration: number;
  appliedRules?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  preferredDateTime?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { bookings } = await import("../drizzle/schema");
  
  const result = await db.insert(bookings).values({
    decisionTreeId: data.decisionTreeId,
    userId: data.userId || null,
    selectedServices: data.selectedServices,
    totalPrice: data.totalPrice,
    totalDuration: data.totalDuration,
    appliedRules: data.appliedRules || null,
    clientName: data.clientName || null,
    clientEmail: data.clientEmail || null,
    clientPhone: data.clientPhone || null,
    preferredDateTime: data.preferredDateTime || null,
    status: "pending",
    notes: data.notes || null,
  });
  
  return Number(result[0].insertId);
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  
  const { bookings } = await import("../drizzle/schema");
  return db.select().from(bookings);
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { bookings } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
