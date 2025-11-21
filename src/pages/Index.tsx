import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/066b4d3b-93d7-4d8d-b1d4-58b47c0bcf77';

interface ApiResponse {
  endpoint?: string;
  result?: string;
  type?: string;
  db_url?: string;
  env_vars?: Record<string, string>;
  connection_params?: Record<string, string>;
  error?: string;
}

const Index = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});

  const fetchEndpoint = async (path: string) => {
    setLoading(path);
    try {
      const response = await fetch(`${API_URL}?path=${path}`);
      const data = await response.json();
      setResponses(prev => ({ ...prev, [path]: data }));
    } catch (error) {
      setResponses(prev => ({ 
        ...prev, 
        [path]: { error: error instanceof Error ? error.message : 'Unknown error' }
      }));
    } finally {
      setLoading(null);
    }
  };

  const endpoints = [
    { path: 'conn', label: 'Connection Object', icon: 'Database' },
    { path: 'cursor', label: 'Cursor Object', icon: 'Terminal' },
    { path: 'info', label: 'Environment Info', icon: 'Info' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2A2F3C] to-[#1A1F2C] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4">PostgreSQL Tester</h1>
          <p className="text-gray-400 text-lg">Test your database connections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {endpoints.map(({ path, label, icon }) => (
            <Card 
              key={path}
              className="bg-[#2A2F3C] border-[#9b87f5]/20 hover:border-[#9b87f5]/40 transition-all duration-300 hover-scale"
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Icon name={icon as any} size={24} className="text-[#9b87f5]" />
                  {label}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Test /{path} endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => fetchEndpoint(path)}
                  disabled={loading === path}
                  className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
                >
                  {loading === path ? (
                    <>
                      <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Icon name="Play" size={16} className="mr-2" />
                      Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {Object.entries(responses).map(([path, data]) => (
            <Card 
              key={path}
              className="bg-[#2A2F3C] border-[#9b87f5]/20 animate-scale-in"
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Icon name="FileJson" size={20} className="text-[#9b87f5]" />
                  Response: /{path}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 font-mono text-sm">{data.error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.result && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Object Representation:</p>
                        <div className="bg-[#1A1F2C] rounded-lg p-4 border border-[#9b87f5]/10">
                          <code className="text-[#9b87f5] font-mono text-sm break-all">
                            {data.result}
                          </code>
                        </div>
                      </div>
                    )}
                    
                    {data.type && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Type:</p>
                        <div className="bg-[#1A1F2C] rounded-lg p-3 border border-[#9b87f5]/10">
                          <code className="text-green-400 font-mono text-sm">{data.type}</code>
                        </div>
                      </div>
                    )}
                    
                    {data.db_url && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Database URL:</p>
                        <div className="bg-[#1A1F2C] rounded-lg p-3 border border-[#9b87f5]/10">
                          <code className="text-blue-400 font-mono text-sm break-all">
                            {data.db_url}
                          </code>
                        </div>
                      </div>
                    )}
                    
                    {data.env_vars && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Environment Variables ({Object.keys(data.env_vars).length}):</p>
                        <div className="bg-[#1A1F2C] rounded-lg p-4 border border-[#9b87f5]/10">
                          <pre className="text-yellow-400 font-mono text-xs overflow-auto max-h-96">
                            {JSON.stringify(data.env_vars, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {data.connection_params && (
                      <div>
                        <p className="text-gray-400 text-sm mb-2">Connection Parameters:</p>
                        <div className="bg-[#1A1F2C] rounded-lg p-4 border border-[#9b87f5]/10">
                          <pre className="text-cyan-400 font-mono text-xs overflow-auto">
                            {JSON.stringify(data.connection_params, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;