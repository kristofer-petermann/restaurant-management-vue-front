# vue-restaurant1

## Public URL

https://krpetg-vue-restaurant1.proxy.itcollege.ee/

A restaurant management web application built with **Vue 3**, **Vite**, and **TypeScript**.

## Features

- **State management:** Pinia
- **Routing:** Vue Router
- **Authentication:** JWT + refresh tokens (TalTech backend)
- **Features:**
  - User login and registration
  - Menu CRUD (create, read, update, delete)
  - Menu categories and menu items management
  - Persistent authentication (localStorage)
  - Error handling and validation
- **Main views:** Home, About, Menus, MenuCategories, MenuItems, Login, Register, NotFound

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
# restaurant-management-vue-front
