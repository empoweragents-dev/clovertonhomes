import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
    title: 'Privacy Policy | Cloverton Homes',
    description: 'How Cloverton Homes collects, uses, stores and protects your personal information.',
}

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            updated="17 June 2026"
            intro="Cloverton Homes (“we”, “us”, “our”) is committed to protecting your privacy. This policy explains how we collect, use, disclose and safeguard your personal information when you use our website and services, in line with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth)."
            sections={[
                {
                    heading: 'Information we collect',
                    body: (
                        <>
                            <p>We only collect information that is reasonably necessary for our functions and activities, including:</p>
                            <ul>
                                <li>Contact details you provide through our enquiry forms — such as your name, email address and phone number;</li>
                                <li>Details about your building or design preferences that you choose to share;</li>
                                <li>Technical data such as your IP address, browser type and pages visited, collected automatically to help us improve the site.</li>
                            </ul>
                        </>
                    ),
                },
                {
                    heading: 'How we use your information',
                    body: (
                        <>
                            <p>We use your personal information to:</p>
                            <ul>
                                <li>Respond to your enquiries and provide the information or services you request;</li>
                                <li>Have one of our consultants contact you about your project;</li>
                                <li>Improve our website, products and customer experience;</li>
                                <li>Meet our legal and regulatory obligations.</li>
                            </ul>
                            <p>We will not use your information for a purpose unrelated to the above without your consent.</p>
                        </>
                    ),
                },
                {
                    heading: 'Disclosure of your information',
                    body: (
                        <p>We do not sell your personal information. We may share it with trusted service providers (for example, our email and hosting providers) who help us operate our website and respond to enquiries, and only to the extent necessary. These providers are required to protect your information and use it only for the services they provide to us.</p>
                    ),
                },
                {
                    heading: 'Data storage and security',
                    body: (
                        <p>We take reasonable steps to protect your personal information from misuse, loss, and unauthorised access, including secure servers and access controls. While we strive to protect your information, no method of transmission over the internet is completely secure.</p>
                    ),
                },
                {
                    heading: 'Cookies',
                    body: (
                        <p>Our website may use cookies and similar technologies to remember your preferences and understand how the site is used. You can disable cookies through your browser settings, though some features may not function as intended.</p>
                    ),
                },
                {
                    heading: 'Accessing and correcting your information',
                    body: (
                        <p>You may request access to the personal information we hold about you, or ask us to correct it if it is inaccurate or out of date. To make a request, please use our contact form and we will respond within a reasonable time.</p>
                    ),
                },
                {
                    heading: 'Changes to this policy',
                    body: (
                        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
                    ),
                },
            ]}
        />
    )
}
