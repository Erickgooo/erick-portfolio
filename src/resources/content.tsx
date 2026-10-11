import type { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";
import { Metric } from "./Metric";

const person: Person = {
  firstName: "Erick Santiago",
  lastName: "Mahecha Tafur",
  name: "Erick Mahecha",
  role: "Growth Marketing & AI Automation Specialist",
  avatar: "/images/avatar.jpg",
  email: "santiagomahecha2328@gmail.com",
  location: "Medellín, Colombia",
  timeZone: "America/Bogota",
  languages: ["Spanish", "English"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/Erickgooo",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/erick-mahecha/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/social-preview.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  // Manual §1.3 (precisión sobre exageración): every value statement carries a
  // concrete figure. Mirrors the short bio in §1.4.
  description:
    "I build complete growth systems for founders: AI content pipelines, CRM automation and paid media. ROAS 3.92x · 338K+ organic views at $0 ad spend · $3.45 cost per lead in technical B2B.",
  headline: (
    <>I Build Marketing Infrastructure From Zero. And Make It Outperform Full Departments.</>
  ),
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Quick Metal Shop: Engineering Virality with AI</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/quick-metal-shop-viral-videos",
  },
  subline: (
    <>
      I'm Erick, a one-person growth department. At Quick Metal Shop, I built their marketing
      function from zero and generated 338K+ organic video views with $0 ad spend, using an AI
      production pipeline I designed myself. I architect the full stack: brand identity, paid media,
      SEO automation, CRM, and the software itself when nothing exists yet.
    </>
  ),
  // The three verifiable pillars from Manual §1.1, plus the $0 spend that makes
  // the reach figure meaningful. ROAS and CPL are what a founder buying growth
  // actually evaluates, so they belong above the fold.
  stats: [
    { value: "338K+", label: "organic views" },
    { value: "$0", label: "ad spend" },
    { value: "3.92x", label: "ROAS" },
    { value: "$3.45", label: "cost per lead" },
  ],
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://calendly.com/santiagomahecha2328/30min",
  },
  resume: {
    display: true,
    link: "/resume/Erick_Mahecha_Resume.pdf",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I'm a one-person growth department. I've built complete marketing infrastructures: brand
        identity, paid media, CRM automation, SEO systems, and AI content production, for companies
        across construction, food, and retail. Most recently, I generated <Metric>338K+</Metric>{" "}
        organic video views for Quick Metal Shop with zero ad spend, using an AI production pipeline
        I designed and ran myself.
        <br />
        <br />
        My entry point into marketing wasn't a campaign. It was a crisis line.
        <br />
        <br />I spent two years at Concentrix managing security incidents, fraud cases, and
        technical failures for Mercado Pago users. That environment taught me something most
        marketers never learn firsthand: where systems break down, how users behave under pressure,
        and what it actually costs a business when processes fail at scale. It's an uncomfortable
        place to start. It's also an unusually useful one.
        <br />
        <br />
        That operational foundation pushed me toward a different kind of marketing. Not just running
        campaigns, but redesigning how businesses attract, qualify, and convert customers. I became
        focused on one question: what can be automated, and what's the cost of not automating it?
        <br />
        <br />
        The answer has taken different shapes across different projects. An AI-powered WhatsApp
        chatbot that handled <Metric>85%</Metric> of inbound conversations autonomously for Artesa.
        A full marketing department built from scratch for Quick Metal Shop (brand identity, paid
        media, SEO automation, CRM integration, and a custom-built trade show application deployed
        in <Metric>48</Metric> hours). A complete rebranding and content automation system for
        Dakoma Roofing, delivered as a one-person freelance engagement.
        <br />
        <br />
        What connects all of it is the same approach: start with the operational reality, identify
        where human time is being consumed by work a system could handle, and build the
        infrastructure that removes that friction permanently.
        <br />
        <br />
        Today I work at the intersection of marketing strategy, AI tooling, and systems design. I
        don't run campaigns in isolation. I build the ecosystems that make campaigns compound over
        time: automated content pipelines, real-time lead qualification, full-funnel tracking, and
        creative production workflows that let a one-person operation output at agency scale.
        <br />
        <br />
        The work I find most interesting lives at the edge of what's currently possible with AI,
        which in 2026 is moving faster than most businesses realize.
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Incentiva Group",
        timeframe: "July 2026 - Present",
        role: "Growth & Operations Lead",
        achievements: [
          <>
            Leading retention strategy and conversion funnel optimization through RFM models and CRM
            automation.
          </>,
          <>
            Implementing and managing generative AI solutions and virtual assistants across client
            operations.
          </>,
          <>
            Overseeing Meta Ads campaigns and WhatsApp Business API communications for client
            accounts.
          </>,
          <>
            Monitoring KPIs and managing client accounts to ensure on-time, high-quality delivery.
          </>,
          <>
            Leading and mentoring a <Metric>2-person</Metric> operations team.
          </>,
        ],
        images: [],
      },
      {
        company: "Quick Metal Shop",
        timeframe: "Jan 2026 - July 2026",
        role: "Growth Marketing Specialist",
        description: (
          <>
            Joined as the company's first and sole marketing hire. There was no brand identity, no
            analytics infrastructure, and no digital strategy in place. I built everything from
            scratch and kept it running.
          </>
        ),
        achievements: [
          <>
            Created the company's Brand Manual in the first week, defining the full visual identity
            (color palette, typography, tone of voice) that became the operational standard across
            the entire organization, including the ArquiExpo 2026 trade show stand, recognized as
            one of the strongest presences at the event.
          </>,
          <>
            Deployed and configured Soro AI for automated SEO blog publishing across both the B2B
            site (Odoo CMS) and the B2C Shopify store, including custom code integration into each
            CMS. This established a compounding organic search engine that requires zero ongoing
            manual effort.
          </>,
          <>
            Set up Google Analytics and Google Search Console from scratch, then linked Search
            Console directly to Soro AI to enable keyword-informed automated publishing.
          </>,
          <>
            Launched and managed the company's LinkedIn presence; deployed Holo AI to automate
            brand-aligned thought leadership content at scale.
          </>,
          <>Managed Instagram and Facebook content daily across B2B and B2C narratives.</>,
          <>
            Deployed the Meta Pixel across both storefronts and independently built, configured, and
            launched Meta Ads campaigns, covering everything from creative concept to audience
            targeting and budget management, across separate B2B and B2C campaign structures.
          </>,
          <>
            Built a Zapier-to-Odoo CRM automation to route B2B leads from Meta Instant Forms
            directly into the CRM in real time, eliminating manual data entry and closing a critical
            gap in the lead pipeline.
          </>,
          <>
            Operated a high-velocity AI-augmented creative production workflow using Higgsfield
            (Kling 3.0, Seedance 2.0), ElevenLabs, Claude, CapCut, and DaVinci Resolve.
          </>,
          <>
            Designed, developed, and deployed a custom full-stack interactive gallery web
            application in under <Metric>48</Metric> hours for ArquiExpo 2026. Built with Next.js,
            deployed on Netlify, optimized for a vertical touchscreen interface, and fully
            responsive across all devices including iOS Safari.
          </>,
        ],
        images: [],
      },
      {
        company: "Dakoma Roofing",
        timeframe: "May 2026",
        role: "Growth Marketing Consultant (Freelance)",
        description: (
          <>
            Subcontracted to modernize the digital presence and marketing infrastructure of a
            roofing and construction services company whose brand identity and content operation had
            not kept pace with the quality of service they delivered.
            <br />
            <strong>Stack:</strong> Soro AI · Higgsfield (Kling 3.0 · Nano Banana Pro) · Meta
            Business Suite
          </>
        ),
        achievements: [
          <>
            Executed a full rebranding initiative. I delivered a Brand Manual that redefined the
            color palette, typography system, and logo usage guidelines, then rolled it out across
            the company's website, social media profiles, and advertising assets.
          </>,
          <>
            Integrated Soro AI to establish an autonomous SEO blog pipeline, enabling consistent
            keyword-targeted content publishing with zero ongoing manual effort.
          </>,
          <>
            Developed a suite of high-production video ad creatives using Higgsfield's Kling 3.0 for
            cinematic footage and Nano Banana Pro for AI avatar-driven spokesperson content,
            achieving output quality that matched the elevated brand standard at a one-person cost
            and timeline.
          </>,
        ],
        images: [],
      },
      {
        company: "Cuatrimotos ATV Riders",
        timeframe: "Feb 2026",
        role: "CRM & Automation Consultant (Freelance)",
        description: (
          <>
            Designed and deployed an end-to-end lead qualification system for a Bogotá-based ATV
            retailer managing <Metric>200+</Metric> inbound WhatsApp leads per day with no CRM
            infrastructure in place.
            <br />
            <strong>Stack:</strong> WhatsApp Business API · Kommo CRM · Meta Business Suite · Gemini
            3.1 Pro
          </>
        ),
        achievements: [
          <>
            Built on Kommo CRM, the solution included a structured chatbot architecture with
            intent-based routing at first touchpoint, segmenting every incoming conversation into
            three paths (catalog browsing, FAQ, or high-intent purchase) before any human
            involvement.
          </>,
          <>
            Configured automated re-engagement and pipeline closure logic to eliminate ghost leads
            and keep the funnel clean.
          </>,
          <>
            Designed the full sales pipeline inside Kommo, mapping each stage to the team's actual
            commercial process identified during discovery sessions.
          </>,
          <>
            After the handoff, the commercial team operates the system independently with no
            technical dependency. Every lead that enters via WhatsApp is automatically created,
            classified, and placed at the correct pipeline stage.
          </>,
          <>
            Sales advisors start their day with a prioritized queue of high-intent contacts, not 200
            unsorted messages.
          </>,
        ],
        images: [],
      },
      {
        company: "Artesa Panadería",
        timeframe: "Jan 2025 - Dec 2025",
        role: "Marketing & Customer Experience Analyst",
        description: (
          <>
            Led the full design and implementation of an AI automation stack for Artesa's commercial
            operation. The result: reduced manual workload, faster lead response times, and a
            scalable customer service system built without adding a single headcount.
          </>
        ),
        achievements: [
          <>
            Designed and deployed an AI-powered WhatsApp chatbot integrated with Bitrix24 CRM to
            automate lead qualification and initial customer interactions, handling{" "}
            <Metric>85%</Metric> of conversations without human intervention.
          </>,
          <>
            Translated business requirements into automated workflows that reduced response times
            and improved lead routing efficiency.
          </>,
          <>
            Built digital assets and visual content using Canva, Affinity, and generative AI to
            support paid campaigns and organic growth initiatives.
          </>,
          <>
            Led product photography and visual optimization for delivery platforms, improving
            product presentation and click-through performance.
          </>,
          <>
            Acted as the bridge between marketing, sales, and customer experience to ensure
            automation aligned with real operational needs.
          </>,
        ],
        images: [],
      },
      {
        company: "Aseneg",
        timeframe: "July 2024 - Jan 2025",
        role: "Commercial and Marketing Intern",
        description: (
          <>
            In this role, I supported both commercial outreach and brand positioning efforts,
            focusing on generating demand and strengthening digital presence.
          </>
        ),
        achievements: [
          <>
            Executed outbound marketing initiatives by researching prospects, identifying
            opportunities, and supporting direct outreach strategies.
          </>,
          <>
            Created value-driven content for social media, increasing visibility and engagement
            across digital channels.
          </>,
          <>
            Managed content calendars, coordinated posting schedules, and maintained website updates
            to ensure brand consistency.
          </>,
          <>
            Supported early-stage funnel optimization by aligning messaging with commercial
            objectives.
          </>,
        ],
        images: [],
      },
      {
        company: "Concentrix",
        timeframe: "July 2022 - Oct 2024",
        role: "Customer Service Representative",
        description: (
          <>
            This role built the foundation of my customer-centric approach and problem-solving
            mindset.
          </>
        ),
        achievements: [
          <>
            Handled complex and sensitive cases involving security, fraud, and account transfers in
            a high-volume support environment.
          </>,
          <>
            Diagnosed technical issues and application bugs, escalating incidents to internal teams
            to ensure timely resolution.
          </>,
          <>
            Documented recurring product issues to support platform improvements and better user
            experiences.
          </>,
          <>
            Awarded Top Performer (2023), ranked among the highest in service quality, case
            resolution accuracy, and customer satisfaction scores across the support team.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Studies",
    institutions: [
      {
        name: "Universidad Piloto de Colombia",
        description: <>Bachelor's Degree in Marketing.</>,
      },
      {
        name: "SENA",
        description: <>Technical Degree in Administrative Assistance.</>,
      },
    ],
  },
  certifications: {
    display: true,
    title: "Certifications",
    items: [
      {
        name: "Generative AI for Digital Marketing Specialization",
        institution: "IBM",
        link: "https://www.coursera.org/account/accomplishments/specialization/F0ZEO3C8BQU7",
      },
      {
        name: "Google AI Essentials",
        institution: "Google",
        link: "https://www.coursera.org/account/accomplishments/specialization/QHHIU6T3KOR1",
      },
      {
        name: "AI For Marketing",
        institution: "Emory University",
        link: "https://www.coursera.org/account/accomplishments/specialization/PVAPT7SC6B4G",
      },
      {
        name: "Google Digital Marketing & E-commerce Professional Certificate",
        institution: "Google",
        link: "https://www.coursera.org/account/accomplishments/specialization/FHAT2KULOBL1",
      },
      {
        name: "Python for Data Science, AI & Development",
        institution: "IBM",
        link: "https://www.coursera.org/account/accomplishments/verify/KZ20RFRJ1MAU",
      },
      {
        name: "Microsoft Excel Professional Certificate",
        institution: "Microsoft",
        link: "https://www.coursera.org/account/accomplishments/specialization/7ZDOGCXO2WBG",
      },
      {
        name: "Google Data-Driven Decision Making",
        institution: "Google",
        link: "https://www.coursera.org/account/accomplishments/specialization/KVIF2SS3WP5M",
      },
      {
        name: "Claude Code in Action",
        institution: "Anthropic",
        link: "https://www.coursera.org/account/accomplishments/verify/97FY4JDEMEMQ",
      },
      {
        name: "Real-World AI for Everyone",
        institution: "Anthropic",
        link: "https://www.coursera.org/account/accomplishments/specialization/4GQ8PGQ9ZT2K",
      },
      {
        name: "Vibe Coding for Developers",
        institution: "Edureka",
        link: "https://www.coursera.org/account/accomplishments/specialization/ONNNZYW84VR5",
      },
      {
        name: "Advertising with Meta",
        institution: "Meta",
        link: "https://www.coursera.org/account/accomplishments/verify/RUGAIV86022E",
      },
      {
        name: "Measure and Optimize Social Media Marketing Campaigns",
        institution: "Meta",
        link: "https://www.coursera.org/account/accomplishments/verify/7AHICPDYW1D2",
      },
      {
        name: "Fundamentals of Social Media Advertising",
        institution: "Meta",
        link: "https://www.coursera.org/account/accomplishments/verify/GAJQ9GDKCAIQ",
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical Skills",
    skills: [
      {
        title: "Automation, AI & Systems",
        description: (
          <>
            AI Chatbot Design & Deployment · Lead Qualification Automation · CRM Workflow Design
            (Bitrix24, Kommo) · Process Optimization & Automation Logic · API Integrations · Zapier
            Automation · Prompt Engineering & AI-Assisted Workflows
          </>
        ),
        images: [],
      },
      {
        title: "Marketing & Growth",
        description: (
          <>
            Digital Marketing Strategy · Lead Generation & Funnel Optimization · Content Strategy &
            Execution · Meta Ads (B2B & B2C) · SEO Strategy & Implementation · Customer Experience
            Optimization · Brand Identity & Manual Development
          </>
        ),
        images: [],
      },
      {
        title: "Platforms & Tools",
        description: (
          <>
            <strong>Web & Deployment:</strong> Vercel, WordPress, Netlify, Odoo (CMS), Shopify
            <br />
            <strong>Analytics:</strong> Google Analytics, Google Search Console
            <br />
            <strong>Design & Media:</strong> Canva, Affinity, DaVinci Resolve, CapCut
            <br />
            <strong>Voice & Audio:</strong> ElevenLabs
            <br />
            <strong>AI & SEO Automation:</strong> Soro AI, Holo AI
            <br />
            <strong>AI & Tech:</strong> Generative AI Tools, Python (automation-focused)
          </>
        ),
        images: [],
      },
      {
        title: "AI Video & Creative Production",
        description: (
          <>
            I produce high-impact visual content using frontier AI generation models alongside
            traditional production tools, enabling studio-quality output at a fraction of the
            conventional time and cost.
            <br />
            <br />
            <strong>AI Video Generation:</strong> Higgsfield, Kling 3.0, Seedance 2.0, Google Veo 3
            <br />
            <strong>AI Creative Tools:</strong> TikTok Symphony Creative Studio, Nano Banana Pro,
            Generative AI image tools
            <br />
            <strong>Production:</strong> DaVinci Resolve, CapCut, ElevenLabs
            <br />
            <strong>Use cases:</strong> Paid ad creatives, short-form video, AI-generated brand
            content, social media performance assets
          </>
        ),
        images: [],
      },
      {
        title: "Development",
        description: (
          <>
            Next.js · CSS · JavaScript · Responsive UI Development · Cross-browser Debugging (iOS
            Safari)
          </>
        ),
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Insights & Setup",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Projects",
  title: `Projects – ${person.name}`,
  description:
    "AI systems, automation workflows, and marketing infrastructure built by Erick Mahecha",
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Visual Work",
  title: `Visual Work – ${person.name}`,
  description:
    "Cinematic video production used to require a crew, a budget, and days of shooting. These assets were built by one person, usually in hours. This section collects paid ad creatives, short-form video, and AI-generated content produced for real campaigns.",
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "https://youtube.com/shorts/BzDuYfJs3Oo",
      alt: "Quick Metal Shop video ad, short-form vertical creative",
      orientation: "vertical",
    },
    {
      src: "https://youtube.com/shorts/E-8o73YzYh4",
      alt: "Quick Metal Shop Father's Day reel, second cut",
      orientation: "vertical",
    },
    // QMS B2B carousel: "Cómo saber si un taller te va a cumplir o te va a atrasar"
    {
      src: "/images/gallery/carru1.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 1 of 6: how to tell whether a metal shop will deliver on time",
      orientation: "square",
      group: "carru",
    },
    {
      src: "/images/gallery/carru2.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 2 of 6",
      orientation: "square",
      group: "carru",
    },
    {
      src: "/images/gallery/carru3.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 3 of 6",
      orientation: "square",
      group: "carru",
    },
    {
      src: "/images/gallery/carru4.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 4 of 6",
      orientation: "square",
      group: "carru",
    },
    {
      src: "/images/gallery/carru5.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 5 of 6",
      orientation: "square",
      group: "carru",
    },
    {
      src: "/images/gallery/carru6.webp",
      alt: "Quick Metal Shop B2B carousel for contractors and engineers, slide 6 of 6",
      orientation: "square",
      group: "carru",
    },
    {
      src: "https://youtube.com/shorts/PoQ8VFQ801Q",
      alt: "Quick Metal Shop Father's Day collection teaser reel",
      orientation: "vertical",
    },
    {
      src: "https://youtube.com/shorts/GXaDhzxqOpo",
      alt: "Quick Metal Shop Father's Day reel",
      orientation: "vertical",
    },
    {
      src: "https://youtube.com/shorts/PgvIVcyL4jg",
      alt: "Quick Metal Shop Father's Day story creative",
      orientation: "vertical",
    },
    // QMS B2C carousel: "Lleva un pedacito de Puerto Rico en cada pared"
    {
      src: "/images/gallery/1.webp",
      alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 1 of 5: laser-cut steel Puerto Rico wall piece",
      orientation: "square",
      group: "generic",
    },
    {
      src: "/images/gallery/2.webp",
      alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 2 of 5",
      orientation: "square",
      group: "generic",
    },
    {
      src: "/images/gallery/3.webp",
      alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 3 of 5",
      orientation: "square",
      group: "generic",
    },
    {
      src: "/images/gallery/4.webp",
      alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 4 of 5",
      orientation: "square",
      group: "generic",
    },
    {
      src: "/images/gallery/5.webp",
      alt: "Quick Metal Shop B2C carousel for Puerto Rico wall decor, slide 5 of 5",
      orientation: "square",
      group: "generic",
    },
    {
      src: "/images/gallery/dakoma1.webp",
      alt: "Dakoma Roofing rebranding asset, slide 1 of 5",
      orientation: "square",
      group: "dakoma",
    },
    {
      src: "/images/gallery/dakoma2.webp",
      alt: "Dakoma Roofing rebranding asset, slide 2 of 5",
      orientation: "square",
      group: "dakoma",
    },
    {
      src: "/images/gallery/dakoma3.webp",
      alt: "Dakoma Roofing rebranding asset, slide 3 of 5",
      orientation: "square",
      group: "dakoma",
    },
    {
      src: "/images/gallery/dakoma4.webp",
      alt: "Dakoma Roofing rebranding asset, slide 4 of 5",
      orientation: "square",
      group: "dakoma",
    },
    {
      src: "/images/gallery/dakoma5.webp",
      alt: "Dakoma Roofing rebranding asset, slide 5 of 5",
      orientation: "square",
      group: "dakoma",
    },
    {
      src: "/images/gallery/qms1.webp",
      alt: "Quick Metal Shop brand social creative, slide 1 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "/images/gallery/qms2.webp",
      alt: "Quick Metal Shop brand social creative, slide 2 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "/images/gallery/qms3.webp",
      alt: "Quick Metal Shop brand social creative, slide 3 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "/images/gallery/qms4.webp",
      alt: "Quick Metal Shop brand social creative, slide 4 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "/images/gallery/qms5.webp",
      alt: "Quick Metal Shop brand social creative, slide 5 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "/images/gallery/qms6.webp",
      alt: "Quick Metal Shop brand social creative, slide 6 of 6",
      orientation: "square",
      group: "qms",
    },
    {
      src: "https://www.youtube.com/watch?v=qXv6XMOy1N4",
      alt: "Quick Metal Shop Puerto Rico collection video",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=KSerIhwaknE",
      alt: "Quick Metal Shop custom metal signs video",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=c_oQBTyLB0M",
      alt: "Quick Metal Shop Taíno-inspired laser-cut piece video",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=J1EtEBNQ2mE",
      alt: "Quick Metal Shop decorative laser-cut pieces video",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Wallpaper Diciembre.webp",
      alt: "Artesa Panadería December campaign wallpaper",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/Artesa - Panettone 2x1.webp",
      alt: "Artesa Panadería panettone 2-for-1 promotion creative",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=5hcoQ5J9occ",
      alt: "Artesa Panadería store tour video",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Muffin ChocoMix.webp",
      alt: "Artesa Panadería ChocoMix muffin product creative",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Nuevos Sabores.webp",
      alt: "Artesa Panadería new flavors launch creative",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=c8CcTBk6sV4",
      alt: "Aseneg December short-form video",
      orientation: "vertical",
    },
    {
      src: "https://www.youtube.com/watch?v=0EvVcg9uSk8",
      alt: "Aseneg burnout awareness short-form video",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Magia de Diciembre.webp",
      alt: "Artesa Panadería December campaign creative",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Nuevo Menu.webp",
      alt: "Artesa Panadería new menu launch creative",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/Artesa - Dia de la Madre.webp",
      alt: "Artesa Panadería Mother's Day campaign creative",
      orientation: "vertical",
    },
    // QMS B2B carousel: "¿Cuántos días de obra perdiste este año?"
    {
      src: "/images/gallery/dias1.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 1 of 6: how many build days were lost waiting on late metal parts",
      orientation: "square",
      group: "dias",
    },
    {
      src: "/images/gallery/dias2.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 2 of 6",
      orientation: "square",
      group: "dias",
    },
    {
      src: "/images/gallery/dias3.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 3 of 6",
      orientation: "square",
      group: "dias",
    },
    {
      src: "/images/gallery/dias4.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 4 of 6",
      orientation: "square",
      group: "dias",
    },
    {
      src: "/images/gallery/dias5.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 5 of 6",
      orientation: "square",
      group: "dias",
    },
    {
      src: "/images/gallery/dias6.webp",
      alt: "Quick Metal Shop B2B carousel on project delays, slide 6 of 6",
      orientation: "square",
      group: "dias",
    },
    // QMS carousel: "De la idea al producto terminado"
    {
      src: "/images/gallery/idea1.webp",
      alt: "Quick Metal Shop carousel on the fabrication process, slide 1 of 4: concept sketch turned into a dimensioned laser-cut panel drawing",
      orientation: "square",
      group: "idea",
    },
    {
      src: "/images/gallery/idea2.webp",
      alt: "Quick Metal Shop carousel on the fabrication process, slide 2 of 4",
      orientation: "square",
      group: "idea",
    },
    {
      src: "/images/gallery/idea3.webp",
      alt: "Quick Metal Shop carousel on the fabrication process, slide 3 of 4",
      orientation: "square",
      group: "idea",
    },
    {
      src: "/images/gallery/idea4.webp",
      alt: "Quick Metal Shop carousel on the fabrication process, slide 4 of 4",
      orientation: "square",
      group: "idea",
    },
    // Piezas individuales
    {
      src: "/images/gallery/arqui.webp",
      alt: "Quick Metal Shop trade show announcement revealing the ArquiExpo 2026 stand design",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/coqui.webp",
      alt: "Quick Metal Shop product ad for the laser-cut steel coquí wall piece, with specs, finishes and shipping detail",
      orientation: "square",
    },
    {
      src: "/images/gallery/diadelpadre.webp",
      alt: "Quick Metal Shop Father's Day product ad featuring laser-cut metal gifts",
      orientation: "square",
    },
    {
      src: "/images/gallery/libres.webp",
      alt: 'Quick Metal Shop Juneteenth post: a breaking steel chain over the line "Libres. Hoy y siempre."',
      orientation: "square",
    },
    {
      src: "/images/gallery/metal.webp",
      alt: "Quick Metal Shop B2B ad for facades, pergolas and decorative metal design in architectural projects",
      orientation: "square",
    },
    {
      src: "/images/gallery/pared.webp",
      alt: "Quick Metal Shop product ad for a four-panel laser-cut steel wall piece in a living room setting",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/transform.webp",
      alt: "Quick Metal Shop English-language ad for customizable laser-cut steel wall art, shipping to Puerto Rico and the USA",
      orientation: "vertical",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
