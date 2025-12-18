export default function PropertySpecs() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#d8dcde] bg-white dark:bg-gray-800 text-center hover:border-brand-teal/30 transition-colors">
                <span className="material-symbols-outlined text-brand-teal text-3xl mb-1">bed</span>
                <span className="font-bold text-brand-charcoal dark:text-white font-heading">4 Bed</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#d8dcde] bg-white dark:bg-gray-800 text-center hover:border-brand-teal/30 transition-colors">
                <span className="material-symbols-outlined text-brand-teal text-3xl mb-1">bathtub</span>
                <span className="font-bold text-brand-charcoal dark:text-white font-heading">2 Bath</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#d8dcde] bg-white dark:bg-gray-800 text-center hover:border-brand-teal/30 transition-colors">
                <span className="material-symbols-outlined text-brand-teal text-3xl mb-1">directions_car</span>
                <span className="font-bold text-brand-charcoal dark:text-white font-heading">2 Car</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-[#d8dcde] bg-white dark:bg-gray-800 text-center hover:border-brand-teal/30 transition-colors">
                <span className="material-symbols-outlined text-brand-teal text-3xl mb-1">square_foot</span>
                <span className="font-bold text-brand-charcoal dark:text-white font-heading">240m²</span>
            </div>
        </div>
    )
}
