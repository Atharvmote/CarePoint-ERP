import { useState, useEffect, useRef } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const DOCTORS = [
  { id: 1, name: "Dr. Ananya Sharma", spec: "Cardiology", exp: 18, img: "https://i.pravatar.cc/300?img=47", rating: 4.9, patients: 3200 },
  { id: 2, name: "Dr. Rohan Mehta", spec: "Neurology", exp: 14, img: "https://i.pravatar.cc/300?img=12", rating: 4.8, patients: 2800 },
  { id: 3, name: "Dr. Priya Nair", spec: "Orthopedics", exp: 11, img: "https://i.pravatar.cc/300?img=45", rating: 4.9, patients: 2100 },
  { id: 4, name: "Dr. Vikram Joshi", spec: "Oncology", exp: 20, img: "https://i.pravatar.cc/300?img=15", rating: 4.7, patients: 1900 },
  { id: 5, name: "Dr. Sneha Kulkarni", spec: "Pediatrics", exp: 9, img: "https://i.pravatar.cc/300?img=44", rating: 4.9, patients: 3500 },
  { id: 6, name: "Dr. Arjun Patel", spec: "Cardiology", exp: 16, img: "https://i.pravatar.cc/300?img=52", rating: 4.8, patients: 2600 },
  { id: 7, name: "Dr. Kavya Reddy", spec: "Dermatology", exp: 8, img: "https://i.pravatar.cc/300?img=49", rating: 4.7, patients: 1800 },
  { id: 8, name: "Dr. Suresh Iyer", spec: "Neurology", exp: 22, img: "https://i.pravatar.cc/300?img=59", rating: 4.9, patients: 3100 },
];

const SERVICES = [
  { icon: "❤️", title: "Cardiology", desc: "Advanced cardiac care with state-of-the-art catheterization labs and electrophysiology units." },
  { icon: "🧠", title: "Neurology", desc: "Comprehensive neurological treatments for stroke, epilepsy, and movement disorders." },
  { icon: "🦴", title: "Orthopedics", desc: "Joint replacement, sports medicine, and minimally invasive spine surgery." },
  { icon: "🔬", title: "Oncology", desc: "Personalized cancer care with precision oncology and immunotherapy programs." },
  { icon: "👶", title: "Pediatrics", desc: "Dedicated child care from neonatal intensive care to adolescent medicine." },
  { icon: "🫁", title: "Pulmonology", desc: "Expert management of respiratory diseases and critical care medicine." },
];

const TESTIMONIALS = [
  { name: "Meera Krishnan", text: "CarePoint gave me a second chance at life. The cardiology team was exceptional — caring, thorough, and always available.", role: "Cardiac Patient", img: "https://i.pravatar.cc/100?img=47" },
  { name: "Rajesh Tiwari", text: "The neurology department is world-class. Dr. Mehta's expertise and the staff's warmth made a frightening experience feel safe.", role: "Neurology Patient", img: "https://i.pravatar.cc/100?img=52" },
  { name: "Anita Desai", text: "From reception to recovery, every interaction felt personal. CarePoint truly lives up to its promise of compassionate care.", role: "Orthopedic Patient", img: "https://i.pravatar.cc/100?img=44" },
];

