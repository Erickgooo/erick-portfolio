export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  relatedIds: string[];
}

export const faqData: FAQItem[] = [
  {
    id: "current",
    question: "What does Erick do currently?",
    answer:
      "Erick is **Operations Manager at Incentiva Group**, a marketing agency in Medellín, where he has led projects for **Nequi, Wompi, Colmaíz and Samsung**. He runs the company's in-house software as product owner and technical lead (a field-sales app, a client portal and a WhatsApp AI-assistant platform), directing AI-assisted development from audit to App Store release, and leads brand and go-to-market work. Before that he built the complete marketing infrastructure for **Quick Metal Shop**.",
    relatedIds: ["incentiva", "notable-project", "contact"],
  },
  {
    id: "incentiva",
    question: "What has he built at Incentiva Group?",
    answer:
      "Seven case studies, among them:\n\n• **Scope**: Incentiva's custom app for the **Nequi** and **Wompi** field teams, turned into a multi-client platform with Wompi live next to Nequi, and its first iOS launch with **13** production releases.\n• **ChatFlow**: the WhatsApp AI platform behind the **Colmaíz** (Ingredion) assistant, taken from backups to **3,177** automated tests.\n• **DIRECTV**: a click-to-WhatsApp funnel for Incentiva as an authorized DIRECTV dealer, with an AI assistant that pre-qualifies leads.\n• **Samsung × LifeMiles**: at Incentiva Group he led the WhatsApp chatbot through which **2M+ LifeMiles miles** were awarded to Galaxy S26 buyers.\n• The company's new brand and 28-page website.\n\nApart from the figures above and Colmaíz's (35,000+ contacts, 6,000+ served), client figures are confidential. Every project is in the [Incentiva Group index](/work/incentiva-group).",
    relatedIds: ["current", "ai-tools", "contact"],
  },
  {
    id: "notable-project",
    question: "What is his most notable project?",
    answer:
      "Erick's most notable project is the **QMS ArquiExpo App**, a custom-built, vertically-oriented interactive touchscreen web application showcasing 285 architectural panel variants. He designed, developed, and deployed it on Netlify for ArquiExpo 2026, resolving iOS Safari rendering quirks to ensure flawless vertical touchscreen performance.",
    relatedIds: ["ai-tools", "chatbot-exp", "contact"],
  },
  {
    id: "ai-tools",
    question: "What AI tools does he use?",
    answer:
      "Erick operates a high-velocity, AI-augmented creative and marketing stack:\n\n• **AI Video Production**: Higgsfield (Kling 3.0, Seedance 2.0), Google Veo 3\n• **AI Spokespersons**: Nano Banana Pro, TikTok Symphony\n• **SEO Automation**: Soro AI, Holo AI\n• **AI Orchestration & Logic**: Claude, Gemini 3.1 Pro, ChatGPT\n• **AI-Assisted Development**: Claude Code, directed from spec to release\n• **Operational Tools**: Zapier, Kommo CRM, Bitrix24",
    relatedIds: ["chatbot-exp", "notable-project", "contact"],
  },
  {
    id: "chatbot-exp",
    question: "Does he have experience building chatbots?",
    answer:
      "Yes! Erick has built commercial lead qualification and commercial chatbots:\n\n• **Cuatrimotos ATV Riders**: Designed and deployed a WhatsApp Business API chatbot powered by **Gemini 3.1 Pro** and integrated with Kommo CRM, handling 200+ inbound leads daily with initial touchpoint segmenting.\n• **Artesa Panadería**: Developed a custom commercial chatbot integrated with **Bitrix24 CRM**, handling **85% of inbound conversations autonomously**.",
    relatedIds: ["notable-project", "ai-tools", "contact"],
  },
  {
    id: "contact",
    question: "How can I get in touch?",
    answer:
      "You can reach out to Erick directly through these channels:\n\n• **Email**: santiagomahecha2328@gmail.com\n• **LinkedIn**: [linkedin.com/in/erick-mahecha](https://www.linkedin.com/in/erick-mahecha/)\n• **GitHub**: [github.com/Erickgooo](https://github.com/Erickgooo)\n• **Meeting**: Schedule a 30-minute call via [Erick's Calendly](https://calendly.com/santiagomahecha2328/30min)",
    relatedIds: ["current", "location", "chatbot-exp"],
  },
  {
    id: "location",
    question: "Where is he based?",
    answer: "Erick is based in **Medellín, Colombia** (America/Bogota timezone).",
    relatedIds: ["current", "languages", "contact"],
  },
  {
    id: "languages",
    question: "What languages does he speak?",
    answer:
      "Erick works in **Spanish** and **English**. His English level is **B2** (upper intermediate).",
    relatedIds: ["location", "current", "contact"],
  },
];

export const initialGreeting = "Hi, I'm ErickBot! Ask me anything about Erick's background.";
export const backButtonLabel = "Back to questions";
export const chatbotTitle = "ErickBot";
