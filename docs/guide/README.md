# Getting started

## Demo

Checkout the [demo pages](../demo) or to view the demo examples locally, clone the repo and run `npm install && npm run serve`

## Install

#### npm:

`npm install @mst101/vue-datepicker --save`

#### yarn:

`yarn add @mst101/vue-datepicker`

#### old school:

Download the latest release from github

## Usage

```vue
<template>
  <DatePicker v-model="date"></DatePicker>
</template>

<script>
import DatePicker from '@mst101/vue-datepicker'
import '@mst101/vue-datepicker/style.css'

export default {
  name: 'Example',
  components: {
    DatePicker,
  },
  data() {
    return {
      date: new Date(),
    }
  },
}
</script>
```

To load the CSS you can import it inside the script tag like above.
Another option is to use webpacks [css-loader](https://webpack.js.org/loaders/css-loader/)

```vue
<style>
@import '~@mst101/vue-datepicker/style.css';
</style>
```

If you use [SASS](https://sass-lang.com/) you can directly import the src file.

```vue
<style lang="scss">
@import '~@mst101/vue-datepicker/style.scss';
</style>
```

The `esm` build is for modern browsers and includes ES5 or higher.
If you want to use it and want to include own polyfills you need to transpile it within your build process:

- vue-cli [documentation](https://cli.vuejs.org/config/#transpiledependencies)
- nuxt [documentation](https://cli.vuejs.org/config/#transpiledependencies). Use build.transpile inside the nuxt.config
- babel-loader [documentation](https://babeljs.io/docs/en/options#exclude). You need to add the `exclude` property like this `exclude: /node_modules\/(?![@mst101\/vue-datepicker])/`
