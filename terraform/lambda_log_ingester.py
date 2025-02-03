import json
import boto3
import requests
import os

def lambda_handler(event, context):
    opensearch_endpoint = os.getenv("OPENSEARCH_ENDPOINT")
    headers = {"Content-Type": "application/json"}

    for record in event['Records']:
        try:
            log_data = json.loads(record['body'])
            index_url = f"{opensearch_endpoint}/logs/_doc"
            response = requests.post(index_url, json=log_data, headers=headers)

            if response.status_code not in [200, 201]:
                print(f"Failed to index log: {response.text}")

        except Exception as e:
            print(f"Error processing log: {str(e)}")

    return {
        'statusCode': 200,
        'body': json.dumps('Logs processed successfully!')
    }
