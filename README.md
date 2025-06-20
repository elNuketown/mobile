# Appium + WebdriverIO (Android)

Automação mobile do **Swag Labs** em JavaScript, Mocha, Appium e relatórios Allure.

---

## 📁 Estrutura

```
├── apps/
│ └── SwagLabs.apk
├── tests/
│ ├── login.js
│ └── compra.js
├── utils/
│ ├── swipe.js
│ └── login.js
├── wdio.conf.cjs
├── package.json
└── README.md
```

---

## ⚙️ Pré-requisitos

| Item | Versão |
|------|--------|
| Node.js | 18 LTS ou superior |
| Java JDK | 11+ |
| Android Studio / SDK | com `platform-tools`, emulador ativo |
| Appium 2 | Instalado localmente (`npm i -g appium`) |

Adicione **`%ANDROID_HOME%\platform-tools`** ao `PATH`.

---

## ✅Como executar

1. **Instalar dependências**

 npm install

2. **Iniciar o emulador (ex.: Pixel API 30)**

 emulator -avd Pixel_11

3.  **Iniciar o Appium Server**

npx appium --allow-cors

4.  **Executar tests**

npm test

## Relatorios

1. **Geração**

 npm run report:generate

2. **Vizualizar**

 npm run report:open 

## 👨‍💻 Autor

Vinicios Virissimo