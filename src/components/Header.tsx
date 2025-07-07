'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* Brand / Logo */}
          <Link href="/" className={styles.brand}>
            {/* <Image src="/logo.png" alt="MayoCity logo" width={32} height={32} /> */}
            <span className={styles.brandName}>mayocity</span>
          </Link>

          {/* Mobile “hamburger” */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Nav links */}
          <nav className={`${styles.nav} ${menuOpen ? styles.navActive : ''}`}>
            <Link href="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="/post-a-job" onClick={() => setMenuOpen(false)}>
              Post a Job
            </Link>
          </nav>
        </div>
      </header>

      {/* Spacer to push page content below the fixed header */}
      <div className={styles.spacer} />
    </>
  );
}
