import EditPropertyClient from './EditPropertyClient'

// For static export - return empty array since we can't pre-generate all property pages
export function generateStaticParams() {
    return []
}

export default function EditPropertyPage() {
    return <EditPropertyClient />
}
