FROM nginx:alpine

EXPOSE 9005:80

COPY ./public /usr/share/nginx/html
