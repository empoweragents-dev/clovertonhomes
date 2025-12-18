
import HeroSection from '@/components/HeroSection'
import BuildPathways from '@/components/BuildPathways'
import ExperienceGrid from '@/components/ExperienceGrid'
import DesignCarousel from '@/components/DesignCarousel'
import Testimonial from '@/components/Testimonial'
import ContactForm from '@/components/ContactForm'
import FloatingChat from '@/components/FloatingChat'

export default function Home() {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <HeroSection />
            <BuildPathways />
            <ExperienceGrid />
            <DesignCarousel />
            <Testimonial />
            <ContactForm />
            <FloatingChat />
        </div>
    )
}
