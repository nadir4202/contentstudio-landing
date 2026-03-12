import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ── CONFIG: Replace with your actual credentials ──
const CONFIG = {
  // Stripe Payment Links — create these in https://dashboard.stripe.com/payment-links
  stripe: {
    starter: "https://buy.stripe.com/test_14A28k2jp6S32vMcQy8bS00",
    growth: "https://buy.stripe.com/test_dRmaEQ1fl6S3c6mg2K8bS01",
    scale: "https://buy.stripe.com/test_14A6oA7DJdgr7Q66sa8bS02",
  },
  // EmailJS — sign up at https://www.emailjs.com
  emailjs: {
    serviceId: "service_0i8p0s6",
    templateId: "template_tbxnvog",
    publicKey: "9FlsrfEt1-MTZ7NxP",
  },
};

const C = {
  night: "#06060B", nightCard: "#0D0D15", nightCardHover: "#13131F", nightSurface: "#1A1A28",
  electric: "#818CF8", electricBright: "#A5B4FC", electricDim: "rgba(129,140,248,0.12)",
  electricGlow: "rgba(129,140,248,0.25)", mint: "#34D399", mintGlow: "rgba(52,211,153,0.15)",
  coral: "#FB7185", amber: "#FBBF24", text: "#E8ECF4", textSoft: "#A0ABBE", textDim: "#5E6B7F",
  border: "rgba(255,255,255,0.05)", borderActive: "rgba(129,140,248,0.35)",
};

const Counter = ({ end, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const [go, setGo] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!go) return;
    let s = 0; const step = end / 100;
    const t = setInterval(() => { s += step; if (s >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [go, end]);
  return <span ref={ref}>{val}{suffix}</span>;
};

const Typewriter = ({ lines, speed = 45 }) => {
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);
  const [done, setDone] = useState([]);
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setOn(true), { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!on || li >= lines.length) return;
    if (ci < lines[li].text.length) {
      const t = setTimeout(() => setCi(c => c + 1), speed);
      return () => clearTimeout(t);
    } else {
      setDone(d => [...d, lines[li]]);
      const t = setTimeout(() => { setLi(i => i + 1); setCi(0); }, 350);
      return () => clearTimeout(t);
    }
  }, [on, li, ci, lines, speed]);
  return (
    <div ref={ref} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
      {done.map((l, i) => <div key={i} style={{ color: l.color || C.textSoft }}>{l.text}</div>)}
      {li < lines.length && on && (
        <div style={{ color: lines[li]?.color || C.textSoft }}>
          {lines[li].text.slice(0, ci)}<span style={{ animation: "curBlink 1s step-end infinite", color: C.electric }}>█</span>
        </div>
      )}
    </div>
  );
};

const Reveal = ({ children, style, delay = 0 }) => {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(36px)", transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, ...style }}>{children}</div>
  );
};

