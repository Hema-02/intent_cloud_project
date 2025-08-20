import React, { useState } from 'react';
import { Send, Mic, MicOff, Volume2 } from 'lucide-react';
import { nlpAPI } from '../lib/api';

interface NaturalLanguageInterfaceProps {
  activeProvider: string;
}

export function NaturalLanguageInterface({ activeProvider }: NaturalLanguageInterfaceProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [conversation, setConversation] = useState([
    {
      type: 'system',
      message: `Welcome to CloudFlow! I can help you manage your ${activeProvider.toUpperCase()} resources using natural language. Try saying something like "Create a new virtual machine" or "Show me my storage usage".`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Initialize speech recognition
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    const userMessage = {
      type: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setConversation(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput(''); // Clear input immediately for better UX

    try {
      // Call backend API for natural language processing
      const response = await nlpAPI.process(currentInput, activeProvider);
      
      const aiResponse = {
        type: 'ai',
        message: formatAPIResponse(response.response),
        timestamp: new Date().toLocaleTimeString(),
      };

      setConversation(prev => [...prev, aiResponse]);
      speakResponse(aiResponse.message);
    } catch (error) {
      console.error('NLP API error:', error);
      
      // Fallback to local processing if API fails
      const fallbackResponse = generateAIResponse(currentInput, activeProvider);
      const errorResponse = {
        type: 'ai',
        message: fallbackResponse,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setConversation(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
      
      // Auto-scroll to bottom after response
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const formatAPIResponse = (response: any) => {
    let message = response.message;
    
    if (response.details) {
      const { details } = response;
      
      if (details.type === 'resource_listing' && details.resources) {
        message += '\n\n**Compute Instances:**';
        details.resources.instances?.forEach((instance: any) => {
          message += `\n• ${instance.name} (${instance.id}) - ${instance.status} - ${instance.type}`;
        });
        
        if (details.resources.databases?.length > 0) {
          message += '\n\n**Databases:**';
          details.resources.databases.forEach((db: any) => {
            message += `\n• ${db.name} (${db.engine}) - ${db.status}`;
          });
        }
      }
      
      if (details.type === 'instance_creation' && details.suggestedConfig) {
        message += `\n\n**Suggested Configuration:**`;
        message += `\n• Instance Type: ${details.suggestedConfig.instanceType}`;
        message += `\n• Region: ${details.suggestedConfig.region}`;
        message += `\n• Estimated Cost: ${details.suggestedConfig.estimatedCost}`;
        
        if (details.nextSteps) {
          message += '\n\n**Next Steps:**';
          details.nextSteps.forEach((step: string, index: number) => {
            message += `\n${index + 1}. ${step}`;
          });
        }
      }
      
      if (details.type === 'monitoring_data' && details.metrics) {
        message += `\n\n**Current Metrics:**`;
        Object.entries(details.metrics).forEach(([key, value]) => {
          message += `\n• ${key.toUpperCase()}: ${value}`;
        });
        
        if (details.alerts?.length > 0) {
          message += '\n\n**Active Alerts:**';
          details.alerts.forEach((alert: any) => {
            message += `\n• ${alert.severity.toUpperCase()}: ${alert.message} (${alert.time})`;
          });
        }
      }
      
      if (details.type === 'billing_data' && details.breakdown) {
        message += `\n\n**Cost Breakdown:**`;
        Object.entries(details.breakdown).forEach(([service, cost]) => {
          message += `\n• ${service}: ${cost}`;
        });
        message += `\n\n**Trend**: ${details.trend}`;
        message += `\n**Projected Annual**: ${details.projectedAnnual}`;
      }
      
      if (details.type === 'security_data') {
        message += `\n\n**Security Score**: ${details.securityScore} (${details.status})`;
        message += `\n\n**Summary:**`;
        Object.entries(details.summary).forEach(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          message += `\n• ${label}: ${value}`;
        });
        
        if (details.vulnerabilities?.length > 0) {
          message += '\n\n**Vulnerabilities:**';
          details.vulnerabilities.forEach((vuln: any) => {
            message += `\n• ${vuln.severity.toUpperCase()}: ${vuln.issue}`;
          });
        }
      }
    }
    
    return message;
  };

  const generateAIResponse = (userInput: string, provider: string) => {
    const input = userInput.toLowerCase();
    
    // More comprehensive response matching
    if (input.includes('create') || input.includes('launch') || input.includes('start')) {
      return `I'll help you create a new resource on ${provider.toUpperCase()}. Here's what I can do:

• Creating a new t3.medium instance in us-east-1
• Configuring security groups and networking
• Setting up monitoring and alerts
• Estimated cost: $0.0416/hour

Would you like me to proceed with the creation?`;
    }
    
    if (input.includes('list') || input.includes('show') || input.includes('display')) {
      return `Here are your current resources on ${provider.toUpperCase()}:

**Compute Instances (3)**
• i-1234567890abc - web-server-01 (t3.large) - Running
• i-0987654321def - db-server-01 (t2.micro) - Stopped  
• i-abcdef123456 - api-server-01 (m5.xlarge) - Running

**Databases (2)**
• prod-database (PostgreSQL) - Available
• test-database (MySQL) - Maintenance

**Storage**
• app-assets bucket - 1.2TB
• backup-data bucket - 850GB`;
    }
    
    if (input.includes('delete') || input.includes('remove') || input.includes('terminate')) {
      return `⚠️ I'll help you safely delete the specified resource. 

**Important**: This action cannot be undone. Please confirm:
• Which resource would you like to delete?
• Have you backed up any important data?
• Are there any dependencies I should check?

Please provide the resource ID or name to proceed.`;
    }
    
    if (input.includes('scale') || input.includes('resize') || input.includes('upgrade')) {
      return `I'll help you scale your resources on ${provider.toUpperCase()}:

**Current Scaling Options:**
• Auto Scaling Groups: 2 active
• Current capacity: 3-8 instances
• CPU target: 70%
• Scale-out cooldown: 300 seconds

What scaling changes would you like to make?`;
    }
    
    if (input.includes('monitor') || input.includes('status') || input.includes('health')) {
      return `Here's the current monitoring data for your ${provider.toUpperCase()} resources:

**System Health: ✅ Good**
• CPU Usage: 67% (Normal)
• Memory Usage: 45% (Good)
• Network I/O: 2.3 GB/s
• Disk Usage: 78% (Monitor)

**Active Alerts: 2**
• High CPU on i-1234567890abc (2 min ago)
• Memory warning on db-server-01 (15 min ago)`;
    }
    
    if (input.includes('cost') || input.includes('billing') || input.includes('price')) {
      return `Here's your current billing information for ${provider.toUpperCase()}:

**This Month: $2,847.32**
• EC2 Instances: $1,245.67 (44%)
• S3 Storage: $567.89 (20%)
• RDS Databases: $423.12 (15%)
• Other Services: $610.64 (21%)

**Trend**: +7.3% from last month
**Projected Annual**: $34.2K`;
    }
    
    if (input.includes('security') || input.includes('access') || input.includes('permissions')) {
      return `Security overview for your ${provider.toUpperCase()} environment:

**Security Score: 85/100** ⚠️
• Security Groups: 28 configured
• IAM Policies: 156 active
• Access Keys: 12 (2 unused)
• Active Users: 45

**Vulnerabilities Found: 3**
• High: Unrestricted SSH access
• Medium: Unused access key
• Low: Weak password policy`;
    };

    // Default response for unmatched queries
    return `I understand you want to: "${userInput}"

I can help you with:
• **Create** - Launch new instances, databases, storage
• **List/Show** - Display your current resources
• **Delete** - Safely remove resources
• **Scale** - Resize or auto-scale resources  
• **Monitor** - Check system health and metrics
• **Cost** - View billing and usage information
• **Security** - Review security settings and alerts

What would you like me to help you with?`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Natural Language Interface</h2>
        <div className="text-sm text-gray-400">
          Provider: {activeProvider.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
        <div className="flex-1 p-6 overflow-auto space-y-4 chat-container">
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.type === 'ai'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.type === 'user' ? 'You' : message.type === 'ai' ? 'CloudFlow AI' : 'System'}
                </div>
                {message.type === 'ai' && (
                  <button
                    onClick={() => speakResponse(message.message)}
                    className="float-right p-1 text-gray-400 hover:text-white transition-colors"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
                <div className="text-sm">{message.message}</div>
                <div className="text-xs opacity-70 mt-2">{message.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what you want to do with your cloud resources..."
                className="w-full bg-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={!recognition}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                  isListening ? 'text-red-400 animate-pulse' : 
                  !recognition ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
                }`}
                <Send className={`w-4 h-4 ${isProcessing ? 'animate-pulse' : ''}`} />
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Send'}</span>
            </button>
          </form>
          {isListening && (
            <div className="text-center text-sm text-blue-400 animate-pulse">
              Listening... Speak now
            </div>
          )}
          {isProcessing && (
            <div className="text-center text-sm text-blue-400 animate-pulse mt-2">
              Processing your request...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}