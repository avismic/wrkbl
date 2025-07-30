import React from "react";
import styles from "./page.module.css";
import { CreditCard, Coffee } from "lucide-react";
import Image from "next/image";

export default function DonatePage() {
  return (
    <main className={styles.container}>
      <div className={styles.contentCard}>
        <h1 className={styles.heading}>Support Mayocity</h1>
        <p className={styles.intro}>
          Mayocity is a project driven by passion, committed to keeping the
          platform open and accessible for everyone. Your support helps us cover
          operational costs and continue to innovate.
        </p>

        <div className={styles.donationBox}>
          <div className={styles.qrSide}>
            <h2 className={styles.subheading}>Scan to Contribute</h2>
            <div className={styles.qrPlaceholder}>
              {/* This is where your QR code image will go */}
              <Image
                src="/upi-qr.jpg"
                alt="Donation UPI QR Code"
                width={200}
                height={200}
                style={{ borderRadius: "8px" }}
              />
              {/* <p>QR Code</p> */}
            </div>
          </div>
          <div className={styles.upiSide}>
            <h2 className={styles.subheading}>Or use UPI ID</h2>
            <div className={styles.upiIdBox}>
              <span className={styles.upiId}>mayocity@slc</span>
              <Coffee className={styles.icon} size={20} />
            </div>
            <p className={styles.supportNote}>
              Every contribution, big or small, makes a significant impact.
              Thank you for being a part of our journey.
            </p>
          </div>
        </div>

        <div className={styles.footerText}>
          <CreditCard size={18} />
          <p>
            Secure donations powered by the Unified Payments Interface (UPI).
          </p>
        </div>
      </div>
    </main>
  );
}
