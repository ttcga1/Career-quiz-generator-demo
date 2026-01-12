"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function QuizGenerator() {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ name: "", email: "", title: "" });
  const [experienceLevel, setExperienceLevel] = useState("mid"); // entry | mid | senior
  const [roleContext, setRoleContext] = useState({ title: "", industry: "", career: "" });

  const [screen, setScreen] = useState(0);
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [careerField, setCareerField] = useState("");
  const [customCareer, setCustomCareer] = useState("");

  const [questionCount, setQuestionCount] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState([
    "multiple-choice",
    "true-false",
    "fill-blank",
    "drag-drop",
  ]);

  // quiz run-time
  const [questions, setQuestions] = useState([]); // built incrementally
  const [usedIds, setUsedIds] = useState(new Set()); // global used across sessions
  const [sessionUsedIds, setSessionUsedIds] = useState(new Set()); // used during current quiz build
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [fillAnswer, setFillAnswer] = useState("");
  const [startTime, setStartTime] = useState(null);

  // Enhancements 5–8
  const [currentDifficulty, setCurrentDifficulty] = useState(2); // 1 easy, 2 medium, 3 hard
  const [lastFeedback, setLastFeedback] = useState(null); // {correct, correctAnswerText, explanation, reference}
  const [adaptedQuestionIds, setAdaptedQuestionIds] = useState(new Set()); // prevent double-adapt
  const [draggedItem, setDraggedItem] = useState(null);

  const [results, setResults] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const industries = [
    { id: "banking", name: "Banking & Finance", icon: "🏦" },
    { id: "technology", name: "Technology", icon: "💻" },
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "manufacturing", name: "Manufacturing", icon: "🏭" },
    { id: "government", name: "Government", icon: "🏛" },
    { id: "hr", name: "Human Resources", icon: "👥" },
    { id: "accounting", name: "Accounting", icon: "📒" },
  ];

  const careers = {
    banking: [
      { id: "risk-management", name: "Risk Management (GARP)", icon: "⚠" },
      { id: "anti-money-laundering", name: "AML (ACAMS)", icon: "🔍" },
      { id: "credit-analysis", name: "Credit Analysis", icon: "💳" },
      { id: "investment-banking", name: "Investment Banking", icon: "📈" },
      { id: "wealth-management", name: "Wealth Management (CFP)", icon: "💰" },
      { id: "treasury-management", name: "Treasury Management (AFP)", icon: "🏦" },
      { id: "compliance-banking", name: "Banking Compliance", icon: "✅" },
      { id: "fraud-banking", name: "Banking Fraud Prevention", icon: "🛡" },
      { id: "commercial-lending", name: "Commercial Lending", icon: "🏢" },
      { id: "retail-banking", name: "Retail Banking Operations", icon: "🪪" },
    ],
    technology: [
      { id: "cybersecurity", name: "Cybersecurity (NIST/NICE)", icon: "🔐" },
      { id: "cloud-computing", name: "Cloud (CSA)", icon: "☁" },
      { id: "data-privacy", name: "Privacy (IAPP)", icon: "🛡" },
      { id: "devops", name: "DevOps Engineering", icon: "🔄" },
      { id: "data-science", name: "Data Science", icon: "📊" },
      { id: "software-engineering", name: "Software Engineering", icon: "👨‍💻" },
      { id: "network-engineering", name: "Network Engineering", icon: "🌐" },
      { id: "ai-ml", name: "AI/Machine Learning", icon: "🤖" },
      { id: "database-admin", name: "Database Administration", icon: "💾" },
      { id: "it-project-mgmt", name: "IT Project Management", icon: "📅" },
    ],
    healthcare: [
      { id: "hipaa-compliance", name: "HIPAA Compliance", icon: "🏥" },
      { id: "medical-coding", name: "Medical Coding (AAPC)", icon: "📝" },
      { id: "clinical-research", name: "Clinical Research (ACRP)", icon: "🔬" },
      { id: "health-informatics", name: "Health Informatics (AHIMA)", icon: "💻" },
      { id: "nursing-leadership", name: "Nursing Leadership", icon: "👩‍⚕" },
      { id: "healthcare-admin", name: "Healthcare Administration", icon: "📋" },
      { id: "patient-safety", name: "Patient Safety (CPPS)", icon: "🛡" },
      { id: "revenue-cycle", name: "Revenue Cycle Management", icon: "💵" },
      { id: "pharmacy", name: "Pharmacy Practice", icon: "💊" },
      { id: "medical-device", name: "Medical Device Regulatory", icon: "🩺" },
    ],
    manufacturing: [
      { id: "quality-control", name: "Quality (ASQ/ISO)", icon: "✅" },
      { id: "six-sigma", name: "Six Sigma (ASQ/IASSC)", icon: "📈" },
      { id: "supply-chain", name: "Supply Chain (APICS)", icon: "🚚" },
      { id: "lean-manufacturing", name: "Lean Manufacturing", icon: "🏭" },
      { id: "safety-osha", name: "Safety (OSHA)", icon: "⛑" },
      { id: "production-planning", name: "Production Planning", icon: "📊" },
      { id: "maintenance-reliability", name: "Maintenance & Reliability", icon: "🔧" },
      { id: "environmental", name: "Environmental Compliance", icon: "🌿" },
      { id: "process-engineering", name: "Process Engineering", icon: "⚙" },
      { id: "inventory-management", name: "Inventory Management", icon: "📦" },
    ],
    government: [
      { id: "fisma", name: "FISMA/RMF (NIST)", icon: "🔒" },
      { id: "acquisition", name: "Federal Acquisition (FAR)", icon: "📜" },
      { id: "grants-management", name: "Grants Management", icon: "💰" },
      { id: "program-management", name: "Program Management (FAC-P/PM)", icon: "📋" },
      { id: "budget-analysis", name: "Budget Analysis", icon: "💵" },
      { id: "records-management", name: "Records Management", icon: "📁" },
      { id: "fedramp", name: "FedRAMP Authorization", icon: "☁" },
      { id: "security-clearance", name: "Security Clearance Processing", icon: "🎖" },
      { id: "foia-privacy", name: "FOIA & Privacy", icon: "🔍" },
      { id: "hr-federal", name: "Federal HR (OPM)", icon: "👥" },
    ],
    hr: [
      { id: "shrm", name: "HR Management (SHRM)", icon: "👥" },
      { id: "compensation", name: "Compensation & Benefits", icon: "💵" },
      { id: "talent-acquisition", name: "Talent Acquisition", icon: "🎯" },
      { id: "learning-development", name: "Learning & Development", icon: "📚" },
      { id: "employee-relations", name: "Employee Relations", icon: "🤝" },
      { id: "hris", name: "HRIS Administration", icon: "💻" },
      { id: "org-development", name: "Organizational Development", icon: "🌱" },
      { id: "diversity-inclusion", name: "Diversity & Inclusion", icon: "🌈" },
      { id: "labor-relations", name: "Labor Relations", icon: "⚖" },
      { id: "hr-analytics", name: "HR Analytics", icon: "📊" },
    ],
    accounting: [
      { id: "internal-audit", name: "Internal Audit (IIA)", icon: "🔍" },
      { id: "fraud-examination", name: "Fraud Examination (ACFE)", icon: "⚖" },
      { id: "public-accounting", name: "Public Accounting (CPA)", icon: "📊" },
      { id: "tax", name: "Tax (CPA/EA)", icon: "📝" },
      { id: "management-accounting", name: "Management Accounting (CMA)", icon: "💼" },
      { id: "forensic-accounting", name: "Forensic Accounting", icon: "🔎" },
      { id: "financial-reporting", name: "Financial Reporting", icon: "📈" },
      { id: "cost-accounting", name: "Cost Accounting", icon: "💰" },
      { id: "govt-accounting", name: "Government Accounting (CGFM)", icon: "🏛" },
      { id: "sox-compliance", name: "SOX Compliance", icon: "✅" },
    ],
  };

  const standardsSources = {
    cybersecurity: {
      org: "NIST/NICE Framework",
      standards: ["NIST SP 800-53", "NICE Framework"],
      certBody: "CISSP, Security+, CISM",
    },
    "cloud-computing": {
      org: "Cloud Security Alliance",
      standards: ["CSA CCM v4", "AWS Well-Architected"],
      certBody: "CCSK, CCSP",
    },
    "data-privacy": { org: "IAPP", standards: ["GDPR", "CCPA"], certBody: "CIPP, CIPM" },
    "risk-management": { org: "GARP", standards: ["Basel III", "ISO 31000"], certBody: "FRM, PRM" },
    "anti-money-laundering": { org: "ACAMS", standards: ["BSA/AML", "FATF"], certBody: "CAMS" },
    "hipaa-compliance": {
      org: "HHS OCR",
      standards: ["HIPAA Privacy Rule", "Security Rule"],
      certBody: "CHC, CHPC",
    },
    "quality-control": { org: "ASQ/ISO", standards: ["ISO 9001:2015"], certBody: "CQE, CQA" },
    "six-sigma": { org: "ASQ/IASSC", standards: ["DMAIC", "Lean Six Sigma"], certBody: "CSSBB" },
    fisma: { org: "NIST/OMB", standards: ["FISMA", "NIST RMF"], certBody: "CAP, CISA" },
    shrm: { org: "SHRM", standards: ["SHRM BoCK", "FLSA"], certBody: "SHRM-CP, SHRM-SCP" },
    "internal-audit": { org: "IIA", standards: ["IIA Standards", "COSO"], certBody: "CIA, CRMA" },
    "fraud-examination": { org: "ACFE", standards: ["Fraud Examiners Manual"], certBody: "CFE" },
    devops: { org: "DevOps Institute", standards: ["DASA", "SRE"], certBody: "DevOps Foundation" },
    "data-science": { org: "Various", standards: ["CRISP-DM"], certBody: "IBM, Google, AWS" },
    "medical-coding": { org: "AAPC/AHIMA", standards: ["ICD-10", "CPT"], certBody: "CPC, CCS" },
    "supply-chain": { org: "APICS/ASCM", standards: ["SCOR"], certBody: "CSCP, CPIM" },
    acquisition: { org: "FAI", standards: ["FAR", "DFARS"], certBody: "FAC-C" },
    compensation: { org: "WorldatWork", standards: ["Total Rewards"], certBody: "CCP, CBP" },
    "public-accounting": { org: "AICPA", standards: ["GAAP", "GAAS"], certBody: "CPA" },
    tax: { org: "IRS/AICPA", standards: ["IRC"], certBody: "CPA, EA" },
  };

  const careerConfig = {
    cybersecurity: {
      skills: [
        "Risk Assessment",
        "Security Controls",
        "Incident Response",
        "Vulnerability Mgmt",
        "Access Control",
        "Monitoring",
      ],
      jobFunction: "implementing NIST/NICE cybersecurity controls",
      progressions: [
        { id: "analyst", name: "Security Analyst", icon: "🔍", desc: "Monitor and analyze" },
        { id: "engineer", name: "Security Engineer", icon: "🔧", desc: "Build security systems" },
        { id: "architect", name: "Security Architect", icon: "🏗", desc: "Design enterprise security" },
        { id: "ciso", name: "CISO", icon: "👔", desc: "Executive leadership" },
      ],
    },
    "cloud-computing": {
      skills: ["Cloud Architecture", "Security Controls", "Cost Optimization", "IaC", "Compliance", "DR"],
      jobFunction: "architecting cloud solutions per CSA standards",
      progressions: [
        { id: "admin", name: "Cloud Administrator", icon: "☁", desc: "Manage cloud resources" },
        { id: "engineer", name: "Cloud Engineer", icon: "🔧", desc: "Build cloud solutions" },
        { id: "architect", name: "Solutions Architect", icon: "🏗", desc: "Multi-cloud design" },
        { id: "security", name: "Cloud Security Architect", icon: "🛡", desc: "CCSP expertise" },
      ],
    },
    "data-privacy": {
      skills: ["Privacy Assessment", "Data Mapping", "Consent Mgmt", "DSAR", "Cross-Border", "Privacy by Design"],
      jobFunction: "ensuring GDPR/CCPA compliance",
      progressions: [
        { id: "analyst", name: "Privacy Analyst", icon: "📋", desc: "Privacy assessments" },
        { id: "manager", name: "Privacy Manager", icon: "📊", desc: "Program management" },
        { id: "dpo", name: "Data Protection Officer", icon: "🛡", desc: "GDPR DPO role" },
        { id: "cpo", name: "Chief Privacy Officer", icon: "👔", desc: "Executive leadership" },
      ],
    },
    "risk-management": {
      skills: ["Market Risk", "Credit Risk", "Operational Risk", "Stress Testing", "Model Validation", "Reporting"],
      jobFunction: "measuring risks per Basel/GARP standards",
      progressions: [
        { id: "analyst", name: "Risk Analyst", icon: "📊", desc: "Risk analysis" },
        { id: "senior", name: "Senior Risk Analyst", icon: "📈", desc: "Complex analysis" },
        { id: "manager", name: "Risk Manager", icon: "👔", desc: "FRM-level expertise" },
        { id: "cro", name: "Chief Risk Officer", icon: "⭐", desc: "Enterprise leadership" },
      ],
    },
    "anti-money-laundering": {
      skills: ["SAR Filing", "Transaction Monitoring", "CDD", "EDD", "Sanctions", "Risk Assessment"],
      jobFunction: "detecting money laundering per BSA/FATF",
      progressions: [
        { id: "analyst", name: "AML Analyst", icon: "🔍", desc: "Alert investigation" },
        { id: "investigator", name: "AML Investigator", icon: "📋", desc: "Complex cases" },
        { id: "manager", name: "AML Manager", icon: "👔", desc: "CAMS-certified management" },
        { id: "bsa", name: "BSA Officer", icon: "⭐", desc: "Program leadership" },
      ],
    },
    "hipaa-compliance": {
      skills: ["Privacy Rule", "Security Rule", "Risk Analysis", "Breach Response", "BAA Mgmt", "Training"],
      jobFunction: "ensuring HIPAA compliance",
      progressions: [
        { id: "analyst", name: "Compliance Analyst", icon: "📋", desc: "Compliance support" },
        { id: "specialist", name: "HIPAA Specialist", icon: "🏥", desc: "Program implementation" },
        { id: "officer", name: "Privacy Officer", icon: "👔", desc: "Privacy leadership" },
        { id: "cpo", name: "Chief Privacy Officer", icon: "⭐", desc: "Executive role" },
      ],
    },
    "quality-control": {
      skills: ["Inspection", "SPC", "Root Cause", "CAPA", "Audit", "Documentation"],
      jobFunction: "ensuring quality per ASQ/ISO standards",
      progressions: [
        { id: "inspector", name: "Quality Inspector", icon: "🔍", desc: "Quality inspection" },
        { id: "engineer", name: "Quality Engineer", icon: "🔧", desc: "CQE-certified" },
        { id: "manager", name: "Quality Manager", icon: "📊", desc: "Program management" },
        { id: "director", name: "Director of Quality", icon: "👔", desc: "Strategic leadership" },
      ],
    },
    "six-sigma": {
      skills: ["DMAIC", "Statistics", "Process Mapping", "Hypothesis Testing", "Control Charts", "PM"],
      jobFunction: "leading Lean Six Sigma improvement",
      progressions: [
        { id: "yb", name: "Yellow Belt", icon: "🟡", desc: "Team member" },
        { id: "gb", name: "Green Belt", icon: "🟢", desc: "Part-time projects" },
        { id: "bb", name: "Black Belt", icon: "⚫", desc: "CSSBB project leadership" },
        { id: "mbb", name: "Master Black Belt", icon: "🏅", desc: "Program expert" },
      ],
    },
    fisma: {
      skills: ["Categorization", "Control Selection", "A&A", "ConMon", "POA&M", "ATO"],
      jobFunction: "achieving federal authorization per NIST RMF",
      progressions: [
        { id: "analyst", name: "Security Analyst", icon: "📋", desc: "Documentation" },
        { id: "isso", name: "ISSO", icon: "🔐", desc: "System security" },
        { id: "issm", name: "ISSM", icon: "👔", desc: "CAP-certified" },
        { id: "ciso", name: "Agency CISO", icon: "⭐", desc: "Enterprise security" },
      ],
    },
    shrm: {
      skills: ["Employee Relations", "Talent Mgmt", "Compensation", "HR Compliance", "OD", "Analytics"],
      jobFunction: "managing HR per SHRM BoCK",
      progressions: [
        { id: "generalist", name: "HR Generalist", icon: "👥", desc: "General HR" },
        { id: "specialist", name: "HR Specialist", icon: "📋", desc: "Specialty area" },
        { id: "manager", name: "HR Manager", icon: "👔", desc: "SHRM-SCP certified" },
        { id: "chro", name: "CHRO", icon: "⭐", desc: "Executive HR" },
      ],
    },
    "internal-audit": {
      skills: ["Planning", "Risk-Based Auditing", "Control Testing", "Issues", "Reporting", "Follow-Up"],
      jobFunction: "providing assurance per IIA Standards",
      progressions: [
        { id: "staff", name: "Staff Auditor", icon: "📋", desc: "Audit execution" },
        { id: "senior", name: "Senior Auditor", icon: "📊", desc: "Lead audits" },
        { id: "manager", name: "Audit Manager", icon: "👔", desc: "CIA-certified" },
        { id: "cae", name: "Chief Audit Executive", icon: "⭐", desc: "Enterprise audit" },
      ],
    },
    "fraud-examination": {
      skills: ["Detection", "Investigation", "Interview", "Evidence", "Reporting", "Litigation Support"],
      jobFunction: "detecting fraud per ACFE standards",
      progressions: [
        { id: "analyst", name: "Fraud Analyst", icon: "🔍", desc: "Detection" },
        { id: "investigator", name: "Fraud Investigator", icon: "📋", desc: "Case investigation" },
        { id: "manager", name: "Fraud Manager", icon: "👔", desc: "CFE-certified" },
        { id: "director", name: "Director of Fraud Prevention", icon: "⭐", desc: "Program leadership" },
      ],
    },
  };

  // --- Helpers for Enhancements 5–8 ---
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function personalizePrompt(prompt, ctx, exp) {
    const title = (ctx?.title || "").trim();
    const career = (ctx?.career || "").trim();

    const parts = [];
    if (title) parts.push(`As a ${title}`);
    else if (exp === "senior") parts.push("As a senior professional");
    else if (exp === "entry") parts.push("As a junior professional");
    else parts.push("In your role");

    if (career) parts.push(`in ${career}`);

    return `${parts.join(" ")}, ${prompt}`;
  }

  function guessDifficultyFromSource(source) {
    // simple heuristic; you can tune this later
    const s = (source || "").toLowerCase();
    if (s.includes("800-53") || s.includes("rmf") || s.includes("basel") || s.includes("frtb")) return 3;
    if (s.includes("800-61") || s.includes("gdpr") || s.includes("iso") || s.includes("hipaa")) return 2;
    return 1;
  }

  function normalizeQuestion(q, type, track) {
    // Keep your existing fields, but add: type, track, difficulty, explanation/reference
    return {
      ...q,
      type,
      track: q.track || track || "General",
      difficulty: q.difficulty ?? guessDifficultyFromSource(q.source),
      explanation: q.explanation || q.feedback || "Review the concept and try again.",
      reference: q.reference || q.source || "Internal question bank",
    };
  }

  function isAnswerComplete(q, ans) {
    if (ans === null || ans === undefined) return false;
    if (q.type === "fill-blank") return String(ans).trim().length > 0;
    if (q.type === "drag-drop") {
      if (!Array.isArray(ans)) return false;
      return ans.length === (q.zones?.length || 0) && ans.every((x) => x !== -1);
    }
    return true;
  }

  function isAnswerCorrect(q, ans) {
    if (!isAnswerComplete(q, ans)) return false;
    if (q.type === "multiple-choice") return ans === q.correct;
    if (q.type === "true-false") return ans === q.correct;
    if (q.type === "fill-blank") return String(ans).toLowerCase().trim() === String(q.correct).toLowerCase();
    if (q.type === "drag-drop") return JSON.stringify(ans) === JSON.stringify(q.correct);
    return false;
  }

  function getCorrectAnswerText(q) {
    if (q.type === "multiple-choice") {
      const idx = q.correct;
      const val = Array.isArray(q.options) ? q.options[idx] : "";
      return `${["A", "B", "C", "D"][idx] || ""}. ${val || ""}`.trim();
    }
    if (q.type === "true-false") return q.correct ? "True" : "False";
    if (q.type === "fill-blank") return String(q.correct);
    if (q.type === "drag-drop") {
      // show expected mapping: zone -> item
      if (!Array.isArray(q.correct) || !Array.isArray(q.items) || !Array.isArray(q.zones)) return "See correct order.";
      return q.zones
        .map((z, i) => {
          const itemIndex = q.correct[i];
          const item = q.items[itemIndex];
          return `${z}: ${item}`;
        })
        .join(" • ");
    }
    return "";
  }

  const getCareerName = () =>
    customCareer || careers[industry]?.find((c) => c.id === careerField)?.name || careerField;

  const getCareerConfig = (id) => {
    if (careerConfig[id]) return careerConfig[id];
    const name = customCareer || id;
    return {
      skills: [
        name + " Fundamentals",
        name + " Best Practices",
        name + " Problem Solving",
        name + " Communication",
        name + " Technical Skills",
        name + " Standards",
      ],
      jobFunction: "performing " + name.toLowerCase() + " responsibilities",
      progressions: [
        { id: "junior", name: "Junior " + name, icon: "📋", desc: "Entry level" },
        { id: "senior", name: "Senior " + name, icon: "📊", desc: "Lead projects" },
        { id: "manager", name: name + " Manager", icon: "👔", desc: "Program management" },
        { id: "director", name: "Director", icon: "⭐", desc: "Strategic leadership" },
      ],
    };
  };

  // --- Your existing question DB (unchanged content), but we will normalize it at runtime ---
  const questionDb = {
    technology: {
      cybersecurity: {
        "multiple-choice": [
          {
            id: "cs1",
            question: "Per NIST SP 800-61, what is the FIRST step when a potential incident is detected?",
            options: ["Eradicate immediately", "Determine if incident occurred", "Contact law enforcement", "Shut down systems"],
            correct: 1,
            feedback: "NIST 800-61: Detection begins with determining if an event is an incident.",
            skill: "Incident Response",
            source: "NIST SP 800-61",
          },
          {
            id: "cs2",
            question: "Per NIST 800-53, which control family addresses vulnerability scanning?",
            options: ["Access Control", "Risk Assessment", "System Protection", "Audit"],
            correct: 1,
            feedback: "RA-5 is part of Risk Assessment family.",
            skill: "Security Controls",
            source: "NIST SP 800-53",
          },
          {
            id: "cs3",
            question: "Per NIST 800-63B, minimum password length is:",
            options: ["6 chars", "8 chars", "12 chars", "14 chars"],
            correct: 1,
            feedback: "NIST 800-63B requires at least 8 characters.",
            skill: "Access Control",
            source: "NIST SP 800-63B",
          },
        ],
        "true-false": [
          { id: "cs4", question: "NIST 800-37 Rev 2 added Prepare as RMF Step 1.", correct: true, feedback: "Rev 2 made RMF a 7-step process starting with Prepare.", skill: "Risk Assessment", source: "NIST SP 800-37" },
          { id: "cs5", question: "Separation of duties is mandatory for all NIST impact levels.", correct: false, feedback: "AC-5 requirements vary by impact level.", skill: "Security Controls", source: "NIST SP 800-53" },
        ],
        "fill-blank": [
          { id: "cs6", question: "The five NIST CSF functions are: Identify, Protect, Detect, Respond, and ___.", correct: "Recover", feedback: "CSF: Identify, Protect, Detect, Respond, Recover.", skill: "Risk Assessment", source: "NIST CSF" },
        ],
        "drag-drop": [
          { id: "cs7", question: "Order first 4 RMF steps:", items: ["Select", "Implement", "Categorize", "Prepare"], zones: ["Step 1", "Step 2", "Step 3", "Step 4"], correct: [3, 2, 0, 1], feedback: "Prepare, Categorize, Select, Implement.", skill: "Risk Assessment", source: "NIST RMF" },
        ],
      },
      "cloud-computing": {
        "multiple-choice": [
          { id: "cc1", question: "Per CSA CCM v4, which domain addresses data security?", options: ["AIS", "DSP", "IAM", "SEF"], correct: 1, feedback: "DSP covers data protection.", skill: "Security Controls", source: "CSA CCM v4" },
          { id: "cc2", question: "In IaaS, who patches the guest OS?", options: ["Provider", "Customer", "Shared", "Third-party"], correct: 1, feedback: "Customer manages guest OS in IaaS.", skill: "Cloud Architecture", source: "CSA" },
        ],
        "true-false": [{ id: "cc3", question: "Per CSA, encryption in transit is a baseline control.", correct: true, feedback: "CSA recommends encryption in transit as baseline.", skill: "Security Controls", source: "CSA" }],
        "fill-blank": [{ id: "cc4", question: "AWS Well-Architected has ___ pillars.", correct: "6", feedback: "Six pillars including Sustainability.", skill: "Cloud Architecture", source: "AWS" }],
        "drag-drop": [{ id: "cc5", question: "Order cloud models by customer control:", items: ["IaaS", "PaaS", "SaaS"], zones: ["Most", "Medium", "Least"], correct: [0, 1, 2], feedback: "IaaS most, SaaS least.", skill: "Cloud Architecture", source: "NIST" }],
      },
      "data-privacy": {
        "multiple-choice": [
          { id: "dp1", question: "GDPR Article 17 right to erasure is also called:", options: ["Right to access", "Right to be forgotten", "Right to portability", "Right to rectify"], correct: 1, feedback: "Article 17 is right to be forgotten.", skill: "DSAR", source: "GDPR" },
          { id: "dp2", question: "GDPR breach notification deadline is:", options: ["24 hours", "48 hours", "72 hours", "7 days"], correct: 2, feedback: "Article 33 requires 72 hours.", skill: "Privacy Assessment", source: "GDPR" },
        ],
        "true-false": [{ id: "dp3", question: "GDPR consent must be freely given, specific, informed, and unambiguous.", correct: true, feedback: "Article 7 consent requirements.", skill: "Consent Mgmt", source: "GDPR" }],
        "fill-blank": [{ id: "dp4", question: "CCPA lookback period is ___ months.", correct: "12", feedback: "CCPA requires prior 12 months data.", skill: "DSAR", source: "CCPA" }],
        "drag-drop": [{ id: "dp5", question: "Match laws to regions:", items: ["GDPR", "CCPA", "PIPEDA"], zones: ["EU", "California", "Canada"], correct: [0, 1, 2], feedback: "Privacy laws by jurisdiction.", skill: "Privacy Assessment", source: "IAPP" }],
      },
    },
    banking: {
      "risk-management": {
        "multiple-choice": [
          { id: "rm1", question: "Basel III minimum CET1 ratio is:", options: ["4%", "4.5%", "6%", "8%"], correct: 1, feedback: "Basel III requires 4.5% CET1.", skill: "Operational Risk", source: "Basel III" },
          { id: "rm2", question: "Per GARP, which VaR uses historical returns directly?", options: ["Parametric", "Historical Simulation", "Monte Carlo", "Conditional"], correct: 1, feedback: "Historical Simulation uses actual returns.", skill: "Market Risk", source: "GARP FRM" },
        ],
        "true-false": [{ id: "rm3", question: "Basel III replaced VaR with Expected Shortfall.", correct: true, feedback: "FRTB moved to 97.5% ES.", skill: "Market Risk", source: "Basel III" }],
        "fill-blank": [{ id: "rm4", question: "Basel II Pillar 3 is Market ___.", correct: "Discipline", feedback: "Pillar 3 is disclosure requirements.", skill: "Reporting", source: "Basel II" }],
        "drag-drop": [{ id: "rm5", question: "Match risk types to approaches:", items: ["Credit", "Market", "Operational"], zones: ["IRB", "FRTB", "AMA"], correct: [0, 1, 2], feedback: "Basel methodology by risk type.", skill: "Operational Risk", source: "Basel" }],
      },
      "anti-money-laundering": {
        "multiple-choice": [
          { id: "aml1", question: "Per BSA, SAR filing deadline is:", options: ["15 days", "30 days", "45 days", "60 days"], correct: 1, feedback: "SARs due within 30 days.", skill: "SAR Filing", source: "BSA" },
          { id: "aml2", question: "FATF 40 Recommendations address:", options: ["Tax", "AML/CFT", "Consumer protection", "Securities"], correct: 1, feedback: "FATF covers AML/CFT standards.", skill: "Risk Assessment", source: "FATF" },
        ],
        "true-false": [{ id: "aml3", question: "CTRs required for cash over $10,000.", correct: true, feedback: "BSA threshold is $10,000.", skill: "SAR Filing", source: "BSA" }],
        "fill-blank": [{ id: "aml4", question: "PEP stands for Politically ___ Person.", correct: "Exposed", feedback: "Politically Exposed Persons require EDD.", skill: "EDD", source: "FATF" }],
        "drag-drop": [{ id: "aml5", question: "Order CDD steps:", items: ["Monitor", "Identify", "Risk Assess", "Beneficial Owner"], zones: ["1st", "2nd", "3rd", "4th"], correct: [1, 3, 2, 0], feedback: "ID, BO, Risk, Monitor.", skill: "CDD", source: "FinCEN" }],
      },
    },
    healthcare: {
      "hipaa-compliance": {
        "multiple-choice": [
          { id: "hp1", question: "HIPAA max annual penalty per category is:", options: ["$50K", "$250K", "$1.5M", "$2M"], correct: 2, feedback: "Cap is $1.5M per category per year.", skill: "Privacy Rule", source: "HIPAA" },
          { id: "hp2", question: "Workforce training is which safeguard type?", options: ["Physical", "Technical", "Administrative", "Organizational"], correct: 2, feedback: "Administrative safeguards include training.", skill: "Security Rule", source: "HIPAA" },
        ],
        "true-false": [{ id: "hp3", question: "HIPAA requires security risk analysis.", correct: true, feedback: "Required under 164.308(a)(1).", skill: "Risk Analysis", source: "HIPAA" }],
        "fill-blank": [{ id: "hp4", question: "Large breach notification deadline is ___ days.", correct: "60", feedback: "500+ individuals require 60 day notice.", skill: "Breach Response", source: "HIPAA" }],
        "drag-drop": [{ id: "hp5", question: "Match HIPAA rules:", items: ["Privacy", "Security", "Breach"], zones: ["PHI use", "ePHI safeguards", "Notification"], correct: [0, 1, 2], feedback: "HIPAA rule focus areas.", skill: "Privacy Rule", source: "HIPAA" }],
      },
    },
    manufacturing: {
      "quality-control": {
        "multiple-choice": [
          { id: "qc1", question: "Per ISO 9001, what is needed before QMS changes?", options: ["Approval only", "Evaluate consequences", "Customer notice", "Audit"], correct: 1, feedback: "Clause 6.3 requires evaluation.", skill: "Inspection", source: "ISO 9001" },
          { id: "qc2", question: "Cp of 1.33 indicates:", options: ["Not capable", "Marginal", "Capable", "Highly capable"], correct: 2, feedback: "Cp >= 1.33 is capable.", skill: "SPC", source: "ASQ" },
        ],
        "true-false": [{ id: "qc3", question: "ISO 9001 requires documented procedures for all processes.", correct: false, feedback: "ISO 9001:2015 allows flexibility.", skill: "Documentation", source: "ISO 9001" }],
        "fill-blank": [{ id: "qc4", question: "ISO 9001 is based on Plan-Do-Check-___.", correct: "Act", feedback: "PDCA cycle.", skill: "Inspection", source: "ISO 9001" }],
        "drag-drop": [{ id: "qc5", question: "Order DMAIC:", items: ["Improve", "Define", "Control", "Measure", "Analyze"], zones: ["1", "2", "3", "4", "5"], correct: [1, 3, 4, 0, 2], feedback: "Define, Measure, Analyze, Improve, Control.", skill: "Root Cause", source: "ASQ" }],
      },
      "six-sigma": {
        "multiple-choice": [
          { id: "ss1", question: "Six Sigma DPMO is:", options: ["3.4", "6", "34", "66807"], correct: 0, feedback: "6 sigma = 3.4 DPMO.", skill: "Statistics", source: "ASQ" },
          { id: "ss2", question: "Root cause analysis is in which phase?", options: ["Define", "Measure", "Analyze", "Improve"], correct: 2, feedback: "Analyze identifies root causes.", skill: "DMAIC", source: "IASSC" },
        ],
        "true-false": [{ id: "ss3", question: "Green Belts lead projects full-time.", correct: false, feedback: "Green Belts are part-time; Black Belts full-time.", skill: "PM", source: "ASQ" }],
        "fill-blank": [{ id: "ss4", question: "VOC stands for Voice of the ___.", correct: "Customer", feedback: "Voice of Customer captures requirements.", skill: "DMAIC", source: "ASQ" }],
        "drag-drop": [{ id: "ss5", question: "Match belts to commitment:", items: ["Yellow", "Green", "Black"], zones: ["Team member", "Part-time lead", "Full-time lead"], correct: [0, 1, 2], feedback: "Belt commitment levels.", skill: "PM", source: "ASQ" }],
      },
    },
    government: {
      fisma: {
        "multiple-choice": [
          { id: "fi1", question: "NIST RMF Step 1 is:", options: ["Categorize", "Select", "Prepare", "Implement"], correct: 2, feedback: "Prepare added in Rev 2.", skill: "Categorization", source: "NIST RMF" },
          { id: "fi2", question: "FIPS 199 security objectives are:", options: ["PPT", "CIA", "PDR", "IPR"], correct: 1, feedback: "Confidentiality, Integrity, Availability.", skill: "Categorization", source: "FIPS 199" },
        ],
        "true-false": [{ id: "fi3", question: "FedRAMP ATOs can be reused across agencies.", correct: true, feedback: "Do Once, Use Many.", skill: "A&A", source: "FedRAMP" }],
        "fill-blank": [{ id: "fi4", question: "FISMA authorization is called ATO: Authorization to ___.", correct: "Operate", feedback: "Authorization to Operate.", skill: "A&A", source: "FISMA" }],
        "drag-drop": [{ id: "fi5", question: "Order RMF steps 1-4:", items: ["Select", "Implement", "Categorize", "Prepare"], zones: ["1", "2", "3", "4"], correct: [3, 2, 0, 1], feedback: "Prepare, Categorize, Select, Implement.", skill: "A&A", source: "NIST" }],
      },
    },
    hr: {
      shrm: {
        "multiple-choice": [
          { id: "hr1", question: "FLSA exempt salary threshold is approximately:", options: ["$35K", "$44K", "$47K", "$55K"], correct: 0, feedback: "Current threshold around $35,568.", skill: "Compensation", source: "DOL" },
          { id: "hr2", question: "Which is NOT Title VII protected?", options: ["Race", "Religion", "Sexual orientation", "Political affiliation"], correct: 3, feedback: "Political affiliation not covered.", skill: "HR Compliance", source: "EEOC" },
        ],
        "true-false": [{ id: "hr3", question: "FMLA provides 12 weeks paid leave.", correct: false, feedback: "FMLA is unpaid leave.", skill: "HR Compliance", source: "DOL" }],
        "fill-blank": [{ id: "hr4", question: "SHRM BoCK has Competencies and ___ domains.", correct: "Knowledge", feedback: "Competencies and Knowledge.", skill: "Talent Mgmt", source: "SHRM" }],
        "drag-drop": [{ id: "hr5", question: "Match laws to focus:", items: ["FLSA", "FMLA", "Title VII"], zones: ["Wages", "Leave", "Discrimination"], correct: [0, 1, 2], feedback: "Employment law focus areas.", skill: "HR Compliance", source: "DOL" }],
      },
    },
    accounting: {
      "internal-audit": {
        "multiple-choice": [
          { id: "ia1", question: "IIA audit charter establishes:", options: ["Findings", "Authority and position", "Procedures", "Budget"], correct: 1, feedback: "Standard 1000 on charter.", skill: "Planning", source: "IIA" },
          { id: "ia2", question: "Per Three Lines, who owns risk?", options: ["Audit", "First Line", "Second Line", "Board"], correct: 1, feedback: "First Line owns risk.", skill: "Risk-Based Auditing", source: "IIA" },
        ],
        "true-false": [{ id: "ia3", question: "IIA Standards require QAIP.", correct: true, feedback: "Standard 1300 requires QAIP.", skill: "Control Testing", source: "IIA" }],
        "fill-blank": [{ id: "ia4", question: "Internal audit provides ___ and consulting.", correct: "assurance", feedback: "Assurance and consulting services.", skill: "Planning", source: "IIA" }],
        "drag-drop": [{ id: "ia5", question: "Order audit phases:", items: ["Report", "Plan", "Follow-Up", "Fieldwork"], zones: ["1", "2", "3", "4"], correct: [1, 3, 0, 2], feedback: "Plan, Fieldwork, Report, Follow-Up.", skill: "Planning", source: "IIA" }],
      },
      "fraud-examination": {
        "multiple-choice": [
          { id: "fe1", question: "Fraud Triangle elements are:", options: ["Means/Motive/Opportunity", "Pressure/Opportunity/Rationalization", "Intent/Action/Concealment", "Theft/Deception/Conversion"], correct: 1, feedback: "Pressure, Opportunity, Rationalization.", skill: "Detection", source: "ACFE" },
          { id: "fe2", question: "Per ACFE, tips detect what percent of fraud?", options: ["20%", "30%", "40%", "50%"], correct: 2, feedback: "About 40% detected via tips.", skill: "Detection", source: "ACFE" },
        ],
        "true-false": [{ id: "fe3", question: "CFEs must follow ACFE ethics code.", correct: true, feedback: "CFE ethical requirements.", skill: "Evidence", source: "ACFE" }],
        "fill-blank": [{ id: "fe4", question: "Most common fraud type is asset ___.", correct: "misappropriation", feedback: "86% is asset misappropriation.", skill: "Investigation", source: "ACFE" }],
        "drag-drop": [{ id: "fe5", question: "Order fraud exam steps:", items: ["Report", "Evidence", "Interview", "Predication"], zones: ["1", "2", "3", "4"], correct: [3, 2, 1, 0], feedback: "Predication, Interview, Evidence, Report.", skill: "Investigation", source: "ACFE" }],
      },
    },
  };

  const generateCustomQuestions = (name, skills) => ({
    "multiple-choice": [
      {
        id: "c1",
        question: "You are assigned to lead a new " + name.toLowerCase() + " project. What should be your FIRST action?",
        options: ["Start working immediately", "Gather and define requirements", "Delegate tasks to team", "Wait for more direction"],
        correct: 1,
        feedback: "Gathering and defining requirements ensures clear project scope before execution.",
        skill: skills[0],
        source: "Best Practices",
        difficulty: 1,
      },
      {
        id: "c2",
        question: "A key stakeholder requests significant changes mid-project. How do you respond?",
        options: ["Implement changes immediately", "Assess impact, document, and discuss tradeoffs", "Refuse the request", "Escalate without analysis"],
        correct: 1,
        feedback: "Impact assessment and documentation enable informed decision-making on changes.",
        skill: skills[1],
        source: "Best Practices",
        difficulty: 2,
      },
      {
        id: "c10",
        question: "A recurring problem keeps affecting your projects despite multiple fixes. Your approach should be:",
        options: ["Apply another quick fix", "Conduct root cause analysis to find the underlying issue", "Blame the original designer", "Document it and move on"],
        correct: 1,
        feedback: "Root cause analysis addresses underlying issues rather than symptoms.",
        skill: skills[2],
        source: "Problem Solving",
        difficulty: 3,
      },
    ],
    "true-false": [
      {
        id: "c3",
        question: "Documentation is only valuable when preparing for audits.",
        correct: false,
        feedback: "Documentation supports training, continuity, improvement, and knowledge transfer beyond audits.",
        skill: skills[1],
        source: "Best Practices",
        difficulty: 1,
      },
      {
        id: "c15",
        question: "It is acceptable to bend ethical standards when facing significant deadline pressure.",
        correct: false,
        feedback: "Ethical standards must be maintained regardless of external pressures.",
        skill: skills[5],
        source: "Ethics",
        difficulty: 2,
      },
    ],
    "fill-blank": [
      {
        id: "c4",
        question: "Professional ethics require ___ and integrity in all decisions.",
        correct: "objectivity",
        feedback: "Objectivity ensures decisions are based on facts rather than personal bias.",
        skill: skills[5],
        source: "Ethics",
        difficulty: 1,
      },
      {
        id: "c21",
        question: "Risk assessment identifies both threats and ___ in a system or process.",
        correct: "vulnerabilities",
        feedback: "Understanding both threats and vulnerabilities enables effective risk mitigation.",
        skill: skills[2],
        source: "Risk Management",
        difficulty: 2,
      },
    ],
    "drag-drop": [
      {
        id: "dd2",
        question: "Order incident response steps:",
        items: ["Fix the Issue", "Detect Problem", "Return to Normal", "Contain Impact"],
        zones: ["1st", "2nd", "3rd", "4th"],
        correct: [1, 3, 0, 2],
        feedback: "Detect, Contain, Fix, then Return to normal operations.",
        skill: skills[2],
        source: "Incident Response",
        difficulty: 3,
      },
    ],
  });

  const activeTrackId = useMemo(() => customCareer || careerField, [customCareer, careerField]);
  const activeTrackName = useMemo(() => (customCareer ? customCareer : getCareerName()), [customCareer, industry, careerField]);

  function buildAllCandidates(excludeSet) {
    const track = activeTrackId || activeTrackName || "General";
    const db = questionDb[industry] && questionDb[industry][careerField];
    const config = getCareerConfig(customCareer || careerField);

    let all = [];

    // from standard DB (only if using a known career, not customCareer)
    if (db && !customCareer) {
      selectedTypes.forEach((t) => {
        if (db[t]) {
          db[t].forEach((q) => {
            if (!excludeSet.has(q.id)) {
              all.push(normalizeQuestion(q, t, track));
            }
          });
        }
      });
    }

    // from custom generator (always available; also used as fallback when db is small)
    const custom = generateCustomQuestions(customCareer || getCareerName(), config.skills);
    selectedTypes.forEach((t) => {
      if (custom[t]) {
        custom[t].forEach((q) => {
          if (!excludeSet.has(q.id) && !all.find((e) => e.id === q.id)) {
            all.push(normalizeQuestion(q, t, track));
          }
        });
      }
    });

    return all;
  }

  function pickNextQuestion(excludeSet, desiredDifficulty, track) {
    const all = buildAllCandidates(excludeSet);

    // Prefer current difficulty, then fallback
    let candidates = all.filter((q) => q.difficulty === desiredDifficulty);

    if (candidates.length === 0) candidates = all;

    // If in the future you add mixed-track pools, this keeps us aligned:
    const trackCandidates = candidates.filter((q) => q.track === track);
    const pool = trackCandidates.length > 0 ? trackCandidates : candidates;

    if (pool.length === 0) return null;

    const next = pool[Math.floor(Math.random() * pool.length)];

    // Personalize prompt for display
    return {
      ...next,
      question: personalizePrompt(next.question, roleContext, experienceLevel),
    };
  }

  function ensureQuestionBuilt(indexToEnsure) {
    // Build questions up to indexToEnsure (inclusive) if missing
    if (questions[indexToEnsure]) return;

    const globalExclude = new Set([...usedIds, ...sessionUsedIds]);

    const track = activeTrackId || activeTrackName || "General";
    const next = pickNextQuestion(globalExclude, currentDifficulty, track);
    if (!next) return;

    setQuestions((prev) => {
      const updated = prev.slice();
      updated[indexToEnsure] = next;
      return updated;
    });

    setSessionUsedIds((prev) => new Set([...prev, next.id]));
    setAnswers((prev) => {
      const a = prev.slice();
      while (a.length < indexToEnsure + 1) a.push(null);
      return a;
    });
  }

  function evaluateAndMaybeAdapt(q, ans) {
    if (!q) return;
    if (!isAnswerComplete(q, ans)) return;

    const ok = isAnswerCorrect(q, ans);

    setLastFeedback({
      correct: ok,
      correctAnswerText: getCorrectAnswerText(q),
      explanation: q.explanation,
      reference: q.reference,
    });

    // only adapt once per question id
    setAdaptedQuestionIds((prev) => {
      if (prev.has(q.id)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(q.id);

      setCurrentDifficulty((d) => (ok ? clamp(d + 1, 1, 3) : clamp(d - 1, 1, 3)));
      return nextSet;
    });
  }

  // Keep fill-blank input synced when navigating
  useEffect(() => {
    if (questions[qIndex] && questions[qIndex].type === "fill-blank") {
      setFillAnswer(answers[qIndex] || "");
    }
  }, [qIndex, questions, answers]);

  // Evaluate feedback whenever the active answer changes
  useEffect(() => {
    const q = questions[qIndex];
    if (!q) return;
    evaluateAndMaybeAdapt(q, answers[qIndex]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, answers, questions]);

  const handleLogin = () => {
    if (!loginForm.name.trim() || !loginForm.email.trim()) {
      alert("Enter name and email");
      return;
    }
    setUser({ ...loginForm, loginTime: new Date().toISOString(), experienceLevel });
    setRoleContext({
      title: loginForm.title || "",
      industry: industry || customIndustry || "",
      career: customCareer || careerField || "",
    });
    setScreen(1);
  };

  const startQuiz = () => {
    if (!selectedTypes.length || (!industry && !customIndustry) || (!careerField && !customCareer)) return;

    // freeze context at start
    setRoleContext({
      title: loginForm.title || "",
      industry: industry || customIndustry || "",
      career: customCareer || careerField || "",
    });

    setScreen(3);

    setTimeout(() => {
      // reset run-time
      setQuestions([]);
      setAnswers([]);
      setQIndex(0);
      setFillAnswer("");
      setStartTime(Date.now());
      setResults(null);
      setShowFullReport(false);

      // enhancements reset
      setCurrentDifficulty(2);
      setLastFeedback(null);
      setAdaptedQuestionIds(new Set());

      // session used reset
      setSessionUsedIds(new Set());

      // Build first question immediately
      // (we also reserve slots for total count so navigation feels consistent)
      setQuestions(new Array(questionCount).fill(null));
      setAnswers(new Array(questionCount).fill(null));

      // Ensure Q0 exists
      setTimeout(() => {
        ensureQuestionBuilt(0);
        setScreen(4);
      }, 0);
    }, 900);
  };

  const setAnswer = (v) => {
    const n = answers.slice();
    n[qIndex] = v;
    setAnswers(n);
  };

  const handleFillChange = (v) => {
    setFillAnswer(v);
    const n = answers.slice();
    n[qIndex] = v;
    setAnswers(n);
  };

  const handleDrop = (z, i) => {
    const q = questions[qIndex];
    if (!q) return;

    const current = answers[qIndex] || new Array(q.zones.length).fill(-1);
    const next = current.slice();

    const existing = next.indexOf(i);
    if (existing !== -1) next[existing] = -1;
    next[z] = i;

    setAnswer(next);
  };

  const calcKSAs = (qResults) => {
    const config = getCareerConfig(customCareer || careerField);
    const scores = {};
    config.skills.forEach((sk) => {
      scores[sk] = { correct: 0, total: 0 };
    });
    qResults.forEach((item) => {
      const sk = item.q.skill || config.skills[0];
      if (!scores[sk]) scores[sk] = { correct: 0, total: 0 };
      scores[sk].total++;
      if (item.ok) scores[sk].correct++;
    });

    return Object.entries(scores)
      .filter(([, v]) => v.total > 0)
      .map(([name, data]) => {
        const pct = data.correct / data.total;
        return {
          name,
          score: Math.round(pct * 100),
          correct: data.correct,
          total: data.total,
          level: pct >= 0.8 ? "Expert" : pct >= 0.6 ? "Proficient" : pct >= 0.4 ? "Developing" : "Foundational",
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const getProgressions = (ksas) => {
    const config = getCareerConfig(customCareer || careerField);
    if (!config || !config.progressions) return [];
    const avg = ksas.length > 0 ? ksas.reduce((s, k) => s + k.score, 0) / ksas.length : 50;
    return config.progressions
      .map((prog, i) => {
        const match = Math.min(95, Math.max(30, avg - i * 5));
        return {
          ...prog,
          match: Math.round(match),
          readiness: match >= 80 ? "Ready Now" : match >= 60 ? "Developing" : "Growth Needed",
        };
      })
      .sort((a, b) => b.match - a.match);
  };

  const submit = () => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    const missed = [];
    const qResults = [];
    const sources = new Set();

    // Only score built questions (in case you navigated weirdly)
    const builtQuestions = questions.filter(Boolean);

    builtQuestions.forEach((q, i) => {
      const ans = answers[i];
      const ok = isAnswerCorrect(q, ans);
      qResults.push({ q, ans, ok });
      if (ok) correct++;
      else missed.push(q);
      if (q.source) sources.add(q.source);
    });

    const ksas = calcKSAs(qResults);

    setResults({
      correct,
      total: builtQuestions.length,
      time,
      missed,
      qResults,
      ksas,
      progressions: getProgressions(ksas),
      sources: Array.from(sources),
    });

    // commit session used into global used
    setUsedIds((prev) => new Set([...prev, ...sessionUsedIds]));
    setScreen(5);
  };

  const retest = () => {
    setScreen(3);
    setTimeout(() => {
      setQuestions(new Array(questionCount).fill(null));
      setAnswers(new Array(questionCount).fill(null));
      setQIndex(0);
      setFillAnswer("");
      setStartTime(Date.now());
      setResults(null);

      setCurrentDifficulty(2);
      setLastFeedback(null);
      setAdaptedQuestionIds(new Set());
      setSessionUsedIds(new Set());

      setTimeout(() => {
        ensureQuestionBuilt(0);
        setScreen(4);
      }, 0);
    }, 700);
  };

  const reset = () => {
    setScreen(1);
    setIndustry("");
    setCustomIndustry("");
    setCareerField("");
    setCustomCareer("");
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setUsedIds(new Set());
    setSessionUsedIds(new Set());
    setShowFullReport(false);

    setCurrentDifficulty(2);
    setLastFeedback(null);
    setAdaptedQuestionIds(new Set());
  };

  const logout = () => {
    setUser(null);
    setLoginForm({ name: "", email: "", title: "" });
    setExperienceLevel("mid");
    setRoleContext({ title: "", industry: "", career: "" });
    reset();
    setScreen(0);
  };

  const styles = {
    wrap: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      color: "#f0f0f0",
      fontFamily: "system-ui",
      padding: 20,
    },
    card: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      border: "1px solid rgba(255,255,255,0.1)",
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 8,
      background: "linear-gradient(135deg, #818cf8, #c084fc)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(0,0,0,0.3)",
      color: "#f0f0f0",
      fontSize: 16,
      outline: "none",
      boxSizing: "border-box",
    },
    btn: {
      padding: "14px 28px",
      borderRadius: 10,
      border: "none",
      fontWeight: 600,
      fontSize: 16,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    },
    btnP: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" },
    btnS: { background: "rgba(255,255,255,0.1)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.2)" },
    btnG: { background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white" },
    btnO: { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white" },
    btnR: { background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "white" }, // fix: was missing in your original
    opt: { padding: "16px 20px", borderRadius: 12, cursor: "pointer", marginBottom: 12, display: "flex", alignItems: "center", gap: 16 },
    optDef: { background: "rgba(255,255,255,0.03)", border: "2px solid rgba(255,255,255,0.1)" },
    optSel: { background: "rgba(99,102,241,0.2)", border: "2px solid #6366f1" },
    grid: { display: "grid", gap: 12 },
    badge: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(99,102,241,0.1)", borderRadius: 12, marginBottom: 20 },
    pill: { background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 50, fontSize: 12, color: "#94a3b8" },
  };

  const UserHeader = () => {
    if (!user) return null;
    return (
      <div style={styles.badge}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {user.title || user.email} • {experienceLevel === "entry" ? "Entry" : experienceLevel === "senior" ? "Senior" : "Mid-level"}
          </div>
        </div>
        <button style={{ ...styles.btn, ...styles.btnS, padding: "8px 16px", fontSize: 14 }} onClick={logout}>
          Sign Out
        </button>
      </div>
    );
  };

  // --- Screen 0: Login ---
  if (screen === 0) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 500, margin: "0 auto", paddingTop: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 64 }}>🎓</div>
            <h1 style={styles.title}>QuizForge AI</h1>
            <p style={{ color: "#94a3b8" }}>Industry-Standard Professional Assessment</p>
          </div>

          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Sign In</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6, display: "block" }}>Full Name *</label>
              <input
                style={styles.input}
                placeholder="John Smith"
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6, display: "block" }}>Email *</label>
              <input
                style={styles.input}
                type="email"
                placeholder="john@company.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6, display: "block" }}>Job Title (Optional)</label>
              <input
                style={styles.input}
                placeholder="Senior Analyst"
                value={loginForm.title}
                onChange={(e) => setLoginForm({ ...loginForm, title: e.target.value })}
              />
            </div>

            {/* Enhancement 8: Experience level */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, color: "#94a3b8", marginBottom: 6, display: "block" }}>Experience Level</label>
              <select style={styles.input} value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                <option value="entry">Entry / Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior / Lead</option>
              </select>
            </div>

            <button style={{ ...styles.btn, ...styles.btnP, width: "100%", justifyContent: "center" }} onClick={handleLogin}>
              Continue
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#64748b" }}>
            Questions from NIST, ISO, SHRM, ACFE, IIA, GARP, CSA
          </p>
        </div>
      </div>
    );
  }

  // --- Screen 1: Industry + Career selection ---
  if (screen === 1) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <UserHeader />

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={styles.title}>Select Assessment</h1>
            <p style={{ color: "#94a3b8" }}>Questions from industry standard organizations</p>
          </div>

          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Industry</h2>
            <input
              style={{ ...styles.input, marginBottom: 16 }}
              placeholder="Type custom industry..."
              value={customIndustry}
              onChange={(e) => {
                setCustomIndustry(e.target.value);
                setIndustry("");
                setCareerField("");
                setCustomCareer("");
              }}
            />

            <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {industries.map((ind) => (
                <div
                  key={ind.id}
                  onClick={() => {
                    setIndustry(ind.id);
                    setCustomIndustry("");
                    setCareerField("");
                    setCustomCareer("");
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: industry === ind.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                    border: "2px solid " + (industry === ind.id ? "#6366f1" : "rgba(255,255,255,0.1)"),
                  }}
                >
                  <span style={{ fontSize: 24 }}>{ind.icon}</span>
                  <span style={{ fontWeight: 500 }}>{ind.name}</span>
                </div>
              ))}
            </div>
          </div>

          {(industry || customIndustry) && (
            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Career Field</h2>
              <input
                style={{ ...styles.input, marginBottom: 16 }}
                placeholder="Type custom career..."
                value={customCareer}
                onChange={(e) => {
                  setCustomCareer(e.target.value);
                  setCareerField("");
                }}
              />

              {industry && careers[industry] && !customCareer && (
                <div style={{ ...styles.grid, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                  {careers[industry].map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCareerField(c.id);
                        setCustomCareer("");
                      }}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: careerField === c.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                        border: "2px solid " + (careerField === c.id ? "#6366f1" : "rgba(255,255,255,0.1)"),
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{c.icon}</span>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(careerField || customCareer) && (
            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Assessment Info</h2>
              {standardsSources[careerField] && (
                <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: "#818cf8", fontWeight: 600 }}>{standardsSources[careerField].org}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                    Standards: {standardsSources[careerField].standards.join(", ")}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    Certifications: {standardsSources[careerField].certBody}
                  </div>
                </div>
              )}
              <p style={{ color: "#94a3b8" }}>
                Testing:{" "}
                <strong style={{ color: "#818cf8" }}>
                  {getCareerConfig(customCareer || careerField).jobFunction}
                </strong>
              </p>
            </div>
          )}

          <button
            style={{ ...styles.btn, ...styles.btnP, opacity: careerField || customCareer ? 1 : 0.5 }}
            onClick={() => {
              if (careerField || customCareer) setScreen(2);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // --- Screen 2: Configure ---
  if (screen === 2) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <UserHeader />

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={styles.title}>Configure Assessment</h1>
          </div>

          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Questions: {questionCount}</h2>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...styles.btn, ...styles.btnS }} onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}>
                -
              </button>
              <button style={{ ...styles.btn, ...styles.btnS }} onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}>
                +
              </button>
            </div>
            <div style={{ marginTop: 14, color: "#94a3b8", fontSize: 13 }}>
              Adaptive difficulty is ON (starts Medium and adjusts per answer).
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Question Types</h2>
            <div style={{ ...styles.grid, gridTemplateColumns: "repeat(2, 1fr)" }}>
              {[
                { t: "multiple-choice", n: "Multiple Choice" },
                { t: "true-false", n: "True/False" },
                { t: "fill-blank", n: "Fill Blank" },
                { t: "drag-drop", n: "Drag Drop" },
              ].map((item) => {
                const sel = selectedTypes.includes(item.t);
                return (
                  <div
                    key={item.t}
                    onClick={() => setSelectedTypes(sel ? selectedTypes.filter((x) => x !== item.t) : selectedTypes.concat([item.t]))}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      background: sel ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                      border: "2px solid " + (sel ? "#6366f1" : "rgba(255,255,255,0.1)"),
                    }}
                  >
                    {item.n}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ ...styles.btn, ...styles.btnS }} onClick={() => setScreen(1)}>
              Back
            </button>
            <button style={{ ...styles.btn, ...styles.btnP }} onClick={startQuiz}>
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Screen 3: Loading ---
  if (screen === 3) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", paddingTop: 100 }}>
          <div
            style={{
              width: 60,
              height: 60,
              border: "4px solid rgba(255,255,255,0.1)",
              borderTopColor: "#6366f1",
              borderRadius: "50%",
              margin: "0 auto 24px",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 18, color: "#94a3b8" }}>Generating assessment for {user ? user.name : ""}...</p>
        </div>
      </div>
    );
  }

  // --- Screen 4: Quiz ---
  if (screen === 4) {
    // Ensure this question is built (and pre-build next one if approaching end)
    useEffect(() => {
      ensureQuestionBuilt(qIndex);
      if (qIndex + 1 < questionCount) ensureQuestionBuilt(qIndex + 1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qIndex, questionCount]);

    const q = questions[qIndex];
    if (!q) return null;

    const diffLabel = currentDifficulty === 1 ? "Easy" : currentDifficulty === 2 ? "Medium" : "Hard";

    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <UserHeader />

          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "8px 16px", borderRadius: 50, fontSize: 14 }}>
                Q{qIndex + 1}/{questionCount}
              </span>
              <span style={styles.pill}>{q.skill}</span>
              <span style={styles.pill}>
                Difficulty: <strong style={{ color: "#c4b5fd" }}>{diffLabel}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>{q.question}</h3>
            {q.source && <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Reference: {q.source}</p>}

            {q.type === "multiple-choice" &&
              q.options.map((opt, i) => (
                <div key={i} onClick={() => setAnswer(i)} style={{ ...styles.opt, ...(answers[qIndex] === i ? styles.optSel : styles.optDef) }}>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: answers[qIndex] === i ? "#6366f1" : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}

            {q.type === "true-false" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[true, false].map((v) => (
                  <div
                    key={String(v)}
                    onClick={() => setAnswer(v)}
                    style={{ ...styles.opt, justifyContent: "center", ...(answers[qIndex] === v ? styles.optSel : styles.optDef) }}
                  >
                    {v ? "True" : "False"}
                  </div>
                ))}
              </div>
            )}

            {q.type === "fill-blank" && (
              <input
                type="text"
                style={{ ...styles.input, maxWidth: 420, textAlign: "center", margin: "0 auto", display: "block" }}
                placeholder="Type answer..."
                value={fillAnswer}
                onChange={(e) => handleFillChange(e.target.value)}
                autoComplete="off"
              />
            )}

            {q.type === "drag-drop" && (
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, color: "#94a3b8" }}>Items:</p>
                  {q.items.map((item, i) => {
                    if (answers[qIndex] && Array.isArray(answers[qIndex]) && answers[qIndex].includes(i)) return null;
                    return (
                      <div
                        key={i}
                        onClick={() => setDraggedItem(draggedItem === i ? null : i)}
                        style={{
                          padding: "12px 16px",
                          background: draggedItem === i ? "#22c55e" : "#6366f1",
                          borderRadius: 8,
                          marginBottom: 8,
                          cursor: "pointer",
                        }}
                      >
                        {item}
                      </div>
                    );
                  })}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, color: "#94a3b8" }}>Zones:</p>
                  {q.zones.map((zone, i) => {
                    const f = answers[qIndex] && Array.isArray(answers[qIndex]) ? answers[qIndex][i] : -1;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (draggedItem !== null) {
                            handleDrop(i, draggedItem);
                            setDraggedItem(null);
                          }
                        }}
                        style={{
                          padding: "12px 16px",
                          background: "rgba(0,0,0,0.2)",
                          border: "2px " + (f >= 0 ? "solid #6366f1" : "dashed rgba(255,255,255,0.2)"),
                          borderRadius: 8,
                          marginBottom: 8,
                          minHeight: 48,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        {f >= 0 && <span style={{ background: "#6366f1", padding: "4px 12px", borderRadius: 6 }}>{q.items[f]}</span>}
                        <span style={{ color: "#64748b" }}>{zone}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Enhancement 7: immediate feedback */}
            {lastFeedback && (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: lastFeedback.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8, color: lastFeedback.correct ? "#22c55e" : "#ef4444" }}>
                  {lastFeedback.correct ? "✅ Correct" : "❌ Not quite"}
                </div>

                {!lastFeedback.correct && (
                  <div style={{ marginBottom: 8, color: "#e2e8f0" }}>
                    <span style={{ color: "#94a3b8" }}>Correct answer:</span>{" "}
                    <strong style={{ color: "#c4b5fd" }}>{lastFeedback.correctAnswerText}</strong>
                  </div>
                )}

                <div style={{ color: "#94a3b8", lineHeight: 1.6 }}>{lastFeedback.explanation}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                  Reference: {lastFeedback.reference}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={{ ...styles.btn, ...styles.btnS, visibility: qIndex > 0 ? "visible" : "hidden" }}
              onClick={() => {
                setLastFeedback(null);
                setQIndex(qIndex - 1);
              }}
            >
              Prev
            </button>

            {qIndex < questionCount - 1 ? (
              <button
                style={{ ...styles.btn, ...styles.btnP }}
                onClick={() => {
                  // Build next question if needed before moving
                  ensureQuestionBuilt(qIndex + 1);
                  setLastFeedback(null);
                  setQIndex(qIndex + 1);
                }}
              >
                Next
              </button>
            ) : (
              <button style={{ ...styles.btn, ...styles.btnG }} onClick={submit}>
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Screen 5: Results (kept mostly as your original, with small fixes) ---
  if (screen === 5 && results) {
    const pct = Math.round((results.correct / results.total) * 100);
    const pass = pct >= 70;
    const careerName = getCareerName();
    const config = getCareerConfig(customCareer || careerField);
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const mins = Math.floor(results.time / 60);
    const secs = results.time % 60;

    // Full Report View (your existing layout, unchanged)
    if (showFullReport) {
      const avgScore =
        results.ksas.length > 0 ? Math.round(results.ksas.reduce((s, k) => s + k.score, 0) / results.ksas.length) : 0;
      const topSkills = results.ksas.filter((k) => k.score >= 70);
      const gapSkills = results.ksas.filter((k) => k.score < 70);
      const expertCount = results.ksas.filter((k) => k.level === "Expert").length;
      const proficientCount = results.ksas.filter((k) => k.level === "Proficient").length;
      const developingCount = results.ksas.filter((k) => k.level === "Developing" || k.level === "Foundational").length;

      return (
        <div style={styles.wrap}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div
              style={{
                ...styles.card,
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                border: "2px solid rgba(99,102,241,0.3)",
              }}
            >
              <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>
                COMPREHENSIVE CAREER ASSESSMENT REPORT
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{user ? user.name : ""}</h1>
              {user && user.title && <p style={{ color: "#94a3b8", marginBottom: 4 }}>{user.title}</p>}
              <p style={{ color: "#64748b", fontSize: 14 }}>{user ? user.email : ""}</p>
              <div
                style={{
                  width: 100,
                  height: 3,
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  margin: "20px auto",
                }}
              />
              <p style={{ color: "#c4b5fd", fontSize: 18, fontWeight: 600 }}>{careerName}</p>
              <p style={{ color: "#64748b", fontSize: 14 }}>Assessment Date: {date}</p>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#818cf8" }}>Executive Summary</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.1))", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#22c55e" }}>{pct}%</div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>Overall Score</div>
                </div>
                <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#818cf8" }}>{avgScore}%</div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>Avg Skill Score</div>
                </div>
                <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#f59e0b" }}>{results.ksas.length}</div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>Skills Assessed</div>
                </div>
                <div style={{ background: "rgba(139,92,246,0.1)", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#a78bfa" }}>
                    {mins}:{secs < 10 ? "0" + secs : secs}
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8" }}>Completion Time</div>
                </div>
              </div>

              <div style={{ background: pass ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", borderRadius: 12, padding: 20, border: "1px solid " + (pass ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)") }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{pass ? "✅" : "📈"}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pass ? "#22c55e" : "#f59e0b" }}>{pass ? "PROFICIENCY ACHIEVED" : "DEVELOPMENT RECOMMENDED"}</div>
                    <div style={{ fontSize: 14, color: "#94a3b8" }}>
                      {pass ? `Candidate demonstrates competency in ${careerName}` : `Candidate shows potential with targeted improvement areas in ${careerName}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#818cf8" }}>Skill Distribution Analysis</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#22c55e" }}>{expertCount}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>Expert Level</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>80%+ proficiency</div>
                </div>
                <div style={{ background: "rgba(99,102,241,0.1)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#818cf8" }}>{proficientCount}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>Proficient Level</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>60-79% proficiency</div>
                </div>
                <div style={{ background: "rgba(245,158,11,0.1)", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#f59e0b" }}>{developingCount}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>Developing Level</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Under 60% proficiency</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#818cf8" }}>KSA Analysis with Rankings</h2>
              <p style={{ color: "#94a3b8", marginBottom: 20 }}>Detailed proficiency assessment for {config ? config.jobFunction : careerName}</p>

              {results.ksas.map((ksa, i) => {
                const barColor = ksa.score >= 80 ? "#22c55e" : ksa.score >= 60 ? "#818cf8" : "#f59e0b";
                return (
                  <div key={i} style={{ marginBottom: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>
                          #{i + 1}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{ksa.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          {ksa.correct}/{ksa.total} correct
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            padding: "6px 14px",
                            borderRadius: 50,
                            background: ksa.level === "Expert" ? "rgba(34,197,94,0.2)" : ksa.level === "Proficient" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)",
                            color: ksa.level === "Expert" ? "#22c55e" : ksa.level === "Proficient" ? "#818cf8" : "#f59e0b",
                            fontWeight: 600,
                          }}
                        >
                          {ksa.score}% - {ksa.level}
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: ksa.score + "%", borderRadius: 6, background: barColor }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#818cf8" }}>Detailed Question Analysis</h2>
              {results.qResults.map((item, i) => {
                const q = item.q;
                const ok = item.ok;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 16,
                      padding: 16,
                      background: ok ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                      borderRadius: 12,
                      marginBottom: 12,
                      borderLeft: "4px solid " + (ok ? "#22c55e" : "#ef4444"),
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)", color: ok ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                      {ok ? "✓" : "✗"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>{q.question}</p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                        {q.source && <span style={{ fontSize: 11, color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>{q.source}</span>}
                        {q.skill && <span style={{ fontSize: 11, color: "#818cf8", background: "rgba(99,102,241,0.1)", padding: "2px 8px", borderRadius: 4 }}>{q.skill}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: "#94a3b8", padding: 10, background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>{q.feedback}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
              <button style={{ ...styles.btn, ...styles.btnS }} onClick={() => setShowFullReport(false)}>
                Back to Summary
              </button>
              <button style={{ ...styles.btn, ...styles.btnS }} onClick={reset}>
                New Assessment
              </button>
              <button style={{ ...styles.btn, ...styles.btnS }} onClick={logout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Standard Results View
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              ...styles.card,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))",
              border: "2px solid rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ fontSize: 14, color: "#818cf8", fontWeight: 600, marginBottom: 8 }}>ASSESSMENT REPORT</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{user ? user.name : ""}</h2>
            {user && user.title && <p style={{ color: "#94a3b8", marginBottom: 4 }}>{user.title}</p>}
            <p style={{ color: "#64748b", fontSize: 14 }}>{user ? user.email : ""}</p>
            <div style={{ width: 80, height: 2, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", margin: "20px auto" }} />
            <p style={{ color: "#94a3b8" }}>{careerName} Assessment</p>
            <p style={{ color: "#64748b", fontSize: 14 }}>Completed: {date}</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                background: pass ? "linear-gradient(135deg, #22c55e, #16a34a)" : "linear-gradient(135deg, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {pct}%
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: pass ? "#22c55e" : "#f59e0b" }}>{pass ? "PASSED" : "DEVELOPING"}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{results.correct}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Correct</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{results.total - results.correct}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Incorrect</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#818cf8" }}>{results.total}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Total</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#818cf8" }}>
                {mins}:{secs < 10 ? "0" + secs : secs}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Time</div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Skills Assessment</h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Proficiency in {config ? config.jobFunction : ""}</p>

            {results.ksas.map((ksa, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    {ksa.name} <span style={{ fontSize: 12, color: "#64748b" }}>({ksa.correct}/{ksa.total})</span>
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      padding: "4px 12px",
                      borderRadius: 50,
                      background: ksa.level === "Expert" ? "rgba(34,197,94,0.2)" : ksa.level === "Proficient" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)",
                      color: ksa.level === "Expert" ? "#22c55e" : ksa.level === "Proficient" ? "#818cf8" : "#f59e0b",
                    }}
                  >
                    {ksa.level}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", marginTop: 8 }}>
                  <div style={{ height: "100%", width: ksa.score + "%", borderRadius: 4, background: ksa.score >= 80 ? "#22c55e" : ksa.score >= 60 ? "#818cf8" : "#f59e0b" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...styles.btn, ...styles.btnO }} onClick={() => setShowFullReport(true)}>
              Generate Full Report
            </button>
            <button style={{ ...styles.btn, ...styles.btnS }} onClick={reset}>
              New Assessment
            </button>
            {results.missed.length > 0 && (
              <button style={{ ...styles.btn, ...styles.btnP }} onClick={retest}>
                Retest
              </button>
            )}
            <button style={{ ...styles.btn, ...styles.btnS }} onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
