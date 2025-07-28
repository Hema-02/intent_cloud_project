import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface CommandInterfaceProps {
  activeProvider: string;
}

export function CommandInterface({ activeProvider }: CommandInterfaceProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState([
    `CloudFlow Terminal - ${activeProvider.toUpperCase()} Environment`,
    'Type "help" for available commands',
    '',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const commands = {
    help: () => [
      'Available commands:',
      '  list-instances    - List all compute instances',
      '  create-instance   - Create a new compute instance',
      '  delete-instance   - Delete a compute instance',
      '  list-storage      - List storage resources',
      '  create-storage    - Create new storage',
      '  list-databases    - List database instances',
      '  create-database   - Create a new database',
      '  status            - Show resource status',
      '  billing           - Show billing information',
      '  clear             - Clear terminal',
      '  help              - Show this help message',
    ],
    'list-instances': () => [
      `Listing compute instances for ${activeProvider.toUpperCase()}:`,
      '┌─────────────────┬──────────┬─────────────┬──────────┐',
      '│ Instance ID     │ Type     │ Status      │ Region   │',
      '├─────────────────┼──────────┼─────────────┼──────────┤',
      '│ i-1234567890abc │ t3.large │ running     │ us-east-1│',
      '│ i-0987654321def │ t2.micro │ stopped     │ us-west-2│',
      '│ i-abcdef123456  │ m5.xlarge│ running     │ eu-west-1│',
      '└─────────────────┴──────────┴─────────────┴──────────┘',
    ],
    'create-instance': () => [
      `Creating new compute instance on ${activeProvider.toUpperCase()}...`,
      'Instance configuration:',
      '  Type: t3.medium',
      '  Region: us-east-1',
      '  Status: Launching',
      'Instance ID: i-newinstance123',
      'Creation successful!',
    ],
    status: () => [
      `${activeProvider.toUpperCase()} Resource Status:`,
      '  Compute Instances: 24 running, 3 stopped',
      '  Databases: 8 active',
      '  Storage: 2.4TB used',
      '  Network: 15 VPCs, 42 subnets',
      '  Security Groups: 28 active',
      '  All systems operational ✓',
    ],
    clear: () => {
      setOutput([]);
      return [];
    },
  };

  const handleSubmit = (e: React.FormForm) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newOutput = [...output, `$ ${input}`];
    const command = input.trim().toLowerCase();

    if (commands[command as keyof typeof commands]) {
      const commandOutput = commands[command as keyof typeof commands]();
      newOutput.push(...commandOutput);
    } else {
      newOutput.push(`Command not found: ${input}`);
      newOutput.push('Type "help" for available commands');
    }

    newOutput.push('');
    setOutput(newOutput);
    setHistory([...history, input]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center space-x-2">
          <Terminal className="w-8 h-8" />
          <span>Command Interface</span>
        </h2>
        <div className="text-sm text-gray-400">
          Provider: {activeProvider.toUpperCase()}
        </div>
      </div>

      <div className="flex-1 bg-black rounded-lg border border-gray-700 p-6 font-mono text-sm">
        <div className="text-green-400 mb-4 overflow-auto max-h-96">
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-green-400 outline-none"
            placeholder="Enter command..."
          />
        </form>
      </div>

      <div className="mt-4 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Quick Commands</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(commands).slice(0, 8).map((cmd) => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded text-sm transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}