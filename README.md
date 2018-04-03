This is a virtual dom using only plain json objects and the [reactive](https://github.com/reactivelib/reactive) package.
There are no additional compilation steps.
For example, let's create a simple form to add 2 numbers:

```html
<!DOCTYPE html>
<html>
<head>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/html@latest/dist/reactivelib.min.js"></script>
</head>
<body>
<div id="myForm"></div>
<script type="text/javascript">

    var reactive = reactivelib.reactive;
    var html = reactivelib.html;

    function createInput(){
        //we create a reactive property object for the input.
        var props = reactive({
            value: 0
        });

        return {
            //We define a new html element with "input" tag name
            tag: "input",
            //Define what properties the html element has
            prop: props,
            //Define what attributes the html element has
            attr: {
                type: "number"
            },
            //Define event handlers for the html element
            event: {
                //We listen to the keyup and mouseup event of the input element and update the reactive property object value
                keyup: (event) => {
                    props.value = event.target.value;
                },
                mouseup: (event) => {
                    props.value = event.target.value;
                }
            }
        }
    }

    var input1 = createInput();
    var input2 = createInput();

    // Create div that prints the sum of the 2 inputs.
    var result = {
        // html element with "div" tag name
        tag: "div",
        //This getter will be called again if the reactive value of input1 or input2 changes,
        //causing a rerendering of this html elements children
        get child(){
            return "Sum is: "+(parseInt(input1.prop.value) + parseInt(input2.prop.value))
        }
    }

    var form = {
        tag: "div",
        //The child elements of this html element
        child: [{tag: "div", child: input1}, {tag: "div", child: input2}, result]
    }

    // attach the form to the "myForm" div
    html.attach(document.getElementById("myForm"), form);

</script>
</body>
</html>
```

When the user changes the input, the result will automatically be updated.

# Installation

```bash
npm install @reactivelib/reactive
```

## commonjs

```javascript
var html = require("@reactivelib/html");
html.attach(document.getElementById("myElement"),{ 
    tag: "div",
    child: "Hello"
})
```

## Browser
We provide a browser ready file "dist/reactivelib.min.js" in the npm package that exposes the global "reactivelib" and includes both this and the 
[reactive](https://github.com/reactivelib/reactive) package.

```html
<head>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@reactivelib/html@latest/dist/reactivelib.min.js"></script>
</head>

<body>

    <script type="text/javascript">
        //reactive package
        var reactive = reactivelib.reactive;
        //this package
        var html = reactivelib.html;        
    </script>
</body>
```


## Typescript

```typescript
import * as html from '@reactivelib/html';
html.attach(document.getElementById("myElement"),{ 
    tag: "div",
    child: "Hello"
})
```

### Typescript with "esModuleInterop"

When using "esModuleInterop" option, you can also import as follows:

```typescript
import html from '@reactivelib/html';
html.attach(document.getElementById("myElement"),{ 
    tag: "div",
    child: "Hello"
})
```

or

```typescript
import {attach} from '@reactivelib/html';
attach(document.getElementById("myElement"),{ 
    tag: "div",
    child: "Hello"
})
```

# Creating html elements
Html elements can be created with a json object that contains following properties:

|property|description|
|--------|-----------|
|tag|defines the html tag name of the html element to create|
|prop|defines the properties of the html element. This sets the properties of the javascript object that you get when using document.getElementById|
|attr|defines the attributes of the html element|
|style|defines the style attribute of the html element|
|event|defines the event handlers of the html element|
|child|defines the children of the html element. Can be a string, a virtual dom element or an array containing string or virtual dom elements|

For example, following json object: 

```javascript
var el = {
    tag: "div",
    child: "Hello",
    attr: {
        id: "panel"
    },
    style: {
        background: "black"
    }
}
```
would render following html element:
```html
<div id="panel" style="background: black">Hello</div>
```

## Attaching to the DOM
In order to render the virtual dom elements, you need to attach them to the dom. You can accomplish that with the "attach" method
as follows:

Assume we have following html element somewhere in the page

```html
<div id="element"></div>
```

```javascript
var el = {
    tag: "div",
    child: ["Input number: ",{
        tag: "input",
        attr :{
            type: "number"
        },
        prop: {
            value: 5
        }
    }]
}
reactivelib.html.attach(document.getElementById("element"), "el")
```

The attach renders and appends the rendered html element to the element given to the attach method. This is how
the html element looks like after attaching:

```html
<div id="element">
Input number: <input type="number" />
</div>
```

Note that defining

```javascript
prop: {value: 5}
```

we also set the value of the input element to 5. 


## Reactive properties
You can use the [reactive](https://github.com/reactivelib/reactive) package to create virtual dom elements that are reactive.
Any property you create and make reactive will be automatically kept in sync with the rendered html element. For example:

```javascript
var el = reactivelib.reactive({
    tag: "div",
    child: "Hello"    
})
```

This renders following html element

```html
<div>Hello</div>
```

We can now change the content of the div element like follows:

```javascript
el.child = "New content"
```

The content of the html element will be automatically refreshed:

```html
<div>New content</div>
```

For a more complex example, take a look at the example at the top of this readme file.

## Lifecycle

When you attach a virtual dom element to the dom, the "onAttached" method will be called if available:

```javascript
var el = {
 tag: "div",
 child: "Hello",
 onAttached: function(){
     console.log("on attached called")
 }
};

reactivelib.html.attach(document.getElementById("element"), el);

//at some later point, console will print "on attached called"

```

There is also a "onDetached" method when you remove the virtual dom element from the dom:

```javascript
var el = {
  tag: "div",
  child: "Hello",
  onAttached: function(){
      console.log("on attached called")
  },
  onDetached: function(){
    console.log("on detached called")
  }
};

reactivelib.html.attach(document.getElementById("element"), el);

//at some later point, console will print "on attached called"

//Some time later
reactivelib.html.detach(el);

//at some later point, console will print "on detached called"

```

Note that rendering happens asynchronously inside an animation frame.
Therefore, the lifecycle methods are called at some point in the future after attaching or detaching.

## The node object
The node object gives you access to the html element and parent and is available after the virtual dom element has
been attached:
```javascript
var el = {
    tag: "div",
    child: {
     tag: "div",
     child: "Hello",
     onAttached: function(){
         var node = el.node;
         console.log("html element: "+node.element)
         console.log("parent virtual dom object: "+node.parentModel);
     },
     onDetached: function(){
         
     }
   }
};

```



# Projects using this module

[ReactiveChart](https://reactivechart.com)
