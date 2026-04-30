FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# `dotnet publish` emits the DLL using the csproj filename (engine-b.dll), not
# the RootNamespace. Keep this in sync with engine-b.csproj.
ENTRYPOINT ["dotnet", "engine-b.dll"]
