
import { InclusionItem } from "@/data/inclusions"
import Image from "next/image"

interface VisualBlockProps {
    item: InclusionItem | null
}

export default function VisualBlock({ item }: VisualBlockProps) {
    if (!item) return null

    return (
        <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
            {/* Header Image */}
            <div className="relative aspect-video overflow-hidden">
                <Image
                    src={item.imageUrl || item.image || ''}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                    <span className="bg-deep-slate text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md bg-opacity-90">
                        {item.badge}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-heading font-bold text-brand-charcoal dark:text-gray-100 mb-2 group-hover:text-deep-slate transition-colors">
                    {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 font-display min-h-[40px]">
                    {item.description}
                </p>

                <div className="mt-auto">
                    <ul className="space-y-3">
                        {(item.features || []).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <span className="material-symbols-outlined text-deep-slate text-[18px] shrink-0 mt-0.5">check_circle</span>
                                <span className="font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="h-1 w-full bg-deep-slate/0 group-hover:bg-deep-slate/100 transition-all duration-500"></div>
        </div>
    )
}
