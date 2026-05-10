/* ============================================================
   PARIYA ACADEMY — CORE SYSTEM (core.js)
   Fixed to match exact Google Sheet CSV structure:

   Columns: Name, Class Category, Class Type, Class Section,
   Admission No, Gender, Term, Session, Resumption Date,
   Total Term Days, Days Present, Days Absent,
   then subject scores:
     Primary/Nursery: SubjectName _CA1, SubjectName _CA2, SubjectName _Exams
     JSS/SS:          SubjectName _CA1, SubjectName _CA2, SubjectName _CA3, SubjectName _Exams

   Subject name extraction:
     "English Language _CA1" → "English Language"
     "Mathematics_CA1"       → "Mathematics"
   Split on " _CA" / "_CA" / " _Exams" / "_Exams"
   ============================================================ */

/* ── Session Storage ── */
const SS = (function(){
  let mem = {};
  function can(){ try{ return !!window.sessionStorage; }catch(e){ return false; } }
  const ok = can();
  return {
    get(k){ try{ return ok ? JSON.parse(sessionStorage.getItem(k)) : mem[k]||null; }catch(e){ return mem[k]||null; } },
    set(k,v){ try{ if(ok) sessionStorage.setItem(k,JSON.stringify(v)); else mem[k]=v; }catch(e){ mem[k]=v; } },
    remove(k){ try{ if(ok) sessionStorage.removeItem(k); else delete mem[k]; }catch(e){ delete mem[k]; } }
  };
})();

/* ── Local Storage ── */
const LS = (function(){
  let mem = {};
  function can(){ try{ return !!window.localStorage; }catch(e){ return false; } }
  const ok = can();
  return {
    get(k){ try{ return ok ? JSON.parse(localStorage.getItem(k)) : mem[k]||null; }catch(e){ return mem[k]||null; } },
    set(k,v){ try{ if(ok) localStorage.setItem(k,JSON.stringify(v)); else mem[k]=v; }catch(e){ mem[k]=v; } },
    remove(k){ try{ if(ok) localStorage.removeItem(k); else delete mem[k]; }catch(e){ delete mem[k]; } }
  };
})();

/* ── Default App Config ── */
const DEFAULT_CONFIG = {
  schoolName:       "Pariya Academy For Modern Science and Quran",
  motto:            "Do not be sad",
  address:          "Near PHCC Pariya & Pariya Main Football Field",
  primaryWebsite:   "https://pariyaacademy-primary-portal.netlify.app",
  secondaryWebsite: "https://pariyaacademy-secondary-portal.netlify.app",
  session:          "2025/2026",
  resumption:       "5 May. 2026",
  schoolLogo:       "",
  jibwisLogo:       "",
  principalName:    "Abubakar Bello",
  principalSig:     "",
  formMasterName:   "Arabo Modibbo",
  formMasterSig:    ""
};
function getConfig(){ return Object.assign({}, DEFAULT_CONFIG, LS.get('pa_config')||{}); }
function saveConfig(cfg){ LS.set('pa_config', cfg); }

