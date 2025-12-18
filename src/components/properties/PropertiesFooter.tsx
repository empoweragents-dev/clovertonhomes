export default function PropertiesFooter() {
    return (
        <footer className="bg-white border-t border-[#eceeef] py-8 px-6 lg:px-10">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                <p>© 2024 Premium Residential Builders. All rights reserved.</p>
                <div className="flex gap-6">
                    <a className="hover:text-charcoal transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-charcoal transition-colors" href="#">Terms of Service</a>
                </div>
            </div>
        </footer>
    )
}
