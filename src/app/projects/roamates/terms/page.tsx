'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RoamatesTermsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/projects/roamates">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Roamates
            </motion.button>
          </Link>
          <Link href="/" className="text-xl font-bold text-white">
            ephileo
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              backgroundColor: '#10B98120',
              color: '#10B981',
            }}
          >
            Roamates
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Terms and Conditions
          </h1>

          <p className="text-zinc-400 mb-8">
            <strong>Last Updated:</strong> June 14, 2026
          </p>

          <div className="prose prose-invert prose-zinc max-w-none">
            {/* Section 1 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                By downloading, installing, or using the Roamates mobile application (&quot;App&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, do not use the App.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or &quot;your&quot;) and Ephileo (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), the developer of Roamates.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Roamates is a mobile application that provides:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li><strong className="text-zinc-300">Group Expense Management:</strong> Create, track, and split shared expenses using multiple split types (equal, exact, percentage, and shares)</li>
                <li><strong className="text-zinc-300">Receipt Scanning:</strong> Scan receipts with your device camera or photo library to automatically extract and split itemized expenses</li>
                <li><strong className="text-zinc-300">Multi-Currency Support:</strong> Record expenses in 180+ currencies</li>
                <li><strong className="text-zinc-300">Settlement &amp; Payment Tracking:</strong> Track payments and settle debts between users, including smart debt netting to minimize transactions</li>
                <li><strong className="text-zinc-300">CSV Import:</strong> Bulk import expenses from external sources</li>
                <li><strong className="text-zinc-300">Location Sharing:</strong> Share your real-time location with friends and group members</li>
                <li><strong className="text-zinc-300">Trip Planning:</strong> Organize group trips with destinations, timelines, and expense tracking</li>
                <li><strong className="text-zinc-300">Task Management:</strong> Create and assign tasks and to-do lists within groups</li>
                <li><strong className="text-zinc-300">Group Management:</strong> Create and manage various group types (home, trips, couples, etc.)</li>
                <li><strong className="text-zinc-300">Activity Feed:</strong> View all group activities and updates</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">3. Eligibility</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                By using the App, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>You are at least 13 years of age (or the minimum age required in your country to use online services)</li>
                <li>If you are under 18, you have parental or guardian consent to use the App</li>
                <li>You are not prohibited from using the App under any applicable laws</li>
                <li>All information you provide is accurate and truthful</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Users under 13 are not permitted to use Roamates in compliance with the Children&apos;s Online Privacy Protection Act (COPPA).
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">4. Account Registration</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 Account Creation</h3>
              <p className="text-zinc-400 leading-relaxed">
                To use Roamates, you must create an account. You may register using email and password, or sign in with a third-party provider (Google, Apple, or Facebook). When you use social sign-in, we receive basic profile information (such as your name and email address) from that provider in accordance with their terms and your privacy settings.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 Account Security</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.3 Account Information</h3>
              <p className="text-zinc-400 leading-relaxed">
                You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">5. User Data and Privacy</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.1 Data We Collect</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                By using Roamates, you consent to the collection of:
              </p>

              <p className="text-zinc-300 font-semibold mb-2">Personal Information:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4 mb-4">
                <li>Name, email address, phone number</li>
                <li>Profile preferences (emoji, color, currency)</li>
              </ul>

              <p className="text-zinc-300 font-semibold mb-2">Location Data:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4 mb-4">
                <li>Real-time GPS coordinates when location sharing is enabled</li>
                <li>Location history and timestamps</li>
                <li>Background location data (when permitted)</li>
              </ul>

              <p className="text-zinc-300 font-semibold mb-2">Financial Data:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4 mb-4">
                <li>Expense details and amounts</li>
                <li>Payment transactions and settlements</li>
                <li>Currency preferences and budgets</li>
              </ul>

              <p className="text-zinc-300 font-semibold mb-2">Photos and Camera Data (with your permission):</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4 mb-4">
                <li>Receipt images you capture with your camera or select from your photo library</li>
                <li>Text extracted from receipts via on-device optical character recognition (OCR)</li>
              </ul>

              <p className="text-zinc-300 font-semibold mb-2">Device and Usage Information:</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4 mb-4">
                <li>Device identifiers and platform type</li>
                <li>Push notification tokens</li>
                <li>Analytics and usage data to help us understand and improve the App</li>
              </ul>

              <p className="text-zinc-300 font-semibold mb-2">Contact Data (with your permission):</p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Contact names, emails, and phone numbers from your device</li>
                <li>Contact data is hashed for privacy-preserving friend matching</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.2 How We Use Your Data</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Your data is used to:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Provide and improve the App&apos;s functionality</li>
                <li>Enable expense sharing and settlement calculations</li>
                <li>Facilitate location sharing with your chosen contacts</li>
                <li>Send notifications about group activities</li>
                <li>Match you with friends who also use the App</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.3 Data Sharing</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We do not sell your personal data. Your data may be shared:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>With group members you choose to share with</li>
                <li>With third-party service providers (Google Maps, Firebase) to operate the App</li>
                <li>When required by law or legal process</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">5.4 Data Security</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Password hashing</li>
                <li>Encrypted data transmission</li>
                <li>Token-based authentication</li>
                <li>Contact data hashing (SHA-256)</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">6. Location Services</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 Location Permissions</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Roamates offers location sharing features that require your permission:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li><strong className="text-zinc-300">When In Use:</strong> Location tracked only while the App is open</li>
                <li><strong className="text-zinc-300">Always:</strong> Location tracked in the background to keep friends updated</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Location Sharing Control</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You have full control over location sharing:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Enable or disable location tracking at any time</li>
                <li>Choose which friends and groups receive your location</li>
                <li>Set expiration times for shared locations</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.3 Location Data Usage</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Your location data is:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Shared only with users you explicitly authorize</li>
                <li>Used to display your position on shared maps</li>
                <li>Never sold to third parties</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">7. Expense and Payment Features</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.1 Expense Tracking</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Roamates is a tool to track and calculate shared expenses. You understand that:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>The App does not process actual financial transactions</li>
                <li>Expense calculations are for informational purposes</li>
                <li>Settlement of debts occurs outside the App between users</li>
                <li>We are not responsible for disputes between users regarding expenses</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.2 Accuracy of Information</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You are solely responsible for:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>The accuracy of expense amounts entered</li>
                <li>Verifying expense splits and settlements</li>
                <li>Resolving payment disputes with other users</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">7.3 No Financial Services</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Roamates does not:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Transfer money between users</li>
                <li>Process payments or credit cards</li>
                <li>Provide banking or financial services</li>
                <li>Guarantee payment of recorded debts</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">8. User Conduct</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Use the App for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Submit false or misleading information</li>
                <li>Attempt to gain unauthorized access to the App or its systems</li>
                <li>Interfere with or disrupt the App&apos;s operation</li>
                <li>Use the App&apos;s location features to stalk or track users without consent</li>
                <li>Share another user&apos;s location or personal information without permission</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">9. User-Generated Content</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.1 Content Ownership</h3>
              <p className="text-zinc-400 leading-relaxed">
                You retain ownership of content you create (expenses, tasks, group names). By submitting content, you grant us a license to use, store, and display it as necessary to operate the App.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.2 Content Responsibility</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You are solely responsible for all content you submit and must ensure it:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Does not violate any laws</li>
                <li>Does not infringe on others&apos; rights</li>
                <li>Is accurate and not misleading</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">9.3 Content Removal</h3>
              <p className="text-zinc-400 leading-relaxed">
                We reserve the right to remove any content that violates these Terms.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Services</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Roamates uses third-party services including:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li><strong className="text-zinc-300">Google Maps &amp; Mapbox:</strong> For mapping and location features</li>
                <li><strong className="text-zinc-300">Google ML Kit:</strong> For on-device receipt text recognition (OCR)</li>
                <li><strong className="text-zinc-300">Firebase:</strong> For push notifications, authentication, and analytics</li>
                <li><strong className="text-zinc-300">Google, Apple, and Facebook:</strong> For optional social sign-in</li>
                <li><strong className="text-zinc-300">PostHog:</strong> For product analytics and app improvement</li>
                <li><strong className="text-zinc-300">Email Delivery:</strong> For transactional emails such as password resets and verification</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Your use of these services is subject to their respective terms and privacy policies. We are not responsible for the practices of third-party services.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">11. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.1 App Ownership</h3>
              <p className="text-zinc-400 leading-relaxed">
                The App, including its design, features, and content (excluding user-generated content), is owned by Ephileo and protected by intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.2 Limited License</h3>
              <p className="text-zinc-400 leading-relaxed">
                We grant you a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">11.3 Restrictions</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You may not:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Copy, modify, or distribute the App</li>
                <li>Reverse engineer or decompile the App</li>
                <li>Remove any proprietary notices</li>
                <li>Use the App for commercial purposes without permission</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">12. Push Notifications</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                By enabling push notifications, you consent to receive:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Expense and payment notifications</li>
                <li>Group activity updates</li>
                <li>Settlement reminders</li>
                <li>Task assignments and updates</li>
                <li>Location sharing notifications</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                You may disable notifications at any time through your device settings.
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">13. Disclaimers</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.1 &quot;As Is&quot; Service</h3>
              <p className="text-zinc-400 leading-relaxed">
                THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.2 No Guarantee</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We do not guarantee that:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>The App will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The App is free of viruses or harmful components</li>
                <li>Results from using the App will be accurate or reliable</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">13.3 Financial Disclaimer</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Financial disputes between users</li>
                <li>Inaccurate expense calculations due to user error</li>
                <li>Non-payment of recorded debts</li>
                <li>Any financial loss arising from use of the App</li>
              </ul>
            </section>

            {/* Section 14 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">14. Limitation of Liability</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability shall not exceed the amount you paid for the App (if any)</li>
                <li>We are not liable for actions taken by other users</li>
                <li>We are not liable for any issues arising from third-party services</li>
              </ul>
            </section>

            {/* Section 15 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">15. Indemnification</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                You agree to indemnify and hold harmless Ephileo, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Your use of the App</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another person or entity</li>
                <li>Content you submit to the App</li>
              </ul>
            </section>

            {/* Section 16 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">16. Modifications to Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the App. Your continued use of the App after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Section 17 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">17. Termination</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">17.1 By You</h3>
              <p className="text-zinc-400 leading-relaxed">
                You may stop using the App at any time.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">17.2 By Us</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We may suspend or terminate your access if you:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Abuse or harm other users</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">17.3 Effect of Termination</h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Upon termination:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2 ml-4">
                <li>Your right to use the App ceases immediately</li>
                <li>We may retain your data as required by law</li>
                <li>Group data you contributed may remain visible to other group members</li>
              </ul>
            </section>

            {/* Section 18 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">18. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">18.1 Informal Resolution</h3>
              <p className="text-zinc-400 leading-relaxed">
                Before filing any legal claim, you agree to try to resolve disputes informally by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">18.2 Governing Law</h3>
              <p className="text-zinc-400 leading-relaxed">
                These Terms are governed by the laws of the United States, without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">18.3 Jurisdiction</h3>
              <p className="text-zinc-400 leading-relaxed">
                Any legal proceedings shall be brought in the courts located in the United States.
              </p>
            </section>

            {/* Section 19 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">19. General Provisions</h2>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">19.1 Entire Agreement</h3>
              <p className="text-zinc-400 leading-relaxed">
                These Terms constitute the entire agreement between you and Ephileo regarding the App.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">19.2 Severability</h3>
              <p className="text-zinc-400 leading-relaxed">
                If any provision is found unenforceable, the remaining provisions will continue in effect.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">19.3 Waiver</h3>
              <p className="text-zinc-400 leading-relaxed">
                Our failure to enforce any right or provision does not constitute a waiver.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">19.4 Assignment</h3>
              <p className="text-zinc-400 leading-relaxed">
                You may not assign your rights under these Terms. We may assign our rights without restriction.
              </p>
            </section>

            {/* Section 20 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">20. Contact Information</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-zinc-300 mb-2">
                  <strong>Ephileo</strong>
                </p>
                <p className="text-zinc-300 mb-2">
                  <strong>Website:</strong>{' '}
                  <a href="https://ephileo.us" target="_blank" rel="noopener noreferrer" className="text-[#10B981] hover:underline">
                    ephileo.us
                  </a>
                </p>
                <p className="text-zinc-300">
                  <strong>App:</strong> Roamates (us.ephileo.roamates)
                </p>
              </div>
            </section>

            {/* Section 21 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">21. Acknowledgment</h2>
              <p className="text-zinc-400 leading-relaxed">
                By using Roamates, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </section>
          </div>

          {/* Footer note */}
          <div className="border-t border-zinc-800 pt-8 mt-12">
            <p className="text-zinc-500 text-center">
              <strong className="text-zinc-400">Copyright &copy; 2025 Bharath Bandaru. All rights reserved.</strong>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold text-white">
            ephileo
          </Link>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Ephileo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
