import { APIRequestContext } from "@playwright/test";
import { config } from "../config";

/**
 * Data Fixture — helpers to create / clean up test data via API.
 *
 * TODO: Replace the example entity types and API calls below with your
 *       project's actual data models and endpoints.
 *
 * Principles:
 * - Every test seeds its own data using unique identifiers (runId)
 * - Always read actual slug/id from API response (server may modify)
 * - Cleanup uses catch(() => {}) because entities may not exist
 */

// ── Example Entity Types ────────────────────────────────
// TODO: Replace with your project's entity types

export interface TestItem {
    slug: string;
    title: string;
    content: string;
}

// ── CRUD Helpers ────────────────────────────────────────
// TODO: Replace with your project's API calls

/** Create an item via API. */
export async function createItem(
    api: APIRequestContext,
    data: {
        title: string;
        slug: string;
        content: string;
    },
): Promise<Record<string, unknown>> {
    // TODO: Update endpoint and payload to match your API
    const res = await api.post("/api/items", { data });
    return res.json();
}

/** Delete an item by slug (admin only). */
export async function deleteItem(
    api: APIRequestContext,
    slug: string,
): Promise<void> {
    // TODO: Update endpoint to match your API
    await api.delete(`/api/items/${slug}`);
}

// ── Seed Helpers ────────────────────────────────────────

/**
 * Seed a minimal data set for a test run.
 * TODO: Customize for your project's data model.
 */
export async function seedMinimalDataSet(
    adminApi: APIRequestContext,
    runId: string,
): Promise<{
    itemSlugs: string[];
}> {
    const item1Slug = `item-one-${runId}`;
    const item2Slug = `item-two-${runId}`;

    await createItem(adminApi, {
        title: `Item One ${runId}`,
        slug: item1Slug,
        content: `Content for item one in run ${runId}.`,
    });
    await createItem(adminApi, {
        title: `Item Two ${runId}`,
        slug: item2Slug,
        content: `Content for item two in run ${runId}.`,
    });

    return {
        itemSlugs: [item1Slug, item2Slug],
    };
}

/** Cleanup data created by seedMinimalDataSet. */
export async function cleanupDataSet(
    adminApi: APIRequestContext,
    data: {
        itemSlugs: string[];
    },
): Promise<void> {
    for (const slug of data.itemSlugs) {
        await deleteItem(adminApi, slug).catch(() => { });
    }
}
