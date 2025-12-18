import InclusionsManagement from "@/components/admin/InclusionsManagement";

// Force dynamic since we're fetching data (though we use client fetch mostly)
export const dynamic = 'force-dynamic';

export default async function InclusionsAdminPage() {
    // Initial data fetch can happen here if we want SSR, 
    // or we can leave it to the client component. 
    // For now, let's keep it simple and just render client comp.

    // Actually, passing initial categories is nice for SEO/Performance
    // but since this is Admin, client-side fetch is fine.

    return (
        <div className="max-w-7xl mx-auto">
            <InclusionsManagement initialCategories={[]} />
        </div>
    )
}
