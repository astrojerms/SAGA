Rules = {
    {"RuleName": "APT29_Pupy_C2",
     "Detection": {
         "Contains": {
             "TargetImage": ["3aka3.scr", "3aka.doc"],
             "Image": ["3aka.scr", "3aka.doc"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Initial Breach", "Command and Control", "Web Protocols"],
     "KillChainTag": "Delivery",
     "MitreTag": "T1071",
     "Context": "APT29 is known for using the Pupy C2 server. The actors send a reverse shell via a document named 3aka.doc which utilizes either shell or powershell."
     },
    {"RuleName": "APT29_Draft_Zip_Powershell",
     "Detection": {
         "Contains": {
             "CommandLine": ["AppData\\Roaming\\Draft.Zip", "APPDATA\\Draft.Zip"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Rapid Collect and Exfiltration", "Exfiltration"],
     "KillChainTag": "Installation",
     "MitreTag": "T1646",
     "Context": "APT29 is known for using the Pupy C2 server with Draft.zip. They are known to use a command to download and run Draft.zip in AppData directory"
     },
    #TODO: change content except rulename 
    {"RuleName": "Metasploit_Handler",
     "Detection": {
         "Contains": {
             "CommandLine": [""],
             "SourceImage": [""],
         }
     },
     "Mitre": ["Deploy Stealth Toolkit"],
     "KillChainTag": "Installation",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for using the Pupy C2 server to deploy a Metasploit handler as part of deploying a stealth toolkit."
     },
    {"RuleName": "Meterpreter_Setup",
     "Detection": {
         "Contains": {
             "CommandLine": [""],
             "SourceImage": [""],
         }
     },
     "Mitre": ["Deploy Stealth Toolkit"],
     "KillChainTag": "Installation",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for using the Pupy C2 server to deploy Meterpreter as part of deploying a stealth toolkit."
     },
    #Step 4 - Defense Evasion and Discovery 
    #Step 5 - Persistence
    #Step 6 - Credential Access
    #Step 7 - Collection and Exfiltration
    #Step 8 - Lateral Movement
    #Step 9 - Collection
    #Step 10 - Persistence Execution   
}