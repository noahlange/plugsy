# plugsy
Plugsy is a plugin framework and utility belt for RPGMaker MV. It automates and
simplifies many common patterns in MV plugin development — notetags, method
shimming, plugin commands, variable serialization, data loading and event
handling.

## Features

### Plugin commands

```typescript
import Plugsy, { command, persist } from 'plugsy';

class MyPlugin extends Plugsy {
  // command can be used to decorate methods as valid plugin commands.
  // invoke in plugin command as `my_plugin hello`
  @command('Says hello!')
  public hello(name: string) {
    console.info(`Hello, ${name}!`);
  }

  // description is not strictly required
  @command
  public message(message: string) {
    console.info(message);
  }

  // commands can also wrap arrow/anonymous functions for environments
  // without decorators
  public goodbye = command((name: string) => {
    console.info(`Goodbye, ${name}`);
  }, 'Says goodbye!');
}

$plugsy.install(MyPlugin);
```

### Persistance

```typescript
import Plugsy, { command, persist } from 'plugsy';

class MyPlugin extends Plugsy {
  // serializable `persist`ed properties are automatically saved to and loaded
  // from save files
  @persist
  public myVariable = 42;

  // commands and persisted variables can also be used in environments
  // without decorators
  public myOtherVariable = persist('YOU ARE TEARING ME APART LISA');
}

$plugsy.install(MyPlugin);
```

On save and load, any changes to persisted variables will be
serialized and deserialized to and from save files and hydrated automagically
on load.

Adding new plugin commands is as easy as adding methods with the `command`
decorator.

### Redef / Dedef
`redef` and `dedef` are simple utility functions. `redef` allows you to easily augment existing
functionality by providing an object of methods that will be merged onto the first argument.
This allows you to safely "overwrite" object methods and prototypes without threatening existing code. `dedef`, given a handle returned by `redef`, reverses the operation.

```typescript
import { redef, dedef } from 'plugsy';

class MyObject {
  public myMethod(...args) {
    console.info(myProp, args);
  }
}

const handle = redef(myObject.prototype, {
  myMethod: (
    myObjectInstance: MyObject, // object instance
    myMethod: Function, // original, bound method
    ...args: any[] // any args passed to original fn
  ) => {
    let res = myMethod(...args); // invoke original
    // do stuff!
  }
});

dedef(myObject.prototype, handle); // revert shimmed methods
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

### Event bus

The global Plugsy manager, `$plugsy`, also functions as a rudimentary event bus, allowing
you to dispatch and respond to events within your plugins.

```typescript
import Plugsy, { on } from 'plugsy';

class MyPlugin extends Plugsy {
  @on('console')
  public log(message: string) {
    console.log(message);
  }
}

$plugsy.dispatch('console', 'Hello, world!'); // logs "Hello, world!"
```

## Installation

You'll need node.js and npm installed in order to build the plugin.

```bash
git clone git@github.com:noahlange/plugsy.git
cd plugsy
npm install
npm run build
```

Then copy `plugsy.js` to the plugins directory of your project and enable it
normally.
