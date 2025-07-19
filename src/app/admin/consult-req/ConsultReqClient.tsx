// src/app/admin/consult-req/ConsultReqClient.tsx

"use client";

import React from "react";
import useSWR from "swr";
import styles from "../AdminPageClient.module.css"; // We can reuse the admin styles

interface Consultation {
  id: number;
  name: string;
  company: string;
  email: string;
  message: string;
  submittedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ConsultReqClient() {
  const {
    data: consultations,
    error,
    isLoading,
  } = useSWR<Consultation[]>("/api/consultation", fetcher, {
    // This option tells SWR to re-fetch the data whenever the browser tab is focused.
    // This is perfect for an admin panel where you might submit data in another tab
    // and then switch back to see the results.
    revalidateOnFocus: true,
  });

  // We no longer need the explicit useEffect to call mutate()

  if (error)
    return <div className={styles.container}>Failed to load requests.</div>;
  if (isLoading || !consultations)
    return <div className={styles.container}>Loading...</div>;

  // Safely handle cases where the API might not return an array
  const consultationList = Array.isArray(consultations) ? consultations : [];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consultation Requests</h1>
      <p style={{ marginBottom: "2rem" }}>
        {consultationList.length} request{consultationList.length !== 1 && "s"}{" "}
        found.
      </p>

      <section className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {consultationList.map((req) => (
              <tr key={req.id}>
                <td>{new Date(req.submittedAt).toLocaleString()}</td>
                <td>{req.name}</td>
                <td>{req.company}</td>
                <td>
                  <a href={`mailto:${req.email}`} style={{ color: "#69c1ff" }}>
                    {req.email}
                  </a>
                </td>
                <td style={{ whiteSpace: "pre-wrap", maxWidth: "400px" }}>
                  {req.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
