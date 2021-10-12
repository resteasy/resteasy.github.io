---
layout:     post
title:      "Deploying `resteasy-spring` based Project Into WildFly Full Distribution"
subtitle:   ""
date:       October 08th, 2021
author:     Wei Nan Li
---

I have written two blogs about deploying `resteasy-spring` projects into WildFly in before:

- ({% post_url 2020-04-10-spring %})
- ({% post_url 2020-04-27-wildfly-deploy %})

Nevertheless, none of them describing how to deploy `resteasy-spring` based project into WildFly Full Distribution. In this article I’d like to briefly describing how to do this.

Let’s use the `resteasy-spring-basic` project as example in `resteasy-examples`:

- [resteasy-examples/resteasy-spring-basic at main · resteasy/resteasy-examples · GitHub](https://github.com/resteasy/resteasy-examples/tree/main/resteasy-spring-basic)

This project provides a basic `resteasy-spring` usage, and it’s README file provides its usage running with embedded Jetty server.

To make this example run in WildFly Full Distribution environment, we first need to change `resteasy-spring` scope in its dependency. To do this, open the `pom.xml` file can check this dependency section:

```xml
<dependency>
    <groupId>org.jboss.resteasy.spring</groupId>
    <artifactId>resteasy-spring</artifactId>
</dependency>
```

The above dependency needs to be changed to `provided` scope like this:

```xml
<dependency>
    <groupId>org.jboss.resteasy.spring</groupId>
    <artifactId>resteasy-spring</artifactId>
    <scope>provided</scope>
</dependency>
```

Because in WildFly Full Distribution, it already provides the `resteasy-spring` module by default, so we don’t have to bundle the above dependency into the project WAR file. Now we can package this project by Maven command:

```bash
$ mvn package
```

After the above command finished running, we get the project WAR file:

```bash
$ ls target/*.war
target/resteasy-spring-example-basic.war
```

We will deploy the above WAR file into WildFly Full Distribution later. Now we can download the newest version of WildFly Full Distribution directly from its Github repository:

- https://github.com/wildfly/wildfly/releases

When I write this blog, the newest version is `25.0.0.Final`:

- https://github.com/wildfly/wildfly/releases/tag/25.0.0.Final

We can scroll down to the bottom of the above release page, and there are zip file list like this:

```
wildfly-25.0.0.Final-src.tar.gz 24.5 MB
wildfly-25.0.0.Final-src.tar.gz.sha1 41 Bytes
wildfly-25.0.0.Final-src.zip 39.2 MB
wildfly-25.0.0.Final-src.zip.sha1 41 Bytes
wildfly-25.0.0.Final.tar.gz 210 MB
wildfly-25.0.0.Final.tar.gz.sha1 41 Bytes
wildfly-25.0.0.Final.zip 211 MB
wildfly-25.0.0.Final.zip.sha1 41 Bytes
wildfly-preview-25.0.0.Final.tar.gz 214 MB
wildfly-preview-25.0.0.Final.tar.gz.sha1 41 Bytes
wildfly-preview-25.0.0.Final.zip 215 MB
wildfly-preview-25.0.0.Final.zip.sha1 41 Bytes
wildfly-servlet-25.0.0.Final.tar.gz 52.3 MB
wildfly-servlet-25.0.0.Final.tar.gz.sha1 41 Bytes
wildfly-servlet-25.0.0.Final.zip 52.6 MB
wildfly-servlet-25.0.0.Final.zip.sha1 41 Bytes
Source code (zip)
Source code (tar.gz)
```

As the above list shown, there are several kinds of WildFly distributions. For example, the `wildfly-servlet` is the servlet-only distribution. What we need this is the full distribution, so we can download the file `wildfly-25.0.0.Final.zip`. After downloading the zip file, extract it and we get the distribution:

```bash
$ unzip wildfly-25.0.0.Final.zip
...
```

```bash
$ $ ls wildfly-25.0.0.Final
LICENSE.txt       README.txt        appclient         bin               copyright.txt     docs              domain            jboss-modules.jar modules           standalone        welcome-content
```

This distribution contains a complete set of modules. We can do a `find` in the `modules` directory to see the RESTEasy Spring modules:

```bash
$ find modules | grep spring
modules/system/layers/base/org/jboss/resteasy/resteasy-spring
modules/system/layers/base/org/jboss/resteasy/resteasy-spring/main
modules/system/layers/base/org/jboss/resteasy/resteasy-spring/main/bundled
modules/system/layers/base/org/jboss/resteasy/resteasy-spring/main/bundled/resteasy-spring-jar
modules/system/layers/base/org/jboss/resteasy/resteasy-spring/main/bundled/resteasy-spring-jar/resteasy-spring-4.7.2.Final.jar
modules/system/layers/base/org/jboss/resteasy/resteasy-spring/main/module.xml
```

As the above command show the Full Distribution contains the `resteasy-spring` module already, that is why we need to mark the dependency of `resteasy-spring` in the sample project as `provided` scoped. Because we can use the above module in WildFly Full Distribution already. Now we can start the WildFly server in standalone mode for demonstration:

```bash
$ bin/standalone.sh
```

After server started, enter the server command line interface:

```bash
$ ./jboss-cli.sh
You are disconnected at the moment. Type 'connect' to connect to the server or 'help' for the list of supported commands.
[disconnected /] connect localhost
[standalone@localhost:9990 /]
```

And then we deploy our project:

```bash
[standalone@localhost:9990 /] deploy /my/resteasy-examples/resteasy-spring-basic/target/resteasy-spring-example-basic.war
```

And from server output we can see the sample project is deployed:

```
03:17:18,074 INFO  [org.jboss.as.server.deployment] (MSC service thread 1-8) WFLYSRV0027: Starting deployment of "resteasy-spring-example-basic.war" (runtime-name: "resteasy-spring-example-basic.war")
...
```

After the project is deployed, we can try to access its service with `curl` command:

```bash
$ curl localhost:8080/resteasy-spring-example-basic/rest/foo 
bar
```

As the result shown above, we can access the service provided by sample project now.

Nevertheless, instead of downloading WildFly server described above, the `resteasy-example` provides `wildfly-plugin` to allow you start WildFly server with Maven command and deploy the example automatically to start the service. Here is the command to do so:

```bash
$ mvn wildfly:run
```

And a WildFly server will be downloaded and run, and the example project will be automatically deployed, which is convenient for testing.

Above is a brief introduction on how to deploy `resteasy-spring` based project into WildFly Full Distribution. Nevertheless, there are several things need to be noted:

Firstly, the `resteasy-spring` project is moved out of the `resteasy` main project, and here is its repository:

- [RESTEasy Spring Modules](https://github.com/resteasy/resteasy-spring)

And here is the blog that describes the details of the changes:

- [Separating RESTEasy Spring And Microprofile Components Into Independent Subprojects](https://resteasy.github.io/2021/07/29/separate-spring-and-microprofile/)

Secondly, the `resteasy-example` project has upgraded its dependency of RESTEasy into `5.0.0.Beta1`, and here is the commit about the upgrade:

- [Upgrade to RESTEasy 5 (#71) · resteasy/resteasy-examples@b01a555 · GitHub](https://github.com/resteasy/resteasy-examples/commit/b01a5558d6629d5539e26b0cf3a2dce1061ef4d1)

Not all the modules are finished upgrading, so it’s just the first step on this major version upgrade. I plan to release a `5.0.0.Alpha1` release soon.

Thirdly, the WildFly side has adopted RESTEasy 4.7, and here is the blog describing the details of the changes:

- [RESTEasy Announcements and Plans](https://resteasy.github.io/2021/09/23/announcements-and-releases/)

At last, because `resteasy-spring` becomes a separate project now, so we decide to do the migration to use Galleon Feature Pack to replace the current `jboss-modules` inside WildFly distribution. On `resteasy-spring` side, this work is still in progress, and here is the commit about it:

- [Add Galleon Pack by liweinan · Pull Request #9 · resteasy/resteasy-spring · GitHub](https://github.com/resteasy/resteasy-spring/pull/9)

After the above commit is done, I’ll do a `2.0.0.Beta1` release of the `resteasy-spring` project.

That all about the topics I’d like to share with you in this blog.
