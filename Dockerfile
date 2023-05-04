FROM node:14

WORKDIR /app 

COPY package.json /app 
COPY yarn.lock /app

RUN yarn install --production

COPY . /app 


ENV CLOUD_ENV=production \
    ALLOWED_ORIGINS=http://localhost:3000,localhost \
    BASE_URL=http://localhost:3000 \

CMD [ "yarn", "start" ]
