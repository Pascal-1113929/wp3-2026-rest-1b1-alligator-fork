# WP3 - REST

## Credits

| Naam             | Github          | Student nummer |
| ---------------- | --------------- | -------------- |
| Max van der Wolf | MVDW-Java       | 1121058        |
| Emma Lodder      | Emma-1122591    | 1122591        |
| Raphaël Gareng   | raphael-1031557 | 1031557        |
| Pascal Benink    | Pascal-1113929  | 1113929        |

# Installatie en starten van de Webapplicatie

Het installeer van alle dependencies en het opstarten van de Webapplicatie

## Windows

### Benodigdheden:

- Python 3.12-3.14
- NodeJS Versie 24.13.0 > - [NodeJS Met NVM voor Windows](/docs/INSTALL_NODEJS_WINDOWS.md)
- Ollama > https://ollama.com/

### Stappen Algemeen

#### 1. git clone

```bash
git clone https://github.com/Rac-Software-Development/wp3-2026-rest-1b1-alligator.git
```

#### 2. verplaatsen naar map

```bash
cd wp3-2026-rest-1b1-alligator
```

#### 3. Environment

1. Dupliceer .env.example en maar er .env van
2. Vul de volgende waardes in:

```env
backend_http_host=0.0.0.0
backend_http_port=5000
frontend_base_url=http://127.0.0.1:5000
backend_ollama_host=http://127.0.0.1:11434
backend_ollama_model=qwen3.5:9b-q8_0
frontend_http_host=0.0.0.0
frontend_http_port=8080
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### Stappen backend

#### 4. Maak venv aan

```bash
python -m venv backend\venv
```

#### 5. Venv activeren(cmd)

```bash
backend\venv\Scripts\activate
```

#### 6. Installeer dependencies

```bash
pip install -r backend\requirements.txt
```

#### 7. Create database bestand

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python backend/database/db.py
```

#### 8. Vul DB

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python scripts/import_db.py
```

en wacht tot dit klaar is

#### 9. starten backend

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python backend/app.py
```

### Stappen frontend

Open nieuwe cmd in wp3-2026-rest-1b1-alligator/frontend

#### 10. Installer dependencies

```bash
npm i
```

#### 11. start frontend

```bash
npm run dev
```

#### 12. Applicatie openen

Nu staat de applicatie aan op: http://localhost:1420/

## Linux/MacOS

### Benodigdheden:

- Python 3.12-3.14
- NodeJS Versie 24.13.0
- Ollama: https://ollama.com/

### Stappen Algemeen

#### 1. git clone

```bash
git clone https://github.com/Rac-Software-Development/wp3-2026-rest-1b1-alligator.git
```

#### 2. verplaatsen naar map

```bash
cd wp3-2026-rest-1b1-alligator
```

#### 3. Environment

1. Dupliceer .env.example en maar er .env van
2. Vul de volgende waardes in:

```env
backend_http_host=0.0.0.0
backend_http_port=5000
frontend_base_url=http://127.0.0.1:5000
backend_ollama_host=http://127.0.0.1:11434
backend_ollama_model=qwen3.5:9b-q8_0
frontend_http_host=0.0.0.0
frontend_http_port=8080
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### Stappen backend

#### 4. Maak venv aan

```bash
python -m venv backend\venv
```

#### 5. Venv activeren

```bash
source backend/venv/bin/activate
```

#### 6. Installeer dependencies

```bash
pip install -r backend\requirements.txt
```

#### 7. Vul DB

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python scripts/import_db.py
```

en wacht tot dit klaar is

#### 8. starten backend

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python backend/app.py
```

### Stappen frontend

Open nieuwe cmd in wp3-2026-rest-1b1-alligator/frontend

#### 9. Installer dependencies

```bash
npm i
```

#### 10. start frontend

```bash
npm run dev
```

#### 12. Applicatie openen

Nu staat de applicatie aan op: http://localhost:1420/

## Docker

### Benodigdheden:

- Python 3.12-3.14
- Docker versie: 29.3.1 of Docker Desktop versie: 4.66.1

### Stappen Algemeen

#### 1. git clone

```bash
git clone https://github.com/Rac-Software-Development/wp3-2026-rest-1b1-alligator.git
```

#### 2. verplaatsen naar map

```bash
cd wp3-2026-rest-1b1-alligator
```

#### 3. Environment

1. Dupliceer .env.example en maar er .env van
2. Vul de volgende waardes in:

```env
backend_http_host=0.0.0.0
backend_http_port=5000
frontend_base_url=http://wp3-backend:5000
backend_ollama_host=http://127.0.0.1:11434
backend_ollama_model=qwen3.5:9b-q8_0
frontend_http_host=0.0.0.0
frontend_http_port=8080
VITE_API_BASE_URL=http://wp3-backend:5000
```

### Stappen DB creatie

#### 4a. Maak venv aan(Windows)

```bash
python -m venv backend\venv
```

#### 4b. Maak venv aan (Linux/macOS)

```bash
python3 -m venv backend/venv
```

#### 5a. Venv activeren(Windows-cmd)

```bash
backend\venv\Scripts\activate
```

#### 5b. Venv activeren (Linux/macOS)

```bash
source backend/venv/bin/activate
```

#### 6. Installeer dependencies

```bash
pip install -r backend/requirements.txt
```

#### 7. Create database bestand

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python backend/database/db.py
```

#### 8. Vul DB

vanuit de root van je git folder in je terminal voer het volgende uit:

```bash
python scripts/import_db.py
```

en wacht tot dit klaar is

### Stappen Docker

#### 9. Zorg dat Docker draait

Start Docker Desktop op je systeem

#### 10. Build en start de container

```bash
docker compose up --build
```

#### 11. Applicatie openen

nu draait de applicatie op: http://localhost:1420/ en http://127.0.0.1:5000

### Handige commands

#### Stop Containers

```bash
docker compose down
```

## Testgebruiker Login
| rol     | email               | password    |
|---------|---------------------|-------------|
| student | emma7@testdata.nl   | teststudent |
| docent  | teacher@testdata.nl | testteacher |

## API Documentatie
[API Docs](/docs/API_DOCS.md)

## ERD
<img width="1047" height="766" alt="image" src="https://github.com/user-attachments/assets/f78ed689-698d-4f8a-a27a-970d7f841de9" />

ERD Gegenereerd met DbVisualizer https://www.dbvis.com/ 

## Screenshots
Student dashboard
<img width="1871" height="851" alt="image" src="https://github.com/user-attachments/assets/dc659b9d-c7dc-434b-aa67-32c9687a07e4" />

Docent inzicht op vak van klas
<img width="1871" height="803" alt="image" src="https://github.com/user-attachments/assets/5010c1c7-5d88-4e47-90ee-52353337381e" />

Docent dashboard
<img width="1867" height="879" alt="image" src="https://github.com/user-attachments/assets/5d3849a3-9b30-4a70-b874-ddead842109c" />

## Bronnen

De bronnen staan in

- [Sources](https://github.com/Rac-Software-Development/wp3-2026-rest-1b1-alligator/blob/main/docs/SOURCES.md)
