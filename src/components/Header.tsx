// src/components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Brand / Logo */}
      <Link href="/" className={styles.brand}>
        <Image src="/logo.png" alt="MayoCity logo" width={32} height={32} />
        <span className={styles.brandName}>MayoCity</span>
      </Link>

      {/* Nav Links */}
      <nav className={styles.nav}>
        <Link href="/about">About</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/post-a-job">Post a Job</Link>
      </nav>
    </header>
  );
}
