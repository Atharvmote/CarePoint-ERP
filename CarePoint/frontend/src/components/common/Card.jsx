function Card({ children, className = '', hover = false }) {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${
        hover ? 'hover:shadow-md transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
