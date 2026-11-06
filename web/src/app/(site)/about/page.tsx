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
            A school built around <span className="italic text-sage-deep">the garden.</span>
          </>
        }
        lead="Khanya means light. We chose it because children do not need to be filled up. They need room, time and a good place to notice what is already there."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        aside={
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[0.82rem] leading-relaxed text-bark-soft">
              Founded in 2016 in Ferndale, Randburg. A second garden opened in
              Fourways in 2019. Still independent, still small.
            </p>
          </div>
        }
      />

      <section className="page-container pb-16 md:pb-24">
        <div className="grid gap-10 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="prose-editorial">
              <p className="lead">
                Khanya began with a small group of children, a rented house and a
                garden that had been left alone for years. The first year was
                mostly outside because the indoor room was too small to hold
                everyone. It turned out to be the right accident.
              </p>
              <p>
                We learned that children settle faster when they have somewhere
                to dig, a job worth doing and an adult who is not trying to move
                them along. We learned that rain is rarely the problem. The
                problem is being dressed for the wrong weather. We learned that
                parents want honesty more than polish.
              </p>
              <p>
                Ten years later, the school has two open branches and a third
                garden taking root in Midstream. The rooms are still small. The
                gardens are still the main classroom. We still stop for the
                interesting beetle.
              </p>
              <h2>What we believe</h2>
              <p>
                Childhood is not a waiting room for school. The years from
                eighteen months to Grade R are full of real work: learning to be
                with other people, to carry something heavy, to wait, to try
                again, to notice. We take that work seriously and protect the
                time it needs.
              </p>
              <p>
                We also believe a school should be a place where adults can be
                honest. Teachers are not performers. Families are not customers.
                We make decisions together, explain them plainly and change them
                when they are wrong.
              </p>
            </div>

            <div className="mt-10">
              <EditorialQuote attribution="Naledi Botha, founder and principal">
                A child who knows one place deeply will learn to know every place
                better.
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
              <div className="border-l-2 border-ochre pl-4">
                <p className="label-caps text-sage-deep">The name</p>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-bark-soft">
                  Khanya is a Nguni word for light. Not a spotlight. The ordinary
                  morning light that makes a leaf look new.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper section">
        <div className="page-container">
          <SectionHeading
            eyebrow="How we work"
            title="Four ideas that shape the day."
            lead="These are not posters on the wall. They are the things we come back to when a decision is difficult."
          />
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {[
              {
                number: "01",
                title: "The outdoors is the room",
                body: "Most learning happens outside. We dress for the weather, keep a warm corner for winter and treat the garden as a place with rules, hazards and real consequences.",
              },
              {
                number: "02",
                title: "Small groups, known children",
                body: "Teachers know each child's jokes, fears, friendships and current obsession. Small groups make that possible. We protect the ratios even when the waiting list is long.",
              },
              {
                number: "03",
                title: "Real materials, real work",
                body: "Tools, fire, water, clay, wood, food. Children do work that matters and see the result. We teach the hold before the tool and stay close while they learn.",
              },
              {
                number: "04",
                title: "Families are part of the school",
                body: "We share the ordinary days, not only the wins. Parents are welcome at collection, on work mornings and in the conversations that shape the year.",
              },
            ].map((value) => (
              <div key={value.number} className="border-t border-line pt-5">
                <p className="text-[0.72rem] tracking-[0.16em] text-ochre-deep">
                  {value.number}
                </p>
                <h3 className="mt-2 font-display text-[1.55rem] text-forest">
                  {value.title}
                </h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-bark-soft">
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
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="label-caps text-sage-deep">Our people</p>
            <h2 className="display-lg mt-3 text-forest">
              Teachers who stay.
            </h2>
            <p className="lead mt-4">
              The average teacher at Khanya has been here for more than five
              years. That continuity is the curriculum.
            </p>
            <div className="prose-editorial mt-6">
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

      <section className="border-y border-line bg-sage-tint/40 py-10 md:py-14">
        <div className="page-container grid gap-6 md:grid-cols-3">
          {[photoOne, photoThree, photoTwo].map((photo, index) =>
            photo ? (
              <Photo
                key={`${photo.id}-${index}`}
                src={photo.url}
                alt={photo.alt ?? "A day in the Khanya garden"}
                ratio={index === 1 ? "4 / 5" : "3 / 2"}
                sizes="(min-width: 768px) 33vw, 100vw"
              />
            ) : null,
          )}
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="grid gap-10 border border-line bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="label-caps text-sage-deep">A good next step</p>
              <h2 className="display-md mt-2 max-w-2xl text-forest">
                Read the programmes, then come and see the garden.
              </h2>
              <p className="mt-3 max-w-2xl text-[0.94rem] leading-relaxed text-bark-soft">
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
          <p className="mt-5 text-[0.8rem] text-bark-soft">
            Prefer to read the practical details first?{" "}
            <Link href="/admissions" className="mark-link text-forest">
              Admissions and fees
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