/* ── Authentication ── */
const AUTH = {
  ADMIN_PASSWORD: "Admin@2017",
  SECTION_PASSWORDS: {
    nursery: "Nursery@2026",
    primary: "Primary@2026",
    jss:     "JSS@2026",
    ss:      "SS@2026"
  },
  CLASS_PASSWORDS: {
    "nursery 1":"NUR1@2025","nursery 2":"NUR2@2025","nursery 3":"NUR3@2025",
    "primary 1":"PRI1@2025","primary 1a":"PRI1A@2025",
    "primary 2":"PRI2@2025","primary 2a":"PRI2A@2025",
    "primary 3":"PRI3@2025","primary 3a":"PRI3A@2025",
    "primary 4":"PRI4@2025","primary 4a":"PRI4A@2025",
    "primary 5":"PRI5@2025","primary 5a":"PRI5A@2025",
    "primary 6":"PRI6@2025","primary 6a":"PRI6A@2025",
    "jss 1":"JSS1@2025","jss 1a":"JSS1A@2025",
    "jss 2":"JSS2@2025","jss 2a":"JSS2A@2025",
    "jss 3":"JSS3@2025","jss 3a":"JSS3A@2025",
    "ss 1":"SS1@2025","ss 1 science":"SS1S@2025","ss 1 arts":"SS1A@2025",
    "ss 2":"SS2@2025","ss 2 science":"SS2S@2025","ss 2 arts":"SS2A@2025",
    "ss 3":"SS3@2025","ss 3 science":"SS3S@2025","ss 3 arts":"SS3A@2025"
  },
  loginAdmin(pw){ return pw === this.ADMIN_PASSWORD; },
  loginSection(sec, pw){ return this.SECTION_PASSWORDS[sec.toLowerCase()] === pw; },
  loginStudent(admNo, classKey, pw){
    const cp = this.CLASS_PASSWORDS[classKey.toLowerCase()];
    return cp && cp === pw;
  },
  setSession(role, data){ SS.set('pa_session', { role, data, ts: Date.now() }); },
  getSession(){ return SS.get('pa_session'); },
  logout(){ SS.remove('pa_session'); },
  requireRole(role, redirectTo='../index.html'){
    const s = this.getSession();
    if(!s || s.role !== role){ window.location.href = redirectTo; return false; }
    return s;
  }
};

/* ── Class Store ── */
const CLASSES_KEY = 'pa_classes';
function getClasses(){ return LS.get(CLASSES_KEY) || []; }
function saveClasses(arr){ LS.set(CLASSES_KEY, arr); }
function getClass(id){ return getClasses().find(c => c.id === id) || null; }
function upsertClass(cls){
  const all = getClasses();
  const idx = all.findIndex(c => c.id === cls.id);
  if(idx >= 0) all[idx] = cls; else all.push(cls);
  saveClasses(all);
}
function deleteClass(id){ saveClasses(getClasses().filter(c => c.id !== id)); }

