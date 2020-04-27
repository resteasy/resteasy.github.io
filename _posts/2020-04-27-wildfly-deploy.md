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

So it can be packaged as WAR file and then deployed to WildFly server. Secondly, because we are deploying the project into WildFly, so we need to exclude the Tomcat server embedded in spring-boot itself. To do this, we need to exclude the module in the `pom.xml` of the sample project:

```xml
<!--        we need to remove tomcat from WAR becasue this project will be deployed to Wildfly-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>
``` 

Like the snippet shown above, we have marked the `spring-boot-starter-tomcat` 
