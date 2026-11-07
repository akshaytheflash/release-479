import type { ApplicationDoc } from "@/lib/application";

export default function ApplicationSheet({ doc }: { doc: ApplicationDoc }) {
  const first = doc.body.slice(0, 4);
  const rest = doc.body.slice(4);
  return (
    <article className="sheet" lang={doc.lang}>
      <h3>{doc.courtLine}</h3>
      <p className="sheet-meta">Case No. {doc.caseNo}</p>
      <p className="sheet-meta">{doc.parties}</p>

      <div className="addressee">
        {doc.addressees.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <p className="subject">{doc.title}</p>

      <ol>
        {first.map((p) => (
          <li key={p.no}>{p.text}</li>
        ))}
      </ol>

      <div className="quote">
        {doc.statutoryQuote.split("\n\n").map((q, i) => (
          <p key={i}>{q}</p>
        ))}
        <p style={{ fontFamily: "var(--sans)", fontSize: "10px", color: "#5c5a54" }}>
          {doc.statutoryNote}
        </p>
      </div>

      {rest.length > 0 && (
        <ol start={5}>
          {rest.map((p) => (
            <li key={p.no}>{p.text}</li>
          ))}
        </ol>
      )}

      <p style={{ marginTop: 16 }}>{doc.prayerLead}</p>
      <ol type="a">
        {doc.prayer.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>

      {doc.caution && <div className="caution">{doc.caution}</div>}

      <p style={{ marginTop: 16 }}>{doc.verification}</p>

      <div className="sig">
        {doc.signature.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="sheet-foot">
        <p>{doc.disclaimer}</p>
        <p>
          Prepared with 479 (BNSS s.479 release file). The addressee and
          statutory excerpts must be checked by the DLSA or an advocate before
          filing.
        </p>
      </div>
    </article>
  );
}
