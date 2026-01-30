import { useState } from 'react';
import { Sparkles, Send, FileText, Briefcase, MessageSquare, Lightbulb, BookOpen, User } from 'lucide-react';

const AIAssistant = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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

    // TODO: Integrate with Google Gemini API
    // Example integration:
    /*
    try {
      const response = await fetch('YOUR_GEMINI_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${YOUR_API_KEY}`
        },
        body: JSON.stringify({
          prompt: input,
          context: selectedTool.id
        })
      });
      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.response };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
    }
    */

    // Simulated response (replace with actual API call)
    setTimeout(() => {
      const aiMessage = {
        role: 'assistant',
        content: `This is a placeholder response for the ${selectedTool.name} tool. 

**To integrate Google Gemini API:**
1. Get your API key from Google AI Studio
2. Add the API endpoint and authentication
3. Replace this simulated response with actual API calls

Your input: "${input}"

The AI will provide detailed, contextual responses based on your selected tool (${selectedTool.name}).`
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-7 h-7 mr-2 text-blue-600" />
            AI Career Assistant
          </h1>
          <p className="text-gray-600 mt-1">Powered by Google Gemini - Get intelligent career guidance</p>
        </div>
      </div>

      {selectedTool ? (
        // Chat Interface
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Active Tool</h3>
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    setMessages([]);
                    setInput('');
                  }}
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
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
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
                className={`text-left p-6 rounded-lg border-2 transition-all ${colorClasses[tool.color]}`}
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
            Google Gemini API Integration
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>This AI Assistant is ready for Google Gemini API integration. To enable it:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
              <li>Add the API key to your environment variables</li>
              <li>Implement the API call in the <code className="bg-white px-2 py-1 rounded text-xs">handleSubmit</code> function</li>
              <li>Replace the simulated response with actual Gemini responses</li>
            </ol>
            <p className="text-xs text-gray-600 mt-4">
              📚 <a href="https://ai.google.dev/tutorials/get_started_web" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Gemini API Documentation</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;