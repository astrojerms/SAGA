#sysmon event ids
import pandas as pd
import os
import json 
import pprint 

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
    "17":"Pipe created",
    "4103":"Microsoft Powershell",
    "4104":"Microsoft Powershell",
    "4624":"An account was successfully logged on",
    "4637":"A privileged service was called",
    "4656":"A handle to an object was requested", #access-request
    "4657":"A registry value was modified",
    "4658":"A handle to an object was closed",
    "4673":"A privileged service was called",
    "4688":"A new process has been created",
    "4689":"A process has exited",
    "4945":"A rule was listed when the Windows Firewall started",
    "5145":"A network share object was checked to see whether client can be granted desired access",
    "5154":"The Windows Filtering Platform has permitted an application or service to listen on a port for incoming connections.",
    "5156":"The Windows Filtering Platform has permitted a connection.",
    "5158":"The Windows Filtering Platform has permitted a bind to a local port.",
    "5447":"A Windows Filtering Platform filter has been changed.",
    "600":"A process was assigned a primary token", #service-start
    "800": "Powershell"

}

normalized_event_ids = {
    "12": "object-activity",
    "10": "process-activity",
    "7": "process-execution", 
    "13":"registry-event",
    "11":"file-create",
    "9": "process-acitivty", #process conducts reading ops from the drive, used by malware for data exfil
    "18": "pipe-event",
    "1":"process-create",  
    "5": "process-activity",
    "23": "file-delete", 
    "8":"process-activity", #process creates a threat in another process 
    "22": "dns-query", #dnsquery 
    "2": "process-activity", 
    "15":"file-activity", 
    "4":"service-activity",
    "17":"pipe-event",
    "4103":"process-execution", #command-invoked
    "4104":"process-execution",
    "4624":"account-logon",
    "4637":"service-activity",
    "4656":"access-request", #access-request
    "4657":"registry-event",
    "4658":"audit-activity",
    "4673":"service-activity",
    "4688":"process-activity",
    "4689":"process-activity",
    "4945":"firewall-activity",
    "5145":"share-activity",
    "5154":"audit-acitivty",
    "5156":"audit-activity.",
    "5158":"audit-activity",
    "5447":"audit-activity",
    "600":"service-start", #service-start
    "800": "process-execution"
}

# types of events for now to normalize logs 
events = ['object-activity', 'process-activity', 'process-create', 'process-execution', 
          'file-create', 'pipe-event', 'file-delete', 'dns-query', 'file-activity'
          'service-activity', 'registry-event']

def normalize(file_to_normalize, type):
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.max_colwidth', None)
    df = pd.read_json(file_to_normalize, lines=True)

    # should use EventID (Sysmon event ids), targetimage, sourceimage, sourcename, host, domain, accountname, eventtype, processId, port, message is rawlog, eventTime

    column_names = df.columns
    print(column_names)

    #adding eventtype (sysmon descriptor) and normalized type in next function

    columns = ['EventTime', 'EventID', 'host', 'port', 'Message', 'TargetProcessId', 'SourceImage', 'SourceName', 'AccountType', 'TargetImage', 'Domain', 'SourceProcessId', 'AccountName', 'UserID', 'ProcessId', 'Application', 'DestPort', 'DestAddress', 'SourceAddress', 'SourcePort', 'Protocol', 'DestinationIp', 'DestinationPort', 'SourceIp', 'SourceHostname', 'SourcePortName', 'Image', 'User', 'SubjectLogonId', 'ProcessName', 'SubjectUserSid', 'SubjectUserName', 'SubjectDomainName', 'Status', 'ImageLoaded', 'Product', 'OriginalFileName', 'ParentCommandLine', 'CommandLine']

    # print(df[columns])
    print("getting columns specified")

    existing_columns = [col for col in columns if col in df.columns]
    df_selected = df[existing_columns]
    json_string = df_selected.to_json(orient='records')
    json_object = json.loads(json_string)
    # print(json_object)
    # pprint(json_object)

    # file_path = "normalized_data.json"
    # with open(file_path, "w") as file:
    #     json.dump(json_object, file, indent=4)

    # print(f"Data written to {file_path}")

    # Narrow scope of wanted IDs and reframe the data to only present what we need for the rule detections below 
    # Meed to map EventID to types of logs also (proc-creation, proc-execution, login, etc., any sysmon we can get, we should map to some sort of event type (as part of attack kill chain))
   
    #df_selected['EventType'] = df['EventId'].copy()
    df_selected = df_selected.assign(EventType=df_selected['EventID'])
    df_selected = df_selected.assign(NormType=df_selected['EventID'])

    for event_id in sysmon_event_ids:
        df_selected['EventType'] = df_selected['EventType'].replace(int(event_id), sysmon_event_ids[event_id])
        df_selected['NormType'] = df_selected['NormType'].replace(int(event_id), normalized_event_ids[event_id])

    #move types to front of file 
    # shift column 'Name' to first position 
    move_column = df_selected.pop('EventType') 
    df_selected.insert(0, 'EventType', move_column) 

    move_column = df_selected.pop('NormType') 
    df_selected.insert(0, 'NormType', move_column) 

    file_path = f"normalized_data_{type}.json"
    json_string = df_selected.to_json(file_path, orient='records', lines=True)
    # json_object = json.loads(json_string)
    # with open(file_path, "w") as file:
    #     json.dump(json_object, file)

    print(f"Data written to {file_path}")

def normalize_winlog(normalize_file):
    # df = pd.read_json(normalize_file, lines=True)

    with open(normalize_file, 'r') as f:
        data = json.load(f)

    for d in data:
        if data['event']:
            print(data['event'])
    # Normalize the JSON data
    # df = pd.json_normalize(data)
    # column_names = df.columns['event']
    # columns = ['event']

    # # print(df[columns])
    # print("getting columns specified")

    # existing_columns = [col for col in columns if col in df.columns]
    # df_selected = df[existing_columns]
    # print(df_selected)


normalize("collection_msf_record_mic_2020-06-09225055.json", "collection")
normalize("cred_access_empire_mimikatz_logonpasswords_2020-08-07103224.json", "cred_access")
normalize("def_eva_empire_dllinjection_LoadLibrary_CreateRemoteThread_2020-07-22000048.json", "defense_eva")
normalize("def_eva_psh_metasploit_stop_netprofm_eventlog_after_reboot.json", "defense_eva")
normalize("discovery_covenant_getdomaingroup_ldap_searchrequest_domain_admins_2020-09-22141005.json", "discovery")
normalize("exec_psh_powershell_httplistener_2020-11-0204130683.json", "execution")
normalize("lateral_empire_wmi_dcerpc_wmi_IWbemServices_ExecMethod_2020-09-21001437.json", "lateral")
normalize("persistence_cmd_userinitmprlogonscript_batch_2020-10-1922471810.json", "persistence")
normalize("priv_esc_empire_uac_shellapi_fodhelper_2020-09-04032946.json", "priv_esc")
# normalize_winlog('caldera_attack_evals_round1_day1_2019-10-20201108.json') 
