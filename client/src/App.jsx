import { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Code2, Monitor, ArrowRight, LayoutDashboard, Settings, HelpCircle, Server, Download } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.name.endsWith('.docx')) {
      setFile(selectedFile);
      setError(null);
      setResult(null); // Clear previous results when new file selected
    } else {
      setError("Unsupported format. Please upload a pure Microsoft Word (.docx) file.");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name.replace('.docx', ''));

    try {
      // Small artificial delay to show loader (UX)
      await new Promise(r => setTimeout(r, 600));
      const response = await axios.post('/api/convert', formData);
      setResult(response.data);
      setActiveTab('preview');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process the document. Check network connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!result?.html) return;

    const baseName = file?.name?.replace(/\.docx$/i, '') || 'converted';
    const filename = `${baseName}.html`;

    const fullHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${baseName}</title>
  </head>
  <body>
${result.html}
  </body>
</html>
`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      
      {/* Top Navigation Bar - Professional App Layout */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">DocShift Enterprise</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors hidden sm:block">Documentation</a>
          <a href="#" className="hover:text-slate-900 transition-colors hidden sm:block">API Reference</a>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
            <HelpCircle className="w-4 h-4" /> Support
          </button>
          <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: Upload Controls */}
        <div className="w-full xl:w-[440px] flex-shrink-0 flex flex-col gap-6">
          
          <div className="mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Data Conversion</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload Microsoft Word documents perfectly structured for web ingestion. Converted assets are automatically synchronized via Document360 endpoints.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 enterprise-shadow">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Source File</h2>
            
            {/* Minimalist Dropzone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50/70 shadow-[0_0_0_4px_rgba(59,130,246,0.10)]' 
                  : 'border-slate-300 bg-white/50 hover:bg-white hover:border-slate-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                accept=".docx"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                }}
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-1 border border-blue-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 text-sm line-clamp-1 break-all px-2">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • DOCX</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-2 text-xs font-medium text-slate-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-800">Drop your file here</p>
                  <p className="text-xs text-slate-500">or click to browse • DOCX up to 10MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex gap-2 items-start p-3 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                !file || isUploading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-sm'
              }`}
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing Source...</>
              ) : (
                <>Run Conversion Pipeline <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Preview Area */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl enterprise-shadow overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Output Toolbar */}
          <div className="border-b border-slate-200 bg-white">
            <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-4">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-4 h-4" /> Visual Output
                </button>
                <button 
                  onClick={() => setActiveTab('html')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeTab === 'html'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-4 h-4" /> Source HTML
                </button>
                <button 
                  onClick={() => setActiveTab('api')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    activeTab === 'api'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Server className="w-4 h-4" /> Network Log
                </button>
              </div>
              <button
                type="button"
                onClick={handleDownloadHtml}
                disabled={!result?.html}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl border transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                  result?.html
                    ? 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                    : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title={result?.html ? 'Download converted HTML' : 'Convert a document to enable download'}
              >
                <Download className="w-4 h-4" />
                Download HTML
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-white">
            
            {!result ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4 bg-slate-50">
                   <Code2 className="w-6 h-6 text-slate-300" />
                 </div>
                 <p className="text-sm font-medium text-slate-600">No active dataset</p>
                 <p className="text-xs mt-1 max-w-[250px]">Upload and convert a document to view structural output and transmission logs.</p>
              </div>
            ) : (
               <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                  
                  {activeTab === 'preview' && (
                    <div className="p-6 sm:p-8 lg:p-10">
                      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                         <CheckCircle2 className="w-5 h-5 text-green-600" />
                         <div>
                           <p className="text-sm font-medium text-green-800">Valid HTML Structure Generated</p>
                           <p className="text-xs text-green-700 mt-0.5">Payload has been dispatched to {result.apiResponse ? 'Document360 endpoints' : 'system'}.</p>
                         </div>
                      </div>
                      
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">Migrated Article</h3>
                        <div className="text-xs text-slate-500">Preview</div>
                      </div>

                      {/* Readable content preview */}
                      <div 
                        className="prose-custom"
                        dangerouslySetInnerHTML={{__html: result.html}}
                      />
                    </div>
                  )}

                  {activeTab === 'html' && (
                    <div className="p-5 sm:p-6 h-full bg-slate-950 text-slate-100">
                      <div className="mb-3 text-xs text-slate-400">Generated HTML</div>
                      <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed selection:bg-white/10">
                        <code>{result.html}</code>
                      </pre>
                    </div>
                  )}

                  {activeTab === 'api' && (
                    <div className="p-5 sm:p-6 h-full bg-slate-950 text-emerald-200">
                       <div className="mb-4 text-xs font-mono text-slate-400 border-b border-white/10 pb-2">
                         POST /v2/ProjectVersions/articles
                       </div>
                       <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed selection:bg-white/10">
                         {JSON.stringify(result.apiResponse, null, 2)}
                       </pre>
                    </div>
                  )}

               </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}

export default App;
