Datasets in normalized data will follow the following structure in JSON format: 
columns = ['NormType', 'EventType', 'EventTime', 'EventID', 'host', 'port', 'Message', 'TargetProcessId', 'SourceImage', 'SourceName', 'AccountType', 'TargetImage', 'Domain', 'SourceProcessId', 'AccountName', 'UserID', 'ProcessId', 'Application', 'DestPort', 'DestAddress', 'SourceAddress', 'SourcePort', 'Protocol', 'DestinationIp', 'DestinationPort', 'SourceIp', 'SourceHostname', 'SourcePortName', 'Image', 'User', 'SubjectLogonId', 'ProcessName', 'SubjectUserSid', 'SubjectUserName', 'SubjectDomainName', 'Status', 'ImageLoaded', 'Product', 'OriginalFileName']

We have the following normalized event types for all events:
events = ['object-activity', 'process-activity', 'process-create', 'process-execution', 
          'file-create', 'pipe-event', 'file-delete', 'dns-query', 'file-activity'
          'service-activity', 'registry-event']
          
Currently, we support Windows SYSMON logs with the following EventIDs:
sysmon_event_ids = {
    "12": "Object create and delete",
    "10": "ProcessAccess",
    "7": "Image Loaded", 
    "13":"RegistryEvent",
    "11":"FileCreate",
    "9": "RawAccessRead", #process conducts reading ops from the drive, used by malware for data exfil
    "18": "PipeEvent",
    "1":"ProcessCreation",  
    "5": "ProcessTerminated",
    "23": "FileDelete", 
    "8":"CreateRemoteThreat", #process creates a threat in another process 
    "22": "DNSEvent", #dnsquery 
    "2": "A process changed a file creation time", 
    "15":"FileCreateStreamHash", 
    "4":"Sysmon service state changed",
}

We are currently working on detection rules for APT29 TTPS following the procedures outlined in the adversarial MITRE plans 
https://github.com/mitre-attack/attack-arsenal/tree/master/adversary_emulation/APT29/Emulation_Plan/Day%201 

TODO: Including MITRE tag support, Lockheed Martin Cyber Kill Chain correlation mapping 
