import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Columns, 
  Sparkles, 
  BarChart3, 
  ArrowRight, 
  Shield, 
  Users, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans relative">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            Taskment
          </div>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Tích hợp trí tuệ nhân tạo (AI Assistant)
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-[1.15]"
            >
              Quản lý công việc thông minh với <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Taskment AI</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Giải pháp tối ưu tiến độ, cộng tác nhóm hiệu quả, tích hợp trợ lý AI thông minh giúp giải quyết công việc chỉ trong vài giây.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Trải nghiệm ngay
                <ArrowRight className="ml-2 w-5 h-5 animate-pulse" />
              </Link>
              <a 
                href="#features" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                Tìm hiểu thêm
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Preview Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="text-slate-400">
              Được thiết kế toàn diện nhằm tăng hiệu suất làm việc của cá nhân và đội ngũ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex flex-col hover:border-slate-700/80 hover:bg-slate-900/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                <Columns className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bảng Kanban Trực Quan</h3>
              <p className="text-slate-400 leading-relaxed">
                Tổ chức, phân loại và cập nhật trạng thái công việc dễ dàng với bảng kéo thả trực quan. Giúp theo dõi trực diện tiến độ dự án.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex flex-col hover:border-slate-700/80 hover:bg-slate-900/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Trợ Lý AI Đồng Hành</h3>
              <p className="text-slate-400 leading-relaxed">
                Tích hợp AI trợ giúp bạn lên kế hoạch, phân tích lỗi, hướng dẫn giải quyết công việc và tự động trả lời câu hỏi trực tiếp.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-sm flex flex-col hover:border-slate-700/80 hover:bg-slate-900/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Thống Kê Chi Tiết</h3>
              <p className="text-slate-400 leading-relaxed">
                Bảng số liệu phân tích và biểu đồ cập nhật thời gian thực giúp người quản lý nắm bắt năng suất làm việc của từng thành viên.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Technical Highlights Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Môi trường cộng tác chuyên nghiệp
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Đồ án được tối ưu hóa toàn diện về kiến trúc và bảo mật, sẵn sàng hỗ trợ các dự án doanh nghiệp quy mô vừa và nhỏ.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Bảo mật hệ thống tối đa với JWT và mã hóa BCrypt.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Giao tiếp thời gian thực mượt mà qua kết nối WebSockets.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Xác thực hai lớp (2FA) bảo vệ dữ liệu tối đa.</span>
                </li>
              </ul>
            </div>
            
            {/* Design elements mock-up */}
            <div className="relative p-6 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between shadow-2xl h-80">
              <div className="absolute top-[-50%] right-[-50%] w-80 h-80 rounded-full bg-blue-600/20 blur-[60px]" />
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 font-mono">http://taskment.54.179.62.168.nip.io</div>
              </div>
              
              {/* Visual mock content */}
              <div className="flex-1 flex flex-col justify-center gap-4 py-4">
                <div className="h-6 bg-slate-900 rounded w-1/3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-900 rounded w-full" />
                  <div className="h-4 bg-slate-900 rounded w-5/6" />
                  <div className="h-4 bg-slate-900 rounded w-4/6" />
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-8 bg-blue-600/30 border border-blue-500/30 rounded-lg w-24 flex items-center justify-center text-xs text-blue-400 font-bold">Kanban</div>
                  <div className="h-8 bg-purple-600/30 border border-purple-500/30 rounded-lg w-24 flex items-center justify-center text-xs text-purple-400 font-bold">AI Chat</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
          <p>© 2026 Taskment System. Dự án Đồ án chuyên ngành phát triển bởi Phúc Dương.</p>
          <p>Môi trường vận hành thử nghiệm trên nền tảng AWS EC2.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
