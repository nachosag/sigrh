FROM docker.io/library/node:24-bookworm

RUN mkdir /run/sshd
RUN apt-get update && apt-get install openssh-server -y
RUN ssh-keygen -A

WORKDIR /root/sigrh

COPY --chown=node --chmod=755 package.json package-lock.json .

RUN npm install

CMD ["/usr/sbin/sshd", "-D"]

