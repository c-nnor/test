FROM node:22-alpine as frontend_builder

WORKDIR /app

COPY ./frontend/package.json ./

RUN npm install   

COPY ./frontend .

RUN npm run build

# Backend builder
FROM node:22-alpine as backend_builder

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build


# # Database builder 
# FROM node:22-alpine as database_builder

# WORKDIR /app

# COPY ./backend/prisma ./prisma/


# RUN npx prisma migrate deploy


# Final stage
FROM node:22-alpine as final

WORKDIR /app

COPY --from=frontend_builder /app/dist ./frontend/dist
COPY --from=backend_builder /app/dist ./

COPY --from=backend_builder /app/package.json ./
COPY --from=backend_builder /app/node_modules ./node_modules

CMD ["npm", "run", "start:prod"]
# ENTRYPOINT ["tail"]
# CMD ["-f","/dev/null"]

