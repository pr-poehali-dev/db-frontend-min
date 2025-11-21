'''
Business: Test PostgreSQL connection objects and environment variables
Args: event with httpMethod and queryStringParameters; context with request_id
Returns: HTTP response with connection info, cursor info, or environment details
'''

import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters', {})
    path = params.get('path', '')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        if path == 'conn':
            conn = get_db_connection()
            conn_repr = repr(conn)
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'endpoint': '/conn',
                    'result': conn_repr,
                    'type': str(type(conn).__name__)
                })
            }
        
        elif path == 'cursor':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor_repr = repr(cursor)
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'endpoint': '/cursor',
                    'result': cursor_repr,
                    'type': str(type(cursor).__name__)
                })
            }
        
        elif path == 'info':
            database_url = os.environ.get('DATABASE_URL', 'NOT_SET')
            all_env_keys = list(os.environ.keys())
            
            # Get connection parameters
            conn = get_db_connection()
            conn_info = conn.get_dsn_parameters()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'endpoint': '/info',
                    'db_url': database_url,
                    'env_keys': all_env_keys,
                    'connection_params': conn_info
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Invalid path',
                    'available_paths': ['conn', 'cursor', 'info']
                })
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': str(e),
                'type': type(e).__name__
            })
        }
