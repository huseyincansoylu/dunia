import { DuniaLogo } from "@/components/brand/dunia-logo";
import { Button } from "@/components/ui/button";

// Temporary home: shows the Muson theme, fonts and logo working together
// until the map MVP replaces it.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-4 border-b pb-4">
        <DuniaLogo />
        <div className="flex items-center gap-2">
          <Button variant="ghost">Giriş yap</Button>
          <Button>Haritanı oluştur</Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Gezdiğin her ülke, <span className="text-primary">haritanda</span> bir
          renk.
        </h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          Ülkelerini işaretle, sayını gör, haritanı tek dokunuşla story&apos;de
          paylaş.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="lg">Haritanı oluştur</Button>
          <Button size="lg" variant="outline">
            Giriş yap
          </Button>
          <Button size="lg" variant="secondary">
            Ülke ekle
          </Button>
        </div>
      </section>

      <section className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-card p-5">
        <div>
          <p className="font-heading text-6xl leading-none font-extrabold tracking-tighter">
            42<span className="text-[0.45em] text-muted-foreground">/197</span>
          </p>
          <p className="mt-2 text-muted-foreground">
            ülke · dünyanın %21&apos;i · 5 kıta
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-medium">
          <span className="rounded-full bg-visited px-3 py-1.5 text-visited-foreground">
            Japonya
          </span>
          <span className="rounded-full bg-visited px-3 py-1.5 text-visited-foreground">
            Fas
          </span>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
            İzlanda
          </span>
        </div>
      </section>
    </main>
  );
}
