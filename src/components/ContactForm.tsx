'use client'

export default function ContactForm() {
    return (
        <section className="py-16 px-5 bg-gray-100">
            <div className="max-w-md mx-auto w-full">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-heading text-2xl font-bold text-brand-charcoal mb-2">
                        Start Your Journey
                    </h2>
                    <p className="text-gray-500 mb-6 text-sm">How can we best support you today?</p>
                    <form className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                                I am interested in
                            </label>
                            <div className="relative">
                                <select className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 pl-4 pr-10 text-sm focus:border-brand-teal focus:ring-brand-teal appearance-none">
                                    <option>Building a New Home</option>
                                    <option>House &amp; Land Packages</option>
                                    <option>Knockdown Rebuild</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                                    expand_more
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                                    First Name
                                </label>
                                <input
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-sm focus:border-brand-teal focus:ring-brand-teal"
                                    placeholder="Jane"
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-sm focus:border-brand-teal focus:ring-brand-teal"
                                    placeholder="Doe"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                                Email
                            </label>
                            <input
                                className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-sm focus:border-brand-teal focus:ring-brand-teal"
                                placeholder="jane@example.com"
                                type="email"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-brand-charcoal uppercase tracking-wider mb-1.5">
                                Phone
                            </label>
                            <input
                                className="w-full rounded-xl border-gray-200 bg-gray-50 py-3 text-sm focus:border-brand-teal focus:ring-brand-teal"
                                placeholder="0400 000 000"
                                type="tel"
                            />
                        </div>
                        <button
                            className="mt-2 w-full rounded-xl bg-brand-teal py-4 text-center font-bold text-white transition-transform active:scale-95 shadow-lg hover:shadow-xl hover:bg-brand-teal/90"
                            type="button"
                        >
                            Request Information
                        </button>
                    </form>
                    <p className="mt-6 text-center text-xs text-gray-400">
                        Your details are safe. View our <a className="underline" href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </section>
    )
}
