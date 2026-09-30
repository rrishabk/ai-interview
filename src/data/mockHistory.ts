export interface HistoryRecord {
  id: string;
  date: string;
  company: string;
  role: string;
  type: 'Technical' | 'Behavioral' | 'Mixed';
  score: number | null;
  duration: string;
  status: 'Completed' | 'Incomplete' | 'Processing';
}

const companies = ['Google', 'Stripe', 'Netflix', 'Meta', 'Amazon', 'Vercel', 'Linear', 'OpenAI', 'Anthropic', 'Apple'];
const roles = ['Software Engineer Intern', 'Frontend Engineer', 'Fullstack Developer', 'Backend Engineer', 'UI Engineer', 'Senior Product Designer'];
const types: Array<'Technical' | 'Behavioral' | 'Mixed'> = ['Technical', 'Behavioral', 'Mixed'];
const statuses: Array<'Completed' | 'Incomplete' | 'Processing'> = ['Completed', 'Completed', 'Completed', 'Processing', 'Incomplete'];

export const mockHistory: HistoryRecord[] = Array.from({ length: 42 }).map((_, i) => {
  const isCompleted = Math.random() > 0.15;
  const status = isCompleted ? 'Completed' : statuses[Math.floor(Math.random() * statuses.length)];
  const score = status === 'Completed' ? Math.floor(Math.random() * 30) + 65 : null; // 65-94
  
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 60));
  const dateStr = dateObj.toISOString().split('T')[0];

  return {
    id: `int_h${i}`,
    date: dateStr,
    company: companies[Math.floor(Math.random() * companies.length)],
    role: roles[Math.floor(Math.random() * roles.length)],
    type: types[Math.floor(Math.random() * types.length)],
    score,
    duration: status === 'Completed' ? `${Math.floor(Math.random() * 20) + 35}m` : '--',
    status,
  };
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
