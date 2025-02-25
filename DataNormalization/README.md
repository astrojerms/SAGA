## Normalized event types:
Event Types:
- object-activity
- process-activity
- process-create
- process-execution
- file-create
- pipe-event
- file-delete
- dns-query
- file-activity
- service-activity
- registry-event
          
## Currently, we support Windows SYSMON logs with the following EventIDs:
Support Sysmon Event Types: 
- 12: Object create and delete
- 10: ProcessAccess
- 7:  Image Loaded  
- 13: RegistryEvent
- 11: FileCreate
- 9: RawAccessRead 
- 18: PipeEvent
- 1: ProcessCreation   
- 5: ProcessTerminated
- 23: FileDelete  
- 8: CreateRemoteThreat  
- 22: DNSEvent #dnsquery  
- 2: A process changed a file creation time  
- 15: FileCreateStreamHash  
- 4: Sysmon service state changed
### Datasets in normalized data will have following structure in JSON format:
Fields:
 - NormType
- EventType
- EventTime
- EventID
- host
- port
- UserID
- ProcessId
- Image
- User
- ProcessName
- Message
- TargetProcessId
- TargetImage
- SourceImage
- SourceName
- AccountType
- Domain
- SourceProcessId
- AccountName
- Application
- DestPort
- DestAddress
- SourceAddress
- SourcePort
- Protocol
- DestinationIp
- DestinationPort
- SourceIp
- SourceHostname
- SourcePortName
- SubjectLogonId
- SubjectUserSid
- SubjectUserName
- SubjectDomainName
- Status
- ImageLoaded
- Product
- OriginalFileName

### We are currently working on detection rules for APT29 TTPS following the procedures outlined in the adversarial MITRE plans 
https://github.com/mitre-attack/attack-arsenal/tree/master/adversary_emulation/APT29/Emulation_Plan/Day%201 

TODO: Including MITRE tag support, Lockheed Martin Cyber Kill Chain correlation mapping 
