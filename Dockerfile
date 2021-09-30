FROM node:14.15.4-alpine
WORKDIR /usr/src/sundaeweb
RUN mkdir build/
RUN apk add --no-cache bash
COPY . /usr/src/sundaeweb
#COPY .env ./
#RUN cat ./.env
#RUN chmod 700 .env
RUN yarn install
RUN yarn build
RUN ls -lah
EXPOSE 3000
CMD yarn start