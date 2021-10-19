FROM node:12.14

RUN mkdir -p /app/backend

WORKDIR /app/backend

#COPY . .
COPY . /app/backend

RUN npm install

RUN npm install -g sequelize-cli

# RUN npm install sequelize-cli

EXPOSE 3001
