import { projects, skills } from "./data";

type Project = (typeof projects)[number];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** True if any project tech entry equals one of the given names. */
const tech =
  (...names: string[]) =>
  (p: Project) => {
    const set = new Set(p.tech.map(norm));
    return names.some((n) => set.has(norm(n)));
  };

/** True if the project description mentions the phrase. */
const mentions = (re: RegExp) => (p: Project) => re.test(`${p.description} ${p.longDescription}`);

const any =
  (...fns: ((p: Project) => boolean)[]) =>
  (p: Project) =>
    fns.some((f) => f(p));

/**
 * How each skill is proven by a project. Only claims backed by the project's own
 * tech list or description. Skills absent here (or matching nothing) show no
 * projects, rather than inventing evidence.
 */
const RULES: Record<string, (p: Project) => boolean> = {
  "Node.js": tech("Node.js"),
  "Express.js": tech("Express.js"),
  "REST APIs": tech("Express.js", "FastAPI"),
  FastAPI: tech("FastAPI"),
  "JWT Authorization": tech("JWT", "JWT Authorization"),
  RBAC: tech("RBAC"),

  "Next.js": tech("Next.js"),
  "React.js": tech("React.js", "React"),
  TypeScript: tech("TypeScript"),
  "Tailwind CSS": tech("Tailwind CSS"),
  "Redux Toolkit": tech("Redux"),
  Hooks: tech("React.js", "React", "Next.js"),
  SSR: tech("Next.js"),
  SSG: tech("Next.js"),

  "OpenAI API": tech("OpenAI API"),
  LangChain: tech("LangChain"),
  LangGraph: tech("LangGraph"),
  RAG: any(tech("RAG"), mentions(/\bRAG\b/)),
  "Vector Databases": mentions(/vector/i),
  "AI Integration": (p) => p.category === "AI / ML",
  "Vision Pipeline": tech("Vision Pipeline"),
  "Vector Embeddings": mentions(/vector embeddings/i),
  "Semantic Search": mentions(/semantic search/i),

  JavaScript: tech("JavaScript", "JS", "Node.js", "React.js", "React", "Next.js"),
  Python: tech("FastAPI", "Python"),
  SQL: tech("MySQL", "PostgreSQL"),

  MongoDB: tech("MongoDB"),
  MySQL: tech("MySQL"),

  "Git / GitHub": (p) => {
    try {
      const u = new URL(p.github);
      return u.hostname.includes("github.com") && u.pathname.split("/").filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  },
  Docker: tech("Docker"),
  "Vercel / Netlify": (p) => /vercel\.app|netlify\./.test(p.live),
  "AWS (EC2, S3, SES)": tech("AWS S3"),

  "SAP Integrations": tech("SAP Integration"),
  SMTP: tech("NodeMailer"),
  Razorpay: tech("Razorpay"),
};

export interface SkillNode {
  name: string;
  group: string;
  color: string;
  projectIds: number[];
}
export interface SkillGroup {
  name: string;
  color: string;
  skills: SkillNode[];
}

export const skillGroups: SkillGroup[] = skills.map((g) => ({
  name: g.category,
  color: g.color,
  skills: g.items.map((it) => {
    const rule = RULES[it.name];
    return {
      name: it.name,
      group: g.category,
      color: g.color,
      projectIds: rule ? projects.filter(rule).map((p) => p.id) : [],
    };
  }),
}));

export const allSkills = skillGroups.flatMap((g) => g.skills);

/** Skills used by a given project. */
export function skillsForProject(id: number) {
  return allSkills.filter((s) => s.projectIds.includes(id));
}
