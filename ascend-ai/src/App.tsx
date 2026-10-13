import { useState } from 'react'
import './App.css'

type ViewKey =
  | 'dashboard'
  | 'study'
  | 'career'
  | 'coding'
  | 'planner'
  | 'calendar'
  | 'chat'
  | 'documents'
  | 'analytics'
  | 'settings'

const navItems: Array<{ key: ViewKey; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: '▣' },
  { key: 'study', label: 'AI Study Assistant', icon: '✦' },
  { key: 'career', label: 'Career Mentor', icon: '◈' },
  { key: 'coding', label: 'Coding Assistant', icon: '<>' },
  { key: 'planner', label: 'Tasks & Planner', icon: '☑' },
  { key: 'calendar', label: 'Calendar', icon: '◫' },
  { key: 'chat', label: 'AI Chat', icon: '✉' },
  { key: 'documents', label: 'My Documents', icon: '▤' },
  { key: 'analytics', label: 'Progress & Analytics', icon: '◔' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
]

const summaryCards = [
  { label: 'Tasks Due Today', value: '6', delta: '+2 vs yesterday', tone: 'blue' },
  { label: 'Study Hours This Week', value: '18.5h', delta: '+4.2h', tone: 'violet' },
  { label: 'Courses in Progress', value: '7', delta: '3 active labs', tone: 'green' },
  { label: 'Current Study Streak', value: '12 days', delta: 'Strong momentum', tone: 'amber' },
]

const quickActions = [
  { title: 'Ask Your Notes', caption: 'Summaries & exam prep', icon: '✎', view: 'study' },
  { title: 'Analyze My Resume', caption: 'ATS-style match review', icon: '▣', view: 'career' },
  { title: 'Debug My Code', caption: 'Review logic & fixes', icon: '</>', view: 'coding' },
  { title: 'Create a Study Plan', caption: 'Daily intent and focus', icon: '◎', view: 'planner' },
  { title: 'Practice Interview', caption: 'Mock Q&A practice', icon: '◌', view: 'career' },
  { title: 'Start Voice Assistant', caption: 'Talk to your AI mentor', icon: '♫', view: 'chat' },
] as const

const scheduleItems = [
  { time: '08:30', title: 'Data Structures Revision', tag: 'Study', accent: 'blue' },
  { time: '10:15', title: 'Break & Walk', tag: 'Break', accent: 'green' },
  { time: '12:00', title: 'OS Assignment Draft', tag: 'Assignment', accent: 'purple' },
  { time: '17:00', title: 'Personal Errands', tag: 'Personal', accent: 'amber' },
]

const deadlines = [
  { title: 'Database Systems Quiz', subject: 'DBMS', due: 'Today, 05:00 PM', priority: 'High', status: 'In Progress' },
  { title: 'Operating Systems Lab', subject: 'OS', due: 'Wed, 08:00 PM', priority: 'Medium', status: 'Pending' },
  { title: 'Machine Learning Note Set', subject: 'ML', due: 'Fri, 11:59 PM', priority: 'Low', status: 'Ready' },
]

const productivityData = [52, 68, 54, 89, 74, 96, 83]

const studyDocuments = [
  { name: 'Algorithms_Chapter_6.pdf', date: 'Today', status: 'Demo upload' },
  { name: 'DBMS_Revision_Notes.pdf', date: 'Yesterday', status: 'Ready for Q&A' },
  { name: 'ML_Case_Study.pdf', date: '2 days ago', status: 'Simulated analysis' },
]

const messageHistory = [
  { author: 'You', text: 'Summarize this chapter in simple language.' },
  { author: 'AI', text: 'This chapter explains sorting complexity with big-O analysis. The key idea is that efficient algorithms reduce processing time as input size grows.' },
  { author: 'You', text: 'Give me 10 MCQs to test my understanding.' },
  { author: 'AI', text: 'Here are ten quick questions on asymptotic complexity, greedy choices, and merge sort behavior.' },
]

const sourceCards = [
  { doc: 'Algorithms_Chapter_6.pdf', page: 'Page 14', excerpt: 'The algorithm reduces work by splitting a problem into smaller segments.' },
]

const tasks = [
  { id: 1, title: 'Review compiler notes', category: 'CS', priority: 'Medium', due: 'Today, 6:00 PM', status: 'In Progress' },
  { id: 2, title: 'Practice OS interview questions', category: 'Career', priority: 'High', due: 'Tomorrow, 9:00 AM', status: 'To Do' },
  { id: 3, title: 'Complete ML assignment', category: 'ML', priority: 'High', due: 'Thu, 8:00 PM', status: 'Completed' },
]

