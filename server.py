#!/usr/bin/env python3
"""Simple HTTP server for static files with cache control and secure Supabase admin API."""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json
from urllib.parse import urlparse, parse_qs
from supabase import create_client, Client

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP handler that disables caching and serves Supabase config + admin API."""
    
    def __init__(self, *args, **kwargs):
        self.supabase_admin: Client = None
        super().__init__(*args, **kwargs)
    
    def _get_admin_client(self):
        """Get Supabase admin client with service role key."""
        if self.supabase_admin is None:
            url = os.environ.get('SUPABASE_URL', '')
            key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
            if url and key:
                self.supabase_admin = create_client(url, key)
        return self.supabase_admin
    
    def end_headers(self):
        """Add cache-control headers to prevent caching."""
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        """Handle GET requests, including Supabase config endpoint."""
        if self.path == '/api/config':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            config = {
                'supabaseUrl': os.environ.get('SUPABASE_URL', ''),
                'supabaseKey': os.environ.get('SUPABASE_ANON_KEY', '')
            }
            self.wfile.write(json.dumps(config).encode())
        else:
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests for admin operations."""
        parsed_path = urlparse(self.path)
        
        # Admin authentication check
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(body)
        except:
            data = {}
        
        # Simple password check for admin operations
        password = data.get('password', '')
        if password != 'admin123':
            self.send_response(403)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
            return
        
        # Delete booking
        if parsed_path.path == '/api/admin/delete-booking':
            booking_id = data.get('id')
            if not booking_id:
                self.send_error(400, 'Missing booking ID')
                return
            
            try:
                client = self._get_admin_client()
                response = client.table('bookings').delete().eq('id', booking_id).execute()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        # Update announcement
        elif parsed_path.path == '/api/admin/update-announcement':
            message = data.get('message', '')
            
            try:
                client = self._get_admin_client()
                
                # Get existing announcement
                response = client.table('announcements').select('*').order('created_at', desc=True).limit(1).execute()
                
                if response.data and len(response.data) > 0:
                    # Update existing
                    ann_id = response.data[0]['id']
                    client.table('announcements').update({'message': message}).eq('id', ann_id).execute()
                else:
                    # Insert new
                    client.table('announcements').insert({'message': message}).execute()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        else:
            self.send_error(404, 'Not Found')

def run(server_class=HTTPServer, handler_class=NoCacheHTTPRequestHandler, port=5000):
    """Run the HTTP server."""
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on 0.0.0.0:{port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
