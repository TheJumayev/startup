import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavbarModern from "./navbar/index";
import SidebarModern from "./sidebar/index";
import routesModern, { detailRoutes } from "../../routes/superadmin";

// ============================================
// STATISTIKA HOOK (100 TA O'QUVCHI)
// ============================================
function useRealStatistics() {
  const [stats, setStats] = React.useState({
    loading: true,
    students: { total: 0, high: [], medium: [], low: [] },
    teachers: { total: 0, active: 0 },
    subjects: { total: 0, popular: [] },
    groups: { total: 0, active: 0 },
    attendance: { today: 0, week: 0, month: 0 },
    performance: { average: 0, highest: 0, lowest: 0 },
    revenue: { total: 0, monthly: [] },
    activities: [],
    recommendations: []
  });

  React.useEffect(() => {
    const generateRealisticData = () => {
      // 100 TA O'QUVCHI
      const students_total = 100;
      const high_count = 35;
      const medium_count = 40;
      const low_count = 25;
      
      const subjects_list = [
        { name: "Informatika", students: 28, avgScore: 78.5, trend: "+8.2%" },
        { name: "Matematika", students: 25, avgScore: 72.3, trend: "+5.1%" },
        { name: "Dasturlash", students: 20, avgScore: 81.2, trend: "+12.4%" },
        { name: "Fizika", students: 15, avgScore: 68.7, trend: "+3.2%" },
        { name: "Ingliz tili", students: 12, avgScore: 74.6, trend: "+6.8%" }
      ];
      
      const monthly_revenue = [12450, 13890, 15670, 18234, 20123, 22345];
      
      const activities = [
        { action: "Yangi talaba qo'shildi", user: "Admin", time: "2 daqiqa oldin", icon: "🎓", priority: "high" },
        { action: "Dars jadvali yangilandi", user: "Sherzod Akbarov", time: "15 daqiqa oldin", icon: "📅", priority: "medium" },
        { action: "Test natijalari yuklandi", user: "Ali Valiyev", time: "1 soat oldin", icon: "📊", priority: "high" },
        { action: "Yangi kurs ochildi", user: "Zarina Karimova", time: "3 soat oldin", icon: "📚", priority: "medium" },
        { action: "To'lov amalga oshirildi", user: "Bobur Rashidov", time: "5 soat oldin", icon: "💰", priority: "high" }
      ];
      
      // 100 TA O'QUVCHI UCHUN ISMLAR
      const names = [
        "Ali Valiyev", "Zarina Karimova", "Sherzod Akbarov", "Nilufar Tosheva", "Bobur Rashidov",
        "Malika Yusupova", "Jasur Mirzayev", "Dilorom Nazarova", "Otabek Xasanov", "Feruza Ergasheva",
        "Sarvar Qodirov", "Nargiza Holiqova", "Ulugbek Mahmudov", "Shahnoza Umarova", "Kamol Tursunov",
        "Sevinch Abdullayeva", "Diyor Rahmonov", "Madina Saidova", "Javohir Karimov", "Lobar To'rayeva",
        "Azizbek Rahimov", "Gulnoza Saidova", "Ravshan Karimov", "Dilnoza Ahmedova", "Behzod Alimov",
        "Munisaxon Rasulova", "Shoxrux Usmonov", "Nigora Hasanova", "Doniyor Toshpulatov", "Zebo Abdullayeva",
        "Mirzohid Tursunov", "Sevara Xolmatova", "Asilbek Qodirov", "Mohira Yunusova", "Umidjon Nosirov",
        "Lola Rahimova", "Jaloliddin Mahmudov", "Maftuna Azimova", "Sardor Ergashov", "Durdona Sobirova",
        "Oybek Nazarov", "Mohinur Qodirova", "Shohruh Abdurahmonov", "Shahzoda To'rayeva", "Humoyun Mirzayev",
        "Barno Saidova", "Islom Karimov", "Muslima Xolmatova", "Farrux Ruziyev", "Nigina Abdullayeva"
      ];
      
      // BARCHA O'QUVCHILAR UCHUN TAVSIYALAR
      const allRecommendations = [];
      const allStudentsList = [];
      
      // YUQORI BILIMLILAR (35 ta)
      for (let i = 0; i < high_count; i++) {
        const name = names[i % names.length];
        const subject = subjects_list[Math.floor(Math.random() * subjects_list.length)].name;
        const score = 75 + Math.random() * 25;
        allStudentsList.push({ id: i + 1, name, score, bestSubject: subject, level: "high" });
        
        if (subject === "Informatika" || subject === "Dasturlash") {
          allRecommendations.push({
            student: name, id: i + 1, subject: subject, score: score,
            direction: ["Frontend", "Backend", "DevOps", "Mobile", "Full Stack"][Math.floor(Math.random() * 5)],
            reason: `${name} ${subject} fanidan a'lo bilimga ega (${Math.round(score)} ball). IT sohasida karerasini davom ettirishi mumkin. ${Math.round(score)} ball bilan yuqori natijalarga erishgan.`,
            priority: "high", level: "high"
          });
        } else if (subject === "Matematika") {
          allRecommendations.push({
            student: name, id: i + 1, subject: subject, score: score,
            direction: "Data Science / AI",
            reason: `${name} matematik qobiliyati yuqori (${Math.round(score)} ball). Data Science yoki AI sohasida o'zini sinab ko'rishi tavsiya etiladi. Matematikadan ${Math.round(score)} ball to'plagan.`,
            priority: "high", level: "high"
          });
        } else {
          allRecommendations.push({
            student: name, id: i + 1, subject: subject, score: score,
            direction: ["IT", "Biznes", "Marketing", "Dizayn", "Arxitektura"][Math.floor(Math.random() * 5)],
            reason: `${name} ${subject} fanidan yaxshi natijalarga erishgan (${Math.round(score)} ball). ${subject} bo'yicha qo'shimcha kurslar tavsiya etiladi.`,
            priority: "medium", level: "high"
          });
        }
      }
      
      // O'RTACHA BILIMLILAR (40 ta)
      for (let i = 0; i < medium_count; i++) {
        const name = names[(i + high_count) % names.length];
        const subject = subjects_list[Math.floor(Math.random() * subjects_list.length)].name;
        const score = 50 + Math.random() * 24;
        allStudentsList.push({ id: i + high_count + 1, name, score, bestSubject: subject, level: "medium" });
        
        allRecommendations.push({
          student: name, id: i + high_count + 1, subject: subject, score: score,
          direction: subject === "Informatika" ? "Dasturlash asoslari" : subject === "Matematika" ? "Matematika intensiv" : "Asosiy kurslar",
          reason: `${name} ${subject} fanidan o'rtacha bilimga ega (${Math.round(score)} ball). Qo'shimcha mashg'ulotlar va amaliyotlar bilan bilimini mustahkamlashi tavsiya etiladi. ${Math.round(score)} ballni ${Math.round(score + 15)} ballga ko'tarish imkoniyati bor.`,
          priority: "medium", level: "medium"
        });
      }
      
      // PAST BILIMLILAR (25 ta)
      for (let i = 0; i < low_count; i++) {
        const name = names[(i + high_count + medium_count) % names.length];
        const subject = subjects_list[Math.floor(Math.random() * subjects_list.length)].name;
        const score = 30 + Math.random() * 19;
        allStudentsList.push({ id: i + high_count + medium_count + 1, name, score, bestSubject: subject, level: "low" });
        
        allRecommendations.push({
          student: name, id: i + high_count + medium_count + 1, subject: subject, score: score,
          direction: "Asosiy tayyorgarlik kursi",
          reason: `${name} o'qishda qiyinchiliklar bor (${Math.round(score)} ball). ${subject} faniga ko'proq e'tibor qaratish va repetitorlik kurslariga yozilish tavsiya etiladi. ${Math.round(score)} ballni oshirish uchun individual darslar kerak.`,
          priority: "low", level: "low"
        });
      }
      
      const students_high = allStudentsList.filter(s => s.level === "high");
      const students_medium = allStudentsList.filter(s => s.level === "medium");
      const students_low = allStudentsList.filter(s => s.level === "low");
      
      setStats({
        loading: false,
        students: { total: students_total, high: students_high, medium: students_medium, low: students_low },
        teachers: { total: 48, active: 42 },
        subjects: { total: subjects_list.length, popular: subjects_list },
        groups: { total: 24, active: 22 },
        attendance: { today: 856, week: 4123, month: 15678 },
        performance: { average: 74.8, highest: 98.5, lowest: 32.0 },
        revenue: { total: 345678, monthly: monthly_revenue },
        activities: activities,
        recommendations: allRecommendations
      });
    };
    
    setTimeout(generateRealisticData, 500);
  }, []);
  
  return stats;
}

