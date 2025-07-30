// src/app/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import ListingCard, { Job } from "@/components/ListingCard";
import styles from "./page.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  const {
    data: jobs = [],
    error,
    isLoading,
  } = useSWR<Job[]>("/api/jobs", fetcher);

  /* ────────────── search bar & type filter ────────────── */
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState({
    job: true,
    internship: true,
  });
  const toggleType = (key: "job" | "internship") =>
    setTypeFilter((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ────────────── option lists ────────────── */
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [experienceOptions, setExperienceOptions] = useState<string[]>([]);
  const [officeTypeOptions, setOfficeTypeOptions] = useState<string[]>([]);
  const [employmentOptions, setEmploymentOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);

  /* ────────────── selected sets ────────────── */
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set()
  );
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(
    new Set()
  );
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(
    new Set()
  );
  const [selectedOfficeTypes, setSelectedOfficeTypes] = useState<Set<string>>(
    new Set()
  );
  const [selectedEmployments, setSelectedEmployments] = useState<Set<string>>(
    new Set()
  );
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(
    new Set()
  );

  /* ────────────── search boxes inside dropdowns ────────────── */
  const [skillSearch, setSkillSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [experienceSearch, setExperienceSearch] = useState("");
  const [officeTypeSearch, setOfficeTypeSearch] = useState("");
  const [employmentSearch, setEmploymentSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");

  /* ────────────── once-only init of option arrays ────────────── */
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current || jobs.length === 0) return;
    inited.current = true;

    // Skills
    const skills = Array.from(new Set(jobs.flatMap((j) => j.skills))).sort();
    setSkillOptions(skills);
    setSelectedSkills(new Set(skills));

    // Locations (City, Country)
    const locs = Array.from(
      new Set(jobs.map((j) => `${j.city}, ${j.country}`))
    ).sort();
    setLocationOptions(locs);
    setSelectedLocations(new Set(locs));

    // Companies
    const comps = Array.from(new Set(jobs.map((j) => j.company))).sort();
    setCompanyOptions(comps);
    setSelectedCompanies(new Set(comps));

    // Experience Levels
    const exps = Array.from(new Set(jobs.map((j) => j.experienceLevel))).sort();
    setExperienceOptions(exps);
    setSelectedExperiences(new Set(exps));

    // Office Types
    const offices = Array.from(new Set(jobs.map((j) => j.officeType))).sort();
    setOfficeTypeOptions(offices);
    setSelectedOfficeTypes(new Set(offices));

    // Employment Types
    const emps = Array.from(new Set(jobs.map((j) => j.employmentType))).sort();
    setEmploymentOptions(emps);
    setSelectedEmployments(new Set(emps));

    // Industries
    const inds = Array.from(new Set(jobs.flatMap((j) => j.industries))).sort();
    setIndustryOptions(inds);
    setSelectedIndustries(new Set(inds));
  }, [jobs]);

  

  /* ────────────── helper: toggle a generic Set<string> ────────────── */
  const toggleSet = (
    value: string,
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>
  ) =>
    setFn((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });

  /* ────────────── Reset all filters ────────────── */
  const resetFilters = () => {
    setTypeFilter({ job: true, internship: true });
    setQuery("");

    setSelectedSkills(new Set(skillOptions));
    setSelectedLocations(new Set(locationOptions));
    setSelectedCompanies(new Set(companyOptions));
    setSelectedExperiences(new Set(experienceOptions));
    setSelectedOfficeTypes(new Set(officeTypeOptions));
    setSelectedEmployments(new Set(employmentOptions));
    setSelectedIndustries(new Set(industryOptions));

    setSkillSearch("");
    setLocationSearch("");
    setCompanySearch("");
    setExperienceSearch("");
    setOfficeTypeSearch("");
    setEmploymentSearch("");
    setIndustrySearch("");
  };

  /* ────────────── filtered list ────────────── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      // if (
      //   q &&
      //   !job.title.toLowerCase().includes(q) &&
      //   !job.company.toLowerCase().includes(q)
      // )
      //   return false;

      if (q) {
        const inTitle = job.title.toLowerCase().includes(q);
        const inCompany = job.company.toLowerCase().includes(q);
        const inSkills = job.skills.some((s) => s.toLowerCase().includes(q));
        const inExp = job.experienceLevel.toLowerCase().includes(q);
        const inEmp = job.employmentType.toLowerCase().includes(q);

        if (!(inTitle || inCompany || inSkills || inExp || inEmp)) {
          return false;
        }
      }

      if (!typeFilter[job.type]) return false;
      if (selectedSkills.size && !job.skills.some((s) => selectedSkills.has(s)))
        return false;

      const locStr = `${job.city}, ${job.country}`;
      if (!selectedLocations.has(locStr)) return false;

      if (!selectedCompanies.has(job.company)) return false;
      if (!selectedExperiences.has(job.experienceLevel)) return false;
      if (!selectedOfficeTypes.has(job.officeType)) return false;
      if (!selectedEmployments.has(job.employmentType)) return false;
      if (
        selectedIndustries.size &&
        !job.industries.some((i) => selectedIndustries.has(i))
      )
        return false;

      return true;
    });
  }, [
    jobs,
    query,
    typeFilter,
    selectedSkills,
    selectedLocations,
    selectedCompanies,
    selectedExperiences,
    selectedOfficeTypes,
    selectedEmployments,
    selectedIndustries,
  ]);

  /* ────────────── load-more pagination ────────────── */
  const [visibleCount, setVisibleCount] = useState(10);
  const visibleJobs = filtered.slice(0, visibleCount);

  /* ────────────── early returns ────────────── */
  if (error)
    return <p style={{ textAlign: "center" }}>Failed to load listings.</p>;
  if (isLoading) return <p style={{ textAlign: "center" }}>Loading…</p>;

  return (
    <main className={styles.glassContainer}>
      <p className={styles.subtitle}>
        Reach out to companies{" "}
        <span className={styles.highlight}>directly</span>
      </p>

      {/* search bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title or company or skills or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* all your filter dropdowns */}
      <div className={styles.filtersContainer}>
        {/* 1) Type */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Type ▾</button>
          <div className={styles.filterDropdown}>
            <label className={styles.filterItem}>
              <input
                type="checkbox"
                checked={typeFilter.job}
                onChange={() => toggleType("job")}
              />{" "}
              Job
            </label>
            <label className={styles.filterItem}>
              <input
                type="checkbox"
                checked={typeFilter.internship}
                onChange={() => toggleType("internship")}
              />{" "}
              Internship
            </label>
          </div>
        </div>

        {/* 2) Skills */}
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
              type="text"
              placeholder="Search skills…"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className={styles.filterSearch}
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
                  />{" "}
                  {skill}
                </label>
              ))}
          </div>
        </div>

        {/* 3) Location */}
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
              type="text"
              placeholder="Search locations…"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              className={styles.filterSearch}
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
                  />{" "}
                  {loc}
                </label>
              ))}
          </div>
        </div>

        {/* 4) Company */}
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
              type="text"
              placeholder="Search companies…"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className={styles.filterSearch}
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
                  />{" "}
                  {c}
                </label>
              ))}
          </div>
        </div>

        {/* 5) Experience Level */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Experience ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() =>
                  setSelectedExperiences(new Set(experienceOptions))
                }
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedExperiences(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              type="text"
              placeholder="Search experience…"
              value={experienceSearch}
              onChange={(e) => setExperienceSearch(e.target.value)}
              className={styles.filterSearch}
            />
            {experienceOptions
              .filter((exp) =>
                exp.toLowerCase().includes(experienceSearch.toLowerCase())
              )
              .map((exp) => (
                <label key={exp} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedExperiences.has(exp)}
                    onChange={() => toggleSet(exp, setSelectedExperiences)}
                  />{" "}
                  {exp}
                </label>
              ))}
          </div>
        </div>

        {/* 6) Office Type */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Location Type ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() =>
                  setSelectedOfficeTypes(new Set(officeTypeOptions))
                }
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedOfficeTypes(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              type="text"
              placeholder="Search types…"
              value={officeTypeSearch}
              onChange={(e) => setOfficeTypeSearch(e.target.value)}
              className={styles.filterSearch}
            />
            {officeTypeOptions
              .filter((o) =>
                o.toLowerCase().includes(officeTypeSearch.toLowerCase())
              )
              .map((office) => (
                <label key={office} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedOfficeTypes.has(office)}
                    onChange={() => toggleSet(office, setSelectedOfficeTypes)}
                  />{" "}
                  {office}
                </label>
              ))}
          </div>
        </div>

        {/* 7) Employment Type */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Employment ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() =>
                  setSelectedEmployments(new Set(employmentOptions))
                }
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedEmployments(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              type="text"
              placeholder="Search employment…"
              value={employmentSearch}
              onChange={(e) => setEmploymentSearch(e.target.value)}
              className={styles.filterSearch}
            />
            {employmentOptions
              .filter((emp) =>
                emp.toLowerCase().includes(employmentSearch.toLowerCase())
              )
              .map((emp) => (
                <label key={emp} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedEmployments.has(emp)}
                    onChange={() => toggleSet(emp, setSelectedEmployments)}
                  />{" "}
                  {emp}
                </label>
              ))}
          </div>
        </div>

        {/* 8) Industry */}
        <div className={styles.filterContainer}>
          <button className={styles.filterLabel}>Industry ▾</button>
          <div className={styles.filterDropdown}>
            <div className={styles.filterActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedIndustries(new Set(industryOptions))}
              >
                Select All
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedIndustries(new Set())}
              >
                Unselect All
              </button>
            </div>
            <input
              type="text"
              placeholder="Search industries…"
              value={industrySearch}
              onChange={(e) => setIndustrySearch(e.target.value)}
              className={styles.filterSearch}
            />
            {industryOptions
              .filter((i) =>
                i.toLowerCase().includes(industrySearch.toLowerCase())
              )
              .map((ind) => (
                <label key={ind} className={styles.filterItem}>
                  <input
                    type="checkbox"
                    checked={selectedIndustries.has(ind)}
                    onChange={() => toggleSet(ind, setSelectedIndustries)}
                  />{" "}
                  {ind}
                </label>
              ))}
          </div>
        </div>
      </div>

      {/* results + reset */}
      <div className={styles.resultsBar}>
        <span className={styles.resultsText}>
          {filtered.length} result{filtered.length !== 1 && "s"}
        </span>
        <button className={styles.resetBtn} onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      {/* listings */}
      <section className={styles.listingsContainer}>
        {visibleJobs.map((job) => (
          <ListingCard key={job.id} job={job} />
        ))}
      </section>

      {/* load more */}
      {visibleCount < filtered.length && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Load More
          </button>
        </div>
      )}
    </main>
  );
} //original 
