import { Closing } from "@/components/workbench/Closing";
import { RevealObserver } from "@/components/workbench/RevealObserver";
import { BlogIndex } from "@/components/workbench/blog/BlogIndex";
import { baseURL, blog, person } from "@/resources";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { Meta, Schema } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

// The blog, in Workbench: the posts as printed sheets stacked on the bench. A
// public page leaves out password-protected posts.
export default function Blog() {
  return (
    <>
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/blog`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <BlogIndex hideProtected={!isProtectedPath(blog.path)} />
      <Closing />
      <RevealObserver />
    </>
  );
}
