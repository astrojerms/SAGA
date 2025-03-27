import React, { useState } from 'react';
import { Shield, AlertTriangle, XCircle, X, Network, Database, User, Lock, Terminal, Workflow } from 'lucide-react';

// Enhanced incident data with attack storyline
const incidentData = [
  {
    id: 1,
    timestamp: '2025-02-16T10:30:00',
    type: 'Initial Access Attempt',
    severity: 'medium',
    description: 'Multiple failed authentication attempts detected',
    storyline: {
      title: 'Credential Stuffing Campaign',
      context: 'Part of a larger automated attack campaign targeting enterprise logins',
      sequence: [
        {
          stage: 'Preparation',
          description: 'Attacker obtained leaked credentials from dark web forums',
          timestamp: '2025-02-16T10:25:00',
          indicator: 'Multiple IPs accessing login page'
        },
        {
          stage: 'Initial Attempt',
          description: 'Automated tool began testing username/password combinations',
          timestamp: '2025-02-16T10:30:00',
          indicator: 'High-volume failed logins from single IP'
        },
        {
          stage: 'Attack Progression',
          description: 'Attack pattern shifted to distributed IPs to evade detection',
          timestamp: '2025-02-16T10:35:00',
          indicator: 'Login attempts from multiple geographic locations'
        }
      ],
      impact: 'Potential credential compromise and unauthorized access risk',
      relatedIncidents: ['Similar pattern observed in finance sector attacks']
    },
    mitreAttack: {
      tactic: 'Initial Access',
      technique: 'T1110 - Brute Force',
      subtechnique: 'T1110.001 - Password Guessing'
    },
    attackChain: [
      { phase: 'Reconnaissance', status: 'completed', details: 'Credential gathering from dark web' },
      { phase: 'Initial Access', status: 'active', details: 'Automated login attempts' },
      { phase: 'Execution', status: 'pending', details: 'Awaiting successful compromise' }
    ],
    details: {
      sourceIP: '192.168.1.100',
      targetUser: 'admin',
      attemptCount: 50,
      timeWindow: '5 minutes'
    }
  },
  {
    id: 2,
    timestamp: '2025-02-16T10:45:00',
    type: 'Execution',
    severity: 'high',
    description: 'Suspicious PowerShell command execution',
    storyline: {
      title: 'Living Off the Land Attack',
      context: 'Attacker utilizing native Windows tools to establish persistence',
      sequence: [
        {
          stage: 'Initial Compromise',
          description: 'Successful phishing email opened malicious attachment',
          timestamp: '2025-02-16T10:40:00',
          indicator: 'Unusual email attachment execution'
        },
        {
          stage: 'Defense Evasion',
          description: 'PowerShell script executed with encoding to bypass detection',
          timestamp: '2025-02-16T10:45:00',
          indicator: 'Encoded PowerShell command execution'
        },
        {
          stage: 'Persistence',
          description: 'Creation of scheduled task for persistence',
          timestamp: '2025-02-16T10:50:00',
          indicator: 'New scheduled task creation'
        }
      ],
      impact: 'Establishment of persistent access and potential lateral movement',
      relatedIncidents: ['Part of targeted APT campaign']
    },
    mitreAttack: {
      tactic: 'Execution',
      technique: 'T1059 - Command and Scripting Interpreter',
      subtechnique: 'T1059.001 - PowerShell'
    },
    attackChain: [
      { phase: 'Initial Access', status: 'completed', details: 'Phishing email compromise' },
      { phase: 'Execution', status: 'active', details: 'PowerShell script execution' },
      { phase: 'Persistence', status: 'pending', details: 'Scheduled task creation' }
    ],
    details: {
      process: 'PowerShell.exe',
      commandLine: 'encoded-base64-command',
      user: 'SYSTEM',
      path: 'C:\\Windows\\System32'
    }
  },
  {
    id: 3,
    timestamp: '2025-02-16T11:00:00',
    type: 'Data Exfiltration',
    severity: 'critical',
    description: 'Large data transfer to unknown external IP',
    storyline: {
      title: 'Data Theft Operation',
      context: 'Targeted exfiltration of sensitive customer data',
      sequence: [
        {
          stage: 'Data Discovery',
          description: 'Internal network scanning for sensitive data repositories',
          timestamp: '2025-02-16T10:55:00',
          indicator: 'Unusual internal network scanning'
        },
        {
          stage: 'Data Staging',
          description: 'Compression and encryption of targeted files',
          timestamp: '2025-02-16T10:58:00',
          indicator: 'Large file compression activities'
        },
        {
          stage: 'Exfiltration',
          description: 'Data transfer over encrypted channel to external server',
          timestamp: '2025-02-16T11:00:00',
          indicator: 'Large HTTPS transfer to unknown IP'
        }
      ],
      impact: 'Potential exposure of sensitive customer information',
      relatedIncidents: ['Similar patterns seen in recent ransomware campaigns']
    },
    mitreAttack: {
      tactic: 'Exfiltration',
      technique: 'T1048 - Exfiltration Over Alternative Protocol',
      subtechnique: 'T1048.002 - Exfiltration Over Asymmetric Encrypted Channel'
    },
    attackChain: [
      { phase: 'Command & Control', status: 'completed', details: 'Established C2 channel' },
      { phase: 'Exfiltration', status: 'active', details: 'Data transfer in progress' },
      { phase: 'Impact', status: 'pending', details: 'Potential data exposure' }
    ],
    details: {
      destinationIP: '203.0.113.100',
      dataVolume: '500MB',
      protocol: 'HTTPS',
      duration: '2 minutes'
    }
  }
];

