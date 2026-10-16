import { COUNTRY_LISTS, type CountryList } from "@/data/countries";
import { cn } from "@/lib/utils";

const LIST_INFO: Record<CountryList, { label: string; hint: string }> = {
  un193: { label: "193", hint: "BM üyeleri" },
  un195: { label: "195", hint: "BM üyeleri, Vatikan ve Filistin" },
  all197: { label: "197", hint: "195'e ek olarak Kosova ve Tayvan" },
};

export function ListSwitch({ value, onChange }: { value: CountryList; onChange: (list: CountryList) => void }) {
  return (
    <div className="grid gap-1.5">
      <div role="radiogroup" aria-label="Hangi ülke listesi sayılsın?" className="inline-flex w-fit rounded-xl bg-secondary p-1">
        {COUNTRY_LISTS.map((list) => (
          <button
            key={list}
            type="button"
            role="radio"
            aria-checked={value === list}
            title={LIST_INFO[list].hint}
            onClick={() => onChange(list)}
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-sm tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              value === list ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {LIST_INFO[list].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{LIST_INFO[value].hint}</p>
    </div>
  );
}
