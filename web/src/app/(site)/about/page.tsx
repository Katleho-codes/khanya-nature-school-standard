import type { Metadata } from "next";
import Link from "next/link";
import { getHome } from "@/lib/api";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/PageIntro";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { SectionHeading, EditorialQuote, Fact } from "@/components/Editorial";
import { ArrowRightIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "About the school",
    description:
      "The story, people and thinking behind Khanya Nature School: a small, outdoor-first preschool in Randburg and Fourways.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const home = await getHome();
  const photoOne = home.photos[0]?.media ?? null;
  const photoTwo = home.photos[1]?.media ?? null;
  const photoThree = home.photos[2]?.media ?? null;

  return (
    <>
      <PageIntro
        eyebrow="About"
        title={
          <>
            The garden came first. The <span className="text-poppy-deep">school followed.</span>
          </>
        }
        lead="Khanya started with a rented house, a scrappy garden and a small group of children. The indoor room was too small, so we spent most of the day outside. It was an accident that turned out to be the right one."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        aside={
          <div className="mt-6 paper-card rotate-[0.7deg] bg-sun-tint p-4">
            <p className="hand text-poppy-deep">A short history</p>
            <p className="mt-1 text-[0.82rem] leading-relaxed text-ink/75">
              Founded in 2016 in Ferndale, Randburg. A second garden opened in
              Fourways in 2019. Still independent, still small.
            </p>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="prose-playful rounded-[28px_22px_30px_18px] bg-paper p-5 sm:p-7">
              <p className="lead">
                Khanya began in 2016 with a rented house in Ferndale, a garden
                that had been left alone for years, and a group of children who
                needed somewhere to be. The indoor room was too small for
                everyone. So we spent most of the day outside. It was an accident
                that turned out to be the right one.
              </p>
              <p>
                We learned quickly. Children settle faster when they have a job:
                fill the watering can, carry the branch, wash the bowl. Rain is
                rarely the problem. The problem is being dressed for the wrong
                weather. Parents want straight answers more than glossy brochures.
              </p>
              <p>
                Ten years later we have two open branches and a third garden
                taking shape in Midstream. The rooms are still small. The gardens
                are still the main classroom. We still stop for the interesting
                beetle.
              </p>
              <h2>What we keep coming back to</h2>
              <p>
                Childhood is not a waiting room for big school. Children from 18
                months to Grade R are doing real work: making friends, carrying
                something heavy, waiting for a turn, trying again. We protect the
                time that work needs.
              </p>
              <p>
                We also try to be honest with adults. Teachers are not performers.
                Families are not customers. We explain decisions plainly and change
                them when they are wrong.
              </p>
            </div>

            <div className="mt-10">
              <EditorialQuote attribution="Naledi Botha, founder and principal">
                A child who knows one place well is not afraid of the next one.
              </EditorialQuote>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <Fact label="Founded">
                2016, in a house and garden in Ferndale, Randburg.
              </Fact>
              <Fact label="Branches">
                Randburg (Ferndale) and Fourways. Midstream is in preparation.
              </Fact>
              <Fact label="Ages">
                18 months to Grade R, across four term-time programmes.
              </Fact>
              <Fact label="Still independent">
                Owned and run by the teachers who work here, not a franchise.
              </Fact>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <div className="space-y-8">
              <Photo
                src={photoOne?.url ?? null}
                alt={photoOne?.alt ?? "Children in the Khanya garden"}
                ratio="4 / 5"
                shape="wobbly"
                tone="meadow"
                sizes="(min-width: 1024px) 30vw, 100vw"
              />
              <div className="paper-card-plain bg-sky-tint p-4">
                <p className="hand text-poppy-deep">The name</p>
                <p className="mt-1 text-[0.88rem] leading-relaxed text-ink/75">
                  Khanya is a Nguni word for light. Not a spotlight. The ordinary
                  morning light that makes a leaf look new.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sun-tint/35 section">
        <div className="page-container">
          <SectionHeading
            eyebrow="How we work"
            title="Four ideas that shape the day."
            lead="These are not posters on the wall. They are the things we come back to when a decision is difficult."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: "The outdoors is the room",
                body: "Most learning happens outside. We dress for the weather, keep a warm corner for winter and treat the garden as a place with rules, hazards and real consequences.",
                tone: "bg-paper",
              },
              {
                number: "02",
                title: "Small groups, known children",
                body: "Teachers know each child's jokes, fears, friendships and current obsession. Small groups make that possible. We protect the ratios even when the waiting list is long.",
                tone: "bg-sky-tint",
              },
              {
                number: "03",
                title: "Real materials, real work",
                body: "Tools, fire, water, clay, wood, food. Children do work that matters and see the result. We teach the hold before the tool and stay close while they learn.",
                tone: "bg-meadow-tint",
              },
              {
                number: "04",
                title: "Families are part of the school",
                body: "We share the ordinary days, not only the wins. Parents are welcome at collection, on work mornings and in the conversations that shape the year.",
                tone: "bg-poppy-tint",
              },
            ].map((value) => (
              <div key={value.number} className={`paper-card ${value.tone} p-5`}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-paper font-display text-[0.92rem] font-extrabold text-poppy-deep">
                  {value.number}
                </span>
                <h3 className="mt-3 font-display text-[1.55rem] font-extrabold text-ink">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-ink/75">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <Photo
              src={photoTwo?.url ?? null}
              alt={photoTwo?.alt ?? "The outdoor classroom and garden"}
              ratio="3 / 4"
              shape="paper"
              tone="meadow"
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="sticker bg-paper text-ink">Our people</p>
            <h2 className="display-lg mt-3 text-ink">
              Teachers who stay.
            </h2>
            <p className="lead mt-4">
              The average teacher at Khanya has been here for more than five
              years. That continuity is the curriculum.
            </p>
            <div className="prose-playful mt-6 rounded-[24px] bg-sky-tint/45 p-5">
              <p>
                Each branch has a principal who teaches. Naledi Botha founded the
                school and still spends most mornings in the Randburg garden.
                Sipho Dlamini leads the outdoor programme at Fourways and takes
                the long wetland walks. Thandi Mokoena teaches Bush School.
                Lerato Moloi leads Little Explorers.
              </p>
              <p>
                Teachers plan together once a week, observe each other&apos;s
                groups and write honest notes about what is working. We invest in
                supervision and in keeping the group sizes small enough to know
                every child well.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/branches" variant="outline">
                Meet the branches
              </ButtonLink>
              <ButtonLink href="/contact" variant="text">
                Contact the school <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-sky-tint/40 py-10 md:py-14">
        <div className="page-container grid gap-6 md:grid-cols-3">
          {[photoOne, photoThree, photoTwo].map((photo, index) =>
            photo ? (
              <Photo
                key={`${photo.id}-${index}`}
                src={photo.url}
                alt={photo.alt ?? "A day in the Khanya garden"}
                ratio={index === 1 ? "4 / 5" : "3 / 2"}
                shape="paper"
                tone={index === 1 ? "meadow" : index === 2 ? "poppy" : "sun"}
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            ) : null,
          )}
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-10 paper-card rotate-[0.3deg] bg-sun p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="hand text-ink">A good next step</p>
              <h2 className="display-md mt-1 max-w-2xl text-ink">
                Read the programmes, then come and see the garden.
              </h2>
              <p className="mt-3 max-w-2xl text-[0.94rem] leading-relaxed text-ink/75">
                The website can tell you the shape of the day. Only a visit can
                tell you whether your child will be happy here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/programmes">
                Programmes <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/admissions#visit" variant="outline">
                Arrange a visit
              </ButtonLink>
            </div>
          </div>
          <p className="mt-5 text-[0.8rem] text-ink/75">
            Prefer to read the practical details first?{" "}
            <Link href="/admissions" className="squiggle-link font-bold text-ink">
              Admissions and fees
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
