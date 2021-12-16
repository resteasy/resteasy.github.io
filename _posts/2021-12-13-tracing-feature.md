---
layout:     post
title:      "Using RESTEasy Tracing Feature With Feature Pack In WildFly"
subtitle:   ""
date:       2021-12-13
author:     Wei Nan Li
---

The RESTEasy Tracing Feature provides a way for the users to understand what's going on internally in the container when a request is processed. Here are relative blogs relative to the feature:

- [A brief introduction to the RESTEasy Tracing Feature](https://resteasy.dev/2018/06/11/a-brief-introduction-to-the-resteasy-tracing-feature/)
- [RESTEasy Tracing Feature Now Supports JSON formatted information](https://resteasy.dev/2018/09/05/resteasy-tracing-feature-now-supports-json-formatted-information/)

And here is the document section introducing the feature:

- [Chapter 54. RESTEasy Tracing Feature](https://docs.jboss.org/resteasy/docs/5.0.1.Final/userguide/html_single/index.html#Tracing_Feature)

This feature has been divided into two parts. One part is located inside the main repository:

- [https://github.com/resteasy/resteasy/tree/main/resteasy-core/src/main/java/org/jboss/resteasy/tracing](https://github.com/resteasy/resteasy/tree/main/resteasy-core/src/main/java/org/jboss/resteasy/tracing)

It contains core parts of the feature. Because this part is located in `resteasy-core`, so it’s included in the new feature-pack descriptor:

- [https://github.com/resteasy/resteasy/blob/main/galleon-feature-pack/src/main/resources/modules/system/layers/base/org/jboss/resteasy/resteasy-tracing-api/main/module.xml](https://github.com/resteasy/resteasy/blob/main/galleon-feature-pack/src/main/resources/modules/system/layers/base/org/jboss/resteasy/resteasy-tracing-api/main/module.xml)

So this part can be installed with Galleon command line tool. Here is the blog that describes the usage of RESTEasy Feature Pack and Galleon tool:

- [Using The RESTEasy Galleon Feature Pack In WildFly](https://resteasy.dev/2021/11/22/feature-pack/)

On the other side, the implementation part of the feature are mainly located in `resteasy-extension` sub-project:

- [https://github.com/resteasy/resteasy-extensions/tree/main/tracing](https://github.com/resteasy/resteasy-extensions/tree/main/tracing)

So if you want to use the tracing feature in your project and deploy into WildFly, then you need to include the above module into your project dependency scope:

```xml
<dependency>
   <groupId>org.jboss.resteasy</groupId>
   <artifactId>resteasy-tracing-api</artifactId>
</dependency>
```

There is tracing sample project in the `resteasy-examples` repository:

- [https://github.com/resteasy/resteasy-examples/tree/main/tracing-example](https://github.com/resteasy/resteasy-examples/tree/main/tracing-example)

And it can be packaged and deployed into WildFly. To package the above example, just clone the code into your local environment and then run the Maven command to package it:

```bash
$ mvn package
```

And then we can get the WAR file:

<img width="550" src="https://raw.githubusercontent.com/liweinan/blogpic2021i/master/dec12/145725469-77f06e4a-34a3-4319-8a51-2e3a95d1d28d.png" />

Because I cloned the `resteasy-examples` repository and used the `main` branch for packaging, so the version number is `4.2.1.Final-SNAPSHOT`, which is the main branch SNAPSHOT version when I’m writing this blog.

After we get the WAR file, then we can use it to deploy into WildFly server. But before taking the action, please make sure you have followed this blog post to install the RESTEasy Feature Pack properly:

- [Using The RESTEasy Galleon Feature Pack In WildFly](https://resteasy.dev/2021/11/22/feature-pack/)

And then we can start the provisioned version of WildFly:

<img width="550" src="https://raw.githubusercontent.com/liweinan/blogpic2021i/master/dec12/145725470-b66d2bd6-9cd3-4337-93d1-5db1c3d5b550.png" />

And then using the `jboss-cli` tool to do the sample project WAR file deployment:

```bash
➤ ./jboss-cli.sh                                                                                                                       connect localhostYou are disconnected at the moment. Type 'connect' to connect to the server or 'help' for the list of supported commands.
[disconnected /] connect localhost
[standalone@localhost:9990 /] deploy /Users/weli/work/resteasy-examples/tracing-example/target/tracing-example-5.0.0-SNAPSHOT.war
[standalone@localhost:9990 /]
```

And if everything goes fine, we can see the relative server output:

<img width="550" src="https://raw.githubusercontent.com/liweinan/blogpic2021i/master/dec12/145725473-e8235ce3-7e69-4fd6-8444-1c653f872672.png" />

And then we can try to access the sample project service:

```bash
➤ http localhost:8080/tracing-example-5.0.0-SNAPSHOT/type
```

I’m using the `httpie` tool above instead of `curl` command because it supports color output, and here is the output of the command:

<img width="550" src="https://raw.githubusercontent.com/liweinan/blogpic2021i/master/dec12/145725476-6fae79c8-3408-4460-89c0-35c42cec1bfd.png" />

As the above screenshot shows, the tracing information is output correctly. And from server side we can also see the relative server output:

<img width="550" src="https://raw.githubusercontent.com/liweinan/blogpic2021i/master/dec12/145725481-74997b6c-17c5-465b-ac3f-b6bc3b2d8db2.png" />

Until now we have make the Tracing Feature working with the provisioned WildFly which has RESTEasy Feature Pack installed.

