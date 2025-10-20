#!/usr/bin/env python3
"""Generate Supabase configuration for JavaScript."""
import os
import json

def get_config():
    """Get Supabase configuration from environment variables."""
    return {
        'url': os.environ.get('https://uqirjzszhxgqecdinuot.supabase.co', ''),
        'key': os.environ.get('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxaXJqenN6aHhncWVjZGludW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5Njk0NDksImV4cCI6MjA3NjU0NTQ0OX0.BPYKL2TaeIZayOPdI7-E0OHM3FuCZP15bsfPNSj_Zjk', '')
    }

if __name__ == '__main__':
    config = get_config()
    print(json.dumps(config))
