function Loader({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin`}></div>
      </div>
      {text && <p className="text-sm text-slate-600 font-medium">{text}</p>}
    </div>
  );
}

export default Loader;
