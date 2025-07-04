// src/data/jobs.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere";
  experienceLevel:
    | "Intern"
    | "Entry-level"
    | "Associate/Mid-level"
    | "Senior-level"
    | "Managerial"
    | "Executive";
  employmentType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Temporary"
    | "Freelance";
  industry: string;
  visa: boolean;
  benefits: string[];
  skills: string[];
  url: string;
  postedAt: number;
  remote: boolean;
  type: "job" | "internship";
  currency: string;
  salaryLow: number;
  salaryHigh: number;
}

export const jobs: Job[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    company: "Acme Co.",
    city: "Remote",
    country: "",
    officeType: "Remote",
    experienceLevel: "Entry-level",
    employmentType: "Full-time",
    industry: "Tech",
    visa: false,
    benefits: ["Health insurance", "Paid leave"],
    skills: ["React", "TypeScript", "CSS"],
    url: "https://acme.example.com/apply/1",
    postedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    remote: true,
    type: "job",
    currency: "$",
    salaryLow: 60000,
    salaryHigh: 80000,
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Acme Co.",
    city: "New York",
    country: "USA",
    officeType: "Hybrid",
    experienceLevel: "Associate/Mid-level",
    employmentType: "Full-time",
    industry: "Design",
    visa: true,
    benefits: ["Flexible working hours", "Stock options"],
    skills: ["Figma", "UX", "Prototyping"],
    url: "https://acme.example.com/apply/2",
    postedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    remote: false,
    type: "job",
    currency: "$",
    salaryLow: 70000,
    salaryHigh: 90000,
  },
  // …add 3–5 more samples
];
