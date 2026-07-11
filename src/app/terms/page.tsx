import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = {
    title: 'Terms & Conditions | Cloverton Homes',
    description: 'The terms and conditions governing your use of the Cloverton Homes website.',
}

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms & Conditions"
            updated="17 June 2026"
            intro="These Terms & Conditions govern your access to and use of the Cloverton Homes website. By using this website, you agree to be bound by these terms. If you do not agree, please do not use the site."
            sections={[
                {
                    heading: 'Use of this website',
                    body: (
                        <p>You may use this website for lawful purposes only. You agree not to use the site in any way that could damage, disable or impair it, or interfere with any other party’s use of the site.</p>
                    ),
                },
                {
                    heading: 'Information is general in nature',
                    body: (
                        <p>The content on this website — including home designs, inclusions, pricing and imagery — is provided for general information only. It may change without notice and does not constitute a contract, offer, or guarantee. Floor plans, façades and inclusions are indicative and may vary by region, estate, site conditions and selections.</p>
                    ),
                },
                {
                    heading: 'Pricing',
                    body: (
                        <p>Any prices shown are indicative “from” prices, may exclude site costs and selections, and are subject to change. Pricing is confirmed only in a written contract. Nothing on this website should be relied upon as a final quotation.</p>
                    ),
                },
                {
                    heading: 'Enquiries',
                    body: (
                        <p>When you submit an enquiry through our forms, you confirm that the details you provide are accurate and that you consent to us contacting you about your enquiry. Submitting an enquiry does not create any contractual obligation on either party.</p>
                    ),
                },
                {
                    heading: 'Intellectual property',
                    body: (
                        <p>All content on this website, including text, graphics, logos, images and designs, is the property of Cloverton Homes or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute or use any content without our prior written permission.</p>
                    ),
                },
                {
                    heading: 'Third-party links',
                    body: (
                        <p>This website may contain links to third-party websites. We are not responsible for the content, accuracy or practices of those websites and provide such links for convenience only.</p>
                    ),
                },
                {
                    heading: 'Limitation of liability',
                    body: (
                        <p>To the maximum extent permitted by law, Cloverton Homes is not liable for any loss or damage arising from your use of, or reliance on, this website or its content. Nothing in these terms excludes rights you may have under the Australian Consumer Law.</p>
                    ),
                },
                {
                    heading: 'Changes to these terms',
                    body: (
                        <p>We may update these Terms & Conditions from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>
                    ),
                },
            ]}
        />
    )
}
