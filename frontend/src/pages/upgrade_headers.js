const fs = require('fs');

const upgradeHeader = (file, iconName, title, subtitle, color, bgGradient, shadowColor) => {
  let content = fs.readFileSync(file, 'utf8');
  
  const regex = /<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">[\s\S]*?<p className="text-gray-500 text-sm mt-1">.*?<\/p>\s*<\/div>/;
  
  const newHeader = `<motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 ${color}/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 ${color}/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <span className="w-14 h-14 rounded-2xl ${bgGradient} text-white flex items-center justify-center mr-4 shadow-lg ${shadowColor} transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <${iconName} size={28} />
            </span>
            ${title}
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium ml-[4.5rem]">${subtitle}</p>
        </div>`;
        
  if (content.match(regex)) {
    content = content.replace(regex, newHeader);
    
    // Also upgrade the search bar and buttons part if possible, they are just after the matched div
    // We can just leave them as is, they'll be inside the motion.div because we matched up to the closing </div> of the title block.
    // Wait, the original had:
    // <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    //   <div>...title...</div>
    //   <div>...search & add...</div>
    // </div>
    // My regex only matched up to the first </div>! So the search part is intact and will act as the second child of my motion.div.
    
    // Finally, replace the closing </div> of the original flex container with </motion.div>
    // To do this safely, I can just find the end of the flex container. But it's easier to just replace the first </div> closing the search block, wait, let's just use string replacement for the exact block.
  }
  
  fs.writeFileSync(file, content);
};

// Instead of complex regex, let's do targeted string replacements.

function processFile(file, iconComponent, titleStr, descStr, color, gradient, shadow) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find the header block
    const headerStart = '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">';
    
    if (content.includes(headerStart)) {
        content = content.replace(headerStart, `<motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 ${color}/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 ${color}/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>`);
        
        // Find the title div
        const titleRegex = /<div>\s*<h1 className="text-2xl font-bold text-gray-900 flex items-center">[\s\S]*?<p className="text-gray-500 text-sm mt-1">.*?<\/p>\s*<\/div>/;
        
        const newTitle = `<div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <span className="w-14 h-14 rounded-2xl ${gradient} text-white flex items-center justify-center mr-4 shadow-lg ${shadow} transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <${iconComponent} size={28} />
            </span>
            ${titleStr}
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium ml-[4.5rem]">${descStr}</p>
        </div>`;
        
        content = content.replace(titleRegex, newTitle);
        
        // Find the closing </div> of the header wrapper. 
        // It's tricky with regex, but we know it's followed by `<div className="glass-card rounded-2xl`
        content = content.replace(/<\/div>\s*<div className="glass-card rounded-2xl/g, '</motion.div>\n\n      <div className="glass-card rounded-2xl');
    }
    
    // Make Add Buttons premium
    content = content.replace(/className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"/g, 'className="flex items-center px-6 py-3 gradient-bg text-white rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover-lift whitespace-nowrap text-sm font-bold tracking-wide transition-all"');
    content = content.replace(/className="flex items-center px-4 py-2\.5 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"/g, 'className="flex items-center px-6 py-3 gradient-bg text-white rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover-lift whitespace-nowrap text-sm font-bold tracking-wide transition-all"');

    // Make table headers glassier
    content = content.replace(/<thead className="bg-white\/30\/50">/g, '<thead className="bg-white/40 backdrop-blur-md border-b border-white/50">');
    
    // Increase table padding
    content = content.replace(/<th className="px-6 py-4/g, '<th className="px-6 py-5');
    
    fs.writeFileSync(file, content);
}

processFile('Classes.jsx', 'GraduationCap', 'Class Management', 'View and manage school classes and schedules.', 'bg-blue-500', 'bg-gradient-to-br from-blue-500 to-cyan-400', 'shadow-blue-500/30');
processFile('Students.jsx', 'Users', 'Student Directory', 'Manage student records and class enrollments.', 'bg-indigo-500', 'bg-gradient-to-br from-indigo-500 to-purple-600', 'shadow-indigo-500/30');
processFile('Teachers.jsx', 'Users2', 'Teacher Management', 'Manage teaching staff profiles and assignments.', 'bg-purple-500', 'bg-gradient-to-br from-purple-500 to-pink-500', 'shadow-purple-500/30');

console.log('Upgraded Classes, Students, Teachers headers and UI!');
