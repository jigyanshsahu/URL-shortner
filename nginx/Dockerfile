FROM nginx:1.27-alpine

# Copy our custom config, replacing the default
COPY nginx.conf /etc/nginx/nginx.conf

# Nginx listens on port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
