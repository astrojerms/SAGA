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
}

# types of events for now to normalize logs 
events = ['object-activity', 'process-activity', 'process-create', 'process-execution', 
          'file-create', 'pipe-event', 'file-delete', 'dns-query', 'file-activity'
          'service-activity', 'registry-event']

def normalize(file_to_normalize):
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.max_colwidth', None)
    df = pd.read_json(file_to_normalize, lines=True)

    # should use EventID (Sysmon event ids), targetimage, sourceimage, sourcename, host, domain, accountname, eventtype, processId, port, message is rawlog, eventTime

    column_names = df.columns
    print(column_names)

    #adding eventtype (sysmon descriptor) and normalized type in next function

    columns = ['EventTime', 'EventID', 'host', 'port', 'Message', 'TargetProcessId', 'SourceImage', 'SourceName', 'AccountType', 'TargetImage', 'Domain', 'SourceProcessId', 'AccountName', 'UserID', 'ProcessId', 
            'Application', 'DestPort', 'DestAddress', 'SourceAddress', 'SourcePort', 'Protocol', 'DestinationIp', 'DestinationPort', 'SourceIp', 'SourceHostname', 'SourcePortName', 
            'Image', 'User', 'SubjectLogonId', 'ProcessName', 'SubjectUserSid', 'SubjectUserName', 'SubjectDomainName', 'Status', 'ImageLoaded', 'Product', 'OriginalFileName']


    # print(df[columns])
    print("getting columns specified")
    df_selected = df[columns]
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
        df_selected['EventType'] = df_selected['EventType'].replace(event_id, sysmon_event_ids[str(event_id)])
        df_selected['NormType'] = df_selected['NormType'].replace(event_id, normalized_event_ids[str(event_id)])

    #move types to front of file 
    # shift column 'Name' to first position 
    move_column = df_selected.pop('EventType') 
    df_selected.insert(0, 'EventType', move_column) 

    move_column = df_selected.pop('NormType') 
    df_selected.insert(0, 'NormType', move_column) 

    file_path = "normalized_data.json"
    json_string = df_selected.to_json(file_path, orient='records', lines=True)
    # json_object = json.loads(json_string)
    # with open(file_path, "w") as file:
    #     json.dump(json_object, file)

    print(f"Data written to {file_path}")

normalize('apt29_evals_day1_manual_2020-05-01225525.json') 
