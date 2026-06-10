import Image from "next/image";
import home from "@/content/home.json";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

export default function HomePage() {
  const { hero, impact, help } = home;

  return (
    <>
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <Image
          src={hero.backgroundImage}
          alt=""
          fill
          priority
          quality={80}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-laf-navy/75" />
        <PageContainer className="relative py-16 lg:py-20 grid lg:grid-cols-2 xl:grid-cols-[1.15fr_0.85fr] gap-10 xl:gap-16 items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {hero.title}
            </h1>
            <div className="w-16 h-1 bg-laf-gold my-6 rounded-full" />
            <p className="text-lg font-medium text-white/95">{hero.subtitle}</p>
            <p className="mt-4 text-white/85 leading-relaxed max-w-xl">{hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/about">Learn More</Button>
              <Button href="/donate" variant="outline" className="border-white text-white hover:bg-white hover:text-laf-navy">
                Donate
              </Button>
            </div>
          </div>
          <div className="hidden lg:block relative h-[380px] xl:h-[440px] max-w-xl xl:max-w-none xl:ml-auto w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <Image
              src={hero.image}
              alt="Lata Agrawal Foundation community mission"
              fill
              quality={80}
              className="object-cover object-center"
              sizes="(max-width: 1280px) 45vw, 520px"
            />
          </div>
        </PageContainer>
      </section>

      <section className="py-20 bg-white">
        <PageContainer>
          <h2 className="text-3xl md:text-4xl font-bold text-laf-navy text-center">Our Impact</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-12 rounded-full" />
          <div className="grid md:grid-cols-3 gap-8">
            {impact.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-laf-navy overflow-hidden bg-laf-cream hover:shadow-lg transition-shadow"
              >
                <div className="relative h-44">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    quality={75}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-laf-navy">{item.title}</h3>
                  <p className="mt-2 text-laf-muted text-sm leading-relaxed">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-20 bg-laf-cream">
        <PageContainer>
          <h2 className="text-3xl md:text-4xl font-bold text-laf-navy text-center">How You Can Help</h2>
          <div className="w-16 h-1 bg-laf-gold mx-auto mt-4 mb-12 rounded-full" />
          <div className="grid md:grid-cols-3 gap-6">
            {help.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-laf-navy p-6 bg-white"
              >
                <h3 className="text-xl font-semibold text-laf-navy text-center">{item.title}</h3>
                <p className="mt-3 text-sm text-laf-muted text-center leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-20 bg-laf-navy text-white text-center">
        <PageContainer narrow className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Join Our Movement</h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Your support helps shape the future of children in need. Together, we can empower the next generation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/donate">Donate</Button>
            <Button href="/volunteer" variant="outline" className="border-white text-white hover:bg-white hover:text-laf-navy">
              Volunteer
            </Button>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
