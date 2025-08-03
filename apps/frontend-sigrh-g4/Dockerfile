FROM docker.io/library/node:24-bookworm

WORKDIR /home/node

COPY --chown=node --chmod=755 --exclude=README.md --exclude=.git --exclude=*.env --exclude=Dockerfile --exclude=*.Dockerfile --exclude=docker-compose.yaml --exclude=.gitignore . .

RUN npm install

USER node
CMD ["npm", "run", "dev"]

