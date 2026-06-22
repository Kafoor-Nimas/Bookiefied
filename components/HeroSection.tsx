// components/HeroSection.tsx

import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="wrapper pt-28">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left */}
          <div className="library-hero-text">
            <h1 className="library-hero-title">Your Library</h1>
            <p className="library-hero-description">
              Convert your books into interactive AI conversations.
              <br className="hidden md:block" />
              Listen, learn, and discuss your favorite reads.
            </p>
            <Link href="/books/new" className="library-cta-primary mt-4">
              + Add new book
            </Link>
          </div>

          {/* Center*/}
          <div className="flex justify-center">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and globe"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          {/* Right — Steps card */}
          <div className="library-steps-card min-w-[260px] max-w-[280px] z-10 shadow-soft ">
            {[
              { n: 1, title: "Upload PDF", desc: "Add your book file" },
              { n: 2, title: "AI Processing", desc: "We analyze the content" },
              { n: 3, title: "Voice Chat", desc: "Discuss with AI" },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-full border border-[#c9b48a] flex items-center justify-center text-xs font-semibold text-[#7a5c30] shrink-0">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1a1209]">
                    {title}
                  </p>
                  <p className="text-xs text-[#7a6a55]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
