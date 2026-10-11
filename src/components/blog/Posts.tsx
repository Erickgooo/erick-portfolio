import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import { Grid } from "@once-ui-system/core";
import Post from "./Post";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
  /** Set on public pages: leaves out posts whose own page is password-protected. */
  hideProtected?: boolean;
  /** Set on the list that opens a page: its first picture is the largest thing on the first screen. */
  priority?: boolean;
}

/**
 * The posts a list shows, newest first. The pages ask it too, so that a heading
 * is only drawn over a list with something in it.
 */
export function listedPosts({
  range,
  exclude = [],
  hideProtected = false,
}: Pick<PostsProps, "range" | "exclude" | "hideProtected">) {
  let allBlogs = getPosts(["src", "app", "blog", "posts"]);

  if (hideProtected) {
    allBlogs = allBlogs.filter((post) => !isProtectedPath(`/blog/${post.slug}`));
  }

  // Exclude by slug (exact match)
  if (exclude.length) {
    allBlogs = allBlogs.filter((post) => !exclude.includes(post.slug));
  }

  const sortedBlogs = allBlogs.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  return range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;
}

export function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
  hideProtected = false,
  priority = false,
}: PostsProps) {
  const displayedBlogs = listedPosts({ range, exclude, hideProtected });

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid columns={columns} s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
          {displayedBlogs.map((post, index) => (
            // Only slug and metadata: Post is a client component, so the MDX body
            // would otherwise be serialized into every page that lists the post.
            <Post
              key={post.slug}
              post={{ slug: post.slug, metadata: post.metadata }}
              thumbnail={thumbnail}
              direction={direction}
              priority={priority && index === 0}
            />
          ))}
        </Grid>
      )}
    </>
  );
}
