import { about, baseURL, blog, gallery, home, person, work } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { RateLimiter, getClientIp } from "@/utils/rateLimit";
import { getPosts } from "@/utils/utils";
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
    [home.title, about.title, blog.title, work.title, gallery.title, ...postTitles]
      .filter((title): title is string => typeof title === "string" && title.length > 0)
      .map(normalizeTitle),
  );
  return allowedTitles;
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
  const title = getAllowedTitles().has(requested) ? requested : normalizeTitle(home.title);

  async function loadGoogleFont(font: string) {
    const url = `https://fonts.googleapis.com/css2?family=${font}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error("failed to load font data");
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "6rem",
        background: "#0B0B0F",
      }}
    >
      <img
        src={EM_MARK_DATA_URI}
        alt=""
        style={{
          position: "absolute",
          top: "5rem",
          right: "5rem",
          width: "6rem",
          height: "6rem",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "4rem",
          fontStyle: "normal",
          color: "white",
        }}
      >
        <span
          style={{
            padding: "1rem",
            fontSize: "6rem",
            lineHeight: "8rem",
            letterSpacing: "-0.05em",
            whiteSpace: "wrap",
            textWrap: "balance",
            overflow: "hidden",
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5rem",
          }}
        >
          <img
            src={baseURL + person.avatar}
            alt={person.name}
            style={{
              width: "12rem",
              height: "12rem",
              objectFit: "cover",
              borderRadius: "100%",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "4.5rem",
                lineHeight: "4.5rem",
                whiteSpace: "pre-wrap",
                textWrap: "balance",
              }}
            >
              {person.name}
            </span>
            <span
              style={{
                fontSize: "2.5rem",
                lineHeight: "2.5rem",
                whiteSpace: "pre-wrap",
                textWrap: "balance",
                opacity: "0.6",
              }}
            >
              {person.role}
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1280,
      height: 720,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont("Geist:wght@400"),
          style: "normal",
        },
      ],
    },
  );
}