const SPECIALIZATIONS = ["All", "Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics", "Dermatology"];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { margin: 0; padding: 0; }
  
  :root {
    --navy: #0a1628;
    --blue: #1a56db;
    --blue-light: #3b82f6;
    --blue-pale: #eff6ff;
    --teal: #0e9f9f;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-300: #cbd5e1;
    --gray-500: #64748b;
    --gray-700: #334155;
    --gold: #f59e0b;
  }

  body { font-family: 'DM Sans', sans-serif; color: var(--navy); background: var(--white); }
  h1,h2,h3 { font-family: 'Playfair Display', serif; }

  .page { min-height: 100vh; }
  
  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(26,86,219,0.08);
    transition: box-shadow 0.3s; width: 100%;
  }
  .nav.scrolled { box-shadow: 0 4px 30px rgba(10,22,40,0.1); }
  .nav-inner {
    width: 100%; padding: 0 48px;
    display: flex; align-items: center; justify-content: space-between;
    height: 72px; box-sizing: border-box;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-logo-icon {
    width: 38px; height: 38px; background: linear-gradient(135deg, var(--blue), var(--teal));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: white;
  }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--navy); line-height: 1; }
  .nav-logo-sub { font-size: 10px; font-weight: 400; color: var(--blue); letter-spacing: 1.5px; text-transform: uppercase; }
  .nav-links { display: flex; gap: 6px; align-items: center; }
  .nav-link {
    padding: 8px 16px; border-radius: 8px; font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; color: var(--gray-700); border: none; background: none;
  }
  .nav-link:hover { background: var(--blue-pale); color: var(--blue); }
  .nav-link.active { color: var(--blue); background: var(--blue-pale); }
  .nav-cta {
    padding: 10px 22px; background: var(--blue); color: white; border: none;
    border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;
    transition: all 0.2s; box-shadow: 0 4px 14px rgba(26,86,219,0.3);
  }
  .nav-cta:hover { background: #1748c0; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,86,219,0.4); }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; }
  .hamburger span { width: 24px; height: 2px; background: var(--navy); border-radius: 2px; transition: all 0.3s; }

  /* HERO */
  .hero {
    min-height: 100vh; background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 40%, #f0fffe 100%);
    display: flex; align-items: center; position: relative; overflow: hidden; padding-top: 72px; width: 100vw; margin-left: calc(-50vw + 50%);
  }
  .hero-bg-circle {
    position: absolute; border-radius: 50%;
    background: linear-gradient(135deg, rgba(26,86,219,0.06), rgba(14,159,159,0.06));
    animation: float 8s ease-in-out infinite;
  }
  @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.03)} }
  .hero-inner { max-width: 1400px; margin: 0 auto; padding: 80px 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: white; border: 1px solid rgba(26,86,219,0.15);
    padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; color: var(--blue);
    margin-bottom: 24px; box-shadow: 0 2px 12px rgba(26,86,219,0.08);
  }
  .hero-badge-dot { width: 6px; height: 6px; background: var(--teal); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
  .hero h1 { font-size: clamp(40px,5vw,64px); line-height: 1.1; color: var(--navy); margin-bottom: 20px; }
  .hero h1 span { color: var(--blue); }
  .hero-tagline { font-size: 20px; color: var(--gray-500); margin-bottom: 40px; line-height: 1.6; font-weight: 300; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary {
    padding: 16px 32px; background: linear-gradient(135deg, var(--blue), #2563eb);
    color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 24px rgba(26,86,219,0.35);
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(26,86,219,0.45); }
  .btn-secondary {
    padding: 16px 32px; background: white; color: var(--navy); border: 1.5px solid var(--gray-300);
    border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-secondary:hover { border-color: var(--blue); color: var(--blue); transform: translateY(-2px); }
  .hero-stats { display: flex; gap: 32px; margin-top: 48px; }
  .hero-stat-num { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--navy); }
  .hero-stat-label { font-size: 13px; color: var(--gray-500); margin-top: 2px; }
  .hero-visual { position: relative; }
  .hero-card-main {
    background: white; border-radius: 24px; padding: 32px;
    box-shadow: 0 24px 80px rgba(10,22,40,0.12); position: relative; z-index: 2;
  }
  .hero-card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: var(--blue); font-weight: 600; margin-bottom: 16px; }
  .hero-doctor-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 12px; margin-bottom: 10px; }
  .hero-doctor-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
  .hero-doctor-name { font-size: 14px; font-weight: 600; color: var(--navy); }
  .hero-doctor-spec { font-size: 12px; color: var(--gray-500); }
  .hero-doctor-avail { margin-left: auto; font-size: 11px; color: #16a34a; background: #dcfce7; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .hero-card-float {
    position: absolute; background: white; border-radius: 16px;
    box-shadow: 0 12px 40px rgba(10,22,40,0.12); padding: 16px 20px; z-index: 3;
  }
  .hero-card-float.top { top: -20px; right: -20px; }
  .hero-card-float.bottom { bottom: -20px; left: -20px; }
  .float-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--blue); }
  .float-label { font-size: 12px; color: var(--gray-500); }

  .section { padding: 96px 0; width: 100vw; margin-left: calc(-50vw + 50%); }
  .section-alt { background: var(--gray-50); }
  .section-inner { max-width: 1400px; margin: 0 auto; padding: 0 48px; }
  .section-header { text-align: center; margin-bottom: 56px; }
  .section-tag { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: var(--blue); font-weight: 600; margin-bottom: 12px; display: block; }
  .section-title { font-size: clamp(28px,4vw,42px); color: var(--navy); margin-bottom: 16px; }
  .section-sub { font-size: 17px; color: var(--gray-500); max-width: 520px; margin: 0 auto; line-height: 1.6; font-weight: 300; }

  /* SERVICES */
  .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .service-card {
    background: white; border: 1px solid rgba(26,86,219,0.08);
    border-radius: 20px; padding: 36px 28px;
    transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden;
  }
  .service-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(26,86,219,0.03), rgba(14,159,159,0.03));
    opacity: 0; transition: opacity 0.3s;
  }
  .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(10,22,40,0.1); border-color: rgba(26,86,219,0.2); }
  .service-card:hover::before { opacity: 1; }
  .service-icon { font-size: 36px; margin-bottom: 20px; }
  .service-title { font-size: 20px; font-weight: 600; color: var(--navy); margin-bottom: 12px; font-family: 'DM Sans', sans-serif; }
  .service-desc { font-size: 15px; color: var(--gray-500); line-height: 1.7; }
  .service-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; color: var(--blue); font-size: 14px; font-weight: 600; transition: gap 0.2s; }
  .service-card:hover .service-link { gap: 10px; }

  /* DOCTOR CARD */
  .doctors-filter { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 44px; }
  .filter-btn {
    padding: 9px 20px; border-radius: 100px; font-size: 14px; font-weight: 500;
    border: 1.5px solid var(--gray-300); background: white; color: var(--gray-700);
    cursor: pointer; transition: all 0.2s;
  }
  .filter-btn.active, .filter-btn:hover { background: var(--blue); color: white; border-color: var(--blue); }
  .doctors-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .doctor-card {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 2px 16px rgba(10,22,40,0.06);
    transition: all 0.3s; border: 1px solid rgba(10,22,40,0.06);
  }
  .doctor-card:hover { transform: translateY(-8px); box-shadow: 0 24px 64px rgba(10,22,40,0.12); }
  .doctor-img-wrap { position: relative; height: 220px; overflow: hidden; background: linear-gradient(135deg, #e8f4fd, #f0fffe); }
  .doctor-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .doctor-card:hover .doctor-img { transform: scale(1.05); }
  .doctor-spec-badge {
    position: absolute; top: 14px; left: 14px;
    background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
    padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--blue);
  }
  .doctor-info { padding: 20px; }
  .doctor-name { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .doctor-details { font-size: 13px; color: var(--gray-500); margin-bottom: 14px; }
  .doctor-rating { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--gray-500); }
  .star { color: var(--gold); }
  .doctor-book {
    width: 100%; margin-top: 14px; padding: 11px;
    background: var(--blue-pale); color: var(--blue); border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .doctor-book:hover { background: var(--blue); color: white; }

  /* TESTIMONIALS */
  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .testimonial-card {
    background: white; border-radius: 20px; padding: 36px; position: relative;
    box-shadow: 0 2px 16px rgba(10,22,40,0.06); border: 1px solid rgba(10,22,40,0.05);
    transition: all 0.3s;
  }
  .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(10,22,40,0.1); }
  .quote-icon { font-size: 48px; color: var(--blue); opacity: 0.15; position: absolute; top: 24px; right: 28px; font-family: Georgia, serif; line-height: 1; }
  .testimonial-text { font-size: 15px; color: var(--gray-700); line-height: 1.8; margin-bottom: 24px; font-style: italic; }
  .testimonial-author { display: flex; align-items: center; gap: 12px; }
  .testimonial-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--blue-pale); }
  .testimonial-name { font-size: 15px; font-weight: 700; color: var(--navy); }
  .testimonial-role { font-size: 12px; color: var(--blue); }

  /* ABOUT */
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; margin-bottom: 80px; }
  .about-img-wrap { position: relative; }
  .about-img-main { width: 100%; height: 460px; object-fit: cover; border-radius: 24px; display: block; background: linear-gradient(135deg, #dbeafe, #ccfbf1); }
  .about-img-placeholder { width: 100%; height: 460px; background: linear-gradient(135deg, #dbeafe 0%, #cffafe 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 80px; }
  .about-accent {
    position: absolute; bottom: -24px; right: -24px;
    width: 160px; height: 160px; background: linear-gradient(135deg, var(--blue), var(--teal));
    border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: white; box-shadow: 0 16px 48px rgba(26,86,219,0.35);
  }
  .about-accent-num { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; }
  .about-accent-label { font-size: 12px; text-align: center; opacity: 0.9; }
  .about-content h2 { font-size: 38px; color: var(--navy); margin-bottom: 20px; }
  .about-content p { font-size: 16px; color: var(--gray-500); line-height: 1.8; margin-bottom: 20px; }
  .about-mv { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
  .about-mv-card { background: var(--blue-pale); border-radius: 16px; padding: 24px; }
  .about-mv-title { font-size: 16px; font-weight: 700; color: var(--blue); margin-bottom: 8px; }
  .about-mv-text { font-size: 14px; color: var(--gray-700); line-height: 1.6; }
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
  .stat-card {
    background: white; border-radius: 20px; padding: 36px 24px; text-align: center;
    box-shadow: 0 2px 16px rgba(10,22,40,0.06); border: 1px solid rgba(10,22,40,0.05);
    transition: all 0.3s;
  }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(10,22,40,0.1); }
  .stat-icon { font-size: 36px; margin-bottom: 16px; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: var(--blue); }
  .stat-label { font-size: 14px; color: var(--gray-500); margin-top: 6px; }

  /* CONTACT */
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
  .contact-form-wrap { background: white; border-radius: 24px; padding: 48px; box-shadow: 0 4px 32px rgba(10,22,40,0.08); }
  .form-group { margin-bottom: 24px; }
  .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 8px; }
  .form-input {
    width: 100%; padding: 14px 18px; border: 1.5px solid var(--gray-300); border-radius: 12px;
    font-size: 15px; font-family: 'DM Sans', sans-serif; color: var(--navy);
    transition: all 0.2s; outline: none; background: var(--gray-50);
  }
  .form-input:focus { border-color: var(--blue); background: white; box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
  textarea.form-input { resize: vertical; min-height: 140px; }
  .contact-info { display: flex; flex-direction: column; gap: 28px; }
  .contact-info-title { font-size: 30px; color: var(--navy); margin-bottom: 12px; }
  .contact-info-sub { font-size: 16px; color: var(--gray-500); line-height: 1.6; margin-bottom: 32px; }
  .info-item { display: flex; gap: 16px; align-items: flex-start; }
  .info-icon { width: 48px; height: 48px; background: var(--blue-pale); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .info-label { font-size: 13px; color: var(--blue); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .info-value { font-size: 15px; color: var(--navy); margin-top: 2px; font-weight: 500; }
  .map-placeholder {
    margin-top: 32px; height: 200px; background: linear-gradient(135deg, #dbeafe, #cffafe);
    border-radius: 16px; display: flex; align-items: center; justify-content: center;
    font-size: 48px; border: 2px dashed rgba(26,86,219,0.2);
  }

  /* BOOKING */
  .booking-banner {
    background: linear-gradient(135deg, var(--navy) 0%, #1a3560 50%, #0e4f4f 100%);
    padding: 96px 24px; text-align: center; position: relative; overflow: hidden; width: 100vw; margin-left: calc(-50vw + 50%);
  }
  .booking-banner::before {
    content: ''; position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E") repeat;
  }
  .booking-inner { max-width: 1400px; margin: 0 auto; padding: 0 48px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .booking-banner h2 { font-size: clamp(28px,4vw,44px); color: white; margin-bottom: 16px; }
  .booking-banner p { font-size: 18px; color: rgba(255,255,255,0.7); margin-bottom: 40px; line-height: 1.6; }
  .booking-features { display: flex; justify-content: center; gap: 32px; margin-bottom: 40px; flex-wrap: wrap; }
  .booking-feature { color: rgba(255,255,255,0.8); font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .btn-white { padding: 16px 40px; background: white; color: var(--blue); border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  .btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.3); }

  /* FOOTER */
  .footer { background: var(--navy); color: rgba(255,255,255,0.7); padding: 64px 48px 32px; width: 100vw; margin-left: calc(-50vw + 50%); }
  .footer-inner { max-width: 1400px; margin: 0 auto; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-brand p { font-size: 14px; line-height: 1.8; margin-top: 16px; }
  .footer-col h4 { color: white; font-size: 15px; font-weight: 700; margin-bottom: 20px; font-family: 'DM Sans'; }
  .footer-col ul { list-style: none; }
  .footer-col ul li { margin-bottom: 10px; }
  .footer-col ul li a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; transition: color 0.2s; cursor: pointer; }
  .footer-col ul li a:hover { color: white; }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 28px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .social-links { display: flex; gap: 12px; }
  .social-btn { width: 36px; height: 36px; background: rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 14px; }
  .social-btn:hover { background: var(--blue); }

  /* MOBILE */
  @media (max-width: 1024px) {
    .doctors-grid { grid-template-columns: repeat(2, 1fr); }
    .services-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .hero-inner { grid-template-columns: 1fr; text-align: center; }
    .hero-visual { display: none; }
    .hero-stats { justify-content: center; }
    .hero-actions { justify-content: center; }
    .about-grid { grid-template-columns: 1fr; }
    .contact-grid { grid-template-columns: 1fr; }
    .testimonials-grid { grid-template-columns: 1fr; }
    .doctors-grid { grid-template-columns: 1fr; }
    .services-grid { grid-template-columns: 1fr; }
    .nav-links, .nav-cta { display: none; }
    .hamburger { display: flex; }
    .footer-grid { grid-template-columns: 1fr; }
    .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
    .booking-features { gap: 16px; }
    .about-mv { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: 1fr 1fr; }
  }

  /* ANIMATIONS */
  .fade-in { animation: fadeIn 0.6s ease forwards; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }

  /* MOBILE MENU */
  .mobile-menu {
    position: fixed; top: 72px; left: 0; right: 0; background: white;
    padding: 16px 24px; box-shadow: 0 8px 32px rgba(10,22,40,0.1); z-index: 99;
    border-top: 1px solid var(--gray-100);
  }
  .mobile-menu .nav-link { display: block; padding: 14px 0; border-bottom: 1px solid var(--gray-100); font-size: 16px; }
  .mobile-menu .nav-cta { display: block; width: 100%; margin-top: 16px; text-align: center; }

  /* TOAST */
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--navy); color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(10,22,40,0.2); z-index: 200; animation: slideIn 0.3s ease; font-size: 15px; font-weight: 500; }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, onBook }) {
  return (
    <div className="doctor-card">
      <div className="doctor-img-wrap">
        <img src={doctor.img} alt={doctor.name} className="doctor-img" />
        <span className="doctor-spec-badge">{doctor.spec}</span>
      </div>
      <div className="doctor-info">
        <div className="doctor-name">{doctor.name}</div>
        <div className="doctor-details">{doctor.exp} years experience · {doctor.patients.toLocaleString()} patients</div>
        <div className="doctor-rating">
          <span className="star">★</span> {doctor.rating} <span style={{ marginLeft: 4 }}>rating</span>
        </div>
        <button className="doctor-book" onClick={() => onBook(doctor.name)}>
          Book Appointment
        </button>
      </div>
    </div>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function HomePage({ onNavigate, onBooking }) {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-circle" style={{ width: 500, height: 500, top: -100, right: -100, opacity: 0.4 }} />
        <div className="hero-bg-circle" style={{ width: 300, height: 300, bottom: 0, left: -80, opacity: 0.3, animationDelay: "-4s" }} />
        <div className="hero-inner">
          <div>
            <div className="hero-badge fade-in">
              <span className="hero-badge-dot" /> NABL Accredited · ISO 9001:2015 Certified
            </div>
            <h1 className="fade-in stagger-1">
              Advanced Care<br /><span>with Compassion</span>
            </h1>
            <p className="hero-tagline fade-in stagger-2">
              CarePoint Digital-Healthcare delivers world-class medical expertise<br />combined with the warmth of personalised care.
            </p>
            <div className="hero-actions fade-in stagger-3">
              <button className="btn-primary" onClick={() => onBooking()}>
                📅 Book Appointment
              </button>
              <button className="btn-secondary" onClick={() => onNavigate("doctors")}>
                👨‍⚕️ Our Doctors
              </button>
            </div>
            <div className="hero-stats fade-in">
              {[["50K+", "Patients Annually"], ["120+", "Expert Doctors"], ["25+", "Specialities"]].map(([n, l]) => (
                <div key={l}>
                  <div className="hero-stat-num">{n}</div>
                  <div className="hero-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual fade-in">
            <div className="hero-card-float top">
              <div className="float-num">98%</div>
              <div className="float-label">Patient Satisfaction</div>
            </div>
            <div className="hero-card-main">
              <div className="hero-card-label">Available Today</div>
              {DOCTORS.slice(0, 3).map(d => (
                <div className="hero-doctor-row" key={d.id}>
                  <img src={d.img} alt={d.name} className="hero-doctor-img" />
                  <div>
                    <div className="hero-doctor-name">{d.name}</div>
                    <div className="hero-doctor-spec">{d.spec}</div>
                  </div>
                  <span className="hero-doctor-avail">Available</span>
                </div>
              ))}
            </div>
            <div className="hero-card-float bottom">
              <div className="float-num">24/7</div>
              <div className="float-label">Emergency Care</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">What We Offer</span>
            <h2 className="section-title">World-Class Specialities</h2>
            <p className="section-sub">Cutting-edge treatment across all major medical disciplines by India's finest specialists.</p>
          </div>
          <div className="services-grid">
            {SERVICES.map((s, i) => (
              <div className="service-card" key={s.title} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-icon">{s.icon}</div>
                <div className="service-title">{s.title}</div>
                <div className="service-desc">{s.desc}</div>
                <div className="service-link">Learn More →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP DOCTORS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Our Team</span>
            <h2 className="section-title">Meet Our Top Doctors</h2>
            <p className="section-sub">Board-certified specialists with decades of combined experience and thousands of lives transformed.</p>
          </div>
          <div className="doctors-grid">
            {DOCTORS.slice(0, 4).map(d => (
              <DoctorCard key={d.id} doctor={d} onBook={onBooking} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn-secondary" onClick={() => onNavigate("doctors")}>
              View All Doctors →
            </button>
          </div>
        </div>
      </section>

      {/* BOOKING BANNER */}
      <div className="booking-banner">
        <div className="booking-inner">
          <h2>Ready to Take the First Step?</h2>
          <p>Book an appointment in under 60 seconds. Choose your doctor, pick a time, and confirm — it's that simple.</p>
          <div className="booking-features">
            {["✓ No waiting in queues", "✓ Same-day appointments", "✓ Online consultations"].map(f => (
              <div className="booking-feature" key={f}>{f}</div>
            ))}
          </div>
          <button className="btn-white" onClick={() => onBooking()}>Book Your Appointment</button>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Patient Stories</span>
            <h2 className="section-title">Words That Inspire Us</h2>
            <p className="section-sub">Real experiences from real patients who trusted us with their health journeys.</p>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="quote-icon">"</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.img} alt={t.name} className="testimonial-avatar" />
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function DoctorsPage({ onBooking }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? DOCTORS : DOCTORS.filter(d => d.spec === filter);
  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-tag">Our Team</span>
          <h2 className="section-title">Find Your Doctor</h2>
          <p className="section-sub">Browse our team of specialists. Filter by department to find the right expert for your needs.</p>
        </div>
        <div className="doctors-filter">
          {SPECIALIZATIONS.map(s => (
            <button key={s} className={`filter-btn ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <div className="doctors-grid">
          {filtered.map(d => (
            <DoctorCard key={d.id} doctor={d} onBook={onBooking} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--gray-500)" }}>No doctors found in this speciality.</div>
        )}
      </div>
    </section>
  );
}

function AboutPage({ onBooking }) {
  return (
    <>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="section-inner">
          <div className="about-grid">
            <div className="about-img-wrap">
              <div className="about-img-placeholder">🏥</div>
              <div className="about-accent">
                <div className="about-accent-num">25+</div>
                <div className="about-accent-label">Years of<br />Excellence</div>
              </div>
            </div>
            <div className="about-content">
              <span className="section-tag" style={{ textAlign: "left", display: "block" }}>Our Story</span>
              <h2>Healing Lives Since 1999</h2>
              <p>CarePoint Digital-Healthcare was founded with one unwavering conviction: every patient deserves access to world-class medical care delivered with genuine compassion. Over 25 years, we have grown from a single 100-bed facility into a 600-bed multi-speciality institution recognised across India.</p>
              <p>Our integrated approach combines cutting-edge technology — from robotic surgeries to AI-assisted diagnostics — with the irreplaceable human element of empathetic care that defines the CarePoint experience.</p>
              <div className="about-mv">
                <div className="about-mv-card">
                  <div className="about-mv-title">🎯 Our Mission</div>
                  <div className="about-mv-text">To deliver accessible, affordable, and exceptional healthcare that transforms communities and enriches lives.</div>
                </div>
                <div className="about-mv-card">
                  <div className="about-mv-title">🌟 Our Vision</div>
                  <div className="about-mv-text">To be India's most trusted healthcare partner, setting new benchmarks in clinical excellence and patient experience.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="stats-row">
            {[
              { icon: "👥", num: "5,00,000+", label: "Patients Served" },
              { icon: "👨‍⚕️", num: "120+", label: "Expert Doctors" },
              { icon: "🏆", num: "25+", label: "Years of Excellence" },
              { icon: "🏥", num: "600+", label: "Hospital Beds" },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="booking-banner">
        <div className="booking-inner">
          <h2>Join the CarePoint Family</h2>
          <p>Experience healthcare that puts you at the center of everything we do.</p>
          <button className="btn-white" style={{ marginTop: 0 }} onClick={() => onBooking()}>Book an Appointment</button>
        </div>
      </div>
    </>
  );
}

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) setSubmitted(true);
  };
  return (
    <section className="section" style={{ paddingTop: 120 }}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-tag">Get In Touch</span>
          <h2 className="section-title">We're Here to Help</h2>
          <p className="section-sub">Reach out with any questions, appointment requests, or feedback. Our team responds within 2 hours.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-form-wrap">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontSize: 24, color: "var(--navy)", marginBottom: 12 }}>Message Received!</h3>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.6 }}>Thank you for reaching out. Our team will get back to you within 2 hours.</p>
                <button className="btn-primary" style={{ marginTop: 28 }} onClick={() => setSubmitted(false)}>Send Another Message</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 24, color: "var(--navy)", marginBottom: 28 }}>Send us a Message</h3>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" placeholder="How can we help you?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit}>Send Message →</button>
              </>
            )}
          </div>
          <div className="contact-info">
            <div>
              <h3 className="contact-info-title">Contact Information</h3>
              <p className="contact-info-sub">Visit us, call, or write — we're always ready to serve you.</p>
            </div>
            {[
              { icon: "📍", label: "Address", value: "12 Healthcare Avenue, Civil Lines\nNagpur, Maharashtra 440001" },
              { icon: "📞", label: "Phone", value: "+91 712 234 5678\n+91 712 234 5679 (Emergency)" },
              { icon: "✉️", label: "Email", value: "care@carepointdigital.in\nsupport@carepointdigital.in" },
              { icon: "🕐", label: "Hours", value: "OPD: Mon–Sat, 8 AM – 8 PM\nEmergency: 24/7" },
            ].map(i => (
              <div className="info-item" key={i.label}>
                <div className="info-icon">{i.icon}</div>
                <div>
                  <div className="info-label">{i.label}</div>
                  {i.value.split("\n").map(v => <div className="info-value" key={v}>{v}</div>)}
                </div>
              </div>
            ))}
            <div className="map-placeholder">🗺️</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); setMenuOpen(false); }, [page]);

  const handleBooking = (docName) => {
    const msg = docName ? `Appointment request sent for ${docName}! ✅` : "Redirecting to booking portal... 📅";
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "doctors", label: "Doctors" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="page">

        {/* NAV */}
        <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
          <div className="nav-inner">
            <div className="nav-logo" onClick={() => setPage("home")}>
              <div className="nav-logo-icon">✚</div>
              <div>
                <div className="nav-logo-text">CarePoint</div>
                <div className="nav-logo-sub">Digital Healthcare</div>
              </div>
            </div>
            <div className="nav-links">
              {navItems.map(n => (
                <button key={n.id} className={`nav-link ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>{n.label}</button>
              ))}
            </div>
            <button className="nav-cta" onClick={() => handleBooking()}>Book Appointment</button>
            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </div>
          </div>
          {menuOpen && (
            <div className="mobile-menu">
              {navItems.map(n => (
                <button key={n.id} className={`nav-link ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>{n.label}</button>
              ))}
              <button className="nav-cta" onClick={() => handleBooking()}>Book Appointment</button>
            </div>
          )}
        </nav>

        {/* PAGE */}
        {page === "home" && <HomePage onNavigate={setPage} onBooking={handleBooking} />}
        {page === "doctors" && <DoctorsPage onBooking={handleBooking} />}
        {page === "about" && <AboutPage onBooking={handleBooking} />}
        {page === "contact" && <ContactPage />}

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-grid">
              <div className="footer-brand">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div className="nav-logo-icon" style={{ background: "rgba(255,255,255,0.1)" }}>✚</div>
                  <div style={{ color: "white", fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700 }}>CarePoint</div>
                </div>
                <p>Advanced care with compassion. Serving patients across Maharashtra with world-class medical expertise since 1999.</p>
                <div className="social-links" style={{ marginTop: 20 }}>
                  {["𝕏", "f", "in", "▶"].map((s, i) => <div key={i} className="social-btn">{s}</div>)}
                </div>
              </div>
              {[
                { title: "Specialities", links: ["Cardiology", "Neurology", "Orthopedics", "Oncology", "Pediatrics"] },
                { title: "Hospital", links: ["About Us", "Our Doctors", "Careers", "News & Media", "CSR"] },
                { title: "Patient Info", links: ["Book Appointment", "Patient Rights", "Insurance", "Feedback", "Contact"] },
              ].map(col => (
                <div className="footer-col" key={col.title}>
                  <h4>{col.title}</h4>
                  <ul>{col.links.map(l => <li key={l}><a>{l}</a></li>)}</ul>
                </div>
              ))}
            </div>
            <div className="footer-bottom">
              <div>© 2025 CarePoint Digital-Healthcare. All rights reserved.</div>
              <div style={{ display: "flex", gap: 24 }}>
                {["Privacy Policy", "Terms of Use", "Sitemap"].map(l => (
                  <a key={l} style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* TOAST */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
