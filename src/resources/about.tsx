// The About page's content, which the chatbot also reads: the introduction,
// the work history, studies, certifications and skills, and the links to
// book a call and to the resume.
import { Fragment, type ReactNode } from "react";
import { Metric } from "./Metric";

export type Job = {
  company: string;
  timeframe: string;
  role: string;
  description?: ReactNode;
  achievements: ReactNode[];
};

export type School = { name: string; description: ReactNode };

export type Certification = { name: string; institution: string; link: string };

export type SkillGroup = { title: string; description: ReactNode };

export type About = {
  intro: ReactNode;
  bookingUrl: string;
  resumeUrl: string;
  experience: { title: string; jobs: Job[] };
  education: { title: string; schools: School[] };
  certifications: { title: string; items: Certification[] };
  skills: { title: string; groups: SkillGroup[] };
};

export const about: About = {
  intro: (
    <>
      I'm a one-person growth department. I've built complete marketing infrastructures: brand
      identity, paid media, CRM automation, SEO systems, and AI content production, for companies
      across construction, food, and retail. Most recently, I generated <Metric>338K+</Metric>{" "}
      organic video views for Quick Metal Shop with zero ad spend, using an AI production pipeline I
      designed and ran myself.
      <br />
      <br />
      My entry point into marketing wasn't a campaign. It was a crisis line.
      <br />
      <br />I spent two years at Concentrix managing security incidents, fraud cases, and technical
      failures for Mercado Pago users. That environment taught me something most marketers never
      learn firsthand: where systems break down, how users behave under pressure, and what it
      actually costs a business when processes fail at scale. It's an uncomfortable place to start.
      It's also an unusually useful one.
      <br />
      <br />
      That operational foundation pushed me toward a different kind of marketing. Not just running
      campaigns, but redesigning how businesses attract, qualify, and convert customers. I became
      focused on one question: what can be automated, and what's the cost of not automating it?
      <br />
      <br />
      The answer has taken different shapes across different projects. An AI-powered WhatsApp
      chatbot that handled <Metric>85%</Metric> of inbound conversations autonomously for Artesa. A
      full marketing department built from scratch for Quick Metal Shop (brand identity, paid media,
      SEO automation, CRM integration, and a custom-built trade show application deployed in{" "}
      <Metric>48</Metric> hours). A complete rebranding and content automation system for Dakoma
      Roofing, delivered as a one-person freelance engagement.
      <br />
      <br />
      What connects all of it is the same approach: start with the operational reality, identify
      where human time is being consumed by work a system could handle, and build the infrastructure
      that removes that friction permanently.
      <br />
      <br />
      Today I work at the intersection of marketing strategy, AI tooling, and systems design. I
      don't run campaigns in isolation. I build the ecosystems that make campaigns compound over
      time: automated content pipelines, real-time lead qualification, full-funnel tracking, and
      creative production workflows that let a one-person operation output at agency scale.
      <br />
      <br />
      The work I find most interesting lives at the edge of what's currently possible with AI, which
      in 2026 is moving faster than most businesses realize.
    </>
  ),
  bookingUrl: "https://calendly.com/santiagomahecha2328/30min",
  resumeUrl: "/resume/Erick_Mahecha_Resume.pdf",
  experience: {
    title: "Work Experience",
    jobs: [
      {
        company: "Incentiva Group",
        timeframe: "July 2026 - Present",
        role: "Growth & Operations Lead",
        achievements: [
          "Leading retention strategy and conversion funnel optimization through RFM models and CRM automation.",
          "Implementing and managing generative AI solutions and virtual assistants across client operations.",
          "Overseeing Meta Ads campaigns and WhatsApp Business API communications for client accounts.",
          "Monitoring KPIs and managing client accounts to ensure on-time, high-quality delivery.",
          <Fragment key="team">
            Leading and mentoring a <Metric>2-person</Metric> operations team.
          </Fragment>,
        ],
      },
      {
        company: "Quick Metal Shop",
        timeframe: "Jan 2026 - July 2026",
        role: "Growth Marketing Specialist",
        description:
          "Joined as the company's first and sole marketing hire. There was no brand identity, no analytics infrastructure, and no digital strategy in place. I built everything from scratch and kept it running.",
        achievements: [
          "Created the company's Brand Manual in the first week, defining the full visual identity (color palette, typography, tone of voice) that became the operational standard across the entire organization, including the ArquiExpo 2026 trade show stand, recognized as one of the strongest presences at the event.",
          "Deployed and configured Soro AI for automated SEO blog publishing across both the B2B site (Odoo CMS) and the B2C Shopify store, including custom code integration into each CMS. This established a compounding organic search engine that requires zero ongoing manual effort.",
          "Set up Google Analytics and Google Search Console from scratch, then linked Search Console directly to Soro AI to enable keyword-informed automated publishing.",
          "Launched and managed the company's LinkedIn presence; deployed Holo AI to automate brand-aligned thought leadership content at scale.",
          "Managed Instagram and Facebook content daily across B2B and B2C narratives.",
          "Deployed the Meta Pixel across both storefronts and independently built, configured, and launched Meta Ads campaigns, covering everything from creative concept to audience targeting and budget management, across separate B2B and B2C campaign structures.",
          "Built a Zapier-to-Odoo CRM automation to route B2B leads from Meta Instant Forms directly into the CRM in real time, eliminating manual data entry and closing a critical gap in the lead pipeline.",
          "Operated a high-velocity AI-augmented creative production workflow using Higgsfield (Kling 3.0, Seedance 2.0), ElevenLabs, Claude, CapCut, and DaVinci Resolve.",
          <Fragment key="arquiexpo-app">
            Designed, developed, and deployed a custom full-stack interactive gallery web
            application in under <Metric>48</Metric> hours for ArquiExpo 2026. Built with Next.js,
            deployed on Netlify, optimized for a vertical touchscreen interface, and fully
            responsive across all devices including iOS Safari.
          </Fragment>,
        ],
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
          "Executed a full rebranding initiative. I delivered a Brand Manual that redefined the color palette, typography system, and logo usage guidelines, then rolled it out across the company's website, social media profiles, and advertising assets.",
          "Integrated Soro AI to establish an autonomous SEO blog pipeline, enabling consistent keyword-targeted content publishing with zero ongoing manual effort.",
          "Developed a suite of high-production video ad creatives using Higgsfield's Kling 3.0 for cinematic footage and Nano Banana Pro for AI avatar-driven spokesperson content, achieving output quality that matched the elevated brand standard at a one-person cost and timeline.",
        ],
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
          "Built on Kommo CRM, the solution included a structured chatbot architecture with intent-based routing at first touchpoint, segmenting every incoming conversation into three paths (catalog browsing, FAQ, or high-intent purchase) before any human involvement.",
          "Configured automated re-engagement and pipeline closure logic to eliminate ghost leads and keep the funnel clean.",
          "Designed the full sales pipeline inside Kommo, mapping each stage to the team's actual commercial process identified during discovery sessions.",
          "After the handoff, the commercial team operates the system independently with no technical dependency. Every lead that enters via WhatsApp is automatically created, classified, and placed at the correct pipeline stage.",
          "Sales advisors start their day with a prioritized queue of high-intent contacts, not 200 unsorted messages.",
        ],
      },
      {
        company: "Artesa Panadería",
        timeframe: "Jan 2025 - Dec 2025",
        role: "Marketing & Customer Experience Analyst",
        description:
          "Led the full design and implementation of an AI automation stack for Artesa's commercial operation. The result: reduced manual workload, faster lead response times, and a scalable customer service system built without adding a single headcount.",
        achievements: [
          <Fragment key="whatsapp-bot">
            Designed and deployed an AI-powered WhatsApp chatbot integrated with Bitrix24 CRM to
            automate lead qualification and initial customer interactions, handling{" "}
            <Metric>85%</Metric> of conversations without human intervention.
          </Fragment>,
          "Translated business requirements into automated workflows that reduced response times and improved lead routing efficiency.",
          "Built digital assets and visual content using Canva, Affinity, and generative AI to support paid campaigns and organic growth initiatives.",
          "Led product photography and visual optimization for delivery platforms, improving product presentation and click-through performance.",
          "Acted as the bridge between marketing, sales, and customer experience to ensure automation aligned with real operational needs.",
        ],
      },
      {
        company: "Aseneg",
        timeframe: "July 2024 - Jan 2025",
        role: "Commercial and Marketing Intern",
        description:
          "In this role, I supported both commercial outreach and brand positioning efforts, focusing on generating demand and strengthening digital presence.",
        achievements: [
          "Executed outbound marketing initiatives by researching prospects, identifying opportunities, and supporting direct outreach strategies.",
          "Created value-driven content for social media, increasing visibility and engagement across digital channels.",
          "Managed content calendars, coordinated posting schedules, and maintained website updates to ensure brand consistency.",
          "Supported early-stage funnel optimization by aligning messaging with commercial objectives.",
        ],
      },
      {
        company: "Concentrix",
        timeframe: "July 2022 - Oct 2024",
        role: "Customer Service Representative",
        description:
          "This role built the foundation of my customer-centric approach and problem-solving mindset.",
        achievements: [
          "Handled complex and sensitive cases involving security, fraud, and account transfers in a high-volume support environment.",
          "Diagnosed technical issues and application bugs, escalating incidents to internal teams to ensure timely resolution.",
          "Documented recurring product issues to support platform improvements and better user experiences.",
          "Awarded Top Performer (2023), ranked among the highest in service quality, case resolution accuracy, and customer satisfaction scores across the support team.",
        ],
      },
    ],
  },
  education: {
    title: "Studies",
    schools: [
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
  skills: {
    title: "Technical Skills",
    groups: [
      {
        title: "Automation, AI & Systems",
        description:
          "AI Chatbot Design & Deployment · Lead Qualification Automation · CRM Workflow Design (Bitrix24, Kommo) · Process Optimization & Automation Logic · API Integrations · Zapier Automation · Prompt Engineering & AI-Assisted Workflows",
      },
      {
        title: "Marketing & Growth",
        description:
          "Digital Marketing Strategy · Lead Generation & Funnel Optimization · Content Strategy & Execution · Meta Ads (B2B & B2C) · SEO Strategy & Implementation · Customer Experience Optimization · Brand Identity & Manual Development",
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
      },
      {
        title: "Development",
        description:
          "Next.js · CSS · JavaScript · Responsive UI Development · Cross-browser Debugging (iOS Safari)",
      },
    ],
  },
};
