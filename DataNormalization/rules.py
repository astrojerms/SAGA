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
     "Context": "APT29 is known for using the Pupy C2 server. The actors send a reverse shell via a document named 3aka.doc which utilizes either shell or powershell.", 
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
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
     "Context": "APT29 is known for using the Pupy C2 server with Draft.zip. They are known to use a command to download and run Draft.zip in AppData directory",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #TODO: change content except rulename 
    {"RuleName": "Metasploit_Handler",
     "Detection": {
         "Contains": {
             "CommandLine": ["upload \"/tmp/monkey.png\"", "handler -H 0.0.0.0 -P 443 -p windows/x64/meterpreter/reverse_https"],
             "SourceImage": ["powershell", "shell"],
         }
     },
     "Mitre": ["Deploy Stealth Toolkit"],
     "KillChainTag": "Installation",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for using the Pupy C2 server to deploy a Metasploit handler as part of deploying a stealth toolkit.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    {"RuleName": "Meterpreter_Setup",
     "Detection": {
         "Contains": {
             "CommandLine": ["""powershell.exe -noni -noexit -ep bypass -window hidden -c "sal a New-Object;Add-Type -AssemblyName 'System.Drawing'; $g=a System.Drawing.Bitmap('C:\Users\username\Downloads\monkey.png');$o=a Byte[] 4480;for($i=0; $i -le 6; $i++){foreach($x in(0..639)){$p=$g.GetPixel($x,$i);$o[$i*640+$x]=([math]::Floor(($p.B-band15)*16)-bor($p.G-band15))}};$g.Dispose();IEX([System.Text.Encoding]::ASCII.GetString($o[0..3932]))"
""", """Set-ItemProperty -Path "HKCU:\Software\Classes\Folder\shell\open\command" -Name "DelegateExecute" -Force
""", """%windir%\system32\sdclt.exe""", """Remove-Item -Path HKCU:\Software\Classes\Folder* -Recurse -Force"""],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Deploy Stealth Toolkit"],
     "KillChainTag": "Installation",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for using the Pupy C2 server to deploy Meterpreter as part of deploying a stealth toolkit.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 4 - Defense Evasion and Discovery 
    {"RuleName": "Terminate-Pupy-RAT-Proc",
     "Detection": {
         "Contains": {
             "CommandLine": [""".\sdelete64.exe /accepteula """, "rcs.3aka.doc", "Draft.zip", "SysinternalsSuite.zip"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Defense Evasion and Discovery"],
     "KillChainTag": "Defense Evasion",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for using the Pupy C2 server and deleting their artifacts using meterpreter via Powershell.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 5 - Persistence
    {"RuleName": "Meterpreter-Persistence",
     "Detection": {
         "Contains": {
             "CommandLine": ["Invoke-Persistence -PersistStep 1", "Invoke-Persistence -PersistStep 1"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Persistence"],
     "KillChainTag": "Persistence",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 is known for persising using the Invoke-Persistence commands.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 6 - Credential Access
    {"RuleName": "APT29-Chrome-Password-Collector",
     "Detection": {
         "Contains": {
             "CommandLine": ["C:\Program Files\SysinternalsSuite\accesschk.exe", "Get-PrivateKeys", "run post/windows/gather/credentials/credential_collector"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Credential Access"],
     "KillChainTag": "Credential Access",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 utilized chrome-password collectors to get password hashes and PFX certificates",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 7 - Collection and Exfiltration
    {"RuleName": "APT29-Chrome-Password-Collection",
     "Detection": {
         "Contains": {
             "CommandLine": ["Invoke-ScreenCapture;Start-Sleep -Seconds 3;View-Job -JobName \"Screenshot\"", "Get-Clipboard", "Keystroke-Check", "View-Job", "Remove-Job"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Collection"],
     "KillChainTag": "Collection",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 uses keyloggers and screenshots to collect and exfiltrate data from user device and session.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
     {"RuleName": "APT29-Exfiltration",
     "Detection": {
         "Contains": {
             "CommandLine": [ "Invoke-Exfil"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Data Exfiltration"],
     "KillChainTag": "Exfiltration",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 uses keyloggers and screenshots to collect and exfiltrate data from user device and session.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 8 - Lateral Movement
    {"RuleName": "APT29-Webdav-LateralMovement",
     "Detection": {
         "Contains": {
             "CommandLine": [ "cd /var/www/webdav", "Ad-Search Computer Name *", "Invoke-Command", "Get-Process -IncludeUserName"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Lateral Movement"],
     "KillChainTag": "Lateral Movement",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 uses webdav share to copy payloads and opens a Meterpreter shell to get session ID and user information for lateral movement",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
     {"RuleName": "APT29-SeaDuke-LateralMovement",
     "Detection": {
         "Contains": {
             "CommandLine": [ "Invoke-SeaDukeStage", ".\PsExec64.exe -accepteula \\<victim 2 IP> -u"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Lateral Movement"],
     "KillChainTag": "Lateral Movement",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 executes SEADUKE remotely via powershell to get user information and logins.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     },
    #Step 9 - Collection
    {"RuleName": "APT29-Seaduke-Metasploit-Collection",
     "Detection": {
         "Contains": {
             "CommandLine": [ "Seaduke", "sessions", "upload"],
             "SourceImage": ["powershell.exe"],
         }
     },
     "Mitre": ["Collection"],
     "KillChainTag": "Collection",
     "MitreTag": ["T1027", "T1105"],
     "Context": "APT29 executes SEADUKE to upload exfiltration data.",
     "Source": "https://github.com/mitre-attack/attack-arsenal/blob/master/adversary_emulation/APT29/"
     }, 
}
