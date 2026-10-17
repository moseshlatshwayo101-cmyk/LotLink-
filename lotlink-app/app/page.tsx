export default function HomePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--cyan)", letterSpacing: "0.08em", fontSize: "0.8rem" }}>
          GLOBAL AUCTION SOURCING &amp; PROCUREMENT
        </p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0" }}>LotLink</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Find legitimate public-sector and government surplus opportunities. We research and
          explain — you purchase from the official seller. AI researches; humans verify;
          customers decide.
        </p>
      </header>

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--cyan)", fontSize: "1.1rem" }}>Platform status</h2>
        <ul style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <li>Research API: <code>/api/research</code></li>
          <li>Health: <code>/api/health</code></li>
          <li>Sources: <code>/api/sources</code></li>
          <li>Admin review (protected): <a href="/admin">/admin</a></li>
        </ul>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          No opportunity is marked LotLink Verified until a human approves it. LotLink service
          fees are separate from auction purchase payments.
        </p>
      </section>

      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "1.25rem",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--cyan)", fontSize: "1.1rem" }}>Official sources</h2>
        <p style={{ color: "var(--muted)" }}>
          Browse current inventory only on official platforms:
        </p>
        <ul style={{ lineHeight: 1.8 }}>
          <li>
            <a href="https://marketplace.gsafleet.gov/sales/landing" rel="noopener noreferrer" target="_blank">
              GSA Fleet
            </a>
          </li>
          <li>
            <a href="https://www.govdeals.com/" rel="noopener noreferrer" target="_blank">
              GovDeals
            </a>
          </li>
          <li>
            <a href="https://www.publicsurplus.com/sms/browse/home" rel="noopener noreferrer" target="_blank">
              Public Surplus
            </a>
          </li>
          <li>
            <a href="https://home.treasury.gov/services/treasury-auctions" rel="noopener noreferrer" target="_blank">
              U.S. Treasury Auctions
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
