import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, Code2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Student } from '../types/student.ts';

interface ApiExplorerViewProps {
  students: Student[];
  onDataChanged: () => void;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  defaultBody?: string;
  defaultParams?: Record<string, string>;
}

export const ApiExplorerView: React.FC<ApiExplorerViewProps> = ({ students, onDataChanged }) => {
  const sampleStudentId = students[0]?._id || '661f1a2b3c4d5e6f7a8b9001';

  const endpoints: EndpointDef[] = [
    {
      id: 'get-students',
      method: 'GET',
      path: '/api/students',
      title: 'GET /api/students',
      description: 'Retrieve paginated list of students with search and filter queries.',
      defaultParams: {
        search: '',
        department: 'All',
        status: 'All',
        limit: '5',
        page: '1'
      }
    },
    {
      id: 'get-student-id',
      method: 'GET',
      path: `/api/students/${sampleStudentId}`,
      title: 'GET /api/students/:id',
      description: 'Retrieve a single student record by MongoDB _id or Student ID.'
    },
    {
      id: 'post-student',
      method: 'POST',
      path: '/api/students',
      title: 'POST /api/students (Create)',
      description: 'Add a new student record to the MongoDB database with schema validation.',
      defaultBody: JSON.stringify(
        {
          studentId: `STU-2026-${Math.floor(100 + Math.random() * 899)}`,
          firstName: 'Alexander',
          lastName: 'Wright',
          email: 'a.wright@university.edu',
          phone: '(555) 412-8899',
          dateOfBirth: '2004-05-18',
          gender: 'Male',
          department: 'Computer Science',
          yearLevel: 'Sophomore',
          status: 'Active',
          gpa: 3.82,
          creditsEarned: 48,
          address: {
            street: '100 Memorial Drive',
            city: 'Cambridge',
            state: 'MA',
            zipCode: '02139'
          },
          emergencyContact: {
            name: 'Clara Wright',
            relationship: 'Mother',
            phone: '(555) 901-2233'
          },
          enrollmentDate: '2024-09-01',
          notes: 'Added via interactive REST API console.'
        },
        null,
        2
      )
    },
    {
      id: 'put-student',
      method: 'PUT',
      path: `/api/students/${sampleStudentId}`,
      title: 'PUT /api/students/:id (Modify)',
      description: 'Modify an existing student record. Performs server validation on fields.',
      defaultBody: JSON.stringify(
        {
          gpa: 3.95,
          creditsEarned: 85,
          status: 'Active',
          notes: 'Updated GPA and credits via REST API endpoint.'
        },
        null,
        2
      )
    },
    {
      id: 'test-validation-error',
      method: 'POST',
      path: '/api/students',
      title: 'POST /api/students (Trigger Validation Error)',
      description: 'Demonstrates HTTP 400 Bad Request error response when invalid data (e.g. invalid GPA & missing fields) is sent.',
      defaultBody: JSON.stringify(
        {
          studentId: '',
          firstName: 'A', // too short
          email: 'not-an-email',
          gpa: 5.75, // invalid GPA > 4.0
          department: 'Astrophysics' // invalid department
        },
        null,
        2
      )
    },
    {
      id: 'delete-student',
      method: 'DELETE',
      path: `/api/students/${sampleStudentId}`,
      title: 'DELETE /api/students/:id',
      description: 'Remove a student record from the MongoDB collection.'
    },
    {
      id: 'get-stats',
      method: 'GET',
      path: '/api/students/stats/summary',
      title: 'GET /api/students/stats/summary',
      description: 'Retrieve real-time department and GPA aggregate statistics.'
    },
    {
      id: 'get-db-status',
      method: 'GET',
      path: '/api/db/status',
      title: 'GET /api/db/status',
      description: 'Inspect MongoDB database connection mode, file path, and record count.'
    }
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[0]);
  const [requestPath, setRequestPath] = useState(endpoints[0].path);
  const [requestBody, setRequestBody] = useState(endpoints[0].defaultBody || '');
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseStatusText, setResponseStatusText] = useState<string>('');
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const selectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    // Replace placeholder with first student's ID if applicable
    let path = ep.path;
    if (path.includes(':id') || path.match(/[0-9a-f]{24}/)) {
      if (students[0]) {
        path = path.replace(/[0-9a-f]{24}/, students[0]._id);
      }
    }
    setRequestPath(path);
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponsePayload(null);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      };

      if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(requestPath, options);
      const duration = Math.round(performance.now() - start);
      setResponseTimeMs(duration);
      setResponseStatus(res.status);
      setResponseStatusText(res.statusText);

      const headersObj: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headersObj[k] = v;
      });
      setResponseHeaders(headersObj);

      const json = await res.json();
      setResponsePayload(json);

      // If a mutation happened, trigger data refresh in portal
      if (['POST', 'PUT', 'DELETE'].includes(selectedEndpoint.method) && res.ok) {
        onDataChanged();
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setResponseTimeMs(duration);
      setResponseStatus(500);
      setResponseStatusText('Network Error');
      setResponsePayload({ error: err.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlCommand = () => {
    let cmd = `curl -X ${selectedEndpoint.method} "${window.location.origin}${requestPath}"`;
    if (['POST', 'PUT'].includes(selectedEndpoint.method) && requestBody) {
      cmd += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-800" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                REST API Console & Sandbox
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Retrieve and modify the same student records directly through Node.js Express REST API endpoints. Test payload validations, HTTP status codes, and inspect live MongoDB document mutations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied cURL' : 'Copy cURL Command'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Endpoint Selector List */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Available REST Endpoints
          </h2>
          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              const isErrorTest = ep.id === 'test-validation-error';
              return (
                <button
                  key={ep.id}
                  onClick={() => selectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : isErrorTest
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100/60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? isSelected ? 'bg-sky-500/20 text-sky-200' : 'bg-sky-50 text-sky-700'
                          : ep.method === 'POST'
                          ? isSelected ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700'
                          : ep.method === 'PUT'
                          ? isSelected ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-700'
                          : isSelected ? 'bg-red-500/20 text-red-200' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{ep.path.slice(0, 18)}</span>
                  </div>
                  <div className="font-semibold mt-1 truncate">{ep.title}</div>
                  <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {ep.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Request Builder & Response Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Request Configuration
                </span>
                <span className="text-xs text-slate-500">
                  Method: <strong className="font-mono text-slate-800">{selectedEndpoint.method}</strong>
                </span>
              </div>

              {/* URL input bar */}
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold text-xs px-2.5 py-2 rounded-lg border ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedEndpoint.method === 'PUT'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>

                <input
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
                />

                <button
                  onClick={handleSendRequest}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isLoading ? 'Executing...' : 'Send API Call'}</span>
                </button>
              </div>
            </div>

            {/* Request Body Editor (for POST/PUT) */}
            {['POST', 'PUT'].includes(selectedEndpoint.method) && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  JSON Request Body (application/json)
                </label>
                <textarea
                  rows={8}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-900 text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Response Viewer */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Server Response Output
              </span>

              {responseStatus !== null && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-500">
                    Latency: <strong className="tabular-nums text-slate-800">{responseTimeMs}ms</strong>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : responseStatus >= 400 && responseStatus < 500
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    HTTP {responseStatus} {responseStatusText}
                  </span>
                </div>
              )}
            </div>

            {responsePayload ? (
              <div className="space-y-2">
                {/* Visual error message banner if response is 400 or has error */}
                {responsePayload.success === false && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">REST API Validation / Error Alert</p>
                      <p className="mt-0.5">{responsePayload.error}</p>
                      {responsePayload.errors && (
                        <div className="mt-2 text-[11px] font-mono bg-white p-2 rounded border border-red-200 text-red-700 space-y-1">
                          {Object.entries(responsePayload.errors).map(([field, msg]) => (
                            <div key={field}>
                              • <span className="font-semibold">{field}</span>: {msg as string}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Formatted JSON output */}
                <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto max-h-[350px] leading-relaxed">
                  {JSON.stringify(responsePayload, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Click <strong>"Send API Call"</strong> above to dispatch this request and inspect live responses.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
