// src/data/jobs.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  url: string;
}

export const jobs: Job[] = [
  {
    id: "1",
    title: "Frontend Engineer",
    company: "Acme Co.",
    location: "Remote",
    skills: ["React", "TypeScript", "CSS"],
    url: "https://acme.example.com/apply/1",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Acme Co.",
    location: "New York, NY",
    skills: ["Figma", "UX", "Prototyping"],
    url: "https://acme.example.com/apply/2",
  },
  // …add 3–5 more samples
];
