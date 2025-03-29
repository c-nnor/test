docker compose exec backend npx prisma studio

docker compose logs 

docker compose up

docker compose down

docker compose restart backend

docker compose stop frontend && docker compose rm -f frontend && docker compose build --no-cache frontend && docker compose up -d