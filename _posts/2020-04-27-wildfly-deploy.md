---
layout:     post
title:      "Deploy resteasy-spring-boot project into WildFly Java EE Full & Web Distribution"
subtitle:   ""
date:       Apr 27, 2020
author:     Wei Nan Li
---

Recently I have made an example project that showing how to deploy the resteasy-spring-boot based project into WildFly Java EE Full & Web Distribution, and here is the source code of the example:

* [resteasy-spring-boot/sample-app-for-wildfly at master · resteasy/resteasy-spring-boot · GitHub](https://github.com/resteasy/resteasy-spring-boot/tree/master/sample-app-for-wildfly)

There are several points need to be noted, and let me explain these points one by one. 

Firstly, we need to set the project packaging type as `war` in the `pom.xml` file of the project:

```xml
<packaging>war</packaging>
```

So it can be packaged as WAR file and then deployed to WildFly server.

Secondly, because we are deploying the project into WildFly, so we need to exclude the Tomcat server embedded in spring-boot itself. To do this, we need to exclude the module in the `pom.xml` of the sample project:

```xml
<!--        we need to remove tomcat from WAR becasue this project will be deployed to Wildfly-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
``` 

Like the snippet shown above, we have marked the scope of `spring-boot-starter-tomcat` dependency as `provided`, thus the package won't be included into the final war file.

The third point is to add a file named `jboss-deployment-structure.xml` into the `WEB-INF` directory of the project. Here is the content of the file:

```xml
<jboss-deployment-structure>
    <deployment>
        <exclude-subsystems>
            <subsystem name="jaxrs"/>
        </exclude-subsystems>
    </deployment>
</jboss-deployment-structure>
```

With the setup above, we have disabled the `jaxrs` subsystem of the WildFly to work for our project. Because our project contains `resteasy-spring-boot` and all its dependencies by itself in the war file.

The last point is to configure the `maven-war-plugin` properly in the `pom.xml`, and here is the configuration:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-war-plugin</artifactId>
    <configuration>
        <failOnMissingWebXml>false</failOnMissingWebXml>
    </configuration>
</plugin>
```

Because we don't have a `web.xml` in our project, so we need above configuration for the `maven-war-plugin` to work properly.

Above are all the points to note. Then we can package the sample project in the project directory:

```bash
$ pwd
works/resteasy-spring-boot/sample-app-for-wildfly
```

In above directory, run the following command to do the packaging:

```bash
$ mvn package
...
[INFO] BUILD SUCCESS
...
```

After the above packaging process, we get the war file like this:

```bash
$ ls target/sample-app.war
target/sample-app.war
...
```

As the command shown above, we get the `sample.war` file. Then we can deploy the war file into a running WildFly server:

```bash
$ pwd
works/wildfly-19.0.0.Final/bin
```

```bash
$ ./standalone.sh
...
14:06:32,847 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0025: WildFly Full 19.0.0.Final (WildFly Core 11.0.0.Final) started in 7600ms - Started 911 of 1139 services (384 services are lazy, passive or on-demand)
```

From above process we can see that we started a WildFly server, and then we can connect to the server and do the deployment:

```bash
$ ./jboss-cli.sh
connect lYou are disconnected at the moment. Type 'connect' to connect to the server or 'help' for the list of supported commands.
[disconnected /] connect localhost
[standalone@localhost:9990 /] deploy works/resteasy-spring-boot/sample-app-for-wildfly/target/sample-app.war --force
[standalone@localhost:9990 /]
``` 

With above command we did a deployment, and from the WildFly server side output we can see the project is deployed:

```bash
14:08:14,211 INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 114) WFLYUT0021: Registered web context: '/sample-app' for server 'default-server'
```

From the above server output we can see the project is deployed to the WildFly server. Then we can try to access the service by using the `curl` command:

```bash
$ curl localhost:8080/sample-app/rest/hello
Hello, world!
```

From the above output, we can see the service is working.



