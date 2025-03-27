import React, { useState } from 'react';
import { Shield, Key, Network, Database, Upload, Search, LogIn, ChevronUp, Eye, X } from 'lucide-react';

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

const Timeline = () => {
  const [selectedStep, setSelectedStep] = useState(null);
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
      case 'critical': å
        return <XCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const attackSteps = [
    {
      id: 1,
      title: "Reconnaissance",
      description: "Attacker gathers information about target systems, networks, and vulnerabilities through scanning, OSINT, and other intelligence gathering techniques.",
      attackSurface: false,
      icon: <Search size={24} />,
      position: "left",
      extendedInfo: "During reconnaissance, attackers collect information without directly interacting with systems. They may use techniques like port scanning, DNS enumeration, social media research, and public data mining. This passive phase helps map out potential vulnerabilities and entry points. Common tools include Nmap, Shodan, and TheHarvester."
    },
    {
      id: 2,
      title: "Initial Access",
      description: "Exploitation of public-facing applications, phishing emails, or compromised credentials to gain first entry into the target environment.",
      attackSurface: true,
      icon: <LogIn size={24} />,
      position: "right",
      extendedInfo: "Initial access represents the first breach of the security perimeter. Common vectors include phishing emails with malicious attachments, exploiting vulnerabilities in public-facing web applications, using valid credentials obtained through social engineering, or leveraging supply chain compromises. This is a critical point for defensive controls and monitoring."
    },
    {
      id: 3,
      title: "Persistence",
      description: "Installation of backdoors, creation of rogue accounts, or configuration of auto-start mechanisms to maintain access even after system reboots.",
      attackSurface: true,
      icon: <Key size={24} />,
      position: "left",
      extendedInfo: "To maintain long-term access, attackers establish persistence mechanisms that survive system reboots or credential changes. Techniques include creating additional user accounts, adding startup items or scheduled tasks, modifying registry keys, installing backdoor services, or implanting web shells. This ensures they can return to the compromised system at will."
    },
    {
      id: 4,
      title: "Privilege Escalation",
      description: "Exploiting vulnerabilities, misconfigurations, or design flaws to gain higher-level permissions and system access rights.",
      attackSurface: true,
      icon: <ChevronUp size={24} />,
      position: "right",
      extendedInfo: "Most initial access provides limited permissions, so attackers seek to elevate privileges to gain administrative or system-level access. Methods include exploiting unpatched vulnerabilities, leveraging misconfigured services, password mining from memory, or utilizing built-in Windows tools like PowerShell to bypass restrictions. Higher privileges enable deeper access and control."
    },
    {
      id: 5,
      title: "Defense Evasion",
      description: "Techniques to avoid detection including disabling security tools, clearing logs, using fileless malware, and encryption of malicious payloads.",
      attackSurface: false,
      icon: <Eye size={24} />,
      position: "left",
      extendedInfo: "Attackers employ numerous techniques to avoid detection by security tools. These include disabling antivirus software, clearing event logs, using fileless malware that operates in memory, encrypting communications, utilizing legitimate system tools ('living off the land'), and employing obfuscation techniques to hide malicious code within seemingly benign files or processes."
    },
    {
      id: 6,
      title: "Credential Access",
      description: "Theft of passwords, hashes, tokens, keys, or certificates through keylogging, credential dumping, or brute force attacks.",
      attackSurface: true,
      icon: <Key size={20} />,
      position: "right",
      extendedInfo: "Obtaining valid credentials is crucial for attackers to move within systems without triggering security alerts. Methods include password dumping tools like Mimikatz, keylogging malware, searching for credentials in files or browser storage, and exploiting authentication protocols. Credentials provide legitimate-appearing access that's difficult to distinguish from normal user activity."
    },
    {
      id: 7,
      title: "Lateral Movement",
      description: "Using obtained credentials and remote access tools to move through the network to reach target systems and data.",
      attackSurface: true,
      icon: <Network size={24} />,
      position: "left",
      extendedInfo: "After establishing a foothold, attackers move horizontally across the network to reach valuable assets. They use techniques like Remote Desktop Protocol (RDP), Windows Management Instrumentation (WMI), PowerShell remoting, or pass-the-hash attacks with stolen credentials. This phase involves exploring the network architecture and identifying critical servers and data repositories."
    },
    {
      id: 8,
      title: "Data Collection",
      description: "Gathering and aggregating sensitive information from various sources within the compromised environment in preparation for exfiltration.",
      attackSurface: false,
      icon: <Database size={24} />,
      position: "right",
      extendedInfo: "Before exfiltration, attackers identify and collect valuable data. They may search for specific file types, access databases to gather customer information, intellectual property, or financial data. This often involves automated tools to locate and package data of interest, potentially using staging areas within the compromised network to prepare data for extraction."
    },
    {
      id: 9,
      title: "Exfiltration",
      description: "Transferring stolen data outside the victim network using encrypted channels, DNS tunneling, or other covert communication methods.",
      attackSurface: true,
      icon: <Upload size={24} />,
      position: "left",
      extendedInfo: "The final stage involves smuggling valuable data out of the organization. Attackers use techniques like encrypted file transfers, custom protocols, steganography (hiding data within other files), DNS tunneling, or cloud storage services. Data is often compressed, encrypted, or broken into smaller chunks to evade data loss prevention tools and network monitoring."
    }
  ];

  const handleStepClick = (id) => {
    if (selectedStep === id) {
      setSelectedStep(null);
    } else {
      setSelectedStep(id);
    }
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
    <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 p-8 text-white min-h-screen w-full">
      <h1 className="text-4xl font-bold text-center mb-10">Attack Pattern Timeline</h1>

      {/* Legend */}
      <div className="flex justify-center gap-8 mb-12">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
          <span className="text-sm font-medium">Attack Surface</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
          <span className="text-sm font-medium">Non-Attack Surface</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute w-1 bg-gray-300 h-full left-1/2 transform -translate-x-1/2 z-0"></div>

        {/* Timeline items */}
        <div className="relative z-10">
          {attackSteps.map((step) => (
            <div key={step.id} className="relative mb-16">
              {/* The extended info modal */}
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
                              <div className={`w-4 h-4 rounded-full mt-1 mr-3 ${phase.status === 'completed' ? 'bg-green-500' :
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

              <div className="flex items-center justify-center relative">

                {/* Step number indicator */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {step.id}
                </div>
                {/* Left content (for even items) */}
                {step.position === "left" && (
                  <div className="w-1/4 lg:w-1/4 pr-1 md:pr-2 text-right">
                    <h3 className={`font-bold text-lg mb-1 ${step.attackSurface ? 'text-red-400' : 'text-blue-400'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-200">{step.description}</p>
                  </div>
                )}

                {/* Right content placeholder for left-positioned items */}
                {step.position === "left" && <div className="w-1/3 pl-8"></div>}

                {/* Center icon */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2                   w-14 h-14 rounded-full shadow-lg flex items-center justify-center 
                    ${step.attackSurface ? 'bg-red-500' : 'bg-blue-500'} cursor-pointer transition-all duration-300 hover:scale-110`}
                    onClick={() => {
                      const matchedIncident = incidentData.find(incident => incident.id === step.id);
                      if (matchedIncident) {
                        setSelectedIncident(matchedIncident);
                        console.log('sasdasd', selectedIncident);
                      }
                    }}
                  title="Click for more details"
                >
                  {step.icon}
                </div>

                {/* Left content placeholder for right-positioned items */}
                {step.position === "right" && <div className="w-1/3 pr-8"></div>}

                {/* Right content (for odd items) */}
                {step.position === "right" && (
                  <div className="w-1/4 lg:w-1/4 pl-1 md:pl-2">
                    <h3 className={`font-bold text-lg mb-1 ${step.attackSurface ? 'text-red-400' : 'text-blue-400'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-200">{step.description}</p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attack Surface Highlight */}
      <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Attack Surface Highlights</h2>
        <p className="text-sm">
          The attack surface encompasses the entry points and interfaces that attackers can target,
          including public applications, authentication systems, user accounts, network services,
          and data transfer mechanisms. Security efforts should prioritize hardening these areas.
        </p>
      </div>

      <div className="mt-4 text-center text-sm text-gray-300">
        Click on any circle to see detailed information about that attack stage
      </div>
    </div>
  );
};

export default Timeline;