function getStudentName(s) { return s.name || "Noma'lum"; }
function initials(name) { return (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(); }

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#22c55e", "#f43f5e", "#a855f7", "#06b6d4", "#84cc16"];

function CountUp({ target, suffix = "" }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!target) return;
    let cur = 0;
    const step = target / 50;
    const tm = setInterval(() => { cur = Math.min(cur + step, target); setVal(Math.round(cur)); if (cur >= target) clearInterval(tm); }, 20);
    return () => clearInterval(tm);
  }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

function ProgressBar({ pct, color }) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setWidth(pct), 200); return () => clearTimeout(t); }, [pct]);
  return <div className="h-2 overflow-hidden bg-gray-100 rounded-full"><div className="h-full transition-all duration-1000 rounded-full" style={{ width: `${width}%`, background: color }} /></div>;
}

// ============================================
// MODAL KOMPONENTI
// ============================================
function StudentModal({ students, title, color, onClose }) {
  const [search, setSearch] = React.useState("");
  const filtered = students.filter(s => getStudentName(s).toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg overflow-hidden bg-white shadow-2xl rounded-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
        <div className="flex items-center justify-between p-5 border-b border-gray-100" style={{ background: `${color}08` }}>
          <div><h2 className="font-bold text-gray-800">{title}</h2><p className="text-xs text-gray-400">{students.length} ta o'quvchi</p></div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 text-gray-400 rounded-full hover:bg-gray-100">×</button>
        </div>
        <div className="p-4 border-b border-gray-100"><div className="relative"><span className="absolute -translate-y-1/2 left-3 top-1/2">🔍</span><input type="text" placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="w-full py-2 pr-3 text-sm border border-gray-200 outline-none pl-9 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100" /></div></div>
        <div className="p-2 space-y-1 overflow-y-auto max-h-96">
          {filtered.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
              <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white rounded-full" style={{ background: COLORS[i % COLORS.length] }}>{initials(getStudentName(s))}</div>
              <div className="flex-1"><p className="text-sm font-medium text-gray-800">{getStudentName(s)}</p>{s.score && <p className="text-xs text-gray-400">⭐ {Math.round(s.score)} ball</p>}</div>
              <div className="px-2 py-1 text-xs rounded-full" style={{ background: `${color}15`, color }}>#{s.id}</div>
            </div>
          ))}
        </div>
        <div className="p-3 text-xs text-center text-gray-500 border-t border-gray-100 bg-gray-50">{filtered.length} ta ko'rsatilmoqda</div>
      </div>
    </div>
  );
}

