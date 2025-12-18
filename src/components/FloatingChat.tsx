'use client'

export default function FloatingChat() {
    return (
        <div className="fixed bottom-6 right-6 z-40">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-2xl hover:scale-110 transition-transform hover:bg-brand-teal/90 group relative overflow-hidden">
                <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            </button>
        </div>
    )
}
