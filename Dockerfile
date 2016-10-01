FROM kazu69/node:6.3.0

EXPOSE 3000

VOLUME [/var/www]

ADD . /var/www

WORKDIR /var/www

RUN npm i

CMD ["npm", "start"]
