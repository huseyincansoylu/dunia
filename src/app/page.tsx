import { Atlas } from "@/components/atlas/atlas";
import { DuniaLogo } from "@/components/brand/dunia-logo";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-4 border-b pb-4">
        <DuniaLogo />
      </header>

      <section className="grid gap-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Gezdiğin her ülke, <span className="text-primary">haritanda</span> bir renk.
        </h1>
        <p className="max-w-[60ch] text-muted-foreground">
          Haritada bir ülkeye dokun ya da aşağıdan ara. İşaretlediklerin bu tarayıcıda saklanır.
        </p>
      </section>

      <Atlas />
    </main>
  );
}
