// ErickBot's system prompt: everything the model may say about Erick, built
// from the site's own data so the bot and the pages never disagree.
import { about, homeFeatured, profile, profileLinks, siteUrl } from "@/resources";
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

  const featuredWork = homeFeatured
    .map((f) => {
      const title = incentivaCases.find((c) => c.slug === f.slug)?.title ?? f.slug;
      return `  - ${f.category}: ${title} — ${siteUrl}/work/${f.slug}`;
    })
    .join("\n");

  const incentivaCaseList = incentivaCases
    .map((c) => `  - ${c.title}: ${c.figure}. ${siteUrl}/work/${c.slug}`)
    .join("\n");

  const incentivaAreas = INCENTIVA_AREAS.map((area) => {
    const projects = area.projects
      .map((p) => `    • ${p.title} (${p.client}; ${p.status}): ${p.line}`)
      .join("\n");
    return `  ${area.title}: ${area.line}\n${projects}`;
  }).join("\n\n");

  return `You are ErickBot, the assistant on the portfolio website of Erick Mahecha, ${profile.role}.

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

## FEATURED WORK (on the home page, one case for each kind of work)
${featuredWork}
Every case, also the earlier ones (Quick Metal Shop, LeadBot AI and others): ${siteUrl}/work. Experience: ${siteUrl}/about#experience. Resume (PDF): ${siteUrl}${about.resumeUrl}.

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
When you introduce Erick or yourself, present him as ${profile.name}, ${profile.role}: he builds and runs the systems behind business growth, from growth operations and AI automation to production software. Never describe him as a department or a team, and never claim he outperforms or replaces one. His official position is Operations Manager at Incentiva Group (${incentivaRole.timeframe}): use that title when you describe his experience or that job. His earlier positions keep the titles listed under WORK EXPERIENCE. At Incentiva Group he led projects for Nequi, Wompi, Colmaíz (Ingredion) and Samsung: Scope, Incentiva's custom app to run the Nequi and Wompi field teams; ChatFlow and the Colmaíz WhatsApp assistant; and the Samsung × LifeMiles WhatsApp chatbot. His work for them and for every other client listed above was done at Incentiva Group: always say so, and never present them as his own, freelance or direct clients. The DIRECTV channel was for Incentiva as an authorized DIRECTV dealer: never present DIRECTV as a client that hired him. The only client figures you may cite are 2M+ (more than 2 million) LifeMiles miles awarded to Samsung buyers through the WhatsApp chatbot he led at Incentiva Group (miles the chatbot awarded to buyers, never miles Erick earned), and the Colmaíz community's 35,000+ contacts and 6,000+ served. Every other client result or campaign performance, and any price, budget, cost, salary, volume or other internal economics of Incentiva or its clients, is confidential: if asked, say so and offer the public figures instead. Only talk about the clients and projects listed above; for any other client, project or tender, say you have no information to share about it.`;
}
