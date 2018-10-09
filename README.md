           _                       
          | |                      
     _ __ | |_   _  __ _ ___ _   _ 
    | '_ \| | | | |/ _` / __| | | |
    | |_) | | |_| | (_| \__ \ |_| |
    | .__/|_|\__,_|\__, |___/\__, |
    | |             __/ |     __/ |
    |_|            |___/     |___/ 

# plugsy
Plugsy is a single-dependency plugin framework and utility belt for RPGMaker MV.
It automates and simplifies many common patterns in MV plugin development —
notetags, method shimming, plugin commands, serialization and data loading.

## Overview

```typescript
import Plugsy, { command, persist } from 'plugsy';

class MyPlugin extends Plugsy {

  // serializable `persist`ed properties are automatically saved to and loaded from save files
  @persist
  public myVariable = 42;

  // command can be used to decorate methods as valid plugin commands.
  @command
  public hello(hello: string) {
    return $dataMyPlugin[hello];
  }

  // commands and persisted variables can also be used in environments without decorators
  public myOtherVariable = persist('YOU ARE TEARING ME APART LISA');
  public goodbye = command((goodbye: string) => {
    console.info(goodbye);
  });
}

$plugsy.install(new MyPlugin());
```

On save and load, any changes to persisted variables will be
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
  myMethod(myObjectInstance: MyObject, myMethod: Function, ...args: any[]) {
    let res = myMethod(...args); // invoke original method
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
to `true`. Kebab-cased attributes are transformed to
camelCase.

```xml
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

const tags = await tagger(`
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
  const dlg = await loader('Dialogue');
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