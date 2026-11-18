import Loader from "@/components/Loader";
import { IntroAudioProvider } from "@/components/IntroAudio";
import MiniPlayer from "@/components/MiniPlayer";
import Cursor from "@/components/Cursor";
import DotNav from "@/components/DotNav";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Luffy from "@/components/Luffy";

export default function Home() {
  return (
    <IntroAudioProvider>
      <Loader />
      <Cursor />
      <Navbar />
      <DotNav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Process />
        <Contact />
      </main>
      <Footer />
      <MiniPlayer />
      <Luffy />
    </IntroAudioProvider>
  );
}
