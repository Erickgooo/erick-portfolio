import { pages, profile, siteUrl } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/posts";
import { RateLimiter, getClientIp } from "@/utils/rateLimit";
import { ImageResponse } from "next/og";
import { EM_MARK_DATA_URI } from "./mark";

export const runtime = "nodejs";

const TITLE_MAX_CHARS = 120;

// Image rendering is expensive; cap it at 30 images per minute per IP.
const ogLimiter = new RateLimiter(30, 60 * 1000);

const normalizeTitle = (value: string) => value.replace(/\s+/g, " ").trim();

/**
 * Titles this route will render: the site's own page and post titles.
 *
 * Without this the endpoint draws ANY text next to the owner's name and photo
 * and serves it from the site's domain — a ready-made card for putting words
 * in their mouth. Unknown titles fall back to the home title instead of
 * failing, so a mangled share link still gets a valid image.
 */
let allowedTitles: Set<string> | null = null;

function getAllowedTitles(): Set<string> {
  if (allowedTitles) return allowedTitles;

  // The MDX files reach the serverless function through
  // `outputFileTracingIncludes` in next.config.mjs. If they are ever missing,
  // getPosts() calls notFound(); an image route must not turn into a 404 over
  // that, so post titles are skipped and the page titles still work.
  let postTitles: string[] = [];
  try {
    postTitles = (["blog", "work"] as const).flatMap((section) =>
      getPosts(["src", "app", section, section === "blog" ? "posts" : "projects"])
        .filter((post) => !isProtectedPath(`/${section}/${post.slug}`))
        .map((post) => post.metadata.title),
    );
  } catch {
    console.error("[og] could not read post titles; falling back to page titles only");
  }

  allowedTitles = new Set(
    [
      pages.home.title,
      pages.about.title,
      pages.blog.title,
      pages.work.title,
      pages.gallery.title,
      ...postTitles,
    ]
      .filter((title): title is string => typeof title === "string" && title.length > 0)
      .map(normalizeTitle),
  );
  return allowedTitles;
}

// The card drawn for a shared link, 1280 x 720: the page's title, Erick's
// monogram in the corner, and his portrait, name and role underneath, white
// on the darkest brand ink.
const CARD = { width: 1280, height: 720 };

function Card({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 96,
        background: "#0B0B0F",
        color: "#ffffff",
      }}
    >
      <img
        src={EM_MARK_DATA_URI}
        alt=""
        width={96}
        height={96}
        style={{ position: "absolute", top: 80, right: 80 }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 64 }}>
        <span
          style={{
            padding: 16,
            fontSize: 96,
            lineHeight: "128px",
            letterSpacing: "-0.05em",
            textWrap: "balance",
            overflow: "hidden",
          }}
        >
          {title}
        </span>
        <Byline />
      </div>
    </div>
  );
}

function Byline() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
      <img
        src={siteUrl + profile.avatar}
        alt={profile.name}
        width={192}
        height={192}
        style={{ objectFit: "cover", borderRadius: "50%" }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 72, lineHeight: "72px", textWrap: "balance" }}>
          {profile.name}
        </span>
        <span style={{ fontSize: 40, lineHeight: "40px", textWrap: "balance", opacity: 0.6 }}>
          {profile.role}
        </span>
      </div>
    </div>
  );
}

// Geist Regular, fetched from Google Fonts once per server instance (a failed
// fetch is retried on the next request). Without a browser user agent, the
// stylesheet points at a TrueType file, which the renderer can read.
let geist: Promise<ArrayBuffer> | null = null;

function loadGeist(): Promise<ArrayBuffer> {
  geist ??= (async () => {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Geist:wght@400")
    ).text();
    const file = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!file) throw new Error("[og] no Geist font file in the Google Fonts stylesheet");
    const response = await fetch(file);
    if (!response.ok) throw new Error(`[og] Geist font answered ${response.status}`);
    return response.arrayBuffer();
  })().catch((error) => {
    geist = null;
    throw error;
  });
  return geist;
}

export async function GET(request: Request) {
  const rate = ogLimiter.consume(getClientIp(request));

  if (!rate.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  const url = new URL(request.url);
  const requested = normalizeTitle((url.searchParams.get("title") || "").slice(0, TITLE_MAX_CHARS));
  const title = getAllowedTitles().has(requested) ? requested : normalizeTitle(pages.home.title);

  return new ImageResponse(<Card title={title} />, {
    ...CARD,
    fonts: [{ name: "Geist", data: await loadGeist(), style: "normal", weight: 400 }],
  });
}
