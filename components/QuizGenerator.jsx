"use client";



import React, { useState, useEffect } from 'react';

export default function QuizGenerator() {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ name: '', email: '', title: '' });
  const [screen, setScreen] = useState(0);
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [careerField, setCareerField] = useState('');
  const [customCareer, setCustomCareer] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState(['multiple-choice', 'true-false', 'fill-blank', 'drag-drop']);
  const [questions, setQuestions] = useState([]);
  const [usedIds, setUsedIds] = useState(new Set());
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [fillAnswer, setFillAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const industries = [
    { id: 'banking', name: 'Banking & Finance', icon: '🏦' },
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭' },
    { id: 'government', name: 'Government', icon: '🏛' },
    { id: 'hr', name: 'Human Resources', icon: '👥' },
    { id: 'accounting', name: 'Accounting', icon: '📒' },
  ];

  const careers = {
    banking: [
      { id: 'risk-management', name: 'Risk Management (GARP)', icon: '⚠' },
      { id: 'anti-money-laundering', name: 'AML (ACAMS)', icon: '🔍' },
      { id: 'credit-analysis', name: 'Credit Analysis', icon: '💳' },
      { id: 'investment-banking', name: 'Investment Banking', icon: '📈' },
      { id: 'wealth-management', name: 'Wealth Management (CFP)', icon: '💰' },
      { id: 'treasury-management', name: 'Treasury Management (AFP)', icon: '🏦' },
      { id: 'compliance-banking', name: 'Banking Compliance', icon: '✅' },
      { id: 'fraud-banking', name: 'Banking Fraud Prevention', icon: '🛡' },
      { id: 'commercial-lending', name: 'Commercial Lending', icon: '🏢' },
      { id: 'retail-banking', name: 'Retail Banking Operations', icon: '🪪' },
    ],
    technology: [
      { id: 'cybersecurity', name: 'Cybersecurity (NIST/NICE)', icon: '🔐' },
      { id: 'cloud-computing', name: 'Cloud (CSA)', icon: '☁' },
      { id: 'data-privacy', name: 'Privacy (IAPP)', icon: '🛡' },
      { id: 'devops', name: 'DevOps Engineering', icon: '🔄' },
      { id: 'data-science', name: 'Data Science', icon: '📊' },
      { id: 'software-engineering', name: 'Software Engineering', icon: '👨‍💻' },
      { id: 'network-engineering', name: 'Network Engineering', icon: '🌐' },
      { id: 'ai-ml', name: 'AI/Machine Learning', icon: '🤖' },
      { id: 'database-admin', name: 'Database Administration', icon: '💾' },
      { id: 'it-project-mgmt', name: 'IT Project Management', icon: '📅' },
    ],
    healthcare: [
      { id: 'hipaa-compliance', name: 'HIPAA Compliance', icon: '🏥' },
      { id: 'medical-coding', name: 'Medical Coding (AAPC)', icon: '📝' },
      { id: 'clinical-research', name: 'Clinical Research (ACRP)', icon: '🔬' },
      { id: 'health-informatics', name: 'Health Informatics (AHIMA)', icon: '💻' },
      { id: 'nursing-leadership', name: 'Nursing Leadership', icon: '👩‍⚕' },
      { id: 'healthcare-admin', name: 'Healthcare Administration', icon: '📋' },
      { id: 'patient-safety', name: 'Patient Safety (CPPS)', icon: '🛡' },
      { id: 'revenue-cycle', name: 'Revenue Cycle Management', icon: '💵' },
      { id: 'pharmacy', name: 'Pharmacy Practice', icon: '💊' },
      { id: 'medical-device', name: 'Medical Device Regulatory', icon: '🩺' },
    ],
    manufacturing: [
      { id: 'quality-control', name: 'Quality (ASQ/ISO)', icon: '✅' },
      { id: 'six-sigma', name: 'Six Sigma (ASQ/IASSC)', icon: '📈' },
      { id: 'supply-chain', name: 'Supply Chain (APICS)', icon: '🚚' },
      { id: 'lean-manufacturing', name: 'Lean Manufacturing', icon: '🏭' },
      { id: 'safety-osha', name: 'Safety (OSHA)', icon: '⛑' },
      { id: 'production-planning', name: 'Production Planning', icon: '📊' },
      { id: 'maintenance-reliability', name: 'Maintenance & Reliability', icon: '🔧' },
      { id: 'environmental', name: 'Environmental Compliance', icon: '🌿' },
      { id: 'process-engineering', name: 'Process Engineering', icon: '⚙' },
      { id: 'inventory-management', name: 'Inventory Management', icon: '📦' },
    ],
    government: [
      { id: 'fisma', name: 'FISMA/RMF (NIST)', icon: '🔒' },
      { id: 'acquisition', name: 'Federal Acquisition (FAR)', icon: '📜' },
      { id: 'grants-management', name: 'Grants Management', icon: '💰' },
      { id: 'program-management', name: 'Program Management (FAC-P/PM)', icon: '📋' },
      { id: 'budget-analysis', name: 'Budget Analysis', icon: '💵' },
      { id: 'records-management', name: 'Records Management', icon: '📁' },
      { id: 'fedramp', name: 'FedRAMP Authorization', icon: '☁' },
      { id: 'security-clearance', name: 'Security Clearance Processing', icon: '🎖' },
      { id: 'foia-privacy', name: 'FOIA & Privacy', icon: '🔍' },
      { id: 'hr-federal', name: 'Federal HR (OPM)', icon: '👥' },
    ],
    hr: [
      { id: 'shrm', name: 'HR Management (SHRM)', icon: '👥' },
      { id: 'compensation', name: 'Compensation & Benefits', icon: '💵' },
      { id: 'talent-acquisition', name: 'Talent Acquisition', icon: '🎯' },
      { id: 'learning-development', name: 'Learning & Development', icon: '📚' },
      { id: 'employee-relations', name: 'Employee Relations', icon: '🤝' },
      { id: 'hris', name: 'HRIS Administration', icon: '💻' },
      { id: 'org-development', name: 'Organizational Development', icon: '🌱' },
      { id: 'diversity-inclusion', name: 'Diversity & Inclusion', icon: '🌈' },
      { id: 'labor-relations', name: 'Labor Relations', icon: '⚖' },
      { id: 'hr-analytics', name: 'HR Analytics', icon: '📊' },
    ],
    accounting: [
      { id: 'internal-audit', name: 'Internal Audit (IIA)', icon: '🔍' },
      { id: 'fraud-examination', name: 'Fraud Examination (ACFE)', icon: '⚖' },
      { id: 'public-accounting', name: 'Public Accounting (CPA)', icon: '📊' },
      { id: 'tax', name: 'Tax (CPA/EA)', icon: '📝' },
      { id: 'management-accounting', name: 'Management Accounting (CMA)', icon: '💼' },
      { id: 'forensic-accounting', name: 'Forensic Accounting', icon: '🔎' },
      { id: 'financial-reporting', name: 'Financial Reporting', icon: '📈' },
      { id: 'cost-accounting', name: 'Cost Accounting', icon: '💰' },
      { id: 'govt-accounting', name: 'Government Accounting (CGFM)', icon: '🏛' },
      { id: 'sox-compliance', name: 'SOX Compliance', icon: '✅' },
    ],
  };

  const standardsSources = {
    'cybersecurity': { org: 'NIST/NICE Framework', standards: ['NIST SP 800-53', 'NICE Framework'], certBody: 'CISSP, Security+, CISM' },
    'cloud-computing': { org: 'Cloud Security Alliance', standards: ['CSA CCM v4', 'AWS Well-Architected'], certBody: 'CCSK, CCSP' },
    'data-privacy': { org: 'IAPP', standards: ['GDPR', 'CCPA'], certBody: 'CIPP, CIPM' },
    'risk-management': { org: 'GARP', standards: ['Basel III', 'ISO 31000'], certBody: 'FRM, PRM' },
    'anti-money-laundering': { org: 'ACAMS', standards: ['BSA/AML', 'FATF'], certBody: 'CAMS' },
    'hipaa-compliance': { org: 'HHS OCR', standards: ['HIPAA Privacy Rule', 'Security Rule'], certBody: 'CHC, CHPC' },
    'quality-control': { org: 'ASQ/ISO', standards: ['ISO 9001:2015'], certBody: 'CQE, CQA' },
    'six-sigma': { org: 'ASQ/IASSC', standards: ['DMAIC', 'Lean Six Sigma'], certBody: 'CSSBB' },
    'fisma': { org: 'NIST/OMB', standards: ['FISMA', 'NIST RMF'], certBody: 'CAP, CISA' },
    'shrm': { org: 'SHRM', standards: ['SHRM BoCK', 'FLSA'], certBody: 'SHRM-CP, SHRM-SCP' },
    'internal-audit': { org: 'IIA', standards: ['IIA Standards', 'COSO'], certBody: 'CIA, CRMA' },
    'fraud-examination': { org: 'ACFE', standards: ['Fraud Examiners Manual'], certBody: 'CFE' },
    'devops': { org: 'DevOps Institute', standards: ['DASA', 'SRE'], certBody: 'DevOps Foundation' },
    'data-science': { org: 'Various', standards: ['CRISP-DM'], certBody: 'IBM, Google, AWS' },
    'medical-coding': { org: 'AAPC/AHIMA', standards: ['ICD-10', 'CPT'], certBody: 'CPC, CCS' },
    'supply-chain': { org: 'APICS/ASCM', standards: ['SCOR'], certBody: 'CSCP, CPIM' },
    'acquisition': { org: 'FAI', standards: ['FAR', 'DFARS'], certBody: 'FAC-C' },
    'compensation': { org: 'WorldatWork', standards: ['Total Rewards'], certBody: 'CCP, CBP' },
    'public-accounting': { org: 'AICPA', standards: ['GAAP', 'GAAS'], certBody: 'CPA' },
    'tax': { org: 'IRS/AICPA', standards: ['IRC'], certBody: 'CPA, EA' },
  };

  const careerConfig = {
    'cybersecurity': {
      skills: ['Risk Assessment', 'Security Controls', 'Incident Response', 'Vulnerability Mgmt', 'Access Control', 'Monitoring'],
      jobFunction: 'implementing NIST/NICE cybersecurity controls',
      progressions: [
        { id: 'analyst', name: 'Security Analyst', icon: '🔍', desc: 'Monitor and analyze' },
        { id: 'engineer', name: 'Security Engineer', icon: '🔧', desc: 'Build security systems' },
        { id: 'architect', name: 'Security Architect', icon: '🏗', desc: 'Design enterprise security' },
        { id: 'ciso', name: 'CISO', icon: '👔', desc: 'Executive leadership' },
      ]
    },
    'cloud-computing': {
      skills: ['Cloud Architecture', 'Security Controls', 'Cost Optimization', 'IaC', 'Compliance', 'DR'],
      jobFunction: 'architecting cloud solutions per CSA standards',
      progressions: [
        { id: 'admin', name: 'Cloud Administrator', icon: '☁', desc: 'Manage cloud resources' },
        { id: 'engineer', name: 'Cloud Engineer', icon: '🔧', desc: 'Build cloud solutions' },
        { id: 'architect', name: 'Solutions Architect', icon: '🏗', desc: 'Multi-cloud design' },
        { id: 'security', name: 'Cloud Security Architect', icon: '🛡', desc: 'CCSP expertise' },
      ]
    },
    'data-privacy': {
      skills: ['Privacy Assessment', 'Data Mapping', 'Consent Mgmt', 'DSAR', 'Cross-Border', 'Privacy by Design'],
      jobFunction: 'ensuring GDPR/CCPA compliance',
      progressions: [
        { id: 'analyst', name: 'Privacy Analyst', icon: '📋', desc: 'Privacy assessments' },
        { id: 'manager', name: 'Privacy Manager', icon: '📊', desc: 'Program management' },
        { id: 'dpo', name: 'Data Protection Officer', icon: '🛡', desc: 'GDPR DPO role' },
        { id: 'cpo', name: 'Chief Privacy Officer', icon: '👔', desc: 'Executive leadership' },
      ]
    },
    'risk-management': {
      skills: ['Market Risk', 'Credit Risk', 'Operational Risk', 'Stress Testing', 'Model Validation', 'Reporting'],
      jobFunction: 'measuring risks per Basel/GARP standards',
      progressions: [
        { id: 'analyst', name: 'Risk Analyst', icon: '📊', desc: 'Risk analysis' },
        { id: 'senior', name: 'Senior Risk Analyst', icon: '📈', desc: 'Complex analysis' },
        { id: 'manager', name: 'Risk Manager', icon: '👔', desc: 'FRM-level expertise' },
        { id: 'cro', name: 'Chief Risk Officer', icon: '⭐', desc: 'Enterprise leadership' },
      ]
    },
    'anti-money-laundering': {
      skills: ['SAR Filing', 'Transaction Monitoring', 'CDD', 'EDD', 'Sanctions', 'Risk Assessment'],
      jobFunction: 'detecting money laundering per BSA/FATF',
      progressions: [
        { id: 'analyst', name: 'AML Analyst', icon: '🔍', desc: 'Alert investigation' },
        { id: 'investigator', name: 'AML Investigator', icon: '📋', desc: 'Complex cases' },
        { id: 'manager', name: 'AML Manager', icon: '👔', desc: 'CAMS-certified management' },
        { id: 'bsa', name: 'BSA Officer', icon: '⭐', desc: 'Program leadership' },
      ]
    },
    'hipaa-compliance': {
      skills: ['Privacy Rule', 'Security Rule', 'Risk Analysis', 'Breach Response', 'BAA Mgmt', 'Training'],
      jobFunction: 'ensuring HIPAA compliance',
      progressions: [
        { id: 'analyst', name: 'Compliance Analyst', icon: '📋', desc: 'Compliance support' },
        { id: 'specialist', name: 'HIPAA Specialist', icon: '🏥', desc: 'Program implementation' },
        { id: 'officer', name: 'Privacy Officer', icon: '👔', desc: 'Privacy leadership' },
        { id: 'cpo', name: 'Chief Privacy Officer', icon: '⭐', desc: 'Executive role' },
      ]
    },
    'quality-control': {
      skills: ['Inspection', 'SPC', 'Root Cause', 'CAPA', 'Audit', 'Documentation'],
      jobFunction: 'ensuring quality per ASQ/ISO standards',
      progressions: [
        { id: 'inspector', name: 'Quality Inspector', icon: '🔍', desc: 'Quality inspection' },
        { id: 'engineer', name: 'Quality Engineer', icon: '🔧', desc: 'CQE-certified' },
        { id: 'manager', name: 'Quality Manager', icon: '📊', desc: 'Program management' },
        { id: 'director', name: 'Director of Quality', icon: '👔', desc: 'Strategic leadership' },
      ]
    },
    'six-sigma': {
      skills: ['DMAIC', 'Statistics', 'Process Mapping', 'Hypothesis Testing', 'Control Charts', 'PM'],
      jobFunction: 'leading Lean Six Sigma improvement',
      progressions: [
        { id: 'yb', name: 'Yellow Belt', icon: '🟡', desc: 'Team member' },
        { id: 'gb', name: 'Green Belt', icon: '🟢', desc: 'Part-time projects' },
        { id: 'bb', name: 'Black Belt', icon: '⚫', desc: 'CSSBB project leadership' },
        { id: 'mbb', name: 'Master Black Belt', icon: '🏅', desc: 'Program expert' },
      ]
    },
    'fisma': {
      skills: ['Categorization', 'Control Selection', 'A&A', 'ConMon', 'POA&M', 'ATO'],
      jobFunction: 'achieving federal authorization per NIST RMF',
      progressions: [
        { id: 'analyst', name: 'Security Analyst', icon: '📋', desc: 'Documentation' },
        { id: 'isso', name: 'ISSO', icon: '🔐', desc: 'System security' },
        { id: 'issm', name: 'ISSM', icon: '👔', desc: 'CAP-certified' },
        { id: 'ciso', name: 'Agency CISO', icon: '⭐', desc: 'Enterprise security' },
      ]
    },
    'shrm': {
      skills: ['Employee Relations', 'Talent Mgmt', 'Compensation', 'HR Compliance', 'OD', 'Analytics'],
      jobFunction: 'managing HR per SHRM BoCK',
      progressions: [
        { id: 'generalist', name: 'HR Generalist', icon: '👥', desc: 'General HR' },
        { id: 'specialist', name: 'HR Specialist', icon: '📋', desc: 'Specialty area' },
        { id: 'manager', name: 'HR Manager', icon: '👔', desc: 'SHRM-SCP certified' },
        { id: 'chro', name: 'CHRO', icon: '⭐', desc: 'Executive HR' },
      ]
    },
    'internal-audit': {
      skills: ['Planning', 'Risk-Based Auditing', 'Control Testing', 'Issues', 'Reporting', 'Follow-Up'],
      jobFunction: 'providing assurance per IIA Standards',
      progressions: [
        { id: 'staff', name: 'Staff Auditor', icon: '📋', desc: 'Audit execution' },
        { id: 'senior', name: 'Senior Auditor', icon: '📊', desc: 'Lead audits' },
        { id: 'manager', name: 'Audit Manager', icon: '👔', desc: 'CIA-certified' },
        { id: 'cae', name: 'Chief Audit Executive', icon: '⭐', desc: 'Enterprise audit' },
      ]
    },
    'fraud-examination': {
      skills: ['Detection', 'Investigation', 'Interview', 'Evidence', 'Reporting', 'Litigation Support'],
      jobFunction: 'detecting fraud per ACFE standards',
      progressions: [
        { id: 'analyst', name: 'Fraud Analyst', icon: '🔍', desc: 'Detection' },
        { id: 'investigator', name: 'Fraud Investigator', icon: '📋', desc: 'Case investigation' },
        { id: 'manager', name: 'Fraud Manager', icon: '👔', desc: 'CFE-certified' },
        { id: 'director', name: 'Director of Fraud Prevention', icon: '⭐', desc: 'Program leadership' },
      ]
    },
  };

  const questionDb = {
    technology: {
      'cybersecurity': {
        'multiple-choice': [
          { id: 'cs1', question: 'Per NIST SP 800-61, what is the FIRST step when a potential incident is detected?', options: ['Eradicate immediately', 'Determine if incident occurred', 'Contact law enforcement', 'Shut down systems'], correct: 1, feedback: 'NIST 800-61: Detection begins with determining if an event is an incident.', skill: 'Incident Response', source: 'NIST SP 800-61' },
          { id: 'cs2', question: 'Per NIST 800-53, which control family addresses vulnerability scanning?', options: ['Access Control', 'Risk Assessment', 'System Protection', 'Audit'], correct: 1, feedback: 'RA-5 is part of Risk Assessment family.', skill: 'Security Controls', source: 'NIST SP 800-53' },
          { id: 'cs3', question: 'Per NIST 800-63B, minimum password length is:', options: ['6 chars', '8 chars', '12 chars', '14 chars'], correct: 1, feedback: 'NIST 800-63B requires at least 8 characters.', skill: 'Access Control', source: 'NIST SP 800-63B' },
        ],
        'true-false': [
          { id: 'cs4', question: 'NIST 800-37 Rev 2 added Prepare as RMF Step 1.', correct: true, feedback: 'Rev 2 made RMF a 7-step process starting with Prepare.', skill: 'Risk Assessment', source: 'NIST SP 800-37' },
          { id: 'cs5', question: 'Separation of duties is mandatory for all NIST impact levels.', correct: false, feedback: 'AC-5 requirements vary by impact level.', skill: 'Security Controls', source: 'NIST SP 800-53' },
        ],
        'fill-blank': [
          { id: 'cs6', question: 'The five NIST CSF functions are: Identify, Protect, Detect, Respond, and ___.', correct: 'Recover', feedback: 'CSF: Identify, Protect, Detect, Respond, Recover.', skill: 'Risk Assessment', source: 'NIST CSF' },
        ],
        'drag-drop': [
          { id: 'cs7', question: 'Order first 4 RMF steps:', items: ['Select', 'Implement', 'Categorize', 'Prepare'], zones: ['Step 1', 'Step 2', 'Step 3', 'Step 4'], correct: [3, 2, 0, 1], feedback: 'Prepare, Categorize, Select, Implement.', skill: 'Risk Assessment', source: 'NIST RMF' },
        ],
      },
      'cloud-computing': {
        'multiple-choice': [
          { id: 'cc1', question: 'Per CSA CCM v4, which domain addresses data security?', options: ['AIS', 'DSP', 'IAM', 'SEF'], correct: 1, feedback: 'DSP covers data protection.', skill: 'Security Controls', source: 'CSA CCM v4' },
          { id: 'cc2', question: 'In IaaS, who patches the guest OS?', options: ['Provider', 'Customer', 'Shared', 'Third-party'], correct: 1, feedback: 'Customer manages guest OS in IaaS.', skill: 'Cloud Architecture', source: 'CSA' },
        ],
        'true-false': [
          { id: 'cc3', question: 'Per CSA, encryption in transit is a baseline control.', correct: true, feedback: 'CSA recommends encryption in transit as baseline.', skill: 'Security Controls', source: 'CSA' },
        ],
        'fill-blank': [
          { id: 'cc4', question: 'AWS Well-Architected has ___ pillars.', correct: '6', feedback: 'Six pillars including Sustainability.', skill: 'Cloud Architecture', source: 'AWS' },
        ],
        'drag-drop': [
          { id: 'cc5', question: 'Order cloud models by customer control:', items: ['IaaS', 'PaaS', 'SaaS'], zones: ['Most', 'Medium', 'Least'], correct: [0, 1, 2], feedback: 'IaaS most, SaaS least.', skill: 'Cloud Architecture', source: 'NIST' },
        ],
      },
      'data-privacy': {
        'multiple-choice': [
          { id: 'dp1', question: 'GDPR Article 17 right to erasure is also called:', options: ['Right to access', 'Right to be forgotten', 'Right to portability', 'Right to rectify'], correct: 1, feedback: 'Article 17 is right to be forgotten.', skill: 'DSAR', source: 'GDPR' },
          { id: 'dp2', question: 'GDPR breach notification deadline is:', options: ['24 hours', '48 hours', '72 hours', '7 days'], correct: 2, feedback: 'Article 33 requires 72 hours.', skill: 'Privacy Assessment', source: 'GDPR' },
        ],
        'true-false': [
          { id: 'dp3', question: 'GDPR consent must be freely given, specific, informed, and unambiguous.', correct: true, feedback: 'Article 7 consent requirements.', skill: 'Consent Mgmt', source: 'GDPR' },
        ],
        'fill-blank': [
          { id: 'dp4', question: 'CCPA lookback period is ___ months.', correct: '12', feedback: 'CCPA requires prior 12 months data.', skill: 'DSAR', source: 'CCPA' },
        ],
        'drag-drop': [
          { id: 'dp5', question: 'Match laws to regions:', items: ['GDPR', 'CCPA', 'PIPEDA'], zones: ['EU', 'California', 'Canada'], correct: [0, 1, 2], feedback: 'Privacy laws by jurisdiction.', skill: 'Privacy Assessment', source: 'IAPP' },
        ],
      },
    },
    banking: {
      'risk-management': {
        'multiple-choice': [
          { id: 'rm1', question: 'Basel III minimum CET1 ratio is:', options: ['4%', '4.5%', '6%', '8%'], correct: 1, feedback: 'Basel III requires 4.5% CET1.', skill: 'Operational Risk', source: 'Basel III' },
          { id: 'rm2', question: 'Per GARP, which VaR uses historical returns directly?', options: ['Parametric', 'Historical Simulation', 'Monte Carlo', 'Conditional'], correct: 1, feedback: 'Historical Simulation uses actual returns.', skill: 'Market Risk', source: 'GARP FRM' },
        ],
        'true-false': [
          { id: 'rm3', question: 'Basel III replaced VaR with Expected Shortfall.', correct: true, feedback: 'FRTB moved to 97.5% ES.', skill: 'Market Risk', source: 'Basel III' },
        ],
        'fill-blank': [
          { id: 'rm4', question: 'Basel II Pillar 3 is Market ___.', correct: 'Discipline', feedback: 'Pillar 3 is disclosure requirements.', skill: 'Reporting', source: 'Basel II' },
        ],
        'drag-drop': [
          { id: 'rm5', question: 'Match risk types to approaches:', items: ['Credit', 'Market', 'Operational'], zones: ['IRB', 'FRTB', 'AMA'], correct: [0, 1, 2], feedback: 'Basel methodology by risk type.', skill: 'Operational Risk', source: 'Basel' },
        ],
      },
      'anti-money-laundering': {
        'multiple-choice': [
          { id: 'aml1', question: 'Per BSA, SAR filing deadline is:', options: ['15 days', '30 days', '45 days', '60 days'], correct: 1, feedback: 'SARs due within 30 days.', skill: 'SAR Filing', source: 'BSA' },
          { id: 'aml2', question: 'FATF 40 Recommendations address:', options: ['Tax', 'AML/CFT', 'Consumer protection', 'Securities'], correct: 1, feedback: 'FATF covers AML/CFT standards.', skill: 'Risk Assessment', source: 'FATF' },
        ],
        'true-false': [
          { id: 'aml3', question: 'CTRs required for cash over $10,000.', correct: true, feedback: 'BSA threshold is $10,000.', skill: 'SAR Filing', source: 'BSA' },
        ],
        'fill-blank': [
          { id: 'aml4', question: 'PEP stands for Politically ___ Person.', correct: 'Exposed', feedback: 'Politically Exposed Persons require EDD.', skill: 'EDD', source: 'FATF' },
        ],
        'drag-drop': [
          { id: 'aml5', question: 'Order CDD steps:', items: ['Monitor', 'Identify', 'Risk Assess', 'Beneficial Owner'], zones: ['1st', '2nd', '3rd', '4th'], correct: [1, 3, 2, 0], feedback: 'ID, BO, Risk, Monitor.', skill: 'CDD', source: 'FinCEN' },
        ],
      },
    },
    healthcare: {
      'hipaa-compliance': {
        'multiple-choice': [
          { id: 'hp1', question: 'HIPAA max annual penalty per category is:', options: ['$50K', '$250K', '$1.5M', '$2M'], correct: 2, feedback: 'Cap is $1.5M per category per year.', skill: 'Privacy Rule', source: 'HIPAA' },
          { id: 'hp2', question: 'Workforce training is which safeguard type?', options: ['Physical', 'Technical', 'Administrative', 'Organizational'], correct: 2, feedback: 'Administrative safeguards include training.', skill: 'Security Rule', source: 'HIPAA' },
        ],
        'true-false': [
          { id: 'hp3', question: 'HIPAA requires security risk analysis.', correct: true, feedback: 'Required under 164.308(a)(1).', skill: 'Risk Analysis', source: 'HIPAA' },
        ],
        'fill-blank': [
          { id: 'hp4', question: 'Large breach notification deadline is ___ days.', correct: '60', feedback: '500+ individuals require 60 day notice.', skill: 'Breach Response', source: 'HIPAA' },
        ],
        'drag-drop': [
          { id: 'hp5', question: 'Match HIPAA rules:', items: ['Privacy', 'Security', 'Breach'], zones: ['PHI use', 'ePHI safeguards', 'Notification'], correct: [0, 1, 2], feedback: 'HIPAA rule focus areas.', skill: 'Privacy Rule', source: 'HIPAA' },
        ],
      },
    },
    manufacturing: {
      'quality-control': {
        'multiple-choice': [
          { id: 'qc1', question: 'Per ISO 9001, what is needed before QMS changes?', options: ['Approval only', 'Evaluate consequences', 'Customer notice', 'Audit'], correct: 1, feedback: 'Clause 6.3 requires evaluation.', skill: 'Inspection', source: 'ISO 9001' },
          { id: 'qc2', question: 'Cp of 1.33 indicates:', options: ['Not capable', 'Marginal', 'Capable', 'Highly capable'], correct: 2, feedback: 'Cp >= 1.33 is capable.', skill: 'SPC', source: 'ASQ' },
        ],
        'true-false': [
          { id: 'qc3', question: 'ISO 9001 requires documented procedures for all processes.', correct: false, feedback: 'ISO 9001:2015 allows flexibility.', skill: 'Documentation', source: 'ISO 9001' },
        ],
        'fill-blank': [
          { id: 'qc4', question: 'ISO 9001 is based on Plan-Do-Check-___.', correct: 'Act', feedback: 'PDCA cycle.', skill: 'Inspection', source: 'ISO 9001' },
        ],
        'drag-drop': [
          { id: 'qc5', question: 'Order DMAIC:', items: ['Improve', 'Define', 'Control', 'Measure', 'Analyze'], zones: ['1', '2', '3', '4', '5'], correct: [1, 3, 4, 0, 2], feedback: 'Define, Measure, Analyze, Improve, Control.', skill: 'Root Cause', source: 'ASQ' },
        ],
      },
      'six-sigma': {
        'multiple-choice': [
          { id: 'ss1', question: 'Six Sigma DPMO is:', options: ['3.4', '6', '34', '66807'], correct: 0, feedback: '6 sigma = 3.4 DPMO.', skill: 'Statistics', source: 'ASQ' },
          { id: 'ss2', question: 'Root cause analysis is in which phase?', options: ['Define', 'Measure', 'Analyze', 'Improve'], correct: 2, feedback: 'Analyze identifies root causes.', skill: 'DMAIC', source: 'IASSC' },
        ],
        'true-false': [
          { id: 'ss3', question: 'Green Belts lead projects full-time.', correct: false, feedback: 'Green Belts are part-time; Black Belts full-time.', skill: 'PM', source: 'ASQ' },
        ],
        'fill-blank': [
          { id: 'ss4', question: 'VOC stands for Voice of the ___.', correct: 'Customer', feedback: 'Voice of Customer captures requirements.', skill: 'DMAIC', source: 'ASQ' },
        ],
        'drag-drop': [
          { id: 'ss5', question: 'Match belts to commitment:', items: ['Yellow', 'Green', 'Black'], zones: ['Team member', 'Part-time lead', 'Full-time lead'], correct: [0, 1, 2], feedback: 'Belt commitment levels.', skill: 'PM', source: 'ASQ' },
        ],
      },
    },
    government: {
      'fisma': {
        'multiple-choice': [
          { id: 'fi1', question: 'NIST RMF Step 1 is:', options: ['Categorize', 'Select', 'Prepare', 'Implement'], correct: 2, feedback: 'Prepare added in Rev 2.', skill: 'Categorization', source: 'NIST RMF' },
          { id: 'fi2', question: 'FIPS 199 security objectives are:', options: ['PPT', 'CIA', 'PDR', 'IPR'], correct: 1, feedback: 'Confidentiality, Integrity, Availability.', skill: 'Categorization', source: 'FIPS 199' },
        ],
        'true-false': [
          { id: 'fi3', question: 'FedRAMP ATOs can be reused across agencies.', correct: true, feedback: 'Do Once, Use Many.', skill: 'A&A', source: 'FedRAMP' },
        ],
        'fill-blank': [
          { id: 'fi4', question: 'FISMA authorization is called ATO: Authorization to ___.', correct: 'Operate', feedback: 'Authorization to Operate.', skill: 'A&A', source: 'FISMA' },
        ],
        'drag-drop': [
          { id: 'fi5', question: 'Order RMF steps 1-4:', items: ['Select', 'Implement', 'Categorize', 'Prepare'], zones: ['1', '2', '3', '4'], correct: [3, 2, 0, 1], feedback: 'Prepare, Categorize, Select, Implement.', skill: 'A&A', source: 'NIST' },
        ],
      },
    },
    hr: {
      'shrm': {
        'multiple-choice': [
          { id: 'hr1', question: 'FLSA exempt salary threshold is approximately:', options: ['$35K', '$44K', '$47K', '$55K'], correct: 0, feedback: 'Current threshold around $35,568.', skill: 'Compensation', source: 'DOL' },
          { id: 'hr2', question: 'Which is NOT Title VII protected?', options: ['Race', 'Religion', 'Sexual orientation', 'Political affiliation'], correct: 3, feedback: 'Political affiliation not covered.', skill: 'HR Compliance', source: 'EEOC' },
        ],
        'true-false': [
          { id: 'hr3', question: 'FMLA provides 12 weeks paid leave.', correct: false, feedback: 'FMLA is unpaid leave.', skill: 'HR Compliance', source: 'DOL' },
        ],
        'fill-blank': [
          { id: 'hr4', question: 'SHRM BoCK has Competencies and ___ domains.', correct: 'Knowledge', feedback: 'Competencies and Knowledge.', skill: 'Talent Mgmt', source: 'SHRM' },
        ],
        'drag-drop': [
          { id: 'hr5', question: 'Match laws to focus:', items: ['FLSA', 'FMLA', 'Title VII'], zones: ['Wages', 'Leave', 'Discrimination'], correct: [0, 1, 2], feedback: 'Employment law focus areas.', skill: 'HR Compliance', source: 'DOL' },
        ],
      },
    },
    accounting: {
      'internal-audit': {
        'multiple-choice': [
          { id: 'ia1', question: 'IIA audit charter establishes:', options: ['Findings', 'Authority and position', 'Procedures', 'Budget'], correct: 1, feedback: 'Standard 1000 on charter.', skill: 'Planning', source: 'IIA' },
          { id: 'ia2', question: 'Per Three Lines, who owns risk?', options: ['Audit', 'First Line', 'Second Line', 'Board'], correct: 1, feedback: 'First Line owns risk.', skill: 'Risk-Based Auditing', source: 'IIA' },
        ],
        'true-false': [
          { id: 'ia3', question: 'IIA Standards require QAIP.', correct: true, feedback: 'Standard 1300 requires QAIP.', skill: 'Control Testing', source: 'IIA' },
        ],
        'fill-blank': [
          { id: 'ia4', question: 'Internal audit provides ___ and consulting.', correct: 'assurance', feedback: 'Assurance and consulting services.', skill: 'Planning', source: 'IIA' },
        ],
        'drag-drop': [
          { id: 'ia5', question: 'Order audit phases:', items: ['Report', 'Plan', 'Follow-Up', 'Fieldwork'], zones: ['1', '2', '3', '4'], correct: [1, 3, 0, 2], feedback: 'Plan, Fieldwork, Report, Follow-Up.', skill: 'Planning', source: 'IIA' },
        ],
      },
      'fraud-examination': {
        'multiple-choice': [
          { id: 'fe1', question: 'Fraud Triangle elements are:', options: ['Means/Motive/Opportunity', 'Pressure/Opportunity/Rationalization', 'Intent/Action/Concealment', 'Theft/Deception/Conversion'], correct: 1, feedback: 'Pressure, Opportunity, Rationalization.', skill: 'Detection', source: 'ACFE' },
          { id: 'fe2', question: 'Per ACFE, tips detect what percent of fraud?', options: ['20%', '30%', '40%', '50%'], correct: 2, feedback: 'About 40% detected via tips.', skill: 'Detection', source: 'ACFE' },
        ],
        'true-false': [
          { id: 'fe3', question: 'CFEs must follow ACFE ethics code.', correct: true, feedback: 'CFE ethical requirements.', skill: 'Evidence', source: 'ACFE' },
        ],
        'fill-blank': [
          { id: 'fe4', question: 'Most common fraud type is asset ___.', correct: 'misappropriation', feedback: '86% is asset misappropriation.', skill: 'Investigation', source: 'ACFE' },
        ],
        'drag-drop': [
          { id: 'fe5', question: 'Order fraud exam steps:', items: ['Report', 'Evidence', 'Interview', 'Predication'], zones: ['1', '2', '3', '4'], correct: [3, 2, 1, 0], feedback: 'Predication, Interview, Evidence, Report.', skill: 'Investigation', source: 'ACFE' },
        ],
      },
    },
  };

  const getCareerName = () => customCareer || careers[industry]?.find(c => c.id === careerField)?.name || careerField;

  const getCareerConfig = (id) => {
    if (careerConfig[id]) return careerConfig[id];
    const name = customCareer || id;
    return {
      skills: [name + ' Fundamentals', name + ' Best Practices', name + ' Problem Solving', name + ' Communication', name + ' Technical Skills', name + ' Standards'],
      jobFunction: 'performing ' + name.toLowerCase() + ' responsibilities',
      progressions: [
        { id: 'junior', name: 'Junior ' + name, icon: '📋', desc: 'Entry level' },
        { id: 'senior', name: 'Senior ' + name, icon: '📊', desc: 'Lead projects' },
        { id: 'manager', name: name + ' Manager', icon: '👔', desc: 'Program management' },
        { id: 'director', name: 'Director', icon: '⭐', desc: 'Strategic leadership' },
      ]
    };
  };

  const generateCustomQuestions = (name, skills) => ({
    'multiple-choice': [
      { id: 'c1', question: 'You are assigned to lead a new ' + name.toLowerCase() + ' project. What should be your FIRST action?', options: ['Start working immediately', 'Gather and define requirements', 'Delegate tasks to team', 'Wait for more direction'], correct: 1, feedback: 'Gathering and defining requirements ensures clear project scope before execution.', skill: skills[0], source: 'Best Practices' },
      { id: 'c2', question: 'A key stakeholder requests significant changes mid-project. How do you respond?', options: ['Implement changes immediately', 'Assess impact, document, and discuss tradeoffs', 'Refuse the request', 'Escalate without analysis'], correct: 1, feedback: 'Impact assessment and documentation enable informed decision-making on changes.', skill: skills[1], source: 'Best Practices' },
      { id: 'c6', question: 'Your team identifies three potential risks to a deliverable. What is your next step?', options: ['Eliminate all risks before proceeding', 'Prioritize risks by likelihood and impact', 'Transfer all risks to another team', 'Delay the project indefinitely'], correct: 1, feedback: 'Prioritizing risks by likelihood and impact focuses resources on the most critical threats.', skill: skills[2], source: 'Risk Management' },
      { id: 'c7', question: 'You need to explain a complex ' + name.toLowerCase() + ' issue to executives unfamiliar with the details. You should:', options: ['Use detailed technical terminology', 'Focus on business impact and key decisions needed', 'Provide every detail for completeness', 'Keep it vague to avoid questions'], correct: 1, feedback: 'Executives need business impact and decision points, not technical deep-dives.', skill: skills[3], source: 'Communication' },
      { id: 'c8', question: 'You notice recurring errors in your team\'s deliverables. The BEST approach is:', options: ['Wait for the next audit to address it', 'Implement a review checkpoint and track patterns', 'Assign blame to individuals', 'Ignore minor issues'], correct: 1, feedback: 'Proactive checkpoints and pattern tracking prevent recurring issues.', skill: skills[4], source: 'Quality Management' },
      { id: 'c9', question: 'A colleague asks you to approve a shortcut that technically violates policy but saves time. You should:', options: ['Approve it since it saves time', 'Review the policy, explain the risk, and suggest alternatives', 'Report them immediately', 'Make a quick decision to move on'], correct: 1, feedback: 'Understanding policy intent and suggesting compliant alternatives maintains integrity.', skill: skills[5], source: 'Ethics' },
      { id: 'c10', question: 'A recurring problem keeps affecting your projects despite multiple fixes. Your approach should be:', options: ['Apply another quick fix', 'Conduct root cause analysis to find the underlying issue', 'Blame the original designer', 'Document it and move on'], correct: 1, feedback: 'Root cause analysis addresses underlying issues rather than symptoms.', skill: skills[2], source: 'Problem Solving' },
      { id: 'c11', question: 'Your organization\'s ' + name.toLowerCase() + ' procedures haven\'t been updated in two years. You should:', options: ['Leave them as-is if working', 'Propose a review cycle with relevant stakeholders', 'Wait for an incident to force updates', 'Update them without input'], correct: 1, feedback: 'Regular reviews with stakeholders ensure procedures remain current and effective.', skill: skills[5], source: 'Standards' },
      { id: 'c12', question: 'Two team members have conflicting approaches to solving a problem. As the lead, you:', options: ['Let them work it out themselves', 'Facilitate discussion to evaluate both approaches objectively', 'Pick one approach without discussion', 'Assign someone else to the task'], correct: 1, feedback: 'Facilitated discussion leverages diverse perspectives for better solutions.', skill: skills[3], source: 'Teamwork' },
      { id: 'c13', question: 'A new procedure will significantly change how your team works. Before rollout, you should:', options: ['Send an email and start immediately', 'Provide training, gather feedback, and phase implementation', 'Only brief management', 'Expect resistance and push through'], correct: 1, feedback: 'Training, feedback, and phased rollout improve adoption of new procedures.', skill: skills[0], source: 'Change Management' },
      { id: 'tc1', question: 'During a review, you find work that functions correctly but is poorly organized and hard to maintain. You should:', options: ['Approve it since it works', 'Request improvements for maintainability with specific suggestions', 'Reject it without explanation', 'Rewrite it yourself'], correct: 1, feedback: 'Maintainability matters for long-term success; provide constructive feedback.', skill: skills[4], source: 'Quality Review' },
      { id: 'tc2', question: 'A system you manage shows intermittent failures every few hours. Your first diagnostic step:', options: ['Restart it and hope it stops', 'Review logs and metrics around failure times to identify patterns', 'Replace the hardware', 'Ignore it if it auto-recovers'], correct: 1, feedback: 'Log and metric analysis at failure times reveals patterns and root causes.', skill: skills[2], source: 'Troubleshooting' },
      { id: 'tc3', question: 'You discover a significant error in work that was already delivered. You should:', options: ['Hide it and fix it quietly later', 'Report immediately with impact assessment and remediation plan', 'Blame the previous owner', 'Wait to see if anyone notices'], correct: 1, feedback: 'Transparent reporting with remediation plans enables proper response and builds trust.', skill: skills[5], source: 'Professional Ethics' },
      { id: 'tc6', question: 'A vendor solution costs 50% less but lacks key compliance features. How do you advise leadership?', options: ['Recommend the cheaper option to save money', 'Document compliance gaps, quantify risks, and present options', 'Ignore compliance requirements', 'Delay the decision indefinitely'], correct: 1, feedback: 'Documenting gaps and quantifying risks enables informed executive decisions.', skill: skills[2], source: 'Vendor Assessment' },
      { id: 'tc8', question: 'Users report that a process you manage has become slow. Your first action:', options: ['Tell users to be patient', 'Gather data to identify where the slowdown occurs', 'Request more resources immediately', 'Reduce user access'], correct: 1, feedback: 'Data-driven analysis identifies the actual bottleneck for targeted remediation.', skill: skills[2], source: 'Performance Analysis' },
    ],
    'true-false': [
      { id: 'c3', question: 'Documentation is only valuable when preparing for audits.', correct: false, feedback: 'Documentation supports training, continuity, improvement, and knowledge transfer beyond audits.', skill: skills[1], source: 'Best Practices' },
      { id: 'c14', question: 'Professionals in ' + name.toLowerCase() + ' should regularly update their skills even when not required.', correct: true, feedback: 'Proactive skill development keeps professionals effective as the field evolves.', skill: skills[4], source: 'Professional Development' },
      { id: 'c15', question: 'It is acceptable to bend ethical standards when facing significant deadline pressure.', correct: false, feedback: 'Ethical standards must be maintained regardless of external pressures.', skill: skills[5], source: 'Ethics' },
      { id: 'c16', question: 'Gathering feedback from those affected by your work improves outcomes.', correct: true, feedback: 'Stakeholder feedback reveals blind spots and improves quality of deliverables.', skill: skills[3], source: 'Stakeholder Management' },
      { id: 'c17', question: 'Risk mitigation plans should be created once and only updated after incidents occur.', correct: false, feedback: 'Regular review and updates keep mitigation plans relevant to evolving risks.', skill: skills[2], source: 'Risk Management' },
      { id: 'c18', question: 'Strong technical skills guarantee career advancement in ' + name.toLowerCase() + '.', correct: false, feedback: 'Career advancement requires both technical expertise and skills like communication and leadership.', skill: skills[3], source: 'Professional Skills' },
      { id: 'tf1', question: 'Making frequent small updates to your work is better than making large infrequent changes.', correct: true, feedback: 'Incremental changes are easier to review, test, and troubleshoot if issues arise.', skill: skills[4], source: 'Work Management' },
      { id: 'tf3', question: 'Automated checks can completely replace human review and judgment.', correct: false, feedback: 'Automation and human review are complementary; both are needed for comprehensive quality.', skill: skills[4], source: 'Quality Assurance' },
      { id: 'tf5', question: 'Changes should be validated in a test environment before applying to live operations.', correct: true, feedback: 'Testing in a controlled environment catches issues before they impact real operations.', skill: skills[4], source: 'Change Management' },
    ],
    'fill-blank': [
      { id: 'c4', question: 'Professional ethics require ___ and integrity in all decisions.', correct: 'objectivity', feedback: 'Objectivity ensures decisions are based on facts rather than personal bias.', skill: skills[5], source: 'Ethics' },
      { id: 'c19', question: 'The continuous improvement cycle is Plan-Do-Check-___.', correct: 'Act', feedback: 'PDCA (Plan-Do-Check-Act) drives ongoing improvement in processes.', skill: skills[4], source: 'Quality Management' },
      { id: 'c20', question: 'Effective communication requires active ___ to understand others.', correct: 'listening', feedback: 'Active listening ensures you understand before responding.', skill: skills[3], source: 'Communication' },
      { id: 'c21', question: 'Risk assessment identifies both threats and ___ in a system or process.', correct: 'vulnerabilities', feedback: 'Understanding both threats and vulnerabilities enables effective risk mitigation.', skill: skills[2], source: 'Risk Management' },
      { id: 'c22', question: 'Professional standards promote consistency and ___ in work products.', correct: 'accountability', feedback: 'Standards create accountability by setting clear expectations.', skill: skills[5], source: 'Standards' },
      { id: 'fb3', question: 'The principle of granting only the minimum necessary access is called ___ privilege.', correct: 'least', feedback: 'Least privilege minimizes risk by limiting access to only what is needed.', skill: skills[4], source: 'Access Management' },
      { id: 'fb5', question: 'Having peers examine your work before delivery is called peer ___.', correct: 'review', feedback: 'Peer review catches errors and improves quality through fresh perspectives.', skill: skills[4], source: 'Quality Assurance' },
    ],
    'drag-drop': [
      { id: 'c5', question: 'Order these project phases:', items: ['Execute', 'Plan', 'Close', 'Initiate'], zones: ['1', '2', '3', '4'], correct: [3, 1, 0, 2], feedback: 'Initiate, Plan, Execute, Close is the standard project lifecycle.', skill: skills[0], source: 'Project Management' },
      { id: 'c23', question: 'Order the problem-solving steps:', items: ['Implement Solution', 'Define Problem', 'Evaluate Results', 'Analyze Causes'], zones: ['Step 1', 'Step 2', 'Step 3', 'Step 4'], correct: [1, 3, 0, 2], feedback: 'Define the problem, analyze causes, implement solution, then evaluate results.', skill: skills[2], source: 'Problem Solving' },
      { id: 'c24', question: 'Order the risk management process:', items: ['Mitigate', 'Identify', 'Monitor', 'Assess'], zones: ['1st', '2nd', '3rd', '4th'], correct: [1, 3, 0, 2], feedback: 'Identify risks, assess severity, mitigate appropriately, then monitor ongoing.', skill: skills[2], source: 'Risk Management' },
      { id: 'c25', question: 'Order these steps for effective communication:', items: ['Get Feedback', 'Craft Message', 'Know Your Audience', 'Deliver Clearly'], zones: ['1st', '2nd', '3rd', '4th'], correct: [2, 1, 3, 0], feedback: 'Know audience, craft message, deliver clearly, then get feedback.', skill: skills[3], source: 'Communication' },
      { id: 'dd1', question: 'Order a typical work lifecycle:', items: ['Review/Test', 'Gather Requirements', 'Deliver', 'Build/Create'], zones: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'], correct: [1, 3, 0, 2], feedback: 'Requirements, Build, Review/Test, then Deliver.', skill: skills[4], source: 'Work Lifecycle' },
      { id: 'dd2', question: 'Order incident response steps:', items: ['Fix the Issue', 'Detect Problem', 'Return to Normal', 'Contain Impact'], zones: ['1st', '2nd', '3rd', '4th'], correct: [1, 3, 0, 2], feedback: 'Detect, Contain, Fix, then Return to normal operations.', skill: skills[2], source: 'Incident Response' },
    ],
  });

  const generateQuestions = (exclude) => {
    const db = questionDb[industry] && questionDb[industry][careerField];
    const config = getCareerConfig(customCareer || careerField);
    let all = [];
    if (db && !customCareer) {
      selectedTypes.forEach(function(t) {
        if (db[t]) {
          db[t].forEach(function(q) {
            if (!exclude.has(q.id)) all.push(Object.assign({}, q, { type: t }));
          });
        }
      });
    }
    if (all.length < questionCount || customCareer) {
      const custom = generateCustomQuestions(customCareer || getCareerName(), config.skills);
      selectedTypes.forEach(function(t) {
        if (custom[t]) {
          custom[t].forEach(function(q) {
            if (!exclude.has(q.id) && !all.find(function(e) { return e.id === q.id; })) {
              all.push(Object.assign({}, q, { type: t }));
            }
          });
        }
      });
    }
    return all.sort(function() { return Math.random() - 0.5; }).slice(0, questionCount);
  };

  const handleLogin = function() {
    if (!loginForm.name.trim() || !loginForm.email.trim()) {
      alert('Enter name and email');
      return;
    }
    setUser(Object.assign({}, loginForm, { loginTime: new Date().toISOString() }));
    setScreen(1);
  };

  const startQuiz = function() {
    if (!selectedTypes.length || (!industry && !customIndustry) || (!careerField && !customCareer)) return;
    setScreen(3);
    setTimeout(function() {
      const qs = generateQuestions(usedIds);
      setUsedIds(new Set([...usedIds, ...qs.map(function(q) { return q.id; })]));
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(null));
      setQIndex(0);
      setFillAnswer('');
      setStartTime(Date.now());
      setScreen(4);
    }, 1500);
  };

  useEffect(function() {
    if (questions[qIndex] && questions[qIndex].type === 'fill-blank') {
      setFillAnswer(answers[qIndex] || '');
    }
  }, [qIndex, questions, answers]);

  const setAnswer = function(v) {
    const n = answers.slice();
    n[qIndex] = v;
    setAnswers(n);
  };

  const handleFillChange = function(v) {
    setFillAnswer(v);
    const n = answers.slice();
    n[qIndex] = v;
    setAnswers(n);
  };

  const handleDrop = function(z, i) {
    const q = questions[qIndex];
    const c = answers[qIndex] || new Array(q.zones.length).fill(-1);
    const n = c.slice();
    const e = n.indexOf(i);
    if (e !== -1) n[e] = -1;
    n[z] = i;
    setAnswer(n);
  };

  const calcKSAs = function(qr) {
    const config = getCareerConfig(customCareer || careerField);
    const scores = {};
    config.skills.forEach(function(sk) { scores[sk] = { correct: 0, total: 0 }; });
    qr.forEach(function(item) {
      const sk = item.q.skill || config.skills[0];
      if (scores[sk]) {
        scores[sk].total++;
        if (item.ok) scores[sk].correct++;
      } else {
        scores[config.skills[0]].total++;
        if (item.ok) scores[config.skills[0]].correct++;
      }
    });
    return Object.entries(scores).filter(function(entry) { return entry[1].total > 0; }).map(function(entry) {
      const name = entry[0];
      const data = entry[1];
      const pct = data.correct / data.total;
      return {
        name: name,
        score: Math.round(pct * 100),
        correct: data.correct,
        total: data.total,
        level: pct >= 0.8 ? 'Expert' : pct >= 0.6 ? 'Proficient' : pct >= 0.4 ? 'Developing' : 'Foundational',
      };
    }).sort(function(a, b) { return b.score - a.score; });
  };

  const getProgressions = function(ksas) {
    const config = getCareerConfig(customCareer || careerField);
    if (!config || !config.progressions) return [];
    const avg = ksas.length > 0 ? ksas.reduce(function(s, k) { return s + k.score; }, 0) / ksas.length : 50;
    return config.progressions.map(function(prog, i) {
      const match = Math.min(95, Math.max(30, avg - i * 5));
      return Object.assign({}, prog, {
        match: Math.round(match),
        readiness: match >= 80 ? 'Ready Now' : match >= 60 ? 'Developing' : 'Growth Needed'
      });
    }).sort(function(a, b) { return b.match - a.match; });
  };

  const submit = function() {
    const time = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    const missed = [];
    const qResults = [];
    const sources = new Set();
    questions.forEach(function(q, i) {
      let ok = false;
      if (q.type === 'multiple-choice') ok = answers[i] === q.correct;
      else if (q.type === 'true-false') ok = answers[i] === q.correct;
      else if (q.type === 'fill-blank') ok = answers[i] && answers[i].toLowerCase().trim() === q.correct.toLowerCase();
      else if (q.type === 'drag-drop') ok = JSON.stringify(answers[i]) === JSON.stringify(q.correct);
      qResults.push({ q: q, ans: answers[i], ok: ok });
      if (ok) correct++;
      else missed.push(q);
      if (q.source) sources.add(q.source);
    });
    const ksas = calcKSAs(qResults);
    setResults({
      correct: correct,
      total: questions.length,
      time: time,
      missed: missed,
      qResults: qResults,
      ksas: ksas,
      progressions: getProgressions(ksas),
      sources: Array.from(sources)
    });
    setScreen(5);
  };

  const retest = function() {
    const qs = generateQuestions(usedIds);
    setUsedIds(new Set([...usedIds, ...qs.map(function(q) { return q.id; })]));
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setQIndex(0);
    setFillAnswer('');
    setStartTime(Date.now());
    setResults(null);
    setScreen(4);
  };

  const reset = function() {
    setScreen(1);
    setIndustry('');
    setCustomIndustry('');
    setCareerField('');
    setCustomCareer('');
    setQuestions([]);
    setAnswers([]);
    setResults(null);
    setUsedIds(new Set());
    setShowFullReport(false);
  };

  const logout = function() {
    setUser(null);
    setLoginForm({ name: '', email: '', title: '' });
    reset();
    setScreen(0);
  };

  const styles = {
    wrap: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', color: '#f0f0f0', fontFamily: 'system-ui', padding: 20 },
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' },
    title: { fontSize: 28, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    input: { width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#f0f0f0', fontSize: 16, outline: 'none', boxSizing: 'border-box' },
    btn: { padding: '14px 28px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnP: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' },
    btnS: { background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.2)' },
    btnG: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' },
    btnO: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' },
    opt: { padding: '16px 20px', borderRadius: 12, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 },
    optDef: { background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)' },
    optSel: { background: 'rgba(99,102,241,0.2)', border: '2px solid #6366f1' },
    grid: { display: 'grid', gap: 12 },
    badge: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 12, marginBottom: 20 },
  };

  const UserHeader = function() {
    if (!user) return null;
    return (
      <div style={styles.badge}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>{user.name.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{user.title || user.email}</div>
        </div>
        <button style={Object.assign({}, styles.btn, styles.btnS, { padding: '8px 16px', fontSize: 14 })} onClick={logout}>Sign Out</button>
      </div>
    );
  };

  // Login Screen
  if (screen === 0) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 500, margin: '0 auto', paddingTop: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64 }}>🎓</div>
            <h1 style={styles.title}>QuizForge AI</h1>
            <p style={{ color: '#94a3b8' }}>Industry-Standard Professional Assessment</p>
          </div>
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Sign In</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Full Name *</label>
              <input style={styles.input} placeholder="John Smith" value={loginForm.name} onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { name: e.target.value })); }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Email *</label>
              <input style={styles.input} type="email" placeholder="john@company.com" value={loginForm.email} onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { email: e.target.value })); }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Job Title (Optional)</label>
              <input style={styles.input} placeholder="Senior Analyst" value={loginForm.title} onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { title: e.target.value })); }} />
            </div>
            <button style={Object.assign({}, styles.btn, styles.btnP, { width: '100%', justifyContent: 'center' })} onClick={handleLogin}>Continue</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>Questions from NIST, ISO, SHRM, ACFE, IIA, GARP, CSA</p>
        </div>
      </div>
    );
  }

  // Industry Selection
  if (screen === 1) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <UserHeader />
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={styles.title}>Select Assessment</h1>
            <p style={{ color: '#94a3b8' }}>Questions from industry standard organizations</p>
          </div>
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Industry</h2>
            <input style={Object.assign({}, styles.input, { marginBottom: 16 })} placeholder="Type custom industry..." value={customIndustry} onChange={function(e) { setCustomIndustry(e.target.value); setIndustry(''); setCareerField(''); setCustomCareer(''); }} />
            <div style={Object.assign({}, styles.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' })}>
              {industries.map(function(ind) {
                return (
                  <div key={ind.id} onClick={function() { setIndustry(ind.id); setCustomIndustry(''); setCareerField(''); setCustomCareer(''); }} style={{ padding: 16, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: industry === ind.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: '2px solid ' + (industry === ind.id ? '#6366f1' : 'rgba(255,255,255,0.1)') }}>
                    <span style={{ fontSize: 24 }}>{ind.icon}</span>
                    <span style={{ fontWeight: 500 }}>{ind.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {(industry || customIndustry) && (
            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Career Field</h2>
              <input style={Object.assign({}, styles.input, { marginBottom: 16 })} placeholder="Type custom career..." value={customCareer} onChange={function(e) { setCustomCareer(e.target.value); setCareerField(''); }} />
              {industry && careers[industry] && !customCareer && (
                <div style={Object.assign({}, styles.grid, { gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' })}>
                  {careers[industry].map(function(c) {
                    return (
                      <div key={c.id} onClick={function() { setCareerField(c.id); setCustomCareer(''); }} style={{ padding: 16, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: careerField === c.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: '2px solid ' + (careerField === c.id ? '#6366f1' : 'rgba(255,255,255,0.1)') }}>
                        <span style={{ fontSize: 24 }}>{c.icon}</span>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {(careerField || customCareer) && (
            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Assessment Info</h2>
              {standardsSources[careerField] && (
                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: '#818cf8', fontWeight: 600 }}>{standardsSources[careerField].org}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Standards: {standardsSources[careerField].standards.join(', ')}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Certifications: {standardsSources[careerField].certBody}</div>
                </div>
              )}
              <p style={{ color: '#94a3b8' }}>Testing: <strong style={{ color: '#818cf8' }}>{getCareerConfig(customCareer || careerField).jobFunction}</strong></p>
            </div>
          )}
          <button style={Object.assign({}, styles.btn, styles.btnP, { opacity: (careerField || customCareer) ? 1 : 0.5 })} onClick={function() { if (careerField || customCareer) setScreen(2); }}>Continue</button>
        </div>
      </div>
    );
  }

  // Configure
  if (screen === 2) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <UserHeader />
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={styles.title}>Configure Assessment</h1>
          </div>
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Questions: {questionCount}</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={function() { setQuestionCount(Math.max(5, questionCount - 1)); }}>-</button>
              <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={function() { setQuestionCount(Math.min(20, questionCount + 1)); }}>+</button>
            </div>
          </div>
          <div style={styles.card}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Question Types</h2>
            <div style={Object.assign({}, styles.grid, { gridTemplateColumns: 'repeat(2, 1fr)' })}>
              {[{ t: 'multiple-choice', n: 'Multiple Choice' }, { t: 'true-false', n: 'True/False' }, { t: 'fill-blank', n: 'Fill Blank' }, { t: 'drag-drop', n: 'Drag Drop' }].map(function(item) {
                var sel = selectedTypes.includes(item.t);
                return (
                  <div key={item.t} onClick={function() { setSelectedTypes(sel ? selectedTypes.filter(function(x) { return x !== item.t; }) : selectedTypes.concat([item.t])); }} style={{ padding: 16, borderRadius: 12, cursor: 'pointer', textAlign: 'center', background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: '2px solid ' + (sel ? '#6366f1' : 'rgba(255,255,255,0.1)') }}>{item.n}</div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={function() { setScreen(1); }}>Back</button>
            <button style={Object.assign({}, styles.btn, styles.btnP)} onClick={startQuiz}>Start</button>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (screen === 3) {
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 100 }}>
          <div style={{ width: 60, height: 60, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}></div>
          <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
          <p style={{ fontSize: 18, color: '#94a3b8' }}>Generating assessment for {user ? user.name : ''}...</p>
        </div>
      </div>
    );
  }

  // Quiz
  if (screen === 4) {
    var q = questions[qIndex];
    if (!q) return null;
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <UserHeader />
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '8px 16px', borderRadius: 50, fontSize: 14 }}>Q{qIndex + 1}/{questions.length}</span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 50, fontSize: 12, color: '#94a3b8' }}>{q.skill}</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, marginBottom: 16 }}>{q.question}</h3>
            {q.source && <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Source: {q.source}</p>}
            
            {q.type === 'multiple-choice' && q.options.map(function(opt, i) {
              return (
                <div key={i} onClick={function() { setAnswer(i); }} style={Object.assign({}, styles.opt, answers[qIndex] === i ? styles.optSel : styles.optDef)}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: answers[qIndex] === i ? '#6366f1' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{['A','B','C','D'][i]}</span>
                  <span>{opt}</span>
                </div>
              );
            })}
            
            {q.type === 'true-false' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[true, false].map(function(v) {
                  return (
                    <div key={String(v)} onClick={function() { setAnswer(v); }} style={Object.assign({}, styles.opt, { justifyContent: 'center' }, answers[qIndex] === v ? styles.optSel : styles.optDef)}>{v ? 'True' : 'False'}</div>
                  );
                })}
              </div>
            )}
            
            {q.type === 'fill-blank' && (
              <input type="text" style={Object.assign({}, styles.input, { maxWidth: 400, textAlign: 'center', margin: '0 auto', display: 'block' })} placeholder="Type answer..." value={fillAnswer} onChange={function(e) { handleFillChange(e.target.value); }} autoComplete="off" />
            )}
            
            {q.type === 'drag-drop' && (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Items:</p>
                  {q.items.map(function(item, i) {
                    if (answers[qIndex] && answers[qIndex].includes(i)) return null;
                    return (
                      <div key={i} onClick={function() { setDraggedItem(draggedItem === i ? null : i); }} style={{ padding: '12px 16px', background: draggedItem === i ? '#22c55e' : '#6366f1', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>{item}</div>
                    );
                  })}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Zones:</p>
                  {q.zones.map(function(zone, i) {
                    var f = answers[qIndex] ? answers[qIndex][i] : -1;
                    return (
                      <div key={i} onClick={function() { if (draggedItem !== null) { handleDrop(i, draggedItem); setDraggedItem(null); } }} style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '2px ' + (f >= 0 ? 'solid #6366f1' : 'dashed rgba(255,255,255,0.2)'), borderRadius: 8, marginBottom: 8, minHeight: 48, display: 'flex', alignItems: 'center', gap: 12 }}>
                        {f >= 0 && <span style={{ background: '#6366f1', padding: '4px 12px', borderRadius: 6 }}>{q.items[f]}</span>}
                        <span style={{ color: '#64748b' }}>{zone}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button style={Object.assign({}, styles.btn, styles.btnS, { visibility: qIndex > 0 ? 'visible' : 'hidden' })} onClick={function() { setQIndex(qIndex - 1); }}>Prev</button>
            {qIndex < questions.length - 1 ? (
              <button style={Object.assign({}, styles.btn, styles.btnP)} onClick={function() { setQIndex(qIndex + 1); }}>Next</button>
            ) : (
              <button style={Object.assign({}, styles.btn, styles.btnG)} onClick={submit}>Submit</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (screen === 5 && results) {
    var pct = Math.round((results.correct / results.total) * 100);
    var pass = pct >= 70;
    var careerName = getCareerName();
    var config = getCareerConfig(customCareer || careerField);
    var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var mins = Math.floor(results.time / 60);
    var secs = results.time % 60;

    // Full Report View
    if (showFullReport) {
      var avgScore = results.ksas.length > 0 ? Math.round(results.ksas.reduce(function(s, k) { return s + k.score; }, 0) / results.ksas.length) : 0;
      var topSkills = results.ksas.filter(function(k) { return k.score >= 70; });
      var gapSkills = results.ksas.filter(function(k) { return k.score < 70; });
      var expertCount = results.ksas.filter(function(k) { return k.level === 'Expert'; }).length;
      var proficientCount = results.ksas.filter(function(k) { return k.level === 'Proficient'; }).length;
      var developingCount = results.ksas.filter(function(k) { return k.level === 'Developing' || k.level === 'Foundational'; }).length;
      
      return (
        <div style={styles.wrap}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={Object.assign({}, styles.card, { textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '2px solid rgba(99,102,241,0.3)' })}>
              <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>COMPREHENSIVE CAREER ASSESSMENT REPORT</div>
              <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{user ? user.name : ''}</h1>
              {user && user.title && <p style={{ color: '#94a3b8', marginBottom: 4 }}>{user.title}</p>}
              <p style={{ color: '#64748b', fontSize: 14 }}>{user ? user.email : ''}</p>
              <div style={{ width: 100, height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', margin: '20px auto' }}></div>
              <p style={{ color: '#c4b5fd', fontSize: 18, fontWeight: 600 }}>{careerName}</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>Assessment Date: {date}</p>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>Executive Summary</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(22,163,74,0.1))', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#22c55e' }}>{pct}%</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>Overall Score</div>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#818cf8' }}>{avgScore}%</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>Avg Skill Score</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#f59e0b' }}>{results.ksas.length}</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>Skills Assessed</div>
                </div>
                <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#a78bfa' }}>{mins}:{secs < 10 ? '0' + secs : secs}</div>
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>Completion Time</div>
                </div>
              </div>
              <div style={{ background: pass ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 20, border: '1px solid ' + (pass ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{pass ? '✅' : '📈'}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: pass ? '#22c55e' : '#f59e0b' }}>{pass ? 'PROFICIENCY ACHIEVED' : 'DEVELOPMENT RECOMMENDED'}</div>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>{pass ? 'Candidate demonstrates competency in ' + careerName : 'Candidate shows potential with targeted improvement areas in ' + careerName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>Skill Distribution Analysis</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>{expertCount}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Expert Level</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>80%+ proficiency</div>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#818cf8' }}>{proficientCount}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Proficient Level</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>60-79% proficiency</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{developingCount}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>Developing Level</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Under 60% proficiency</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>KSA Analysis with Rankings</h2>
              <p style={{ color: '#94a3b8', marginBottom: 20 }}>Detailed proficiency assessment for {config ? config.jobFunction : careerName}</p>
              {results.ksas.map(function(ksa, i) {
                var barColor = ksa.score >= 80 ? '#22c55e' : ksa.score >= 60 ? '#818cf8' : '#f59e0b';
                return (
                  <div key={i} style={{ marginBottom: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#818cf8' }}>#{i + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: 16 }}>{ksa.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{ksa.correct}/{ksa.total} correct</span>
                        <span style={{ fontSize: 14, padding: '6px 14px', borderRadius: 50, background: ksa.level === 'Expert' ? 'rgba(34,197,94,0.2)' : ksa.level === 'Proficient' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)', color: ksa.level === 'Expert' ? '#22c55e' : ksa.level === 'Proficient' ? '#818cf8' : '#f59e0b', fontWeight: 600 }}>{ksa.score}% - {ksa.level}</span>
                      </div>
                    </div>
                    <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: ksa.score + '%', borderRadius: 6, background: barColor }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
              <div style={styles.card}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#22c55e' }}>Strengths</h2>
                {topSkills.length > 0 ? topSkills.map(function(skill, i) {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(34,197,94,0.05)', borderRadius: 8, marginBottom: 8 }}>
                      <span style={{ color: '#22c55e', fontSize: 18 }}>✓</span>
                      <span>{skill.name}</span>
                      <span style={{ marginLeft: 'auto', color: '#22c55e', fontWeight: 600 }}>{skill.score}%</span>
                    </div>
                  );
                }) : <p style={{ color: '#64748b' }}>Continue developing skills to identify strengths.</p>}
              </div>
              <div style={styles.card}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#f59e0b' }}>Development Areas</h2>
                {gapSkills.length > 0 ? gapSkills.map(function(skill, i) {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(245,158,11,0.05)', borderRadius: 8, marginBottom: 8 }}>
                      <span style={{ color: '#f59e0b', fontSize: 18 }}>→</span>
                      <span>{skill.name}</span>
                      <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 600 }}>{skill.score}%</span>
                    </div>
                  );
                }) : <p style={{ color: '#64748b' }}>Excellent! No significant gaps identified.</p>}
              </div>
            </div>

            {results.progressions && results.progressions.length > 0 && (
              <div style={styles.card}>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>Career Progression Readiness</h2>
                <div style={{ display: 'grid', gap: 16 }}>
                  {results.progressions.map(function(prog, i) {
                    var matchColor = prog.match >= 80 ? '#22c55e' : prog.match >= 60 ? '#818cf8' : '#f59e0b';
                    return (
                      <div key={i} style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 20 }}>
                        <span style={{ fontSize: 40 }}>{prog.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{prog.name}</div>
                          <div style={{ fontSize: 14, color: '#94a3b8' }}>{prog.desc}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: matchColor }}>{prog.match}%</div>
                          <div style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: prog.readiness === 'Ready Now' ? 'rgba(34,197,94,0.2)' : prog.readiness === 'Developing' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)', color: prog.readiness === 'Ready Now' ? '#22c55e' : prog.readiness === 'Developing' ? '#818cf8' : '#f59e0b' }}>{prog.readiness}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {results.sources && results.sources.length > 0 && (
              <div style={styles.card}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#818cf8' }}>Assessment Standards</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                  {results.sources.map(function(src, i) {
                    return <span key={i} style={{ padding: '8px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 8, fontSize: 14, color: '#818cf8' }}>{src}</span>;
                  })}
                </div>
                {standardsSources[careerField] && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 600, color: '#c4b5fd', marginBottom: 8 }}>{standardsSources[careerField].org}</div>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>Standards: {standardsSources[careerField].standards.join(', ')}</div>
                    <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Recommended Certifications: {standardsSources[careerField].certBody}</div>
                  </div>
                )}
              </div>
            )}

            <div style={styles.card}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>Detailed Question Analysis</h2>
              {results.qResults.map(function(item, i) {
                var q = item.q;
                var ok = item.ok;
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: 16, background: ok ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', borderRadius: 12, marginBottom: 12, borderLeft: '4px solid ' + (ok ? '#22c55e' : '#ef4444') }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: ok ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{ok ? '✓' : '✗'}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>{q.question}</p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                        {q.source && <span style={{ fontSize: 11, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{q.source}</span>}
                        {q.skill && <span style={{ fontSize: 11, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 4 }}>{q.skill}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: '#94a3b8', padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>{q.feedback}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.card}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#818cf8' }}>Professional Development Advisory</h2>
              
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>Overall Assessment</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                  {pass 
                    ? 'Congratulations on achieving a passing score of ' + pct + '% on your ' + careerName + ' assessment. Your results demonstrate a solid foundation in the core competencies required for this career field. Your performance indicates readiness for increased responsibilities and suggests you would benefit from pursuing advanced certifications to further validate your expertise.'
                    : 'Your score of ' + pct + '% on the ' + careerName + ' assessment indicates areas where focused development would strengthen your professional capabilities. This is a valuable baseline that identifies specific skills requiring attention. With targeted learning and practice, you can build the competencies needed to excel in this field.'}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>Skill Development Recommendations</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                  {topSkills.length > 0 
                    ? 'Your strongest areas include ' + topSkills.map(function(s) { return s.name; }).join(', ') + '. These strengths position you well for roles requiring these competencies. Consider mentoring others in these areas to reinforce your expertise while contributing to team development.'
                    : 'Focus on building foundational competencies across all skill areas. Start with the fundamentals and progressively work toward more advanced concepts.'}
                  {gapSkills.length > 0 
                    ? ' Priority development areas include ' + gapSkills.map(function(s) { return s.name; }).join(', ') + '. We recommend dedicating focused study time to these topics, seeking hands-on project experience, and considering formal training or certification programs that address these specific competencies.'
                    : ' Your balanced skill profile across all assessed areas is commendable. Continue maintaining this well-rounded expertise through ongoing professional development.'}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>Career Advancement Path</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                  Based on your assessment results, {results.progressions && results.progressions.length > 0 && results.progressions[0].match >= 70 
                    ? 'you appear ready to pursue advancement toward ' + results.progressions[0].name + ' level positions. Focus on gaining leadership experience, expanding your strategic thinking capabilities, and building cross-functional relationships that will support your career growth.'
                    : 'we recommend strengthening your current role competencies before pursuing advancement. Build a track record of successful project delivery, seek stretch assignments that develop new skills, and establish yourself as a reliable subject matter expert in your current position.'}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#c4b5fd', marginBottom: 12 }}>Next Steps</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                  {standardsSources[careerField] 
                    ? 'Consider pursuing certifications from ' + standardsSources[careerField].org + ' such as ' + standardsSources[careerField].certBody + ' to formally validate your expertise. These credentials are recognized industry-wide and can significantly enhance your professional credibility and career opportunities. Additionally, stay current with ' + standardsSources[careerField].standards.join(' and ') + ' standards through continuing education and professional community involvement.'
                    : 'Pursue relevant industry certifications to validate your expertise and enhance your professional credibility. Stay current with industry standards through continuing education, professional associations, and peer networking. Consider finding a mentor who can guide your development and provide career advice based on their experience in the field.'}
                </p>
              </div>
            </div>

            <div style={Object.assign({}, styles.card, { textAlign: 'center', background: 'rgba(255,255,255,0.02)' })}>
              <p style={{ fontSize: 14, color: '#64748b' }}>Comprehensive Career Assessment Report for <strong style={{ color: '#c4b5fd' }}>{user ? user.name : ''}</strong></p>
              <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>Generated: {date} | Assessment: {careerName}</p>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
              <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={function() { setShowFullReport(false); }}>Back to Summary</button>
              <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={reset}>New Assessment</button>
              <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      );
    }

    // Standard Results View
    return (
      <div style={styles.wrap}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={Object.assign({}, styles.card, { textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', border: '2px solid rgba(99,102,241,0.3)' })}>
            <div style={{ fontSize: 14, color: '#818cf8', fontWeight: 600, marginBottom: 8 }}>ASSESSMENT REPORT</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{user ? user.name : ''}</h2>
            {user && user.title && <p style={{ color: '#94a3b8', marginBottom: 4 }}>{user.title}</p>}
            <p style={{ color: '#64748b', fontSize: 14 }}>{user ? user.email : ''}</p>
            <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', margin: '20px auto' }}></div>
            <p style={{ color: '#94a3b8' }}>{careerName} Assessment</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Completed: {date}</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 72, fontWeight: 700, background: pass ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pct}%</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: pass ? '#22c55e' : '#f59e0b' }}>{pass ? 'PASSED' : 'DEVELOPING'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{results.correct}</div><div style={{ fontSize: 12, color: '#64748b' }}>Correct</div></div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{results.total - results.correct}</div><div style={{ fontSize: 12, color: '#64748b' }}>Incorrect</div></div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>{results.total}</div><div style={{ fontSize: 12, color: '#64748b' }}>Total</div></div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, textAlign: 'center' }}><div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>{mins}:{secs < 10 ? '0' + secs : secs}</div><div style={{ fontSize: 12, color: '#64748b' }}>Time</div></div>
          </div>

          <div style={styles.card}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Skills Assessment</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>Proficiency in {config ? config.jobFunction : ''}</p>
            {results.ksas.map(function(ksa, i) {
              return (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{ksa.name} <span style={{ fontSize: 12, color: '#64748b' }}>({ksa.correct}/{ksa.total})</span></span>
                    <span style={{ fontSize: 14, padding: '4px 12px', borderRadius: 50, background: ksa.level === 'Expert' ? 'rgba(34,197,94,0.2)' : ksa.level === 'Proficient' ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)', color: ksa.level === 'Expert' ? '#22c55e' : ksa.level === 'Proficient' ? '#818cf8' : '#f59e0b' }}>{ksa.level}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: ksa.score + '%', borderRadius: 4, background: ksa.score >= 80 ? '#22c55e' : ksa.score >= 60 ? '#818cf8' : '#f59e0b' }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {results.progressions && results.progressions.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Career Progression</h3>
              {results.progressions.map(function(prog, i) {
                return (
                  <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 32 }}>{prog.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{prog.name}</div>
                      <div style={{ fontSize: 14, color: '#64748b' }}>{prog.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: prog.match >= 80 ? '#22c55e' : prog.match >= 60 ? '#818cf8' : '#f59e0b' }}>{prog.match}%</div>
                      <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: prog.readiness === 'Ready Now' ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)', color: prog.readiness === 'Ready Now' ? '#22c55e' : '#818cf8' }}>{prog.readiness}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={Object.assign({}, styles.btn, styles.btnR)} onClick={function() { setShowFullReport(true); }}>Generate Full Report</button>
            <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={reset}>New Assessment</button>
            {results.missed.length > 0 && <button style={Object.assign({}, styles.btn, styles.btnP)} onClick={retest}>Retest</button>}
            <button style={Object.assign({}, styles.btn, styles.btnS)} onClick={logout}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
