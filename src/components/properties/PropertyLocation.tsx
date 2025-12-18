export default function PropertyLocation() {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-teal font-heading">Location</h3>
            <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden relative">
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBdalhOixwoOTixuVSYgwd7zFCGqOEbiEGu1FKPUKe5rIG5Ry7GYpt-d9qymui9S_aK5quFWNYh7xu84PjykxC32Lmyfc8T1GozHVhDxdVYbP8StO59qcGw-o_k14DAT61SpnZ7jslwoEnyVHDGCLLd82lRLzxZqaxIPSClfTs30gu-1f2m_Jj0e_Zduwwu-FpM_NO3meB5IfBUOX0J7rb1-LcLq_q514f4ic1qtl7pThG9IInaBJEUYIHAf2P9KV2dQwxz9D4vPhTh')" }}
                ></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-5xl text-brand-teal drop-shadow-xl">location_on</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg flex gap-3 items-center">
                    <div className="bg-green-100 p-2 rounded-full">
                        <span className="material-symbols-outlined text-green-700">school</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 font-heading">NEARBY SCHOOL</p>
                        <p className="text-sm font-bold text-brand-charcoal font-heading">Deep Creek Primary (0.8km)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
