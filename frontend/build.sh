docker build -t test . \
    --build-arg "HTTP_PROXY=http://example.com:9001/" \
    --build-arg "HTTPS_PROXY=http://example.com:9001/" \
    --build-arg "NO_PROXY=localhost,127.0.0.1,example.com" 
