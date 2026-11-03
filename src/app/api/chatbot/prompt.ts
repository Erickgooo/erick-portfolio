// ErickBot's system prompt: everything the model may say about Erick, built
// from the site's own data so the bot and the pages never disagree.
import { about, homeCopy, profile, profileLinks, siteUrl } from "@/resources";
import { INCENTIVA_AREAS, incentivaCases, incentivaRole } from "@/resources/incentiva";

// ── helpers ─────────────────────────────────────────────────────────────────

/** Strip JSX / React elements so we get plain text for the system prompt */
function jsxToText(value: unknown, depth = 0): string {
  if (depth > 8) return "";
  if (value === null || value === undefined || typeof value === "boolean") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((v) => jsxToText(v, depth)).join(" ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // React element
    if (obj.props) {
      const children = obj.props as { children?: unknown };
      return jsxToText(children.children, depth + 1);
    }
    // Plain object — stringify values
    return Object.values(obj)
      .map((v) => jsxToText(v, depth + 1))
      .join(" ");
  }
  return "";
}

export function buildSystemPrompt(): string {
  const contactLinks = profileLinks.map((s) => `- ${s.name}: ${s.href}`).join("\n");

  const experiences = about.experience.jobs
    .map((exp) => {
      const achievements = exp.achievements.map((a) => `  • ${jsxToText(a)}`).join("\n");
      return `  ${exp.company} | ${exp.role} | ${exp.timeframe}\n  ${jsxToText(exp.description)}\n${achievements}`;
    })
    .join("\n\n");

  const institutions = about.education.schools
    .map((i) => `  - ${i.name}: ${jsxToText(i.description)}`)
    .join("\n");

  const certifications = about.certifications.items
    .map((c) => `  - ${c.name} (${c.institution})`)
    .join("\n");

  const skills = about.skills.groups
    .map((s) => `  ${s.title}: ${jsxToText(s.description)}`)
    .join("\n");

  const { featured } = homeCopy;
  const featuredProject = `${featured.title} ${featured.label} — ${featured.href}`;

  const incentivaCaseList = incentivaCases
    .map((c) => `  - ${c.title}: ${c.figure}. ${siteUrl}/work/${c.slug}`)
    .join("\n");

  const incentivaAreas = INCENTIVA_AREAS.map((area) => {
    const projects = area.projects
      .map((p) => `    • ${p.title} (${p.client}; ${p.status}): ${p.line}`)
      .join("\n");
    return `  ${area.title}: ${area.line}\n${projects}`;
  }).join("\n\n");

  return `You are ErickBot, an assistant on Erick Mahecha's portfolio website.

## ABOUT ERICK
Name: ${profile.name}
Role: ${profile.role}
Location: ${profile.location}
Email: ${profile.email}
Languages: ${profile.languages
  ?.map((l) => (profile.languageLevels?.[l] ? `${l} (${profile.languageLevels[l]})` : l))
  .join(", ")}

## BIO
${jsxToText(about.intro)}

## WORK EXPERIENCE
${experiences}

## EDUCATION
${institutions}

## CERTIFICATIONS
${certifications}

## TECHNICAL SKILLS
${skills}

## FEATURED PROJECT
${featuredProject}

## CURRENT ROLE: ${incentivaRole.title.toUpperCase()}, ${incentivaRole.company.toUpperCase()} (${incentivaRole.timeframe})
${incentivaRole.summary}
${incentivaRole.method}

Case studies:
${incentivaCaseList}

Every project of the role, by area (index: ${siteUrl}/work/incentiva-group):
${incentivaAreas}

## CONTACT LINKS
${contactLinks}

## RULES
You can ONLY answer questions about Erick, his professional experience, skills, and projects, using EXCLUSIVELY the information provided above. If a question is unrelated to Erick or his portfolio, or if the answer is not in the context, politely say you do not have that information and suggest reaching out to Erick directly via email or LinkedIn. Never invent dates, achievements, or details not explicitly present in the context. Keep responses professional but approachable, and under 4 sentences.
Erick's current title is Operations Manager at Incentiva Group. Clients' results and campaign performance, prices, budgets, costs, salaries, volumes and any other internal economics of Incentiva or its clients are confidential: if asked, say they are confidential and offer the public figures above instead. Only talk about the clients, projects and proposals listed above; for any other client, tender or proposal, say you have no information to share about it.`;
}
