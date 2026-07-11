
import HeroSection from '@/components/HeroSection'
import BuildPathways from '@/components/BuildPathways'
import ExperienceGrid from '@/components/ExperienceGrid'
import DesignCarousel from '@/components/DesignCarousel'
import HomeEditorialSections from '@/components/HomeEditorialSections'
import ContactForm from '@/components/ContactForm'

export default function Home() {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <HeroSection />
            <BuildPathways />
            <ExperienceGrid />
            <DesignCarousel />
            <HomeEditorialSections />
            <ContactForm />
        </div>
    )
}
