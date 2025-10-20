#!/usr/bin/env python3
"""Generate Supabase configuration for JavaScript."""
import os
import json

def get_config():
    """Get Supabase configuration from environment variables."""
    return {
        'url': os.environ.get('SUPABASE_URL', ''),
        'key': os.environ.get('SUPABASE_ANON_KEY', '')
    }

if __name__ == '__main__':
    config = get_config()
    print(json.dumps(config))