function seedDefaultClasses(){
  if(getClasses().length > 0) return;
  saveClasses([
    {id:'nursery-1', name:'Nursery 1', category:'nursery', section:'nursery', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUCzyVQz4AYsS-PmAUZDqUj2LvbUMRpdBZk-4UDfza195CzsBxp0O-oWGWYYKUPw/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'nursery-2', name:'Nursery 2', category:'nursery', section:'nursery', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vTDpALxlxwfkZuIdQwVskW4RMaiHlEPCnuS9zZ8fQpI-3QDId5Qbv6-6E9qmgKT3A/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-1', name:'Primary 1', category:'primary', section:'primary', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vT49ltNlKXgCs5-OlwP8vaoObY4O01AyHjHxdkvbROJDX58yEQd2xjxb7AeY8OHJw/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-2', name:'Primary 2', category:'primary', section:'primary', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5IZ6Qd7Wtb-_j5fafsYfWkAkbacW8exrMiQqG2ABwMOlBK4WrNR8PnuCNyVvXZQ/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-3', name:'Primary 3', category:'primary', section:'primary', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7MfaLhkJMks6l25Ys4n_XohaxuBpH_0VS0O4CYPU1qj7CG27L1pQ2yPDu_QBVZw/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-4', name:'Primary 4', category:'primary', section:'primary', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXCANqaiReTcJoq3R1DT9V7KYTGxNirO9TRQX3psMLe2Jrwt4QbGrfdMoRqIQTvw/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-5', name:'Primary 5', category:'primary', section:'primary', term1:'',term2:'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPyVp5PrHjKQjvqt0RaUNrfkOSWsXlaC4H6Edt1JG12ps6_YunlO-gz9ONLnqUfQ/pub?gid=621314920&single=true&output=csv',term3:''},
    {id:'primary-6', name:'Primary 6', category:'primary', section:'primary', term1:'',term2:'',term3:''},
    {id:'jss-1', name:'JSS 1', category:'jss', section:'jss', term1:'',term2:'',term3:''},
    {id:'jss-2', name:'JSS 2', category:'jss', section:'jss', term1:'',term2:'',term3:''},
    {id:'jss-3', name:'JSS 3', category:'jss', section:'jss', term1:'',term2:'',term3:''},
    {id:'ss-1',  name:'SS 1',  category:'ss',  section:'ss',  term1:'',term2:'',term3:''},
    {id:'ss-2',  name:'SS 2',  category:'ss',  section:'ss',  term1:'',term2:'',term3:''},
    {id:'ss-3',  name:'SS 3',  category:'ss',  section:'ss',  term1:'',term2:'',term3:''},
  ]);
}

/* ════════════════════════════════════════════════════════
   CSV FETCH
════════════════════════════════════════════════════════ */
async function fetchCSV(url){
  const csvUrl = toCSVExportUrl(url);
  const sep = csvUrl.includes('?') ? '&' : '?';
  const resp = await fetch(csvUrl + sep + 't=' + Date.now());
  if(!resp.ok) throw new Error(
    `Could not fetch CSV (HTTP ${resp.status}). ` +
    `Ensure the Google Sheet is published: File → Share → Publish to web → CSV.`
  );
  return resp.text();
}

function toCSVExportUrl(url){
  if(!url) return url;
  if(url.includes('output=csv') || url.endsWith('.csv')) return url;
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if(m){
    const gid = url.match(/[#&]gid=(\d+)/);
    const base = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`;
    return gid ? `${base}&gid=${gid[1]}` : base;
  }
  return url;
}

/* ════════════════════════════════════════════════════════
   CSV PARSE
   Handles:
   • Quoted fields with commas inside
   • Windows CRLF line endings
   • Numeric score fields stored as strings
   • Rows without a Name are skipped
════════════════════════════════════════════════════════ */
function parseCSV(csv){
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if(lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  const records = [];
  for(let i = 1; i < lines.length; i++){
    const vals = splitCSVLine(lines[i]);
    if(!vals.length) continue;
    const obj = {};
    headers.forEach((h, idx) => {
      const raw = (vals[idx] || '').trim().replace(/^"|"$/g, '');
      obj[h] = isScoreColumn(h) ? (parseFloat(raw) || 0) : raw;
    });
    if(obj['Name'] && obj['Name'].length > 0 &&
       obj['Class Category'] && obj['Class Type']){
      records.push(obj);
    }
  }
  return records;
}

/* Score column detector — matches both spacing styles:
   "English Language _CA1"  "Mathematics_CA1"
   "English Language _CA2"  "Mathematics_CA2"
   "English Language _CA3"  "Mathematics_CA3"
   "English Language _Exams" "Mathematics_Exams"          */
function isScoreColumn(h){
  return /\s?_CA[123]$/.test(h) || /\s?_Exams$/.test(h);
}

function splitCSVLine(line){
  const result = []; let cur = '', inQ = false;
  for(let i = 0; i < line.length; i++){
    const ch = line[i];
    if(ch === '"'){ inQ = !inQ; }
    else if(ch === ',' && !inQ){ result.push(cur); cur = ''; }
    else cur += ch;
  }
  result.push(cur);
  return result;
}

/* ════════════════════════════════════════════════════════
   SUBJECT DETECTION
   Extracts unique subject names from column headers.
   Strips the score suffix including optional leading space.
   "English Language _CA1" → "English Language"
   "Mathematics_CA1"       → "Mathematics"
   "Basic Science _Exams"  → "Basic Science"
════════════════════════════════════════════════════════ */
function detectSubjects(records){
  if(!records || !records.length) return [];
  const seen = new Set();
  const subjects = [];
  Object.keys(records[0]).forEach(h => {
    if(!isScoreColumn(h)) return;
    // Remove trailing score type; keep everything before " _CA" or "_CA" or " _Exams" or "_Exams"
    const name = h
      .replace(/\s?_CA[123]$/, '')
      .replace(/\s?_Exams$/, '')
      .trim();
    if(name && !seen.has(name)){ seen.add(name); subjects.push(name); }
  });
  return subjects;
}

/* ════════════════════════════════════════════════════════
   SCORE LOOKUP
   Tries both spacing variants to find the column value.
   "English Language" + "CA1" →
     tries "English Language _CA1" then "English Language_CA1"
   "Mathematics" + "CA1" →
     tries "Mathematics _CA1" then "Mathematics_CA1"
════════════════════════════════════════════════════════ */
function getScore(record, subjectName, scoreType){
  const candidates = [
    `${subjectName} _${scoreType}`,  // e.g. "English Language _CA1"
    `${subjectName}_${scoreType}`    // e.g. "Mathematics_CA1"
  ];
  for(const key of candidates){
    if(Object.prototype.hasOwnProperty.call(record, key)){
      return parseFloat(record[key]) || 0;
    }
  }
  return 0;
}

/* ════════════════════════════════════════════════════════
   SCORING MODES
   Primary / Nursery : CA1(20) + CA2(20) + Exams(60) = 100
   JSS / SS          : CA1(10) + CA2(10) + CA3(10) + Exams(70) = 100
════════════════════════════════════════════════════════ */
function getScoringMode(category){
  const c = (category || '').toLowerCase();
  const isSecondary = c.includes('junior') || c.includes('senior') ||
                      c.includes('jss')    || c.includes('ss');
  if(isSecondary) return { s1:10, s2:10, s3:10, exam:70, total:100, isJssSs:true };
  return { s1:20, s2:20, s3:0, exam:60, total:100, isJssSs:false };
}

/* ════════════════════════════════════════════════════════
   GRADING
════════════════════════════════════════════════════════ */
function calculateGrade(score){
  if(score === undefined || score === null || score === '') return '';
  score = parseFloat(score);
  if(isNaN(score)) return '';
  if(score >= 70) return 'A';
  if(score >= 60) return 'B';
  if(score >= 50) return 'C';
  if(score >= 45) return 'D';
  if(score >= 40) return 'E';
  return 'F';
}
function gradeRemark(g){
  return {A:'Excellent',B:'Very Good',C:'Good',D:'Fair',E:'Pass',F:'Fail'}[g] || '';
}
function getRemark(avg){
  avg = parseFloat(avg);
  if(avg >= 70) return "Excellent result, keep the flag flying!";
  if(avg >= 60) return "Very good performance, aim even higher!";
  if(avg >= 50) return "Good effort, you can still improve.";
  if(avg >= 45) return "Needs improvement, keep trying.";
  if(avg >= 40) return "Can do better with guidance and determination.";
  return "A disappointing result, but not the end. You can still turn things around.";
}

function displayScore(value){
  return (value === 0 || value === '' || value === undefined || value === null)
    ? '<span style="border-bottom:1px dashed #000;display:inline-block;width:18px">&nbsp;</span>'
    : value;
}
function getCardCategoryClass(category){
  const c = (category || '').toLowerCase();
  if(c.includes('nursery'))                    return 'category-nursery';
  if(c.includes('junior') || c.includes('jss')) return 'category-jss';
  if(c.includes('senior') || c.includes('ss')) return 'category-ss';
  return 'category-primary';
}
function escapeHtml(s){
  if(s === undefined || s === null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ════════════════════════════════════════════════════════
   PROCESS STUDENTS
════════════════════════════════════════════════════════ */
function processStudents(rawRecords, term, session, resumption){
  const subjects = detectSubjects(rawRecords);
  const groups = {};

  const processed = rawRecords.map((stu, idx) => {
    const category = stu['Class Category'] || 'Primary';
    const mode     = getScoringMode(category);
    let totalMarks = 0, subjectCount = 0;
    const processedSubjects = [];

    subjects.forEach(sub => {
      const s1   = getScore(stu, sub, 'CA1');
      const s2   = getScore(stu, sub, 'CA2');
      const s3   = mode.isJssSs ? getScore(stu, sub, 'CA3') : 0;
      const exam = getScore(stu, sub, 'Exams');   // ← "Exams" (with S)
      const total = s1 + s2 + s3 + exam;
      const isAbsent = (s1 === 0 && s2 === 0 && s3 === 0 && exam === 0);
      const grade = isAbsent ? '' : calculateGrade(total);

      if(!isAbsent){ totalMarks += total; subjectCount++; }

      processedSubjects.push({
        no: processedSubjects.length + 1,
        subj: sub, s1, s2, s3, exam, total,
        grade, remark: isAbsent ? 'ABSENT' : gradeRemark(grade)
      });
    });

    const avg = subjectCount ? +(totalMarks / subjectCount).toFixed(2) : 0;

    const studentData = {
      ...stu, category, scoringMode: mode,
      classType:    stu['Class Type']      || 'N/A',
      classSection: stu['Class Section']   || '',
      term:         stu['Term']            || term        || 'First Term',
      daysTerm:     stu['Total Term Days'] || 0,
      daysPresent:  stu['Days Present']    || 0,
      daysAbsent:   stu['Days Absent']     || 0,
      session:      stu['Session']         || session     || '2025/2026',
      resumption:   stu['Resumption Date'] || resumption  || '',
      subjects: processedSubjects,
      totalMarks, avg,
      grade: calculateGrade(avg),
      teacherRemark: getRemark(avg),
      _idx: idx
    };

    const key = `${studentData.classType}||${studentData.classSection}`;
    if(!groups[key]) groups[key] = [];
    groups[key].push(studentData);
    return studentData;
  });

  // Rank per class group (tie-aware)
  for(const key in groups){
    groups[key].sort((a, b) => b.avg - a.avg);
    let prevAvg = null, prevPos = null;
    groups[key].forEach((stu, i) => {
      if(i === 0){ stu._pos = 1; prevAvg = stu.avg; prevPos = 1; }
      else if(stu.avg === prevAvg){ stu._pos = prevPos; }
      else{ stu._pos = i + 1; prevAvg = stu.avg; prevPos = stu._pos; }
    });
  }
  return { processed, groups };
}

/* ════════════════════════════════════════════════════════
   ANNUAL SUMMARY (3rd Term, all 3 terms present)
════════════════════════════════════════════════════════ */
function computeAnnualSummary(term1Students, term2Students, term3Students){
  const byAdm = {};
  const addTerm = (students, termKey) => {
    if(!students) return;
    students.forEach(s => {
      const adm = s['Admission No'] || s['Name'];
      if(!byAdm[adm]) byAdm[adm] = {
        adm, name: s['Name'], classType: s.classType,
        classSection: s.classSection, category: s.category
      };
      byAdm[adm][termKey] = { total: s.totalMarks, avg: s.avg, grade: s.grade, pos: s._pos };
    });
  };
  addTerm(term1Students, 't1');
  addTerm(term2Students, 't2');
  addTerm(term3Students, 't3');

  const summaries = Object.values(byAdm).map(s => {
    const t1 = s.t1 || { total:0, avg:0, grade:'', pos:'-' };
    const t2 = s.t2 || { total:0, avg:0, grade:'', pos:'-' };
    const t3 = s.t3 || { total:0, avg:0, grade:'', pos:'-' };
    const overallTotal = +(t1.total + t2.total + t3.total).toFixed(2);
    const overallAvg   = +((t1.avg + t2.avg + t3.avg) / 3).toFixed(2);
    return { ...s, t1, t2, t3, overallTotal, overallAvg,
             overallGrade: calculateGrade(overallAvg), overallPos: null };
  });

  // Overall position per class group
  const groups = {};
  summaries.forEach(s => {
    const k = `${s.classType}||${s.classSection}`;
    if(!groups[k]) groups[k] = [];
    groups[k].push(s);
  });
  for(const k in groups){
    groups[k].sort((a, b) => b.overallAvg - a.overallAvg);
    let prevAvg = null, prevPos = null;
    groups[k].forEach((s, i) => {
      if(i === 0){ s.overallPos = 1; prevAvg = s.overallAvg; prevPos = 1; }
      else if(s.overallAvg === prevAvg){ s.overallPos = prevPos; }
      else{ s.overallPos = i + 1; prevAvg = s.overallAvg; prevPos = s.overallPos; }
    });
  }
  return summaries;
}

/* ════════════════════════════════════════════════════════
   REPORT CARD RENDERER
════════════════════════════════════════════════════════ */
function renderReportCard(stu, totalInClass, config, annualSummaryMap, termMode){
  const cfg     = config || getConfig();
  const catClass = getCardCategoryClass(stu.category);
  const mode    = stu.scoringMode;
  const isSecondary = mode.isJssSs;
  const s3Head  = isSecondary ? `<th>3rd CA (${mode.s3})</th>` : '';

  const subjRows = stu.subjects.map(s => `
    <tr>
      <td>${s.no}</td>
      <td style="text-align:left">${escapeHtml(s.subj)}</td>
      <td>${displayScore(s.s1)}</td>
      <td>${displayScore(s.s2)}</td>
      ${isSecondary ? `<td>${displayScore(s.s3)}</td>` : ''}
      <td>${displayScore(s.exam)}</td>
      <td>${s.total || ''}</td>
      <td>${escapeHtml(s.grade)}</td>
      <td>${escapeHtml(s.remark)}</td>
    </tr>`).join('');

  const gradingHtml = `
    <table>
      <thead><tr><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr></thead>
      <tbody><tr><td>70–100</td><td>60–69</td><td>50–59</td><td>45–49</td><td>40–44</td><td>0–39</td></tr></tbody>
    </table>`;

  // Determine lower section
  let lowerSection;
  if(termMode === 'third-full' && annualSummaryMap){
    const summary = annualSummaryMap[stu['Admission No'] || stu['Name']];
    lowerSection = summary ? annualSummaryHtml(summary) : normalLowerSection(stu, totalInClass, gradingHtml);
  } else {
    lowerSection = normalLowerSection(stu, totalInClass, gradingHtml);
  }

  const schoolLogoHtml = cfg.schoolLogo
    ? `<img src="${escapeHtml(cfg.schoolLogo)}" class="school-logo-img" onerror="this.style.display='none'">`
    : `<div style="width:86px;height:86px;border-radius:10px;border:2px dashed rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.25);font-size:10px;text-align:center">School<br>Logo</div>`;
  const jibwisLogoHtml = cfg.jibwisLogo
    ? `<img src="${escapeHtml(cfg.jibwisLogo)}" class="school-logo-img" onerror="this.style.display='none'">`
    : `<div style="width:86px;height:86px;border-radius:10px;border:2px dashed rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.25);font-size:10px;text-align:center">Jibwis<br>Logo</div>`;
  const principalSigHtml  = cfg.principalSig
    ? `<img src="${escapeHtml(cfg.principalSig)}"  alt="Principal Signature"  style="max-height:36px;object-fit:contain;margin-bottom:-4px">` : '';
  const formMasterSigHtml = cfg.formMasterSig
    ? `<img src="${escapeHtml(cfg.formMasterSig)}" alt="Form Master Signature" style="max-height:36px;object-fit:contain;margin-bottom:-4px">` : '';

  const catLower   = (stu.category || '').toLowerCase();
  const websiteUrl = (catLower.includes('nursery') || catLower.includes('primary'))
    ? cfg.primaryWebsite : cfg.secondaryWebsite;

  return `
  <div class="card ${catClass}" data-adm="${escapeHtml(stu['Admission No']||'')}">
    <div class="card-top">
      <div class="logo-container">${schoolLogoHtml}</div>
      <div class="school-title">
        <h2>${escapeHtml(cfg.schoolName)}</h2>
        <p><strong style="color:var(--accent)">Motto:</strong> ${escapeHtml(cfg.motto)}</p>
        <p class="muted"><strong style="color:var(--accent)">Address:</strong> ${escapeHtml(cfg.address)}</p>
        <div class="contact-info"><strong>Website:</strong>
          <a href="${escapeHtml(websiteUrl)}" target="_blank" style="color:inherit;text-decoration:none">${escapeHtml(websiteUrl)}</a>
        </div>
      </div>
      <div class="logo-container">${jibwisLogoHtml}</div>
    </div>
    <hr class="info-separator">
    <div class="student-header">
      <span class="name-block"><strong>Student:</strong> ${escapeHtml(stu['Name'])}</span>
      <span class="report-term">${escapeHtml(stu.term).toUpperCase()} REPORT CARD</span>
      <span class="session-info">Session: ${escapeHtml(stu.session)}</span>
    </div>
    <table class="info-table">
      <tr>
        <td><strong>Admission No:</strong> <span class="data">${escapeHtml(stu['Admission No']||'—')}</span></td>
        <td><strong>Term:</strong>          <span class="data">${escapeHtml(stu.term)}</span></td>
        <td><strong>Term Days:</strong>     <span class="data">${escapeHtml(String(stu.daysTerm))}</span></td>
      </tr>
      <tr>
        <td><strong>Gender:</strong>        <span class="data">${escapeHtml(stu['Gender']||'—')}</span></td>
        <td><strong>No. in Class:</strong>  <span class="data">${totalInClass}</span></td>
        <td><strong>Days Present:</strong>  <span class="data">${escapeHtml(String(stu.daysPresent))}</span></td>
      </tr>
      <tr>
        <td><strong>Class:</strong>         <span class="data">${escapeHtml(stu.classType)}${stu.classSection?' ('+escapeHtml(stu.classSection)+')':''}</span></td>
        <td><strong>Resumption:</strong>    <span class="data">${escapeHtml(stu.resumption)}</span></td>
        <td><strong>Days Absent:</strong>   <span class="data">${escapeHtml(String(stu.daysAbsent))}</span></td>
      </tr>
    </table>
    <div class="card-subjects">
      <table>
        <thead>
          <tr>
            <th>No</th><th style="text-align:left">Subject</th>
            <th>1st CA (${mode.s1})</th><th>2nd CA (${mode.s2})</th>
            ${s3Head}
            <th>Exam (${mode.exam})</th>
            <th>Total</th><th>Grade</th><th>Remark</th>
          </tr>
        </thead>
        <tbody>${subjRows}</tbody>
      </table>
    </div>
    ${lowerSection}
    <div class="remarks"><strong>Teacher's Remark:</strong> ${escapeHtml(stu.teacherRemark)}</div>
    <div class="bottom-row">
      <div class="signature-block">
        ${principalSigHtml}
        <div class="sig-line"></div>
        <div style="font-weight:900;text-align:center;font-size:12px">${escapeHtml(cfg.principalName||'Principal Name')}</div>
        <div class="sig-caption">Principal / Headmaster</div>
      </div>
      <div class="qr-wrap" style="display:flex;flex-direction:column;align-items:center;gap:2px">
        <div id="qr-${escapeHtml(stu['Admission No']||String(stu._idx))}" class="qr-code-container"></div>
        <div style="font-size:9px;font-weight:800;color:var(--muted);margin-top:2px">VERIFY REPORT</div>
        <button class="btn small" onclick="downloadSingleCard(this)" style="padding:4px 8px;font-size:10px">📥 Download</button>
      </div>
      <div class="signature-block">
        ${formMasterSigHtml}
        <div class="sig-line"></div>
        <div style="font-weight:900;text-align:center;font-size:12px">${escapeHtml(cfg.formMasterName||'Form Master')}</div>
        <div class="sig-caption">Form Master / Class Teacher</div>
      </div>
    </div>
  </div>`;
}

function annualSummaryHtml(summary){
  return `
    <div class="lower-row annual-summary-wrap">
      <table class="annual-summary-table">
        <caption><strong>Annual Academic Performance Summary</strong></caption>
        <thead><tr><th>Term</th><th>Total</th><th>Average</th><th>Grade</th><th>Position</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>First Term</strong></td>
            <td>${escapeHtml(String(summary.t1.total))}</td>
            <td>${escapeHtml(String(summary.t1.avg))}</td>
            <td>${escapeHtml(summary.t1.grade)}</td>
            <td>${escapeHtml(String(summary.t1.pos))}</td>
          </tr>
          <tr>
            <td><strong>Second Term</strong></td>
            <td>${escapeHtml(String(summary.t2.total))}</td>
            <td>${escapeHtml(String(summary.t2.avg))}</td>
            <td>${escapeHtml(summary.t2.grade)}</td>
            <td>${escapeHtml(String(summary.t2.pos))}</td>
          </tr>
          <tr>
            <td><strong>Third Term</strong></td>
            <td>${escapeHtml(String(summary.t3.total))}</td>
            <td>${escapeHtml(String(summary.t3.avg))}</td>
            <td>${escapeHtml(summary.t3.grade)}</td>
            <td>${escapeHtml(String(summary.t3.pos))}</td>
          </tr>
          <tr style="background:var(--primary);color:#fff">
            <td><strong>Overall</strong></td>
            <td><strong>${escapeHtml(String(summary.overallTotal))}</strong></td>
            <td><strong>${escapeHtml(String(summary.overallAvg))}</strong></td>
            <td><strong>${escapeHtml(summary.overallGrade)}</strong></td>
            <td><strong>${escapeHtml(String(summary.overallPos))}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>`;
}

function normalLowerSection(stu, totalInClass, gradingHtml){
  return `
    <div class="lower-row">
      <div class="grading-box">${gradingHtml}</div>
      <div class="total-summary">
        <table>
          <thead><tr><th>Total Marks</th><th>Average</th><th>Grade</th><th>Position</th></tr></thead>
          <tbody>
            <tr>
              <td>${escapeHtml(stu.totalMarks.toFixed(2))}</td>
              <td>${escapeHtml(String(stu.avg))}</td>
              <td>${escapeHtml(stu.grade)}</td>
              <td><span class="pos-plain">${escapeHtml(String(stu._pos))} / ${totalInClass}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════
   QR CODE GENERATOR
════════════════════════════════════════════════════════ */
function generateQRCodes(processedStudents, config){
  const cfg = config || getConfig();
  processedStudents.forEach(stu => {
    const qrId = `qr-${stu['Admission No'] || stu._idx}`;
    const el = document.getElementById(qrId);
    if(!el || typeof QRCode === 'undefined') return;
    el.innerHTML = '';
    const text = [
      `SCHOOL: ${cfg.schoolName}`,
      `STUDENT: ${stu['Name']}`,
      `ADM NO: ${stu['Admission No'] || '—'}`,
      `CLASS: ${stu.classType}`,
      `TERM: ${stu.term}`,
      `TOTAL: ${stu.totalMarks}`,
      `AVERAGE: ${stu.avg}%`,
      `POSITION: ${stu._pos}`,
      `DATE: ${new Date().toLocaleDateString()}`
    ].join('\n');
    new QRCode(el, { text, width:100, height:100, colorDark:'#000', colorLight:'#fff', correctLevel: QRCode.CorrectLevel.M });
  });
}

/* ════════════════════════════════════════════════════════
   PDF DOWNLOAD
════════════════════════════════════════════════════════ */
function downloadSingleCard(buttonEl){
  const card = buttonEl.closest('.card');
  if(!card) return;
  const admEl = card.querySelector('.info-table tr:nth-child(1) td:nth-child(1) .data');
  const admNo = admEl ? admEl.textContent.trim() : 'REPORT';
  const nameEl = card.querySelector('.student-header .name-block');
  const name = nameEl ? nameEl.textContent.replace('Student:','').trim() : '';
  const cleanName = name.split(/\s+/).slice(0,2).join('_').replace(/[^a-z0-9]/gi,'').toUpperCase();
  const filename = `${admNo.replace(/[^a-z0-9]/gi,'_')}_${cleanName}.pdf`;
  buttonEl.style.visibility = 'hidden';
  html2pdf().set({
    margin: 10, filename,
    image: { type:'jpeg', quality:0.98 },
    html2canvas: { scale:2, useCORS:true, logging:false },
    jsPDF: { unit:'mm', format:'a4', orientation:'portrait' }
  }).from(card).save().then(() => { buttonEl.style.visibility = 'visible'; });
}
window.downloadSingleCard = downloadSingleCard;
