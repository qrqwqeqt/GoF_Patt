## Ecorent project

### Our team:

- [Kobziev Daniil](https://t.me/Sevenpointnine) - Team lead
- [Yukhymenko Stas](https://t.me/stas_yukhymenko) - QA and Fullstack developer
- [Katynskyi Illya](https://t.me/girostark) - Front-end developer
- [Solohub Oleksandr](https://t.me/cyan_light) - Back-end developer

### Short description

Our project is an innovative charging station rental site called EcoFlow, which allows users to both rent and lease portable power stations. The main goal of this project is to ensure the availability of chargers for those who need them on a short-term basis, as well as to create a platform for station owners to generate additional income. We aim to create an ecosystem that enables the convenient exchange of energy resources by optimising the use of charging stations. This solution will enable efficient use of resources by reducing the need to purchase expensive stations for temporary needs and will contribute to sustainable development as each station will be used as efficiently as possible.

![screenshot](https://i.imgur.com/0bT7HSm.jpeg)

## How to set up project

#### Front-end (React + TypeScript)

1. [Download node.js (version 22.11.0)](https://nodejs.org/en/blog/release/v22.11.0)
2. Run ```npm install``` in project`s root directory
3. Run ```npm run dev``` to launch front-end part
5. Visit http://localhost:5173/ to see the site ;)
4. Use ```npx playwright test  --reporter=html``` to run e2e tests (you need to have backend running)

#### Back-end (TypeScript + Express)

1. [Download node.js (version 22.11.0)](https://nodejs.org/en/blog/release/v22.11.0)
2. Run ```npm install``` in project`s root directory
3. Run ```npm run dev``` to launch back-end part
4. Now back-end is running ;)
5. Use ```npm test``` to run unit tests
6. Use ```npm run test:api``` to run integration tests with newman
