The Project is a tool to help manage sql files in your application.

in visual studio, can use the project with the psm-intellisense.vsix extension work with the node tool.

### Build psm-ui
```
cd psm-ui
npm install
npm run build
```

because of the ui parts was writen by vue3, we should use node 20+ to build, but we can use the package with version older after build.

### Register the npx cli
at the root directory run cmd below:
```
npm link
```

### Run
```
psm
```