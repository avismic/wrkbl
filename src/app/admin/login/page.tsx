// src/app/admin/login/page.tsx
"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    getCsrfToken().then((token) => {
      if (typeof token === "string") setCsrfToken(token);
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
      
        

        {/* Title */}
        <h2 className={styles.title}>Welcome back</h2>
        <p className={styles.subtitle}>Please enter your details to sign in.</p>

        {/* Credentials Form */}
        <form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            signIn("credentials", {
              ...Object.fromEntries(data.entries()),
              callbackUrl: "/admin",
            });
          }}
          className={styles.form}
        >
          <input name="csrfToken" type="hidden" value={csrfToken} />
          <div className={styles.inputGroup}>
            <input
              name="username"
              type="text"
              placeholder="Username"
              required
              className={styles.input}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className={styles.input}
            />
          </div>
          <div className={styles.actions}>
            <label className={styles.checkbox}>
              <input type="checkbox" name="remember" />
              Remember me
            </label>
            <button type="submit" className={styles.button}>
              Sign In →
            </button>
          </div>
        </form>

        <div className={styles.or}>OR</div>

        {/* OAuth Buttons */}
        {/* <div className={styles.oauth}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
            className={styles.oauthButton}
          >
            <img src="/icons/google.svg" alt="Google" />
            Continue with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/admin" })}
            className={styles.oauthButton}
          >
            <img src="/icons/github.svg" alt="GitHub" />
            Continue with GitHub
          </button>
        </div> */}

        <p className={styles.footerText}>
          Don’t have an account?{" "}
          <a href="/admin/register" className={styles.link}>
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}
