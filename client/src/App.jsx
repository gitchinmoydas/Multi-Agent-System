import React, { useState, useRef } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import html2pdf from 'html2pdf.js'
import { 
  Search, 
  FileText, 
  ClipboardCheck, 
  Loader2, 
  Download, 
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FileBarChart,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Award,
  FileJson,
  FileOutput,
  Rocket,
  Brain,
  Zap
} from 'lucide-react'

const API_URL = 'https://multi-agent-system-kdix.onrender.com'

function App() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [research, setResearch] = useState(null)
  const [error, setError] = useState(null)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const reportRef = useRef(null)
  
  const [expandedSections, setExpandedSections] = useState({
    search: false,
    scraped: false,
    report: true,
    feedback: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const extractText = (data) => {
    if (!data) return 'No data available'
    if (typeof data === 'string') return data
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') return item
        if (item.text) return item.text
        if (item.content) return item.content
        return JSON.stringify(item)
      }).join('\n\n')
    }
    if (typeof data === 'object') {
      if (data.text) return data.text
      if (data.content) return data.content
      return JSON.stringify(data, null, 2)
    }
    return String(data)
  }

  const handleResearch = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Please enter a research topic')
      return
    }

    setLoading(true)
    setResearch(null)
    setError(null)
    
    const loadingToast = toast.loading('🚀 ResearchNova is analyzing... This may take a few minutes', {
      duration: Infinity
    })

    try {
      const response = await axios.post(`${API_URL}/research`, { 
        topic: topic 
      }, {
        timeout: 300000,
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Response received:', response.data)
      
      const processedData = {
        search_results: extractText(response.data.search_results),
        scraped_content: extractText(response.data.scraped_content),
        report: extractText(response.data.report),
        feedback: extractText(response.data.feedback)
      }
      
      setResearch(processedData)
      toast.success('✅ Research completed successfully!', { id: loadingToast })
      
    } catch (error) {
      console.error('Research failed:', error)
      let errorMessage = 'Research failed: '
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout. The research is taking too long.'
      } else if (error.response) {
        errorMessage += error.response.data?.detail || error.response.statusText
      } else if (error.request) {
        errorMessage += 'Cannot connect to backend server. Make sure it\'s running on port 8000'
      } else {
        errorMessage += error.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage, { id: loadingToast, duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text, type) => {
    if (text && text !== 'No data available') {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } else {
      toast.error(`No ${type} to copy`)
    }
  }

  const handleDownload = (content, filename) => {
    if (content && content !== 'No data available') {
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.endsWith('.md') ? filename : `${filename}.md`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('File downloaded!')
    } else {
      toast.error('No content to download')
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    
    setDownloadingPDF(true)
    toast.loading('Generating PDF...', { id: 'pdf-gen' })
    
    try {
      const element = reportRef.current.cloneNode(true)
      
      // Add professional header for PDF
      const header = document.createElement('div')
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 2px solid #8b5cf6;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h1 style="color: #6d28d9; margin-bottom: 10px; font-size: 28px;">ResearchNova Report</h1>
          </div>
          <p style="color: #6b7280;">Generated on ${new Date().toLocaleString()}</p>
          <p style="color: #8b5cf6; font-weight: bold;">Topic: ${topic}</p>
        </div>
      `
      element.insertBefore(header, element.firstChild)
      
      // Add footer with page numbers
      const footer = document.createElement('div')
      footer.innerHTML = `
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          <p>ResearchNova - AI-Powered Research Assistant</p>
        </div>
      `
      element.appendChild(footer)
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `ResearchNova_${getReportTitle()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      }
      
      await html2pdf().set(opt).from(element).save()
      toast.success('PDF downloaded successfully!', { id: 'pdf-gen' })
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('Failed to generate PDF', { id: 'pdf-gen' })
    } finally {
      setDownloadingPDF(false)
    }
  }

  // Custom markdown components for professional styling
  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b-2 border-purple-500 text-gray-900" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-300 text-gray-800" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-700" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-purple-400 pl-4 py-2 my-4 bg-purple-50 rounded-r-lg text-gray-700 italic" {...props} />
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-4"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono text-purple-600" {...props}>
          {children}
        </code>
      )
    },
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-100" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
    ),
    hr: ({ node, ...props }) => (
      <hr className="my-6 border-t-2 border-gray-200" {...props} />
    ),
    a: ({ node, href, children, ...props }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline" {...props}>
        {children}
      </a>
    ),
    strong: ({ node, ...props }) => (
      <strong className="font-bold text-gray-900" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-gray-600" {...props} />
    ),
  }

  const Section = ({ title, icon: Icon, section, children, color = 'purple', badge }) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600 border-purple-200',
      blue: 'from-blue-500 to-blue-600 border-blue-200',
      green: 'from-green-500 to-green-600 border-green-200',
      orange: 'from-orange-500 to-orange-600 border-orange-200',
      red: 'from-red-500 to-red-600 border-red-200',
      teal: 'from-teal-500 to-teal-600 border-teal-200'
    }

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl">
        <div 
          className={`bg-gradient-to-r ${colors[color]} p-4 cursor-pointer hover:opacity-95 transition-opacity`}
          onClick={() => toggleSection(section)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {badge && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {expandedSections[section] ? 
              <ChevronUp className="text-white" /> : 
              <ChevronDown className="text-white" />
            }
          </div>
        </div>
        
        {expandedSections[section] && (
          <div className="p-6">
            {children}
          </div>
        )}
      </div>
    )
  }

  // Extract title from report for download
  const getReportTitle = () => {
    if (research?.report && research.report !== 'No data available') {
      const firstLine = research.report.split('\n')[0]
      const cleanTitle = firstLine.replace(/^#+\s*/, '').replace(/[^\w\s-]/g, '').trim()
      return cleanTitle.substring(0, 50) || 'research-report'
    }
    return topic.replace(/\s+/g, '-').toLowerCase()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ResearchNova
                </h1>
                <p className="text-sm text-gray-500">AI-Powered Research Assistant • Search • Scrape • Analyze</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Powered by Mistral AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Research Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6">
            <form onSubmit={handleResearch}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your research topic... (e.g., 'Who will win the West Bengal Assembly Election 2026?')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="3"
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Start Research
                    </>
                  )}
                </button>
                
                {research && research.report && research.report !== 'No data available' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownload(research.report, `ResearchNova_${getReportTitle()}.md`)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2"
                    >
                      <FileJson className="w-4 h-4" />
                      Download MD
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-md"
                    >
                      {downloadingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileOutput className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Research Results */}
        {research && (
          <div className="space-y-6">
            {/* Executive Summary Card */}
            {research.report && research.report !== 'No data available' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg">
                <div className="flex items-start gap-3">
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Executive Summary</h2>
                    <p className="text-gray-700">
                      ResearchNova has completed a comprehensive analysis. The full report includes detailed findings, 
                      data-driven insights, and actionable recommendations. Review the complete report below.
                    </p>
                    <div className="flex gap-4 mt-4 text-sm text-purple-600">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> AI-Powered Analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Report - Professional Markdown Rendering */}
            {research.report && research.report !== 'No data available' && (
              <Section title="Research Report" icon={ClipboardCheck} section="report" color="purple" badge="Final">
                <div ref={reportRef} className="prose prose-lg max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {research.report}
                  </ReactMarkdown>
                </div>
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleCopy(research.report, 'Report')}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Report
                  </button>
                </div>
              </Section>
            )}

            {/* Critic Feedback */}
            {research.feedback && research.feedback !== 'No data available' && (
              <Section title="Peer Review & Feedback" icon={AlertCircle} section="feedback" color="orange" badge="Quality Check">
                <div className="prose prose-base max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {research.feedback}
                  </ReactMarkdown>
                </div>
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800">
                      <strong>Quality Assurance Note:</strong> The critic provides valuable feedback to improve report quality. 
                      Consider these suggestions for enhanced research outcomes.
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* Search Results - Collapsible */}
            {research.search_results && research.search_results !== 'No data available' && (
              <Section title="Search Results (Raw Data)" icon={Search} section="search" color="green" badge="Source">
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm">
                    {research.search_results}
                  </pre>
                </div>
                <button
                  onClick={() => handleCopy(research.search_results, 'Search results')}
                  className="mt-4 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy to clipboard
                </button>
              </Section>
            )}

            {/* Scraped Content - Collapsible */}
            {research.scraped_content && research.scraped_content !== 'No data available' && (
              <Section title="Scraped Content (Raw Data)" icon={FileText} section="scraped" color="blue" badge="Extracted">
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm">
                    {research.scraped_content}
                  </pre>
                </div>
              </Section>
            )}
          </div>
        )}

        {/* Empty State */}
        {!research && !loading && !error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
              <Rocket className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to ResearchNova</h3>
            <p className="text-gray-500 max-w-md mx-auto">Enter a topic above to start your AI-powered professional research analysis</p>
            <div className="mt-6 text-sm text-gray-400">
              <p>Suggested topics:</p>
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                <button onClick={() => setTopic("Who will win the West Bengal Assembly Election 2026?")} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition">West Bengal Election 2026</button>
                <button onClick={() => setTopic("Machine Learning trends 2024")} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition">ML Trends 2024</button>
                <button onClick={() => setTopic("Climate change solutions and policy impact")} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition">Climate Change Policy</button>
                <button onClick={() => setTopic("Quantum computing applications in finance")} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition">Quantum Computing</button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4 animate-pulse">
              <Rocket className="w-10 h-10 text-purple-600 animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ResearchNova is Working</h3>
            <p className="text-gray-500">This may take a minute or two while we gather and analyze information</p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-500">Web Search</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full animate-progress" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-500">Content Scraping</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-progress" style={{ width: '30%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-500">Report Generation</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full animate-progress" style={{ width: '10%', animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>ResearchNova • AI-Powered Research Assistant • Powered by Mistral AI</p>
          <p className="text-xs mt-1">Intelligent Search • Web Scraping • Automated Analysis • Professional Reporting</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default App