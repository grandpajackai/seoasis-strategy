"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  Crosshair,
  Download,
  FileText,
  Info,
  Layers,
  LayoutDashboard,
  Library,
  Link,
  ListFilter,
  LockKeyhole,
  Menu,
  MessagesSquare,
  Minus,
  Moon,
  Network,
  NotebookPen,
  PenLine,
  Plus,
  Presentation,
  Quote,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  Telescope,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";
const Icons = {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  Crosshair,
  Download,
  FileText,
  Info,
  Layers,
  LayoutDashboard,
  Library,
  Link,
  ListFilter,
  LockKeyhole,
  Menu,
  MessagesSquare,
  Minus,
  Moon,
  Network,
  NotebookPen,
  PenLine,
  Plus,
  Presentation,
  Quote,
  RefreshCw,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Sun,
  Telescope,
  TrendingUp,
  UserRound,
  X,
  Zap,
};
import { navigation, interviewSteps } from "./navigation";
import {
  AnyRecord,
  CopyButton,
  Record,
  ResearchLibrary,
  SourceRefs,
  Tag,
  human,
  textOf,
} from "./Research";
import bundleData from "@/data/research-bundle.json";
import strategyData from "@/data/strategy.json";
import sourceData from "@/data/sources.json";
import opportunityData from "@/data/opportunities.json";
import roadmapData from "@/data/roadmap.json";
import {
  Backlog,
  CollectionLab,
  ArchitectureMap,
  CompetitorMap,
  RevenueFunnel,
  AIQueryLab,
  MeasurementView,
} from "./Workspaces";
const bundle: AnyRecord = bundleData;
const strategy: AnyRecord = strategyData;
const sources: AnyRecord[] = sourceData as AnyRecord[];
const opportunities: AnyRecord[] = Array.isArray(opportunityData)
  ? opportunityData
  : (opportunityData as AnyRecord).opportunities || [];
