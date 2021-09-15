FROM node:14

WORKDIR /usr/src/app
RUN mkdir src/

COPY package.json ./
COPY yarn.lock ./

RUN yarn

# generate graphql and prisma client
COPY prisma ./
COPY codegen.yml ./
COPY src/schema.graphql ./src
COPY src/types ./src
RUN yarn generate

COPY . .
RUN yarn build

EXPOSE 4000
CMD [ "yarn", "start" ]
