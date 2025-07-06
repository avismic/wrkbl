// src/app/post-requests/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import BulkActionBar from "@/components/BulkActionBar";
import JobForm from "@/components/JobForm/JobForm";
import styles from "./page.module.css";

const fetcher = (u: string) => fetch(u).then(r => r.json());

/* ─── fixed lists (kept for search helpers, review panel) ─── */
const industryOptions = ["Tech","Marketing","Finance","Healthcare","Education"];
const benefitOptions  = ["Health insurance","Paid leave","Flexible working hours","Stock options"];
const currencyOptions = [
  {code:"USD",label:"USD ($)"},{code:"EUR",label:"EUR (€)"},{code:"JPY",label:"JPY (¥)"},
  {code:"GBP",label:"GBP (£)"},{code:"AUD",label:"AUD (A$)"},{code:"CAD",label:"CAD (C$)"},
  {code:"CHF",label:"CHF (CHF)"},{code:"CNY",label:"CNY (¥)"},{code:"SEK",label:"SEK (kr)"},
  {code:"NZD",label:"NZD (NZ$)"},
];

/* ─── types ─── */
interface RawRequest{
  id:string; title:string; company:string;
  city?:string; country?:string; officeType?:string; experienceLevel?:string;
  employmentType?:string; industries?:string|string[]; industry?:string;
  benefits?:string|string[]; visa?:boolean|number; skills?:string|string[];
  url?:string; postedAt?:number; remote?:boolean|number;
  type:"job"|"internship"|"j"|"i";
  salaryLow?:number|string; salaryHigh?:number|string; currency?:string;
}

const arr = (v?:string[]|string)=>Array.isArray(v)?v:(v? v.split(",").map(s=>s.trim()):[]);
const normalise = (r: RawRequest) => ({
  id:r.id, title:r.title||"", company:r.company||"",
  city:r.city||"", country:r.country||"",
  officeType:r.officeType||"", experienceLevel:r.experienceLevel||"",
  employmentType:r.employmentType||"",
  industries:arr((r as any).industries ?? (r as any).industry),
  benefits:arr(r.benefits), visa:!!r.visa, skills:arr(r.skills),
  url:r.url||"", postedAt:r.postedAt??Date.now(), remote:!!r.remote,
  type:r.type==="i"||r.type==="internship"?"internship":"job",
  salaryLow: typeof r.salaryLow==="string"?parseInt(r.salaryLow)||0:r.salaryLow??0,
  salaryHigh:typeof r.salaryHigh==="string"?parseInt(r.salaryHigh)||0:r.salaryHigh??0,
  currency:r.currency||"USD",
});
type JobRequest = ReturnType<typeof normalise>;