// ============================================
// BARCHA TAVSIYALAR MODALI
// ============================================
function AllRecommendationsModal({ recommendations, onClose }) {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  
  const filtered = recommendations.filter(rec => {
    const matchSearch = rec.student.toLowerCase().includes(search.toLowerCase()) || rec.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || rec.priority === filter || rec.level === filter;
    return matchSearch && matchFilter;
  });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Barcha o'quvchilar uchun tavsiyalar</h2>
              <p className="text-xs text-gray-500">AI asosida generatsiya qilingan shaxsiy tavsiyalar</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 text-xl text-gray-400 rounded-full hover:bg-gray-100">×</button>
        </div>
        
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <span className="absolute -translate-y-1/2 left-3 top-1/2">🔍</span>
            <input type="text" placeholder="O'quvchi yoki fan bo'yicha qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="w-full py-2 pr-3 text-sm border border-gray-200 outline-none pl-9 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Barcha", color: "gray" },
              { key: "high", label: "🏆 Yuqori", color: "emerald" },
              { key: "medium", label: "📘 O'rtacha", color: "blue" },
              { key: "low", label: "📖 Past", color: "red" }
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${filter === f.key ? `bg-${f.color}-500 text-white shadow-md` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(85vh - 180px)" }}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">Hech qanday tavsiya topilmadi</div>
          ) : (
            filtered.map((rec, idx) => (
              <div key={idx} className={`p-4 rounded-xl transition-all hover:shadow-md border-l-4 ${
                rec.priority === 'high' ? 'border-l-emerald-500 bg-emerald-50/30' : 
                rec.priority === 'medium' ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-amber-500 bg-amber-50/30'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    rec.priority === 'high' ? 'bg-emerald-100' : rec.priority === 'medium' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {rec.priority === 'high' ? '⭐' : rec.priority === 'medium' ? '📘' : '📖'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{rec.student}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{Math.round(rec.score)} ball</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">{rec.direction}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.level === 'high' ? 'bg-emerald-100 text-emerald-600' : 
                        rec.level === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {rec.level === 'high' ? 'Yuqori' : rec.level === 'medium' ? 'O\'rtacha' : 'Past'} daraja
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">📚 {rec.subject}</span>
                      <span className="px-2 py-1 text-xs text-purple-600 bg-purple-100 rounded-full">🎯 {rec.direction}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 text-xs text-center text-gray-500 border-t border-gray-100 bg-gray-50">
          Jami {recommendations.length} ta tavsiya · {filtered.length} ta ko'rsatilmoqda
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATISTIKA BO'LIMI
// ============================================
function StatisticsDashboard() {
  const stats = useRealStatistics();
  const [modal, setModal] = React.useState(null);
  const [showAllRecommendations, setShowAllRecommendations] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState("month");
  
  if (stats.loading) {
    return (
      <div className="mt-8 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }
  
  const hPct = Math.round((stats.students.high.length / stats.students.total) * 100);
  const mPct = Math.round((stats.students.medium.length / stats.students.total) * 100);
  const lPct = 100 - hPct - mPct;
  
  return (
    <>
      {modal && <StudentModal students={modal.list} title={modal.title} color={modal.color} onClose={() => setModal(null)} />}
      {showAllRecommendations && <AllRecommendationsModal recommendations={stats.recommendations} onClose={() => setShowAllRecommendations(false)} />}
      
      <div className="mt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                  <span className="text-2xl">📊</span> Analytics Dashboard
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">100 ta o'quvchi · Real-time statistics</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {["week", "month", "year"].map(p => (
              <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-4 py-1.5 text-sm rounded-lg transition-all ${selectedPeriod === p ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p === "week" ? "Haftalik" : p === "month" ? "Oylik" : "Yillik"}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "🎓", label: "Jami talabalar", value: stats.students.total, change: "+8.2%", color: "#3b82f6", bg: "bg-blue-50", list: [...stats.students.high, ...stats.students.medium, ...stats.students.low], title: "Barcha talabalar" },
            { icon: "👨‍🏫", label: "Faol ustozlar", value: stats.teachers.active, total: stats.teachers.total, change: "+3.1%", color: "#8b5cf6", bg: "bg-purple-50", list: [], title: "Ustozlar" },
            { icon: "📚", label: "Faol guruhlar", value: stats.groups.active, total: stats.groups.total, change: "+5.4%", color: "#14b8a6", bg: "bg-teal-50", list: [], title: "Guruhlar" },
            { icon: "💰", label: "Umumiy daromad", value: stats.revenue.total, prefix: "$", change: "+12.3%", color: "#f59e0b", bg: "bg-amber-50", list: [], title: "Daromad" },
          ].map((card, i) => (
            <div key={i} onClick={() => card.list?.length && setModal({ list: card.list, title: card.title, color: card.color })} className={`group relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${card.list ? 'cursor-pointer' : ''}`}>
              <div className="absolute top-0 right-0 w-32 h-32 transition-transform duration-700 translate-x-16 -translate-y-16 rounded-full opacity-5 group-hover:scale-150" style={{ background: card.color }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.bg} transition-all duration-300 group-hover:scale-110`} style={{ color: card.color }}>{card.icon}</div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full text-emerald-600 bg-emerald-100">{card.change}</span>
                </div>
                <div className="text-3xl font-bold text-gray-800"><CountUp target={card.value} suffix={card.prefix || ""} /></div>
                <div className="mt-1 text-sm text-gray-500">{card.label}</div>
                {card.total && <div className="mt-1 text-xs text-gray-400">Jami: {card.total}</div>}
                {card.list && <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">👆 Bosing → batafsil</div>}
              </div>
            </div>
          ))}
        </div>
        
        {/* Chart Row */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-2xl hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div><h3 className="font-semibold text-gray-800">📈 O'quv ko'rsatkichlari</h3><p className="text-xs text-gray-400">So'nggi oylar bo'yicha</p></div>
            </div>
            <div className="flex items-end h-64 gap-2">
              {stats.revenue.monthly.map((val, i) => {
                const height = (val / Math.max(...stats.revenue.monthly)) * 200;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                    <div className="w-full transition-all duration-700 rounded-lg" style={{ height: `${height}px`, background: `linear-gradient(180deg, #3b82f6, #8b5cf6)` }} />
                    <span className="text-[10px] text-gray-400">{["Yan", "Fev", "Mar", "Apr", "May", "Iyun"][i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg">
            <h3 className="mb-4 font-semibold text-gray-800">🎯 Talabalar taqsimoti</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray={`${hPct * 3.14} 314`} strokeDashoffset="0" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray={`${mPct * 3.14} 314`} strokeDashoffset={`-${hPct * 3.14}`} transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray={`${lPct * 3.14} 314`} strokeDashoffset={`-${(hPct + mPct) * 3.14}`} transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="32" fill="white" />
                <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">{stats.students.total}</text>
                <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#6b7280">talaba</text>
              </svg>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs text-gray-600">Yuqori {hPct}%</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /><span className="text-xs text-gray-600">O'rtacha {mPct}%</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /><span className="text-xs text-gray-600">Past {lPct}%</span></div>
            </div>
          </div>
        </div>
        
        {/* Student Level Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { title: "🏆 Yuqori natijali", list: stats.students.high, count: stats.students.high.length, pct: hPct, color: "#22c55e", bg: "from-emerald-50 to-emerald-100/20", text: "A'lo darajadagi o'quvchilar" },
            { title: "📘 O'rtacha natijali", list: stats.students.medium, count: stats.students.medium.length, pct: mPct, color: "#3b82f6", bg: "from-blue-50 to-blue-100/20", text: "Yaxshi darajadagi o'quvchilar" },
            { title: "📖 Yordam kerak", list: stats.students.low, count: stats.students.low.length, pct: lPct, color: "#ef4444", bg: "from-red-50 to-red-100/20", text: "Qo'shimcha darslar tavsiya etiladi" },
          ].map((level, i) => (
            <div key={i} onClick={() => setModal({ list: level.list, title: level.title, color: level.color })} className={`group cursor-pointer bg-gradient-to-br ${level.bg} rounded-2xl p-5 border border-white/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{level.title.split(" ")[0]}</span>
                <span className="text-2xl font-bold" style={{ color: level.color }}>{level.count}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{level.title.split(" ").slice(1).join(" ")}</h3>
              <p className="mt-1 mb-3 text-xs text-gray-500">{level.text}</p>
              <ProgressBar pct={level.pct} color={level.color} />
              <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">👆 Bosing → ro'yxat</div>
            </div>
          ))}
        </div>
        
        {/* Popular Subjects */}
        <div className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-semibold text-gray-800">⭐ Mashhur fanlar</h3><p className="text-xs text-gray-400">Talabalar eng ko'p tanlagan fanlar</p></div>
          </div>
          <div className="space-y-4">
            {stats.subjects.popular.map((subj, i) => (
              <div key={i} className="p-3 transition-all group hover:bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3"><span className="text-lg">📘</span><span className="font-medium text-gray-700">{subj.name}</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-semibold text-gray-800">{subj.students} talaba</span><span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{subj.trend}</span></div>
                </div>
                <ProgressBar pct={(subj.students / stats.students.total) * 100} color={i === 0 ? "#22c55e" : i === 1 ? "#3b82f6" : "#8b5cf6"} />
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Recommendations */}
        <div className="p-6 border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div><div className="flex items-center gap-2"><span className="text-xl">🤖</span><h3 className="font-semibold text-gray-800">AI Tavsiyalar</h3></div><p className="text-xs text-gray-500 mt-0.5">100 ta o'quvchining har biri uchun shaxsiy tavsiyalar</p></div>
            <button onClick={() => setShowAllRecommendations(true)} className="px-4 py-2 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg">
              Barcha tavsiyalar ({stats.recommendations.length})
            </button>
          </div>
          <div className="space-y-3">
            {stats.recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-4 transition-all hover:shadow-md hover:-translate-x-0.5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${rec.priority === 'high' ? 'bg-emerald-100' : rec.priority === 'medium' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    {rec.priority === 'high' ? '⭐' : rec.priority === 'medium' ? '📘' : '📖'}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{rec.student}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{Math.round(rec.score)} ball</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">{rec.direction}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{rec.reason}</p>
                    <div className="flex gap-2 mt-2"><span className="text-xs text-gray-500">📚 {rec.subject}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-4"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /><h3 className="font-semibold text-gray-800">🕐 So'nggi faoliyatlar</h3></div>
          <div className="space-y-3">
            {stats.activities.map((act, i) => (
              <div key={i} className="flex items-center gap-3 p-3 transition-all rounded-xl hover:bg-gray-50">
                <div className="flex items-center justify-center w-8 h-8 text-sm bg-gray-100 rounded-lg">{act.icon}</div>
                <div className="flex-1"><p className="text-sm text-gray-800">{act.action}</p><p className="text-xs text-gray-400">{act.user}</p></div>
                <div className="text-xs text-gray-400">{act.time}</div>
                {act.priority === 'high' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(8px); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </>
  );
}

// ============================================
// LAYOUT
// ============================================
export default function SuperAdminLayoutModern(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState("Bosh sahifa");
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    window.addEventListener("resize", () => window.innerWidth < 1200 ? setOpen(false) : setOpen(true));
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", () => {});
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  React.useEffect(() => { getActiveRoute(routesModern); }, [location.pathname]);

  const getActiveRoute = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + "/" + routes[i].path) !== -1) {
        setCurrentRoute(routes[i].name);
        return;
      }
    }
  };

  const getRoutes = (routes) =>
    routes.map((prop, key) =>
      prop.layout === "/superadmin"
        ? <Route path={`/${prop.path}`} element={prop.component} key={key} />
        : null
    );

  const getDetailRoutes = (routes) =>
    routes.map((prop, key) => <Route path={`/${prop.path}`} element={prop.component} key={key} />);

  const isHomePage = location.pathname === "/superadmin/default" || location.pathname === "/superadmin";

  document.documentElement.dir = "ltr";
  const mouseX = mousePosition.x / window.innerWidth - 0.5;

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf5 50%, #eef2f7 100%)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-200/60 via-purple-200/40 to-pink-200/30 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-l from-teal-200/40 via-cyan-200/30 to-blue-200/40 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-200/20 via-orange-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse-slow" />
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: 0.4, animation: `float-particle ${8 + Math.random() * 12}s linear infinite`, animationDelay: `${Math.random() * 6}s` }} />
        ))}
        <div className="absolute top-1/4 left-[5%] w-32 h-32 border-2 border-blue-200/40 rounded-full animate-spin-slow" />
        <div className="absolute bottom-1/3 right-[8%] w-40 h-40 border-2 border-purple-200/40 rounded-full animate-spin-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-pink-200/20 rounded-full animate-spin-reverse" />
      </div>

      <div className="relative z-20 transition-all duration-700 ease-out" style={{ transform: `perspective(1000px) rotateY(${mouseX * 3}deg)` }}>
        <SidebarModern open={open} onClose={() => setOpen(false)} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <div className="sticky top-0 z-30 transition-all duration-500 transform-gpu">
          <NavbarModern onOpenSidenav={() => setOpen(true)} logoText="" brandText={currentRoute} {...rest} />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="relative px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-purple-400" />
                <span className="text-sm font-medium tracking-wider text-blue-600 uppercase">Boshqaruv paneli</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 md:text-4xl">{currentRoute}</h1>
              <div className="flex gap-2 mt-3">
                <div className="w-12 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                <div className="w-6 h-1 rounded-full bg-gradient-to-r from-blue-300 to-purple-300" />
              </div>
            </div>

            <div className="group">
              <div className="transition-all duration-500 border shadow-lg rounded-2xl bg-white/60 backdrop-blur-sm border-white/80 hover:shadow-xl">
                <div className="p-6 md:p-8">
                  <div className="animate-fade-in-up">
                    <Routes>
                      {getRoutes(routesModern)}
                      {getDetailRoutes(detailRoutes)}
                      <Route path="/" element={<Navigate to="/superadmin/default" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>

            {isHomePage && <StatisticsDashboard />}
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/40 bg-white/40 backdrop-blur-sm">
          <div className="px-4 py-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500"><span className="text-xs">📚</span></div>
                <span className="text-sm font-semibold text-gray-700">Smart edu</span>
              </div>
              <p className="text-xs text-gray-500">© 2024 Ta'lim platformasi. Barcha huquqlar himoyalangan.</p>
              <div className="flex gap-5">
                <a href="#" className="text-xs text-gray-500 transition-colors hover:text-blue-500">Yordam</a>
                <a href="#" className="text-xs text-gray-500 transition-colors hover:text-blue-500">Maxfiylik</a>
                <a href="#" className="text-xs text-gray-500 transition-colors hover:text-blue-500">Shartlar</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}