import { baseURL, routes as routesConfig } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";

export default async function sitemap() {
  const blogs = getPosts(["src", "app", "blog", "posts"]).map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const works = getPosts(["src", "app", "work", "projects"]).map((post) => ({
    path: `/work/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    path: route,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  // Password-protected routes are never advertised: a slug is content too.
  return [...routes, ...blogs, ...works]
    .filter((entry) => !isProtectedPath(entry.path))
    .map((entry) => ({
      url: `${baseURL}${entry.path !== "/" ? entry.path : ""}`,
      lastModified: entry.lastModified,
    }));
}
