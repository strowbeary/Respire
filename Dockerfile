FROM nginx:alpine

EXPOSE 9003:80

ENV VIRTUAL_HOST=respire.remicaillot.fr
ENV LETSENCRYPT_HOST=respire.remicaillot.fr
ENV LETSENCRYPT_EMAIL=remi.caillot@edu.gobelins.fr

RUN ls ./home
COPY ./dist /usr/share/nginx/html
