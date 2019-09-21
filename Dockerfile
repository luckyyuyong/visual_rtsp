FROM node:10.16.3-alpine

RUN mkdir /app
WORKDIR /app

COPY . /app
WORKDIR /app
RUN yarn
RUN node scripts/build.js .

EXPOSE 3001
CMD ["yarn", "start"]
