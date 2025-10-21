#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
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
        if self.path == '/api/admin/login':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            
            try:
                data = json.loads(body)
            except:
                data = {}
            
            password = data.get('password', '')
            admin_password = os.environ.get('ADMIN_PASSWORD', 'mohand2004')
            
            if password == admin_password:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
            else:
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
        else:
            self.send_error(404, 'Not Found')

def run(server_class=HTTPServer, handler_class=NoCacheHTTPRequestHandler, port=5000):
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on 0.0.0.0:{port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
