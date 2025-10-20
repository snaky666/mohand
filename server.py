#!/usr/bin/env python3
"""Simple HTTP server for static files with cache control."""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP handler that disables caching."""
    
    def end_headers(self):
        """Add cache-control headers to prevent caching."""
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run(server_class=HTTPServer, handler_class=NoCacheHTTPRequestHandler, port=5000):
    """Run the HTTP server."""
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on 0.0.0.0:{port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
