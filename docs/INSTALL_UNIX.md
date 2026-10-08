# Installatie
De volgende instructies zijn voor Linux/MacOS.

## Stap 1: Installeren van Node Version Manager
Download/Install NVM:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
Update enviroment:
```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

## Stap 2: Installeren NodeJS
```sh
nvm install 24
```

## Stap 3a: Installeren Python
