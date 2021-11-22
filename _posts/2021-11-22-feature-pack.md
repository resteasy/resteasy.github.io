---
layout:     post
title:      "Using The RESTEasy Galleon Feature Pack In WildFly"
subtitle:   ""
date:       Nov 22, 2021
author:     Wei Nan Li
---

For WildFly/JBoss EAP integration, RESTEasy has migrated from using `jboss-modules` to the new Galleon Feature Pack scheme. Here are the relative modules:

- [resteasy/galleon-feature-pack at main · resteasy/resteasy · GitHub](https://github.com/resteasy/resteasy/tree/main/galleon-feature-pack)
- [resteasy-spring/galleon-feature-pack at main · resteasy/resteasy-spring · GitHub](https://github.com/resteasy/resteasy-spring/tree/main/galleon-feature-pack)

To use the above feature packs, you need to install the Galleon CLI tool firstly:

- [GitHub - wildfly/galleon](https://github.com/wildfly/galleon)

You can directly download the release ZIP file provided by the Galleon project:

- https://github.com/wildfly/galleon/releases

After unzipping the ZIP file, we can get the `galleon.sh` command tool and related JAR files. And after setting up the PATH properly, we can invoke the command line tool from terminal:

```bash
➤ galleon.sh
```

With the tool, we can firstly install a WildFly Full Distribution into the local environment, and here is the command to do so:

```bash
➤ galleon.sh install wildfly:current --dir=~/my-wildfly
```

And it will start to download a provisioned copy of WildFly Full Distribution and create a `my-wildfly` directory in my home directory and install the distribution into it. The installation process will cost some time because it needs to download WildFly components and the size of the download content is big. Here is the installation process:

```bash
➤ galleon.sh install wildfly:current --dir=~/my-wildfly
Feature pack installed.d.
======= ============ ==============
Product Build        Update Channel
======= ============ ==============
wildfly 25.0.1.Final current
```

As the above output we can see that the current version of WildFly when I’m writing this blog is `25.0.1.Final`. After the WildFly distribution is downloaded, we can install the new `resteasy` and `resteasy-spring` feature pack into the distribution. Here is the command to do so:

```bash
➤ galleon.sh install org.jboss.resteasy:galleon-feature-pack:5.0.0.Final --dir=~/my-wildfly
```

When I’m writing this blog, the newest version of RESTEasy is `5.0.0.Final`, so I install the above version of the feature pack. Here is the running process of the above command:

```bash
➤ galleon.sh install org.jboss.resteasy:galleon-feature-pack:5.0.0.Final --dir=~/my-wildfly
Feature pack installed.d.
```

So the `resteasy` module inside WildFly is now replaced with the `5.0.0.Final` feature pack. And now we can install the `resteasy-spring` feature pack. Here is the command to do so:

```bash
➤ galleon.sh install org.jboss.resteasy.spring:galleon-feature-pack:2.0.0.Final --dir=~/my-wildfly
```

Same as previous commands, it will install the module into WildFly, and here is the output of the command:

```bash
➤ galleon.sh install org.jboss.resteasy.spring:galleon-feature-pack:2.0.0.Final --dir=~/my-wildfly
Feature pack installed.d.
```

Until now we have prepared the WildFly with updated `resteasy` and `resteasy-spring` feature pack. Now we can start the WildFly server with standalone mode. Here is the command to do so:

```bash
➤ pwd
/Users/weli/my-wildfly/bin
weli@ovpn-12-46:~/m/bin
➤ ./standalone.sh
```

If everything goes fine, it will start the WildFly server in standalone mode, and here is the server output:

```txt
...
18:58:15,081 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0025: WildFly Full 25.0.1.Final (WildFly Core 17.0.3.Final) started in 3351ms - Started 298 of 538 services (337 services are lazy, passive or on-demand)
18:58:15,084 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0060: Http management interface listening on http://127.0.0.1:9990/management
18:58:15,085 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0051: Admin console listening on http://127.0.0.1:9990
```

After server is started, we can deploy a `resteasy-spring` based sample project into our provisioned WildFly server, to see if our installed feature packs are working. We can use the example provided by the `resteasy-examples` project:

- [RESTEasy examples](https://github.com/resteasy/resteasy-examples)

You can clone the repository and build the `resteasy-spring-basic` example inside the project:

- [resteasy-spring-basic](https://github.com/resteasy/resteasy-examples/tree/main/resteasy-spring-basic)

I cloned the above project into my local machine and build it with the Maven command:

```bash
➤ pwd
/Users/weli/works/resteasy-examples/resteasy-spring-basic
weli@ovpn-12-46:~/w/r/resteasy-spring-basic|main⚡?
➤ mvn install
[INFO] Scanning for projects...
```

After the example is built, we can have the WAR file to deploy to the WildFly:

```bash
➤ ls target/*.war
target/resteasy-spring-example-basic.war
```

Now in WildFly, we can use the `jboss-cli.sh` tool to do the sample project deployment, and here is the process:

```bash
➤ pwd
/Users/weli/my-wildfly/bin
➤ ./jboss-cli.sh
You are disconnected at the moment. Type 'connect' to connect to the server or 'help' for the list of supported commands.
[disconnected /] connect localhost
[standalone@localhost:9990 /] deploy /Users/weli/works/resteasy-examples/resteasy-spring-basic/target/resteasy-spring-example-basic.war
[standalone@localhost:9990 /]
```

From the above command output you can see that I have deployed the `resteasy-spring-example-basic.war`, and from server log output you should see the project is successfully deployed to the server:

```bash
19:05:36,436 INFO  [org.jboss.as.server] (management-handler-thread - 1) WFLYSRV0010: Deployed "resteasy-spring-example-basic.war" (runtime-name : "resteasy-spring-example-basic.war")
```

And now we can try to access the service API provided deployed project:

```bash
➤ curl http://localhost:8080/resteasy-spring-example-basic/rest/foo/hello
Hello, world!
```

From the above command output, we can see the service can be accessed by the `curl` command, and the sample service works, and it verifies that our installed galleon feature pack works properly.

Above is a brief introduction to the new feature pack feature provided by RESTEasy, wish it’s useful to you :D
 
