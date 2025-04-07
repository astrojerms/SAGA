  import React, { useState, useEffect } from 'react';
  import { Shield, Key, Network, Cpu, Database, ScanEye, Search, LogIn, Move, Eye, X } from 'lucide-react';
  import dataSet from '../lib/dataSet.json';

  const Timeline = () => {
    const [selectedStep, setSelectedStep] = useState(null);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const attackSteps = dataSet.entries;
    const [isGlowing, setIsGlowing] = useState(false);
    const [isCritical, setIsCritical] = useState(false);
    // Only animate if severity is critical
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
      switch (severity) {
        case 1:
          return <Search size={24} />;
        case 2:
          return <LogIn size={24} />;
        case 3:
          return <Cpu size={24} />;
        case 4: 
          return <Key size={24} />;
        case 5:
            return <ScanEye size={24} />;
        case 6:
            return <Eye size={24} />;
        case 7:
          return <Database size={20} />;
        case 8: 
        return <X size={24} />;
        default:
          return null;
      }
    };

    const formatTimestamp = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };
    
    // Effect to handle the glowing animation for critical items
    useEffect(() => {
      const interval = setInterval(() => {
        setIsGlowing(prev => !prev);
      }, 3000);
      
      return () => clearInterval(interval);
    }, []);

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
            {attackSteps.map((step) => {
              // setIsCritical(step.severity === "critical");
              return (
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
                              {formatTimestamp(selectedIncident.Log.EventTime)}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mt-2">{selectedIncident.KillChainTag}</h3>
                        </div>

                        {/* Attack Storyline */}
                        <div className="bg-gray-700 rounded-lg p-6">
                          <h4 className="text-xl font-semibold text-white mb-2">{selectedIncident.name}</h4>
                          <p className="text-gray-300 mb-4">{selectedIncident.description}</p>
                    
                          <div className="mb-6">
                            <span className="text-gray-400 font-bold text-white capitalize">Context: </span>
                            <span className="text-gray-300">{selectedIncident?.Alert?.Context}</span>
                          </div>
                        </div>

                        {/* MITRE ATT&CK Details */}
                        {
                          selectedIncident?.Alert && (
                              <div className="bg-gray-700 rounded-lg p-4">
                                <h4 className="font-semibold text-white mb-2">MITRE ATT&CK Details</h4>
                                <div className="space-y-2 text-sm text-gray-300">
                                  <div>Technique: {selectedIncident?.Alert?.MitreTag}</div>
                                  <div>Subtechnique: {selectedIncident.Alert.Mitre}</div>
                                </div>
                              </div>
                        )}

                        {/* Technical Details */}
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-2">Technical Details</h4>
                          <table>
                            <tbody>
                            {Object.entries(selectedIncident?.Log)
                              .filter(([_, value]) => value !== "")
                              .map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                  {key} :
                                </td>
                                <td className="px-6 py-4 text-sm text-white text-gray-500">
                                  {value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center relative">

                  {/* Step number indicator */}
                  <div className={`absolute -top-5 left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center text-md font-bold 
                  ${step.severity === "Critical" ? 'mt-[3rem]' : 'mt-[2rem]'}`}
                  >
                    {step.id}
                  </div>
                  {/* Left content (for even items) */}
                  {(step.position === "left" && step.severity !== "Critical") && (
                    <div className="w-1/4 lg:w-1/4 pr-1 md:pr-2 text-right">
                      <p className={`font-bold text-lg mb-1 ${step.attackSurface ? 'text-red-400' : 'text-blue-400'}`}>
                        {step.name}
                      </p>
                      <p className="text-sm text-gray-200"><span className="font-semibold">Event Time:</span> {step?.Log?.EventTime}</p>
                      <p className="text-sm text-gray-200 mb-2"><span className="font-semibold">Norm Type:</span> {step?.Log?.NormType}</p>
                      <p className="text-sm text-gray-200">{step.description}</p>
                    </div>
                  )}

                  {(step.position === "left" && step.severity === "Critical") && (
                    <div className={`w-1/4 lg:w-1/4 p-5 text-right transition-all duration-700 ${isGlowing 
                      ? 'shadow-2xl shadow-blue-800/70 bg-red-500 rounded' 
                      : 'shadow-md shadow-blue-800/30'}
                    `}>
                      <p className={`font-bold text-lg mb-1 ${step.attackSurface ? 'text-white-400' : 'text-blue-400'}`}>
                        {step.name}
                      </p>
                      <p className="text-sm text-white-400"><span className="font-semibold">Event Time:</span> {step?.Log?.EventTime}</p>
                      <p className="text-sm text-white-400 mb-2"><span className="font-semibold">Norm Type:</span> {step?.Log?.NormType}</p>
                      <p className="text-sm text-white-400">{step.description}</p>
                    </div>
                  )}

                  {/* Right content placeholder for left-positioned items */}
                  {step.position === "left" && <div className="w-1/3 pl-8"></div>}

                  {/* Center icon */}
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 font-bold w-15 h-15 rounded-full shadow-lg flex items-center justify-center 
                      ${step.attackSurface ? 'bg-red-500' : 'bg-blue-500'} cursor-pointer transition-all duration-300 hover:scale-110`}
                      onClick={() => {
                        setSelectedIncident(step);
                      }}
                    title="Click for more details"
                  >
                    {getSeverityIcon(step.id)}
                  </div>

                  {/* Left content placeholder for right-positioned items */}
                  {step.position === "right" && <div className="w-1/3 pr-8"></div>}

                  {/* Right content (for odd items) */}
                  {step.position === "right" && (
                    <div className="w-1/4 lg:w-1/4 pl-1 md:pl-2">
                      <h3 className={`font-bold text-lg mb-1 ${step.attackSurface ? 'text-red-400' : 'text-blue-400'}`}>
                        {step.name}
                      </h3>
                      <p className="text-sm text-gray-200"><span className="font-semibold">Event Time:</span> {step?.Log?.EventTime}</p>
                      <p className="text-sm text-gray-200 mb-2"><span className="font-semibold">Norm Type:</span> {step?.Log?.NormType}</p>
                      <p className="text-sm text-gray-200">{step.description}</p>
                    </div>
                  )}

                </div>
              </div>
            )})}
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