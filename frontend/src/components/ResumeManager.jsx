import { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Check, Clock, AlertCircle, Loader, Target, TrendingUp } from 'lucide-react';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [filename, setFilename] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes`);
      const data = await response.json();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setFilename(file.name);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/resumes/extract-text`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setResumeText(result.text);
        setUploadError('');
      } else {
        setUploadError(result.error || 'Failed to extract text from file');
        setResumeText('');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setUploadError('Failed to process file. Please try copy-pasting your resume text instead.');
      setResumeText('');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !filename) {
      setUploadError('Please provide both resume text and filename');
      return;
    }

    setLoading(true);
    setUploadError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: resumeText
        })
      });

      if (response.ok) {
        setResumeText('');
        setFilename('');
        setShowUploadForm(false);
        setUploadError('');
        fetchResumes();
      } else {
        setUploadError('Failed to upload resume. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const activateResume = async (resumeId) => {
    try {
      await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/activate`, {
        method: 'PUT'
      });
      fetchResumes();
    } catch (error) {
      console.error('Error activating resume:', error);
    }
  };

  const deleteResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/resumes/${resumeId}`, {
        method: 'DELETE'
      });
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const analyzeATS = async (resumeId) => {
    setAnalyzingId(resumeId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resumes/${resumeId}/analyze-ats`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchResumes();
      } else {
        setUploadError(result.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setUploadError('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-7 h-7 mr-2 text-blue-600" />
            My Resumes
          </h2>
          <p className="text-gray-600 mt-1">Upload PDF or TXT files - text will be automatically extracted</p>
        </div>
        <button
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            setUploadError('');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Add Resume
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload New Resume</h3>
          
          {uploadError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{uploadError}</p>
            </div>
          )}

          {extracting && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-800">Extracting text from your file...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume File (PDF or TXT)
              </label>
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                disabled={extracting}
                className="block w-full text-sm text-gray-500 
                  file:mr-4 file:py-2 file:px-4 
                  file:rounded-lg file:border-0 
                  file:text-sm file:font-semibold 
                  file:bg-blue-50 file:text-blue-700 
                  hover:file:bg-blue-100
                  disabled:opacity-50
                  cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                ✓ PDF files supported (text will be extracted automatically)
                <br />
                ✓ Or paste your resume text manually below
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Text {resumeText ? '(Extracted)' : '*'}
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Upload a file above or paste your resume content here...

Example:
John Doe
Software Engineer
Email: john@example.com

EXPERIENCE
- 3 years at Company XYZ...

SKILLS
- React, Node.js, Python..."
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
                disabled={extracting}
              />
              <p className="text-xs text-gray-500 mt-2">
                {resumeText.length} characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Name *
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., Software_Engineer_Resume_2026"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={extracting}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !resumeText.trim() || !filename.trim() || extracting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Save Resume'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadError('');
                  setResumeText('');
                  setFilename('');
                }}
                disabled={extracting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resume List */}
      <div className="grid gap-4">
        {resumes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No resumes uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">Upload your resume to use AI features</p>
          </div>
        ) : (
          resumes.map((resume) => (
            <div
              key={resume.id}
              className={`bg-white border-2 rounded-lg p-4 ${
                resume.is_active ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{resume.filename}</h3>
                    {resume.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                    
                    {/* ATS Score Badge */}
                    {resume.ats_score !== null && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getScoreColor(resume.ats_score)}`}>
                        <Target className="w-3 h-3" />
                        ATS: {resume.ats_score}/100 - {getScoreLabel(resume.ats_score)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                  </div>
                  
                  {/* ATS Feedback */}
                  {resume.ats_feedback && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>ATS Feedback:</strong> {resume.ats_feedback}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {resume.content.substring(0, 150)}...
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {/* Analyze ATS Button */}
                  <button
                    onClick={() => analyzeATS(resume.id)}
                    disabled={analyzingId === resume.id}
                    className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 disabled:opacity-50"
                  >
                    {analyzingId === resume.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        {resume.ats_score ? 'Re-analyze' : 'Analyze ATS'}
                      </>
                    )}
                  </button>
                  
                  {!resume.is_active && (
                    <button
                      onClick={() => activateResume(resume.id)}
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                      Set Active
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteResume(resume.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResumeManager;
