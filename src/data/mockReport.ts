export const mockReport = {
  id: 'int_1a',
  role: 'Software Engineer Intern',
  company: 'Google',
  date: '24 September 2026',
  overallScore: 78,
  breakdown: [
    { label: 'Technical Reasoning', score: 84 },
    { label: 'Communication', score: 76 },
    { label: 'Answer Relevance', score: 81 },
    { label: 'Confidence', score: 73 },
    { label: 'Emotional Signals', score: 79 },
  ],
  scoreProgression: [
    { date: 'Q1', score: 82 },
    { date: 'Q2', score: 75 },
    { date: 'Q3', score: 78 },
    { date: 'Q4', score: 88 },
    { date: 'Q5', score: 72 },
    { date: 'Q6', score: 84 },
    { date: 'Q7', score: 76 },
  ],
  strengths: [
    "Strong command of foundational data structures, particularly when discussing trade-offs in distributed systems.",
    "Clear, methodical approach to system design, breaking down complex requirements into manageable components.",
    "Responsive to interviewer hints, quickly adapting approach when initial constraints were clarified."
  ],
  weaknesses: [
    "Tendency to over-explain simple concepts, which reduced the time available for deeper technical implementation details.",
    "Hesitation when discussing edge-case failure modes in database sharding.",
    "Speech pace increased significantly during technical hurdles, occasionally impacting clarity."
  ],
  recommendations: [
    "Practice summarizing initial approaches in 30-45 seconds before diving into code or architecture.",
    "Review distributed transaction failure modes to increase confidence in system design edge cases.",
    "Consciously pace speech during high-cognitive-load problem solving."
  ],
  questions: [
    {
      id: 'q1',
      number: 1,
      category: 'System Design',
      questionText: 'Explain how you would design a URL shortener capable of handling millions of requests per second.',
      candidateAnswer: 'I would start by considering the read-write ratio. Since this is highly read-heavy, I would introduce a caching layer like Redis. For the core generation, I would use a base62 encoding scheme against a distributed counter to prevent collisions.',
      score: 82,
      evaluation: 'Candidate correctly identified the read-heavy nature and proposed an appropriate caching mechanism. Base62 encoding is standard and correctly applied. Did not immediately address database scaling.',
      feedback: 'Good initial architecture. In the future, explicitly mention database choices (e.g., NoSQL vs SQL) early in the design.',
      speechAnalysis: 'Pace: 140 WPM. Pitch variance: Stable.',
      emotionAnalysis: 'Predominantly engaged, slight cognitive load detected during encoding discussion.',
      communicationSignals: 'Clear articulation, appropriate technical vocabulary.'
    },
    {
      id: 'q2',
      number: 2,
      category: 'Algorithm',
      questionText: 'How would you detect a cycle in a directed graph?',
      candidateAnswer: 'I would use depth-first search. While traversing, I would keep track of nodes in the current recursion stack using a set. If I encounter a node that is already in the recursion stack, then a cycle exists.',
      score: 88,
      evaluation: 'Flawless identification of the optimal algorithm. Correctly distinguished between visited nodes and nodes in the current recursion stack.',
      feedback: 'Excellent explanation. To push further, you could briefly mention the time complexity (O(V+E)) without being prompted.',
      speechAnalysis: 'Pace: 125 WPM. Pitch variance: Stable.',
      emotionAnalysis: 'High confidence, relaxed posture.',
      communicationSignals: 'Direct, concise, no filler words used.'
    },
    {
      id: 'q3',
      number: 3,
      category: 'Behavioral',
      questionText: 'Tell me about a time you disagreed with a senior engineer on your team.',
      candidateAnswer: 'Well, there was a time we were debating whether to use REST or GraphQL. I thought GraphQL was better for our specific frontend needs because we were over-fetching data. I built a quick prototype to show the payload reduction. The senior engineer reviewed it and agreed it was the right path.',
      score: 75,
      evaluation: 'Good use of the STAR method. Demonstrated proactive problem solving by building a prototype rather than just arguing. Could have elaborated more on how the disagreement was communicated initially.',
      feedback: 'Strong resolution. Ensure you spend a bit more time explaining the interpersonal dynamic and how you ensured the conversation remained constructive.',
      speechAnalysis: 'Pace: 160 WPM (Slightly rushed). Pitch variance: Elevated.',
      emotionAnalysis: 'Mild tension detected during setup, resolving to positive signals during the conclusion.',
      communicationSignals: 'Frequent use of "I" rather than "We", standard for behavioral answers.'
    }
  ]
};
