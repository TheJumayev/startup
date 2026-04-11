import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studentName, setStudentName] = useState("Ali Valiyev");
  const [studentClass, setStudentClass] = useState("11-A sinf");
  const [stats, setStats] = useState([
    { id: 1, title: "O'zlashtirish", value: 0, target: 85, icon: "📊", color: "from-blue-500 to-blue-600", unit: "%", delay: 0 },
    { id: 2, title: "Yakunlangan darslar", value: 0, target: 24, icon: "✅", color: "from-emerald-500 to-emerald-600", unit: "ta", delay: 100 },
    { id: 3, title: "Ballar", value: 0, target: 3420, icon: "⭐", color: "from-amber-500 to-amber-600", unit: "ball", delay: 200 },
    { id: 4, title: "Sertifikatlar", value: 0, target: 3, icon: "🏆", color: "from-purple-500 to-purple-600", unit: "ta", delay: 300 },
  ]);
  
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Matematika", progress: 0, target: 85, score: 0, maxScore: 100, teacher: "Shahnoza Umarova", icon: "📐", color: "blue" },
    { id: 2, name: "Informatika", progress: 0, target: 90, score: 0, maxScore: 100, teacher: "Sherzod Akbarov", icon: "💻", color: "purple" },
    { id: 3, name: "Ingliz tili", progress: 0, target: 80, score: 0, maxScore: 100, teacher: "Zarina Karimova", icon: "🇬🇧", color: "emerald" },
    { id: 4, name: "Fizika", progress: 0, target: 75, score: 0, maxScore: 100, teacher: "Bobur Rashidov", icon: "⚡", color: "amber" },
    { id: 5, name: "Dasturlash", progress: 0, target: 95, score: 0, maxScore: 100, teacher: "Jasur Mirzayev", icon: "👨‍💻", color: "rose" },
  ]);
  
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, action: "Matematika fanidan test topshirdingiz", score: 92, time: "2 soat oldin", icon: "📐", type: "success" },
    { id: 2, action: "Informatika darsiga qatnashdingiz", time: "1 kun oldin", icon: "💻", type: "info" },
    { id: 3, action: "Sertifikat bilan taqdirlandingiz", time: "3 kun oldin", icon: "🏆", type: "warning" },
    { id: 4, action: "Yangi topshiriq qo'shildi", time: "5 kun oldin", icon: "📝", type: "info" },
  ]);
  
  const [upcomingTasks, setUpcomingTasks] = useState([
    { id: 1, title: "Matematika testi", subject: "Matematika", deadline: "2 kun", priority: "high", icon: "📐" },
    { id: 2, title: "Informatika loyihasi", subject: "Informatika", deadline: "3 kun", priority: "medium", icon: "💻" },
    { id: 3, title: "Ingliz tili quiz", subject: "Ingliz tili", deadline: "5 kun", priority: "low", icon: "🇬🇧" },
  ]);

  useEffect(() => {
    // Salomlashish so'zini soatga qarab belgilash
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Xayrli tong");
    else if (hour < 18) setGreeting("Xayrli kun");
    else setGreeting("Xayrli kech");

    // Vaqtni yangilash
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Statistikani animatsiya bilan oshirish
    stats.forEach((stat, index) => {
      setTimeout(() => {
        const interval = setInterval(() => {
          setStats(prev => prev.map(s => {
            if (s.id === stat.id) {
              const newValue = Math.min(s.value + Math.ceil(s.target / 50), s.target);
              return { ...s, value: newValue };
            }
            return s;
          }));
        }, 30);
        return () => clearInterval(interval);
      }, stat.delay);
    });
    
    // Fanlar progressini animatsiya bilan oshirish
    subjects.forEach((subject, index) => {
      setTimeout(() => {
        const interval = setInterval(() => {
          setSubjects(prev => prev.map(s => {
            if (s.id === subject.id) {
              const newProgress = Math.min(s.progress + Math.ceil(s.target / 30), s.target);
              const newScore = Math.min(s.score + Math.ceil((s.maxScore * s.target / 100) / 30), s.maxScore * s.target / 100);
              return { ...s, progress: newProgress, score: Math.round(newScore) };
            }
            return s;
          }));
        }, 40);
        return () => clearInterval(interval);
      }, index * 150);
    });

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'from-red-500 to-rose-500';
      case 'medium': return 'from-amber-500 to-orange-500';
      default: return 'from-emerald-500 to-teal-500';
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6 md:p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-pink-200/30 blur-3xl animate-float-slow" />
        <div className="absolute rounded-full -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-float-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Welcome Section with Animation */}
        <div className="mb-8 overflow-hidden">
          <div className="transition-all duration-700 transform-gpu animate-slide-down">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 transition-all duration-500 rounded-full opacity-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-xl group-hover:opacity-50" />
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-500 animate-bounce-subtle">
                    <span className="text-3xl md:text-4xl">👨‍🎓</span>
                  </div>
                  <div className="absolute w-4 h-4 border-2 border-white rounded-full -bottom-1 -right-1 bg-emerald-500 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
                    <span className="text-xs font-medium tracking-wider text-blue-600 uppercase">Talaba paneli</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                    {greeting}, {studentName}!
                  </h1>
                  <p className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">📚 {studentClass}</span>
                    <span className="hidden w-1 h-1 bg-gray-400 rounded-full sm:inline" />
                    <span className="flex items-center gap-1">📅 {formatDate(currentTime)}</span>
                    <span className="hidden w-1 h-1 bg-gray-400 rounded-full sm:inline" />
                    <span className="flex items-center gap-1">🕐 {formatTime(currentTime)}</span>
                  </p>
                </div>
              </div>
              
              {/* Motivatonal quote */}
              <div className="relative group">
                <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur-lg group-hover:opacity-40" />
                <div className="relative px-4 py-3 border shadow-sm bg-white/80 backdrop-blur-sm rounded-xl border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💪</span>
                    <p className="text-xs text-gray-600 max-w-[200px]">"Bilim - eng kuchli qurol"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with 3D Hover Effects */}
        <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="relative p-4 overflow-hidden transition-all duration-500 border shadow-lg cursor-pointer group rounded-2xl bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-2xl hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
              <div className="absolute transition-all duration-700 origin-left scale-x-0 opacity-0 -inset-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:opacity-100 group-hover:scale-x-100" />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {stat.value}{stat.unit}
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${(stat.value / stat.target) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Maqsad: {stat.target}{stat.unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects Progress Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
            <h2 className="font-semibold text-gray-800">Fanlar bo'yicha o'zlashtirish</h2>
            <div className="flex gap-1 ml-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse delay-150" />
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse delay-300" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, index) => (
              <div
                key={subject.id}
                className="relative p-4 overflow-hidden transition-all duration-500 border shadow-md group rounded-xl bg-white/80 backdrop-blur-sm border-white/60 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${subject.color}-500/5 to-${subject.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${subject.color}-100 to-${subject.color}-200 flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110`}>
                    {subject.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                    <p className="text-xs text-gray-400">{subject.teacher}</p>
                  </div>
                  <div className={`text-sm font-bold text-${subject.color}-600`}>
                    {subject.score}/{subject.maxScore}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between mb-1 text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{subject.progress}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r from-${subject.color}-500 to-${subject.color}-600 transition-all duration-1000`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 mt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">Maqsad: {subject.target}%</div>
                  <div className="text-xs font-medium text-emerald-600">
                    {subject.progress >= subject.target ? "✅ Bajarilgan" : "📌 Davom etmoqda"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities & Upcoming Tasks */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <div className="p-5 transition-all duration-500 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl border-white/60 hover:shadow-xl animate-slide-right">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                <h2 className="font-semibold text-gray-800">So'nggi faoliyatlar</h2>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-300" />
              </div>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 transition-all duration-300 cursor-pointer group rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:-translate-x-1 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                    activity.type === 'success' ? 'from-emerald-100 to-emerald-200' :
                    activity.type === 'warning' ? 'from-amber-100 to-amber-200' :
                    'from-blue-100 to-blue-200'
                  } flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  {activity.score && (
                    <div className="text-sm font-bold text-emerald-600">+{activity.score}</div>
                  )}
                  <div className="text-gray-400 transition-all duration-300 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="p-5 transition-all duration-500 border shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl border-white/60 hover:shadow-xl animate-slide-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                <h2 className="font-semibold text-gray-800">Kutilayotgan topshiriqlar</h2>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-600">{upcomingTasks.length} ta</span>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 transition-all duration-300 cursor-pointer group rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:-translate-x-1 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getPriorityColor(task.priority).replace('from-', 'from-').split(' ')[0].replace('to-', 'to-')}100 flex items-center justify-center text-lg transition-all duration-300 group-hover:scale-110`}>
                    {task.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {task.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-2 mt-4 text-sm font-medium text-center text-blue-600 transition-colors hover:text-blue-700">
              Barcha topshiriqlarni ko'rish →
            </button>
          </div>
        </div>

        {/* Achievement Card */}
        <div className="mt-6">
          <div className="relative p-5 overflow-hidden transition-all duration-500 border shadow-lg group rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-amber-100/50 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 transition-all duration-700 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 blur-2xl opacity-20 group-hover:opacity-30 group-hover:scale-150" />
            {/* <div className="relative z-10 flex flex-wrap items-center gap-4">
              <div className="flex items-center justify-center text-2xl shadow-lg w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 animate-bounce-subtle">
                🏆
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-gray-800">Ajoyib! Siz 3-sertifikatga ega bo'ldingiz</h3>
                <p className="text-sm text-gray-500">Matematika, Informatika va Ingliz tili fanlaridan sertifikatlar bilan taqdirlandingiz.</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:scale-105">
                Sertifikatlarni ko'rish
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 15px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.92); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle linear infinite; }
        .animate-slide-down { animation: slide-down 0.6s ease-out forwards; }
        .animate-slide-left { animation: slide-left 0.6s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;