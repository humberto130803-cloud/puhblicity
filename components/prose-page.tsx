import { Rv } from "@/components/reveal";
import type { PageContent } from "@/lib/i18n/pages";

/**
 * Renders money / terms / privacy from structured content, so both
 * languages are guaranteed the same layout and nothing can drift.
 */
export function ProsePage({ content }: { content: PageContent }) {
  return (
    <div className="wrap-narrow" style={{ padding: "52px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 className="h2" style={{ margin: "11px 0 15px" }}>{content.title}</h1>
        <p className="lede muted">{content.lede}</p>
      </Rv>

      {content.sections.map((section, si) => (
        <Rv key={si}>
          {section.title && (
            <h3 className="h3" style={{ margin: "28px 0 9px" }}>{section.title}</h3>
          )}
          {section.blocks.map((block, bi) => {
            if (block.kind === "p") {
              return (
                <p key={bi} style={{ marginBottom: 10 }}>{block.text}</p>
              );
            }
            if (block.kind === "ul") {
              return (
                <ul key={bi} style={{ margin: "0 0 10px 22px", lineHeight: 1.8 }}>
                  {block.items.map((item, ii) => (
                    <li key={ii}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <div key={bi} className="card card-pad" style={{ margin: "24px 0" }}>
                {block.rows.map((row, ri) => (
                  <div className="rowline" key={ri}>
                    <span>{row.k}</span>
                    {row.strong ? (
                      <b className="mono">{row.v}</b>
                    ) : (
                      <span className="mono">{row.v}</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </Rv>
      ))}

      {content.notice && (
        <Rv className="notice" style={{ marginTop: 24 }}>
          <b>{content.notice.title}</b> {content.notice.body}
        </Rv>
      )}
    </div>
  );
}
