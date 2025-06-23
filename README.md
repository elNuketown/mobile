# Testes de Mobile JS + Mocha + Appium

Este projeto utiliza JavaScript + Mocha + Appium com Device farm Browserstack para realizar testes mobile Android

---

## 📁 Estrutura do Projeto
```
mobile/
├── .github/
│   └── workflows/
│       └── CI.yml
├── apps/
│   └── node_modules/
├── tests/
│   ├── compra.spec.js
│   └── login.spec.js
├── utils/
│   ├── driver.js
│   ├── login.js
│   └── swipe.js
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── wdio.conf.js
```

---

## ⚙️ Requisitos

| Item                    | Versão/Requisito                                                       |
|-------------------------|------------------------------------------------------------------------|
| Node.js                 | 18 LTS ou superior                                                     |
| Java JDK                | 11 ou superior (com `JAVA_HOME` configurado)                           |
| Android Studio / SDK    | Com `platform-tools` e ao menos um emulador configurado                |
| Appium                  | ^2.19.0 (Instalado globalmente: `npm i -g appium`)                     |
| Appium UIA2 Driver      | ^2.45.1 (`appium-uiautomator2-driver`)                                 |
| WebdriverIO CLI         | ^8.38.0 (`@wdio/cli`)                                                  |
| Mocha                   | ^11.7.0 (`mocha`)                                                      |
| Chai                    | ^4.5.0                                                                 |
| Allure CLI              | ^2.34.0 (`allure-commandline`)                                         |
| Mochawesome             | ^7.1.3 (e plugins de merge e geração de relatório)                     |
| TypeScript (opcional)   | ^5.8.3                                                                 |
| Emulador Android ativo  | Rodando via Android Studio ou `emulator -avd <nome>`                   |

Adicione **`%ANDROID_HOME%\platform-tools`** ao `PATH`.

---

## ✅ Como Executar os Testes

### 1. Instalação as dependências:

npm install

### 2. Iniciar o emulador (ex.: Pixel API 30)

emulator -avd Pixel_11

### 3. Iniciar o Appium Server

npx appium --allow-cors

### 4. Execução de testes:

npm test

### 5. Geração de relatorios:

npm run report:generate

npm run report:open 

---

## 👨‍💻 Autor

Vinicios Virissimo

---