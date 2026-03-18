# ### STAGE 1: Build ###

# FROM node:22-alpine AS build
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# ### STAGE 2: Run ###
# FROM nginx:1.27-alpine
# COPY nginx.conf /etc/nginx/nginx.conf
# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80

# FROM postgres:17

# # Install build dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     git \
#     postgresql-server-dev-17

# # Clone and build latest pgvector
# RUN git clone https://github.com/pgvector/pgvector.git && \
#     cd pgvector && \
#     make && \
#     make install

# # Clean up
# RUN apt-get remove -y build-essential git postgresql-server-dev-17 && \
#     apt-get autoremove -y && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/* /pgvector

# # Create a directory in a location where OpenShift random UID can write
# RUN mkdir -p /var/lib/pgdata && \
#     chmod -R 777 /var/lib/pgdata

# # Set environment variables for OpenShift compatibility
# ENV PGDATA=/var/lib/pgdata
# ENV POSTGRES_USER=postgres
# ENV POSTGRES_PASSWORD=postgres

FROM postgres:17

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-17

# Clone and build latest pgvector
RUN git clone https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install

# Clean up
RUN apt-get remove -y build-essential git postgresql-server-dev-17 && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /pgvector

# Do NOT set PGDATA here

