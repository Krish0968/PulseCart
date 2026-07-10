# Stage 1: Build functions
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package

# Stage 2: Functions Runtime
FROM mcr.microsoft.com/azure-functions/java:4-java21
WORKDIR /home/site/wwwroot
COPY --from=build /app/target/azure-functions/pulsecart-recommendations /home/site/wwwroot