const SecurityTimeline = () => {
  console.log('Inside SecurityTimeline');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return <Shield className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'high':
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const StorylineSequence = ({ sequence }) => (
    <div className="space-y-4">
      {sequence.map((event, index) => (
        <div key={index} className="relative pl-8">
          <div className="absolute left-0 top-0 h-full">
            <div className="w-px h-full bg-gray-600"></div>
          </div>
          <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-blue-500"></div>
          <div className="mb-1">
            <span className="text-sm text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
            <h4 className="text-white font-semibold">{event.stage}</h4>
          </div>
          <p className="text-gray-300">{event.description}</p>
          <div className="mt-1 text-sm text-gray-400">
            Indicator: {event.indicator}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-8 text-white">Security Incident Timeline</h2>
        
        <div className="space-y-6">
          {incidentData.map((incident) => (
            <div 
              key={incident.id}
              className="bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 transition-all"
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(incident.severity)} text-white`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-300 text-sm">
                      {formatTimestamp(incident.timestamp)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-2">{incident.type}</h3>
                  <p className="text-gray-300 mt-1">{incident.description}</p>
                  
                  <div className="mt-4 bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-400">MITRE ATT&CK</div>
                    <div className="text-white mt-1">{incident.mitreAttack.technique}</div>
                  </div>
                  
                  {/* Attack Chain Summary */}
                  <div className="mt-4 flex items-center space-x-4">
                    {incident.attackChain.map((phase, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'active' ? 'bg-yellow-500' : 'bg-gray-600'
                        }`} />
                        <span className="ml-2 text-sm text-gray-400">{phase.phase}</span>
                        {index < incident.attackChain.length - 1 && (
                          <div className="ml-4 text-gray-600">→</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Attack Storyline Preview */}
                  <div className="mt-4 border-t border-gray-600 pt-4">
                    <h4 className="text-white font-semibold">{incident.storyline.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{incident.storyline.context}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedIncident && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedIncident(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-6">
                {/* Incident Header */}
                <div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getSeverityColor(selectedIncident.severity)} text-white`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-300">
                      {formatTimestamp(selectedIncident.timestamp)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-2">{selectedIncident.type}</h3>
                </div>

                {/* Attack Storyline */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-xl font-semibold text-white mb-2">{selectedIncident.storyline.title}</h4>
                  <p className="text-gray-300 mb-4">{selectedIncident.storyline.context}</p>
                  
                  <div className="mb-6">
                    <h5 className="text-white font-semibold mb-4">Attack Sequence</h5>
                    <StorylineSequence sequence={selectedIncident.storyline.sequence} />
                  </div>

                  <div className="mt-4">
                    <h5 className="text-white font-semibold mb-2">Impact Assessment</h5>
                    <p className="text-gray-300">{selectedIncident.storyline.impact}</p>
                  </div>

                  {selectedIncident.storyline.relatedIncidents.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-white font-semibold mb-2">Related Incidents</h5>
                      <ul className="list-disc list-inside text-gray-300">
                        {selectedIncident.storyline.relatedIncidents.map((incident, index) => (
                          <li key={index}>{incident}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Attack Chain */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-4">Attack Chain Progression</h4>
                  <div className="space-y-4">
                    {selectedIncident.attackChain.map((phase, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-4 h-4 rounded-full mt-1 mr-3 ${
                          phase.status === 'completed' ? 'bg-green-500' :
                          phase.status === 'active' ? 'bg-yellow-500' : 'bg-gray-600'
                        }`} />
                        <div>
                          <div className="text-white font-semibold">{phase.phase}</div>
                          <div className="text-gray-400 text-sm">{phase.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MITRE ATT&CK Details */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">MITRE ATT&CK Details</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>Tactic: {selectedIncident.mitreAttack.tactic}</div>
                    <div>Technique: {selectedIncident.mitreAttack.technique}</div>
                    <div>Subtechnique: {selectedIncident.mitreAttack.subtechnique}</div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Technical Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(selectedIncident.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key}:</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTimeline;