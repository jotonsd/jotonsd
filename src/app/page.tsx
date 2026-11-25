import { Universe } from "@/components/universe/Universe";
import { ScrollPlane } from "@/components/ScrollPlane";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Work } from "@/components/Work";
import { Projects } from "@/components/Projects";
import { Stack } from "@/components/Stack";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Universe />
      <ScrollPlane />
      <Nav />
      <main>
        <Hero />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </main>
    </>
  );
}