const calendarEvents = [
  { date: 'Mon 14', title: 'Data Structures Sprint', category: 'Study', color: 'blue' },
  { date: 'Tue 15', title: 'Interview Practice', category: 'Career', color: 'violet' },
  { date: 'Wed 17', title: 'DBMS Quiz', category: 'Exam', color: 'green' },
  { date: 'Fri 18', title: 'Family Event', category: 'Personal', color: 'amber' },
]

const chats = [
  { title: 'Resume review', time: '2m ago' },
  { title: 'CS2 exam notes', time: '31m ago' },
  { title: 'Debugging a Python issue', time: '1h ago' },
]

const docLibrary = [
  { name: 'Networks_midterm.pdf', type: 'PDF', subject: 'Networking', uploaded: 'Today', status: 'Ready' },
  { name: 'DBMS_lab_02.docx', type: 'DOCX', subject: 'DBMS', uploaded: '2 days ago', status: 'Processing demo' },
  { name: 'Resume_2026_v2.pdf', type: 'PDF', subject: 'Career', uploaded: '5 days ago', status: 'Reviewed' },
]

const analyticsData = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 8 },
  { label: 'Sat', value: 3 },
  { label: 'Sun', value: 5 },
]

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [taskInput, setTaskInput] = useState('')
  const [customTasks, setCustomTasks] = useState(tasks)

  const currentPage = navItems.find((item) => item.key === activeView) ?? navItems[0]

  const addTask = () => {
    if (!taskInput.trim()) return
    setCustomTasks((prev) => [
      {
        id: prev.length + 1,
        title: taskInput,
        category: 'Personal',
        priority: 'Medium',
        due: 'This week',
        status: 'To Do',
      },
      ...prev,
    ])
    setTaskInput('')
  }

  const renderDashboard = () => (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Good morning, Student!</p>
          <h1>Your personal AI workspace is ready. What would you like to achieve today?</h1>
        </div>
        <div className="hero-meta">
          <div className="date-pill">Tuesday, 13 Oct 2026</div>
          <button className="primary-button">Create Study Plan</button>
        </div>
      </section>

      <section className="stats-grid">
        {summaryCards.map((card) => (
          <article className="stat-card" key={card.label}>
            <div className={`stat-dot ${card.tone}`} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.delta}</small>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-header">
          <h3>Quick actions</h3>
        </div>
        <div className="quick-grid">
          {quickActions.map((action) => (
            <button
              type="button"
              className="quick-card"
              key={action.title}
              onClick={() => setActiveView(action.view)}
            >
              <span className="quick-icon">{action.icon}</span>
              <strong>{action.title}</strong>
              <small>{action.caption}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="content-grid two-up">
        <div className="panel">
          <div className="section-header">
            <h3>Today&apos;s schedule</h3>
          </div>
          <div className="timeline-list">
            {scheduleItems.map((item) => (
              <div className="timeline-item" key={item.time}>
                <span className="time-badge">{item.time}</span>
                <div className={`timeline-dot ${item.accent}`} />
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.tag}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>Upcoming deadlines</h3>
          </div>
          <div className="deadline-list">
            {deadlines.map((item) => (
              <div className="deadline-item" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {item.subject} • {item.due}
                  </small>
                </div>
                <div className="deadline-meta">
                  <span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span>
                  <span className="status-pill">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h3>Weekly productivity</h3>
        </div>
        <div className="chart-grid" aria-label="Study hours over the last seven days">
          {productivityData.map((value, index) => (
            <div className="bar-column" key={`${value}-${index}`}>
              <span className="bar" style={{ height: `${value}%` }} />
              <label>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</label>
            </div>
          ))}
        </div>
      </section>

      <section className="insight-panel panel">
        <div>
          <p className="eyebrow">AI daily insight</p>
          <h3>Focus on time complexity practice before your DBMS quiz this afternoon.</h3>
          <p>
            Your study pattern is most consistent in the early morning. A 45-minute review block on
            sorting and hash tables should improve your confidence before the exam.
          </p>
        </div>
        <button className="secondary-button">Create plan</button>
      </section>
    </div>
  )

  const renderStudy = () => (
    <div className="page-stack">
      <section className="panel split-panel">
        <aside className="document-panel">
          <div className="section-header compact">
            <h3>Documents</h3>
            <button className="secondary-button small">Upload</button>
          </div>
          <div className="search-box">Search documents</div>
          <div className="document-list">
            {studyDocuments.map((doc) => (
              <div className="document-item" key={doc.name}>
                <div className="doc-icon">PDF</div>
                <div>
                  <strong>{doc.name}</strong>
                  <small>
                    {doc.date} • {doc.status}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="upload-box">
            <strong>Demo upload zone</strong>
            <span>Upload a PDF to simulate document processing.</span>
          </div>
        </aside>

        <div className="chat-panel">
          <div className="tab-row">
            <button className="tab-button active">Ask Questions</button>
            <button className="tab-button">Summaries</button>
            <button className="tab-button">Quiz Generator</button>
            <button className="tab-button">Flashcards</button>
          </div>

          <div className="message-list">
            {messageHistory.map((message, index) => (
              <div className={`message-bubble ${message.author === 'AI' ? 'assistant' : 'user'}`} key={`${message.author}-${index}`}>
                <span>{message.author}</span>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="suggestions-row">
            {['Summarize this chapter.', 'Explain this topic simply.', 'Generate 10 MCQs.', 'Prepare short exam notes.'].map((prompt) => (
              <button type="button" className="suggestion-pill" key={prompt}>{prompt}</button>
            ))}
          </div>

          <div className="chat-box">
            <input type="text" value="Explain this with examples" readOnly />
            <button className="primary-button">Send</button>
          </div>

          <div className="source-panel">
            {sourceCards.map((card) => (
              <div className="source-card" key={card.doc}>
                <strong>{card.doc}</strong>
                <span>{card.page}</span>
                <p>{card.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const renderCareer = () => (
    <div className="page-stack">
      <section className="panel resume-panel">
        <div className="resume-header">
          <div>
            <p className="eyebrow">Resume analyzer</p>
            <h3>ATS-style match estimate</h3>
          </div>
          <div className="score-pill">82% match</div>
        </div>
        <div className="two-column-grid">
          <div className="upload-card">
            <strong>Upload resume</strong>
            <span>Drag and drop PDF or DOCX</span>
            <button className="secondary-button">Browse files</button>
          </div>
          <div className="job-form">
            <label>
              Target role
              <input value="Software Engineer Intern" readOnly />
            </label>
            <label>
              Job description
              <textarea rows={4} value="Build APIs, work with React, contribute to cloud services, write tests, and improve system reliability." readOnly />
            </label>
            <button className="primary-button">Analyze Resume</button>
          </div>
        </div>
      </section>

      <section className="content-grid two-up">
        <div className="panel">
          <div className="section-header">
            <h3>Skills identified</h3>
          </div>
          <div className="skill-pills">
            {['React', 'TypeScript', 'Node.js', 'System Design', 'Python', 'SQL'].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <ul className="bullet-list">
            <li>Strong frontend foundation and clean component structure.</li>
            <li>Good experience with user-focused product thinking.</li>
            <li>Need stronger system design language and cloud deployment examples.</li>
          </ul>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>Interview practice</h3>
          </div>
          <div className="job-form compact">
            <label>
              Role
              <input value="Frontend Engineer" readOnly />
            </label>
            <label>
              Experience level
              <input value="Mid-level" readOnly />
            </label>
            <button className="primary-button">Start Practice Interview</button>
          </div>
          <div className="interview-card">
            <strong>Question</strong>
            <p>How would you optimize a React dashboard that renders too many charts during rapid updates?</p>
            <textarea rows={4} value="Answer in your own words..." readOnly />
          </div>
        </div>
      </section>
    </div>
  )

  const renderCoding = () => (
    <div className="page-stack">
      <section className="panel coding-panel">
        <div className="section-header compact">
          <h3>AI Coding Assistant</h3>
          <div className="language-pills">
            {['Python', 'JavaScript', 'Java', 'C++', 'C'].map((lang) => (
              <button type="button" className={`mini-tag ${lang === 'Python' ? 'active' : ''}`} key={lang}>{lang}</button>
            ))}
          </div>
        </div>

        <div className="code-layout">
          <div className="editor-block">
            <textarea rows={18} value={`def find_duplicates(nums):
    seen = set()
    dupes = set()
    for value in nums:
        if value in seen:
            dupes.add(value)
        seen.add(value)
    return sorted(dupes)

print(find_duplicates([1, 2, 2, 3, 4, 4]))`} readOnly />
          </div>
          <div className="response-block">
            <div className="response-header">
              <button className="secondary-button small">Explain Code</button>
              <button className="secondary-button small">Debug Code</button>
              <button className="secondary-button small">Review</button>
            </div>
            <div className="analysis-box">
              <h4>Summary</h4>
              <p>The function correctly identifies repeated numbers but loses the original order of first appearance.</p>
              <h4>Detected issue</h4>
              <p>The result is a set, so duplicates are removed and the output order is not stable.</p>
              <h4>Suggested fix</h4>
              <pre>{`def find_duplicates(nums):
    seen = set()
    output = []
    for num in nums:
        if num in seen and num not in output:
            output.append(num)
        seen.add(num)
    return output`}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  const renderPlanner = () => (
    <div className="page-stack">
      <section className="panel planner-shell">
        <div className="planner-form">
          <div className="section-header compact">
            <h3>Study plan generator</h3>
          </div>
          <label>
            Subject or exam
            <input value="Operating Systems" readOnly />
          </label>
          <label>
            Exam date
            <input value="Friday, 17 Oct" readOnly />
          </label>
          <label>
            Available study hours/day
            <input value="2.5 hours" readOnly />
          </label>
          <label>
            Topics to cover
            <textarea rows={3} value="Processes, memory management, scheduling algorithms, deadlocks" readOnly />
          </label>
          <button className="primary-button">Generate Demo Plan</button>
        </div>

        <div className="plan-grid">
          {['Mon', 'Tue', 'Wed', 'Thu'].map((day, index) => (
            <div className="plan-card" key={day}>
              <strong>{day}</strong>
              <ul>
                <li>{index + 1}. Scheduling intro • 30 min</li>
                <li>Memory hierarchy • 45 min</li>
                <li>Break • 15 min</li>
                <li>Quiz recap • 20 min</li>
              </ul>
              <label className="plan-check"><input type="checkbox" defaultChecked={index === 0} /> Completed</label>
            </div>
          ))}
        </div>
      </section>

      <section className="panel task-panel">
        <div className="section-header compact">
          <h3>Task manager</h3>
          <button className="secondary-button small">Add task</button>
        </div>
        <div className="task-form-row">
          <input
            type="text"
            placeholder="Add task title"
            value={taskInput}
            onChange={(event) => setTaskInput(event.target.value)}
          />
          <button className="primary-button" onClick={addTask}>Save</button>
        </div>
        <div className="task-list">
          {customTasks.map((task) => (
            <div className="task-item" key={task.id}>
              <label className="task-check"><input type="checkbox" defaultChecked={task.status === 'Completed'} /> </label>
              <div>
                <strong>{task.title}</strong>
                <small>
                  {task.category} • {task.due}
                </small>
              </div>
              <span className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderCalendar = () => (
    <div className="page-stack">
      <section className="panel calendar-layout">
        <div className="calendar-grid">
          {Array.from({ length: 35 }).map((_, index) => {
            const isInMonth = index >= 2 && index <= 30
            const dateLabel = isInMonth ? String(index - 1) : ''
            return (
              <div className={`day-cell ${isInMonth ? 'current' : 'muted'}`} key={index}>
                {dateLabel || ''}
                {dateLabel === '12' && <span className="event-bubble blue">Study</span>}
                {dateLabel === '15' && <span className="event-bubble violet">Career</span>}
                {dateLabel === '17' && <span className="event-bubble green">Exam</span>}
              </div>
            )
          })}
        </div>

        <div className="event-panel">
          <div className="section-header compact">
            <h3>Upcoming events</h3>
          </div>
          <div className="event-list">
            {calendarEvents.map((event) => (
              <div className="event-item" key={event.title}>
                <span className={`event-dot ${event.color}`}></span>
                <div>
                  <strong>{event.title}</strong>
                  <small>{event.date}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const renderChat = () => (
    <div className="page-stack">
      <section className="panel chat-layout">
        <aside className="conversation-list">
          <div className="section-header compact">
            <h3>History</h3>
            <button className="secondary-button small">New</button>
          </div>
          {chats.map((chat) => (
            <div className="chat-thread" key={chat.title}>
              <strong>{chat.title}</strong>
              <small>{chat.time}</small>
            </div>
          ))}
        </aside>

        <div className="chat-window">
          <div className="chat-header">
            <span>Auto Mode</span>
            <span className="agent-badge">Study Agent</span>
          </div>
          <div className="message-list">
            <div className="message-bubble assistant">
              <span>AI</span>
              <p>Hello! I can help you plan revision, review your notes, or debug a coding problem.</p>
            </div>
            <div className="message-bubble user">
              <span>You</span>
              <p>Can you suggest a study sequence for my OS exam?</p>
            </div>
          </div>
          <div className="chat-textarea">
            <textarea rows={3} value="Draft a focused 2-hour revision plan for OS." readOnly />
            <button className="primary-button">Send</button>
          </div>
        </div>
      </section>
    </div>
  )

  const renderDocuments = () => (
    <div className="page-stack">
      <section className="panel document-library-panel">
        <div className="section-header compact">
          <h3>Document library</h3>
          <button className="primary-button small">Upload document</button>
        </div>

        <div className="toolbar-row">
          <input type="text" placeholder="Search documents" />
          <select defaultValue="All files">
            <option>All files</option>
            <option>PDF</option>
            <option>DOCX</option>
          </select>
        </div>

        <div className="document-grid">
          {docLibrary.map((doc) => (
            <div className="doc-card" key={doc.name}>
              <div className="doc-thumb">{doc.type}</div>
              <strong>{doc.name}</strong>
              <small>{doc.subject}</small>
              <span>{doc.uploaded}</span>
              <em>{doc.status}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderAnalytics = () => (
    <div className="page-stack">
      <section className="stats-grid">
        {[
          { label: 'Total study hours', value: '86.5h', tone: 'blue' },
          { label: 'Tasks completed', value: '24', tone: 'green' },
          { label: 'Weekly consistency', value: '92%', tone: 'violet' },
          { label: 'Learning streak', value: '12 days', tone: 'amber' },
        ].map((metric) => (
          <article className="stat-card" key={metric.label}>
            <div className={`stat-dot ${metric.tone}`} />
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid two-up">
        <div className="panel">
          <div className="section-header">
            <h3>Study hours by day</h3>
          </div>
          <div className="chart-grid mini" aria-label="Study hours chart">
            {analyticsData.map((point) => (
              <div className="bar-column" key={point.label}>
                <span className="bar alt" style={{ height: `${point.value * 12}%` }} />
                <label>{point.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>Goals vs actual</h3>
          </div>
          <div className="progress-stack">
            {[
              { label: 'Algorithms', actual: 82, target: 90 },
              { label: 'ML review', actual: 76, target: 85 },
              { label: 'Career prep', actual: 88, target: 80 },
            ].map((goal) => (
              <div className="progress-line" key={goal.label}>
                <div className="progress-labels">
                  <span>{goal.label}</span>
                  <strong>{goal.actual}%</strong>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${goal.actual}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )

  const renderSettings = () => (
    <div className="page-stack">
      <section className="panel settings-panel">
        <div className="tab-row small-tabs">
          <button className="tab-button active">Profile</button>
          <button className="tab-button">Preferences</button>
          <button className="tab-button">AI & Memory</button>
          <button className="tab-button">Notifications</button>
          <button className="tab-button">Privacy</button>
        </div>

        <div className="settings-grid">
          <div className="settings-block">
            <label>
              Name
              <input value="Aisha Rahman" readOnly />
            </label>
            <label>
              Email
              <input value="aisha@student.ai" readOnly />
            </label>
            <label>
              Program
              <input value="B.Tech Computer Science" readOnly />
            </label>
          </div>
          <div className="settings-block">
            <label>
              Theme
              <select defaultValue="Light mode">
                <option>Light mode</option>
                <option>Dark mode</option>
              </select>
            </label>
            <label>
              Preferred explanation style
              <select defaultValue="Simple and practical">
                <option>Simple and practical</option>
                <option>Deep technical</option>
              </select>
            </label>
            <label>
              Default coding language
              <select defaultValue="Python">
                <option>Python</option>
                <option>JavaScript</option>
                <option>Java</option>
              </select>
            </label>
          </div>
        </div>
      </section>
    </div>
  )

  const renderView = () => {
    switch (activeView) {
      case 'study':
        return renderStudy()
      case 'career':
        return renderCareer()
      case 'coding':
        return renderCoding()
      case 'planner':
        return renderPlanner()
      case 'calendar':
        return renderCalendar()
      case 'chat':
        return renderChat()
      case 'documents':
        return renderDocuments()
      case 'analytics':
        return renderAnalytics()
      case 'settings':
        return renderSettings()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className={`app-shell ${theme}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <strong>Ascend AI</strong>
            <small>Student workspace</small>
          </div>
        </div>

        <nav className="nav-menu" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => setActiveView(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar">AR</div>
          <div>
            <strong>Aisha Rahman</strong>
            <small>Computer Science</small>
          </div>
        </div>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {currentPage.label}</p>
            <h2>{currentPage.label}</h2>
          </div>

          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Search">⌕</button>
            <button type="button" className="icon-button" aria-label="Notifications">🔔</button>
            <button type="button" className="theme-toggle" onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
              {theme === 'light' ? 'Dark' : 'Light'} mode
            </button>
            <button type="button" className="primary-button">Ask AI</button>
          </div>
        </header>

        {renderView()}
      </main>
    </div>
  )
}

export default App
