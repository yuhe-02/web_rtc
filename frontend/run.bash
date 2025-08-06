# docker build -t next-app .
docker run -it --rm -p 3000:3000 -v $(pwd):/app next-app
