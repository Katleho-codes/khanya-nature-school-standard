import type {
    Album,
    Branch,
    BranchDetail,
    Document,
    Event,
    EnquiryResponse,
    HomeData,
    Post,
    Programme,
    ProgrammeSummary,
    SiteSettings,
} from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:4007";

export class ApiError extends Error {
    status: number;
    code: string;
    fields?: Record<string, string>;

    constructor(
        status: number,
        code: string,
        message: string,
        fields?: Record<string, string>,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        cache: "no-store",
        ...init,
    });
    if (!response.ok) {
        let code = "REQUEST_FAILED";
        let message = "The school website could not load that information.";
        let fields: Record<string, string> | undefined;
        try {
            const body = (await response.json()) as {
                error?: {
                    code?: string;
                    message?: string;
                    fields?: Record<string, string>;
                };
            };
            if (body.error?.code) code = body.error.code;
            if (body.error?.message) message = body.error.message;
            if (body.error?.fields) fields = body.error.fields;
        } catch {
            // Keep the default message when the API does not return JSON.
        }
        throw new ApiError(response.status, code, message, fields);
    }
    return (await response.json()) as T;
}

async function requestOrNull<T>(path: string): Promise<T | null> {
    try {
        return await request<T>(path);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export interface NavData {
    settings: SiteSettings | null;
    branches: Branch[];
    programmes: Array<{ id: string; slug: string; name: string }>;
}

export function getNav(): Promise<NavData> {
    return request<NavData>("/api/public/nav");
}

export function getHome(): Promise<HomeData> {
    return request<HomeData>("/api/public/home");
}

export function getBranches(): Promise<{ branches: Branch[] }> {
    return request<{ branches: Branch[] }>("/api/public/branches");
}

export function getBranch(
    slug: string,
): Promise<{ branch: BranchDetail } | null> {
    return requestOrNull<{ branch: BranchDetail }>(
        `/api/public/branches/${encodeURIComponent(slug)}`,
    );
}

export function getProgrammes(): Promise<{ programmes: Programme[] }> {
    return request<{ programmes: Programme[] }>("/api/public/programmes");
}

export function getProgramme(
    slug: string,
): Promise<{ programme: Programme } | null> {
    return requestOrNull<{ programme: Programme }>(
        `/api/public/programmes/${encodeURIComponent(slug)}`,
    );
}

export function getPosts(params: {
    branch?: string;
    category?: string;
    limit?: number;
}): Promise<{ posts: Post[] }> {
    const query = new URLSearchParams();
    if (params.branch) query.set("branch", params.branch);
    if (params.category) query.set("category", params.category);
    if (params.limit) query.set("limit", String(params.limit));
    return request<{ posts: Post[] }>(`/api/public/posts?${query.toString()}`);
}

export function getPost(slug: string): Promise<{ post: Post } | null> {
    return requestOrNull<{ post: Post }>(
        `/api/public/posts/${encodeURIComponent(slug)}`,
    );
}

export function getEvents(params: {
    branch?: string;
    month?: string;
    upcoming?: boolean;
    limit?: number;
}): Promise<{ events: Event[] }> {
    const query = new URLSearchParams();
    if (params.branch) query.set("branch", params.branch);
    if (params.month) query.set("month", params.month);
    if (params.upcoming) query.set("upcoming", "true");
    if (params.limit) query.set("limit", String(params.limit));
    return request<{ events: Event[] }>(
        `/api/public/events?${query.toString()}`,
    );
}

export function getEvent(slug: string): Promise<{ event: Event } | null> {
    return requestOrNull<{ event: Event }>(
        `/api/public/events/${encodeURIComponent(slug)}`,
    );
}

export function getAlbums(): Promise<{ albums: Album[] }> {
    return request<{ albums: Album[] }>("/api/public/albums");
}

export function getAlbum(slug: string): Promise<{ album: Album } | null> {
    return requestOrNull<{ album: Album }>(
        `/api/public/albums/${encodeURIComponent(slug)}`,
    );
}

export function getDocuments(
    branch?: string,
): Promise<{ documents: Document[] }> {
    const query = new URLSearchParams();
    if (branch) query.set("branch", branch);
    return request<{ documents: Document[] }>(
        `/api/public/documents?${query.toString()}`,
    );
}

export async function submitEnquiry(
    payload: Record<string, unknown>,
): Promise<EnquiryResponse> {
    return request<EnquiryResponse>("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export interface SeoOverride {
    title?: string | null;
    description?: string | null;
}

export function seoTitle(
    override: string | null | undefined,
    fallback: string,
): string {
    return override && override.trim().length > 0 ? override : fallback;
}

export function programmeTitle(programme: ProgrammeSummary): string {
    return `${programme.name}, ${programme.ageLabel}`;
}
