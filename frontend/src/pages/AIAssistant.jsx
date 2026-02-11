import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, FileText, Briefcase, MessageSquare, Lightbulb, BookOpen, User, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const AIAssistant = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({ available: false, message: '' });
  const [activeResume, setActiveResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const messagesEndRef = useRef(null);
  
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check AI assistant status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ai/status`);
        const data = await response.json();
        setAiStatus(data);
      } catch (error) {
        console.error('Error checking AI status:', error);
        setAiStatus({ 
          available: false, 
          message: 'Unable to connect to AI service' 
        });
      }
    };
    checkAIStatus();
  }, []);

  // Fetch active resume when resume-match tool is selected
  useEffect(() => {
    if (selectedTool?.id === 'resume-match') {
      fetchActiveResume();
    }
  }, [selectedTool]);

  const fetchActiveResume = async () => {
    setLoadingResume(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/active`);
      if (response.ok) {
        const resume = await response.json();
        setActiveResume(resume);
        // Pre-populate the input with a template
        setInput(`Job Description:\n\n[Paste the job description here]\n\n---\n\nMy Resume:\n${resume.content}`);
      } else {
        setActiveResume(null);
      }
    } catch (error) {
      console.error('Error fetching active resume:', error);
      setActiveResume(null);
    } finally {
      setLoadingResume(false);
    }
  };

  const tools = [
    {
      id: 'resume-match',
      name: 'Resume Matching',
      icon: FileText,
      description: 'Analyze how well your resume matches a job description',
      prompt: 'Paste your resume and the job description to see how well they align.',
      color: 'blue'
    },
    {
      id: 'cover-letter',
      name: 'Cover Letter Generator',
      icon: MessageSquare,
      description: 'Generate a personalized cover letter for a job position',
      prompt: 'Provide the job details and your background to create a tailored cover letter.',
      color: 'green'
    },
    {
      id: 'interview-prep',
      name: 'Interview Preparation',
      icon: Briefcase,
      description: 'Get common interview questions and tips for your role',
      prompt: 'Tell me about the position and company to prepare you for the interview.',
      color: 'purple'
    },
    {
      id: 'company-research',
      name: 'Company Research',
      icon: BookOpen,
      description: 'Learn key insights about a company before applying',
      prompt: 'Enter the company name to get detailed insights and research.',
      color: 'orange'
    },
    {
      id: 'career-advice',
      name: 'Career Advice',
      icon: Lightbulb,
      description: 'Get personalized career guidance and job search tips',
      prompt: 'Share your career goals and current situation for personalized advice.',
      color: 'yellow'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    // Add a placeholder for AI response that will be updated in real-time
    const aiMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          tool_id: selectedTool.id,
          conversation_history: messages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('Stream complete');
              setLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.text) {
                fullText += parsed.text;
                
                // Update the last message in real-time
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = {
                    role: 'assistant',
                    content: fullText
                  };
                  return newMessages;
                });
              } else if (parsed.error) {
                console.error('Stream error:', parsed.error);
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[aiMessageIndex] = {
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${parsed.error}`
                  };
                  return newMessages;
                });
                setLoading(false);
                return;
              }
            } catch (e) {
              // Ignore JSON parsing errors from empty lines
            }
          }
        }
      }

    } catch (error) {
      console.error('Error calling AI API:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = {
          role: 'assistant',
          content: 'Sorry, I was unable to process your request. Please check your connection and try again.'
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
    setMessages([]);
    setInput('');
    setActiveResume(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedTool && (
            <button
              onClick={handleBackToTools}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to tools"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-7 h-7 mr-2 text-blue-600" />
              AI Career Assistant
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Powered by Google Gemini 3</p>
              {aiStatus.available ? (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Online
                </span>
              ) : (
                <span className="flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Status Warning */}
      {!aiStatus.available && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">AI Assistant Unavailable</h3>
              <p className="text-sm text-yellow-800 mt-1">{aiStatus.message}</p>
              <p className="text-sm text-yellow-800 mt-2">
                Please configure GEMINI_API_KEY in your backend environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedTool ? (
        // Chat Interface
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Active Tool</h3>
                <button
                  onClick={handleBackToTools}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change
                </button>
              </div>
              <div className={`p-4 rounded-lg border ${colorClasses[selectedTool.color]}`}>
                <selectedTool.icon className="w-6 h-6 mb-2" />
                <p className="font-medium text-sm">{selectedTool.name}</p>
                <p className="text-xs mt-1 opacity-80">{selectedTool.description}</p>
              </div>
            </div>

            {/* Resume Status for resume-match tool */}
            {selectedTool.id === 'resume-match' && (
              <div className={`rounded-lg border p-4 ${
                activeResume 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2">
                  <FileText className={`w-5 h-5 flex-shrink-0 ${
                    activeResume ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    {loadingResume ? (
                      <p className="text-sm text-gray-600">Loading resume...</p>
                    ) : activeResume ? (
                      <>
                        <h4 className="text-sm font-semibold text-green-900">Resume Loaded</h4>
                        <p className="text-xs text-green-800 mt-1">{activeResume.filename}</p>
                        <button
                          onClick={fetchActiveResume}
                          className="text-xs text-green-700 underline mt-2"
                        >
                          Reload
                        </button>
                      </>
                    ) : (
                      <>
                        <h4 className="text-sm font-semibold text-yellow-900">No Resume Found</h4>
                        <p className="text-xs text-yellow-800 mt-1">
                          Please upload a resume in the "My Resumes" section
                        </p>
                        <a
                          href="/resumes"
                          className="text-xs text-yellow-700 underline mt-2 inline-block"
                        >
                          Go to Resumes →
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
              <ul className="text-xs text-blue-800 space-y-2">
                <li>• Be specific with your questions</li>
                <li>• Provide relevant context</li>
                <li>• Ask follow-up questions</li>
                <li>• Use for multiple iterations</li>
              </ul>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{selectedTool.prompt}</p>
                    <p className="text-sm text-gray-500 mt-2">Type your message below to get started</p>
                    {selectedTool.id === 'resume-match' && activeResume && (
                      <p className="text-sm text-green-600 mt-3">
                        ✓ Your resume is ready for analysis
                      </p>
                    )}
                  </div>
                )}

                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gray-600 animate-pulse" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="space-y-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    disabled={loading || !aiStatus.available}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
                    <button
                      type="submit"
                      disabled={loading || !input.trim() || !aiStatus.available}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Tool Selection
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                disabled={!aiStatus.available}
                className={`text-left p-6 rounded-lg border-2 transition-all ${colorClasses[tool.color]} ${
                  !aiStatus.available ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <Sparkles className="w-5 h-5 opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                <p className="text-sm opacity-80">{tool.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Integration Guide */}
      {!selectedTool && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
            Google Gemini 3 API - Hackathon Ready
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>✨ This AI Assistant uses <strong>Gemini 3 Pro</strong> and <strong>Gemini 3 Flash</strong> for optimal performance:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Resume Matching & Company Research:</strong> Gemini 3 Pro (deep analysis)</li>
              <li><strong>Cover Letters, Interview Prep & Career Advice:</strong> Gemini 3 Flash (3x faster)</li>
            </ul>
            <div className="bg-white rounded-lg p-3 mt-3">
              <p className="text-xs font-mono text-gray-800">
                💡 Tip: Upload your resume in "My Resumes" for instant ATS analysis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
