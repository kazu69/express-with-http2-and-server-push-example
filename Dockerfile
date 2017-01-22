FROM kazu69/node:7.2.0

EXPOSE 3000

VOLUME [/var/www]

ADD . /var/www

WORKDIR /var/www

RUN yarn

CMD ["yarn", "start"]
