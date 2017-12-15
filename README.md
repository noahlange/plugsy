           _                       
          | |                      
     _ __ | |_   _  __ _ ___ _   _ 
    | '_ \| | | | |/ _` / __| | | |
    | |_) | | |_| | (_| \__ \ |_| |
    | .__/|_|\__,_|\__, |___/\__, |
    | |             __/ |     __/ |
    |_|            |___/     |___/ 

# plugsy
Plugsy is a zero-dependency plugin framework and utility belt for RPGMaker MV.
It automates and simplifies many common patterns in MV plugin development —
notetags, method shimming, plugin commands, serialization and data loading.

## Overview

```typescript
import Plugsy, { command } from 'plugsy';

class MyPlugin extends Plugsy {
  
  // properties are automatically saved to and loaded from save files
  public myVariable = 42;
  public myOtherVariable = 'YOU ARE TEARING ME APART LISA';
  
  // command can be used to decorate methods as valid plugin commands.
  @command
  public hello(hello: string) {
    console.info(hello);
  }

  // command can also be used as a function in environments without decorators
  public goodbye = command((goodbye: string) => {
    console.info(goodbye);
  });
}

const plugin = new MyPlugin();
$plugsy.install(plugin);
$plugsy.get(MyPlugin) === plugin; // true
```

On save and load, any changes to (serializable) local variables will be
serialized and deserialized to and from save files and hydrated automagically
on load.

Adding new plugin commands is as easy as adding methods with the `command`
decorator.

### Shimmer
Shimmer is a simple utility function. It allows you to easily augment existing
functionality by providing an object of methods and properties that will be
merged onto the functions of the first argument.

```typescript
import { shimmer } from 'plugsy';

class MyObject {
  public myMethod(...args) {
    console.info(myProp, args);
  }
}

shimmer(myObject.prototype, {
  myMethod(original, ...args) {
    let res = original(...args); // invokes original method
    // do stuff!
  }
});
```

### Tagger
Notetags are also automatically parsed and put into the `$plugsy` namespace.
They can be referenced by accessing the relevant property of the namespace's
`notetags` property and extracting the appropriate record by its containing
variable and record ID.

```typescript
const actorOneNotetags = $plugsy.notetags.$dataActors[1];
```

Tags should follow standard HTML syntax. Attributes without a property default
to `true`. Currently, kebab-cased attributes will not be transformed to
camelCase.

```html
<MyTag />
<MyTag foo />
<MyTag foo="bar" />

<MyTag></MyTag>
<MyTag foo></MyTag>
<MyTag foo="bar"></MyTag>

<MyTag>contents</MyTag>
<MyTag foo>contents</MyTag>
<MyTag foo="bar">contents</MyTag>
```

Alternatively, one can manually extract notetags (from custom data sources,
generally) with the `tagger` export.

```typescript
import { tagger } from 'plugsy';

const tags = notetags(`
  <MyTag has="props" foo />
  <MyOtherTag>has contents</MyOtherTag>
`);

/*
 * {
 *   MyTag: {
 *     has: "props",
 *     foo: true
 *   },
 *   MyOtherTag: {
 *     contents: "has contents"
 *   }
 * }
 */

```

### Loader
Files in the 'data' directory can be loaded via Promise using the `loader`
export.

```typescript
import { loader } from 'plugsy';

(async function main() {
  const actors = await loader('Actors');
})();
```

## Installation
You'll need node.js and npm installed in order to build the plugin.

```
git clone git@github.com:noahlange/plugsy.git
cd plugsy
npm install
npm run build
```

Then copy `plugsy.js` to the plugins directory of your project and enable it
normally.