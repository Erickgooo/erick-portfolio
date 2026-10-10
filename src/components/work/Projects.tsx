import { ProjectCard } from "@/components";
import { isProtectedPath } from "@/resources/protectedRoutes";
import { getPosts } from "@/utils/utils";
import { Column } from "@once-ui-system/core";

interface ProjectsProps {
  range?: [number, number?];
  exclude?: string[];
  /** Set on public pages: leaves out projects whose own page is password-protected. */
  hideProtected?: boolean;
}

export function Projects({ range, exclude, hideProtected = false }: ProjectsProps) {
  let allProjects = getPosts(["src", "app", "work", "projects"]);

  if (hideProtected) {
    allProjects = allProjects.filter((post) => !isProtectedPath(`/work/${post.slug}`));
  }

  // Exclude by slug (exact match)
  if (exclude && exclude.length > 0) {
    allProjects = allProjects.filter((post) => !exclude.includes(post.slug));
  }

  const sortedProjects = allProjects.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedProjects = range
    ? sortedProjects.slice(range[0] - 1, range[1] ?? sortedProjects.length)
    : sortedProjects;

  return (
    <Column fillWidth gap="xl" marginBottom="40" paddingX="l">
      {displayedProjects.map((post, index) => (
        <ProjectCard
          priority={index < 2}
          key={post.slug}
          href={`/work/${post.slug}`}
          images={post.metadata.images}
          title={post.metadata.title}
          description={post.metadata.summary}
          // A flag, not the body: the card only needs to know whether there is a
          // case study to link to.
          hasContent={post.content.trim().length > 0}
          avatars={post.metadata.team?.map((member) => ({ src: member.avatar })) || []}
          link={post.metadata.link || ""}
          metric={post.metadata.metric || ""}
        />
      ))}
    </Column>
  );
}
