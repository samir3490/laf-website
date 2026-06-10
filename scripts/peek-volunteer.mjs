import { readFileSync } from 'fs';
const html = JSON.parse(readFileSync('src/content/pages.json','utf8'))['become-a-volunteer'].html;
// strip elementor hubspot widget area - find text sections
const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,'\n').split('\n').map(s=>s.trim()).filter(s=>s.length>20);
text.slice(0,25).forEach((t,i)=>console.log(i,t.slice(0,120)));
