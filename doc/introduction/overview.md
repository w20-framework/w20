W20 is a Web solution designed to allow the developer to quickly and simply create enterprise-grade **Single Page
Application** (SPA). It is **server agnostic** which means it can work with any HTTP capable server technology. In fact,
it can even work without any server.

# Modular architecture

W20 provides a **modular programming model for Web applications**, which allow entire parts of Web frontend to be reused
between applications. These reusable parts are called fragments and can be published on any HTTP server as static resources.
Creating an application frontend becomes as easy as referencing the fragment URLs from a configuration file and  
provide some parameters. W20 itself is distributed as several fragments which are all optional, aside from W20 Core.  

# Full-featured

While this modularity is at the heart of W20, it doesn't stop there. A carefully chosen set of open-source frameworks
are integrated with each other and augmented with features you'll need in enterprise software like:

* Internationalization,
* Security, 
* Sophisticated navigation, 
* UI components,
* Graphical theming,
* ...

# Anatomy of a W20 application

A W20 application is a Single Page Application (SPA) composed of:

* A master page (often named `index.html`, but it can be dynamically generated). It is the entry point of the application. 
More information [here](#!/w20-doc/introduction/masterpage).
* One or more fragment(s). A fragment is a bundle of Web resources described by a JSON manifest which must be accessible 
by HTTP from the browser. More information [here](#!/w20-doc/introduction/fragments).
* A configuration (often found in a file named `w20.app.json`, but it can also be dynamically generated). More information
[here](#!/w20-doc/introduction/configuration).

```
    (docroot)
        |-index.html
        |-w20.app.json
        |-fragments
            |-fragment1
                |-fragment1.w20.json
                ...
            |-fragment2
                |-fragment2.w20.json
                ...
            ...
```