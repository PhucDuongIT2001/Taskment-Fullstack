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
import './LandingPage.css';

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
    <div className="landing-container">
      {/* Background Gradients */}
      <div className="landing-glow-1" />
      <div className="landing-glow-2" />

      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            Taskment
          </div>
          <Link to="/login" className="landing-login-btn">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="landing-hero">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="landing-hero-badge">
              <Sparkles className="w-3.5 h-3.5" style={{ marginRight: '0.25rem' }} />
              Tích hợp trí tuệ nhân tạo (AI Assistant)
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="landing-hero-title"
            >
              Quản lý công việc thông minh với <span className="landing-hero-title-accent">Taskment AI</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="landing-hero-desc"
            >
              Giải pháp tối ưu tiến độ, cộng tác nhóm hiệu quả, tích hợp trợ lý AI thông minh giúp giải quyết công việc chỉ trong vài giây.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="landing-hero-actions"
            >
              <Link to="/login" className="landing-btn-primary">
                Trải nghiệm ngay
                <ArrowRight className="w-5 h-5 animate-pulse" style={{ marginLeft: '0.5rem' }} />
              </Link>
              <a href="#features" className="landing-btn-secondary">
                Tìm hiểu thêm
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Preview Section */}
        <section id="features" className="landing-features-section">
          <div className="landing-features-header">
            <h2 className="landing-features-title">
              Tính năng nổi bật
            </h2>
            <p className="landing-features-desc">
              Được thiết kế toàn diện nhằm tăng hiệu suất làm việc của cá nhân và đội ngũ.
            </p>
          </div>

          <div className="landing-features-grid">
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="landing-feature-card"
            >
              <div className="landing-feature-icon-wrapper blue">
                <Columns className="w-6 h-6" />
              </div>
              <h3 className="landing-feature-card-title">Bảng Kanban Trực Quan</h3>
              <p className="landing-feature-card-desc">
                Tổ chức, phân loại và cập nhật trạng thái công việc dễ dàng với bảng kéo thả trực quan. Giúp theo dõi trực diện tiến độ dự án.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="landing-feature-card"
            >
              <div className="landing-feature-icon-wrapper indigo">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="landing-feature-card-title">Trợ Lý AI Đồng Hành</h3>
              <p className="landing-feature-card-desc">
                Tích hợp AI trợ giúp bạn lên kế hoạch, phân tích lỗi, hướng dẫn giải quyết công việc và tự động trả lời câu hỏi trực tiếp.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="landing-feature-card"
            >
              <div className="landing-feature-icon-wrapper purple">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="landing-feature-card-title">Thống Kê Chi Tiết</h3>
              <p className="landing-feature-card-desc">
                Bảng số liệu phân tích và biểu đồ cập nhật thời gian thực giúp người quản lý nắm bắt năng suất làm việc của từng thành viên.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Technical Highlights Section */}
        <section className="landing-highlights-section">
          <div className="landing-highlights-grid">
            <div className="landing-highlights-content">
              <h2 className="landing-highlights-title">
                Môi trường cộng tác chuyên nghiệp
              </h2>
              <p className="landing-highlights-desc">
                Đồ án được tối ưu hóa toàn diện về kiến trúc và bảo mật, sẵn sàng hỗ trợ các dự án doanh nghiệp quy mô vừa và nhỏ.
              </p>

              <ul className="landing-highlights-list">
                <li className="landing-highlights-item">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" style={{ marginTop: '0.125rem' }} />
                  <span className="landing-highlights-item-text">Bảo mật hệ thống tối đa với JWT và mã hóa BCrypt.</span>
                </li>
                <li className="landing-highlights-item">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" style={{ marginTop: '0.125rem' }} />
                  <span className="landing-highlights-item-text">Giao tiếp thời gian thực mượt mà qua kết nối WebSockets.</span>
                </li>
                <li className="landing-highlights-item">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" style={{ marginTop: '0.125rem' }} />
                  <span className="landing-highlights-item-text">Xác thực hai lớp (2FA) bảo vệ dữ liệu tối đa.</span>
                </li>
              </ul>
            </div>
            
            {/* Design elements mock-up */}
            <div className="landing-mock-browser">
              <div className="landing-mock-glow" />
              
              <div className="landing-mock-header">
                <div className="landing-mock-dots">
                  <span className="landing-mock-dot red" />
                  <span className="landing-mock-dot yellow" />
                  <span className="landing-mock-dot green" />
                </div>
                <div className="landing-mock-url">http://taskment.54.179.62.168.nip.io</div>
              </div>
              
              {/* Visual mock content */}
              <div className="landing-mock-body">
                <div className="landing-mock-pulse" />
                <div className="landing-mock-lines">
                  <div className="landing-mock-line full" />
                  <div className="landing-mock-line five-sixths" />
                  <div className="landing-mock-line four-sixths" />
                </div>
                <div className="landing-mock-tags">
                  <div className="landing-mock-tag blue">Kanban</div>
                  <div className="landing-mock-tag purple">AI Chat</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <p>© 2026 Taskment System. Dự án Đồ án chuyên ngành phát triển bởi Phúc Dương.</p>
          <p>Môi trường vận hành thử nghiệm trên nền tảng AWS EC2.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