const FCard = ({ icon, title, desc, color, delay = 0 }) => {
  const [h, setH] = useState(false);
  return (
    <Reveal delay={delay}>
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
        background: h ? C.nightCardHover : C.nightCard, border: `1px solid ${h ? C.borderActive : C.border}`,
        borderRadius: 16, padding: "30px 22px", cursor: "default", transform: h ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.3s ease", position: "relative", overflow: "hidden", height: "100%",
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}18, transparent 70%)`, filter: "blur(18px)", opacity: h ? 1 : 0.3, transition: "opacity 0.4s" }} />
        <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 7 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>{desc}</div>
      </div>
    </Reveal>
  );
};

const SwipeCard = ({ children, delay = 0, direction = "swipeIn" }) => {
  const [v, setV] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      animation: v ? `${direction} 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both` : "none",
    }}>{children}</div>
  );
};

const Chip = ({ label, selected, onClick, icon }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 100,
    background: selected ? C.electricDim : "transparent", border: `1.5px solid ${selected ? C.electric : C.border}`,
    color: selected ? C.electricBright : C.textSoft, fontSize: 13, fontWeight: selected ? 600 : 400,
    cursor: "pointer", transition: "all 0.2s", transform: selected ? "scale(1.03)" : "scale(1)",
  }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}{label}{selected && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
  </button>
);

const PACKAGES = [
  { id: "starter", name: "Starter", price: 1500, channels: 2, seats: 3, icon: "🚀", desc: "2 channels, 3 seats, Brand Score, Winner DNA" },
  { id: "growth", name: "Growth", price: 2000, channels: 4, seats: 8, icon: "📈", desc: "4 channels, 8 seats, multi-language, CRM import", popular: true },
  { id: "scale", name: "Scale", price: 2500, channels: 5, seats: 20, icon: "⚡", desc: "All 5 channels, 20 seats, priority support, dedicated CSM" },
];
const BCOLORS = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#2D5A27"];

export default function App() {
  const [pkg, setPkg] = useState("growth");
  const [bc, setBc] = useState("#6366F1");
  const [cn, setCn] = useState("");
  const [step, setStep] = useState(0);
  const [pm, setPm] = useState(null);
  const [f, setF] = useState({ name:"", email:"", company:"" });
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [hdr, setHdr] = useState(false);
  const cfgRef = useRef(null);
  const payRef = useRef(null);

  useEffect(() => { const h = () => setHdr(window.scrollY > 50); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  const sel = PACKAGES.find(p => p.id === pkg);
  const mo = sel?.price || 2000;
  const su = Math.round(mo * 2);
  const save = Math.round(mo * 12 * 0.15);
  const ok = f.name && f.email && f.company;

  const handleSubmit = async () => {
    if (!ok || sending) return;
    setSending(true);
    try {
      await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
        title: `New Subscription — ${sel?.name} (€${mo.toLocaleString()}/mo)`,
        name: f.name,
        email: f.email,
        message: `New ContentStudio subscription:\n\nCompany: ${f.company}${cn ? ` (${cn})` : ""}\nPackage: ${sel?.name} — €${mo.toLocaleString()}/mo\nSetup fee: €${su.toLocaleString()} (after month 2)\nPayment: ${pm === "card" ? "Company Card (Stripe)" : "Bank Transfer"}\nBrand color: ${bc}`,
      }, CONFIG.emailjs.publicKey);
    } catch (err) {
      console.error("EmailJS error:", err);
    }
    setDone(true);
    setSending(false);
    if (pm === "card") {
      const link = CONFIG.stripe[pkg];
      if (link && !link.includes("REPLACE")) {
        window.open(`${link}?prefilled_email=${encodeURIComponent(f.email)}`, "_blank");
      }
    }
  };

  const goCfg = () => { setStep(1); setTimeout(() => cfgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };
  const goPay = () => { setStep(3); setTimeout(() => payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); };

  const sty = {
    btn: (bg, clr, shadow) => ({ padding: "14px 32px", borderRadius: 100, border: "none", background: bg, color: clr, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: shadow || "none", transition: "all 0.3s" }),
    btnGhost: { padding: "14px 26px", borderRadius: 100, border: `1px solid ${C.border}`, background: "transparent", color: C.textSoft, fontSize: 14, fontWeight: 500, cursor: "pointer" },
    card: (active) => ({ background: C.nightCard, borderRadius: 18, border: `1px solid ${active ? C.borderActive : C.border}`, padding: "28px 24px", transition: "border 0.3s" }),
    input: { width: "100%", padding: "12px 14px", borderRadius: 10, background: C.nightSurface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "inherit", transition: "border 0.2s" },
  };

  return (
    <div style={{ background: C.night, color: C.text, minHeight: "100vh", fontFamily: "-apple-system, 'Segoe UI', Helvetica, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes curBlink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes si{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes pr{0%{box-shadow:0 0 0 0 rgba(52,211,153,0.5)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
        @keyframes swipeIn{from{opacity:0;transform:translateX(-60px) rotate(-2deg)}to{opacity:1;transform:translateX(0) rotate(0deg)}}
        @keyframes swipeRight{from{opacity:0;transform:translateX(60px) rotate(2deg)}to{opacity:1;transform:translateX(0) rotate(0deg)}}
        @keyframes zoomPop{from{opacity:0;transform:scale(0.7) rotate(-3deg)}to{opacity:1;transform:scale(1) rotate(0deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes borderGlow{0%,100%{border-color:rgba(129,140,248,0.3)}50%{border-color:rgba(52,211,153,0.5)}}
        @keyframes countPulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        *{box-sizing:border-box;margin:0;padding:0}::selection{background:rgba(129,140,248,0.3)}html{scroll-behavior:smooth}input:focus{outline:none}
        input[type=range]{-webkit-appearance:none;background:${C.nightSurface};height:5px;border-radius:3px;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:${C.electric};cursor:pointer;border:3px solid ${C.nightCard}}
      `}</style>

      {/* HEADER */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: hdr ? "10px 24px" : "16px 24px", background: hdr ? "rgba(6,6,11,0.92)" : "transparent", backdropFilter: hdr ? "blur(20px)" : "none", borderBottom: hdr ? `1px solid ${C.border}` : "none", transition: "all 0.4s", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.electric}, ${C.mint})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: C.night }}>C</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>ContentStudio</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a href="#features" style={{ color: C.textSoft, textDecoration: "none", fontSize: 12, fontWeight: 500 }}>Features</a>
          <a href="#how" style={{ color: C.textSoft, textDecoration: "none", fontSize: 12, fontWeight: 500 }}>How It Works</a>
          <button onClick={goCfg} style={{ padding: "7px 18px", borderRadius: 100, border: `1px solid ${C.electric}`, background: "transparent", color: C.electricBright, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Get Started</button>
        </div>
      </header>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", padding: "110px 20px 70px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.07), transparent 70%)", top: "8%", left: "10%", filter: "blur(80px)", animation: "fl 13s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.05), transparent 70%)", bottom: "15%", right: "8%", filter: "blur(80px)", animation: "fl 11s ease-in-out infinite 2s" }} />
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 13px 5px 7px", borderRadius: 100, background: C.electricDim, border: "1px solid rgba(129,140,248,0.2)", fontSize: 11, color: C.electricBright, marginBottom: 26, animation: "fu 0.7s ease both" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.mint, display: "inline-block", animation: "pr 2s infinite" }} />
          🧬 Powered by Winner DNA Technology
        </div>
        <h1 style={{ fontSize: "clamp(34px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.06, maxWidth: 800, letterSpacing: -1.5, animation: "fu 0.7s ease 0.1s both" }}>
          Your Winning Campaigns{" "}
          <span style={{ background: `linear-gradient(135deg, ${C.electric}, ${C.mint}, ${C.electricBright})`, backgroundSize: "200% 200%", animation: "grad 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Have a DNA.</span>
          <br/>We Extract It. You Scale It.
        </h1>
        <p style={{ fontSize: 16, color: C.textSoft, maxWidth: 540, lineHeight: 1.7, marginTop: 22, animation: "fu 0.7s ease 0.2s both" }}>
          ContentStudio analyzes your best-performing campaigns, extracts the patterns that win — subject lines, CTAs, tone, timing — and injects that DNA into every future piece of content. AI that doesn't guess. It knows.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 36, animation: "fu 0.7s ease 0.3s both", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={goCfg} style={sty.btn(`linear-gradient(135deg, ${C.electric}, #6D5BF7)`, "#fff", `0 4px 24px ${C.electricGlow}`)}>Configure & Buy →</button>
          <button onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })} style={sty.btnGhost}>See It In Action</button>
        </div>
        <div style={{ display: "flex", gap: 40, marginTop: 56, animation: "fu 0.7s ease 0.4s both", flexWrap: "wrap", justifyContent: "center" }}>
          {[{ n: 41, s: "%", l: "Avg. Open Rate Lift" }, { n: 25, s: "min", l: "Per Campaign" }, { n: 85, s: "+", l: "Brand Score Target" }].map((x, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 800 }}><Counter end={x.n} suffix={x.s} /></div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, letterSpacing: 1, textTransform: "uppercase" }}>{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ USP BLOCK — THE MONEY SECTION ═══ */}
      <section style={{ padding: "20px 20px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(129,140,248,0.03) 30%, rgba(52,211,153,0.03) 70%, transparent 100%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{
              background: `linear-gradient(135deg, ${C.nightCard}, ${C.nightSurface})`,
              border: `2px solid transparent`,
              borderImage: "linear-gradient(135deg, rgba(129,140,248,0.4), rgba(52,211,153,0.4), rgba(251,113,133,0.3)) 1",
              borderRadius: 0, padding: "48px 32px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.12), transparent 70%)", filter: "blur(40px)", animation: "fl 8s ease-in-out infinite" }} />
              <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.1), transparent 70%)", filter: "blur(40px)", animation: "fl 10s ease-in-out infinite 3s" }} />

              <div style={{ textAlign: "center", marginBottom: 36, position: "relative" }}>
                <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", fontSize: 11, fontWeight: 700, color: C.mint, marginBottom: 16, letterSpacing: 1 }}>
                  ZERO FRICTION. ALL SPEED.
                </div>
                <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
                  No Devs. No Tech Skills.{" "}
                  <span style={{ background: `linear-gradient(135deg, ${C.mint}, ${C.amber})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Just Upload & Go.</span>
                </h2>
                <p style={{ fontSize: 15, color: C.textSoft, marginTop: 14, maxWidth: 520, margin: "14px auto 0", lineHeight: 1.7 }}>
                  Drop in your past campaign data. Our AI learns what worked. You get better content tomorrow. That's it. That's the product.
                </p>
              </div>

              {/* 3-COLUMN SPEED CARDS — animated */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, position: "relative" }}>
                {[
                  { icon: "📤", time: "5 min", title: "Upload past data", desc: "CSV, screenshots, brand book — whatever you have. AI eats it all.", color: C.electric, anim: "swipeIn" },
                  { icon: "🧠", time: "24 hours", title: "We wire everything", desc: "White-label deployed, brand voice calibrated, Winner DNA loaded. You do nothing.", color: C.mint, anim: "slideUp" },
                  { icon: "🔥", time: "Day 2", title: "Better content rolling", desc: "First campaigns generated. Already scoring higher than your manual work.", color: C.coral, anim: "swipeRight" },
                ].map((card, i) => (
                  <SwipeCard key={i} delay={i * 150} direction={card.anim}>
                    <div style={{
                      background: C.nightCard, borderRadius: 16, padding: "28px 22px", position: "relative", overflow: "hidden",
                      border: `1px solid ${card.color}20`, height: "100%",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px) rotate(-0.5deg)"; e.currentTarget.style.boxShadow = `0 16px 40px ${card.color}15`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) rotate(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${card.color}20, transparent 70%)`, filter: "blur(15px)" }} />
                      <div style={{ fontSize: 36, marginBottom: 10, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>{card.icon}</div>
                      <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, background: `${card.color}15`, fontSize: 10, fontWeight: 700, color: card.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10, letterSpacing: 0.5 }}>{card.time}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>{card.title}</div>
                      <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.6 }}>{card.desc}</div>
                    </div>
                  </SwipeCard>
                ))}
              </div>

              {/* SPEED TICKER */}
              <div style={{ marginTop: 28, overflow: "hidden", borderRadius: 10, background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.1)", padding: "10px 0" }}>
                <div style={{ display: "flex", gap: 40, animation: "marquee 20s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
                  {[...Array(2)].flatMap(() => [
                    "No developers needed", "Live in 24 hours", "Upload CSV and go", "AI learns YOUR brand", "Scores improve every day", "White-label included", "No code. No setup headaches.", "From data to campaigns in minutes",
                  ]).map((t, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, color: C.textSoft, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.mint, display: "inline-block" }} />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TERMINAL */}
      <Reveal style={{ padding: "50px 20px", maxWidth: 700, margin: "0 auto" }}>
        <div id="demo" style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: C.electric, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Watch It Work</div>
          <h2 style={{ fontSize: 26, fontWeight: 700 }}>Brief to Campaign in Seconds</h2>
        </div>
        <div style={{ background: C.nightCard, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 16px 44px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderBottom: `1px solid ${C.border}` }}>
            {["#FF5F57","#FFBD2E","#28CA41"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: 10, color: C.textDim }}>contentstudio — generation engine</span>
          </div>
          <div style={{ padding: "18px 22px", minHeight: 180 }}>
            <Typewriter speed={38} lines={[
              { text: "→ Loading brand profile for SportsBet.io...", color: C.textDim },
              { text: "✓ Brand voice: Bold, playful, urgency-driven", color: C.mint },
              { text: "✓ Winner DNA loaded — 47 approved campaigns", color: C.mint },
              { text: "→ Generating 3 variants × 5 channels...", color: C.electric },
              { text: "✓ Email subject A scores 91/100 brand alignment", color: C.mint },
              { text: "✓ Push variant B predicted CTR +38% vs baseline", color: C.mint },
              { text: "✓ SMS — all variants pass regulatory compliance", color: C.mint },
              { text: "⚡ Campaign ready — 23 seconds total", color: C.amber },
            ]} />
          </div>
        </div>
      </Reveal>

      {/* FEATURES — ANIMATED SWIPE CARDS */}
      <div id="features" style={{ padding: "80px 20px", maxWidth: 980, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.electric, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>What You Get</div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Not Another AI Writer. A Learning Content Engine.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { icon: "🧬", title: "Winner DNA Extraction", desc: "Analyzes approved campaigns to extract winning patterns — subject lines, CTAs, tone, length. Every new campaign inherits them.", color: C.electric, dir: "swipeIn" },
            { icon: "🎯", title: "Brand Score (0–100)", desc: "5-dimension scoring: voice, vocabulary, tone, compliance, channel fit. Set minimums. Kill off-brand content before it ships.", color: C.mint, dir: "zoomPop" },
            { icon: "📊", title: "Performance Dashboard", desc: "Before vs. After with real numbers. +41% open rate lift is what renews contracts. Exportable PDF reports.", color: C.amber, dir: "swipeRight" },
            { icon: "🏷️", title: "Instant White-Label", desc: "Upload brand book or screenshot. AI extracts colors, fonts, voice. Module re-skins in seconds. Clients see THEIR tool.", color: C.coral, dir: "swipeIn" },
            { icon: "🌍", title: "Multi-Language Native", desc: "15+ languages — native generation, not translation. Per-market compliance rules built in.", color: C.electric, dir: "zoomPop" },
            { icon: "🔗", title: "CRM Integration", desc: "Import from Optimove, Extreme Push, or any CRM via CSV. More data in, smarter output.", color: C.mint, dir: "swipeRight" },
          ].map((card, i) => (
            <SwipeCard key={i} delay={i * 100} direction={card.dir}>
              <div style={{
                background: C.nightCard, border: `1px solid ${card.color}15`, borderRadius: 18, padding: "30px 24px", height: "100%",
                position: "relative", overflow: "hidden", transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.01)"; e.currentTarget.style.borderColor = `${card.color}40`; e.currentTarget.style.boxShadow = `0 20px 50px ${card.color}12`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.borderColor = `${card.color}15`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${card.color}18, transparent 70%)`, filter: "blur(18px)" }} />
                <div style={{ fontSize: 32, marginBottom: 14, filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.4))" }}>{card.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.7 }}>{card.desc}</div>
              </div>
            </SwipeCard>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — ANIMATED STEPS */}
      <div id="how" style={{ padding: "80px 20px", maxWidth: 800, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: C.electric, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>The Learning Loop</div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Gets Smarter Every Campaign</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { s: "01", t: "Generate", d: "One brief, 5 channels, 3 variants each. Winner DNA powers every word.", icon: "⚡", c: C.electric, dir: "swipeIn" },
            { s: "02", t: "Score & Ship", d: "Brand Score gates every variant. Approve, steer, reject. System learns from you.", icon: "✅", c: C.mint, dir: "slideUp" },
            { s: "03", t: "Measure", d: "Import results. AI maps content patterns to performance. Knows what actually works.", icon: "📈", c: C.amber, dir: "slideUp" },
            { s: "04", t: "Level Up", d: "DNA updates. Next campaign is better. Scores climb. Results compound. Forever.", icon: "🧠", c: C.coral, dir: "swipeRight" },
          ].map((x, i) => (
            <SwipeCard key={i} delay={i * 120} direction={x.dir}>
              <div style={{
                background: C.nightCard, borderRadius: 18, padding: "28px 22px", height: "100%",
                border: `1px solid ${x.c}15`, position: "relative", overflow: "hidden",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = `${x.c}40`; e.currentTarget.style.boxShadow = `0 14px 36px ${x.c}12`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = `${x.c}15`; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle, ${x.c}15, transparent 70%)`, filter: "blur(12px)" }} />
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: x.c, marginBottom: 8, letterSpacing: 1 }}>{x.s}</div>
                <div style={{ fontSize: 32, marginBottom: 12, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>{x.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 6 }}>{x.t}</div>
                <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.65 }}>{x.d}</p>
              </div>
            </SwipeCard>
          ))}
        </div>
      </div>

      {/* ═══ CONFIGURATOR ═══ */}
      <div ref={cfgRef} style={{ padding: "80px 20px 24px", maxWidth: 620, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: C.electric, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Configure Your Instance</div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Build It. Brand It. Buy It.</h2>
          <p style={{ color: C.textSoft, marginTop: 8, fontSize: 13 }}>3 steps, 60 seconds. Deployed within 24h.</p>
        </Reveal>

        {/* Progress */}
        <div style={{ display: "flex", gap: 5, marginBottom: 36, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {["Package","Brand","Pay"].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: step >= i+1 ? C.electric : C.nightCard, border: `1.5px solid ${step >= i+1 ? C.electric : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: step >= i+1 ? "#fff" : C.textDim, transition: "all 0.3s" }}>{step > i+1 ? "✓" : i+1}</div>
              <span style={{ fontSize: 10, color: step >= i+1 ? C.text : C.textDim }}>{l}</span>
              {i < 2 && <div style={{ width: 18, height: 1, background: step > i+1 ? C.electric : C.border, transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>

        {/* S1 Package */}
        {step >= 1 && <div style={{ animation: step === 1 ? "si 0.35s ease both" : "none", marginBottom: 16 }}>
          <div style={sty.card(step === 1)}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>Pick your package</h3>
            <p style={{ fontSize: 11, color: C.textDim, marginBottom: 18 }}>All packages include white-label, Winner DNA, and Brand Score.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PACKAGES.map(p => (
                <button key={p.id} onClick={() => setPkg(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                  background: pkg === p.id ? `${C.electric}0B` : C.nightSurface, border: `1.5px solid ${pkg === p.id ? C.electric : C.border}`,
                  transition: "all 0.2s", transform: pkg === p.id ? "scale(1.01)" : "scale(1)", textAlign: "left", position: "relative",
                }}>
                  {p.popular && <div style={{ position: "absolute", top: -8, right: 14, fontSize: 9, background: C.electric, color: "#fff", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>Most Popular</div>}
                  <div style={{ fontSize: 26, minWidth: 36 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>{p.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pkg === p.id ? C.electricBright : C.text }}>€{p.price.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: C.textDim }}>/month</div>
                  </div>
                </button>
              ))}
            </div>
            {step === 1 && <button onClick={() => setStep(2)} style={{ ...sty.btn(C.electric, "#fff"), marginTop: 22, padding: "10px 26px", fontSize: 13 }}>Next: Brand It →</button>}
          </div>
        </div>}

        {/* S2 Brand */}
        {step >= 2 && <div style={{ animation: step === 2 ? "si 0.35s ease both" : "none", marginBottom: 16 }}>
          <div style={sty.card(step === 2)}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>Pick your brand accent</h3>
            <p style={{ fontSize: 11, color: C.textDim, marginBottom: 18 }}>Starting color — refined during onboarding.</p>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
              {BCOLORS.map(c => <button key={c} onClick={() => setBc(c)} style={{ width: 36, height: 36, borderRadius: 9, background: c, border: bc === c ? `2.5px solid ${C.electric}` : "2.5px solid transparent", transform: bc === c ? "scale(1.12)" : "scale(1)", transition: "all 0.2s", cursor: "pointer", boxShadow: bc === c ? `0 0 14px ${c}50` : "none" }} />)}
              <input type="color" value={bc} onChange={e => setBc(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 9, cursor: "pointer", background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)", padding: 0 }} />
            </div>
            <div style={{ background: `${bc}08`, border: `1px solid ${bc}22`, borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.3s" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${bc}, ${bc}AA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{cn ? cn[0]?.toUpperCase() : "C"}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cn || "Your Brand"} Studio</div>
                <div style={{ fontSize: 10, color: C.textDim }}>Branded sidebar preview</div>
              </div>
            </div>
            <input value={cn} onChange={e => setCn(e.target.value)} placeholder="Company name (optional)" style={{ ...sty.input, marginTop: 12 }} onFocus={e => e.target.style.borderColor = bc} onBlur={e => e.target.style.borderColor = C.border} />
            {step === 2 && <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
              <button onClick={() => setStep(1)} style={{ ...sty.btnGhost, padding: "10px 18px", fontSize: 12 }}>← Back</button>
              <button onClick={goPay} style={{ ...sty.btn(`linear-gradient(135deg, ${bc}, ${bc}CC)`, "#fff", `0 4px 16px ${bc}30`), padding: "10px 26px", fontSize: 13 }}>See My Price →</button>
            </div>}
          </div>
        </div>}
      </div>

      {/* ═══ PRICING + PAY ═══ */}
      {step >= 3 && <div ref={payRef} style={{ padding: "30px 20px 80px", maxWidth: 620, margin: "0 auto", animation: "si 0.45s ease both" }}>
        <div style={{ background: C.nightCard, borderRadius: 20, border: `1px solid ${C.borderActive}`, padding: "36px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -36, right: -36, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${bc}12, transparent 70%)`, filter: "blur(36px)" }} />

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 10, color: C.mint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Your Custom Quote</div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{cn || "Your"} ContentStudio</h2>
          </div>

          <div style={{ background: C.nightSurface, borderRadius: 10, padding: 14, marginBottom: 24 }}>
            <div style={{ fontSize: 9, color: C.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Package</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{sel?.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{sel?.name}</div>
                <div style={{ fontSize: 11, color: C.textSoft }}>{sel?.channels} channels, {sel?.seats} seats</div>
              </div>
            </div>
          </div>

          <div style={{ background: `linear-gradient(135deg, ${bc}08, ${C.nightSurface})`, borderRadius: 13, padding: 22, textAlign: "center", border: `1px solid ${bc}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>€{mo.toLocaleString()}<span style={{ fontSize: 16, fontWeight: 500, color: C.textSoft }}>/mo</span></div>
            <div style={{ fontSize: 11, color: C.textSoft, marginTop: 8 }}>No commitment for the first 2 months</div>
          </div>

          <div style={{ background: C.nightSurface, borderRadius: 10, padding: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔧</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Setup fee: €{su.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: C.textSoft }}>Charged after month 2 — only if you stay</div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{ display: "inline-block", padding: "8px 18px", background: C.mintGlow, borderRadius: 100, fontSize: 12, color: C.mint, fontWeight: 600 }}>💰 Annual = save €{save.toLocaleString()}/year</span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Everything included</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {["White-label instance","Brand Score per variant","Winner DNA extraction","Performance dashboard","Multi-language","CRM import (CSV)","3 variants/channel","Dedicated deployment","24h onboarding","Priority support"].map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSoft, padding: "3px 0" }}>
                  <span style={{ color: C.mint, fontSize: 11 }}>✓</span>{x}
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: C.border, margin: "18px 0" }} />

          {!done ? <>
            <h3 style={{ fontSize: 17, fontWeight: 700, textAlign: "center", marginBottom: 5 }}>Ready? Let's go.</h3>
            <p style={{ fontSize: 11, color: C.textDim, textAlign: "center", marginBottom: 22 }}>Choose payment. Credentials within 24h.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 22 }}>
              {[{ id: "card", icon: "💳", l: "Company Card", d: "Visa, MC, AMEX" }, { id: "bank", icon: "🏦", l: "Bank Transfer", d: "SEPA / Wire" }].map(p => (
                <button key={p.id} onClick={() => setPm(p.id)} style={{
                  background: pm === p.id ? `${bc}0B` : C.nightSurface, border: `1.5px solid ${pm === p.id ? bc : C.border}`,
                  borderRadius: 12, padding: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s", transform: pm === p.id ? "scale(1.02)" : "scale(1)",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 5 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.l}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{p.d}</div>
                </button>
              ))}
            </div>

            {pm && <div style={{ animation: "si 0.3s ease both" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
                {[{ k: "name", p: "Full name", t: "text" }, { k: "email", p: "Work email", t: "email" }, { k: "company", p: "Company name", t: "text" }].map(x => (
                  <input key={x.k} type={x.t} placeholder={x.p} value={f[x.k]} onChange={e => setF(p => ({ ...p, [x.k]: e.target.value }))}
                    style={sty.input} onFocus={e => e.target.style.borderColor = bc} onBlur={e => e.target.style.borderColor = C.border} />
                ))}
              </div>

              {pm === "bank" && <div style={{ background: C.nightSurface, borderRadius: 10, padding: 16, marginBottom: 18, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 8 }}>Wire Details</div>
                <div style={{ fontSize: 11, color: C.textSoft, lineHeight: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  <div>Bank: <span style={{ color: C.text }}>BNP Paribas</span></div>
                  <div>IBAN: <span style={{ color: C.text }}>FR76 XXXX XXXX XXXX XXXX XXXX XXX</span></div>
                  <div>BIC: <span style={{ color: C.text }}>BNPAFRPP</span></div>
                  <div>Ref: <span style={{ color: C.electric }}>CS-{(cn || f.company || "CLIENT").toUpperCase().slice(0, 6)}-{new Date().getFullYear()}</span></div>
                  <div>Due now: <span style={{ color: C.mint }}>€{mo.toLocaleString()}</span> <span style={{ color: C.textDim }}>(month 1)</span></div>
                </div>
              </div>}

              {pm === "card" && <div style={{ background: C.nightSurface, borderRadius: 10, padding: 16, marginBottom: 18, border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: C.textSoft }}>You'll be redirected to Stripe to pay <span style={{ color: C.text, fontWeight: 600 }}>€{mo.toLocaleString()}</span> <span style={{ color: C.textDim }}>(month 1)</span></div>
              </div>}

              <button onClick={handleSubmit} disabled={!ok || sending} style={{
                width: "100%", padding: "15px 24px", borderRadius: 12, border: "none",
                background: ok && !sending ? `linear-gradient(135deg, ${bc}, ${bc}CC)` : C.nightSurface,
                color: ok && !sending ? "#fff" : C.textDim, fontSize: 14, fontWeight: 700,
                cursor: ok && !sending ? "pointer" : "not-allowed", transition: "all 0.3s",
                boxShadow: ok && !sending ? `0 5px 24px ${bc}30` : "none",
              }}>{sending ? "Submitting..." : pm === "card" ? "Submit & Pay with Stripe →" : "Submit & Get Invoice →"}</button>
              <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: C.textDim }}>🔒 Encrypted & secure</div>
            </div>}
          </> : (
            <div style={{ animation: "si 0.5s ease both", textAlign: "center", padding: "28px 12px" }}>
              <div style={{ fontSize: 50, marginBottom: 10 }}>🚀</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.mint, marginBottom: 8 }}>You're In!</h3>
              <p style={{ fontSize: 13, color: C.textSoft, lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
                {pm === "card" ? `Payment link sent to ${f.email}. You'll be up and running in no time.` : `Invoice sent to ${f.email}. You'll be up and running in no time.`}
              </p>
              <div style={{ background: C.nightSurface, borderRadius: 13, padding: 20, marginTop: 22, border: `1px solid ${C.border}`, textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12 }}>What happens next:</div>
                {[
                  { t: "Minutes", x: `${pm === "card" ? "Payment confirmed" : "Invoice"} — check your inbox`, i: "💳" },
                  { t: "< 2 hours", x: `${cn || f.company} Studio live — credentials delivered`, i: "🔑" },
                  { t: "Same day", x: "Optional onboarding call to configure your instance", i: "📞" },
                  { t: "Day 1–2", x: "Brand upload, voice calibration, Winner DNA", i: "🧬" },
                  { t: "Day 3", x: "First AI campaign ready for review", i: "⚡" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 16, minWidth: 22 }}>{item.i}</span>
                    <div>
                      <div style={{ fontSize: 10, color: C.electric, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{item.t}</div>
                      <div style={{ fontSize: 11, color: C.textSoft, marginTop: 1 }}>{item.x}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: "12px 18px", borderRadius: 10, background: `${bc}08`, border: `1px solid ${bc}18`, fontSize: 12, color: C.textSoft }}>
                Questions? <span style={{ color: C.text, fontWeight: 500 }}>hello@contentstudio.io</span>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/* FOOTER */}
      <footer style={{ padding: "44px 20px 28px", borderTop: `1px solid ${C.border}`, maxWidth: 740, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${C.electric}, ${C.mint})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.night }}>C</div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>ContentStudio</span>
        </div>
        <p style={{ fontSize: 11, color: C.textDim, maxWidth: 420, margin: "0 auto 16px" }}>AI content that learns your brand, proves value, gets smarter every campaign.</p>
        <div style={{ fontSize: 10, color: C.textDim }}>© {new Date().getFullYear()} ContentStudio</div>
      </footer>
    </div>
  );
}
