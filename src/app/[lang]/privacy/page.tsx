import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../dictionaries";
import type { Metadata } from "next";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "es" ? "Política de privacidad" : "Privacy Policy" };
}

export default async function PrivacyPage({ params }: { params: Params }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = dict.privacy;

  return (
    <main className="bg-white dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href={`/${lang}`}
          className="text-sm text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          {t.backHome}
        </Link>

        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">{t.lastUpdated}</p>

        <p className="mt-8 text-zinc-600 dark:text-zinc-400 leading-relaxed">{t.intro}</p>

        <div className="mt-10 space-y-10">
          {t.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.list.length > 0 && (
                  <ul className="list-disc space-y-1.5 pl-5">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.afterList.map((p, i) => (
                  <p key={`after-${i}`}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-6 dark:border-zinc-900">
          <Link
            href={`/${lang}/${t.viewOtherHref}`}
            className="text-sm font-medium text-black underline underline-offset-2 dark:text-white"
          >
            {t.viewOther} →
          </Link>
        </div>
      </div>
    </main>
  );
}