export default function RequestsPage(){
  /* data */
  const { data=[], mutate:mutateReq } = useSWR<RawRequest[]>("/api/requests",fetcher);
  const { mutate:mutateJobs }        = useSWR("/api/jobs",fetcher);
  const requests = useMemo(()=>data.map(normalise),[data]);

  /* search & pagination */
  const [query,setQuery]=useState("");
  const [visibleCount,setVisibleCount]=useState(10);
  const filtered = useMemo(()=>{
    const q=query.trim().toLowerCase();
    return requests.filter(j=>
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      `${j.city}, ${j.country}`.toLowerCase().includes(q) ||
      j.skills.some(s=>s.toLowerCase().includes(q))
    );
  },[requests,query]);
  const visible = filtered.slice(0,visibleCount);

  /* edit panel */
  const [editing,setEditing]=useState<JobRequest|null>(null);
  const [savingId,setSavingId]=useState<string|null>(null);

  const saveEdit = async (payload:any)=>{
    setSavingId(payload.id);
    const body = {
      ...payload,
      industry:  payload.industries.join(","),
      benefits:  payload.benefits.join(","),
      skills:    payload.skills.join(","),
      type:      payload.type==="internship"?"i":"j",
      visa:      payload.visa?1:0,
      remote:    payload.remote?1:0,
    };
    delete (body as any).industries;

    await fetch(`/api/requests/${payload.id}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    await mutateReq();
    setSavingId(null);
    setEditing(null);
  };

  /* selection & bulk actions */
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const toggleOne=(id:string)=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>{
    const ids=visible.map(r=>r.id);
    const all=ids.every(i=>selected.has(i));
    setSelected(new Set(all?[]:ids));
  };

  const [loadingBulk,setLoadingBulk]=useState(false);
  const [bulkProgress,setBulkProgress]=useState(0);

  const handlePostSelected = async()=>{
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids=[...selected];
    for(let i=0;i<ids.length;i++){
      await fetch(`/api/requests/${ids[i]}/post`,{method:"POST"});
      setBulkProgress(i+1);
    }
    await mutateReq(); await mutateJobs();
    setSelected(new Set());
    setLoadingBulk(false);
  };

  const handleDeleteSelected = async()=>{
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids=[...selected];
    for(let i=0;i<ids.length;i++){
      await fetch(`/api/requests/${ids[i]}`,{method:"DELETE"});
      setBulkProgress(i+1);
    }
    await mutateReq();
    setSelected(new Set());
    setLoadingBulk(false);
  };

  const handleReviewSelected = async()=>{
    setLoadingBulk(true);
    setBulkProgress(0);
    const ids=[...selected];
    try{
      const rsp = await fetch("/api/review-requests",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ids})
      });
      const {results} = await rsp.json() as {results:Record<string,string>};
      setReviewResults(results);

      const valids = Object.entries(results)
        .filter(([,v])=>v==="valid")
        .map(([id])=>id);
      for(let i=0;i<valids.length;i++){
        await fetch(`/api/requests/${valids[i]}/post`,{method:"POST"});
        setBulkProgress(i+1);
      }
      await mutateReq();
      if(valids.length) await mutateJobs();
    }catch(e){
      console.error(e);
      alert("Gemini review failed.");
    }
    setSelected(new Set());
    setLoadingBulk(false);
  };

  /* Gemini results panel */
  const [reviewResults,setReviewResults]=useState<Record<string,string>|null>(null);

  /* UI */
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pending Job Requests</h1>

      <input
        className={styles.searchInput}
        placeholder="Search title, company, location, skills…"
        value={query}
        onChange={e=>{setQuery(e.target.value);setVisibleCount(10);}}
      />

      {/* edit panel */}
      {editing && (
        <div className={styles.card}>
          <h2>Edit Request</h2>
          <JobForm
            initial={{
              ...editing,
              // convert skills array → comma-string
              skills: editing.skills.join(", "),
            }}
            editMode
            loading={savingId===editing.id}
            onSubmit={saveEdit}
            onCancel={()=>setEditing(null)}
          />
        </div>
      )}

      {/* table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={visible.length>0 && visible.every(r=>selected.has(r.id))}
                onChange={toggleAll}
              />
            </th>
            <th>ID</th>
            <th>Title</th>
            <th>Company</th>
            <th>City</th>
            <th>Country</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map(r => {
            const busy = savingId === r.id;
            return (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={()=>toggleOne(r.id)}
                  />
                </td>
                <td>{r.id}</td>
                <td>{r.title}</td>
                <td>{r.company}</td>
                <td>{r.city}</td>
                <td>{r.country}</td>
                <td>{r.type==="internship" ? "Internship" : "Job"}</td>
                <td className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.edit}`}
                    onClick={()=>setEditing(r)}
                    disabled={busy||editing?.id===r.id}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.primary}`}
                    onClick={async()=>{
                      await fetch(`/api/requests/${r.id}/post`,{method:"POST"});
                      mutateReq(); mutateJobs();
                    }}
                    disabled={busy}
                  >
                    Post
                  </button>
                  <button
                    className={`${styles.button} ${styles.delete}`}
                    onClick={async()=>{
                      await fetch(`/api/requests/${r.id}`,{method:"DELETE"});
                      mutateReq();
                    }}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* bulk bar */}
      {selected.size>0 && (
        <BulkActionBar
          count={selected.size}
          onPostAll={handlePostSelected}
          onDeleteAll={handleDeleteSelected}
          onReviewAll={handleReviewSelected}
          disabled={loadingBulk}
          progress={bulkProgress}
          total={selected.size}
        />
      )}

      {/* load-more */}
      {visibleCount < filtered.length && (
        <div style={{textAlign:"center",marginTop:"1rem"}}>
          <button
            className={styles.loadMore}
            onClick={()=>setVisibleCount(c=>c+10)}
          >
            Load More
          </button>
        </div>
      )}

      {/* Gemini review panel */}
      {reviewResults && (
        <div className={styles.reviewPanel}>
          <h3>Gemini Review</h3>
          <pre>{JSON.stringify(reviewResults,null,2)}</pre>
          <button
            className={`${styles.button} ${styles.delete}`}
            onClick={()=>setReviewResults(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
