"use client";



import DecoyItem from "@/components/DecoyItem";

type Props = {
  tanks: { image: string; items: string[] }[];
  number: number; 
};

export default function CrateView({ tanks, number }: Props) {
  const nails = ["left-1.5 top-1.5", "right-1.5 top-1.5", "left-1.5 bottom-1.5", "right-1.5 bottom-1.5"];

  return (
    <section aria-label="Crate" className="planks relative rounded-sm border-4 border-plank-dark p-4 shadow-lg">
      {nails.map((position) => (
        <span
          key={position}
          aria-hidden="true"
          className={`absolute ${position} h-2 w-2 rounded-full bg-plank-dark shadow-inner`}
        />
      ))}

      <p className="mb-3 font-display text-3xl font-extrabold tracking-widest text-paper">Crate {number}</p>

      <div className={`grid gap-4 ${tanks.length === 1 ? "" : "sm:grid-cols-2"}`}>
        {tanks.map((tank, i) => (
          <figure key={i} className="rounded-sm bg-black/35 p-2">
            <div className="relative overflow-hidden rounded-[4px] border-2 border-foam/30 bg-deep">
              {/* the air above the water: floating things rest on the water line.
                  Every tank has this strip, so an empty one does not give anything away. */}
              <div className="flex h-16 items-end gap-3 border-b-2 border-foam/40 bg-water/20 px-3 [&_svg]:h-14">
                {tank.items.map((item, j) => (
                  <div key={j} className={`translate-y-1 drop-shadow-md ${j % 2 === 0 ? "-rotate-3" : "rotate-3"}`}>
                    <DecoyItem kind={item} />
                  </div>
                ))}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tank.image} alt={`Fish tank ${i + 1}`} className="block w-full" />

              {/* a glint on the glass */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-3 top-0 h-full w-8 skew-x-[-12deg] bg-white/10"
              />
            </div>
            <figcaption className="pt-1 font-display text-lg tracking-wide text-paper/80">Tank {i + 1}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}