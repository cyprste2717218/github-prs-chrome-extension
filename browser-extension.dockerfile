FROM ghcr.io/puppeteer/puppeteer:24.34.0@sha256:10da2500456c6a8ba5674599f1052c1129a5af90940d98c1ab7ca2b0530c5b84

WORKDIR /app

USER root

COPY . .

RUN sudo apt-get install xvfb

RUN npm install

RUN npm run build

RUN npx puppeteer browsers install chrome

# RUN useradd -ms /bin/bash default
# USER default

ENTRYPOINT ["npm", "run", "test:end"]