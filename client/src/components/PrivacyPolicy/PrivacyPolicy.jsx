import React from 'react';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
    return (
        <main className={styles.container}>
            <h1 className={styles.heading}>Privacy Policy</h1>
            <p className={styles.paragraph}>Effective Date: May 26, 2025</p>

            <p className={styles.paragraph}>
                ReFind ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains
                what data we collect, how we use it, and your rights regarding that data.
            </p>

            <h2 className={styles.subHeading}>1. Information We Collect</h2>
            <ul className={styles.list}>
                <li className={styles.listItem}>Email address, name, and profile photo via OAuth (Google/Facebook)</li>
                <li className={styles.listItem}>Uploaded images, chat messages, and item metadata</li>
                <li className={styles.listItem}>Geolocation (optional, for maps)</li>
                <li className={styles.listItem}>Device, IP address, and browser type</li>
                <li className={styles.listItem}>Cookies and usage analytics (anonymized)</li>
            </ul>

            <h2 className={styles.subHeading}>2. How We Use Your Data</h2>
            <ul className={styles.list}>
                <li className={styles.listItem}>To authenticate and manage user accounts</li>
                <li className={styles.listItem}>To allow item posting, searching, and matching</li>
                <li className={styles.listItem}>To power chat and notifications</li>
                <li className={styles.listItem}>To improve user experience and platform analytics</li>
                <li className={styles.listItem}>To process payments securely</li>
            </ul>

            <h2 className={styles.subHeading}>3. Sharing and Disclosure</h2>
            <p className={styles.paragraph}>
                We do not sell your personal information. We may share data with trusted third-party services (e.g.,
                cloud storage, email providers, payment systems) solely to support our functionality.
            </p>

            <h2 className={styles.subHeading}>4. Security</h2>
            <p className={styles.paragraph}>
                Your data is protected using encryption (HTTPS), hashed passwords, and access control. We regularly
                monitor for vulnerabilities and apply best practices.
            </p>

            <h2 className={styles.subHeading}>5. Your Rights</h2>
            <ul className={styles.list}>
                <li className={styles.listItem}>Request access, correction, or deletion of your data</li>
                <li className={styles.listItem}>Withdraw consent to data processing</li>
                <li className={styles.listItem}>Export your data by request</li>
            </ul>

            <h2 className={styles.subHeading}>6. Cookies</h2>
            <p className={styles.paragraph}>
                We use cookies to remember preferences and track anonymous usage. You can control cookies through your
                browser settings.
            </p>

            <h2 className={styles.subHeading}>7. Legal Compliance</h2>
            <p className={styles.paragraph}>
                We follow applicable laws such as the GDPR and Ukraine's data protection legislation.
            </p>

            <h2 className={styles.subHeading}>8. Contact</h2>
            <p className={styles.paragraph}>
                If you have questions, contact us at:
                <p><a href="mailto:rostyslav.tarasov@nure.ua" className={styles.link}>rostyslav.tarasov@nure.ua</a></p>
                <p><a href="mailto:mykyta.khudiienko@nure.ua" className={styles.link}>mykyta.khudiienko@nure.ua</a></p>
                <p><a href="mailto:nazar.poturaiko@nure.ua" className={styles.link}>nazar.poturaiko@nure.ua</a></p>
                <p><a href="mailto:vsevolod.nevmovenko@nure.ua" className={styles.link}>vsevolod.nevmovenko@nure.ua</a>
                </p>
                <p><a href="mailto:viktoriia.shchuka@nure.ua" className={styles.link}>viktoriia.shchuka@nure.ua</a></p>

            </p>
            <p className={styles.footer}>© 2025 ReFind. All rights reserved.</p>
        </main>
    );
};

export default PrivacyPolicy;
