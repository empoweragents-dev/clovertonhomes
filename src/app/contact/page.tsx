'use client'

import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
    return (
        <div className="bg-background-light min-h-screen">
            {/* Header Section */}
            <section className="bg-deep-slate text-white py-20 px-6">
                <div className="max-w-[1440px] mx-auto text-center">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Get In Touch</span>
                    <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">Let's Start Your Journey</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Whether you have a specific project in mind or just want to explore what's possible, our team is here to help.
                    </p>
                </div>
            </section>

            <div className="max-w-[1280px] mx-auto px-6 -mt-10 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Contact Cards */}
                    {[
                        { title: 'Visit Us', value: '123 Builder Lane, Design District, VIC 3000', icon: 'location_on', action: 'Get Directions' },
                        { title: 'Call Us', value: '1300 BUILDER (1300 284 533)', icon: 'call', action: 'Call Now' },
                        { title: 'Email Us', value: 'hello@clovertonhomes.com.au', icon: 'mail', action: 'Send Email' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full bg-background-light text-deep-slate flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold font-heading text-deep-slate mb-2">{item.title}</h3>
                            <p className="text-gray-500 mb-6">{item.value}</p>
                            <button className="text-brand-teal font-bold text-sm uppercase tracking-wider hover:text-primary transition-colors">
                                {item.action}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Reuse existing ContactForm, wrapped to fit layout */}
                    <div className="lg:col-span-1">
                        <ContactForm />
                    </div>

                    {/* Additional Info / Map Placeholder */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col justify-center">
                        <h3 className="text-2xl font-bold font-heading text-deep-slate mb-6">Office Hours</h3>
                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Monday - Friday</span>
                                <span className="text-gray-500">9:00 AM - 5:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Saturday</span>
                                <span className="text-gray-500">10:00 AM - 4:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="font-medium text-gray-700">Sunday</span>
                                <span className="text-gray-500">By Appointment</span>
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-xl h-64 w-full flex items-center justify-center text-gray-400">
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined">map</span>
                                Map Placeholder
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
