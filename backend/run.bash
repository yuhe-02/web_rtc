docker build -t node-app .
docker run -it --rm -p 3001:3001 -v $(pwd):/app node-app