const roadmap: AnyRecord[] = Array.isArray(roadmapData)
  ? roadmapData
  : (roadmapData as AnyRecord).tasks || [];
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
function Icon({
  name,
  size = 18,
  ...rest
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = (Icons as any)[name] || Icons.Circle;
  return <C size={size} strokeWidth={1.7} {...rest} />;
}
const groups = [...new Set(navigation.map((n) => n.group))];
export function downloadJSON(name: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export default function Dashboard() {
  const [active, setActive] = useState("overview"),
    [dark, setDark] = useState(false),
    [mobile, setMobile] = useState(false),
    [interview, setInterview] = useState(false),
    [step, setStep] = useState(0),
    [searchOpen, setSearchOpen] = useState(false),
    [search, setSearch] = useState(""),
    [small, setSmall] = useState(false),
    [interviewDetail, setInterviewDetail] = useState(false);
  const interviewRef = useRef(false);
  const stepRef = useRef(0);
  const sidebarRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1);
      if (navigation.some((n) => n.id === id)) {
        if (
          interviewRef.current &&
          id !== interviewSteps[stepRef.current].section
        ) {
          interviewRef.current = false;
          setInterview(false);
          setInterviewDetail(false);
        }
        setActive(id);
      }
    };
    sync();
    setDark(localStorage.getItem("seoasis-theme") === "dark");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    interviewRef.current = interview;
    stepRef.current = step;
  }, [interview, step]);
  useEffect(() => {
    const media = window.matchMedia("(max-width:700px)");
    const sync = () => {
      setSmall(media.matches);
      if (!media.matches) setMobile(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobile || searchOpen ? "hidden" : "";
    if (mainRef.current) mainRef.current.inert = mobile || searchOpen;
    if (headerRef.current) headerRef.current.inert = mobile || searchOpen;
    if (sidebarRef.current)
      sidebarRef.current.inert = searchOpen || (small && !mobile);
    return () => {
      document.body.style.overflow = "";
      if (mainRef.current) mainRef.current.inert = false;
      if (headerRef.current) headerRef.current.inert = false;
      if (sidebarRef.current) sidebarRef.current.inert = false;
    };
  }, [mobile, searchOpen, small]);
  useEffect(() => {
    if (!mobile && !searchOpen) return;
    const target = searchOpen ? searchPanelRef.current : sidebarRef.current;
    const focus = searchOpen
      ? searchRef.current
      : target?.querySelector<HTMLElement>(".sidebar-close");
    focus?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = Array.from(
        target?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',
        ) || [],
      ).filter((el) => el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0],
        last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      returnFocus.current?.focus();
    };
  }, [mobile, searchOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobile(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((s) => {
          if (!s) returnFocus.current = document.activeElement as HTMLElement;
          return !s;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  const current = navigation.find((n) => n.id === active) || navigation[0];
  const go = (id: string, preserveInterview = false) => {
    if (!preserveInterview) {
      interviewRef.current = false;
      setInterview(false);
      setInterviewDetail(false);
    }
    setActive(id);
    setMobile(false);
    setSearchOpen(false);
    window.location.hash = id;
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => {
      titleRef.current?.focus();
      navRef.current
        ?.querySelector<HTMLElement>("[aria-current]")
        ?.scrollIntoView({ block: "nearest" });
    }, 50);
  };
  const searchResults = navigation.filter((n) =>
    (n.label + " " + n.description)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const showInterview = () => {
    interviewRef.current = !interview;
    stepRef.current = 0;
    setInterview(!interview);
    setInterviewDetail(false);
    setTimeout(() => {
      if (navRef.current) navRef.current.scrollTop = 0;
    }, 80);
    if (!interview) {
      setStep(0);
      go(interviewSteps[0].section, true);
    }
  };
  const moveStep = (s: number) => {
    stepRef.current = s;
    setStep(s);
    setInterviewDetail(false);
    go(interviewSteps[s].section, true);
  };
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        ref={sidebarRef}
        className={`sidebar ${mobile ? "mobile-open" : ""}`}
        aria-hidden={small && !mobile ? true : undefined}
      >
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            go("overview");
          }}
          className="brand client-brand"
          aria-label="SEOasis client workspace home"
        >
          <img
            className="brand-logo"
            src={`${base}/seoasis-logo.svg`}
            alt="SEOasis"
            width={9380}
            height={1700}
          />
          <span className="brand-sub">CLIENT STRATEGY WORKSPACE</span>
        </a>
        <button
          className="sidebar-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        >
          <Icons.X size={20} />
        </button>
        <div className="workspace-chip">
          <span className="live-dot" />
          INTERVIEW WORK SAMPLE<span>01</span>
        </div>
        <nav
          aria-label={
            interview ? "Interview presentation steps" : "Dashboard sections"
          }
          ref={navRef}
        >
          {interview ? (
            <div className="nav-group interview-nav">
              <p>THE FOUNDER WALKTHROUGH</p>
              {interviewSteps.map((s, i) => (
                <a
                  key={s.title}
                  href={`#${s.section}`}
                  onClick={(e) => {
                    e.preventDefault();
                    moveStep(i);
                  }}
                  className={step === i ? "active" : ""}
                  aria-current={step === i ? "step" : undefined}
                >
                  <span className="step-index">0{i + 1}</span>
                  <span>{s.title}</span>
                </a>
              ))}
              <button
                className="interview-nav-exit"
                onClick={() => {
                  setInterview(false);
                  setInterviewDetail(false);
                }}
              >
                <Icons.LayoutDashboard size={16} />
                Return to full workspace
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div className="nav-group" key={group}>
                <p>{group}</p>
                {navigation
                  .filter((n) => n.group === group)
                  .map((n) => (
                    <a
                      href={`#${n.id}`}
                      key={n.id}
                      onClick={(e) => {
                        e.preventDefault();
                        go(n.id);
                      }}
                      className={active === n.id ? "active" : ""}
                      aria-current={active === n.id ? "page" : undefined}
                    >
                      <Icon name={n.icon} size={17} />
                      <span>{n.label}</span>
                      {active === n.id && <i />}
                    </a>
                  ))}
              </div>
            ))
          )}
        </nav>
        <div className="sidebar-footer">
          <Icons.ShieldCheck size={17} />
          <div>
            Public evidence. Clear judgment.
            <small>Independent candidate preparation</small>
          </div>
        </div>
      </aside>
      <div className={`workspace ${interview ? "interview-active" : ""}`}>
        <header className="topbar" ref={headerRef}>
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              aria-controls="workspace-navigation"
              aria-expanded={mobile}
              onClick={() => {
                returnFocus.current = document.activeElement as HTMLElement;
                setMobile(true);
              }}
            >
              <Icons.Menu size={20} />
            </button>
            <span>Workspace</span>
            <Icons.ChevronRight size={13} />
            <strong>{current.short}</strong>
          </div>
          <div className="top-actions">
            <button
              className="search-trigger icon-button"
              aria-label="Search dashboard"
              onClick={() => {
                if (!searchOpen)
                  returnFocus.current = document.activeElement as HTMLElement;
                setSearchOpen((s) => !s);
              }}
            >
              <Icons.Search size={18} />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <span className="top-divider" />
            <button
              className="icon-button theme-toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => {
                setDark(!dark);
                localStorage.setItem("seoasis-theme", !dark ? "dark" : "light");
              }}
            >
              {dark ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
            </button>
            <button
              className={`button interview-toggle ${interview ? "on" : ""}`}
              aria-pressed={interview}
              onClick={showInterview}
            >
              <Icons.Presentation size={16} />
              <span>{interview ? "Exit interview" : "Interview Mode"}</span>
            </button>
          </div>
        </header>
        {searchOpen && (
          <div
            className="search-panel"
            ref={searchPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search dashboard"
          >
            <label htmlFor="global-search">Find a workspace section</label>
            <div className="search-field">
              <Icons.Search size={18} />
              <input
                id="global-search"
                ref={searchRef}
                placeholder="Try collections, evidence, or revenue…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <Icons.X size={18} />
              </button>
            </div>
            <div className="search-results">
              {searchResults.map((n) => (
                <button key={n.id} onClick={() => go(n.id)}>
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                  <Icons.ArrowUpRight size={15} />
                </button>
              ))}
              {!searchResults.length && (
                <p>No sections match. Try a shorter term.</p>
              )}
            </div>
          </div>
        )}
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {interview && (
            <section
              className="interview-rail"
              aria-label="Interview presentation"
            >
              <div className="interview-rail-top">
                <span>
                  <Icons.Presentation size={15} /> THE 5–8 MINUTE PATH
                </span>
                <strong>
                  {String(step + 1).padStart(2, "0")} / 08 ·{" "}
                  {interviewSteps[step].time}
                </strong>
              </div>
              <div className="interview-dots">
                {interviewSteps.map((s, i) => (
                  <button
                    key={s.title}
                    className={
                      step === i ? "current" : i < step ? "passed" : ""
                    }
                    onClick={() => moveStep(i)}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    aria-current={step === i ? "step" : undefined}
                  />
                ))}
              </div>
              <div className="interview-copy">
                <div>
                  <h2>{interviewSteps[step].title}</h2>
                  <p>{interviewSteps[step].message}</p>
                </div>
                <div className="interview-controls">
                  <button
                    className="icon-button"
                    disabled={step === 0}
                    aria-label="Previous interview step"
                    onClick={() => moveStep(step - 1)}
                  >
                    <Icons.ArrowLeft size={20} />
                  </button>
                  <button
                    className="button primary"
                    onClick={() =>
                      step === 7 ? setInterview(false) : moveStep(step + 1)
                    }
                  >
                    {step === 7 ? "Finish" : "Next"}
                    <Icons.ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </section>
          )}
          <div className="page-heading">
            <div>
              <p className="eyebrow">{current.eyebrow}</p>
              <h1 ref={titleRef} tabIndex={-1}>
                {current.title}
              </h1>
              <p className="page-description">{current.description}</p>
            </div>
            <div className="page-meta">
              <span className="date-label">
                <Icons.CalendarDays size={13} />
                14 OCT 2026 · UTC
              </span>
              <span className="sample-label">
                <span className="live-dot" />
                PUBLIC DATA ONLY
              </span>
            </div>
          </div>
          {interview && !interviewDetail ? (
            <InterviewStage
              step={step}
              onDetail={() => setInterviewDetail(true)}
            />
          ) : active === "overview" ? (
            <Overview go={go} />
          ) : active === "sources" ? (
            <Sources />
          ) : active === "backlog" ? (
            <Backlog data={opportunities} sources={sources} />
          ) : active === "roadmap" ? (
            <Roadmap go={go} />
          ) : active === "interview" ? (
            <InterviewNotes />
          ) : (
            <Section active={active} go={go} />
          )}
          {interview && interviewDetail && (
            <button
              className="button subtle return-to-story"
              onClick={() => {
                setInterviewDetail(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Icons.ArrowLeft size={15} />
              Return to interview story
            </button>
          )}
          <footer className="main-footer">
            <span>
              Independent interview work sample · SEOasis is the public-data
              case study.
            </span>
            <a href={`${base}/ASSUMPTIONS.md`} download>
              Scope & assumptions
              <Icons.ArrowUpRight size={12} />
            </a>
            <span>Research snapshot: 14 Oct 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
function SectionLabel({
  index,
  title,
  aside,
}: {
  index?: string;
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <h2>
        {index && <span>{index}</span>}
        {title}
      </h2>
      {aside}
    </div>
  );
}
function Overview({ go }: { go: (s: string) => void }) {
  const [scoreIndex, setScoreIndex] = useState<number | null>(null);
  const scores: AnyRecord[] = strategy.scores || [];
  const strengths: AnyRecord[] = strategy.strengths || [];
  const wins: AnyRecord[] =
    strategy.opportunities || strategy.topOpportunities || [];
  return (
    <>
      <section className="thesis-card">
        <div>
          <span className="tag dark-tag">
            <i />
            THE WORKING THESIS · INFERRED
          </span>
          <h2>
            A revenue-led playbook.
            <br />
            <em>An operator’s point of view.</em>
          </h2>
          <p>
            {strategy.assessmentSummary ||
              strategy.assessment ||
              "SEOasis has a clear public proposition around Shopify collections and AI-era search. This workspace translates that proposition into an evidence trail, a client execution system, and a quarterly learning loop."}
          </p>
          <div className="thesis-actions">
            <button className="button cream" onClick={() => go("roadmap")}>
              Explore the 90-day plan
              <Icons.ArrowUpRight size={16} />
            </button>
            <button className="text-button" onClick={() => go("methodology")}>
              Understand the methodology
              <Icons.ArrowRight size={15} />
            </button>
          </div>
          <div className="thesis-source">
            <span>
              Medium confidence · Public positioning; results need account
              validation.
            </span>
            <SourceRefs
              ids={strategy.source || ["src-company-home", "N-01"]}
              sources={sources}
            />
          </div>
        </div>
        <div className="orbit-illustration" aria-hidden="true">
          <div className="orbit o1" />
          <div className="orbit o2" />
          <div className="orbit o3" />
          <div className="orbit-center">
            <Icons.Sprout size={26} />
            <span>REVENUE</span>
          </div>
          <span className="orbit-label ol1">
            <Icons.Layers size={13} />
            Collections
          </span>
          <span className="orbit-label ol2">
            <Icons.Braces size={13} />
            Structure
          </span>
          <span className="orbit-label ol3">
            <Icons.MessagesSquare size={13} />
            Authority
          </span>
          <span className="orbit-label ol4">
            <Icons.ChartNoAxesCombined size={13} />
            Measurement
          </span>
        </div>
      </section>
      <div className="notice client-purpose">
        <Icons.LayoutDashboard size={19} />
        <p>
          <strong>Built for Shopify client work.</strong> SEOasis is an agency,
          and its website supplies the public research example here. The client
          frameworks support assessments, meeting preparation, and periodic
          reviews. Performance tracking would require authorized account data;
          no platforms are connected in this demo.
        </p>
      </div>
      <section className="scope-strip" aria-label="Research scope">
        <div>
          <strong>
            {bundle.technical?.scope?.sampleSize ||
              bundle.technical?.scope?.pagesAudited ||
              bundle.pages?.pages?.length ||
              bundle.pages?.length ||
              "20"}
          </strong>
          <span>HTML pages sampled</span>
        </div>
        <div>
          <strong>{sources.length}</strong>
          <span>Source records preserved</span>
        </div>
        <div>
          <strong>18</strong>
          <span>Specialized workstreams</span>
        </div>
        <div>
          <strong>
            90<span> days</span>
          </strong>
          <span>Strategy recalibration</span>
        </div>
        <button onClick={() => go("sources")} className="scope-link">
          See research scope
          <Icons.ArrowUpRight size={18} />
        </button>
      </section>
      <SectionLabel
        index="01"
        title="Public evidence scorecard"
        aside={
          <span className="caption">
            Evidence coverage, not business performance
          </span>
        }
      />
      <div className="notice score-notice">
        <Icons.Info size={18} />
        <p>
          Each score reflects four disclosed checks worth 25 points each. It
          describes what this sample can substantiate. An unchecked criterion is
          a validation need, and no score measures rankings, revenue, or actual
          AI visibility.
        </p>
      </div>
      <div className="score-grid">
        {scores.map((s, i) => (
          <button
            key={s.id || i}
            id={`score-card-${i}`}
            className={`score-card ${scoreIndex === i ? "selected" : ""}`}
            aria-expanded={scoreIndex === i}
            aria-controls="score-rubric-panel"
            onClick={() => {
              const next = scoreIndex === i ? null : i;
              setScoreIndex(next);
              if (next !== null)
                setTimeout(
                  () =>
                    document
                      .getElementById("score-rubric-panel")
                      ?.focus({ preventScroll: true }),
                  100,
                );
              if (next !== null)
                setTimeout(
                  () =>
                    document
                      .getElementById("score-rubric-panel")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      }),
                  80,
                );
            }}
          >
            <span className="score-summary">
              <span>{s.name || s.label}</span>
              <strong>
                {s.score}
                <small>/100</small>
              </strong>
              <span className="score-track">
                <i style={{ width: `${s.score}%` }} />
              </span>
              <span className="score-foot">
                {s.confidence} confidence
                <Icons.Plus size={13} />
              </span>
            </span>
          </button>
        ))}
      </div>
      {scoreIndex !== null && scores[scoreIndex] && (
        <section
          id="score-rubric-panel"
          tabIndex={-1}
          className="score-rubric-panel"
          aria-label={`${scores[scoreIndex].name} evidence rubric`}
        >
          <div className="section-label">
            <h2>
              {scores[scoreIndex].name} · {scores[scoreIndex].score}/100
            </h2>
            <button
              className="icon-button"
              aria-label="Close score rubric"
              onClick={() => {
                setScoreIndex(null);
                setTimeout(
                  () =>
                    document
                      .getElementById(`score-card-${scoreIndex}`)
                      ?.focus({ preventScroll: true }),
                  60,
                );
                setTimeout(
                  () =>
                    document
                      .querySelector(".score-grid")
                      ?.scrollIntoView({ block: "start", behavior: "smooth" }),
                  50,
                );
              }}
            >
              <Icons.X size={18} />
            </button>
          </div>
          <p className="rubric-scope">{scores[scoreIndex].scope}</p>
          <div className="rubric-criteria">
            {scores[scoreIndex].criteria.map((c: any, i: number) => (
              <article key={i}>
                <span className={c.met ? "criterion-met" : "criterion-open"}>
                  {c.met ? (
                    <Icons.Check size={16} />
                  ) : (
                    <Icons.Minus size={16} />
                  )}
                </span>
                <div>
                  <span className="rubric-points">
                    {c.met
                      ? "25 points · substantiated"
                      : "0 points · validation needed"}
                  </span>
                  <h3>{c.label || c.name}</h3>
                  <p>{c.evidence || c.note}</p>
                  <SourceRefs
                    ids={c.source || scores[scoreIndex].source}
                    sources={sources}
                  />
                </div>
              </article>
            ))}
          </div>
          <div className="record-meta">
            <Tag type="INFERRED" />
            <span>
              {scores[scoreIndex].confidence} confidence · Evidence coverage,
              not business performance.
            </span>
          </div>
        </section>
      )}
      <div className="overview-columns">
        <section>
          <SectionLabel index="02" title="Strengths to build on" />
          <div className="insight-list">
            {strengths.map((f, i) => (
              <Insight key={i} data={f} index={i + 1} />
            ))}
          </div>
        </section>
        <section>
          <SectionLabel index="03" title="Opportunities worth exploring" />
          <div className="insight-list">
            {wins.slice(0, 5).map((f, i) => (
              <Insight key={i} data={f} index={i + 1} />
            ))}
          </div>
        </section>
      </div>
      <SectionLabel
        index="04"
        title="What I would validate internally"
        aside={
          <button className="text-link" onClick={() => go("measurement")}>
            Open measurement framework
            <Icons.ArrowRight size={14} />
          </button>
        }
      />
      <div className="validation-grid">
        {(strategy.internalValidation || [])
          .slice(0, 5)
          .map((f: any, i: number) => (
            <article key={i} className="validation-card">
              <Icons.LockKeyhole size={18} />
              <h3>{f.title || f.name}</h3>
              <p>{f.why || f.evidence || f.description}</p>
              <span>Requires Internal Access</span>
              <small>{f.platform || f.platforms}</small>
              <small>{f.confidence} confidence</small>
              <details className="validation-detail">
                <summary>
                  Metric &amp; decision
                  <Icons.ChevronDown size={12} />
                </summary>
                <p>
                  <strong>Pull</strong>
                  {f.metric}
                </p>
                <p>
                  <strong>Decision</strong>
                  {f.decision}
                </p>
                <SourceRefs ids={f.source} sources={sources} />
              </details>
            </article>
          ))}
      </div>
      <SectionLabel index="05" title="An execution horizon for every idea" />
      <div className="horizon-grid">
        {[
          {
            label: "Quick wins",
            window: "VALIDATE & SHIP",
            key: "quickWins",
            icon: "Zap",
          },
          {
            label: "Medium-term opportunities",
            window: "BUILD & MEASURE",
            key: "mediumTerm",
            icon: "Layers",
          },
          {
            label: "Strategic bets",
            window: "TEST & LEARN",
            key: "strategicBets",
            icon: "Telescope",
          },
        ].map((h) => (
          <article className="horizon-card" key={h.key}>
            <div>
              <Icon name={h.icon} />
              <span>{h.window}</span>
            </div>
            <h3>{h.label}</h3>
            {(strategy[h.key] || []).map((v: any, i: number) => (
              <p key={i}>{textOf(v)}</p>
            ))}
            <button className="text-link" onClick={() => go("backlog")}>
              See the working queue
              <Icons.ArrowUpRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
function Insight({ data: f, index }: { data: AnyRecord; index: number }) {
  return (
    <details className="insight">
      <summary>
        <span className="insight-number">{String(index).padStart(2, "0")}</span>
        <span>
          <h3>{f.title || f.name || f.opportunity}</h3>
          <p>{f.summary || f.description || f.evidence}</p>
          <span className="record-meta">
            <Tag type={f.classification} />
            <span>{f.confidence || "Medium"} confidence</span>
          </span>
        </span>
        <Icons.ChevronDown size={16} />
      </summary>
      <div className="insight-detail">
        <p>
          {f.action ||
            f.implication ||
            f.businessImplication ||
            f.note ||
            f.evidence}
        </p>
        <SourceRefs ids={f.source || f.sourceIds} sources={sources} />
      </div>
    </details>
  );
}
function Section({ active, go }: { active: string; go: (s: string) => void }) {
  const key =
    active === "methodology"
      ? "company"
      : active === "onpage"
        ? "onpage"
        : active;
  const data = bundle[key];
  const guide = bundle.guides?.[active];
  return (
    <>
      {guide && (
        <div className="operator-note">
          <div className="note-icon">
            <Icon
              name={navigation.find((n) => n.id === active)?.icon || "Compass"}
              size={22}
            />
          </div>
          <div>
            <p className="eyebrow">WHAT THIS MEANS IN THE SEAT</p>
            <h2>{guide.title}</h2>
            <p>{guide.description}</p>
            <div className="record-meta">
              <Tag type={guide.classification || "OPPORTUNITY"} />
              <span>{guide.confidence || "Medium"} confidence</span>
              <SourceRefs ids={guide.source} sources={sources} />
            </div>
          </div>
        </div>
      )}
      {active === "technical" && <TechnicalSummary />}
      {active === "keywords" && <KeywordMap />}
      {active === "methodology" && <OperatingLoop />}
      {active === "collections" && (
        <CollectionLab data={data} sources={sources} />
      )}
      {active === "architecture" && (
        <ArchitectureMap data={data} sources={sources} go={go} />
      )}
      {active === "competitors" && (
        <CompetitorMap data={data} sources={sources} />
      )}
      {active === "cro" && <RevenueFunnel data={data} sources={sources} />}
      {active === "aeo" && <AIQueryLab data={data} sources={sources} />}
      {active === "measurement" && (
        <MeasurementView data={data} sources={sources} />
      )}
      <SectionLabel
        title={
          active === "methodology"
            ? "The methodology, translated into operations"
            : "Research & working framework"
        }
        aside={
          <button
            className="button subtle"
            onClick={() =>
              downloadJSON(`seoasis-${active}-research.json`, { data, sources })
            }
          >
            <Icons.Download size={14} />
            Research JSON
          </button>
        }
      />
      {data?.scope && (
        <div className="scope-note">
          <strong>Scope</strong>
          <p>{textOf(data.scope) || textOf(data.scope?.description)}</p>
        </div>
      )}
      <ResearchLibrary
        data={data}
        sources={sources}
        preferred={
          active === "technical"
            ? ["findings", "issues"]
            : active === "keywords"
              ? ["clusters", "keywordMap"]
              : active === "onpage"
                ? ["pages", "reviews"]
                : active === "schema"
                  ? ["observed", "findings"]
                  : ["pillars", "observations", "findings", "framework"]
        }
      />
      {(data?.limitations || data?.metadata?.limitations) && (
        <div className="notice">
          <Icons.Info size={18} />
          <div>
            <strong>Limits of this review</strong>
            <p>{textOf(data.limitations || data.metadata.limitations)}</p>
          </div>
        </div>
      )}
    </>
  );
}
function TechnicalSummary() {
  const d = bundle.technical;
  const sc = d?.scope || {};
  const pages: AnyRecord[] = bundle.pages?.pages || [];
  return (
    <>
      <div className="technical-strip">
        {[
          {
            label: "Audit method",
            value: "HTTP + HTML",
            note: "A bounded representative sample",
          },
          {
            label: "XML sitemap",
            value: sc.sitemapUrlCount || 70,
            note: "Discovery inventory, not index count",
          },
          {
            label: "Field performance",
            value: "Not measured",
            note: "CWV needs CrUX / PSI validation",
          },
          {
            label: "Indexation",
            value: "Needs GSC",
            note: "HTTP 200 does not prove indexing",
          },
        ].map((x) => (
          <div key={x.label}>
            <span>{x.label}</span>
            <strong>{String(x.value)}</strong>
            <small>{x.note}</small>
          </div>
        ))}
      </div>
      <details className="research-group">
        <summary>
          <span>
            Inspect the sampled pages
            <small>{pages.length} HTTP / HTML records</small>
          </span>
          <Icons.ChevronDown size={17} />
        </summary>
        <div className="table-scroll">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Page / title</th>
                <th>Status</th>
                <th>H1 count</th>
                <th>Canonical in HTML</th>
                <th>JSON-LD types</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <a
                      className="inline-link"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.url.replace("https://www.seoasis.io", "") || "/"}
                      <Icons.ArrowUpRight size={12} />
                    </a>
                    <p>{p.title}</p>
                  </td>
                  <td>{p.status}</td>
                  <td>{p.h1?.length}</td>
                  <td>
                    {p.canonical?.length ? "Present" : "Not found in HTML"}
                  </td>
                  <td>{p.schemaTypes?.length || 0}</td>
                  <td>
                    <SourceRefs ids={p.source} sources={sources} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
function KeywordMap() {
  const clusters: AnyRecord[] = bundle.keywords?.clusters || [];
  return (
    <>
      <div className="section-label">
        <h2>Keyword → page ownership map</h2>
        <Tag type="INFERRED" />
      </div>
      <div className="table-scroll">
        <table className="inventory-table keyword-table">
          <thead>
            <tr>
              <th>Cluster</th>
              <th>Commercial intent</th>
              <th>Business relevance</th>
              <th>Public coverage</th>
              <th>Proposed page owner</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.cluster}</strong>
                  <small>{c.searchIntent}</small>
                  <SourceRefs ids={c.sourceIds} sources={sources} />
                </td>
                <td>{c.commercialIntent}</td>
                <td>{c.businessRelevance}</td>
                <td>
                  <span className="category-label">{c.currentCoverage}</span>
                </td>
                <td>
                  {c.mappedPage?.startsWith("http") ? (
                    <a
                      className="inline-link"
                      href={c.mappedPage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.mappedPage.replace("https://www.seoasis.io", "")}
                      <Icons.ArrowUpRight size={12} />
                    </a>
                  ) : (
                    c.mappedPage
                  )}
                </td>
                <td>{c.competitiveDifficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        Coverage describes reviewed public content, not rankings. Page ownership
        is provisional until query/page and conversion evidence is reviewed.
        Search volumes and live rankings were not measured.
      </p>
    </>
  );
}
function OperatingLoop() {
  return (
    <div className="operating-loop">
      {[
        {
          n: "01",
          title: "Research",
          body: "Catalog, intent, and account baseline.",
        },
        {
          n: "02",
          title: "Prioritize",
          body: "Revenue hypothesis, effort, and confidence.",
        },
        {
          n: "03",
          title: "Ship + QA",
          body: "Implement, review, and document.",
        },
        {
          n: "04",
          title: "Measure",
          body: "Track outcomes and explain the next move.",
        },
        {
          n: "05",
          title: "Recalibrate",
          body: "Revise the strategy every 90 days.",
        },
      ].map((x) => (
        <div key={x.n}>
          <span>{x.n}</span>
          <h3>{x.title}</h3>
          <p>{x.body}</p>
        </div>
      ))}
    </div>
  );
}
function Roadmap({ go }: { go: (s: string) => void }) {
  const phases = [
    {
      key: "1–30",
      title: "Understand + baseline",
      desc: "Agree on the business, the evidence, and the definition of done.",
    },
    {
      key: "31–60",
      title: "Execute + QA",
      desc: "Ship the highest-confidence batch and verify the whole journey.",
    },
    {
      key: "61–90",
      title: "Measure + recalibrate",
      desc: "Expand what earns the right to scale. Revise what does not.",
    },
  ];
  return (
    <>
      <div className="roadmap-phases">
        {phases.map((p, i) => (
          <div key={p.key}>
            <span>DAYS {p.key}</span>
            <h2>
              <b>0{i + 1}</b>
              {p.title}
            </h2>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="notice">
        <Icons.Info size={18} />
        <p>
          Sample plan, relative to account kickoff. Owners are proposed roles,
          all tasks start as proposals, and production capacity must be agreed
          with the team. No client results or delivery guarantees are implied.
        </p>
      </div>
      <div className="section-label">
        <h2>Accountable work, visible dependencies</h2>
        <a className="button subtle" href={`${base}/90-DAY-PLAN.md`} download>
          <Icons.Download size={14} />
          Download plan
        </a>
      </div>
      <div className="roadmap-tasks">
        {roadmap.map((t, i) => (
          <details key={t.id || i} className="roadmap-task">
            <summary>
              <span
                className={`priority ${String(t.priority || "P2").toLowerCase()}`}
              >
                {t.priority || "P2"}
              </span>
              <div>
                <h3>{t.task || t.title}</h3>
                <p>
                  {t.owner} · {t.dueWindow || t.window || t.phase} ·{" "}
                  {t.status || "Proposed"}
                </p>
              </div>
              <Icons.ChevronDown size={17} />
            </summary>
            <div className="roadmap-task-detail">
              <Record data={t} sources={sources} />
            </div>
          </details>
        ))}
      </div>
      <div className="quarterly-gate">
        <Icons.RefreshCw size={28} />
        <div>
          <p className="eyebrow">THE DAY-90 DECISION</p>
          <h2>Keep. Expand. Revise. Stop.</h2>
          <p>
            Compare the original hypothesis with the baseline and outcome.
            Explain uncertainty, record the decision, and build the next
            quarter’s plan with the client.
          </p>
        </div>
        <button className="button primary" onClick={() => go("measurement")}>
          Review the metrics
          <Icons.ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
function Sources() {
  const [q, setQ] = useState("");
  const filtered = sources.filter((s) =>
    (s.title + " " + s.url + " " + s.note + " " + s.id)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="source-intro">
        <div>
          <Icons.BookOpen size={26} />
          <h2>A research ledger you can inspect.</h2>
          <p>
            Observed means the public source contains the statement or element.
            It does not independently verify a company’s reported performance.
            Repeated URLs preserve different supporting notes from independent
            workstreams.
          </p>
        </div>
        <a className="button primary" href={`${base}/SOURCES.md`} download>
          <Icons.Download size={15} />
          Download source register
        </a>
      </div>
      <div className="evidence-legend">
        {["OBSERVED", "INFERRED", "OPPORTUNITY", "REQUIRES INTERNAL DATA"].map(
          (t) => (
            <Tag key={t} type={t} />
          ),
        )}
      </div>
      <div className="table-toolbar">
        <div className="search-field">
          <Icons.Search size={16} />
          <input
            aria-label="Search sources"
            placeholder="Search page title, URL, note, or source ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span>
          {filtered.length} of {sources.length} source records
        </span>
      </div>
      <div className="source-list">
        {filtered.map((s, i) => (
          <article className="source-row" key={s.id || i}>
            <span className="source-id">{s.id}</span>
            <div>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title || s.pageTitle}
                <Icons.ArrowUpRight size={15} />
              </a>
              <p>{s.note || s.supportingNote}</p>
              <small>{s.url}</small>
              {s.urlCheck && (
                <span
                  className={`source-health ${s.urlCheck.status === 200 ? "verified" : "limited"}`}
                >
                  {s.urlCheck.label}
                </span>
              )}
            </div>
            <span className="source-date">
              {s.accessedAt || s.dateAccessed || s.accessDate || "2026-10-14"}
              <small>Accessed UTC</small>
            </span>
          </article>
        ))}
        {!filtered.length && (
          <div className="empty-state">No sources match this search.</div>
        )}
      </div>
    </>
  );
}
function InterviewNotes() {
  const d = bundle["job-requirements"];
  return (
    <>
      <div className="interview-opening">
        <Icons.Quote size={28} />
        <p>
          “I built a sample workspace for your Shopify client work: research an
          account, prepare an assessment, prioritize the next actions, and
          revisit the strategy. SEOasis is the public example here; client data
          would make the measurement and prioritization account-specific.”
        </p>
        <span>30-SECOND OPENING · ADAPT TO YOUR OWN VOICE</span>
      </div>
      <div className="download-row">
        {[
          "INTERVIEW-WALKTHROUGH.md",
          "JOB-REQUIREMENTS-MATRIX.md",
          "RESEARCH.md",
          "QA-REPORT.md",
        ].map((f) => (
          <a className="button subtle" key={f} href={`${base}/${f}`} download>
            <Icons.Download size={14} />
            {human(f.replace(".md", ""))}
          </a>
        ))}
      </div>
      <SectionLabel title="Five questions that would make the work sharper" />
      <div className="questions-list">
        {[
          "When a client has room for many new collections, how do you balance page velocity with product overlap, inventory, and QA capacity?",
          "What distinguishes a strong Friday update here — and which decisions should the strategist make independently?",
          "Where do blog and link-building partners fit today relative to the current collection-led offer?",
          "Which data do you trust most when a page gains visibility but revenue stays flat, and how do you define incremental lift?",
          "What would I need to demonstrate in my first 90 days to earn responsibility for onboarding the next operator?",
        ].map((q, i) => (
          <div key={q}>
            <span>0{i + 1}</span>
            <p>{q}</p>
            <CopyButton value={q} />
          </div>
        ))}
      </div>
      <SectionLabel title="The job requirements, demonstrated" />
      <ResearchLibrary
        data={d}
        sources={sources}
        preferred={["requirements", "matrix"]}
      />
      <div className="notice">
        <Icons.UserRound size={18} />
        <p>
          This artifact demonstrates a work process. It does not claim prior
          candidate experience or qualifications. Personal examples,
          eligibility, and interview answers should come from your own
          experience.
        </p>
      </div>
    </>
  );
}
function InterviewStage({
  step,
  onDetail,
}: {
  step: number;
  onDetail: () => void;
}) {
  const company = bundle.company || {};
  const facts: AnyRecord[] =
    step === 0
      ? (company.pillars || []).slice(0, 3).map((p: any) => ({
          title: p.pillar,
          summary: p.whatSeoasisSays,
          evidence: p.evidence,
          classification: p.classification,
          confidence: p.confidence,
          source: p.sourceIds || p.source,
        }))
      : step === 1
        ? [
            {
              title: "A distinct buyer need",
              summary:
                "Map the intent to a viable assortment and a deliberate page owner.",
              classification: "OPPORTUNITY",
              confidence: "High",
              source: ["src-company-home"],
            },
            {
              title: "A complete release",
              summary:
                "Product grid, useful copy, metadata, canonical, internal links, markup, and mobile QA.",
              classification: "OPPORTUNITY",
              confidence: "High",
              source: ["SRC-E-HOME"],
            },
            {
              title: "A learning cohort",
              summary:
                "Baseline the pilot, record release dates, and decide when evidence is sufficient to expand.",
              classification: "OPPORTUNITY",
              confidence: "High",
              source: ["src-job-linkedin"],
            },
          ]
        : step === 2
          ? (bundle.technical?.findings || []).slice(0, 3).map((f: any) => ({
              ...f,
              title: f.title || f.issue,
              summary: f.evidence,
              action: f.recommendedAction,
            }))
          : step === 3
            ? (strategy.topOpportunities || []).slice(0, 3)
            : step === 4
              ? (strategy.internalValidation || [])
                  .slice(0, 3)
                  .map((f: any) => ({
                    ...f,
                    summary: f.why || f.description,
                    action: `${f.platform} · ${f.metric} · Decision: ${f.decision}`,
                  }))
              : step === 5
                ? [
                    {
                      title: "Make the initial tradeoff visible",
                      summary:
                        "Impact × confidence ÷ effort. The weights reorder scores; P0–P3 reflect dependencies and sequencing.",
                      classification: "OPPORTUNITY",
                      confidence: "High",
                      source: ["src-job-linkedin"],
                    },
                    {
                      title: "Use the commercial context",
                      summary:
                        "Stock, margin, catalog fit, existing winners, and attribution can change the work order.",
                      classification: "OPPORTUNITY",
                      confidence: "High",
                      source: ["SRC-E-EXPERT"],
                    },
                    {
                      title: "Give every task a finish line",
                      summary:
                        "Owner, dependency, acceptance criteria, QA reviewer, metric, and client-facing next action.",
                      classification: "OPPORTUNITY",
                      confidence: "High",
                      source: ["src-job-linkedin"],
                    },
                  ]
                : step === 6
                  ? [
                      {
                        title: "Days 1–30 · Understand + baseline",
                        summary:
                          "Agree on goals, access, scope, attribution, catalog priorities, and the first complete delivery cycle.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-job-linkedin"],
                      },
                      {
                        title: "Days 31–60 · Execute + QA",
                        summary:
                          "Ship the focused collection / foundation batch, coordinate partners, and inspect the released experience.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-company-home"],
                      },
                      {
                        title: "Days 61–90 · Measure + revise",
                        summary:
                          "Review cohorts and commercial outcomes, record uncertainty, and set the next quarter’s plan.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-job-linkedin"],
                      },
                    ]
                  : [
                      {
                        title: "Independent judgment",
                        summary:
                          "A source trail, explicit assumptions, and recommendations that can change when the evidence changes.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-job-linkedin"],
                      },
                      {
                        title: "Dependable execution",
                        summary:
                          "Research becomes assigned work, implementation, QA, and a clear next action.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-job-linkedin"],
                      },
                      {
                        title: "A system others can use",
                        summary:
                          "Reusable briefs, quality gates, reporting definitions, and documented decisions support future team leadership.",
                        classification: "OPPORTUNITY",
                        confidence: "High",
                        source: ["src-job-linkedin"],
                      },
                    ];
  return (
    <section className="interview-stage">
      <div className="interview-stage-grid">
        {facts.map((f, i) => (
          <article className="interview-evidence" key={i}>
            <span className="stage-card-number">0{i + 1}</span>
            <h2>{f.title || f.issue}</h2>
            <p>{f.summary || f.evidence}</p>
            <div className="record-meta">
              <Tag type={f.classification} />
              <span>{f.confidence || "Medium"} confidence</span>
            </div>
            <SourceRefs ids={f.sourceIds || f.source} sources={sources} />
            {f.action && (
              <details>
                <summary>
                  Decision / next action
                  <Icons.ChevronDown size={14} />
                </summary>
                <p>{textOf(f.action)}</p>
              </details>
            )}
          </article>
        ))}
      </div>
      <div className="interview-stage-footer">
        <div>
          <Icons.BookOpen size={18} />
          <p>
            {step === 7
              ? "This work sample demonstrates a process. Personal experience and examples should come from your own history."
              : "The supporting research, assumptions, and working tools are one step deeper."}
          </p>
        </div>
        <button className="button primary" onClick={onDetail}>
          Explore supporting detail
          <Icons.ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
}
