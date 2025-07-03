// src/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Brand & Address */}
      <div className={styles.brand}>
        <Image
          src="/logo.png"
          alt="DirectApply logo"
          width={110}
          height={110}
        />
        <div className={styles.address}>
          <h2>MayoCity</h2>
          <address>
            Jamshedpur
            <br />
            Jharkhand
            <br />
            India
            <br />
          </address>
        </div>
      </div>

      {/* Links */}
      <div className={styles.links}>
        <ul>
          <li>
            <Link href="/about">About Us</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
          <li>
            <Link href="/how-to-use">How To Use</Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link href="/work-with-us">Work With Us</Link>
          </li>
          <li>
            <Link href="/resources">Resources</Link>
          </li>
          <li>
            <Link href="/faq">FAQ</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
