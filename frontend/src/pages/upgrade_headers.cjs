const fs = require('fs');

function processFile(file, iconComponent, titleStr, descStr, color, gradient, shadow) {
    let content = fs.readFileSync(file, 'utf8');
    
    const headerStart = '<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">';
    
    if (content.includes(headerStart)) {
        content = content.replace(headerStart, `<motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 ${color}/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 ${color}/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>`);
        
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
        content = content.replace(/<\/div>\s*<div className="glass-card rounded-2xl/g, '</motion.div>\n\n      <div className="glass-card rounded-2xl');
    }

    // Add buttons
    content = content.replace(/className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"/g, 'className="flex items-center px-6 py-3 gradient-bg text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover-lift whitespace-nowrap text-sm font-bold tracking-wide transition-all"');
    content = content.replace(/className="flex items-center px-4 py-2\.5 bg-primary text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover-lift whitespace-nowrap text-sm font-medium"/g, 'className="flex items-center px-6 py-3 gradient-bg text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover-lift whitespace-nowrap text-sm font-bold tracking-wide transition-all"');

    // Table headers
    content = content.replace(/<thead className="bg-white\/30\/50">/g, '<thead className="bg-white/40 backdrop-blur-md border-b border-white/50">');
    content = content.replace(/<th className="px-6 py-4/g, '<th className="px-6 py-5');
    
    fs.writeFileSync(file, content);
}

processFile('Classes.jsx', 'GraduationCap', 'Class Management', 'View and manage school classes and schedules.', 'bg-blue-500', 'bg-gradient-to-br from-blue-500 to-cyan-400', 'shadow-blue-500/30');
processFile('Students.jsx', 'Users', 'Student Directory', 'Manage student records and class enrollments.', 'bg-indigo-500', 'bg-gradient-to-br from-indigo-500 to-purple-600', 'shadow-indigo-500/30');
processFile('Teachers.jsx', 'Users2', 'Teacher Management', 'Manage teaching staff profiles and assignments.', 'bg-purple-500', 'bg-gradient-to-br from-purple-500 to-pink-500', 'shadow-purple-500/30');

// Custom for AttendanceMarking
let am = fs.readFileSync('AttendanceMarking.jsx', 'utf8');
am = am.replace('<div className="flex justify-between items-center">', `<motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col w-full md:flex-row justify-between md:items-center">`);
am = am.replace('<h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>', `<div className="relative z-10 mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mr-4 shadow-lg shadow-amber-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <CheckSquare size={28} />
            </span>
            Attendance Marking
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium ml-[4.5rem]">Mark or update daily attendance for your classes.</p>
        </div>`);
// Ensure framer motion is imported and CheckSquare is imported in AttendanceMarking
if (!am.includes('framer-motion')) am = `import { motion } from 'framer-motion';\n` + am;
if (!am.includes('CheckSquare')) am = am.replace('import { Search, Save, Calendar, Edit3, X, CheckCircle, AlertCircle } from \'lucide-react\';', 'import { Search, Save, Calendar, Edit3, X, CheckCircle, AlertCircle, CheckSquare } from \'lucide-react\';');
// Fix the closing div for the header
am = am.replace(/<\/span>\s*<\/div>/, '</span>\n        </div>\n      </motion.div>');
fs.writeFileSync('AttendanceMarking.jsx', am);

// Custom for AttendanceReport
let ar = fs.readFileSync('AttendanceReport.jsx', 'utf8');
ar = ar.replace('<div className="flex justify-between items-center">', `<motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8 border border-white/60"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col w-full md:flex-row justify-between md:items-center">`);
ar = ar.replace('<h1 className="text-2xl font-bold text-gray-900">View Attendance Reports</h1>', `<div className="relative z-10 mb-4 md:mb-0">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
            <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <FileText size={28} />
            </span>
            Attendance Reports
          </h1>
          <p className="text-gray-500 text-base mt-2 font-medium ml-[4.5rem]">Generate analytics and view historical attendance.</p>
        </div>`);
// Ensure framer motion is imported
if (!ar.includes('framer-motion')) ar = `import { motion } from 'framer-motion';\n` + ar;
// Fix button styling
ar = ar.replace(/className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"/, 'className="flex items-center px-6 py-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl hover:shadow-lg hover:shadow-emerald-500/30 hover-lift font-bold tracking-wide transition-all z-10"');
ar = ar.replace(/<\/button>\s*<\/div>/, '</button>\n        </div>\n      </motion.div>');
fs.writeFileSync('AttendanceReport.jsx', ar);

console.log('Upgraded ALL headers and UI elements!');
