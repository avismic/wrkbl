// src/app/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import ListingCard, { Job } from "../components/ListingCard";
import styles from "./page.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  const {
    data: jobs = [],
    error,
    isLoading,
  } = useSWR<Job[]>("/api/jobs", fetcher);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState({ job: true, internship: true });
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [skillSearch, setSkillSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const inited = useRef(false);

  // Load More state
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (inited.current || jobs.length === 0) return;
    inited.current = true;
    const skills = Array.from(new Set(jobs.flatMap((j) => j.skills))).sort();
    setSkillOptions(skills);
    setSelectedSkills(new Set(skills));
    const locs = Array.from(new Set(jobs.map((j) => j.location))).sort();
    setLocationOptions(locs);
    setSelectedLocations(new Set(locs));
    const comps = Array.from(new Set(jobs.map((j) => j.company))).sort();
    setCompanyOptions(comps);
    setSelectedCompanies(new Set(comps));
  }, [jobs]);

  const toggleType = (key: "job" | "internship") =>
    setTypeFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSet = (
    value: string,
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>
  ) =>
    setFn((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      if (
        q &&
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q)
      )
        return false;
      if (!typeFilter[job.type]) return false;
      if (
        selectedSkills.size > 0 &&
        !job.skills.some((s) => selectedSkills.has(s))
      )
        return false;
      if (!selectedLocations.has(job.location)) return false;
      if (!selectedCompanies.has(job.company)) return false;
      return true;
    });
  }, [
    jobs,
    query,
    typeFilter,
    selectedSkills,
    selectedLocations,
    selectedCompanies,
  ]);

  if (error)
    return <p style={{ textAlign: "center" }}>Failed to load listings.</p>;
  if (isLoading) return <p style={{ textAlign: "center" }}>Loading…</p>;

  // Only show a slice of the filtered jobs
  const visibleJobs = filtered.slice(0, visibleCount);

  return (
    <main className={styles.glassContainer}>
      {/* <h1 className={styles.heading}>MayoCity</h1> */}
      <p className={styles.subtitle}>
        Reach out to companies{' '}
        <span className={styles.highlight}>directly</span>
      </p>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title or company…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <div className={styles.filtersContainer}>
        {/* Type Filter */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Type ▾</button>
          <div className={styles.filterDropdown}>
            <label className={styles.filterItem}>
              <input
                type="checkbox"
                checked={typeFilter.job}
                onChange={() => toggleType("job")}
              />{' '}
              Job
            </label>
            <label className={styles.filterItem}>
              <input
                type="checkbox"
                checked={typeFilter.internship}
                onChange={() => toggleType("internship")}
              />{' '}
              Internship
            </label>
          </div>
        </div>
        {/* Skills Filter */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Skills ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedSkills(new Set(skillOptions))}
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedSkills(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              className={styles.filterSearch}
              type="text"
              placeholder="Search skills…"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
            />
            {skillOptions
              .filter((s) =>
                s.toLowerCase().includes(skillSearch.toLowerCase())
              )
              .map((skill) => (
                <label key={skill} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedSkills.has(skill)}
                    onChange={() => toggleSet(skill, setSelectedSkills)}
                  />{' '}
                  {skill}
                </label>
              ))}
          </div>
        </div>
        {/* Location Filter */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Location ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedLocations(new Set(locationOptions))}
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedLocations(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              className={styles.filterSearch}
              type="text"
              placeholder="Search locations…"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
            {locationOptions
              .filter((l) =>
                l.toLowerCase().includes(locationSearch.toLowerCase())
              )
              .map((loc) => (
                <label key={loc} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedLocations.has(loc)}
                    onChange={() => toggleSet(loc, setSelectedLocations)}
                  />{' '}
                  {loc}
                </label>
              ))}
          </div>
        </div>
        {/* Company Filter */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Company ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedCompanies(new Set(companyOptions))}
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedCompanies(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              className={styles.filterSearch}
              type="text"
              placeholder="Search companies…"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
            />
            {companyOptions
              .filter((c) =>
                c.toLowerCase().includes(companySearch.toLowerCase())
              )
              .map((c) => (
                <label key={c} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedCompanies.has(c)}
                    onChange={() => toggleSet(c, setSelectedCompanies)}
                  />{' '}
                  {c}
                </label>
              ))}
          </div>
        </div>
      </div>
      <section className={styles.listingsContainer}>
        {visibleJobs.map((job) => (
          <ListingCard key={job.id} job={job} />
        ))}
      </section>

      {/* Load More Button */}
      {visibleCount < filtered.length && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            style={{ padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer" }}
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
}
